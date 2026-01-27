
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, FileText, Filter, Eye } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import Alert from '@/components/Ui/Alert';
import TransferForm from './components/TransferForm';

export default function TransfersPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [housings, setHousings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [alert, setAlert] = useState(null);
    const [filterHousing, setFilterHousing] = useState('');

    useEffect(() => {
        loadData();
        loadHousings();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.TRANSFER.LIST);
            setData(response || []);
        } catch (error) {
            console.error('Error loading transfers:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const loadHousings = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.HOUSING.LIST);
            setHousings(response || []);
        } catch (error) {
            console.error('Error loading housings:', error);
        }
    };

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.housingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.id).includes(searchQuery);

        const matchesHousing = !filterHousing || String(item.housingId) === String(filterHousing);

        return matchesSearch && matchesHousing;
    });

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا التحويل؟')) return;

        try {
            // Check if DELETE endpoint exists in endpoints.js or use generic approach if implicit
            // Assuming DELETE is supported similar to Bill
            await ApiService.delete(API_ENDPOINTS.TRANSFER.BY_ID(id));
            showAlert('success', 'تم حذف التحويل بنجاح');
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert('error', 'حدث خطأ أثناء الحذف');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingItem) {
                // Assuming UPDATE is supported via PUT to BY_ID
                await ApiService.put(API_ENDPOINTS.TRANSFER.BY_ID(editingItem.id), formData);
                showAlert('success', 'تم تحديث البيانات بنجاح');
            } else {
                await ApiService.post(API_ENDPOINTS.TRANSFER.CREATE, formData);
                showAlert('success', 'تم إنشاء التحويل بنجاح');
            }
            setIsModalOpen(false);
            setEditingItem(null);
            loadData();
        } catch (error) {
            console.error('Error saving:', error);
            showAlert('error', 'حدث خطأ أثناء الحفظ');
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const columns = [
        {
            header: 'رقم التحويل',
            accessor: 'id',
        },
        {
            header: 'السكن',
            accessor: 'housingName',
        },
        {
            header: 'تاريخ التحويل',
            accessor: 'transferDate',
            render: (row) => new Date(row.transferDate).toLocaleString('ar-SA', {
                timeZone: 'Asia/Riyadh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
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
                        onClick={() => {
                            setEditingItem(row);
                            setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="تعديل"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="حذف"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="إدارة التحويلات"
                subtitle="تحويل قطع الغيار والإكسسوارات للسكن"
                icon={FileText}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer m-5" onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
            }}>
                <Plus size={20} className="ml-2" />
                إنشاء تحويل جديد
            </Button>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="بحث عن تحويل (رقم التحويل أو السكن)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <div className="w-64">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterHousing}
                            onChange={(e) => setFilterHousing(e.target.value)}
                        >
                            <option value="">جميع السكنات</option>
                            {housings.map(housing => (
                                <option key={housing.id} value={housing.id}>
                                    {housing.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                title={editingItem ? 'تعديل تحويل' : 'إنشاء تحويل جديد'}
                size="lg"
            >
                <TransferForm
                    initialData={editingItem}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                />
            </Modal>
        </div>
    );
}
