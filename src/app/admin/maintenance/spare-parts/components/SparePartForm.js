import React, { useState, useEffect } from 'react';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';

export default function SparePartForm({ initialData, onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        price: '',
        location: '',
        ...initialData
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            quantity: parseInt(formData.quantity) || 0,
            price: parseFloat(formData.price) || 0
        };
        onSubmit(formattedData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="اسم القطعة"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="مثال: فلتر زيت"
            />

            <Input
                label="الكمية"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="0"
            />

            <Input
                label="السعر"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00"
                step="0.01"
            />

            <Input
                label="الموقع"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="مثال: الشركة"
            />

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
