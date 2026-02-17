'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Search, Package, History, FileSpreadsheet, MapPin } from 'lucide-react';
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
import * as XLSX from 'xlsx';

export default function RiderAccessoriesPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [housings, setHousings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
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
        loadHousings();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.LIST);
            setData(response || []);
        } catch (error) {
            console.error('Error loading rider accessories:', error);
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

    const handleExcelExport = () => {
        if (!filteredData || filteredData.length === 0) return;

        const excelData = filteredData.map(item => ({
            "الاسم": item.name,
            "الكمية": item.quantity,
            "السعر": `${Number(item.price).toFixed(2)} ر.س`,
            "الموقع": item.location || 'غير محدد',
            "تاريخ الإضافة": new Date(item.createdAt).toLocaleDateString('ar-SA')
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        // Set column widths
        const wscols = [
            { wch: 30 }, // Name
            { wch: 10 }, // Quantity
            { wch: 15 }, // Price
            { wch: 20 }, // Location
            { wch: 15 }  // Date
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, " معدات السائقين");
        XLSX.writeFile(wb, `rider_accessories_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredData = data.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLocation = !selectedLocation || item.location === selectedLocation;

        return matchesSearch && matchesLocation;
    });

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
        setIssueItem(item);
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
                </div>
            ),
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="معدات السائقين"
                subtitle="إدارة معدات السائقين والمخزون"
                icon={Package}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 md:px-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer w-full md:w-auto text-sm md:text-base" onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                }}>
                    <Plus size={18} className="ml-2" />
                    إضافة إكسسوار معدات جديد
                </Button>

                <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 w-full md:w-auto text-sm md:text-base"
                    onClick={handleExcelExport}
                    disabled={filteredData.length === 0}
                >
                    <FileSpreadsheet size={18} className="ml-2" />
                    تصدير إكسل
                </Button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:mx-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="بحث عن إكسسوار معدات (الاسم)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-700"
                            >
                                <option value="">كل المواقع</option>
                                <option value="الشركة">الشركة</option>
                                {housings.map((housing) => (
                                    <option key={housing.name} value={housing.name}>
                                        {housing.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                title={editingItem ? 'تعديل إكسسوار معدات' : 'إضافة إكسسوار معدات جديد'}
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
                title="تسجيل إصدار إكسسوار معدات"
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
