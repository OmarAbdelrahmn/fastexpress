"use client";

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Printer } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from '@/lib/context/LanguageContext';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import dynamic from 'next/dynamic';
import { ApiService } from '@/lib/api/apiService';
import { X } from 'lucide-react';

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <p>Loading PDF...</p> }
);

// PDF Components
import HousingDetailedReportPDF from "@/components/dashboard/HousingDetailedReportPDF";
import SpecialReportPDF from "@/components/dashboard/SpecialReportPDF";
import HousingSummaryReportPDF from "@/components/dashboard/HousingSummaryReportPDF";
import Special7ReportPDF from "@/components/dashboard/Special7ReportPDF";

export default function DailyReportsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Report 1 State (Monthly/Period Diff)
    const [dateRange1, setDateRange1] = useState({ start: '', end: '' });
    const [reportData1, setReportData1] = useState(null);

    // Report 2 State (Daily Total)
    const [date2, setDate2] = useState('');
    const [reportData2, setReportData2] = useState(null);

    // Report 3 State (Daily Detailed)
    const [date3, setDate3] = useState('');
    const [reportData3, setReportData3] = useState(null);

    // Report 4 State (Special 7)
    const [dateRange4, setDateRange4] = useState({ start: '', end: '' });
    const [reportData4, setReportData4] = useState(null);

    const resetReports = () => {
        setReportData1(null);
        setReportData2(null);
        setReportData3(null);
        setReportData4(null);
    };

    const generateReport1 = async () => {
        if (!dateRange1.start || !dateRange1.end) {
            alert(t('common.fillAllFields') || 'Please select both dates');
            return;
        }
        setLoading(true);
        try {
            resetReports();
            const response = await ApiService.get(`/api/report/special3?period2Start=${dateRange1.start}&period2End=${dateRange1.end}`);
            const data = response || {
                companyName: "شركة الخدمة السريعة"
            };
            // Ensure companyName exists if API returns object without it
            if (data && !data.companyName) data.companyName = "شركة الخدمة السريعة";

            setReportData1(data);
            setIsPrinting(true);
        } catch (error) {
            console.error(error);
            alert(t('common.error') || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const generateReport2 = async () => {
        if (!date2) {
            alert(t('common.fillAllFields') || 'Please select a date');
            return;
        }
        setLoading(true);
        try {
            resetReports();
            const response = await ApiService.get(`/api/report/special4?reportDate=${date2}`);
            const data = response || {
                companyName: "شركة الخدمة السريعة"
            };
            if (data && !data.companyName) data.companyName = "شركة الخدمة السريعة";

            setReportData2(data);
            setIsPrinting(true);
        } catch (error) {
            console.error(error);
            alert(t('common.error') || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const generateReport3 = async () => {
        if (!date3) {
            alert(t('common.fillAllFields') || 'Please select a date');
            return;
        }
        setLoading(true);
        try {
            resetReports();
            const response = await ApiService.get(`/api/report/special5?reportDate=${date3}`);
            const data = response || {
                companyName: "شركة الخدمة السريعة"
            };
            if (data && !data.companyName) data.companyName = "شركة الخدمة السريعة";

            setReportData3(data);
            setIsPrinting(true);
        } catch (error) {
            console.error(error);
            alert(t('common.error') || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const generateReport4 = async () => {
        if (!dateRange4.start || !dateRange4.end) {
            alert(t('common.fillAllFields') || 'Please select both dates');
            return;
        }
        setLoading(true);
        try {
            resetReports();
            const response = await ApiService.get(`/api/report/special7?companyId=1&startDate=${dateRange4.start}&endDate=${dateRange4.end}`);
            const data = response || {
                companyName: "شركة الخدمة السريعة"
            };
            if (data && !data.companyName) data.companyName = "شركة الخدمة السريعة";

            setReportData4(data);
            setIsPrinting(true);
        } catch (error) {
            console.error(error);
            alert(t('common.error') || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 pb-12">

            {/* Download Modal */}
            {isPrinting && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full relative">
                        <button
                            onClick={() => setIsPrinting(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Printer size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">تقرير جاهز للتحميل</h3>
                            <p className="text-gray-500">تم تجهيز التقرير بنجاح، يرجى الضغط أدناه للتحميل</p>
                        </div>

                        {reportData3 && (
                            <PDFDownloadLink
                                document={<HousingDetailedReportPDF data={reportData3} />}
                                fileName={`تقرير تفصيلي بتاريخ${reportData3.reportDate}.pdf`}
                                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                                }
                            </PDFDownloadLink>
                        )}

                        {reportData1 && (
                            <PDFDownloadLink
                                document={<SpecialReportPDF data={reportData1} />}
                                fileName={`تقرير الفرق و النسبة حتى${reportData1.period1Start}_${reportData1.period2End}.pdf`}
                                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                                }
                            </PDFDownloadLink>
                        )}

                        {reportData2 && (
                            <PDFDownloadLink
                                document={<HousingSummaryReportPDF data={reportData2} />}
                                fileName={`تقرير اجمالي بتاريخ${reportData2.reportDate}.pdf`}
                                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                                }
                            </PDFDownloadLink>
                        )}

                        {reportData4 && (
                            <PDFDownloadLink
                                document={<Special7ReportPDF data={reportData4} />}
                                fileName={`تقرير مجموعات خلال فترة ${reportData4.startDate} - ${reportData4.endDate}.pdf`}
                                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                                }
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>
            )}

            <PageHeader
                title={t('navigation.reports') || "Reports"}
                subtitle={t('navigation.mainReport') || "Daily Reports Management"}
                icon={BarChart3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-6">

                {/* Report 1 Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-8 h-8 opacity-80" />
                            <h3 className="text-xl font-bold">{t('dashboard.monthlyPerformanceDiff') || "Performance Difference"}</h3>
                        </div>
                        <p className="text-blue-100 text-sm opacity-90">Compare orders between two periods</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <Input
                            type="date"
                            label={t('reports.dashboardPage.fromDate') || "From Date"}
                            value={dateRange1.start}
                            onChange={(e) => setDateRange1(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full"
                        />
                        <Input
                            type="date"
                            label={t('reports.dashboardPage.toDate') || "To Date"}
                            value={dateRange1.end}
                            onChange={(e) => setDateRange1(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full"
                        />

                        <Button
                            variant="primary"
                            onClick={generateReport1}
                            disabled={loading}
                            className="w-full justify-center py-3 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Printer size={18} className="mr-2" />
                                    {t('common.print') || "Print Report"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Report 2 Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-8 h-8 opacity-80" />
                            <h3 className="text-xl font-bold">{t('dashboard.dailyTotalOrders') || "Daily Total Orders"}</h3>
                        </div>
                        <p className="text-orange-100 text-sm opacity-90">Summary of daily housing orders</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <Input
                            type="date"
                            label={t('common.date') || "Select Date"}
                            value={date2}
                            onChange={(e) => setDate2(e.target.value)}
                            className="w-full"
                        />

                        <div className="h-[74px]" /> {/* Spacer to align buttons if needed, or remove */}

                        <Button
                            variant="primary"
                            onClick={generateReport2}
                            disabled={loading}
                            className="w-full justify-center py-3 bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transform transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Printer size={18} className="mr-2" />
                                    {t('common.print') || "Print Report"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Report 3 Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-8 h-8 opacity-80" />
                            <h3 className="text-xl font-bold">{t('dashboard.dailyDetailedOrders') || "Daily Detailed Orders"}</h3>
                        </div>
                        <p className="text-purple-100 text-sm opacity-90">Detailed breakdown of daily orders</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <Input
                            type="date"
                            label={t('common.date') || "Select Date"}
                            value={date3}
                            onChange={(e) => setDate3(e.target.value)}
                            className="w-full"
                        />

                        <div className="h-[74px]" /> {/* Spacer */}

                        <Button
                            variant="primary"
                            onClick={generateReport3}
                            disabled={loading}
                            className="w-full justify-center py-3 bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transform transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Printer size={18} className="mr-2" />
                                    {t('common.print') || "Print Report"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Report 4 Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-8 h-8 opacity-80" />
                            <h3 className="text-xl font-bold">{t('dashboard.periodHousingReport') || "إجمالي المجموعات (فترة)"}</h3>
                        </div>
                        <p className="text-teal-100 text-sm opacity-90">تقرير المجموعات خلال فترة محددة</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <Input
                            type="date"
                            label={t('reports.dashboardPage.fromDate') || "من تاريخ"}
                            value={dateRange4.start}
                            onChange={(e) => setDateRange4(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full"
                        />
                        <Input
                            type="date"
                            label={t('reports.dashboardPage.toDate') || "إلى تاريخ"}
                            value={dateRange4.end}
                            onChange={(e) => setDateRange4(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full"
                        />

                        <Button
                            variant="primary"
                            onClick={generateReport4}
                            disabled={loading}
                            className="w-full justify-center py-3 bg-teal-500 hover:bg-teal-600 shadow-md hover:shadow-lg transform transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Printer size={18} className="mr-2" />
                                    {t('common.print') || "Print Report"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>

    );
}
