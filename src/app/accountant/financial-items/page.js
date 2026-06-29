'use client';

import { currentMonth, currentYear } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import { accountingService } from '@/lib/api/accountingService';
import { useState } from 'react';

export default function AccountantFinancialItemsPage() {
  const [typeForm, setTypeForm] = useState({ code: '', name: '', category: 'Deduction' });
  const [itemForm, setItemForm] = useState({
    riderFinancialItemTypeId: '',
    riderId: '',
    companyId: '',
    housingId: '',
    vehicleNumber: '',
    year: currentYear,
    month: currentMonth,
    occurredOn: new Date().toISOString().slice(0, 10),
    amount: '',
    referenceNumber: '',
    notes: '',
  });
  const [internetForm, setInternetForm] = useState({
    year: currentYear,
    month: currentMonth,
    companyId: '',
    amount: '',
    occurredOn: new Date().toISOString().slice(0, 10),
    replaceExisting: true,
    referenceNumber: '',
    notes: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };
  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const submit = async (event, action, payload) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await action(payload);
      setResult(data);
      showAlert('success', 'تم حفظ العملية المالية');
    } catch (error) {
      showAlert('error', error?.message || 'تعذر حفظ العملية المالية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">الديون والخصومات</h1><p className="mt-1 text-sm text-slate-600">إضافة أنواع البنود المالية، ديون/خصومات السائقين، وبدل الإنترنت الجماعي.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <form onSubmit={(e) => submit(e, accountingService.financialItemTypes.create, typeForm)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">نوع بند مالي</h2>
          <Input label="الكود" name="code" value={typeForm.code} onChange={update(setTypeForm)} required />
          <Input label="الاسم" name="name" value={typeForm.name} onChange={update(setTypeForm)} required />
          <Input label="التصنيف" name="category" value={typeForm.category} onChange={update(setTypeForm)} required />
          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">إضافة النوع</Button>
        </form>
        <form onSubmit={(e) => submit(e, accountingService.financialItems.create, { ...itemForm, amount: Number(itemForm.amount), year: Number(itemForm.year), month: Number(itemForm.month) })} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">بند على سائق</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="نوع البند" name="riderFinancialItemTypeId" value={itemForm.riderFinancialItemTypeId} onChange={update(setItemForm)} required />
            <Input label="السائق" name="riderId" value={itemForm.riderId} onChange={update(setItemForm)} required />
            <Input label="السنة" name="year" type="number" value={itemForm.year} onChange={update(setItemForm)} required />
            <Input label="الشهر" name="month" type="number" value={itemForm.month} onChange={update(setItemForm)} required />
            <Input label="التاريخ" name="occurredOn" type="date" value={itemForm.occurredOn} onChange={update(setItemForm)} required />
            <Input label="المبلغ" name="amount" type="number" value={itemForm.amount} onChange={update(setItemForm)} required />
          </div>
          <Input label="مرجع" name="referenceNumber" value={itemForm.referenceNumber} onChange={update(setItemForm)} />
          <Input label="ملاحظات" name="notes" value={itemForm.notes} onChange={update(setItemForm)} />
          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">حفظ البند</Button>
        </form>
        <form onSubmit={(e) => submit(e, accountingService.financialItems.createInternetReplacementBulk, { ...internetForm, amount: Number(internetForm.amount), year: Number(internetForm.year), month: Number(internetForm.month) })} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">بدل الإنترنت جماعي</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="السنة" name="year" type="number" value={internetForm.year} onChange={update(setInternetForm)} required />
            <Input label="الشهر" name="month" type="number" value={internetForm.month} onChange={update(setInternetForm)} required />
            <Input label="الشركة" name="companyId" value={internetForm.companyId} onChange={update(setInternetForm)} required />
            <Input label="المبلغ" name="amount" type="number" value={internetForm.amount} onChange={update(setInternetForm)} required />
            <Input label="التاريخ" name="occurredOn" type="date" value={internetForm.occurredOn} onChange={update(setInternetForm)} required />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" name="replaceExisting" checked={internetForm.replaceExisting} onChange={update(setInternetForm)} /> استبدال السابق</label>
          <Input label="ملاحظات" name="notes" value={internetForm.notes} onChange={update(setInternetForm)} />
          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">تطبيق جماعي</Button>
        </form>
      </div>
      {result && <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-white" dir="ltr">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
