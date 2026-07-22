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
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { Building2, Layers3, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage, collectionItems, controlClass } from '../imports/_shared/accountingWorkspaceUtils';

const COPY = {
  ar: {
    eyebrow: 'إعدادات النظام المالي', title: 'الكيانات القانونية والمنصات', description: 'أضف الكيانات القانونية وحسابات المنصات ليتمكن فريق المحاسبة من استخدامها في الاستيراد والرواتب.',
    refresh: 'تحديث', entities: 'الكيانات القانونية', entitiesDescription: 'تظهر الكيانات الجديدة فوراً في قائمة مساحة العمل.', code: 'الرمز', name: 'الاسم القانوني', tenant: 'معرّف المستأجر', currency: 'العملة الأساسية', registration: 'الرقم الضريبي', addEntity: 'إضافة كيان قانوني', addingEntity: 'جارٍ إضافة الكيان…',
    platforms: 'حسابات المنصات', platformsDescription: 'اربط حساب كل منصة بالكيان القانوني الذي تعمل ضمنه.', platformCode: 'رمز المنصة', platformName: 'اسم المنصة', externalReference: 'المرجع الخارجي', entity: 'الكيان القانوني', addPlatform: 'إضافة حساب منصة', addingPlatform: 'جارٍ إضافة الحساب…',
    selectEntity: 'اختر كياناً قانونياً', entityCreated: 'تمت إضافة الكيان القانوني.', entityUpdated: 'تم تحديث الكيان القانوني.', platformCreated: 'تمت إضافة حساب المنصة.', platformUpdated: 'تم تحديث حساب المنصة.', entityError: 'تعذر حفظ الكيان القانوني.', platformError: 'تعذر حفظ حساب المنصة.', loadError: 'تعذر تحميل الإعدادات.', noEntities: 'لا توجد كيانات قانونية بعد.', noPlatforms: 'لا توجد حسابات منصات بعد.', active: 'نشط', status: 'الحالة', edit: 'تعديل', delete: 'إيقاف', cancelEdit: 'إلغاء التعديل', updateEntity: 'حفظ التعديلات', updatePlatform: 'حفظ التعديلات', retireEntityTitle: 'إيقاف الكيان القانوني؟', retireEntityDescription: 'سيتم إيقاف الكيان وحسابات المنصات المرتبطة به بأمان.', retirePlatformTitle: 'إيقاف حساب المنصة؟', retirePlatformDescription: 'لن يكون الحساب متاحاً للاستيرادات أو السياسات الجديدة.', confirmRetire: 'إيقاف', retireError: 'تعذر إيقاف السجل.',
  },
  en: {
    eyebrow: 'Finance configuration', title: 'Legal entities & platforms', description: 'Add legal entities and platform accounts for use in imports and payroll.',
    refresh: 'Refresh', entities: 'Legal entities', entitiesDescription: 'New entities immediately appear in the workspace selector.', code: 'Code', name: 'Legal name', tenant: 'Tenant ID', currency: 'Base currency', registration: 'Tax registration number', addEntity: 'Add legal entity', addingEntity: 'Adding entity…',
    platforms: 'Platform accounts', platformsDescription: 'Link each platform account to the legal entity that operates it.', platformCode: 'Platform code', platformName: 'Platform name', externalReference: 'External account reference', entity: 'Legal entity', addPlatform: 'Add platform account', addingPlatform: 'Adding account…',
    selectEntity: 'Select a legal entity', entityCreated: 'Legal entity added.', entityUpdated: 'Legal entity updated.', platformCreated: 'Platform account added.', platformUpdated: 'Platform account updated.', entityError: 'The legal entity could not be saved.', platformError: 'The platform account could not be saved.', loadError: 'Configuration could not be loaded.', noEntities: 'No legal entities yet.', noPlatforms: 'No platform accounts yet.', active: 'Active', status: 'Status', edit: 'Edit', delete: 'Retire', cancelEdit: 'Cancel edit', updateEntity: 'Save changes', updatePlatform: 'Save changes', retireEntityTitle: 'Retire legal entity?', retireEntityDescription: 'This safely retires the entity and its attached platform accounts.', retirePlatformTitle: 'Retire platform account?', retirePlatformDescription: 'The account will no longer be available for new imports or policies.', confirmRetire: 'Retire', retireError: 'The record could not be retired.',
  },
};

function entityName(entity, isRtl) {
  return isRtl
    ? entity.legalName ?? entity.platformName ?? entity.name ?? entity.code
    : entity.legalName ?? entity.platformName ?? entity.name ?? entity.code;
}

export default function AccountingSetupPage() {
  const { isRtl } = useAccountingI18n();
  const copy = isRtl ? COPY.ar : COPY.en;
  const { updateWorkspace } = useAccountingWorkspace();
  const [entities, setEntities] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityForm, setEntityForm] = useState({ tenantId: '1', code: '', legalName: '', baseCurrencyCode: 'SAR', taxRegistrationNumber: '' });
  const [platformForm, setPlatformForm] = useState({ legalEntityId: '', code: '', platformName: '', externalAccountReference: '' });
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [retiring, setRetiring] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const entityResponse = await accountingApi.organization.listLegalEntities({ pageNumber: 1, pageSize: 100, active: true, sortBy: 'code', sortDirection: 'asc' });
      const nextEntities = collectionItems(entityResponse);
      const platformResponses = await Promise.all(nextEntities.map(async (entity) => {
        const response = await accountingApi.organization.listPlatformAccounts({ legalEntityId: entity.id, pageNumber: 1, pageSize: 100, active: true, sortBy: 'code', sortDirection: 'asc' });
        return collectionItems(response).map((platform) => ({ ...platform, legalEntityId: platform.legalEntityId ?? entity.id }));
      }));
      setEntities(nextEntities);
      setPlatforms(platformResponses.flat());
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
      const payload = { code: entityForm.code.trim(), legalName: entityForm.legalName.trim(), baseCurrencyCode: entityForm.baseCurrencyCode.trim().toUpperCase(), taxRegistrationNumber: entityForm.taxRegistrationNumber.trim() || null, ...(editingEntity ? { isActive: true } : { tenantId: Number(entityForm.tenantId) }) };
      const created = editingEntity
        ? await accountingApi.organization.updateLegalEntity(editingEntity.id, payload)
        : await accountingApi.organization.createLegalEntity(payload);
      const next = editingEntity ? entities.map((item) => item.id === created.id ? created : item) : [...entities, created];
      setEntities(next); updateWorkspace({ legalEntities: next });
      setEntityForm({ tenantId: entityForm.tenantId, code: '', legalName: '', baseCurrencyCode: 'SAR', taxRegistrationNumber: '' }); setEditingEntity(null); setMessage(editingEntity ? copy.entityUpdated : copy.entityCreated);
    } catch (requestError) { setError(apiErrorMessage(requestError, copy.entityError)); }
    finally { setBusy(''); }
  };

  const addPlatform = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy('platform'); setMessage(''); setError('');
    try {
      const payload = { code: platformForm.code.trim(), platformName: platformForm.platformName.trim(), externalAccountReference: platformForm.externalAccountReference.trim() || null, ...(editingPlatform ? { isActive: true } : { legalEntityId: Number(platformForm.legalEntityId) }) };
      const created = editingPlatform ? await accountingApi.organization.updatePlatformAccount(editingPlatform.id, payload) : await accountingApi.organization.createPlatformAccount(payload);
      setPlatforms((current) => editingPlatform ? current.map((item) => item.id === created.id ? { ...created, legalEntityId: item.legalEntityId } : item) : [...current, created]);
      setPlatformForm({ legalEntityId: '', code: '', platformName: '', externalAccountReference: '' }); setEditingPlatform(null); setMessage(editingPlatform ? copy.platformUpdated : copy.platformCreated);
    } catch (requestError) { setError(apiErrorMessage(requestError, copy.platformError)); }
    finally { setBusy(''); }
  };

  const beginEntityEdit = (item) => { setEditingPlatform(null); setEditingEntity(item); setEntityForm({ tenantId: String(item.tenantId), code: item.code ?? '', legalName: item.legalName ?? '', baseCurrencyCode: item.baseCurrencyCode ?? 'SAR', taxRegistrationNumber: item.taxRegistrationNumber ?? '' }); };
  const beginPlatformEdit = (item) => { setEditingEntity(null); setEditingPlatform(item); setPlatformForm({ legalEntityId: String(item.legalEntityId), code: item.code ?? '', platformName: item.platformName ?? '', externalAccountReference: item.externalAccountReference ?? '' }); };
  const retire = async () => {
    if (!retiring || busy) return;
    setBusy(`retire-${retiring.type}`); setError('');
    try {
      if (retiring.type === 'entity') { await accountingApi.organization.deleteLegalEntity(retiring.item.id); await load(); }
      else { const updated = await accountingApi.organization.deletePlatformAccount(retiring.item.id); setPlatforms((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); }
      setMessage(retiring.type === 'entity' ? copy.retireEntityTitle : copy.retirePlatformTitle); setRetiring(null);
    } catch (requestError) { setError(apiErrorMessage(requestError, copy.retireError)); }
    finally { setBusy(''); }
  };

  const entityColumns = [
    { key: 'code', header: copy.code, render: (item) => <span dir="ltr">{item.code ?? item.legalEntityCode ?? '—'}</span> },
    { key: 'name', header: copy.entity, render: (item) => entityName(item, isRtl) },
    { key: 'baseCurrencyCode', header: copy.currency, render: (item) => <span dir="ltr">{item.baseCurrencyCode ?? '—'}</span> },
    { key: 'taxRegistrationNumber', header: copy.registration, render: (item) => <span dir="ltr">{item.taxRegistrationNumber ?? '—'}</span> },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status ?? (item.isActive === false ? 'Inactive' : 'Active')} /> },
    { key: 'actions', header: '', render: (item) => <div className="flex gap-1"><ActionButton size="sm" variant="ghost" icon={Pencil} onClick={() => beginEntityEdit(item)}>{copy.edit}</ActionButton><ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => setRetiring({ type: 'entity', item })}>{copy.delete}</ActionButton></div> },
  ];
  const platformColumns = [
    { key: 'code', header: copy.platformCode, render: (item) => <span dir="ltr">{item.code ?? item.platformCode ?? '—'}</span> },
    { key: 'name', header: copy.platforms, render: (item) => entityName(item, isRtl) },
    { key: 'legalEntityName', header: copy.entity, render: (item) => item.legalEntityName ?? entityName(entities.find((entity) => String(entity.id) === String(item.legalEntityId)) ?? {}, isRtl) },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status ?? (item.isActive === false ? 'Inactive' : 'Active')} /> },
    { key: 'actions', header: '', render: (item) => <div className="flex gap-1"><ActionButton size="sm" variant="ghost" icon={Pencil} onClick={() => beginPlatformEdit(item)}>{copy.edit}</ActionButton><ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => setRetiring({ type: 'platform', item })}>{copy.delete}</ActionButton></div> },
  ];

  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
    <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>{copy.refresh}</ActionButton>} />
    {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}
    {error && <ErrorState description={error} onRetry={load} compact />}
    <Panel title={copy.entities} description={copy.entitiesDescription}>
      {editingEntity && <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900"><span>{copy.updateEntity}: {editingEntity.legalName}</span><ActionButton size="sm" variant="ghost" icon={X} onClick={() => { setEditingEntity(null); setEntityForm({ tenantId: entityForm.tenantId, code: '', legalName: '', baseCurrencyCode: 'SAR', taxRegistrationNumber: '' }); }}>{copy.cancelEdit}</ActionButton></div>}
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={addEntity}>
        <FormField label={copy.tenant} required><input dir="ltr" type="number" min="1" required value={entityForm.tenantId} onChange={(event) => setEntityForm((current) => ({ ...current, tenantId: event.target.value }))} /></FormField>
        <FormField label={copy.code} required><input dir="ltr" required value={entityForm.code} onChange={(event) => setEntityForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
        <FormField label={copy.name} required><input required value={entityForm.legalName} onChange={(event) => setEntityForm((current) => ({ ...current, legalName: event.target.value }))} /></FormField>
        <FormField label={copy.currency} required><input dir="ltr" maxLength="3" required value={entityForm.baseCurrencyCode} onChange={(event) => setEntityForm((current) => ({ ...current, baseCurrencyCode: event.target.value }))} /></FormField>
        <FormField label={copy.registration}><input dir="ltr" value={entityForm.taxRegistrationNumber} onChange={(event) => setEntityForm((current) => ({ ...current, taxRegistrationNumber: event.target.value }))} /></FormField>
        <div className="flex items-end"><ActionButton className="w-full" type="submit" icon={editingEntity ? Pencil : Plus} loading={busy === 'entity'} loadingLabel={copy.addingEntity}>{editingEntity ? copy.updateEntity : copy.addEntity}</ActionButton></div>
      </form>
      <div className="mt-6">{loading ? <LoadingState compact /> : entities.length ? <DataTable columns={entityColumns} data={entities} rowKey="id" /> : <EmptyState icon={Building2} title={copy.noEntities} compact />}</div>
    </Panel>
    <Panel title={copy.platforms} description={copy.platformsDescription}>
      {editingPlatform && <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900"><span>{copy.updatePlatform}: {editingPlatform.platformName}</span><ActionButton size="sm" variant="ghost" icon={X} onClick={() => { setEditingPlatform(null); setPlatformForm({ legalEntityId: '', code: '', platformName: '', externalAccountReference: '' }); }}>{copy.cancelEdit}</ActionButton></div>}
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={addPlatform}>
        <FormField label={copy.entity} required><select className={controlClass} required value={platformForm.legalEntityId} onChange={(event) => setPlatformForm((current) => ({ ...current, legalEntityId: event.target.value }))}><option value="">{copy.selectEntity}</option>{entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.code ? `${entity.code} · ` : ''}{entityName(entity, isRtl)}</option>)}</select></FormField>
        <FormField label={copy.platformCode} required><input dir="ltr" required value={platformForm.code} onChange={(event) => setPlatformForm((current) => ({ ...current, code: event.target.value }))} /></FormField>
        <FormField label={copy.platformName} required><input required value={platformForm.platformName} onChange={(event) => setPlatformForm((current) => ({ ...current, platformName: event.target.value }))} /></FormField>
        <FormField label={copy.externalReference}><input dir="ltr" value={platformForm.externalAccountReference} onChange={(event) => setPlatformForm((current) => ({ ...current, externalAccountReference: event.target.value }))} /></FormField>
        <div className="flex items-end"><ActionButton className="w-full" type="submit" icon={editingPlatform ? Pencil : Plus} loading={busy === 'platform'} loadingLabel={copy.addingPlatform} disabled={!entities.length}>{editingPlatform ? copy.updatePlatform : copy.addPlatform}</ActionButton></div>
      </form>
      <div className="mt-6">{loading ? <LoadingState compact /> : platforms.length ? <DataTable columns={platformColumns} data={platforms} rowKey="id" /> : <EmptyState icon={Layers3} title={copy.noPlatforms} compact />}</div>
    </Panel>
    <ConfirmDialog open={Boolean(retiring)} title={retiring?.type === 'entity' ? copy.retireEntityTitle : copy.retirePlatformTitle} description={retiring?.type === 'entity' ? copy.retireEntityDescription : copy.retirePlatformDescription} confirmLabel={copy.confirmRetire} cancelLabel={copy.cancelEdit} tone="danger" loading={busy.startsWith('retire-')} onConfirm={retire} onCancel={() => setRetiring(null)} />
  </div>;
}
