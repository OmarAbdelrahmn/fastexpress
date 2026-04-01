'use client';

import { useState, useMemo } from 'react';
import { Building, Users, Clock, History, Calendar, BarChart3, Printer, FileSpreadsheet, Search } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from '@/lib/context/LanguageContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HousingPerformanceReportPDF from '@/components/dashboard/HousingPerformanceReportPDF';

import { useHousingPerformance } from '@/hooks/useHousingPerformance';
import { exportHousingPerformanceToExcel } from '@/lib/utils/excelExport';
import StatCard from '@/components/reports/StatCard';
import HousingGroup from '@/components/reports/HousingGroup';

// Local Alert Component extracted from main component body
const LocalAlert = ({ type, message, onClose }) => {
    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
    };

    return (
        <div className={`border-2 rounded-lg p-4 mb-6 flex items-center justify-between ${styles[type]}`}>
            <span className="font-medium">{message}</span>
            {onClose && (
                <button onClick={onClose} className="text-xl font-bold hover:opacity-70">
                    &times;
                </button>
            )}
        </div>
    );
};

export default function HousingPerformanceReport() {
    const { t, language } = useLanguage();

    const {
        form,
        setForm,
        loading,
        reportData,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        selectedCompany,
        setSelectedCompany,
        fetchData
    } = useHousingPerformance(t);

    const [searchQuery, setSearchQuery] = useState("");

    const filteredReportData = useMemo(() => {
        if (!reportData) return null;
        if (!searchQuery.trim()) return reportData;

        const query = searchQuery.toLowerCase().trim();

        return reportData.map(housing => {
            if (!housing.summaryReport?.riderSummaries) return housing;

            const filteredRiders = housing.summaryReport.riderSummaries.filter(rider => {
                return (
                    rider.riderNameAR?.toLowerCase().includes(query) ||
                    rider.riderNameEN?.toLowerCase().includes(query) ||
                    rider.userName?.toLowerCase().includes(query) ||
                    rider.workingId?.toString().includes(query) ||
                    rider.iqamaNo?.toString().includes(query)
                );
            });

            return {
                ...housing,
                summaryReport: {
                    ...housing.summaryReport,
                    riderSummaries: filteredRiders
                }
            };
        }).filter(housing => housing.summaryReport?.riderSummaries?.length > 0);
    }, [reportData, searchQuery]);

    const filteredTotals = useMemo(() => {
        if (!filteredReportData) return null;

        let totalRiders = 0;
        let totalHours = 0;
        let totalOrders = 0;
        let totalMissingDays = 0;

        filteredReportData.forEach(housing => {
            if (housing.summaryReport && housing.summaryReport.riderSummaries) {
                totalRiders += housing.summaryReport.riderSummaries.length;
                housing.summaryReport.riderSummaries.forEach(rider => {
                    totalHours += rider.totalWorkingHours || 0;
                    totalOrders += rider.totalOrders || 0;
                    totalMissingDays += Math.abs(rider.missingDays || 0);
                });
            }
        });

        return {
            totalRiders,
            totalHours,
            totalOrders,
            totalMissingDays
        };
    }, [filteredReportData]);

    const handleExcelExport = () => {
        exportHousingPerformanceToExcel(filteredReportData, form.startDate, form.endDate, selectedCompany);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" >
            <PageHeader
                title={"اداء المناديب"}
                subtitle={"تقرير مفصل عن اداء المناديب"}
                icon={Clock}
            />

            <div className="m-4 md:m-6">
                {/* Alerts */}
                {successMessage && <LocalAlert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
                {error && <LocalAlert type="error" message={error} onClose={() => setError('')} />}

                {/* Filter Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3 self-start md:self-center">
                            <Calendar className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-800">اختر الفترة الزمنية</h2>
                        </div>

                        {/* Company Toggle Switch */}
                        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                            <button
                                onClick={() => setSelectedCompany('hunger')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all duration-300 ${selectedCompany === 'hunger'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Hunger
                            </button>
                            <button
                                onClick={() => setSelectedCompany('keta')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all duration-300 ${selectedCompany === 'keta'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Keta
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{"تاريخ البدء"}</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{"تاريخ الانتهاء"}</label>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="w-full md:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold transition-all"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        {"جاري التحميل"}
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 size={20} />
                                        {"عرض التقرير"}
                                    </>
                                )}
                            </button>

                            {reportData && (
                                <>
                                    <button
                                        onClick={handleExcelExport}
                                        className="w-full md:w-auto bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        <FileSpreadsheet size={20} />
                                        {"تصدير اكسل"}
                                    </button>

                                    <div className="w-full md:w-auto">
                                        <PDFDownloadLink
                                            document={<HousingPerformanceReportPDF reportData={filteredReportData} startDate={form.startDate} endDate={form.endDate} title={t('ridersPerformance')} language={language} t={t} selectedCompany={selectedCompany} />}
                                            fileName={`housing_performance_report_${form.startDate}_${form.endDate}.pdf`}
                                            className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all w-full md:w-auto"
                                        >
                                            {({ blob, url, loading, error }) =>
                                                loading ? t('common.loading') : (
                                                    <>
                                                        <Printer size={20} />
                                                        {"طباعة"}
                                                    </>
                                                )
                                            }
                                        </PDFDownloadLink>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Display */}
                {filteredReportData && filteredTotals && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={Building}
                                title={"اجمالي المجمعات"}
                                value={filteredReportData.length}
                                color="#3b82f6"
                            />
                            <StatCard
                                icon={Users}
                                title={"اجمالي المندوبين"}
                                value={filteredTotals.totalRiders}
                                color="#10b981"
                            />
                            <StatCard
                                icon={Clock}
                                title={"اجمالي الساعات"}
                                value={filteredTotals.totalHours.toFixed(2)}
                                color="#f59e0b"
                            />
                            <StatCard
                                icon={History}
                                title={"ايام الغياب"}
                                value={filteredTotals.totalMissingDays}
                                color="#ef4444"
                            />
                        </div>

                        {/* Housing Groups */}
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Building className="text-blue-600" />
                                    تفاصيل السكن ({filteredReportData.length})
                                </h2>

                                {/* Search Input */}
                                <div className="relative w-full md:w-96">
                                    <input
                                        type="text"
                                        placeholder={"ابحث باسم المندوب او رقم الاقامة او المعرف"}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm"
                                    />
                                    <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-3.5 text-gray-400 w-5 h-5 pointer-events-none`} />
                                </div>
                            </div>

                            {filteredReportData.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-gray-500 text-lg">لا توجد نتائج مطابقة للبحث</p>
                                </div>
                            ) : (
                                filteredReportData.map((housing, index) => (
                                    <HousingGroup
                                        key={index}
                                        housing={housing}
                                        t={t}
                                        language={language}
                                        selectedCompany={selectedCompany}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
