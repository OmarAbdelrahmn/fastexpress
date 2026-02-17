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
import { FileText, ArrowLeft, Package, Building, Calendar, DollarSign, Hash, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function BillDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.id) {
            loadBill();
        }
    }, [params.id]);

    const loadBill = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await ApiService.get(API_ENDPOINTS.BILL.BY_ID(params.id));
            setBill(data);
        } catch (err) {
            console.error('Error loading bill:', err);
            setError(err?.message || 'حدث خطأ في تحميل بيانات الفاتورة');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ar-SA', {
            timeZone: 'Asia/Riyadh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getItemTypeName = (type) => {
        const types = {
            1: 'قطعة غيار',
            2: 'إكسسوار'
        };
        return types[type] || 'غير محدد';
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

    if (error || !bill) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="تفاصيل الفاتورة"
                    subtitle="عرض معلومات الفاتورة"
                    icon={FileText}
                    actionButton={{
                        text: 'العودة للقائمة',
                        icon: <ArrowLeft size={18} />,
                        onClick: () => router.push('/admin/maintenance/bills'),
                        variant: 'secondary'
                    }}
                />
                <Alert
                    type="error"
                    title="خطأ"
                    message={error || 'الفاتورة غير موجودة'}
                    onClose={() => router.push('/admin/maintenance/bills')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`فاتورة رقم: ${bill.invoiceNumber}`}
                subtitle={`معلومات تفصيلية عن الفاتورة`}
                icon={FileText}
                actionButton={{
                    text: 'العودة للقائمة',
                    icon: <ArrowLeft size={18} />,
                    onClick: () => router.push('/admin/maintenance/bills'),
                    variant: 'secondary'
                }}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">عدد الأصناف</p>
                            <p className="text-4xl font-bold">{bill.totalItems || 0}</p>
                        </div>
                        <div className="bg-opacity-20 p-3 rounded-lg">
                            <Package size={32} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                        <Package size={16} />
                        <span>إجمالي الكمية</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-green-100 text-sm mb-1">المبلغ الإجمالي</p>
                            <p className="text-3xl font-bold">
                                {Number(bill.totalAmount).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                            </p>
                        </div>
                        <div className="bg-opacity-20 p-3 rounded-lg">
                            <DollarSign size={32} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-100 text-sm">
                        <DollarSign size={16} />
                        <span>قيمة الفاتورة</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">عدد الأصناف</p>
                            <p className="text-4xl font-bold">{bill.items?.length || 0}</p>
                        </div>
                        <div className="bg-opacity-20 p-3 rounded-lg">
                            <Hash size={32} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-100 text-sm">
                        <FileText size={16} />
                        <span>أنواع الأصناف</span>
                    </div>
                </div>
            </div>

            {/* Invoice Information */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FileText size={24} className="text-blue-600" />
                        معلومات الفاتورة
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Invoice Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">رقم الفاتورة</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Hash size={18} className="text-gray-500" />
                                <span className="font-medium text-gray-900">{bill.invoiceNumber}</span>
                            </div>
                        </div>

                        {/* Supplier */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">المورد</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Building size={18} className="text-gray-500" />
                                <span className="text-gray-900">{bill.supplierName}</span>
                            </div>
                        </div>

                        {/* Invoice Date */}
                        {/* <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">تاريخ الفاتورة</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={18} className="text-gray-500" />
                                <span className="text-gray-900">{formatDate(bill.invoiceDate)}</span>
                            </div>
                        </div> */}

                        {/* Processed At */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">تاريخ المعالجة</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={18} className="text-gray-500" />
                                <span className="text-gray-900">{formatDate(bill.processedAt)}</span>
                            </div>
                        </div>

                        {/* Notes - Full Width */}
                        {bill.notes && (
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">ملاحظات</label>
                                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                    <AlertCircle size={18} className="text-gray-500 mt-1" />
                                    <span className="text-gray-900">{bill.notes}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Items Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Package size={24} className="text-blue-600" />
                        أصناف الفاتورة
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اسم الصنف</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">سعر الوحدة</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السعر القديم</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">متوسط السعر الجديد</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجمالي</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تغيير السعر</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bill.items?.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                {getItemTypeName(item.itemType)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {Number(item.unitPrice).toFixed(2)} ر.س
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.oldPrice > 0 ? `${Number(item.oldPrice).toFixed(2)} ر.س` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {Number(item.newAveragePrice).toFixed(2)} ر.س
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            {Number(item.lineTotal).toFixed(2)} ر.س
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.priceChanged ? (
                                                <div className="flex items-center gap-1">
                                                    {item.unitPrice > item.oldPrice ? (
                                                        <>
                                                            <TrendingUp size={16} className="text-red-500" />
                                                            <span className="text-red-600 font-medium">زيادة</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown size={16} className="text-green-500" />
                                                            <span className="text-green-600 font-medium">انخفاض</span>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-bold">
                                <tr>
                                    <td colSpan="6" className="px-4 py-3 text-right text-sm text-gray-700">
                                        الإجمالي
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {Number(bill.totalAmount).toFixed(2)} ر.س
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
}
