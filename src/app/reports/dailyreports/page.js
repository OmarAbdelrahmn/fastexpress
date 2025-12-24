"use client";

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Printer } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from '@/lib/context/LanguageContext';
import Card from '@/components/Ui/Card';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { ApiService } from '@/lib/api/apiService';

// Import Templates
import SpecialReportTemplate from "@/components/dashboard/SpecialReportTemplate";
import HousingReportTemplate from "@/components/dashboard/HousingReportTemplate";
import HousingDetailedReportTemplate from "@/components/dashboard/HousingDetailedReportTemplate";

export default function DailyReportsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Report 1 State (Monthly/Period Diff)
    const [dateRange1, setDateRange1] = useState({ start: '', end: '' });
    const [reportData1, setReportData1] = useState(null);

    // Report 2 State (Daily Total)
    const [date2, setDate2] = useState('');
    const [reportData2, setReportData2] = useState(null);

    // Report 3 State (Daily Detailed)
    const [date3, setDate3] = useState('');
    const [reportData3, setReportData3] = useState(null);

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const generateReport1 = async () => {
        if (!dateRange1.start || !dateRange1.end) {
            alert(t('common.fillAllFields') || 'Please select both dates');
            return;
        }
        setLoading(true);
        try {
            setReportData2(null);
            setReportData3(null);

            const response = await ApiService.get(`/api/report/special3?period2Start=${dateRange1.start}&period2End=${dateRange1.end}`);
            setReportData1(response || {});
            handlePrint();
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
            setReportData1(null);
            setReportData3(null);

            const response = await ApiService.get(`/api/report/special4?reportDate=${date2}`);
            setReportData2(response || {});
            handlePrint();
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
            setReportData1(null);
            setReportData2(null);

            const response = await ApiService.get(`/api/report/special5?reportDate=${date3}`);
            setReportData3(response || {});
            handlePrint();
        } catch (error) {
            console.error(error);
            alert(t('common.error') || 'Error generating report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 pb-12">
            {reportData1 && <SpecialReportTemplate data={reportData1} />}
            {reportData2 && <HousingReportTemplate data={reportData2} />}
            {reportData3 && <HousingDetailedReportTemplate data={reportData3} />}

            <PageHeader
                title={t('navigation.reports') || "Reports"}
                subtitle={t('navigation.mainReport') || "Daily Reports Management"}
                icon={BarChart3}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

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

                </div>
            </div>

    );
}
