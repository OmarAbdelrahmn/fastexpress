// File: src/app/admin/shifts/vancos/page.js
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  CalendarDays, 
  Clock, 
  Users, 
  Package, 
  Plus, 
  Trash2, 
  History, 
  ArrowRight, 
  Save, 
  RefreshCw, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Search, 
  Edit3, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Check,
  ShieldAlert,
  ListFilter,
  Printer,
  FileText
} from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { dailyWorkService } from '@/lib/api/dailyWorkService';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';

const translations = {
  ar: {
    pageTitle: 'فانكوس - تسجيل العمل اليومي',
    pageSubtitle: 'تسجيل ساعات العمل والطلبات اليومية للمناديب والموظفين (Daily Work)',
    accessDeniedTitle: 'وصول محمي',
    accessDeniedDesc: 'الوصول إلى سجلات العمل اليومي (فانكوس) يتطلب صلاحية المشرف الرئيسي (Master) أو المدير (Admin).',
    tabRecord: 'تسجيل إدخالات جديدة',
    tabHistory: 'سجل اليوم',
    periodReportBtn: 'تقرير فترة زمنية (Excel / طباعة)',
    printPdfBtn: 'طباعة PDF',
    downloadPdfBtn: 'تحميل PDF',
    exportExcelBtn: 'تصدير Excel',
    importExcelBtn: 'استيراد Excel',
    preparing: 'جاري التجهيز...',
    downloading: 'جاري التحميل...',
    dailyWorkDate: 'تاريخ العمل اليومي',
    prevDay: 'اليوم السابق',
    nextDay: 'اليوم التالي',
    today: 'اليوم',
    separateRecordsNoteTitle: 'ملاحظة:',
    separateRecordsNoteDesc: 'السجلات المنفصلة لا تؤثر على شفتات المناديب أو كشوفات الرواتب. يمكنك إضافة أي عدد من المناديب وإرسالها معاً.',
    dailyEntriesTitle: 'إدخالات العمل اليومي',
    entriesCount: 'إدخال',
    addEntryBtn: 'إضافة إدخال',
    entryNumber: 'إدخال رقم',
    deleteEntryHint: 'حذف هذا الإدخال',
    riderOrEmployee: 'المندوب / الموظف',
    loadingPeople: 'جاري تحميل المناديب...',
    searchPersonPlaceholder: 'ابحث بالاسم، معرّف العمل، أو الإقامة...',
    ordersCount: 'عدد الطلبات (Orders)',
    ordersPlaceholder: 'أدخل عدد الطلبات',
    workingHours: 'ساعات العمل (Hours)',
    hoursUnit: 'س',
    hoursPlaceholder: 'ساعات العمل (مثال: 8.5)',
    submitEntriesBtn: 'تسجيل وحفظ السجلات',
    savingEntries: 'جاري تسجيل وحفظ السجلات...',
    clearFieldsBtn: 'تفريغ الحقول',
    viewTodayRecordsBtn: 'عرض سجل اليوم',
    recordsSavedCount: 'سجل محفوظ',
    todayRecordsFor: 'سجلات يوم',
    todayRecordsDesc: 'عرض وتعديل وتصدير السجلات المحفوظة في هذا التاريخ',
    totalEntries: 'إجمالي السجلات',
    totalOrders: 'إجمالي الطلبات',
    totalHours: 'إجمالي ساعات العمل',
    hoursShort: 'ساعة',
    avgOrders: 'متوسط الطلبات',
    tableSearchPlaceholder: 'بحث بالاسم، Working ID، أو الإقامة...',
    printPdfVancos: 'طباعة PDF (فانكوس جولد)',
    refresh: 'تحديث',
    colNum: '#',
    colPerson: 'المندوب / الموظف',
    colWorkingId: 'معرّف العمل',
    colRiderId: 'رقم المندوب',
    colIqama: 'رقم الإقامة',
    colOrders: 'عدد الطلبات',
    colHours: 'ساعات العمل',
    colActions: 'إجراءات',
    loadingTodayRecords: 'جاري تحميل سجلات اليوم...',
    noRecordsToday: 'لا توجد سجلات محفوظة لهذا اليوم',
    noSearchResults: 'لا توجد نتائج تطابق البحث',
    noRecordsPrompt: 'يمكنك تسجيل إدخالات جديدة باستخدام التبويب الأول',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
    showingRecords: 'عرض {count} من أصل {total} سجل محفوظ',
    recordsDateLabel: 'تاريخ السجلات:',
    // Import Modal
    importModalTitle: 'استيراد سجلات العمل من ملف Excel',
    importModalSubtitle: 'سيتم حفظ السجلات المستوردة لتاريخ:',
    downloadSampleTemplate: 'تحميل القالب النموذجي',
    downloadSampleDesc: 'قم بتحميل نموذج Excel الجاهز لتعبئة السجلات بالشكل الصحيح.',
    downloadTemplateBtn: 'تنزيل القالب',
    dropzoneTitle: 'اضغط هنا لاختيار ملف Excel أو سحبه إلى هنا',
    dropzoneSubtitle: 'يدعم صيغ .xlsx و .xls و .csv (حتى 1000 سجل)',
    fileSelected: 'تم تحديد:',
    importWarningsTitle: 'تنبيهات وأخطاء في الملف',
    previewReadyTitle: 'معاينة السجلات الجاهزة للحفظ',
    recordsUnit: 'سجل',
    readyToSubmit: 'جاهز للإرسال',
    colRow: 'السطر',
    colSentId: 'المعرّف المرسل',
    saveRecordsNow: 'حفظ {count} سجل الآن',
    savingRecordsProgress: 'جاري حفظ السجلات...',
    // Period Modal
    periodModalTitle: 'تقرير وتصدير فترة زمنية - فانكوس جولد',
    periodModalSubtitle: 'تحميل السجلات من الواجهة لفترة محددة وتصديرها إلى Excel أو طباعتها PDF',
    dateRangeLabel: 'تحديد نطاق التاريخ:',
    presetToday: 'اليوم',
    presetLast7: 'آخر 7 أيام',
    presetLast30: 'آخر 30 يوم',
    presetThisMonth: 'الشهر الحالي',
    presetPrevMonth: 'الشهر السابق',
    startDateLabel: 'من تاريخ (Start Date)',
    endDateLabel: 'إلى تاريخ (End Date)',
    periodFetchNote: 'التحميل يتم من الواجهة (Front-end) بطلب كل يوم على حدة وتجميعها تلقائياً.',
    fetchPeriodDataBtn: 'تحميل / تحديث البيانات',
    fetchingServerProgress: 'جاري جلب السجلات من السيرفر...',
    ofDays: 'من',
    daysUnit: 'يوم',
    acrossDays: 'عبر {days} يوم عمل',
    avgPerRecord: 'معدل {avg} لكل سجل',
    totalPeriodHours: 'إجمالي ساعات الفترة',
    activeRiders: 'المناديب النشطين',
    uniqueRidersUnit: 'مندوب مختلف',
    daysSummaryTitle: 'ملخص أيام الفترة',
    colDate: 'التاريخ',
    colDay: 'اليوم',
    colRiders: 'المناديب',
    viewInMainTableBtn: 'عرض في الجدول الرئيسي',
    closeBtn: 'إغلاق',
    printPeriodPdfBtn: 'طباعة PDF للفترة',
    exportPeriodExcelBtn: 'تصدير Excel للفترة (3 أوراق)',
    // Alerts
    alertSelectDate: 'يرجى تحديد تاريخ العمل',
    alertSelectRiderForEntry: 'الرجاء اختيار المندوب للإدخال رقم {num}',
    alertEnterValidOrders: 'الرجاء إدخال عدد طلبات صحيح (0 أو أكثر) للإدخال رقم {num}',
    alertEnterValidHours: 'الرجاء إدخال ساعات عمل صحيحة (بين 0 و 24) للإدخال رقم {num}',
    alertRiderDuplicated: 'تم تكرار المندوب ({name}) في أكثر من إدخال. يرجى تعديل صف واحد لكل مندوب.',
    alertSavedSuccess: 'تم تسجيل وحفظ {count} سجل بنجاح لتاريخ {date}!',
    alertSaveError: 'حدث خطأ أثناء حفظ السجلات',
    alertInlineOrdersValid: 'يرجى إدخال عدد طلبات صحيح (0 أو أكثر)',
    alertInlineHoursValid: 'ساعات العمل يجب أن تكون بين 0 و 24',
    alertInlineUpdateSuccess: 'تم تحديث السجل بنجاح',
    alertInlineUpdateError: 'تعذر تحديث السجل',
    alertNoExportData: 'لا توجد بيانات لتصديرها لهذا اليوم',
    alertNoPrintData: 'لا توجد سجلات عمل محفوظة لتاريخ هذا اليوم للطباعة',
    alertPdfDownloadSuccess: 'تم تحميل تقرير فانكوس جولد (PDF) بنجاح',
    alertPopupBlocked: 'تم حظر النافذة المنبثقة من قبل المتصفح، جاري تنزيل ملف PDF بدلاً من ذلك',
    alertPdfPreviewSuccess: 'تم فتح تقرير فانكوس جولد بنجاح للمعاينة والطباعة',
    alertPdfError: 'حدث خطأ أثناء إنشاء ملف PDF',
    alertSelectPeriodDates: 'يرجى تحديد تاريخ البداية وتاريخ النهاية',
    alertStartBeforeEnd: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية',
    alertMaxPeriodLimit: 'الحد الأقصى للفترة هو 90 يوماً لضمان استقرار وسرعة التحميل',
    alertPeriodNoData: 'تم فحص {days} يوم، ولا توجد أي سجلات عمل مسجلة في هذه الفترة.',
    alertPeriodLoadSuccess: 'تم تحميل {count} سجل بنجاح عبر {days} يوم عمل!',
    alertPeriodLoadError: 'حدث خطأ أثناء تحميل بيانات الفترة',
    alertPeriodNoExportData: 'لا توجد سجلات لتصديرها في الفترة المحددة',
    alertPeriodExcelSuccess: 'تم تصدير ملف Excel بنجاح ({count} سجل - 3 أوراق عمل)!',
    alertPeriodExcelError: 'حدث خطأ أثناء تصدير ملف Excel للفترة',
    alertPeriodNoPrintData: 'لا توجد سجلات لطباعتها في الفترة المحددة',
    alertPeriodPdfDownloadSuccess: 'تم تحميل تقرير الفترة (PDF) بنجاح',
    alertPeriodPdfOpenSuccess: 'تم فتح تقرير الفترة بنجاح للمعاينة والطباعة',
    alertPeriodPdfError: 'حدث خطأ أثناء إنشاء ملف PDF للفترة',
    alertNoPeriodDataForTable: 'لا توجد بيانات محملة لعرضها في الجدول الرئيسي',
    alertPeriodLoadedToTable: 'تم تحميل {count} سجل للفترة في الجدول الرئيسي',
    alertEmptyExcel: 'الملف فارغ أو لا يحتوي على صفوف بيانات صالحة.',
    alertRowMissingId: 'السطر {row}: لم يتم العثور على رقم المندوب أو رقم الإقامة.',
    alertRowInvalidHours: 'السطر {row}: ساعات العمل ({hours}) غير صالحة. يجب أن تكون بين 0 و 24.',
    alertRowDuplicatePerson: 'السطر {row}: تكرار لنفس الموظف/المندوب ({person}) في الملف.',
    alertMaxImportLimit: 'تجاوز الملف الحد الأقصى المسموح به (1000 سجل في الطلب الواحد).',
    alertExcelParseError: 'فشل قراءة الملف. تأكد من أن الملف بصيغة Excel (.xlsx / .xls) صالحة.',
    alertImportSuccess: 'تم حفظ {count} سجل بنجاح لتاريخ {date}!',
    alertImportError: 'حدث خطأ أثناء حفظ السجلات من الملف',
    companyName: 'فانكوس جولد',
    companyVancos: 'فانكوس',
    employeeTag: 'موظف',
    riderTag: 'مندوب',
    iqamaTag: 'إقامة',
    idTag: 'معرّف',
    riderIdTag: 'رقم مندوب',
  },
  en: {
    pageTitle: 'Vancos - Daily Work Records',
    pageSubtitle: 'Record daily working hours and orders for riders and employees (Daily Work)',
    accessDeniedTitle: 'Protected Access',
    accessDeniedDesc: 'Accessing Vancos Daily Work records requires Master or Admin privileges.',
    tabRecord: 'Record New Entries',
    tabHistory: "Today's Records",
    periodReportBtn: 'Period Report (Excel / Print)',
    printPdfBtn: 'Print PDF',
    downloadPdfBtn: 'Download PDF',
    exportExcelBtn: 'Export Excel',
    importExcelBtn: 'Import Excel',
    preparing: 'Preparing...',
    downloading: 'Downloading...',
    dailyWorkDate: 'Daily Work Date',
    prevDay: 'Previous Day',
    nextDay: 'Next Day',
    today: 'Today',
    separateRecordsNoteTitle: 'Note:',
    separateRecordsNoteDesc: 'Separate records do not affect rider shifts or payroll sheets. You can add any number of riders and submit them together.',
    dailyEntriesTitle: 'Daily Work Entries',
    entriesCount: 'entries',
    addEntryBtn: 'Add Entry',
    entryNumber: 'Entry #',
    deleteEntryHint: 'Delete this entry',
    riderOrEmployee: 'Rider / Employee',
    loadingPeople: 'Loading riders...',
    searchPersonPlaceholder: 'Search by name, working ID, or iqama...',
    ordersCount: 'Orders Count',
    ordersPlaceholder: 'Enter orders count',
    workingHours: 'Working Hours',
    hoursUnit: 'h',
    hoursPlaceholder: 'Working hours (e.g. 8.5)',
    submitEntriesBtn: 'Save Records',
    savingEntries: 'Saving records...',
    clearFieldsBtn: 'Clear Fields',
    viewTodayRecordsBtn: "View Today's Records",
    recordsSavedCount: 'records saved',
    todayRecordsFor: 'Records for',
    todayRecordsDesc: 'View, edit, and export records saved for this date',
    totalEntries: 'Total Records',
    totalOrders: 'Total Orders',
    totalHours: 'Total Working Hours',
    hoursShort: 'hrs',
    avgOrders: 'Average Orders',
    tableSearchPlaceholder: 'Search by name, Working ID, or Iqama...',
    printPdfVancos: 'Print PDF (Vancos Gold)',
    refresh: 'Refresh',
    colNum: '#',
    colPerson: 'Rider / Employee',
    colWorkingId: 'Working ID',
    colRiderId: 'Rider ID',
    colIqama: 'Iqama No',
    colOrders: 'Orders Count',
    colHours: 'Working Hours',
    colActions: 'Actions',
    loadingTodayRecords: "Loading today's records...",
    noRecordsToday: 'No records saved for this date',
    noSearchResults: 'No results match your search',
    noRecordsPrompt: 'You can record new entries using the first tab',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    showingRecords: 'Showing {count} of {total} saved records',
    recordsDateLabel: 'Records Date:',
    // Import Modal
    importModalTitle: 'Import Work Records from Excel',
    importModalSubtitle: 'Imported records will be saved for:',
    downloadSampleTemplate: 'Download Sample Template',
    downloadSampleDesc: 'Download the ready-to-use Excel template to fill in records properly.',
    downloadTemplateBtn: 'Download Template',
    dropzoneTitle: 'Click here to choose an Excel file or drag & drop here',
    dropzoneSubtitle: 'Supports .xlsx, .xls, and .csv formats (up to 1,000 records)',
    fileSelected: 'Selected:',
    importWarningsTitle: 'File Warnings & Errors',
    previewReadyTitle: 'Preview Ready Records',
    recordsUnit: 'records',
    readyToSubmit: 'Ready to submit',
    colRow: 'Row',
    colSentId: 'Submitted ID',
    saveRecordsNow: 'Save {count} Records Now',
    savingRecordsProgress: 'Saving records...',
    // Period Modal
    periodModalTitle: 'Period Report & Export - Vancos Gold',
    periodModalSubtitle: 'Fetch records for a custom period from frontend and export to Excel or print PDF',
    dateRangeLabel: 'Date Range:',
    presetToday: 'Today',
    presetLast7: 'Last 7 Days',
    presetLast30: 'Last 30 Days',
    presetThisMonth: 'This Month',
    presetPrevMonth: 'Previous Month',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    periodFetchNote: 'Loading is performed from the front-end by fetching each day and aggregating automatically.',
    fetchPeriodDataBtn: 'Fetch / Refresh Data',
    fetchingServerProgress: 'Fetching records from server...',
    ofDays: 'of',
    daysUnit: 'days',
    acrossDays: 'Across {days} working days',
    avgPerRecord: 'Avg {avg} per record',
    totalPeriodHours: 'Total period hours',
    activeRiders: 'Active Riders',
    uniqueRidersUnit: 'unique riders',
    daysSummaryTitle: 'Period Days Breakdown',
    colDate: 'Date',
    colDay: 'Day',
    colRiders: 'Riders',
    viewInMainTableBtn: 'View in Main Table',
    closeBtn: 'Close',
    printPeriodPdfBtn: 'Print Period PDF',
    exportPeriodExcelBtn: 'Export Period Excel (3 Sheets)',
    // Alerts
    alertSelectDate: 'Please select a work date',
    alertSelectRiderForEntry: 'Please select a rider for entry #{num}',
    alertEnterValidOrders: 'Please enter valid orders (0 or more) for entry #{num}',
    alertEnterValidHours: 'Please enter valid working hours (between 0 and 24) for entry #{num}',
    alertRiderDuplicated: 'Rider ({name}) is duplicated across multiple entries. Please keep one entry per rider.',
    alertSavedSuccess: 'Successfully saved {count} records for {date}!',
    alertSaveError: 'An error occurred while saving records',
    alertInlineOrdersValid: 'Please enter valid orders (0 or more)',
    alertInlineHoursValid: 'Working hours must be between 0 and 24',
    alertInlineUpdateSuccess: 'Record updated successfully',
    alertInlineUpdateError: 'Failed to update record',
    alertNoExportData: 'No data to export for this date',
    alertNoPrintData: 'No saved work records for this date to print',
    alertPdfDownloadSuccess: 'Vancos Gold report (PDF) downloaded successfully',
    alertPopupBlocked: 'Popup was blocked by the browser, downloading PDF file instead',
    alertPdfPreviewSuccess: 'Vancos Gold report opened for preview and printing',
    alertPdfError: 'Error generating PDF file',
    alertSelectPeriodDates: 'Please select start and end dates',
    alertStartBeforeEnd: 'Start date must be before or equal to end date',
    alertMaxPeriodLimit: 'Maximum period range is 90 days for stability and performance',
    alertPeriodNoData: 'Checked {days} days; no work records found in this period.',
    alertPeriodLoadSuccess: 'Successfully loaded {count} records across {days} working days!',
    alertPeriodLoadError: 'Error loading period data',
    alertPeriodNoExportData: 'No records to export for the selected period',
    alertPeriodExcelSuccess: 'Excel exported successfully ({count} records - 3 worksheets)!',
    alertPeriodExcelError: 'Error exporting period Excel file',
    alertPeriodNoPrintData: 'No records to print for the selected period',
    alertPeriodPdfDownloadSuccess: 'Period report (PDF) downloaded successfully',
    alertPeriodPdfOpenSuccess: 'Period report opened for preview and printing',
    alertPeriodPdfError: 'Error generating period PDF report',
    alertNoPeriodDataForTable: 'No loaded data to display in main table',
    alertPeriodLoadedToTable: 'Loaded {count} period records into main table',
    alertEmptyExcel: 'File is empty or contains no valid data rows.',
    alertRowMissingId: 'Row {row}: Neither Rider ID nor Iqama No found.',
    alertRowInvalidHours: 'Row {row}: Working hours ({hours}) invalid. Must be between 0 and 24.',
    alertRowDuplicatePerson: 'Row {row}: Duplicate entry for person ({person}) in file.',
    alertMaxImportLimit: 'File exceeds maximum allowed limit (1000 records per request).',
    alertExcelParseError: 'Failed to read file. Ensure it is a valid Excel (.xlsx / .xls) file.',
    alertImportSuccess: 'Successfully saved {count} records for {date}!',
    alertImportError: 'Error saving records from file',
    companyName: 'Vancos Gold',
    companyVancos: 'Vancos',
    employeeTag: 'Employee',
    riderTag: 'Rider',
    iqamaTag: 'Iqama',
    idTag: 'ID',
    riderIdTag: 'Rider ID',
  }
};

export default function VancosDailyWorkPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';
  const t = translations[isRtl ? 'ar' : 'en'];

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Date State
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Active view tab: 'record' | 'history'
  const [activeTab, setActiveTab] = useState('record');

  // Multi-entry form list
  const [workEntries, setWorkEntries] = useState([
    { id: '1', riderOptionId: '', selectedRider: null, orders: '', workingHours: '8' }
  ]);

  // Saved records for the current date
  const [savedEntries, setSavedEntries] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // People list (riders + employees)
  const [riders, setRiders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);

  // Alerts & loading states
  const [alert, setAlert] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Table search & inline editing states
  const [tableSearch, setTableSearch] = useState('');
  const [editingRowKey, setEditingRowKey] = useState(null);
  const [inlineOrders, setInlineOrders] = useState('');
  const [inlineHours, setInlineHours] = useState('');
  const [inlineSaving, setInlineSaving] = useState(false);

  // Excel Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importSaving, setImportSaving] = useState(false);
  const fileInputRef = useRef(null);

  // PDF Generation State
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfActionType, setPdfActionType] = useState(null); // 'print' | 'download'

  // Period Modal State
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodStartDate, setPeriodStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [periodEndDate, setPeriodEndDate] = useState(todayStr);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodProgress, setPeriodProgress] = useState({ current: 0, total: 0, currentDate: '' });
  const [periodData, setPeriodData] = useState(null);
  const [periodPdfLoading, setPeriodPdfLoading] = useState(false);
  const [periodActionType, setPeriodActionType] = useState(null);

  // Role validation
  const currentUser = TokenManager.getUserFromToken() || {};
  const rawRoles = currentUser.roles ?? currentUser.role ?? currentUser['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  const currentRoles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  const isAuthorized = currentRoles.some(r => ['Master', 'Admin'].includes(r));

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Day name helper
  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3) return '';
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(dt.getTime())) return '';
    const arDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return (isRtl ? arDays : enDays)[dt.getDay()];
  };

  // Load riders and employees once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPeople = async () => {
      setPeopleLoading(true);
      try {
        const [ridersRes, employeesRes] = await Promise.allSettled([
          ApiService.get(API_ENDPOINTS.RIDER.LIST),
          ApiService.get(API_ENDPOINTS.EMPLOYEE.LIST),
        ]);

        if (!isMounted) return;

        const rawRiders = ridersRes.status === 'fulfilled' && Array.isArray(ridersRes.value) ? ridersRes.value : [];
        const rawEmployees = employeesRes.status === 'fulfilled' && Array.isArray(employeesRes.value) ? employeesRes.value : [];

        setRiders(rawRiders);
        setEmployees(rawEmployees);
      } catch (err) {
        console.error('Failed to load riders list:', err);
      } finally {
        if (isMounted) setPeopleLoading(false);
      }
    };

    fetchPeople();
    return () => { isMounted = false; };
  }, []);

  // Fetch saved daily entries whenever selectedDate changes
  useEffect(() => {
    loadSavedEntries(selectedDate);
    setEditingRowKey(null);
  }, [selectedDate]);

  const loadSavedEntries = async (date) => {
    if (!date) return;
    setSavedLoading(true);
    try {
      const res = await dailyWorkService.getByDate(date);
      setSavedEntries(Array.isArray(res?.items) ? res.items : []);
    } catch (err) {
      console.error('Error fetching saved daily entries:', err);
      setSavedEntries([]);
    } finally {
      setSavedLoading(false);
    }
  };

  // Fast lookup map for resolving person details
  const personLookup = useMemo(() => {
    const byRiderId = new Map();
    const byIqamaNo = new Map();

    for (const r of riders) {
      const rId = r.riderId || r.id;
      const iqama = r.iqamaNo || r.employeeIqamaNo;
      const name = isRtl
        ? (r.nameAR || r.nameEN || `${t.riderTag} #${rId || iqama}`)
        : (r.nameEN || r.nameAR || `${t.riderTag} #${rId || iqama}`);
      const info = {
        name,
        nameAR: r.nameAR || '',
        nameEN: r.nameEN || '',
        workingId: r.workingId || '',
        companyName: r.companyName || '',
        iqamaNo: iqama ? Number(iqama) : null,
        riderId: rId ? Number(rId) : null,
        phone: r.phone || '',
        isRider: true,
      };
      if (rId) byRiderId.set(Number(rId), info);
      if (iqama) byIqamaNo.set(Number(iqama), info);
    }

    for (const e of employees) {
      const iqama = e.iqamaNo || e.employeeIqamaNo || e.iqama;
      if (iqama && !byIqamaNo.has(Number(iqama))) {
        const name = isRtl
          ? (e.nameAR || e.nameEN || `${t.employeeTag} #${iqama}`)
          : (e.nameEN || e.nameAR || `${t.employeeTag} #${iqama}`);
        const info = {
          name,
          nameAR: e.nameAR || '',
          nameEN: e.nameEN || '',
          workingId: e.workingId || '',
          companyName: e.companyName || '',
          iqamaNo: Number(iqama),
          riderId: null,
          phone: e.phone || '',
          isRider: false,
        };
        byIqamaNo.set(Number(iqama), info);
      }
    }

    return { byRiderId, byIqamaNo };
  }, [riders, employees, isRtl, t]);

  // Options for SearchableSelect
  const dropdownOptions = useMemo(() => {
    const opts = [];
    const seenIqamas = new Set();

    for (const r of riders) {
      const rId = r.riderId || r.id;
      const iqama = r.iqamaNo || r.employeeIqamaNo;
      if (!iqama && !rId) continue;
      if (iqama) seenIqamas.add(String(iqama));

      const name = isRtl
        ? (r.nameAR || r.nameEN || `${t.riderTag} #${rId || iqama}`)
        : (r.nameEN || r.nameAR || `${t.riderTag} #${rId || iqama}`);
      const workingId = r.workingId ? ` [${t.idTag}: ${r.workingId}]` : '';
      const iqamaTxt = iqama ? ` - ${t.iqamaTag}: ${iqama}` : '';
      const rIdTxt = rId ? ` - ${t.riderIdTag}: ${rId}` : '';

      opts.push({
        id: rId ? `rider_${rId}` : `iqama_${iqama}`,
        name: `${name}${workingId}${iqamaTxt}${rIdTxt}`,
        riderId: rId ? Number(rId) : null,
        employeeIqamaNo: iqama ? Number(iqama) : null,
        displayName: name,
        workingId: r.workingId || '',
        company: r.companyName || '',
      });
    }

    for (const e of employees) {
      const iqama = e.iqamaNo || e.employeeIqamaNo || e.iqama;
      if (!iqama || seenIqamas.has(String(iqama))) continue;
      const name = isRtl
        ? (e.nameAR || e.nameEN || `${t.employeeTag} #${iqama}`)
        : (e.nameEN || e.nameAR || `${t.employeeTag} #${iqama}`);
      opts.push({
        id: `iqama_${iqama}`,
        name: `${name} (${t.employeeTag}) - ${t.iqamaTag}: ${iqama}`,
        riderId: null,
        employeeIqamaNo: Number(iqama),
        displayName: name,
        workingId: e.workingId || '',
        company: e.companyName || '',
      });
    }

    return opts;
  }, [riders, employees, isRtl, t]);

  // Dynamic Multi-Entry Handlers
  const addWorkEntry = () => {
    setWorkEntries(prev => [
      ...prev,
      { 
        id: String(Date.now() + Math.random()), 
        riderOptionId: '', 
        selectedRider: null, 
        orders: '', 
        workingHours: '8' 
      }
    ]);
  };

  const removeWorkEntry = (index) => {
    if (workEntries.length > 1) {
      setWorkEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleRiderChange = (value, index) => {
    const selected = dropdownOptions.find(opt => opt.id === value);
    const updated = [...workEntries];
    updated[index].riderOptionId = value;
    updated[index].selectedRider = selected || null;

    if (selected) {
      const existing = savedEntries.find(item => {
        if (selected.riderId && item.riderId && Number(selected.riderId) === Number(item.riderId)) return true;
        if (selected.employeeIqamaNo && item.employeeIqamaNo && Number(selected.employeeIqamaNo) === Number(item.employeeIqamaNo)) return true;
        return false;
      });

      if (existing) {
        updated[index].orders = String(existing.orders ?? '');
        updated[index].workingHours = String(existing.workingHours ?? '8');
      } else if (!updated[index].orders) {
        updated[index].orders = '';
      }
    }

    setWorkEntries(updated);
  };

  const handleOrdersChange = (value, index) => {
    const updated = [...workEntries];
    updated[index].orders = value;
    setWorkEntries(updated);
  };

  const handleHoursChange = (value, index) => {
    const updated = [...workEntries];
    updated[index].workingHours = value;
    setWorkEntries(updated);
  };

  // Submit all entries in ONE request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      showAlert('error', t.alertSelectDate);
      return;
    }

    const seenPeople = new Set();
    const payloadItems = [];

    for (let i = 0; i < workEntries.length; i++) {
      const entry = workEntries[i];
      const entryNum = i + 1;

      if (!entry.selectedRider) {
        showAlert('error', t.alertSelectRiderForEntry.replace('{num}', entryNum));
        return;
      }

      const ordersVal = parseInt(entry.orders, 10);
      if (isNaN(ordersVal) || ordersVal < 0) {
        showAlert('error', t.alertEnterValidOrders.replace('{num}', entryNum));
        return;
      }

      const hoursVal = parseFloat(entry.workingHours);
      if (isNaN(hoursVal) || hoursVal < 0 || hoursVal > 24) {
        showAlert('error', t.alertEnterValidHours.replace('{num}', entryNum));
        return;
      }

      const personKey = entry.selectedRider.riderId 
        ? `rider_${entry.selectedRider.riderId}` 
        : `iqama_${entry.selectedRider.employeeIqamaNo}`;

      if (seenPeople.has(personKey)) {
        showAlert('error', t.alertRiderDuplicated.replace('{name}', entry.selectedRider.displayName));
        return;
      }
      seenPeople.add(personKey);

      const itemPayload = {
        orders: ordersVal,
        workingHours: Number(hoursVal.toFixed(2)),
      };

      if (entry.selectedRider.riderId && Number(entry.selectedRider.riderId) > 0) {
        itemPayload.riderId = Number(entry.selectedRider.riderId);
      } else if (entry.selectedRider.employeeIqamaNo && Number(entry.selectedRider.employeeIqamaNo) > 0) {
        itemPayload.employeeIqamaNo = Number(entry.selectedRider.employeeIqamaNo);
      }

      payloadItems.push(itemPayload);
    }

    setSubmitLoading(true);
    try {
      const res = await dailyWorkService.saveEntries(selectedDate, payloadItems);
      if (res?.items) {
        setSavedEntries(res.items);
      } else {
        await loadSavedEntries(selectedDate);
      }

      showAlert('success', t.alertSavedSuccess.replace('{count}', payloadItems.length).replace('{date}', selectedDate));

      setWorkEntries([
        { id: String(Date.now()), riderOptionId: '', selectedRider: null, orders: '', workingHours: '8' }
      ]);
    } catch (error) {
      console.error('Error saving entries:', error);
      showAlert('error', error.userMessage || error.message || t.alertSaveError);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Date navigation helpers
  const handleDateChange = (newDate) => {
    if (!newDate) return;
    setSelectedDate(newDate);
  };

  const handleShiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  // Resolve person details for table rendering
  const resolvePerson = (item) => {
    if (item.riderId && personLookup.byRiderId.has(Number(item.riderId))) {
      return personLookup.byRiderId.get(Number(item.riderId));
    }
    if (item.employeeIqamaNo && personLookup.byIqamaNo.has(Number(item.employeeIqamaNo))) {
      return personLookup.byIqamaNo.get(Number(item.employeeIqamaNo));
    }
    return {
      name: `${item.riderId ? t.riderTag : t.employeeTag} #${item.employeeIqamaNo || item.riderId}`,
      nameAR: '',
      nameEN: '',
      workingId: '',
      companyName: '',
      iqamaNo: item.employeeIqamaNo,
      riderId: item.riderId,
      isRider: Boolean(item.riderId),
    };
  };

  // Filtered saved entries
  const filteredSavedEntries = useMemo(() => {
    if (!tableSearch.trim()) return savedEntries;
    const q = tableSearch.toLowerCase().trim();
    return savedEntries.filter(item => {
      const p = resolvePerson(item);
      const nameMatch = p.name.toLowerCase().includes(q) || p.nameEN?.toLowerCase().includes(q);
      const workingIdMatch = p.workingId?.toLowerCase().includes(q);
      const iqamaMatch = String(item.employeeIqamaNo || '').includes(q);
      const riderIdMatch = String(item.riderId || '').includes(q);
      const companyMatch = p.companyName?.toLowerCase().includes(q);
      return nameMatch || workingIdMatch || iqamaMatch || riderIdMatch || companyMatch;
    });
  }, [savedEntries, tableSearch, personLookup]);

  // Statistics
  const stats = useMemo(() => {
    const totalEntries = savedEntries.length;
    const totalOrders = savedEntries.reduce((acc, curr) => acc + (curr.orders || 0), 0);
    const totalHours = savedEntries.reduce((acc, curr) => acc + (Number(curr.workingHours) || 0), 0);
    const avgOrders = totalEntries > 0 ? (totalOrders / totalEntries).toFixed(1) : 0;
    const avgHours = totalEntries > 0 ? (totalHours / totalEntries).toFixed(1) : 0;
    return { totalEntries, totalOrders, totalHours: totalHours.toFixed(2), avgOrders, avgHours };
  }, [savedEntries]);

  // Inline table edit handlers
  const handleStartInlineEdit = (item) => {
    const key = item.riderId ? `rider_${item.riderId}` : `iqama_${item.employeeIqamaNo}`;
    setEditingRowKey(key);
    setInlineOrders(String(item.orders ?? '0'));
    setInlineHours(String(item.workingHours ?? '0'));
  };

  const handleCancelInlineEdit = () => {
    setEditingRowKey(null);
    setInlineOrders('');
    setInlineHours('');
  };

  const handleSaveInlineEdit = async (item) => {
    const ordersVal = parseInt(inlineOrders, 10);
    if (isNaN(ordersVal) || ordersVal < 0) {
      showAlert('error', t.alertInlineOrdersValid);
      return;
    }

    const hoursVal = parseFloat(inlineHours);
    if (isNaN(hoursVal) || hoursVal < 0 || hoursVal > 24) {
      showAlert('error', t.alertInlineHoursValid);
      return;
    }

    const payload = {
      orders: ordersVal,
      workingHours: Number(hoursVal.toFixed(2)),
    };

    if (item.riderId && Number(item.riderId) > 0) {
      payload.riderId = Number(item.riderId);
    } else if (item.employeeIqamaNo && Number(item.employeeIqamaNo) > 0) {
      payload.employeeIqamaNo = Number(item.employeeIqamaNo);
    }

    setInlineSaving(true);
    try {
      const res = await dailyWorkService.saveEntries(selectedDate, [payload]);
      if (res?.items) {
        setSavedEntries(res.items);
      } else {
        await loadSavedEntries(selectedDate);
      }
      showAlert('success', t.alertInlineUpdateSuccess);
      setEditingRowKey(null);
    } catch (err) {
      console.error('Inline save error:', err);
      showAlert('error', err.userMessage || err.message || t.alertInlineUpdateError);
    } finally {
      setInlineSaving(false);
    }
  };

  // Export to Excel (Bilingual Support)
  const handleExportExcel = () => {
    if (savedEntries.length === 0) {
      showAlert('info', t.alertNoExportData);
      return;
    }

    const rows = savedEntries.map((item, idx) => {
      const p = resolvePerson(item);
      if (isRtl) {
        return {
          '#': idx + 1,
          'التاريخ': selectedDate,
          'اسم المندوب / الموظف': p.name,
          'معرف العمل (Working ID)': p.workingId || '—',
          'الشركة': p.companyName || '—',
          'رقم المندوب (Rider ID)': item.riderId || '—',
          'رقم الإقامة (Iqama No)': item.employeeIqamaNo || '—',
          'عدد الطلبات (Orders)': item.orders ?? 0,
          'ساعات العمل (Working Hours)': item.workingHours ?? 0,
        };
      }
      return {
        '#': idx + 1,
        'Date': selectedDate,
        'Rider / Employee Name': p.name,
        'Working ID': p.workingId || '—',
        'Company': p.companyName || '—',
        'Rider ID': item.riderId || '—',
        'Iqama No': item.employeeIqamaNo || '—',
        'Orders': item.orders ?? 0,
        'Working Hours': item.workingHours ?? 0,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    const sheetTitle = isRtl ? 'فانكوس - عمل يومي' : 'Vancos - Daily Work';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
    XLSX.writeFile(workbook, `daily_work_vancos_${selectedDate}.xlsx`);
  };

  // Print / Download Vancos Detailed Report (PDF)
  const handlePrintPdf = async (mode = 'print') => {
    if (savedEntries.length === 0) {
      showAlert('error', t.alertNoPrintData);
      return;
    }

    setPdfLoading(true);
    setPdfActionType(mode);

    try {
      const reportData = {
        reportDate: selectedDate,
        companyName: isRtl ? 'فانكوس جولد' : 'Vancos Gold',
        companyNameEN: 'Vancos Gold',
        logoUrl: '/vancos-icon.png',
        isRtl,
        locale,
        items: savedEntries.map((item) => {
          const p = resolvePerson(item);
          return {
            riderName: p.name,
            workingId: p.workingId || (item.riderId ? String(item.riderId) : ''),
            iqamaNo: item.employeeIqamaNo || p.iqamaNo,
            riderId: item.riderId,
            orders: item.orders ?? 0,
            workingHours: item.workingHours ?? 0,
          };
        }),
        grandTotalRiders: stats.totalEntries,
        grandTotalOrders: stats.totalOrders,
        grandTotalHours: stats.totalHours,
        avgOrders: stats.avgOrders,
      };

      const { renderVancosPdfBlob, downloadVancosBlob } = await import('@/components/shifts/VancosDetailedReportPDF');
      const blob = await renderVancosPdfBlob(reportData);
      const fileName = isRtl 
        ? `تقرير_تفصيلي_فانكوس_جولد_${selectedDate}.pdf`
        : `vancos_gold_report_${selectedDate}.pdf`;

      if (mode === 'download') {
        downloadVancosBlob(blob, fileName);
        showAlert('success', t.alertPdfDownloadSuccess);
      } else {
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (!printWindow) {
          downloadVancosBlob(blob, fileName);
          showAlert('info', t.alertPopupBlocked);
        } else {
          showAlert('success', t.alertPdfPreviewSuccess);
        }
      }
    } catch (error) {
      console.error('Error generating Vancos PDF:', error);
      showAlert('error', t.alertPdfError);
    } finally {
      setPdfLoading(false);
      setPdfActionType(null);
    }
  };

  // Handle Period Presets
  const handlePeriodPreset = (preset) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setPeriodStartDate(today);
      setPeriodEndDate(today);
    } else if (preset === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      setPeriodStartDate(d.toISOString().split('T')[0]);
      setPeriodEndDate(today);
    } else if (preset === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      setPeriodStartDate(d.toISOString().split('T')[0]);
      setPeriodEndDate(today);
    } else if (preset === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setPeriodStartDate(start);
      setPeriodEndDate(today);
    } else if (preset === 'prevMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setPeriodStartDate(start);
      setPeriodEndDate(end);
    }
    setPeriodData(null);
  };

  // Fetch period data from frontend
  const fetchPeriodData = async (startDate, endDate) => {
    if (!startDate || !endDate) {
      showAlert('error', t.alertSelectPeriodDates);
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      showAlert('error', t.alertStartBeforeEnd);
      return null;
    }

    const dates = [];
    const curr = new Date(startDate);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }

    if (dates.length > 90) {
      showAlert('error', t.alertMaxPeriodLimit);
      return null;
    }

    setPeriodLoading(true);
    setPeriodProgress({ current: 0, total: dates.length, currentDate: dates[0] });

    try {
      const allRecords = [];
      const daysSummary = [];
      let completed = 0;
      const BATCH_SIZE = 4;

      for (let i = 0; i < dates.length; i += BATCH_SIZE) {
        const chunk = dates.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          chunk.map((d) => dailyWorkService.getByDate(d))
        );

        results.forEach((res, idx) => {
          completed++;
          const date = chunk[idx];
          setPeriodProgress({ current: completed, total: dates.length, currentDate: date });

          if (res.status === 'fulfilled' && res.value?.items && Array.isArray(res.value.items)) {
            const items = res.value.items;
            let dayOrders = 0;
            let dayHours = 0;

            items.forEach((item) => {
              allRecords.push({
                ...item,
                date,
              });
              dayOrders += item.orders ?? 0;
              dayHours += Number(item.workingHours ?? 0);
            });

            daysSummary.push({
              date,
              activeRiders: items.length,
              totalOrders: dayOrders,
              totalHours: Number(dayHours.toFixed(2)),
              items,
            });
          } else {
            daysSummary.push({
              date,
              activeRiders: 0,
              totalOrders: 0,
              totalHours: 0,
              items: [],
            });
          }
        });
      }

      const totalOrders = allRecords.reduce((sum, item) => sum + (item.orders ?? 0), 0);
      const totalHours = allRecords.reduce((sum, item) => sum + Number(item.workingHours ?? 0), 0);
      const uniqueRiders = new Set(
        allRecords.map((item) => (item.riderId ? `r_${item.riderId}` : `e_${item.employeeIqamaNo}`))
      ).size;
      const daysWithData = daysSummary.filter((d) => d.activeRiders > 0).length;

      const result = {
        startDate,
        endDate,
        dates,
        allRecords,
        daysSummary,
        stats: {
          totalDays: dates.length,
          daysWithData,
          totalRecords: allRecords.length,
          totalOrders,
          totalHours: Number(totalHours.toFixed(2)),
          avgOrdersPerRecord: allRecords.length > 0 ? (totalOrders / allRecords.length).toFixed(1) : '0',
          uniqueRiders,
        },
      };

      setPeriodData(result);
      if (allRecords.length === 0) {
        showAlert('info', t.alertPeriodNoData.replace('{days}', dates.length));
      } else {
        showAlert('success', t.alertPeriodLoadSuccess.replace('{count}', allRecords.length).replace('{days}', daysWithData));
      }
      return result;
    } catch (err) {
      console.error('Error fetching period data:', err);
      showAlert('error', t.alertPeriodLoadError);
      return null;
    } finally {
      setPeriodLoading(false);
    }
  };

  // Export Period to Excel with 3 Worksheets (Bilingual)
  const handleExportPeriodExcel = async () => {
    let currentData = periodData;
    if (!currentData || currentData.startDate !== periodStartDate || currentData.endDate !== periodEndDate) {
      currentData = await fetchPeriodData(periodStartDate, periodEndDate);
    }

    if (!currentData || currentData.allRecords.length === 0) {
      showAlert('info', t.alertPeriodNoExportData);
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Detailed Daily Records
      const detailedRows = currentData.allRecords.map((item, idx) => {
        const p = resolvePerson(item);
        if (isRtl) {
          return {
            '#': idx + 1,
            'التاريخ': item.date,
            'اليوم': getDayName(item.date),
            'اسم المندوب / الموظف': p.name,
            'معرف العمل (Working ID)': p.workingId || '—',
            'الشركة': p.companyName || '—',
            'رقم المندوب (Rider ID)': item.riderId || '—',
            'رقم الإقامة (Iqama No)': item.employeeIqamaNo || '—',
            'عدد الطلبات (Orders)': item.orders ?? 0,
            'ساعات العمل (Working Hours)': item.workingHours ?? 0,
          };
        }
        return {
          '#': idx + 1,
          'Date': item.date,
          'Day': getDayName(item.date),
          'Rider / Employee Name': p.name,
          'Working ID': p.workingId || '—',
          'Company': p.companyName || '—',
          'Rider ID': item.riderId || '—',
          'Iqama No': item.employeeIqamaNo || '—',
          'Orders': item.orders ?? 0,
          'Working Hours': item.workingHours ?? 0,
        };
      });

      const wsDetailed = XLSX.utils.json_to_sheet(detailedRows);
      XLSX.utils.book_append_sheet(workbook, wsDetailed, isRtl ? 'السجل التفصيلي اليومي' : 'Detailed Daily Records');

      // Sheet 2: Riders Summary
      const riderMap = new Map();
      currentData.allRecords.forEach((item) => {
        const p = resolvePerson(item);
        const key = item.riderId ? `rider_${item.riderId}` : `iqama_${item.employeeIqamaNo}`;
        if (!riderMap.has(key)) {
          riderMap.set(key, {
            name: p.name,
            workingId: p.workingId || '—',
            company: p.companyName || '—',
            iqamaNo: item.employeeIqamaNo || p.iqamaNo || '—',
            riderId: item.riderId || '—',
            daysWorked: new Set(),
            totalOrders: 0,
            totalHours: 0,
          });
        }
        const r = riderMap.get(key);
        r.daysWorked.add(item.date);
        r.totalOrders += item.orders ?? 0;
        r.totalHours += Number(item.workingHours ?? 0);
      });

      const ridersSummaryRows = Array.from(riderMap.values())
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .map((r, idx) => {
          if (isRtl) {
            return {
              '#': idx + 1,
              'اسم المندوب / الموظف': r.name,
              'معرف العمل (Working ID)': r.workingId,
              'الشركة': r.company,
              'رقم المندوب': r.riderId,
              'رقم الإقامة': r.iqamaNo,
              'أيام العمل الفعلية': r.daysWorked.size,
              'إجمالي الطلبات': r.totalOrders,
              'إجمالي ساعات العمل': Number(r.totalHours.toFixed(2)),
              'متوسط الطلبات اليومي': r.daysWorked.size > 0 ? Number((r.totalOrders / r.daysWorked.size).toFixed(1)) : 0,
              'متوسط الساعات اليومية': r.daysWorked.size > 0 ? Number((r.totalHours / r.daysWorked.size).toFixed(1)) : 0,
            };
          }
          return {
            '#': idx + 1,
            'Rider / Employee Name': r.name,
            'Working ID': r.workingId,
            'Company': r.company,
            'Rider ID': r.riderId,
            'Iqama No': r.iqamaNo,
            'Active Working Days': r.daysWorked.size,
            'Total Orders': r.totalOrders,
            'Total Working Hours': Number(r.totalHours.toFixed(2)),
            'Avg Daily Orders': r.daysWorked.size > 0 ? Number((r.totalOrders / r.daysWorked.size).toFixed(1)) : 0,
            'Avg Daily Hours': r.daysWorked.size > 0 ? Number((r.totalHours / r.daysWorked.size).toFixed(1)) : 0,
          };
        });

      const wsRiders = XLSX.utils.json_to_sheet(ridersSummaryRows);
      XLSX.utils.book_append_sheet(workbook, wsRiders, isRtl ? 'ملخص أداء المناديب' : 'Riders Performance Summary');

      // Sheet 3: Days Summary
      const daysRows = currentData.daysSummary.map((d, idx) => {
        if (isRtl) {
          return {
            '#': idx + 1,
            'التاريخ': d.date,
            'اليوم': getDayName(d.date),
            'عدد المناديب العاملين': d.activeRiders,
            'إجمالي الطلبات': d.totalOrders,
            'إجمالي ساعات العمل': d.totalHours,
            'متوسط الطلبات لكل مندوب': d.activeRiders > 0 ? Number((d.totalOrders / d.activeRiders).toFixed(1)) : 0,
          };
        }
        return {
          '#': idx + 1,
          'Date': d.date,
          'Day': getDayName(d.date),
          'Active Riders Count': d.activeRiders,
          'Total Orders': d.totalOrders,
          'Total Working Hours': d.totalHours,
          'Avg Orders Per Rider': d.activeRiders > 0 ? Number((d.totalOrders / d.activeRiders).toFixed(1)) : 0,
        };
      });

      const wsDays = XLSX.utils.json_to_sheet(daysRows);
      XLSX.utils.book_append_sheet(workbook, wsDays, isRtl ? 'ملخص الأيام' : 'Days Summary');

      const fileName = isRtl
        ? `تقرير_فانكوس_العمل_اليومي_من_${periodStartDate}_إلى_${periodEndDate}.xlsx`
        : `vancos_daily_work_report_${periodStartDate}_to_${periodEndDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      showAlert('success', t.alertPeriodExcelSuccess.replace('{count}', currentData.allRecords.length));
    } catch (err) {
      console.error('Error exporting period excel:', err);
      showAlert('error', t.alertPeriodExcelError);
    }
  };

  // Print / Download Period PDF Report
  const handlePrintPeriodPdf = async (mode = 'print') => {
    let currentData = periodData;
    if (!currentData || currentData.startDate !== periodStartDate || currentData.endDate !== periodEndDate) {
      currentData = await fetchPeriodData(periodStartDate, periodEndDate);
    }

    if (!currentData || currentData.allRecords.length === 0) {
      showAlert('info', t.alertPeriodNoPrintData);
      return;
    }

    setPeriodPdfLoading(true);
    setPeriodActionType(mode);

    try {
      const dateRangeTitle = isRtl 
        ? `من ${periodStartDate} إلى ${periodEndDate}` 
        : `From ${periodStartDate} to ${periodEndDate}`;

      const reportData = {
        reportDate: dateRangeTitle,
        companyName: isRtl ? 'فانكوس جولد' : 'Vancos Gold',
        companyNameEN: 'Vancos Gold',
        logoUrl: '/vancos-icon.png',
        isRtl,
        locale,
        items: currentData.allRecords.map((item) => {
          const p = resolvePerson(item);
          return {
            date: item.date,
            riderName: p.name,
            workingId: p.workingId || (item.riderId ? String(item.riderId) : ''),
            iqamaNo: item.employeeIqamaNo || p.iqamaNo,
            riderId: item.riderId,
            orders: item.orders ?? 0,
            workingHours: item.workingHours ?? 0,
          };
        }),
        grandTotalRiders: currentData.stats.uniqueRiders,
        grandTotalOrders: currentData.stats.totalOrders,
        grandTotalHours: currentData.stats.totalHours,
        avgOrders: currentData.stats.avgOrdersPerRecord,
      };

      const { renderVancosPdfBlob, downloadVancosBlob } = await import('@/components/shifts/VancosDetailedReportPDF');
      const blob = await renderVancosPdfBlob(reportData);
      const fileName = isRtl
        ? `تقرير_فانكوس_فترة_${periodStartDate}_إلى_${periodEndDate}.pdf`
        : `vancos_period_report_${periodStartDate}_to_${periodEndDate}.pdf`;

      if (mode === 'download') {
        downloadVancosBlob(blob, fileName);
        showAlert('success', t.alertPeriodPdfDownloadSuccess);
      } else {
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (!printWindow) {
          downloadVancosBlob(blob, fileName);
          showAlert('info', t.alertPopupBlocked);
        } else {
          showAlert('success', t.alertPeriodPdfOpenSuccess);
        }
      }
    } catch (err) {
      console.error('Error generating period PDF:', err);
      showAlert('error', t.alertPeriodPdfError);
    } finally {
      setPeriodPdfLoading(false);
      setPeriodActionType(null);
    }
  };

  // Load period entries into main table view
  const handleLoadPeriodIntoMainTable = () => {
    if (!periodData || periodData.allRecords.length === 0) {
      showAlert('info', t.alertNoPeriodDataForTable);
      return;
    }
    setSavedEntries(periodData.allRecords);
    setActiveTab('history');
    setShowPeriodModal(false);
    showAlert('success', t.alertPeriodLoadedToTable.replace('{count}', periodData.allRecords.length));
  };

  // Download template (bilingual column headers)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'رقم المندوب / Rider ID': 10,
        'رقم الإقامة / Iqama No': '',
        'عدد الطلبات / Orders': 15,
        'ساعات العمل / Working Hours': 8.5,
      },
      {
        'رقم المندوب / Rider ID': '',
        'رقم الإقامة / Iqama No': 1000000002,
        'عدد الطلبات / Orders': 8,
        'ساعات العمل / Working Hours': 6.25,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isRtl ? 'قالب فانكوس' : 'Vancos Template');
    XLSX.writeFile(workbook, `vancos_daily_work_template_${selectedDate}.xlsx`);
  };

  // Handle Excel file selection (Flexible Arabic/English column matching)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws);

        if (json.length === 0) {
          setImportErrors([t.alertEmptyExcel]);
          setImportPreview([]);
          return;
        }

        const parsed = [];
        const errs = [];
        const seenPeople = new Set();

        json.forEach((row, idx) => {
          const rowNum = idx + 2;
          const rawRiderId = row['رقم المندوب / Rider ID'] || 
                             row['رقم المندوب (Rider ID)'] || 
                             row['رقم المندوب'] || 
                             row['Rider ID'] || 
                             row['RiderId'] || 
                             row['riderId'] || 
                             row['RIDER_ID'] ||
                             row['rider_id'];
                             
          const rawIqama = row['رقم الإقامة / Iqama No'] || 
                           row['رقم الإقامة (Iqama No)'] || 
                           row['رقم الإقامة'] || 
                           row['رقم الاقامه'] || 
                           row['Iqama No'] || 
                           row['Iqama'] || 
                           row['iqamaNo'] || 
                           row['employeeIqamaNo'] || 
                           row['iqama_no'];

          const rawOrders = (row['عدد الطلبات / Orders'] || 
                            row['عدد الطلبات (Orders)'] || 
                            row['عدد الطلبات'] || 
                            row['الطلبات'] || 
                            row['Orders'] || 
                            row['orders'] || 
                            row['Orders Count']) ?? 0;

          const rawHours = (row['ساعات العمل / Working Hours'] || 
                           row['ساعات العمل (Working Hours)'] || 
                           row['ساعات العمل'] || 
                           row['ساعات'] || 
                           row['Working Hours'] || 
                           row['workingHours'] || 
                           row['WorkingHours'] || 
                           row['hours']) ?? 0;

          const riderId = rawRiderId && Number(rawRiderId) > 0 ? Number(rawRiderId) : null;
          const employeeIqamaNo = rawIqama && Number(rawIqama) > 0 ? Number(rawIqama) : null;

          if (!riderId && !employeeIqamaNo) {
            errs.push(t.alertRowMissingId.replace('{row}', rowNum));
            return;
          }

          const orders = Math.max(0, parseInt(rawOrders, 10) || 0);
          const hoursNum = parseFloat(rawHours);
          if (isNaN(hoursNum) || hoursNum < 0 || hoursNum > 24) {
            errs.push(t.alertRowInvalidHours.replace('{row}', rowNum).replace('{hours}', rawHours));
            return;
          }
          const workingHours = Number(hoursNum.toFixed(2));

          const personKey = riderId ? `rider_${riderId}` : `iqama_${employeeIqamaNo}`;
          if (seenPeople.has(personKey)) {
            errs.push(t.alertRowDuplicatePerson.replace('{row}', rowNum).replace('{person}', personKey));
            return;
          }
          seenPeople.add(personKey);

          parsed.push({
            riderId,
            employeeIqamaNo,
            orders,
            workingHours,
            rowNum,
          });
        });

        if (parsed.length > 1000) {
          errs.push(t.alertMaxImportLimit);
        }

        setImportPreview(parsed);
        setImportErrors(errs);
      } catch (err) {
        console.error('Failed to parse excel file:', err);
        setImportErrors([t.alertExcelParseError]);
        setImportPreview([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Excel Import
  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    setImportSaving(true);
    try {
      const payloadItems = importPreview.map(item => {
        const obj = {
          orders: item.orders,
          workingHours: item.workingHours,
        };
        if (item.riderId) obj.riderId = item.riderId;
        else if (item.employeeIqamaNo) obj.employeeIqamaNo = item.employeeIqamaNo;
        return obj;
      });

      const res = await dailyWorkService.saveEntries(selectedDate, payloadItems);
      if (res?.items) {
        setSavedEntries(res.items);
      } else {
        await loadSavedEntries(selectedDate);
      }

      showAlert('success', t.alertImportSuccess.replace('{count}', payloadItems.length).replace('{date}', selectedDate));
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
    } catch (err) {
      console.error('Import save error:', err);
      showAlert('error', err.userMessage || err.message || t.alertImportError);
    } finally {
      setImportSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <PageHeader title={t.companyVancos} subtitle={t.pageTitle} icon={Briefcase} />
        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t.accessDeniedTitle}</h2>
          <p className="text-gray-600">
            {t.accessDeniedDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pb-16 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <PageHeader
        title={t.pageTitle}
        subtitle={t.pageSubtitle}
        icon={Briefcase}
      />

      {/* Alert Component */}
      {alert && (
        <div className="px-4 md:px-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Top Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6">
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab('record')}
            className={`text-sm md:text-base cursor-pointer ${
              activeTab === 'record' 
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Plus size={18} className={isRtl ? 'ml-2' : 'mr-2'} />
            <span>{t.tabRecord}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setActiveTab('history')}
            className={`text-sm md:text-base cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:text-white' 
                : 'border-purple-600 text-purple-600 hover:bg-purple-50'
            }`}
          >
            <History size={18} className={isRtl ? 'ml-2' : 'mr-2'} />
            <span>{t.tabHistory} ({savedEntries.length})</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPeriodModal(true)}
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs md:text-sm cursor-pointer font-bold"
            title={t.periodReportBtn}
          >
            <CalendarDays size={16} className={`text-indigo-600 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
            <span>{t.periodReportBtn}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handlePrintPdf('print')}
            disabled={savedEntries.length === 0 || pdfLoading}
            className="border-blue-700 text-blue-700 hover:bg-blue-50 text-xs md:text-sm cursor-pointer disabled:opacity-40"
            title={t.printPdfVancos}
          >
            <Printer size={16} className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} ${pdfLoading && pdfActionType === 'print' ? 'animate-spin' : ''}`} />
            <span>{pdfLoading && pdfActionType === 'print' ? t.preparing : t.printPdfBtn}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={savedEntries.length === 0}
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs md:text-sm cursor-pointer disabled:opacity-40"
          >
            <Download size={16} className={isRtl ? 'ml-1.5' : 'mr-1.5'} />
            <span>{t.exportExcelBtn}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="border-orange-600 text-orange-600 hover:bg-orange-50 text-xs md:text-sm cursor-pointer"
          >
            <Upload size={16} className={isRtl ? 'ml-1.5' : 'mr-1.5'} />
            <span>{t.importExcelBtn}</span>
          </Button>
        </div>

      </div>

      {/* TAB 1: FORM */}
      {activeTab === 'record' && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:px-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Date Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dailyWorkDate} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleShiftDate(-1)}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 cursor-pointer"
                      title={t.prevDay}
                    >
                      <PrevIcon size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShiftDate(1)}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 cursor-pointer"
                      title={t.nextDay}
                    >
                      <NextIcon size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateChange(todayStr)}
                      className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                        selectedDate === todayStr 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {t.today}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg p-2 sm:max-w-xs leading-relaxed">
                  <span className="font-bold text-gray-700 block mb-0.5">{t.separateRecordsNoteTitle}</span>
                  {t.separateRecordsNoteDesc}
                </div>
              </div>
            </div>

            {/* Dynamic Usage Entries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>{t.dailyEntriesTitle}</span>
                  <span className="text-xs font-normal bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {workEntries.length} {t.entriesCount}
                  </span>
                </h3>
                <Button
                  type="button"
                  onClick={addWorkEntry}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm cursor-pointer"
                >
                  <Plus size={16} className={isRtl ? 'ml-2' : 'mr-2'} />
                  {t.addEntryBtn}
                </Button>
              </div>

              {workEntries.map((entry, index) => (
                <div key={entry.id || index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm md:text-base text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{t.entryNumber} {index + 1}</span>
                    </h4>

                    {workEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWorkEntry(index)}
                        className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title={t.deleteEntryHint}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    {/* Rider / Employee Selection */}
                    <div className="md:col-span-6">
                      <SearchableSelect
                        label={t.riderOrEmployee}
                        value={entry.riderOptionId}
                        onChange={(e) => handleRiderChange(e.target.value, index)}
                        options={dropdownOptions}
                        placeholder={peopleLoading ? t.loadingPeople : t.searchPersonPlaceholder}
                        required
                        labelClassName="text-xs md:text-sm font-medium"
                      />
                    </div>

                    {/* Orders */}
                    <div className="md:col-span-3">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        {t.ordersCount} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={t.ordersPlaceholder}
                        value={entry.orders}
                        onChange={(e) => handleOrdersChange(e.target.value, index)}
                        required
                      />
                    </div>

                    {/* Working Hours */}
                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs md:text-sm font-medium text-gray-700">
                          {t.workingHours} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-1">
                          {[4, 8, 12].map(hrs => (
                            <button
                              key={hrs}
                              type="button"
                              onClick={() => handleHoursChange(String(hrs), index)}
                              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono cursor-pointer"
                            >
                              {hrs}{t.hoursUnit}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.01"
                        placeholder={t.hoursPlaceholder}
                        value={entry.workingHours}
                        onChange={(e) => handleHoursChange(e.target.value, index)}
                        required
                      />
                    </div>

                  </div>

                  {/* Rider Details Pill if Selected */}
                  {entry.selectedRider && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-bold text-gray-800">{entry.selectedRider.displayName}</span>
                      {entry.selectedRider.workingId && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                          Working ID: {entry.selectedRider.workingId}
                        </span>
                      )}
                      {entry.selectedRider.riderId && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-medium">
                          Rider ID: {entry.selectedRider.riderId}
                        </span>
                      )}
                      {entry.selectedRider.employeeIqamaNo && (
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                          {t.iqamaTag}: {entry.selectedRider.employeeIqamaNo}
                        </span>
                      )}
                      {entry.selectedRider.company && (
                        <span className="text-gray-500">({entry.selectedRider.company})</span>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Submit Action Buttons */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-3 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm md:text-base font-bold px-8"
                disabled={submitLoading}
              >
                {submitLoading ? t.savingEntries : `${t.submitEntriesBtn} (${workEntries.length})`}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setWorkEntries([
                    { id: String(Date.now()), riderOptionId: '', selectedRider: null, orders: '', workingHours: '8' }
                  ]);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t.clearFieldsBtn}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('history')}
                className={`border-purple-600 text-purple-600 hover:bg-purple-50 ${isRtl ? 'mr-auto' : 'ml-auto'}`}
              >
                <History size={16} className={isRtl ? 'ml-2' : 'mr-2'} />
                <span>{t.viewTodayRecordsBtn} ({savedEntries.length} {t.recordsSavedCount})</span>
              </Button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 2: SAVED RECORDS FOR TODAY */}
      {activeTab === 'history' && (
        <div className="space-y-6 mx-4 md:px-6">

          {/* Date Selector Header in History */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <History size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{t.todayRecordsFor} {selectedDate}</h3>
                <p className="text-xs text-gray-500">{t.todayRecordsDesc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold bg-white cursor-pointer"
              />
              <button
                onClick={() => handleShiftDate(-1)}
                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600 cursor-pointer"
                title={t.prevDay}
              >
                <PrevIcon size={16} />
              </button>
              <button
                onClick={() => handleShiftDate(1)}
                className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600 cursor-pointer"
                title={t.nextDay}
              >
                <NextIcon size={16} />
              </button>
              <button
                onClick={() => handleDateChange(todayStr)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                {t.today}
              </button>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">{t.totalEntries}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalEntries}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">{t.totalOrders}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">{t.totalHours}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalHours} <span className="text-xs font-normal text-gray-400">{t.hoursShort}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">{t.avgOrders}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.avgOrders}</p>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
            
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder={t.tableSearchPlaceholder}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                {tableSearch && (
                  <button
                    onClick={() => setTableSearch('')}
                    className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePrintPdf('print')}
                  disabled={savedEntries.length === 0 || pdfLoading}
                  className="border-blue-700 text-blue-700 hover:bg-blue-50 text-xs cursor-pointer disabled:opacity-40"
                  title={t.printPdfVancos}
                >
                  <Printer size={14} className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} ${pdfLoading && pdfActionType === 'print' ? 'animate-spin' : ''}`} />
                  <span>{pdfLoading && pdfActionType === 'print' ? t.preparing : t.printPdfVancos}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePrintPdf('download')}
                  disabled={savedEntries.length === 0 || pdfLoading}
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs cursor-pointer disabled:opacity-40"
                  title={t.downloadPdfBtn}
                >
                  <FileText size={14} className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} ${pdfLoading && pdfActionType === 'download' ? 'animate-spin' : ''}`} />
                  <span>{pdfLoading && pdfActionType === 'download' ? t.downloading : t.downloadPdfBtn}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => loadSavedEntries(selectedDate)}
                  disabled={savedLoading}
                  className="text-xs border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  <RefreshCw size={14} className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} ${savedLoading ? 'animate-spin' : ''}`} />
                  {t.refresh}
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead className="bg-gray-50 text-gray-600 text-xs font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">{t.colNum}</th>
                    <th className="px-4 py-3.5">{t.colPerson}</th>
                    <th className="px-4 py-3.5">{t.colWorkingId}</th>
                    <th className="px-4 py-3.5">{t.colRiderId}</th>
                    <th className="px-4 py-3.5">{t.colIqama}</th>
                    <th className="px-4 py-3.5 text-center">{t.colOrders}</th>
                    <th className="px-4 py-3.5 text-center">{t.colHours}</th>
                    <th className="px-4 py-3.5 text-center w-28">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {savedLoading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400">
                        <div className="inline-flex items-center gap-2">
                          <RefreshCw className="animate-spin text-blue-500" size={20} />
                          <span className="text-sm font-medium">{t.loadingTodayRecords}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSavedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Package size={28} className="mx-auto text-gray-300" />
                          <p className="font-semibold text-gray-700 text-sm">{t.noRecordsToday}</p>
                          <p className="text-xs text-gray-400">
                            {tableSearch ? t.noSearchResults : t.noRecordsPrompt}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSavedEntries.map((item, idx) => {
                      const rowKey = item.riderId ? `rider_${item.riderId}` : `iqama_${item.employeeIqamaNo}`;
                      const isEditing = editingRowKey === rowKey;
                      const p = resolvePerson(item);

                      return (
                        <tr key={rowKey} className={`hover:bg-gray-50 transition-colors ${isEditing ? 'bg-amber-50/50' : ''}`}>
                          <td className="px-4 py-3 text-xs text-gray-400 text-center font-mono font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-900 block">{p.name}</span>
                            <span className="text-xs text-gray-500">{p.companyName}</span>
                          </td>
                          <td className="px-4 py-3">
                            {p.workingId ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-100">
                                {p.workingId}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-purple-700">
                            {item.riderId || '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">
                            {item.employeeIqamaNo || '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={inlineOrders}
                                onChange={(e) => setInlineOrders(e.target.value)}
                                className="w-20 px-2 py-1 text-center font-bold text-sm border border-amber-400 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                autoFocus
                              />
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full font-bold text-xs bg-gray-100 text-gray-800 font-mono">
                                {item.orders}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.01"
                                value={inlineHours}
                                onChange={(e) => setInlineHours(e.target.value)}
                                className="w-20 px-2 py-1 text-center font-bold text-sm border border-amber-400 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                              />
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full font-bold text-xs bg-purple-50 text-purple-700 font-mono">
                                {item.workingHours} {t.hoursUnit}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleSaveInlineEdit(item)}
                                  disabled={inlineSaving}
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                                  title={t.save}
                                >
                                  {inlineSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                                </button>
                                <button
                                  onClick={handleCancelInlineEdit}
                                  disabled={inlineSaving}
                                  className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                                  title={t.cancel}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartInlineEdit(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 size={13} />
                                <span>{t.edit}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {!savedLoading && filteredSavedEntries.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{t.showingRecords.replace('{count}', filteredSavedEntries.length).replace('{total}', savedEntries.length)}</span>
                <span>{t.recordsDateLabel} <span className="font-mono font-bold text-gray-700">{selectedDate}</span></span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{t.importModalTitle}</h3>
                  <p className="text-xs text-gray-500">{t.importModalSubtitle} <span className="font-bold text-blue-600 font-mono">{selectedDate}</span></p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                  setImportErrors([]);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-900">{t.downloadSampleTemplate}</h4>
                  <p className="text-xs text-blue-700 mt-0.5">{t.downloadSampleDesc}</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download size={14} />
                  <span>{t.downloadTemplateBtn}</span>
                </button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload size={24} className="mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-bold text-gray-700">{t.dropzoneTitle}</p>
                <p className="text-xs text-gray-400 mt-1">{t.dropzoneSubtitle}</p>
                {importFile && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>{t.fileSelected} {importFile.name}</span>
                  </div>
                )}
              </div>

              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-900 mb-1">
                    <AlertCircle size={15} />
                    <span>{t.importWarningsTitle} ({importErrors.length}):</span>
                  </div>
                  <ul className={`list-disc list-inside space-y-0.5 max-h-32 overflow-y-auto ${isRtl ? 'pr-1' : 'pl-1'}`}>
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>{t.previewReadyTitle} ({importPreview.length} {t.recordsUnit})</span>
                    <span className="text-emerald-600">{t.readyToSubmit}</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className={`w-full text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                      <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                        <tr>
                          <th className="p-2">{t.colRow}</th>
                          <th className="p-2">{t.colSentId}</th>
                          <th className="p-2">{t.colOrders}</th>
                          <th className="p-2">{t.colHours}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {importPreview.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-2 text-gray-400">{row.rowNum}</td>
                            <td className="p-2 font-bold text-blue-700">
                              {row.riderId ? `Rider ID: ${row.riderId}` : `${t.iqamaTag}: ${row.employeeIqamaNo}`}
                            </td>
                            <td className="p-2">{row.orders}</td>
                            <td className="p-2">{row.workingHours} {t.hoursUnit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview([]);
                  setImportErrors([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importSaving || importPreview.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors shadow-2xs"
              >
                {importSaving ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>{t.savingRecordsProgress}</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{t.saveRecordsNow.replace('{count}', importPreview.length)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERIOD EXPORT & PRINT MODAL */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150 my-8" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-lg">
                  <CalendarDays size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">{t.periodModalTitle}</h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {t.periodModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPeriodModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Date Selection Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Clock size={15} className="text-indigo-600" />
                    <span>{t.dateRangeLabel}</span>
                  </span>
                  
                  {/* Quick Presets */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('today')}
                      className="px-2.5 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      {t.presetToday}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('last7')}
                      className="px-2.5 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      {t.presetLast7}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('last30')}
                      className="px-2.5 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      {t.presetLast30}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('thisMonth')}
                      className="px-2.5 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      {t.presetThisMonth}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('prevMonth')}
                      className="px-2.5 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      {t.presetPrevMonth}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t.startDateLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={periodStartDate}
                      onChange={(e) => {
                        setPeriodStartDate(e.target.value);
                        setPeriodData(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t.endDateLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={periodEndDate}
                      onChange={(e) => {
                        setPeriodEndDate(e.target.value);
                        setPeriodData(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 flex-wrap gap-2">
                  <span>{t.periodFetchNote}</span>
                  <button
                    type="button"
                    onClick={() => fetchPeriodData(periodStartDate, periodEndDate)}
                    disabled={periodLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw size={13} className={periodLoading ? 'animate-spin' : ''} />
                    <span>{periodLoading ? t.preparing : t.fetchPeriodDataBtn}</span>
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              {periodLoading && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="animate-spin text-indigo-600" size={15} />
                      <span>{t.fetchingServerProgress} ({periodProgress.currentDate})</span>
                    </span>
                    <span>
                      {periodProgress.current} {t.ofDays} {periodProgress.total} {t.daysUnit} ({Math.round((periodProgress.current / (periodProgress.total || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-150"
                      style={{ width: `${Math.round((periodProgress.current / (periodProgress.total || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Results Preview when data loaded */}
              {periodData && !periodLoading && (
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl text-center">
                      <span className="block text-[11px] font-bold text-indigo-700 mb-0.5">{t.totalEntries}</span>
                      <span className="text-xl font-extrabold text-indigo-950 font-mono">
                        {periodData.stats.totalRecords.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-indigo-500 mt-0.5">
                        {t.acrossDays.replace('{days}', periodData.stats.daysWithData)}
                      </span>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl text-center">
                      <span className="block text-[11px] font-bold text-blue-700 mb-0.5">{t.totalOrders}</span>
                      <span className="text-xl font-extrabold text-blue-950 font-mono">
                        {periodData.stats.totalOrders.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-blue-500 mt-0.5">
                        {t.avgPerRecord.replace('{avg}', periodData.stats.avgOrdersPerRecord)}
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-center">
                      <span className="block text-[11px] font-bold text-emerald-700 mb-0.5">{t.totalHours}</span>
                      <span className="text-xl font-extrabold text-emerald-950 font-mono">
                        {periodData.stats.totalHours.toLocaleString()} {t.hoursUnit}
                      </span>
                      <span className="block text-[10px] text-emerald-500 mt-0.5">{t.totalPeriodHours}</span>
                    </div>

                    <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl text-center">
                      <span className="block text-[11px] font-bold text-purple-700 mb-0.5">{t.activeRiders}</span>
                      <span className="text-xl font-extrabold text-purple-950 font-mono">
                        {periodData.stats.uniqueRiders}
                      </span>
                      <span className="block text-[10px] text-purple-500 mt-0.5">{t.uniqueRidersUnit}</span>
                    </div>
                  </div>

                  {/* Days breakdown mini table */}
                  {periodData.daysSummary.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>{t.daysSummaryTitle} ({periodData.daysSummary.length} {t.daysUnit})</span>
                        <span className="text-gray-500 font-normal">
                          {periodData.startDate} ➔ {periodData.endDate}
                        </span>
                      </div>
                      <div className="max-h-44 overflow-y-auto">
                        <table className={`w-full text-xs divide-y divide-gray-200 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0">
                            <tr>
                              <th className="p-2">{t.colDate}</th>
                              <th className="p-2">{t.colDay}</th>
                              <th className="p-2">{t.colRiders}</th>
                              <th className="p-2">{t.colOrders}</th>
                              <th className="p-2">{t.colHours}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-mono">
                            {periodData.daysSummary.map((d, i) => (
                              <tr key={i} className={d.activeRiders > 0 ? 'hover:bg-gray-50' : 'bg-gray-50/50 text-gray-400'}>
                                <td className="p-2 font-bold text-gray-800">{d.date}</td>
                                <td className="p-2 font-sans">{getDayName(d.date)}</td>
                                <td className="p-2">
                                  {d.activeRiders > 0 ? (
                                    <span className="font-bold text-indigo-700">{d.activeRiders}</span>
                                  ) : (
                                    <span className="text-gray-300">0</span>
                                  )}
                                </td>
                                <td className="p-2">
                                  {d.totalOrders > 0 ? (
                                    <span className="font-bold text-blue-700">{d.totalOrders}</span>
                                  ) : (
                                    <span className="text-gray-300">0</span>
                                  )}
                                </td>
                                <td className="p-2">{d.totalHours} {t.hoursUnit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {periodData && periodData.allRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={handleLoadPeriodIntoMainTable}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                    title={t.viewInMainTableBtn}
                  >
                    <ListFilter size={15} />
                    <span>{t.viewInMainTableBtn}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  {t.closeBtn}
                </button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePrintPeriodPdf('print')}
                  disabled={periodLoading || periodPdfLoading}
                  className="border-blue-700 text-blue-700 hover:bg-blue-50 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <Printer size={15} className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} ${periodPdfLoading && periodActionType === 'print' ? 'animate-spin' : ''}`} />
                  <span>{periodPdfLoading && periodActionType === 'print' ? t.preparing : t.printPeriodPdfBtn}</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportPeriodExcel}
                  disabled={periodLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 text-xs font-bold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <FileSpreadsheet size={15} className={`text-white ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                  <span>{t.exportPeriodExcelBtn}</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
