'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/auth/tokenManager';
import { VehicleDocumentsService } from '@/lib/api/vehicleDocumentsService';
import PageHeader from '@/components/layout/pageheader';
import Modal from '@/components/Ui/Model';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatPlateNumber } from '@/lib/utils/formatters';
import {
  FileText,
  AlertOctagon,
  Clock,
  Calendar,
  FileQuestion,
  RefreshCw,
  Edit3,
  CalendarCheck2,
  ShieldAlert,
  Car,
  MapPin,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  Hash,
  UploadCloud,
  FileSpreadsheet,
} from 'lucide-react';
import VehicleDocumentsImportModal from '@/components/vehicles/VehicleDocumentsImportModal';

const DOCUMENT_TYPES = [
  { key: 'all', labelKey: 'common.all', labelAr: 'الكل', labelEn: 'All', value: undefined },
  { key: 'Registration', labelKey: 'vehicles.registration', labelAr: 'الاستمارة', labelEn: 'Registration', value: 'Registration' },
  { key: 'Insurance', labelKey: 'vehicles.insurance', labelAr: 'التأمين', labelEn: 'Insurance', value: 'Insurance' },
  { key: 'Inspection', labelKey: 'vehicles.inspection', labelAr: 'الفحص الدوري', labelEn: 'Inspection', value: 'Inspection' },
];

const WINDOW_OPTIONS = [
  { value: 0, labelAr: 'اليوم (0)', labelEn: 'Today (0)' },
  { value: 7, labelAr: '7 أيام', labelEn: '7 Days' },
  { value: 30, labelAr: '30 يومًا', labelEn: '30 Days' },
  { value: 60, labelAr: '60 يومًا', labelEn: '60 Days' },
  { value: 90, labelAr: '90 يومًا', labelEn: '90 Days' },
];

const PAGE_SIZES = [25, 50, 100];

/**
 * Normalizes text for comprehensive matching across Arabic/Western digits,
 * spaces, dashes, and Arabic letter variants (أ/إ/آ -> ا, ة -> ه, ى -> ي).
 */
const normalizeSearch = (str) => {
  if (!str) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str)
    .replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d))
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
};

export default function VehicleDocumentRemindersPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Role verification: Master or Admin required
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const user = TokenManager.getUserFromToken() || {};
    setCurrentUser(user);
    const rawRoles = user.roles ?? user.role ?? user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    const authorized = roles.includes('Master') || roles.includes('Admin');
    setIsAuthorized(authorized);
  }, []);

  // Filter and pagination state
  const [activeTab, setActiveTab] = useState('reminders'); // 'reminders' | 'expiring' | 'missing'
  const [selectedDocType, setSelectedDocType] = useState(undefined); // undefined for all
  const [windowDays, setWindowDays] = useState(30);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Search state (searches through ALL pages)
  const [searchTerm, setSearchTerm] = useState('');
  const [allDocuments, setAllDocuments] = useState(null);
  const [loadingAllForSearch, setLoadingAllForSearch] = useState(false);

  // Data & loading state
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    checkDate: '',
    daysBeforeExpiry: 30,
    page: 1,
    pageSize: 50,
    totalDocuments: 0,
    missingCount: 0,
    expiredCount: 0,
    dueTodayCount: 0,
    upcomingCount: 0,
    items: [],
  });

  // Global summary counters (retained across tabs so summary cards always reflect total fleet state)
  const [globalCounts, setGlobalCounts] = useState({
    missingCount: 0,
    expiredCount: 0,
    dueTodayCount: 0,
    upcomingCount: 0,
    totalDocuments: 0,
    checkDate: '',
  });

  // Feedback messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Stale request tracking
  const requestCounterRef = useRef(0);

  // Bulk import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Edit dates modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicleRow, setSelectedVehicleRow] = useState(null);
  const [loadingVehicleDates, setLoadingVehicleDates] = useState(false);
  const [savingDates, setSavingDates] = useState(false);
  const [editError, setEditError] = useState('');
  const [dateForm, setDateForm] = useState({
    licenseExpiryDate: '',
    insuranceExpiryDate: '',
    inspectionExpiryDate: '',
  });

  /**
   * Fetch global dashboard counters
   */
  const loadGlobalCounters = useCallback(async () => {
    try {
      const countersRes = await VehicleDocumentsService.getGlobalCounters(windowDays);
      if (countersRes) {
        setGlobalCounts({
          missingCount: countersRes.missingCount ?? 0,
          expiredCount: countersRes.expiredCount ?? 0,
          dueTodayCount: countersRes.dueTodayCount ?? 0,
          upcomingCount: countersRes.upcomingCount ?? 0,
          totalDocuments: countersRes.totalDocuments ?? 0,
          checkDate: countersRes.checkDate || '',
        });
      }
    } catch (err) {
      console.warn('Could not refresh global document counters:', err);
    }
  }, [windowDays]);

  /**
   * Fetch document report according to active tab and filters (single page)
   */
  const loadReport = useCallback(async (isBackground = false) => {
    if (!isAuthorized) return;

    const requestId = ++requestCounterRef.current;
    if (!isBackground) {
      setLoading(true);
    }
    setErrorMessage('');

    try {
      const query = {
        documentType: selectedDocType,
        daysBeforeExpiry: windowDays,
        page,
        pageSize,
      };

      const [response, vehiclesIndex] = await Promise.all([
        activeTab === 'expiring'
          ? VehicleDocumentsService.getExpiring(query)
          : activeTab === 'missing'
          ? VehicleDocumentsService.getMissing(query)
          : VehicleDocumentsService.getReminders(query),
        VehicleDocumentsService.getVehiclesIndex(),
      ]);

      // Check if this is still the newest request
      if (requestId !== requestCounterRef.current) return;

      if (response) {
        const rawItems = Array.isArray(response.items) ? response.items : [];
        const total = response.totalDocuments ?? 0;

        // Attach serialNumber to each item using index
        const serialMap = vehiclesIndex?.serialMap;
        const items = rawItems.map((item) => ({
          ...item,
          serialNumber: serialMap?.get(item.vehicleNumber) || serialMap?.get(item.plateNumberA) || null,
        }));

        // If page has become out of bounds after deletion/update and page > 1, rewind
        if (items.length === 0 && total > 0 && page > 1) {
          const maxPage = Math.max(1, Math.ceil(total / pageSize));
          if (page > maxPage) {
            setPage(maxPage);
            return;
          }
        }

        setReport({
          checkDate: response.checkDate || '',
          daysBeforeExpiry: response.daysBeforeExpiry ?? windowDays,
          page: response.page ?? page,
          pageSize: response.pageSize ?? pageSize,
          totalDocuments: total,
          missingCount: response.missingCount ?? 0,
          expiredCount: response.expiredCount ?? 0,
          dueTodayCount: response.dueTodayCount ?? 0,
          upcomingCount: response.upcomingCount ?? 0,
          items,
        });

        // If on reminders tab without filter, update global counts as well
        if (activeTab === 'reminders' && !selectedDocType) {
          setGlobalCounts({
            missingCount: response.missingCount ?? 0,
            expiredCount: response.expiredCount ?? 0,
            dueTodayCount: response.dueTodayCount ?? 0,
            upcomingCount: response.upcomingCount ?? 0,
            totalDocuments: total,
            checkDate: response.checkDate || '',
          });
        }
      }
    } catch (err) {
      if (requestId !== requestCounterRef.current) return;
      console.error('Failed to load vehicle document report:', err);

      if (err.status === 403) {
        setIsAuthorized(false);
        setErrorMessage('ليس لديك صلاحية للوصول إلى بيانات وثائق المركبات (يتطلب رتبة مدير أو مشرف عام).');
      } else {
        setErrorMessage(
          err.errorDescription ||
          err.detail ||
          err.message ||
          'حدث خطأ أثناء تحميل بيانات وثائق المركبات. يرجى المحاولة مرة أخرى.'
        );
      }
    } finally {
      if (requestId === requestCounterRef.current) {
        setLoading(false);
      }
    }
  }, [activeTab, selectedDocType, windowDays, page, pageSize, isAuthorized]);

  /**
   * Fetch all documents across ALL pages whenever search is active
   */
  const loadAllDocumentsForSearch = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingAllForSearch(true);
    try {
      const result = await VehicleDocumentsService.getAllDocuments({
        tab: activeTab,
        documentType: selectedDocType,
        daysBeforeExpiry: windowDays,
      });
      setAllDocuments(result.items || []);
    } catch (err) {
      console.error('Failed to load all documents for search:', err);
    } finally {
      setLoadingAllForSearch(false);
    }
  }, [activeTab, selectedDocType, windowDays, isAuthorized]);

  // When search term changes from empty to active, fetch all documents across all pages if not yet loaded
  useEffect(() => {
    if (searchTerm.trim() && allDocuments === null && !loadingAllForSearch) {
      loadAllDocumentsForSearch();
    }
  }, [searchTerm, allDocuments, loadingAllForSearch, loadAllDocumentsForSearch]);

  // Initial load and dependency load
  useEffect(() => {
    if (isAuthorized) {
      loadReport();
      loadGlobalCounters();
    }
  }, [loadReport, loadGlobalCounters, isAuthorized]);

  // Reset allDocuments cache when tab, docType, or window changes
  const resetSearchCache = () => {
    setAllDocuments(null);
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    resetSearchCache();
  };

  // Doc type change handler
  const handleDocTypeChange = (docType) => {
    setSelectedDocType(docType);
    setPage(1);
    resetSearchCache();
  };

  // Window change handler
  const handleWindowChange = (days) => {
    setWindowDays(days);
    setPage(1);
    resetSearchCache();
  };

  // Page size change handler
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Search input change handler
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
  };

  // Auto-refresh: on window focus and every 60 seconds when visible
  useEffect(() => {
    if (!isAuthorized) return;

    const handleFocus = () => {
      loadReport(true);
      loadGlobalCounters();
      if (searchTerm.trim()) {
        loadAllDocumentsForSearch();
      }
    };

    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadReport(true);
        loadGlobalCounters();
        if (searchTerm.trim()) {
          loadAllDocumentsForSearch();
        }
      }
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [loadReport, loadGlobalCounters, isAuthorized, searchTerm, loadAllDocumentsForSearch]);

  // Filter items across all pages when searching
  const searchResults = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return null;

    const source = allDocuments || report.items;
    const cleanTerm = normalizeSearch(term);

    return source.filter((item) => {
      const matchPlate = normalizeSearch(item.plateNumberA).includes(cleanTerm);
      const matchVehicleNumber = normalizeSearch(item.vehicleNumber).includes(cleanTerm);
      const matchSerial = normalizeSearch(item.serialNumber).includes(cleanTerm);
      const matchLocation = normalizeSearch(item.location).includes(cleanTerm);
      return matchPlate || matchVehicleNumber || matchSerial || matchLocation;
    });
  }, [searchTerm, allDocuments, report.items]);

  // Determine currently displayed items & total counts
  const isSearchActive = searchTerm.trim().length > 0;
  const currentTotal = isSearchActive
    ? (searchResults ? searchResults.length : 0)
    : report.totalDocuments;

  const currentItems = isSearchActive
    ? (searchResults ? searchResults.slice((page - 1) * pageSize, page * pageSize) : [])
    : report.items;

  const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));
  const hasNextPage = page * pageSize < currentTotal;
  const hasPrevPage = page > 1;

  /**
   * Open Edit Dates Modal and load all three existing dates
   */
  const handleOpenEdit = async (item) => {
    setSelectedVehicleRow(item);
    setEditError('');
    setEditModalOpen(true);
    setLoadingVehicleDates(true);
    setDateForm({
      licenseExpiryDate: '',
      insuranceExpiryDate: '',
      inspectionExpiryDate: '',
    });

    try {
      const dates = await VehicleDocumentsService.getVehicleDocumentDates(
        item.plateNumberA,
        item.vehicleNumber
      );

      // Pre-fill fields with existing values if found, or fall back to item date if matching type
      setDateForm({
        licenseExpiryDate:
          dates.licenseExpiryDate ||
          (item.documentType === 'Registration' && item.expiryDate ? item.expiryDate : ''),
        insuranceExpiryDate:
          dates.insuranceExpiryDate ||
          (item.documentType === 'Insurance' && item.expiryDate ? item.expiryDate : ''),
        inspectionExpiryDate:
          dates.inspectionExpiryDate ||
          (item.documentType === 'Inspection' && item.expiryDate ? item.expiryDate : ''),
      });
    } catch (err) {
      console.error('Failed to prefill vehicle dates:', err);
      setEditError('تعذر جلب التواريخ الحالية للمركبة بالكامل. يرجى توخي الحذر عند الحفظ.');
    } finally {
      setLoadingVehicleDates(false);
    }
  };

  /**
   * Save replaced document dates
   */
  const handleSaveDates = async (e) => {
    e.preventDefault();
    if (!selectedVehicleRow) return;

    setSavingDates(true);
    setEditError('');

    try {
      await VehicleDocumentsService.updateDocuments(selectedVehicleRow.vehicleNumber, {
        licenseExpiryDate: dateForm.licenseExpiryDate ? dateForm.licenseExpiryDate : null,
        insuranceExpiryDate: dateForm.insuranceExpiryDate ? dateForm.insuranceExpiryDate : null,
        inspectionExpiryDate: dateForm.inspectionExpiryDate ? dateForm.inspectionExpiryDate : null,
      });

      setSuccessMessage('تم تحديث التواريخ بنجاح.');
      setTimeout(() => setSuccessMessage(''), 4000);

      setEditModalOpen(false);
      resetSearchCache();
      loadReport(false);
      loadGlobalCounters();
      if (isSearchActive) {
        loadAllDocumentsForSearch();
      }
    } catch (err) {
      console.error('Failed to update vehicle document dates:', err);
      const detailMsg =
        err?.fullError?.detail ||
        err?.fullError?.title ||
        err?.errorDescription ||
        err?.detail ||
        err?.message ||
        'فشل تحديث التواريخ. يرجى مراجعة المدخلات والمحاولة مجددًا.';
      setEditError(detailMsg);
    } finally {
      setSavingDates(false);
    }
  };

  // Helper formatting for status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <AlertOctagon size={13} className="text-rose-600 flex-shrink-0" />
            <span>منتهي</span>
          </span>
        );
      case 'DueToday':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs animate-pulse">
            <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
            <span>ينتهي اليوم</span>
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-amber-700 border border-yellow-200 shadow-xs">
            <Clock size={13} className="text-amber-500 flex-shrink-0" />
            <span>قريب الانتهاء</span>
          </span>
        );
      case 'Missing':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <FileQuestion size={13} className="text-slate-500 flex-shrink-0" />
            <span>التاريخ غير مسجل</span>
          </span>
        );
    }
  };

  // Helper for document type labels
  const getDocTypeInfo = (type) => {
    switch (type) {
      case 'Registration':
        return { label: 'الاستمارة', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'Insurance':
        return { label: 'التأمين', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'Inspection':
        return { label: 'الفحص الدوري', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: type, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Format remaining days description accurately as per backend spec
  const renderDaysRemaining = (days) => {
    if (days === null || days === undefined) {
      return <span className="text-slate-400 font-semibold">—</span>;
    }
    if (days < 0) {
      return (
        <span className="text-rose-600 font-bold text-xs" dir="rtl">
          متأخر منذ {Math.abs(days)} يوم
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="text-amber-600 font-extrabold text-xs" dir="rtl">
          اليوم
        </span>
      );
    }
    return (
      <span className="text-slate-700 font-medium text-xs" dir="rtl">
        خلال {days} يوم
      </span>
    );
  };

  // Unauthorized page state
  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">غير مصرح بالوصول</h2>
        <p className="text-slate-500 max-w-md mb-6 leading-relaxed">
          يتطلب هذا القسم صلاحيات مسؤول (Admin) أو مشرف عام (Master) للاطلاع على وثائق المركبات وتحديثها.
        </p>
        <Button onClick={() => router.push('/admin/live-stats')} variant="secondary">
          العودة إلى لوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Page Header */}
      <PageHeader
        title="وثائق المركبات"
        subtitle="متابعة تنبيهات انتهاء الاستمارة والتأمين والفحص الدوري وتحديث التواريخ"
        icon={Car}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>استيراد وتحديث مجمّع (Excel)</span>
            </button>
            <button
              onClick={() => {
                loadReport(false);
                loadGlobalCounters();
                if (isSearchActive) {
                  loadAllDocumentsForSearch();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <RefreshCw size={15} className={loading || loadingAllForSearch ? 'animate-spin' : ''} />
              <span>تحديث البيانات</span>
            </button>
          </div>
        }
      />

      {/* Bulk Import Action Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <UploadCloud size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              التحديث المجمّع لتواريخ رخص السير والفحص الدوري
            </h3>
            <p className="text-xs text-slate-500">
              ارفع ملف إكسل (.xlsx) لتحديث تواريخ الاستمارة والفحص بالرقم التسلسلي مع الدعم الكامل للتواريخ الهجرية والميلادية والمعاينة المسبقة قبل الحفظ.
            </p>
          </div>
        </div>

        <button
          onClick={() => setImportModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-98 text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <FileSpreadsheet size={16} />
          <span>فتح نافذة الاستيراد والمعاينة</span>
        </button>
      </div>

      {/* Global Saudi Date Banner & Alerts */}
      {globalCounts.checkDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white rounded-xl border border-blue-100 text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CalendarCheck2 size={16} className="text-blue-600" />
            <span className="font-semibold">تاريخ الفحص في الخادم (بتوقيت السعودية UTC+3):</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-bold" dir="ltr">
              {globalCounts.checkDate}
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            التحديث التلقائي نشط كل 60 ثانية وعند العودة للشاشة
          </div>
        </div>
      )}

      {errorMessage && (
        <Alert
          type="error"
          title="خطأ"
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title="نجاح"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expired Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-rose-100 shadow-xs hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-rose-400" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                منتهي
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {globalCounts.expiredCount.toLocaleString('ar-SA')}
              </h3>
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                وثائق تجاوزت تاريخ الانتهاء
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertOctagon size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Due Today Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-amber-200 shadow-xs hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                ينتهي اليوم
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {globalCounts.dueTodayCount.toLocaleString('ar-SA')}
              </h3>
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                تاريخ انتهائها يطابق تاريخ اليوم
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-yellow-100 shadow-xs hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                قريب الانتهاء
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {globalCounts.upcomingCount.toLocaleString('ar-SA')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                خلال نافذة {windowDays} يوم
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Missing Date Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-slate-400 to-slate-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                التاريخ غير مسجل
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {globalCounts.missingCount.toLocaleString('ar-SA')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                لم يتم تسجيل تاريخ الانتهاء بعد
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileQuestion size={24} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-5 pt-3 gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTabChange('reminders')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all ${
                activeTab === 'reminders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>جميع التنبيهات</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'reminders' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeTab === 'reminders' ? report.totalDocuments : globalCounts.totalDocuments}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('expiring')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all ${
                activeTab === 'expiring'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>قريب الانتهاء واليوم</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'expiring' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeTab === 'expiring'
                  ? report.totalDocuments
                  : globalCounts.dueTodayCount + globalCounts.upcomingCount}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('missing')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all ${
                activeTab === 'missing'
                  ? 'border-slate-700 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>تواريخ غير مسجلة</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'missing' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeTab === 'missing' ? report.totalDocuments : globalCounts.missingCount}
              </span>
            </button>
          </div>

          {/* Quick Page Info */}
          <div className="text-xs text-slate-500 hidden sm:block pb-2">
            إجمالي الوثائق المطابقة: <strong className="text-slate-800">{report.totalDocuments}</strong>
          </div>
        </div>

        {/* Filter Controls & Search Toolbar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input across ALL pages */}
            <div className="relative flex-1 min-w-[280px] max-w-lg">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="بحث شامل برقم اللوحة، الرقم التسلسلي، أو رقم المركبة عبر كافة الصفحات..."
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-rose-600 transition-colors"
                  title="مسح البحث"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Document Selector */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
                <FileText size={14} /> الوثيقة:
              </span>
              {DOCUMENT_TYPES.map((dt) => (
                <button
                  key={dt.key}
                  onClick={() => handleDocTypeChange(dt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDocType === dt.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {dt.labelAr}
                </button>
              ))}
            </div>

            {/* Window Selector (Disabled on missing tab) */}
            {activeTab !== 'missing' && (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
                  <Calendar size={14} /> النافذة:
                </span>
                {WINDOW_OPTIONS.map((win) => (
                  <button
                    key={win.value}
                    onClick={() => handleWindowChange(win.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      windowDays === win.value
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {win.labelAr}
                  </button>
                ))}
              </div>
            )}

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">عرض:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAGE_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz} عنصر
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Result Banner */}
          {isSearchActive && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-blue-600" />
                <span>
                  نتائج البحث الشامل عن: <strong className="font-bold underline text-blue-800">{searchTerm}</strong>
                </span>
                <span className="text-slate-500">
                  (تم العثور على <strong>{currentTotal}</strong> وثيقة مطابقة عبر جميع صفحات الأسطول)
                </span>
                {loadingAllForSearch && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 animate-pulse font-medium">
                    <RefreshCw size={11} className="animate-spin" /> جاري فحص كافة الصفحات...
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
              >
                إلغاء البحث والعودة للعرض الكامل
              </button>
            </div>
          )}
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-100 text-xs font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">رقم اللوحة</th>
                <th className="py-3 px-4">رقم المركبة</th>
                <th className="py-3 px-4">الرقم التسلسلي</th>
                <th className="py-3 px-4">الموقع</th>
                <th className="py-3 px-4">نوع الوثيقة</th>
                <th className="py-3 px-4">تاريخ الانتهاء</th>
                <th className="py-3 px-4">المدة المتبقية</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading || (isSearchActive && loadingAllForSearch && currentItems.length === 0) ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-8 bg-slate-200 rounded-lg w-24 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                        {isSearchActive ? <Search size={28} /> : <CheckCircle2 size={32} />}
                      </div>
                      <p className="text-base font-bold text-slate-700 mb-1">
                        {isSearchActive
                          ? `لم يتم العثور على أي مركبة تطابق "${searchTerm}" عبر كافة الصفحات`
                          : 'لا توجد وثائق مطابقة للفلاتر الحالية'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isSearchActive
                          ? 'تأكد من كتابة رقم اللوحة أو الرقم التسلسلي أو رقم المركبة بشكل صحيح، أو امسح البحث لإظهار كافة الوثائق.'
                          : 'جميع الوثائق ضمن المعايير المحددة منتظمة ولا تتطلب أي إجراء فوري.'}
                      </p>
                      {isSearchActive && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="mt-3 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                        >
                          إلغاء البحث وعرض كافة الوثائق
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const docInfo = getDocTypeInfo(item.documentType);
                  const rowKey = `${item.vehicleNumber}:${item.documentType}`;

                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Plate Number */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Car size={15} />
                          </div>
                          <div>
                            <bdi
                              dir="ltr"
                              className="font-mono tracking-wide text-sm font-bold text-slate-800"
                            >
                              {formatPlateNumber(item.plateNumberA)}
                            </bdi>
                            {item.message && (
                              <p className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs mt-0.5">
                                {item.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Number */}
                      <td className="py-3.5 px-4">
                        <bdi dir="ltr" className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.vehicleNumber}
                        </bdi>
                      </td>

                      {/* Serial Number */}
                      <td className="py-3.5 px-4">
                        {item.serialNumber ? (
                          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-800" dir="ltr">
                            <Hash size={12} className="text-slate-400 flex-shrink-0" />
                            <span>{item.serialNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                          <span>{item.location || '—'}</span>
                        </div>
                      </td>

                      {/* Document Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${docInfo.color}`}
                        >
                          {docInfo.label}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {item.expiryDate ? (
                          <bdi dir="ltr" className="font-semibold text-slate-800">
                            {item.expiryDate}
                          </bdi>
                        ) : (
                          <span className="text-slate-400 italic font-sans text-xs">
                            غير مسجل
                          </span>
                        )}
                      </td>

                      {/* Remaining Days */}
                      <td className="py-3.5 px-4">
                        {renderDaysRemaining(item.daysUntilExpiry)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors shadow-2xs"
                        >
                          <Edit3 size={13} />
                          <span>تحديث التواريخ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {currentTotal > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-white">
            <div className="text-xs text-slate-500">
              {isSearchActive ? (
                <>
                  نتائج البحث: صفحة <strong className="text-slate-800">{page}</strong> من إجمالي{' '}
                  <strong className="text-slate-800">{totalPages}</strong> (
                  <span className="font-semibold text-blue-700">{currentTotal}</span> نتيجة مطابقة عبر كافة الصفحات)
                </>
              ) : (
                <>
                  عرض الصفحة <strong className="text-slate-800">{report.page}</strong> من إجمالي{' '}
                  <strong className="text-slate-800">{totalPages}</strong> (
                  <span className="font-semibold">{report.totalDocuments}</span> وثيقة مسجلة)
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!hasPrevPage || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
                <span>السابق</span>
              </button>

              <div className="text-xs px-2 font-mono font-bold text-slate-700">
                {page} / {totalPages}
              </div>

              <button
                disabled={!hasNextPage || loading}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>التالي</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dates Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          if (!savingDates) {
            setEditModalOpen(false);
          }
        }}
        title="تحديث تواريخ وثائق المركبة"
        size="md"
        dir="rtl"
      >
        {selectedVehicleRow && (
          <form onSubmit={handleSaveDates} className="space-y-5">
            {/* Vehicle identity header in modal */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">اللوحة ورقم المركبة</p>
                  <p className="text-sm font-bold text-slate-900" dir="ltr">
                    {formatPlateNumber(selectedVehicleRow.plateNumberA)}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500">رقم المركبة</p>
                <bdi dir="ltr" className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {selectedVehicleRow.vehicleNumber}
                </bdi>
              </div>
            </div>

            {editError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                {editError}
              </div>
            )}

            {loadingVehicleDates ? (
              <div className="py-8 text-center text-slate-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-2"></div>
                <p className="text-xs">جاري تحميل التواريخ الحالية للمركبة بالكامل...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  يتم استبدال التواريخ الثلاثة معًا. اترك الحقل فارغًا أو اضغط &quot;مسح&quot; لتسجيل التاريخ كـ <strong>غير مسجل</strong>.
                </p>

                {/* 1. Registration (licenseExpiryDate) */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      تاريخ انتهاء الاستمارة (Registration)
                    </label>
                    {dateForm.licenseExpiryDate && (
                      <button
                        type="button"
                        onClick={() => setDateForm((prev) => ({ ...prev, licenseExpiryDate: '' }))}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5"
                      >
                        <X size={12} /> مسح
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={dateForm.licenseExpiryDate}
                    onChange={(e) =>
                      setDateForm((prev) => ({ ...prev, licenseExpiryDate: e.target.value }))
                    }
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    dir="ltr"
                  />
                </div>

                {/* 2. Insurance (insuranceExpiryDate) */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      تاريخ انتهاء التأمين (Insurance)
                    </label>
                    {dateForm.insuranceExpiryDate && (
                      <button
                        type="button"
                        onClick={() => setDateForm((prev) => ({ ...prev, insuranceExpiryDate: '' }))}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5"
                      >
                        <X size={12} /> مسح
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={dateForm.insuranceExpiryDate}
                    onChange={(e) =>
                      setDateForm((prev) => ({ ...prev, insuranceExpiryDate: e.target.value }))
                    }
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>

                {/* 3. Inspection (inspectionExpiryDate) */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      تاريخ انتهاء الفحص الدوري (Inspection)
                    </label>
                    {dateForm.inspectionExpiryDate && (
                      <button
                        type="button"
                        onClick={() => setDateForm((prev) => ({ ...prev, inspectionExpiryDate: '' }))}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5"
                      >
                        <X size={12} /> مسح
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={dateForm.inspectionExpiryDate}
                    onChange={(e) =>
                      setDateForm((prev) => ({ ...prev, inspectionExpiryDate: e.target.value }))
                    }
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditModalOpen(false)}
                disabled={savingDates}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={savingDates || loadingVehicleDates}
                loading={savingDates}
              >
                حفظ التواريخ
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Bulk Documents Import Modal */}
      <VehicleDocumentsImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          loadReport(false);
          loadGlobalCounters();
          if (isSearchActive) {
            loadAllDocumentsForSearch();
          }
          setSuccessMessage('تم تطبيق تحديثات وثائق المركبات بنجاح وتحديث القوائم والتنبيهات.');
          setTimeout(() => setSuccessMessage(''), 5000);
        }}
      />
    </div>
  );
}
