'use client';

import { CompanySelect, currentMonth, currentYear, formatDate, formatMoney, normalizeList, StatBox, useAccountingCompanies } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { useEffect, useState } from 'react';

const today = new Date().toISOString().slice(0, 10);

export default function AccountantCompanyFinancePage() {
  const [filters, setFilters] = useState({ year: currentYear, month: currentMonth, companyId: '', from: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, to: today });
  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ companyExpenseCategoryId: '', companyId: '', expenseDate: today, amount: '', vatAmount: 0, referenceNumber: '', description: '', autoApprove: true });
  const [receiptForm, setReceiptForm] = useState({ companyReceivableId: '', companyId: '', receiptDate: today, amount: '', referenceNumber: '', bankAccount: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { companies, firstCompanyId, loading: companiesLoading } = useAccountingCompanies();

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };
  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  useEffect(() => {
    if (firstCompanyId && !filters.companyId) {
      setFilters((current) => ({ ...current, companyId: firstCompanyId }));
      setExpenseForm((current) => ({ ...current, companyId: firstCompanyId }));
      setReceiptForm((current) => ({ ...current, companyId: firstCompanyId }));
    }
  }, [firstCompanyId, filters.companyId]);

  const load = async () => {
    if (!filters.companyId) {
      showAlert('error', 'أدخل رقم الشركة لتحميل المالية');
      return;
    }
    setLoading(true);
    try {
      const params = { ...filters, year: Number(filters.year), month: Number(filters.month), companyId: filters.companyId };
      const [summaryData, incomeData, expenseData, plData] = await Promise.all([
        accountingService.companyFinance.getSummary(params),
        accountingService.companyFinance.getIncome(params),
        accountingService.companyFinance.getExpenses(params),
        accountingService.companyFinance.getProfitLoss(params),
      ]);
      setSummary(summaryData);
      setIncome(normalizeList(incomeData));
      setExpenses(normalizeList(expenseData));
      setProfitLoss(plData);
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل مالية الشركة');
    } finally {
      setLoading(false);
    }
  };

  const create = async (event, action, payload, success) => {
    event.preventDefault();
    setLoading(true);
    try {
      await action(payload);
      showAlert('success', success);
      await load();
    } catch (error) {
      showAlert('error', error?.message || 'تعذر حفظ العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-950">مالية الشركات</h1><p className="mt-1 text-sm text-slate-600">ملخص الدخل والتحصيل والمصروفات والأرباح حسب الشركة والفترة.</p></div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <section className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-6">
        <Input label="السنة" name="year" type="number" value={filters.year} onChange={update(setFilters)} />
        <Input label="الشهر" name="month" type="number" value={filters.month} onChange={update(setFilters)} />
        <CompanySelect
          value={filters.companyId}
          onChange={(event) => setFilters((current) => ({ ...current, companyId: event.target.value }))}
          companies={companies}
          loading={companiesLoading}
          required
        />
        <Input label="من" name="from" type="date" value={filters.from} onChange={update(setFilters)} />
        <Input label="إلى" name="to" type="date" value={filters.to} onChange={update(setFilters)} />
        <div className="flex items-end"><Button onClick={load} loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">تحميل</Button></div>
      </section>
      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatBox label="صافي الدخل" value={formatMoney(summary.netIncome)} tone="blue" />
          <StatBox label="المحصل" value={formatMoney(summary.collectedAmount)} tone="green" />
          <StatBox label="مستحقات معلقة" value={formatMoney(summary.pendingReceivables)} tone="red" />
          <StatBox label="الربح" value={formatMoney(summary.profit)} tone="blue" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <form onSubmit={(e) => create(e, accountingService.companyFinance.createExpense, { ...expenseForm, amount: Number(expenseForm.amount), vatAmount: Number(expenseForm.vatAmount), companyId: expenseForm.companyId || undefined }, 'تم تسجيل المصروف')} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">مصروف شركة</h2>
          <div className="grid grid-cols-2 gap-3"><Input label="تصنيف المصروف" name="companyExpenseCategoryId" value={expenseForm.companyExpenseCategoryId} onChange={update(setExpenseForm)} required /><CompanySelect value={expenseForm.companyId} onChange={(event) => setExpenseForm((current) => ({ ...current, companyId: event.target.value }))} companies={companies} loading={companiesLoading} allowEmpty placeholder="اختياري" /></div>
          <div className="grid grid-cols-3 gap-3"><Input label="التاريخ" name="expenseDate" type="date" value={expenseForm.expenseDate} onChange={update(setExpenseForm)} required /><Input label="المبلغ" name="amount" type="number" value={expenseForm.amount} onChange={update(setExpenseForm)} required /><Input label="الضريبة" name="vatAmount" type="number" value={expenseForm.vatAmount} onChange={update(setExpenseForm)} /></div>
          <Input label="الوصف" name="description" value={expenseForm.description} onChange={update(setExpenseForm)} />
          <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700">حفظ المصروف</Button>
        </form>
        <form onSubmit={(e) => create(e, accountingService.companyFinance.createReceipt, { ...receiptForm, amount: Number(receiptForm.amount), companyId: receiptForm.companyId || undefined, companyReceivableId: receiptForm.companyReceivableId || undefined }, 'تم تسجيل التحصيل')} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">تحصيل من شركة</h2>
          <div className="grid grid-cols-2 gap-3"><CompanySelect value={receiptForm.companyId} onChange={(event) => setReceiptForm((current) => ({ ...current, companyId: event.target.value }))} companies={companies} loading={companiesLoading} allowEmpty placeholder="اختياري" /><Input label="مستحق رقم" name="companyReceivableId" value={receiptForm.companyReceivableId} onChange={update(setReceiptForm)} /></div>
          <div className="grid grid-cols-2 gap-3"><Input label="التاريخ" name="receiptDate" type="date" value={receiptForm.receiptDate} onChange={update(setReceiptForm)} required /><Input label="المبلغ" name="amount" type="number" value={receiptForm.amount} onChange={update(setReceiptForm)} required /></div>
          <Input label="حساب البنك" name="bankAccount" value={receiptForm.bankAccount} onChange={update(setReceiptForm)} />
          <Button type="submit" loading={loading} className="bg-emerald-600 hover:bg-emerald-700">حفظ التحصيل</Button>
        </form>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">الدخل</h2>
        <Table columns={[{ header: 'الشركة', accessor: 'companyName' }, { header: 'الفترة', render: (r) => `${r.year}/${r.month}` }, { header: 'الصافي', render: (r) => formatMoney(r.netAmount) }, { header: 'المحصل', render: (r) => formatMoney(r.collectedAmount) }, { header: 'المعلق', render: (r) => formatMoney(r.pendingAmount) }, { header: 'الحالة', accessor: 'status' }]} data={income} loading={loading} />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">المصروفات</h2>
        <Table columns={[{ header: 'التاريخ', render: (r) => formatDate(r.expenseDate) }, { header: 'الشركة', accessor: 'companyName' }, { header: 'التصنيف', accessor: 'category' }, { header: 'المبلغ', render: (r) => formatMoney(r.amount) }, { header: 'الحالة', accessor: 'status' }, { header: 'الوصف', accessor: 'description' }]} data={expenses} loading={loading} />
      </section>
      {profitLoss && (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold">الأرباح والخسائر</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatBox label="صافي الدخل" value={formatMoney(profitLoss.netIncome)} tone="blue" />
            <StatBox label="رواتب الركاب" value={formatMoney(profitLoss.riderSalaryExpense)} tone="red" />
            <StatBox label="مصروفات الشركة" value={formatMoney(profitLoss.companyExpenses)} tone="red" />
            <StatBox label="الربح" value={formatMoney(profitLoss.profit)} tone="green" />
          </div>
          <Table
            columns={[
              { header: 'البعد', accessor: 'dimension' },
              { header: 'الاسم', accessor: 'name' },
              { header: 'الدخل', render: (row) => formatMoney(row.income) },
              { header: 'المصروفات', render: (row) => formatMoney(row.expenses) },
              { header: 'الربح', render: (row) => formatMoney(row.profit) },
            ]}
            data={normalizeList(profitLoss.breakdown)}
          />
        </section>
      )}
    </div>
  );
}
