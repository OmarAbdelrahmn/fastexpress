
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Plus, Search, Edit, Trash2, Eye, Package, Phone, Mail, FileText, Power } from 'lucide-react';

export default function SuppliersPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const data = await ApiService.get(API_ENDPOINTS.SUPPLIER.LIST);
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading suppliers:', err);
            setErrorMessage(err?.message || 'حدث خطأ في تحميل الموردين');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;

        try {
            await ApiService.delete(API_ENDPOINTS.SUPPLIER.DELETE(id));
            setSuccessMessage('تم حذف المورد بنجاح');
            loadSuppliers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting supplier:', err);
            setErrorMessage(err?.message || 'حدث خطأ في حذف المورد');
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'تعطيل' : 'تفعيل';
        if (!confirm(`هل أنت متأكد من ${action} هذا المورد؟`)) return;

        try {
            await ApiService.patch(API_ENDPOINTS.SUPPLIER.TOGGLE_ACTIVE(id));
            setSuccessMessage(`تم ${action} المورد بنجاح`);
            loadSuppliers(); // Reload the list
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error toggling supplier status:', err);
            setErrorMessage(`حدث خطأ في ${action} المورد`);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleViewDetails = (id) => {
        router.push(`/admin/maintenance/suppliers/${id}`);
    };

    const handleEdit = (id) => {
        router.push(`/admin/maintenance/suppliers/${id}/edit`);
    };

    const columns = [
        {
            header: 'اسم المورد',
            accessor: 'name',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.name}</span>
                    <div className="flex items-center gap-2 text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${row.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {row.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'معلومات الاتصال',
            accessor: 'contact',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    {row.phone && (
                        <div className="flex items-center gap-1 text-sm">
                            <Phone size={14} className="text-gray-500" />
                            <span dir="ltr">{row.phone}</span>
                        </div>
                    )}
                    {row.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Mail size={14} className="text-gray-500" />
                            <span>{row.email}</span>
                        </div>
                    )}
                    {!row.phone && !row.email && (
                        <span className="text-sm text-gray-400">-</span>
                    )}
                </div>
            )
        },
        {
            header: 'إجمالي الفواتير',
            accessor: 'totalBills',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                    <FileText size={14} />
                    <span>{row.totalBills || 0}</span>
                </div>
            )
        },
        {
            header: 'إجمالي المشتريات',
            accessor: 'totalPurchases',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                    <Package size={14} />
                    <span>{row.totalPurchases?.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} ر.س</span>
                </div>
            )
        },
        {
            header: 'الإجراءات',
            headerClassName: 'text-left',
            render: (row) => (
                <div className="flex gap-2 justify-start">
                    <button
                        onClick={() => handleViewDetails(row.id)}
                        className="text-green-600 hover:text-green-800 p-1 cursor-pointer"
                        title="عرض التفاصيل"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => handleEdit(row.id)}
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        title="تعديل"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(row.id, row.isActive)}
                        className={`${row.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} p-1 cursor-pointer`}
                        title={row.isActive ? 'تعطيل' : 'تفعيل'}
                    >
                        <Power size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                        title="حذف"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        },
    ];

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.includes(searchTerm) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate totals
    const totalPurchases = suppliers.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
    const totalBills = suppliers.reduce((sum, s) => sum + (s.totalBills || 0), 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('navigation.suppliers')}
                subtitle={`إجمالي الموردين: ${filteredSuppliers.length}`}
                icon={Package}
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 mb-1">إجمالي الموردين</p>
                            <p className="text-3xl font-bold text-blue-700">{suppliers.length}</p>
                        </div>
                        <Package className="text-blue-500" size={40} />
                    </div>
                </div>

                <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 mb-1">{t('common.active')}</p>
                            <p className="text-3xl font-bold text-green-700">
                                {suppliers.filter(s => s.isActive).length}
                            </p>
                        </div>
                        <Package className="text-green-500" size={40} />
                    </div>
                </div>

                <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 mb-1">إجمالي الفواتير</p>
                            <p className="text-3xl font-bold text-purple-700">
                                {totalBills}
                            </p>
                        </div>
                        <FileText className="text-purple-500" size={40} />
                    </div>
                </div>

                <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 mb-1">إجمالي المشتريات</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {totalPurchases.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                            </p>
                        </div>
                        <Package className="text-orange-500" size={40} />
                    </div>
                </div>
            </div>

            {/* Add New Supplier Button */}
            <div className="flex justify-end m-5">
                <button
                    onClick={() => router.push('/admin/maintenance/suppliers/create')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                >
                    <Plus size={20} />
                    <span className="font-medium">إضافة مورد جديد</span>
                </button>
            </div>

    
            {successMessage && (
                <Alert
                    type="success"
                    title="نجح"
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                />
            )}

            {errorMessage && (
                <Alert  
                    type="error"
                    title="خطأ"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            <Card>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="البحث بالاسم، المسؤول، الهاتف، البريد، أو الرقم الضريبي..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={filteredSuppliers}
                        loading={loading}
                    />
                </div>
            </Card>
        </div>
    );
}
