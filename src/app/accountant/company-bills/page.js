'use client';

import { CompanySelect, currentMonth, currentYear, formatDate, formatMoney, normalizeList, StatBox, useAccountingCompanies } from '@/components/accountant/AccountingShared';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { CheckCircle2, FileSpreadsheet, Info, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const statusLabels = {
  0: 'جديد',
  1: 'معتمد',
  2: 'معكوس',
  Draft: 'جديد',
  Approved: 'معتمد',
  Reversed: 'معكوس',
};

const templateLabels = {
  1: 'Hunger FTR',
  2: 'Keeta Pay Per Order',
  3: 'Keeta Segment',
  4: 'Amazon',
  5: 'Generic',
};

const roleLabels = {
  0: 'بيانات',
  1: 'ملخص',
  2: 'معاملات',
  3: 'مؤشرات يومية',
};

const defaultTemplates = [
  { code: 'hunger-ftr', displayName: 'Hunger FTR' },
  { code: 'keeta-pay-per-order', displayName: 'Keeta Pay Per Order' },
  { code: 'keeta-segment', displayName: 'Keeta Segment' },
  { code: 'amazon', displayName: 'Amazon' },
  { code: 'generic', displayName: 'Generic' },
];

const labelOf = (labels, value) => labels[value] || value || '-';

export default function AccountantCompanyBillsPage() {
  const [filters, setFilters] = useState({ year: currentYear, month: currentMonth, companyId: '', templateType: '', status: '' });
  const [form, setForm] = useState({ year: currentYear, month: currentMonth, companyId: '', templateCode: 'generic', notes: '' });
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [imports, setImports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [importId, setImportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { companies, firstCompanyId, loading: companiesLoading } = useAccountingCompanies();

  const templates = useMemo(() => normalizeList(info?.templates).length ? normalizeList(info.templates) : defaultTemplates, [info]);
  const selectedTemplate = templates.find((template) => template.code === form.templateCode);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }));

  const selectCompany = (companyId) => {
    setForm((current) => ({ ...current, companyId }));
    setFilters((current) => ({ ...current, companyId }));
    setInfo(null);
  };

  useEffect(() => {
    if (firstCompanyId && !form.companyId && !filters.companyId) {
      selectCompany(firstCompanyId);
    }
  }, [firstCompanyId, form.companyId, filters.companyId]);

  const loadInfo = async (companyId = form.companyId || filters.companyId) => {
    if (!companyId) return showAlert('error', 'أدخل رقم الشركة أولا');
    setLoading(true);
    try {
      const data = await accountingService.companyBillImports.getInfo(companyId);
      setInfo(data);
      const firstTemplate = normalizeList(data?.templates)[0];
      if (firstTemplate?.code) {
        setForm((current) => ({ ...current, companyId, templateCode: firstTemplate.code }));
      }
      setFilters((current) => ({ ...current, companyId }));
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل قوالب الشركة');
    } finally {
      setLoading(false);
    }
  };

  const loadImports = async () => {
    if (!filters.companyId) return showAlert('error', 'أدخل رقم الشركة لعرض الاستيرادات');
    setLoading(true);
    try {
      const data = await accountingService.companyBillImports.list(filters.companyId, {
        year: filters.year,
        month: filters.month,
        templateType: filters.templateType,
        status: filters.status,
      });
      setImports(normalizeList(data));
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل الاستيرادات');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    event.preventDefault();
    if (!form.companyId) return showAlert('error', 'أدخل رقم الشركة أولا');
    if (!file) return showAlert('error', 'اختر ملف الفاتورة أولا');
    setLoading(true);
    try {
      const data = await accountingService.companyBillImports.importCompanyFile({
        ...form,
        file,
        uploadEndpoint: selectedTemplate?.uploadEndpoint,
      });
      setSelected(data);
      setImportId(data?.id || '');
      setFilters((current) => ({ ...current, companyId: form.companyId, year: form.year, month: form.month }));
      showAlert('success', 'تم استيراد فاتورة الشركة بنجاح');
      const listData = await accountingService.companyBillImports.list(form.companyId, {
        year: form.year,
        month: form.month,
        templateType: filters.templateType,
        status: filters.status,
      });
      setImports(normalizeList(listData));
    } catch (error) {
      showAlert('error', error?.message || 'فشل استيراد فاتورة الشركة');
    } finally {
      setLoading(false);
    }
  };

  const loadImportDetails = async (row = null) => {
    const companyId = row?.companyId || filters.companyId || form.companyId;
    const id = row?.id || importId;
    if (!companyId || !id) return showAlert('error', 'أدخل رقم الشركة ورقم الاستيراد');
    setLoading(true);
    try {
      const data = await accountingService.companyBillImports.getCompanyImportById(companyId, id);
      setSelected(data);
      setImportId(data?.id || id);
      setFilters((current) => ({ ...current, companyId }));
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تحميل تفاصيل الاستيراد');
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action) => {
    const companyId = selected?.companyId || filters.companyId || form.companyId;
    const id = selected?.id || importId;
    if (!companyId || !id) return showAlert('error', 'اختر استيراد أولا');
    setLoading(true);
    try {
      const data = action === 'approve'
        ? await accountingService.companyBillImports.approveCompanyImport(companyId, id)
        : await accountingService.companyBillImports.reverseCompanyImport(companyId, id);
      setSelected(data);
      showAlert('success', action === 'approve' ? 'تم اعتماد الاستيراد' : 'تم عكس الاستيراد');
      await loadImports();
    } catch (error) {
      showAlert('error', error?.message || 'تعذر تنفيذ العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">فواتير الشركات</h1>
        <p className="mt-1 text-sm text-slate-600">استيراد فواتير شركة محددة، مراجعة الاستيرادات، ثم الاعتماد أو العكس.</p>
      </div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <CompanySelect
            value={form.companyId}
            onChange={(event) => selectCompany(event.target.value)}
            companies={companies}
            loading={companiesLoading}
            required
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={() => loadInfo()} disabled={loading || !form.companyId} className="w-full md:w-auto">
              <Info size={18} />
              معلومات القوالب
            </Button>
          </div>
        </div>

        {info && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950">
            <span className="font-bold">{info.companyName || `شركة ${info.companyId}`}</span>
            <span className="mx-2">-</span>
            <span>{templates.length} قالب متاح</span>
          </div>
        )}

        <form onSubmit={handleImport} className="grid grid-cols-1 gap-4 lg:grid-cols-6">
          <Input label="السنة" name="year" type="number" value={form.year} onChange={update(setForm)} required />
          <Input label="الشهر" name="month" type="number" min="1" max="12" value={form.month} onChange={update(setForm)} required />
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">قالب الفاتورة <span className="text-red-500">*</span></label>
            <select name="templateCode" value={form.templateCode} onChange={update(setForm)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b428e]">
              {templates.map((template) => (
                <option key={template.code} value={template.code}>{template.displayName || template.code}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">ملف Excel <span className="text-red-500">*</span></label>
            <input type="file" accept=".xlsx,.xls" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="lg:col-span-5">
            <Input label="ملاحظات" name="notes" value={form.notes} onChange={update(setForm)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              <FileSpreadsheet size={18} />
              استيراد
            </Button>
          </div>
        </form>

        {selectedTemplate?.notes && <p className="mt-3 text-sm text-slate-600">{selectedTemplate.notes}</p>}
        {!!normalizeList(selectedTemplate?.requiredColumns).length && (
          <p className="mt-2 text-xs text-slate-500">الأعمدة المطلوبة: {selectedTemplate.requiredColumns.join('، ')}</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <CompanySelect
            value={filters.companyId}
            onChange={(event) => {
              const companyId = event.target.value;
              setFilters((current) => ({ ...current, companyId }));
              setForm((current) => ({ ...current, companyId }));
            }}
            companies={companies}
            loading={companiesLoading}
            required
          />
          <Input label="السنة" name="year" type="number" value={filters.year} onChange={update(setFilters)} />
          <Input label="الشهر" name="month" type="number" min="1" max="12" value={filters.month} onChange={update(setFilters)} />
          <Input label="نوع القالب" name="templateType" value={filters.templateType} onChange={update(setFilters)} placeholder="اختياري" />
          <Input label="الحالة" name="status" value={filters.status} onChange={update(setFilters)} placeholder="اختياري" />
          <div className="flex items-end">
            <Button type="button" onClick={loadImports} loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              <Search size={18} />
              عرض
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">الاستيرادات</h2>
        <Table
          columns={[
            { header: 'رقم', accessor: 'id' },
            { header: 'الشركة', render: (row) => row.companyName || row.companyId || '-' },
            { header: 'القالب', render: (row) => labelOf(templateLabels, row.templateType) },
            { header: 'الفترة', render: (row) => `${row.year || '-'}/${row.month || '-'}` },
            { header: 'الملف', accessor: 'sourceFileName' },
            { header: 'الصافي', render: (row) => formatMoney(row.netAmount) },
            { header: 'الحالة', render: (row) => labelOf(statusLabels, row.status) },
            { header: 'المشاكل', render: (row) => row.issueCount ?? 0 },
            { header: 'تاريخ الرفع', render: (row) => formatDate(row.uploadedAt) },
            { header: 'إجراء', render: (row) => (
              <button type="button" onClick={() => loadImportDetails(row)} className="font-semibold text-blue-700 hover:text-blue-900">
                تفاصيل
              </button>
            ) },
          ]}
          data={imports}
          loading={loading}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <Input value={importId} onChange={(event) => setImportId(event.target.value)} placeholder="رقم الاستيراد للمراجعة..." />
          <Button type="button" variant="outline" onClick={() => loadImportDetails()} disabled={!importId || loading}>
            <Search size={18} />
            تحميل
          </Button>
          <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => runAction('approve')} disabled={loading || (!selected?.id && !importId)}>
            <CheckCircle2 size={18} />
            اعتماد
          </Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => runAction('reverse')} disabled={loading || (!selected?.id && !importId)}>
            <RotateCcw size={18} />
            عكس
          </Button>
        </div>
      </section>

      {selected && (
        <section className="space-y-4 rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatBox label="إجمالي الدخل" value={formatMoney(selected.grossAmount)} tone="blue" />
            <StatBox label="الضريبة" value={formatMoney(selected.vatAmount)} tone="slate" />
            <StatBox label="الصافي" value={formatMoney(selected.netAmount)} tone="green" />
            <StatBox label="الخصومات" value={formatMoney(selected.totalDeductions)} tone="red" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
            <div><p className="text-slate-500">الشركة</p><p className="font-bold">{selected.companyName || selected.companyId || '-'}</p></div>
            <div><p className="text-slate-500">الحالة</p><p className="font-bold">{labelOf(statusLabels, selected.status)}</p></div>
            <div><p className="text-slate-500">الأوراق</p><p className="font-bold">{selected.sheetCount ?? 0}</p></div>
            <div><p className="text-slate-500">الصفوف</p><p className="font-bold">{selected.rawRowCount ?? 0}</p></div>
            <div><p className="text-slate-500">الركاب</p><p className="font-bold">{selected.riderSummaryCount ?? 0}</p></div>
            <div><p className="text-slate-500">المعاملات</p><p className="font-bold">{selected.transactionLineCount ?? 0}</p></div>
          </div>
          <div>
            <h3 className="mb-2 font-bold">الأوراق</h3>
            <Table
              columns={[
                { header: 'الاسم', accessor: 'sheetName' },
                { header: 'الدور', render: (row) => labelOf(roleLabels, row.role) },
                { header: 'صفوف', accessor: 'rowCount' },
                { header: 'أعمدة', accessor: 'columnCount' },
              ]}
              data={normalizeList(selected.sheets)}
            />
            
          </div>
          {!!normalizeList(selected.issues).length && (
            <div>
              <h3 className="mb-2 font-bold">المشاكل</h3>
              <Table
                columns={[
                  { header: 'الورقة', accessor: 'sheetName' },
                  { header: 'الصف', accessor: 'rowNumber' },
                  { header: 'العمود', accessor: 'columnName' },
                  { header: 'الوصف', render: (row) => row.message || row.description || row.issue || '-' },
                ]}
                data={normalizeList(selected.issues)}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
