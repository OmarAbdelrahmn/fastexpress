'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  Award,
  TrendingUp,
  BarChart2,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Sparkles,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const translations = {
  en: {
    title: 'Rider Daily Performance',
    subtitle: 'Comprehensive period matrix table for all riders with customizable daily metrics',
    totalRecords: 'Total Records',
    riderCount: 'Total Riders',
    grossOrders: 'Gross Orders',
    completedOrders: 'Completed Orders',
    avgQualityScore: 'Avg. Quality Score',
    avgOnTimeScore: 'Avg. On-Time Score',
    avgVerificationRate: 'Avg. Verification Rate',

    // Presets & Filters
    searchCriteria: 'Filter & Period Controls',
    searchPlaceholder: 'Search by Working ID, Rider ID, or Name...',
    displayMetric: 'Day Column Metric',
    periodPresets: 'Period Presets',
    today: 'Today',
    last7Days: 'Last 7 Days',
    last14Days: 'Last 14 Days',
    last30Days: 'Last 30 Days',
    thisMonth: 'This Month',
    allPeriod: 'All Loaded',
    startDate: 'Start Date',
    endDate: 'End Date',
    segment: 'Segment',
    allSegments: 'All Segments',
    applyFilters: 'Filter',
    resetFilters: 'Reset',
    refresh: 'Refresh',

    // Metric Options
    metricSegment: 'Segment (الشريحة)',
    metricOrders: 'Orders (Done / Gross)',
    metricCompletedOrders: 'Completed Orders',
    metricGrossOrders: 'Gross Orders',
    metricInTimeOrders: 'In-Time Orders',
    metricFailedOrders: 'Failed by Rider',
    metricOnTimeScore: 'On-Time Score %',
    metricQualityScore: 'Quality Score %',
    metricVerificationRate: 'Verify Rate %',
    metricCombined: 'Combined (Segment + Orders)',

    // Table Headers
    workingId: 'Working ID',
    riderName: 'Rider Name',
    accountOwner: 'Account Owner',
    accountUsedBy: 'Account used by: ',
    substituteNote: 'Substitute Note',
    periodSummary: 'Period Summary',
    periodTotalOrders: 'Total Orders',
    activeDays: 'Active Days',
    actions: 'Actions',
    viewDetails: 'View Details & Percentages',
    viewDetailsHint: 'Open full performance details & percentages page for this rider',

    // Buttons
    newRecord: 'Add Record',
    importExcel: 'Import Excel',
    downloadTemplate: 'Download Template',
    exportExcel: 'Export Excel',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    processing: 'Processing...',

    // Form
    createModalTitle: 'Create Daily Performance Record',
    editModalTitle: 'Edit Daily Performance Record',
    riderWorkingId: 'Rider Working ID',
    riderWorkingIdPlaceholder: 'e.g. TEST-RIDER-101',
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
    segmentPlaceholder: 'e.g. A, B, C',

    // Import Modal
    importModalTitle: 'Import Rider Daily Performance Excel',
    importDateLabel: 'Performance Date (Required)',
    selectExcelFile: 'Select Excel File (.xlsx, .xlsm)',
    dragDropText: 'Click or drag Excel file to upload',
    importResultsTitle: 'Import Results',
    totalProcessed: 'Total Processed',
    successCount: 'Successful Records',
    errorCount: 'Errors / Skipped',
    rowErrors: 'Detailed Row Errors',
    row: 'Row',
    message: 'Message',

    // Delete Modal
    deleteTitle: 'Confirm Delete',
    deleteConfirm: 'Are you sure you want to delete this performance record? This action cannot be undone.',

    // Feedback
    loadSuccess: 'Records loaded successfully',
    loadError: 'Failed to load performance records',
    createSuccess: 'Performance record created successfully',
    updateSuccess: 'Performance record updated successfully',
    deleteSuccess: 'Performance record deleted successfully',
    importSuccess: 'Excel file imported successfully',
    noRecords: 'No performance records found for this period',
    requiredFieldsError: 'Please fill in all required fields.',
  },
  ar: {
    title: 'أداء المناديب اليومي',
    subtitle: 'جدول شامل ومصفوفة يومية لأداء جميع المناديب خلال الفترة مع اختيار الخاصية المعروضة',
    totalRecords: 'إجمالي السجلات',
    riderCount: 'عدد المناديب',
    grossOrders: 'إجمالي الطلبات',
    completedOrders: 'الطلبات المكتملة',
    avgQualityScore: 'متوسط جودة التوصيل',
    avgOnTimeScore: 'متوسط دقة المواعيد',
    avgVerificationRate: 'متوسط نسبة التحقق',

    // Presets & Filters
    searchCriteria: 'خيارات التصفية والفترة الزمنية',
    searchPlaceholder: 'بحث برقم المندوب أو الاسم أو الرقم التعريفي...',
    displayMetric: 'الخاصية المعروضة بالأيام',
    periodPresets: 'فترات جاهزة',
    today: 'اليوم',
    last7Days: 'آخر 7 أيام',
    last14Days: 'آخر 14 يوم',
    last30Days: 'آخر 30 يوم',
    thisMonth: 'هذا الشهر',
    allPeriod: 'كل البيانات',
    startDate: 'من تاريخ',
    endDate: 'إلى تاريخ',
    segment: 'الشريحة',
    allSegments: 'كل الشرائح',
    applyFilters: 'تصفية',
    resetFilters: 'إعادة ضبط',
    refresh: 'تحديث',

    // Metric Options
    metricSegment: 'الشريحة (Segment)',
    metricOrders: 'الطلبات (المكتملة / الإجمالي)',
    metricCompletedOrders: 'الطلبات المكتملة فقط',
    metricGrossOrders: 'إجمالي الطلبات فقط',
    metricInTimeOrders: 'الطلبات في الوقت المحدد',
    metricFailedOrders: 'الملغاة بسبب المندوب',
    metricOnTimeScore: 'دقة المواعيد %',
    metricQualityScore: 'جودة التوصيل %',
    metricVerificationRate: 'نسبة نجاح التحقق %',
    metricCombined: 'عرض مدمج (الشريحة + الطلبات)',

    // Table Headers
    workingId: 'الرقم التعريفي للمندوب',
    riderName: 'اسم المندوب',
    accountOwner: 'صاحب الحساب',
    accountUsedBy: 'يستخدم الحساب بواسطة: ',
    substituteNote: 'ملاحظة البديل',
    periodSummary: 'ملخص الفترة',
    periodTotalOrders: 'إجمالي الطلبات',
    activeDays: 'أيام العمل',
    actions: 'الإجراءات',
    viewDetails: 'عرض تفاصيل ونسب الأداء',
    viewDetailsHint: 'فتح صفحة تفاصيل ونسب أداء المندوب بالكامل',

    // Buttons
    newRecord: 'إضافة سجل',
    importExcel: 'استيراد Excel',
    downloadTemplate: 'تحميل النموذج',
    exportExcel: 'تصدير Excel',
    save: 'حفظ التعديلات',
    cancel: 'إلغاء',
    delete: 'حذف',
    processing: 'جاري المعالجة...',

    // Form
    createModalTitle: 'إنشاء سجل أداء يومي للمندوب',
    editModalTitle: 'تعديل سجل أداء المندوب',
    riderWorkingId: 'الرقم التعريفي للمندوب',
    riderWorkingIdPlaceholder: 'مثال: TEST-RIDER-101',
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
    segmentLabel: 'الشريحة (Segment)',
    segmentPlaceholder: 'مثال: A, B, C',

    // Import Modal
    importModalTitle: 'استيراد أداء المناديب اليومي من Excel',
    importDateLabel: 'تاريخ الأداء (مطلوب)',
    selectExcelFile: 'اختر ملف Excel (.xlsx, .xlsm)',
    dragDropText: 'اضغط أو اسحب الملف هنا للرفع',
    importResultsTitle: 'نتائج الاستيراد',
    totalProcessed: 'إجمالي المعالجة',
    successCount: 'السجلات الناجحة',
    errorCount: 'الأخطاء / المستبعدة',
    rowErrors: 'تفاصيل أخطاء الصفوف',
    row: 'الصف',
    message: 'الرسالة',

    // Delete Modal
    deleteTitle: 'تأكيد الحذف',
    deleteConfirm: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',

    // Feedback
    loadSuccess: 'تم تحميل السجلات بنجاح',
    loadError: 'فشل تحميل سجلات الأداء',
    createSuccess: 'تم إنشاء سجل الأداء بنجاح',
    updateSuccess: 'تم تحديث سجل الأداء بنجاح',
    deleteSuccess: 'تم حذف سجل الأداء بنجاح',
    importSuccess: 'تم استيراد ملف Excel بنجاح',
    noRecords: 'لا توجد سجلات أداء مطابقة للفترة المحددة',
    requiredFieldsError: 'يرجى ملء جميع الحقول المطلوبة.',
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

const getDefaultEndDate = () => {
  return getYesterdayDate();
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

const initialFormState = {
  riderWorkingId: '',
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
};

export default function RiderDailyPerformancePage() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const t = translations[isRtl ? 'ar' : 'en'];

  // Raw data from server
  const [allRecords, setAllRecords] = useState([]);
  const [backendTotals, setBackendTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Period / Date Filters (Defaults to start of current month and yesterday)
  const [filterStartDate, setFilterStartDate] = useState(getFirstDayOfCurrentMonth());
  const [filterEndDate, setFilterEndDate] = useState(getDefaultEndDate());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState('');

  // Active Metric for Day Columns:
  // 'segment' | 'orders' | 'completedOrders' | 'grossOrders' | 'inTimeOrders' | 'failedOrders' | 'onTimeScore' | 'qualityScore' | 'verificationRate' | 'combined'
  const [activeMetric, setActiveMetric] = useState('segment');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Excel Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPerformanceDate, setImportPerformanceDate] = useState(getTodayDate());
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Fetch list with query parameters
  const loadRecords = useCallback(async (overrideParams = {}) => {
    setLoading(true);
    try {
      const params = {};
      const query = overrideParams.workingId !== undefined ? overrideParams.workingId : searchQuery.trim();
      if (query) {
        params.workingId = query;
      }
      const sDate = overrideParams.startDate !== undefined ? overrideParams.startDate : filterStartDate;
      if (sDate) {
        params.startDate = sDate;
      }
      const eDate = overrideParams.endDate !== undefined ? overrideParams.endDate : filterEndDate;
      if (eDate) {
        params.endDate = eDate;
      }
      const seg = overrideParams.segment !== undefined ? overrideParams.segment : filterSegment;
      if (seg) {
        params.segment = seg;
      }
      if (overrideParams.date) {
        params.date = overrideParams.date;
      }
      if (overrideParams.riderId) {
        params.riderId = overrideParams.riderId;
      }

      const data = await ApiService.get(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.LIST, params);

      let recordsList = [];
      if (data && Array.isArray(data.days)) {
        setBackendTotals(data.totals || null);
        data.days.forEach((day) => {
          const dayDate = day.performanceDate ? String(day.performanceDate).split('T')[0] : '';
          (day.records || []).forEach((r) => {
            recordsList.push({
              ...r,
              performanceDate: r.performanceDate ? String(r.performanceDate).split('T')[0] : dayDate,
            });
          });
        });
      } else if (Array.isArray(data)) {
        setBackendTotals(null);
        recordsList = data;
      } else if (data && Array.isArray(data.records)) {
        setBackendTotals(data.totals || null);
        recordsList = data.records;
      } else {
        setBackendTotals(null);
        recordsList = [];
      }

      setAllRecords(recordsList);
    } catch (err) {
      console.error('Error loading Rider Daily Performance records:', err);
      showNotification('error', err?.message || t.loadError);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStartDate, filterEndDate, filterSegment, t.loadError]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Preset Date Range buttons
  const handlePresetSelect = (preset) => {
    const today = getTodayDate();
    if (preset === 'today') {
      setFilterStartDate(today);
      setFilterEndDate(today);
    } else if (preset === 7) {
      setFilterStartDate(getPastDate(6));
      setFilterEndDate(today);
    } else if (preset === 14) {
      setFilterStartDate(getPastDate(13));
      setFilterEndDate(today);
    } else if (preset === 30) {
      setFilterStartDate(getPastDate(29));
      setFilterEndDate(today);
    } else if (preset === 'month') {
      setFilterStartDate(getFirstDayOfCurrentMonth());
      setFilterEndDate(getDefaultEndDate());
    } else if (preset === 'all') {
      setFilterStartDate('');
      setFilterEndDate('');
    }
  };

  // Generate dynamic date columns for the selected period
  const periodDays = useMemo(() => {
    if (filterStartDate && filterEndDate) {
      const dates = [];
      const start = new Date(filterStartDate);
      const end = new Date(filterEndDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        const curr = new Date(start);
        // Limit to max 62 days to avoid extreme layout overflow
        let count = 0;
        while (curr <= end && count < 62) {
          dates.push(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
          count++;
        }
        return dates;
      }
    }

    // Fallback: extract distinct dates from records
    const set = new Set();
    allRecords.forEach((r) => {
      if (r.performanceDate) {
        set.add(String(r.performanceDate).split('T')[0]);
      }
    });
    return Array.from(set).sort();
  }, [filterStartDate, filterEndDate, allRecords]);

  // Build Matrix: Map of riders with quick date-indexed record lookup
  const { ridersMatrix, availableSegments } = useMemo(() => {
    const map = new Map();
    const segSet = new Set();

    allRecords.forEach((record) => {
      const riderKey = String(
        record.workingId || record.sourceRiderId || record.riderWorkingId || record.riderId || 'unknown'
      ).trim();

      if (record.segment) {
        segSet.add(String(record.segment).toUpperCase().trim());
      }

      if (!map.has(riderKey)) {
        map.set(riderKey, {
          key: riderKey,
          workingId: record.workingId || record.sourceRiderId || record.riderWorkingId || riderKey,
          riderId: record.riderId || null,
          riderName: record.riderName || riderKey,
          latestSegment: record.segment || '',
          latestSubstituteRiderName: record.substituteRiderName || null,
          recordsByDate: new Map(),
          // Period Sums
          totalGrossOrders: 0,
          totalCompletedOrders: 0,
          totalInTimeOrders: 0,
          totalFailedOrders: 0,
          totalVerificationReq: 0,
          successfulVerificationReq: 0,
          qualityScoreSum: 0,
          qualityScoreCount: 0,
          onTimeScoreSum: 0,
          onTimeScoreCount: 0,
          activeDaysCount: 0,
        });
      }

      const rider = map.get(riderKey);
      if (record.substituteRiderName) {
        rider.latestSubstituteRiderName = record.substituteRiderName;
      }
      if (record.riderName && rider.riderName === riderKey) {
        rider.riderName = record.riderName;
      }
      const dateStr = record.performanceDate ? String(record.performanceDate).split('T')[0] : '';
      if (dateStr) {
        rider.recordsByDate.set(dateStr, record);
      }

      rider.totalGrossOrders += Number(record.grossOrders) || 0;
      rider.totalCompletedOrders += Number(record.completedOrders) || 0;
      rider.totalInTimeOrders += Number(record.completedOrdersInTime) || 0;
      rider.totalFailedOrders += Number(record.failedOrdersByRider) || 0;
      rider.totalVerificationReq += Number(record.totalVerificationRequests) || 0;
      rider.successfulVerificationReq += Number(record.successfulVerificationRequests) || 0;

      if (record.finalDeliveryQualityScore !== null && record.finalDeliveryQualityScore !== undefined) {
        rider.qualityScoreSum += Number(record.finalDeliveryQualityScore);
        rider.qualityScoreCount++;
      }
      if (record.onTimeDeliveryScore !== null && record.onTimeDeliveryScore !== undefined) {
        rider.onTimeScoreSum += Number(record.onTimeDeliveryScore);
        rider.onTimeScoreCount++;
      }
      if (record.segment) {
        rider.latestSegment = record.segment;
      }
    });

    const ridersList = Array.from(map.values()).map((rider) => {
      let workingDays = 0;
      rider.recordsByDate.forEach((rec) => {
        const gross = Number(rec.grossOrders) || 0;
        const completed = Number(rec.completedOrders) || 0;
        if (gross > 0 || completed > 0) {
          workingDays++;
        }
      });
      rider.activeDaysCount = workingDays;
      rider.avgQualityScore = rider.qualityScoreCount > 0 ? rider.qualityScoreSum / rider.qualityScoreCount : null;
      rider.avgOnTimeScore = rider.onTimeScoreCount > 0 ? rider.onTimeScoreSum / rider.onTimeScoreCount : null;
      rider.verificationRate =
        rider.totalVerificationReq > 0 ? rider.successfulVerificationReq / rider.totalVerificationReq : null;
      return rider;
    });

    // Sort riders by latestSegment (A, B, C, D) then by workingId
    const segmentOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6 };
    ridersList.sort((a, b) => {
      const segA = String(a.latestSegment || '').trim().toUpperCase();
      const segB = String(b.latestSegment || '').trim().toUpperCase();
      const orderA = segmentOrder[segA] || (segA ? 50 : 999);
      const orderB = segmentOrder[segB] || (segB ? 50 : 999);
      if (orderA !== orderB) return orderA - orderB;
      return String(a.workingId).localeCompare(String(b.workingId), undefined, { numeric: true });
    });

    return {
      ridersMatrix: ridersList,
      availableSegments: Array.from(segSet).sort(),
    };
  }, [allRecords]);

  // Client filtering
  const filteredRiders = useMemo(() => {
    return ridersMatrix.filter((rider) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const workingId = String(rider.workingId).toLowerCase();
        const riderName = String(rider.riderName).toLowerCase();
        const riderId = String(rider.riderId || '').toLowerCase();
        if (!workingId.includes(q) && !riderName.includes(q) && !riderId.includes(q)) {
          return false;
        }
      }
      if (filterSegment && String(rider.latestSegment || '').toUpperCase().trim() !== filterSegment.toUpperCase().trim()) {
        return false;
      }
      return true;
    });
  }, [ridersMatrix, searchQuery, filterSegment]);

  // Top summary statistics
  const stats = useMemo(() => {
    if (backendTotals) {
      return {
        totalRecords: backendTotals.recordCount ?? allRecords.length,
        riderCount: backendTotals.riderCount ?? ridersMatrix.length,
        grossOrders: backendTotals.grossOrders ?? 0,
        completedOrders: backendTotals.completedOrders ?? 0,
        avgQualityScore: backendTotals.averageFinalDeliveryQualityScore ?? null,
        avgOnTimeScore: backendTotals.averageOnTimeDeliveryScore ?? null,
        avgVerificationRate: backendTotals.verificationSuccessRate ?? null,
      };
    }

    let grossSum = 0;
    let completedSum = 0;
    let qSum = 0;
    let qCount = 0;
    let oSum = 0;
    let oCount = 0;
    let vSum = 0;
    let vCount = 0;

    allRecords.forEach((r) => {
      grossSum += Number(r.grossOrders) || 0;
      completedSum += Number(r.completedOrders) || 0;
      if (r.finalDeliveryQualityScore !== null && r.finalDeliveryQualityScore !== undefined) {
        qSum += Number(r.finalDeliveryQualityScore);
        qCount++;
      }
      if (r.onTimeDeliveryScore !== null && r.onTimeDeliveryScore !== undefined) {
        oSum += Number(r.onTimeDeliveryScore);
        oCount++;
      }
      if (r.verificationSuccessRate !== null && r.verificationSuccessRate !== undefined) {
        vSum += Number(r.verificationSuccessRate);
        vCount++;
      }
    });

    return {
      totalRecords: allRecords.length,
      riderCount: ridersMatrix.length,
      grossOrders: grossSum,
      completedOrders: completedSum,
      avgQualityScore: qCount > 0 ? qSum / qCount : null,
      avgOnTimeScore: oCount > 0 ? oSum / oCount : null,
      avgVerificationRate: vCount > 0 ? vSum / vCount : null,
    };
  }, [backendTotals, allRecords, ridersMatrix.length]);

  // Filter reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStartDate(getFirstDayOfCurrentMonth());
    setFilterEndDate(getDefaultEndDate());
    setFilterSegment('');
    setActiveMetric('segment');
  };

  // Open Create Modal
  const handleOpenCreate = (prefillWorkingId = '') => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...initialFormState,
      riderWorkingId: prefillWorkingId || '',
      performanceDate: filterEndDate || getTodayDate(),
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (record) => {
    setIsEditing(true);
    setEditingId(record.id);
    setFormData({
      riderWorkingId: record.workingId || record.sourceRiderId || '',
      riderName: record.riderName || '',
      substituteRiderName: record.substituteRiderName || null,
      performanceDate: record.performanceDate ? String(record.performanceDate).split('T')[0] : getTodayDate(),
      totalVerificationRequests: record.totalVerificationRequests ?? '',
      successfulVerificationRequests: record.successfulVerificationRequests ?? '',
      verificationSuccessRate: record.verificationSuccessRate ?? '',
      grossOrders: record.grossOrders ?? '',
      completedOrders: record.completedOrders ?? '',
      completedOrdersInTime: record.completedOrdersInTime ?? '',
      failedOrdersByRider: record.failedOrdersByRider ?? '',
      onTimeDeliveryScore: record.onTimeDeliveryScore ?? '',
      finalDeliveryQualityScore: record.finalDeliveryQualityScore ?? '',
      segment: record.segment || '',
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
    if (!formData.riderWorkingId.trim() || !formData.performanceDate) {
      showNotification('error', t.requiredFieldsError);
      return;
    }

    setSubmittingForm(true);
    try {
      const payload = {
        riderWorkingId: formData.riderWorkingId.trim(),
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
      loadRecords();
    } catch (err) {
      console.error('Error saving record:', err);
      showNotification('error', err?.message || 'Error occurred while saving');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleOpenDelete = (record) => {
    setDeletingRecord(record);
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
      loadRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      showNotification('error', err?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  // Excel Import Handler
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      showNotification('error', t.selectExcelFile);
      return;
    }
    if (!importPerformanceDate) {
      showNotification('error', t.importDateLabel);
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const url = `${API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.IMPORT}?performanceDate=${encodeURIComponent(importPerformanceDate)}`;
      const result = await ApiService.uploadFile(url, importFile);

      setImportResult(result);
      showNotification('success', t.importSuccess);
      // After importing, refetch the list for performanceDate
      setFilterStartDate(importPerformanceDate);
      setFilterEndDate(importPerformanceDate);
      await loadRecords({ startDate: importPerformanceDate, endDate: importPerformanceDate });
    } catch (err) {
      console.error('Excel Import Error:', err);
      showNotification('error', err?.message || 'Failed to import Excel file');
      if (err?.fullError) {
        setImportResult(err.fullError);
      }
    } finally {
      setImporting(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      'rider_id',
      'total_verification_requests',
      'successful_verification_requests',
      'verification_success_rate',
      'gross_orders',
      'completed_orders',
      'completed_orders_in_time',
      'failed_orders_by_rider',
      'on_time_delivery_score',
      'final_delivery_quality_score',
      'segment',
    ];

    const sampleRows = [
      {
        rider_id: 'TEST-RIDER-101',
        total_verification_requests: 8,
        successful_verification_requests: 7,
        verification_success_rate: 0.875,
        gross_orders: 24,
        completed_orders: 22,
        completed_orders_in_time: 20,
        failed_orders_by_rider: 1,
        on_time_delivery_score: 0.91,
        final_delivery_quality_score: 0.89,
        segment: 'B',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Rider_Daily_Performance_Template_${getTodayDate()}.xlsx`);
  };

  // Export current records to Excel
  const handleExportExcel = () => {
    if (allRecords.length === 0) {
      showNotification('error', t.noRecords);
      return;
    }

    const exportData = allRecords.map((r) => ({
      ID: r.id,
      'Working ID': r.workingId || r.sourceRiderId,
      Rider: r.riderName || '-',
      'Substitute Note': r.substituteRiderName
        ? (isRtl ? `يستخدم الحساب بواسطة: ${r.substituteRiderName}` : `Account used by: ${r.substituteRiderName}`)
        : '-',
      'Performance Date': r.performanceDate ? String(r.performanceDate).split('T')[0] : '-',
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

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Performance');
    XLSX.writeFile(wb, `Rider_Daily_Performance_${getTodayDate()}.xlsx`);
  };

  // Render a specific metric inside a daily cell
  const renderDayCell = (record) => {
    if (!record) {
      return <span className="text-gray-300 font-bold select-none text-xs">-</span>;
    }

    const gross = Number(record.grossOrders) || 0;
    const completed = Number(record.completedOrders) || 0;
    const inTime = Number(record.completedOrdersInTime) || 0;
    const failed = Number(record.failedOrdersByRider) || 0;
    const isZero = gross === 0 && completed === 0;

    switch (activeMetric) {
      case 'segment':
        return record.segment ? (
          <span
            className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border shadow-2xs ${getSegmentBadgeColor(
              record.segment
            )}`}
          >
            {record.segment}
          </span>
        ) : (
          <span className="text-gray-300 font-bold text-xs">-</span>
        );

      case 'orders':
        return (
          <div className="text-[11px] font-bold leading-tight">
            <span className={isZero ? "text-slate-400" : "text-slate-900"}>{completed}</span>
            <span className="text-slate-400 mx-0.5 font-normal">/</span>
            <span className={isZero ? "text-slate-400" : "text-slate-600"}>{gross}</span>
          </div>
        );

      case 'completedOrders':
        return (
          <span className={`text-[11px] font-bold ${completed === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
            {completed}
          </span>
        );

      case 'grossOrders':
        return (
          <span className={`text-[11px] font-bold ${gross === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
            {gross}
          </span>
        );

      case 'inTimeOrders':
        return (
          <span className={`text-[11px] font-bold ${inTime === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
            {inTime}
          </span>
        );

      case 'failedOrders':
        return (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              failed > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-400'
            }`}
          >
            {failed}
          </span>
        );

      case 'onTimeScore':
        if (record.onTimeDeliveryScore === null || record.onTimeDeliveryScore === undefined) {
          return <span className="text-gray-300 font-bold select-none text-xs">-</span>;
        }
        return (
          <span className="text-[11px] font-bold text-slate-900">
            {formatPercent(record.onTimeDeliveryScore, 0)}
          </span>
        );

      case 'qualityScore':
        if (record.finalDeliveryQualityScore === null || record.finalDeliveryQualityScore === undefined) {
          return <span className="text-gray-300 font-bold select-none text-xs">-</span>;
        }
        return (
          <span className="text-[11px] font-bold text-slate-900">
            {formatPercent(record.finalDeliveryQualityScore, 0)}
          </span>
        );

      case 'verificationRate':
        if (record.verificationSuccessRate === null || record.verificationSuccessRate === undefined) {
          return <span className="text-gray-300 font-bold select-none text-xs">-</span>;
        }
        return (
          <span className="text-[11px] font-bold text-slate-900">
            {formatPercent(record.verificationSuccessRate, 0)}
          </span>
        );

      case 'combined':
        return (
          <div className="flex items-center justify-center gap-1 text-[11px]">
            {record.segment && (
              <span
                className={`px-1 py-0.2 rounded text-[9px] font-bold border ${getSegmentBadgeColor(
                  record.segment
                )}`}
              >
                {record.segment}
              </span>
            )}
            <span className={`font-bold ${isZero ? 'text-slate-400' : 'text-slate-800'}`}>
              {completed}
              <span className="text-gray-400 font-normal">/{gross}</span>
            </span>
          </div>
        );

      default:
        return record.segment ? (
          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${getSegmentBadgeColor(record.segment)}`}>
            {record.segment}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">-</span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-blue-100/50 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        icon={Award}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenCreate('')}
              className="bg-white text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus size={15} />
              <span>{t.newRecord}</span>
            </button>
            <button
              onClick={() => {
                setImportResult(null);
                setImportFile(null);
                setIsImportModalOpen(true);
              }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <Upload size={15} />
              <span>{t.importExcel}</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={15} />
              <span>{t.exportExcel}</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <Download size={15} />
              <span>{t.downloadTemplate}</span>
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

        {/* Global Statistics Summary Cards - Clean Slate Palette */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.totalRecords}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><FileText size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">{stats.totalRecords}</div>
          </div>

          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.riderCount}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Users size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">{stats.riderCount}</div>
          </div>

          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.grossOrders}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><BarChart2 size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">{stats.grossOrders.toLocaleString()}</div>
          </div>

          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.completedOrders}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><CheckCircle2 size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">{stats.completedOrders.toLocaleString()}</div>
          </div>

          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.avgQualityScore}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Award size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {stats.avgQualityScore !== null ? formatPercent(stats.avgQualityScore) : '-'}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.avgOnTimeScore}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><Clock size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {stats.avgOnTimeScore !== null ? formatPercent(stats.avgOnTimeScore) : '-'}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 hover:border-slate-300 transition p-3.5 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">{t.avgVerificationRate}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600"><TrendingUp size={15} /></div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {stats.avgVerificationRate !== null ? formatPercent(stats.avgVerificationRate) : '-'}
            </div>
          </div>
        </div>

        {/* Filter & Metric Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 space-y-4">
          {/* Top Row: Search Criteria Header + Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-blue-600" />
              <span>{t.searchCriteria}</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>{t.resetFilters}</span>
              </button>
              <button
                onClick={loadRecords}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>{t.refresh}</span>
              </button>
            </div>
          </div>

          {/* Metric Selector Row (Pill Buttons & Dropdown) */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 shrink-0">
              <Layers size={16} className="text-blue-600" />
              <span>{t.displayMetric}:</span>
            </div>

            {/* Metric Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              {[
                { key: 'segment', label: t.metricSegment, color: 'emerald' },
                { key: 'orders', label: t.metricOrders, color: 'blue' },
                { key: 'combined', label: t.metricCombined, color: 'indigo' },
                { key: 'qualityScore', label: t.metricQualityScore, color: 'amber' },
                { key: 'onTimeScore', label: t.metricOnTimeScore, color: 'teal' },
                { key: 'verificationRate', label: t.metricVerificationRate, color: 'purple' },
                { key: 'inTimeOrders', label: t.metricInTimeOrders, color: 'sky' },
                { key: 'failedOrders', label: t.metricFailedOrders, color: 'rose' },
              ].map((m) => {
                const isSelected = activeMetric === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setActiveMetric(m.key)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap shadow-2xs ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-white hover:bg-blue-100/70 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Range & Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            {/* Search Input */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.searchPlaceholder}</label>
              <div className="relative">
                <Search size={16} className="absolute top-2.5 rtl:right-3 ltr:left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rtl:pr-9 ltr:pl-9 px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.startDate}</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.endDate}</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
            </div>

            {/* Segment Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.segment}</label>
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              >
                <option value="">{t.allSegments}</option>
                {['A', 'B', 'C', 'D', ...availableSegments.filter((s) => !['A', 'B', 'C', 'D'].includes(s))].map(
                  (seg) => (
                    <option key={seg} value={seg}>
                      {t.segment}: {seg}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Quick Period Presets Dropdown / Buttons */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.periodPresets}</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePresetSelect(7)}
                  className="flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 transition"
                  title={t.last7Days}
                >
                  7d
                </button>
                <button
                  onClick={() => handlePresetSelect(14)}
                  className="flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 transition"
                  title={t.last14Days}
                >
                  14d
                </button>
                <button
                  onClick={() => handlePresetSelect('month')}
                  className="flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 transition"
                  title={t.thisMonth}
                >
                  Mo
                </button>
                <button
                  onClick={() => handlePresetSelect('all')}
                  className="flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg border border-gray-300 bg-white hover:bg-blue-50 text-gray-700 transition"
                  title={t.allPeriod}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* THE BIG MATRIX / PIVOT TABLE */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative">
          {/* Table Header Info Bar */}
          <div className="bg-gray-100/90 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-gray-800 uppercase tracking-wide">
                {periodDays.length} {t.periodPresets} ({periodDays[0] || '-'} → {periodDays[periodDays.length - 1] || '-'})
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-semibold text-blue-700">
                {t.displayMetric}: <span className="underline">{activeMetric.toUpperCase()}</span>
              </span>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              {filteredRiders.length} {t.riderCount}
            </div>
          </div>

          <div className="overflow-x-auto max-h-[72vh] overflow-y-auto scrollbar-thin">
            <table className="min-w-full text-xs text-right rtl:text-right ltr:text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-30 shadow-xs border-b border-gray-200">
                <tr>
                  {/* Sticky Column 1: Working ID */}
                  <th className="sticky rtl:right-0 ltr:left-0 z-40 bg-gray-50 px-2 py-2 text-xs font-extrabold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 shadow-xs min-w-[95px] max-w-[95px]">
                    {t.workingId}
                  </th>

                  {/* Sticky Column 2: Rider Name */}
                  <th className="sticky rtl:right-[95px] ltr:left-[95px] z-40 bg-gray-50 px-2 py-2 text-xs font-extrabold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 shadow-xs min-w-[135px] max-w-[145px]">
                    {t.riderName}
                  </th>

                  {/* Period Summary Column */}
                  <th className="px-2 py-2 text-center text-xs font-extrabold text-blue-900 uppercase tracking-wider whitespace-nowrap bg-blue-50/70 border-b border-blue-200 min-w-[105px]">
                    {t.periodSummary}
                  </th>

                  {/* DYNAMIC DATE COLUMNS: One for each day in period */}
                  {periodDays.map((dateStr) => {
                    const dayLabel = isRtl ? getArabicDayName(dateStr) : getEnglishDayName(dateStr);
                    const shortDate = dateStr.slice(5); // e.g. 09-01
                    return (
                      <th
                        key={dateStr}
                        className="px-1 py-1.5 text-center text-xs font-bold text-gray-700 uppercase whitespace-nowrap border-b border-l border-gray-200 min-w-[58px]"
                      >
                        <div className="text-[9px] text-gray-500 font-normal leading-tight">{dayLabel}</div>
                        <div className="font-mono text-gray-900 font-bold text-[11px] leading-tight">{shortDate}</div>
                      </th>
                    );
                  })}

                  {/* Actions Column (Sticky or at end) */}
                  <th className="px-2 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 min-w-[110px]">
                    {t.actions}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={periodDays.length + 4} className="py-16 text-center text-gray-500">
                      <div className="inline-flex items-center gap-3">
                        <RefreshCw className="animate-spin text-blue-600" size={24} />
                        <span className="text-sm font-semibold">{t.processing}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={periodDays.length + 4} className="py-16 text-center text-gray-500">
                      <div className="max-w-sm mx-auto flex flex-col items-center gap-2">
                        <FileSpreadsheet size={40} className="text-gray-300" />
                        <p className="text-sm font-medium text-gray-700">{t.noRecords}</p>
                        <button
                          onClick={() => handleOpenCreate('')}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                        >
                          <Plus size={14} />
                          <span>{t.newRecord}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((rider, rowIdx) => {
                    const rowBg = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';

                    return (
                      <tr key={rider.key} className={`${rowBg} hover:bg-blue-50/50 transition group`}>
                        {/* Sticky Column 1: Working ID */}
                        <td className={`sticky rtl:right-0 ltr:left-0 z-20 ${rowBg} group-hover:bg-blue-50/50 px-2 py-1.5 whitespace-nowrap border-b border-gray-200 shadow-xs min-w-[95px] max-w-[95px]`}>
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                            {rider.workingId}
                          </span>
                        </td>

                        {/* Sticky Column 2: Rider Name */}
                        <td className={`sticky rtl:right-[95px] ltr:left-[95px] z-20 ${rowBg} group-hover:bg-blue-50/50 px-2 py-1.5 whitespace-nowrap border-b border-gray-200 shadow-xs min-w-[135px] max-w-[145px]`}>
                          <div className="font-bold text-gray-900 text-[11px] truncate max-w-[130px]" title={rider.riderName}>
                            {rider.riderName}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {rider.latestSegment && (
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded font-bold border ${getSegmentBadgeColor(
                                  rider.latestSegment
                                )}`}
                              >
                                {rider.latestSegment}
                              </span>
                            )}
                            {rider.riderId && (
                              <span className="text-[9px] text-gray-400 font-mono">
                                ID: {rider.riderId}
                              </span>
                            )}
                          </div>
                          {rider.latestSubstituteRiderName && (
                            <div
                              className="text-[9px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-0.5 inline-flex items-center gap-1 max-w-[130px] truncate font-medium"
                              title={isRtl ? `يستخدم الحساب بواسطة: ${rider.latestSubstituteRiderName}` : `Account used by: ${rider.latestSubstituteRiderName}`}
                            >
                              <Info size={9} className="text-amber-500 shrink-0" />
                              <span className="truncate">{rider.latestSubstituteRiderName}</span>
                            </div>
                          )}
                        </td>

                        {/* Period Summary Cell */}
                        <td className="px-2 py-1.5 text-center whitespace-nowrap bg-slate-50/70 border-b border-slate-200 min-w-[105px]">
                          <div className="text-[11px] font-bold text-gray-900">
                            {rider.totalCompletedOrders.toLocaleString()} <span className="text-gray-400 font-normal">/</span> {rider.totalGrossOrders.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-gray-500 font-semibold flex items-center justify-center gap-1 mt-0.5">
                            <span>{rider.activeDaysCount} {t.activeDays}</span>
                            {rider.avgQualityScore !== null && (
                              <span className="text-slate-700 font-bold">
                                • {formatPercent(rider.avgQualityScore, 0)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* DYNAMIC DATE CELLS */}
                        {periodDays.map((dateStr) => {
                          const dayRecord = rider.recordsByDate.get(dateStr);
                          const subNote = dayRecord?.substituteRiderName
                            ? (isRtl ? ` [يستخدم الحساب بواسطة: ${dayRecord.substituteRiderName}]` : ` [Account used by: ${dayRecord.substituteRiderName}]`)
                            : '';
                          return (
                            <td
                              key={dateStr}
                              className="px-1 py-1 text-center whitespace-nowrap border-b border-l border-gray-100 hover:bg-blue-100/50 transition cursor-pointer relative min-w-[58px]"
                              title={
                                dayRecord
                                  ? `${dateStr} | Segment: ${dayRecord.segment || '-'} | Orders: ${dayRecord.completedOrders ?? 0}/${dayRecord.grossOrders ?? 0} | Quality: ${formatPercent(dayRecord.finalDeliveryQualityScore)}${subNote}`
                                  : `${dateStr}: No Record`
                              }
                              onClick={() => {
                                if (dayRecord) {
                                  handleOpenEdit(dayRecord);
                                } else {
                                  handleOpenCreate(rider.workingId);
                                }
                              }}
                            >
                              <div className="relative inline-flex items-center justify-center">
                                {renderDayCell(dayRecord)}
                                {dayRecord?.substituteRiderName && (
                                  <span
                                    className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ring-1 ring-white"
                                    title={isRtl ? `يستخدم الحساب بواسطة: ${dayRecord.substituteRiderName}` : `Account used by: ${dayRecord.substituteRiderName}`}
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* ACTION CELL: OPEN DEDICATED RIDER DETAILS PAGE */}
                        <td className="px-2 py-1.5 whitespace-nowrap text-center border-b border-gray-200 min-w-[110px]">
                          <div className="inline-flex items-center gap-1">
                            {/* Open Details Page Button */}
                            <Link
                              href={`/admin/shifts/rider-daily-performance/${encodeURIComponent(rider.workingId)}?startDate=${filterStartDate}&endDate=${filterEndDate}`}
                              target="_blank"
                              className="px-2 py-1 rounded text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition inline-flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                              title={t.viewDetailsHint}
                            >
                              <ExternalLink size={12} className="text-slate-600" />
                              <span>{t.viewDetails}</span>
                            </Link>

                            {/* Quick Add Day */}
                            <button
                              onClick={() => handleOpenCreate(rider.workingId)}
                              className="p-1 rounded text-gray-500 hover:text-blue-700 hover:bg-gray-100 border border-gray-200 transition"
                              title={t.newRecord}
                            >
                              <Plus size={12} />
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

      {/* CREATE / EDIT MODAL - White with Blue Header */}
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
                    {t.riderWorkingId} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="riderWorkingId"
                    value={formData.riderWorkingId}
                    onChange={handleFormChange}
                    required
                    placeholder={t.riderWorkingIdPlaceholder}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    placeholder={t.segmentPlaceholder}
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
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={22} />
                <h3 className="text-lg font-bold">{t.importModalTitle}</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              {/* Performance Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.importDateLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={importPerformanceDate}
                  onChange={(e) => setImportPerformanceDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.selectExcelFile} <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-green-500 rounded-xl p-6 cursor-pointer bg-gray-50 hover:bg-green-50/40 transition">
                  <Upload size={32} className="text-green-600" />
                  <span className="mt-2 text-xs font-bold text-gray-700 text-center">
                    {importFile ? importFile.name : t.dragDropText}
                  </span>
                  <span className="mt-1 text-[11px] text-gray-400 font-mono">.xlsx, .xlsm</span>
                  <input
                    type="file"
                    accept=".xlsx, .xlsm"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Import Results Banner */}
              {importResult && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">{t.importResultsTitle}</span>
                    <span className="text-xs font-semibold text-gray-600">
                      {t.totalProcessed}: {importResult.totalRecords ?? 0}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="text-xs text-green-700 font-medium">{t.successCount}</div>
                      <div className="text-2xl font-bold text-green-700">{importResult.successCount ?? 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <div className="text-xs text-red-700 font-medium">{t.errorCount}</div>
                      <div className="text-2xl font-bold text-red-700">{importResult.errorCount ?? 0}</div>
                    </div>
                  </div>

                  {Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-red-700">{t.rowErrors}:</div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                        {importResult.errors.map((err, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between text-red-900 font-bold">
                              <span>
                                {t.row} {err.rowNumber || '-'}
                              </span>
                              {err.riderWorkingId && <span className="font-mono">{err.riderWorkingId}</span>}
                            </div>
                            <div className="text-red-700 text-xs">{err.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition disabled:opacity-50"
                >
                  {importing && <RefreshCw className="animate-spin" size={14} />}
                  <span>{t.importExcel}</span>
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
                <h3 className="text-base font-bold text-gray-900">{t.deleteTitle}</h3>
                <p className="text-xs text-gray-500">
                  {deletingRecord?.workingId || deletingRecord?.sourceRiderId} -{' '}
                  {deletingRecord?.performanceDate ? String(deletingRecord.performanceDate).split('T')[0] : ''}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">{t.deleteConfirm}</p>

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
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
