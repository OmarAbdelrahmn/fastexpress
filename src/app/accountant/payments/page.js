'use client';

import { ActionButton, DataTable, EmptyState, ErrorState, LoadingState, MetricCard, PageHeader, Panel, StatusBadge } from '@/components/accounting/AccountingUi';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { RefreshCw, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiErrorMessage, collectionItems, collectionMeta, controlClass, enumName, formatMoney, selectedLocale } from '../imports/_shared/accountingWorkspaceUtils';

const BATCH_STATUSES = ['', 'Prepared', 'Exported', 'Sent', 'Confirmed', 'PartiallyRejected', 'Rejected', 'Reversed'];
const PAYMENT_METHODS = ['', 'Bank', 'Cash', 'Hold', 'Mixed'];
const COPY = {
  ar: { eyebrow: 'المدفوعات', title: 'دفعات سداد الرواتب', description: 'تابع الدفعات المجهزة، صدّر ملفات البنوك، ثم أكّد التسوية والترحيل.', refresh: 'تحديث', requiredEntity: 'اختر كياناً قانونياً أولاً.', register: 'سجل دفعات السداد', registerDescription: 'تُنشأ الدفعة من مسير رواتب معتمد، ولا يُرحّل السداد حتى التأكيد.', search: 'بحث برقم الدفعة', allStatuses: 'كل الحالات', allMethods: 'كل طرق الدفع', loadError: 'تعذر تحميل دفعات السداد.', empty: 'لا توجد دفعات مطابقة.', batch: 'رقم الدفعة', payroll: 'مسير الرواتب', method: 'طريقة الدفع', lines: 'السطور', amount: 'المبلغ', confirmedAmount: 'المؤكد', status: 'الحالة', open: 'فتح', total: 'إجمالي الدفعات', prepared: 'مجهزة', confirmed: 'مؤكدة', next: 'التالي', previous: 'السابق' },
  en: { eyebrow: 'Payments', title: 'Payroll payment batches', description: 'Track prepared batches, export bank files, and confirm settlement posting.', refresh: 'Refresh', requiredEntity: 'Select a legal entity first.', register: 'Payment batch register', registerDescription: 'Batches originate from approved payroll. Settlement is posted only when confirmed.', search: 'Search batch number', allStatuses: 'All statuses', allMethods: 'All payment methods', loadError: 'Payment batches could not be loaded.', empty: 'No matching payment batches.', batch: 'Batch number', payroll: 'Payroll run', method: 'Payment method', lines: 'Lines', amount: 'Amount', confirmedAmount: 'Confirmed', status: 'Status', open: 'Open', total: 'Total batches', prepared: 'Prepared', confirmed: 'Confirmed', next: 'Next', previous: 'Previous' },
};

export default function PaymentBatchesPage() {
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const [batches, setBatches] = useState([]);
  const [meta, setMeta] = useState(collectionMeta([]));
  const [filters, setFilters] = useState({ search: '', status: '', method: '', pageNumber: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!legalEntityId) { setLoading(false); return; }
    setLoading(true); setError('');
    try { const payload = await accountingApi.payments.list({ legalEntityId: Number(legalEntityId), search: filters.search || undefined, status: filters.status || undefined, method: filters.method || undefined, pageNumber: filters.pageNumber, pageSize: 25 }); setBatches(collectionItems(payload)); setMeta(collectionMeta(payload)); }
    catch (requestError) { setBatches([]); setError(apiErrorMessage(requestError, copy.loadError)); }
    finally { setLoading(false); }
  }, [copy.loadError, filters.method, filters.pageNumber, filters.search, filters.status, legalEntityId]);
  useEffect(() => { const timer = setTimeout(load, filters.search ? 250 : 0); return () => clearTimeout(timer); }, [load, filters.search]);
  const statusOf = (item) => enumName(item.status, BATCH_STATUSES);
  const columns = [
    { key: 'batchNumber', header: copy.batch, render: (item) => <div><Link className="font-bold text-blue-700 hover:underline" href={`/accountant/payments/${item.id}`} dir="ltr">{item.batchNumber || item.id}</Link><div className="mt-1 max-w-44 truncate font-mono text-xs text-slate-500" dir="ltr">{item.id}</div></div> },
    { key: 'riderPayrollRunId', header: copy.payroll, render: (item) => <Link href={`/accountant/payroll/${item.riderPayrollRunId}`} className="font-mono text-xs text-blue-700 hover:underline" dir="ltr">{item.riderPayrollRunId}</Link> },
    { key: 'method', header: copy.method, render: (item) => enumName(item.method, PAYMENT_METHODS) },
    { key: 'lines', header: copy.lines, align: 'end', render: (item) => collectionItems(item.lines).length },
    { key: 'amount', header: copy.amount, align: 'end', render: (item) => formatMoney(collectionItems(item.lines).reduce((sum, line) => sum + Number(line.amount || 0), 0), locale) },
    { key: 'confirmed', header: copy.confirmedAmount, align: 'end', render: (item) => formatMoney(collectionItems(item.lines).filter((line) => line.isConfirmed).reduce((sum, line) => sum + Number(line.amount || 0), 0), locale) },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={statusOf(item)} /> },
    { key: 'action', header: '', render: (item) => <Link className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50" href={`/accountant/payments/${item.id}`}>{copy.open}</Link> },
  ];
  const counts = useMemo(() => ({ prepared: batches.filter((item) => statusOf(item) === 'Prepared').length, confirmed: batches.filter((item) => statusOf(item) === 'Confirmed').length }), [batches]);
  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}><PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton>} />{!legalEntityId ? <EmptyState icon={WalletCards} title={copy.requiredEntity} /> : <><section className="grid gap-3 sm:grid-cols-3"><MetricCard label={copy.total} value={meta.totalCount} icon={WalletCards} /><MetricCard label={copy.prepared} value={counts.prepared} /><MetricCard label={copy.confirmed} value={counts.confirmed} tone="success" /></section><Panel title={copy.register} description={copy.registerDescription}><div className="mb-4 grid gap-3 md:grid-cols-3"><input className={controlClass} type="search" placeholder={copy.search} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, pageNumber: 1 }))} /><select className={controlClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, pageNumber: 1 }))}><option value="">{copy.allStatuses}</option>{BATCH_STATUSES.slice(1).map((status, index) => <option key={status} value={index + 1}>{status}</option>)}</select><select className={controlClass} value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value, pageNumber: 1 }))}><option value="">{copy.allMethods}</option>{PAYMENT_METHODS.slice(1).map((method, index) => <option key={method} value={index + 1}>{method}</option>)}</select></div>{loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : batches.length === 0 ? <EmptyState icon={WalletCards} title={copy.empty} /> : <DataTable columns={columns} data={batches} rowKey="id" getRowHref={(item) => `/accountant/payments/${item.id}`} />}{!loading && !error && meta.totalPages > 1 && <div className="mt-4 flex items-center justify-end gap-2"><ActionButton variant="secondary" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))}>{copy.previous}</ActionButton><span className="text-sm tabular-nums text-slate-500">{meta.pageNumber} / {meta.totalPages}</span><ActionButton variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}>{copy.next}</ActionButton></div>}</Panel></>}</div>;
}
