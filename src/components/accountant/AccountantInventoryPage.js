'use client';

import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { Edit, History, MapPin, PackagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const EMPTY_FORM = {
  name: '',
  quantity: '',
  price: '',
  location: '',
};

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

export default function AccountantInventoryPage({
  title,
  subtitle,
  addLabel,
  searchPlaceholder,
  service,
  historyColumns,
}) {
  const [items, setItems] = useState([]);
  const [housings, setHousings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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
      const [itemData, housingData] = await Promise.all([
        service.list(),
        accountingService.lookups.getHousing().catch(() => []),
      ]);
      setItems(Array.isArray(itemData) ? itemData : []);
      setHousings(Array.isArray(housingData) ? housingData : []);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term);
      const matchesLocation = !locationFilter || item.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [items, locationFilter, searchQuery]);

  const totalQuantity = filteredItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const stockValue = filteredItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
    0
  );

  const locations = useMemo(() => {
    const names = new Set(['الشركة']);
    housings.forEach((housing) => {
      if (housing?.name) names.add(housing.name);
    });
    items.forEach((item) => {
      if (item?.location) names.add(item.location);
    });
    return Array.from(names);
  }, [housings, items]);

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      quantity: item.quantity ?? '',
      price: item.price ?? '',
      location: item.location || '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      quantity: Number.parseInt(formData.quantity, 10) || 0,
      price: Number.parseFloat(formData.price) || 0,
      location: formData.location,
    };

    setSaving(true);
    try {
      if (editingItem) {
        await service.update(editingItem.id, payload);
        showAlert('success', 'تم تحديث الصنف بنجاح');
      } else {
        await service.create(payload);
        showAlert('success', 'تم إضافة الصنف بنجاح');
      }
      closeForm();
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حفظ الصنف');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`هل أنت متأكد من حذف ${item.name || 'هذا الصنف'}؟`)) return;

    try {
      await service.delete(item.id);
      showAlert('success', 'تم حذف الصنف بنجاح');
      await loadInitialData();
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء حذف الصنف');
    }
  };

  const openHistory = async (item) => {
    setHistoryItem(item);
    setHistoryRows([]);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await service.getHistory(item.id);
      setHistoryRows(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert('error', error?.message || 'حدث خطأ أثناء تحميل سجل الصنف');
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = [
    {
      header: 'الصنف',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-950">{row.name}</p>
          <p className="mt-1 text-xs text-slate-500">{row.location || '-'}</p>
        </div>
      ),
    },
    { header: 'الكمية', render: (row) => Number(row.quantity || 0).toLocaleString('ar-SA') },
    { header: 'السعر', render: (row) => formatMoney(row.price) },
    {
      header: 'قيمة المخزون',
      render: (row) => (
        <span className="font-bold text-blue-700">
          {formatMoney(Number(row.quantity || 0) * Number(row.price || 0))}
        </span>
      ),
    },
    { header: 'تاريخ الإضافة', render: (row) => formatDate(row.createdAt) },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openHistory(row)}
            className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50"
            title="سجل الحركة"
          >
            <History size={17} />
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
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <Button type="button" onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={18} />
          {addLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">عدد الأصناف</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{filteredItems.length}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">إجمالي الكمية</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{totalQuantity.toLocaleString('ar-SA')}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">قيمة المخزون</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{formatMoney(stockValue)}</p>
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
              placeholder={searchPlaceholder}
              className="pr-10"
            />
          </div>
          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">كل المواقع</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <Table columns={columns} data={filteredItems} loading={loading} />
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <PackagePlus size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {editingItem ? 'تعديل صنف' : addLabel}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">أدخل الاسم والكمية والسعر وموقع التخزين.</p>
                </div>
              </div>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="اسم الصنف" name="name" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} required />
              <Input label="الكمية" name="quantity" type="number" min="0" value={formData.quantity} onChange={(event) => setFormData((current) => ({ ...current, quantity: event.target.value }))} required />
              <Input label="السعر" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">الموقع</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    name="location"
                    value={formData.location}
                    onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-4 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">اختر الموقع</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                إلغاء
              </Button>
              <Button type="submit" loading={saving} disabled={saving || !formData.name.trim()} className="bg-blue-600 hover:bg-blue-700">
                {editingItem ? 'حفظ التعديل' : 'إضافة'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">سجل الحركة</h2>
                <p className="mt-1 text-sm text-slate-500">{historyItem?.name || ''}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHistoryOpen(false);
                  setHistoryItem(null);
                  setHistoryRows([]);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={20} />
              </button>
            </div>
            <Table columns={historyColumns} data={historyRows} loading={historyLoading} />
          </div>
        </div>
      )}
    </div>
  );
}

export { formatDate, formatMoney };
