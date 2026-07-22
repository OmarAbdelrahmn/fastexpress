'use client';

import { ActionButton, DataTable, EmptyState, ErrorState, LoadingState, PageHeader, Panel, StatusBadge } from '@/components/accounting/AccountingUi';
import FinanceActionForm, { FinanceTabs } from '@/components/accountant/FinanceActionForm';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { TokenManager } from '@/lib/auth/tokenManager';
import { Banknote, KeyRound, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const COPY = {
  ar: {
    eyebrow: 'الإعدادات والحوكمة', title: 'الوصول المالي', description: 'إدارة صلاحيات الكيانات وتكليف أعضاء السكن بتسليم الدفعات النقدية.',
    financial: 'صلاحيات المحاسبة', cash: 'وصول عضو التسليم النقدي', masterOnly: 'هذه الصفحة متاحة لحساب Master فقط.', noEntity: 'اختر كياناً قانونياً أولاً.',
    user: 'المستخدم', permissions: 'الصلاحيات', status: 'الحالة', housing: 'السكن', grantedBy: 'منح بواسطة', actions: 'إجراءات', remove: 'إلغاء', empty: 'لا توجد صلاحيات مسجلة.', cashEmpty: 'لا توجد تكليفات تسليم نقدي.', loadError: 'تعذر تحميل صلاحيات الوصول.', revokeError: 'تعذر إلغاء الصلاحية.',
  },
  en: {
    eyebrow: 'Setup & governance', title: 'Financial access', description: 'Manage legal-entity permissions and assign Members to housing cash delivery.',
    financial: 'Accounting permissions', cash: 'Member cash-delivery access', masterOnly: 'This page is available to the Master role only.', noEntity: 'Select a legal entity first.',
    user: 'User', permissions: 'Permissions', status: 'Status', housing: 'Housing', grantedBy: 'Granted by', actions: 'Actions', remove: 'Revoke', empty: 'No financial access has been granted.', cashEmpty: 'No cash-delivery assignments exist.', loadError: 'Access records could not be loaded.', revokeError: 'Access could not be revoked.',
  },
};

const permissionLabels = { 1: 'View', 2: 'Prepare', 4: 'Approve', 8: 'Post', 16: 'ManagePeriods', 32: 'Configure' };
const rolesFromToken = () => {
  const user = TokenManager.getUserFromToken() || {};
  const raw = user.roles ?? user.role ?? user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  return Array.isArray(raw) ? raw : [raw];
};

export default function FinancialAccessPage() {
  const { isRtl } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? COPY.ar : COPY.en;
  const [tab, setTab] = useState('financial');
  const [rows, setRows] = useState([]);
  const [cashRows, setCashRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isMaster = rolesFromToken().includes('Master');

  const load = useCallback(async () => {
    if (!legalEntityId || !isMaster) return;
    setLoading(true); setError('');
    const [financialResult, cashResult] = await Promise.allSettled([
      accountingApi.access.listByLegalEntity(legalEntityId),
      accountingApi.access.listCashDelivery({ legalEntityId, pageNumber: 1, pageSize: 100 }),
    ]);
    setRows(financialResult.status === 'fulfilled' ? financialResult.value || [] : []);
    const cashPayload = cashResult.status === 'fulfilled' ? cashResult.value : [];
    setCashRows(Array.isArray(cashPayload) ? cashPayload : cashPayload?.items || []);
    if (financialResult.status === 'rejected') setError(text.loadError);
    setLoading(false);
  }, [isMaster, legalEntityId, text.loadError]);

  useEffect(() => { load(); }, [load]);

  const tabs = useMemo(() => [
    { id: 'financial', label: { ar: COPY.ar.financial, en: COPY.en.financial }, icon: KeyRound },
    { id: 'cash', label: { ar: COPY.ar.cash, en: COPY.en.cash }, icon: Banknote },
  ], []);

  const permissionText = (mask) => Object.entries(permissionLabels).filter(([flag]) => (Number(mask) & Number(flag)) === Number(flag)).map(([, label]) => label).join(' · ') || '—';
  const financialColumns = [
    { key: 'userId', header: text.user, render: (item) => <span className="font-mono text-xs" dir="ltr">{item.userId}</span> },
    { key: 'permissions', header: text.permissions, render: (item) => permissionText(item.permissions) },
    { key: 'isActive', header: text.status, render: (item) => <StatusBadge status={item.isActive === false ? 'Inactive' : 'Active'} /> },
    { key: 'action', header: text.actions, render: (item) => <ActionButton variant="danger" icon={Trash2} onClick={async () => { try { await accountingApi.access.revoke(legalEntityId, item.userId); load(); } catch (requestError) { setError(requestError?.message || text.revokeError); } }}>{text.remove}</ActionButton> },
  ];
  const cashColumns = [
    { key: 'userId', header: text.user, render: (item) => <span className="font-mono text-xs" dir="ltr">{item.userId}</span> },
    { key: 'housingId', header: text.housing },
    { key: 'isActive', header: text.status, render: (item) => <StatusBadge status={item.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'grantedBy', header: text.grantedBy },
    { key: 'action', header: text.actions, render: (item) => <ActionButton variant="danger" icon={Trash2} onClick={async () => { try { await accountingApi.access.revokeCashDelivery(item.id); load(); } catch (requestError) { setError(requestError?.message || text.revokeError); } }}>{text.remove}</ActionButton> },
  ];

  if (!isMaster) return <EmptyState icon={ShieldAlert} title={text.masterOnly} />;
  if (!legalEntityId) return <EmptyState icon={Users} title={text.noEntity} />;

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} />
      <FinanceTabs tabs={tabs} activeId={tab} onChange={setTab} label={text.title} />
      {error && <ErrorState message={error} onRetry={load} compact />}
      {loading ? <LoadingState /> : tab === 'financial' ? (
        <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <Panel title={text.financial}>{rows.length ? <DataTable columns={financialColumns} rows={rows} getRowKey={(item) => `${item.legalEntityId}-${item.userId}`} /> : <EmptyState title={text.empty} />}</Panel>
          <FinanceActionForm
            title={{ ar: 'منح صلاحيات مالية', en: 'Grant financial permissions' }}
            fields={[
              { name: 'userId', label: { ar: 'معرف المستخدم', en: 'User ID' }, required: true, dir: 'ltr', full: true },
              { name: 'legalEntityId', label: { ar: 'الكيان القانوني', en: 'Legal entity' }, type: 'number', required: true, defaultValue: legalEntityId },
              { name: 'permissions', label: { ar: 'قناع الصلاحيات (1–63)', en: 'Permission mask (1–63)' }, type: 'number', required: true, min: 1, max: 63, defaultValue: 1, help: { ar: 'View=1، Prepare=2، Approve=4، Post=8، ManagePeriods=16، Configure=32', en: 'View=1, Prepare=2, Approve=4, Post=8, ManagePeriods=16, Configure=32' } },
            ]}
            onSubmit={async (payload) => { const response = await accountingApi.access.grant(payload); load(); return response; }}
          />
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <Panel title={text.cash}>{cashRows.length ? <DataTable columns={cashColumns} rows={cashRows} getRowKey={(item) => item.id} /> : <EmptyState title={text.cashEmpty} />}</Panel>
          <FinanceActionForm
            title={{ ar: 'تكليف عضو بتسليم النقد', en: 'Assign Member cash delivery' }}
            description={{ ar: 'يجب أن يكون المستخدم من دور Member. التأكيد الفعلي يتم من بوابة العضو فقط.', en: 'The user must have the Member role. Confirmation is completed only in the Member portal.' }}
            fields={[
              { name: 'legalEntityId', label: { ar: 'الكيان القانوني', en: 'Legal entity' }, type: 'number', required: true, defaultValue: legalEntityId },
              { name: 'userId', label: { ar: 'معرف العضو', en: 'Member user ID' }, required: true, dir: 'ltr' },
              { name: 'housingId', label: { ar: 'رقم السكن', en: 'Housing ID' }, type: 'number', required: true, min: 1 },
            ]}
            onSubmit={async (payload) => { const response = await accountingApi.access.grantCashDelivery(payload); load(); return response; }}
          />
        </div>
      )}
    </div>
  );
}
