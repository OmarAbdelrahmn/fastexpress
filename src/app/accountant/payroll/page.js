'use client';

import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorState,
  FormField,
  LoadingState,
  MetricCard,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { CircleDollarSign, RefreshCw, UserRoundSearch, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiErrorMessage,
  collectionItems,
  collectionMeta,
  controlClass,
  currentMonthRange,
  enumName,
  formatDate,
  formatMoney,
  selectedLocale,
} from '../imports/_shared/accountingWorkspaceUtils';

const PAYROLL_STATUSES = ['', 'Draft', 'Calculated', 'Approved', 'PaymentPrepared', 'PartiallyPaid', 'Paid', 'Held', 'Reversed'];

const COPY = {
  ar: {
    eyebrow: 'الرواتب', title: 'مسيرات رواتب السائقين', description: 'احتسب الراتب من الحقائق المعتمدة، راجع السطور، ثم اعتمد وجهّز السداد.', refresh: 'تحديث', riderFinance: 'الملفات المالية للسائقين', payments: 'دفعات السداد', requiredEntity: 'اختر كياناً قانونياً أولاً.',
    createTitle: 'مسير جديد', createDescription: 'يبدأ المسير كمسودة؛ الإنشاء لا يحتسب أو يرحّل أي مبلغ.', from: 'بداية الفترة', to: 'نهاية الفترة', currency: 'العملة', create: 'إنشاء مسير مسودة', creating: 'جاري الإنشاء…', createError: 'تعذر إنشاء المسير.',
    register: 'سجل المسيرات', registerDescription: 'افتح المسير للاحتساب، التسويات، الاعتماد، وتجهيز الدفع.', search: 'بحث برقم المسير', allStatuses: 'كل الحالات', loadError: 'تعذر تحميل مسيرات الرواتب.', empty: 'لا توجد مسيرات مطابقة.', runNumber: 'رقم المسير', period: 'الفترة', gross: 'الاستحقاق', deductions: 'الاستقطاع', net: 'الصافي', lines: 'السائقون', status: 'الحالة', open: 'فتح', total: 'إجمالي المسيرات', ready: 'المحتسبة', paid: 'المدفوعة', next: 'التالي', previous: 'السابق',
  },
  en: {
    eyebrow: 'Payroll', title: 'Rider payroll runs', description: 'Calculate from approved facts, review rider lines, approve accruals, and prepare settlement.', refresh: 'Refresh', riderFinance: 'Rider financial profiles', payments: 'Payment batches', requiredEntity: 'Select a legal entity first.',
    createTitle: 'New payroll run', createDescription: 'A new run starts as a draft; creating it does not calculate or post any amount.', from: 'Period start', to: 'Period end', currency: 'Currency', create: 'Create draft run', creating: 'Creating…', createError: 'The payroll run could not be created.',
    register: 'Payroll register', registerDescription: 'Open a run to calculate, adjust, approve, and prepare payments.', search: 'Search run number', allStatuses: 'All statuses', loadError: 'Payroll runs could not be loaded.', empty: 'No matching payroll runs.', runNumber: 'Run number', period: 'Period', gross: 'Gross earnings', deductions: 'Deductions', net: 'Net pay', lines: 'Riders', status: 'Status', open: 'Open', total: 'Total runs', ready: 'Calculated', paid: 'Paid', next: 'Next', previous: 'Previous',
  },
};

export default function PayrollRunsPage() {
  const router = useRouter();
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const month = useMemo(() => currentMonthRange(), []);
  const [runs, setRuns] = useState([]);
  const [meta, setMeta] = useState(collectionMeta([]));
  const [filters, setFilters] = useState({ search: '', status: '', pageNumber: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ periodStart: month.start, periodEnd: month.end, currencyCode: 'SAR' });

  const load = useCallback(async () => {
    if (!legalEntityId) { setRuns([]); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const payload = await accountingApi.payroll.listRuns({ legalEntityId: Number(legalEntityId), search: filters.search || undefined, status: filters.status || undefined, pageNumber: filters.pageNumber, pageSize: 25 });
      setRuns(collectionItems(payload)); setMeta(collectionMeta(payload));
    } catch (requestError) { setRuns([]); setError(apiErrorMessage(requestError, copy.loadError)); }
    finally { setLoading(false); }
  }, [copy.loadError, filters.pageNumber, filters.search, filters.status, legalEntityId]);

  useEffect(() => { const timer = setTimeout(load, filters.search ? 250 : 0); return () => clearTimeout(timer); }, [load, filters.search]);

  const createRun = async (event) => {
    event.preventDefault(); if (!legalEntityId || creating) return;
    setCreating(true); setFormError('');
    try {
      const created = await accountingApi.payroll.createRun({ legalEntityId: Number(legalEntityId), periodStart: form.periodStart, periodEnd: form.periodEnd, currencyCode: form.currencyCode.trim().toUpperCase() });
      router.push(`/accountant/payroll/${created.id}`);
    } catch (requestError) { setFormError(apiErrorMessage(requestError, copy.createError)); setCreating(false); }
  };

  const statusOf = (item) => enumName(item.status, PAYROLL_STATUSES);
  const columns = [
    { key: 'runNumber', header: copy.runNumber, render: (item) => <div><Link href={`/accountant/payroll/${item.id}`} className="font-bold text-blue-700 hover:underline" dir="ltr">{item.runNumber || item.id}</Link><div className="mt-1 max-w-48 truncate font-mono text-xs text-slate-500" dir="ltr">{item.id}</div></div> },
    { key: 'periodStart', header: copy.period, render: (item) => `${formatDate(item.periodStart, locale)} — ${formatDate(item.periodEnd, locale)}` },
    { key: 'grossEarnings', header: copy.gross, align: 'end', render: (item) => formatMoney(item.grossEarnings, locale, item.currencyCode || 'SAR') },
    { key: 'appliedDeductions', header: copy.deductions, align: 'end', render: (item) => formatMoney(item.appliedDeductions, locale, item.currencyCode || 'SAR') },
    { key: 'netPay', header: copy.net, align: 'end', render: (item) => <span className="font-bold">{formatMoney(item.netPay, locale, item.currencyCode || 'SAR')}</span> },
    { key: 'lines', header: copy.lines, align: 'end', render: (item) => collectionItems(item.lines).length },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={statusOf(item)} /> },
    { key: 'action', header: '', render: (item) => <Link className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50" href={`/accountant/payroll/${item.id}`}>{copy.open}</Link> },
  ];
  const calculated = runs.filter((item) => statusOf(item) === 'Calculated').length;
  const paid = runs.filter((item) => statusOf(item) === 'Paid').length;

  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
    <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<div className="flex flex-wrap gap-2"><Link href="/accountant/payroll/rider-finance" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserRoundSearch size={17} />{copy.riderFinance}</Link><Link href="/accountant/payments" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><WalletCards size={17} />{copy.payments}</Link><ActionButton variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>{copy.refresh}</ActionButton></div>} />
    {!legalEntityId ? <EmptyState icon={CircleDollarSign} title={copy.requiredEntity} /> : <>
      <section className="grid gap-3 sm:grid-cols-3"><MetricCard label={copy.total} value={meta.totalCount} icon={CircleDollarSign} /><MetricCard label={copy.ready} value={calculated} /><MetricCard label={copy.paid} value={paid} tone="success" /></section>
      <Panel title={copy.createTitle} description={copy.createDescription}>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_10rem_auto]" onSubmit={createRun}>
          <FormField label={copy.from} required><input type="date" required value={form.periodStart} onChange={(event) => setForm((current) => ({ ...current, periodStart: event.target.value }))} /></FormField>
          <FormField label={copy.to} required><input type="date" min={form.periodStart} required value={form.periodEnd} onChange={(event) => setForm((current) => ({ ...current, periodEnd: event.target.value }))} /></FormField>
          <FormField label={copy.currency} required><input dir="ltr" minLength={3} maxLength={3} required value={form.currencyCode} onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value }))} /></FormField>
          <div className="flex items-end"><ActionButton type="submit" loading={creating} loadingLabel={copy.creating}>{copy.create}</ActionButton></div>
          {formError && <div className="md:col-span-4"><ErrorState description={formError} compact /></div>}
        </form>
      </Panel>
      <Panel title={copy.register} description={copy.registerDescription}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl"><input className={controlClass} type="search" placeholder={copy.search} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, pageNumber: 1 }))} /><select className={controlClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, pageNumber: 1 }))}><option value="">{copy.allStatuses}</option>{PAYROLL_STATUSES.slice(1).map((status, index) => <option key={status} value={index + 1}>{status}</option>)}</select></div>
        {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : runs.length === 0 ? <EmptyState icon={CircleDollarSign} title={copy.empty} /> : <DataTable columns={columns} data={runs} rowKey="id" getRowHref={(item) => `/accountant/payroll/${item.id}`} />}
        {!loading && !error && meta.totalPages > 1 && <div className="mt-4 flex items-center justify-end gap-2"><ActionButton variant="secondary" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))}>{copy.previous}</ActionButton><span className="text-sm tabular-nums text-slate-500">{meta.pageNumber} / {meta.totalPages}</span><ActionButton variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}>{copy.next}</ActionButton></div>}
      </Panel>
    </>}
  </div>;
}
