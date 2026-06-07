'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';
import { formatPlateNumber } from '@/lib/utils/formatters';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import {
    FileText, Search, Eye, Users, Download, Wrench, BadgeDollarSign,
    Calendar, FileSpreadsheet, DollarSign, Package, History, ArrowRight,
    Truck, User, ChevronRight, BarChart2, MapPin, ChevronDown, ChevronUp, Layers
} from 'lucide-react';

// ==========================================
// TAB 1: Vehicles Rider Costs
// ==========================================
function VehiclesRiderCostsTab() {
    const { t } = useLanguage();
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const today = new Date();
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const formatDate = (date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        setFromDate(formatDate(first));
        setToDate(formatDate(last));
    }, []);

    const fetchData = async () => {
        if (!fromDate || !toDate) {
            alert(t('common.fillAllFields') || 'Please select both dates');
            return;
        }

        setLoading(true);
        try {
            const response = await ApiService.get(`/api/CostTracking/vehicles-rider-costs?fromDate=${fromDate}&toDate=${toDate}`);
            setData(response || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert(t('common.error') || 'Error fetching data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const formatDateString = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const exportToExcel = async () => {
        if (!data || data.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }

        try {
            const ExcelJS = (await import('exceljs')).default;
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('تكلفة السائقين', { views: [{ rightToLeft: true }] });

            ws.columns = [
                { header: 'اللوحة', key: 'plate', width: 20 },
                { header: 'التكلفة الإجمالية للمركبة', key: 'totalCost', width: 25 },
                { header: 'اسم السائق', key: 'riderName', width: 30 },
                { header: 'نصيب السائق', key: 'costShare', width: 20 },
            ];

            ws.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1E3A8A' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            data.forEach(vehicle => {
                const plate = formatPlateNumber(vehicle.plateNumberA);
                const totalCost = vehicle.totalVehicleCost || 0;

                const vehicleRow = ws.addRow({
                    plate: plate,
                    totalCost: totalCost,
                    riderName: '',
                    costShare: ''
                });

                vehicleRow.eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEBF2FF' }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });
                vehicleRow.getCell('totalCost').font = { bold: true, color: { argb: 'FFDC2626' } };

                if (vehicle.riderShares && vehicle.riderShares.length > 0) {
                    vehicle.riderShares.forEach(rider => {
                        const riderRow = ws.addRow({
                            plate: '',
                            totalCost: '',
                            riderName: rider.riderNameAR || rider.riderNameEN,
                            costShare: rider.costShare || 0
                        });

                        riderRow.getCell('costShare').font = { bold: true, color: { argb: 'FFEA580C' } };
                        riderRow.alignment = { vertical: 'middle', horizontal: 'center' };
                    });
                } else {
                    const noRiderRow = ws.addRow({
                        plate: '',
                        totalCost: '',
                        riderName: 'لا يوجد',
                        costShare: 0
                    });
                    noRiderRow.getCell('costShare').font = { bold: true, color: { argb: 'FFEA580C' } };
                    noRiderRow.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });

            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Vehicles_Costs_${fromDate}_to_${toDate}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating Excel file:', error);
            alert('حدث خطأ أثناء إنشاء ملف Excel');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <Input
                            type="date"
                            label="من تاريخ"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="إلى تاريخ"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                        <div className="pb-[2px]">
                            <Button
                                onClick={fetchData}
                                disabled={loading}
                                variant="primary"
                                className="w-full justify-center h-[42px] bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Search size={18} className="mr-2" />
                                        بحث
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="pb-[2px]">
                            <Button
                                onClick={exportToExcel}
                                disabled={loading || data.length === 0}
                                variant="outline"
                                className="w-full justify-center h-[42px] border-green-600 text-green-600 hover:bg-green-50"
                            >
                                <Download size={18} className="mr-2" />
                                تصدير Excel
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">اللوحة</th>
                                <th className="px-6 py-3">الموقع</th>
                                <th className="px-6 py-3">التكلفة الإجمالية</th>
                                <th className="px-6 py-3">عدد مرات الاستخدام</th>
                                <th className="px-6 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((vehicle, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap" dir="ltr" style={{ textAlign: 'right' }}>
                                            {formatPlateNumber(vehicle.plateNumberA)}
                                        </td>
                                        <td className="px-6 py-4">{vehicle.location}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">
                                            {vehicle.totalVehicleCost?.toFixed(2)} ر.س
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users size={16} className="text-gray-400" />
                                                {vehicle.totalUsageCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(vehicle)}
                                                className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                                            >
                                                <Eye size={16} />
                                                التفاصيل
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        {loading ? 'جاري التحميل...' : 'لا توجد بيانات لهذه الفترة'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`تفاصيل تكلفة المركبة (${selectedVehicle ? formatPlateNumber(selectedVehicle.plateNumberA) : ''})`}
                size="xl"
            >
                {selectedVehicle && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-blue-50 p-4 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-500">اللوحة</p>
                                <p className="font-bold text-gray-900" dir="ltr" style={{ textAlign: 'right' }}>{formatPlateNumber(selectedVehicle.plateNumberA)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">التكلفة الإجمالية</p>
                                <p className="font-bold text-blue-600">{selectedVehicle.totalVehicleCost?.toFixed(2)} ر.س</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">الموقع</p>
                                <p className="font-bold text-gray-900">{selectedVehicle.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">مرات الاستخدام</p>
                                <p className="font-bold text-gray-900">{selectedVehicle.totalUsageCount}</p>
                            </div>
                        </div>

                        <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">توزيع التكلفة على السائقين</h4>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-gray-500 border border-gray-100 rounded-lg">
                                <thead className="text-xs text-gray-700 bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">رقم الهوية</th>
                                        <th className="px-4 py-3">اسم السائق (AR)</th>
                                        <th className="px-4 py-3">اسم السائق (EN)</th>
                                        <th className="px-4 py-3">بداية التفويض</th>
                                        <th className="px-4 py-3">نهاية التفويض</th>
                                        <th className="px-4 py-3">حالة التفويض</th>
                                        <th className="px-4 py-3">نصيب السائق</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedVehicle.riderShares && selectedVehicle.riderShares.length > 0 ? (
                                        selectedVehicle.riderShares.map((rider, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{rider.employeeIqamaNo}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{rider.riderNameAR}</td>
                                                <td className="px-4 py-3">{rider.riderNameEN}</td>
                                                <td className="px-4 py-3">{formatDateString(rider.permissionStart)}</td>
                                                <td className="px-4 py-3">{formatDateString(rider.permissionEnd)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${rider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {rider.isActive ? 'نشط' : 'منتهي'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-orange-600">
                                                    {rider.costShare?.toFixed(2)} ر.س
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                                لا توجد تفاصيل للسائقين
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

// ==========================================
// TAB 2: All Housings Details
// ==========================================
function AllHousingsDetailsTab() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [toDate, setToDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [selectedHousing, setSelectedHousing] = useState('');
    const [availableHousings, setAvailableHousings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.ALL_HOUSINGS_DETAILS(fromDate, toDate));
            if (response) {
                setSummary({
                    totalCost: response.totalCompanyCost || 0,
                    totalSparePartsCost: response.totalCompanySparePartsCost || 0,
                    totalAccessoriesCost: response.totalCompanyAccessoriesCost || 0,
                });
                const processed = processData(response);
                setTableData(processed);

                const housingsList = processed.map(item => item.housingName);
                setAvailableHousings([...new Set(housingsList)].sort());
            } else {
                setTableData([]);
                setSummary(null);
                setAvailableHousings([]);
            }
        } catch (error) {
            console.error('Error loading details:', error);
            setTableData([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data) => {
        let rows = [];

        const processDetail = (detail, isCompanyStock = false) => {
            const housingName = isCompanyStock ? 'مستودع الشركة / المخزون العام' : detail.housingName;

            if (detail.vehicleUsages && Array.isArray(detail.vehicleUsages)) {
                detail.vehicleUsages.forEach(vehicleUsage => {
                    if (vehicleUsage.sparePartsUsed && Array.isArray(vehicleUsage.sparePartsUsed)) {
                        vehicleUsage.sparePartsUsed.forEach(item => {
                            rows.push({
                                housingName: housingName,
                                date: item.usedAt,
                                type: 'قطع غيار',
                                itemName: item.sparePartName,
                                entityName: `${formatPlateNumber(vehicleUsage.vehiclePlate)} - ${vehicleUsage.vehicleNumber || ''}`,
                                quantity: item.quantityUsed,
                                cost: item.totalCost,
                                originalItem: item,
                                isCompanyStock
                            });
                        });
                    }
                });
            }

            if (detail.riderUsages && Array.isArray(detail.riderUsages)) {
                detail.riderUsages.forEach(riderUsage => {
                    if (riderUsage.accessoriesUsed && Array.isArray(riderUsage.accessoriesUsed)) {
                        riderUsage.accessoriesUsed.forEach(item => {
                            rows.push({
                                housingName: housingName,
                                date: item.issuedAt,
                                type: 'معدات السائقين',
                                itemName: item.accessoryName,
                                entityName: `${riderUsage.riderNameAR} (${riderUsage.riderNameEN})`,
                                quantity: 1,
                                cost: item.price,
                                originalItem: item,
                                isCompanyStock
                            });
                        });
                    }
                });
            }
        };

        if (data.housings && Array.isArray(data.housings)) {
            data.housings.forEach(housing => processDetail(housing));
        }

        if (data.companyStock) {
            processDetail(data.companyStock, true);
        }

        return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const handleSearch = () => {
        if (fromDate && toDate) {
            loadData();
        } else {
            alert('الرجاء اختيار التاريخ من وإلى');
        }
    };

    const handleExcelExport = () => {
        const dataToExport = displayData;
        if (!dataToExport || dataToExport.length === 0) return;

        const excelData = dataToExport.map(item => ({
            "السكن/الموقع": item.housingName,
            "التاريخ": item.date ? new Date(item.date).toLocaleDateString('ar-SA') : '-',
            "النوع": item.type,
            "المركبة/السائق": item.entityName,
            "الصنف": item.itemName,
            "الكمية": item.quantity,
            "التكلفة": `${Number(item.cost).toFixed(2)} ر.س`,
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wscols = [
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 },
            { wch: 25 },
            { wch: 10 },
            { wch: 15 },
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تفاصيل الاستخدام");
        XLSX.writeFile(wb, `usage_details_${fromDate}_${toDate}.xlsx`);
    };

    const columns = [
        {
            header: 'السكن/الموقع',
            accessor: 'housingName',
            render: (row) => (
                <span className={row.isCompanyStock ? "font-bold text-blue-700" : ""}>
                    {row.housingName}
                </span>
            )
        },
        {
            header: 'التاريخ',
            accessor: 'date',
            render: (row) => row.date ? new Date(row.date).toLocaleDateString('ar-SA') : '-'
        },
        {
            header: 'النوع',
            accessor: 'type',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.type === 'قطع غيار'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-purple-100 text-purple-800'
                    }`}>
                    {row.type}
                </span>
            )
        },
        {
            header: 'المركبة/السائق',
            accessor: 'entityName',
        },
        {
            header: 'الصنف',
            accessor: 'itemName',
        },
        {
            header: 'الكمية',
            accessor: 'quantity',
        },
        {
            header: 'التكلفة',
            accessor: 'cost',
            render: (row) => <span className="font-bold text-green-600">{Number(row.cost).toFixed(2)} ر.س</span>
        }
    ];

    const displayData = tableData
        .filter(row => !selectedHousing || row.housingName === selectedHousing)
        .filter(row => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.trim().toLowerCase();
            return (
                (row.itemName || '').toLowerCase().includes(q) ||
                (row.entityName || '').toLowerCase().includes(q)
            );
        });

    const displaySummary = selectedHousing
        ? {
            totalCost: displayData.reduce((sum, row) => sum + (Number(row.cost) || 0), 0),
            totalSparePartsCost: displayData.filter(row => row.type === 'قطع غيار').reduce((sum, row) => sum + (Number(row.cost) || 0), 0),
            totalAccessoriesCost: displayData.filter(row => row.type === 'معدات السائقين').reduce((sum, row) => sum + (Number(row.cost) || 0), 0),
        }
        : summary;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">إجمالي التكلفة</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {displaySummary ? `${Number(displaySummary.totalCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">قطع الغيار</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {displaySummary ? `${Number(displaySummary.totalSparePartsCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                            <Wrench size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">معدات السائقين</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {displaySummary ? `${Number(displaySummary.totalAccessoriesCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <Package size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-end mb-4 flex-wrap">
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[42px]"
                            />
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[42px]"
                            />
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">السكن / الموقع</label>
                        <select
                            value={selectedHousing}
                            onChange={(e) => setSelectedHousing(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[200px] text-sm h-[42px]"
                        >
                            <option value="">الكل</option>
                            {availableHousings.map(housing => (
                                <option key={housing} value={housing}>{housing}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-[42px] px-6"
                        disabled={loading}
                    >
                        <Search size={18} className="ml-2" />
                        بحث
                    </Button>

                    <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 h-[42px] px-6 mr-auto"
                        onClick={handleExcelExport}
                        disabled={displayData.length === 0}
                    >
                        <FileSpreadsheet size={18} className="ml-2" />
                        تصدير إكسل ({displayData.length})
                    </Button>
                </div>

                {/* Text search row */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث بقطعة الغيار أو رقم لوحة المركبة..."
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[42px]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-xs"
                            >
                                ✕ مسح
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-xs text-gray-500 mt-1">
                            {displayData.length} نتيجة للبحث عن "{searchQuery}"
                        </p>
                    )}
                </div>

                <Table
                    columns={columns}
                    data={displayData}
                    loading={loading}
                    emptyMessage="الرجاء اختيار الفترة وعمل بحث لعرض البيانات"
                />
            </Card>
        </div>
    );
}

// ==========================================
// TAB 3: Housing Costs
// ==========================================
function HousingCostsTab() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [toDate, setToDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.ALL_HOUSINGS_COSTS(fromDate, toDate));
            if (response && response.housingCosts) {
                const housingData = response.housingCosts;

                if (response.companyStock) {
                    const companyRow = {
                        housingName: 'مستودع الشركة / المخزون العام',
                        vehicleCount: "-",
                        riderCount: "-",
                        sparePartsCost: response.companyStock.sparePartsCost || 0,
                        accessoriesCost: response.companyStock.accessoriesCost || 0,
                        accessoriesLabel: 'معدات السائقين',
                        totalCost: response.companyStock.totalCost || 0,
                        isCompanyStock: true
                    };
                    setData([...housingData, companyRow]);
                } else {
                    setData(housingData);
                }

                setSummary(response);
            } else {
                setData([]);
                setSummary(null);
            }
        } catch (error) {
            console.error('Error loading housing costs:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (fromDate && toDate) {
            loadData();
        } else {
            alert('الرجاء اختيار التاريخ من وإلى');
        }
    };

    const handleExcelExport = () => {
        if (!data || data.length === 0) return;

        const excelData = data.map(item => ({
            "السكن": item.housingName,
            "عدد المركبات": item.vehicleCount,
            "عدد المناديب النشطة": item.riderCount,
            "تكلفة قطع الغيار": `${Number(item.sparePartsCost).toFixed(2)} ر.س`,
            "تكلفة معدات السائقين": `${Number(item.accessoriesCost).toFixed(2)} ر.س`,
            "نوع الصنف": "معدات السائقين",
            "التكلفة الإجمالية": `${Number(item.totalCost).toFixed(2)} ر.س`,
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wscols = [
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تكاليف السكن");
        XLSX.writeFile(wb, `housing_costs_${fromDate}_${toDate}.xlsx`);
    };

    const columns = [
        {
            header: 'السكن',
            accessor: 'housingName',
            render: (row) => (
                <span className={row.isCompanyStock ? "font-bold text-blue-700" : ""}>
                    {row.housingName}
                </span>
            )
        },
        {
            header: 'عدد المركبات',
            accessor: 'vehicleCount',
        },
        {
            header: 'عدد المناديب النشطة',
            accessor: 'riderCount',
        },
        {
            header: 'تكلفة قطع الغيار',
            accessor: 'sparePartsCost',
            render: (row) => `${Number(row.sparePartsCost).toFixed(2)} ر.س`
        },
        {
            header: 'تكلفة معدات السائقين',
            accessor: 'accessoriesCost',
            render: (row) => `${Number(row.accessoriesCost).toFixed(2)} ر.س`
        },
        {
            header: 'التكلفة الإجمالية',
            accessor: 'totalCost',
            render: (row) => <span className="font-bold text-green-600">{Number(row.totalCost).toFixed(2)} ر.س</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">إجمالي التكلفة</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.grandTotalCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">قطع الغيار</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.grandTotalSparePartsCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                            <Wrench size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">معدات السائقين</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.grandTotalAccessoriesCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <Package size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[42px]"
                            />
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-[42px]"
                            />
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                        </div>
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-[42px] px-6"
                        disabled={loading}
                    >
                        <Search size={18} className="ml-2" />
                        بحث
                    </Button>

                    <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 h-[42px] px-6 mr-auto"
                        onClick={handleExcelExport}
                        disabled={!data || data.length === 0}
                    >
                        <FileSpreadsheet size={18} className="ml-2" />
                        تصدير إكسل
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={data}
                    loading={loading}
                    emptyMessage="الرجاء اختيار الفترة وعمل بحث لعرض البيانات"
                />
            </Card>
        </div>
    );
}

// ==========================================
// TAB 4: Spare Parts History
// ==========================================
function SparePartsHistoryTab() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.VEHICLES.LIST);
            setVehicles(response || []);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل المركبات');
        }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        if (!vehicleSearch) return true;
        const search = vehicleSearch.toLowerCase();
        return (
            vehicle.plateNumberA?.toLowerCase().includes(search) ||
            vehicle.plateNumberE?.toLowerCase().includes(search) ||
            vehicle.vehicleNumber?.toLowerCase().includes(search) ||
            String(vehicle.serialNumber || '')?.toLowerCase().includes(search) ||
            vehicle.vehicleType?.toLowerCase().includes(search) ||
            vehicle.manufacturer?.toLowerCase().includes(search) ||
            vehicle.ownerName?.toLowerCase().includes(search)
        );
    });

    const handleVehicleSelect = async (vehicle) => {
        setSelectedVehicle(vehicle);
        await loadHistory(vehicle.vehicleNumber);
    };

    const loadHistory = async (vehicleNumber) => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.VEHICLE_HISTORY(vehicleNumber));
            setHistoryData(response || []);
        } catch (error) {
            console.error('Error loading history:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السجل');
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const columns = [
        {
            header: 'رقم السجل',
            accessor: 'id',
        },
        {
            header: 'اسم قطعة الغيار',
            accessor: 'sparePartName',
        },
        {
            header: 'رقم المركبة',
            accessor: 'vehicleNumber',
        },
        {
            header: 'الكمية المستخدمة',
            accessor: 'quantityUsed',
        },
        {
            header: 'تاريخ الاستخدام',
            accessor: 'usedAt',
            render: (row) => new Date(row.usedAt).toLocaleString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
    ];

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col md:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/maintenance/usage/spare-parts')}
                    className="border-orange-600 text-orange-600 hover:bg-orange-50 w-full md:w-auto text-sm"
                >
                    <Package size={16} className="ml-2" />
                    تسجيل صرف جديد
                </Button>
            </div>

            <Card>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ابحث عن المركبة
                    </label>
                    <Input
                        placeholder="ابحث عن المركبة (رقم اللوحة، رقم الشاسيه، رقم التسلسل، الموديل، اللون...)"
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        icon={Search}
                    />
                </div>

                {!selectedVehicle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 mb-6 border-2 border-gray-100 rounded-lg">
                        {filteredVehicles.map((vehicle) => (
                            <div
                                key={vehicle.plateNumberA || vehicle.vehicleNumber}
                                onClick={() => handleVehicleSelect(vehicle)}
                                className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-orange-300 hover:bg-gray-50"
                            >
                                <div className="flex items-start gap-3">
                                    <Truck className="text-gray-400 flex-shrink-0" size={24} />
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">
                                            {formatPlateNumber(vehicle.plateNumberA) || vehicle.vehicleNumber}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {vehicle.vehicleType} - {vehicle.manufacturer}
                                        </div>
                                        {vehicle.vehicleNumber && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                رقم المركبة: {vehicle.vehicleNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredVehicles.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                لا توجد مركبات تطابق البحث
                            </div>
                        )}
                    </div>
                )}

                {selectedVehicle && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                    <Package size={20} />
                                    تفاصيل المركبة ({formatPlateNumber(selectedVehicle.plateNumberA)})
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedVehicle(null);
                                        setHistoryData([]);
                                    }}
                                    className="text-xs"
                                >
                                    اختيار مركبة أخرى
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">رقم اللوحة (عربي):</span>
                                    <span className="mr-2 text-gray-900">{formatPlateNumber(selectedVehicle.plateNumberA) || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">رقم اللوحة (إنجليزي):</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.plateNumberE || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">نوع المركبة:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.vehicleType || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">الشركة المصنعة:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.manufacturer || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">رقم المركبة:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.vehicleNumber || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">الرقم التسلسلي:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.serialNumber || 'غير متوفر'}</span>
                                </div>
                                {selectedVehicle.manufactureYear && (
                                    <div>
                                        <span className="font-medium text-gray-700">سنة الصنع:</span>
                                        <span className="mr-2 text-gray-900">{selectedVehicle.manufactureYear}</span>
                                    </div>
                                )}
                                {selectedVehicle.location && (
                                    <div>
                                        <span className="font-medium text-gray-700">الموقع:</span>
                                        <span className="mr-2 text-gray-900">{selectedVehicle.location}</span>
                                    </div>
                                )}
                                <div className="col-span-full mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي قطع الغيار المستخدمة</span>
                                        <span className="text-xl font-bold text-blue-600">{historyData.length}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي التكلفة</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {historyData.reduce((sum, item) => sum + (item.totalCost || item.cost || (item.unitPrice * item.quantityUsed) || 0), 0).toFixed(2)} ر.س
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <History size={20} />
                                سجل الاستخدام
                            </h4>
                            <Table
                                columns={[...columns, {
                                    header: 'التكلفة',
                                    accessor: 'totalCost',
                                    render: (row) => {
                                        const cost = row.totalCost || row.cost || (row.unitPrice * row.quantityUsed) || 0;
                                        return `${Number(cost).toFixed(2)} ر.س`;
                                    }
                                }]}
                                data={historyData}
                                loading={loading}
                            />

                            {!loading && historyData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    لا يوجد سجل استخدام لهذه المركبة
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!selectedVehicle && filteredVehicles.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <History size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>اختر مركبة لعرض سجل الاستخدام</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ==========================================
// TAB 5: Rider Accessories History
// ==========================================
function RiderAccessoriesHistoryTab() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [riders, setRiders] = useState([]);
    const [riderSearch, setRiderSearch] = useState('');
    const [selectedRider, setSelectedRider] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadRiders();
    }, []);

    const loadRiders = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER.LIST);
            setRiders(response || []);
        } catch (error) {
            console.error('Error loading riders:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السائقين');
        }
    };

    const filteredRiders = riders.filter(rider => {
        if (!riderSearch) return true;
        const search = riderSearch.toLowerCase();
        return (
            rider.nameAR?.toLowerCase().includes(search) ||
            rider.nameEN?.toLowerCase().includes(search) ||
            rider.iqamaNo?.toString().includes(search) ||
            rider.workingId?.toLowerCase().includes(search) ||
            rider.phoneNumber?.toLowerCase().includes(search)
        );
    });

    const handleRiderSelect = async (rider) => {
        setSelectedRider(rider);
        await loadHistory(rider.riderId);
    };

    const loadHistory = async (riderId) => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.BY_RIDER(riderId));
            setHistoryData(response || []);
        } catch (error) {
            console.error('Error loading history:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السجل');
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const columns = [
        {
            header: 'رقم السجل',
            accessor: 'id',
        },
        {
            header: 'اسم معدات السائق',
            accessor: 'accessoryName',
        },
        {
            header: 'اسم السائق',
            accessor: 'riderNameAR',
        },
        {
            header: 'تاريخ التسليم',
            accessor: 'issuedAt',
            render: (row) => new Date(row.issuedAt).toLocaleString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
    ];

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col md:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/maintenance/usage/rider-accessories')}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 w-full md:w-auto text-sm"
                >
                    <Package size={16} className="ml-2" />
                    تسجيل صرف جديد
                </Button>
            </div>

            <Card>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ابحث عن السائق
                    </label>
                    <Input
                        placeholder="ابحث عن السائق (الاسم، رقم الهوية، ID العمل، رقم الهاتف...)"
                        value={riderSearch}
                        onChange={(e) => setRiderSearch(e.target.value)}
                        icon={Search}
                    />
                </div>

                {!selectedRider && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 mb-6 border-2 border-gray-100 rounded-lg">
                        {filteredRiders.map((rider, index) => (
                            <div
                                key={rider.riderid || rider.iqamaNo || `rider-${index}`}
                                onClick={() => handleRiderSelect(rider)}
                                className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-purple-300 hover:bg-gray-50"
                            >
                                <div className="flex items-start gap-3">
                                    <User className="text-gray-400 flex-shrink-0" size={24} />
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">
                                            {rider.nameAR}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            هوية: {rider.iqamaNo}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            ID العمل: {rider.workingId}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredRiders.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                لا يوجد سائقون يطابقون البحث
                            </div>
                        )}
                    </div>
                )}

                {selectedRider && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                    <User size={20} />
                                    تفاصيل السائق ({selectedRider.nameAR})
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedRider(null);
                                        setHistoryData([]);
                                    }}
                                    className="text-xs"
                                >
                                    اختيار سائق آخر
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">الاسم (عربي):</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.nameAR}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">الاسم (إنجليزي):</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.nameEN}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">رقم الهوية:</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.iqamaNo}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">ID العمل:</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.workingId}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">رقم الهاتف:</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.phoneNumber || '-'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">السكن:</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.housingAddress || '-'}</span>
                                </div>
                                <div className="col-span-full mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي الطلبات</span>
                                        <span className="text-xl font-bold text-blue-600">{historyData.length}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي التكلفة</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {historyData.reduce((sum, item) => sum + (item.totalCost || item.cost || (item.unitPrice * item.quantity) || 0), 0).toFixed(2)} ر.س
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <History size={20} />
                                سجل الصرف
                            </h4>
                            <Table
                                columns={[...columns, {
                                    header: 'التكلفة',
                                    accessor: 'totalCost',
                                    render: (row) => {
                                        const cost = row.totalCost || row.cost || (row.unitPrice * row.quantity) || 0;
                                        return `${Number(cost).toFixed(2)} ر.س`;
                                    }
                                }]}
                                data={historyData}
                                loading={loading}
                            />

                            {!loading && historyData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    لا يوجد سجل صرف لهذا السائق
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!selectedRider && filteredRiders.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <History size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>اختر سائقاً لعرض سجل الصرف</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ==========================================
// TAB 6: Usages (Spare Parts + Accessories Movement Report)
// ==========================================
function UsagesTab() {
    const [activeSubTab, setActiveSubTab] = useState('spareParts');

    const subTabs = [
        { id: 'spareParts', label: 'قطع الغيار', icon: Wrench, color: 'from-orange-500 to-orange-600' },
        { id: 'accessories', label: 'معدات السائقين', icon: Package, color: 'from-purple-500 to-purple-600' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                            activeSubTab === tab.id
                                ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                        }`}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div key={activeSubTab} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                {activeSubTab === 'spareParts' && <SparePartsMovementReport />}
                {activeSubTab === 'accessories' && <AccessoriesMovementReport />}
            </div>
        </div>
    );
}

function DateRangeFilter({ fromDate, toDate, setFromDate, setToDate, onSearch, loading, extraLeft }) {
    return (
        <Card>
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                    <div className="relative">
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm h-[42px]" />
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                    <div className="relative">
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm h-[42px]" />
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                    </div>
                </div>
                <Button onClick={onSearch} disabled={loading} variant="primary"
                    className="h-[42px] px-6 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={16} className="mr-1" />بحث</>}
                </Button>
                {extraLeft}
            </div>
        </Card>
    );
}

function ItemMovementCard({ item, type }) {
    const [expanded, setExpanded] = useState(false);
    const isSpare = type === 'spare';

    const badgeClass = isSpare
        ? 'bg-orange-100 text-orange-700'
        : 'bg-purple-100 text-purple-700';

    const summary = item.summary || {};
    const totalCost = isSpare ? summary.totalUsageCost : summary.totalIssuanceCost;
    const totalQtyUsed = isSpare ? summary.totalQuantityUsed : summary.totalTimesIssued;

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(v => !v)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSpare ? 'bg-orange-50' : 'bg-purple-50'}`}>
                        {isSpare ? <Wrench size={18} className="text-orange-600" /> : <Package size={18} className="text-purple-600" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{item.itemName}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            {summary.locationsInvolved?.length > 0 && (
                                <span className="flex items-center gap-1"><MapPin size={11} />{summary.locationsInvolved.join(' · ')}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">الكمية المستخدمة</p>
                        <p className="font-bold text-gray-800">{totalQtyUsed ?? '-'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">إجمالي التكلفة</p>
                        <p className="font-bold text-green-600">{Number(totalCost ?? 0).toFixed(2)} ر.س</p>
                    </div>
                    {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50">

                    {/* Current Stock */}
                    {item.currentStock?.length > 0 && (
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Layers size={14} className="text-blue-500" />المخزون الحالي
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {item.currentStock.map((s, i) => (
                                    <div key={i} className="bg-white border border-blue-100 rounded-lg p-3 text-sm">
                                        <p className="font-medium text-gray-800">{s.location}</p>
                                        <p className="text-gray-500">الكمية: <span className="font-bold text-blue-600">{s.currentQuantity}</span></p>
                                        <p className="text-gray-500">السعر: <span className="font-bold">{Number(s.currentPrice).toFixed(2)} ر.س</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Usages */}
                    {item.usages?.length > 0 && (
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                {isSpare ? <Wrench size={14} className="text-orange-500" /> : <Package size={14} className="text-purple-500" />}
                                {isSpare ? 'سجل الاستخدام' : 'سجل الإصدار'}
                            </h5>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-xs text-right">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            {isSpare ? (
                                                <>
                                                    <th className="px-3 py-2">المركبة</th>
                                                    <th className="px-3 py-2">السائق</th>
                                                    <th className="px-3 py-2">الموقع</th>
                                                    <th className="px-3 py-2">الكمية</th>
                                                    <th className="px-3 py-2">سعر الوحدة</th>
                                                    <th className="px-3 py-2">الإجمالي</th>
                                                    <th className="px-3 py-2">التاريخ</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="px-3 py-2">السائق</th>
                                                    <th className="px-3 py-2">الموقع</th>
                                                    <th className="px-3 py-2">ID العمل</th>
                                                    <th className="px-3 py-2">سعر الإصدار</th>
                                                    <th className="px-3 py-2">التاريخ</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {item.usages.map((u, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                {isSpare ? (
                                                    <>
                                                        <td className="px-3 py-2 font-medium">{u.vehicleNumber || '-'}</td>
                                                        <td className="px-3 py-2">{u.assignedRiderNameAR || '-'}</td>
                                                        <td className="px-3 py-2">{u.sourceLocation}</td>
                                                        <td className="px-3 py-2 font-bold text-orange-600">{u.quantityUsed}</td>
                                                        <td className="px-3 py-2">{Number(u.unitPriceAtUsage).toFixed(2)} ر.س</td>
                                                        <td className="px-3 py-2 font-bold text-green-600">{Number(u.totalCost).toFixed(2)} ر.س</td>
                                                        <td className="px-3 py-2 text-gray-400">{new Date(u.usedAt).toLocaleDateString('ar-SA')}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-3 py-2 font-medium">{u.riderNameAR || u.riderNameEN || '-'}</td>
                                                        <td className="px-3 py-2">{u.riderHousing || u.sourceLocation}</td>
                                                        <td className="px-3 py-2">{u.workingId || '-'}</td>
                                                        <td className="px-3 py-2 font-bold text-green-600">{Number(u.priceAtIssuance).toFixed(2)} ر.س</td>
                                                        <td className="px-3 py-2 text-gray-400">{new Date(u.issuedAt).toLocaleDateString('ar-SA')}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Transfers */}
                    {item.transfers?.length > 0 && (
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <ArrowRight size={14} className="text-teal-500" />سجل التحويلات
                            </h5>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-xs text-right">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            <th className="px-3 py-2">من</th>
                                            <th className="px-3 py-2">إلى</th>
                                            <th className="px-3 py-2">الكمية</th>
                                            <th className="px-3 py-2">بواسطة</th>
                                            <th className="px-3 py-2">التاريخ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {item.transfers.map((tr, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-3 py-2">{tr.fromLocation}</td>
                                                <td className="px-3 py-2">{tr.toLocation}</td>
                                                <td className="px-3 py-2 font-bold text-teal-600">{tr.quantityTransferred}</td>
                                                <td className="px-3 py-2">{tr.transferredBy}</td>
                                                <td className="px-3 py-2 text-gray-400">{new Date(tr.transferredAt).toLocaleDateString('ar-SA')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SparePartsMovementReport() {
    const [fromDate, setFromDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [toDate, setToDate] = useState(() => {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!fromDate || !toDate) return alert('الرجاء اختيار التاريخين');
        setLoading(true);
        try {
            const res = await ApiService.get(`/api/ItemMovementReport/spare-parts?fromDate=${fromDate}T00:00:00&toDate=${toDate}T23:59:59`);
            setData(res);
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء جلب البيانات');
        } finally { setLoading(false); }
    };

    const totals = data?.totals || {};
    const items = data?.items || [];

    return (
        <div className="space-y-5">
            <DateRangeFilter fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} onSearch={fetchData} loading={loading} />

            {data && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'الأصناف', value: totals.totalItems, color: 'border-blue-500', icon: <Package size={18} className="text-blue-500" /> },
                            { label: 'أحداث التحويل', value: totals.totalTransferEvents, color: 'border-teal-500', icon: <ArrowRight size={18} className="text-teal-500" /> },
                            { label: 'أحداث الاستخدام', value: totals.totalUsageEvents, color: 'border-orange-500', icon: <Wrench size={18} className="text-orange-500" /> },
                            { label: 'إجمالي التكلفة', value: `${Number(totals.totalCostOfUsages ?? 0).toFixed(2)} ر.س`, color: 'border-green-500', icon: <DollarSign size={18} className="text-green-500" /> },
                            { label: 'الكمية المحوّلة', value: totals.totalQuantityTransferred, color: 'border-indigo-500', icon: <BarChart2 size={18} className="text-indigo-500" /> },
                            { label: 'الكمية المستخدمة', value: totals.totalQuantityUsed, color: 'border-red-400', icon: <BarChart2 size={18} className="text-red-400" /> },
                        ].map((s, i) => (
                            <div key={i} className={`bg-white rounded-xl p-4 border-r-4 ${s.color} shadow-sm`}>
                                <div className="flex items-center justify-between mb-1">{s.icon}</div>
                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                                <p className="text-lg font-bold text-gray-800">{s.value ?? 0}</p>
                            </div>
                        ))}
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        {items.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Wrench size={40} className="mx-auto mb-3 opacity-40" />
                                <p>لا توجد بيانات لهذه الفترة</p>
                            </div>
                        ) : (
                            items.map((item, i) => <ItemMovementCard key={i} item={item} type="spare" />)
                        )}
                    </div>
                </>
            )}

            {!data && !loading && (
                <div className="text-center py-16 text-gray-400">
                    <Search size={40} className="mx-auto mb-3 opacity-30" />
                    <p>اختر الفترة الزمنية واضغط بحث لعرض تقرير حركة قطع الغيار</p>
                </div>
            )}
        </div>
    );
}

function AccessoriesMovementReport() {
    const [fromDate, setFromDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [toDate, setToDate] = useState(() => {
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!fromDate || !toDate) return alert('الرجاء اختيار التاريخين');
        setLoading(true);
        try {
            const res = await ApiService.get(`/api/ItemMovementReport/accessories?fromDate=${fromDate}T00:00:00&toDate=${toDate}T23:59:59`);
            setData(res);
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء جلب البيانات');
        } finally { setLoading(false); }
    };

    const totals = data?.totals || {};
    const items = data?.items || [];

    return (
        <div className="space-y-5">
            <DateRangeFilter fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} onSearch={fetchData} loading={loading} />

            {data && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'الأصناف', value: totals.totalItems, color: 'border-blue-500', icon: <Package size={18} className="text-blue-500" /> },
                            { label: 'أحداث التحويل', value: totals.totalTransferEvents, color: 'border-teal-500', icon: <ArrowRight size={18} className="text-teal-500" /> },
                            { label: 'أحداث الإصدار', value: totals.totalUsageEvents, color: 'border-purple-500', icon: <Package size={18} className="text-purple-500" /> },
                            { label: 'تكلفة الإصدارات', value: `${Number(totals.totalCostOfIssuances ?? 0).toFixed(2)} ر.س`, color: 'border-green-500', icon: <DollarSign size={18} className="text-green-500" /> },
                            { label: 'الكمية المحوّلة', value: totals.totalQuantityTransferred, color: 'border-indigo-500', icon: <BarChart2 size={18} className="text-indigo-500" /> },
                            { label: 'مرات الإصدار', value: totals.totalTimesIssued, color: 'border-red-400', icon: <BarChart2 size={18} className="text-red-400" /> },
                        ].map((s, i) => (
                            <div key={i} className={`bg-white rounded-xl p-4 border-r-4 ${s.color} shadow-sm`}>
                                <div className="flex items-center justify-between mb-1">{s.icon}</div>
                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                                <p className="text-lg font-bold text-gray-800">{s.value ?? 0}</p>
                            </div>
                        ))}
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        {items.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Package size={40} className="mx-auto mb-3 opacity-40" />
                                <p>لا توجد بيانات لهذه الفترة</p>
                            </div>
                        ) : (
                            items.map((item, i) => <ItemMovementCard key={i} item={item} type="accessory" />)
                        )}
                    </div>
                </>
            )}

            {!data && !loading && (
                <div className="text-center py-16 text-gray-400">
                    <Search size={40} className="mx-auto mb-3 opacity-30" />
                    <p>اختر الفترة الزمنية واضغط بحث لعرض تقرير حركة المعدات</p>
                </div>
            )}
        </div>
    );
}

// ==========================================
// MAIN COMPONENT CONTENT
// ==========================================
function MoneySpendingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('vehiclesRiderCosts');

    // Sync tab state with query parameters
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['vehiclesRiderCosts', 'allHousingsDetails', 'housingCosts', 'sparePartsHistory', 'riderAccessoriesHistory', 'usages'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        // Update browser URL query parameter without full reload
        router.push(`/admin/maintenance/money-spending?tab=${tabId}`);
    };

    const tabs = [
        { id: 'vehiclesRiderCosts', label: 'تكلفة المركبات على السائقين', icon: FileText, color: 'from-blue-500 to-blue-600' },
        { id: 'allHousingsDetails', label: 'تفاصيل السكنات والموقع', icon: Wrench, color: 'from-orange-500 to-orange-600' },
        { id: 'housingCosts', label: 'تكاليف السكن', icon: BadgeDollarSign, color: 'from-emerald-500 to-emerald-600' },
        { id: 'sparePartsHistory', label: 'سجل قطع الغيار', icon: History, color: 'from-violet-500 to-violet-600' },
        { id: 'riderAccessoriesHistory', label: 'سجل معدات السائقين', icon: Package, color: 'from-teal-500 to-teal-600' },
        { id: 'usages', label: 'الاستخدامات', icon: BarChart2, color: 'from-rose-500 to-rose-600' },
    ];

    const activeTabConfig = tabs.find(t => t.id === activeTab);

    return (
        <div className="space-y-6">
            <PageHeader
                title="مركز تكلفة قطع الغيار و معدات السائقين"
                subtitle="عرض وتتبع تفصيلي لجميع تكاليف الصيانة ونفقات قطع الغيار ومعدات السائقين وتوزيعها"
                icon={BadgeDollarSign}
            />

            {/* Tab Segment Selector */}
            <div className="mx-1">
                <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                                    isActive
                                        ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                {tab.label}
                                {isActive && (
                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-60" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Breadcrumb Indicator */}
                <div className="flex items-center gap-1.5 mt-3 px-1">
                    <span className="text-xs text-slate-400">مركز تكلفة قطع الغيار و معدات السائقين</span>
                    <ChevronRight size={12} className="text-slate-300" />
                    <span className="text-xs font-medium text-slate-600">{activeTabConfig?.label}</span>
                </div>
            </div>

            {/* Tab Rendering */}
            <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                {activeTab === 'vehiclesRiderCosts' && <VehiclesRiderCostsTab />}
                {activeTab === 'allHousingsDetails' && <AllHousingsDetailsTab />}
                {activeTab === 'housingCosts' && <HousingCostsTab />}
                {activeTab === 'sparePartsHistory' && <SparePartsHistoryTab />}
                {activeTab === 'riderAccessoriesHistory' && <RiderAccessoriesHistoryTab />}
                {activeTab === 'usages' && <UsagesTab />}
            </div>
        </div>
    );
}

// ==========================================
// EXPORT PAGE COMPONENT WITH SUSPENSE BOUNDARY
// ==========================================
export default function MoneySpendingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <span className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
        }>
            <MoneySpendingContent />
        </Suspense>
    );
}
