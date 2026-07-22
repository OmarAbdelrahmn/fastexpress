'use client';

import { ActionButton, DataTable, EmptyState, ErrorState, LoadingState, MetricCard, PageHeader, Panel, StatusBadge } from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { Banknote, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiErrorMessage, collectionItems, collectionMeta, controlClass, enumName, formatMoney, selectedLocale } from '@/app/accountant/imports/_shared/accountingWorkspaceUtils';
import { useExactMember } from './_shared/useExactMember';

const BATCH_STATUSES = ['', 'Prepared', 'Exported', 'Sent', 'Confirmed', 'PartiallyRejected', 'Rejected', 'Reversed'];
const COPY = {
  ar: { eyebrow: 'تسليم النقد', title: 'دفعات السكن النقدية', description: 'تأكد من السائق والمبلغ، ثم أكّد السطور التي سلّمتها فعلياً. تظهر فقط الدفعات المصرح بها لسكنك.', refresh: 'تحديث', accessDenied: 'هذه الشاشة مخصصة لحساب Member فقط.', register: 'صندوق التسليم', search: 'بحث برقم الدفعة', allStatuses: 'كل الحالات', loadError: 'تعذر تحميل دفعات السكن.', empty: 'لا توجد دفعات نقدية مطلوبة لسكنك.', batch: 'رقم الدفعة', lines: 'السطور', pendingLines: 'غير مسلّمة', amount: 'المبلغ', housing: 'السكن', status: 'الحالة', open: 'فتح', total: 'الدفعات', pending: 'دفعات قيد التسليم', delivered: 'دفعات مكتملة', next: 'التالي', previous: 'السابق' },
  en: { eyebrow: 'Cash delivery', title: 'Housing cash batches', description: 'Verify the rider and amount, then confirm only the lines actually handed over. Only batches authorized for your housing are shown.', refresh: 'Refresh', accessDenied: 'This screen is restricted to the exact Member role.', register: 'Delivery inbox', search: 'Search batch number', allStatuses: 'All statuses', loadError: 'Housing cash batches could not be loaded.', empty: 'No cash batches currently require action for your housing.', batch: 'Batch number', lines: 'Lines', pendingLines: 'Not delivered', amount: 'Amount', housing: 'Housing', status: 'Status', open: 'Open', total: 'Batches', pending: 'Pending delivery', delivered: 'Completed batches', next: 'Next', previous: 'Previous' },
};

export default function CashDeliveryInboxPage() {
  const access = useExactMember();
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const [batches, setBatches] = useState([]);
  const [meta, setMeta] = useState(collectionMeta([]));
  const [filters, setFilters] = useState({ search: '', status: '', pageNumber: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!access.allowed) { setLoading(false); return; }
    setLoading(true); setError('');
    try { const payload = await accountingApi.cashDelivery.inbox({ search: filters.search || undefined, status: filters.status || undefined, pageNumber: filters.pageNumber, pageSize: 25 }); setBatches(collectionItems(payload)); setMeta(collectionMeta(payload)); }
    catch (requestError) { setBatches([]); setError(apiErrorMessage(requestError, copy.loadError)); }
    finally { setLoading(false); }
  }, [access.allowed, copy.loadError, filters.pageNumber, filters.search, filters.status]);
  useEffect(() => { const timer = setTimeout(load, filters.search ? 250 : 0); return () => clearTimeout(timer); }, [load, filters.search]);
  const statusOf = (item) => enumName(item.status, BATCH_STATUSES);
  const columns = [{ key: 'batchNumber', header: copy.batch, render: (item) => <Link className="font-bold text-blue-700 hover:underline" href={`/member/cash-delivery/${item.id}`} dir="ltr">{item.batchNumber || item.id}</Link> }, { key: 'lines', header: copy.lines, align: 'end', render: (item) => collectionItems(item.lines).length }, { key: 'pending', header: copy.pendingLines, align: 'end', render: (item) => collectionItems(item.lines).filter((line) => !line.isConfirmed).length }, { key: 'amount', header: copy.amount, align: 'end', render: (item) => formatMoney(collectionItems(item.lines).reduce((sum, line) => sum + Number(line.amount || 0), 0), locale) }, { key: 'housing', header: copy.housing, render: (item) => [...new Set(collectionItems(item.lines).map((line) => line.housingId).filter(Boolean))].join(', ') || '—' }, { key: 'status', header: copy.status, render: (item) => <StatusBadge status={statusOf(item)} /> }, { key: 'action', header: '', render: (item) => <Link className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50" href={`/member/cash-delivery/${item.id}`}>{copy.open}</Link> }];
  const counts = useMemo(() => ({ pending: batches.filter((item) => collectionItems(item.lines).some((line) => !line.isConfirmed)).length, delivered: batches.filter((item) => collectionItems(item.lines).every((line) => line.isConfirmed)).length }), [batches]);
  if (access.checking) return <LoadingState />;
  if (!access.allowed) return <ErrorState description={copy.accessDenied} />;
  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}><PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton>} /><section className="grid gap-3 sm:grid-cols-3"><MetricCard label={copy.total} value={meta.totalCount} icon={Banknote} /><MetricCard label={copy.pending} value={counts.pending} tone="warning" /><MetricCard label={copy.delivered} value={counts.delivered} tone="success" /></section><Panel title={copy.register}><div className="mb-4 grid gap-3 sm:grid-cols-2"><input className={controlClass} type="search" placeholder={copy.search} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, pageNumber: 1 }))} /><select className={controlClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, pageNumber: 1 }))}><option value="">{copy.allStatuses}</option>{BATCH_STATUSES.slice(1).map((status, index) => <option key={status} value={index + 1}>{status}</option>)}</select></div>{loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : batches.length === 0 ? <EmptyState icon={Banknote} title={copy.empty} /> : <DataTable columns={columns} data={batches} rowKey="id" getRowHref={(item) => `/member/cash-delivery/${item.id}`} />}{!loading && !error && meta.totalPages > 1 && <div className="mt-4 flex items-center justify-end gap-2"><ActionButton variant="secondary" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))}>{copy.previous}</ActionButton><span className="text-sm tabular-nums text-slate-500">{meta.pageNumber} / {meta.totalPages}</span><ActionButton variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}>{copy.next}</ActionButton></div>}</Panel></div>;
}
