'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Search, ArrowRight, Filter, Calendar, Truck, User, Hash, FileSpreadsheet, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import Table from '@/components/Ui/Table';
import Modal from '@/components/Ui/Model';

export default function MemberCostSummaryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1); // ➕ tomorrow
        return d.toISOString().split('T')[0];
    });
    const [alert, setAlert] = useState(null);
    const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' or 'riders'
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadCostSummary();
    }, []);

    const loadCostSummary = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (fromDate) params.append('startDate', fromDate);
            if (toDate) params.append('endDate', toDate);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await ApiService.get(`${API_ENDPOINTS.MEMBER.COST_SUMMARY}${queryString}`);
            setSummary(response);
        } catch (error) {
            console.error('Error loading cost summary:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل ملخص التكاليف');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadCostSummary();
    };

    const handleReset = () => {
        const d = new Date();
        setFromDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
        setToDate(new Date().toISOString().split('T')[0]);
        loadCostSummary();
    };

    const handleVehicleExport = () => {
        const list = summary?.vehicleSpending || [];
        if (list.length === 0) {
            showAlert('error', 'لا توجد بيانات لتصديرها');
            return;
        }

        const dataToExport = [];
        list.forEach(row => {
            if (row.sparePartUsages && row.sparePartUsages.length > 0) {
                row.sparePartUsages.forEach(usage => {
                    dataToExport.push({
                        'رقم اللوحة': row.vehiclePlate,
                        'رقم المركبة': row.vehicleNumber || '-',
                        'اسم قطعة الغيار': usage.sparePartName,
                        'الكمية المستخدمة': usage.totalQuantityUsed,
                        'سعر الوحدة (ر.س)': usage.unitPrice?.toFixed(2),
                        'إجمالي تكلفة القطعة (ر.س)': usage.totalCost?.toFixed(2),
                        'تواريخ الاستخدام': usage.usageDates?.map(d => new Date(d).toLocaleDateString('ar-SA')).join(', ') || '-',
                        'إجمالي تكلفة المركبة الكلية (ر.س)': row.totalCost?.toFixed(2)
                    });
                });
            } else {
                dataToExport.push({
                    'رقم اللوحة': row.vehiclePlate,
                    'رقم المركبة': row.vehicleNumber || '-',
                    'اسم قطعة الغيار': 'لا يوجد',
                    'الكمية المستخدمة': '-',
                    'سعر الوحدة (ر.س)': '-',
                    'إجمالي تكلفة القطعة (ر.س)': '-',
                    'تواريخ الاستخدام': '-',
                    'إجمالي تكلفة المركبة الكلية (ر.س)': row.totalCost?.toFixed(2)
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Costs Detailed');
        XLSX.writeFile(workbook, `vehicle_costs_${summary.housingName || 'export'}.xlsx`);
    };

    const handleRiderExport = () => {
        const list = summary?.riderSpending || [];
        if (list.length === 0) {
            showAlert('error', 'لا توجد بيانات لتصديرها');
            return;
        }

        const dataToExport = [];
        list.forEach(row => {
            const name = row.riderNameAR || row.riderNameEN || '-';
            if (row.accessoryUsages && row.accessoryUsages.length > 0) {
                row.accessoryUsages.forEach(usage => {
                    dataToExport.push({
                        'اسم المندوب': name,
                        'معرف العمل': row.workingId,
                        'اسم المعدة': usage.accessoryName,
                        'الكمية المصروفة': usage.totalQuantityIssued,
                        'سعر الوحدة (ر.س)': usage.unitPrice?.toFixed(2),
                        'إجمالي تكلفة المعدة (ر.س)': usage.totalCost?.toFixed(2),
                        'تواريخ الصرف': usage.issuanceDates?.map(d => new Date(d).toLocaleDateString('ar-SA')).join(', ') || '-',
                        'إجمالي التكلفة الكلية للمندوب (ر.س)': row.totalCost?.toFixed(2)
                    });
                });
            } else {
                dataToExport.push({
                    'اسم المندوب': name,
                    'معرف العمل': row.workingId,
                    'اسم المعدة': 'لا يوجد',
                    'الكمية المصروفة': '-',
                    'سعر الوحدة (ر.س)': '-',
                    'إجمالي تكلفة المعدة (ر.س)': '-',
                    'تواريخ الصرف': '-',
                    'إجمالي التكلفة الكلية للمندوب (ر.س)': row.totalCost?.toFixed(2)
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rider Costs Detailed');
        XLSX.writeFile(workbook, `rider_costs_${summary.housingName || 'export'}.xlsx`);
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const vehicleColumns = [
        {
            header: 'رقم المركبة',
            accessor: 'vehicleNumber',
            render: (row) => row.vehicleNumber || '-'
        },
        {
            header: 'رقم اللوحة',
            accessor: 'vehiclePlate',
            render: (row) => formatPlateNumber(row.vehiclePlate) || '-'
        },
        {
            header: 'إجمالي التكلفة',
            accessor: 'totalCost',
            render: (row) => `${row.totalCost?.toFixed(2) || '0.00'} ر.س`
        },
        {
            header: 'التفاصيل',
            accessor: 'actions',
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelectedItem({ ...row, type: 'vehicle' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50 py-1 px-2 h-7 text-xs"
                >
                    <Eye size={14} className="ml-1" />
                    عرض القطع ({row.sparePartUsages?.length || 0})
                </Button>
            )
        }
    ];

    const riderColumns = [
        {
            header: 'اسم المندوب',
            accessor: 'riderName',
            render: (row) => row.riderNameAR || row.riderNameEN || '-'
        },
        {
            header: 'معرف العمل',
            accessor: 'workingId',
        },
        {
            header: 'إجمالي التكلفة',
            accessor: 'totalCost',
            render: (row) => `${row.totalCost?.toFixed(2) || '0.00'} ر.س`
        },
        {
            header: 'التفاصيل',
            accessor: 'actions',
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelectedItem({ ...row, type: 'rider' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-purple-600 border-purple-600 hover:bg-purple-50 py-1 px-2 h-7 text-xs"
                >
                    <Eye size={14} className="ml-1" />
                    عرض المعدات ({row.accessoryUsages?.length || 0})
                </Button>
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
                    onClick={() => router.push('/member/dashboard')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={18} className="ml-2" />
                    <span className="text-sm md:text-base">رجوع</span>
                </Button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm mx-2 md:mx-4">
                <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            من تاريخ
                        </label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            إلى تاريخ
                        </label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            disabled={loading}
                        >
                            بحث
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            إعادة ضبط
                        </Button>
                    </div>
                </form>
            </div>
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto mx-2 md:mx-4 mt-6">
                <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-md transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'vehicles'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-gray-600 hover:text-gray-950'
                        }`}
                >
                    <Truck size={16} />
                    <span>سجل صرف المركبات ({summary?.vehicleSpending?.length || 0})</span>
                </button>
                <button
                    onClick={() => setActiveTab('riders')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-md transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'riders'
                        ? 'bg-white shadow text-purple-600'
                        : 'text-gray-600 hover:text-gray-950'
                        }`}
                >
                    <User size={16} />
                    <span>سجل صرف المناديب ({summary?.riderSpending?.length || 0})</span>
                </button>
            </div>
            {/* De tail Tables depending on activeTab */}
            <div className="mx-2 md:mx-4">
                {activeTab === 'vehicles' ? (
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm overflow-x-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h3 className="text-sm md:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Truck className="text-blue-600" size={18} />
                                تكاليف المركبات التفصيلية
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleVehicleExport}
                                className="text-green-600 border-green-600 hover:bg-green-50 h-7 text-xs px-2"
                                disabled={loading || !summary?.vehicleSpending?.length}
                            >
                                <FileSpreadsheet size={14} className="ml-1" />
                                تصدير Excel
                            </Button>
                        </div>
                        <Table
                            columns={vehicleColumns.map(col => ({ ...col, className: 'text-xs md:text-sm' }))}
                            data={summary?.vehicleSpending || []}
                            loading={loading}
                        />
                    </div>
                ) : (
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm overflow-x-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h3 className="text-sm md:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <User className="text-purple-600" size={18} />
                                تكاليف المناديب التفصيلية
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRiderExport}
                                className="text-green-600 border-green-600 hover:bg-green-50 h-7 text-xs px-2"
                                disabled={loading || !summary?.riderSpending?.length}
                            >
                                <FileSpreadsheet size={14} className="ml-1" />
                                تصدير Excel
                            </Button>
                        </div>
                        <Table
                            columns={riderColumns.map(col => ({ ...col, className: 'text-xs md:text-sm' }))}
                            data={summary?.riderSpending || []}
                            loading={loading}
                        />
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                }}
                title={selectedItem?.type === 'vehicle' 
                    ? `تفاصيل تكاليف المركبة - ${selectedItem?.vehiclePlate ? formatPlateNumber(selectedItem.vehiclePlate) : selectedItem?.vehicleNumber}`
                    : `تفاصيل تكاليف المندوب - ${selectedItem?.riderNameAR || selectedItem?.riderNameEN}`
                }
                size="lg"
            >
                {selectedItem && (
                    <div className="space-y-4">
                        {/* Header Info */}
                        <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <span className="text-xs text-gray-500 font-medium block">
                                    {selectedItem.type === 'vehicle' ? 'رقم المركبة' : 'معرف العمل'}
                                </span>
                                <span className="text-sm md:text-base font-bold text-gray-800">
                                    {selectedItem.type === 'vehicle' ? (selectedItem.vehicleNumber || '-') : (selectedItem.workingId || '-')}
                                </span>
                            </div>
                            <div className="text-left">
                                <span className="text-xs text-gray-500 font-medium block">إجمالي التكلفة الكلية</span>
                                <span className="text-md md:text-lg font-black text-orange-600">
                                    {selectedItem.totalCost?.toFixed(2) || '0.00'} ر.س
                                </span>
                            </div>
                        </div>

                        {/* Details Table */}
                        {selectedItem.type === 'vehicle' ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-blue-900 border-r-4 border-blue-500 pr-2">
                                    سجل استخدام قطع الغيار ({selectedItem.sparePartUsages?.length || 0})
                                </h4>
                                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                    <table className="w-full text-right border-collapse">
                                        <thead className="bg-blue-50 text-blue-900 font-bold border-b border-gray-150">
                                            <tr>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">اسم القطعة</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">الكمية المستخدمة</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">سعر الوحدة</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">التكلفة الإجمالية</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">تواريخ الاستخدام</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedItem.sparePartUsages && selectedItem.sparePartUsages.length > 0 ? (
                                                selectedItem.sparePartUsages.map((usage, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 text-xs md:text-sm text-gray-700">
                                                        <td className="py-2.5 px-3 font-semibold text-gray-900">{usage.sparePartName}</td>
                                                        <td className="py-2.5 px-3">{usage.totalQuantityUsed}</td>
                                                        <td className="py-2.5 px-3">{usage.unitPrice?.toFixed(2)} ر.س</td>
                                                        <td className="py-2.5 px-3 font-bold text-orange-600">{usage.totalCost?.toFixed(2)} ر.س</td>
                                                        <td className="py-2.5 px-3 text-gray-500">
                                                            <div className="flex flex-col gap-0.5 max-h-16 overflow-y-auto">
                                                                {usage.usageDates?.map((d, i) => (
                                                                    <span key={i} className="text-[10px] md:text-xs">
                                                                        {new Date(d).toLocaleDateString('ar-SA')} {new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                     <td colSpan="5" className="py-6 text-center text-gray-400">
                                                         لا يوجد سجل قطع غيار مستخدمة لهذه المركبة
                                                     </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-purple-900 border-r-4 border-purple-500 pr-2">
                                    سجل صرف العُهد والمعدات ({selectedItem.accessoryUsages?.length || 0})
                                </h4>
                                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                    <table className="w-full text-right border-collapse">
                                        <thead className="bg-purple-50 text-purple-900 font-bold border-b border-gray-150">
                                            <tr>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">اسم المعدة</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">الكمية المصروفة</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">سعر الوحدة</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">التكلفة الإجمالية</th>
                                                <th className="py-2.5 px-3 text-xs md:text-sm">تواريخ الصرف</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedItem.accessoryUsages && selectedItem.accessoryUsages.length > 0 ? (
                                                selectedItem.accessoryUsages.map((usage, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 text-xs md:text-sm text-gray-700">
                                                        <td className="py-2.5 px-3 font-semibold text-gray-900">{usage.accessoryName}</td>
                                                        <td className="py-2.5 px-3">{usage.totalQuantityIssued}</td>
                                                        <td className="py-2.5 px-3">{usage.unitPrice?.toFixed(2)} ر.س</td>
                                                        <td className="py-2.5 px-3 font-bold text-orange-600">{usage.totalCost?.toFixed(2)} ر.س</td>
                                                        <td className="py-2.5 px-3 text-gray-500">
                                                            <div className="flex flex-col gap-0.5 max-h-16 overflow-y-auto">
                                                                {usage.issuanceDates?.map((d, i) => (
                                                                    <span key={i} className="text-[10px] md:text-xs">
                                                                        {new Date(d).toLocaleDateString('ar-SA')} {new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                     <td colSpan="5" className="py-6 text-center text-gray-400">
                                                         لا يوجد سجل صرف عُهد أو معدات لهذا المندوب
                                                     </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedItem(null);
                                }}
                                className="bg-[#1b428e] hover:bg-[#153470] text-white px-6 text-xs md:text-sm"
                            >
                                إغلاق
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
