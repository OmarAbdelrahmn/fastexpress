'use client';

import { useLanguage } from '@/lib/context/LanguageContext';

export const ACCOUNTING_LOCALES = ['ar', 'en'];

const translations = {
  ar: {
    shell: {
      brand: 'Fast Express',
      product: 'المنظومة المالية',
      openNavigation: 'فتح قائمة التنقل',
      closeNavigation: 'إغلاق قائمة التنقل',
      primaryNavigation: 'التنقل الرئيسي للمحاسبة',
      skipToContent: 'الانتقال إلى المحتوى الرئيسي',
      switchToEnglish: 'التبديل إلى اللغة الإنجليزية',
      switchToArabic: 'التبديل إلى اللغة العربية',
      openUserMenu: 'فتح قائمة المستخدم',
      closeUserMenu: 'إغلاق قائمة المستخدم',
      signedInAs: 'تم تسجيل الدخول باسم',
      accountant: 'محاسب',
      master: 'مدير النظام',
      logout: 'تسجيل الخروج',
      accessDenied: 'لا تملك صلاحية دخول المنظومة المالية',
      accessDeniedDescription: 'هذه المنطقة متاحة لحسابات المحاسب ومدير النظام فقط.',
      backToLogin: 'العودة إلى تسجيل الدخول',
      checkingAccess: 'جاري التحقق من صلاحية الوصول',
      checkingAccessDescription: 'لحظة واحدة بينما نجهز مساحة العمل المالية.',
    },
    workspace: {
      legalEntity: 'الكيان القانوني',
      fiscalPeriod: 'الفترة المالية',
      noLegalEntity: 'لم يتم تحميل الكيانات',
      currentPeriod: 'الفترة الحالية',
      entityContext: 'سياق الكيان',
      fiscalContext: 'السياق المالي',
    },
    nav: {
      overview: 'نظرة عامة',
      dashboard: 'لوحة التحكم',
      revenueCycle: 'الإيرادات والاستيراد',
      files: 'الملفات المحاسبية',
      imports: 'استيرادات المنصات',
      compensation: 'سياسات التعويض',
      riders: 'الركاب والرواتب',
      payroll: 'مسيرات الرواتب',
      payments: 'دفعات السداد',
      riderProfiles: 'الملفات المالية للركاب',
      accounting: 'دفتر الأستاذ',
      ledgerSetup: 'إعدادات الدفتر',
      journals: 'القيود والموافقات',
      reports: 'التقارير المالية',
      operations: 'العمليات المالية',
      receivables: 'الذمم المدينة',
      payables: 'الذمم الدائنة',
      expenses: 'المصروفات والأدلة',
      inventory: 'المخزون',
      treasury: 'الخزينة والبنوك',
      compliance: 'الضريبة والأصول والميزانية',
      administration: 'الإدارة',
      financialAccess: 'صلاحيات الوصول المالي',
      setup: 'الكيانات والمنصات',
      manageSetup: 'إدارة الكيانات والمنصات',
    },
    common: {
      actions: 'الإجراءات',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      close: 'إغلاق',
      retry: 'إعادة المحاولة',
      loading: 'جاري التحميل',
      loadingDescription: 'يتم تجهيز البيانات المطلوبة.',
      empty: 'لا توجد بيانات بعد',
      emptyDescription: 'ستظهر السجلات هنا عند توفرها.',
      error: 'تعذر تحميل البيانات',
      errorDescription: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
      required: 'مطلوب',
      previous: 'السابق',
      next: 'التالي',
      page: 'صفحة',
      of: 'من',
      rows: 'سجل',
      noValue: '—',
    },
    dialog: {
      confirmTitle: 'تأكيد الإجراء',
      confirmDescription: 'هل أنت متأكد من متابعة هذا الإجراء؟',
      processing: 'جاري التنفيذ',
    },
    status: {
      draft: 'مسودة',
      active: 'نشط',
      inactive: 'غير نشط',
      received: 'تم الاستلام',
      parsing: 'جاري التحليل',
      needsresolution: 'يحتاج معالجة',
      reconciled: 'تمت المطابقة',
      calculated: 'تم الاحتساب',
      submitted: 'مرسل للمراجعة',
      approved: 'معتمد',
      rejected: 'مرفوض',
      posted: 'مرحل',
      reversed: 'معكوس',
      failed: 'فشل',
      prepared: 'مجهز',
      exported: 'تم التصدير',
      confirmed: 'مؤكد',
      paid: 'مدفوع',
      partiallypaid: 'مدفوع جزئياً',
      pending: 'قيد الانتظار',
      open: 'مفتوحة',
      closed: 'مغلقة',
      softclosed: 'إغلاق مبدئي',
      accepted: 'مقبول',
      waived: 'تم التجاوز',
      resolved: 'تمت المعالجة',
    },
  },
  en: {
    shell: {
      brand: 'Fast Express',
      product: 'Finance Workspace',
      openNavigation: 'Open navigation',
      closeNavigation: 'Close navigation',
      primaryNavigation: 'Accounting primary navigation',
      skipToContent: 'Skip to main content',
      switchToEnglish: 'Switch to English',
      switchToArabic: 'Switch to Arabic',
      openUserMenu: 'Open user menu',
      closeUserMenu: 'Close user menu',
      signedInAs: 'Signed in as',
      accountant: 'Accountant',
      master: 'System administrator',
      logout: 'Sign out',
      accessDenied: 'You do not have access to the finance workspace',
      accessDeniedDescription: 'This area is available to Accountant and Master accounts only.',
      backToLogin: 'Back to sign in',
      checkingAccess: 'Checking access',
      checkingAccessDescription: 'One moment while we prepare your finance workspace.',
    },
    workspace: {
      legalEntity: 'Legal entity',
      fiscalPeriod: 'Fiscal period',
      noLegalEntity: 'Entities not loaded',
      currentPeriod: 'Current period',
      entityContext: 'Entity context',
      fiscalContext: 'Fiscal context',
    },
    nav: {
      overview: 'Overview',
      dashboard: 'Dashboard',
      revenueCycle: 'Revenue & imports',
      files: 'Accounting files',
      imports: 'Platform imports',
      compensation: 'Compensation policies',
      riders: 'Riders & payroll',
      payroll: 'Payroll runs',
      payments: 'Payment batches',
      riderProfiles: 'Rider financial profiles',
      accounting: 'General ledger',
      ledgerSetup: 'Ledger setup',
      journals: 'Journals & approvals',
      reports: 'Financial reports',
      operations: 'Financial operations',
      receivables: 'Receivables',
      payables: 'Payables',
      expenses: 'Expenses & evidence',
      inventory: 'Inventory',
      treasury: 'Treasury & banking',
      compliance: 'Tax, assets & budgets',
      administration: 'Administration',
      financialAccess: 'Financial access',
      setup: 'Entities & platforms',
      manageSetup: 'Manage entities & platforms',
    },
    common: {
      actions: 'Actions',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      retry: 'Try again',
      loading: 'Loading',
      loadingDescription: 'Preparing the requested data.',
      empty: 'No data yet',
      emptyDescription: 'Records will appear here when they become available.',
      error: 'Unable to load data',
      errorDescription: 'Something unexpected happened. Please try again.',
      required: 'Required',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
      rows: 'rows',
      noValue: '—',
    },
    dialog: {
      confirmTitle: 'Confirm action',
      confirmDescription: 'Are you sure you want to continue with this action?',
      processing: 'Processing',
    },
    status: {
      draft: 'Draft',
      active: 'Active',
      inactive: 'Inactive',
      received: 'Received',
      parsing: 'Parsing',
      needsresolution: 'Needs resolution',
      reconciled: 'Reconciled',
      calculated: 'Calculated',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected',
      posted: 'Posted',
      reversed: 'Reversed',
      failed: 'Failed',
      prepared: 'Prepared',
      exported: 'Exported',
      confirmed: 'Confirmed',
      paid: 'Paid',
      partiallypaid: 'Partially paid',
      pending: 'Pending',
      open: 'Open',
      closed: 'Closed',
      softclosed: 'Soft closed',
      accepted: 'Accepted',
      waived: 'Waived',
      resolved: 'Resolved',
    },
  },
};

function getNestedValue(source, key) {
  return key.split('.').reduce((value, segment) => value?.[segment], source);
}

function interpolate(value, params) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => params?.[name] ?? `{${name}}`);
}

export function normalizeAccountingLocale(locale) {
  return locale === 'en' ? 'en' : 'ar';
}

export function accountingDirection(locale) {
  return normalizeAccountingLocale(locale) === 'ar' ? 'rtl' : 'ltr';
}

export function accountingT(locale, key, params = {}) {
  const normalizedLocale = normalizeAccountingLocale(locale);
  const value = getNestedValue(translations[normalizedLocale], key)
    ?? getNestedValue(translations.ar, key)
    ?? key;

  return interpolate(value, params);
}

const optionTranslations = {
  Active: 'نشط', Approved: 'معتمد', Calculated: 'تم الاحتساب', Confirmed: 'مؤكد',
  Deduction: 'استقطاع', Draft: 'مسودة', Earning: 'استحقاق', Exported: 'تم التصدير',
  Failed: 'فشل', Informational: 'معلوماتي', Inactive: 'غير نشط', NeedsResolution: 'يحتاج معالجة',
  Paid: 'مدفوع', Parsing: 'جاري التحليل', Pending: 'قيد الانتظار', Prepared: 'مجهز',
  Received: 'تم الاستلام', Reconciled: 'تمت المطابقة', Rejected: 'مرفوض', Retired: 'موقوف',
  Submitted: 'مرسل للمراجعة', Allowance: 'بدل', Bonus: 'مكافأة',
  FixedAmount: 'مبلغ ثابت', PerUnit: 'لكل وحدة', Threshold: 'حد أدنى',
  TieredBasePlusExcess: 'شرائح مع زيادة', Percentage: 'نسبة مئوية', Range: 'نطاق',
  Cap: 'حد أقصى', Floor: 'حد أدنى', EligibilityCondition: 'شرط الاستحقاق',
  ExclusiveHighest: 'أعلى قاعدة حصرية', Cumulative: 'تراكمي',
  BankTransfer: 'تحويل بنكي', Cash: 'نقدي', Wallet: 'محفظة',
};

export function accountingOptionLabel(locale, value) {
  const text = String(value ?? '');
  return normalizeAccountingLocale(locale) === 'ar' ? optionTranslations[text] ?? text : text;
}

export function useAccountingI18n() {
  const { locale, changeLanguage } = useLanguage();
  const normalizedLocale = normalizeAccountingLocale(locale);
  return {
    locale: normalizedLocale,
    isRtl: normalizedLocale === 'ar',
    dir: accountingDirection(normalizedLocale),
    changeLanguage,
    t: (key, params) => accountingT(normalizedLocale, key, params),
    formatNumber: (value, options) => new Intl.NumberFormat(normalizedLocale === 'ar' ? 'ar-SA' : 'en-SA', options).format(Number(value ?? 0)),
    formatMoney: (value, currency = 'SAR', options = {}) => new Intl.NumberFormat(
      normalizedLocale === 'ar' ? 'ar-SA' : 'en-SA',
      { style: 'currency', currency, ...options }
    ).format(Number(value ?? 0)),
    formatDate: (value, options = {}) => value
      ? new Intl.DateTimeFormat(normalizedLocale === 'ar' ? 'ar-SA' : 'en-SA', options).format(new Date(value))
      : '—',
  };
}

export { translations as accountingTranslations };
