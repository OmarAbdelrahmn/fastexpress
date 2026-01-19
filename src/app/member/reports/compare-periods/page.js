"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import { ArrowRight, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Minus, Printer } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ComparePeriodsReportPDF from "@/components/dashboard/ComparePeriodsReportPDF";

export default function ComparePeriodsReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Default to start of month to today
    const today = new Date();
    // Adjust for timezone offset if needed, but local ISO string split is usually sufficient for simple date input
    // To be safe and get "local" YYYY-MM-DD:
    const toLocalISO = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().split('T')[0];
    };

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(searchParams.get('start') || toLocalISO(firstDayOfMonth));
    const [endDate, setEndDate] = useState(searchParams.get('end') || toLocalISO(today));

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial fetch if params exist or just wait for user action? 
    // Let's fetch on mount if dates are present or defaults are set
    useEffect(() => {
        if (startDate && endDate) {
            fetchReport(startDate, endDate);
        }
    }, []); // Only on mount, subsequent fetches triggered by button or valid date changes if we wanted

    const fetchReport = async (start, end) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_ENDPOINTS.MEMBER.REPORTS_COMPARE_PERIODS}?period2Start=${start}&period2End=${end}`;
            const response = await ApiService.get(url);
            setReportData(response);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل التقرير");
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = () => {
        router.push(`/member/reports/compare-periods?start=${startDate}&end=${endDate}`);
        fetchReport(startDate, endDate);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/member/reports"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <ArrowRight size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" />
                                مقارنة الفترات
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                مقارنة الأداء بين فترتين زمنيتين
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4 border-t border-gray-100 pt-6">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={handleCompare}
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'جاري التحليل...' : 'مقارنة'}
                    </button>

                    {reportData && (
                        <PDFDownloadLink
                            document={<ComparePeriodsReportPDF data={reportData} />}
                            fileName={`Comparison_Report_${startDate}_${endDate}.pdf`}
                            className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                        >
                            {({ blob, url, loading, error }) => (
                                <>
                                    <Printer size={18} />
                                    <span>{loading ? '...' : 'طباعة PDF'}</span>
                                </>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Content */}
            {!loading && !error && reportData && (
                <div className="space-y-6">
                    {/* Main Stats Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 text-center bg-gradient-to-b from-blue-50/50 to-white">
                            <h2 className="text-lg font-medium text-gray-600 mb-4">صافي التغيير في الطلبات</h2>
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <span className={`text-5xl font-extrabold tracking-tight ${reportData.ordersDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {reportData.ordersDifference > 0 ? '+' : ''}{reportData.ordersDifference}
                                </span>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${reportData.changePercentage >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {reportData.changePercentage >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {reportData.changePercentage}%
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium">{reportData.trendDescription}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100 bg-gray-50/30">
                            {/* Period 1 */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
                                    <Calendar size={16} />
                                    <span>الفترة السابقة</span>
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-gray-900">{reportData.period1TotalOrders}</span>
                                    <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded">طلبات</span>
                                </div>
                                <div className="text-sm text-gray-500 flex flex-col gap-1 mt-3">
                                    <div className="flex justify-between">
                                        <span>من:</span>
                                        <span className="font-medium text-gray-900">{reportData.period1Start}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>إلى:</span>
                                        <span className="font-medium text-gray-900">{reportData.period1End}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Period 2 */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4 text-blue-600 text-sm font-medium">
                                    <Calendar size={16} />
                                    <span>الفترة الحالية</span>
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-gray-900">{reportData.period2TotalOrders}</span>
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">طلبات</span>
                                </div>
                                <div className="text-sm text-gray-500 flex flex-col gap-1 mt-3">
                                    <div className="flex justify-between">
                                        <span>من:</span>
                                        <span className="font-medium text-gray-900">{reportData.period2Start}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>إلى:</span>
                                        <span className="font-medium text-gray-900">{reportData.period2End}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
