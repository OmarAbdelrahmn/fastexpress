'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Calendar, MapPin, Box, FileText, Printer } from 'lucide-react'; // changed ArrowLeft to ArrowRight for RTL
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';

export default function TransferDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [loading, setLoading] = useState(true);
    const [transfer, setTransfer] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (id) {
            loadTransferDetails();
        }
    }, [id]);

    const loadTransferDetails = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.TRANSFER.BY_ID(id));
            setTransfer(response);
        } catch (error) {
            console.error('Error loading transfer details:', error);
            setAlert({ type: 'error', message: 'حدث خطأ أثناء تحميل تفاصيل التحويل' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
    }

    if (!transfer) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">لم يتم العثور على التحويل</div>
                <Button onClick={() => router.back()}>العودة للخلف</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`تفاصيل التحويل #${transfer.id}`}
                subtitle="عرض تفاصيل نقل المواد"
                icon={FileText}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Box size={18} className="text-blue-600" />
                                الأصناف المنقولة
                            </h3>
                            <span className="text-sm text-gray-500">
                                {transfer.items?.length || 0} صنف
                            </span>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3">الصنف</th>
                                        <th className="px-6 py-3">النوع</th>
                                        <th className="px-6 py-3">الكمية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transfer.items?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {item.itemName || `صنف #${item.itemId}`}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.itemType === 1 ? 'قطع غيار' : 'إكسسوارات'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-blue-600">
                                                {item.quantity}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!transfer.items || transfer.items.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                لا توجد أصناف في هذا التحويل
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {transfer.notes && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-800 mb-3">ملاحظات</h3>
                            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm leading-relaxed border border-yellow-100">
                                {transfer.notes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            معلومات النقل
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">تاريخ التحويل</label>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <Calendar size={16} className="text-blue-500" />
                                    {new Date(transfer.transferredAt || transfer.transferDate).toLocaleString('ar-SA', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-50">
                                <label className="text-xs text-gray-500 mb-1 block">من</label>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <MapPin size={16} className="text-green-500" />
                                    {transfer.fromLocation || 'غير محدد'}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-50">
                                <label className="text-xs text-gray-500 mb-1 block">إلى</label>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <MapPin size={16} className="text-red-500" />
                                    {transfer.toLocation || transfer.housingName || 'غير محدد'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
