"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import PageHeader from "@/components/layout/pageheader";
import { History, ChevronDown, ChevronUp, Search, Download, Filter, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import StatusBadge from "@/components/Ui/StatusBadge";
import * as XLSX from 'xlsx';

export default function AllRidersHistoryPage() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const [showCompanyFilter, setShowCompanyFilter] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = API_ENDPOINTS.REPORTS.ALL_RIDERS_HISTORY;
            const params = [];
            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);

            if (params.length > 0) {
                url += `?${params.join("&")}`;
            }

            const response = await ApiService.get(url);
            setData(response || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const filteredData = data.filter(rider => {
        // Search filter
        const matchesSearch = rider.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rider.workingId?.toString().includes(searchTerm) ||
            rider.iqamaNo?.toString().includes(searchTerm);

        // Status filter
        const matchesStatus = !statusFilter || rider.status?.toLowerCase() === statusFilter.toLowerCase();

        // Company filter (based on working ID length)
        let matchesCompany = true;
        if (companyFilter) {
            const workingIdLength = rider.workingId?.toString().length || 0;
            if (companyFilter === 'hunger') {
                matchesCompany = workingIdLength <= 7;
            } else if (companyFilter === 'keta') {
                matchesCompany = workingIdLength > 7;
            }
        }

        return matchesSearch && matchesStatus && matchesCompany;
    });

    const getStatusLabel = (status) => {
        const statusKey = status?.toString().toLowerCase().trim();
        const statusMap = {
            'enable': t('status.enable'),
            'disable': t('status.disable'),
            'fleeing': t('status.fleeing'),
            'vacation': t('status.vacation'),
            'accident': t('status.accident'),
            'sick': t('status.sick'),
            'stopped': t('status.stopped'),
        };
        return statusMap[statusKey] || status || '-';
    };

    const exportToExcel = () => {
        const exportData = filteredData.map(rider => ({
            "الاسم": rider.riderName,
            "الرقم الوظيفي": rider.workingId,
            "الإقامة": rider.iqamaNo,
            "السكن": rider.housingName || '-',
            "الحالة": getStatusLabel(rider.status),
            "إجمالي الشهور": rider.totalMonthsWorked,
            "إجمالي الايام": rider.totalShifts,
            "إجمالي الطلبات": rider.totalOrders,
            "متوسط الطلبات": Math.round(rider.averageOrdersPerMonth),
            "أول تاريخ": rider.firstWorkDate,
            "آخر تاريخ": rider.lastWorkDate
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "سجل المناديب");
        XLSX.writeFile(wb, "riders_history.xlsx");
    };

    const exportDetailedToExcel = () => {
        const monthNamesOrder = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // 1. Collect all unique months across all filtered riders to create headers
        const allMonths = new Set();
        filteredData.forEach(rider => {
            rider.activeMonths?.forEach(month => {
                const monthKey = `${month.year}-${month.monthName}`;
                allMonths.add(monthKey);
            });
        });

        // 2. Sort months chronologically
        const sortedMonths = Array.from(allMonths).sort((a, b) => {
            const [yearA, nameA] = a.split('-');
            const [yearB, nameB] = b.split('-');

            if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
            return monthNamesOrder.indexOf(nameA) - monthNamesOrder.indexOf(nameB);
        });

        // 3. Prepare export data
        const exportData = filteredData.map(rider => {
            const row = {
                "الاسم": rider.riderName,
                "الرقم الوظيفي": rider.workingId,
                "الإقامة": rider.iqamaNo,
                "السكن": rider.housingName || '-',
                "إجمالي الطلبات (الفترة)": rider.totalOrders,
            };

            // Initialize all month columns with 0
            sortedMonths.forEach(monthKey => {
                const [year, name] = monthKey.split('-');
                const displayLabel = `${name} ${year}`;
                row[displayLabel] = 0;
            });

            // Fill in actual values
            rider.activeMonths?.forEach(month => {
                const displayLabel = `${month.monthName} ${month.year}`;
                if (row.hasOwnProperty(displayLabel)) {
                    row[displayLabel] = (month.totalAcceptedOrders || 0) + (month.totalRejectedOrders || 0);
                }
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تقرير المناديب الشهري");
        XLSX.writeFile(wb, "riders_monthly_pivot_report.xlsx");
    };

    const stats = filteredData.reduce((acc, rider) => {
        const riderAccepted = rider.activeMonths?.reduce((sum, month) => sum + (month.totalAcceptedOrders || 0), 0) || 0;
        const riderRejected = rider.activeMonths?.reduce((sum, month) => sum + (month.totalRejectedOrders || 0), 0) || 0;

        return {
            accepted: acc.accepted + riderAccepted,
            rejected: acc.rejected + riderRejected
        };
    }, { accepted: 0, rejected: 0 });

    const totalOrders = stats.accepted + stats.rejected;

    return (
        <div >
            <PageHeader
                title={"سجل كل المناديب"}
                subtitle={"عرض تفاصيل الأداء التاريخي لجميع المناديب"}
                icon={History}
            />


            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 m-4 md:m-6">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{"بحث"}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={"بحث بالاسم أو الرقم..."}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{"تاريخ البداية"}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{"تاريخ النهاية"}</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:flex gap-2 w-full">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? '...' : <Search size={18} />}
                        {"بحث"}
                    </button>

                    <button
                        onClick={exportToExcel}
                        disabled={filteredData.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        title="تصدير ملخص"
                    >
                        <Download size={18} />
                        {"تصدير"}
                    </button>

                    <button
                        onClick={exportDetailedToExcel}
                        disabled={filteredData.length === 0}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-50 flex items-center justify-center gap-2"
                        title="تصدير تفصيلي (شهري)"
                    >
                        <Download size={18} />
                        {"تصدير تفصيلي"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-4 md:m-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">الطلبات المقبولة</p>
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? "..." : stats.accepted.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">الطلبات المرفوضة</p>
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? "..." : stats.rejected.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                        <XCircle className="text-red-600" size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-4 md:m-6">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">#</th>
                                <th className="px-6 py-3">الاسم</th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2 justify-start">
                                        <span>المعرف</span>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowCompanyFilter(!showCompanyFilter)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Filter size={14} className={companyFilter ? "text-blue-600" : ""} />
                                            </button>
                                            {showCompanyFilter && (
                                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[150px]">
                                                    <select
                                                        value={companyFilter}
                                                        onChange={(e) => {
                                                            setCompanyFilter(e.target.value);
                                                            setShowCompanyFilter(false);
                                                        }}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:ring-0"
                                                        size={3}
                                                    >
                                                        <option value="">الكل</option>
                                                        <option value="hunger">هنقرستيشن</option>
                                                        <option value="keta">كيتا</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3">السكن</th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-2 justify-start">
                                        <span>الحالة</span>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowStatusFilter(!showStatusFilter)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <Filter size={14} className={statusFilter ? "text-blue-600" : ""} />
                                            </button>
                                            {showStatusFilter && (
                                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[150px]">
                                                    <select
                                                        value={statusFilter}
                                                        onChange={(e) => {
                                                            setStatusFilter(e.target.value);
                                                            setShowStatusFilter(false);
                                                        }}
                                                        className="w-full px-2 py-1 text-xs border-0 focus:ring-0"
                                                        size={8}
                                                    >
                                                        <option value="">الكل</option>
                                                        <option value="enable">نشط</option>
                                                        <option value="disable">غير نشط</option>
                                                        <option value="vacation">إجازة</option>
                                                        <option value="fleeing">هارب</option>
                                                        <option value="sick">مريض</option>
                                                        <option value="accident">حادث</option>
                                                        <option value="stopped">متوقف</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3">إجمالي الشهور</th>
                                <th className="px-6 py-3">إجمالي الورديات</th>
                                <th className="px-6 py-3">إجمالي الطلبات</th>
                                <th className="px-6 py-3">متوسط الطلبات</th>
                                <th className="px-6 py-3">أول تاريخ</th>
                                <th className="px-6 py-3">آخر تاريخ</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((rider, index) => (
                                    <>
                                        <tr
                                            key={rider.workingId}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => toggleRow(rider.workingId)}
                                        >
                                            <td className="px-6 py-4">{index + 1}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{rider.riderName}</td>
                                            <td className="px-6 py-4 font-mono">{rider.workingId}</td>
                                            <td className="px-6 py-4 text-gray-600">{rider.housingName || '-'}</td>
                                            <td className="px-6 py-4">
                                                {rider.status ? <StatusBadge status={rider.status} /> : '-'}
                                            </td>
                                            <td className="px-6 py-4">{rider.totalMonthsWorked}</td>
                                            <td className="px-6 py-4">{rider.totalShifts}</td>
                                            <td className="px-6 py-4 text-blue-600 font-bold">{rider.totalOrders}</td>
                                            <td className="px-6 py-4">{Math.round(rider.averageOrdersPerMonth)}</td>
                                            <td className="px-6 py-4 text-gray-500">{rider.firstWorkDate?.split('T')[0]}</td>
                                            <td className="px-6 py-4 text-gray-500">{rider.lastWorkDate?.split('T')[0]}</td>
                                            <td className="px-6 py-4">
                                                {expandedRows[rider.workingId] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </td>
                                        </tr>

                                        {expandedRows[rider.workingId] && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="12" className="p-4">
                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                        <table className="w-full text-xs text-right">
                                                            <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                                                                <tr>
                                                                    <th className="px-4 py-2">الشهر</th>
                                                                    <th className="px-4 py-2">الايام</th>
                                                                    <th className="px-4 py-2">الطلبــات</th>
                                                                    <th className="px-4 py-2">المقبولة</th>
                                                                    <th className="px-4 py-2">ساعات العمل</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {rider.activeMonths?.map((month, idx) => (
                                                                    <tr key={idx} className="hover:bg-gray-50">
                                                                        <td className="px-4 py-2 font-bold">
                                                                            {month.monthName} {month.year}
                                                                        </td>
                                                                        <td className="px-4 py-2">{month.totalShifts}</td>
                                                                        <td className="px-4 py-2 font-bold">{month.totalAcceptedOrders + month.totalRejectedOrders}</td>
                                                                        <td className="px-4 py-2 text-green-600">{month.totalAcceptedOrders}</td>
                                                                        <td className="px-4 py-2">{month.totalWorkingHours}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {/* Data Loading/Empty States */}
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">لا توجد بيانات</div>
                    ) : (
                        filteredData.map((rider, index) => (
                            <div key={rider.workingId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div
                                    className="p-4 flex flex-col gap-3 cursor-pointer"
                                    onClick={() => toggleRow(rider.workingId)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{rider.riderName}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                                                        {rider.workingId}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {rider.housingName || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {rider.status ? <StatusBadge status={rider.status} /> : '-'}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-2 rounded-lg">
                                        <div>
                                            <span className="text-[10px] text-gray-500 block">إجمالي الطلبات</span>
                                            <span className="text-sm font-bold text-blue-600">{rider.totalOrders}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block">الورديات</span>
                                            <span className="text-sm font-bold text-gray-800">{rider.totalShifts}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block">الشهور</span>
                                            <span className="text-sm font-bold text-gray-800">{rider.totalMonthsWorked}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-1">
                                        {expandedRows[rider.workingId] ? (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <span>إخفاء التفاصيل</span>
                                                <ChevronUp size={16} />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <span>عرض التفاصيل الشهرية</span>
                                                <ChevronDown size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {expandedRows[rider.workingId] && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-3">
                                        <div className="space-y-3">
                                            {rider.activeMonths?.map((month, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-sm text-gray-800">
                                                            {month.monthName} {month.year}
                                                        </span>
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {month.totalShifts} يوم
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">الطلبات</span>
                                                            <span className="font-bold">{month.totalAcceptedOrders + month.totalRejectedOrders}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">المقبولة</span>
                                                            <span className="font-bold text-green-600">{month.totalAcceptedOrders}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">الساعات</span>
                                                            <span>{month.totalWorkingHours}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
