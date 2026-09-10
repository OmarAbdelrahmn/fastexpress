'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Award,
  TrendingUp,
  BarChart2,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  Users,
  Layers,
  Search,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle,
  AlertCircle,
  X,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const translations = {
  en: {
    title: 'Rider Daily Performance',
    subtitle: 'Comprehensive period matrix table for housing riders with customizable daily metrics',
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
    lastDaySegmentTitle: 'Segment Breakdown (Latest Uploaded Day)',
    lastDayDate: 'Date',
    totalOnDate: 'Total on Date',
    ridersCount: 'riders',
    allSegmentsCard: 'All Segments',
    applyFilters: 'Filter',
    resetFilters: 'Reset',
    refresh: 'Refresh',

    // Metric Options
    metricSegment: 'Segment',
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
    exportExcel: 'Export Excel',
    close: 'Close',

    // Day Details Modal
    dayDetailsTitle: 'Daily Performance Record Details',
    riderInfo: 'Rider Information',
    performanceDate: 'Performance Date',
    totalVerificationRequests: 'Total Verification Requests',
    successfulVerificationRequests: 'Successful Verification Requests',
    verificationSuccessRate: 'Verification Success Rate',
    grossOrdersLabel: 'Gross Orders',
    completedOrdersLabel: 'Completed Orders',
    completedOrdersInTimeLabel: 'Completed Orders In Time',
    failedOrdersByRiderLabel: 'Failed Orders By Rider',
    onTimeDeliveryScoreLabel: 'On-Time Delivery Score',
    finalDeliveryQualityScoreLabel: 'Final Delivery Quality Score',
    segmentLabel: 'Segment',

    // Feedback
    loadSuccess: 'Records loaded successfully',
    loadError: 'Failed to load performance records',
    noRecords: 'No performance records found for this period',
  },
  ar: {
    title: 'أداء المناديب اليومي',
    subtitle: 'جدول شامل ومصفوفة يومية لأداء مناديب السكن خلال الفترة مع اختيار الخاصية المعروضة',
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
    lastDaySegmentTitle: 'توزيع الشرائح (لآخر يوم تم رفعه)',
    lastDayDate: 'التاريخ',
    totalOnDate: 'الإجمالي في هذا اليوم',
    ridersCount: 'مندوب',
    allSegmentsCard: 'كل الشرائح',
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
    exportExcel: 'تصدير Excel',
    close: 'إغلاق',

    // Day Details Modal
    dayDetailsTitle: 'تفاصيل سجل الأداء اليومي',
    riderInfo: 'بيانات المندوب',
    performanceDate: 'تاريخ الأداء',
    totalVerificationRequests: 'إجمالي طلبات التحقق',
    successfulVerificationRequests: 'طلبات التحقق الناجحة',
    verificationSuccessRate: 'نسبة نجاح التحقق',
    grossOrdersLabel: 'إجمالي الطلبات المستلمة',
    completedOrdersLabel: 'الطلبات المكتملة',
    completedOrdersInTimeLabel: 'المكتملة في الوقت المحدد',
    failedOrdersByRiderLabel: 'الملغاة بسبب المندوب',
    onTimeDeliveryScoreLabel: 'درجة دقة التوصيل في الوقت',
    finalDeliveryQualityScoreLabel: 'درجة جودة التوصيل النهائية',
    segmentLabel: 'الشريحة (Segment)',

    // Feedback
    loadSuccess: 'تم تحميل السجلات بنجاح',
    loadError: 'فشل تحميل سجلات الأداء',
    noRecords: 'لا توجد سجلات أداء مطابقة للفترة المحددة',
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

export default function MemberRiderDailyPerformancePage() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const t = translations[isRtl ? 'ar' : 'en'];

  // Raw data from server
  const [allRecords, setAllRecords] = useState([]);
  const [backendTotals, setBackendTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Period / Date Filters
  const [filterStartDate, setFilterStartDate] = useState(getFirstDayOfCurrentMonth());
  const [filterEndDate, setFilterEndDate] = useState(getDefaultEndDate());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState('');

  // Active Metric for Day Columns:
  // 'segment' | 'orders' | 'completedOrders' | 'grossOrders' | 'inTimeOrders' | 'failedOrders' | 'onTimeScore' | 'qualityScore' | 'verificationRate' | 'combined'
  const [activeMetric, setActiveMetric] = useState('segment');

  // Day record details modal state
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // Fetch list with query parameters using GET /api/Member/riders/scores
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
      if (overrideParams.segment) {
        params.segment = overrideParams.segment;
      }

      const data = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS_SCORES, params);

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
      console.error('Error loading Member Rider Daily Performance records:', err);
      showNotification('error', err?.message || t.loadError);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStartDate, filterEndDate, t.loadError]);

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

  // Segment breakdown for the latest uploaded date in current data
  const lastDaySegmentStats = useMemo(() => {
    if (!allRecords || allRecords.length === 0) return null;

    let maxDate = '';
    for (let i = 0; i < allRecords.length; i++) {
      const rec = allRecords[i];
      if (rec.performanceDate) {
        const d = String(rec.performanceDate).split('T')[0];
        if (!maxDate || d > maxDate) {
          maxDate = d;
        }
      }
    }

    if (!maxDate) return null;

    const riderSegmentMap = new Map();
    for (let i = 0; i < allRecords.length; i++) {
      const rec = allRecords[i];
      const d = rec.performanceDate ? String(rec.performanceDate).split('T')[0] : '';
      if (d === maxDate) {
        const riderKey = String(
          rec.workingId || rec.sourceRiderId || rec.riderWorkingId || rec.riderId || rec.id
        ).trim();
        if (!riderSegmentMap.has(riderKey)) {
          const seg = rec.segment ? String(rec.segment).toUpperCase().trim() : 'N/A';
          riderSegmentMap.set(riderKey, seg);
        }
      }
    }

    const totalRidersOnDate = riderSegmentMap.size;
    const counts = {};
    riderSegmentMap.forEach((seg) => {
      counts[seg] = (counts[seg] || 0) + 1;
    });

    const standardSegs = ['A', 'B', 'C', 'D'];
    const otherSegs = Object.keys(counts)
      .filter((s) => !standardSegs.includes(s) && s !== 'N/A')
      .sort();
    if (counts['N/A']) {
      otherSegs.push('N/A');
    }

    const allSegKeys = [...standardSegs, ...otherSegs];

    const segmentCards = allSegKeys
      .map((seg) => ({
        segment: seg,
        count: counts[seg] || 0,
        percentage: totalRidersOnDate > 0 ? Math.round(((counts[seg] || 0) / totalRidersOnDate) * 100) : 0,
      }))
      .filter((item) => standardSegs.includes(item.segment) || item.count > 0);

    return {
      date: maxDate,
      totalRiders: totalRidersOnDate,
      segments: segmentCards,
    };
  }, [allRecords]);

  // Filter reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStartDate(getFirstDayOfCurrentMonth());
    setFilterEndDate(getDefaultEndDate());
    setFilterSegment('');
    setActiveMetric('segment');
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
    XLSX.writeFile(wb, `Member_Rider_Daily_Performance_${getTodayDate()}.xlsx`);
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
              onClick={handleExportExcel}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet size={15} />
              <span>{t.exportExcel}</span>
            </button>
            <button
              onClick={loadRecords}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs flex items-center gap-1.5 transition"
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

        {/* LATEST UPLOADED DAY SEGMENT BREAKDOWN CARDS */}
        {lastDaySegmentStats && (
          <div className="bg-white rounded-2xl shadow-xs p-3.5 border border-slate-200/90 transition">
            {/* Header with live ping indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {t.lastDaySegmentTitle}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <span>{lastDaySegmentStats.date}</span>
                  <span className="text-slate-400 font-sans">
                    ({isRtl ? getArabicDayName(lastDaySegmentStats.date) : getEnglishDayName(lastDaySegmentStats.date)})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {filterSegment && (
                  <button
                    onClick={() => setFilterSegment('')}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition flex items-center gap-1"
                  >
                    <span>{t.resetFilters}</span>
                    <X size={11} />
                  </button>
                )}
                <div className="text-[11px] text-slate-500 font-medium">
                  {t.totalOnDate}:{' '}
                  <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {lastDaySegmentStats.totalRiders} {t.ridersCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Segment KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {/* All Segments Pill */}
              <button
                type="button"
                onClick={() => setFilterSegment('')}
                className={`text-start p-2.5 rounded-xl border transition flex flex-col justify-between ${
                  filterSegment === ''
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-700 border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">{t.allSegmentsCard}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    filterSegment === '' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'
                  }`}>
                    100%
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-lg font-extrabold">{lastDaySegmentStats.totalRiders}</span>
                  <span className={`text-[10px] ${filterSegment === '' ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.ridersCount}
                  </span>
                </div>
              </button>

              {/* Segment Cards */}
              {lastDaySegmentStats.segments.map((item) => {
                const isSelected = filterSegment.toUpperCase() === item.segment.toUpperCase();
                return (
                  <button
                    key={item.segment}
                    type="button"
                    onClick={() => {
                      setFilterSegment(isSelected ? '' : item.segment);
                    }}
                    className={`text-start p-2.5 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-blue-600 bg-blue-50/80 border-blue-300 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded border ${getSegmentBadgeColor(
                          item.segment
                        )}`}
                      >
                        {t.segment} {item.segment}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-lg font-extrabold text-slate-900">{item.count}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {t.ridersCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Matrix Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {isRtl ? 'مصفوفة أداء المناديب اليومي' : 'Riders Daily Matrix'}
              </span>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                {filteredRiders.length} {t.riderCount}
              </span>
              {filterStartDate && filterEndDate && (
                <span className="text-xs text-gray-500 font-mono hidden sm:inline-block">
                  ({filterStartDate} → {filterEndDate})
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              <span>{isRtl ? 'اضغط على أي خلية لعرض تفاصيل اليوم' : 'Click any day cell to view record details'}</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[750px] relative scrollbar-thin">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-slate-100 text-slate-800 text-[11px] font-bold sticky top-0 z-20 shadow-xs border-b border-slate-300">
                <tr>
                  {/* Sticky Index */}
                  <th className="px-2 py-2.5 text-center sticky rtl:right-0 ltr:left-0 bg-slate-100 z-30 border-b border-l border-slate-300 min-w-[36px]">
                    #
                  </th>

                  {/* Sticky Working ID */}
                  <th className="px-3 py-2.5 text-start sticky rtl:right-[36px] ltr:left-[36px] bg-slate-100 z-30 border-b border-l border-slate-300 min-w-[125px]">
                    {t.workingId}
                  </th>

                  {/* Sticky Rider Name */}
                  <th className="px-3 py-2.5 text-start sticky rtl:right-[161px] ltr:left-[161px] bg-slate-100 z-30 border-b border-l border-slate-300 min-w-[170px]">
                    {t.riderName}
                  </th>

                  {/* Period Summary Cell */}
                  <th className="px-2.5 py-2.5 text-center bg-slate-200/90 border-b border-l border-slate-300 min-w-[105px]">
                    <div>{t.periodSummary}</div>
                    <div className="text-[9px] text-slate-500 font-normal mt-0.5">
                      {isRtl ? 'مكتمل / إجمالي' : 'Done / Gross'}
                    </div>
                  </th>

                  {/* DYNAMIC DATE COLUMNS */}
                  {periodDays.map((dateStr) => {
                    const dayName = isRtl ? getArabicDayName(dateStr) : getEnglishDayName(dateStr);
                    const shortDate = dateStr.slice(5); // MM-DD

                    let dayCompleted = 0;
                    let dayGross = 0;
                    let dayActiveRiders = 0;
                    let dayQualitySum = 0;
                    let dayQualityCount = 0;

                    filteredRiders.forEach((rider) => {
                      const rec = rider.recordsByDate.get(dateStr);
                      if (rec) {
                        const c = Number(rec.completedOrders) || 0;
                        const g = Number(rec.grossOrders) || 0;
                        dayCompleted += c;
                        dayGross += g;
                        if (c > 0 || g > 0) dayActiveRiders++;
                        if (rec.finalDeliveryQualityScore !== null && rec.finalDeliveryQualityScore !== undefined) {
                          dayQualitySum += Number(rec.finalDeliveryQualityScore);
                          dayQualityCount++;
                        }
                      }
                    });

                    const dayQualityAvg = dayQualityCount > 0 ? dayQualitySum / dayQualityCount : null;

                    return (
                      <th
                        key={dateStr}
                        className="px-1.5 py-1.5 text-center whitespace-nowrap border-b border-l border-slate-200 min-w-[58px] hover:bg-slate-200 transition"
                        title={`${dateStr} (${dayName}) - ${dayActiveRiders} ${t.ridersCount}, ${dayCompleted}/${dayGross} orders`}
                      >
                        <div className="text-[10px] font-medium text-slate-500">{dayName}</div>
                        <div className="text-[11px] font-extrabold text-slate-900 font-mono">{shortDate}</div>
                        <div className="text-[9px] text-slate-500 font-semibold mt-0.5">
                          {activeMetric === 'qualityScore' && dayQualityAvg !== null
                            ? formatPercent(dayQualityAvg, 0)
                            : `${dayCompleted}/${dayGross}`}
                        </div>
                      </th>
                    );
                  })}

                  {/* ACTION COLUMN */}
                  <th className="px-3 py-2.5 text-center bg-slate-100 border-b border-slate-300 min-w-[110px]">
                    {t.actions}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5 + periodDays.length} className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="animate-spin text-blue-600" size={28} />
                        <span className="text-xs font-semibold">{isRtl ? 'جاري تحميل مصفوفة الأداء...' : 'Loading performance matrix...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={5 + periodDays.length} className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users size={32} className="text-gray-300" />
                        <span className="text-sm font-semibold">{t.noRecords}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((rider, index) => {
                    return (
                      <tr
                        key={rider.key}
                        className="hover:bg-blue-50/40 transition group"
                      >
                        {/* Sticky Index */}
                        <td className="px-2 py-1.5 text-center font-mono text-[11px] text-gray-400 sticky rtl:right-0 ltr:left-0 bg-white group-hover:bg-blue-50/80 z-10 border-b border-l border-gray-100">
                          {index + 1}
                        </td>

                        {/* Sticky Working ID */}
                        <td className="px-3 py-1.5 whitespace-nowrap text-start font-mono font-bold text-gray-900 sticky rtl:right-[36px] ltr:left-[36px] bg-white group-hover:bg-blue-50/80 z-10 border-b border-l border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-900 font-extrabold text-[12px]">{rider.workingId}</span>
                            {rider.latestSegment && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getSegmentBadgeColor(
                                  rider.latestSegment
                                )}`}
                              >
                                {rider.latestSegment}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Sticky Rider Name */}
                        <td className="px-3 py-1.5 whitespace-nowrap text-start sticky rtl:right-[161px] ltr:left-[161px] bg-white group-hover:bg-blue-50/80 z-10 border-b border-l border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800 text-[12px] truncate max-w-[150px]" title={rider.riderName}>
                              {rider.riderName}
                            </span>
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
                              className={`px-1 py-1 text-center whitespace-nowrap border-b border-l border-gray-100 transition relative min-w-[58px] ${
                                dayRecord ? 'hover:bg-blue-100/60 cursor-pointer' : 'cursor-default'
                              }`}
                              title={
                                dayRecord
                                  ? `${dateStr} | Segment: ${dayRecord.segment || '-'} | Orders: ${dayRecord.completedOrders ?? 0}/${dayRecord.grossOrders ?? 0} | Quality: ${formatPercent(dayRecord.finalDeliveryQualityScore)}${subNote}`
                                  : `${dateStr}: No Record`
                              }
                              onClick={() => {
                                if (dayRecord) {
                                  setSelectedDayRecord(dayRecord);
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
                          <Link
                            href={`/member/reports/rider-daily-performance/${encodeURIComponent(rider.workingId)}?startDate=${filterStartDate}&endDate=${filterEndDate}`}
                            className="px-2 py-1 rounded text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition inline-flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                            title={t.viewDetailsHint}
                          >
                            <ExternalLink size={12} className="text-slate-600" />
                            <span>{t.viewDetails}</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Footer with Column Totals */}
              {filteredRiders.length > 0 && (
                <tfoot className="bg-slate-100 text-slate-900 font-bold text-[11px] sticky bottom-0 z-20 border-t-2 border-slate-300 shadow-md">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-start sticky rtl:right-0 ltr:left-0 bg-slate-100 z-30 border-l border-slate-300">
                      <span>{isRtl ? 'إجمالي الفترة لكافة المناديب المعروضين' : 'Total for Displayed Riders'}</span>
                    </td>
                    <td className="px-2 py-2 text-center bg-slate-200 border-l border-slate-300 font-extrabold">
                      <div>
                        {filteredRiders.reduce((s, r) => s + r.totalCompletedOrders, 0).toLocaleString()}
                        <span className="text-gray-400 font-normal"> / </span>
                        {filteredRiders.reduce((s, r) => s + r.totalGrossOrders, 0).toLocaleString()}
                      </div>
                    </td>
                    {periodDays.map((dateStr) => {
                      let totCompleted = 0;
                      let totGross = 0;
                      let totActive = 0;
                      let totQuality = 0;
                      let qualityCount = 0;

                      filteredRiders.forEach((r) => {
                        const rec = r.recordsByDate.get(dateStr);
                        if (rec) {
                          const c = Number(rec.completedOrders) || 0;
                          const g = Number(rec.grossOrders) || 0;
                          totCompleted += c;
                          totGross += g;
                          if (c > 0 || g > 0) totActive++;
                          if (rec.finalDeliveryQualityScore !== null && rec.finalDeliveryQualityScore !== undefined) {
                            totQuality += Number(rec.finalDeliveryQualityScore);
                            qualityCount++;
                          }
                        }
                      });

                      const avgQ = qualityCount > 0 ? totQuality / qualityCount : null;

                      return (
                        <td key={dateStr} className="px-1 py-1.5 text-center whitespace-nowrap border-l border-slate-200">
                          {activeMetric === 'qualityScore' ? (
                            <span className="text-[10px] font-bold text-slate-800">
                              {avgQ !== null ? formatPercent(avgQ, 0) : '-'}
                            </span>
                          ) : (
                            <div className="text-[10px] font-bold leading-tight">
                              <span>{totCompleted}</span>
                              <span className="text-gray-400 font-normal">/</span>
                              <span className="text-slate-600">{totGross}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center bg-slate-100">
                      -
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* DAY PERFORMANCE DETAILS MODAL */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
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
              {/* Substitute Banner if present */}
              {selectedDayRecord.substituteRiderName && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">
                      {isRtl
                        ? `يستخدم الحساب بواسطة: ${selectedDayRecord.substituteRiderName}`
                        : `Account used by: ${selectedDayRecord.substituteRiderName}`}
                    </span>
                    {selectedDayRecord.riderName && (
                      <span className="text-amber-700 ml-2 rtl:mr-2 text-[11px]">
                        ({t.accountOwner}: {selectedDayRecord.riderName})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Rider & Date Header */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">{t.workingId}</div>
                  <div className="text-sm font-extrabold text-blue-900 font-mono">
                    {selectedDayRecord.workingId || selectedDayRecord.sourceRiderId}
                  </div>
                  {selectedDayRecord.riderName && (
                    <div className="text-xs text-slate-700 font-bold mt-0.5">
                      {selectedDayRecord.riderName}
                    </div>
                  )}
                </div>
                <div className="text-end">
                  <div className="text-xs text-slate-500 font-semibold">{t.performanceDate}</div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono flex items-center gap-1.5 justify-end">
                    <Calendar size={14} className="text-blue-600" />
                    <span>{selectedDayRecord.performanceDate ? String(selectedDayRecord.performanceDate).split('T')[0] : '-'}</span>
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

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.grossOrdersLabel}</span>
                  <span className="text-lg font-bold text-slate-900">{selectedDayRecord.grossOrders ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.completedOrdersLabel}</span>
                  <span className="text-lg font-bold text-emerald-700">{selectedDayRecord.completedOrders ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.completedOrdersInTimeLabel}</span>
                  <span className="text-lg font-bold text-blue-700">{selectedDayRecord.completedOrdersInTime ?? 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.failedOrdersByRiderLabel}</span>
                  <span className={`text-lg font-bold ${Number(selectedDayRecord.failedOrdersByRider) > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {selectedDayRecord.failedOrdersByRider ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.onTimeDeliveryScoreLabel}</span>
                  <span className="text-lg font-bold text-teal-700">
                    {formatPercent(selectedDayRecord.onTimeDeliveryScore)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.finalDeliveryQualityScoreLabel}</span>
                  <span className="text-lg font-bold text-amber-700">
                    {formatPercent(selectedDayRecord.finalDeliveryQualityScore)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">{t.verificationSuccessRate}</span>
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

              {/* Action Button inside modal */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <Link
                  href={`/member/reports/rider-daily-performance/${encodeURIComponent(selectedDayRecord.workingId || selectedDayRecord.sourceRiderId)}?startDate=${filterStartDate}&endDate=${filterEndDate}`}
                  className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>{t.viewDetails}</span>
                </Link>

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
