'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, ArrowRight } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';

export default function MemberRiderAccessoriesStockPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [accessories, setAccessories] = useState([]);
    const [search, setSearch] = useState('');
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadAccessories();
    }, []);

    const loadAccessories = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.RIDER_ACCESSORIES.LIST);
            setAccessories(response || []);
        } catch (error) {
            console.error('Error loading accessories:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل المعدات');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const filteredData = accessories.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase())
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
                    onClick={() => router.push('/member/maintenance/rider-accessories')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={18} className="ml-2" />
                    <span className="text-sm md:text-base">رجوع للتسجيل</span>
                </Button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-2 md:mx-4">
                <div className="mb-6">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        بحث
                    </label>
                    <Input
                        placeholder="ابحث عن معدات..."
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
