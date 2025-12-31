"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import { ArrowRight, Building2, Calendar, User, FileText, LayoutDashboard } from "lucide-react";

export default function DailyDetailedReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState("");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const dateParam = searchParams.get('date');
        // Default to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const toLocalISO = (date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date - offset).toISOString().split('T')[0];
        };

        const initialDate = dateParam || toLocalISO(yesterday);
        setSelectedDate(initialDate);
        fetchReport(initialDate);
    }, [searchParams]);

    const fetchReport = async (date) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_ENDPOINTS.MEMBER.REPORTS_DAILY_DETAILED}?date=${date}`;
            const response = await ApiService.get(url);
            setReportData(response);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل التقرير");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        fetchReport(newDate);
        router.push(`/member/reports/daily-detailed?date=${newDate}`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Link
                        href="/member/reports"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <ArrowRight size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            التقرير اليومي المفصل
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                            <Calendar size={14} />
                            {selectedDate && new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">التاريخ:</label>
                    <input
                        id="date-picker"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 font-medium shadow-sm"
                    />
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3" role="alert">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 animate-pulse font-medium">جاري تحميل التقرير...</p>
                </div>
            )}

            {/* Content */}
            {!loading && !error && reportData && (
                <div className="space-y-8">
                    {reportData.housingDetails?.length > 0 ? (
                        reportData.housingDetails.map((housing) => (
                            <div key={housing.housingId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transform transition-all hover:shadow-md">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Building2 className="text-blue-600" size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">{housing.housingName}</h2>
                                    </div>
                                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {housing.riders?.length || 0} مناديب
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">اسم المندوب</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم العمل</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ المناوبة</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الطلبات المقبولة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {housing.riders?.map((rider, index) => (
                                                <tr key={`${rider.riderId}-${index}`} className="group hover:bg-blue-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                                        {(index + 1).toString().padStart(2, '0')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                                <User size={14} />
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900">{rider.riderName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium font-mono">
                                                        {rider.workingId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {rider.shiftDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            {rider.acceptedOrders} طلب
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!housing.riders || housing.riders.length === 0) && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                        لا يوجد مناديب في هذا السكن لهذا التاريخ
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LayoutDashboard className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد بيانات</h3>
                            <p className="text-gray-500">لا توجد تفاصيل سكن لهذا التاريخ المحدد</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
