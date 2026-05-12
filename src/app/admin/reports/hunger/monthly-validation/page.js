'use client';

import { useState } from 'react';
import { Target, Users, Calendar, BarChart3, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import ExcelJS from 'exceljs';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function HungerMonthlyValidationReport() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [form, setForm] = useState(() => {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth() + 1
        };
    });

    const handleExcelExport = async () => {
        if (!reportData || !reportData.riderValidations) return;

        const totalDaysInMonth = reportData.totalCalendarDays || new Date(form.year, form.month, 0).getDate();
        const requiredOrders = reportData.requiredOrders || 0;

        // ── helpers ──────────────────────────────────────────────────────────
        const isSpecialDay = (dateStr, dayNum, totalDays) => {
            if (dayNum <= 3 || dayNum >= totalDays - 4) return true;
            const dow = new Date(dateStr).getDay();
            return dow === 4 || dow === 5 || dow === 6; // Thu/Fri/Sat
        };

        // ExcelJS colour helpers (ARGB strings, no leading 'FF' prefix confusion)
        const COLOR = {
            red:          'FFFF0000',
            white:        'FFFFFFFF',
            darkBlue:     'FF1F3864',
            medBlue:      'FF2E75B6',
            lightBlue:    'FFDAE3F3',
            green:        'FF00B050',
            grey:         'FFBFBFBF',
        };

        const applyBorder = (cell) => {
            ['top','left','bottom','right'].forEach(side => {
                cell.border = {
                    ...cell.border,
                    [side]: { style: 'thin', color: { argb: COLOR.grey } },
                };
            });
        };

        const styleCell = (cell, { bgColor, fontColor = COLOR.darkBlue, bold = false, value } = {}) => {
            if (value !== undefined) cell.value = value;
            if (bgColor) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            }
            cell.font = { bold, color: { argb: fontColor }, name: 'Calibri', size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            applyBorder(cell);
        };

        // ── Build workbook with ExcelJS ───────────────────────────────────────
        const wb = new ExcelJS.Workbook();

        // ── SHEET 1 : Summary ────────────────────────────────────────────────
        const wsSummary = wb.addWorksheet('Summary');
        const summaryHeaders = [
            'المجموعة','اسم المندوب','الاقامة','المعرف',
            'أيام العمل الصالحة','أيام الغياب','عجز الأيام',
            'إجمالي الطلبات','عجز الطلبات','متوسط الساعات التزام',
            'نسبة الأيام','نسبة الطلبات','نسبة الأداء','النتيجة',
        ];
        wsSummary.columns = summaryHeaders.map(h => ({ header: h, width: 20 }));
        // style header row
        wsSummary.getRow(1).eachCell(cell => {
            styleCell(cell, { bgColor: COLOR.darkBlue, fontColor: COLOR.white, bold: true });
        });
        reportData.riderValidations.forEach(rider => {
            wsSummary.addRow([
                rider.housingName || '',
                rider.riderNameAR || '',
                rider.iqamaNo || '',
                rider.workingId || '',
                rider.totalValidWorkingDays,
                rider.missingDaysCount,
                rider.workingDaysDeficit,
                rider.totalOrders,
                rider.ordersDeficit,
                Number(rider.averageHoursPerValidDay).toFixed(2),
                `${rider.daysPercentage || 0}%`,
                `${rider.ordersPercentage || 0}%`,
                `${rider.performancePercentage || 0}%`,
                rider.statusLabel || (rider.isValidForMonth ? 'صالح' : 'غير صالح'),
            ]);
        });

        // ── SHEET 2 : Details ────────────────────────────────────────────────
        const wsDetails = wb.addWorksheet('Details');

        // Group riders by housing
        const grouped = {};
        reportData.riderValidations.forEach(rider => {
            const h = rider.housingName || 'غير محدد';
            if (!grouped[h]) grouped[h] = [];
            grouped[h].push(rider);
        });

        // Collect all unique special-day dates
        const specialDayDatesSet = new Set();
        reportData.riderValidations.forEach(rider => {
            (rider.dailyDetails || []).forEach(day => {
                const dayNum = day.day || new Date(day.date).getDate();
                if (isSpecialDay(day.date, dayNum, totalDaysInMonth)) {
                    specialDayDatesSet.add(day.date);
                }
            });
        });
        const specialDayDates = Array.from(specialDayDatesSet).sort();

        const totalCols = 2 + specialDayDates.length + 3; // housing+rider + dates + missing+orders+diff

        // Set column widths
        wsDetails.columns = [
            { width: 22 }, // housing
            { width: 30 }, // rider
            ...specialDayDates.map(() => ({ width: 13 })),
            { width: 14 }, // أيام ناقصة
            { width: 16 }, // إجمالي الطلبات
            { width: 22 }, // الفرق
        ];

        // Header row
        const headerValues = [
            'المجموعة', 'المندوب',
            ...specialDayDates,
            'أيام ناقصة', 'إجمالي الطلبات',
            `الفرق عن الهدف (${requiredOrders})`,
        ];
        const headerRow = wsDetails.addRow(headerValues);
        headerRow.eachCell(cell => {
            styleCell(cell, { bgColor: COLOR.darkBlue, fontColor: COLOR.white, bold: true });
        });
        headerRow.height = 24;

        // Data rows
        Object.entries(grouped).forEach(([housingName, riders]) => {
            // Housing group separator row
            const housingRow = wsDetails.addRow([housingName, ...new Array(totalCols - 1).fill('')]);
            housingRow.eachCell(cell => {
                styleCell(cell, { bgColor: COLOR.medBlue, fontColor: COLOR.white, bold: true });
            });
            housingRow.height = 20;

            riders.forEach(rider => {
                const dayMap = {};
                (rider.dailyDetails || []).forEach(day => { dayMap[day.date] = day; });

                let missingDaysCount = 0;
                const dayValues = specialDayDates.map(dateStr => {
                    const day = dayMap[dateStr];
                    const h = day != null ? day.workingHours : null;
                    const displayH = h !== null ? h : 0;
                    if (displayH < 8) missingDaysCount++;
                    return parseFloat(Number(displayH).toFixed(2));
                });

                const diff = (rider.totalOrders ?? 0) - requiredOrders;
                const riderRowData = [
                    housingName,
                    rider.riderNameAR || '',
                    ...dayValues,
                    missingDaysCount,
                    rider.totalOrders ?? 0,
                    diff >= 0 ? `+${diff}` : `${diff}`,
                ];

                const riderRow = wsDetails.addRow(riderRowData);
                riderRow.height = 18;

                // Housing col
                styleCell(riderRow.getCell(1), { bgColor: COLOR.lightBlue, fontColor: COLOR.darkBlue, bold: true });
                // Rider name col
                styleCell(riderRow.getCell(2), { fontColor: COLOR.darkBlue, bold: true });

                // Date cols
                specialDayDates.forEach((dateStr, ci) => {
                    const cell = riderRow.getCell(3 + ci);
                    const day = dayMap[dateStr];
                    const hours = day != null ? day.workingHours : 0;
                    if (hours < 8) {
                        styleCell(cell, { bgColor: COLOR.red, fontColor: COLOR.white, bold: true });
                    } else {
                        styleCell(cell, { fontColor: COLOR.darkBlue });
                    }
                });

                // أيام ناقصة col
                const missingCell = riderRow.getCell(3 + specialDayDates.length);
                if (missingDaysCount > 0) {
                    styleCell(missingCell, { bgColor: COLOR.red, fontColor: COLOR.white, bold: true });
                } else {
                    styleCell(missingCell, { fontColor: COLOR.darkBlue, bold: true });
                }

                // إجمالي الطلبات col
                styleCell(riderRow.getCell(4 + specialDayDates.length), { fontColor: COLOR.darkBlue, bold: true });

                // diff col
                const diffCell = riderRow.getCell(5 + specialDayDates.length);
                styleCell(diffCell, {
                    fontColor: diff >= 0 ? COLOR.green : COLOR.red,
                    bold: true,
                });
            });
        });

        // ── Write and trigger download ─────────────────────────────────────────
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hunger_monthly_validation_${form.year}_${form.month}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSummaryExcelExport = async () => {
        if (!reportData || !reportData.riderValidations) return;

        const invalidRiders = reportData.riderValidations.filter(r => !r.isValidForMonth);
        
        if (invalidRiders.length === 0) {
            setError('لا يوجد مناديب غير صالحين للتصدير');
            return;
        }

        const COLOR = {
            white:        'FFFFFFFF',
            darkBlue:     'FF1F3864',
            grey:         'FFBFBFBF',
        };

        const applyBorder = (cell) => {
            ['top','left','bottom','right'].forEach(side => {
                cell.border = {
                    ...cell.border,
                    [side]: { style: 'thin', color: { argb: COLOR.grey } },
                };
            });
        };

        const styleCell = (cell, { bgColor, fontColor = COLOR.darkBlue, bold = false } = {}) => {
            if (bgColor) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            }
            cell.font = { bold, color: { argb: fontColor }, name: 'Calibri', size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            applyBorder(cell);
        };

        const wb = new ExcelJS.Workbook();
        const wsSummary = wb.addWorksheet('Invalid Riders Summary');

        const summaryHeaders = [
            'المجموعة','اسم المندوب','الاقامة','المعرف',
            'أيام العمل الصالحة','أيام الغياب','عجز الأيام',
            'إجمالي الطلبات','عجز الطلبات','متوسط الساعات التزام',
            'نسبة الأيام','نسبة الطلبات','نسبة الأداء','النتيجة',
        ];

        wsSummary.columns = summaryHeaders.map(h => ({ header: h, width: 20 }));
        wsSummary.getRow(1).eachCell(cell => {
            styleCell(cell, { bgColor: COLOR.darkBlue, fontColor: COLOR.white, bold: true });
        });

        invalidRiders.forEach(rider => {
            wsSummary.addRow([
                rider.housingName || '',
                rider.riderNameAR || '',
                rider.iqamaNo || '',
                rider.workingId || '',
                rider.totalValidWorkingDays,
                rider.missingDaysCount,
                rider.workingDaysDeficit,
                rider.totalOrders,
                rider.ordersDeficit,
                Number(rider.averageHoursPerValidDay).toFixed(2),
                `${rider.daysPercentage || 0}%`,
                `${rider.ordersPercentage || 0}%`,
                `${rider.performancePercentage || 0}%`,
                rider.statusLabel || 'غير صالح',
            ]);
        });

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invalid_riders_summary_${form.year}_${form.month}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        if (!form.year || !form.month) {
            setError('يرجى تحديد السنة والشهر');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        setReportData(null);

        try {
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.HUNGER_MONTHLY_VALIDATION, {
                year: form.year,
                month: form.month
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

    const [selectedRider, setSelectedRider] = useState(null);

    const RiderDetailsModal = ({ isOpen, onClose, rider }) => {
        if (!isOpen || !rider) return null;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">التفاصيل اليومية : {rider.riderNameAR}</h3>
                            <p className="text-sm text-gray-500 mt-1">{rider.workingId} - {rider.housingName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-xs text-blue-600 font-bold mb-1">الطلبات</p>
                                <p className="text-lg font-bold">{rider.totalOrders} / {rider.requiredOrders}</p>
                                <p className="text-xs text-blue-600 font-bold mt-1">{rider.ordersPercentage}%</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-xs text-purple-600 font-bold mb-1">أيام العمل</p>
                                <p className="text-lg font-bold">{rider.totalValidWorkingDays} / {rider.totalExpectedDays}</p>
                                <p className="text-xs text-purple-600 font-bold mt-1">{rider.daysPercentage}%</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <p className="text-xs text-orange-600 font-bold mb-1">نسبة الأداء الكلية</p>
                                <p className="text-lg font-bold text-orange-700">{rider.performancePercentage}%</p>
                            </div>
                            <div className={`p-4 rounded-lg ${rider.isValidForMonth ? 'bg-green-50' : 'bg-red-50'}`}>
                                <p className={`text-xs font-bold mb-1 ${rider.isValidForMonth ? 'text-green-600' : 'text-red-600'}`}>النتيجة</p>
                                <p className="text-lg font-bold">{rider.statusLabel || (rider.isValidForMonth ? 'صالح' : 'غير صالح')}</p>
                            </div>
                        </div>

                        {rider.validationErrors && rider.validationErrors.length > 0 && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Info size={18} className="text-blue-500" /> مسوغات التقييم
                                </h4>
                                <ul className="space-y-1">
                                    {rider.validationErrors.map((err, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <h4 className="font-bold text-gray-800 mb-4">التفاصيل اليومية</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-sm font-bold text-gray-600 border-b">اليوم</th>
                                        <th className="p-3 text-sm font-bold text-gray-600 border-b">التاريخ</th>
                                        <th className="p-3 text-sm font-bold text-gray-600 border-b">ساعات العمل</th>
                                        <th className="p-3 text-sm font-bold text-gray-600 border-b">الطلبات</th>
                                        <th className="p-3 text-sm font-bold text-gray-600 border-b">حالة اليوم</th>
                                        <th className="p-3 text-sm font-bold text-gray-600 border-b">السبب</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rider.dailyDetails?.map((day, idx) => (
                                        <tr key={idx} className={`border-b border-gray-50 hover:bg-gray-50 ${day.isCriticalDay ? 'bg-orange-50/30' : ''}`}>
                                            <td className="p-3 font-semibold">{day.day}</td>
                                            <td className="p-3 text-gray-600">{day.date}</td>
                                            <td className="p-3 font-mono">{day.workingHours.toFixed(2)}</td>
                                            <td className="p-3 font-mono">{day.acceptedOrders}</td>
                                            <td className="p-3">
                                                {day.isValidWorkingDay ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded-full">
                                                        <CheckCircle size={14} /> محسوب
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold px-2 py-1 bg-red-50 rounded-full">
                                                        <XCircle size={14} /> غير محسوب
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">{day.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
            <PageHeader
                title="تقرير صلاحية الشهر - هنقرستيشن"
                subtitle="عرض نتيجة تقييم المناديب بناءً على الأداء الشهري"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">السنة</label>
                                <input
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">الشهر</label>
                                <select
                                    value={form.month}
                                    onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    {[...Array(12).keys()].map(i => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
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
                                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                    <button
                                        onClick={handleExcelExport}
                                        className="flex-1 md:flex-none bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        <FileSpreadsheet size={20} />
                                        تصدير Excel (كامل)
                                    </button>
                                    <button
                                        onClick={handleSummaryExcelExport}
                                        className="flex-1 md:flex-none bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 hover:shadow-lg flex items-center justify-center gap-2 font-bold transition-all"
                                    >
                                        <Users size={20} />
                                        تصدير ملخص غير الصالحين
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Display */}
                {reportData && (
                    <div className="space-y-6">
                        {/* Period Info */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <p className="text-indigo-100 text-sm">الفترة</p>
                                    <p className="text-xl font-bold">{reportData.year}-{reportData.month.toString().padStart(2, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">تاريخ البداية والنهاية</p>
                                    <p className="text-sm font-bold mt-1">{reportData.startDate} <br/> {reportData.endDate}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">أيام العمل المطلوبة</p>
                                    <p className="text-xl font-bold">{reportData.requiredWorkingDays} / {reportData.totalCalendarDays}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">الطلبات المطلوبة للتقييم</p>
                                    <p className="text-xl font-bold">{reportData.requiredOrders}</p>
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-sm">حالة الشهر</p>
                                    <p className="text-sm font-bold mt-1">
                                        {reportData.isCurrentMonth ? `مستمر (اليوم ${reportData.currentDay}/${reportData.lastDayOfMonth})` : 'مكتمل'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Company Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                icon={Users}
                                title="إجمالي المناديب"
                                value={reportData.totalRiders}
                                color="#3b82f6"
                            />
                            <StatCard
                                icon={CheckCircle}
                                title="المناديب الصالحين"
                                value={reportData.validRiders}
                                subtitle={`${((reportData.validRiders / reportData.totalRiders) * 100).toFixed(1)}% من الإجمالي`}
                                color="#10b981"
                            />
                            <StatCard
                                icon={XCircle}
                                title="المناديب غير الصالحين"
                                value={reportData.invalidRiders}
                                subtitle={`${((reportData.invalidRiders / reportData.totalRiders) * 100).toFixed(1)}% من الإجمالي`}
                                color="#ef4444"
                            />
                        </div>

                        {/* Target Achievement Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                icon={Target}
                                title="نسبة المناديب المحققين لهدف الطلبات 100%"
                                value={`${((reportData.riderValidations?.filter(r => r.ordersPercentage >= 100).length / (reportData.riderValidations?.length || 1)) * 100).toFixed(1)}%`}
                                subtitle={`${reportData.riderValidations?.filter(r => r.ordersPercentage >= 100).length} من ${reportData.riderValidations?.length} مندوب`}
                                color="#8b5cf6"
                            />
                            <StatCard
                                icon={Calendar}
                                title="نسبة المناديب المحققين لهدف أيام العمل 100%"
                                value={`${((reportData.riderValidations?.filter(r => r.daysPercentage >= 100).length / (reportData.riderValidations?.length || 1)) * 100).toFixed(1)}%`}
                                subtitle={`${reportData.riderValidations?.filter(r => r.daysPercentage >= 100).length} من ${reportData.riderValidations?.length} مندوب`}
                                color="#f59e0b"
                            />
                        </div>

                        {/* Riders Table */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="text-blue-600" />
                                    تفاصيل تقييم المناديب
                                </h3>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                    {reportData.riderValidations?.length} مندوب
                                </span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b">المندوب</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b">المجموعة</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b">أيام العمل</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">عجز الأيام</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">الطلبات</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">عجز الطلبات</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">المتوسط</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">الأداء</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">النتيجة</th>
                                            <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">إجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportData.riderValidations?.map((rider, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-800">{rider.riderNameAR}</div>
                                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{rider.workingId} | {rider.iqamaNo}</div>
                                                    {rider.isNewRider && <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">مندوب جديد</span>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{rider.housingName}</td>
                                                <td className="p-4 text-center">
                                                    <span className="font-bold text-gray-800">{rider.totalValidWorkingDays}</span>
                                                    <span className="text-gray-400 text-xs mx-1">/</span>
                                                    <span className="text-gray-500 text-xs">{rider.totalExpectedDays}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {rider.workingDaysDeficit > 0 ? (
                                                        <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg text-sm">
                                                            -{rider.workingDaysDeficit}
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-500 font-bold text-sm">0</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="font-bold text-gray-800">{rider.totalOrders}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-bold px-2 py-1 rounded-lg text-sm ${rider.ordersDeficit > 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                                                        {rider.ordersDeficit}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-sm font-mono text-gray-600">
                                                    {Number(rider.averageHoursPerValidDay).toFixed(1)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">{rider.performancePercentage}%</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                                                        ${rider.isValidForMonth ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {rider.statusLabel || (rider.isValidForMonth ? 'صالح' : 'غير صالح')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => setSelectedRider(rider)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        التفاصيل
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                
                <RiderDetailsModal
                    isOpen={!!selectedRider}
                    onClose={() => setSelectedRider(null)}
                    rider={selectedRider}
                />
            </div>
        </div>
    );
}
