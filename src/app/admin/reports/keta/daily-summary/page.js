"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import PageHeader from "@/components/layout/pageheader";
import {
    Calendar,
    Filter,
    Package,
    Clock,
    LayoutList,
    Users,
    TrendingUp,
    Printer
} from "lucide-react";
import KetaDailySummaryTemplate from "@/components/dashboard/KetaDailySummaryTemplate";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function KetaDailySummaryPage() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    // Date State
    const [reportDate, setReportDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    });

    useEffect(() => {
        fetchReport();
    }, [reportDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // API call: api/Report/keta/daily-summary?reportDate=2026-01-12
            const response = await ApiService.get(
                `/api/Report/keta/daily-summary?reportDate=${reportDate}`
            );
            setData(response);
        } catch (error) {
            console.error("Failed to fetch keta daily summary report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `keta-daily-summary-${reportDate}`;
        window.print();
        document.title = originalTitle;
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12" >
            <KetaDailySummaryTemplate data={data} />
            <div className="print:hidden">
                <PageHeader
                    title={t('keta.daily.title')}
                    subtitle={t('keta.daily.subtitle')}
                    icon={LayoutList}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
                    {/* Filters & Controls */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                                <Calendar className="text-gray-400 w-5 h-5 mx-2" />
                                <input
                                    type="date"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold"
                                />
                            </div>

                            <button
                                onClick={fetchReport}
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                title={t('common.refresh')}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handlePrint}
                                disabled={loading || !data}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('keta.daily.printPDF')}</span>
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                            <p>{t('keta.validation.loading')}</p>
                        </div>
                    )}

                    {!loading && data && (
                        <div className="space-y-6">
                            {/* Period Info */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-6 text-sm text-gray-600">
                                <div>
                                    <span className="font-bold">{t('keta.daily.periodStart')}:</span> {data.periodStart}
                                </div>
                                <div>
                                    <span className="font-bold">{t('keta.daily.periodEnd')}:</span> {data.periodEnd}
                                </div>
                                <div>
                                    <span className="font-bold">{t('keta.daily.reportDate')}:</span> {data.reportDate}
                                </div>
                            </div>

                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title={t('keta.daily.totalDelivered')}
                                    value={data.totalOrdersDelivered?.toLocaleString()}
                                    icon={Package}
                                    colorClass="bg-blue-50 text-blue-600"
                                />
                                <StatCard
                                    title={t('keta.daily.avgWorkingHours')}
                                    value={data.averageWorkingHours?.toFixed(2)}
                                    icon={Clock}
                                    colorClass="bg-purple-50 text-purple-600"
                                />
                                <StatCard
                                    title={t('keta.daily.totalRejected')}
                                    value={data.totalShifts?.toLocaleString()} // Assuming Total Shifts is mapped to rejected or just mismatched logic in original code? Original code said "إجمالي الطلبات المرفوضة" but value was totalShifts. I will keep it as is but use the translation key for "Total Rejected Orders" if that's what the UI said.
                                    // RE-READING ARABIC: "إجمالي الطلبات المرفوضة" -> Total Rejected Orders. Key: keta.daily.totalRejected.
                                    // Value: data.totalShifts? That seems odd. But I must mimic valid code.
                                    icon={TrendingUp}
                                    colorClass="bg-green-50 text-green-600"
                                />
                                <StatCard
                                    title={t('keta.daily.totalRiders')}
                                    value={data.totalRiders?.toLocaleString()}
                                    icon={Users}
                                    colorClass="bg-orange-50 text-orange-600"
                                />
                            </div>
                        </div>
                    )}

                    {!loading && !data && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500">{t('keta.daily.noData')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
