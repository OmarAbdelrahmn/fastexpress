'use client';

import AccountantTransferForm from '@/components/accountant/AccountantTransferForm';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { Edit, Eye, FileText, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

function TransferDetails({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">رقم التحويل</p>
          <p className="mt-1 font-bold text-slate-950">{data.id || '-'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">من</p>
          <p className="mt-1 font-bold text-slate-950">{data.fromLocation || 'الشركة'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">إلى</p>
          <p className="mt-1 font-bold text-slate-950">{data.toLocation || data.housingName || '-'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">التاريخ</p>
          <p className="mt-1 font-bold text-slate-950">{formatDate(data.transferredAt)}</p>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {(data.items || []).map((item, index) => (
              <tr key={item.id || `${item.itemId}-${index}`}>
                <td className="px-4 py-3 text-sm font-semibold text-slate-950">{item.itemName || item.itemId}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{getItemTypeName(item.itemType)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AccountantTransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [housings, setHousings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [housingFilter, setHousingFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [viewingTransfer, setViewingTransfer] = useState(null);
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
      const [transferData, housingData] = await Promise.all([
        accountingService.transfers.list(),
        accountingService.lookups.getHousing().catch(() => []),
      ]);
      setTransfers(Array.isArray(transferData) ? transferData : []);
      setHousings(Array.isArray(housingData) ? housingData : []);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء تحميل التحويلات');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return transfers.filter((item) => {
      const matchesSearch =
        !term ||
        String(item.id).includes(term) ||
        item.fromLocation?.toLowerCase().includes(term) ||
        item.toLocation?.toLowerCase().includes(term) ||
        item.housingName?.toLowerCase().includes(term);
      const matchesHousing = !housingFilter || String(item.housingId) === String(housingFilter);
      return matchesSearch && matchesHousing;
    });
  }, [housingFilter, searchQuery, transfers]);

  const totalItems = filteredTransfers.reduce((sum, transfer) => sum + Number(transfer.items?.length || 0), 0);

  const openCreateForm = () => {
    setEditingTransfer(null);
    setFormOpen(true);
  };

  const openEditForm = async (transfer) => {
    try {
      const data = await accountingService.transfers.getById(transfer.id);
      setEditingTransfer(data);
      setFormOpen(true);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء جلب التحويل');
    }
  };

  const openDetails = async (transfer) => {
    try {
      const data = await accountingService.transfers.getById(transfer.id);
      setViewingTransfer(data);
      setDetailsOpen(true);
    } catch (error) {
      setViewingTransfer(transfer);
      setDetailsOpen(true);
    }
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingTransfer(null);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editingTransfer) {
        await accountingService.transfers.update(editingTransfer.id, payload);
        showAlert('success', 'تم تحديث التحويل بنجاح');
      } else {
        await accountingService.transfers.create(payload);
        showAlert('success', 'تم إنشاء التحويل بنجاح');
      }
      closeForm();
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حفظ التحويل');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transfer) => {
    if (!confirm(`هل أنت متأكد من حذف التحويل رقم ${transfer.id || ''}؟`)) return;

    try {
      await accountingService.transfers.delete(transfer.id);
      showAlert('success', 'تم حذف التحويل بنجاح');
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حذف التحويل');
    }
  };

  const columns = [
    { header: 'رقم التحويل', render: (row) => <span className="font-bold text-slate-950">{row.id}</span> },
    { header: 'من', render: (row) => row.fromLocation || 'الشركة' },
    { header: 'إلى', render: (row) => row.toLocation || row.housingName || '-' },
    { header: 'التاريخ', render: (row) => formatDate(row.transferredAt) },
    { header: 'عدد الأصناف', render: (row) => row.items?.length || 0 },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => openDetails(row)} className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50" title="عرض التفاصيل">
            <Eye size={17} />
          </button>
          <button type="button" onClick={() => openEditForm(row)} className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50" title="تعديل">
            <Edit size={17} />
          </button>
          <button type="button" onClick={() => handleDelete(row)} className="rounded-lg p-2 text-red-600 transition hover:bg-red-50" title="حذف">
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
          <h1 className="text-2xl font-bold text-slate-950">تحويلات السكن</h1>
          <p className="mt-1 text-sm text-slate-600">تحويل قطع الغيار ومعدات السائقين من الشركة إلى السكن</p>
        </div>
        <Button type="button" onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={18} />
          إنشاء تحويل
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">عدد التحويلات</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{filteredTransfers.length}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">إجمالي الأصناف</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{totalItems.toLocaleString('ar-SA')}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">السكنات</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{housings.length}</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="بحث برقم التحويل أو الموقع..." className="pr-10" />
          </div>
          <select
            value={housingFilter}
            onChange={(event) => setHousingFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">جميع السكنات</option>
            {housings.map((housing) => (
              <option key={housing.id} value={housing.id}>
                {housing.name}
              </option>
            ))}
          </select>
        </div>
        <Table columns={columns} data={filteredTransfers} loading={loading} />
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
                    {editingTransfer ? 'تعديل تحويل' : 'إنشاء تحويل'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">اختر السكن والأصناف والكميات المراد تحويلها.</p>
                </div>
              </div>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                <X size={20} />
              </button>
            </div>
            <AccountantTransferForm
              initialData={editingTransfer}
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
                <h2 className="text-xl font-bold text-slate-950">تفاصيل التحويل</h2>
                <p className="mt-1 text-sm text-slate-500">رقم {viewingTransfer?.id || ''}</p>
              </div>
              <button type="button" onClick={() => setDetailsOpen(false)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                <X size={20} />
              </button>
            </div>
            <TransferDetails data={viewingTransfer} />
          </div>
        </div>
      )}
    </div>
  );
}
