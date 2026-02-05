import React, { useState, useEffect } from 'react';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '@/components/Ui/SearchableSelect';

export default function BillForm({ initialData, onSubmit, onCancel, isLoading, suppliers }) {
    const [formData, setFormData] = useState({
        supplierId: '',
        invoiceNumber: '',
        invoiceDate: new Date(Date.now() + 3 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16),
        notes: '',
        items: [{ itemId: '', itemType: 1, quantity: 1, unitPrice: 0 }],
        ...initialData
    });

    const [spareParts, setSpareParts] = useState([]);
    const [riderAccessories, setRiderAccessories] = useState([]);

    useEffect(() => {
        loadSpareParts();
        loadRiderAccessories();
    }, []);

    useEffect(() => {
        if (initialData) {
            // Convert UTC date back to local for display
            const localDate = initialData.invoiceDate
                ? new Date(initialData.invoiceDate).toISOString().slice(0, 16)
                : '';

            // Map API items to form structure
            const mappedItems = initialData.items?.map(item => ({
                itemId: item.itemId,
                itemType: item.itemType,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            })) || [{ itemId: '', itemType: 1, quantity: 1, unitPrice: 0 }];

            setFormData(prev => ({
                ...prev,
                supplierId: initialData.supplierId,
                invoiceNumber: initialData.invoiceNumber,
                invoiceDate: localDate,
                notes: initialData.notes || '',
                items: mappedItems
            }));
        }
    }, [initialData]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Auto-fill unit price when item is selected
        if (field === 'itemId' && value) {
            const itemType = newItems[index].itemType;
            const itemsList = itemType === 1 ? spareParts : riderAccessories;
            const selectedItem = itemsList.find(item => String(item.id) === String(value));
            if (selectedItem) {
                newItems[index].unitPrice = selectedItem.price;
            }
        }

        // Reset itemId when itemType changes
        if (field === 'itemType') {
            newItems[index].itemId = '';
            newItems[index].unitPrice = 0;
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemId: '', itemType: 1, quantity: 1, unitPrice: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return; // Keep at least one item
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert local date to UTC
        const localDate = new Date(formData.invoiceDate);
        const utcDate = new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            localDate.getHours() + 3,
            localDate.getMinutes(),
            0
        ));

        const formattedData = {
            supplierId: formData.supplierId,
            invoiceNumber: formData.invoiceNumber,
            invoiceDate: utcDate.toISOString(),
            notes: formData.notes,
            items: formData.items.map(item => ({
                itemId: item.itemId,
                itemType: parseInt(item.itemType),
                quantity: parseInt(item.quantity),
                unitPrice: parseFloat(item.unitPrice)
            }))
        };

        onSubmit(formattedData);
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0));
        }, 0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <SearchableSelect
                        label="المورد"
                        name="supplierId"
                        value={formData.supplierId}
                        onChange={handleChange}
                        options={suppliers}
                        required
                        placeholder="اختر المورد"
                    />
                </div>

                <Input
                    label="رقم الفاتورة"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    required
                    placeholder="مثال: INV-001"
                />
            </div>

            <Input
                label="تاريخ الفاتورة"
                name="invoiceDate"
                type="datetime-local"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
            />

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
                                options={item.itemType === 1 ? spareParts : riderAccessories}
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
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                سعر الوحدة
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2 flex items-end">
                            <div className="w-full">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    المجموع
                                </label>
                                <div className="px-2 py-1.5 text-sm bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">
                                    {(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {formData.items.length > 1 && (
                            <div className="col-span-12 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                >
                                    <Trash2 size={14} />
                                    حذف الصنف
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">المبلغ الإجمالي:</span>
                        <span className="text-xl font-bold text-blue-700">
                            {calculateTotal().toFixed(2)} ر.س
                        </span>
                    </div>
                </div>
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
                    disabled={isLoading}
                >
                    {isLoading ? 'جاري الحفظ...' : (initialData ? 'تحديث' : 'إضافة')}
                </Button>
            </div>
        </form>
    );
}
