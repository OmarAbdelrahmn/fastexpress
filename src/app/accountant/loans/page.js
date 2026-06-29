'use client';

import { currentMonth, currentYear, formatMoney } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { useState } from 'react';

export default function AccountantLoansPage() {
  const [form, setForm] = useState({ riderId: '', principalAmount: '', firstDeductionYear: currentYear, firstDeductionMonth: currentMonth, installmentCount: 1, notes: '' });
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      setLoan(await accountingService.loans.create({
        riderId: form.riderId,
        principalAmount: Number(form.principalAmount),
        firstDeductionYear: Number(form.firstDeductionYear),
        firstDeductionMonth: Number(form.firstDeductionMonth),
        installmentCount: Number(form.installmentCount),
        notes: form.notes,
      }));
      showAlert('success', 'تم إنشاء السلفة');
    } catch (error) {
      showAlert('error', error?.message || 'تعذر إنشاء السلفة');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">السلف والقروض</h1><p className="mt-1 text-sm text-slate-600">إنشاء سلفة للسائق وجدولة أقساط الخصم الشهرية.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <Input label="السائق" name="riderId" value={form.riderId} onChange={update} required />
        <Input label="مبلغ السلفة" name="principalAmount" type="number" value={form.principalAmount} onChange={update} required />
        <Input label="عدد الأقساط" name="installmentCount" type="number" min="1" value={form.installmentCount} onChange={update} required />
        <Input label="سنة أول خصم" name="firstDeductionYear" type="number" value={form.firstDeductionYear} onChange={update} required />
        <Input label="شهر أول خصم" name="firstDeductionMonth" type="number" min="1" max="12" value={form.firstDeductionMonth} onChange={update} required />
        <Input label="ملاحظات" name="notes" value={form.notes} onChange={update} />
        <div className="md:col-span-3"><Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700">إنشاء السلفة</Button></div>
      </form>
      {loan && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><p className="text-sm text-slate-500">الأصل</p><p className="font-bold">{formatMoney(loan.principalAmount)}</p></div>
            <div><p className="text-sm text-slate-500">المتبقي</p><p className="font-bold text-red-700">{formatMoney(loan.remainingAmount)}</p></div>
            <div><p className="text-sm text-slate-500">الحالة</p><p className="font-bold">{loan.status}</p></div>
          </div>
          <Table columns={[
            { header: 'السنة', accessor: 'year' },
            { header: 'الشهر', accessor: 'month' },
            { header: 'القسط', render: (row) => formatMoney(row.amount) },
            { header: 'المدفوع', render: (row) => formatMoney(row.paidAmount) },
            { header: 'الحالة', accessor: 'status' },
          ]} data={loan.installments || []} />
        </section>
      )}
    </div>
  );
}
