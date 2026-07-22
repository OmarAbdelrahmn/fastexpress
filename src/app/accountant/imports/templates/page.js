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
  textAreaClass,
} from '../_shared/accountingWorkspaceUtils';

const COPY = {
  ar: {
    eyebrow: 'الاستيراد والأدلة', title: 'قوالب استيراد المنصات', description: 'عرّف بنية الملف مرة واحدة ثم ثبّت نسخة القالب قبل استخدامها.',
    back: 'دفعات الاستيراد', refresh: 'تحديث', createTitle: 'إنشاء مسودة قالب', createDescription: 'استخدم بصمة البنية الناتجة من دفعة تجريبية غير مرتبطة بقالب.',
    platform: 'حساب المنصة', code: 'الرمز', name: 'الاسم', adapter: 'معالج الملف', fingerprint: 'بصمة البنية SHA-256', config: 'إعدادات المطابقة JSON', from: 'ساري من', to: 'ساري إلى', create: 'إنشاء المسودة', creating: 'جاري الإنشاء…',
    register: 'سجل القوالب', empty: 'لا توجد قوالب لهذا الكيان.', loadError: 'تعذر تحميل القوالب.', createError: 'تعذر إنشاء القالب.', activateError: 'تعذر تفعيل القالب.', retireError: 'تعذر إيقاف القالب.', status: 'الحالة', version: 'الإصدار', effective: 'السريان', activate: 'تفعيل', retire: 'إيقاف', activateTitle: 'تفعيل القالب؟', activateDescription: 'سيصبح هذا الإصدار معتمداً للاستيرادات الواقعة ضمن فترة سريانه. لا يمكن تعديل قواعده بعد الاعتماد.', retireTitle: 'إيقاف القالب؟', retireDescription: 'سيتوقف اختياره للاستيرادات الجديدة مع بقاء الأثر التاريخي.', confirm: 'تأكيد', cancel: 'إلغاء', comment: 'ملاحظة الاعتماد', requiredEntity: 'اختر كياناً قانونياً أولاً.',
  },
  en: {
    eyebrow: 'Imports & evidence', title: 'Platform import templates', description: 'Define the workbook structure once, then certify a version before using it.',
    back: 'Import batches', refresh: 'Refresh', createTitle: 'Create a template draft', createDescription: 'Use the schema fingerprint returned by an untemplated trial batch.',
    platform: 'Platform account', code: 'Code', name: 'Name', adapter: 'File adapter', fingerprint: 'SHA-256 schema fingerprint', config: 'Mapping configuration JSON', from: 'Effective from', to: 'Effective to', create: 'Create draft', creating: 'Creating…',
    register: 'Template register', empty: 'No templates exist for this entity.', loadError: 'Templates could not be loaded.', createError: 'The template could not be created.', activateError: 'The template could not be activated.', retireError: 'The template could not be retired.', status: 'Status', version: 'Version', effective: 'Effective dates', activate: 'Activate', retire: 'Retire', activateTitle: 'Activate this template?', activateDescription: 'This version becomes authoritative for imports in its effective range. Its rules should be treated as immutable after activation.', retireTitle: 'Retire this template?', retireDescription: 'It will no longer be selected for new imports, while historical lineage remains intact.', confirm: 'Confirm', cancel: 'Cancel', comment: 'Certification note', requiredEntity: 'Select a legal entity first.',
  },
};

const initialForm = {
  platformAccountId: '', code: '', name: '', adapterKey: 'generic-tabular-v1', schemaFingerprint: '', configurationJson: '{\n  "columns": []\n}', effectiveFrom: '', effectiveTo: '',
};

export default function ImportTemplatesPage() {
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [templates, setTemplates] = useState([]);
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
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = await callApi(accountingApi.imports, ['listTemplates', 'templates'], { legalEntityId, pageNumber: 1, pageSize: 100 });
      setTemplates(collectionItems(payload));
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
      JSON.parse(form.configurationJson);
      const created = await callApi(accountingApi.imports, ['createTemplate'], {
        legalEntityId: Number(legalEntityId),
        platformAccountId: Number(form.platformAccountId),
        code: form.code.trim(),
        name: form.name.trim(),
        adapterKey: form.adapterKey.trim(),
        schemaFingerprint: form.schemaFingerprint.trim(),
        configurationJson: form.configurationJson,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || null,
      });
      setTemplates((current) => [created, ...current]);
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
              <FormField label={copy.platform} required><input className={controlClass} required inputMode="numeric" value={form.platformAccountId} onChange={(event) => setForm((current) => ({ ...current, platformAccountId: event.target.value }))} /></FormField>
              <FormField label={copy.code} required><input className={controlClass} required maxLength={64} dir="ltr" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
              <FormField label={copy.name} required><input className={controlClass} required maxLength={200} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
              <FormField label={copy.adapter} required><input className={controlClass} required dir="ltr" value={form.adapterKey} onChange={(event) => setForm((current) => ({ ...current, adapterKey: event.target.value }))} /></FormField>
              <FormField label={copy.fingerprint} required className="md:col-span-2"><input className={controlClass} required minLength={64} maxLength={64} pattern="[A-Fa-f0-9]{64}" dir="ltr" value={form.schemaFingerprint} onChange={(event) => setForm((current) => ({ ...current, schemaFingerprint: event.target.value }))} /></FormField>
              <FormField label={copy.from} required><input className={controlClass} type="date" required value={form.effectiveFrom} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} /></FormField>
              <FormField label={copy.to}><input className={controlClass} type="date" min={form.effectiveFrom} value={form.effectiveTo} onChange={(event) => setForm((current) => ({ ...current, effectiveTo: event.target.value }))} /></FormField>
              <FormField label={copy.config} required className="md:col-span-2 xl:col-span-4"><textarea className={`${textAreaClass} min-h-44 font-mono text-xs`} required dir="ltr" spellCheck={false} value={form.configurationJson} onChange={(event) => setForm((current) => ({ ...current, configurationJson: event.target.value }))} /></FormField>
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
