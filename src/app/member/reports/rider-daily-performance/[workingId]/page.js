'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart2,
  FileSpreadsheet,
  RefreshCw,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Percent,
  CheckCircle,
  User,
  PackageCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const translations = {
  en: {
    backToTable: 'Back to Performance Matrix',
    pageTitle: 'Rider Daily Performance Details',
    pageSubtitle: 'Detailed performance metrics, percentages, and daily breakdown for',
    riderInfo: 'Rider Information',
    workingId: 'Working ID',
    riderName: 'Rider Name',
    accountOwner: 'Account Owner',
    accountUsedBy: 'Account used by: ',
    substituteNote: 'Substitute Note',
    currentSegment: 'Current Segment',
    period: 'Time Period',
    startDate: 'Start Date',
    endDate: 'End Date',
    allTime: 'All Time',
    last7Days: 'Last 7 Days',
    last14Days: 'Last 14 Days',
    last30Days: 'Last 30 Days',
    thisMonth: 'This Month',
    filter: 'Filter',
    reset: 'Reset',
    refresh: 'Refresh',

    // KPI & Percentages Cards
    kpiTitle: 'Performance Percentages & Overview',
    qualityScore: 'Final Quality Score',
    onTimeScore: 'On-Time Delivery Score',
    verificationRate: 'Verification Success Rate',
    completionRate: 'Order Completion Rate',
    inTimeCompletionRate: 'In-Time Delivery Rate',
    cancellationRate: 'Rider Cancellation Rate',
    totalGrossOrders: 'Total Gross Orders',
    totalCompletedOrders: 'Total Completed Orders',
    totalInTimeOrders: 'Total In-Time Orders',
    totalFailedByRider: 'Failed Orders by Rider',
    activeDays: 'Recorded Work Days',
    avgOrdersPerDay: 'Avg Orders / Day',
    segmentDistribution: 'Segment Distribution',

    // Charts
    ordersTrendTitle: 'Daily Orders Trend (Completed vs Gross)',
    scoresTrendTitle: 'Daily Score Percentages Trend (Quality & On-Time)',
    grossOrders: 'Gross Orders',
    completedOrders: 'Completed Orders',
    inTimeOrders: 'In-Time Orders',
    qualityScorePct: 'Quality Score %',
    onTimeScorePct: 'On-Time Score %',

    // Table
    dailyBreakdownTitle: 'Chronological Daily Performance Breakdown',
    date: 'Date',
    dayOfWeek: 'Day',
    segment: 'Segment',
    ordersCompletedGross: 'Orders (Completed / Gross)',
    inTimeOrdersCol: 'In-Time Orders',
    failedOrdersCol: 'Failed by Rider',
    onTimeScoreCol: 'On-Time Score',
    qualityScoreCol: 'Quality Score',
    verificationCol: 'Verification (Success / Total)',

    // Export & Actions
    exportExcel: 'Export Rider Excel',
    close: 'Close',
    dayDetailsTitle: 'Daily Performance Record Details',
    totalVerificationRequests: 'Total Verification Requests',
    successfulVerificationRequests: 'Successful Verification Requests',

    // Notifications
    noRecords: 'No performance records found for this rider in the selected period',
    loadError: 'Failed to load rider details',
  },
  ar: {
    backToTable: 'العودة لمصفوفة الأداء',
    pageTitle: 'تفاصيل ونسب أداء المندوب اليومي',
    pageSubtitle: 'المؤشرات والنسب المئوية ومخططات الأداء وسجل الأيام للمندوب',
    riderInfo: 'بيانات المندوب',
    workingId: 'الرقم التعريفي (Working ID)',
    riderName: 'اسم المندوب',
    accountOwner: 'صاحب الحساب',
    accountUsedBy: 'يستخدم الحساب بواسطة: ',
    substituteNote: 'ملاحظة البديل',
    currentSegment: 'الشريحة الحالية',
    period: 'الفترة الزمنية',
    startDate: 'من تاريخ',
    endDate: 'إلى تاريخ',
    allTime: 'كل البيانات',
    last7Days: 'آخر 7 أيام',
    last14Days: 'آخر 14 يوم',
    last30Days: 'آخر 30 يوم',
    thisMonth: 'هذا الشهر',
    filter: 'تصفية',
    reset: 'إعادة ضبط',
    refresh: 'تحديث',

    // KPI & Percentages Cards
    kpiTitle: 'النسب المئوية ومؤشرات الأداء الرئيسية',
    qualityScore: 'متوسط جودة التوصيل النهائية',
    onTimeScore: 'متوسط درجة دقة التوصيل بالوقت',
    verificationRate: 'متوسط نسبة نجاح التحقق',
    completionRate: 'نسبة إكمال الطلبات',
    inTimeCompletionRate: 'نسبة التوصيل بالوقت للمكتمل',
    cancellationRate: 'نسبة الإلغاء بسبب المندوب',
    totalGrossOrders: 'إجمالي الطلبات المستلمة',
    totalCompletedOrders: 'إجمالي الطلبات المكتملة',
    totalInTimeOrders: 'الطلبات المكتملة في الوقت',
    totalFailedByRider: 'الملغاة بسبب المندوب',
    activeDays: 'أيام العمل المسجلة',
    avgOrdersPerDay: 'معدل الطلبات / يوم',
    segmentDistribution: 'توزيع الشرائح (Segments)',

    // Charts
    ordersTrendTitle: 'مخطط حركة الطلبات اليومية (المكتملة مقابل الإجمالي)',
    scoresTrendTitle: 'مخطط درجات الأداء اليومية (الجودة ودقة المواعيد %)',
    grossOrders: 'إجمالي الطلبات',
    completedOrders: 'الطلبات المكتملة',
    inTimeOrders: 'المكتملة في الوقت',
    qualityScorePct: 'جودة التوصيل %',
    onTimeScorePct: 'دقة المواعيد %',

    // Table
    dailyBreakdownTitle: 'السجل اليومي الزمني المفصل للأداء',
    date: 'التاريخ',
    dayOfWeek: 'اليوم',
    segment: 'الشريحة',
    ordersCompletedGross: 'الطلبات (مكتمل / إجمالي)',
    inTimeOrdersCol: 'في الوقت المحدد',
    failedOrdersCol: 'ملغاة بالمندوب',
    onTimeScoreCol: 'دقة المواعيد',
    qualityScoreCol: 'جودة التوصيل',
    verificationCol: 'التحقق (ناجح / إجمالي)',

    // Export & Actions
    exportExcel: 'تصدير Excel للمندوب',
    close: 'إغلاق',
    dayDetailsTitle: 'تفاصيل سجل الأداء اليومي',
    totalVerificationRequests: 'إجمالي طلبات التحقق',
    successfulVerificationRequests: 'طلبات التحقق الناجحة',

    // Notifications
    noRecords: 'لا توجد سجلات أداء لهذا المندوب خلال الفترة المحددة',
    loadError: 'فشل تحميل تفاصيل المندوب',
  },
};

const formatDateLocal = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => formatDateLocal(new Date());

const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateLocal(d);
};

const getFirstDayOfCurrentMonth = () => {
  const d = new Date();
  return formatDateLocal(new Date(d.getFullYear(), d.getMonth(), 1));
};

const getPastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDateLocal(d);
};

const formatPercent = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const num = Number(val);
  const pct = num <= 1 ? num * 100 : num;
  return `${pct.toFixed(decimals)}%`;
};

const getSegmentBadgeColor = (segment) => {
  const s = String(segment || '').toUpperCase().trim();
  switch (s) {
    case 'A':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'B':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'C':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'D':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getArabicDayName = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', { weekday: 'short' });
};

const getEnglishDayName = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

function MemberRiderDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const t = translations[isRtl ? 'ar' : 'en'];

  const rawWorkingId = params?.workingId || '';
  const workingId = decodeURIComponent(rawWorkingId);

  // Date filters from URL query or current month
  const initialStartDate = searchParams?.get('startDate') || getFirstDayOfCurrentMonth();
  const initialEndDate = searchParams?.get('endDate') || getYesterdayDate();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch records for this rider using GET /api/Member/riders/scores
  const fetchRiderRecords = useCallback(async () => {
    if (!workingId) return;
    setLoading(true);
    try {
      const query = { workingId };
      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;

      const data = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS_SCORES, query);

      let list = [];
      if (data && Array.isArray(data.days)) {
        data.days.forEach((day) => {
          const dayDate = day.performanceDate ? String(day.performanceDate).split('T')[0] : '';
          (day.records || []).forEach((r) => {
            list.push({
              ...r,
              performanceDate: r.performanceDate ? String(r.performanceDate).split('T')[0] : dayDate,
            });
          });
        });
      } else if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.records)) {
        list = data.records;
      }

      // Filter specifically to this workingId
      const riderRecords = list.filter((r) => {
        const id = String(r.workingId || r.sourceRiderId || r.riderWorkingId || '');
        return id.toLowerCase().trim() === workingId.toLowerCase().trim();
      });

      // Sort by date descending (newest first)
      riderRecords.sort((a, b) =>
        String(b.performanceDate || '').localeCompare(String(a.performanceDate || ''))
      );

      setRecords(riderRecords);
    } catch (err) {
      console.error('Failed to load member rider details:', err);
      showNotification('error', err?.message || t.loadError);
    } finally {
      setLoading(false);
    }
  }, [workingId, startDate, endDate, t.loadError]);

  useEffect(() => {
    fetchRiderRecords();
  }, [fetchRiderRecords]);

  // Aggregate metrics and KPIs for this rider over the period
  const stats = useMemo(() => {
    let grossOrders = 0;
    let completedOrders = 0;
    let inTimeOrders = 0;
    let failedOrders = 0;
    let verificationReq = 0;
    let verificationSuccess = 0;
    let qualitySum = 0;
    let qualityCount = 0;
    let onTimeSum = 0;
    let onTimeCount = 0;
    let activeDays = 0;

    const segmentCounts = {};
    let latestRiderName = '';
    let latestSegment = '';
    let latestSubstituteRiderName = null;

    // Chronological processing
    const sortedAsc = [...records].sort((a, b) =>
      String(a.performanceDate || '').localeCompare(String(b.performanceDate || ''))
    );

    sortedAsc.forEach((r) => {
      const g = Number(r.grossOrders) || 0;
      const c = Number(r.completedOrders) || 0;
      const it = Number(r.completedOrdersInTime) || 0;
      const f = Number(r.failedOrdersByRider) || 0;
      const vReq = Number(r.totalVerificationRequests) || 0;
      const vSuc = Number(r.successfulVerificationRequests) || 0;

      grossOrders += g;
      completedOrders += c;
      inTimeOrders += it;
      failedOrders += f;
      verificationReq += vReq;
      verificationSuccess += vSuc;

      if (g > 0 || c > 0) activeDays++;

      if (r.finalDeliveryQualityScore !== null && r.finalDeliveryQualityScore !== undefined) {
        qualitySum += Number(r.finalDeliveryQualityScore);
        qualityCount++;
      }
      if (r.onTimeDeliveryScore !== null && r.onTimeDeliveryScore !== undefined) {
        onTimeSum += Number(r.onTimeDeliveryScore);
        onTimeCount++;
      }

      if (r.riderName) latestRiderName = r.riderName;
      if (r.segment) {
        latestSegment = r.segment;
        const seg = String(r.segment).toUpperCase().trim();
        segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
      }
      if (r.substituteRiderName) {
        latestSubstituteRiderName = r.substituteRiderName;
      }
    });

    const completionRate = grossOrders > 0 ? (completedOrders / grossOrders) : null;
    const inTimeRate = completedOrders > 0 ? (inTimeOrders / completedOrders) : null;
    const cancellationRate = grossOrders > 0 ? (failedOrders / grossOrders) : null;
    const verificationRate = verificationReq > 0 ? (verificationSuccess / verificationReq) : null;
    const avgQuality = qualityCount > 0 ? (qualitySum / qualityCount) : null;
    const avgOnTime = onTimeCount > 0 ? (onTimeSum / onTimeCount) : null;
    const avgOrdersPerDay = activeDays > 0 ? (completedOrders / activeDays) : null;

    return {
      riderName: latestRiderName || workingId,
      latestSegment,
      latestSubstituteRiderName,
      totalRecords: records.length,
      grossOrders,
      completedOrders,
      inTimeOrders,
      failedOrders,
      verificationReq,
      verificationSuccess,
      activeDays,
      completionRate,
      inTimeRate,
      cancellationRate,
      verificationRate,
      avgQuality,
      avgOnTime,
      avgOrdersPerDay,
      segmentCounts,
    };
  }, [records, workingId]);

  // Prepare data for Recharts (Chronological: oldest to newest)
  const chartData = useMemo(() => {
    return [...records]
      .sort((a, b) => String(a.performanceDate || '').localeCompare(String(b.performanceDate || '')))
      .map((r) => {
        const dStr = r.performanceDate ? String(r.performanceDate).split('T')[0] : '';
        const shortDate = dStr ? dStr.slice(5) : '';
        const qScore = r.finalDeliveryQualityScore !== null && r.finalDeliveryQualityScore !== undefined
          ? Math.round(Number(r.finalDeliveryQualityScore) <= 1 ? Number(r.finalDeliveryQualityScore) * 100 : Number(r.finalDeliveryQualityScore))
          : null;
        const oScore = r.onTimeDeliveryScore !== null && r.onTimeDeliveryScore !== undefined
          ? Math.round(Number(r.onTimeDeliveryScore) <= 1 ? Number(r.onTimeDeliveryScore) * 100 : Number(r.onTimeDeliveryScore))
          : null;

        return {
          date: shortDate,
          fullDate: dStr,
          segment: r.segment || '-',
          grossOrders: Number(r.grossOrders) || 0,
          completedOrders: Number(r.completedOrders) || 0,
          inTimeOrders: Number(r.completedOrdersInTime) || 0,
          qualityScore: qScore,
          onTimeScore: oScore,
        };
      });
  }, [records]);

  // Export single rider records to Excel
  const handleExportRiderExcel = () => {
    if (records.length === 0) {
      showNotification('error', t.noRecords);
      return;
    }

    const exportRows = records.map((r) => ({
      ID: r.id,
      'Working ID': r.workingId || r.sourceRiderId,
      Rider: r.riderName || stats.riderName,
      'Substitute Note': r.substituteRiderName
        ? (isRtl ? `يستخدم الحساب بواسطة: ${r.substituteRiderName}` : `Account used by: ${r.substituteRiderName}`)
        : '-',
      Date: r.performanceDate ? String(r.performanceDate).split('T')[0] : '-',
      Day: isRtl ? getArabicDayName(r.performanceDate) : getEnglishDayName(r.performanceDate),
      Segment: r.segment || '-',
      'Gross Orders': r.grossOrders ?? 0,
      'Completed Orders': r.completedOrders ?? 0,
      'Completed Orders In Time': r.completedOrdersInTime ?? 0,
      'Failed Orders By Rider': r.failedOrdersByRider ?? 0,
      'On Time Delivery Score': r.onTimeDeliveryScore ?? 0,
      'Final Delivery Quality Score': r.finalDeliveryQualityScore ?? 0,
      'Total Verification Requests': r.totalVerificationRequests ?? 0,
      'Successful Verification Requests': r.successfulVerificationRequests ?? 0,
      'Verification Success Rate': r.verificationSuccessRate ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rider_Performance');
    XLSX.writeFile(wb, `Member_Rider_${workingId}_Performance_${getTodayDate()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-blue-100/50 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page Header with Back Button */}
      <PageHeader
        title={`${t.pageTitle}: ${stats.riderName}`}
        subtitle={`${t.pageSubtitle} ${workingId}`}
        icon={Award}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/member/reports/rider-daily-performance"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              <span>{t.backToTable}</span>
            </Link>
            <button
              onClick={handleExportRiderExcel}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={15} />
              <span>{t.exportExcel}</span>
            </button>
            <button
              onClick={fetchRiderRecords}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>{t.refresh}</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow-sm border ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="shrink-0 text-green-600" size={20} />
            ) : (
              <AlertCircle className="shrink-0 text-red-600" size={20} />
            )}
            <span className="flex-1 text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-700 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Info Banner & Date Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Rider Profile Card */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-lg shadow-2xs">
              <User size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-gray-900">{stats.riderName}</h2>
                {stats.latestSegment && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-extrabold border ${getSegmentBadgeColor(
                      stats.latestSegment
                    )}`}
                  >
                    {t.segment}: {stats.latestSegment}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold">
                  {workingId}
                </span>
                {stats.latestSubstituteRiderName && (
                  <span
                    className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 font-medium inline-flex items-center gap-1"
                    title={isRtl ? `يستخدم الحساب بواسطة: ${stats.latestSubstituteRiderName}` : `Account used by: ${stats.latestSubstituteRiderName}`}
                  >
                    <Info size={11} className="text-amber-500 shrink-0" />
                    <span>
                      {isRtl ? `يستخدم بواسطة: ${stats.latestSubstituteRiderName}` : `Used by: ${stats.latestSubstituteRiderName}`}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Period Presets & Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => {
                  setStartDate(getPastDate(6));
                  setEndDate(getTodayDate());
                }}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-white rounded-lg transition"
              >
                {t.last7Days}
              </button>
              <button
                onClick={() => {
                  setStartDate(getPastDate(13));
                  setEndDate(getTodayDate());
                }}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-white rounded-lg transition"
              >
                {t.last14Days}
              </button>
              <button
                onClick={() => {
                  setStartDate(getFirstDayOfCurrentMonth());
                  setEndDate(getYesterdayDate());
                }}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-white rounded-lg transition"
              >
                {t.thisMonth}
              </button>
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-white rounded-lg transition"
              >
                {t.allTime}
              </button>
            </div>

            {/* Start / End Date */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
              <span className="text-gray-400 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* KPI & PERCENTAGES CARDS GRID */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp size={15} className="text-blue-600" />
            <span>{t.kpiTitle}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Final Quality Score */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.qualityScore}</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Award size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {formatPercent(stats.avgQuality)}
              </div>
            </div>

            {/* On-Time Score */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.onTimeScore}</span>
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><Clock size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {formatPercent(stats.avgOnTime)}
              </div>
            </div>

            {/* Verification Success Rate */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.verificationRate}</span>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Percent size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {formatPercent(stats.verificationRate)}
              </div>
            </div>

            {/* Order Completion Rate */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.completionRate}</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><PackageCheck size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {formatPercent(stats.completionRate)}
              </div>
            </div>

            {/* In-Time Delivery Rate */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.inTimeCompletionRate}</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><CheckCircle2 size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {formatPercent(stats.inTimeRate)}
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.cancellationRate}</span>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><AlertTriangle size={15} /></div>
              </div>
              <div className={`mt-2 text-xl font-extrabold ${stats.cancellationRate && stats.cancellationRate > 0.05 ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatPercent(stats.cancellationRate)}
              </div>
            </div>

            {/* Total Gross Orders */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.totalGrossOrders}</span>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><BarChart2 size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {stats.grossOrders.toLocaleString()}
              </div>
            </div>

            {/* Total Completed Orders */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.totalCompletedOrders}</span>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><CheckCircle2 size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {stats.completedOrders.toLocaleString()}
              </div>
            </div>

            {/* In-Time Orders */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.totalInTimeOrders}</span>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Clock size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {stats.inTimeOrders.toLocaleString()}
              </div>
            </div>

            {/* Failed Orders */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.totalFailedByRider}</span>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><AlertTriangle size={15} /></div>
              </div>
              <div className={`mt-2 text-xl font-extrabold ${stats.failedOrders > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {stats.failedOrders}
              </div>
            </div>

            {/* Active Days */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.activeDays}</span>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Calendar size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {stats.activeDays}
              </div>
            </div>

            {/* Avg Orders Per Day */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">{t.avgOrdersPerDay}</span>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><TrendingUp size={15} /></div>
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                {stats.avgOrdersPerDay !== null ? stats.avgOrdersPerDay.toFixed(1) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
              <h3 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-600" />
                <span>{t.ordersTrendTitle}</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="completedOrders" name={t.completedOrders} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="grossOrders" name={t.grossOrders} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scores Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
              <h3 className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <span>{t.scoresTrendTitle}</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      formatter={(val) => [`${val}%`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="qualityScore" name={t.qualityScorePct} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="onTimeScore" name={t.onTimeScorePct} stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* CHRONOLOGICAL DAILY BREAKDOWN TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={17} className="text-blue-600" />
              <span>{t.dailyBreakdownTitle}</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {records.length} {t.activeDays}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[600px] relative scrollbar-thin">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-slate-100 text-slate-800 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-300">
                <tr>
                  <th className="px-3 py-2.5 text-start">{t.date}</th>
                  <th className="px-3 py-2.5 text-center">{t.dayOfWeek}</th>
                  <th className="px-3 py-2.5 text-center">{t.segment}</th>
                  <th className="px-3 py-2.5 text-center">{t.ordersCompletedGross}</th>
                  <th className="px-3 py-2.5 text-center">{t.inTimeOrdersCol}</th>
                  <th className="px-3 py-2.5 text-center">{t.failedOrdersCol}</th>
                  <th className="px-3 py-2.5 text-center">{t.onTimeScoreCol}</th>
                  <th className="px-3 py-2.5 text-center">{t.qualityScoreCol}</th>
                  <th className="px-3 py-2.5 text-center">{t.verificationCol}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="animate-spin text-blue-600" size={28} />
                        <span className="text-xs font-semibold">{isRtl ? 'جاري تحميل السجلات...' : 'Loading records...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={28} className="text-gray-300" />
                        <span className="text-xs font-semibold">{t.noRecords}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const dateStr = record.performanceDate ? String(record.performanceDate).split('T')[0] : '';
                    const dayName = isRtl ? getArabicDayName(dateStr) : getEnglishDayName(dateStr);
                    const gross = Number(record.grossOrders) || 0;
                    const completed = Number(record.completedOrders) || 0;
                    const inTime = Number(record.completedOrdersInTime) || 0;
                    const failed = Number(record.failedOrdersByRider) || 0;

                    return (
                      <tr
                        key={record.id || dateStr}
                        onClick={() => setSelectedDayRecord(record)}
                        className="hover:bg-blue-50/50 transition cursor-pointer"
                        title={isRtl ? 'اضغط لعرض تفاصيل اليوم' : 'Click to view day details'}
                      >
                        {/* Date */}
                        <td className="px-3 py-2 whitespace-nowrap font-mono font-bold text-gray-900">
                          {dateStr}
                        </td>

                        {/* Day of Week */}
                        <td className="px-3 py-2 text-center text-gray-600 font-medium">
                          {dayName}
                        </td>

                        {/* Segment */}
                        <td className="px-3 py-2 text-center">
                          {record.segment ? (
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded border ${getSegmentBadgeColor(
                                record.segment
                              )}`}
                            >
                              {record.segment}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Orders (Completed / Gross) */}
                        <td className="px-3 py-2 text-center font-mono font-bold">
                          <span className="text-blue-900">{completed}</span>
                          <span className="text-gray-400 font-normal mx-1">/</span>
                          <span className="text-gray-600">{gross}</span>
                        </td>

                        {/* In-Time Orders */}
                        <td className="px-3 py-2 text-center font-mono font-bold text-gray-800">
                          {inTime}
                        </td>

                        {/* Failed Orders */}
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                              failed > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-gray-400'
                            }`}
                          >
                            {failed}
                          </span>
                        </td>

                        {/* On-Time Score */}
                        <td className="px-3 py-2 text-center font-mono font-bold text-teal-800">
                          {formatPercent(record.onTimeDeliveryScore)}
                        </td>

                        {/* Quality Score */}
                        <td className="px-3 py-2 text-center font-mono font-bold text-amber-800">
                          {formatPercent(record.finalDeliveryQualityScore)}
                        </td>

                        {/* Verification */}
                        <td className="px-3 py-2 text-center font-mono">
                          <span className="font-bold text-purple-900">
                            {formatPercent(record.verificationSuccessRate)}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-normal">
                            ({record.successfulVerificationRequests ?? 0}/{record.totalVerificationRequests ?? 0})
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DAY PERFORMANCE DETAILS MODAL */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Award size={20} />
                <h3 className="text-base font-bold">{t.dayDetailsTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedDayRecord(null)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">{t.workingId}</div>
                  <div className="text-sm font-extrabold text-blue-900 font-mono">
                    {selectedDayRecord.workingId || selectedDayRecord.sourceRiderId || workingId}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-slate-500 font-semibold">{t.date}</div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">
                    {selectedDayRecord.performanceDate ? String(selectedDayRecord.performanceDate).split('T')[0] : '-'}
                  </div>
                  {selectedDayRecord.segment && (
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getSegmentBadgeColor(selectedDayRecord.segment)}`}>
                        {t.segment}: {selectedDayRecord.segment}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.grossOrders}</span>
                  <span className="text-lg font-bold text-slate-900">{selectedDayRecord.grossOrders ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.completedOrders}</span>
                  <span className="text-lg font-bold text-emerald-700">{selectedDayRecord.completedOrders ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.inTimeOrdersCol}</span>
                  <span className="text-lg font-bold text-blue-700">{selectedDayRecord.completedOrdersInTime ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.failedOrdersCol}</span>
                  <span className={`text-lg font-bold ${Number(selectedDayRecord.failedOrdersByRider) > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {selectedDayRecord.failedOrdersByRider ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.onTimeScoreCol}</span>
                  <span className="text-lg font-bold text-teal-700">
                    {formatPercent(selectedDayRecord.onTimeDeliveryScore)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.qualityScoreCol}</span>
                  <span className="text-lg font-bold text-amber-700">
                    {formatPercent(selectedDayRecord.finalDeliveryQualityScore)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.verificationRate}</span>
                  <span className="text-lg font-bold text-purple-700">
                    {formatPercent(selectedDayRecord.verificationSuccessRate)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.successfulVerificationRequests} / {t.totalVerificationRequests}</span>
                  <span className="text-lg font-bold text-slate-800">
                    {selectedDayRecord.successfulVerificationRequests ?? 0} / {selectedDayRecord.totalVerificationRequests ?? 0}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDayRecord(null)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberRiderDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    }>
      <MemberRiderDetailsContent />
    </Suspense>
  );
}
