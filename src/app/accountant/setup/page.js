'use client';

import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorState,
  FormField,
  LoadingState,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { Building2, Layers3, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage, collectionItems, controlClass } from '../imports/_shared/accountingWorkspaceUtils';

const COPY = {
  ar: {
    eyebrow: 'إعدادات النظام المالي', title: 'الكيانات القانونية والمنصات', description: 'أضف الكيانات القانونية وحسابات المنصات ليتمكن فريق المحاسبة من استخدامها في الاستيراد والرواتب.',
    refresh: 'تحديث', entities: 'الكيانات القانونية', entitiesDescription: 'تظهر الكيانات الجديدة فوراً في قائمة مساحة العمل.', code: 'الرمز', nameAr: 'الاسم بالعربية', nameEn: 'الاسم بالإنجليزية', registration: 'رقم السجل التجاري', addEntity: 'إضافة كيان قانوني', addingEntity: 'جارٍ إضافة الكيان…',
    platforms: 'حسابات المنصات', platformsDescription: 'اربط حساب كل منصة بالكيان القانوني الذي تعمل ضمنه.', platformCode: 'رمز المنصة', platformNameAr: 'اسم المنصة بالعربية', platformNameEn: 'اسم المنصة بالإنجليزية', entity: 'الكيان القانوني', addPlatform: 'إضافة حساب منصة', addingPlatform: 'جارٍ إضافة الحساب…',
    selectEntity: 'اختر كياناً قانونياً', entityCreated: 'تمت إضافة الكيان القانوني.', platformCreated: 'تمت إضافة حساب المنصة.', entityError: 'تعذر إضافة الكيان القانوني.', platformError: 'تعذر إضافة حساب المنصة.', loadError: 'تعذر تحميل الإعدادات.', noEntities: 'لا توجد كيانات قانونية بعد.', noPlatforms: 'لا توجد حسابات منصات بعد.', active: 'نشط', status: 'الحالة',
  },
  en: {
    eyebrow: 'Finance configuration', title: 'Legal entities & platforms', description: 'Add legal entities and platform accounts for use in imports and payroll.',
    refresh: 'Refresh', entities: 'Legal entities', entitiesDescription: 'New entities immediately appear in the workspace selector.', code: 'Code', nameAr: 'Arabic name', nameEn: 'English name', registration: 'Commercial registration number', addEntity: 'Add legal entity', addingEntity: 'Adding entity…',
    platforms: 'Platform accounts', platformsDescription: 'Link each platform account to the legal entity that operates it.', platformCode: 'Platform code', platformNameAr: 'Arabic platform name', platformNameEn: 'English platform name', entity: 'Legal entity', addPlatform: 'Add platform account', addingPlatform: 'Adding account…',
    selectEntity: 'Select a legal entity', entityCreated: 'Legal entity added.', platformCreated: 'Platform account added.', entityError: 'The legal entity could not be added.', platformError: 'The platform account could not be added.', loadError: 'Configuration could not be loaded.', noEntities: 'No legal entities yet.', noPlatforms: 'No platform accounts yet.', active: 'Active', status: 'Status',
  },
};

function entityName(entity, isRtl) {
  return isRtl
    ? entity.nameAr ?? entity.nameArabic ?? entity.arabicName ?? entity.name ?? entity.code
    : entity.nameEn ?? entity.nameEnglish ?? entity.name ?? entity.code;
}

export default function AccountingSetupPage() {
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const { updateWorkspace } = useAccountingWorkspace();
  const [entities, setEntities] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityForm, setEntityForm] = useState({ code: '', nameAr: '', nameEn: '', registrationNumber: '' });
  const [platformForm, setPlatformForm] = useState({ legalEntityId: '', code: '', nameAr: '', nameEn: '' });
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [entityResponse, platformResponse] = await Promise.all([
        accountingApi.organization.listLegalEntities({ pageNumber: 1, pageSize: 100 }),
        accountingApi.organization.listPlatformAccounts({ pageNumber: 1, pageSize: 100 }),
      ]);
      const nextEntities = collectionItems(entityResponse);
      setEntities(nextEntities);
      setPlatforms(collectionItems(platformResponse));
      updateWorkspace({ legalEntities: nextEntities });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, copy.loadError));
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, updateWorkspace]);

  useEffect(() => { load(); }, [load]);

  const addEntity = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy('entity'); setMessage(''); setError('');
    try {
      const created = await accountingApi.organization.createLegalEntity({
        code: entityForm.code.trim(), name: entityForm.nameEn.trim() || entityForm.nameAr.trim(),
        nameAr: entityForm.nameAr.trim(), nameEn: entityForm.nameEn.trim(), registrationNumber: entityForm.registrationNumber.trim() || undefined,
      });
      const next = [...entities, created];
      setEntities(next); updateWorkspace({ legalEntities: next });
      setEntityForm({ code: '', nameAr: '', nameEn: '', registrationNumber: '' }); setMessage(copy.entityCreated);
    } catch (requestError) { setError(apiErrorMessage(requestError, copy.entityError)); }
    finally { setBusy(''); }
  };

  const addPlatform = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy('platform'); setMessage(''); setError('');
    try {
      const created = await accountingApi.organization.createPlatformAccount({
        legalEntityId: Number(platformForm.legalEntityId), code: platformForm.code.trim(),
        name: platformForm.nameEn.trim() || platformForm.nameAr.trim(), nameAr: platformForm.nameAr.trim(), nameEn: platformForm.nameEn.trim(),
      });
      setPlatforms((current) => [...current, created]);
      setPlatformForm({ legalEntityId: '', code: '', nameAr: '', nameEn: '' }); setMessage(copy.platformCreated);
    } catch (requestError) { setError(apiErrorMessage(requestError, copy.platformError)); }
    finally { setBusy(''); }
  };

  const entityColumns = [
    { key: 'code', header: copy.code, render: (item) => <span dir="ltr">{item.code ?? item.legalEntityCode ?? '—'}</span> },
    { key: 'name', header: copy.entity, render: (item) => entityName(item, isRtl) },
    { key: 'registrationNumber', header: copy.registration, render: (item) => <span dir="ltr">{item.registrationNumber ?? item.commercialRegistrationNumber ?? '—'}</span> },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status ?? (item.isActive === false ? 'Inactive' : 'Active')} /> },
  ];
  const platformColumns = [
    { key: 'code', header: copy.platformCode, render: (item) => <span dir="ltr">{item.code ?? item.platformCode ?? '—'}</span> },
    { key: 'name', header: copy.platforms, render: (item) => entityName(item, isRtl) },
    { key: 'legalEntityName', header: copy.entity, render: (item) => item.legalEntityName ?? entityName(entities.find((entity) => String(entity.id) === String(item.legalEntityId)) ?? {}, isRtl) },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status ?? (item.isActive === false ? 'Inactive' : 'Active')} /> },
  ];

  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
    <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>{copy.refresh}</ActionButton>} />
    {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}
    {error && <ErrorState description={error} onRetry={load} compact />}
    <Panel title={copy.entities} description={copy.entitiesDescription}>
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={addEntity}>
        <FormField label={copy.code} required><input dir="ltr" required value={entityForm.code} onChange={(event) => setEntityForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
        <FormField label={copy.nameAr} required><input required value={entityForm.nameAr} onChange={(event) => setEntityForm((current) => ({ ...current, nameAr: event.target.value }))} /></FormField>
        <FormField label={copy.nameEn}><input dir="ltr" value={entityForm.nameEn} onChange={(event) => setEntityForm((current) => ({ ...current, nameEn: event.target.value }))} /></FormField>
        <FormField label={copy.registration}><input dir="ltr" value={entityForm.registrationNumber} onChange={(event) => setEntityForm((current) => ({ ...current, registrationNumber: event.target.value }))} /></FormField>
        <div className="flex items-end"><ActionButton className="w-full" type="submit" icon={Plus} loading={busy === 'entity'} loadingLabel={copy.addingEntity}>{copy.addEntity}</ActionButton></div>
      </form>
      <div className="mt-6">{loading ? <LoadingState compact /> : entities.length ? <DataTable columns={entityColumns} data={entities} rowKey="id" /> : <EmptyState icon={Building2} title={copy.noEntities} compact />}</div>
    </Panel>
    <Panel title={copy.platforms} description={copy.platformsDescription}>
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={addPlatform}>
        <FormField label={copy.entity} required><select className={controlClass} required value={platformForm.legalEntityId} onChange={(event) => setPlatformForm((current) => ({ ...current, legalEntityId: event.target.value }))}><option value="">{copy.selectEntity}</option>{entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.code ? `${entity.code} · ` : ''}{entityName(entity, isRtl)}</option>)}</select></FormField>
        <FormField label={copy.platformCode} required><input dir="ltr" required value={platformForm.code} onChange={(event) => setPlatformForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
        <FormField label={copy.platformNameAr} required><input required value={platformForm.nameAr} onChange={(event) => setPlatformForm((current) => ({ ...current, nameAr: event.target.value }))} /></FormField>
        <FormField label={copy.platformNameEn}><input dir="ltr" value={platformForm.nameEn} onChange={(event) => setPlatformForm((current) => ({ ...current, nameEn: event.target.value }))} /></FormField>
        <div className="flex items-end"><ActionButton className="w-full" type="submit" icon={Plus} loading={busy === 'platform'} loadingLabel={copy.addingPlatform} disabled={!entities.length}>{copy.addPlatform}</ActionButton></div>
      </form>
      <div className="mt-6">{loading ? <LoadingState compact /> : platforms.length ? <DataTable columns={platformColumns} data={platforms} rowKey="id" /> : <EmptyState icon={Layers3} title={copy.noPlatforms} compact />}</div>
    </Panel>
  </div>;
}
