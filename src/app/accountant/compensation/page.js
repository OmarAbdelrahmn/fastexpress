'use client';

import {
  ActionButton,
  ApiProblemDetails,
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
import { accountingOptionLabel, useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { Calculator, Layers3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiErrorMessage,
  callApi,
  collectionItems,
  collectionMeta,
  controlClass,
  currentMonthRange,
  enumName,
  formatDate,
  optionalNumber,
  selectedLocale,
} from '../imports/_shared/accountingWorkspaceUtils';

const POLICY_STATUSES = ['', 'Draft', 'Active', 'Retired'];
const RULE_TEMPLATES = ['', 'FixedAmount', 'PerUnit', 'Threshold', 'TieredBasePlusExcess', 'Percentage', 'Range', 'Cap', 'Floor', 'EligibilityCondition'];
const COMPONENT_TYPES = ['', 'Earning', 'Allowance', 'Bonus', 'Deduction', 'Informational'];
const STACKING_MODES = ['', 'ExclusiveHighest', 'Cumulative'];
const METRIC_OPTIONS = [
  { value: 'ACCEPTED_ORDERS', arLabel: 'الطلبات المقبولة', enLabel: 'Accepted orders' },
  { value: 'WORK_DAYS', arLabel: 'أيام العمل', enLabel: 'Work days' },
  { value: 'BASE_AMOUNT', arLabel: 'المبلغ الأساسي', enLabel: 'Base amount' },
  { value: 'INCENTIVES', arLabel: 'الحوافز', enLabel: 'Incentives' },
  { value: 'PENALTIES', arLabel: 'الجزاءات', enLabel: 'Penalties' },
  { value: 'VALIDITY', arLabel: 'حالة الاستحقاق', enLabel: 'Eligibility status' },
];

const COPY = {
  ar: {
    eyebrow: 'التعويضات', title: 'سياسات تعويض السائقين', description: 'أنشئ نسخاً مؤرخة من قواعد الأجر، حاكِ النتيجة، ثم فعّل النسخة المعتمدة.',
    refresh: 'تحديث', createTitle: 'إنشاء مسودة سياسة', createDescription: 'تحفظ القواعد بنسخة غير قابلة للتغيير بعد التفعيل.', requiredEntity: 'اختر كياناً قانونياً أولاً.', errorStatus: 'الحالة', errorInstance: 'نقطة النهاية', errorCorrelationId: 'معرّف التتبع', errorExceptionType: 'نوع الاستثناء', errorExceptionMessage: 'رسالة الاستثناء', errorInnerExceptionMessage: 'الاستثناء الداخلي', errorValidation: 'أخطاء التحقق', errorTechnical: 'التفاصيل الفنية كاملة',
    platform: 'حساب المنصة', workerCategory: 'فئة العامل', code: 'الرمز', name: 'الاسم', from: 'ساري من', to: 'ساري إلى', rules: 'قواعد السياسة', addRule: 'إضافة قاعدة', removeRule: 'حذف القاعدة', rule: 'القاعدة', template: 'نمط الحساب', component: 'نوع المكوّن', metric: 'رمز المؤشر', conditionMetric: 'مؤشر الشرط', operator: 'المعامل', conditionValue: 'قيمة الشرط', lower: 'الحد الأدنى', upper: 'الحد الأعلى', rate: 'المعدل', belowRate: 'معدل ما دون الحد', aboveRate: 'معدل ما فوق الحد', fixed: 'مبلغ ثابت', base: 'مبلغ أساسي', target: 'المكوّن المستهدف', priority: 'الأولوية', exclusive: 'مجموعة الاستبعاد', stacking: 'طريقة التراكم', rounding: 'المنازل العشرية', advanced: 'خيارات متقدمة', calculation: 'تفاصيل الحساب', example: 'مثال جاهز',
    create: 'حفظ مسودة السياسة', creating: 'جاري الحفظ…', createError: 'تعذر إنشاء السياسة.', register: 'سجل السياسات', registerDescription: 'افتح السياسة للمحاكاة والتفعيل وإدارة النسخ.', search: 'بحث بالرمز أو الاسم', allStatuses: 'كل الحالات', loadError: 'تعذر تحميل السياسات.', empty: 'لا توجد سياسات مطابقة.', version: 'الإصدار', effective: 'السريان', status: 'الحالة', open: 'فتح', total: 'إجمالي السياسات', active: 'النشطة', drafts: 'المسودات', next: 'التالي', previous: 'السابق',
  },
  en: {
    eyebrow: 'Compensation', title: 'Rider compensation policies', description: 'Create effective-dated pay rules, simulate outcomes, then activate the certified version.',
    refresh: 'Refresh', createTitle: 'Create a policy draft', createDescription: 'Rules become an immutable version after activation.', requiredEntity: 'Select a legal entity first.', errorStatus: 'Status', errorInstance: 'Endpoint', errorCorrelationId: 'Correlation ID', errorExceptionType: 'Exception type', errorExceptionMessage: 'Exception message', errorInnerExceptionMessage: 'Inner exception', errorValidation: 'Validation errors', errorTechnical: 'Full technical details',
    platform: 'Platform account', workerCategory: 'Worker category', code: 'Code', name: 'Name', from: 'Effective from', to: 'Effective to', rules: 'Policy rules', addRule: 'Add rule', removeRule: 'Remove rule', rule: 'Rule', template: 'Calculation template', component: 'Component type', metric: 'Metric code', conditionMetric: 'Condition metric', operator: 'Operator', conditionValue: 'Condition value', lower: 'Lower bound', upper: 'Upper bound', rate: 'Rate', belowRate: 'Below-threshold rate', aboveRate: 'Above-threshold rate', fixed: 'Fixed amount', base: 'Base amount', target: 'Target component', priority: 'Priority', exclusive: 'Exclusive group', stacking: 'Stacking mode', rounding: 'Rounding scale', advanced: 'Advanced options', calculation: 'Calculation details', example: 'Ready example',
    create: 'Save policy draft', creating: 'Saving…', createError: 'The policy could not be created.', register: 'Policy register', registerDescription: 'Open a policy to simulate, activate, and manage versions.', search: 'Search code or name', allStatuses: 'All statuses', loadError: 'Policies could not be loaded.', empty: 'No matching policies.', version: 'Version', effective: 'Effective dates', status: 'Status', open: 'Open', total: 'Total policies', active: 'Active', drafts: 'Drafts', next: 'Next', previous: 'Previous',
  },
};

const optionLabel = (name, isRtl) => isRtl
  ? accountingOptionLabel('ar', name)
  : name.replace(/([a-z])([A-Z])/g, '$1 $2');

function newRule() {
  return {
    code: '', name: '', template: '1', componentType: '1', metricCode: '', conditionMetricCode: '', conditionOperator: '>=', conditionValue: '',
    lowerBound: '', upperBound: '', rate: '', belowRate: '', aboveRate: '', fixedAmount: '', baseAmount: '', targetComponentCode: '', priority: '100', exclusiveGroup: '', stackingMode: '2', roundingScale: '2',
  };
}

const RULE_PRESETS = {
  FixedAmount: { code: 'MONTHLY-BONUS', metricCode: 'VALIDITY', componentType: '3', fixedAmount: '500', arName: 'مكافأة شهرية', enName: 'Monthly bonus', arExample: 'مبلغ ثابت ٥٠٠ ريال عند صلاحية السائق', example: '500 SAR when the rider is valid' },
  PerUnit: { code: 'ACCEPTED-ORDERS', metricCode: 'ACCEPTED_ORDERS', componentType: '1', rate: '2', arName: 'تعويض الطلبات المقبولة', enName: 'Accepted orders pay', arExample: '٢ ريال عن كل طلب مقبول', example: '2 SAR for each accepted order' },
  Threshold: { code: 'ORDER-THRESHOLD', metricCode: 'ACCEPTED_ORDERS', componentType: '1', conditionMetricCode: 'ACCEPTED_ORDERS', conditionOperator: '>=', conditionValue: '100', belowRate: '2', aboveRate: '3', arName: 'شرط الحد الأدنى للطلبات', enName: 'Order threshold', arExample: '٢ ريال حتى ١٠٠ طلب، و٣ ريالات لما يزيد عن ذلك', example: '2 SAR below 100 orders, 3 SAR above it' },
  TieredBasePlusExcess: { code: 'TIERED-ORDERS', metricCode: 'ACCEPTED_ORDERS', componentType: '1', conditionValue: '100', belowRate: '2', aboveRate: '3', baseAmount: '200', arName: 'شرائح الطلبات', enName: 'Tiered orders pay', arExample: 'حتى ١٠٠ طلب: ٢٠٠ ريال، ثم ٣ ريالات لكل طلب إضافي', example: 'Up to 100 orders: 200 SAR, then 3 SAR per extra order' },
  Percentage: { code: 'BASE-PERCENT', metricCode: 'BASE_AMOUNT', componentType: '1', rate: '10', arName: 'نسبة من المبلغ الأساسي', enName: 'Base amount percentage', arExample: '١٠٪ من المبلغ الأساسي', example: '10% of the base amount' },
  Range: { code: 'ORDER-RANGE', metricCode: 'ACCEPTED_ORDERS', componentType: '1', lowerBound: '1', upperBound: '100', rate: '2', arName: 'نطاق الطلبات', enName: 'Order range', arExample: '٢ ريال عندما يكون عدد الطلبات بين ١ و١٠٠', example: '2 SAR when orders are between 1 and 100' },
  Cap: { code: 'MAX-BONUS', metricCode: 'BASE_AMOUNT', componentType: '3', targetComponentCode: 'BASE_AMOUNT', fixedAmount: '5000', arName: 'حد أقصى للمكافأة', enName: 'Maximum bonus', arExample: 'لا تتجاوز المكافأة ٥٬٠٠٠ ريال', example: 'Cap the bonus at 5,000 SAR' },
  Floor: { code: 'MIN-EARNING', metricCode: 'BASE_AMOUNT', componentType: '1', targetComponentCode: 'BASE_AMOUNT', fixedAmount: '3000', arName: 'حد أدنى للاستحقاق', enName: 'Minimum earning', arExample: 'ضمان استحقاق لا يقل عن ٣٬٠٠٠ ريال', example: 'Guarantee at least 3,000 SAR' },
  EligibilityCondition: { code: 'VALID-RIDER', metricCode: 'VALIDITY', conditionMetricCode: 'VALIDITY', conditionOperator: '==', conditionValue: '1', componentType: '1', arName: 'شرط أهلية السائق', enName: 'Rider eligibility', arExample: 'تطبق القاعدة فقط عندما تكون قيمة الصلاحية ١', example: 'Apply only when VALIDITY equals 1' },
};

function applyRulePreset(rule, template, isRtl) {
  const preset = RULE_PRESETS[template];
  if (!preset) return { ...rule, template: String(RULE_TEMPLATES.indexOf(template)) };
  const fresh = newRule();
  return {
    ...fresh,
    ...preset,
    template: String(RULE_TEMPLATES.indexOf(template)),
    name: isRtl ? preset.arName : preset.enName,
  };
}

function ruleExample(template, isRtl) {
  const preset = RULE_PRESETS[template];
  return preset ? `${isRtl ? preset.arName : preset.enName}: ${isRtl ? preset.arExample : preset.example}` : '';
}

function toRulePayload(rule) {
  return {
    code: rule.code.trim(),
    name: rule.name.trim(),
    template: Number(rule.template),
    componentType: Number(rule.componentType),
    metricCode: rule.metricCode.trim(),
    conditionMetricCode: rule.conditionMetricCode.trim() || null,
    conditionOperator: rule.conditionMetricCode ? rule.conditionOperator || null : null,
    conditionValue: optionalNumber(rule.conditionValue),
    lowerBound: optionalNumber(rule.lowerBound),
    upperBound: optionalNumber(rule.upperBound),
    rate: optionalNumber(rule.rate),
    belowRate: optionalNumber(rule.belowRate),
    aboveRate: optionalNumber(rule.aboveRate),
    fixedAmount: optionalNumber(rule.fixedAmount),
    baseAmount: optionalNumber(rule.baseAmount),
    targetComponentCode: rule.targetComponentCode.trim() || null,
    priority: Number(rule.priority),
    exclusiveGroup: rule.exclusiveGroup.trim() || null,
    stackingMode: Number(rule.stackingMode),
    roundingScale: Number(rule.roundingScale),
  };
}

export default function CompensationPoliciesPage() {
  const router = useRouter();
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const month = useMemo(() => currentMonthRange(), []);
  const [policies, setPolicies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [meta, setMeta] = useState(collectionMeta([]));
  const [filters, setFilters] = useState({ search: '', status: '', pageNumber: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ platformAccountId: '', workerCategory: 'Rider', code: '', name: '', effectiveFrom: month.start, effectiveTo: '', rules: [applyRulePreset(newRule(), 'FixedAmount', isRtl)] });

  const load = useCallback(async () => {
    if (!legalEntityId) { setPolicies([]); setPlatforms([]); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const [payload, platformPayload] = await Promise.all([
        callApi(accountingApi.compensation, ['listPolicies'], {
          legalEntityId: Number(legalEntityId), search: filters.search || undefined, status: filters.status || undefined,
          pageNumber: filters.pageNumber, pageSize: 25,
        }),
        accountingApi.organization.listPlatformAccounts({ legalEntityId: Number(legalEntityId), pageNumber: 1, pageSize: 100, active: true, sortBy: 'code', sortDirection: 'asc' }),
      ]);
      setPolicies(collectionItems(payload));
      setPlatforms(collectionItems(platformPayload));
      setMeta(collectionMeta(payload));
    } catch (requestError) {
      setPolicies([]);
      setError(requestError);
    } finally { setLoading(false); }
  }, [copy.loadError, filters.pageNumber, filters.search, filters.status, legalEntityId]);

  useEffect(() => {
    const timer = setTimeout(load, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, filters.search]);

  const updateRule = (index, key, value) => setForm((current) => ({
    ...current,
    rules: current.rules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, [key]: value } : rule),
  }));

  const createPolicy = async (event) => {
    event.preventDefault();
    if (!legalEntityId || creating) return;
    setCreating(true);
    setFormError('');
    try {
      const created = await accountingApi.compensation.createPolicy({
        legalEntityId: Number(legalEntityId), platformAccountId: Number(form.platformAccountId), workerCategory: form.workerCategory.trim(),
        code: form.code.trim(), name: form.name.trim(), effectiveFrom: form.effectiveFrom, effectiveTo: form.effectiveTo || null,
        rules: form.rules.map(toRulePayload),
      });
      router.push(`/accountant/compensation/${created.id}`);
    } catch (requestError) {
      setFormError(requestError);
      setCreating(false);
    }
  };

  const statusOf = (policy) => enumName(policy.status, POLICY_STATUSES);
  const counts = useMemo(() => ({
    active: policies.filter((item) => statusOf(item) === 'Active').length,
    drafts: policies.filter((item) => statusOf(item) === 'Draft').length,
  }), [policies]);

  const columns = [
    { key: 'code', header: copy.code, render: (item) => <div><Link className="font-bold text-blue-700 hover:underline" href={`/accountant/compensation/${item.id}`}><span dir="ltr">{item.code}</span></Link><div className="mt-1 text-xs text-slate-500">{item.name}</div></div> },
    { key: 'platformAccountId', header: copy.platform, render: (item) => item.platformName || item.platformAccountId },
    { key: 'workerCategory', header: copy.workerCategory },
    { key: 'version', header: copy.version, align: 'center' },
    { key: 'effectiveFrom', header: copy.effective, render: (item) => `${formatDate(item.effectiveFrom, locale)} — ${formatDate(item.effectiveTo, locale)}` },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={statusOf(item)} /> },
    { key: 'action', header: '', render: (item) => <Link className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50" href={`/accountant/compensation/${item.id}`}>{copy.open}</Link> },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>{copy.refresh}</ActionButton>} />

      {!legalEntityId ? <EmptyState icon={Calculator} title={copy.requiredEntity} /> : <>
        <section className="grid gap-3 sm:grid-cols-3">
          <MetricCard label={copy.total} value={meta.totalCount} icon={Layers3} />
          <MetricCard label={copy.active} value={counts.active} tone="success" />
          <MetricCard label={copy.drafts} value={counts.drafts} />
        </section>

        <Panel title={copy.createTitle} description={copy.createDescription}>
          <form className="space-y-5" onSubmit={createPolicy}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <FormField label={copy.platform} required><select required value={form.platformAccountId} onChange={(event) => setForm((current) => ({ ...current, platformAccountId: event.target.value }))}><option value="">{copy.platform}</option>{platforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.code ? `${platform.code} · ` : ''}{platform.platformName}</option>)}</select></FormField>
              <FormField label={copy.workerCategory} required><input required maxLength={64} value={form.workerCategory} onChange={(event) => setForm((current) => ({ ...current, workerCategory: event.target.value }))} /></FormField>
              <FormField label={copy.code} required><input required maxLength={64} dir="ltr" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
              <FormField label={copy.name} required><input required maxLength={200} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              <FormField label={copy.from} required><input type="date" required value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></FormField>
              <FormField label={copy.to}><input type="date" min={form.effectiveFrom} value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></FormField>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <div><h3 className="font-bold text-slate-950">{copy.rules}</h3><p className="mt-1 text-sm text-slate-500">{form.rules.length} {copy.rule}</p></div>
              <ActionButton variant="secondary" size="sm" icon={Plus} onClick={() => setForm((current) => ({ ...current, rules: [...current.rules, applyRulePreset(newRule(), 'FixedAmount', isRtl)] }))}>{copy.addRule}</ActionButton>
            </div>

            {form.rules.map((rule, index) => {
              const template = RULE_TEMPLATES[Number(rule.template)];
              const showCondition = ['Threshold', 'EligibilityCondition'].includes(template);
              const showBounds = ['Threshold', 'TieredBasePlusExcess', 'Range'].includes(template);
              const showRates = ['PerUnit', 'Threshold', 'TieredBasePlusExcess', 'Percentage', 'Range'].includes(template);
              const showFixed = ['FixedAmount', 'Cap', 'Floor'].includes(template);
              const showBase = template === 'TieredBasePlusExcess';
              const showTarget = ['Cap', 'Floor', 'EligibilityCondition'].includes(template);

              return (
              <fieldset key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <legend className="px-2 text-sm font-bold text-slate-800">{copy.rule} {index + 1}</legend>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <FormField label={copy.code} required><input required maxLength={64} dir="ltr" value={rule.code} onChange={(event) => updateRule(index, 'code', event.target.value)} /></FormField>
                  <FormField label={copy.name} required><input required maxLength={200} value={rule.name} onChange={(event) => updateRule(index, 'name', event.target.value)} /></FormField>
                  <FormField label={copy.template} required><select value={rule.template} onChange={(event) => setForm((current) => ({ ...current, rules: current.rules.map((currentRule, ruleIndex) => ruleIndex === index ? applyRulePreset(currentRule, RULE_TEMPLATES[Number(event.target.value)], isRtl) : currentRule) }))}>{RULE_TEMPLATES.slice(1).map((name, optionIndex) => <option key={name} value={optionIndex + 1}>{optionLabel(name, isRtl)}</option>)}</select></FormField>
                  <FormField label={copy.component} required><select value={rule.componentType} onChange={(event) => updateRule(index, 'componentType', event.target.value)}>{COMPONENT_TYPES.slice(1).map((name, optionIndex) => <option key={name} value={optionIndex + 1}>{optionLabel(name, isRtl)}</option>)}</select></FormField>
                  <FormField label={copy.metric} required><select required dir="ltr" value={rule.metricCode} onChange={(event) => updateRule(index, 'metricCode', event.target.value)}><option value="">{copy.metric}</option>{METRIC_OPTIONS.map((metric) => <option key={metric.value} value={metric.value}>{metric.value} — {isRtl ? metric.arLabel : metric.enLabel}</option>)}</select></FormField>
                </div>
                {ruleExample(template, isRtl) && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900"><span className="font-bold">{copy.example}:</span> {ruleExample(template, isRtl)}</p>}
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">{copy.calculation}</h4>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {showCondition && <>
                      <FormField label={copy.conditionMetric}><select dir="ltr" value={rule.conditionMetricCode} onChange={(event) => updateRule(index, 'conditionMetricCode', event.target.value)}><option value="">{copy.conditionMetric}</option>{METRIC_OPTIONS.map((metric) => <option key={metric.value} value={metric.value}>{metric.value} — {isRtl ? metric.arLabel : metric.enLabel}</option>)}</select></FormField>
                      <FormField label={copy.operator}><select value={rule.conditionOperator} onChange={(event) => updateRule(index, 'conditionOperator', event.target.value)}>{['>=', '>', '<=', '<', '==', '!='].map((operator) => <option key={operator}>{operator}</option>)}</select></FormField>
                      <FormField label={copy.conditionValue}><input type="number" step="any" value={rule.conditionValue} onChange={(event) => updateRule(index, 'conditionValue', event.target.value)} /></FormField>
                    </>}
                    {showBounds && <>
                      <FormField label={copy.lower}><input type="number" step="any" value={rule.lowerBound} onChange={(event) => updateRule(index, 'lowerBound', event.target.value)} /></FormField>
                      <FormField label={copy.upper}><input type="number" step="any" value={rule.upperBound} onChange={(event) => updateRule(index, 'upperBound', event.target.value)} /></FormField>
                    </>}
                    {showRates && <>
                      <FormField label={copy.rate}><input type="number" step="any" value={rule.rate} onChange={(event) => updateRule(index, 'rate', event.target.value)} /></FormField>
                      {template === 'Threshold' && <FormField label={copy.belowRate}><input type="number" step="any" value={rule.belowRate} onChange={(event) => updateRule(index, 'belowRate', event.target.value)} /></FormField>}
                      {['Threshold', 'TieredBasePlusExcess'].includes(template) && <FormField label={copy.aboveRate}><input type="number" step="any" value={rule.aboveRate} onChange={(event) => updateRule(index, 'aboveRate', event.target.value)} /></FormField>}
                    </>}
                    {showFixed && <FormField label={copy.fixed}><input type="number" step="any" value={rule.fixedAmount} onChange={(event) => updateRule(index, 'fixedAmount', event.target.value)} /></FormField>}
                    {showBase && <FormField label={copy.base}><input type="number" step="any" value={rule.baseAmount} onChange={(event) => updateRule(index, 'baseAmount', event.target.value)} /></FormField>}
                    {showTarget && <FormField label={copy.target}><input maxLength={64} dir="ltr" value={rule.targetComponentCode} onChange={(event) => updateRule(index, 'targetComponentCode', event.target.value)} /></FormField>}
                    {!showCondition && !showBounds && !showRates && !showFixed && !showBase && !showTarget && <p className="text-sm text-slate-500">{copy.calculation}</p>}
                  </div>
                </div>
                <details className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">{copy.advanced}</summary>
                  <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FormField label={copy.priority} required><input type="number" required value={rule.priority} onChange={(event) => updateRule(index, 'priority', event.target.value)} /></FormField>
                    <FormField label={copy.exclusive}><input maxLength={64} dir="ltr" value={rule.exclusiveGroup} onChange={(event) => updateRule(index, 'exclusiveGroup', event.target.value)} /></FormField>
                    <FormField label={copy.stacking} required><select value={rule.stackingMode} onChange={(event) => updateRule(index, 'stackingMode', event.target.value)}>{STACKING_MODES.slice(1).map((name, optionIndex) => <option key={name} value={optionIndex + 1}>{optionLabel(name, isRtl)}</option>)}</select></FormField>
                    <FormField label={copy.rounding} required><input type="number" min="0" max="4" required value={rule.roundingScale} onChange={(event) => updateRule(index, 'roundingScale', event.target.value)} /></FormField>
                  </div>
                </details>
                {form.rules.length > 1 && <div className="mt-4 flex justify-end"><ActionButton variant="ghost" size="sm" icon={Trash2} onClick={() => setForm((current) => ({ ...current, rules: current.rules.filter((_, ruleIndex) => ruleIndex !== index) }))}>{copy.removeRule}</ActionButton></div>}
              </fieldset>
              );
            })}

            {formError && <ApiProblemDetails error={formError} fallback={copy.createError} labels={{ status: copy.errorStatus, instance: copy.errorInstance, correlationId: copy.errorCorrelationId, exceptionType: copy.errorExceptionType, exceptionMessage: copy.errorExceptionMessage, innerExceptionMessage: copy.errorInnerExceptionMessage, validation: copy.errorValidation, technical: copy.errorTechnical }} />}
            <div className="flex justify-end"><ActionButton type="submit" icon={Plus} loading={creating} loadingLabel={copy.creating}>{copy.create}</ActionButton></div>
          </form>
        </Panel>

        <Panel title={copy.register} description={copy.registerDescription}>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <input className={controlClass} type="search" placeholder={copy.search} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, pageNumber: 1 }))} />
            <select className={controlClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, pageNumber: 1 }))}><option value="">{copy.allStatuses}</option>{POLICY_STATUSES.slice(1).map((status, index) => <option key={status} value={index + 1}>{accountingOptionLabel(isRtl ? 'ar' : 'en', status)}</option>)}</select>
          </div>
          {loading ? <LoadingState /> : error ? <ApiProblemDetails error={error} fallback={copy.loadError} labels={{ status: copy.errorStatus, instance: copy.errorInstance, correlationId: copy.errorCorrelationId, exceptionType: copy.errorExceptionType, exceptionMessage: copy.errorExceptionMessage, innerExceptionMessage: copy.errorInnerExceptionMessage, validation: copy.errorValidation, technical: copy.errorTechnical }} /> : policies.length === 0 ? <EmptyState icon={Layers3} title={copy.empty} /> : <DataTable columns={columns} data={policies} rowKey="id" getRowHref={(item) => `/accountant/compensation/${item.id}`} />}
          {!loading && !error && meta.totalPages > 1 && <div className="mt-4 flex items-center justify-end gap-2"><ActionButton variant="secondary" size="sm" disabled={!meta.hasPreviousPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))}>{copy.previous}</ActionButton><span className="text-sm tabular-nums text-slate-500">{meta.pageNumber} / {meta.totalPages}</span><ActionButton variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => setFilters((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}>{copy.next}</ActionButton></div>}
        </Panel>
      </>}
    </div>
  );
}
