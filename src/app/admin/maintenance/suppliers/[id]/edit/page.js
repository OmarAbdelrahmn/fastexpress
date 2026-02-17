'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Package, Save, ArrowLeft } from 'lucide-react';

export default function EditSupplierPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        taxNumber: ''
    });

    useEffect(() => {
        if (params.id) {
            loadSupplier();
        }
    }, [params.id]);

    const loadSupplier = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await ApiService.get(API_ENDPOINTS.SUPPLIER.BY_ID(params.id));
            setFormData({
                name: data.name || '',
                contactPerson: data.contactPerson || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                taxNumber: data.taxNumber || ''
            });
        } catch (err) {
            console.error('Error loading supplier:', err);
            setError(err?.message || 'حدث خطأ في تحميل بيانات المورد');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (!formData.name) {
            setError('اسم المورد مطلوب');
            setSaving(false);
            return;
        }

        try {
            await ApiService.put(API_ENDPOINTS.SUPPLIER.UPDATE(params.id), formData);
            setSuccess('تم تحديث المورد بنجاح');
            setTimeout(() => {
                router.push(`/admin/maintenance/suppliers/${params.id}`);
            }, 1000);
        } catch (err) {
            console.error('Error updating supplier:', err);
            setError(err?.message || 'حدث خطأ في تحديث المورد');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="تعديل مورد"
                subtitle="تحديث بيانات المورد"
                icon={Package}
                actionButton={{
                    text: 'العودة للتفاصيل',
                    icon: <ArrowLeft size={18} />,
                    onClick: () => router.push(`/admin/maintenance/suppliers/${params.id}`),
                    variant: 'secondary'
                }}
            />

            {error && (
                <Alert
                    type="error"
                    title="خطأ"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            {success && (
                <Alert
                    type="success"
                    title="نجح"
                    message={success}
                    onClose={() => setSuccess('')}
                />
            )}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم المورد <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ادخل اسم المورد"
                                required
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الشخص المسؤول
                            </label>
                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ادخل اسم الشخص المسؤول"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الهاتف
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ادخل رقم الهاتف"
                                dir="ltr"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="example@domain.com"
                                dir="ltr"
                            />
                        </div>

                        {/* Tax Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الرقم الضريبي
                            </label>
                            <input
                                type="text"
                                name="taxNumber"
                                value={formData.taxNumber}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ادخل الرقم الضريبي"
                            />
                        </div>

                        {/* Address */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                العنوان
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ادخل العنوان التفصيلي"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            onClick={() => router.push(`/admin/maintenance/suppliers/${params.id}`)}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                            disabled={saving}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                            disabled={saving}
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    جاري الحفظ...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save size={18} />
                                    حفظ التعديلات
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
