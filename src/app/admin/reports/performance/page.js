'use client';

import { useState } from 'react';
import { Building, Users, Clock, History, Calendar, BarChart3, Printer, FileSpreadsheet } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HousingPerformanceReportPDF from '@/components/dashboard/HousingPerformanceReportPDF';

export default function HousingPerformanceReport() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedHousing, setExpandedHousing] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState('hunger'); // 'hunger' or 'keta'

    const [form, setForm] = useState({
        startDate: '',
        endDate: '',
    });

    const handleExcelExport = () => {
        if (!reportData || reportData.length === 0) return;

        const excelData = [];

        reportData.forEach(housing => {
            if (housing.summaryReport?.riderSummaries) {
                housing.summaryReport.riderSummaries.forEach(rider => {
                    const hoursDiff = rider.hoursDifference;

                    // Recalculate target orders and difference based on company
                    const dailyOrderTarget = selectedCompany === 'keta' ? 12 : 14;
                    const recalculatedTargetOrders = (housing.summaryReport?.totalExpectedDays || 0) * dailyOrderTarget;
                    const recalculatedOrdersDiff = rider.totalOrders - recalculatedTargetOrders;

                    excelData.push({
                        [t('housingName')]: housing.housingName,
                        [t('workingNumber')]: rider.workingId,
                        [t('employees.name') + ' (AR)']: rider.riderNameAR,
                        [t('employees.name') + ' (EN)']: rider.riderNameEN,
                        [t('actualWorkingDays')]: rider.actualWorkingDays,
                        [t('absentDays')]: Math.abs(rider.missingDays || 0),
                        [t('totalHours')]: rider.totalWorkingHours?.toFixed(1),
                        [t('targetHours')]: rider.targetWorkingHours,
                        [t('hoursDifference')]: hoursDiff?.toFixed(1),
                        [t('reports.totalOrders')]: rider.totalOrders,
                        [t('targetOrders')]: recalculatedTargetOrders,
                        [t('ordersDifference')]: recalculatedOrdersDiff
                    });
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Performance Report");
        XLSX.writeFile(wb, `housing_performance_report_${form.startDate}_${form.endDate}.xlsx`);
    };

    const handleSubmit = async () => {
        if (!form.startDate || !form.endDate) {
            setError(t('common.periodError'));
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        setReportData(null);

        try {
            // Append "2" to the endpoint if Keta is selected
            const endpoint = selectedCompany === 'keta'
                ? API_ENDPOINTS.REPORTS.ALL_HOUSINGS_SUMMARY + '2'
                : API_ENDPOINTS.REPORTS.ALL_HOUSINGS_SUMMARY;

            const data = await ApiService.get(endpoint, {
                startDate: form.startDate,
                endDate: form.endDate
            });

            // The API might return the array directly or wrapped. Based on previous implementation, assuming array.
            if (data && data.length > 0) {
                setReportData(data);
                setSuccessMessage(t('common.successLoad'));
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(t('common.noData'));
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || t('common.errorLoad'));
        } finally {
            setLoading(false);
        }
    };

    const Alert = ({ type, message, onClose }) => {
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

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: color }}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                </div>
                <Icon size={40} style={{ color }} className="opacity-80" />
            </div>
        </div>
    );

    const calculateTotals = () => {
        if (!reportData) return null;

        let totalRiders = 0;
        let totalHours = 0;
        let totalOrders = 0;
        let totalMissingDays = 0;

        reportData.forEach(housing => {
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
    };

    const totals = calculateTotals();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" >
            <PageHeader
                title={"اداء المندوبين"}
                subtitle={"تقرير مفصل عن اداء المندوبين"}
                icon={Clock}
            />

            <div className="m-6">
                {/* Alerts */}
                {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                {/* Filter Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-800">اختر الفترة الزمنية</h2>
                        </div>

                        {/* Company Toggle Switch */}
                        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setSelectedCompany('hunger')}
                                className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${selectedCompany === 'hunger'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Hunger
                            </button>
                            <button
                                onClick={() => setSelectedCompany('keta')}
                                className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${selectedCompany === 'keta'
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

                        <div className="flex items-center gap-4 pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold transition-all"
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
                                        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        <FileSpreadsheet size={20} />
                                        {"تصدير اكسل"}
                                    </button>

                                    <PDFDownloadLink
                                        document={<HousingPerformanceReportPDF reportData={reportData} startDate={form.startDate} endDate={form.endDate} title={t('ridersPerformance')} language={language} t={t} selectedCompany={selectedCompany} />}
                                        fileName={`housing_performance_report_${form.startDate}_${form.endDate}.pdf`}
                                        className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
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
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Display */}
                {reportData && totals && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={Building}
                                title={"اجمالي المجمعات"}
                                value={reportData.length}
                                color="#3b82f6"
                            />
                            <StatCard
                                icon={Users}
                                title={"اجمالي المندوبين"}
                                value={totals.totalRiders}
                                color="#10b981"
                            />
                            <StatCard
                                icon={Clock}
                                title={"اجمالي الساعات"}
                                value={totals.totalHours.toFixed(1)}
                                color="#f59e0b"
                            />
                            <StatCard
                                icon={History}
                                title={"ايام الغياب"}
                                value={totals.totalMissingDays}
                                color="#ef4444"
                            />
                        </div>

                        {/* Housing Groups */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="text-blue-600" />
                                تفاصيل السكن ({reportData.length})
                            </h2>

                            {reportData.map((housing, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    {/* Housing Header */}
                                    <div
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all"
                                        onClick={() => setExpandedHousing(expandedHousing === index ? null : index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Building className="text-white" size={28} />
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{housing.housingName}</h3>
                                                    <p className="text-indigo-100 text-sm">
                                                        {housing.summaryReport?.startDate} - {housing.summaryReport?.endDate}
                                                        {' '}({housing.summaryReport?.totalExpectedDays} {"ايام العمل"})
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-white text-2xl">{expandedHousing === index ? '▼' : (language === 'ar' ? '◀' : '▶')}</span>
                                        </div>
                                    </div>

                                    {/* Riders Table */}
                                    {expandedHousing === index && housing.summaryReport?.riderSummaries && housing.summaryReport.riderSummaries.length > 0 && (
                                        <div className="p-6">
                                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Users className="text-purple-600" size={20} />
                                                {t('riderDetails')} ({housing.summaryReport.riderSummaries.length})
                                            </h4>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"المعرف"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"اسم المندوب"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"ايام العمل"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-red-500 uppercase">{"ايام الغياب"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"ساعات العمل"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"ساعات العمل المستهدفة"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"فرق الساعات"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"اجمالي الطلبات"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"الطلبات المستهدفة"}</th>
                                                            <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">{"فرق الطلبات"}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {housing.summaryReport.riderSummaries.map((rider, idx) => {
                                                            const hoursDiff = rider.hoursDifference;
                                                            const hoursPositive = hoursDiff >= 0;

                                                            // Recalculate target orders and difference based on company
                                                            const dailyOrderTarget = selectedCompany === 'keta' ? 12 : 14;
                                                            const recalculatedTargetOrders = (housing.summaryReport?.totalExpectedDays || 0) * dailyOrderTarget;
                                                            const recalculatedOrdersDiff = rider.totalOrders - recalculatedTargetOrders;
                                                            const ordersPositive = recalculatedOrdersDiff >= 0;

                                                            const missingDays = Math.abs(rider.missingDays || 0);

                                                            return (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-gray-700 text-start">
                                                                        {rider.workingId}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{rider.riderNameAR}</div>
                                                                            <div className="text-xs text-gray-500">{rider.riderNameEN}</div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                                                            {rider.actualWorkingDays}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap font-bold text-red-600 text-start">
                                                                        {missingDays > 0 ? missingDays : '-'}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-700 text-start">
                                                                        {rider.totalWorkingHours?.toFixed(1)}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-start">
                                                                        {rider.targetWorkingHours}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${hoursPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {hoursPositive ? '+' : ''}{hoursDiff?.toFixed(1)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-600 text-start">
                                                                        {rider.totalOrders}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-start">
                                                                        {rider.targetOrders}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ordersPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {ordersPositive ? '+' : ''}{recalculatedOrdersDiff}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
