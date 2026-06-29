'use client';

import { currentMonth, currentYear, formatMoney, normalizeList, StatBox } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { useState } from 'react';

export default function AccountantRiderProfilePage() {
  const [filters, setFilters] = useState({ riderId: '', from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, to: new Date().toISOString().slice(0, 10) });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };
  const load = async () => {
    if (!filters.riderId) return;
    setLoading(true);
    try {
      setProfile(await accountingService.riderAccounting.getProfile(filters.riderId, filters.from, filters.to));
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل حساب السائق');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">حساب السائق</h1><p className="mt-1 text-sm text-slate-600">كشف حساب السائق والرصيد والمدفوعات خلال فترة محددة.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <section className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <Input label="السائق" name="riderId" value={filters.riderId} onChange={update} />
        <Input label="من" name="from" type="date" value={filters.from} onChange={update} />
        <Input label="إلى" name="to" type="date" value={filters.to} onChange={update} />
        <div className="flex items-end"><Button onClick={load} loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">تحميل</Button></div>
      </section>
      {profile && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold">{profile.riderName}</h2>
            <p className="text-sm text-slate-500">{profile.workingId} - {profile.currentCompany} - {profile.housing}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatBox label="دخل الشركات" value={formatMoney(profile.totalCompanyEarnings)} tone="blue" />
            <StatBox label="الرواتب" value={formatMoney(profile.totalSalary)} />
            <StatBox label="المدفوع" value={formatMoney(profile.totalPaid)} tone="green" />
            <StatBox label="الرصيد" value={formatMoney(profile.currentBalance)} tone="red" />
          </div>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold">كشف الحساب</h2>
            <Table columns={[{ header: 'التاريخ', accessor: 'date' }, { header: 'النوع', accessor: 'type' }, { header: 'الوصف', accessor: 'description' }, { header: 'مدين', render: (r) => formatMoney(r.debit) }, { header: 'دائن', render: (r) => formatMoney(r.credit) }, { header: 'الرصيد', render: (r) => formatMoney(r.balance) }]} data={normalizeList(profile.statementLines)} />
          </section>
        </>
      )}
    </div>
  );
}
