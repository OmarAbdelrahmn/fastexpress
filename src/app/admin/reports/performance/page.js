'use client';

import { useState } from 'react';
import { Building, Users, Clock, History, Calendar, BarChart3, Printer, FileSpreadsheet } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HousingPerformanceReportPDF from '@/components/HousingPerformanceReportPDF';

export default function HousingPerformanceReport() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedHousing, setExpandedHousing] = useState(null);

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
                    const ordersDiff = rider.ordersDifference;

                    excelData.push({
                        'المجموعة': housing.housingName,
                        'رقم العمل': rider.workingId,
                        'الاسم (عربي)': rider.riderNameAR,
                        'الاسم (إنجليزي)': rider.riderNameEN,
                        'ايام العمل الفعلية': rider.actualWorkingDays,
                        'ايام الغياب': Math.abs(rider.missingDays || 0),
                        'اجمالي الساعات': rider.totalWorkingHours?.toFixed(1),
                        'تارجيت الساعات': rider.targetWorkingHours,
                        'فرق الساعات': hoursDiff?.toFixed(1),
                        'اجمالي الطلبات': rider.totalOrders,
                        'تارجيت الطلبات': rider.targetOrders,
                        'فرق الطلبات': ordersDiff
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
            setError('يرجى تحديد تاريخ البداية والنهاية');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        setReportData(null);

        try {
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.ALL_HOUSINGS_SUMMARY, {
                startDate: form.startDate,
                endDate: form.endDate
            });

            // The API might return the array directly or wrapped. Based on previous implementation, assuming array.
            if (data && data.length > 0) {
                setReportData(data);
                setSuccessMessage('تم تحميل التقرير بنجاح');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError('لا توجد بيانات للفترة المحددة');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'خطأ في تحميل التقرير');
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
            <PageHeader
                title="تقرير أداء المناديب"
                subtitle="عرض تفاصيل الأداء لجميع مجموعات السكن"
                icon={Clock}
            />

            <div className="m-6">
                {/* Alerts */}
                {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                {/* Filter Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">اختر الفترة الزمنية</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
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
                                        جاري التحميل...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 size={20} />
                                        عرض التقرير
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
                                        تصدير Excel
                                    </button>

                                    <PDFDownloadLink
                                        document={<HousingPerformanceReportPDF reportData={reportData} startDate={form.startDate} endDate={form.endDate} />}
                                        fileName={`housing_performance_report_${form.startDate}_${form.endDate}.pdf`}
                                        className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        {({ blob, url, loading, error }) =>
                                            loading ? 'جاري التحضير...' : (
                                                <>
                                                    <Printer size={20} />
                                                    طباعة PDF
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
                                title="عدد مجموعات السكن"
                                value={reportData.length}
                                color="#3b82f6"
                            />
                            <StatCard
                                icon={Users}
                                title="إجمالي السائقين"
                                value={totals.totalRiders}
                                color="#10b981"
                            />
                            <StatCard
                                icon={Clock}
                                title="إجمالي الساعات"
                                value={totals.totalHours.toFixed(1)}
                                color="#f59e0b"
                            />
                            <StatCard
                                icon={History}
                                title="إجمالي أيام الغياب"
                                value={totals.totalMissingDays}
                                color="#ef4444"
                            />
                        </div>

                        {/* Housing Groups */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="text-blue-600" />
                                تفاصيل مجموعات السكن ({reportData.length})
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
                                                        {' '}({housing.summaryReport?.totalExpectedDays} ايام متوقعة)
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-white text-2xl">{expandedHousing === index ? '▼' : '◀'}</span>
                                        </div>
                                    </div>

                                    {/* Riders Table */}
                                    {expandedHousing === index && housing.summaryReport?.riderSummaries && housing.summaryReport.riderSummaries.length > 0 && (
                                        <div className="p-6">
                                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Users className="text-purple-600" size={20} />
                                                تفاصيل السائقين ({housing.summaryReport.riderSummaries.length})
                                            </h4>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">رقم العمل</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">السائق</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">الايام</th>
                                                            <th className="px-4 py-3 text-right font-medium text-red-500 uppercase">الغياب</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">الساعات</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">تارجيت ساعات</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">فرق ساعات</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">الطلبات</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">تارجيت طلبات</th>
                                                            <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">فرق طلبات</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {housing.summaryReport.riderSummaries.map((rider, idx) => {
                                                            const hoursDiff = rider.hoursDifference;
                                                            const hoursPositive = hoursDiff >= 0;
                                                            const ordersDiff = rider.ordersDifference;
                                                            const ordersPositive = ordersDiff >= 0;
                                                            const missingDays = Math.abs(rider.missingDays || 0);

                                                            return (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-gray-700">
                                                                        #{rider.workingId}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{rider.riderNameAR}</div>
                                                                            <div className="text-xs text-gray-500">{rider.riderNameEN}</div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                                                            {rider.actualWorkingDays}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap font-bold text-red-600">
                                                                        {missingDays > 0 ? missingDays : '-'}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-700">
                                                                        {rider.totalWorkingHours?.toFixed(1)}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                                                        {rider.targetWorkingHours}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${hoursPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {hoursPositive ? '+' : ''}{hoursDiff?.toFixed(1)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-600">
                                                                        {rider.totalOrders}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                                                        {rider.targetOrders}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${ordersPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {ordersPositive ? '+' : ''}{ordersDiff}
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
