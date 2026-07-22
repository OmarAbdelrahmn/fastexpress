'use client';

import {
  ActionButton,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  FormField,
  LoadingState,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { ArrowLeft, ArrowRight, CheckCircle2, Layers3, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  apiErrorMessage,
  callApi,
  collectionItems,
  controlClass,
  formatDate,
  selectedLocale,
} from '../_shared/accountingWorkspaceUtils';

const COPY = {
  ar: {
    eyebrow: 'الاستيراد والأدلة', title: 'قوالب استيراد المنصات', description: 'عرّف بنية الملف مرة واحدة ثم ثبّت نسخة القالب قبل استخدامها.',
    back: 'دفعات الاستيراد', refresh: 'تحديث', createTitle: 'إنشاء مسودة قالب', createDescription: 'أنشئ قالباً بسيطاً لكل منصة وفترة سريان.',
    sourceBatch: 'دفعة المصدر غير المرتبطة بقالب', selectBatch: 'اختر دفعة مرفوعة لا تستخدم قالباً', platform: 'حساب المنصة', code: 'الرمز', name: 'الاسم', adapter: 'معالج الملف', from: 'ساري من', to: 'ساري إلى', create: 'إنشاء القالب واعتماده', creating: 'جارٍ إنشاء القالب واعتماده…',
    register: 'سجل القوالب', empty: 'لا توجد قوالب لهذا الكيان.', loadError: 'تعذر تحميل القوالب.', createError: 'تعذر إنشاء القالب.', activateError: 'تعذر تفعيل القالب.', retireError: 'تعذر إيقاف القالب.', status: 'الحالة', version: 'الإصدار', effective: 'السريان', activate: 'تفعيل', retire: 'إيقاف', activateTitle: 'تفعيل القالب؟', activateDescription: 'سيصبح هذا الإصدار معتمداً للاستيرادات الواقعة ضمن فترة سريانه. لا يمكن تعديل قواعده بعد الاعتماد.', retireTitle: 'إيقاف القالب؟', retireDescription: 'سيتوقف اختياره للاستيرادات الجديدة مع بقاء الأثر التاريخي.', confirm: 'تأكيد', cancel: 'إلغاء', comment: 'ملاحظة الاعتماد', requiredEntity: 'اختر كياناً قانونياً أولاً.',
  },
  en: {
    eyebrow: 'Imports & evidence', title: 'Platform import templates', description: 'Define the workbook structure once, then certify a version before using it.',
    back: 'Import batches', refresh: 'Refresh', createTitle: 'Create a template draft', createDescription: 'Create a simple template for each platform and effective period.',
    sourceBatch: 'Untemplated source batch', selectBatch: 'Select an uploaded batch with no template', platform: 'Platform account', code: 'Code', name: 'Name', adapter: 'File adapter', from: 'Effective from', to: 'Effective to', create: 'Create and certify template', creating: 'Creating and certifying…',
    register: 'Template register', empty: 'No templates exist for this entity.', loadError: 'Templates could not be loaded.', createError: 'The template could not be created.', activateError: 'The template could not be activated.', retireError: 'The template could not be retired.', status: 'Status', version: 'Version', effective: 'Effective dates', activate: 'Activate', retire: 'Retire', activateTitle: 'Activate this template?', activateDescription: 'This version becomes authoritative for imports in its effective range. Its rules should be treated as immutable after activation.', retireTitle: 'Retire this template?', retireDescription: 'It will no longer be selected for new imports, while historical lineage remains intact.', confirm: 'Confirm', cancel: 'Cancel', comment: 'Certification note', requiredEntity: 'Select a legal entity first.',
  },
};

const initialForm = {
  sourceBatchId: '', platformAccountId: '', code: '', name: '', adapterKey: 'hunger-ftr-v1', effectiveFrom: '', effectiveTo: '',
};

const BUILT_IN_ADAPTERS = ['amazon-anow-v1', 'hunger-ftr-v1', 'keeta-pay-per-order-v1', 'keeta-segments-v1'];

export default function ImportTemplatesPage() {
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [templates, setTemplates] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [sourceBatches, setSourceBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [activation, setActivation] = useState(null);
  const [retirement, setRetirement] = useState(null);
  const [activating, setActivating] = useState(false);

  const load = useCallback(async () => {
    if (!legalEntityId) {
      setTemplates([]);
      setPlatforms([]);
      setSourceBatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [payload, platformPayload, batchPayload] = await Promise.all([
        callApi(accountingApi.imports, ['listTemplates', 'templates'], { legalEntityId, pageNumber: 1, pageSize: 100 }),
        accountingApi.organization.listPlatformAccounts({ legalEntityId, pageNumber: 1, pageSize: 100, active: true, sortBy: 'code', sortDirection: 'asc' }),
        accountingApi.imports.list({ legalEntityId, pageNumber: 1, pageSize: 100 }),
      ]);
      setTemplates(collectionItems(payload));
      setPlatforms(collectionItems(platformPayload));
      setSourceBatches(collectionItems(batchPayload).filter((batch) => batch.schemaFingerprint && !batch.templateId && !batch.platformTemplateId));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, copy.loadError));
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, legalEntityId]);

  useEffect(() => { load(); }, [load]);

  const createTemplate = async (event) => {
    event.preventDefault();
    if (!legalEntityId || creating) return;
    setCreating(true);
    setFormError('');
    try {
      const sourceBatch = sourceBatches.find((batch) => String(batch.id) === String(form.sourceBatchId));
      if (!sourceBatch?.schemaFingerprint || !sourceBatch?.rowVersion) throw new Error(copy.selectBatch);
      const created = await callApi(accountingApi.imports, ['createTemplate'], {
        legalEntityId: Number(legalEntityId),
        platformAccountId: Number(form.platformAccountId),
        code: form.code.trim(),
        name: form.name.trim(),
        adapterKey: form.adapterKey.trim(),
        configurationJson: '{}',
        schemaFingerprint: sourceBatch.schemaFingerprint,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || null,
      });
      const activated = await accountingApi.imports.activateTemplate(created.id, { comment: 'Certified against the uploaded source workbook.' });
      await accountingApi.imports.reprocess(sourceBatch.id, { templateId: created.id, rowVersion: sourceBatch.rowVersion });
      setTemplates((current) => [activated, ...current]);
      setForm(initialForm);
    } catch (requestError) {
      setFormError(apiErrorMessage(requestError, copy.createError));
    } finally {
      setCreating(false);
    }
  };

  const activate = async () => {
    if (!activation || activating) return;
    setActivating(true);
    try {
      const updated = await callApi(accountingApi.imports, ['activateTemplate'], activation.id, { comment: null });
      setTemplates((current) => current.map((item) => item.id === updated.id ? updated : item));
      setActivation(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, copy.activateError));
      setActivation(null);
    } finally {
      setActivating(false);
    }
  };

  const retire = async () => {
    if (!retirement || activating) return;
    setActivating(true);
    try {
      const updated = await accountingApi.imports.retireTemplate(retirement.id, { comment: null });
      setTemplates((current) => current.map((item) => item.id === updated.id ? updated : item));
      setRetirement(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, copy.retireError));
      setRetirement(null);
    } finally { setActivating(false); }
  };

  const columns = [
    { key: 'code', header: copy.code, render: (item) => <span className="font-mono font-semibold text-slate-800" dir="ltr">{item.code}</span> },
    { key: 'name', header: copy.name },
    { key: 'platformAccountId', header: copy.platform, render: (item) => item.platformName || item.platformAccountId },
    { key: 'version', header: copy.version, align: 'center' },
    { key: 'effectiveFrom', header: copy.effective, render: (item) => `${formatDate(item.effectiveFrom, locale)} — ${formatDate(item.effectiveTo, locale)}` },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'action', header: '', render: (item) => <div className="flex gap-2">{['Draft', 1].includes(item.status) && <ActionButton variant="secondary" size="sm" icon={CheckCircle2} onClick={() => setActivation(item)}>{copy.activate}</ActionButton>}{['Active', 2].includes(item.status) && <ActionButton variant="danger" size="sm" onClick={() => setRetirement(item)}>{copy.retire}</ActionButton>}</div>,
    },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={(
          <div className="flex flex-wrap gap-2">
            <Link href="/accountant/imports" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BackIcon size={17} />{copy.back}</Link>
            <ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton>
          </div>
        )}
      />

      {!legalEntityId ? <EmptyState icon={Layers3} title={copy.requiredEntity} /> : (
        <>
          <Panel title={copy.createTitle} description={copy.createDescription}>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={createTemplate}>
              <FormField label={copy.sourceBatch} required><select className={controlClass} required value={form.sourceBatchId} onChange={(event) => { const batch = sourceBatches.find((item) => String(item.id) === event.target.value); setForm((current) => ({ ...current, sourceBatchId: event.target.value, platformAccountId: batch?.platformAccountId ? String(batch.platformAccountId) : current.platformAccountId })); }}><option value="">{copy.selectBatch}</option>{sourceBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.externalReference || batch.id}</option>)}</select></FormField>
              <FormField label={copy.platform} required><select className={controlClass} required value={form.platformAccountId} onChange={(event) => setForm((current) => ({ ...current, platformAccountId: event.target.value }))}><option value="">{copy.platform}</option>{platforms.map((platform) => <option key={platform.id} value={platform.id}>{platform.code ? `${platform.code} · ` : ''}{platform.platformName}</option>)}</select></FormField>
              <FormField label={copy.code} required><input className={controlClass} required maxLength={64} dir="ltr" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
              <FormField label={copy.name} required><input className={controlClass} required maxLength={200} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              <FormField label={copy.adapter} required><select className={controlClass} required dir="ltr" value={form.adapterKey} onChange={(event) => setForm((current) => ({ ...current, adapterKey: event.target.value }))}>{BUILT_IN_ADAPTERS.map((adapter) => <option key={adapter} value={adapter}>{adapter}</option>)}</select></FormField>
              <FormField label={copy.from} required><input className={controlClass} type="date" required value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></FormField>
              <FormField label={copy.to}><input className={controlClass} type="date" min={form.effectiveFrom} value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></FormField>
              {formError && <div className="md:col-span-2 xl:col-span-3"><ErrorState description={formError} compact /></div>}
              <div className="flex items-end justify-end"><ActionButton type="submit" icon={Plus} loading={creating} loadingLabel={copy.creating}>{copy.create}</ActionButton></div>
            </form>
          </Panel>

          <Panel title={copy.register}>
            {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : templates.length === 0 ? <EmptyState icon={Layers3} title={copy.empty} /> : <DataTable columns={columns} data={templates} rowKey="id" />}
          </Panel>
        </>
      )}

      <ConfirmDialog
        open={Boolean(activation)}
        title={copy.activateTitle}
        description={copy.activateDescription}
        confirmLabel={copy.confirm}
        cancelLabel={copy.cancel}
        tone="primary"
        loading={activating}
        onConfirm={activate}
        onCancel={() => setActivation(null)}
      />
      <ConfirmDialog open={Boolean(retirement)} title={copy.retireTitle} description={copy.retireDescription} confirmLabel={copy.confirm} cancelLabel={copy.cancel} tone="danger" loading={activating} onConfirm={retire} onCancel={() => setRetirement(null)} />
    </div>
  );
}
