import React, { useState, useEffect } from 'react';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { MapPin } from 'lucide-react';

export default function SparePartForm({ initialData, onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        price: '',
        location: '',
        ...initialData
    });
    const [housings, setHousings] = useState([]);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
        loadHousings();
    }, [initialData]);

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

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">الموقع</label>
                <div className="relative">
                    <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
                    <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pr-10 pl-4 py-2 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-700"
                        required
                    >
                        <option value="">اختر الموقع</option>
                        <option value="الشركة">الشركة</option>
                        {housings.map((housing) => (
                            <option key={housing.name} value={housing.name}>
                                {housing.name}
                            </option>
                        ))}
                    </select>
                </div>
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
