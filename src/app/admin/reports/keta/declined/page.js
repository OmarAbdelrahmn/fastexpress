'use client';

import { useState } from 'react';
import { Building, Users, XCircle, TrendingUp, Calendar, BarChart3, FileSpreadsheet, AlertTriangle, AlertCircle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';

export default function KetaDeclinedOrdersReport() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [form, setForm] = useState({
        startDate: '',
        endDate: '',
    });

    const handleExcelExport = () => {
        if (!reportData || !reportData.riderDetails || reportData.riderDetails.length === 0) return;

        const excelData = reportData.riderDetails.map(rider => ({
            ["المعرف"]: rider.workingId,
            ["اسم المندوب (عربي)"]: rider.riderNameAR,
            ["اسم المندوب (انجليزي)"]: rider.riderNameEN,
            ["السكن"]: rider.housingName,
            ["إجمالي الشفتات"]: rider.totalShifts,
            ["إجمالي الطلبات المقبولة"]: rider.totalAcceptedOrders,
            ["إجمالي الطلبات المرفوضة"]: rider.totalStackedDeliveries, // Swapped as requested
            ["نسبة الرفض"]: `${rider.stackedPercentage.toFixed(2)}%`,
            ["أعلى رفص في يوم"]: rider.maxStackedInDay,
            ["تاريخ أعلى رفض"]: rider.maxStackedDate
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تقرير الطلبات المرفوضة");
        XLSX.writeFile(wb, `keta_declined_report_${form.startDate}_${form.endDate}.xlsx`);
    };

    const handleSubmit = async () => {
        if (!form.startDate || !form.endDate) {
            setError("يرجى تحديد تاريخ البداية والنهاية");
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        setReportData(null);

        try {
            const data = await ApiService.get(`/api/Report/company2/stacked-deliveries?startDate=${form.startDate}&endDate=${form.endDate}`);

            if (data) {
                setReportData(data);
                setSuccessMessage("تم تحميل التقرير بنجاح");
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError("لا توجد بيانات");
            }
        } catch (err) {
            console.error('Error:', err);
            setError("حدث خطأ أثناء تحميل التقرير");
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

    const StatCard = ({ icon: Icon, title, value, color, subValue }) => (
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: color }}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
                </div>
                <Icon size={40} style={{ color }} className="opacity-80" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" >
            <PageHeader
                title={t('keta.declinedOrdersReport')}
                subtitle={t('keta.declinedOrdersReportDesc')}
                icon={AlertCircle}
            />

            <div className="m-6">
                {/* Alerts */}
                {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                {/* Filter Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">اختر الفترة</h2>
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
                                        جاري التحميل
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 size={20} />
                                        عرض التقرير
                                    </>
                                )}
                            </button>

                            {reportData && (
                                <button
                                    onClick={handleExcelExport}
                                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                >
                                    <FileSpreadsheet size={20} />
                                    تصدير اكسل
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Display */}
                {reportData && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={XCircle}
                                title={"إجمالي الطلبات المرفوضة"}
                                value={reportData.totalStackedDeliveries}
                                color="#ef4444"
                            />
                            <StatCard
                                icon={TrendingUp}
                                title={"نسبة الرفض العامة"}
                                value={`${reportData.stackedDeliveryRate?.toFixed(2)}%`}
                                color="#f97316"
                            />
                            <StatCard
                                icon={Users}
                                title={"إجمالي المناديب"}
                                value={reportData.totalRiders}
                                color="#3b82f6"
                            />
                            <StatCard
                                icon={AlertTriangle}
                                title={"متوسط الرفض / مندوب"}
                                value={reportData.averageStackedPerRider?.toFixed(1)}
                                color="#8b5cf6"
                            />
                        </div>

                        {/* Riders Table */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="text-blue-600" />
                                    تفاصيل المناديب ({reportData.riderDetails?.length || 0})
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">المعرف</th>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم</th>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">السكن</th>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">عدد الشفتات</th>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الطلبات المقبولة</th>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الطلبات المرفوضة</th>
                                            <th className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">نسبة الرفض</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.riderDetails?.map((rider, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                        {rider.workingId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{rider.riderNameAR || rider.riderNameEN}</div>
                                                        <div className="text-xs text-gray-500">{rider.riderNameEN}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {rider.housingName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                                        {rider.totalShifts}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                    {rider.totalAcceptedOrders}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                                    {rider.totalStackedDeliveries}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${rider.stackedPercentage > 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                                                style={{ width: `${Math.min(rider.stackedPercentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${rider.stackedPercentage > 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {rider.stackedPercentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
