import React, { useState, useEffect } from 'react';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';
import { Plus, Trash2 } from 'lucide-react';

export default function ReturnForm({ initialData, onSubmit, onCancel, isLoading, suppliers }) {
    const user = TokenManager.getUserFromToken();

    const [formData, setFormData] = useState({
        supplierId: '',
        returnNumber: '',
        reason: '',
        processedBy: user?.unique_name || '',
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

        // Auto-fill unit price based on current price when item is selected
        if (field === 'itemId' && value) {
            const itemType = newItems[index].itemType;
            const items = itemType === 1 ? spareParts : riderAccessories;
            const selectedItem = items.find(item => String(item.id) === String(value));
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
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedData = {
            supplierId: parseInt(formData.supplierId),
            returnNumber: formData.returnNumber,
            reason: formData.reason,
            processedBy: formData.processedBy,
            notes: formData.notes,
            items: formData.items.map(item => ({
                itemId: item.itemId,
                itemName: (item.itemType === 1 ? spareParts : riderAccessories).find(i => String(i.id) === String(item.itemId))?.name || '',
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        المورد <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="supplierId"
                        value={formData.supplierId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">اختر المورد</option>
                        {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="رقم المرتجع"
                    name="returnNumber"
                    value={formData.returnNumber}
                    onChange={handleChange}
                    required
                    placeholder="مثال: RET-001"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="السبب"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    placeholder="سبب الإرجاع..."
                />
                <Input
                    label="بواسطة"
                    name="processedBy"
                    value={formData.processedBy}
                    readOnly
                    className="bg-gray-100"
                />
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">الأصناف المرتجعة</h4>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                الصنف
                            </label>
                            <select
                                value={item.itemId}
                                onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">اختر الصنف</option>
                                {(item.itemType === 1 ? spareParts : riderAccessories).map(spareItem => (
                                    <option key={spareItem.id} value={spareItem.id}>
                                        {spareItem.name}
                                    </option>
                                ))}
                            </select>
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
                        <span className="font-semibold text-gray-900">المبلغ الإجمالي للمرتجع:</span>
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
                    {isLoading ? 'جاري الحفظ...' : (initialData ? 'تحديث' : 'تأكيد المرتجع')}
                </Button>
            </div>
        </form>
    );
}
