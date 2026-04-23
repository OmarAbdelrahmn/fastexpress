'use client';

import { useState, useMemo } from 'react';
import { Users, Calendar, BarChart3, FileSpreadsheet, TrendingUp, Clock, Target, CheckCircle, XCircle, Search } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import * as XLSX from 'xlsx';

export default function MemberReportsPage() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedRider, setExpandedRider] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const [form, setForm] = useState(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const fmt = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        return { startDate: fmt(startOfMonth), endDate: fmt(yesterday) };
    });

    const housing = reportData?.housingDetails?.[0];

    const filteredRiders = useMemo(() => {
        if (!housing?.riders) return [];
        if (!searchQuery.trim()) return housing.riders;
        const query = searchQuery.toLowerCase();
        return housing.riders.filter(rider =>
            rider.riderNameAR?.toLowerCase().includes(query) ||
            rider.riderNameEN?.toLowerCase().includes(query) ||
            String(rider.workingId || '').includes(query) ||
            String(rider.iqamaNo || '').includes(query)
        );
    }, [housing, searchQuery]);

    const handleSubmit = async () => {
        if (!form.startDate || !form.endDate) { setError('يرجى تحديد تاريخ البداية والنهاية'); return; }
        setLoading(true); setError(''); setSuccessMessage(''); setReportData(null);
        try {
            const data = await ApiService.get(API_ENDPOINTS.MEMBER.HOUSING_DETAILED_DAILY_PERFORMANCE, {
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
            setError(err.message || 'خطأ في تحميل التقرير');
        } finally {
            setLoading(false);
        }
    };

    const handleExcelExport = () => {
        if (!reportData || !housing) return;
        const excelData = [];
        const dates = housing.riders?.[0]?.dailyEntries?.map(d => d.date) || [];
        housing.riders?.forEach(rider => {
            const dailyDataMap = {};
            rider.dailyEntries?.forEach(day => { dailyDataMap[day.date] = day; });
            const row = {
                'الاسم (عربي)': rider.riderNameAR,
                'الاسم (إنجليزي)': rider.riderNameEN,
                'رقم العمل': rider.workingId
            };
            dates.forEach(date => {
                const d = dailyDataMap[date];
                row[date] = d ? (d.workingHours?.toFixed(2) || '0') : '0';
            });
            row['إجمالي الطلبات'] = rider.periodSummary?.totalAcceptedOrders || '0';
            row['تارجيت الطلبات'] = rider.periodSummary?.totalTargetOrders || '0';
            row['إجمالي الساعات'] = rider.periodSummary?.totalWorkingHours?.toFixed(2) || '0';
            excelData.push(row);
        });
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Performance');
        XLSX.writeFile(wb, `member_daily_performance_${form.startDate}_${form.endDate}.xlsx`);
    };

    const toggleRider = (id) => setExpandedRider(prev => ({ ...prev, [id]: !prev[id] }));

    const translateShiftStatus = (s) => ({ completed: 'مكتمل', incomplete: 'غير مكتمل', failed: 'فشل', 'no shift': 'لا يوجد شيفت' }[s?.toLowerCase()] || s);
    const translatePerformanceLevel = (l) => ({ excellent: 'ممتاز', good: 'جيد', average: 'متوسط', poor: 'ضعيف' }[l?.toLowerCase()] || l);
    const getShiftColor = (s) => ({ completed: 'text-green-600', incomplete: 'text-yellow-600', failed: 'text-red-600' }[s?.toLowerCase()] || 'text-gray-600');
    const getPerfColor = (l) => ({ excellent: 'bg-green-100 text-green-800', good: 'bg-blue-100 text-blue-800', average: 'bg-yellow-100 text-yellow-800', poor: 'bg-red-100 text-red-800' }[l?.toLowerCase()] || 'bg-gray-100 text-gray-800');

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
            <div className="m-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">التقرير التفصيلي اليومي</h1>
                    <p className="text-gray-500 mt-1">عرض الأداء اليومي لجميع المناديب في السكن</p>
                </div>

                {successMessage && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <span className="font-medium">{successMessage}</span>
                        <button onClick={() => setSuccessMessage('')} className="text-xl font-bold hover:opacity-70">&times;</button>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <span className="font-medium">{error}</span>
                        <button onClick={() => setError('')} className="text-xl font-bold hover:opacity-70">&times;</button>
                    </div>
                )}

                {/* Filter Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">اختر الفترة الزمنية</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
                            <input type="date" value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
                            <input type="date" value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-bold transition-all">
                            {loading ? (
                                <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>جاري التحميل...</>
                            ) : (
                                <><BarChart3 size={20} />عرض التقرير</>
                            )}
                        </button>
                        {reportData && (
                            <button onClick={handleExcelExport}
                                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all">
                                <FileSpreadsheet size={20} />تصدير Excel
                            </button>
                        )}
                    </div>
                </div>

                {/* Report */}
                {reportData && (
                    <div className="space-y-6">
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

                        {/* Search */}
                        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-4">
                            <Search className="text-gray-400" size={24} />
                            <input type="text" placeholder="ابحث بالاسم، رقم العمل، أو رقم الإقامة..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 w-full border-none outline-none text-lg text-gray-700 placeholder-gray-400" />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                            )}
                        </div>

                        {/* Riders */}
                        <div className="space-y-4">
                            {filteredRiders.length === 0 ? (
                                <div className="bg-white rounded-xl shadow p-8 text-center">
                                    <p className="text-gray-500 text-lg">لا توجد نتائج مطابقة للبحث</p>
                                </div>
                            ) : (
                                filteredRiders.map((rider, rIndex) => (
                                    <div key={rIndex} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        {/* Rider Header */}
                                        <div className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleRider(rider.riderId)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Users className="text-indigo-600" size={20} />
                                                    <div>
                                                        <p className="font-bold text-gray-800">{rider.riderNameAR}</p>
                                                        <p className="text-sm text-gray-500">{rider.riderNameEN}</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-mono font-bold">{rider.workingId}</span>
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-mono">{rider.iqamaNo}</span>
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
                                                    <span className="text-gray-600 text-xl">{expandedRider[rider.riderId] ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Daily Entries */}
                                        {expandedRider[rider.riderId] && rider.dailyEntries && (
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
                                                                        {day.isPresent ? <span className="text-green-600 font-bold">✓</span> : <span className="text-red-600 font-bold">✗</span>}
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
                                                                    <td className={`px-3 py-2 whitespace-nowrap font-medium ${getShiftColor(day.shiftStatus)}`}>{translateShiftStatus(day.shiftStatus)}</td>
                                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPerfColor(day.performanceLevel)}`}>
                                                                            {translatePerformanceLevel(day.performanceLevel)}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Period Summary */}
                                                {rider.periodSummary && (
                                                    <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
                                                        <h4 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                                                            <BarChart3 size={20} />ملخص الفترة
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div><p className="text-gray-600">أيام العمل</p><p className="text-xl font-bold text-green-600">{rider.periodSummary.totalWorkingDays}</p></div>
                                                            <div><p className="text-gray-600">أيام الغياب</p><p className="text-xl font-bold text-red-600">{rider.periodSummary.totalAbsentDays}</p></div>
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
                                                            <div><p className="text-gray-600">معدل الحضور</p><p className="text-xl font-bold text-teal-600">{rider.periodSummary.attendanceRate?.toFixed(1)}%</p></div>
                                                            <div><p className="text-gray-600">معدل إنجاز الساعات</p><p className="text-xl font-bold text-orange-600">{rider.periodSummary.hoursCompletionRate?.toFixed(1)}%</p></div>
                                                            <div><p className="text-gray-600">معدل إنجاز الطلبات</p><p className="text-xl font-bold text-pink-600">{rider.periodSummary.ordersCompletionRate?.toFixed(1)}%</p></div>
                                                            <div><p className="text-gray-600">الأداء الإجمالي</p><p className="text-xl font-bold text-indigo-600">{rider.periodSummary.overallPerformanceScore?.toFixed(1)}</p></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
