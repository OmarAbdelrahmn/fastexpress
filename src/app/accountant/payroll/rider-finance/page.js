'use client';

import {
  ActionButton, DataTable, EmptyState, ErrorState, FormField, LoadingState,
  MetricCard, PageHeader, Panel, StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';
import { ArrowLeft, ArrowRight, Plus, RefreshCw, Search, UserRoundSearch } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  apiErrorMessage, collectionItems, enumName, formatDate, formatMoney,
  selectedLocale, todayIso,
} from '../../imports/_shared/accountingWorkspaceUtils';

const DIRECTIONS = ['', 'Earning', 'Deduction'];
const ITEM_STATUSES = ['', 'Open', 'Settled', 'Reversed'];

const COPY = {
  ar: {
    eyebrow: 'الرواتب', title: 'الملفات المالية للسائقين', description: 'استعرض ملخص السائق، عرّف أنواع البنود، وسجّل الاستحقاقات أو الاستقطاعات.', back: 'مسيرات الرواتب', refresh: 'تحديث', requiredEntity: 'اختر كياناً قانونياً أولاً.', loadError: 'تعذر تحميل البنود المالية.', actionError: 'تعذر إكمال الإجراء.',
    profile: 'ملف السائق', profileDescription: 'ابحث برقم الإقامة لعرض الحساب البنكي، السكن، المنصات، والأرصدة.', iqama: 'رقم الإقامة', search: 'بحث', name: 'الاسم', iban: 'رقم IBAN', housing: 'السكن', outstanding: 'استقطاعات معلقة', unpaid: 'رواتب غير مدفوعة', platforms: 'ملخص المنصات', platform: 'المنصة', category: 'فئة العامل', orders: 'الطلبات', billing: 'فوترة الشركة', policyPay: 'مستحق السياسة',
    typeTitle: 'تعريف نوع بند مالي', code: 'الرمز', direction: 'الاتجاه', priority: 'الأولوية', ledgerAccount: 'معرّف حساب الأستاذ', createType: 'إنشاء النوع', types: 'أنواع البنود', active: 'نشط',
    itemTitle: 'تسجيل بند مالي', itemType: 'نوع البند', reference: 'المرجع', descriptionField: 'الوصف', effectiveDate: 'تاريخ الاستحقاق', deductionStart: 'بداية الاستقطاع', amount: 'المبلغ', installments: 'عدد الأقساط', firstInstallment: 'تاريخ أول قسط', evidence: 'معرّف ملف الدليل', createItem: 'تسجيل البند', items: 'سجل البنود', status: 'الحالة', original: 'الأصل', balance: 'الرصيد', empty: 'لا توجد بنود مالية.', detail: 'تفاصيل البند', dueDate: 'الاستحقاق', scheduled: 'المجدول', applied: 'المطبق', settled: 'مسوّى',
  },
  en: {
    eyebrow: 'Payroll', title: 'Rider financial profiles', description: 'Review rider balances, configure item types, and record earnings or deductions.', back: 'Payroll runs', refresh: 'Refresh', requiredEntity: 'Select a legal entity first.', loadError: 'Financial items could not be loaded.', actionError: 'The action could not be completed.',
    profile: 'Rider profile', profileDescription: 'Search by Iqama to view bank, housing, platform, and balance details.', iqama: 'Iqama number', search: 'Search', name: 'Name', iban: 'IBAN', housing: 'Housing', outstanding: 'Outstanding deductions', unpaid: 'Unpaid payroll', platforms: 'Platform summaries', platform: 'Platform', category: 'Worker category', orders: 'Orders', billing: 'Company billing', policyPay: 'Policy earnings',
    typeTitle: 'Define financial item type', code: 'Code', direction: 'Direction', priority: 'Priority', ledgerAccount: 'Ledger account ID', createType: 'Create type', types: 'Item types', active: 'Active',
    itemTitle: 'Record financial item', itemType: 'Item type', reference: 'Reference', descriptionField: 'Description', effectiveDate: 'Effective date', deductionStart: 'Deduction start', amount: 'Amount', installments: 'Installment count', firstInstallment: 'First installment date', evidence: 'Evidence file ID', createItem: 'Record item', items: 'Financial item register', status: 'Status', original: 'Original', balance: 'Outstanding', empty: 'No financial items.', detail: 'Item detail', dueDate: 'Due date', scheduled: 'Scheduled', applied: 'Applied', settled: 'Settled',
  },
};

export default function RiderFinancePage() {
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [types, setTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const [profileIqama, setProfileIqama] = useState('');
  const [profile, setProfile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [typeForm, setTypeForm] = useState({ code: '', name: '', direction: '2', priority: '100', ledgerAccountId: '' });
  const [itemForm, setItemForm] = useState({ riderIqamaNo: '', riderFinancialItemTypeId: '', reference: '', description: '', effectiveDate: todayIso(), deductionStartDate: '', amount: '', installmentCount: '', firstInstallmentDate: '', evidenceFileId: '' });

  const load = useCallback(async () => {
    if (!legalEntityId) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const [typePayload, itemPayload] = await Promise.all([accountingApi.payroll.listItemTypes({ legalEntityId: Number(legalEntityId), pageNumber: 1, pageSize: 200 }), accountingApi.payroll.listItems({ legalEntityId: Number(legalEntityId), pageNumber: 1, pageSize: 100 })]);
      setTypes(collectionItems(typePayload)); setItems(collectionItems(itemPayload));
    } catch (requestError) { setError(apiErrorMessage(requestError, copy.loadError)); }
    finally { setLoading(false); }
  }, [copy.loadError, legalEntityId]);
  useEffect(() => { load(); }, [load]);

  const action = async (name, task, after) => {
    if (busy) return;
    setBusy(name); setActionError('');
    try { const result = await task(); await load(); after?.(result); }
    catch (requestError) { setActionError(apiErrorMessage(requestError, copy.actionError)); }
    finally { setBusy(''); }
  };
  const lookupProfile = async (event) => {
    event.preventDefault(); setBusy('profile'); setActionError('');
    try { setProfile(await accountingApi.payroll.getRiderFinancialProfile(Number(profileIqama), Number(legalEntityId))); }
    catch (requestError) { setActionError(apiErrorMessage(requestError, copy.actionError)); setProfile(null); }
    finally { setBusy(''); }
  };
  const createType = (event) => { event.preventDefault(); action('type', () => accountingApi.payroll.createFinancialItemType({ legalEntityId: Number(legalEntityId), code: typeForm.code.trim(), name: typeForm.name.trim(), direction: Number(typeForm.direction), priority: Number(typeForm.priority), ledgerAccountId: Number(typeForm.ledgerAccountId) }), () => setTypeForm({ code: '', name: '', direction: '2', priority: '100', ledgerAccountId: '' })); };
  const createItem = (event) => { event.preventDefault(); action('item', () => accountingApi.payroll.createFinancialItem({ legalEntityId: Number(legalEntityId), riderIqamaNo: Number(itemForm.riderIqamaNo), riderFinancialItemTypeId: Number(itemForm.riderFinancialItemTypeId), reference: itemForm.reference.trim(), description: itemForm.description.trim(), effectiveDate: itemForm.effectiveDate, deductionStartDate: itemForm.deductionStartDate || null, amount: Number(itemForm.amount), installmentCount: itemForm.installmentCount ? Number(itemForm.installmentCount) : null, firstInstallmentDate: itemForm.firstInstallmentDate || null, evidenceFileId: itemForm.evidenceFileId.trim() || null }), () => setItemForm((current) => ({ ...current, reference: '', description: '', amount: '', installmentCount: '', firstInstallmentDate: '', evidenceFileId: '' }))); };
  const inspectItem = async (item) => { setBusy(`item-${item.id}`); setActionError(''); try { setSelectedItem(await accountingApi.payroll.getItem(item.id)); } catch (requestError) { setActionError(apiErrorMessage(requestError, copy.actionError)); } finally { setBusy(''); } };

  const typeColumns = [{ key: 'code', header: copy.code, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.code}</span> }, { key: 'name', header: copy.name }, { key: 'direction', header: copy.direction, render: (item) => enumName(item.direction, DIRECTIONS) }, { key: 'priority', header: copy.priority, align: 'end' }, { key: 'ledgerAccountId', header: copy.ledgerAccount, align: 'end' }, { key: 'isActive', header: copy.active, render: (item) => <StatusBadge status={item.isActive ? 'Active' : 'Inactive'} /> }];
  const itemColumns = [{ key: 'reference', header: copy.reference, render: (item) => <button type="button" className="font-bold text-blue-700 hover:underline" onClick={() => inspectItem(item)}>{item.reference}</button> }, { key: 'riderIqamaNo', header: copy.iqama, render: (item) => <span dir="ltr">{item.riderIqamaNo}</span> }, { key: 'typeCode', header: copy.itemType, render: (item) => <span dir="ltr" className="font-mono text-xs">{item.typeCode}</span> }, { key: 'effectiveDate', header: copy.effectiveDate, render: (item) => formatDate(item.effectiveDate, locale) }, { key: 'originalAmount', header: copy.original, align: 'end', render: (item) => formatMoney(item.originalAmount, locale) }, { key: 'outstandingAmount', header: copy.balance, align: 'end', render: (item) => formatMoney(item.outstandingAmount, locale) }, { key: 'status', header: copy.status, render: (item) => <StatusBadge status={enumName(item.status, ITEM_STATUSES)} /> }];
  const platformColumns = [{ key: 'platformAccountId', header: copy.platform }, { key: 'workerCategory', header: copy.category }, { key: 'acceptedOrders', header: copy.orders, align: 'end' }, { key: 'companyBilling', header: copy.billing, align: 'end', render: (item) => formatMoney(item.companyBilling, locale) }, { key: 'riderPolicyEarnings', header: copy.policyPay, align: 'end', render: (item) => formatMoney(item.riderPolicyEarnings, locale) }];
  const installmentColumns = [{ key: 'sequence', header: '#' }, { key: 'dueDate', header: copy.dueDate, render: (item) => formatDate(item.dueDate, locale) }, { key: 'scheduledAmount', header: copy.scheduled, align: 'end', render: (item) => formatMoney(item.scheduledAmount, locale) }, { key: 'appliedAmount', header: copy.applied, align: 'end', render: (item) => formatMoney(item.appliedAmount, locale) }, { key: 'isSettled', header: copy.settled, render: (item) => <StatusBadge status={item.isSettled ? 'Paid' : 'Pending'} /> }];

  return <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
    <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} actions={<div className="flex gap-2"><Link href="/accountant/payroll" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BackIcon size={17} />{copy.back}</Link><ActionButton variant="secondary" icon={RefreshCw} onClick={load}>{copy.refresh}</ActionButton></div>} />
    {!legalEntityId ? <EmptyState icon={UserRoundSearch} title={copy.requiredEntity} /> : <>
      {actionError && <ErrorState description={actionError} compact />}
      <Panel title={copy.profile} description={copy.profileDescription}>
        <form className="flex flex-wrap items-end gap-3" onSubmit={lookupProfile}><FormField label={copy.iqama} required className="min-w-64 flex-1"><input dir="ltr" inputMode="numeric" required value={profileIqama} onChange={(event) => setProfileIqama(event.target.value)} /></FormField><ActionButton type="submit" icon={Search} loading={busy === 'profile'}>{copy.search}</ActionButton></form>
        {profile && <div className="mt-5 space-y-4 border-t border-slate-200 pt-5"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><MetricCard label={copy.name} value={profile.name} /><MetricCard label={copy.iban} value={profile.iban || '—'} /><MetricCard label={copy.housing} value={profile.housingId || '—'} /><MetricCard label={copy.outstanding} value={formatMoney(profile.outstandingDeductions, locale)} tone="warning" /><MetricCard label={copy.unpaid} value={formatMoney(profile.unpaidPayroll, locale)} tone="success" /></section><DataTable columns={platformColumns} data={collectionItems(profile.platforms)} rowKey={(item) => `${item.platformAccountId}-${item.workerCategory}`} emptyTitle={copy.platforms} /></div>}
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={copy.typeTitle}><form className="grid gap-4 md:grid-cols-2" onSubmit={createType}><FormField label={copy.code} required><input dir="ltr" required value={typeForm.code} onChange={(event) => setTypeForm((current) => ({ ...current, code: event.target.value }))} /></FormField><FormField label={copy.name} required><input required value={typeForm.name} onChange={(event) => setTypeForm((current) => ({ ...current, name: event.target.value }))} /></FormField><FormField label={copy.direction} required><select value={typeForm.direction} onChange={(event) => setTypeForm((current) => ({ ...current, direction: event.target.value }))}><option value="1">Earning</option><option value="2">Deduction</option></select></FormField><FormField label={copy.priority} required><input type="number" required value={typeForm.priority} onChange={(event) => setTypeForm((current) => ({ ...current, priority: event.target.value }))} /></FormField><FormField label={copy.ledgerAccount} required><input type="number" min="1" required value={typeForm.ledgerAccountId} onChange={(event) => setTypeForm((current) => ({ ...current, ledgerAccountId: event.target.value }))} /></FormField><div className="flex items-end"><ActionButton className="w-full" type="submit" icon={Plus} loading={busy === 'type'}>{copy.createType}</ActionButton></div></form></Panel>
        <Panel title={copy.itemTitle}><form className="grid gap-4 md:grid-cols-2" onSubmit={createItem}><FormField label={copy.iqama} required><input dir="ltr" inputMode="numeric" required value={itemForm.riderIqamaNo} onChange={(event) => setItemForm((current) => ({ ...current, riderIqamaNo: event.target.value }))} /></FormField><FormField label={copy.itemType} required><select required value={itemForm.riderFinancialItemTypeId} onChange={(event) => setItemForm((current) => ({ ...current, riderFinancialItemTypeId: event.target.value }))}><option value="">{copy.itemType}</option>{types.map((type) => <option key={type.id} value={type.id}>{type.code} · {type.name}</option>)}</select></FormField><FormField label={copy.reference} required><input dir="ltr" required value={itemForm.reference} onChange={(event) => setItemForm((current) => ({ ...current, reference: event.target.value }))} /></FormField><FormField label={copy.descriptionField} required><input required value={itemForm.description} onChange={(event) => setItemForm((current) => ({ ...current, description: event.target.value }))} /></FormField><FormField label={copy.effectiveDate} required><input type="date" required value={itemForm.effectiveDate} onChange={(event) => setItemForm((current) => ({ ...current, effectiveDate: event.target.value }))} /></FormField><FormField label={copy.amount} required><input type="number" min="0.01" step="0.01" required value={itemForm.amount} onChange={(event) => setItemForm((current) => ({ ...current, amount: event.target.value }))} /></FormField><FormField label={copy.deductionStart}><input type="date" value={itemForm.deductionStartDate} onChange={(event) => setItemForm((current) => ({ ...current, deductionStartDate: event.target.value }))} /></FormField><FormField label={copy.installments}><input type="number" min="1" value={itemForm.installmentCount} onChange={(event) => setItemForm((current) => ({ ...current, installmentCount: event.target.value }))} /></FormField><FormField label={copy.firstInstallment} required={Boolean(itemForm.installmentCount)}><input type="date" required={Boolean(itemForm.installmentCount)} value={itemForm.firstInstallmentDate} onChange={(event) => setItemForm((current) => ({ ...current, firstInstallmentDate: event.target.value }))} /></FormField><FormField label={copy.evidence}><input dir="ltr" value={itemForm.evidenceFileId} onChange={(event) => setItemForm((current) => ({ ...current, evidenceFileId: event.target.value }))} /></FormField><div className="md:col-span-2 flex justify-end"><ActionButton type="submit" icon={Plus} loading={busy === 'item'}>{copy.createItem}</ActionButton></div></form></Panel>
      </div>
      <Panel title={copy.types}>{loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : <DataTable columns={typeColumns} data={types} rowKey="id" />}</Panel>
      <Panel title={copy.items}>{loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : <DataTable columns={itemColumns} data={items} rowKey="id" emptyTitle={copy.empty} />}</Panel>
      {selectedItem && <Panel title={`${copy.detail}: ${selectedItem.reference}`} actions={<ActionButton variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>{copy.status}</ActionButton>}><div className="mb-4 grid gap-3 sm:grid-cols-3"><MetricCard label={copy.original} value={formatMoney(selectedItem.originalAmount, locale)} /><MetricCard label={copy.balance} value={formatMoney(selectedItem.outstandingAmount, locale)} /><MetricCard label={copy.status} value={<StatusBadge status={enumName(selectedItem.status, ITEM_STATUSES)} />} /></div><DataTable columns={installmentColumns} data={collectionItems(selectedItem.installments)} rowKey="id" /></Panel>}
    </>}
  </div>;
}
