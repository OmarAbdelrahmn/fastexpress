"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import * as XLSX from "xlsx";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RidersSummaryReportPDF from "@/components/dashboard/RidersSummaryReportPDF";
import {
    ArrowRight,
    Search,
    Users,
    Calendar,
    FileText,
    Clock,
    Target,
    Activity,
    AlertCircle,
    Download,
    Printer
} from "lucide-react";

export default function RidersSummaryReportPage() {
    const router = useRouter();

    // State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterType, setFilterType] = useState('all');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial Date Setup (First of current month to today)
    useEffect(() => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);

        const toLocalISO = (date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date - offset).toISOString().split('T')[0];
        };

        setStartDate(toLocalISO(start));
        setEndDate(toLocalISO(end));
    }, []);

    const fetchReport = async () => {
        if (!startDate || !endDate) return;

        setLoading(true);
        setError(null);
        try {
            const url = `${API_ENDPOINTS.MEMBER.REPORTS_RIDERS_SUMMARY}?startDate=${startDate}&endDate=${endDate}`;
            const response = await ApiService.get(url);
            setReportData(response);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل التقرير");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount
    useEffect(() => {
        if (startDate && endDate && !reportData) {
            fetchReport();
        }
    }, [startDate, endDate]);


    const StatCard = ({ title, value, icon: Icon, color, suffix = "", subValue = null }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.bg}`}>
                <Icon className={color.text} size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
            </div>
            {subValue && (
                <div className="text-sm font-medium text-gray-500 mt-2 border-t border-gray-50 pt-2">
                    {subValue}
                </div>
            )}
        </div>
    );

    const getFilteredData = () => {
        if (!reportData) return null;
        if (filterType === 'all') return reportData;

        const isHunger = filterType === 'hunger';
        const isKeta = filterType === 'keta';

        const filteredRiders = (reportData.riderSummaries || []).filter(r => {
            const wid = String(r.workingId || '').trim();
            if (isHunger) return wid.length < 10;
            if (isKeta) return wid.length >= 10;
            return true;
        });

        // Recalculate totals
        const totals = filteredRiders.reduce((acc, r) => ({
            totalRiders: acc.totalRiders + 1,
            totalWorkingDays: acc.totalWorkingDays + (r.actualWorkingDays || 0),
            totalOrders: acc.totalOrders + (r.totalOrders || 0),
            totalTargetOrders: acc.totalTargetOrders + (r.targetOrders || 0),
            ordersDifference: acc.ordersDifference + (r.ordersDifference || 0),
            totalWorkingHours: acc.totalWorkingHours + (r.totalWorkingHours || 0),
            totalTargetHours: acc.totalTargetHours + (r.targetWorkingHours || 0),
            hoursDifference: acc.hoursDifference + (r.hoursDifference || 0),
        }), {
            totalRiders: 0,
            totalWorkingDays: 0,
            totalOrders: 0,
            totalTargetOrders: 0,
            ordersDifference: 0,
            totalWorkingHours: 0,
            totalTargetHours: 0,
            hoursDifference: 0
        });

        return {
            ...reportData,
            totals,
            riderSummaries: filteredRiders
        };
    };

    const finalData = getFilteredData();

    const handleExport = () => {
        if (!finalData?.riderSummaries) return;

        const data = finalData.riderSummaries.map(rider => {
            const missingDays = rider.missingDays ?? rider.MissingDays ?? 0;
            return {
                "المندوب": rider.riderNameAR || rider.riderNameEN,
                "رقم العمل": rider.workingId,
                "أيام العمل": rider.actualWorkingDays,
                "أيام الغياب": missingDays !== 0 ? Math.abs(missingDays) : '-',
                "الساعات": rider.totalWorkingHours?.toFixed(2),
                "هدف الساعات": rider.targetWorkingHours,
                "فرق الساعات": rider.hoursDifference?.toFixed(2),
                "الطلبات": rider.totalOrders,
                "هدف الطلبات": rider.targetOrders,
                "فرق الطلبات": rider.ordersDifference
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 25 }, // Name
            { wch: 15 }, // ID
            { wch: 10 }, // Work Days
            { wch: 10 }, // Missing Days
            { wch: 10 }, // Hours
            { wch: 10 }, // Target Hours
            { wch: 10 }, // Diff Hours
            { wch: 10 }, // Orders
            { wch: 10 }, // Target Orders
            { wch: 10 }  // Diff Orders
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Riders Summary");
        XLSX.utils.book_append_sheet(wb, ws, "Riders Summary");
        XLSX.writeFile(wb, `Riders_Summary_${startDate}_to_${endDate}_${filterType}.xlsx`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in text-right" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Link
                        href="/member/reports"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <ArrowRight size={24} className="rotate-180" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-blue-600" />
                            ملخص أداء المناديب
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            متابعة شاملة لساعات العمل، الطلبات، والأيام
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">من:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">إلى:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'جاري التحميل...' : (
                            <>
                                <span>عرض</span>
                                <Search size={18} />
                            </>
                        )}
                    </button>

                    {/* Filter Select */}
                    <div className="w-16">
                        <select
                            className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 shadow-sm font-medium"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">الكل</option>
                            <option value="hunger">هنقر</option>
                            <option value="keta">كيتا</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={loading || !finalData}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="تصدير Excel"
                    >
                        <Download size={20} />
                        <span className="font-medium">Excel</span>
                    </button>

                    {finalData && (
                        <PDFDownloadLink
                            document={<RidersSummaryReportPDF data={finalData} startDate={startDate} endDate={endDate} />}
                            fileName={`Riders_Summary_${startDate}_to_${endDate}_${filterType}.pdf`}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {({ loading: pdfLoading }) => (
                                <>
                                    <Printer size={20} />
                                    <span className="font-medium">{pdfLoading ? '...PDF' : 'PDF'}</span>
                                </>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Statistics Cards */}
            {finalData?.totals && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="إجمالي المناديب"
                        value={finalData.totals.totalRiders}
                        icon={Users}
                        color={{ bg: "bg-blue-50", text: "text-blue-600" }}
                    />
                    <StatCard
                        title="إجمالي الاداء"
                        value={finalData.totals.totalWorkingDays}
                        icon={Calendar}
                        color={{ bg: "bg-indigo-50", text: "text-indigo-600" }}
                    />
                    <StatCard
                        title="إجمالي الطلبات"
                        value={finalData.totals.totalOrders}
                        subValue={`المستهدف: ${finalData.totals.totalTargetOrders} (الفرق: ${finalData.totals.ordersDifference})`}
                        icon={FileText}
                        color={{ bg: "bg-green-50", text: "text-green-600" }}
                    />
                    <StatCard
                        title="إجمالي الساعات"
                        value={finalData.totals.totalWorkingHours?.toFixed(2)}
                        subValue={`المستهدف: ${finalData.totals.totalTargetHours} (الفرق: ${finalData.totals.hoursDifference?.toFixed(2)})`}
                        icon={Clock}
                        color={{ bg: "bg-orange-50", text: "text-orange-600" }}
                        suffix="ساعة"
                    />
                </div>
            )}

            {/* Details Table */}
            {finalData?.riderSummaries && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">تفاصيل أداء المناديب</h2>
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                            {finalData.riderSummaries.length} سجل
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">المندوب</th>
                                    <th className="px-6 py-3 font-semibold">رقم العمل</th>
                                    <th className="px-6 py-3 font-semibold">أيام العمل</th>
                                    <th className="px-6 py-3 font-semibold text-red-600">أيام الغياب</th>
                                    <th className="px-6 py-3 font-semibold">الساعات</th>
                                    <th className="px-6 py-3 font-semibold text-gray-400">هدف الساعات</th>
                                    <th className="px-6 py-3 font-semibold">فرق الساعات</th>
                                    <th className="px-6 py-3 font-semibold">الطلبات</th>
                                    <th className="px-6 py-3 font-semibold text-gray-400">هدف الطلبات</th>
                                    <th className="px-6 py-3 font-semibold">فرق الطلبات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {finalData.riderSummaries.map((rider) => {
                                    // Handle potential casing mismatches for missingDays
                                    const missingDays = rider.missingDays ?? rider.MissingDays ?? 0;

                                    return (
                                        <tr key={rider.riderId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{rider.riderNameAR}</div>
                                                <div className="text-xs text-gray-500 font-mono">{rider.riderNameEN}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-600">{rider.workingId}</td>

                                            <td className="px-6 py-4 font-medium">{rider.actualWorkingDays}</td>
                                            <td className="px-6 py-4 font-medium text-red-600">{missingDays !== 0 ? Math.abs(missingDays) : '-'}</td>

                                            <td className="px-6 py-4 font-bold text-gray-800">{rider.totalWorkingHours?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-500">{rider.targetWorkingHours}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${rider.hoursDifference >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {rider.hoursDifference?.toFixed(2)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-800">{rider.totalOrders}</td>
                                            <td className="px-6 py-4 text-gray-500">{rider.targetOrders}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${rider.ordersDifference >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {rider.ordersDifference}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                        {finalData.riderSummaries.map((rider, index) => (
                            <div key={rider.riderId} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-full">
                                            <Users size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{rider.riderNameAR}</h3>
                                            <p className="text-xs text-gray-500">{rider.workingId}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                                        {rider.actualWorkingDays || 0} أيام
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-green-50 p-2 rounded-lg text-center">
                                        <span className="block text-xs text-green-600 mb-1">إجمالي الطلبات</span>
                                        <span className="font-bold text-green-700">{rider.totalOrders || 0}</span>
                                    </div>
                                    <div className="bg-purple-50 p-2 rounded-lg text-center">
                                        <span className="block text-xs text-purple-600 mb-1">متوسط الطلبات اليومي</span>
                                        <span className="font-bold text-purple-700">{(rider.totalOrders / rider.actualWorkingDays)?.toFixed(1) || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!finalData.riderSummaries.length && (
                            <div className="text-center py-8 text-gray-500">
                                No rider summary data available.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {loading && !reportData && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 animate-pulse font-medium">جاري تحميل البيانات...</p>
                </div>
            )}
        </div>
    );
}
