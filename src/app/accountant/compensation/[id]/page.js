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
import { ArrowLeft, ArrowRight, CheckCircle2, CopyPlus, Play, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiErrorMessage,
  collectionItems,
  currentMonthRange,
  enumName,
  formatDate,
  formatMoney,
  selectedLocale,
} from '../../imports/_shared/accountingWorkspaceUtils';

const POLICY_STATUSES = ['', 'Draft', 'Active', 'Retired'];
const RULE_TEMPLATES = ['', 'FixedAmount', 'PerUnit', 'Threshold', 'TieredBasePlusExcess', 'Percentage', 'Range', 'Cap', 'Floor', 'EligibilityCondition'];
const COMPONENT_TYPES = ['', 'Earning', 'Allowance', 'Bonus', 'Deduction', 'Informational'];

const COPY = {
  ar: {
    eyebrow: 'تفاصيل السياسة', back: 'سياسات التعويض', refresh: 'تحديث', loadError: 'تعذر تحميل السياسة.', actionError: 'تعذر إكمال الإجراء.', version: 'الإصدار', platform: 'حساب المنصة', category: 'فئة العامل', effective: 'السريان', rulesCount: 'عدد القواعد',
    rules: 'القواعد المحفوظة', rulesDescription: 'هذه القواعد غير قابلة للتغيير بعد تفعيل النسخة.', code: 'الرمز', name: 'الاسم', template: 'نمط الحساب', component: 'المكوّن', metric: 'المؤشر', priority: 'الأولوية', emptyRules: 'لا توجد قواعد في هذه النسخة.',
    simulate: 'محاكاة السياسة', simulateDescription: 'أدخل قيم المؤشات لمعاينة النتيجة دون حفظ راتب.', metricCode: 'رمز المؤشر', value: 'القيمة', addMetric: 'إضافة مؤشر', removeMetric: 'حذف المؤشر', runSimulation: 'تشغيل المحاكاة', earnings: 'الإجمالي المستحق', deductions: 'الاستقطاعات', net: 'الصافي', quantity: 'الكمية', rate: 'المعدل', amount: 'المبلغ', selected: 'مطبقة', explanation: 'التوضيح', conflicts: 'تعارضات المحاكاة', noResult: 'شغّل المحاكاة لرؤية النتيجة.', yes: 'نعم', no: 'لا',
    lifecycle: 'إدارة النسخة', activate: 'تفعيل النسخة', activateTitle: 'تفعيل هذه السياسة؟', activateDescription: 'ستصبح هذه النسخة معتمدة للفترة المحددة وسيتحقق الخادم من عدم التداخل.', retire: 'إيقاف النسخة', retireTitle: 'إيقاف هذه السياسة؟', retireDescription: 'سيمنع إيقافها استخدامها في احتسابات مستقبلية، مع بقاء الأثر التاريخي.', confirm: 'تأكيد', cancel: 'إلغاء', newVersion: 'إنشاء نسخة جديدة', newVersionDescription: 'انسخ هذه القواعد إلى مسودة بفترة سريان جديدة.', from: 'ساري من', to: 'ساري إلى', createVersion: 'إنشاء النسخة',
  },
  en: {
    eyebrow: 'Policy detail', back: 'Compensation policies', refresh: 'Refresh', loadError: 'The policy could not be loaded.', actionError: 'The action could not be completed.', version: 'Version', platform: 'Platform account', category: 'Worker category', effective: 'Effective dates', rulesCount: 'Rules',
    rules: 'Stored rules', rulesDescription: 'Rules are immutable after this version is activated.', code: 'Code', name: 'Name', template: 'Calculation template', component: 'Component', metric: 'Metric', priority: 'Priority', emptyRules: 'This version has no rules.',
    simulate: 'Simulate policy', simulateDescription: 'Enter metric values to preview the result without creating payroll.', metricCode: 'Metric code', value: 'Value', addMetric: 'Add metric', removeMetric: 'Remove metric', runSimulation: 'Run simulation', earnings: 'Total earnings', deductions: 'Deductions', net: 'Net amount', quantity: 'Quantity', rate: 'Rate', amount: 'Amount', selected: 'Applied', explanation: 'Explanation', conflicts: 'Simulation conflicts', noResult: 'Run a simulation to see results.', yes: 'Yes', no: 'No',
    lifecycle: 'Version management', activate: 'Activate version', activateTitle: 'Activate this policy?', activateDescription: 'This version becomes authoritative for its effective period. The server will reject overlapping active policies.', retire: 'Retire version', retireTitle: 'Retire this policy?', retireDescription: 'Retiring prevents future calculations from selecting it while preserving historical payroll lineage.', confirm: 'Confirm', cancel: 'Cancel', newVersion: 'Create a new version', newVersionDescription: 'Copy these immutable rules into a draft with a new effective range.', from: 'Effective from', to: 'Effective to', createVersion: 'Create version',
  },
};

export default function CompensationPolicyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const policyId = String(id);
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const month = useMemo(() => currentMonthRange(), []);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmAction, setConfirmAction] = useState('');
  const [metrics, setMetrics] = useState([{ code: 'accepted_orders', value: '500' }, { code: 'workdays', value: '26' }]);
  const [simulation, setSimulation] = useState(null);
  const [versionForm, setVersionForm] = useState({ effectiveFrom: month.start, effectiveTo: '' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setPolicy(await accountingApi.compensation.getPolicy(policyId)); }
    catch (requestError) { setError(apiErrorMessage(requestError, copy.loadError)); }
    finally { setLoading(false); }
  }, [copy.loadError, policyId]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (name, task, { reload = true } = {}) => {
    if (busy) return null;
    setBusy(name); setActionError('');
    try {
      const result = await task();
      if (reload) await load();
      return result;
    } catch (requestError) {
      setActionError(apiErrorMessage(requestError, copy.actionError));
      return null;
    } finally { setBusy(''); }
  };

  const simulate = async (event) => {
    event.preventDefault();
    const dictionary = Object.fromEntries(metrics.filter((item) => item.code.trim()).map((item) => [item.code.trim(), Number(item.value)]));
    const result = await runAction('simulate', () => accountingApi.compensation.simulatePolicy(policyId, { metrics: dictionary }), { reload: false });
    if (result) setSimulation(result);
  };

  const confirmLifecycle = async () => {
    const action = confirmAction;
    const result = await runAction(action, () => action === 'activate'
      ? accountingApi.compensation.activatePolicy(policyId, { rowVersion: policy.rowVersion })
      : accountingApi.compensation.retire(policyId, { rowVersion: policy.rowVersion, comment: null }));
    if (result !== null) setConfirmAction('');
  };

  const createVersion = async (event) => {
    event.preventDefault();
    const created = await runAction('version', () => accountingApi.compensation.createVersion(policyId, { effectiveFrom: versionForm.effectiveFrom, effectiveTo: versionForm.effectiveTo || null }), { reload: false });
    if (created?.id) router.push(`/accountant/compensation/${created.id}`);
  };

  const status = enumName(policy?.status, POLICY_STATUSES);
  const componentColumns = [
    { key: 'ruleCode', header: copy.code, render: (item) => <span className="font-mono text-xs" dir="ltr">{item.ruleCode}</span> },
    { key: 'ruleName', header: copy.name },
    { key: 'quantity', header: copy.quantity, align: 'end' },
    { key: 'rate', header: copy.rate, align: 'end', render: (item) => formatMoney(item.rate, locale) },
    { key: 'amount', header: copy.amount, align: 'end', render: (item) => formatMoney(item.amount, locale) },
    { key: 'selected', header: copy.selected, render: (item) => <StatusBadge status={item.selected ? 'Active' : 'Inactive'} label={item.selected ? copy.yes : copy.no} /> },
    { key: 'explanation', header: copy.explanation, render: (item) => <span className="whitespace-normal leading-6">{item.explanation}</span> },
  ];
  const ruleColumns = [
    { key: 'code', header: copy.code, render: (item) => <span className="font-mono text-xs font-semibold" dir="ltr">{item.code}</span> },
    { key: 'name', header: copy.name },
    { key: 'template', header: copy.template, render: (item) => enumName(item.template, RULE_TEMPLATES).replace(/([a-z])([A-Z])/g, '$1 $2') },
    { key: 'componentType', header: copy.component, render: (item) => enumName(item.componentType, COMPONENT_TYPES) },
    { key: 'metricCode', header: copy.metric, render: (item) => <span className="font-mono text-xs" dir="ltr">{item.metricCode}</span> },
    { key: 'priority', header: copy.priority, align: 'end' },
  ];

  if (loading) return <LoadingState />;
  if (error || !policy) return <ErrorState description={error || copy.loadError} onRetry={load} />;

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={copy.eyebrow} title={policy.name} description={<span dir="ltr">{policy.code}</span>} meta={<StatusBadge status={status} />} actions={<div className="flex flex-wrap gap-2"><Link href="/accountant/compensation" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BackIcon size={17} />{copy.back}</Link><ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton></div>} />
      {actionError && <ErrorState description={actionError} compact />}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={copy.version} value={policy.version} />
        <MetricCard label={copy.platform} value={policy.platformName || policy.platformAccountId} />
        <MetricCard label={copy.category} value={policy.workerCategory} />
        <MetricCard label={copy.rulesCount} value={collectionItems(policy.rules).length} icon={CheckCircle2} />
      </section>

      <Panel title={copy.rules} description={`${copy.rulesDescription} ${formatDate(policy.effectiveFrom, locale)} — ${formatDate(policy.effectiveTo, locale)}`}>
        <DataTable columns={ruleColumns} data={collectionItems(policy.rules)} rowKey="id" emptyTitle={copy.emptyRules} />
      </Panel>

      <Panel title={copy.simulate} description={copy.simulateDescription}>
        <form className="space-y-4" onSubmit={simulate}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((item, index) => <div key={index} className="grid grid-cols-[1fr_9rem_auto] items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><FormField label={copy.metricCode} required><input required dir="ltr" value={item.code} onChange={(event) => setMetrics((current) => current.map((metric, metricIndex) => metricIndex === index ? { ...metric, code: event.target.value } : metric))} /></FormField><FormField label={copy.value} required><input required type="number" step="any" value={item.value} onChange={(event) => setMetrics((current) => current.map((metric, metricIndex) => metricIndex === index ? { ...metric, value: event.target.value } : metric))} /></FormField><ActionButton variant="ghost" size="icon" icon={Trash2} aria-label={copy.removeMetric} disabled={metrics.length === 1} onClick={() => setMetrics((current) => current.filter((_, metricIndex) => metricIndex !== index))} /></div>)}
          </div>
          <div className="flex flex-wrap justify-end gap-2"><ActionButton variant="secondary" icon={CopyPlus} onClick={() => setMetrics((current) => [...current, { code: '', value: '' }])}>{copy.addMetric}</ActionButton><ActionButton type="submit" icon={Play} loading={busy === 'simulate'}>{copy.runSimulation}</ActionButton></div>
        </form>
        <div className="mt-5 border-t border-slate-200 pt-5">
          {!simulation ? <EmptyState title={copy.noResult} compact /> : <div className="space-y-4"><section className="grid gap-3 sm:grid-cols-3"><MetricCard label={copy.earnings} value={formatMoney(simulation.totalEarnings, locale)} tone="success" /><MetricCard label={copy.deductions} value={formatMoney(simulation.totalDeductions, locale)} tone="warning" /><MetricCard label={copy.net} value={formatMoney(simulation.netAmount, locale)} /></section><DataTable columns={componentColumns} data={collectionItems(simulation.components)} rowKey={(item, index) => item.ruleId || index} />{collectionItems(simulation.conflicts).length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-bold text-amber-950">{copy.conflicts}</h3><ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-amber-900">{collectionItems(simulation.conflicts).map((conflict, index) => <li key={index}>{conflict}</li>)}</ul></div>}</div>}
        </div>
      </Panel>

      <Panel title={copy.lifecycle} actions={<div className="flex flex-wrap gap-2">{status === 'Draft' && <ActionButton icon={CheckCircle2} onClick={() => setConfirmAction('activate')}>{copy.activate}</ActionButton>}{status !== 'Retired' && <ActionButton variant="danger" onClick={() => setConfirmAction('retire')}>{copy.retire}</ActionButton>}</div>}>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={createVersion}>
          <FormField label={copy.from} required><input type="date" required value={versionForm.effectiveFrom} onChange={(event) => setVersionForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></FormField>
          <FormField label={copy.to}><input type="date" min={versionForm.effectiveFrom} value={versionForm.effectiveTo} onChange={(event) => setVersionForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></FormField>
          <div className="flex items-end"><ActionButton type="submit" variant="secondary" icon={CopyPlus} loading={busy === 'version'}>{copy.createVersion}</ActionButton></div>
        </form>
        <p className="mt-3 text-sm text-slate-500">{copy.newVersionDescription}</p>
      </Panel>

      <ConfirmDialog open={Boolean(confirmAction)} title={confirmAction === 'activate' ? copy.activateTitle : copy.retireTitle} description={confirmAction === 'activate' ? copy.activateDescription : copy.retireDescription} confirmLabel={copy.confirm} cancelLabel={copy.cancel} tone={confirmAction === 'activate' ? 'primary' : 'danger'} loading={busy === confirmAction} onConfirm={confirmLifecycle} onCancel={() => setConfirmAction('')} />
    </div>
  );
}
