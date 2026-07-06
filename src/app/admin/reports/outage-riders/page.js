'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Calendar, FileSpreadsheet, Search, Target, Users, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const numberValue = (value) => Number(value) || 0;

const formatDateOnly = (value) => {
  if (!value) return '-';
  return String(value).split('T')[0];
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const labels = {
  ar: {
    title: 'تقرير أداء مناديب الخارج',
    subtitle: 'عرض سجلات أداء مناديب الخارج من خدمة Outage Shift Performance',
    periodTitle: 'فلاتر التقرير',
    riderId: 'معرف المندوب',
    riderIdPlaceholder: 'مثال R123',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    load: 'عرض التقرير',
    loading: 'جاري التحميل...',
    exportExcel: 'تصدير Excel',
    fillDates: 'يرجى تحديد تاريخ البداية والنهاية',
    success: 'تم تحميل تقرير أداء مناديب الخارج بنجاح',
    noData: 'لا توجد بيانات للفترة المحددة',
    loadError: 'خطأ في تحميل التقرير',
    recordCount: 'عدد السجلات',
    riderCount: 'عدد المناديب',
    totalOrders: 'الطلبات المكتملة',
    totalRejections: 'الطلبات المرفوضة',
    totalHours: 'إجمالي الساعات',
    detailsTitle: 'سجلات أداء مناديب الخارج',
    detailsSubtitle: 'البيانات المباشرة من GET /api/outage-shift-performances',
    searchPlaceholder: 'بحث بمعرف المندوب...',
    id: 'ID',
    outRiderInfoId: 'رقم بيانات المندوب',
    shiftDate: 'تاريخ الشفت',
    acceptedOrders: 'الطلبات المكتملة',
    rejectedOrders: 'الطلبات المرفوضة',
    rejectionRate: 'نسبة الرفض',
    workingHours: 'ساعات العمل',
    uploadedAt: 'تاريخ الرفع',
    uploadedBy: 'رفع بواسطة',
    empty: 'لا توجد سجلات أداء مطابقة',
    sheetName: 'أداء مناديب الخارج',
    filePrefix: 'outage_shift_performance',
  },
  en: {
    title: 'Outside Riders Performance Report',
    subtitle: 'View outside rider performance rows from Outage Shift Performance',
    periodTitle: 'Report Filters',
    riderId: 'Rider ID',
    riderIdPlaceholder: 'Example R123',
    startDate: 'Start Date',
    endDate: 'End Date',
    load: 'View Report',
    loading: 'Loading...',
    exportExcel: 'Export Excel',
    fillDates: 'Please select start and end dates',
    success: 'Outside rider performance report loaded successfully',
    noData: 'No data for the selected period',
    loadError: 'Error loading report',
    recordCount: 'Records',
    riderCount: 'Riders',
    totalOrders: 'Completed Deliveries',
    totalRejections: 'Declined Deliveries',
    totalHours: 'Total Hours',
    detailsTitle: 'Outside Rider Performance Rows',
    detailsSubtitle: 'Direct data from GET /api/outage-shift-performances',
    searchPlaceholder: 'Search by rider ID...',
    id: 'ID',
    outRiderInfoId: 'Out Rider Info ID',
    shiftDate: 'Shift Date',
    acceptedOrders: 'Completed Deliveries',
    rejectedOrders: 'Declined Deliveries',
    rejectionRate: 'Rejection Rate',
    workingHours: 'Working Hours',
    uploadedAt: 'Uploaded At',
    uploadedBy: 'Uploaded By',
    empty: 'No matching performance records',
    sheetName: 'Outside Rider Performance',
    filePrefix: 'outage_shift_performance',
  },
};

const getInitialRange = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    riderId: '',
    startDate: formatDate(startOfMonth),
    endDate: formatDate(today),
  };
};

const compactParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      cleaned[key] = String(value).trim();
    }
  });
  return cleaned;
};

const groupPerformanceRecords = (list) => {
  const groups = new Map();

  list.forEach((record) => {
    const key = String(record.riderId || record.outRiderInfoId || record.id || 'unknown');
    const existing = groups.get(key) || {
      key,
      riderId: record.riderId || '-',
      outRiderInfoId: record.outRiderInfoId || '-',
      records: [],
      acceptedOrders: 0,
      rejectedOrders: 0,
      workingHours: 0,
    };

    existing.records.push(record);
    existing.acceptedOrders += numberValue(record.acceptedOrders);
    existing.rejectedOrders += numberValue(record.rejectedOrders);
    existing.workingHours += numberValue(record.workingHours);
    groups.set(key, existing);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      records: group.records.sort((a, b) => {
        const dateCompare = String(formatDateOnly(a.shiftDate)).localeCompare(String(formatDateOnly(b.shiftDate)));
        return dateCompare || (numberValue(a.id) - numberValue(b.id));
      }),
    }))
    .sort((a, b) => String(a.riderId).localeCompare(String(b.riderId), undefined, { numeric: true }));
};

export default function OutageRidersReportPage() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const text = labels[isRtl ? 'ar' : 'en'];
  const [form, setForm] = useState(getInitialRange);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRiders, setExpandedRiders] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const filteredRecords = useMemo(() => {
    const list = Array.isArray(records) ? records : [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((record) =>
      String(record.riderId || '').toLowerCase().includes(query) ||
      String(record.outRiderInfoId || '').toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  const totals = useMemo(() => {
    const riderIds = new Set();

    const totalsValue = filteredRecords.reduce(
      (acc, record) => {
        if (record.riderId) riderIds.add(record.riderId);
        acc.totalOrders += numberValue(record.acceptedOrders);
        acc.totalRejectedOrders += numberValue(record.rejectedOrders);
        acc.totalWorkingHours += numberValue(record.workingHours);
        return acc;
      },
      {
        totalRecords: filteredRecords.length,
        totalOrders: 0,
        totalRejectedOrders: 0,
        totalWorkingHours: 0,
      }
    );

    return {
      ...totalsValue,
      totalRiders: riderIds.size,
    };
  }, [filteredRecords]);

  const groupedRecords = useMemo(() => groupPerformanceRecords(filteredRecords), [filteredRecords]);

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) {
      setError(text.fillDates);
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setRecords(null);

    try {
      const data = await ApiService.get(API_ENDPOINTS.OUTAGE_SHIFT_PERFORMANCES.LIST, compactParams({
        riderId: form.riderId,
        from: form.startDate,
        to: form.endDate,
      }));

      setRecords(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length) {
        setSuccessMessage(text.success);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(text.noData);
      }
    } catch (err) {
      console.error('Outage riders performance report error:', err);
      setError(err.message || text.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelExport = () => {
    if (!filteredRecords.length) return;

    const data = filteredRecords.map((record) => ({
      [text.id]: record.id,
      [text.outRiderInfoId]: record.outRiderInfoId,
      [text.riderId]: record.riderId,
      [text.shiftDate]: formatDateOnly(record.shiftDate),
      [text.acceptedOrders]: record.acceptedOrders ?? 0,
      [text.rejectedOrders]: record.rejectedOrders ?? 0,
      [text.rejectionRate]: getRejectionRate(record).toFixed(2) + '%',
      [text.workingHours]: numberValue(record.workingHours).toFixed(2),
      [text.uploadedAt]: formatDateTime(record.uploadedAt),
      [text.uploadedBy]: record.uploadedBy || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 22 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, text.sheetName);
    XLSX.writeFile(wb, `${text.filePrefix}_${form.startDate}_${form.endDate}.xlsx`);
  };

  const getRejectionRate = (record) => {
    const accepted = numberValue(record.acceptedOrders);
    const rejected = numberValue(record.rejectedOrders);
    const total = accepted + rejected;
    return total > 0 ? (rejected / total) * 100 : 0;
  };

  const getGroupRejectionRate = (group) => {
    const total = group.acceptedOrders + group.rejectedOrders;
    return total > 0 ? (group.rejectedOrders / total) * 100 : 0;
  };

  const toggleRider = (key) => {
    setExpandedRiders((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border-t-4" style={{ borderTopColor: color }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{text.riderId}</label>
              <input
                value={form.riderId}
                onChange={(e) => setForm({ ...form, riderId: e.target.value })}
                placeholder={text.riderIdPlaceholder}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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

            {records && (
              <button
                onClick={handleExcelExport}
                disabled={!filteredRecords.length}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold transition-all"
              >
                <FileSpreadsheet size={20} />
                {text.exportExcel}
              </button>
            )}
          </div>
        </div>

        {records && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard icon={FileSpreadsheet} title={text.recordCount} value={totals.totalRecords} color="#6366f1" />
              <StatCard icon={Users} title={text.riderCount} value={totals.totalRiders} color="#3b82f6" />
              <StatCard icon={Target} title={text.totalOrders} value={totals.totalOrders} color="#10b981" />
              <StatCard icon={XCircle} title={text.totalRejections} value={totals.totalRejectedOrders} color="#ef4444" />
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

              <div className="p-5 space-y-4">
                {!filteredRecords.length ? (
                  <div className="p-10 text-center text-gray-500">
                    {text.empty}
                  </div>
                ) : (
                  groupedRecords.map((group) => {
                    const isExpanded = expandedRiders[group.key] ?? true;
                    const groupRejectionRate = getGroupRejectionRate(group);

                    return (
                      <div key={group.key} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => toggleRider(group.key)}
                          className="w-full bg-gray-50 hover:bg-gray-100 px-5 py-4 transition-colors"
                        >
                          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Users className="text-indigo-600 shrink-0" size={24} />
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-gray-900">{text.riderId}: {group.riderId}</span>
                                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-mono">
                                    {text.outRiderInfoId}: {group.outRiderInfoId}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{group.records.length} {text.recordCount}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className="font-semibold text-green-700">{text.acceptedOrders}: {group.acceptedOrders}</span>
                              <span className="font-semibold text-red-700">{text.rejectedOrders}: {group.rejectedOrders}</span>
                              <span className="font-semibold text-blue-700">{text.workingHours}: {group.workingHours.toFixed(1)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                groupRejectionRate >= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {text.rejectionRate}: {groupRejectionRate.toFixed(2)}%
                              </span>
                              <span className="text-gray-600 text-xl">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4">
                            <div className="overflow-x-auto">
                              <table className={`min-w-full divide-y divide-gray-200 text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{text.id}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{text.shiftDate}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">{text.acceptedOrders}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">{text.rejectedOrders}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">{text.rejectionRate}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">{text.workingHours}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{text.uploadedAt}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{text.uploadedBy}</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {group.records.map((record) => {
                                    const rejectionRate = getRejectionRate(record);

                                    return (
                                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-700">{record.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{formatDateOnly(record.shiftDate)}</td>
                                        <td className="px-4 py-3 text-center font-bold text-green-700">{record.acceptedOrders ?? 0}</td>
                                        <td className="px-4 py-3 text-center font-bold text-red-600">{record.rejectedOrders ?? 0}</td>
                                        <td className="px-4 py-3 text-center">
                                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            rejectionRate >= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                          }`}>
                                            {rejectionRate.toFixed(2)}%
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold text-blue-700">{numberValue(record.workingHours).toFixed(1)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(record.uploadedAt)}</td>
                                        <td className="px-4 py-3">{record.uploadedBy || '-'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
