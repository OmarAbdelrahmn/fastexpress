'use client';

import { useState } from 'react';
import { Building, Users, XCircle, TrendingUp, Calendar, BarChart3, Printer, FileSpreadsheet } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HousingRejectionReportPDF from '@/components/dashboard/HousingRejectionReportPDF';

export default function HousingRejectionReport() {
    const { t, language } = useLanguage();
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
                        [t('housingName')]: housing.housingName,
                        [t('workingNumber')]: rider.workingId,
                        [t('employees.name') + ' (AR)']: rider.riderNameAR,
                        [t('employees.name') + ' (EN)']: rider.riderNameEN,
                        [t('days')]: rider.totalShifts,
                        [t('reports.totalOrders')]: rider.totalOrders,
                        [t('target')]: rider.targetOrders,
                        [t('difference')]: rider.totalOrders - rider.targetOrders,
                        [t('totalRejection')]: rider.totalRejections,
                        [t('rejectionRate')]: `${rider.rejectionRate.toFixed(2)}%`,
                        [t('actualRejection')]: rider.totalRealRejections
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
            setError(t('common.periodError')); // Assuming this key exists or fallback
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" >
            <PageHeader
                title={"تقرير رفض الطلبات"}
                subtitle={"تقرير رفض الطلبات"}
                icon={Building}ذ
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البدء</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ الانتهاء</label>
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
                                <>
                                    <button
                                        onClick={handleExcelExport}
                                        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        <FileSpreadsheet size={20} />
                                        تصدير اكسل
                                    </button>

                                    <PDFDownloadLink
                                        document={<HousingRejectionReportPDF reportData={reportData} startDate={form.startDate} endDate={form.endDate} title={t('detailedRejectionReport')} language={language} t={t} />}
                                        fileName={`housing_rejection_report_${form.startDate}_${form.endDate}.pdf`}
                                        className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        {({ blob, url, loading, error }) =>
                                            loading ? t('common.loading') : (
                                                <>
                                                    <Printer size={20} />
                                                    طباعة
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
                                title={"عدد المجموعات"}
                                value={reportData.length}
                                color="#3b82f6"
                            />
                            <StatCard
                                icon={Users}
                                title={"عدد المندوبين"}
                                value={totals.totalRiders}
                                color="#10b981"
                            />
                            <StatCard
                                icon={XCircle}
                                title={"عدد الطلبات المرفوضة"}
                                value={totals.totalRejections}
                                color="#f97316"
                            />
                            <StatCard
                                icon={TrendingUp}
                                title={"الرفض الفعلي"}
                                value={totals.totalRealRejections}
                                color="#ef4444"
                            />
                        </div>

                        {/* Housing Groups */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="text-blue-600" />
                                تقرير الرفض التفصيلي ({reportData.length})
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
                                                        {' '}({housing.rejectionReport?.totalDays} {t('days')})
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-white text-2xl">{expandedHousing === index ? '▼' : (language === 'ar' ? '◀' : '▶')}</span>
                                        </div>
                                    </div>

                                    {/* Riders Table */}
                                    {expandedHousing === index && housing.rejectionReport?.riderDetails && housing.rejectionReport.riderDetails.length > 0 && (
                                        <div className="p-6">
                                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Users className="text-purple-600" size={20} />
                                                تفاصيل المندوبين ({housing.rejectionReport.riderDetails.length})
                                            </h4>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">المعرف</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">المندوب</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">عدد الايام</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">اجمالي الطلبات</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">الهدف</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">الفرق</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">اجمالي الرفض</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">الرفض الفعلي</th>
                                                            <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">نسبة الرفض</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {housing.rejectionReport.riderDetails.map((rider, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                    <span className="font-mono font-bold text-gray-700">{rider.workingId}</span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{rider.riderNameAR || rider.riderNameEN}</div>
                                                                        <div className="text-xs text-gray-500">{rider.riderNameEN || rider.riderNameAR}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                                                        {rider.totalShifts}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-600 text-start">
                                                                    {rider.totalOrders}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-600 text-start">
                                                                    {rider.targetOrders}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-start">
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
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-orange-600 text-start">
                                                                    {rider.totalRejections}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-red-600 text-start">
                                                                    {rider.totalRealRejections}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.rejectionRate < 10 ? 'bg-green-100 text-green-800' :
                                                                        rider.rejectionRate < 20 ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {rider.rejectionRate.toFixed(2)}%
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
        </div >
    );
}
