'use client';

import { CompanySelect, currentMonth, currentYear, formatMoney, normalizeList, useAccountingCompanies } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { useEffect, useState } from 'react';

const accountTypeLabels = {
  0: 'أصل',
  1: 'التزام',
  2: 'حقوق ملكية',
  3: 'إيراد',
  4: 'مصروف',
};

export default function AccountantReportsPage() {
  const [filters, setFilters] = useState({ companyId: '', from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, to: new Date().toISOString().slice(0, 10), accountId: '' });
  const [trial, setTrial] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { companies, firstCompanyId, loading: companiesLoading } = useAccountingCompanies();
  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };

  useEffect(() => {
    if (firstCompanyId && !filters.companyId) {
      setFilters((current) => ({ ...current, companyId: firstCompanyId }));
    }
  }, [firstCompanyId, filters.companyId]);

  const load = async () => {
    if (!filters.companyId) {
      showAlert('error', 'أدخل رقم الشركة لتحميل التقارير');
      return;
    }
    setLoading(true);
    try {
      const [trialData, ledgerData] = await Promise.all([
        accountingService.accountingReports.getTrialBalance(filters.from, filters.to, filters.companyId),
        accountingService.accountingReports.getGeneralLedger(filters.from, filters.to, filters.accountId || undefined, filters.companyId),
      ]);
      setTrial(trialData);
      setLedger(ledgerData);
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل التقارير');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">تقارير الحسابات</h1><p className="mt-1 text-sm text-slate-600">ميزان المراجعة ودفتر الأستاذ العام.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <section className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
        <CompanySelect
          value={filters.companyId}
          onChange={(event) => setFilters((current) => ({ ...current, companyId: event.target.value }))}
          companies={companies}
          loading={companiesLoading}
          required
        />
        <Input label="من" name="from" type="date" value={filters.from} onChange={update} />
        <Input label="إلى" name="to" type="date" value={filters.to} onChange={update} />
        <Input label="حساب" name="accountId" value={filters.accountId} onChange={update} placeholder="اختياري" />
        <div className="flex items-end"><Button onClick={load} loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">تحميل</Button></div>
      </section>
      {trial && <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><div className="rounded-lg bg-white p-4 shadow-sm"><p>إجمالي المدين</p><b>{formatMoney(trial.totalDebit)}</b></div><div className="rounded-lg bg-white p-4 shadow-sm"><p>إجمالي الدائن</p><b>{formatMoney(trial.totalCredit)}</b></div></div>}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">ميزان المراجعة</h2>
        <Table columns={[{ header: 'الكود', accessor: 'accountCode' }, { header: 'الحساب', accessor: 'accountName' }, { header: 'النوع', render: (r) => accountTypeLabels[r.accountType] || r.accountType || '-' }, { header: 'مدين', render: (r) => formatMoney(r.debit) }, { header: 'دائن', render: (r) => formatMoney(r.credit) }, { header: 'الرصيد', render: (r) => formatMoney(r.balance) }]} data={normalizeList(trial?.lines)} loading={loading} />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">دفتر الأستاذ</h2>
        <Table columns={[{ header: 'التاريخ', accessor: 'entryDate' }, { header: 'القيد', accessor: 'entryNumber' }, { header: 'الحساب', accessor: 'accountName' }, { header: 'مدين', render: (r) => formatMoney(r.debit) }, { header: 'دائن', render: (r) => formatMoney(r.credit) }, { header: 'الرصيد', render: (r) => formatMoney(r.runningBalance) }, { header: 'الوصف', accessor: 'description' }]} data={normalizeList(ledger?.lines)} loading={loading} />
      </section>
    </div>
  );
}
