'use client';

import {
  ActionButton,
  ConfirmDialog,
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
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, RefreshCw, UserRoundCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiErrorMessage,
  callApi,
  collectionItems,
  controlClass,
  enumName,
  formatDate,
  formatMoney,
  isPendingStatus,
  selectedLocale,
  textAreaClass,
} from '../_shared/accountingWorkspaceUtils';

const IMPORT_STATUSES = ['', 'Received', 'Parsing', 'NeedsResolution', 'Reconciled', 'Approved', 'Rejected', 'Superseded', 'Failed'];

const COPY = {
  ar: {
    eyebrow: 'مراجعة الاستيراد', back: 'دفعات الاستيراد', refresh: 'تحديث', download: 'تنزيل المصدر', approve: 'اعتماد', reject: 'رفض', platform: 'حساب المنصة',
    loadError: 'تعذر تحميل تفاصيل دفعة الاستيراد.', actionError: 'تعذر إكمال العملية.', source: 'المصدر', period: 'الفترة', totals: 'مطابقة الإجماليات', sourceTotal: 'إجمالي المصدر', normalizedTotal: 'الإجمالي الموحّد', sheets: 'الأوراق', rows: 'الصفوف', facts: 'الحقائق', blocking: 'ملاحظات مانعة',
    issuesTitle: 'الملاحظات والمطابقة', issuesDescription: 'يجب معالجة كل ملاحظة مانعة قبل اعتماد الدفعة.', noIssues: 'لا توجد ملاحظات على هذه الدفعة.', severity: 'الأهمية', code: 'الرمز', message: 'الرسالة', status: 'الحالة', sourceRow: 'صف المصدر', resolve: 'معالجة', resolution: 'شرح المعالجة', waive: 'تجاوز الملاحظة بسبب موثق', saveResolution: 'حفظ المعالجة',
    remapTitle: 'ربط معرّف عامل بسائق', remapDescription: 'أنشئ ربطاً مؤرخاً مع الحفاظ على معرّف المنصة الأصلي.', externalWorker: 'معرّف العامل الخارجي', riderIqama: 'رقم إقامة السائق', effectiveFrom: 'ساري من', effectiveTo: 'ساري إلى', reason: 'السبب', remap: 'حفظ الربط',
    factsTitle: 'الحقائق الموحّدة', noFacts: 'لا توجد حقائق متاحة للعرض.', rider: 'السائق', metric: 'المؤشر', value: 'القيمة', date: 'التاريخ', valid: 'الصلاحية', override: 'تعديل الصلاحية', true: 'صالح', false: 'غير صالح', saveOverride: 'حفظ التعديل',
    approveTitle: 'اعتماد دفعة الاستيراد؟', approveDescription: 'الاعتماد يثبت الحقائق للاستخدام في احتساب الرواتب، لكنه لا ينشئ راتباً أو قيداً.', approveConfirm: 'اعتماد الدفعة', rejectTitle: 'رفض دفعة الاستيراد؟', rejectDescription: 'لن تُستخدم حقائق هذه الدفعة في الرواتب. سيبقى المصدر محفوظاً للمراجعة.', rejectConfirm: 'رفض الدفعة', cancel: 'إلغاء', processing: 'المعالجة مستمرة؛ ستتحدث الصفحة تلقائياً.', rawRows: 'عينة صفوف المصدر', sheet: 'الورقة', rowNumber: 'رقم الصف', rawData: 'البيانات الأصلية',
  },
  en: {
    eyebrow: 'Import review', back: 'Import batches', refresh: 'Refresh', download: 'Download source', approve: 'Approve', reject: 'Reject', platform: 'Platform account',
    loadError: 'The import batch could not be loaded.', actionError: 'The action could not be completed.', source: 'Source', period: 'Period', totals: 'Control-total match', sourceTotal: 'Source total', normalizedTotal: 'Normalized total', sheets: 'Sheets', rows: 'Rows', facts: 'Facts', blocking: 'Blocking issues',
    issuesTitle: 'Issues and reconciliation', issuesDescription: 'Every blocking issue must be resolved before approval.', noIssues: 'This batch has no recorded issues.', severity: 'Severity', code: 'Code', message: 'Message', status: 'Status', sourceRow: 'Source row', resolve: 'Resolve', resolution: 'Resolution explanation', waive: 'Waive with documented reason', saveResolution: 'Save resolution',
    remapTitle: 'Map an external worker to a rider', remapDescription: 'Create an effective-dated identity mapping while preserving the source platform ID.', externalWorker: 'External worker ID', riderIqama: 'Rider Iqama', effectiveFrom: 'Effective from', effectiveTo: 'Effective to', reason: 'Reason', remap: 'Save mapping',
    factsTitle: 'Normalized facts', noFacts: 'No facts are available for display.', rider: 'Rider', metric: 'Metric', value: 'Value', date: 'Date', valid: 'Validity', override: 'Override validity', true: 'Valid', false: 'Invalid', saveOverride: 'Save override',
    approveTitle: 'Approve this import batch?', approveDescription: 'Approval makes these facts eligible for payroll calculation. It does not create payroll or a journal entry.', approveConfirm: 'Approve batch', rejectTitle: 'Reject this import batch?', rejectDescription: 'The batch facts will not be used for payroll. The source remains preserved for review.', rejectConfirm: 'Reject batch', cancel: 'Cancel', processing: 'Processing is still running; this page refreshes automatically.', rawRows: 'Source-row sample', sheet: 'Sheet', rowNumber: 'Row', rawData: 'Raw data',
  },
};

export default function ImportBatchDetailPage() {
  const params = useParams();
  const batchId = String(params.id);
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [batch, setBatch] = useState(null);
  const [issues, setIssues] = useState([]);
  const [facts, setFacts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmAction, setConfirmAction] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolution, setResolution] = useState({ text: '', waive: false });
  const [remap, setRemap] = useState({ externalWorkerId: '', riderIqamaNo: '', effectiveFrom: '', effectiveTo: '', reason: '' });
  const [selectedFact, setSelectedFact] = useState(null);
  const [validity, setValidity] = useState({ isValid: true, reason: '' });

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const [batchPayload, issuePayload, factPayload, rowPayload] = await Promise.all([
        callApi(accountingApi.imports, ['getBatch', 'get'], batchId),
        callApi(accountingApi.imports, ['getIssues', 'listIssues'], batchId),
        accountingApi.imports.getFacts(batchId, { pageNumber: 1, pageSize: 200 }),
        accountingApi.imports.getRows(batchId, { pageNumber: 1, pageSize: 50 }),
      ]);
      setBatch(batchPayload);
      setIssues(collectionItems(issuePayload));
      setFacts(collectionItems(factPayload));
      setRows(collectionItems(rowPayload));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, copy.loadError));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [batchId, copy.loadError]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!batch || !isPendingStatus(batch.status)) return undefined;
    const timer = setTimeout(() => load({ quiet: true }), 5000);
    return () => clearTimeout(timer);
  }, [batch, load]);

  const runAction = async (name, task) => {
    if (busy) return;
    setBusy(name);
    setActionError('');
    try {
      await task();
      await load({ quiet: true });
      return true;
    } catch (requestError) {
      setActionError(apiErrorMessage(requestError, copy.actionError));
      return false;
    } finally {
      setBusy('');
    }
  };

  const resolveIssue = async (event) => {
    event.preventDefault();
    const ok = await runAction('issue', () => callApi(accountingApi.imports, ['resolveIssue'], selectedIssue.id, { resolution: resolution.text.trim(), waive: resolution.waive }));
    if (ok) { setSelectedIssue(null); setResolution({ text: '', waive: false }); }
  };

  const remapWorker = async (event) => {
    event.preventDefault();
    const ok = await runAction('remap', () => callApi(accountingApi.imports, ['remapWorker'], batchId, {
      externalWorkerId: remap.externalWorkerId.trim(), riderIqamaNo: Number(remap.riderIqamaNo), effectiveFrom: remap.effectiveFrom,
      effectiveTo: remap.effectiveTo || null, reason: remap.reason.trim(),
    }));
    if (ok) setRemap({ externalWorkerId: '', riderIqamaNo: '', effectiveFrom: '', effectiveTo: '', reason: '' });
  };

  const overrideValidity = async (event) => {
    event.preventDefault();
    const ok = await runAction('validity', () => callApi(accountingApi.imports, ['overrideFactValidity', 'overrideValidity'], selectedFact.id, validity));
    if (ok) { setSelectedFact(null); setValidity({ isValid: true, reason: '' }); }
  };

  const review = async () => {
    const action = confirmAction;
    const ok = await runAction(action, () => callApi(accountingApi.imports, [action], batchId, { comment: null }));
    if (ok) setConfirmAction('');
  };

  const download = () => runAction('download', async () => {
    const file = await callApi(accountingApi.imports, ['downloadSourceFile', 'download', 'downloadFile'], batchId);
    if (!file?.blob || typeof window === 'undefined') return;
    const url = window.URL.createObjectURL(file.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.fileName || `platform-import-${batchId}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  });

  const issueColumns = [
    { key: 'severity', header: copy.severity, render: (item) => <StatusBadge status={item.severity} /> },
    { key: 'code', header: copy.code, render: (item) => <span className="font-mono text-xs" dir="ltr">{item.code}</span> },
    { key: 'message', header: copy.message, render: (item) => <span className="whitespace-normal leading-6">{item.message}</span> },
    { key: 'sourceRawRowId', header: copy.sourceRow, render: (item) => item.sourceRawRowId || '—' },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status} /> },
    { key: 'action', header: '', render: (item) => item.status === 'Open' ? <ActionButton size="sm" variant="secondary" onClick={() => { setSelectedIssue(item); setResolution({ text: item.resolution || '', waive: false }); }}>{copy.resolve}</ActionButton> : null },
  ];

  const factColumns = [
    { key: 'externalWorkerId', header: copy.externalWorker, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.externalWorkerId || '—'}</span> },
    { key: 'riderIqamaNo', header: copy.rider, render: (item) => <span dir="ltr">{item.riderIqamaNo || '—'}</span> },
    { key: 'metricCode', header: copy.metric, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.metricCode}</span> },
    { key: 'value', header: copy.value, render: (item) => item.numericValue ?? item.textValue ?? (item.booleanValue == null ? '—' : String(item.booleanValue)) },
    { key: 'factDate', header: copy.date, render: (item) => formatDate(item.factDate, locale) },
    { key: 'resolved', header: copy.status, render: (item) => <StatusBadge status={item.isResolved ? 'Resolved' : 'Open'} /> },
    { key: 'action', header: '', render: (item) => String(item.metricCode).toUpperCase() === 'VALIDITY' ? <ActionButton size="sm" variant="secondary" onClick={() => { setSelectedFact(item); setValidity({ isValid: item.override?.booleanValue ?? item.booleanValue ?? true, reason: '' }); }}>{copy.override}</ActionButton> : null },
  ];

  const rowColumns = [
    { key: 'sheetName', header: copy.sheet, render: (item) => item.sheetName || item.sheet || '—' },
    { key: 'rowNumber', header: copy.rowNumber, align: 'end', render: (item) => item.rowNumber ?? item.sourceRowNumber ?? '—' },
    { key: 'externalWorkerId', header: copy.externalWorker, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.externalWorkerId || '—'}</span> },
    { key: 'rawData', header: copy.rawData, render: (item) => <span dir="ltr" className="block max-w-xl truncate font-mono text-xs" title={typeof (item.rawValuesJson || item.cellsJson || item.rawJson) === 'string' ? (item.rawValuesJson || item.cellsJson || item.rawJson) : undefined}>{typeof (item.rawValuesJson || item.cellsJson || item.rawJson) === 'string' ? (item.rawValuesJson || item.cellsJson || item.rawJson) : JSON.stringify(item.values || item.cells || {})}</span> },
  ];

  const batchStatus = enumName(batch?.status, IMPORT_STATUSES);

  const totalsMatch = useMemo(() => {
    if (!batch?.sourceControlTotal || batch?.normalizedControlTotal == null) return '—';
    return Number(batch.sourceControlTotal) === Number(batch.normalizedControlTotal) ? '✓' : '≠';
  }, [batch]);

  if (loading) return <LoadingState />;
  if (error || !batch) return <ErrorState description={error || copy.loadError} onRetry={load} />;

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={batch.externalReference || batch.id}
        description={`${formatDate(batch.periodStart, locale)} — ${formatDate(batch.periodEnd, locale)}`}
        meta={<StatusBadge status={batchStatus} />}
        actions={(
          <div className="flex flex-wrap gap-2">
            <Link href="/accountant/imports" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BackIcon size={17} />{copy.back}</Link>
            <ActionButton variant="secondary" icon={RefreshCw} onClick={() => load()}>{copy.refresh}</ActionButton>
            <ActionButton variant="secondary" icon={Download} loading={busy === 'download'} onClick={download}>{copy.download}</ActionButton>
            {batchStatus === 'Reconciled' && <ActionButton icon={CheckCircle2} onClick={() => setConfirmAction('approve')}>{copy.approve}</ActionButton>}
            {!['Approved', 'Rejected', 'Superseded'].includes(batchStatus) && <ActionButton variant="danger" icon={XCircle} onClick={() => setConfirmAction('reject')}>{copy.reject}</ActionButton>}
          </div>
        )}
      />

      {isPendingStatus(batch.status) && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">{copy.processing}</div>}
      {actionError && <ErrorState description={actionError} compact />}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label={copy.sourceTotal} value={formatMoney(batch.sourceControlTotal, locale)} />
        <MetricCard label={copy.normalizedTotal} value={formatMoney(batch.normalizedControlTotal, locale)} />
        <MetricCard label={copy.totals} value={totalsMatch} tone={totalsMatch === '✓' ? 'success' : 'warning'} />
        <MetricCard label={copy.facts} value={Number(batch.factCount || 0).toLocaleString(locale)} />
        <MetricCard label={copy.blocking} value={batch.openBlockingIssueCount || 0} tone={batch.openBlockingIssueCount ? 'danger' : 'success'} />
      </section>

      <Panel title={copy.source}>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div><dt className="text-slate-500">{copy.platform}</dt><dd className="mt-1 font-semibold">{batch.platformName || batch.platformAccountId}</dd></div>
          <div><dt className="text-slate-500">{copy.sheets}</dt><dd className="mt-1 font-semibold tabular-nums">{batch.sheetCount || 0}</dd></div>
          <div><dt className="text-slate-500">{copy.rows}</dt><dd className="mt-1 font-semibold tabular-nums">{batch.rawRowCount || 0}</dd></div>
          <div><dt className="text-slate-500">{copy.status}</dt><dd className="mt-1"><StatusBadge status={batchStatus} /></dd></div>
        </dl>
      </Panel>

      <Panel title={copy.issuesTitle} description={copy.issuesDescription}>
        {issues.length === 0 ? <EmptyState icon={CheckCircle2} title={copy.noIssues} compact /> : <DataTable columns={issueColumns} data={issues} rowKey="id" />}
        {selectedIssue && (
          <form className="mt-5 grid gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 lg:grid-cols-[1fr_auto]" onSubmit={resolveIssue}>
            <FormField label={copy.resolution} required><textarea className={textAreaClass} required value={resolution.text} onChange={(event) => setResolution((current) => ({ ...current, text: event.target.value }))} /></FormField>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={resolution.waive} onChange={(event) => setResolution((current) => ({ ...current, waive: event.target.checked }))} />{copy.waive}</label>
              <ActionButton type="submit" loading={busy === 'issue'}>{copy.saveResolution}</ActionButton>
            </div>
          </form>
        )}
      </Panel>

      <Panel title={copy.remapTitle} description={copy.remapDescription}>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6" onSubmit={remapWorker}>
          <FormField label={copy.externalWorker} required><input className={controlClass} dir="ltr" required value={remap.externalWorkerId} onChange={(event) => setRemap((current) => ({ ...current, externalWorkerId: event.target.value }))} /></FormField>
          <FormField label={copy.riderIqama} required><input className={controlClass} dir="ltr" inputMode="numeric" required value={remap.riderIqamaNo} onChange={(event) => setRemap((current) => ({ ...current, riderIqamaNo: event.target.value }))} /></FormField>
          <FormField label={copy.effectiveFrom} required><input className={controlClass} type="date" required value={remap.effectiveFrom} onChange={(event) => setRemap((current) => ({ ...current, effectiveFrom: event.target.value }))} /></FormField>
          <FormField label={copy.effectiveTo}><input className={controlClass} type="date" min={remap.effectiveFrom} value={remap.effectiveTo} onChange={(event) => setRemap((current) => ({ ...current, effectiveTo: event.target.value }))} /></FormField>
          <FormField label={copy.reason} required><input className={controlClass} required value={remap.reason} onChange={(event) => setRemap((current) => ({ ...current, reason: event.target.value }))} /></FormField>
          <div className="flex items-end"><ActionButton className="w-full" type="submit" icon={UserRoundCheck} loading={busy === 'remap'}>{copy.remap}</ActionButton></div>
        </form>
      </Panel>

      <Panel title={copy.factsTitle}>
        {facts.length === 0 ? <EmptyState icon={AlertTriangle} title={copy.noFacts} compact /> : <DataTable columns={factColumns} data={facts} rowKey="id" />}
        {selectedFact && (
          <form className="mt-5 grid gap-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 md:grid-cols-[12rem_1fr_auto]" onSubmit={overrideValidity}>
            <FormField label={copy.valid} required><select className={controlClass} value={String(validity.isValid)} onChange={(event) => setValidity((current) => ({ ...current, isValid: event.target.value === 'true' }))}><option value="true">{copy.true}</option><option value="false">{copy.false}</option></select></FormField>
            <FormField label={copy.reason} required><input className={controlClass} required value={validity.reason} onChange={(event) => setValidity((current) => ({ ...current, reason: event.target.value }))} /></FormField>
            <div className="flex items-end"><ActionButton type="submit" loading={busy === 'validity'}>{copy.saveOverride}</ActionButton></div>
          </form>
        )}
      </Panel>

      <Panel title={copy.rawRows}>
        <DataTable columns={rowColumns} data={rows} rowKey={(item, index) => item.id || `${item.sheetName || 'sheet'}-${item.rowNumber || index}`} />
      </Panel>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction === 'approve' ? copy.approveTitle : copy.rejectTitle}
        description={confirmAction === 'approve' ? copy.approveDescription : copy.rejectDescription}
        confirmLabel={confirmAction === 'approve' ? copy.approveConfirm : copy.rejectConfirm}
        cancelLabel={copy.cancel}
        tone={confirmAction === 'approve' ? 'primary' : 'danger'}
        loading={busy === confirmAction}
        onConfirm={review}
        onCancel={() => setConfirmAction('')}
      />
    </div>
  );
}
