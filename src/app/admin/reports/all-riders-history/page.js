"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import PageHeader from "@/components/layout/pageheader";
import { History, Calendar, ChevronDown, ChevronUp, Search, Download, Filter, CheckCircle, XCircle, Package } from "lucide-react";
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
                matchesCompany = workingIdLength === 7;
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
            <div className="bg-white p-4  rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end m-6">
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{"تاريخ البداية"}</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{"تاريخ النهاية"}</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? '...' : <Search size={18} />}
                        {"بحث"}
                    </button>

                    <button
                        onClick={exportToExcel}
                        disabled={filteredData.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Download size={18} />
                        {"تصدير"}
                    </button>
                </div>
            </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-6">
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

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden m-6">
                <div className="overflow-x-auto">
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
            </div>
        </div>
    );
}
