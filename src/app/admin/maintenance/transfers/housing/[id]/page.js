'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Calendar, MapPin, Box, FileText, Eye } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Table from '@/components/Ui/Table';

export default function LastTransferByHousingPage() {
    const router = useRouter();
    const params = useParams();
    const { id: housingId } = params;
    const [loading, setLoading] = useState(true);
    const [transfers, setTransfers] = useState([]);
    const [alert, setAlert] = useState(null);

    const loadTransfers = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.TRANSFER.BY_HOUSING(housingId));
            if (response) {
                const data = Array.isArray(response) ? response : [response];
                setTransfers(data);
            } else {
                setTransfers([]);
                setAlert({ type: 'info', message: 'لا توجد تحويلات سابقة لهذا السكن' });
            }
        } catch (error) {
            console.error('Error loading transfers:', error);
            setAlert({ type: 'error', message: 'حدث خطأ أثناء تحميل بيانات التحويلات' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (housingId) {
            loadTransfers();
        }
    }, [housingId]);

    const columns = [
        {
            header: 'رقم التحويل',
            accessor: 'id',
        },
        {
            header: 'من',
            accessor: 'fromLocation',
        },
        {
            header: 'إلى',
            accessor: 'toLocation',
            render: (row) => row.toLocation || row.housingName || 'غير محدد'
        },
        {
            header: 'تاريخ التحويل',
            accessor: 'transferredAt',
            render: (row) => {
                const date = row.transferredAt || row.transferDate;
                return date ? new Date(date).toLocaleString('ar-SA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'غير محدد';
            }
        },
        {
            header: 'عدد الأصناف',
            accessor: 'items',
            render: (row) => row.items?.length || 0
        },
        {
            header: 'الإجراءات',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/admin/maintenance/transfers/${row.id}`)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="عرض التفاصيل"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`تاريخ تحويلات السكن #${housingId}`}
                subtitle="عرض جميع عمليات نقل المواد لهذا السكن"
                icon={FileText}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Table
                    columns={columns}
                    data={transfers}
                    loading={loading}
                />
            </div>
        </div>
    );
}
