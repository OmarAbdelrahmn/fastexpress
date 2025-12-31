"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import { ArrowRight, BarChart3, Users, Calculator, PieChart, Activity, Calendar } from "lucide-react";

export default function DailySummaryReportPage() {
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
            const url = `${API_ENDPOINTS.MEMBER.REPORTS_DAILY_SUMMARY}?date=${date}`;
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
        router.push(`/member/reports/daily-summary?date=${newDate}`);
    };

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
                            <BarChart3 className="text-purple-600" />
                            التقرير اليومي الملخص
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
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-700 font-medium shadow-sm"
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
                <button
                    onClick={() => { }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-100 text-purple-700 font-medium transition-all"
                >
                    <BarChart3 size={18} />
                    ملخص
                </button>
                <button
                    onClick={() => router.push(`/member/reports/daily-detailed?date=${selectedDate}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-gray-500 hover:bg-gray-50 transition-all font-medium"
                >
                    <Users size={18} />
                    مفصل
                </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4" />
                            <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
                            <div className="h-8 bg-gray-100 rounded w-16" />
                        </div>
                    ))}
                </div>
            )}

            {/* Content */}
            {!loading && !error && reportData && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-xl shadow-sm">
                                <Activity className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{reportData.housingName}</h2>
                                <p className="text-sm text-gray-500">تفاصيل الأداء للمجموعة</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="إجمالي الطلبات"
                            value={reportData.totalOrders}
                            icon={BarChart3}
                            color={{ bg: "bg-blue-50", text: "text-blue-600" }}
                            suffix="طلب"
                        />
                        <StatCard
                            title="المناديب النشطين"
                            value={reportData.activeRiders}
                            icon={Users}
                            color={{ bg: "bg-green-50", text: "text-green-600" }}
                            suffix="مندوب"
                        />
                        <StatCard
                            title="متوسط الطلبات / مندوب"
                            value={reportData.averageOrdersPerRider}
                            icon={Calculator}
                            color={{ bg: "bg-orange-50", text: "text-orange-600" }}
                        />
                        <StatCard
                            title="نسبة الطلبات"
                            value={reportData.percentageOfTotalOrders}
                            icon={PieChart}
                            color={{ bg: "bg-purple-50", text: "text-purple-600" }}
                            suffix="%"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
