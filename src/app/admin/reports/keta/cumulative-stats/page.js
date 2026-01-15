"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import PageHeader from "@/components/layout/pageheader";
import {
    Calendar,
    Filter,
    Search,
    FileSpreadsheet,
    BarChart3,
    Users,
    Printer
} from "lucide-react";
import KetaCumulativeStatsTemplate from "@/components/dashboard/KetaCumulativeStatsTemplate";
import * as XLSX from "xlsx";

export default function KetaCumulativeStatsPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchReport();
    }, [endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // API call: api/Report/keta/cumulative-stats?endDate=2026-01-12
            const response = await ApiService.get(
                `/api/Report/keta/cumulative-stats?endDate=${endDate}`
            );
            setData(response);
        } catch (error) {
            console.error("Failed to fetch keta cumulative stats report:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStats = data?.riderStats?.filter(rider => {
        const query = searchQuery.toLowerCase();
        return (
            rider.riderNameAR?.toLowerCase().includes(query) ||
            rider.iqamaNo?.toString().includes(query) ||
            rider.workingId?.toString().includes(query) ||
            rider.housingGroup?.toLowerCase().includes(query)
        );
    }) || [];

    const handleExport = () => {
        if (filteredStats.length === 0) return;

        const exportData = filteredStats.map(rider => ({
            "الترتيب": rider.rank,
            "اسم المندوب": rider.riderNameAR,
            "رقم الإقامة": rider.iqamaNo,
            "الرقم الوظيفي": rider.workingId,
            "إجمالي الطلبات": rider.totalOrders,
            "متوسط الطلبات/يوم": rider.averageOrdersPerDay?.toFixed(2),
            "العجز/الفائض": rider.deficitOrSurplus,
            "المجموعة السكنية": rider.housingGroup,
        }));

        const totalOrders = filteredStats.reduce((sum, rider) => sum + (rider.totalOrders || 0), 0);
        const totalDeficitSurplus = filteredStats.reduce((sum, rider) => sum + (rider.deficitOrSurplus || 0), 0);

        // Add summary row
        exportData.push({
            "الترتيب": "المجموع",
            "اسم المندوب": `إجمالي المناديب: ${filteredStats.length}`,
            "رقم الإقامة": "",
            "الرقم الوظيفي": "",
            "إجمالي الطلبات": totalOrders,
            "متوسط الطلبات/يوم": "",
            "العجز/الفائض": totalDeficitSurplus,
            "المجموعة السكنية": "",
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cumulative Stats");
        XLSX.writeFile(workbook, `Keta_Cumulative_Stats_${endDate}.xlsx`);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `keta-cumulative-stats-${endDate}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            <KetaCumulativeStatsTemplate data={{
                periodStart: data?.periodStart,
                periodEnd: data?.periodEnd,
                totalExpectedDays: data?.totalExpectedDays,
                filteredStats
            }} />
            <div className="print:hidden">
                <PageHeader
                    title="إحصائيات كيتا التراكمية"
                    subtitle="تقرير الأداء التراكمي للمناديب حتى تاريخ محدد"
                    icon={BarChart3}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
                    {/* Filters & Controls */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                                <span className="text-sm font-bold text-gray-500 px-2">تاريخ النهاية:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold"
                                />
                            </div>

                            <button
                                onClick={fetchReport}
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                title="تحديث البيانات"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder="بحث..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
                            </div>
                            <button
                                onClick={handleExport}
                                disabled={loading || filteredStats.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">تصدير Excel</span>
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={loading || filteredStats.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">طباعة PDF</span>
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                            <p>جاري تحميل التقرير...</p>
                        </div>
                    )}

                    {!loading && data && (
                        <div className="space-y-6">
                            {/* Period Info */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-6 text-sm text-gray-600">
                                <div>
                                    <span className="font-bold">بداية الفترة:</span> {data.periodStart}
                                </div>
                                <div>
                                    <span className="font-bold">نهاية الفترة:</span> {data.periodEnd}
                                </div>
                                <div>
                                    <span className="font-bold">أيام العمل المتوقعة:</span> {data.totalExpectedDays}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 bg-gray-50/50 p-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">إجمالي المناديب</p>
                                            <h3 className="text-2xl font-bold text-gray-900">{filteredStats.length}</h3>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <Users className="text-blue-600 w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm mb-1">إجمالي الطلبات</p>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                {filteredStats.reduce((sum, rider) => sum + (rider.totalOrders || 0), 0)}
                                            </h3>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <BarChart3 className="text-green-600 w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-gray-600">#</th>
                                                <th className="px-6 py-4 font-bold text-gray-600">المندوب</th>
                                                <th className="px-6 py-4 font-bold text-gray-600">المجموعة السكنية</th>
                                                <th className="px-6 py-4 font-bold text-gray-600">إجمالي الطلبات</th>
                                                <th className="px-6 py-4 font-bold text-gray-600">متوسط / يوم</th>
                                                <th className="px-6 py-4 font-bold text-gray-600">العجز/الفائض</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredStats.map((rider) => (
                                                <tr key={rider.riderId} className="hover:bg-blue-50/50 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500">
                                                        {rider.rank}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{rider.riderNameAR}</span>
                                                            <span className="text-xs text-gray-500 font-mono">
                                                                ID: {rider.workingId} | Iqama: {rider.iqamaNo}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {rider.housingGroup}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        {rider.totalOrders}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-gray-600">
                                                        {rider.averageOrdersPerDay?.toFixed(2)}
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold ${rider.deficitOrSurplus >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        <span className="bg-gray-50 px-2 py-1 rounded">
                                                            {rider.deficitOrSurplus > 0 ? '+' : ''}{rider.deficitOrSurplus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredStats.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">لا توجد بيانات مطابقة للبحث</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!loading && !data && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500">لا توجد بيانات للعرض</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
