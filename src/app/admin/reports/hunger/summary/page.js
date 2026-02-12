'use client';

import { useState } from 'react';
import { Target, Building, Users, Calendar, BarChart3, FileSpreadsheet, TrendingUp, AlertTriangle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function HungerSummaryReport() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [form, setForm] = useState(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        return {
            startDate: formatDate(startOfMonth),
            endDate: formatDate(yesterday)
        };
    });

    const handleExcelExport = () => {
        if (!reportData) return;

        const excelData = [];

        // Company Tier Distribution Header
        excelData.push({
            'الفئة': 'توزيع الشركة',
            'العدد': '',
            'النسبة': ''
        });

        // Company Tier Distribution
        if (reportData.companySummary?.tierDistribution) {
            const td = reportData.companySummary.tierDistribution;
            excelData.push({
                'الفئة': 'فوق 400',
                'العدد': td.excellentCount,
                'النسبة': `${Number(td.excellentPercentage).toFixed(2)}%`
            });
            excelData.push({
                'الفئة': '301 - 400',
                'العدد': td.goodCount,
                'النسبة': `${Number(td.goodPercentage).toFixed(2)}%`
            });
            excelData.push({
                'الفئة': '1 - 300',
                'العدد': td.poorCount,
                'النسبة': `${Number(td.poorPercentage).toFixed(2)}%`
            });
            excelData.push({});
        }

        // Housing Distributions
        if (reportData.housingDistributions && reportData.housingDistributions.length > 0) {
            reportData.housingDistributions.forEach((housing) => {
                excelData.push({
                    'الفئة': `${housing.housingName}`,
                    'العدد': '',
                    'النسبة': ''
                });

                if (housing.tierDistribution) {
                    const td = housing.tierDistribution;
                    excelData.push({
                        'الفئة': 'فوق 400',
                        'العدد': td.excellentCount,
                        'النسبة': `${Number(td.excellentPercentage).toFixed(2)}%`
                    });
                    excelData.push({
                        'الفئة': '301 - 400',
                        'العدد': td.goodCount,
                        'النسبة': `${Number(td.goodPercentage).toFixed(2)}%`
                    });
                    excelData.push({
                        'الفئة': '1 - 300',
                        'العدد': td.poorCount,
                        'النسبة': `${Number(td.poorPercentage).toFixed(2)}%`
                    });
                    excelData.push({});
                }
            });
        }

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hunger Summary");
        XLSX.writeFile(wb, `hunger_summary_${form.startDate}_${form.endDate}.xlsx`);
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
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.HUNGER_SUMMARY, {
                startDate: form.startDate,
                endDate: form.endDate
            });

            if (data) {
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

    const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: color }}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <Icon size={40} style={{ color }} className="opacity-80" />
            </div>
        </div>
    );

    const TierCard = ({ title, tierData, color }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building size={20} style={{ color }} />
                {title}
            </h3>
            <div className="space-y-5">
                {/* Excellent Tier */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">فوق 400</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600 text-lg">{tierData.excellentCount}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                {Number(tierData.excellentPercentage).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${tierData.excellentPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Good Tier */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">301 - 400</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600 text-lg">{tierData.goodCount}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                {Number(tierData.goodPercentage).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${tierData.goodPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Poor Tier */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">1 - 300</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600 text-lg">{tierData.poorCount}</span>
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                {Number(tierData.poorPercentage).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${tierData.poorPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {tierData.summary && (
                    <div className="mt-6 pt-4 border-t-2 border-gray-200">
                        <p className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                            {tierData.summary.includes('⚠️') && <AlertTriangle size={16} className="text-orange-500" />}
                            {tierData.summary}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const RidersModal = ({ isOpen, onClose, housingName, riders }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">تفاصيل المناديب</h3>
                            <p className="text-sm text-gray-500 mt-1">{housingName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">اسم المندوب</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">رقم الهوية</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">الرقم الوظيفي</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">إجمالي الطلبات</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">الهدف</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">الفارق</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">المعدل اليومي</th>
                                        <th className="p-4 text-sm font-bold text-gray-600 border-b">الأداء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {riders?.map((rider, index) => (
                                        <tr key={rider.riderId || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-800">{rider.riderNameAR}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{rider.riderNameEN}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 font-mono text-sm">{rider.iqamaNo}</td>
                                            <td className="p-4 text-gray-600 font-mono text-sm">{rider.workingId}</td>
                                            <td className="p-4 font-bold text-gray-800">{rider.totalOrders}</td>
                                            <td className="p-4 text-gray-600">{rider.targetOrders}</td>
                                            <td className={`p-4 font-bold ${rider.ordersDifference >= 0 ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                                                {rider.ordersDifference > 0 ? '+' : ''}{rider.ordersDifference}
                                            </td>
                                            <td className="p-4 text-gray-600">{Number(rider.averageOrdersPerDay).toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                                                    ${rider.tier === 1 ? 'bg-green-100 text-green-700' :
                                                        rider.tier === 2 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'}`}>
                                                    {rider.tierDescription?.split('-')[0] || rider.tierDescription}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const [selectedHousing, setSelectedHousing] = useState(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
            <PageHeader
                title="تقرير ملخص هنقرستيشن - التارجيت"
                subtitle="عرض ملخص الطلبات المستهدفة للشركة والمجموعات"
                icon={Target}
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
                                <button
                                    onClick={handleExcelExport}
                                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                >
                                    <FileSpreadsheet size={20} />
                                    تصدير Excel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Display */}
                {reportData && (
                    <div className="space-y-6">
                        {/* Period Info */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-indigo-100 text-sm">السنة</p>
                                    <p className="text-2xl font-bold">{reportData.year}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">الشهر</p>
                                    <p className="text-2xl font-bold">{reportData.month}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">تاريخ البداية</p>
                                    <p className="text-2xl font-bold">{reportData.startDate}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">التاريخ الحالي</p>
                                    <p className="text-2xl font-bold">{reportData.currentDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Company Summary Stats */}
                        {reportData.companySummary && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" />
                                    ملخص الشركة
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard
                                        icon={Users}
                                        title="إجمالي المناديب"
                                        value={reportData.companySummary.totalRiders}
                                        color="#3b82f6"
                                    />
                                    <StatCard
                                        icon={Target}
                                        title="إجمالي الطلبات"
                                        value={reportData.companySummary.totalOrders}
                                        color="#10b981"
                                    />
                                    <StatCard
                                        icon={Calendar}
                                        title="إجمالي الأيام المتوقعة"
                                        value={reportData.totalExpectedDays}
                                        color="#f59e0b"
                                    />
                                    <StatCard
                                        icon={Target}
                                        title="تارجيت الطلبات حتى التاريخ"
                                        value={reportData.targetOrdersToDate}
                                        subtitle={`اليوم ${reportData.currentDayOfMonth} من الشهر`}
                                        color="#8b5cf6"
                                    />
                                </div>

                                {/* Company Tier Distribution */}
                                {reportData.companySummary.tierDistribution && (
                                    <div className="m-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">توزيع المستويات - الشركة</h3>
                                        <TierCard
                                            title="ملخص الشركة"
                                            tierData={reportData.companySummary.tierDistribution}
                                            color="#3b82f6"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Housing Distributions */}
                        {reportData.housingDistributions && reportData.housingDistributions.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Building className="text-blue-600" />
                                    توزيع المجموعات ({reportData.housingDistributions.length})
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {reportData.housingDistributions.map((housing, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
                                            {/* Housing Header */}
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Building className="text-white" size={24} />
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{housing.housingName}</h3>
                                                        <p className="text-blue-100 text-sm">
                                                            {housing.totalRiders} مندوب • {housing.totalOrders} طلب
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Housing Tier Distribution */}
                                            {housing.tierDistribution && (
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div className="space-y-5">
                                                        {/* Excellent */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-semibold text-gray-700">فوق 400</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-green-600">{housing.tierDistribution.excellentCount}</span>
                                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                                        {Number(housing.tierDistribution.excellentPercentage).toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                                                    style={{ width: `${housing.tierDistribution.excellentPercentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        {/* Good */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-semibold text-gray-700">301 - 400</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-blue-600">{housing.tierDistribution.goodCount}</span>
                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                                        {Number(housing.tierDistribution.goodPercentage).toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                                                    style={{ width: `${housing.tierDistribution.goodPercentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        {/* Poor */}
                                                        <div>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-semibold text-gray-700">1 - 300</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-red-600">{housing.tierDistribution.poorCount}</span>
                                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                                        {Number(housing.tierDistribution.poorPercentage).toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                                                                    style={{ width: `${housing.tierDistribution.poorPercentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        {housing.tierDistribution.summary && (
                                                            <div className="mt-5 pt-4 border-t-2 border-gray-200">
                                                                <p className="text-sm text-gray-700 flex items-start gap-2 font-medium">
                                                                    {housing.tierDistribution.summary.includes('⚠️') && <AlertTriangle size={16} className="text-orange-500 mt-0.5" />}
                                                                    <span>{housing.tierDistribution.summary}</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => setSelectedHousing(housing)}
                                                        className="w-full mt-6 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border border-gray-200 transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        <Users size={16} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                                                        عرض تفاصيل المناديب
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <RidersModal
                    isOpen={!!selectedHousing}
                    onClose={() => setSelectedHousing(null)}
                    housingName={selectedHousing?.housingName}
                    riders={selectedHousing?.riders}
                />
            </div>
        </div>
    );
}

