'use client';

import AccountantBillForm from '@/components/accountant/AccountantBillForm';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { Edit, Eye, FileText, Plus, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function AccountantBillsPage() {
  const [bills, setBills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [billData, supplierData] = await Promise.all([
        accountingService.bills.list(),
        accountingService.suppliers.list(),
      ]);
      setBills(Array.isArray(billData) ? billData : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return bills.filter((bill) => {
      const matchesSearch =
        !term ||
        bill.invoiceNumber?.toLowerCase().includes(term) ||
        bill.supplierName?.toLowerCase().includes(term);
      const matchesSupplier = !supplierFilter || String(bill.supplierId) === String(supplierFilter);
      return matchesSearch && matchesSupplier;
    });
  }, [bills, searchQuery, supplierFilter]);

  const totalAmount = filteredBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);

  const openCreateForm = () => {
    setEditingBill(null);
    setFormOpen(true);
  };

  const openEditForm = async (bill) => {
    try {
      const data = await accountingService.bills.getById(bill.id);
      setEditingBill(data);
      setFormOpen(true);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء جلب تفاصيل الفاتورة');
    }
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingBill(null);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editingBill) {
        await accountingService.bills.update(editingBill.id, payload);
        showAlert('success', 'تم تحديث الفاتورة بنجاح');
      } else {
        await accountingService.bills.create(payload);
        showAlert('success', 'تم إضافة الفاتورة بنجاح');
      }
      closeForm();
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bill) => {
    if (!confirm(`هل أنت متأكد من حذف الفاتورة ${bill.invoiceNumber || ''}؟`)) return;

    try {
      await accountingService.bills.delete(bill.id);
      showAlert('success', 'تم حذف الفاتورة بنجاح');
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حذف الفاتورة');
    }
  };

  const columns = [
    {
      header: 'رقم الفاتورة',
      render: (row) => <span className="font-bold text-slate-950">{row.invoiceNumber}</span>,
    },
    {
      header: 'المورد',
      render: (row) => row.supplierName || '-',
    },
    {
      header: 'التاريخ',
      render: (row) => formatDate(row.invoiceDate || row.processedAt),
    },
    {
      header: 'عدد الأصناف',
      render: (row) => row.totalItems || row.items?.length || 0,
    },
    {
      header: 'الإجمالي',
      render: (row) => <span className="font-bold text-blue-700">{formatMoney(row.totalAmount)}</span>,
    },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/accountant/bills/${row.id}`}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
            title="عرض التفاصيل"
          >
            <Eye size={17} />
          </Link>
          <button
            type="button"
            onClick={() => openEditForm(row)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
            title="تعديل"
          >
            <Edit size={17} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            title="حذف"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">الفواتير</h1>
          <p className="mt-1 text-sm text-slate-600">إنشاء ومراجعة فواتير الموردين الخاصة بالصيانة والمخزون</p>
        </div>
        <Button type="button" onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={18} />
          إضافة فاتورة
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">عدد الفواتير</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{filteredBills.length}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">إجمالي المبلغ</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{formatMoney(totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">الموردين</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{suppliers.length}</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="بحث برقم الفاتورة أو المورد..."
              className="pr-10"
            />
          </div>
          <select
            value={supplierFilter}
            onChange={(event) => setSupplierFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">جميع الموردين</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <Table columns={columns} data={filteredBills} loading={loading} />
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {editingBill ? 'تعديل فاتورة' : 'إضافة فاتورة'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">اختر المورد وأضف الأصناف المرتبطة بالفاتورة.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={20} />
              </button>
            </div>
            <AccountantBillForm
              initialData={editingBill}
              suppliers={suppliers}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              isLoading={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
