
import React, { useState, useEffect } from 'react';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import Alert from '@/components/Ui/Alert';

export default function TransferForm({ initialData, onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        housingId: '',
        transferDate: new Date(Date.now() + 3 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16),
        notes: '',
        items: [{ itemId: '', itemType: 1, quantity: 1 }],
        ...initialData
    });

    const [spareParts, setSpareParts] = useState([]);
    const [riderAccessories, setRiderAccessories] = useState([]);
    const [housings, setHousings] = useState([]);
    const [validationError, setValidationError] = useState(null);

    useEffect(() => {
        loadSpareParts();
        loadRiderAccessories();
        loadHousings();
    }, []);

    useEffect(() => {
        if (initialData) {
            // Convert UTC date back to local for display
            const localDate = initialData.transferDate
                ? new Date(initialData.transferDate).toISOString().slice(0, 16)
                : '';

            // Map API items to form structure
            const mappedItems = initialData.items?.map(item => ({
                itemId: item.itemId,
                itemType: item.itemType,
                quantity: item.quantity
            })) || [{ itemId: '', itemType: 1, quantity: 1 }];

            setFormData(prev => ({
                ...prev,
                housingId: initialData.housingId,
                transferDate: localDate,
                notes: initialData.notes || '',
                items: mappedItems
            }));
        }
    }, [initialData]);

    useEffect(() => {
        validateItems(formData.items);
    }, [formData.items, spareParts, riderAccessories]);

    const validateItems = (items) => {
        let error = null;
        for (const item of items) {
            if (!item.itemId) continue;

            const collection = parseInt(item.itemType) === 1 ? spareParts : riderAccessories;
            const selectedItem = collection.find(i => String(i.id) === String(item.itemId));

            if (selectedItem) {
                const qty = parseInt(item.quantity);
                const available = selectedItem.quantity !== undefined && selectedItem.quantity !== null ? selectedItem.quantity : 0;

                if (isNaN(qty) || qty <= 0) {
                    error = 'الكمية يجب أن تكون أكبر من 0';
                    break;
                }

                if (qty > available) {
                    error = `الكمية المطلوبة (${qty}) تتجاوز الكمية المتوفرة (${available}) للصنف ${selectedItem.name}`;
                    break;
                }
            }
        }
        setValidationError(error);
    };

    const loadSpareParts = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.LIST + "/2");
            setSpareParts(response || []);
        } catch (error) {
            console.error('Error loading spare parts:', error);
        }
    };

    const loadRiderAccessories = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.LIST + "/2");
            setRiderAccessories(response || []);
        } catch (error) {
            console.error('Error loading rider accessories:', error);
        }
    };

    const loadHousings = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.HOUSING.LIST);
            setHousings(response || []);
        } catch (error) {
            console.error('Error loading housings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Reset itemId when itemType changes
        if (field === 'itemType') {
            newItems[index].itemId = '';
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemId: '', itemType: 1, quantity: 1 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return; // Keep at least one item
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validationError) {
            return;
        }

        // Convert local date to UTC
        const localDate = new Date(formData.transferDate);
        const utcDate = new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            localDate.getHours() + 3,
            localDate.getMinutes(),
            0
        ));

        const formattedData = {
            housingId: formData.housingId,
            transferDate: utcDate.toISOString(),
            notes: formData.notes,
            items: formData.items.map(item => ({
                itemId: item.itemId,
                itemType: parseInt(item.itemType),
                quantity: parseInt(item.quantity),
                unitPrice: 0 // Set to 0 as it's not used but might be required by backend DTO
            }))
        };

        onSubmit(formattedData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
                <Alert
                    type="error"
                    message={validationError}
                    onClose={() => setValidationError(null)}
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <SearchableSelect
                        label="السكن"
                        name="housingId"
                        value={formData.housingId}
                        onChange={handleChange}
                        options={housings}
                        required
                        placeholder="اختر السكن"
                    />
                </div>

                <Input
                    label="تاريخ التحويل"
                    name="transferDate"
                    type="datetime-local"
                    value={formData.transferDate}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">الأصناف</h4>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addItem}
                        className="text-sm"
                    >
                        <Plus size={16} className="ml-1" />
                        إضافة صنف
                    </Button>
                </div>

                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                نوع الصنف
                            </label>
                            <select
                                value={item.itemType}
                                onChange={(e) => handleItemChange(index, 'itemType', parseInt(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={1}>قطع غيار</option>
                                <option value={2}>معدات السائقين</option>
                            </select>
                        </div>

                        <div className="col-span-3">
                            <SearchableSelect
                                label="الصنف"
                                value={item.itemId}
                                onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                options={item.itemType === 1 || item.itemType === '1' ? spareParts : riderAccessories}
                                placeholder="اختر الصنف"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                الكمية
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                required
                                className={`w-full px-2 py-1.5 text-sm border ${validationError ? 'border-red-300' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>


                        {formData.items.length > 1 && (
                            <div className="col-span-1 flex justify-end items-end pb-2">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                    title="حذف الصنف"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أضف ملاحظات إضافية..."
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || !!validationError}
                >
                    {isLoading ? 'جاري الحفظ...' : (initialData ? 'تحديث' : 'إنشاء تحويل')}
                </Button>
            </div>
        </form>
    );
}
