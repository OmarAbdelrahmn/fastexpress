'use client';

import { currentMonth, currentYear, formatMoney } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { useState } from 'react';

export default function AccountantPaymentsPage() {
  const [bankForm, setBankForm] = useState({ year: currentYear, month: currentMonth, companyId: '', notes: '' });
  const [cashForm, setCashForm] = useState({ year: currentYear, month: currentMonth, housingId: '', companyId: '', notes: '' });
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }));
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };
  const submit = async (event, action, payload) => {
    event.preventDefault();
    setLoading(true);
    try {
      setBatch(await action(payload));
      showAlert('success', 'تم إنشاء دفعة الدفع');
    } catch (error) {
      showAlert('error', error?.message || 'تعذر إنشاء الدفعة');
    } finally {
      setLoading(false);
    }
  };
  const sendBank = async () => {
    if (!batch?.id) return;
    setLoading(true);
    try {
      setBatch(await accountingService.payments.sendBankBatch(batch.id));
      showAlert('success', 'تم إرسال دفعة البنك');
    } catch (error) {
      showAlert('error', error?.message || 'تعذر إرسال الدفعة');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">الدفعات</h1><p className="mt-1 text-sm text-slate-600">إنشاء دفعات البنك والكاش للسائقين حسب الشهر والشركة أو السكن.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form onSubmit={(e) => submit(e, accountingService.payments.createBankBatch, { ...bankForm, year: Number(bankForm.year), month: Number(bankForm.month), companyId: bankForm.companyId || undefined })} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">دفعة بنك</h2>
          <div className="grid grid-cols-2 gap-3"><Input label="السنة" name="year" type="number" value={bankForm.year} onChange={update(setBankForm)} /><Input label="الشهر" name="month" type="number" value={bankForm.month} onChange={update(setBankForm)} /></div>
          <Input label="الشركة" name="companyId" value={bankForm.companyId} onChange={update(setBankForm)} placeholder="اختياري" />
          <Input label="ملاحظات" name="notes" value={bankForm.notes} onChange={update(setBankForm)} />
          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">إنشاء دفعة بنك</Button>
        </form>
        <form onSubmit={(e) => submit(e, accountingService.payments.createCashBatch, { ...cashForm, year: Number(cashForm.year), month: Number(cashForm.month), housingId: cashForm.housingId || undefined, companyId: cashForm.companyId || undefined })} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">دفعة كاش</h2>
          <div className="grid grid-cols-2 gap-3"><Input label="السنة" name="year" type="number" value={cashForm.year} onChange={update(setCashForm)} /><Input label="الشهر" name="month" type="number" value={cashForm.month} onChange={update(setCashForm)} /></div>
          <div className="grid grid-cols-2 gap-3"><Input label="السكن" name="housingId" value={cashForm.housingId} onChange={update(setCashForm)} /><Input label="الشركة" name="companyId" value={cashForm.companyId} onChange={update(setCashForm)} /></div>
          <Input label="ملاحظات" name="notes" value={cashForm.notes} onChange={update(setCashForm)} />
          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">إنشاء دفعة كاش</Button>
        </form>
      </div>
      {batch && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><p className="text-sm text-slate-500">الإجمالي</p><p className="text-2xl font-bold text-blue-700">{formatMoney(batch.totalAmount)}</p></div>
            <div className="flex gap-2"><Button onClick={sendBank} disabled={loading || !batch.payments}>إرسال البنك</Button></div>
          </div>
          <Table columns={[
            { header: 'السائق', render: (row) => <div><p className="font-bold">{row.riderName}</p><p className="text-xs text-slate-500">{row.workingId}</p></div> },
            { header: 'المبلغ', render: (row) => formatMoney(row.amount) },
            { header: 'الحالة', accessor: 'status' },
            { header: 'مرجع', accessor: 'referenceNumber' },
          ]} data={batch.payments || batch.lines || []} />
        </section>
      )}
    </div>
  );
}
