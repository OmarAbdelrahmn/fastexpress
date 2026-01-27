'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, ClipboardList, History } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import Alert from '@/components/Ui/Alert';
import RiderAccessoryForm from './components/RiderAccessoryForm';
import IssueForm from './components/IssueForm';

export default function RiderAccessoriesPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [issueItem, setIssueItem] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.LIST);
            console.log(response);
            setData(response || []);
        } catch (error) {
            console.error('Error loading rider accessories:', error);
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
        if (!confirm('هل أنت متأكد من حذف هذا الإكسسوار؟')) return;

        try {
            await ApiService.delete(API_ENDPOINTS.RIDER_ACCESSORY.DELETE(id));
            showAlert('success', 'تم حذف الإكسسوار بنجاح');
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert('error', 'حدث خطأ أثناء الحذف');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingItem) {
                await ApiService.put(API_ENDPOINTS.RIDER_ACCESSORY.UPDATE(editingItem.id), formData);
                showAlert('success', 'تم تحديث البيانات بنجاح');
            } else {
                await ApiService.post(API_ENDPOINTS.RIDER_ACCESSORY.CREATE, formData);
                showAlert('success', 'تم إضافة الإكسسوار بنجاح');
            }
            setIsModalOpen(false);
            setEditingItem(null);
            loadData();
        } catch (error) {
            console.error('Error saving:', error);
            showAlert('error', 'حدث خطأ أثناء الحفظ');
        }
    };

    const handleRecordIssue = async (formData) => {
        try {
            await ApiService.post(API_ENDPOINTS.RIDER_ACCESSORY.ISSUE(issueItem.id), formData);
            showAlert('success', 'تم تسجيل الإصدار بنجاح');
            setIsIssueModalOpen(false);
            setIssueItem(null);
            loadData();
        } catch (error) {
            console.error('Error recording issue:', error);
            showAlert('error', 'حدث خطأ أثناء تسجيل الإصدار');
        }
    };

    const handleViewHistory = async (item) => {
        setIssueItem(item); // Reusing issueItem to know which accessory we are viewing
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.HISTORY(item.id));
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
                        title="سجل الإصدار"
                    >
                        <History size={18} />
                    </button>
                    {/* <button
                        onClick={() => {
                            setIssueItem(row);
                            setIsIssueModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="تسجيل إصدار"
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
                title="إكسسوارات السائقين"
                subtitle="إدارة إكسسوارات السائقين والمخزون"
                icon={Package}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer m-5" onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
            }}>
                <Plus size={20} className="ml-2" />
                إضافة إكسسوار جديد
            </Button>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="بحث عن إكسسوار (الاسم أو الموقع)..."
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
                title={editingItem ? 'تعديل إكسسوار' : 'إضافة إكسسوار جديد'}
            >
                <RiderAccessoryForm
                    initialData={editingItem}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                />
            </Modal>

            <Modal
                isOpen={isIssueModalOpen}
                onClose={() => {
                    setIsIssueModalOpen(false);
                    setIssueItem(null);
                }}
                title="تسجيل إصدار إكسسوار"
            >
                <IssueForm
                    onSubmit={handleRecordIssue}
                    onCancel={() => {
                        setIsIssueModalOpen(false);
                        setIssueItem(null);
                    }}
                />
            </Modal>

            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => {
                    setIsHistoryModalOpen(false);
                    setIssueItem(null);
                    setHistoryData([]);
                }}
                title={`سجل الإصدار: ${issueItem?.name || ''}`}
                size="lg"
            >
                <Table
                    columns={[
                        { header: 'رقم السائق', accessor: 'riderId' },
                        { header: 'الكمية المصدرة', accessor: 'quantityIssued' },
                        {
                            header: 'تاريخ الإصدار',
                            accessor: 'issuedAt',
                            render: (row) => new Date(row.issuedAt).toLocaleString('ar-SA')
                        },
                    ]}
                    data={historyData}
                    loading={historyLoading}
                />
            </Modal>
        </div>
    );
}
