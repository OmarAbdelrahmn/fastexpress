'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, ArrowRight, PlusCircle } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';

export default function MemberSparePartsStockPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [search, setSearch] = useState('');
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadSpareParts();
    }, []);

    const loadSpareParts = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.SPARE_PARTS.LIST);
            setSpareParts(response || []);
        } catch (error) {
            console.error('Error loading spare parts:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل قطع الغيار');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const filteredData = spareParts.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.partNumber?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            header: 'الاسم',
            accessor: 'name',
        },
        {
            header: 'الكمية المتوفرة',
            accessor: 'quantity',
            render: (row) => (
                <span className={`font-bold ${row.quantity < 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {row.quantity}
                </span>
            )
        },
        {
            header: 'السعر',
            accessor: 'price',
            render: (row) => row.price ? `${row.price} ر.س` : '-'
        }
    ];

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex gap-4 px-4 md:px-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/spare-parts')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={18} className="ml-2" />
                    <span className="text-sm md:text-base">رجوع للتسجيل</span>
                </Button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:mx-6">
                <div className="mb-6">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        بحث
                    </label>
                    <Input
                        placeholder="ابحث عن قطعة غيار..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={Search}
                    />
                </div>

                <Table
                    columns={columns.map(col => ({ ...col, className: 'text-xs md:text-sm' }))}
                    data={filteredData}
                    loading={loading}
                />
            </div>
        </div>
    );
}
