'use client';

import { useState } from 'react';
import { Building, Users, Calendar, BarChart3, FileSpreadsheet, TrendingUp, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import * as XLSX from 'xlsx';

export default function DetailedDailyPerformanceReport() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedHousing, setExpandedHousing] = useState({});
    const [expandedRider, setExpandedRider] = useState({});

    const [form, setForm] = useState({
        startDate: '',
        endDate: '',
    });

    const handleExcelExport = () => {
        if (!reportData) return;

        const excelData = [];

        // Get all unique dates from the first rider to create column headers
        const dates = reportData.housingDetails?.[0]?.riders?.[0]?.dailyEntries?.map(d => d.date) || [];

        reportData.housingDetails?.forEach(housing => {
            housing.riders?.forEach(rider => {
                // Create a map of dates to daily data for easy lookup
                const dailyDataMap = {};
                rider.dailyEntries?.forEach(day => {
                    dailyDataMap[day.date] = day;
                });

                // Single row per rider with daily working hours
                const riderRow = {
                    'المجموعة': housing.housingName,
                    'الاسم (عربي)': rider.riderNameAR,
                    'الاسم (إنجليزي)': rider.riderNameEN,
                    'رقم العمل': rider.workingId
                };

                // Add working hours for each date
                dates.forEach(date => {
                    const dayData = dailyDataMap[date];
                    riderRow[date] = dayData ? (dayData.workingHours?.toFixed(2) || '0') : '0';
                });

                // Add summary metrics after all daily columns
                riderRow['إجمالي الطلبات'] = rider.periodSummary?.totalAcceptedOrders || '0';
                riderRow['تارجيت الطلبات'] = rider.periodSummary?.totalTargetOrders || '0';
                riderRow['فرق الساعات'] = rider.periodSummary?.totalHoursDifference?.toFixed(2) || '0';
                riderRow['إجمالي الساعات'] = rider.periodSummary?.totalWorkingHours?.toFixed(2) || '0';
                riderRow['معدل الساعات'] = rider.periodSummary?.averageHoursPerDay?.toFixed(2) || '0';

                excelData.push(riderRow);
            });

            // Add empty row after each housing group for separation
            excelData.push({});
        });

        // Add company-wide summary
        if (reportData.summary) {
            const summary = reportData.summary;
            excelData.push({
                'المجموعة': '*** الإجمالي العام ***',
                'الاسم (عربي)': `عدد المجموعات: ${summary.totalHousings}`,
                'الاسم (إنجليزي)': `عدد المناديب: ${summary.totalRiders}`,
                'رقم العمل': `أيام العمل: ${summary.totalWorkingDays}`,
                'إجمالي الطلبات': summary.grandTotalOrders || '0',
                'تارجيت الطلبات': summary.grandTotalTargetOrders || '0',
                'فرق الساعات': '',
                'إجمالي الساعات': summary.grandTotalHours?.toFixed(2) || '0',
                'معدل الساعات': ''
            });
        }

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Detailed Daily Performance");
        XLSX.writeFile(wb, `detailed_daily_performance_${form.startDate}_${form.endDate}.xlsx`);
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
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.HOUSING_DETAILED_DAILY_PERFORMANCE, {
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

    const toggleHousing = (housingId) => {
        setExpandedHousing(prev => ({
            ...prev,
            [housingId]: !prev[housingId]
        }));
    };

    const toggleRider = (riderId) => {
        setExpandedRider(prev => ({
            ...prev,
            [riderId]: !prev[riderId]
        }));
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

    const translateShiftStatus = (status) => {
        const translations = {
            'completed': 'مكتمل',
            'incomplete': 'غير مكتمل',
            'failed': 'فشل',
            'no shift': 'لا يوجد شيفت'
        };
        return translations[status?.toLowerCase()] || status;
    };

    const translatePerformanceLevel = (level) => {
        const translations = {
            'excellent': 'ممتاز',
            'good': 'جيد',
            'average': 'متوسط',
            'poor': 'ضعيف'
        };
        return translations[level?.toLowerCase()] || level;
    };

    const getShiftStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'text-green-600';
            case 'incomplete':
                return 'text-yellow-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPerformanceLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'average':
                return 'bg-yellow-100 text-yellow-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
            <PageHeader
                title="التقرير التفصيلي اليومي للأداء"
                subtitle="عرض الأداء اليومي لجميع المناديب في كل مجموعات السكن"
                icon={Calendar}
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
                        {/* Company-wide Summary Stats */}
                        {reportData.summary && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="text-blue-600" />
                                    الإحصائيات العامة
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard
                                        icon={Building}
                                        title="عدد مجموعات السكن"
                                        value={reportData.summary.totalHousings}
                                        color="#3b82f6"
                                    />
                                    <StatCard
                                        icon={Users}
                                        title="إجمالي المناديب"
                                        value={reportData.summary.totalRiders}
                                        color="#10b981"
                                    />
                                    <StatCard
                                        icon={Clock}
                                        title="إجمالي الساعات"
                                        value={reportData.summary.grandTotalHours?.toFixed(1)}
                                        subtitle={`من أصل ${reportData.summary.grandTotalTargetHours} مستهدف`}
                                        color="#f59e0b"
                                    />
                                    <StatCard
                                        icon={Target}
                                        title="إجمالي الطلبات"
                                        value={reportData.summary.grandTotalOrders}
                                        subtitle={`من أصل ${reportData.summary.grandTotalTargetOrders} مستهدف`}
                                        color="#8b5cf6"
                                    />
                                    <StatCard
                                        icon={CheckCircle}
                                        title="أيام العمل"
                                        value={reportData.summary.totalWorkingDays}
                                        color="#06b6d4"
                                    />
                                    <StatCard
                                        icon={XCircle}
                                        title="أيام الغياب"
                                        value={reportData.summary.totalAbsentDays}
                                        color="#ef4444"
                                    />
                                    <StatCard
                                        icon={TrendingUp}
                                        title="معدل الحضور"
                                        value={`${reportData.summary.companyWideAttendanceRate?.toFixed(1)}%`}
                                        color="#14b8a6"
                                    />
                                    <StatCard
                                        icon={BarChart3}
                                        title="معدل إنجاز الطلبات"
                                        value={`${reportData.summary.companyWideOrdersCompletionRate?.toFixed(1)}%`}
                                        color="#ec4899"
                                    />
                                </div>
                            </>
                        )}

                        {/* Period Info */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm">الفترة المحددة</p>
                                    <p className="text-2xl font-bold">{reportData.startDate} إلى {reportData.endDate}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-indigo-100 text-sm">إجمالي الأيام المتوقعة</p>
                                    <p className="text-2xl font-bold">{reportData.totalExpectedDays} يوم</p>
                                </div>
                            </div>
                        </div>

                        {/* Housing Groups Detail */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Building className="text-blue-600" />
                                تفاصيل مجموعات السكن ({reportData.housingDetails?.length || 0})
                            </h2>

                            {reportData.housingDetails?.map((housing, hIndex) => (
                                <div key={hIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    {/* Housing Header */}
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all"
                                        onClick={() => toggleHousing(housing.housingId)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Building className="text-white" size={28} />
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{housing.housingName}</h3>
                                                    <p className="text-blue-100 text-sm">
                                                        {housing.riders?.length || 0} مندوب
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-white text-2xl">{expandedHousing[housing.housingId] ? '▼' : '◀'}</span>
                                        </div>
                                    </div>

                                    {/* Riders List */}
                                    {expandedHousing[housing.housingId] && housing.riders && (
                                        <div className="p-6 space-y-4">
                                            {housing.riders.map((rider, rIndex) => (
                                                <div key={rIndex} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                                    {/* Rider Header */}
                                                    <div
                                                        className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                                        onClick={() => toggleRider(`${housing.housingId}-${rider.riderId}`)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Users className="text-indigo-600" size={20} />
                                                                <div>
                                                                    <p className="font-bold text-gray-800">{rider.riderNameAR}</p>
                                                                    <p className="text-sm text-gray-500">{rider.riderNameEN}</p>
                                                                </div>
                                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-mono font-bold">
                                                                    {rider.workingId}
                                                                </span>
                                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-mono">
                                                                    {rider.iqamaNo}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {rider.periodSummary && (
                                                                    <div className="text-left text-sm">
                                                                        <span className="text-gray-500">إجمالي: </span>
                                                                        <span className="font-bold text-blue-600">{rider.periodSummary.totalAcceptedOrders} طلب</span>
                                                                        <span className="text-gray-500 mx-2">•</span>
                                                                        <span className="font-bold text-orange-600">{rider.periodSummary.totalWorkingHours?.toFixed(1)} ساعة</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-gray-600 text-xl">{expandedRider[`${housing.housingId}-${rider.riderId}`] ? '▲' : '▼'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Daily Entries */}
                                                    {expandedRider[`${housing.housingId}-${rider.riderId}`] && rider.dailyEntries && (
                                                        <div className="p-4">
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                                    <thead className="bg-gray-100">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">التاريخ</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">الحضور</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">ساعات العمل</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">تارجيت ساعات</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">فرق ساعات</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">طلبات مقبولة</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">طلبات مرفوضة</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">تارجيت طلبات</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">فرق طلبات</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">حالة الشيفت</th>
                                                                            <th className="px-3 py-2 text-right font-semibold text-gray-700">مستوى الأداء</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {rider.dailyEntries.map((day, dIndex) => (
                                                                            <tr key={dIndex} className="hover:bg-gray-50">
                                                                                <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-800">{day.date}</td>
                                                                                <td className="px-3 py-2 whitespace-nowrap">
                                                                                    {day.isPresent ? (
                                                                                        <span className="text-green-600 font-bold">✓</span>
                                                                                    ) : (
                                                                                        <span className="text-red-600 font-bold">✗</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-3 py-2 whitespace-nowrap font-semibold text-blue-600">{day.workingHours?.toFixed(2)}</td>
                                                                                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{day.targetHours}</td>
                                                                                <td className="px-3 py-2 whitespace-nowrap">
                                                                                    <span className={`font-bold ${day.hoursDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                        {day.hoursDifference >= 0 ? '+' : ''}{day.hoursDifference?.toFixed(2)}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-3 py-2 whitespace-nowrap font-semibold text-green-600">{day.acceptedOrders}</td>
                                                                                <td className="px-3 py-2 whitespace-nowrap font-semibold text-red-600">{day.rejectedOrders}</td>
                                                                                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{day.targetOrders}</td>
                                                                                <td className="px-3 py-2 whitespace-nowrap">
                                                                                    <span className={`font-bold ${day.ordersDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                        {day.ordersDifference >= 0 ? '+' : ''}{day.ordersDifference}
                                                                                    </span>
                                                                                </td>
                                                                                <td className={`px-3 py-2 whitespace-nowrap font-medium ${getShiftStatusColor(day.shiftStatus)}`}>
                                                                                    {translateShiftStatus(day.shiftStatus)}
                                                                                </td>
                                                                                <td className="px-3 py-2 whitespace-nowrap">
                                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPerformanceLevelColor(day.performanceLevel)}`}>
                                                                                        {translatePerformanceLevel(day.performanceLevel)}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Period Summary for Rider */}
                                                            {rider.periodSummary && (
                                                                <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
                                                                    <h4 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                                                                        <BarChart3 size={20} />
                                                                        ملخص الفترة
                                                                    </h4>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                        <div>
                                                                            <p className="text-gray-600">أيام العمل</p>
                                                                            <p className="text-xl font-bold text-green-600">{rider.periodSummary.totalWorkingDays}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">أيام الغياب</p>
                                                                            <p className="text-xl font-bold text-red-600">{rider.periodSummary.totalAbsentDays}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">إجمالي الساعات</p>
                                                                            <p className="text-xl font-bold text-blue-600">{rider.periodSummary.totalWorkingHours?.toFixed(1)}</p>
                                                                            <p className="text-xs text-gray-500">من {rider.periodSummary.totalTargetHours}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">إجمالي الطلبات</p>
                                                                            <p className="text-xl font-bold text-purple-600">{rider.periodSummary.totalAcceptedOrders}</p>
                                                                            <p className="text-xs text-gray-500">من {rider.periodSummary.totalTargetOrders}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">معدل الحضور</p>
                                                                            <p className="text-xl font-bold text-teal-600">{rider.periodSummary.attendanceRate?.toFixed(1)}%</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">معدل إنجاز الساعات</p>
                                                                            <p className="text-xl font-bold text-orange-600">{rider.periodSummary.hoursCompletionRate?.toFixed(1)}%</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">معدل إنجاز الطلبات</p>
                                                                            <p className="text-xl font-bold text-pink-600">{rider.periodSummary.ordersCompletionRate?.toFixed(1)}%</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">الأداء الإجمالي</p>
                                                                            <p className="text-xl font-bold text-indigo-600">{rider.periodSummary.overallPerformanceScore?.toFixed(1)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
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
