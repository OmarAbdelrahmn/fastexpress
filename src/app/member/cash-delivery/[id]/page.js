'use client';

import { ActionButton, ConfirmDialog, DataTable, EmptyState, ErrorState, FormField, LoadingState, MetricCard, PageHeader, Panel, StatusBadge } from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiErrorMessage, collectionItems, enumName, formatMoney, newCorrelationId, selectedLocale, todayIso } from '@/app/accountant/imports/_shared/accountingWorkspaceUtils';
import { useExactMember } from '../_shared/useExactMember';

const BATCH_STATUSES = ['', 'Prepared', 'Exported', 'Sent', 'Confirmed', 'PartiallyRejected', 'Rejected', 'Reversed'];
const COPY = {
  ar: { eyebrow: 'تسليم نقدي', back: 'صندوق التسليم', refresh: 'تحديث', accessDenied: 'هذه الشاشة مخصصة لحساب Member فقط.', loadError: 'تعذر تحميل الدفعة.', actionError: 'تعذر تأكيد التسليم.', lines: 'سطور التسليم', linesDescription: 'حدد فقط السائقين الذين استلموا النقد فعلياً. لن يقبل الخادم أي سطر خارج نطاق سكنك.', iqama: 'رقم الإقامة', lineId: 'معرّف السطر', amount: 'المبلغ', housing: 'السكن', status: 'الحالة', selected: 'المحدد', pending: 'المتبقي', delivered: 'المسلّم', selectAll: 'تحديد كل المتاح', confirmTitle: 'تأكيد التسليم', settlementDate: 'تاريخ التسليم', postingProfile: 'ملف الترحيل', correlation: 'معرّف التتبع', idempotency: 'مفتاح عدم التكرار', notes: 'ملاحظات', confirm: 'تأكيد تسليم المحدد', confirmQuestion: 'هل سلّمت النقد لهؤلاء السائقين؟', confirmDescription: 'سيُرحّل السداد للسطور المحددة. لا تؤكد سطراً لم يستلمه السائق.', cancel: 'إلغاء', noLines: 'لا توجد سطور مصرح بها في هذه الدفعة.' },
  en: { eyebrow: 'Cash handover', back: 'Delivery inbox', refresh: 'Refresh', accessDenied: 'This screen is restricted to the exact Member role.', loadError: 'The cash batch could not be loaded.', actionError: 'Cash handover could not be confirmed.', lines: 'Delivery lines', linesDescription: 'Select only riders who actually received cash. The server rejects any line outside your authorized housing.', iqama: 'Iqama', lineId: 'Line ID', amount: 'Amount', housing: 'Housing', status: 'Status', selected: 'Selected', pending: 'Pending', delivered: 'Delivered', selectAll: 'Select all eligible', confirmTitle: 'Confirm handover', settlementDate: 'Handover date', postingProfile: 'Posting profile', correlation: 'Correlation ID', idempotency: 'Idempotency key', notes: 'Notes', confirm: 'Confirm selected handovers', confirmQuestion: 'Was cash handed to these riders?', confirmDescription: 'Settlement will be posted for the selected lines. Never confirm a rider who has not received cash.', cancel: 'Cancel', noLines: 'No authorized lines are available in this batch.' },
};

export default function CashDeliveryDetailPage() {
  const access = useExactMember();
  const { id } = useParams();
  const batchId = String(id);
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [batch, setBatch] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({ settlementDate: todayIso(), postingProfileCode: 'PAYROLL-CASH', correlationId: newCorrelationId('cash-delivery'), idempotencyKey: newCorrelationId('cash'), notes: '' });
  const load = useCallback(async () => { if (!access.allowed) { setLoading(false); return; } setLoading(true); setError(''); try { setBatch(await accountingApi.cashDelivery.getBatch(batchId)); } catch (requestError) { setError(apiErrorMessage(requestError, copy.loadError)); } finally { setLoading(false); } }, [access.allowed, batchId, copy.loadError]);
  useEffect(() => { load(); }, [load]);
  const lines = collectionItems(batch?.lines);
  const eligible = lines.filter((line) => !line.isConfirmed && !line.rejectionReason);
  const total = lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const selectedTotal = lines.filter((line) => selected.includes(line.id)).reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const toggle = (lineId) => setSelected((current) => current.includes(lineId) ? current.filter((idValue) => idValue !== lineId) : [...current, lineId]);
  const confirm = async () => { if (!selected.length || busy) return; setBusy(true); setError(''); try { await accountingApi.cashDelivery.confirmPaymentBatch(batchId, { settlementDate: form.settlementDate, postingProfileCode: form.postingProfileCode.trim(), idempotencyKey: form.idempotencyKey.trim(), correlationId: form.correlationId.trim(), lineIds: selected, notes: form.notes.trim() || null }); setSelected([]); setConfirmOpen(false); await load(); } catch (requestError) { setError(apiErrorMessage(requestError, copy.actionError)); } finally { setBusy(false); } };
  const columns = [{ key: 'selected', header: copy.selected, render: (item) => <input type="checkbox" className="h-5 w-5 accent-blue-700" aria-label={`${copy.selected} ${item.riderIqamaNo}`} disabled={item.isConfirmed || Boolean(item.rejectionReason)} checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /> }, { key: 'id', header: copy.lineId, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.id}</span> }, { key: 'riderIqamaNo', header: copy.iqama, render: (item) => <span dir="ltr" className="font-semibold">{item.riderIqamaNo}</span> }, { key: 'housingId', header: copy.housing }, { key: 'amount', header: copy.amount, align: 'end', render: (item) => <span className="font-bold">{formatMoney(item.amount, locale)}</span> }, { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.isConfirmed ? 'Confirmed' : item.rejectionReason ? 'Rejected' : 'Prepared'} label={item.rejectionReason || undefined} /> }];
  const status = enumName(batch?.status, BATCH_STATUSES);
  if (access.checking || loading) return <LoadingState />;
  if (!access.allowed) return <ErrorState description={copy.accessDenied} />;
  if (error && !batch) return <ErrorState description={error} onRetry={load} />;
  if (!batch) return <ErrorState description={copy.loadError} onRetry={load} />;
  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}><PageHeader eyebrow={copy.eyebrow} title={batch.batchNumber || batch.id} meta={<StatusBadge status={status} />} actions={<div className="flex gap-2"><Link href="/member/cash-delivery" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BackIcon size={17} />{copy.back}</Link><ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton></div>} />{error && <ErrorState description={error} compact />}<section className="grid gap-3 sm:grid-cols-4"><MetricCard label={copy.lines} value={lines.length} icon={Banknote} /><MetricCard label={copy.amount} value={formatMoney(total, locale)} /><MetricCard label={copy.pending} value={eligible.length} tone="warning" /><MetricCard label={copy.selected} value={formatMoney(selectedTotal, locale)} tone="success" /></section><Panel title={copy.lines} description={copy.linesDescription} actions={eligible.length > 0 && <ActionButton variant="secondary" size="sm" onClick={() => setSelected(selected.length === eligible.length ? [] : eligible.map((line) => line.id))}>{copy.selectAll}</ActionButton>}><DataTable columns={columns} data={lines} rowKey="id" emptyTitle={copy.noLines} /></Panel><Panel title={copy.confirmTitle}><form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={(event) => { event.preventDefault(); if (selected.length) setConfirmOpen(true); }}><FormField label={copy.settlementDate} required><input type="date" required value={form.settlementDate} onChange={(event) => setForm((current) => ({ ...current, settlementDate: event.target.value }))} /></FormField><FormField label={copy.postingProfile} required><input dir="ltr" required value={form.postingProfileCode} onChange={(event) => setForm((current) => ({ ...current, postingProfileCode: event.target.value }))} /></FormField><FormField label={copy.correlation} required><input dir="ltr" required value={form.correlationId} onChange={(event) => setForm((current) => ({ ...current, correlationId: event.target.value }))} /></FormField><FormField label={copy.idempotency} required><input dir="ltr" required value={form.idempotencyKey} onChange={(event) => setForm((current) => ({ ...current, idempotencyKey: event.target.value }))} /></FormField><FormField label={copy.notes}><input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></FormField><div className="xl:col-span-5 flex justify-end"><ActionButton type="submit" icon={CheckCircle2} disabled={!selected.length}>{copy.confirm}</ActionButton></div></form></Panel><ConfirmDialog open={confirmOpen} title={copy.confirmQuestion} description={copy.confirmDescription} confirmLabel={copy.confirm} cancelLabel={copy.cancel} tone="primary" loading={busy} onConfirm={confirm} onCancel={() => setConfirmOpen(false)} /></div>;
}
