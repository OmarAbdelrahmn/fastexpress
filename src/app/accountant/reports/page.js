'use client';

import { ActionButton, DataTable, EmptyState, ErrorState, LoadingState, MetricCard, PageHeader, Panel } from '@/components/accounting/AccountingUi';
import { FinanceTabs } from '@/components/accountant/FinanceActionForm';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { BarChart3, Banknote, BookOpenCheck, Landmark, PieChart, Printer, RefreshCw, Scale } from 'lucide-react';
import { useMemo, useState } from 'react';

const COPY = {
  ar: {
    eyebrow: 'دفتر الأستاذ', title: 'التقارير المالية', description: 'تقارير مستخرجة من القيود المرحلة مع فلاتر فترة واضحة وقيم قابلة للتدقيق.',
    trial: 'ميزان المراجعة', pnl: 'الأرباح والخسائر', balance: 'الميزانية العمومية', cash: 'الحركة النقدية', dimensions: 'أرصدة الأبعاد', audit: 'سجل التدقيق',
    from: 'من تاريخ', to: 'إلى تاريخ', asOf: 'كما في', dimensionId: 'رقم البعد', take: 'عدد الأحداث', run: 'تشغيل التقرير', print: 'طباعة',
    noEntity: 'اختر كياناً قانونياً لتشغيل التقارير.', noData: 'لا توجد بنود ضمن الفترة المحددة.', error: 'تعذر تشغيل التقرير.',
    account: 'الحساب', type: 'النوع', openingDebit: 'مدين افتتاحي', openingCredit: 'دائن افتتاحي', movementDebit: 'حركة مدينة', movementCredit: 'حركة دائنة', closingDebit: 'مدين ختامي', closingCredit: 'دائن ختامي', debit: 'مدين', credit: 'دائن', balanceValue: 'الرصيد', amount: 'المبلغ',
    revenue: 'الإيرادات', expenses: 'المصروفات', netIncome: 'صافي الدخل', assets: 'الأصول', liabilities: 'الالتزامات', equity: 'حقوق الملكية', netPosition: 'صافي المركز', inflows: 'التدفقات الداخلة', outflows: 'التدفقات الخارجة', netCash: 'صافي الحركة',
    dimension: 'قيمة البعد', event: 'الحدث', actor: 'المنفذ', occurred: 'وقت الحدث', hash: 'البصمة',
  },
  en: {
    eyebrow: 'General ledger', title: 'Financial reports', description: 'Reports derived from posted entries with explicit period filters and auditable values.',
    trial: 'Trial balance', pnl: 'Profit & loss', balance: 'Balance sheet', cash: 'Cash movement', dimensions: 'Dimension balances', audit: 'Audit log',
    from: 'From date', to: 'To date', asOf: 'As of', dimensionId: 'Dimension ID', take: 'Event count', run: 'Run report', print: 'Print',
    noEntity: 'Select a legal entity to run reports.', noData: 'No lines were found for this period.', error: 'The report could not be generated.',
    account: 'Account', type: 'Type', openingDebit: 'Opening debit', openingCredit: 'Opening credit', movementDebit: 'Movement debit', movementCredit: 'Movement credit', closingDebit: 'Closing debit', closingCredit: 'Closing credit', debit: 'Debit', credit: 'Credit', balanceValue: 'Balance', amount: 'Amount',
    revenue: 'Revenue', expenses: 'Expenses', netIncome: 'Net income', assets: 'Assets', liabilities: 'Liabilities', equity: 'Equity', netPosition: 'Net position', inflows: 'Inflows', outflows: 'Outflows', netCash: 'Net movement',
    dimension: 'Dimension value', event: 'Event', actor: 'Actor', occurred: 'Occurred', hash: 'Hash',
  },
};

function monthRange() {
  const now = new Date();
  const local = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return { fromDate: local(new Date(now.getFullYear(), now.getMonth(), 1)), toDate: local(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
}

export default function AccountingReportsPage() {
  const { isRtl } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? COPY.ar : COPY.en;
  const locale = isRtl ? 'ar-SA' : 'en-US';
  const initialDates = useMemo(monthRange, []);
  const [active, setActive] = useState('trial');
  const [filters, setFilters] = useState({ ...initialDates, asOfDate: initialDates.toDate, dimensionId: '', take: 100 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'trial', label: { ar: text.trial, en: text.trial }, icon: Scale },
    { id: 'pnl', label: { ar: text.pnl, en: text.pnl }, icon: PieChart },
    { id: 'balance', label: { ar: text.balance, en: text.balance }, icon: Landmark },
    { id: 'cash', label: { ar: text.cash, en: text.cash }, icon: Banknote },
    { id: 'dimensions', label: { ar: text.dimensions, en: text.dimensions }, icon: BarChart3 },
    { id: 'audit', label: { ar: text.audit, en: text.audit }, icon: BookOpenCheck },
  ];

  const run = async () => {
    if (!legalEntityId) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const value = active === 'trial' ? await accountingApi.reports.getTrialBalance(legalEntityId, filters)
        : active === 'pnl' ? await accountingApi.reports.getProfitAndLoss(legalEntityId, filters)
        : active === 'balance' ? await accountingApi.reports.getBalanceSheet(legalEntityId, filters.asOfDate)
        : active === 'cash' ? await accountingApi.reports.getCashMovement(legalEntityId, filters)
        : active === 'dimensions' ? await accountingApi.reports.getDimensionBalances(legalEntityId, filters.dimensionId, filters)
        : await accountingApi.reports.getAuditEvents(legalEntityId, filters.take);
      setResult(value);
    } catch (requestError) {
      setError(requestError?.errorDescription || requestError?.message || text.error);
    } finally { setLoading(false); }
  };

  const money = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(Number(value || 0));
  const numeric = (key, header) => ({ key, header, numeric: true, render: (item) => money(item[key]) });
  const account = { key: 'accountCode', header: text.account, render: (item) => <div><span className="font-mono text-xs text-slate-500" dir="ltr">{item.accountCode}</span><div className="font-medium text-slate-900">{item.accountName}</div></div> };
  const columns = active === 'trial' ? [account, { key: 'accountType', header: text.type }, numeric('openingDebit', text.openingDebit), numeric('openingCredit', text.openingCredit), numeric('movementDebit', text.movementDebit), numeric('movementCredit', text.movementCredit), numeric('closingDebit', text.closingDebit), numeric('closingCredit', text.closingCredit)]
    : active === 'pnl' ? [account, { key: 'accountType', header: text.type }, numeric('debit', text.debit), numeric('credit', text.credit), numeric('signedAmount', text.amount)]
    : active === 'balance' ? [account, { key: 'accountType', header: text.type }, numeric('debit', text.debit), numeric('credit', text.credit), numeric('balance', text.balanceValue)]
    : active === 'dimensions' ? [{ key: 'dimensionValueCode', header: text.dimension, render: (item) => <div><span className="font-mono text-xs" dir="ltr">{item.dimensionValueCode}</span><div>{item.dimensionValueName}</div></div> }, account, numeric('debit', text.debit), numeric('credit', text.credit), numeric('balance', text.balanceValue)]
    : active === 'audit' ? [{ key: 'eventType', header: text.event }, { key: 'actorId', header: text.actor }, { key: 'occurredAt', header: text.occurred, render: (item) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.occurredAt)) }, { key: 'hash', header: text.hash, render: (item) => <span className="block max-w-36 truncate font-mono text-xs" dir="ltr">{item.hash}</span> }]
    : [];
  const rows = Array.isArray(result) ? result : result?.lines || [];
  const metrics = active === 'pnl' ? [[text.revenue, result?.totalRevenue], [text.expenses, result?.totalExpense], [text.netIncome, result?.netIncome]]
    : active === 'balance' ? [[text.assets, result?.totalAssets], [text.liabilities, result?.totalLiabilities], [text.equity, result?.totalEquity], [text.netPosition, result?.netPosition]]
    : active === 'cash' ? [[text.inflows, result?.cashInflows], [text.outflows, result?.cashOutflows], [text.netCash, result?.netCashMovement]] : [];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} actions={<ActionButton variant="secondary" icon={Printer} onClick={() => window.print()} disabled={!result}>{text.print}</ActionButton>} />
      <FinanceTabs tabs={tabs} activeId={active} onChange={(id) => { setActive(id); setResult(null); setError(''); }} label={text.title} />
      <Panel>
        {!legalEntityId ? <EmptyState icon={Landmark} title={text.noEntity} /> : (
          <div className="flex flex-wrap items-end gap-3">
            {!['balance', 'audit'].includes(active) && <label className="grid gap-1 text-sm font-medium"><span>{text.from}</span><input className="min-h-11 rounded-xl border border-slate-300 px-3" type="date" value={filters.fromDate} onChange={(e) => setFilters((v) => ({ ...v, fromDate: e.target.value }))} /></label>}
            {!['balance', 'audit'].includes(active) && <label className="grid gap-1 text-sm font-medium"><span>{text.to}</span><input className="min-h-11 rounded-xl border border-slate-300 px-3" type="date" min={filters.fromDate} value={filters.toDate} onChange={(e) => setFilters((v) => ({ ...v, toDate: e.target.value }))} /></label>}
            {active === 'balance' && <label className="grid gap-1 text-sm font-medium"><span>{text.asOf}</span><input className="min-h-11 rounded-xl border border-slate-300 px-3" type="date" value={filters.asOfDate} onChange={(e) => setFilters((v) => ({ ...v, asOfDate: e.target.value }))} /></label>}
            {active === 'dimensions' && <label className="grid gap-1 text-sm font-medium"><span>{text.dimensionId}</span><input className="min-h-11 rounded-xl border border-slate-300 px-3" type="number" min="1" value={filters.dimensionId} onChange={(e) => setFilters((v) => ({ ...v, dimensionId: e.target.value }))} /></label>}
            {active === 'audit' && <label className="grid gap-1 text-sm font-medium"><span>{text.take}</span><input className="min-h-11 rounded-xl border border-slate-300 px-3" type="number" min="1" max="500" value={filters.take} onChange={(e) => setFilters((v) => ({ ...v, take: e.target.value }))} /></label>}
            <ActionButton icon={RefreshCw} onClick={run} loading={loading}>{text.run}</ActionButton>
          </div>
        )}
      </Panel>
      {error && <ErrorState message={error} onRetry={run} />}
      {loading ? <LoadingState /> : result && (
        <>
          {metrics.length > 0 && <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <MetricCard key={label} label={label} value={money(value)} />)}</section>}
          {active === 'cash' ? null : <Panel title={(isRtl ? tabs.find((tab) => tab.id === active)?.label?.ar : tabs.find((tab) => tab.id === active)?.label?.en) || text.title}>{rows.length ? <DataTable columns={columns} rows={rows} getRowKey={(item, index) => item.id || item.accountId || item.dimensionValueId || index} /> : <EmptyState title={text.noData} />}</Panel>}
        </>
      )}
    </div>
  );
}
