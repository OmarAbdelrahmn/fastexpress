'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search, UserRound } from 'lucide-react';
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';

const COPY = {
  ar: {
    eyebrow: 'حسابات السائقين',
    title: 'الملف المالي للسائق',
    description: 'ابحث برقم الإقامة واعرض ملف السائق والبنود المالية المعرفة والمسجلة.',
    iqama: 'رقم الإقامة',
    search: 'عرض الملف',
    refresh: 'تحديث القوائم',
    types: 'أنواع البنود المالية',
    items: 'البنود المالية',
    profile: 'ملخص الملف المالي',
    noEntity: 'اختر كياناً قانونياً من شريط مساحة العمل.',
    noProfile: 'أدخل رقم إقامة لعرض الملف المالي.',
    loadError: 'تعذر تحميل بيانات السائقين المالية.',
    code: 'الرمز',
    name: 'الاسم',
    category: 'التصنيف',
    rider: 'السائق',
    amount: 'المبلغ',
    date: 'تاريخ السريان',
    status: 'الحالة',
  },
  en: {
    eyebrow: 'Rider accounting',
    title: 'Rider financial profile',
    description: 'Search by Iqama and review the rider profile, configured item types, and recorded financial items.',
    iqama: 'Iqama number',
    search: 'Open profile',
    refresh: 'Refresh lists',
    types: 'Financial item types',
    items: 'Financial items',
    profile: 'Financial profile summary',
    noEntity: 'Select a legal entity from the workspace bar.',
    noProfile: 'Enter an Iqama number to open a financial profile.',
    loadError: 'Rider accounting data could not be loaded.',
    code: 'Code',
    name: 'Name',
    category: 'Category',
    rider: 'Rider',
    amount: 'Amount',
    date: 'Effective date',
    status: 'Status',
  },
};

function rowsOf(value) {
  if (Array.isArray(value)) return value;
  return value?.items ?? value?.data ?? value?.results ?? [];
}

function profileEntries(profile) {
  if (!profile || typeof profile !== 'object') return [];
  return Object.entries(profile).filter(([, value]) => (
    value === null || ['string', 'number', 'boolean'].includes(typeof value)
  ));
}

export default function RiderFinancialProfilesPage() {
  const { isRtl, formatMoney } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? COPY.ar : COPY.en;
  const [iqamaNo, setIqamaNo] = useState('');
  const [profile, setProfile] = useState(null);
  const [itemTypes, setItemTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLists = useCallback(async () => {
    if (!legalEntityId) return;
    setLoading(true);
    setError('');
    const [typesResult, itemsResult] = await Promise.allSettled([
      accountingApi.payroll.listItemTypes({ legalEntityId }),
      accountingApi.payroll.listItems({ legalEntityId, riderIqamaNo: iqamaNo || undefined }),
    ]);
    setItemTypes(typesResult.status === 'fulfilled' ? rowsOf(typesResult.value) : []);
    setItems(itemsResult.status === 'fulfilled' ? rowsOf(itemsResult.value) : []);
    if (typesResult.status === 'rejected' || itemsResult.status === 'rejected') {
      setError(text.loadError);
    }
    setLoading(false);
  }, [iqamaNo, legalEntityId, text.loadError]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const openProfile = async (event) => {
    event.preventDefault();
    if (!legalEntityId || !iqamaNo.trim()) return;
    setLoading(true);
    setError('');
    try {
      const [profileResult, itemsResult] = await Promise.all([
        accountingApi.payroll.getRiderFinancialProfile(iqamaNo.trim(), legalEntityId),
        accountingApi.payroll.listItems({ legalEntityId, riderIqamaNo: iqamaNo.trim() }),
      ]);
      setProfile(profileResult);
      setItems(rowsOf(itemsResult));
    } catch (requestError) {
      setProfile(null);
      setError(requestError?.message || text.loadError);
    } finally {
      setLoading(false);
    }
  };

  const typeColumns = [
    { key: 'code', header: text.code, render: (row) => <span className="font-mono" dir="ltr">{row.code}</span> },
    { key: 'name', header: text.name },
    { key: 'category', header: text.category, render: (row) => <StatusBadge status={row.category ?? row.itemCategory ?? row.type} /> },
    { key: 'status', header: text.status, render: (row) => <StatusBadge status={row.status ?? (row.isActive ? 'Active' : 'Inactive')} /> },
  ];

  const itemColumns = [
    {
      key: 'riderIqamaNo',
      header: text.rider,
      render: (row) => <div className="min-w-32"><div className="font-semibold text-slate-900">{row.riderNameAr ?? row.riderNameAR ?? '—'}</div><span dir="ltr" className="text-xs text-slate-500">{row.riderIqamaNo ?? row.iqamaNo}</span></div>,
    },
    { key: 'itemTypeName', header: text.name, render: (row) => row.itemTypeName ?? row.financialItemTypeName ?? row.description },
    { key: 'amount', header: text.amount, numeric: true, render: (row) => formatMoney(row.amount ?? row.value ?? 0, row.currencyCode ?? 'SAR') },
    { key: 'effectiveDate', header: text.date, render: (row) => row.effectiveDate ?? row.transactionDate ?? row.createdAt },
    { key: 'status', header: text.status, render: (row) => <StatusBadge status={row.status ?? 'Active'} /> },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        actions={(
          <ActionButton variant="secondary" icon={RefreshCw} onClick={loadLists} loading={loading}>
            {text.refresh}
          </ActionButton>
        )}
      />

      {!legalEntityId ? <EmptyState icon={UserRound} title={text.noEntity} /> : (
        <>
          <Panel title={text.profile}>
            <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={openProfile}>
              <label className="grid flex-1 gap-1.5 text-sm font-bold text-slate-700">
                <span>{text.iqama}</span>
                <input
                  value={iqamaNo}
                  onChange={(event) => setIqamaNo(event.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  dir="ltr"
                  className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <ActionButton type="submit" icon={Search} loading={loading} disabled={!iqamaNo.trim()}>
                {text.search}
              </ActionButton>
            </form>

            {profileEntries(profile).length ? (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {profileEntries(profile).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{key}</dt>
                    <dd className="mt-1 break-words text-sm font-black text-slate-900" dir={typeof value === 'number' ? 'ltr' : undefined}>
                      {String(value ?? '—')}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : <EmptyState compact icon={UserRound} title={text.noProfile} />}
          </Panel>

          {error && <ErrorState compact message={error} onRetry={loadLists} />}

          <div className="grid gap-5 2xl:grid-cols-2">
            <Panel title={text.types}>
              <DataTable columns={typeColumns} rows={itemTypes} loading={loading} getRowKey={(row, index) => row.id ?? row.code ?? index} />
            </Panel>
            <Panel title={text.items}>
              <DataTable columns={itemColumns} rows={items} loading={loading} getRowKey={(row, index) => row.id ?? row.financialItemId ?? index} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
