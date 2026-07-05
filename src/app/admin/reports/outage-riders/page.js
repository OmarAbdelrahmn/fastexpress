'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Calendar, FileSpreadsheet, Phone, Search, Target, Users, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  filterOnlyExcludedHungerRiders,
  getExcludedHungerRiderMatch,
  hungerRiderExclusions,
} from '@/lib/utils/hungerRiderExclusions';

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const numberValue = (value) => Number(value) || 0;

const labels = {
  ar: {
    title: 'تقرير مناديب الخارج',
    subtitle: 'تقرير مفصل للمناديب المحددين فقط',
    periodTitle: 'اختر الفترة الزمنية',
    savedRiders: 'مندوب محفوظ',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    load: 'عرض التقرير',
    loading: 'جاري التحميل...',
    exportExcel: 'تصدير Excel',
    fillDates: 'يرجى تحديد تاريخ البداية والنهاية',
    success: 'تم تحميل تقرير مناديب الخارج بنجاح',
    noData: 'لا توجد بيانات للفترة المحددة',
    loadError: 'خطأ في تحميل التقرير',
    riderCount: 'عدد المناديب',
    totalOrders: 'اجمالي الطلبات',
    totalRejections: 'اجمالي الرفض',
    workingDays: 'ايام العمل',
    totalHours: 'اجمالي الساعات',
    detailsTitle: 'تفاصيل مناديب الخارج',
    detailsSubtitle: 'عرض مباشر لبيانات الأداء',
    searchPlaceholder: 'بحث بالمعرف أو الجوال...',
    workingId: 'المعرف',
    phone: 'رقم الجوال',
    orders: 'الطلبات',
    rejections: 'الرفض',
    rejectionRate: 'نسبة الرفض',
    hours: 'الساعات',
    absentDays: 'ايام الغياب',
    empty: 'لا توجد بيانات لهؤلاء المناديب في الفترة المحددة',
    sheetName: 'مناديب الخارج',
    filePrefix: 'outage_riders',
    excel: {
      workingId: 'رقم العمل',
      phone: 'رقم الجوال',
      totalOrders: 'اجمالي الطلبات',
      totalRejections: 'اجمالي الرفض',
      rejectionRate: 'نسبة الرفض',
      totalHours: 'اجمالي الساعات',
      workingDays: 'ايام العمل',
      absentDays: 'ايام الغياب',
      targetOrders: 'تارجيت الطلبات',
      ordersDifference: 'فرق الطلبات',
    },
  },
  en: {
    title: 'Outside Riders Report',
    subtitle: 'Detailed report for selected outside riders',
    periodTitle: 'Select Period',
    savedRiders: 'saved riders',
    startDate: 'Start Date',
    endDate: 'End Date',
    load: 'View Report',
    loading: 'Loading...',
    exportExcel: 'Export Excel',
    fillDates: 'Please select start and end dates',
    success: 'Outside riders report loaded successfully',
    noData: 'No data for the selected period',
    loadError: 'Error loading report',
    riderCount: 'Riders',
    totalOrders: 'Total Orders',
    totalRejections: 'Total Rejections',
    workingDays: 'Working Days',
    totalHours: 'Total Hours',
    detailsTitle: 'Outside Rider Details',
    detailsSubtitle: 'Direct performance view',
    searchPlaceholder: 'Search by ID or phone...',
    workingId: 'ID',
    phone: 'Phone Number',
    orders: 'Orders',
    rejections: 'Rejections',
    rejectionRate: 'Rejection Rate',
    hours: 'Hours',
    absentDays: 'Absent Days',
    empty: 'No data for these riders in the selected period',
    sheetName: 'Outside Riders',
    filePrefix: 'outage_riders',
    excel: {
      workingId: 'Working ID',
      phone: 'Phone Number',
      totalOrders: 'Total Orders',
      totalRejections: 'Total Rejections',
      rejectionRate: 'Rejection Rate',
      totalHours: 'Total Hours',
      workingDays: 'Working Days',
      absentDays: 'Absent Days',
      targetOrders: 'Target Orders',
      ordersDifference: 'Orders Difference',
    },
  },
};

const getInitialRange = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    startDate: formatDate(startOfMonth),
    endDate: formatDate(yesterday),
  };
};

const flattenOutageRiders = (data) => {
  const rows = [];

  (data?.housingDetails || []).forEach((housing) => {
    const outageRiders = filterOnlyExcludedHungerRiders(housing.riders || []);

    outageRiders.forEach((rider) => {
      const saved = getExcludedHungerRiderMatch(rider) || {};
      const period = rider.periodSummary || {};
      const totalRejectedOrders =
        period.totalRejectedOrders !== undefined
          ? period.totalRejectedOrders
          : (rider.dailyEntries || []).reduce((sum, day) => sum + numberValue(day.rejectedOrders), 0);
      const totalAcceptedOrders =
        period.totalAcceptedOrders !== undefined
          ? period.totalAcceptedOrders
          : (rider.dailyEntries || []).reduce((sum, day) => sum + numberValue(day.acceptedOrders), 0);

      rows.push({
        ...rider,
        housingName: housing.housingName,
        housingId: housing.housingId,
        outagePhoneNumber: saved.phoneNumber || '',
        outageIqamaNo: saved.iqamaNo || rider.iqamaNo || rider.employeeIqamaNo || '',
        outageWorkingId: saved.workingId || rider.workingId || '',
        totalAcceptedOrders,
        totalRejectedOrders,
        totalWorkingHours: period.totalWorkingHours,
        totalTargetOrders: period.totalTargetOrders,
        ordersDifference: period.totalOrdersDifference ?? period.ordersDifference,
        totalWorkingDays: period.totalWorkingDays,
        totalAbsentDays: period.totalAbsentDays,
        rejectionRate: totalAcceptedOrders > 0 ? (totalRejectedOrders / totalAcceptedOrders) * 100 : 0,
      });
    });
  });

  return rows;
};

export default function OutageRidersReportPage() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const text = labels[isRtl ? 'ar' : 'en'];
  const [form, setForm] = useState(getInitialRange);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const outageRiders = useMemo(() => flattenOutageRiders(reportData), [reportData]);

  const filteredRiders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return outageRiders;

    return outageRiders.filter((rider) =>
      String(rider.outageWorkingId || '').includes(query) ||
      String(rider.outagePhoneNumber || '').includes(query)
    );
  }, [outageRiders, searchQuery]);

  const totals = useMemo(() => {
    return filteredRiders.reduce(
      (acc, rider) => {
        acc.totalOrders += numberValue(rider.totalAcceptedOrders);
        acc.totalRejectedOrders += numberValue(rider.totalRejectedOrders);
        acc.totalWorkingHours += numberValue(rider.totalWorkingHours);
        acc.totalWorkingDays += numberValue(rider.totalWorkingDays);
        acc.totalAbsentDays += numberValue(rider.totalAbsentDays);
        return acc;
      },
      {
        totalRiders: filteredRiders.length,
        totalOrders: 0,
        totalRejectedOrders: 0,
        totalWorkingHours: 0,
        totalWorkingDays: 0,
        totalAbsentDays: 0,
      }
    );
  }, [filteredRiders]);

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) {
      setError(text.fillDates);
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setReportData(null);

    try {
      const data = await ApiService.get(API_ENDPOINTS.REPORTS.HOUSING_DETAILED_DAILY_PERFORMANCE, {
        startDate: form.startDate,
        endDate: form.endDate,
      });

      if (data) {
        setReportData(data);
        setSuccessMessage(text.success);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(text.noData);
      }
    } catch (err) {
      console.error('Outage riders report error:', err);
      setError(err.message || text.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelExport = () => {
    if (!filteredRiders.length) return;

    const data = filteredRiders.map((rider) => ({
      [text.excel.workingId]: rider.outageWorkingId,
      [text.excel.phone]: rider.outagePhoneNumber,
      [text.excel.totalOrders]: rider.totalAcceptedOrders || 0,
      [text.excel.totalRejections]: rider.totalRejectedOrders || 0,
      [text.excel.rejectionRate]: `${rider.rejectionRate.toFixed(2)}%`,
      [text.excel.totalHours]: numberValue(rider.totalWorkingHours).toFixed(2),
      [text.excel.workingDays]: rider.totalWorkingDays || 0,
      [text.excel.absentDays]: rider.totalAbsentDays || 0,
      [text.excel.targetOrders]: rider.totalTargetOrders || 0,
      [text.excel.ordersDifference]: rider.ordersDifference || 0,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, text.sheetName);
    XLSX.writeFile(wb, `${text.filePrefix}_${form.startDate}_${form.endDate}.xlsx`);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border-t-4" style={{ borderTopColor: color }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon size={34} style={{ color }} className="opacity-80 shrink-0" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        title={text.title}
        subtitle={text.subtitle}
        icon={AlertTriangle}
      />

      <div className="m-6 space-y-6">
        {successMessage && (
          <div className="border-2 rounded-lg p-4 flex items-center justify-between bg-green-50 border-green-200 text-green-800">
            <span className="font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-xl font-bold hover:opacity-70">&times;</button>
          </div>
        )}
        {error && (
          <div className="border-2 rounded-lg p-4 flex items-center justify-between bg-red-50 border-red-200 text-red-800">
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="text-xl font-bold hover:opacity-70">&times;</button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">{text.periodTitle}</h2>
            <span className={`${isRtl ? 'mr-auto' : 'ml-auto'} text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full`}>
              {hungerRiderExclusions.length} {text.savedRiders}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{text.startDate}</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{text.endDate}</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {text.loading}
                </>
              ) : (
                <>
                  <BarChart3 size={20} />
                  {text.load}
                </>
              )}
            </button>

            {reportData && (
              <button
                onClick={handleExcelExport}
                disabled={!filteredRiders.length}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold transition-all"
              >
                <FileSpreadsheet size={20} />
                {text.exportExcel}
              </button>
            )}
          </div>
        </div>

        {reportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard icon={Users} title={text.riderCount} value={totals.totalRiders} color="#3b82f6" />
              <StatCard icon={Target} title={text.totalOrders} value={totals.totalOrders} color="#10b981" />
              <StatCard icon={XCircle} title={text.totalRejections} value={totals.totalRejectedOrders} color="#ef4444" />
              <StatCard icon={Calendar} title={text.workingDays} value={totals.totalWorkingDays} color="#06b6d4" />
              <StatCard icon={BarChart3} title={text.totalHours} value={totals.totalWorkingHours.toFixed(1)} color="#f59e0b" />
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{text.detailsTitle}</h3>
                  <p className="text-sm text-gray-500 mt-1">{text.detailsSubtitle}</p>
                </div>
                <div className={`relative ${isRtl ? 'md:mr-auto' : 'md:ml-auto'} w-full md:w-96`}>
                  <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3.5 text-gray-400 w-5 h-5 pointer-events-none`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={text.searchPlaceholder}
                    className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} border-collapse`}>
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b">{text.workingId}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b">{text.phone}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">{text.orders}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">{text.rejections}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">{text.rejectionRate}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">{text.hours}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">{text.workingDays}</th>
                      <th className="p-4 text-sm font-bold text-gray-600 border-b text-center">{text.absentDays}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRiders.map((rider, index) => (
                      <tr key={`${rider.outageWorkingId}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-700">{rider.outageWorkingId}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 font-mono text-gray-700">
                            <Phone size={14} className="text-green-600" />
                            {rider.outagePhoneNumber || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-green-700">{rider.totalAcceptedOrders || 0}</td>
                        <td className="p-4 text-center font-bold text-red-600">{rider.totalRejectedOrders || 0}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            rider.rejectionRate >= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {rider.rejectionRate.toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-4 text-center font-semibold text-blue-700">{numberValue(rider.totalWorkingHours).toFixed(1)}</td>
                        <td className="p-4 text-center">{rider.totalWorkingDays || 0}</td>
                        <td className="p-4 text-center text-red-600 font-semibold">{rider.totalAbsentDays || 0}</td>
                      </tr>
                    ))}
                    {!filteredRiders.length && (
                      <tr>
                        <td colSpan="8" className="p-10 text-center text-gray-500">
                          {text.empty}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
