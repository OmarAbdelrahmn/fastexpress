import React, { useState } from 'react';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';

export default function IssueForm({ onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        riderId: '',
        quantityIssued: 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="رقم السائق"
                name="riderId"
                value={formData.riderId}
                onChange={handleChange}
                required
                placeholder="مثال: 12345"
            />

            <Input
                label="الكمية المصدرة"
                name="quantityIssued"
                type="number"
                min="1"
                value={formData.quantityIssued}
                onChange={handleChange}
                required
                placeholder="1"
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
                    {isLoading ? 'جاري الحفظ...' : 'تسجيل الإصدار'}
                </Button>
            </div>
        </form>
    );
}
