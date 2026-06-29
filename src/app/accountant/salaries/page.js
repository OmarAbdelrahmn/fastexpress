'use client';

import { currentMonth, currentYear, formatMoney, normalizeList, StatBox } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { CheckCircle2, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

export default function AccountantSalariesPage() {
  const [form, setForm] = useState({ year: currentYear, month: currentMonth, companyId: '', replaceDraft: true });
  const [salaryId, setSalaryId] = useState('');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const generate = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await accountingService.salaries.generate({
        year: Number(form.year),
        month: Number(form.month),
        companyId: form.companyId || undefined,
        replaceDraft: form.replaceDraft,
      });
      setRows(normalizeList(data));
      setSelected(null);
      showAlert('success', 'تم توليد الرواتب');
    } catch (error) {
      showAlert('error', error?.message || 'تعذر توليد الرواتب');
    } finally {
      setLoading(false);
    }
  };

  const loadSalary = async () => {
    if (!salaryId) return;
    setLoading(true);
    try {
      setSelected(await accountingService.salaries.getById(salaryId));
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل الراتب');
    } finally {
      setLoading(false);
    }
  };

  const action = async (type) => {
    const id = selected?.id || salaryId;
    if (!id) return;
    setLoading(true);
    try {
      setSelected(type === 'approve' ? await accountingService.salaries.approve(id) : await accountingService.salaries.reverse(id));
      showAlert('success', type === 'approve' ? 'تم اعتماد الراتب' : 'تم عكس الراتب');
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تنفيذ العملية');
    } finally {
      setLoading(false);
    }
  };

  const totalNet = rows.reduce((sum, row) => sum + Number(row.netSalary || 0), 0);
  const totalRemaining = rows.reduce((sum, row) => sum + Number(row.remainingAmount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">الرواتب</h1><p className="mt-1 text-sm text-slate-600">توليد واعتماد رواتب السائقين حسب الشهر والشركة.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <form onSubmit={generate} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
        <Input label="السنة" name="year" type="number" value={form.year} onChange={update} required />
        <Input label="الشهر" name="month" type="number" min="1" max="12" value={form.month} onChange={update} required />
        <Input label="الشركة" name="companyId" value={form.companyId} onChange={update} placeholder="اختياري" />
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700"><input type="checkbox" name="replaceDraft" checked={form.replaceDraft} onChange={update} /> استبدال المسودات</label>
        <div className="flex items-end"><Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">توليد الرواتب</Button></div>
      </form>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBox label="عدد الرواتب" value={rows.length} />
        <StatBox label="صافي الرواتب" value={formatMoney(totalNet)} tone="blue" />
        <StatBox label="المتبقي" value={formatMoney(totalRemaining)} tone="red" />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Table columns={[
          { header: 'السائق', render: (row) => <div><p className="font-bold">{row.riderName}</p><p className="text-xs text-slate-500">{row.workingId}</p></div> },
          { header: 'الحالة', render: (row) => row.status || '-' },
          { header: 'الإجمالي', render: (row) => formatMoney(row.grossEarnings) },
          { header: 'الخصومات', render: (row) => formatMoney(row.totalDeductions) },
          { header: 'الصافي', render: (row) => <span className="font-bold text-blue-700">{formatMoney(row.netSalary)}</span> },
        ]} data={rows} loading={loading} />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <Input value={salaryId} onChange={(event) => setSalaryId(event.target.value)} placeholder="رقم الراتب..." />
          <Button variant="outline" onClick={loadSalary}><Search size={18} />تحميل</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => action('approve')}><CheckCircle2 size={18} />اعتماد</Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => action('reverse')}><RotateCcw size={18} />عكس</Button>
        </div>
        {selected && <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-white" dir="ltr">{JSON.stringify(selected, null, 2)}</pre>}
      </section>
    </div>
  );
}
