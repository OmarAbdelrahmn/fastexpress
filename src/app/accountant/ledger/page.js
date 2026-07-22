'use client';

import { ActionButton, DataTable, EmptyState, ErrorState, LoadingState, PageHeader, Panel, StatusBadge } from '@/components/accounting/AccountingUi';
import FinanceActionForm, { FinanceTabs } from '@/components/accountant/FinanceActionForm';
import AccountingResourceBrowser from '@/components/accountant/AccountingResourceBrowser';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { BookOpen, CalendarRange, CheckCheck, Landmark, ListTree, RefreshCw, Settings2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const COPY = {
  ar: {
    eyebrow: 'المحاسبة العامة', title: 'دفتر الأستاذ', description: 'دليل الحسابات والقيود والاعتمادات والفترات وإعدادات الترحيل في مساحة واحدة.',
    accounts: 'دليل الحسابات', journals: 'القيود والمستندات', approvals: 'صندوق الاعتماد', periods: 'السنوات والفترات', setup: 'إعدادات الدفتر',
    noEntity: 'اختر كياناً قانونياً من شريط مساحة العمل.', refresh: 'تحديث', emptyAccounts: 'لا توجد حسابات لهذا الكيان.', emptyApprovals: 'لا توجد مستندات بانتظار الاعتماد.', loadError: 'تعذر تحميل بيانات الدفتر.',
    code: 'الرمز', name: 'الاسم', type: 'النوع', flags: 'الخصائص', document: 'المستند', date: 'التاريخ', amount: 'المبلغ', creator: 'المنشئ',
  },
  en: {
    eyebrow: 'General accounting', title: 'General ledger', description: 'Chart of accounts, journals, approvals, periods, and posting setup in one workspace.',
    accounts: 'Chart of accounts', journals: 'Journals & documents', approvals: 'Approval inbox', periods: 'Fiscal years & periods', setup: 'Ledger setup',
    noEntity: 'Select a legal entity from the workspace bar.', refresh: 'Refresh', emptyAccounts: 'No accounts exist for this legal entity.', emptyApprovals: 'No documents are awaiting approval.', loadError: 'Ledger data could not be loaded.',
    code: 'Code', name: 'Name', type: 'Type', flags: 'Properties', document: 'Document', date: 'Date', amount: 'Amount', creator: 'Created by',
  },
};

const options = (values) => values.map((value) => Array.isArray(value)
  ? ({ value: value[0], label: { ar: value[1], en: value[2] ?? value[1] } })
  : ({ value, label: { ar: value, en: value } }));
const idempotency = () => globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const field = (name, ar, en, type = 'text', extra = {}) => ({ name, label: { ar, en }, type, ...extra });

export default function LedgerWorkspacePage({ initialTab = 'accounts' }) {
  const { isRtl } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? COPY.ar : COPY.en;
  const locale = isRtl ? 'ar-SA' : 'en-US';
  const [tab, setTab] = useState(initialTab);
  const [accounts, setAccounts] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [journalAction, setJournalAction] = useState('create');
  const [periodAction, setPeriodAction] = useState('create');
  const [setupAction, setSetupAction] = useState('currency');

  const tabs = [
    { id: 'accounts', label: { ar: COPY.ar.accounts, en: COPY.en.accounts }, icon: ListTree },
    { id: 'journals', label: { ar: COPY.ar.journals, en: COPY.en.journals }, icon: BookOpen },
    { id: 'approvals', label: { ar: COPY.ar.approvals, en: COPY.en.approvals }, icon: CheckCheck },
    { id: 'periods', label: { ar: COPY.ar.periods, en: COPY.en.periods }, icon: CalendarRange },
    { id: 'setup', label: { ar: COPY.ar.setup, en: COPY.en.setup }, icon: Settings2 },
  ];

  const load = useCallback(async () => {
    if (!legalEntityId) return;
    setLoading(true); setLoadError('');
    const [accountResult, approvalResult] = await Promise.allSettled([
      accountingApi.ledger.getAccounts(legalEntityId),
      accountingApi.ledger.getApprovalInbox(legalEntityId),
    ]);
    setAccounts(accountResult.status === 'fulfilled' ? accountResult.value || [] : []);
    setApprovals(approvalResult.status === 'fulfilled' ? approvalResult.value || [] : []);
    if (accountResult.status === 'rejected' || approvalResult.status === 'rejected') setLoadError(text.loadError);
    setLoading(false);
  }, [legalEntityId, text.loadError]);

  useEffect(() => { load(); }, [load]);

  const accountFields = useMemo(() => [
    field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }),
    field('parentAccountId', 'الحساب الأب (اختياري)', 'Parent account ID (optional)', 'number'),
    field('code', 'رمز الحساب', 'Account code', 'text', { required: true, dir: 'ltr' }),
    field('name', 'اسم الحساب', 'Account name', 'text', { required: true }),
    field('type', 'نوع الحساب', 'Account type', 'select', { required: true, options: options([['1', 'الأصول', 'Asset'], ['2', 'الالتزامات', 'Liability'], ['3', 'حقوق الملكية', 'Equity'], ['4', 'الإيرادات', 'Revenue'], ['5', 'المصروفات', 'Expense']]) }),
    field('isControlAccount', 'حساب رقابي', 'Control account', 'checkbox'),
    field('allowManualPosting', 'يسمح بالقيد اليدوي', 'Allow manual posting', 'checkbox', { defaultValue: true }),
    field('isCashEquivalent', 'نقد وما في حكمه', 'Cash equivalent', 'checkbox'),
  ], [legalEntityId]);

  const journalConfigs = {
    create: {
      title: { ar: 'إنشاء قيد يومية يدوي', en: 'Create manual journal' },
      fields: [field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }), field('branchId', 'الفرع (اختياري)', 'Branch ID (optional)', 'number'), field('transactionDate', 'تاريخ العملية', 'Transaction date', 'date', { required: true }), field('description', 'الوصف', 'Description', 'textarea', { required: true, full: true }), field('currencyCode', 'العملة', 'Currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('exchangeRate', 'سعر الصرف', 'Exchange rate', 'number', { required: true, defaultValue: 1, min: 0.000001, step: '0.000001' }), field('idempotencyKey', 'مفتاح عدم التكرار', 'Idempotency key', 'text', { required: true, defaultValue: idempotency(), dir: 'ltr', full: true }), field('lines', 'سطور القيد بصيغة JSON', 'Journal lines as JSON', 'json', { required: true, full: true, defaultValue: '[\n  {"accountId": 0, "description": "", "debit": 0, "credit": 0}\n]' })],
      submit: (payload) => accountingApi.ledger.createManualJournal(payload, payload.idempotencyKey),
    },
    get: { title: { ar: 'فتح مستند', en: 'Open document' }, fields: [field('documentId', 'معرف المستند', 'Document ID', 'text', { required: true, dir: 'ltr', full: true })], submit: ({ documentId }) => accountingApi.ledger.getDocument(documentId) },
    submit: { title: { ar: 'إرسال للاعتماد', en: 'Submit document' }, fields: [field('documentId', 'معرف المستند', 'Document ID', 'text', { required: true, dir: 'ltr', full: true })], submit: ({ documentId }) => accountingApi.ledger.submitDocument(documentId) },
    approve: { title: { ar: 'اعتماد مستند', en: 'Approve document' }, fields: [field('documentId', 'معرف المستند', 'Document ID', 'text', { required: true, dir: 'ltr' }), field('comment', 'تعليق', 'Comment', 'textarea')], submit: ({ documentId, ...payload }) => accountingApi.ledger.approveDocument(documentId, payload) },
    post: { title: { ar: 'ترحيل مستند', en: 'Post document' }, fields: [field('documentId', 'معرف المستند', 'Document ID', 'text', { required: true, dir: 'ltr', full: true })], submit: ({ documentId }) => accountingApi.ledger.postDocument(documentId) },
    reverse: { title: { ar: 'إنشاء مستند عكسي', en: 'Create reversal document' }, fields: [field('documentId', 'معرف المستند', 'Document ID', 'text', { required: true, dir: 'ltr' }), field('reversalDate', 'تاريخ العكس', 'Reversal date', 'date', { required: true }), field('reason', 'سبب العكس', 'Reversal reason', 'textarea', { required: true, full: true }), field('idempotencyKey', 'مفتاح عدم التكرار', 'Idempotency key', 'text', { required: true, defaultValue: idempotency(), dir: 'ltr', full: true })], submit: ({ documentId, ...payload }) => accountingApi.ledger.reverseDocument(documentId, payload, payload.idempotencyKey) },
  };

  const periodConfigs = {
    create: { title: { ar: 'إنشاء سنة مالية', en: 'Create fiscal year' }, fields: [field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }), field('name', 'اسم السنة', 'Fiscal year name', 'text', { required: true }), field('startDate', 'تاريخ البداية', 'Start date', 'date', { required: true }), field('endDate', 'تاريخ النهاية', 'End date', 'date', { required: true }), field('periods', 'الفترات بصيغة JSON', 'Periods as JSON', 'json', { required: true, full: true, defaultValue: '[]' })], submit: (payload) => accountingApi.ledger.createFiscalYear(payload) },
    get: { title: { ar: 'فتح سنة مالية', en: 'Open fiscal year' }, fields: [field('fiscalYearId', 'رقم السنة المالية', 'Fiscal year ID', 'number', { required: true, full: true })], submit: ({ fiscalYearId }) => accountingApi.ledger.getFiscalYear(fiscalYearId) },
    softClose: { title: { ar: 'إقفال مبدئي للفترة', en: 'Soft-close period' }, fields: [field('periodId', 'رقم الفترة', 'Period ID', 'number', { required: true }), field('reason', 'السبب', 'Reason', 'textarea', { required: true, full: true }), field('taxLocked', 'قفل الضريبة', 'Lock tax', 'checkbox'), field('payrollLocked', 'قفل الرواتب', 'Lock payroll', 'checkbox')], submit: ({ periodId, ...payload }) => accountingApi.ledger.softClosePeriod(periodId, payload) },
    close: { title: { ar: 'إقفال الفترة', en: 'Close period' }, fields: [field('periodId', 'رقم الفترة', 'Period ID', 'number', { required: true }), field('reason', 'السبب', 'Reason', 'textarea', { required: true, full: true }), field('taxLocked', 'قفل الضريبة', 'Lock tax', 'checkbox', { defaultValue: true }), field('payrollLocked', 'قفل الرواتب', 'Lock payroll', 'checkbox', { defaultValue: true })], submit: ({ periodId, ...payload }) => accountingApi.ledger.closePeriod(periodId, payload) },
    reopen: { title: { ar: 'إعادة فتح الفترة', en: 'Reopen period' }, fields: [field('periodId', 'رقم الفترة', 'Period ID', 'number', { required: true }), field('reason', 'سبب إعادة الفتح', 'Reopen reason', 'textarea', { required: true, full: true }), field('taxLocked', 'قفل الضريبة', 'Lock tax', 'checkbox'), field('payrollLocked', 'قفل الرواتب', 'Lock payroll', 'checkbox')], submit: ({ periodId, ...payload }) => accountingApi.ledger.reopenPeriod(periodId, payload) },
  };

  const setupConfigs = {
    currency: { title: { ar: 'إضافة عملة', en: 'Add currency' }, fields: [field('code', 'رمز العملة', 'Currency code', 'text', { required: true, dir: 'ltr' }), field('name', 'اسم العملة', 'Currency name', 'text', { required: true }), field('decimalPlaces', 'المنازل العشرية', 'Decimal places', 'number', { required: true, defaultValue: 2, min: 0, max: 6 })], submit: (payload) => accountingApi.ledger.createCurrency(payload) },
    rate: { title: { ar: 'إضافة سعر صرف', en: 'Add exchange rate' }, fields: [field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }), field('fromCurrencyCode', 'من عملة', 'From currency', 'text', { required: true, dir: 'ltr' }), field('toCurrencyCode', 'إلى عملة', 'To currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('effectiveDate', 'تاريخ السريان', 'Effective date', 'date', { required: true }), field('rate', 'السعر', 'Rate', 'number', { required: true, min: 0.000001, step: '0.000001' })], submit: (payload) => accountingApi.ledger.createExchangeRate(payload) },
    dimension: { title: { ar: 'إضافة بُعد مالي', en: 'Add financial dimension' }, fields: [field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }), field('code', 'الرمز', 'Code', 'text', { required: true, dir: 'ltr' }), field('name', 'الاسم', 'Name', 'text', { required: true }), field('isRequired', 'إلزامي', 'Required', 'checkbox')], submit: (payload) => accountingApi.ledger.createDimension(payload) },
    dimensionValue: { title: { ar: 'إضافة قيمة بُعد', en: 'Add dimension value' }, fields: [field('financialDimensionId', 'رقم البعد', 'Dimension ID', 'number', { required: true }), field('code', 'الرمز', 'Code', 'text', { required: true, dir: 'ltr' }), field('name', 'الاسم', 'Name', 'text', { required: true })], submit: (payload) => accountingApi.ledger.createDimensionValue(payload) },
    dimensionValuesList: { title: { ar: 'عرض قيم بُعد مالي', en: 'List dimension values' }, fields: [field('financialDimensionId', 'رقم البعد', 'Dimension ID', 'number', { required: true, full: true })], submit: ({ financialDimensionId }) => accountingApi.ledger.listDimensionValues(financialDimensionId) },
    postingProfile: { title: { ar: 'إضافة ملف ترحيل', en: 'Add posting profile' }, fields: [field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }), field('code', 'الرمز', 'Code', 'text', { required: true, dir: 'ltr' }), field('name', 'الاسم', 'Name', 'text', { required: true }), field('effectiveFrom', 'بداية السريان', 'Effective from', 'date', { required: true }), field('effectiveTo', 'نهاية السريان', 'Effective to', 'date'), field('lines', 'مسارات الأحداث بصيغة JSON', 'Event routes as JSON', 'json', { required: true, full: true, defaultValue: '[\n  {"eventCode":"", "debitAccountId":0, "creditAccountId":0}\n]' })], submit: (payload) => accountingApi.ledger.createPostingProfile(payload) },
    recurring: { title: { ar: 'إضافة قيد متكرر', en: 'Add recurring journal' }, fields: [field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' }), field('branchId', 'الفرع (اختياري)', 'Branch ID (optional)', 'number'), field('documentType', 'نوع المستند', 'Document type', 'text', { required: true }), field('description', 'الوصف', 'Description', 'textarea', { required: true, full: true }), field('currencyCode', 'العملة', 'Currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('frequencyMonths', 'التكرار بالأشهر', 'Frequency in months', 'number', { required: true, min: 1, defaultValue: 1 }), field('nextRunDate', 'التشغيل القادم', 'Next run date', 'date', { required: true }), field('endDate', 'تاريخ النهاية', 'End date', 'date'), field('lines', 'سطور القيد بصيغة JSON', 'Journal lines as JSON', 'json', { required: true, full: true, defaultValue: '[]' })], submit: (payload) => accountingApi.ledger.createRecurringJournalSchedule(payload) },
    generate: { title: { ar: 'توليد القيود المستحقة', en: 'Generate due journals' }, fields: [field('throughDate', 'حتى تاريخ', 'Through date', 'date', { required: true, full: true })], submit: ({ throughDate }) => accountingApi.ledger.generateRecurringJournalSchedules(throughDate) },
  };

  const ledgerResources = useMemo(() => ({
    journals: [
      { id: 'documents', label: { ar: 'المستندات المالية', en: 'Financial documents' }, load: () => accountingApi.ledger.listDocuments(legalEntityId), get: accountingApi.ledger.getDocument, idOf: (row) => row.financialDocumentId ?? row.documentId ?? row.id },
      { id: 'entries', label: { ar: 'قيود اليومية', en: 'Journal entries' }, load: () => accountingApi.ledger.listJournalEntries(legalEntityId), idOf: (row) => row.journalEntryId ?? row.entryId ?? row.id },
    ],
    periods: [
      { id: 'years', label: { ar: 'السنوات المالية', en: 'Fiscal years' }, load: () => accountingApi.ledger.listFiscalYears(legalEntityId), get: accountingApi.ledger.getFiscalYear, idOf: (row) => row.fiscalYearId ?? row.id },
    ],
    setup: [
      { id: 'currencies', label: { ar: 'العملات', en: 'Currencies' }, load: () => accountingApi.ledger.listCurrencies({ legalEntityId }), idOf: (row) => row.code ?? row.id },
      { id: 'rates', label: { ar: 'أسعار الصرف', en: 'Exchange rates' }, load: () => accountingApi.ledger.listExchangeRates(legalEntityId), idOf: (row) => row.exchangeRateId ?? row.id },
      { id: 'dimensions', label: { ar: 'الأبعاد المالية', en: 'Financial dimensions' }, load: () => accountingApi.ledger.listDimensions(legalEntityId), idOf: (row) => row.financialDimensionId ?? row.id },
      { id: 'profiles', label: { ar: 'ملفات الترحيل', en: 'Posting profiles' }, load: () => accountingApi.ledger.listPostingProfiles(legalEntityId), get: accountingApi.ledger.getPostingProfile, idOf: (row) => row.postingProfileId ?? row.id },
      { id: 'recurring', label: { ar: 'القيود المتكررة', en: 'Recurring journals' }, load: () => accountingApi.ledger.listRecurringJournalSchedules(legalEntityId), get: accountingApi.ledger.getRecurringSchedule, idOf: (row) => row.recurringJournalScheduleId ?? row.scheduleId ?? row.id },
    ],
  }), [legalEntityId]);

  const selector = (value, setValue, configs) => <select className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold" value={value} onChange={(event) => setValue(event.target.value)}>{Object.entries(configs).map(([id, config]) => <option key={id} value={id}>{isRtl ? config.title.ar : config.title.en}</option>)}</select>;
  const accountColumns = [{ key: 'code', header: text.code, render: (item) => <span className="font-mono" dir="ltr">{item.code}</span> }, { key: 'name', header: text.name }, { key: 'type', header: text.type, render: (item) => <StatusBadge status={item.type} /> }, { key: 'flags', header: text.flags, render: (item) => [item.isControlAccount && 'Control', item.allowManualPosting && 'Manual', item.isCashEquivalent && 'Cash'].filter(Boolean).join(' · ') || '—' }];
  const approvalColumns = [{ key: 'documentNumber', header: text.document }, { key: 'documentType', header: text.type, render: (item) => <StatusBadge status={item.documentType} /> }, { key: 'transactionDate', header: text.date }, { key: 'amount', header: text.amount, numeric: true, render: (item) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR' }).format(item.amount || 0) }, { key: 'createdBy', header: text.creator }];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>{text.refresh}</ActionButton>} />
      <FinanceTabs tabs={tabs} activeId={tab} onChange={setTab} label={text.title} />
      {!legalEntityId ? <EmptyState icon={Landmark} title={text.noEntity} /> : loadError ? <ErrorState message={loadError} onRetry={load} compact /> : null}
      {loading ? <LoadingState /> : legalEntityId && tab === 'accounts' && <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]"><Panel title={text.accounts}>{accounts.length ? <DataTable columns={accountColumns} rows={accounts} getRowKey={(item) => item.id} /> : <EmptyState title={text.emptyAccounts} />}</Panel><FinanceActionForm title={{ ar: 'إضافة حساب', en: 'Add account' }} fields={accountFields} onSubmit={async (payload) => { const result = await accountingApi.ledger.createAccount(payload); load(); return result; }} /></div>}
      {legalEntityId && tab === 'journals' && <><div className="flex justify-end">{selector(journalAction, setJournalAction, journalConfigs)}</div><FinanceActionForm key={journalAction} title={journalConfigs[journalAction].title} fields={journalConfigs[journalAction].fields} onSubmit={journalConfigs[journalAction].submit} afterSuccess={load} /><AccountingResourceBrowser resources={ledgerResources.journals} /></>}
      {legalEntityId && tab === 'approvals' && <Panel title={text.approvals}>{approvals.length ? <DataTable columns={approvalColumns} rows={approvals} getRowKey={(item) => item.documentId} /> : <EmptyState title={text.emptyApprovals} />}</Panel>}
      {legalEntityId && tab === 'periods' && <><div className="flex justify-end">{selector(periodAction, setPeriodAction, periodConfigs)}</div><FinanceActionForm key={periodAction} title={periodConfigs[periodAction].title} fields={periodConfigs[periodAction].fields} onSubmit={periodConfigs[periodAction].submit} /><AccountingResourceBrowser resources={ledgerResources.periods} /></>}
      {legalEntityId && tab === 'setup' && <><div className="flex justify-end">{selector(setupAction, setSetupAction, setupConfigs)}</div><FinanceActionForm key={setupAction} title={setupConfigs[setupAction].title} fields={setupConfigs[setupAction].fields} onSubmit={setupConfigs[setupAction].submit} /><AccountingResourceBrowser resources={ledgerResources.setup} /></>}
    </div>
  );
}
