'use client';

import {
  ActionButton, ConfirmDialog, DataTable, EmptyState, ErrorState, FormField,
  LoadingState, MetricCard, PageHeader, Panel, StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, CreditCard, Plus, RefreshCw, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  apiErrorMessage, collectionItems, enumName, formatDate, formatMoney,
  newCorrelationId, parseNumericIds, selectedLocale, todayIso,
} from '../../imports/_shared/accountingWorkspaceUtils';

const PAYROLL_STATUSES = ['', 'Draft', 'Calculated', 'Approved', 'PaymentPrepared', 'PartiallyPaid', 'Paid', 'Held', 'Reversed'];
const COMPONENT_SOURCES = ['', 'Policy', 'FinancialItem', 'Adjustment', 'CarryForward'];
const COMPONENT_TYPES = ['', 'Earning', 'Allowance', 'Bonus', 'Deduction', 'Informational'];
const PAYMENT_METHODS = ['', 'Bank', 'Cash', 'Hold', 'Mixed'];

const COPY = {
  ar: {
    eyebrow: 'تفاصيل مسير الرواتب', back: 'مسيرات الرواتب', refresh: 'تحديث', loadError: 'تعذر تحميل المسير.', actionError: 'تعذر إكمال الإجراء.', period: 'الفترة', riders: 'السائقون', gross: 'الاستحقاق', deductions: 'الاستقطاع', carried: 'مرحّل', net: 'الصافي', accrual: 'مستند الاستحقاق', calculate: 'احتساب المسير', calculating: 'جاري الاحتساب…',
    linesTitle: 'سطور السائقين', linesDescription: 'النتيجة مبنية على الحقائق المعتمدة ونسخ السياسات المحفوظة.', noLines: 'لا توجد سطور بعد. احتسب المسير أولاً.', iqama: 'رقم الإقامة', rider: 'السائق', held: 'موقوف', details: 'المكوّنات', components: 'مكوّنات راتب', source: 'المصدر', type: 'النوع', code: 'الرمز', description: 'الوصف', quantity: 'الكمية', rate: 'المعدل', amount: 'المبلغ', automatic: 'تلقائي', yes: 'نعم', no: 'لا',
    adjustment: 'إضافة تسوية', adjustmentDescription: 'المبلغ الموجب يزيد الراتب والسالب يخفضه. يُحفظ السبب والدليل مع الأثر.', reason: 'السبب', notes: 'ملاحظات', evidence: 'معرّف ملف الدليل', addAdjustment: 'حفظ التسوية',
    approval: 'اعتماد المسير', approvalDescription: 'يُنشئ الاعتماد مستند استحقاق مالي. استخدم مفتاحاً فريداً لمنع الترحيل المكرر.', postingProfile: 'رمز ملف الترحيل', correlation: 'معرّف التتبع', idempotency: 'مفتاح عدم التكرار', approve: 'اعتماد المسير', approveTitle: 'اعتماد المسير وإنشاء الاستحقاق؟', approveConfirm: 'اعتماد نهائي',
    reverse: 'عكس المسير', reversalDate: 'تاريخ العكس', reverseTitle: 'عكس هذا المسير؟', reverseDescription: 'سينشئ الخادم مستنداً عكسياً ويعيد أرصدة العناصر والأقساط ذرياً.', reverseConfirm: 'عكس نهائي',
    payment: 'تجهيز دفعة سداد', paymentDescription: 'اختر كل السطور، سائقين محددين، أو تخصيصات مباشرة.', method: 'طريقة الدفع', scope: 'نطاق الدفع', allLines: 'كل السطور المستحقة', selectedRiders: 'سائقون محددون', allocations: 'تخصيصات صريحة', riderIds: 'أرقام الإقامة مفصولة بفاصلة', prepare: 'تجهيز الدفعة', cancel: 'إلغاء',
  },
  en: {
    eyebrow: 'Payroll run detail', back: 'Payroll runs', refresh: 'Refresh', loadError: 'The payroll run could not be loaded.', actionError: 'The action could not be completed.', period: 'Period', riders: 'Riders', gross: 'Gross earnings', deductions: 'Deductions', carried: 'Carried forward', net: 'Net pay', accrual: 'Accrual document', calculate: 'Calculate run', calculating: 'Calculating…',
    linesTitle: 'Rider payroll lines', linesDescription: 'Results are based on approved facts and snapshotted policy versions.', noLines: 'No rider lines yet. Calculate the run first.', iqama: 'Iqama', rider: 'Rider', held: 'Held', details: 'Components', components: 'Payroll components', source: 'Source', type: 'Type', code: 'Code', description: 'Description', quantity: 'Quantity', rate: 'Rate', amount: 'Amount', automatic: 'Automatic', yes: 'Yes', no: 'No',
    adjustment: 'Add adjustment', adjustmentDescription: 'A positive amount increases pay and a negative amount reduces it. Reason and evidence remain in the audit trail.', reason: 'Reason', notes: 'Notes', evidence: 'Evidence file ID', addAdjustment: 'Save adjustment',
    approval: 'Approve payroll run', approvalDescription: 'Approval creates the accrual financial document. Use a unique key to prevent duplicate posting.', postingProfile: 'Posting profile code', correlation: 'Correlation ID', idempotency: 'Idempotency key', approve: 'Approve run', approveTitle: 'Approve this run and create its accrual?', approveConfirm: 'Final approval',
    reverse: 'Reverse payroll run', reversalDate: 'Reversal date', reverseTitle: 'Reverse this payroll run?', reverseDescription: 'The server creates a reversal document and restores items, installments, and balances atomically.', reverseConfirm: 'Final reversal',
    payment: 'Prepare payment batch', paymentDescription: 'Select all eligible lines, specific riders, or explicit allocations.', method: 'Payment method', scope: 'Payment scope', allLines: 'All eligible lines', selectedRiders: 'Selected riders', allocations: 'Explicit allocations', riderIds: 'Comma-separated Iqama numbers', prepare: 'Prepare batch', cancel: 'Cancel',
  },
};

export default function PayrollRunDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const runId = String(id);
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [run, setRun] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmAction, setConfirmAction] = useState('');
  const [adjustment, setAdjustment] = useState({ riderIqamaNo: '', amount: '', reason: '', notes: '', evidenceFileId: '' });
  const [approveForm, setApproveForm] = useState({ postingProfileCode: 'PAYROLL-ACCRUAL', correlationId: newCorrelationId('payroll'), idempotencyKey: newCorrelationId('approve') });
  const [reverseForm, setReverseForm] = useState({ reversalDate: todayIso(), reason: '', correlationId: newCorrelationId('payroll-reversal'), idempotencyKey: newCorrelationId('reverse') });
  const [batchForm, setBatchForm] = useState({ method: '1', scope: 'all', riderIqamaNumbers: '', allocations: [{ riderIqamaNo: '', amount: '', method: '1' }] });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRun(await accountingApi.payroll.getRun(runId)); }
    catch (requestError) { setError(apiErrorMessage(requestError, copy.loadError)); }
    finally { setLoading(false); }
  }, [copy.loadError, runId]);
  useEffect(() => { load(); }, [load]);

  const runAction = async (name, task, { reload = true } = {}) => {
    if (busy) return null;
    setBusy(name); setActionError('');
    try { const result = await task(); if (reload) await load(); return result; }
    catch (requestError) { setActionError(apiErrorMessage(requestError, copy.actionError)); return null; }
    finally { setBusy(''); }
  };

  const calculate = () => runAction('calculate', () => accountingApi.payroll.calculateRun(runId, { rowVersion: run.rowVersion }));
  const addAdjustment = async (event) => {
    event.preventDefault();
    const result = await runAction('adjustment', () => accountingApi.payroll.addAdjustment(runId, { riderIqamaNo: Number(adjustment.riderIqamaNo), amount: Number(adjustment.amount), reason: adjustment.reason.trim(), notes: adjustment.notes.trim() || null, evidenceFileId: adjustment.evidenceFileId.trim() || null }));
    if (result) setAdjustment({ riderIqamaNo: '', amount: '', reason: '', notes: '', evidenceFileId: '' });
  };
  const confirmLifecycle = async () => {
    const action = confirmAction;
    const form = action === 'approve' ? approveForm : reverseForm;
    const payload = action === 'approve'
      ? { postingProfileCode: form.postingProfileCode.trim(), correlationId: form.correlationId.trim(), idempotencyKey: form.idempotencyKey.trim(), rowVersion: run.rowVersion }
      : { reversalDate: form.reversalDate, reason: form.reason.trim(), correlationId: form.correlationId.trim(), idempotencyKey: form.idempotencyKey.trim(), rowVersion: run.rowVersion };
    const result = await runAction(action, () => action === 'approve' ? accountingApi.payroll.approveRun(runId, payload) : accountingApi.payroll.reverseRun(runId, payload));
    if (result) setConfirmAction('');
  };
  const prepareBatch = async (event) => {
    event.preventDefault();
    const payload = {
      method: Number(batchForm.method),
      riderIqamaNumbers: batchForm.scope === 'riders' ? parseNumericIds(batchForm.riderIqamaNumbers) : null,
      allocations: batchForm.scope === 'allocations' ? batchForm.allocations.map((item) => ({ riderIqamaNo: Number(item.riderIqamaNo), amount: Number(item.amount), method: Number(item.method) })) : null,
    };
    const result = await runAction('payment', () => accountingApi.payments.createBatch(runId, payload), { reload: false });
    if (result?.id) router.push(`/accountant/payments/${result.id}`);
  };

  const status = enumName(run?.status, PAYROLL_STATUSES);
  const currency = run?.currencyCode || 'SAR';
  const lineColumns = [
    { key: 'riderIqamaNo', header: copy.iqama, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.riderIqamaNo}</span> },
    { key: 'riderName', header: copy.rider },
    { key: 'grossEarnings', header: copy.gross, align: 'end', render: (item) => formatMoney(item.grossEarnings, locale, currency) },
    { key: 'appliedDeductions', header: copy.deductions, align: 'end', render: (item) => formatMoney(item.appliedDeductions, locale, currency) },
    { key: 'carriedDeductions', header: copy.carried, align: 'end', render: (item) => formatMoney(item.carriedDeductions, locale, currency) },
    { key: 'netPay', header: copy.net, align: 'end', render: (item) => <span className="font-bold">{formatMoney(item.netPay, locale, currency)}</span> },
    { key: 'isHeld', header: copy.held, render: (item) => item.isHeld ? <StatusBadge status="Held" label={item.holdReason || copy.yes} /> : <span>{copy.no}</span> },
    { key: 'action', header: '', render: (item) => <ActionButton size="sm" variant="secondary" onClick={() => setSelectedLine(item)}>{copy.details}</ActionButton> },
  ];
  const componentColumns = [
    { key: 'source', header: copy.source, render: (item) => enumName(item.source, COMPONENT_SOURCES) },
    { key: 'componentType', header: copy.type, render: (item) => enumName(item.componentType, COMPONENT_TYPES) },
    { key: 'code', header: copy.code, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.code}</span> },
    { key: 'description', header: copy.description },
    { key: 'quantity', header: copy.quantity, align: 'end' },
    { key: 'rate', header: copy.rate, align: 'end', render: (item) => formatMoney(item.rate, locale, currency) },
    { key: 'amount', header: copy.amount, align: 'end', render: (item) => formatMoney(item.amount, locale, currency) },
    { key: 'isAutomatic', header: copy.automatic, render: (item) => item.isAutomatic ? copy.yes : copy.no },
  ];

  if (loading) return <LoadingState />;
  if (error || !run) return <ErrorState description={error || copy.loadError} onRetry={load} />;

  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
    <PageHeader eyebrow={copy.eyebrow} title={run.runNumber || run.id} description={`${formatDate(run.periodStart, locale)} — ${formatDate(run.periodEnd, locale)}`} meta={<StatusBadge status={status} />} actions={<div className="flex flex-wrap gap-2"><Link href="/accountant/payroll" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BackIcon size={17} />{copy.back}</Link><ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton>{status === 'Draft' && <ActionButton icon={Calculator} loading={busy === 'calculate'} loadingLabel={copy.calculating} onClick={calculate}>{copy.calculate}</ActionButton>}</div>} />
    {actionError && <ErrorState description={actionError} compact />}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><MetricCard label={copy.riders} value={collectionItems(run.lines).length} /><MetricCard label={copy.gross} value={formatMoney(run.grossEarnings, locale, currency)} /><MetricCard label={copy.deductions} value={formatMoney(run.appliedDeductions, locale, currency)} tone="warning" /><MetricCard label={copy.carried} value={formatMoney(run.carriedDeductions, locale, currency)} /><MetricCard label={copy.net} value={formatMoney(run.netPay, locale, currency)} tone="success" /></section>
    {run.accrualFinancialDocumentId && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm"><span className="font-bold text-emerald-950">{copy.accrual}: </span><span dir="ltr" className="font-mono text-emerald-800">{run.accrualFinancialDocumentId}</span></div>}

    <Panel title={copy.linesTitle} description={copy.linesDescription}><DataTable columns={lineColumns} data={collectionItems(run.lines)} rowKey="id" emptyTitle={copy.noLines} /></Panel>
    {selectedLine && <Panel title={`${copy.components}: ${selectedLine.riderName}`} actions={<ActionButton variant="ghost" size="sm" onClick={() => setSelectedLine(null)}>{copy.cancel}</ActionButton>}><DataTable columns={componentColumns} data={collectionItems(selectedLine.components)} rowKey="id" /></Panel>}

    {!['Approved', 'PaymentPrepared', 'PartiallyPaid', 'Paid', 'Reversed'].includes(status) && <Panel title={copy.adjustment} description={copy.adjustmentDescription}>
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6" onSubmit={addAdjustment}>
        <FormField label={copy.iqama} required><input dir="ltr" inputMode="numeric" required value={adjustment.riderIqamaNo} onChange={(event) => setAdjustment((current) => ({ ...current, riderIqamaNo: event.target.value }))} /></FormField>
        <FormField label={copy.amount} required><input type="number" step="0.01" required value={adjustment.amount} onChange={(event) => setAdjustment((current) => ({ ...current, amount: event.target.value }))} /></FormField>
        <FormField label={copy.reason} required><input required maxLength={200} value={adjustment.reason} onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))} /></FormField>
        <FormField label={copy.notes}><input maxLength={500} value={adjustment.notes} onChange={(event) => setAdjustment((current) => ({ ...current, notes: event.target.value }))} /></FormField>
        <FormField label={copy.evidence}><input dir="ltr" value={adjustment.evidenceFileId} onChange={(event) => setAdjustment((current) => ({ ...current, evidenceFileId: event.target.value }))} /></FormField>
        <div className="flex items-end"><ActionButton className="w-full" type="submit" icon={Plus} loading={busy === 'adjustment'}>{copy.addAdjustment}</ActionButton></div>
      </form>
    </Panel>}

    {status === 'Calculated' && <Panel title={copy.approval} description={copy.approvalDescription}>
      <form className="grid gap-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); setConfirmAction('approve'); }}>
        <FormField label={copy.postingProfile} required><input dir="ltr" required value={approveForm.postingProfileCode} onChange={(event) => setApproveForm((current) => ({ ...current, postingProfileCode: event.target.value }))} /></FormField>
        <FormField label={copy.correlation} required><input dir="ltr" required value={approveForm.correlationId} onChange={(event) => setApproveForm((current) => ({ ...current, correlationId: event.target.value }))} /></FormField>
        <FormField label={copy.idempotency} required><input dir="ltr" required value={approveForm.idempotencyKey} onChange={(event) => setApproveForm((current) => ({ ...current, idempotencyKey: event.target.value }))} /></FormField>
        <div className="md:col-span-3 flex justify-end"><ActionButton type="submit" icon={CheckCircle2}>{copy.approve}</ActionButton></div>
      </form>
    </Panel>}

    {['Approved', 'PaymentPrepared', 'PartiallyPaid', 'Held'].includes(status) && <Panel title={copy.reverse}>
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); setConfirmAction('reverse'); }}>
        <FormField label={copy.reversalDate} required><input type="date" required value={reverseForm.reversalDate} onChange={(event) => setReverseForm((current) => ({ ...current, reversalDate: event.target.value }))} /></FormField>
        <FormField label={copy.reason} required><input required value={reverseForm.reason} onChange={(event) => setReverseForm((current) => ({ ...current, reason: event.target.value }))} /></FormField>
        <FormField label={copy.correlation} required><input dir="ltr" required value={reverseForm.correlationId} onChange={(event) => setReverseForm((current) => ({ ...current, correlationId: event.target.value }))} /></FormField>
        <FormField label={copy.idempotency} required><input dir="ltr" required value={reverseForm.idempotencyKey} onChange={(event) => setReverseForm((current) => ({ ...current, idempotencyKey: event.target.value }))} /></FormField>
        <div className="xl:col-span-4 flex justify-end"><ActionButton variant="danger" type="submit" icon={RotateCcw}>{copy.reverse}</ActionButton></div>
      </form>
    </Panel>}

    {['Approved', 'PaymentPrepared', 'PartiallyPaid', 'Held'].includes(status) && <Panel title={copy.payment} description={copy.paymentDescription}>
      <form className="space-y-4" onSubmit={prepareBatch}>
        <div className="grid gap-4 md:grid-cols-2"><FormField label={copy.method} required><select value={batchForm.method} onChange={(event) => setBatchForm((current) => ({ ...current, method: event.target.value }))}>{PAYMENT_METHODS.slice(1).map((method, index) => <option key={method} value={index + 1}>{method}</option>)}</select></FormField><FormField label={copy.scope} required><select value={batchForm.scope} onChange={(event) => setBatchForm((current) => ({ ...current, scope: event.target.value }))}><option value="all">{copy.allLines}</option><option value="riders">{copy.selectedRiders}</option><option value="allocations">{copy.allocations}</option></select></FormField></div>
        {batchForm.scope === 'riders' && <FormField label={copy.riderIds} required><textarea required dir="ltr" value={batchForm.riderIqamaNumbers} onChange={(event) => setBatchForm((current) => ({ ...current, riderIqamaNumbers: event.target.value }))} /></FormField>}
        {batchForm.scope === 'allocations' && <div className="space-y-3">{batchForm.allocations.map((allocation, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"><FormField label={copy.iqama} required><input dir="ltr" inputMode="numeric" required value={allocation.riderIqamaNo} onChange={(event) => setBatchForm((current) => ({ ...current, allocations: current.allocations.map((item, itemIndex) => itemIndex === index ? { ...item, riderIqamaNo: event.target.value } : item) }))} /></FormField><FormField label={copy.amount} required><input type="number" min="0.01" step="0.01" required value={allocation.amount} onChange={(event) => setBatchForm((current) => ({ ...current, allocations: current.allocations.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item) }))} /></FormField><FormField label={copy.method} required><select value={allocation.method} onChange={(event) => setBatchForm((current) => ({ ...current, allocations: current.allocations.map((item, itemIndex) => itemIndex === index ? { ...item, method: event.target.value } : item) }))}>{PAYMENT_METHODS.slice(1).map((method, methodIndex) => <option key={method} value={methodIndex + 1}>{method}</option>)}</select></FormField><div className="flex items-end"><ActionButton variant="ghost" disabled={batchForm.allocations.length === 1} onClick={() => setBatchForm((current) => ({ ...current, allocations: current.allocations.filter((_, itemIndex) => itemIndex !== index) }))}>{copy.cancel}</ActionButton></div></div>)}<ActionButton variant="secondary" size="sm" icon={Plus} onClick={() => setBatchForm((current) => ({ ...current, allocations: [...current.allocations, { riderIqamaNo: '', amount: '', method: current.method }] }))}>{copy.allocations}</ActionButton></div>}
        <div className="flex justify-end"><ActionButton type="submit" icon={CreditCard} loading={busy === 'payment'}>{copy.prepare}</ActionButton></div>
      </form>
    </Panel>}

    <ConfirmDialog open={Boolean(confirmAction)} title={confirmAction === 'approve' ? copy.approveTitle : copy.reverseTitle} description={confirmAction === 'approve' ? copy.approvalDescription : copy.reverseDescription} confirmLabel={confirmAction === 'approve' ? copy.approveConfirm : copy.reverseConfirm} cancelLabel={copy.cancel} tone={confirmAction === 'approve' ? 'primary' : 'danger'} loading={busy === confirmAction} onConfirm={confirmLifecycle} onCancel={() => setConfirmAction('')} />
  </div>;
}
