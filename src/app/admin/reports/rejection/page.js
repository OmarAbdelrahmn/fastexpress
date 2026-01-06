'use client';

import { useState } from 'react';
import { Building, Users, XCircle, TrendingUp, Calendar, BarChart3, FileDown, Printer, FileSpreadsheet } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HousingRejectionReportPDF from '@/components/HousingRejectionReportPDF';

export default function HousingRejectionReport() {
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
            if (housing.rejectionReport?.riderDetails) {
                housing.rejectionReport.riderDetails.forEach(rider => {
                    excelData.push({
                        'المجموعة': housing.housingName,
                        'رقم العمل': rider.workingId,
                        'الاسم (عربي)': rider.riderNameAR,
                        'الاسم (إنجليزي)': rider.riderNameEN,
                        'الايام': rider.totalShifts,
                        'الطلبات': rider.totalOrders,
                        'التارجت': rider.targetOrders,
                        'الفرق': rider.totalOrders - rider.targetOrders,
                        'الرفض': rider.totalRejections,
                        'معدل الرفض': `${rider.rejectionRate.toFixed(2)}%`,
                        'رفض حقيقي': rider.totalRealRejections,
                        'معدل رفض حقيقي': `${rider.realRejectionRate.toFixed(2)}%`
                    });
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rejection Report");
        XLSX.writeFile(wb, `housing_rejection_report_${form.startDate}_${form.endDate}.xlsx`);
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
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.ALL_HOUSINGS_REJECTION, {
                startDate: form.startDate,
                endDate: form.endDate
            });

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
        let totalShifts = 0;
        let totalOrders = 0;
        let totalRejections = 0;
        let totalRealRejections = 0;

        reportData.forEach(housing => {
            if (housing.rejectionReport && housing.rejectionReport.riderDetails) {
                totalRiders += housing.rejectionReport.riderDetails.length;
                housing.rejectionReport.riderDetails.forEach(rider => {
                    totalShifts += rider.totalShifts || 0;
                    totalOrders += rider.totalOrders || 0;
                    totalRejections += rider.totalRejections || 0;
                    totalRealRejections += rider.totalRealRejections || 0;
                });
            }
        });

        const avgRejectionRate = totalOrders > 0 ? (totalRejections / totalOrders * 100) : 0;
        const avgRealRejectionRate = totalOrders > 0 ? (totalRealRejections / totalOrders * 100) : 0;

        return {
            totalRiders,
            totalShifts,
            totalOrders,
            totalRejections,
            totalRealRejections,
            avgRejectionRate,
            avgRealRejectionRate
        };
    };

    const totals = calculateTotals();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
            <PageHeader
                title="تقرير رفض السكن"
                subtitle="عرض تفاصيل الرفض لجميع مجموعات السكن"
                icon={Building}
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
                                        document={<HousingRejectionReportPDF reportData={reportData} startDate={form.startDate} endDate={form.endDate} />}
                                        fileName={`housing_rejection_report_${form.startDate}_${form.endDate}.pdf`}
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
                                icon={XCircle}
                                title="إجمالي الرفض"
                                value={totals.totalRejections}
                                color="#ef4444"
                            />
                            <StatCard
                                icon={TrendingUp}
                                title="معدل الرفض الحقيقي"
                                value={`${totals.avgRealRejectionRate.toFixed(2)}%`}
                                color="#f59e0b"
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
                                                        {housing.rejectionReport?.startDate} - {housing.rejectionReport?.endDate}
                                                        {' '}({housing.rejectionReport?.totalDays} أيام)
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-white text-2xl">{expandedHousing === index ? '▼' : '◀'}</span>
                                        </div>
                                    </div>

                                    {/* Riders Table */}
                                    {expandedHousing === index && housing.rejectionReport?.riderDetails && housing.rejectionReport.riderDetails.length > 0 && (
                                        <div className="p-6">
                                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Users className="text-purple-600" size={20} />
                                                تفاصيل السائقين ({housing.rejectionReport.riderDetails.length})
                                            </h4>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم السائق</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الايام</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التارجت</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفرق</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرفض</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رفض حقيقي</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الرفض</th>
                                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الرفض الحقيقي</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {housing.rejectionReport.riderDetails.map((rider, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="font-mono font-bold text-gray-700">#{rider.workingId}</span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{rider.riderNameAR}</div>
                                                                        <div className="text-xs text-gray-500">{rider.riderNameEN}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                                                        {rider.totalShifts}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-600">
                                                                    {rider.totalOrders}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-600">
                                                                    {rider.targetOrders}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    {(() => {
                                                                        const difference = rider.totalOrders - rider.targetOrders;
                                                                        const isPositive = difference >= 0;
                                                                        return (
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                                }`}>
                                                                                {isPositive ? '+' : ''}{difference}
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-red-600">
                                                                    {rider.totalRejections}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-orange-600">
                                                                    {rider.totalRealRejections}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.rejectionRate < 10 ? 'bg-green-100 text-green-800' :
                                                                        rider.rejectionRate < 20 ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {rider.rejectionRate.toFixed(2)}%
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.realRejectionRate < 5 ? 'bg-green-100 text-green-800' :
                                                                        rider.realRejectionRate < 10 ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {rider.realRejectionRate.toFixed(2)}%
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
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
