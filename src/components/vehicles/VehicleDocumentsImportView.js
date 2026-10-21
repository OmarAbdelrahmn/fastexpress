'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  X,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  HelpCircle,
  FileQuestion,
  Layers,
  Save,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { VehicleDocumentsService } from '@/lib/api/vehicleDocumentsService';
import { formatPlateNumber } from '@/lib/utils/formatters';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const PAGE_SIZES = [25, 50, 100];

export default function VehicleDocumentsImportView({
  onSuccess,
  onClose,
  isModal = false,
}) {
  const router = useRouter();

  // File state
  const [file, setFile] = useState(null);
  const [worksheetName, setWorksheetName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Execution state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const abortControllerRef = useRef(null);

  // Result report state
  const [report, setReport] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  // Filter & Search in preview table
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Validate and select file
  const handleSelectFile = (selected) => {
    setErrorMessage('');
    setSuccessBanner('');
    setReport(null);
    setIsApplied(false);

    if (!selected) return;

    const fileName = selected.name || '';
    const lowerName = fileName.toLowerCase();

    // Check for old .xls
    if (lowerName.endsWith('.xls') && !lowerName.endsWith('.xlsx')) {
      setErrorMessage(
        'الملفات بصيغة .xls الثنائية القديمة غير مدعومة. يرجى حفظ الملف أو تصديره بصيغة .xlsx المحدثة ثم إعادة رفعه.'
      );
      setFile(null);
      return;
    }

    if (!lowerName.endsWith('.xlsx')) {
      setErrorMessage('صيغة الملف غير مدعومة. يرجى اختيار ملف إكسل بصيغة .xlsx فقط.');
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (selected.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`حجم الملف المحدد (${sizeMB} ميجابايت) يتجاوز الحد الأقصى المسموح وهو 10 ميجابايت.`);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    try {
      const headers = ['الرقم التسلسلي', 'تاريخ انتهاء رخصة السير', 'تاريخ انتهاء الفحص'];
      const sampleData = [
        {
          'الرقم التسلسلي': 819465020,
          'تاريخ انتهاء رخصة السير': '1448-08-03',
          'تاريخ انتهاء الفحص': '1449-03-28',
        },
        {
          'الرقم التسلسلي': 335822020,
          'تاريخ انتهاء رخصة السير': '1451-03-26',
          'تاريخ انتهاء الفحص': '-',
        },
        {
          'الرقم التسلسلي': 945123010,
          'تاريخ انتهاء رخصة السير': '2027-01-11',
          'تاريخ انتهاء الفحص': '2027-08-30',
        },
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      ws['!cols'] = [{ wch: 18 }, { wch: 28 }, { wch: 24 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تحديث_الوثائق');
      XLSX.writeFile(wb, 'نموذج_تحديث_تواريخ_وثائق_المركبات.xlsx');
    } catch (err) {
      console.error('Failed to generate template:', err);
      setErrorMessage('حدث خطأ أثناء إنشاء النموذج. يرجى المحاولة لاحقاً.');
    }
  };

  // Export Report to Excel
  const handleExportReport = () => {
    if (!report || !report.rows || report.rows.length === 0) return;

    try {
      const exportRows = report.rows.map((row) => {
        const regChange = row.changes?.find((c) => c.field === 'licenseExpiryDate');
        const inspChange = row.changes?.find((c) => c.field === 'inspectionExpiryDate');

        return {
          'رقم الصف': row.rowNumber,
          'الرقم التسلسلي': row.serialNumber ?? '',
          'رقم المركبة': row.vehicleNumber ?? '',
          'رقم اللوحة': row.plateNumberA ?? '',
          'الحالة': getStatusLabel(row.status),
          'تاريخ الاستمارة المدخل': regChange?.sourceValue ?? '',
          'تقويم الاستمارة': regChange?.sourceCalendar ? (regChange.sourceCalendar === 'Hijri' ? 'هجري' : 'ميلادي') : '',
          'تاريخ الاستمارة السابق (ميلادي)': regChange?.previousValue ?? '',
          'تاريخ الاستمارة الجديد (ميلادي)': regChange?.newValue ?? '',
          'تاريخ الفحص المدخل': inspChange?.sourceValue ?? '',
          'تقويم الفحص': inspChange?.sourceCalendar ? (inspChange.sourceCalendar === 'Hijri' ? 'هجري' : 'ميلادي') : '',
          'تاريخ الفحص السابق (ميلادي)': inspChange?.previousValue ?? '',
          'تاريخ الفحص الجديد (ميلادي)': inspChange?.newValue ?? '',
          'الأخطاء والملاحظات': Array.isArray(row.errors) && row.errors.length > 0 ? row.errors.join(' | ') : '',
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, isApplied ? 'تقرير_التطبيق' : 'تقرير_المعاينة');
      const prefix = isApplied ? 'تقرير_تطبيق_تحديث_الوثائق' : 'تقرير_معاينة_تحديث_الوثائق';
      XLSX.writeFile(wb, `${prefix}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  // Cancel any running request
  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setPreviewLoading(false);
      setApplyLoading(false);
      setErrorMessage('تم إلغاء العملية.');
    }
  };

  // Run Preview (dryRun = true)
  const handleRunPreview = async () => {
    if (!file) {
      setErrorMessage('يرجى اختيار ملف Excel بصيغة .xlsx أولاً');
      return;
    }

    setPreviewLoading(true);
    setErrorMessage('');
    setSuccessBanner('');
    setReport(null);
    setIsApplied(false);
    setStatusFilter('ALL');
    setCurrentPage(1);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await VehicleDocumentsService.importDocuments({
        file,
        dryRun: true,
        worksheetName: worksheetName ? worksheetName.trim() : undefined,
        signal: controller.signal,
      });

      setReport(result);
      if (result.wouldUpdateCount === 0 && result.totalRows > 0) {
        setSuccessBanner(
          'تمت المعاينة بنجاح. لا توجد تواريخ بحاجة إلى التحديث (البيانات إما مطابقة أو تم تخطيها أو غير صالحة).'
        );
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Import preview error:', err);
      const msg =
        err?.fullError?.detail ||
        err?.fullError?.title ||
        err?.message ||
        'حدث خطأ أثناء معاينة ملف الإكسل. يرجى التحقق من صحة الملف والعناوين والمحاولة مرة أخرى.';
      setErrorMessage(msg);
    } finally {
      setPreviewLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Apply Changes (dryRun = false)
  const handleApplyChanges = async () => {
    if (!file) {
      setErrorMessage('لا يوجد ملف محدد للتطبيق');
      return;
    }

    if (applyLoading || previewLoading) return;

    setApplyLoading(true);
    setErrorMessage('');
    setSuccessBanner('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await VehicleDocumentsService.importDocuments({
        file,
        dryRun: false,
        worksheetName: worksheetName ? worksheetName.trim() : undefined,
        signal: controller.signal,
      });

      // Clear vehicle cache so parent pages receive fresh data
      VehicleDocumentsService.clearCache();

      setReport(result);
      setIsApplied(true);
      setStatusFilter('ALL');
      setCurrentPage(1);

      const updatedCount = result.updatedCount ?? 0;
      const invalidCount = result.invalidCount ?? 0;

      if (updatedCount > 0) {
        setSuccessBanner(
          `تم حفظ التحديثات بنجاح في قاعدة البيانات! تم تحديث تواريخ ${updatedCount} مركبة بنجاح.` +
            (invalidCount > 0 ? ` (تم استبعاد ${invalidCount} صف غير صالح تلقائيًا).` : '')
        );
      } else {
        setSuccessBanner('اكتملت العملية دون إجراء تعديلات على المركبات.');
      }

      // Notify parent callback
      if (onSuccess && typeof onSuccess === 'function') {
        try {
          onSuccess(result);
        } catch (callbackErr) {
          console.warn('onSuccess callback error:', callbackErr);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Import apply error:', err);
      const msg =
        err?.fullError?.detail ||
        err?.fullError?.title ||
        err?.message ||
        'فشل تطبيق وحفظ التحديثات في قاعدة البيانات. تم إلغاء كافة التغييرات ولم يتم تعديل أي مركبة.';
      setErrorMessage(msg);
    } finally {
      setApplyLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Map status to Arabic label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'Updated':
        return 'تم التحديث بنجاح';
      case 'WouldUpdate':
        return 'سيتم التحديث';
      case 'Unchanged':
        return 'مطابق بدون تغيير';
      case 'Skipped':
        return 'تم التخطي (بدون تواريخ)';
      case 'NotFound':
        return 'غير موجود بالنظام';
      case 'Invalid':
        return 'غير صالح / خطأ';
      case 'Ambiguous':
        return 'مكرر / متطابق متعدد';
      default:
        return status || '—';
    }
  };

  // Map status to styled badge JSX
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Updated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
            <span>تم التحديث</span>
          </span>
        );
      case 'WouldUpdate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300 shadow-xs">
            <Clock size={13} className="text-teal-600 flex-shrink-0" />
            <span>سيتم التحديث</span>
          </span>
        );
      case 'Unchanged':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span>مطابق</span>
          </span>
        );
      case 'Skipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <FileQuestion size={13} className="text-sky-500 flex-shrink-0" />
            <span>تم التخطي</span>
          </span>
        );
      case 'NotFound':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
            <span>غير موجود</span>
          </span>
        );
      case 'Ambiguous':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-300">
            <Layers size={13} className="text-orange-600 flex-shrink-0" />
            <span>متعدد بالنظام</span>
          </span>
        );
      case 'Invalid':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs">
            <AlertOctagon size={13} className="text-rose-600 flex-shrink-0" />
            <span>غير صالح</span>
          </span>
        );
    }
  };

  // Filtered rows for preview table
  const filteredRows = useMemo(() => {
    if (!report || !Array.isArray(report.rows)) return [];

    let list = report.rows;

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'UPDATE_GROUP') {
        list = list.filter((r) => r.status === 'WouldUpdate' || r.status === 'Updated');
      } else {
        list = list.filter((r) => r.status === statusFilter);
      }
    }

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      list = list.filter((r) => {
        const serial = String(r.serialNumber ?? '').toLowerCase();
        const plate = String(r.plateNumberA ?? '').toLowerCase();
        const vehicleNum = String(r.vehicleNumber ?? '').toLowerCase();
        const rowNum = String(r.rowNumber ?? '');
        const errors = Array.isArray(r.errors) ? r.errors.join(' ').toLowerCase() : '';
        return (
          serial.includes(query) ||
          plate.includes(query) ||
          vehicleNum.includes(query) ||
          rowNum.includes(query) ||
          errors.includes(query)
        );
      });
    }

    return list;
  }, [report, statusFilter, searchTerm]);

  // Paginated rows slice
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  return (
    <div className="space-y-6 text-slate-800" dir="rtl">
      {/* Top Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs animate-shake">
          <AlertOctagon size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-bold">خطأ في الاستيراد:</p>
            <p>{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs">
          <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-bold">نجحت العملية:</p>
            <p>{successBanner}</p>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Step 1: Upload and Configuration Card */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm md:text-base">
              اختيار ملف الإكسل (.xlsx)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>تحميل نموذج Excel جاهز</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <HelpCircle size={15} />
              <span>تعليمات الجدول</span>
            </button>
          </div>
        </div>

        {/* Instructions Accordion */}
        {showHelpGuide && (
          <div className="p-4 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 space-y-2.5 leading-relaxed shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <Info size={16} />
              <span>شروط وتخطيط ملف الإكسل المدعوم:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 pr-2">
              <li>
                <strong>الأعمدة المدعومة بأي ترتيب:</strong>
                <span className="text-slate-800 font-mono mx-1">
                  الرقم التسلسلي
                </span>
                (إلزامي)،
                <span className="text-slate-800 font-mono mx-1">
                  تاريخ انتهاء رخصة السير
                </span>
                أو الاستمارة،
                <span className="text-slate-800 font-mono mx-1">
                  تاريخ انتهاء الفحص
                </span>
                .
              </li>
              <li>
                <strong>صيغ التواريخ:</strong> يقبل التواريخ الهجرية المكتوبة بنص مثل (
                <span className="font-mono text-blue-700">1448-08-03</span>) ويتم تحويلها
                تلقائياً حسب تقويم أم القرى الرسمي، كما يقبل التواريخ الميلادية بصيغة ISO أو
                (يوم/شهر/سنة).
              </li>
              <li>
                <strong>الحفاظ على التواريخ السابقة:</strong> الخلية الفارغة أو التي تحتوي على شرطة
                (<span className="font-mono">-</span>) تحافظ على التاريخ المسجل سابقاً للمركبة دون مسحه.
              </li>
              <li>
                <strong>المطابقة:</strong> تتم مطابقة المركبات بالرقم التسلسلي (
                <span className="font-mono">SerialNumber</span>). لا يتم إنشاء مركبات جديدة أو
                تعديل بيانات التأمين أو اللوحة.
              </li>
              <li>
                <strong>الاستبعاد التلقائي:</strong> أي صف به أخطاء أو تاريخ غير صالح أو رقم تسلسلي
                مكرر يُستبعد تلقائياً دون تعطيل الصفوف السليمة.
              </li>
            </ul>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/60'
              : file
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-slate-300 hover:border-blue-400 bg-white'
          }`}
        >
          <input
            type="file"
            id="vehicle-view-excel-upload"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleSelectFile(e.target.files[0]);
              }
            }}
          />

          {!file ? (
            <label
              htmlFor="vehicle-view-excel-upload"
              className="flex flex-col items-center justify-center cursor-pointer space-y-3 py-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <UploadCloud size={30} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  اسحب ملف الإكسل (.xlsx) وأفلته هنا أو{' '}
                  <span className="text-blue-600 hover:underline">اضغط لاختيار ملف</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  الحد الأقصى لحجم الملف: 10 ميجابايت (حتى 5,000 صف بيانات)
                </p>
              </div>
            </label>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 p-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet size={26} />
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} كيلوبايت
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="vehicle-view-excel-upload"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  تغيير الملف
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setReport(null);
                    setIsApplied(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  إزالة
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Advanced / Optional Options */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvanced ? '− إخفاء الخيارات المتقدمة' : '+ خيارات متقدمة (اسم ورقة العمل)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-2.5 p-3.5 bg-white rounded-xl border border-slate-200 max-w-md space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                اسم ورقة العمل (Worksheet Name):
              </label>
              <input
                type="text"
                value={worksheetName}
                onChange={(e) => setWorksheetName(e.target.value)}
                placeholder="اتركه فارغاً للاكتشاف التلقائي"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                dir="ltr"
              />
              <p className="text-[11px] text-slate-500">
                مطلوب فقط إذا كان الملف يحتوي على أكثر من ورقة عمل بنفس العناوين.
              </p>
            </div>
          )}
        </div>

        {/* Preview Button Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
          <div className="text-xs text-slate-500">
            {report ? (
              <span className="text-emerald-700 font-semibold">
                تم فحص الملف. يمكنك استعراض التغييرات وتطبيقها أدناه.
              </span>
            ) : (
              <span>اضغط على زر المعاينة لفحص الملف واقتراح التحديثات دون حفظ.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {previewLoading && (
              <button
                type="button"
                onClick={handleCancelRequest}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                إلغاء المعاينة
              </button>
            )}

            <button
              type="button"
              onClick={handleRunPreview}
              disabled={!file || previewLoading || applyLoading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition-all cursor-pointer ${
                !file || previewLoading || applyLoading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
              }`}
            >
              <RefreshCw size={16} className={previewLoading ? 'animate-spin' : ''} />
              <span>
                {previewLoading
                  ? 'جاري فحص الملف ومعاينة التغييرات...'
                  : report
                  ? 'إعادة فحص الملف (معاينة)'
                  : 'معاينة التغييرات المقترحة (Dry Run)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Summary Counters & Preview Results */}
      {report && (
        <div className="space-y-4 animate-fadeIn">
          {/* Mode Indicator Banner */}
          <div
            className={`px-4 py-3 rounded-2xl border text-xs md:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs ${
              isApplied
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isApplied ? (
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <Clock size={18} className="text-blue-600 flex-shrink-0" />
              )}
              <span>
                {isApplied
                  ? 'تم تطبيق التحديثات وحفظ التواريخ الجديدة في قاعدة البيانات بنجاح.'
                  : 'وضع المعاينة (Dry Run): لم يتم تعديل أي بيانات في قاعدة البيانات حتى الآن. راجع التغييرات المقترحة ثم اضغط على زر التطبيق أدناه.'}
              </span>
            </div>

            {report.worksheetName && (
              <span className="font-mono text-xs px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700" dir="ltr">
                ورقة العمل: {report.worksheetName}
              </span>
            )}
          </div>

          {/* KPI Counters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {/* Total Rows */}
            <div
              onClick={() => {
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-800'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-[11px] opacity-75 font-semibold">إجمالي الصفوف</p>
              <p className="text-xl font-black mt-0.5">{report.totalRows ?? 0}</p>
            </div>

            {/* Would Update or Updated */}
            <div
              onClick={() => {
                setStatusFilter('UPDATE_GROUP');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'UPDATE_GROUP'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600'
                  : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70'
              }`}
            >
              <p className="text-[11px] font-semibold opacity-90">
                {isApplied ? 'تم تحديثها' : 'سيتم تحديثها'}
              </p>
              <p className="text-xl font-black mt-0.5 text-emerald-700">
                {isApplied ? report.updatedCount ?? 0 : report.wouldUpdateCount ?? 0}
              </p>
            </div>

            {/* Unchanged */}
            <div
              onClick={() => {
                setStatusFilter('Unchanged');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'Unchanged'
                  ? 'bg-slate-700 text-white border-slate-800 shadow-md ring-2 ring-slate-700'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <p className="text-[11px] font-semibold opacity-75">مطابقة بدون تغيير</p>
              <p className="text-xl font-black mt-0.5">{report.unchangedCount ?? 0}</p>
            </div>

            {/* Skipped */}
            <div
              onClick={() => {
                setStatusFilter('Skipped');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'Skipped'
                  ? 'bg-sky-700 text-white border-sky-800 shadow-md ring-2 ring-sky-600'
                  : 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100'
              }`}
            >
              <p className="text-[11px] font-semibold opacity-75">تم تخطيها</p>
              <p className="text-xl font-black mt-0.5 text-sky-700">
                {report.skippedCount ?? 0}
              </p>
            </div>

            {/* Not Found */}
            <div
              onClick={() => {
                setStatusFilter('NotFound');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'NotFound'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-500'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <p className="text-[11px] font-semibold opacity-75">غير موجودة</p>
              <p className="text-xl font-black mt-0.5 text-amber-700">
                {report.notFoundCount ?? 0}
              </p>
            </div>

            {/* Ambiguous */}
            <div
              onClick={() => {
                setStatusFilter('Ambiguous');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'Ambiguous'
                  ? 'bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-500'
                  : 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100'
              }`}
            >
              <p className="text-[11px] font-semibold opacity-75">متطابقة متعددة</p>
              <p className="text-xl font-black mt-0.5 text-orange-700">
                {report.ambiguousCount ?? 0}
              </p>
            </div>

            {/* Invalid */}
            <div
              onClick={() => {
                setStatusFilter('Invalid');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'Invalid'
                  ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-600'
                  : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <p className="text-[11px] font-semibold opacity-75">صفوف غير صالحة</p>
              <p className="text-xl font-black mt-0.5 text-rose-700">
                {report.invalidCount ?? 0}
              </p>
            </div>
          </div>

          {/* Table Filters & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="البحث بالرقم التسلسلي، اللوحة، رقم المركبة، أو الخطأ..."
                className="w-full pr-9 pl-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>تصدير التقرير (Excel)</span>
              </button>

              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                <span>عرض:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  {PAGE_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-14 text-center"># الصف</th>
                    <th className="py-3 px-3">الرقم التسلسلي</th>
                    <th className="py-3 px-3">اللوحة / المركبة</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-4">التغييرات المقترحة على التواريخ</th>
                    <th className="py-3 px-3">الملاحظات والأخطاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        لا توجد صفوف مطابقة لشروط البحث والتصفية الحالية
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => (
                      <tr
                        key={`${row.rowNumber}-${row.serialNumber || idx}`}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Row Number */}
                        <td className="py-3 px-3 text-center font-mono text-slate-500 font-bold">
                          {row.rowNumber}
                        </td>

                        {/* Serial Number */}
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {row.serialNumber ?? '—'}
                          </span>
                        </td>

                        {/* Plate and Vehicle */}
                        <td className="py-3 px-3">
                          {row.plateNumberA ? (
                            <div className="space-y-0.5">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-800 text-[11px]" dir="ltr">
                                {formatPlateNumber(row.plateNumberA)}
                              </span>
                              {row.vehicleNumber && (
                                <p className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                  {row.vehicleNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(row.status)}
                        </td>

                        {/* Changes */}
                        <td className="py-3 px-4">
                          {Array.isArray(row.changes) && row.changes.length > 0 ? (
                            <div className="space-y-2">
                              {row.changes.map((ch, chIdx) => {
                                const isLicense = ch.field === 'licenseExpiryDate';
                                const fieldTitle = isLicense ? 'رخصة السير (الاستمارة)' : 'الفحص الدوري';
                                return (
                                  <div
                                    key={chIdx}
                                    className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-slate-700">
                                        {fieldTitle}
                                      </span>
                                      {ch.sourceCalendar && (
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            ch.sourceCalendar === 'Hijri'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-blue-100 text-blue-800'
                                          }`}
                                        >
                                          {ch.sourceCalendar === 'Hijri' ? 'مدخل هجري' : 'مدخل ميلادي'}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 text-slate-600 font-mono" dir="ltr">
                                      {ch.previousValue ? (
                                        <span className="text-slate-400 line-through text-[11px]">
                                          {ch.previousValue}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 italic text-[10px]">
                                          (فارغ)
                                        </span>
                                      )}
                                      <span className="text-slate-400 font-bold">➔</span>
                                      <span className="text-emerald-700 font-black text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                        {ch.newValue}
                                      </span>
                                    </div>

                                    {ch.sourceValue && ch.sourceValue !== ch.newValue && (
                                      <p className="text-[10px] text-slate-400" dir="rtl">
                                        القيمة الأصلية في الإكسل: <span className="font-mono text-slate-600" dir="ltr">{ch.sourceValue}</span>
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">
                              لا توجد تغييرات مقترحة
                            </span>
                          )}
                        </td>

                        {/* Errors and Notes */}
                        <td className="py-3 px-3 max-w-xs">
                          {Array.isArray(row.errors) && row.errors.length > 0 ? (
                            <div className="space-y-1">
                              {row.errors.map((errItem, errIdx) => (
                                <p
                                  key={errIdx}
                                  className="text-rose-700 font-semibold text-[11px] bg-rose-50 p-1.5 rounded border border-rose-200"
                                >
                                  {errItem}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredRows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  إجمالي النتائج المعروضة: <strong>{filteredRows.length}</strong> صف
                  {searchTerm && (
                    <span className="text-slate-400 mr-1">
                      (من أصل {report.totalRows})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                    <span>السابق</span>
                  </button>

                  <span className="px-2 font-bold text-slate-700">
                    صفحة {currentPage} من {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>التالي</span>
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Final Step: Apply Action Card */}
          {!isApplied && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-emerald-950 text-sm md:text-base flex items-center gap-2">
                  <Save size={18} className="text-emerald-700" />
                  <span>تأكيد وحفظ التحديثات المقترحة</span>
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
                  سيتم حفظ تواريخ انتهاء رخصة السير والفحص الدوري لعدد{' '}
                  <strong>{report.wouldUpdateCount ?? 0} مركبة</strong> مباشرة في قاعدة البيانات
                  ضمن عملية حفظ موثقة واحدة.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {applyLoading && (
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    إلغاء العملية
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleApplyChanges}
                  disabled={
                    applyLoading ||
                    previewLoading ||
                    (report.wouldUpdateCount === 0 && report.totalRows > 0)
                  }
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
                    applyLoading ||
                    previewLoading ||
                    (report.wouldUpdateCount === 0 && report.totalRows > 0)
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/30'
                  }`}
                >
                  <CheckCircle2 size={18} className={applyLoading ? 'animate-spin' : ''} />
                  <span>
                    {applyLoading
                      ? 'جاري تطبيق التحديثات وحفظ البيانات...'
                      : report.wouldUpdateCount === 0
                      ? 'لا توجد تحديثات للحفظ'
                      : `تطبيق وحفظ ${report.wouldUpdateCount} مركبة في قاعدة البيانات`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
