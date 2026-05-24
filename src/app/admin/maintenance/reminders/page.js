'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatPlateNumber } from '@/lib/utils/formatters';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import Alert from '@/components/Ui/Alert';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import { 
  Bell, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, 
  Calendar, AlertTriangle, CheckCircle, Clock, RefreshCw, 
  Truck, User, Settings, ChevronRight, MapPin, Search, History, Edit
} from 'lucide-react';

// ─── helpers ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  2: { label: 'قريب الاستحقاق', color: 'bg-yellow-50 border-r-4 border-yellow-500 text-yellow-700 font-medium' },
  3: { label: 'مستحق اليوم', color: 'bg-orange-50 border-r-4 border-orange-500 text-orange-700 font-medium' },
  4: { label: 'متأخر', color: 'bg-red-50 border-r-4 border-red-500 text-red-700 font-medium' },
  5: { label: 'لم يُنجز', color: 'bg-gray-50 border-r-4 border-gray-400 text-gray-700 font-medium' },
};

function fmt(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString('ar-SA');
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status];
  if (!s) return null;
  return <span className={`px-2.5 py-1 rounded text-xs font-bold ${s.color}`}>{s.label}</span>;
}

// ─── Intervals Tab ──────────────────────────────────────────────────────────
function IntervalsTab({ housings, showAlert }) {
  const { t } = useLanguage();
  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spareParts, setSpareParts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const emptyForm = { 
    sparePartId: '', 
    accessoryId: '', 
    itemType: 1, 
    intervalDays: '', 
    alertDaysBeforeDue: 0, 
    location: '', 
    notes: '', 
    isActive: true 
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [ivRes, spRes, acRes] = await Promise.all([
        ApiService.get(API_ENDPOINTS.MAINTENANCE_INTERVALS.LIST),
        ApiService.get(API_ENDPOINTS.SPARE_PARTS.LIST + "/2"),
        ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.LIST + "/2"),
      ]);
      setIntervals(Array.isArray(ivRes) ? ivRes : []);
      setSpareParts(Array.isArray(spRes) ? spRes : []);
      setAccessories(Array.isArray(acRes) ? acRes : []);
    } catch (e) {
      console.error(e);
      showAlert('error', 'حدث خطأ أثناء تحميل قواعد الصيانة');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm);
    setError('');
    setIsModalOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setForm({
      sparePartId: item.sparePartId || '',
      accessoryId: item.accessoryId || '',
      itemType: item.itemType,
      intervalDays: item.intervalDays,
      alertDaysBeforeDue: item.alertDaysBeforeDue,
      location: item.location || '',
      notes: item.notes || '',
      isActive: item.isActive,
    });
    setError('');
    setIsModalOpen(true);
  }

  async function save() {
    setError('');
    if (form.itemType === 1 && !form.sparePartId) return setError('يرجى اختيار قطعة الغيار');
    if (form.itemType === 2 && !form.accessoryId) return setError('يرجى اختيار المعدة');
    if (!form.intervalDays || Number(form.intervalDays) <= 0) return setError('يجب أن تكون الأيام أكبر من صفر');
    if (Number(form.alertDaysBeforeDue) < 0) return setError('أيام التنبيه يجب أن تكون 0 أو أكثر');
    
    setSaving(true);
    try {
      const payload = {
        sparePartId: form.itemType === 1 ? Number(form.sparePartId) : null,
        accessoryId: form.itemType === 2 ? Number(form.accessoryId) : null,
        itemType: Number(form.itemType),
        intervalDays: Number(form.intervalDays),
        alertDaysBeforeDue: Number(form.alertDaysBeforeDue),
        location: form.location || null,
        notes: form.notes || null,
        isActive: form.isActive,
      };
      if (editingItem) {
        await ApiService.put(API_ENDPOINTS.MAINTENANCE_INTERVALS.UPDATE(editingItem.id), payload);
        showAlert('success', 'تم تحديث قاعدة الصيانة بنجاح');
      } else {
        await ApiService.post(API_ENDPOINTS.MAINTENANCE_INTERVALS.CREATE, payload);
        showAlert('success', 'تم إضافة قاعدة الصيانة بنجاح');
      }
      setIsModalOpen(false);
      load();
    } catch (e) {
      setError(e?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id) {
    try {
      await ApiService.patch(API_ENDPOINTS.MAINTENANCE_INTERVALS.TOGGLE(id));
      showAlert('success', 'تم تعديل حالة القاعدة بنجاح');
      load();
    } catch (e) {
      console.error(e);
      showAlert('error', 'حدث خطأ أثناء تعديل حالة القاعدة');
    }
  }

  async function handleDelete(id) {
    try {
      await ApiService.delete(API_ENDPOINTS.MAINTENANCE_INTERVALS.DELETE(id));
      showAlert('success', 'تم حذف القاعدة بنجاح');
      setDeleteId(null);
      load();
    } catch (e) {
      showAlert('error', e?.message || 'لا يمكن حذف القاعدة لتواجد ارتباطات فعلية، يرجى تعطيلها بدلاً من الحذف');
      setDeleteId(null);
    }
  }

  const filteredData = intervals.filter(item => {
    const itemName = item.itemName || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = !selectedLocation || item.location === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  const columns = [
    {
      header: 'الصنف',
      accessor: 'itemName',
      render: (row) => <span className="font-bold text-gray-900">{row.itemName}</span>
    },
    {
      header: 'النوع',
      accessor: 'itemType',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.itemType === 1 ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
          {row.itemType === 1 ? 'قطعة غيار' : 'معدات سائق'}
        </span>
      )
    },
    {
      header: 'الدورة (أيام)',
      accessor: 'intervalDays',
      render: (row) => <span className="font-bold text-blue-600">{row.intervalDays}</span>
    },
    {
      header: 'تنبيه قبل (أيام)',
      accessor: 'alertDaysBeforeDue',
    },
    {
      header: 'السكن',
      accessor: 'location',
      render: (row) => row.location || 'الكل'
    },
    {
      header: 'الحالة',
      accessor: 'isActive',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? 'نشط' : 'غير نشط'}
        </span>
      )
    },
    {
      header: 'أُنشئ بواسطة',
      accessor: 'createdBy',
    },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="text-blue-600 hover:text-blue-800 p-1" title="تعديل">
            <Edit size={18} />
          </button>
          <button onClick={() => toggle(row.id)} className={`p-1 ${row.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`} title="تبديل الحالة">
            {row.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
          <button onClick={() => setDeleteId(row.id)} className="text-red-600 hover:text-red-800 p-1" title="حذف">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const isEdit = !!editingItem;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 md:px-6">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer w-full md:w-auto text-sm md:text-base" onClick={openCreate}>
          <Plus size={18} className="ml-2" />
          إضافة قاعدة جديدة
        </Button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:mx-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="بحث عن قاعدة صيانة (الاسم)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-700"
              >
                <option value="">كل المواقع</option>
                {housings.map((housing) => (
                  <option key={housing.name} value={housing.name}>
                    {housing.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredData}
          loading={loading}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEdit ? 'تعديل قاعدة الصيانة' : 'إضافة قاعدة صيانة جديدة'}
      >
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الصنف</label>
              <select
                value={form.itemType}
                onChange={e => setForm(f => ({ ...f, itemType: Number(e.target.value), sparePartId: '', accessoryId: '' }))}
                className="w-full border-2 border-gray-100 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={1}>قطعة غيار</option>
                <option value={2}>معدات سائق</option>
              </select>
            </div>
          )}

          {!isEdit && form.itemType === 1 && (
            <SearchableSelect
              label="قطع الغيار"
              value={form.sparePartId}
              onChange={e => setForm(f => ({ ...f, sparePartId: e.target.value }))}
              options={spareParts.map(sp => ({
                id: sp.id,
                name: sp.name || sp.nameAr || ''
              }))}
              placeholder="اختر قطعة الغيار"
              required
            />
          )}

          {!isEdit && form.itemType === 2 && (
            <SearchableSelect
              label="معدات السائقين"
              value={form.accessoryId}
              onChange={e => setForm(f => ({ ...f, accessoryId: e.target.value }))}
              options={accessories.map(ac => ({
                id: ac.id,
                name: ac.name || ac.nameAr || ''
              }))}
              placeholder="اختر المعدة"
              required
            />
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="الدورة (أيام) *"
              placeholder="مثال: 30"
              value={form.intervalDays}
              onChange={e => setForm(f => ({ ...f, intervalDays: e.target.value }))}
            />
            <Input
              type="number"
              label="تنبيه قبل (أيام)"
              placeholder="مثال: 3"
              value={form.alertDaysBeforeDue}
              onChange={e => setForm(f => ({ ...f, alertDaysBeforeDue: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السكن</label>
            <select
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full border-2 border-gray-100 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">كل الوحدات السكنية</option>
              {housings.map(h => <option key={h.id || h.name} value={h.name}>{h.name}</option>)}
            </select>
          </div>

          <Input
            label="ملاحظات"
            placeholder="ملاحظات اختيارية..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />

          {isEdit && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">الحالة:</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${form.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
              >
                {form.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {form.isActive ? 'نشط' : 'غير نشط'}
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-gray-200 text-gray-700">إلغاء</Button>
            <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] justify-center">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'حفظ'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="تأكيد الحذف" size="sm">
        <div className="p-2 space-y-4">
          <p className="text-gray-600 text-sm">هل تريد حذف هذه القاعدة نهائياً؟ إذا كانت مرتبطة بسجلات، استخدم التبديل بدلاً من الحذف.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>إلغاء</Button>
            <Button onClick={() => handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700 text-white">حذف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Reminders Dashboard Tab ────────────────────────────────────────────────
function RemindersTab({ housings, showAlert }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkDate, setCheckDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeStatus, setActiveStatus] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const res = await ApiService.get(API_ENDPOINTS.MAINTENANCE_INTERVALS.REMINDERS(checkDate));
      setData(res);
    } catch (e) {
      console.error(e);
      showAlert('error', 'حدث خطأ أثناء استرداد التنبيهات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
  }, []);

  const allItems = [
    ...(data?.vehicles || []),
    ...(data?.riders || []),
  ];

  const filtered = activeStatus === 'all'
    ? allItems
    : allItems.filter(it => (it.items || it.reminders || []).some(r => String(r.status) === activeStatus));

  const counts = { 2: 0, 3: 0, 4: 0, 5: 0 };
  allItems.forEach(entity => {
    (entity.items || entity.reminders || []).forEach(r => { 
      if (counts[r.status] !== undefined) counts[r.status]++; 
    });
  });

  const statusFilters = [
    { key: 'all', label: 'الكل', color: 'bg-gray-100 text-gray-700' },
    { key: '4', label: `متأخر (${counts[4]})`, color: 'bg-red-100 text-red-700' },
    { key: '3', label: `مستحق اليوم (${counts[3]})`, color: 'bg-orange-100 text-orange-800' },
    { key: '2', label: `قريب (${counts[2]})`, color: 'bg-yellow-100 text-yellow-800' },
    { key: '5', label: `لم يُنجز (${counts[5]})`, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Date Picker + Refresh */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:mx-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1">
            <Input 
              type="date" 
              label="تاريخ الفحص" 
              value={checkDate} 
              onChange={e => setCheckDate(e.target.value)} 
            />
          </div>
          <Button onClick={load} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-[42px] cursor-pointer">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <RefreshCw size={15} />}
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6">
        <div className="bg-red-50 border-r-4 border-red-500 p-3 md:p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-red-600 mb-1">متأخر</p>
              <p className="text-xl md:text-3xl font-bold text-red-700">{counts[4]}</p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 border-r-4 border-orange-500 p-3 md:p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-orange-600 mb-1">مستحق اليوم</p>
              <p className="text-xl md:text-3xl font-bold text-orange-700">{counts[3]}</p>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 border-r-4 border-yellow-500 p-3 md:p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-yellow-600 mb-1">قريب</p>
              <p className="text-xl md:text-3xl font-bold text-yellow-700">{counts[2]}</p>
            </div>
            <Bell className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-50 border-r-4 border-gray-400 p-3 md:p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">لم يُنجز</p>
              <p className="text-xl md:text-3xl font-bold text-gray-700">{counts[5]}</p>
            </div>
            <CheckCircle className="text-gray-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 px-4 md:px-6">
        {statusFilters.map(f => (
          <button 
            key={f.key} 
            onClick={() => setActiveStatus(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border-2 cursor-pointer ${
              activeStatus === f.key 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4 md:px-6">
        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow-sm">
            <span className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center text-gray-400 shadow-sm">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
            <p className="text-base font-bold text-gray-800">كل شيء سليم ولا توجد تنبيهات مستحقة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((entity, idx) => {
              const isVehicle = !!entity.vehicleNumber || !!entity.plateNumber;
              const entityItems = entity.items || entity.reminders || [];
              const filteredEntityItems = activeStatus === 'all'
                ? entityItems
                : entityItems.filter(r => String(r.status) === activeStatus);
              
              if (filteredEntityItems.length === 0) return null;

              return (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      {isVehicle ? <Truck className="text-blue-500" size={20} /> : <User className="text-purple-500" size={20} />}
                      <span className="font-bold text-gray-800 text-base">
                        {isVehicle ? (formatPlateNumber(entity.plateNumber) || entity.vehicleNumber) : (entity.riderName || entity.name)}
                      </span>
                    </div>
                    {entity.location && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        {entity.location}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {filteredEntityItems.map((r, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-lg p-3 gap-2 border border-gray-100 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={r.status} />
                          <span className="text-gray-900 font-medium text-sm">{r.itemName || r.sparepartName || r.accessoryName}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 border-t sm:border-t-0 pt-2 sm:pt-0">
                          {r.dueDate && <span>الاستحقاق: <strong className="text-gray-700">{fmt(r.dueDate)}</strong></span>}
                          {r.lastDoneDate && <span>آخر تنفيذ: <strong className="text-gray-700">{fmt(r.lastDoneDate)}</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function MaintenanceRemindersPage() {
  const [activeTab, setActiveTab] = useState('intervals');
  const [housings, setHousings] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadHousings();
  }, []);

  async function loadHousings() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.HOUSING.LIST);
      setHousings(response || []);
    } catch (error) {
      console.error('Error loading housings:', error);
    }
  }

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const tabs = [
    { id: 'intervals', label: 'قواعد الصيانة الدورية', icon: Settings, color: 'from-violet-500 to-violet-600' },
    { id: 'reminders', label: 'لوحة التذكيرات المباشرة', icon: Bell, color: 'from-blue-500 to-blue-600' },
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="خدمة التذكير الذكي"
        subtitle="جدولة ومتابعة دورية لكافة عمليات صيانة المركبات ومعدات السائقين للحد من الأعطال المفاجئة"
        icon={Bell}
      />

      {alert && (
        <div className="px-4 md:px-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Tab Segment Selector */}
      <div className="mx-4 md:mx-6">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-60" />
                )}
              </button>
            );
          })}
        </div>

        {/* Breadcrumb Indicator */}
        <div className="flex items-center gap-1.5 mt-3 px-1">
          <span className="text-xs text-slate-400">مركز الصيانة</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-xs font-medium text-slate-600">{activeTabConfig?.label}</span>
        </div>
      </div>

      {/* Tab Rendering */}
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        {activeTab === 'intervals' ? (
          <IntervalsTab housings={housings} showAlert={showAlert} />
        ) : (
          <RemindersTab housings={housings} showAlert={showAlert} />
        )}
      </div>
    </div>
  );
}
