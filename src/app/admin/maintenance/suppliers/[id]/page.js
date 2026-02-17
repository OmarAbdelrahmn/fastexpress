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
import { Package, ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Building, User, Calendar, FileText, DollarSign, CheckCircle, XCircle, Power } from 'lucide-react';

export default function SupplierDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            setSupplier(data);
        } catch (err) {
            console.error('Error loading supplier:', err);
            setError(err?.message || 'حدث خطأ في تحميل بيانات المورد');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        const action = supplier.isActive ? 'تعطيل' : 'تفعيل';
        if (!confirm(`هل أنت متأكد من ${action} هذا المورد؟`)) return;

        try {
            await ApiService.patch(API_ENDPOINTS.SUPPLIER.TOGGLE_ACTIVE(params.id));
            loadSupplier(); // Reload to get updated status
        } catch (err) {
            console.error('Error toggling supplier status:', err);
            setError(err?.message || `حدث خطأ في ${action} المورد`);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;

        try {
            await ApiService.delete(API_ENDPOINTS.SUPPLIER.DELETE(params.id));
            router.push('/admin/maintenance/suppliers');
        } catch (err) {
            console.error('Error deleting supplier:', err);
            setError(err?.message || 'حدث خطأ في حذف المورد');
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

    if (error || !supplier) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="تفاصيل المورد"
                    subtitle="عرض معلومات المورد"
                    icon={Package}
                    actionButton={{
                        text: 'العودة للقائمة',
                        icon: <ArrowLeft size={18} />,
                        onClick: () => router.push('/admin/maintenance/suppliers'),
                        variant: 'secondary'
                    }}
                />
                <Alert
                    type="error"
                    title="خطأ"
                    message={error || 'المورد غير موجود'}
                    onClose={() => router.push('/admin/maintenance/suppliers')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={supplier.name}
                subtitle={`معلومات تفصيلية عن المورد`}
                icon={Package}
                actionButton={{
                    text: 'العودة للقائمة',
                    icon: <ArrowLeft size={18} />,
                    onClick: () => router.push('/admin/maintenance/suppliers'),
                    variant: 'secondary'
                }}
            />

            {/* Status Badge */}
            <div className="flex items-center gap-3 px-4 md:px-6">
                <span className={`px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 ${supplier.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {supplier.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {supplier.isActive ? 'مورد نشط' : 'مورد غير نشط'}
                </span>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">إجمالي الفواتير</p>
                            <p className="text-4xl font-bold">{supplier.totalBills || 0}</p>
                        </div>
                        <div className="bg-opacity-20 p-3 rounded-lg">
                            <FileText size={32} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-100 text-sm">
                        <FileText size={16} />
                        <span>عدد الفواتير المسجلة</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg m-7">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-green-100 text-sm mb-1">إجمالي المشتريات</p>
                            <p className="text-3xl font-bold">
                                {supplier.totalPurchases?.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} ر.س
                            </p>
                        </div>
                        <div className="bg-opacity-20 p-3 rounded-lg">
                            <DollarSign size={32} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-100 text-sm">
                        <Package size={16} />
                        <span>القيمة الإجمالية للمشتريات</span>
                    </div>
                </div>
            </div>

            {/* Supplier Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Building size={24} className="text-blue-600" />
                        معلومات المورد
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">اسم المورد</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Building size={18} className="text-gray-500" />
                                <span className="font-medium text-gray-900">{supplier.name}</span>
                            </div>
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">الشخص المسؤول</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <User size={18} className="text-gray-500" />
                                <span className="text-gray-900">{supplier.contactPerson || '-'}</span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">رقم الهاتف</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Phone size={18} className="text-gray-500" />
                                <span className="text-gray-900" dir="ltr">{supplier.phone || '-'}</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Mail size={18} className="text-gray-500" />
                                <span className="text-gray-900">{supplier.email || '-'}</span>
                            </div>
                        </div>

                        {/* Tax Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">الرقم الضريبي</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Building size={18} className="text-gray-500" />
                                <span className="text-gray-900">{supplier.taxNumber || '-'}</span>
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">تاريخ الإضافة</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={18} className="text-gray-500" />
                                <span className="text-gray-900">
                                    {new Date(supplier.createdAt).toLocaleDateString('ar-SA', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Address - Full Width */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">العنوان</label>
                            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                <MapPin size={18} className="text-gray-500 mt-1" />
                                <span className="text-gray-900">{supplier.address || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <Card>
                <div className="p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">الإجراءات</h2>
                    <div className="flex flex-col md:flex-row flex-wrap gap-3">
                        <Button
                            onClick={() => router.push(`/admin/maintenance/suppliers/${params.id}/edit`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Edit size={18} />
                            <span>تعديل المورد</span>
                        </Button>
                        <Button
                            onClick={handleToggleStatus}
                            className={`${supplier.isActive ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        >
                            <Power size={18} />
                            <span>{supplier.isActive ? 'تعطيل المورد' : 'تفعيل المورد'}</span>
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 size={18} />
                            <span>حذف المورد</span>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
