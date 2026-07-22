'use client';

import {
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { Activity, ArrowDownLeft, ArrowUpRight, Landmark, Scale, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const copy = {
  ar: {
    eyebrow: 'نظرة عامة',
    title: 'لوحة المحاسبة',
    description: 'صورة تشغيلية سريعة من دفتر الأستاذ والاعتمادات والحركة النقدية.',
    missing: 'اختر الكيان القانوني من شريط مساحة العمل لعرض بياناته المالية.',
    revenue: 'الإيرادات',
    expenses: 'المصروفات',
    netIncome: 'صافي الدخل',
    cashMovement: 'صافي الحركة النقدية',
    assets: 'إجمالي الأصول',
    approvals: 'بانتظار الاعتماد',
    approvalTitle: 'مستندات تحتاج قراراً',
    approvalDescription: 'المستندات المقدمة التي تنتظر المراجعة أو الاعتماد.',
    auditTitle: 'آخر النشاطات المحاسبية',
    auditDescription: 'أحداث التدقيق غير القابلة للتعديل في الكيان الحالي.',
    noApprovals: 'لا توجد مستندات بانتظار الاعتماد.',
    noActivity: 'لا توجد أحداث حديثة.',
    document: 'المستند',
    type: 'النوع',
    date: 'التاريخ',
    amount: 'المبلغ',
    creator: 'المنشئ',
    event: 'الحدث',
    actor: 'المنفذ',
    occurredAt: 'الوقت',
    viewReports: 'عرض التقارير',
    loadError: 'تعذر تحميل بعض بيانات لوحة المحاسبة.',
  },
  en: {
    eyebrow: 'Overview',
    title: 'Accounting dashboard',
    description: 'A concise operating view from the ledger, approvals, and cash movement.',
    missing: 'Select a legal entity from the workspace bar to view its financial data.',
    revenue: 'Revenue',
    expenses: 'Expenses',
    netIncome: 'Net income',
    cashMovement: 'Net cash movement',
    assets: 'Total assets',
    approvals: 'Pending approvals',
    approvalTitle: 'Documents requiring a decision',
    approvalDescription: 'Submitted documents waiting for review or approval.',
    auditTitle: 'Recent accounting activity',
    auditDescription: 'Immutable audit events for the selected legal entity.',
    noApprovals: 'No documents are awaiting approval.',
    noActivity: 'No recent activity.',
    document: 'Document',
    type: 'Type',
    date: 'Date',
    amount: 'Amount',
    creator: 'Created by',
    event: 'Event',
    actor: 'Actor',
    occurredAt: 'Occurred',
    viewReports: 'View reports',
    loadError: 'Some dashboard data could not be loaded.',
  },
};

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const localDate = (value) => {
    const adjusted = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
    return adjusted.toISOString().slice(0, 10);
  };
  return { fromDate: localDate(start), toDate: localDate(end) };
}

export default function AccountantDashboardPage() {
  const { isRtl } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? copy.ar : copy.en;
  const locale = isRtl ? 'ar-SA' : 'en-US';
  const dates = useMemo(monthRange, []);
  const [state, setState] = useState({ loading: true, error: '', pnl: null, balance: null, cash: null, approvals: [], audit: [] });

  const load = useCallback(async () => {
    if (!legalEntityId) {
      setState((current) => ({ ...current, loading: false }));
      return;
    }
    setState((current) => ({ ...current, loading: true, error: '' }));
    const results = await Promise.allSettled([
      accountingApi.reports.getProfitAndLoss(legalEntityId, dates),
      accountingApi.reports.getBalanceSheet(legalEntityId, dates.toDate),
      accountingApi.reports.getCashMovement(legalEntityId, dates),
      accountingApi.ledger.getApprovalInbox(legalEntityId),
      accountingApi.reports.getAuditEvents(legalEntityId, 8),
    ]);
    const value = (index, fallback) => results[index].status === 'fulfilled' ? results[index].value : fallback;
    setState({
      loading: false,
      error: results.some((result) => result.status === 'rejected') ? text.loadError : '',
      pnl: value(0, null),
      balance: value(1, null),
      cash: value(2, null),
      approvals: value(3, []) || [],
      audit: value(4, []) || [],
    });
  }, [dates, legalEntityId, text.loadError]);

  useEffect(() => { load(); }, [load]);

  const money = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(Number(value || 0));
  const date = (value) => value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '—';

  if (!legalEntityId) return <EmptyState icon={Landmark} title={text.missing} />;

  const approvalColumns = [
    { key: 'documentNumber', header: text.document, render: (item) => <Link className="font-semibold text-blue-700 hover:underline" href={`/accountant/ledger?documentId=${item.documentId}`}>{item.documentNumber}</Link> },
    { key: 'documentType', header: text.type, render: (item) => <StatusBadge status={item.documentType} /> },
    { key: 'transactionDate', header: text.date, render: (item) => date(item.transactionDate) },
    { key: 'amount', header: text.amount, numeric: true, render: (item) => money(item.amount) },
    { key: 'createdBy', header: text.creator },
  ];
  const auditColumns = [
    { key: 'eventType', header: text.event, render: (item) => <span className="font-medium text-slate-900">{item.eventType}</span> },
    { key: 'actorId', header: text.actor },
    { key: 'occurredAt', header: text.occurredAt, render: (item) => date(item.occurredAt) },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} actions={<Link className="inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800" href="/accountant/reports">{text.viewReports}</Link>} />
      {state.error && <ErrorState message={state.error} onRetry={load} compact />}
      {state.loading ? <LoadingState /> : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label={text.title}>
            <MetricCard label={text.revenue} value={money(state.pnl?.totalRevenue)} icon={ArrowUpRight} tone="success" />
            <MetricCard label={text.expenses} value={money(state.pnl?.totalExpense)} icon={ArrowDownLeft} tone="danger" />
            <MetricCard label={text.netIncome} value={money(state.pnl?.netIncome)} icon={Scale} tone={Number(state.pnl?.netIncome) < 0 ? 'danger' : 'success'} />
            <MetricCard label={text.cashMovement} value={money(state.cash?.netCashMovement)} icon={WalletCards} />
            <MetricCard label={text.assets} value={money(state.balance?.totalAssets)} icon={Landmark} />
            <MetricCard label={text.approvals} value={state.approvals.length} icon={Activity} tone={state.approvals.length ? 'warning' : 'neutral'} />
          </section>
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Panel title={text.approvalTitle} description={text.approvalDescription}>
              {state.approvals.length ? <DataTable columns={approvalColumns} rows={state.approvals} getRowKey={(item) => item.documentId} /> : <EmptyState title={text.noApprovals} />}
            </Panel>
            <Panel title={text.auditTitle} description={text.auditDescription}>
              {state.audit.length ? <DataTable columns={auditColumns} rows={state.audit} getRowKey={(item) => item.id} /> : <EmptyState title={text.noActivity} />}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
