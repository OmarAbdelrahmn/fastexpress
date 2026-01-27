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
import BillForm from './components/BillForm';

export default function BillsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [alert, setAlert] = useState(null);
    const [filterSupplier, setFilterSupplier] = useState('');

    useEffect(() => {
        loadData();
        loadSuppliers();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.BILL.LIST);
            setData(response || []);
        } catch (error) {
            console.error('Error loading bills:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.SUPPLIER.LIST);
            setSuppliers(response || []);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    };

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.supplierName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSupplier = !filterSupplier || String(item.supplierId) === String(filterSupplier);

        return matchesSearch && matchesSupplier;
    });

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;

        try {
            await ApiService.delete(API_ENDPOINTS.BILL.DELETE(id));
            showAlert('success', 'تم حذف الفاتورة بنجاح');
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            showAlert('error', 'حدث خطأ أثناء الحذف');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingItem) {
                await ApiService.put(API_ENDPOINTS.BILL.UPDATE(editingItem.id), formData);
                showAlert('success', 'تم تحديث البيانات بنجاح');
            } else {
                await ApiService.post(API_ENDPOINTS.BILL.CREATE, formData);
                showAlert('success', 'تم إضافة الفاتورة بنجاح');
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
            header: 'رقم الفاتورة',
            accessor: 'invoiceNumber',
        },
        {
            header: 'المورد',
            accessor: 'supplierName',
        },
        {
            header: 'تاريخ الفاتورة',
            accessor: 'invoiceDate',
            render: (row) => new Date(row.processedAt).toLocaleString('ar-SA', {
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
            accessor: 'totalItems',
        },
        {
            header: 'المبلغ الإجمالي',
            accessor: 'totalAmount',
            render: (row) => `${Number(row.totalAmount).toFixed(2)} ر.س`
        },
        {
            header: 'الإجراءات',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/admin/maintenance/bills/${row.id}`)}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                        title="عرض التفاصيل"
                    >
                        <Eye size={18} />
                    </button>
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
                title="إدارة الفواتير"
                subtitle="إنشاء وإدارة فواتير الصيانة"
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
                إضافة فاتورة جديدة
            </Button>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="بحث عن فاتورة (رقم الفاتورة أو المورد)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <div className="w-64">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                        >
                            <option value="">جميع الموردين</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
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
                title={editingItem ? 'تعديل فاتورة' : 'إضافة فاتورة جديدة'}
                size="lg"
            >
                <BillForm
                    initialData={editingItem}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                    suppliers={suppliers}
                />
            </Modal>
        </div>
    );
}
