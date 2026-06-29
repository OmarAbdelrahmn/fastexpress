'use client';

import AccountantReturnForm from '@/components/accountant/AccountantReturnForm';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { Edit, Eye, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getItemTypeName = (type) => {
  if (Number(type) === 1 || type === 'SparePart') return 'قطع غيار';
  if (Number(type) === 2 || type === 'RiderAccessory') return 'معدات السائقين';
  return 'غير محدد';
};

function ReturnDetails({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">رقم المرتجع</p>
          <p className="mt-1 font-bold text-slate-950">{data.returnNumber || '-'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">المورد</p>
          <p className="mt-1 font-bold text-slate-950">{data.supplierName || '-'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">الإجمالي</p>
          <p className="mt-1 font-bold text-blue-700">{formatMoney(data.totalAmount)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">التاريخ</p>
          <p className="mt-1 font-bold text-slate-950">{formatDate(data.returnDate || data.processedAt)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">بواسطة</p>
          <p className="mt-1 font-bold text-slate-950">{data.processedBy || '-'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">سبب الإرجاع</p>
          <p className="mt-1 font-bold text-slate-950">{data.reason || '-'}</p>
        </div>
      </div>

      {data.notes && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="mb-1 text-xs font-bold text-blue-700">ملاحظات</p>
          <p className="text-sm text-slate-700">{data.notes}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">الصنف</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">النوع</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">الكمية</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">سعر الوحدة</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {(data.items || []).map((item, index) => {
              const lineTotal = item.totalPrice ?? item.lineTotal ?? Number(item.quantity || 0) * Number(item.unitPrice || 0);
              return (
                <tr key={item.id || `${item.itemId}-${index}`}>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-950">{item.itemName || item.itemId}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{getItemTypeName(item.itemType)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatMoney(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-700">{formatMoney(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AccountantReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [viewingReturn, setViewingReturn] = useState(null);
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
      const [returnData, supplierData] = await Promise.all([
        accountingService.returns.list(),
        accountingService.suppliers.list(),
      ]);
      setReturns(Array.isArray(returnData) ? returnData : returnData ? [returnData] : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء تحميل المرتجعات');
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return returns.filter((item) => {
      const matchesSearch =
        !term ||
        item.returnNumber?.toLowerCase().includes(term) ||
        item.reason?.toLowerCase().includes(term) ||
        item.supplierName?.toLowerCase().includes(term);
      const matchesSupplier = !supplierFilter || String(item.supplierId) === String(supplierFilter);
      return matchesSearch && matchesSupplier;
    });
  }, [returns, searchQuery, supplierFilter]);

  const totalAmount = filteredReturns.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  const openCreateForm = () => {
    setEditingReturn(null);
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingReturn(item);
    setFormOpen(true);
  };

  const openDetails = (item) => {
    setViewingReturn(item);
    setDetailsOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingReturn(null);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editingReturn) {
        await accountingService.returns.update(editingReturn.id, payload);
        showAlert('success', 'تم تحديث المرتجع بنجاح');
      } else {
        await accountingService.returns.create(payload);
        showAlert('success', 'تم إضافة المرتجع بنجاح');
      }
      closeForm();
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حفظ المرتجع');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`هل أنت متأكد من حذف المرتجع ${item.returnNumber || ''}؟`)) return;

    try {
      await accountingService.returns.delete(item.id);
      showAlert('success', 'تم حذف المرتجع بنجاح');
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حذف المرتجع');
    }
  };

  const columns = [
    {
      header: 'رقم المرتجع',
      render: (row) => <span className="font-bold text-slate-950">{row.returnNumber}</span>,
    },
    {
      header: 'المورد',
      render: (row) => row.supplierName || '-',
    },
    {
      header: 'السبب',
      render: (row) => row.reason || '-',
    },
    {
      header: 'بواسطة',
      render: (row) => row.processedBy || '-',
    },
    {
      header: 'الإجمالي',
      render: (row) => <span className="font-bold text-blue-700">{formatMoney(row.totalAmount)}</span>,
    },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openDetails(row)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
            title="عرض التفاصيل"
          >
            <Eye size={17} />
          </button>
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
          <h1 className="text-2xl font-bold text-slate-950">المرتجعات</h1>
          <p className="mt-1 text-sm text-slate-600">تسجيل وإدارة مرتجعات قطع الغيار ومعدات السائقين</p>
        </div>
        <Button type="button" onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={18} />
          إضافة مرتجع
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">عدد المرتجعات</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{filteredReturns.length}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">إجمالي المرتجعات</p>
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
              placeholder="بحث برقم المرتجع أو السبب أو المورد..."
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

        <Table columns={columns} data={filteredReturns} loading={loading} />
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {editingReturn ? 'تعديل مرتجع' : 'إضافة مرتجع'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">اختر المورد والأصناف المرتجعة مع السبب.</p>
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
            <AccountantReturnForm
              initialData={editingReturn}
              suppliers={suppliers}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              isLoading={saving}
            />
          </div>
        </div>
      )}

      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">تفاصيل المرتجع</h2>
                <p className="mt-1 text-sm text-slate-500">{viewingReturn?.returnNumber || ''}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailsOpen(false);
                  setViewingReturn(null);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={20} />
              </button>
            </div>
            <ReturnDetails data={viewingReturn} />
          </div>
        </div>
      )}
    </div>
  );
}
