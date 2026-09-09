'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart2,
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Percent,
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  ShieldCheck,
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
    sourceId: 'Source ID',
    systemId: 'System ID',
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
    actions: 'Actions',

    // Actions & Modals
    addRecord: 'Add Daily Record',
    exportExcel: 'Export Rider Excel',
    editRecord: 'Edit Record',
    deleteRecord: 'Delete Record',
    deleteConfirmTitle: 'Confirm Delete',
    deleteConfirmText: 'Are you sure you want to delete this performance record for date',
    deleteSuccess: 'Record deleted successfully',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    processing: 'Processing...',
    noRecordsFound: 'No performance records found for this rider in the selected period.',
    createModalTitle: 'Add Daily Performance Record',
    editModalTitle: 'Edit Daily Performance Record',
    riderWorkingId: 'Rider Working ID',
    performanceDate: 'Performance Date',
    totalVerificationRequests: 'Total Verification Requests',
    successfulVerificationRequests: 'Successful Verification Requests',
    verificationSuccessRate: 'Verification Success Rate (0.00 - 1.00)',
    grossOrdersLabel: 'Gross Orders',
    completedOrdersLabel: 'Completed Orders',
    completedOrdersInTimeLabel: 'Completed Orders In Time',
    failedOrdersByRiderLabel: 'Failed Orders By Rider',
    onTimeDeliveryScoreLabel: 'On-Time Delivery Score (0.00 - 1.00)',
    finalDeliveryQualityScoreLabel: 'Final Delivery Quality Score (0.00 - 1.00)',
    segmentLabel: 'Segment',
    updateSuccess: 'Record updated successfully',
    createSuccess: 'Record created successfully',
  },
  ar: {
    backToTable: 'العودة لجدول أداء المناديب',
    pageTitle: 'تفاصيل ونسب أداء المندوب',
    pageSubtitle: 'المؤشرات التفصيلية والنسب المئوية وسجل الأداء اليومي للمندوب',
    riderInfo: 'بيانات المندوب',
    workingId: 'الرقم التعريفي (Working ID)',
    riderName: 'اسم المندوب',
    accountOwner: 'صاحب الحساب',
    accountUsedBy: 'يستخدم الحساب بواسطة: ',
    substituteNote: 'ملاحظة البديل',
    sourceId: 'معرف المصدر',
    systemId: 'معرف النظام',
    currentSegment: 'الشريحة الحالية',
    period: 'الفترة الزمنية',
    startDate: 'من تاريخ',
    endDate: 'إلى تاريخ',
    allTime: 'كل الفترات',
    last7Days: 'آخر 7 أيام',
    last14Days: 'آخر 14 يوم',
    last30Days: 'آخر 30 يوم',
    thisMonth: 'هذا الشهر',
    filter: 'تصفية',
    reset: 'إعادة ضبط',
    refresh: 'تحديث',

    // KPI & Percentages Cards
    kpiTitle: 'النسب والمؤشرات الرئيسية للأداء',
    qualityScore: 'معدل جودة التوصيل النهائية',
    onTimeScore: 'معدل دقة التوصيل في الوقت',
    verificationRate: 'نسبة نجاح طلبات التحقق',
    completionRate: 'نسبة إنجاز الطلبات',
    inTimeCompletionRate: 'نسبة التوصيل بالوقت من المكتمل',
    cancellationRate: 'نسبة الإلغاء بسبب المندوب',
    totalGrossOrders: 'إجمالي الطلبات المستلمة',
    totalCompletedOrders: 'إجمالي الطلبات المكتملة',
    totalInTimeOrders: 'الطلبات المكتملة بالوقت',
    totalFailedByRider: 'الملغاة بسبب المندوب',
    activeDays: 'أيام العمل المسجلة',
    avgOrdersPerDay: 'متوسط الطلبات / يوم',
    segmentDistribution: 'توزيع الشرائح',

    // Charts
    ordersTrendTitle: 'مخطط حركة الطلبات اليومية (المكتملة مقابل الإجمالي)',
    scoresTrendTitle: 'مخطط نسب الأداء اليومية (جودة التوصيل ودقة المواعيد)',
    grossOrders: 'إجمالي الطلبات',
    completedOrders: 'الطلبات المكتملة',
    inTimeOrders: 'المكتملة في الوقت',
    qualityScorePct: 'نسبة جودة التوصيل %',
    onTimeScorePct: 'نسبة دقة المواعيد %',

    // Table
    dailyBreakdownTitle: 'السجل اليومي التفصيلي لأداء المندوب',
    date: 'التاريخ',
    dayOfWeek: 'اليوم',
    segment: 'الشريحة',
    ordersCompletedGross: 'الطلبات (المكتملة / الإجمالي)',
    inTimeOrdersCol: 'في الوقت المحدد',
    failedOrdersCol: 'الملغاة بسبب المندوب',
    onTimeScoreCol: 'دقة المواعيد',
    qualityScoreCol: 'جودة التوصيل',
    verificationCol: 'التحقق (ناجح / إجمالي)',
    actions: 'الإجراءات',

    // Actions & Modals
    addRecord: 'إضافة سجل يومي',
    exportExcel: 'تصدير إكسيل للمندوب',
    editRecord: 'تعديل السجل',
    deleteRecord: 'حذف السجل',
    deleteConfirmTitle: 'تأكيد الحذف',
    deleteConfirmText: 'هل أنت متأكد من حذف سجل الأداء لهذا المندوب بتاريخ',
    deleteSuccess: 'تم حذف السجل بنجاح',
    saveChanges: 'حفظ التعديلات',
    cancel: 'إلغاء',
    processing: 'جاري المعالجة...',
    noRecordsFound: 'لا توجد سجلات أداء مسجلة لهذا المندوب في الفترة المحددة.',
    createModalTitle: 'إضافة سجل أداء يومي للمندوب',
    editModalTitle: 'تعديل سجل أداء المندوب',
    riderWorkingId: 'الرقم التعريفي للمندوب',
    performanceDate: 'تاريخ الأداء',
    totalVerificationRequests: 'إجمالي طلبات التحقق',
    successfulVerificationRequests: 'طلبات التحقق الناجحة',
    verificationSuccessRate: 'نسبة نجاح التحقق (0.00 - 1.00)',
    grossOrdersLabel: 'إجمالي الطلبات المستلمة',
    completedOrdersLabel: 'الطلبات المكتملة',
    completedOrdersInTimeLabel: 'المكتملة في الوقت المحدد',
    failedOrdersByRiderLabel: 'الملغاة بسبب المندوب',
    onTimeDeliveryScoreLabel: 'درجة دقة التوصيل في الوقت (0.00 - 1.00)',
    finalDeliveryQualityScoreLabel: 'درجة جودة التوصيل النهائية (0.00 - 1.00)',
    segmentLabel: 'الشريحة',
    updateSuccess: 'تم تحديث سجل الأداء بنجاح',
    createSuccess: 'تم إنشاء سجل الأداء بنجاح',
  },
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

const formatPercent = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const num = Number(val);
  const pct = num <= 1 ? num * 100 : num;
  return `${pct.toFixed(decimals)}%`;
};

const getArabicDayName = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', { weekday: 'long' });
};

const getEnglishDayName = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
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

const getDefaultEndDate = () => {
  return getYesterdayDate();
};

const getPastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDateLocal(d);
};

function RiderDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const t = translations[isRtl ? 'ar' : 'en'];

  const rawWorkingId = params?.workingId || '';
  const workingId = decodeURIComponent(rawWorkingId);

  // Date filters: details start date is the first day of this month and end date is yesterday
  const initialStartDate = getFirstDayOfCurrentMonth();
  const initialEndDate = getYesterdayDate();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    riderWorkingId: workingId,
    riderName: '',
    substituteRiderName: null,
    performanceDate: getTodayDate(),
    totalVerificationRequests: '',
    successfulVerificationRequests: '',
    verificationSuccessRate: '',
    grossOrders: '',
    completedOrders: '',
    completedOrdersInTime: '',
    failedOrdersByRider: '',
    onTimeDeliveryScore: '',
    finalDeliveryQualityScore: '',
    segment: 'B',
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch records for this rider
  const fetchRiderRecords = useCallback(async () => {
    if (!workingId) return;
    setLoading(true);
    try {
      const query = { workingId };
      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;

      const data = await ApiService.get(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.LIST, query);

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
      console.error('Failed to load rider details:', err);
      showNotification('error', err?.message || 'Error loading records');
    } finally {
      setLoading(false);
    }
  }, [workingId, startDate, endDate]);

  useEffect(() => {
    fetchRiderRecords();
  }, [fetchRiderRecords]);

  // Derive Rider Profile
  const riderProfile = useMemo(() => {
    const first = records[0] || {};
    const latestWithSubstitute = records.find((r) => r.substituteRiderName);
    return {
      workingId: workingId,
      riderName: first.riderName || workingId,
      riderId: first.riderId || null,
      sourceRiderId: first.sourceRiderId || first.workingId || workingId,
      currentSegment: first.segment || records.find((r) => r.segment)?.segment || '-',
      substituteRiderName: latestWithSubstitute ? latestWithSubstitute.substituteRiderName : null,
    };
  }, [records, workingId]);

  // Aggregated KPIs and Percentages
  const kpis = useMemo(() => {
    if (records.length === 0) {
      return {
        count: 0,
        grossOrders: 0,
        completedOrders: 0,
        inTimeOrders: 0,
        failedOrders: 0,
        avgQualityScore: null,
        avgOnTimeScore: null,
        verificationRate: null,
        totalVerificationRequests: 0,
        successfulVerificationRequests: 0,
        completionRate: null,
        inTimeRate: null,
        cancellationRate: null,
        avgOrdersPerDay: 0,
        segmentCounts: {},
      };
    }

    let grossOrders = 0;
    let completedOrders = 0;
    let inTimeOrders = 0;
    let failedOrders = 0;
    let totalVerifReq = 0;
    let successVerifReq = 0;

    let qualityScoreSum = 0;
    let qualityScoreCount = 0;
    let onTimeScoreSum = 0;
    let onTimeScoreCount = 0;
    let workingDaysCount = 0;

    const segmentCounts = {};

    records.forEach((r) => {
      const gross = Number(r.grossOrders) || 0;
      const completed = Number(r.completedOrders) || 0;
      if (gross > 0 || completed > 0) {
        workingDaysCount++;
      }

      grossOrders += gross;
      completedOrders += completed;
      inTimeOrders += Number(r.completedOrdersInTime) || 0;
      failedOrders += Number(r.failedOrdersByRider) || 0;
      totalVerifReq += Number(r.totalVerificationRequests) || 0;
      successVerifReq += Number(r.successfulVerificationRequests) || 0;

      if (r.finalDeliveryQualityScore !== null && r.finalDeliveryQualityScore !== undefined) {
        qualityScoreSum += Number(r.finalDeliveryQualityScore);
        qualityScoreCount++;
      }
      if (r.onTimeDeliveryScore !== null && r.onTimeDeliveryScore !== undefined) {
        onTimeScoreSum += Number(r.onTimeDeliveryScore);
        onTimeScoreCount++;
      }

      if (r.segment) {
        const seg = String(r.segment).trim().toUpperCase();
        segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
      }
    });

    const avgQuality = qualityScoreCount > 0 ? qualityScoreSum / qualityScoreCount : null;
    const avgOnTime = onTimeScoreCount > 0 ? onTimeScoreSum / onTimeScoreCount : null;
    const verifRate = totalVerifReq > 0 ? successVerifReq / totalVerifReq : null;

    const completionRate = grossOrders > 0 ? (completedOrders / grossOrders) : null;
    const inTimeRate = completedOrders > 0 ? (inTimeOrders / completedOrders) : null;
    const cancellationRate = grossOrders > 0 ? (failedOrders / grossOrders) : null;

    return {
      count: workingDaysCount,
      totalRecordsCount: records.length,
      grossOrders,
      completedOrders,
      inTimeOrders,
      failedOrders,
      avgQualityScore: avgQuality,
      avgOnTimeScore: avgOnTime,
      verificationRate: verifRate,
      totalVerificationRequests: totalVerifReq,
      successfulVerificationRequests: successVerifReq,
      completionRate,
      inTimeRate,
      cancellationRate,
      avgOrdersPerDay: workingDaysCount > 0 ? (completedOrders / workingDaysCount).toFixed(1) : 0,
      segmentCounts,
    };
  }, [records]);

  // Chart data (sorted chronologically oldest to newest)
  const chartData = useMemo(() => {
    return [...records]
      .sort((a, b) => String(a.performanceDate || '').localeCompare(String(b.performanceDate || '')))
      .map((r) => {
        const dateStr = r.performanceDate ? String(r.performanceDate).split('T')[0] : '';
        const dayLabel = dateStr ? dateStr.slice(5) : '';
        const qualityPct =
          r.finalDeliveryQualityScore !== null && r.finalDeliveryQualityScore !== undefined
            ? Number((Number(r.finalDeliveryQualityScore) <= 1 ? Number(r.finalDeliveryQualityScore) * 100 : Number(r.finalDeliveryQualityScore)).toFixed(1))
            : null;
        const onTimePct =
          r.onTimeDeliveryScore !== null && r.onTimeDeliveryScore !== undefined
            ? Number((Number(r.onTimeDeliveryScore) <= 1 ? Number(r.onTimeDeliveryScore) * 100 : Number(r.onTimeDeliveryScore)).toFixed(1))
            : null;

        return {
          date: dateStr,
          label: dayLabel,
          grossOrders: Number(r.grossOrders) || 0,
          completedOrders: Number(r.completedOrders) || 0,
          inTimeOrders: Number(r.completedOrdersInTime) || 0,
          qualityScore: qualityPct,
          onTimeScore: onTimePct,
          segment: r.segment || '',
        };
      });
  }, [records]);

  // Presets
  const handleSetPreset = (days) => {
    if (days === 0) {
      // Today
      const today = getTodayDate();
      setStartDate(today);
      setEndDate(today);
    } else if (days === 'month') {
      setStartDate(getFirstDayOfCurrentMonth());
      setEndDate(getYesterdayDate());
    } else if (days === 'all') {
      setStartDate('');
      setEndDate('');
    } else {
      setStartDate(getPastDate(days - 1));
      setEndDate(getTodayDate());
    }
  };

  // Form Handlers
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      riderWorkingId: workingId,
      performanceDate: getTodayDate(),
      totalVerificationRequests: '',
      successfulVerificationRequests: '',
      verificationSuccessRate: '',
      grossOrders: '',
      completedOrders: '',
      completedOrdersInTime: '',
      failedOrdersByRider: '',
      onTimeDeliveryScore: '',
      finalDeliveryQualityScore: '',
      segment: riderProfile.currentSegment !== '-' ? riderProfile.currentSegment : 'B',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setIsEditing(true);
    setEditingId(rec.id);
    setFormData({
      riderWorkingId: rec.workingId || rec.sourceRiderId || workingId,
      riderName: rec.riderName || riderProfile.riderName || workingId,
      substituteRiderName: rec.substituteRiderName || null,
      performanceDate: rec.performanceDate ? String(rec.performanceDate).split('T')[0] : getTodayDate(),
      totalVerificationRequests: rec.totalVerificationRequests ?? '',
      successfulVerificationRequests: rec.successfulVerificationRequests ?? '',
      verificationSuccessRate: rec.verificationSuccessRate ?? '',
      grossOrders: rec.grossOrders ?? '',
      completedOrders: rec.completedOrders ?? '',
      completedOrdersInTime: rec.completedOrdersInTime ?? '',
      failedOrdersByRider: rec.failedOrdersByRider ?? '',
      onTimeDeliveryScore: rec.onTimeDeliveryScore ?? '',
      finalDeliveryQualityScore: rec.finalDeliveryQualityScore ?? '',
      segment: rec.segment || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'totalVerificationRequests' || name === 'successfulVerificationRequests') {
        const total = Number(name === 'totalVerificationRequests' ? value : updated.totalVerificationRequests);
        const success = Number(name === 'successfulVerificationRequests' ? value : updated.successfulVerificationRequests);
        if (total > 0 && !isNaN(success)) {
          updated.verificationSuccessRate = (Math.min(success, total) / total).toFixed(3);
        }
      }
      return updated;
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmittingForm(true);
    try {
      const payload = {
        riderWorkingId: workingId,
        performanceDate: formData.performanceDate,
        totalVerificationRequests: formData.totalVerificationRequests !== '' ? Number(formData.totalVerificationRequests) : 0,
        successfulVerificationRequests: formData.successfulVerificationRequests !== '' ? Number(formData.successfulVerificationRequests) : 0,
        verificationSuccessRate: formData.verificationSuccessRate !== '' ? Number(formData.verificationSuccessRate) : 0,
        grossOrders: formData.grossOrders !== '' ? Number(formData.grossOrders) : 0,
        completedOrders: formData.completedOrders !== '' ? Number(formData.completedOrders) : 0,
        completedOrdersInTime: formData.completedOrdersInTime !== '' ? Number(formData.completedOrdersInTime) : 0,
        failedOrdersByRider: formData.failedOrdersByRider !== '' ? Number(formData.failedOrdersByRider) : 0,
        onTimeDeliveryScore: formData.onTimeDeliveryScore !== '' ? Number(formData.onTimeDeliveryScore) : 0,
        finalDeliveryQualityScore: formData.finalDeliveryQualityScore !== '' ? Number(formData.finalDeliveryQualityScore) : 0,
        segment: formData.segment ? formData.segment.trim().toUpperCase() : undefined,
      };

      if (isEditing) {
        await ApiService.put(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.UPDATE(editingId), payload);
        showNotification('success', t.updateSuccess);
      } else {
        await ApiService.post(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.CREATE, payload);
        showNotification('success', t.createSuccess);
      }
      setIsFormModalOpen(false);
      fetchRiderRecords();
    } catch (err) {
      console.error('Error saving record:', err);
      showNotification('error', err?.message || 'Error occurred');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleOpenDelete = (rec) => {
    setDeletingRecord(rec);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await ApiService.delete(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.DELETE(deletingRecord.id));
      showNotification('success', t.deleteSuccess);
      setIsDeleteModalOpen(false);
      setDeletingRecord(null);
      fetchRiderRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      showNotification('error', err?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Export to Excel for this rider
  const handleExportExcel = () => {
    if (records.length === 0) return;
    const exportData = records.map((r) => ({
      'Working ID': r.workingId || workingId,
      Rider: r.riderName || workingId,
      'Performance Date': r.performanceDate ? String(r.performanceDate).split('T')[0] : '-',
      Day: isRtl ? getArabicDayName(r.performanceDate) : getEnglishDayName(r.performanceDate),
      'Substitute Note': r.substituteRiderName
        ? (isRtl ? `يستخدم الحساب بواسطة: ${r.substituteRiderName}` : `Account used by: ${r.substituteRiderName}`)
        : '-',
      Segment: r.segment || '-',
      'Gross Orders': r.grossOrders ?? 0,
      'Completed Orders': r.completedOrders ?? 0,
      'In-Time Orders': r.completedOrdersInTime ?? 0,
      'Failed Orders By Rider': r.failedOrdersByRider ?? 0,
      'On-Time Delivery Score': r.onTimeDeliveryScore ?? 0,
      'Final Quality Score': r.finalDeliveryQualityScore ?? 0,
      'Verification Success Rate': r.verificationSuccessRate ?? 0,
      'Successful Verification': r.successfulVerificationRequests ?? 0,
      'Total Verification': r.totalVerificationRequests ?? 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rider_Performance');
    XLSX.writeFile(wb, `Rider_${workingId}_Performance_${getTodayDate()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-blue-100/50 pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <PageHeader
        title={`${t.pageTitle}: ${riderProfile.riderName}`}
        subtitle={`${t.pageSubtitle} ${workingId}`}
        icon={Award}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/shifts/rider-daily-performance"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              <span>{t.backToTable}</span>
            </Link>
            <button
              onClick={handleOpenCreate}
              className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={15} />
              <span>{t.addRecord}</span>
            </button>
            <button
              onClick={handleExportExcel}
              disabled={records.length === 0}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={15} />
              <span>{t.exportExcel}</span>
            </button>
            <button
              onClick={fetchRiderRecords}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2 rounded-xl text-xs transition"
              title={t.refresh}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow-xs border ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="shrink-0 text-emerald-600" size={18} />
            ) : (
              <AlertCircle className="shrink-0 text-rose-600" size={18} />
            )}
            <span className="flex-1 text-xs font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-700">
              ✕
            </button>
          </div>
        )}

        {/* Rider Profile Card & Date Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Rider Info */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs font-black text-lg shrink-0">
                {riderProfile.riderName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg font-extrabold text-slate-900">{riderProfile.riderName}</h2>
                  {riderProfile.currentSegment && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getSegmentBadgeColor(
                        riderProfile.currentSegment
                      )}`}
                    >
                      {t.currentSegment}: {riderProfile.currentSegment}
                    </span>
                  )}
                  {riderProfile.substituteRiderName && (
                    <span
                      className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5"
                    >
                      <Info size={13} className="text-amber-600" />
                      <span>{isRtl ? `يستخدم الحساب بواسطة: ${riderProfile.substituteRiderName}` : `Account used by: ${riderProfile.substituteRiderName}`}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-mono">
                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {t.workingId}: {riderProfile.workingId}
                  </span>
                  {riderProfile.riderId && (
                    <span>
                      {t.systemId}: {riderProfile.riderId}
                    </span>
                  )}
                  {riderProfile.sourceRiderId && riderProfile.sourceRiderId !== riderProfile.workingId && (
                    <span>
                      {t.sourceId}: {riderProfile.sourceRiderId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Date Range Filter with Presets */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Calendar size={15} className="text-slate-500" />
                <span>{t.period}:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">→</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => handleSetPreset(7)}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition whitespace-nowrap"
                >
                  {t.last7Days}
                </button>
                <button
                  onClick={() => handleSetPreset(14)}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition whitespace-nowrap"
                >
                  {t.last14Days}
                </button>
                <button
                  onClick={() => handleSetPreset('month')}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition whitespace-nowrap"
                >
                  {t.thisMonth}
                </button>
                <button
                  onClick={() => handleSetPreset('all')}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition whitespace-nowrap"
                >
                  {t.allTime}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TOP KPI CARDS: KEY PERCENTAGES (UNIFIED COHESIVE PALETTE) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Quality Score % */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.qualityScore}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Award size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1.5">
              {formatPercent(kpis.avgQualityScore)}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, Number(kpis.avgQualityScore <= 1 ? kpis.avgQualityScore * 100 : kpis.avgQualityScore) || 0))}%`,
                }}
              />
            </div>
          </div>

          {/* On-Time Score % */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.onTimeScore}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Clock size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1.5">
              {formatPercent(kpis.avgOnTimeScore)}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, Number(kpis.avgOnTimeScore <= 1 ? kpis.avgOnTimeScore * 100 : kpis.avgOnTimeScore) || 0))}%`,
                }}
              />
            </div>
          </div>

          {/* Verification Success Rate % */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.verificationRate}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><ShieldCheck size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">
              {formatPercent(kpis.verificationRate)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {kpis.successfulVerificationRequests} / {kpis.totalVerificationRequests} requests
            </div>
          </div>

          {/* Order Completion Rate % */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.completionRate}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><CheckCircle2 size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">
              {formatPercent(kpis.completionRate)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {kpis.completedOrders.toLocaleString()} / {kpis.grossOrders.toLocaleString()} orders
            </div>
          </div>

          {/* In-Time Delivery Rate % */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.inTimeCompletionRate}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><PackageCheck size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">
              {formatPercent(kpis.inTimeRate)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {kpis.inTimeOrders.toLocaleString()} in-time
            </div>
          </div>

          {/* Cancellation by Rider Rate % */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">{t.cancellationRate}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><AlertTriangle size={16} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">
              {formatPercent(kpis.cancellationRate)}
            </div>
            <div className="text-[11px]">
              {kpis.failedOrders > 0 ? (
                <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                  {kpis.failedOrders} failed
                </span>
              ) : (
                <span className="text-slate-400 font-medium">0 failed</span>
              )}
            </div>
          </div>
        </div>

        {/* SECONDARY ROW: TOTALS & SEGMENT BREAKDOWN (UNIFIED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">{t.activeDays}</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{kpis.count}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><CalendarDays size={20} /></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">{t.avgOrdersPerDay}</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{kpis.avgOrdersPerDay}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><BarChart2 size={20} /></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">{t.totalCompletedOrders}</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{kpis.completedOrders.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><CheckCircle2 size={20} /></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">{t.segmentDistribution}</span>
              <div className="flex items-center gap-1.5 mt-1">
                {Object.keys(kpis.segmentCounts).length > 0 ? (
                  Object.entries(kpis.segmentCounts).map(([seg, cnt]) => (
                    <span
                      key={seg}
                      className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {seg}: {cnt}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600"><Award size={20} /></div>
          </div>
        </div>

        {/* VISUAL CHARTS (REFINED COHESIVE PALETTE) */}
        {chartData.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Orders Trend */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90">
              <h3 className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart2 className="text-slate-500" size={16} />
                <span>{t.ordersTrendTitle}</span>
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="grossOrders" name={t.grossOrders} fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="completedOrders" name={t.completedOrders} fill="#2563eb" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="inTimeOrders" name={t.inTimeOrders} fill="#38bdf8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scores Trend */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90">
              <h3 className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp className="text-slate-500" size={16} />
                <span>{t.scoresTrendTitle}</span>
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="qualityScore"
                      name={t.qualityScorePct}
                      stroke="#2563eb"
                      strokeWidth={2.2}
                      dot={{ r: 2.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="onTimeScore"
                      name={t.onTimeScorePct}
                      stroke="#64748b"
                      strokeWidth={2.2}
                      dot={{ r: 2.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* CHRONOLOGICAL DAILY PERFORMANCE TABLE */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CalendarDays size={18} className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">{t.dailyBreakdownTitle}</h3>
              <span className="bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {records.length} {t.activeDays}
              </span>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus size={13} />
              <span>{t.addRecord}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-[11px] font-extrabold text-gray-600 uppercase">
                <tr>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.date}
                  </th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.dayOfWeek}
                  </th>
                  <th className="px-2.5 py-2 text-center whitespace-nowrap">{t.segment}</th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.ordersCompletedGross}
                  </th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.inTimeOrdersCol}
                  </th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.failedOrdersCol}
                  </th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.onTimeScoreCol}
                  </th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.qualityScoreCol}
                  </th>
                  <th className="px-2.5 py-2 text-right rtl:text-right ltr:text-left whitespace-nowrap">
                    {t.verificationCol}
                  </th>
                  <th className="px-2.5 py-2 text-center whitespace-nowrap">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500">
                      <div className="inline-flex items-center gap-2 font-medium">
                        <RefreshCw className="animate-spin text-blue-600" size={20} />
                        <span>{t.processing}</span>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500">
                      <p className="text-sm font-medium">{t.noRecordsFound}</p>
                      <button
                        onClick={handleOpenCreate}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
                      >
                        <Plus size={14} />
                        <span>{t.addRecord}</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const dateStr = r.performanceDate ? String(r.performanceDate).split('T')[0] : '-';
                    const dayName = isRtl ? getArabicDayName(dateStr) : getEnglishDayName(dateStr);

                    return (
                      <tr key={r.id} className="hover:bg-blue-50/40 transition">
                        {/* Date */}
                        <td className="px-2.5 py-2 whitespace-nowrap font-mono font-bold text-slate-900 text-xs">
                          <div>{dateStr}</div>
                          {r.substituteRiderName && (
                            <div
                              className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 font-medium inline-flex items-center gap-1 max-w-[130px] truncate"
                              title={isRtl ? `يستخدم الحساب بواسطة: ${r.substituteRiderName}` : `Account used by: ${r.substituteRiderName}`}
                            >
                              <Info size={10} className="text-amber-600 shrink-0" />
                              <span className="truncate">
                                {isRtl ? `يستخدم الحساب بواسطة: ${r.substituteRiderName}` : `Account used by: ${r.substituteRiderName}`}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Day of Week */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-slate-600 text-xs font-medium">
                          {dayName}
                        </td>

                        {/* Segment */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-center">
                          {r.segment ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${getSegmentBadgeColor(
                                r.segment
                              )}`}
                            >
                              {r.segment}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Orders */}
                        <td className="px-2.5 py-2 whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-xs">
                            <span className={Number(r.completedOrders || 0) === 0 && Number(r.grossOrders || 0) === 0 ? "text-slate-400" : ""}>{r.completedOrders ?? 0}</span>
                            <span className="text-slate-400 mx-0.5 font-normal">/</span>
                            <span className={Number(r.completedOrders || 0) === 0 && Number(r.grossOrders || 0) === 0 ? "text-slate-400" : "text-slate-600"}>{r.grossOrders ?? 0}</span>
                          </span>
                        </td>

                        {/* In-Time Orders */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-slate-800 font-semibold text-xs">
                          {r.completedOrdersInTime ?? 0}
                        </td>

                        {/* Failed by Rider */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-xs">
                          <span
                            className={`font-bold ${
                              (Number(r.failedOrdersByRider) || 0) > 0 ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200' : 'text-slate-400'
                            }`}
                          >
                            {r.failedOrdersByRider ?? 0}
                          </span>
                        </td>

                        {/* On-Time Score */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-xs">
                          <span className="font-bold text-slate-900">
                            {r.onTimeDeliveryScore !== null && r.onTimeDeliveryScore !== undefined
                              ? formatPercent(r.onTimeDeliveryScore)
                              : '-'}
                          </span>
                        </td>

                        {/* Quality Score */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-xs">
                          <span className="font-bold text-slate-900">
                            {r.finalDeliveryQualityScore !== null && r.finalDeliveryQualityScore !== undefined
                              ? formatPercent(r.finalDeliveryQualityScore)
                              : '-'}
                          </span>
                        </td>

                        {/* Verification */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-slate-800 text-xs">
                          <span className="font-bold">
                            {r.successfulVerificationRequests ?? 0} / {r.totalVerificationRequests ?? 0}
                          </span>
                          <span className="text-slate-400 ml-1 text-[11px]">
                            ({formatPercent(r.verificationSuccessRate ?? 0)})
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-2.5 py-2 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
                              title={t.editRecord}
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(r)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition shadow-2xs"
                              title={t.deleteRecord}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
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

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit size={20} />
                <span>{isEditing ? t.editModalTitle : t.createModalTitle}</span>
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              {/* Substitute Note Banner when present */}
              {formData.substituteRiderName && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">
                      {isRtl ? `يستخدم الحساب بواسطة: ${formData.substituteRiderName}` : `Account used by: ${formData.substituteRiderName}`}
                    </span>
                    {formData.riderName && (
                      <span className="text-amber-700 ml-2 rtl:mr-2 text-[11px]">
                        ({t.accountOwner}: {formData.riderName})
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rider Working ID */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.riderWorkingId}
                  </label>
                  <input
                    type="text"
                    name="riderWorkingId"
                    value={formData.riderWorkingId}
                    disabled
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Performance Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.performanceDate} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="performanceDate"
                    value={formData.performanceDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Segment */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.segmentLabel}
                  </label>
                  <input
                    type="text"
                    name="segment"
                    value={formData.segment}
                    onChange={handleFormChange}
                    placeholder="e.g. A, B, C"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Verification Success Rate */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.verificationSuccessRate}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    name="verificationSuccessRate"
                    value={formData.verificationSuccessRate}
                    onChange={handleFormChange}
                    placeholder="0.875"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Total Verification Requests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.totalVerificationRequests}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="totalVerificationRequests"
                    value={formData.totalVerificationRequests}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Successful Verification Requests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.successfulVerificationRequests}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="successfulVerificationRequests"
                    value={formData.successfulVerificationRequests}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Gross Orders */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.grossOrdersLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="grossOrders"
                    value={formData.grossOrders}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Completed Orders */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.completedOrdersLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="completedOrders"
                    value={formData.completedOrders}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Completed Orders In Time */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.completedOrdersInTimeLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="completedOrdersInTime"
                    value={formData.completedOrdersInTime}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Failed Orders By Rider */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.failedOrdersByRiderLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="failedOrdersByRider"
                    value={formData.failedOrdersByRider}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* On-Time Delivery Score */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.onTimeDeliveryScoreLabel}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    name="onTimeDeliveryScore"
                    value={formData.onTimeDeliveryScore}
                    onChange={handleFormChange}
                    placeholder="0.91"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Final Delivery Quality Score */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {t.finalDeliveryQualityScoreLabel}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    name="finalDeliveryQualityScore"
                    value={formData.finalDeliveryQualityScore}
                    onChange={handleFormChange}
                    placeholder="0.89"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                >
                  {submittingForm && <RefreshCw className="animate-spin" size={14} />}
                  <span>{t.saveChanges}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <AlertCircle size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{t.deleteConfirmTitle}</h3>
                <p className="text-xs text-gray-500">
                  {workingId} - {deletingRecord?.performanceDate ? String(deletingRecord.performanceDate).split('T')[0] : ''}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {t.deleteConfirmText} {deletingRecord?.performanceDate ? String(deletingRecord.performanceDate).split('T')[0] : ''}?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting && <RefreshCw className="animate-spin" size={14} />}
                <span>{t.deleteRecord}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiderDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
        </div>
      }
    >
      <RiderDetailsContent />
    </Suspense>
  );
}
