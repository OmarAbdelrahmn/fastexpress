'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarRange,
  CheckCircle2,
  FileSpreadsheet,
  FileWarning,
  Languages,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';
const IMPORT_ENDPOINT = '/api/RiderSalaryImport';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const REQUIRED_COLUMNS = ['IqamaNo', 'Salary'];

const RiderSalaryPdfDownload = dynamic(
  () =>
    import('@/components/riderSalary/RiderSalaryPdfActions').then(
      (module) => module.RiderSalaryPdfDownload
    ),
  { ssr: false }
);

const BulkRiderSalaryDownload = dynamic(
  () =>
    import('@/components/riderSalary/RiderSalaryPdfActions').then(
      (module) => module.BulkRiderSalaryDownload
    ),
  { ssr: false }
);

const translations = {
  ar: {
    dir: 'rtl',
    languageButton: 'English',
    eyebrow: 'خدمة عامة',
    title: 'إصدار كشوف رواتب المناديب',
    subtitle:
      'ارفع ملف الرواتب، راجع نتائج المطابقة، ثم حمّل كشف PDF مستقل لكل مندوب نشط.',
    uploadTitle: 'ملف الرواتب والفترة',
    uploadDescription: 'يجب أن يكون الملف بصيغة XLSX ويحتوي على العمودين المطلوبين.',
    fileLabel: 'ملف Excel',
    chooseFile: 'اختر ملفاً أو اسحبه إلى هنا',
    fileHint: 'XLSX فقط · الحد الأقصى 10 ميجابايت',
    replaceFile: 'اختيار ملف آخر',
    startDate: 'بداية الفترة',
    endDate: 'نهاية الفترة',
    periodHint: 'تم ضبط الفترة تلقائياً على الشهر الميلادي السابق ويمكن تعديلها.',
    submit: 'مطابقة المناديب وإنشاء الكشوف',
    uploading: 'جارٍ رفع الملف ومطابقة المناديب...',
    formatTitle: 'تنسيق الملف المطلوب',
    formatBody: 'يُقرأ الصف الأول كعناوين للأعمدة. كل صف بعده يمثل راتب مندوب واحد.',
    iqamaDescription: 'رقم إقامة المندوب',
    salaryDescription: 'إجمالي الراتب',
    brandedTemplate: 'قالب الشركة',
    brandedTemplateBody:
      'يُستخدم تلقائياً عند onCompany = true، مع الشعار والخلفية والتذييل الرسمي.',
    plainTemplate: 'قالب الجهات الأخرى',
    plainTemplateBody:
      'صفحة بيضاء تحمل اسم جهة العمل من sponsor من دون هوية شركة الخدمة السريعة.',
    totalRows: 'إجمالي الصفوف',
    matchedRiders: 'تمت المطابقة',
    ridersNotFound: 'غير موجودين',
    invalidRows: 'صفوف غير صالحة',
    resultsTitle: 'نتيجة المطابقة',
    resultsDescription: 'يمكن تنزيل كشف مستقل لكل مندوب أو جمع جميع الكشوف في ملف PDF واحد.',
    downloadAll: 'تحميل الجميع في ملف PDF واحد',
    preparingAll: 'جارٍ تجهيز ملف PDF الموحّد...',
    newImport: 'رفع ملف جديد',
    row: 'الصف',
    iqamaNo: 'رقم الإقامة',
    salary: 'الراتب',
    rider: 'المندوب',
    employer: 'جهة العمل',
    platform: 'الشركة التشغيلية',
    matched: 'مطابق',
    notMatched: 'غير مطابق',
    branded: 'رسمي',
    plain: 'أبيض',
    downloadPdf: 'تحميل PDF',
    preparingPdf: 'جارٍ التجهيز...',
    noMatchedTitle: 'لا توجد كشوف قابلة للتنزيل',
    noMatchedBody: 'راجع أخطاء الصفوف أدناه ثم صحح الملف وأعد رفعه.',
    selectFileError: 'اختر ملف XLSX قبل المتابعة.',
    invalidExtensionError: 'يجب أن يكون الملف بصيغة .xlsx.',
    emptyFileError: 'الملف فارغ.',
    largeFileError: 'حجم الملف أكبر من 10 ميجابايت.',
    missingColumnsError: 'الأعمدة المطلوبة غير موجودة:',
    noRowsError: 'لا يحتوي الملف على صفوف بيانات بعد صف العناوين.',
    invalidWorkbookError: 'تعذر قراءة ملف Excel. تأكد من أنه ملف XLSX صالح.',
    invalidPeriodError: 'يجب أن يكون تاريخ البداية قبل تاريخ النهاية أو مساوياً له.',
    apiError: 'تعذر معالجة الملف حالياً. حاول مرة أخرى.',
    selected: 'تم اختيار الملف',
    publicNotice: 'لا تحتاج هذه الصفحة إلى تسجيل الدخول.',
  },
  en: {
    dir: 'ltr',
    languageButton: 'العربية',
    eyebrow: 'Public service',
    title: 'Create rider salary statements',
    subtitle:
      'Upload the salary workbook, review rider matches, then download one PDF statement for every active rider.',
    uploadTitle: 'Salary file and period',
    uploadDescription: 'The workbook must be XLSX and include both required columns.',
    fileLabel: 'Excel file',
    chooseFile: 'Choose a file or drop it here',
    fileHint: 'XLSX only · 10 MB maximum',
    replaceFile: 'Choose another file',
    startDate: 'Period start',
    endDate: 'Period end',
    periodHint: 'The previous calendar month is selected by default. You can change it.',
    submit: 'Match riders and create statements',
    uploading: 'Uploading the file and matching riders...',
    formatTitle: 'Required workbook format',
    formatBody: 'The first row is read as column headers. Each following row is one rider salary.',
    iqamaDescription: 'Rider Iqama number',
    salaryDescription: 'Gross salary amount',
    brandedTemplate: 'Company template',
    brandedTemplateBody:
      'Used automatically when onCompany is true, including the official logo, background, and footer.',
    plainTemplate: 'Other sponsors',
    plainTemplateBody:
      'A clean white statement using sponsor as the employer, without Express Service branding.',
    totalRows: 'Total rows',
    matchedRiders: 'Matched riders',
    ridersNotFound: 'Not found',
    invalidRows: 'Invalid rows',
    resultsTitle: 'Matching result',
    resultsDescription: 'Download each statement separately or combine all matched riders into one PDF.',
    downloadAll: 'Download all in one PDF',
    preparingAll: 'Preparing combined PDF...',
    newImport: 'Upload another file',
    row: 'Row',
    iqamaNo: 'Iqama number',
    salary: 'Salary',
    rider: 'Rider',
    employer: 'Employer',
    platform: 'Operating company',
    matched: 'Matched',
    notMatched: 'Not matched',
    branded: 'Branded',
    plain: 'Plain',
    downloadPdf: 'Download PDF',
    preparingPdf: 'Preparing...',
    noMatchedTitle: 'No statements are ready to download',
    noMatchedBody: 'Review the row errors below, correct the workbook, and upload it again.',
    selectFileError: 'Select an XLSX file before continuing.',
    invalidExtensionError: 'The file must use the .xlsx extension.',
    emptyFileError: 'The selected file is empty.',
    largeFileError: 'The selected file is larger than 10 MB.',
    missingColumnsError: 'Required columns are missing:',
    noRowsError: 'The workbook has no data rows after its header.',
    invalidWorkbookError: 'The workbook could not be read. Make sure it is a valid XLSX file.',
    invalidPeriodError: 'The period start must be before or equal to the period end.',
    apiError: 'The file could not be processed right now. Please try again.',
    selected: 'Selected file',
    publicNotice: 'No sign-in is required for this page.',
  },
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function toInputDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getPreviousMonthPeriod() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  return { startDate: toInputDate(start), endDate: toInputDate(end) };
}

function getValue(source, camelName, pascalName) {
  return source?.[camelName] ?? source?.[pascalName];
}

function normalizeImportResponse(payload) {
  const rawRows = getValue(payload, 'rows', 'Rows');
  const rows = Array.isArray(rawRows)
    ? rawRows.map((row) => ({
        ...row,
        rowNumber: getValue(row, 'rowNumber', 'RowNumber'),
        iqamaNo: getValue(row, 'iqamaNo', 'IqamaNo'),
        salary: getValue(row, 'salary', 'Salary'),
        rider: getValue(row, 'rider', 'Rider') || null,
        errorMessage: getValue(row, 'errorMessage', 'ErrorMessage') || null,
      }))
    : [];

  const matchedFromRows = rows.filter((row) => row.rider).length;
  const errorsFromRows = rows.filter((row) => !row.rider).length;

  return {
    totalRows: getValue(payload, 'totalRows', 'TotalRows') ?? rows.length,
    matchedRiders: getValue(payload, 'matchedRiders', 'MatchedRiders') ?? matchedFromRows,
    ridersNotFound: getValue(payload, 'ridersNotFound', 'RidersNotFound') ?? errorsFromRows,
    invalidRows: getValue(payload, 'invalidRows', 'InvalidRows') ?? 0,
    rows,
  };
}

function validateSelectedFile(file, t) {
  if (!file) return t.selectFileError;
  if (!file.name.toLowerCase().endsWith('.xlsx')) return t.invalidExtensionError;
  if (file.size === 0) return t.emptyFileError;
  if (file.size > MAX_FILE_SIZE) return t.largeFileError;
  return '';
}

async function validateWorkbookColumns(file, t) {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', sheetRows: 3 });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error('Workbook has no sheets');

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
      header: 1,
      defval: '',
      raw: false,
    });
    const headers = (rows[0] || []).map((header) => String(header).trim());
    const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));

    if (missing.length > 0) return `${t.missingColumnsError} ${missing.join(', ')}`;
    if (rows.length < 2 || rows.slice(1).every((row) => row.every((value) => value === ''))) {
      return t.noRowsError;
    }

    return '';
  } catch (error) {
    console.error('Workbook validation failed:', error);
    return t.invalidWorkbookError;
  }
}

function getApiErrorMessage(payload, fallback) {
  return (
    payload?.detail ||
    payload?.error?.description ||
    (typeof payload?.error === 'string' ? payload.error : '') ||
    payload?.title ||
    fallback
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const tones = {
    blue: 'border-blue-100 bg-blue-50/70 text-blue-800',
    green: 'border-emerald-100 bg-emerald-50/70 text-emerald-800',
    amber: 'border-amber-100 bg-amber-50/70 text-amber-800',
    red: 'border-red-100 bg-red-50/70 text-red-800',
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-wide opacity-75">{label}</span>
        <Icon aria-hidden="true" size={18} />
      </div>
      <div className="text-3xl font-black tabular-nums">{value}</div>
    </div>
  );
}

function ResultRow({ row, startDate, endDate, t, lang }) {
  const rider = row.rider;
  const riderName = rider
    ? lang === 'ar'
      ? getValue(rider, 'nameAR', 'NameAR') || getValue(rider, 'nameEN', 'NameEN')
      : getValue(rider, 'nameEN', 'NameEN') || getValue(rider, 'nameAR', 'NameAR')
    : '';
  const onCompanyValue = rider ? getValue(rider, 'onCompany', 'OnCompany') : false;
  const onCompany = onCompanyValue === true || onCompanyValue === 'true' || onCompanyValue === 1;
  const sponsor = rider ? getValue(rider, 'sponsor', 'Sponsor') : '';
  const companyName = rider ? getValue(rider, 'companyName', 'CompanyName') : '';
  const workingId = rider ? getValue(rider, 'workingId', 'WorkingId') : '';

  return (
    <article className="grid gap-4 px-5 py-5 md:grid-cols-[4rem_minmax(0,1.15fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto] md:items-center">
      <div>
        <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-400">
          {t.row}
        </div>
        <div className="mt-1 font-black text-slate-700">{row.rowNumber ?? '—'}</div>
      </div>

      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold ${
              rider
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {rider ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {rider ? t.matched : t.notMatched}
          </span>
          {rider && (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
              {onCompany ? t.branded : t.plain}
            </span>
          )}
        </div>
        <h3 className="truncate text-base font-black text-slate-900">{riderName || t.notMatched}</h3>
        {rider && (
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {workingId ? `${workingId} · ` : ''}
            {companyName || t.platform}
          </p>
        )}
      </div>

      <div>
        <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-400">
          {t.iqamaNo}
        </div>
        <div className="mt-1 font-bold tabular-nums text-slate-700">{row.iqamaNo ?? '—'}</div>
      </div>

      <div>
        <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-400">
          {rider ? t.employer : t.salary}
        </div>
        <div className="mt-1 font-bold text-slate-700">
          {rider ? sponsor || '—' : row.salary ?? '—'}
        </div>
        {rider && (
          <div className="mt-1 text-xs font-semibold tabular-nums text-slate-500">
            {t.salary}: {row.salary ?? '—'}
          </div>
        )}
      </div>

      <div className="md:justify-self-end">
        {rider ? (
          <RiderSalaryPdfDownload
            row={row}
            startDate={startDate}
            endDate={endDate}
            label={t.downloadPdf}
            preparingLabel={t.preparingPdf}
          />
        ) : (
          <div className="max-w-64 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-700">
            {row.errorMessage || t.notMatched}
          </div>
        )}
      </div>
    </article>
  );
}

export default function RiderSalaryImportPage() {
  const defaultPeriod = useMemo(() => getPreviousMonthPeriod(), []);
  const inputRef = useRef(null);
  const [lang, setLang] = useState('ar');
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState(defaultPeriod.startDate);
  const [endDate, setEndDate] = useState(defaultPeriod.endDate);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const t = translations[lang];
  const matchedRows = useMemo(
    () => result?.rows.filter((row) => row.rider) || [],
    [result]
  );

  const selectFile = (nextFile) => {
    const nextError = validateSelectedFile(nextFile, t);
    setFile(nextError ? null : nextFile);
    setError(nextError);
    setResult(null);
    if (nextError && inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fileError = validateSelectedFile(file, t);
    if (fileError) {
      setError(fileError);
      return;
    }
    if (!startDate || !endDate || startDate > endDate) {
      setError(t.invalidPeriodError);
      return;
    }

    setError('');
    setIsLoading(true);
    setResult(null);

    try {
      const workbookError = await validateWorkbookColumns(file, t);
      if (workbookError) {
        setError(workbookError);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}${IMPORT_ENDPOINT}`, {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) throw new Error(getApiErrorMessage(payload, t.apiError));
      setResult(normalizeImportResponse(payload || {}));
    } catch (requestError) {
      console.error('Rider salary import failed:', requestError);
      setError(requestError?.message || t.apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.focus();
  };

  return (
    <div dir={t.dir} className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image src="/2.png" alt="Express Service" width={38} height={38} priority />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-[#173e73]">Express Service</div>
              <div className="truncate text-xs font-semibold text-slate-500">Salary statements</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLang((current) => (current === 'ar' ? 'en' : 'ar'))}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <Languages aria-hidden="true" size={17} />
            {t.languageButton}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-8 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#1f56a4]">
            <ShieldCheck aria-hidden="true" size={16} />
            {t.eyebrow}
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-[#102039] sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600">
            {t.subtitle}
          </p>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(31,56,88,0.07)]"
          >
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-black text-slate-900">{t.uploadTitle}</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                {t.uploadDescription}
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-700" htmlFor="salary-file">
                  {t.fileLabel}
                </label>
                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  className={`relative flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-7 text-center transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : file
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-slate-300 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40'
                  }`}
                >
                  <input
                    ref={inputRef}
                    id="salary-file"
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(event) => selectFile(event.target.files?.[0] || null)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-describedby="salary-file-hint"
                  />
                  <span
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                      file ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {file ? <CheckCircle2 aria-hidden="true" size={25} /> : <UploadCloud aria-hidden="true" size={25} />}
                  </span>
                  <div className="max-w-full text-sm font-black text-slate-800">
                    {file ? `${t.selected}: ${file.name}` : t.chooseFile}
                  </div>
                  <div id="salary-file-hint" className="mt-2 text-xs font-semibold text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB · ${t.replaceFile}` : t.fileHint}
                  </div>
                </div>
              </div>

              <fieldset>
                <legend className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-700">
                  <CalendarRange aria-hidden="true" size={17} className="text-[#1f56a4]" />
                  {t.startDate} / {t.endDate}
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-extrabold text-slate-600">{t.startDate}</span>
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) => {
                        setStartDate(event.target.value);
                        setResult(null);
                      }}
                      required
                      className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-extrabold text-slate-600">{t.endDate}</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) => {
                        setEndDate(event.target.value);
                        setResult(null);
                      }}
                      required
                      className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{t.periodHint}</p>
              </fieldset>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700"
                >
                  <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173e73] px-5 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(23,62,115,0.18)] transition hover:bg-[#102f59] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-65"
              >
                <FileSpreadsheet aria-hidden="true" size={19} />
                {isLoading ? t.uploading : t.submit}
              </button>

              <p aria-live="polite" className="text-center text-xs font-semibold text-slate-500">
                {isLoading ? t.uploading : t.publicNotice}
              </p>
            </div>
          </form>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_25px_rgba(31,56,88,0.05)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileSpreadsheet aria-hidden="true" size={21} />
                </span>
                <h2 className="text-base font-black text-slate-900">{t.formatTitle}</h2>
              </div>
              <p className="text-sm font-medium leading-6 text-slate-500">{t.formatBody}</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 bg-slate-50 text-xs font-black text-slate-700">
                  <div className="border-e border-slate-200 px-3 py-2.5">IqamaNo</div>
                  <div className="px-3 py-2.5">Salary</div>
                </div>
                <div className="grid grid-cols-2 text-xs font-semibold text-slate-500">
                  <div className="border-e border-slate-200 px-3 py-2.5">{t.iqamaDescription}</div>
                  <div className="px-3 py-2.5">{t.salaryDescription}</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-5">
              <div className="flex items-start gap-3">
                <Building2 aria-hidden="true" className="mt-0.5 shrink-0 text-[#1f56a4]" size={20} />
                <div>
                  <h2 className="text-sm font-black text-[#173e73]">{t.brandedTemplate}</h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    {t.brandedTemplateBody}
                  </p>
                </div>
              </div>
              <div className="my-4 h-px bg-blue-100" />
              <div className="flex items-start gap-3">
                <FileWarning aria-hidden="true" className="mt-0.5 shrink-0 text-slate-500" size={20} />
                <div>
                  <h2 className="text-sm font-black text-slate-800">{t.plainTemplate}</h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                    {t.plainTemplateBody}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {result && (
          <section className="mt-8 space-y-5" aria-labelledby="results-heading">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={FileSpreadsheet} label={t.totalRows} value={result.totalRows} tone="blue" />
              <MetricCard icon={UserRoundCheck} label={t.matchedRiders} value={result.matchedRiders} tone="green" />
              <MetricCard icon={UserRoundX} label={t.ridersNotFound} value={result.ridersNotFound} tone="amber" />
              <MetricCard icon={FileWarning} label={t.invalidRows} value={result.invalidRows} tone="red" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(31,56,88,0.06)]">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 id="results-heading" className="text-lg font-black text-slate-900">
                    {t.resultsTitle}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{t.resultsDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedRows.length > 0 && (
                    <BulkRiderSalaryDownload
                      rows={matchedRows}
                      startDate={startDate}
                      endDate={endDate}
                      label={t.downloadAll}
                      preparingLabel={t.preparingAll}
                    />
                  )}
                  <button
                    type="button"
                    onClick={resetImport}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                  >
                    <RotateCcw aria-hidden="true" size={17} />
                    {t.newImport}
                  </button>
                </div>
              </div>

              {matchedRows.length === 0 && (
                <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:m-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0 text-amber-700" size={21} />
                    <div>
                      <h3 className="font-black text-amber-900">{t.noMatchedTitle}</h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-amber-800">
                        {t.noMatchedBody}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {result.rows.map((row, index) => (
                  <ResultRow
                    key={`${row.rowNumber ?? index}-${row.iqamaNo ?? 'row'}`}
                    row={row}
                    startDate={startDate}
                    endDate={endDate}
                    t={t}
                    lang={lang}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
