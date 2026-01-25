"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    Users,
    Calculator,
    PieChart,
    Activity,
    Calendar,
    Building2,
    User,
    FileText,
    Download,
    Printer
} from "lucide-react";
import * as XLSX from 'xlsx';
import dynamic from "next/dynamic";
import HousingReportPDF from "@/components/dashboard/HousingReportPDF";
import DailyDetailsReportPDF from "@/components/dashboard/DailyDetailsReportPDF";

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl font-medium text-sm shadow-sm cursor-wait">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">تحميل PDF...</span>
        </button>,
    }
);

export default function DailyReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get params
    const dateParam = searchParams.get('date');
    const viewParam = searchParams.get('view') || 'summary'; // 'summary' or 'detailed'

    // State
    const [selectedDate, setSelectedDate] = useState("");
    const [activeTab, setActiveTab] = useState(viewParam);
    const [filterType, setFilterType] = useState('all');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Date Setup
    useEffect(() => {
        // Default to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const toLocalISO = (date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date - offset).toISOString().split('T')[0];
        };

        const initialDate = dateParam || toLocalISO(yesterday);
        setSelectedDate(initialDate);

        // Update URL if params missing
        if (!dateParam || !searchParams.get('view')) {
            router.replace(`/member/reports/daily?date=${initialDate}&view=${activeTab}`);
        }
    }, []);

    // Fetch Data when Date or Tab changes
    useEffect(() => {
        if (selectedDate) {
            fetchReport(selectedDate, activeTab);
        }
    }, [selectedDate, activeTab]);

    const fetchReport = async (date, view) => {
        setLoading(true);
        setError(null);
        setReportData(null);
        try {
            let url;
            if (view === 'detailed') {
                url = `${API_ENDPOINTS.MEMBER.REPORTS_DAILY_DETAILED}?date=${date}`;
            } else {
                url = `${API_ENDPOINTS.MEMBER.REPORTS_DAILY_SUMMARY}?date=${date}`;
            }

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
        router.push(`/member/reports/daily?date=${newDate}&view=${activeTab}`);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.push(`/member/reports/daily?date=${selectedDate}&view=${tab}`);
    };

    const getFilteredData = () => {
        if (!reportData) return null;

        // If summary view, return data as is (no filtering)
        if (activeTab === 'summary') return reportData;

        let data = { ...reportData };

        if (filterType === 'all') return data;

        // Filter Iteration
        const isHunger = filterType === 'hunger';
        const isKeta = filterType === 'keta';

        const filteredDetails = (data.housingDetails || []).map(housing => {
            const riders = (housing.riders || []).filter(r => {
                const wid = String(r.workingId || '').trim();
                if (isHunger) return wid.length < 10;
                if (isKeta) return wid.length >= 10;
                return true;
            });
            return { ...housing, riders, housingRiderCount: riders.length }; // update count if used
        }).filter(h => h.riders && h.riders.length > 0);

        // Re-calculate Stats
        const totalOrders = filteredDetails.reduce((acc, h) => acc + h.riders.reduce((s, r) => s + (Number(r.acceptedOrders) || 0), 0), 0);
        const activeRiders = filteredDetails.reduce((acc, h) => acc + h.riders.length, 0);
        const avg = activeRiders > 0 ? (totalOrders / activeRiders).toFixed(1) : 0;

        return {
            ...data,
            housingDetails: filteredDetails,
            totalOrders,
            grandTotalOrders: totalOrders,
            activeRiders,
            grandTotalRiders: activeRiders,
            averageOrdersPerRider: avg,
            // Keep percentage as is or recalculate if possible. 
            // Since we don't have total possible orders, we might just keep original or show N/A. 
            // But let's leave it from original data for now.
        };
    };

    const finalReportData = getFilteredData();

    const handleExportExcel = () => {
        if (!finalReportData || !finalReportData.housingDetails) return;

        const data = [];
        finalReportData.housingDetails.forEach(housing => {
            if (housing.riders) {
                housing.riders.forEach(rider => {
                    data.push({
                        'السكن': housing.housingName,
                        'اسم المندوب': rider.riderName,
                        'رقم الجوال': rider.phoneNumber || '-',
                        'المعرف': rider.workingId,
                        'تاريخ المناوبة': rider.shiftDate,
                        'الطلبات المقبولة': rider.acceptedOrders,
                        'الحالة': rider.acceptedOrders < 14 ? 'غير مكتمل' : 'مكتمل'
                    });
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Detailed Report");
        XLSX.writeFile(wb, `Daily_Report_${selectedDate}_${filterType}.xlsx`);
    };

    // --- Components ---

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

    // --- Render Views ---

    const renderSummaryView = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <Activity className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{finalReportData.housingName || "تقرير الأداء"}</h2>
                        <p className="text-sm text-gray-500">ملخص الأداء للمجموعة</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="إجمالي الطلبات"
                    value={finalReportData.totalOrders ?? 0}
                    icon={BarChart3}
                    color={{ bg: "bg-blue-50", text: "text-blue-600" }}
                    suffix="طلب"
                />
                <StatCard
                    title="المناديب النشطين"
                    value={finalReportData.activeRiders ?? 0}
                    icon={Users}
                    color={{ bg: "bg-green-50", text: "text-green-600" }}
                    suffix="مندوب"
                />
                <StatCard
                    title="متوسط الطلبات / مندوب"
                    value={finalReportData.averageOrdersPerRider ?? 0}
                    icon={Calculator}
                    color={{ bg: "bg-orange-50", text: "text-orange-600" }}
                />
                <StatCard
                    title="نسبة الطلبات"
                    value={finalReportData.percentageOfTotalOrders ?? 0}
                    icon={PieChart}
                    color={{ bg: "bg-purple-50", text: "text-purple-600" }}
                    suffix="%"
                />
            </div>
        </div>
    );

    const renderDetailedView = () => (
        <div className="space-y-8 animate-fade-in">
            {finalReportData.housingDetails?.length > 0 ? (
                finalReportData.housingDetails.map((housing) => (
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
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">المعرف</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الجوال</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium font-mono">
                                                {rider.phoneNumber || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {rider.shiftDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rider.acceptedOrders < 14
                                                    ? 'bg-red-100 text-red-800 border-red-200'
                                                    : 'bg-green-100 text-green-800 border-green-200'
                                                    }`}>
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
                        {/*<LayoutDashboard className="text-gray-400" size={32} />*/}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد بيانات وظيفية</h3>
                    <p className="text-gray-500">لا توجد تفاصيل لهذا التاريخ المحدد</p>
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in no-print">
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
                                {activeTab === 'summary' ? <BarChart3 className="text-purple-600" /> : <FileText className="text-blue-600" />}
                                التقرير اليومي {activeTab === 'summary' ? 'الملخص' : 'المفصل'}
                            </h1>
                            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                                <Calendar size={14} />
                                {selectedDate && new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <input
                                id="date-picker"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium text-sm px-2 w-full sm:w-auto"
                            />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">


                            {activeTab === 'summary' && finalReportData && (
                                <PDFDownloadLink
                                    document={<HousingReportPDF data={{ ...finalReportData, date: selectedDate }} />}
                                    fileName={`Daily_Report_Summary_${selectedDate}_${filterType}.pdf`}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm"
                                >
                                    {({ blob, url, loading, error }) => (
                                        <>
                                            <Printer size={18} />
                                            <span className="hidden sm:inline">
                                                {loading ? 'جاري التحضير...' : 'طباعة PDF'}
                                            </span>
                                        </>
                                    )}
                                </PDFDownloadLink>
                            )}

                            {activeTab === 'detailed' && finalReportData?.housingDetails && (
                                <>
                                    <PDFDownloadLink
                                        document={<DailyDetailsReportPDF data={{ ...finalReportData, reportDate: selectedDate, grandTotalOrders: finalReportData?.grandTotalOrders || 0, grandTotalRiders: finalReportData?.grandTotalRiders || 0 }} />}
                                        fileName={`Daily_Details_Report_${selectedDate}_${filterType}.pdf`}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm"
                                    >
                                        {({ blob, url, loading, error }) => (
                                            <>
                                                <Printer size={18} />
                                                <span className="hidden sm:inline">
                                                    {loading ? 'جاري التحضير...' : 'طباعة PDF'}
                                                </span>
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                    <button
                                        onClick={handleExportExcel}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-all font-medium text-sm shadow-sm"
                                        title="تصدير للإكسل"
                                    >
                                        <Download size={18} />
                                        <span className="hidden sm:inline">إكسل</span>
                                    </button>
                                </>
                            )}

                            {activeTab === 'detailed' && (
                                <div className="min-w-[120px]">
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-2.5"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="all">الكل</option>
                                        <option value="hunger">هنقرستيشن</option>
                                        <option value="keta">كيتا</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
                    <button
                        onClick={() => handleTabChange('summary')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'summary' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <BarChart3 size={18} />
                        ملخص
                    </button>
                    <button
                        onClick={() => handleTabChange('detailed')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'detailed' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
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
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className={`w-16 h-16 border-4 border-gray-100 rounded-full animate-spin mb-4 ${activeTab === 'summary' ? 'border-t-purple-600' : 'border-t-blue-600'}`} />
                        <p className="text-gray-500 animate-pulse font-medium">جاري تحميل التقرير...</p>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && finalReportData && (
                    activeTab === 'summary' ? renderSummaryView() : renderDetailedView()
                )}
            </div >
        </>
    );
}
