'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Wrench, ClipboardList, History } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import Alert from '@/components/Ui/Alert';
import SparePartForm from './components/SparePartForm';
import UsageForm from './components/UsageForm';

export default function SparePartsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [usageItem, setUsageItem] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.LIST);
            console.log(response);
            setData(response || []);
        } catch (error) {
            console.error('Error loading spare parts:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه القطعة؟')) return;

        try {
            await ApiService.delete(API_ENDPOINTS.SPARE_PARTS.DELETE(id));
            showAlert('success', 'تم حذف القطعة بنجاح');
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert('error', 'حدث خطأ أثناء الحذف');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingItem) {
                await ApiService.put(API_ENDPOINTS.SPARE_PARTS.UPDATE(editingItem.id), formData);
                showAlert('success', 'تم تحديث البيانات بنجاح');
            } else {
                await ApiService.post(API_ENDPOINTS.SPARE_PARTS.CREATE, formData);
                showAlert('success', 'تم إضافة القطعة بنجاح');
            }
            setIsModalOpen(false);
            setEditingItem(null);
            loadData();
        } catch (error) {
            console.error('Error saving:', error);
            showAlert('error', 'حدث خطأ أثناء الحفظ');
        }
    };

    const handleRecordUsage = async (formData) => {
        try {
            await ApiService.post(API_ENDPOINTS.SPARE_PARTS.ADD_USAGE(usageItem.id), formData);
            showAlert('success', 'تم تسجيل الاستخدام بنجاح');
            setIsUsageModalOpen(false);
            setUsageItem(null);
            loadData();
        } catch (error) {
            console.error('Error recording usage:', error);
            showAlert('error', 'حدث خطأ أثناء تسجيل الاستخدام');
        }
    };

    const handleViewHistory = async (item) => {
        setUsageItem(item); // Reusing usageItem to know which part we are viewing
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.HISTORY(item.id));
            setHistoryData(response || []);
        } catch (error) {
            console.error('Error loading history:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السجل');
        } finally {
            setHistoryLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const columns = [
        {
            header: 'الاسم',
            accessor: 'name',
        },
        {
            header: 'الكمية',
            accessor: 'quantity',
        },
        {
            header: 'السعر',
            accessor: 'price',
            render: (row) => `${Number(row.price).toFixed(2)} ر.س`
        },
        {
            header: 'الموقع',
            accessor: 'location',
        },
        {
            header: 'تاريخ الإضافة',
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA')
        },
        {
            header: 'الإجراءات',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewHistory(row)}
                        className="text-purple-600 hover:text-purple-800"
                        title="سجل الاستخدام"
                    >
                        <History size={18} />
                    </button>
                    {/* <button
                        onClick={() => {
                            setUsageItem(row);
                            setIsUsageModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="تسجيل استخدام"
                    >
                        <ClipboardList size={18} />
                    </button> */}
                    <button
                        onClick={() => {
                            setEditingItem(row);
                            setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="تعديل"
                    >
                        <Edit size={18} />
                    </button>
                    {/* <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800"
                        title="حذف"
                    >
                        <Trash2 size={18} />
                    </button> */}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="قطع الغيار"
                subtitle="إدارة قطع الغيار والمخزون"
                icon={Wrench}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer m-5" onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
            }}>
                <Plus size={20} className="ml-2" />
                إضافة قطعة جديدة
            </Button>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="بحث عن قطعة غيار (الاسم أو الموقع)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
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
                title={editingItem ? 'تعديل قطعة غيار' : 'إضافة قطعة غيار جديدة'}
            >
                <SparePartForm
                    initialData={editingItem}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                />
            </Modal>

            <Modal
                isOpen={isUsageModalOpen}
                onClose={() => {
                    setIsUsageModalOpen(false);
                    setUsageItem(null);
                }}
                title="تسجيل استخدام قطعة غيار"
            >
                <UsageForm
                    onSubmit={handleRecordUsage}
                    onCancel={() => {
                        setIsUsageModalOpen(false);
                        setUsageItem(null);
                    }}
                />
            </Modal>

            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setUsageItem(null);
                    setHistoryData([]);
                }}
                title={`سجل استخدام: ${usageItem?.name || ''}`}
                size="lg"
            >
                <Table
                    columns={[
                        { header: 'رقم المركبة', accessor: 'vehicleNumber' },
                        { header: 'الكمية المستخدمة', accessor: 'quantityUsed' },
                        {
                            header: 'تاريخ الاستخدام',
                            accessor: 'usedAt',
                            render: (row) => new Date(row.usedAt).toLocaleString('ar-SA')
                        },
                    ]}
                    data={historyData}
                    loading={historyLoading}
                />
            </Modal>
        </div>
    );
}
