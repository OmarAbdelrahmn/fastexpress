"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
    ArrowRight,
    Search,
    AlertCircle,
    Users,
    Calendar,
    FileText,
    TrendingDown,
    Target,
    Percent,
    Download,
    Printer
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RejectionReportPDF from "@/components/dashboard/RejectionReportPDF";

export default function RejectionReportPage() {
    const router = useRouter();

    // State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial Date Setup (Last 7 days as default)
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
            const url = `${API_ENDPOINTS.MEMBER.REPORTS_REJECTION}?startDate=${startDate}&endDate=${endDate}`;
            const response = await ApiService.get(url);
            setReportData(response);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل التقرير");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount once dates are set (optional, maybe better to wait for click)
    // stick to button click for explicit action or fetch when dates change if desired.
    // Let's fetch when dates are initialized if we want, but better let user click or fetch strictly on useEffect of dates if we want live updates.
    // Given the request implies specific dates, let's just fetch when the user clicks or if we have initial dates. 
    // I'll add a useEffect to fetch initially when dates are ready.
    useEffect(() => {
        if (startDate && endDate && !reportData) {
            fetchReport();
        }
    }, [startDate, endDate]);


    const StatCard = ({ title, value, icon: Icon, color, suffix = "" }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.bg}`}>
                <Icon className={color.text} size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
            </div>
        </div>
    );

    const handleExport = () => {
        if (!reportData?.riderDetails) return;

        const data = reportData.riderDetails.map(rider => ({
            "المندوب": rider.riderNameAR || rider.riderNameEN,
            "المعرف": rider.workingId,
            "الأيام": rider.totalShifts,
            "عدد الطلبات": rider.totalOrders,
            "التارجيت": rider.targetOrders,
            "الرفض": rider.totalRejections,
            "نسبة الرفض": `${rider.rejectionRate}%`,
            "رفض حقيقي": rider.totalRealRejections,
            "نسبة (ح)": `${rider.realRejectionRate}%`
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 25 }, // Name
            { wch: 15 }, // ID
            { wch: 10 }, // Days
            { wch: 15 }, // Orders
            { wch: 10 }, // Target
            { wch: 10 }, // Rejection
            { wch: 15 }, // Rejection Rate
            { wch: 15 }, // Real Rejection
            { wch: 15 }  // Real Rate
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Rejection Report");
        XLSX.writeFile(wb, `Rejection_Report_${startDate}_to_${endDate}.xlsx`);
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
                        <ArrowRight size={24} className="rotate-180" /> {/* RTL fix if needed, but ArrowRight usually points right. in RTL, back is Right? No, Back is Left usually. Wait. Lucide ArrowRight points ->. In RTL, back button should point ->? No, usually <-.
                        Wait, typically back button is <. In LTR that's ArrowLeft. In RTL it's ArrowRight.
                        Let's check other files. The daily page uses <Link href="/member/reports"><ArrowRight/></Link>.
                        */}
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="text-red-600" />
                            تقرير الطلبات المرفوضة
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            متابعة حالات الرفض ونسب الأداء
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
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">إلى:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'جاري التحميل...' : (
                            <>
                                <span>عرض</span>
                                <Search size={18} />
                            </>
                        )}
                    </button>
                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={loading || !reportData}
                        className="flex items-center gap-2 p-2 px-4 border border-gray-200 rounded-xl hover:bg-green-50 text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        title="تصدير Excel"
                    >
                        <span>Excel</span>
                        <Download size={20} />
                    </button>

                    {/* PDF Button */}
                    {reportData && (
                        <PDFDownloadLink
                            document={<RejectionReportPDF data={reportData} startDate={startDate} endDate={endDate} />}
                            fileName={`Rejection_Report_${startDate}_${endDate}.pdf`}
                            className="flex items-center gap-2 p-2 px-4 border border-gray-200 rounded-xl hover:bg-red-50 text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                            {({ blob, url, loading, error }) => (
                                <>
                                    <span>PDF</span>
                                    <Printer size={20} />
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
            {reportData?.totals && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="إجمالي المناديب"
                        value={reportData.totals.totalRiders}
                        icon={Users}
                        color={{ bg: "bg-blue-50", text: "text-blue-600" }}
                    />
                    <StatCard
                        title="إجمالي الطلبات"
                        value={reportData.totals.totalOrders}
                        icon={FileText}
                        color={{ bg: "bg-green-50", text: "text-green-600" }}
                    />
                    <StatCard
                        title="التاجت"
                        value={reportData.totals.totalTargetOrders}
                        icon={Target}
                        color={{ bg: "bg-purple-50", text: "text-purple-600" }}
                    />
                    <StatCard
                        title="الفرق"
                        value={reportData.totals.totalOrders - reportData.totals.totalTargetOrders}
                        icon={AlertCircle}
                        color={{ bg: "bg-purple-50", text: "text-purple-600" }}
                    />
                    <StatCard
                        title="إجمالي الرفض"
                        value={reportData.totals.totalRejections}
                        icon={TrendingDown}
                        color={{ bg: "bg-red-50", text: "text-red-600" }}
                    />
                    <StatCard
                        title="نسبة الرفض"
                        value={reportData.totals.overallRejectionRate}
                        icon={Percent}
                        color={{ bg: "bg-orange-50", text: "text-orange-600" }}
                        suffix="%"
                    />
                    <StatCard
                        title="الرفض الحقيقي"
                        value={reportData.totals.totalRealRejections}
                        icon={AlertCircle}
                        color={{ bg: "bg-red-100", text: "text-red-700" }}
                    />
                    <StatCard
                        title="نسبة الرفض الحقيقي"
                        value={reportData.totals.overallRealRejectionRate}
                        icon={Percent}
                        color={{ bg: "bg-orange-100", text: "text-orange-700" }}
                        suffix="%"
                    />

                </div>
            )}

            {/* Details Table */}
            {reportData?.riderDetails && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">تفاصيل المناديب</h2>
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                            {reportData.riderDetails.length} سجل
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">المندوب</th>
                                    <th className="px-6 py-3 font-semibold">المعرف</th>
                                    <th className="px-6 py-3 font-semibold">الأيام</th>
                                    <th className="px-6 py-3 font-semibold">عدد الطلبات</th>
                                    <th className="px-6 py-3 font-semibold">التارجيت</th>
                                    <th className="px-6 py-3 font-semibold text-orange-600">الرفض</th>
                                    <th className="px-6 py-3 font-semibold text-orange-600">نسبة الرفض</th>
                                    <th className="px-6 py-3 font-semibold text-red-700">رفض حقيقي</th>
                                    <th className="px-6 py-3 font-semibold text-red-700">نسبة (ح)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {reportData.riderDetails.map((rider) => (
                                    <tr key={rider.riderId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{rider.riderNameAR}</div>
                                            <div className="text-xs text-gray-500 font-mono">{rider.riderNameEN}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">{rider.workingId}</td>
                                        <td className="px-6 py-4">{rider.totalShifts}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{rider.totalOrders}</td>
                                        <td className="px-6 py-4 text-gray-600">{rider.targetOrders}</td>
                                        <td className="px-6 py-4 text-red-600 font-medium">{rider.totalRejections}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${rider.rejectionRate > 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {rider.rejectionRate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-red-700 font-medium">{rider.totalRealRejections}</td>
                                        <td className="px-6 py-4 font-mono">{rider.realRejectionRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {loading && !reportData && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 animate-pulse font-medium">جاري تحميل البيانات...</p>
                </div>
            )}
        </div>
    );
}
