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
  Truck, User, Settings, ChevronRight, MapPin, Search, History, Edit,
  Tag, Filter, X, Download
} from 'lucide-react';

// ─── helpers ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  2: { 
    label: 'قريب الاستحقاق', 
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    color: 'bg-yellow-50 border-r-4 border-yellow-500 text-yellow-700 font-medium' 
  },
  3: { 
    label: 'مستحق اليوم', 
    badgeClass: 'bg-orange-50 text-orange-800 border border-orange-200 font-bold ring-2 ring-orange-100/50',
    color: 'bg-orange-50 border-r-4 border-orange-500 text-orange-700 font-medium' 
  },
  4: { 
    label: 'متأخر', 
    badgeClass: 'bg-red-50 text-red-800 border border-red-200 font-bold ring-2 ring-red-100/50',
    color: 'bg-red-50 border-r-4 border-red-500 text-red-700 font-medium' 
  },
  5: { 
    label: 'لم يُنجز', 
    badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200 font-medium',
    color: 'bg-gray-50 border-r-4 border-gray-400 text-gray-700 font-medium' 
  },
};

function fmt(dt) {
  if (!dt) return '-';
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dt;
  }
}

function fmtDate(dt) {
  return fmt(dt);
}

function getStatusInfo(status) {
  const s = String(status);
  if (s === '2' || s === 'Upcoming') return STATUS_MAP[2];
  if (s === '3' || s === 'DueToday') return STATUS_MAP[3];
  if (s === '4' || s === 'Overdue') return STATUS_MAP[4];
  if (s === '5' || s === 'NeverDone') return STATUS_MAP[5];
  return STATUS_MAP[status] || { 
    label: status || 'غير محدد', 
    badgeClass: 'bg-gray-100 text-gray-600 border border-gray-200', 
    color: 'bg-gray-50 text-gray-600' 
  };
}

function StatusBadge({ status }) {
  const s = getStatusInfo(status);
  if (!s) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.badgeClass || s.color}`}>
      {s.label}
    </span>
  );
}

function DaysUntilDueBadge({ days }) {
  if (days === undefined || days === null) return null;
  const num = Number(days);
  if (isNaN(num)) return null;

  if (num < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
        <Clock size={12} className="text-red-600" />
        متأخر بـ {Math.abs(num)} يوم
      </span>
    );
  }
  if (num === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md animate-pulse">
        <AlertTriangle size={12} className="text-orange-600" />
        مستحق اليوم
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
      <CheckCircle size={12} className="text-emerald-600" />
      متبقي {num} يوم
    </span>
  );
}

function ItemTypeBadge({ itemType }) {
  const isSpare = Number(itemType) === 1;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
      isSpare ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
    }`}>
      <Tag size={10} />
      {isSpare ? 'قطعة غيار' : 'معدة سائق'}
    </span>
  );
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
  const [checkDate, setCheckDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
  });
  const [activeStatus, setActiveStatus] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all'); // 'all' | 'vehicles' | 'riders'
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // 'all' | 'assigned' | 'unassigned'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [exporting, setExporting] = useState(false);

  async function load() {
    if (!checkDate) return;
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
  }, [checkDate]);

  // Extract raw lists from API response
  const vehicleList = data?.vehicleReminders || data?.vehicles || [];
  const riderList = data?.riderReminders || data?.riders || [];

  // Tally counts across all entities and dueItems as fallback
  const computedCounts = { 2: 0, 3: 0, 4: 0, 5: 0 };
  [...vehicleList, ...riderList].forEach(entity => {
    const items = entity.dueItems || entity.items || entity.reminders || [];
    items.forEach(it => {
      const s = Number(it.status);
      if (computedCounts[s] !== undefined) computedCounts[s]++;
    });
  });

  const totalOverdue = data?.totalOverdueItems ?? computedCounts[4];
  const totalDueToday = data?.totalDueTodayItems ?? computedCounts[3];
  const totalUpcoming = data?.totalUpcomingItems ?? computedCounts[2];
  const totalNeverDone = data?.totalNeverDoneItems ?? computedCounts[5];
  const totalVehicles = data?.totalAffectedVehicles ?? vehicleList.length;
  const totalRiders = data?.totalAffectedRiders ?? riderList.length;

  const unassignedVehiclesCount = vehicleList.filter(
    v => !v.assignedRiderName && !v.assignedRiderIqamaNo
  ).length;

  const assignedVehiclesCount = vehicleList.filter(
    v => !!v.assignedRiderName || !!v.assignedRiderIqamaNo
  ).length;

  const matchesStatus = (status, filter) => {
    if (filter === 'all') return true;
    const s = String(status);
    const f = String(filter);
    return s === f ||
      (f === '4' && (s === '4' || s === 'Overdue')) ||
      (f === '3' && (s === '3' || s === 'DueToday')) ||
      (f === '2' && (s === '2' || s === 'Upcoming')) ||
      (f === '5' && (s === '5' || s === 'NeverDone'));
  };

  // Filter vehicles
  const filteredVehicles = vehicleList.filter(v => {
    const loc = v.location || v.housingName || '';
    if (selectedLocation && loc !== selectedLocation) return false;

    // Assignment filter
    const isAssigned = !!v.assignedRiderName || !!v.assignedRiderIqamaNo;
    if (assignmentFilter === 'unassigned' && isAssigned) return false;
    if (assignmentFilter === 'assigned' && !isAssigned) return false;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const plate = (v.vehiclePlate || v.plateNumber || '').toLowerCase();
      const num = (v.vehicleNumber || '').toLowerCase();
      const riderName = (v.assignedRiderName || v.riderName || '').toLowerCase();
      const riderIqama = String(v.assignedRiderIqamaNo || v.riderIqamaNo || '');
      const locationMatch = loc.toLowerCase().includes(q);
      const items = (v.dueItems || v.items || v.reminders || []);
      const itemNames = items.map(it => (it.itemName || it.sparePartName || '').toLowerCase()).join(' ');

      const matches = plate.includes(q) || num.includes(q) || riderName.includes(q) ||
        riderIqama.includes(q) || locationMatch || itemNames.includes(q);
      if (!matches) return false;
    }

    if (activeStatus !== 'all') {
      const items = v.dueItems || v.items || v.reminders || [];
      const hasStatus = items.some(it => matchesStatus(it.status, activeStatus));
      if (!hasStatus) return false;
    }

    return true;
  });

  // Filter riders
  const filteredRiders = riderList.filter(r => {
    const loc = r.housingName || r.location || '';
    if (selectedLocation && loc !== selectedLocation) return false;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const name = (r.riderNameAR || r.riderName || r.riderNameEN || r.name || '').toLowerCase();
      const iqama = String(r.riderIqamaNo || r.assignedRiderIqamaNo || r.iqamaNo || '');
      const workingId = (r.workingId || '').toLowerCase();
      const locationMatch = loc.toLowerCase().includes(q);
      const items = (r.dueItems || r.items || r.reminders || []);
      const itemNames = items.map(it => (it.itemName || it.accessoryName || '').toLowerCase()).join(' ');

      const matches = name.includes(q) || iqama.includes(q) || workingId.includes(q) ||
        locationMatch || itemNames.includes(q);
      if (!matches) return false;
    }

    if (activeStatus !== 'all') {
      const items = r.dueItems || r.items || r.reminders || [];
      const hasStatus = items.some(it => matchesStatus(it.status, activeStatus));
      if (!hasStatus) return false;
    }

    return true;
  });

  const showVehicles = entityFilter === 'all' || entityFilter === 'vehicles';
  const showRiders = entityFilter === 'all' || entityFilter === 'riders';

  const visibleCount = (showVehicles ? filteredVehicles.length : 0) + (showRiders ? filteredRiders.length : 0);
  const rawTotalEntities = vehicleList.length + riderList.length;

  const statusFilters = [
    { key: 'all', label: 'الكل' },
    { key: '4', label: `متأخر (${totalOverdue})`, activeClass: 'bg-red-600 text-white border-red-600' },
    { key: '3', label: `مستحق اليوم (${totalDueToday})`, activeClass: 'bg-orange-600 text-white border-orange-600' },
    { key: '2', label: `قريب الاستحقاق (${totalUpcoming})`, activeClass: 'bg-amber-600 text-white border-amber-600' },
    ...(totalNeverDone > 0 ? [{ key: '5', label: `لم يُنجز (${totalNeverDone})`, activeClass: 'bg-gray-700 text-white border-gray-700' }] : []),
  ];

  const hasActiveFilters = activeStatus !== 'all' || entityFilter !== 'all' || assignmentFilter !== 'all' || searchQuery.trim() !== '' || selectedLocation !== '';

  const resetFilters = () => {
    setActiveStatus('all');
    setEntityFilter('all');
    setAssignmentFilter('all');
    setSearchQuery('');
    setSelectedLocation('');
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const XLSX = await import('xlsx');
      const rows = [];

      if (showVehicles) {
        filteredVehicles.forEach(vehicle => {
          const rawItems = vehicle.dueItems || vehicle.items || vehicle.reminders || [];
          const items = activeStatus === 'all'
            ? rawItems
            : rawItems.filter(it => matchesStatus(it.status, activeStatus));

          items.forEach(item => {
            const statusInfo = getStatusInfo(item.status);
            const daysText = item.daysUntilDue < 0 
              ? `متأخر بـ ${Math.abs(item.daysUntilDue)} يوم` 
              : item.daysUntilDue === 0 
                ? 'مستحق اليوم' 
                : `متبقي ${item.daysUntilDue} يوم`;

            rows.push({
              'نوع الكيان': 'مركبة',
              'رقم المركبة': vehicle.vehicleNumber || '-',
              'رقم اللوحة': formatPlateNumber(vehicle.vehiclePlate) || vehicle.vehiclePlate || '-',
              'الموقع / السكن': vehicle.location || 'غير محدد',
              'حالة التعيين': vehicle.assignedRiderName ? 'مخصصة لسائق' : 'غير مخصصة لسائق حالياً',
              'اسم السائق': vehicle.assignedRiderName || 'غير مخصص',
              'رقم إقامة السائق': vehicle.assignedRiderIqamaNo || '-',
              'اسم الصنف': item.itemName || '-',
              'نوع الصيانة': item.itemType === 1 ? 'قطعة غيار' : 'معدة سائق',
              'الدورة (أيام)': item.intervalDays ?? '-',
              'تنبيه قبل (أيام)': item.alertDaysBeforeDue ?? '-',
              'آخر صيانة': fmtDate(item.lastDoneAt),
              'الاستحقاق القادم': fmtDate(item.nextDueAt),
              'الأيام المتبقية': item.daysUntilDue ?? '-',
              'المهلة': daysText,
              'حالة الاستحقاق': statusInfo.label,
              'مصدر السجل': item.recordSource === 'Usage' ? 'سجل صرف' : (item.recordSource || '-')
            });
          });
        });
      }

      if (showRiders) {
        filteredRiders.forEach(rider => {
          const rawItems = rider.dueItems || rider.items || rider.reminders || [];
          const items = activeStatus === 'all'
            ? rawItems
            : rawItems.filter(it => matchesStatus(it.status, activeStatus));

          items.forEach(item => {
            const statusInfo = getStatusInfo(item.status);
            const daysText = item.daysUntilDue < 0 
              ? `متأخر بـ ${Math.abs(item.daysUntilDue)} يوم` 
              : item.daysUntilDue === 0 
                ? 'مستحق اليوم' 
                : `متبقي ${item.daysUntilDue} يوم`;

            rows.push({
              'نوع الكيان': 'سائق',
              'رقم المركبة': '-',
              'رقم اللوحة': '-',
              'الموقع / السكن': rider.housingName || rider.location || 'غير محدد',
              'حالة التعيين': 'سائق',
              'اسم السائق': rider.riderNameAR || rider.riderName || rider.riderNameEN || '-',
              'رقم إقامة السائق': rider.riderIqamaNo || rider.assignedRiderIqamaNo || rider.iqamaNo || '-',
              'اسم الصنف': item.itemName || '-',
              'نوع الصيانة': item.itemType === 1 ? 'قطعة غيار' : 'معدة سائق',
              'الدورة (أيام)': item.intervalDays ?? '-',
              'تنبيه قبل (أيام)': item.alertDaysBeforeDue ?? '-',
              'آخر صيانة': fmtDate(item.lastDoneAt),
              'الاستحقاق القادم': fmtDate(item.nextDueAt),
              'الأيام المتبقية': item.daysUntilDue ?? '-',
              'المهلة': daysText,
              'حالة الاستحقاق': statusInfo.label,
              'مصدر السجل': item.recordSource === 'Usage' ? 'سجل صرف' : (item.recordSource || '-')
            });
          });
        });
      }

      if (rows.length === 0) {
        showAlert('warning', 'لا توجد بيانات مطابقة لتصديرها');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تنبيهات الصيانة');
      XLSX.writeFile(wb, `maintenance_reminders_${checkDate}.xlsx`);
      showAlert('success', 'تم تصدير ملف Excel بنجاح');
    } catch (e) {
      console.error('Export error:', e);
      showAlert('error', 'حدث خطأ أثناء تصدير ملف Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Picker + Refresh Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mx-4 md:mx-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">تاريخ فحص استحقاق الصيانة</h3>
              <p className="text-xs text-slate-500">حساب المواعيد الدورية والاستحقاقات وتنبيهات القطع حتى هذا التاريخ</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              onClick={handleExportExcel} 
              disabled={exporting || loading} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 h-[42px] px-4 rounded-xl cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              title="تصدير تقرير التنبيهات إلى Excel"
            >
              <Download size={15} />
              <span className="hidden sm:inline">{exporting ? 'جاري التصدير...' : 'تصدير Excel'}</span>
            </Button>

            <input 
              type="date" 
              value={checkDate} 
              onChange={e => setCheckDate(e.target.value)} 
              className="px-3.5 py-2 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-700"
            />
            <Button 
              onClick={load} 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-[42px] px-4 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              <span className="hidden sm:inline">تحديث</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-6">
        {/* Overdue */}
        <div 
          onClick={() => setActiveStatus(activeStatus === '4' ? 'all' : '4')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
            activeStatus === '4'
              ? 'bg-red-100 border-red-500 shadow-md ring-2 ring-red-200'
              : 'bg-red-50/70 border-red-200 hover:border-red-400 hover:shadow-sm'
          }`}
          title="تصفية حسب المتأخر"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">عناصر متأخرة</p>
              <p className="text-2xl md:text-3xl font-bold text-red-700">{totalOverdue}</p>
            </div>
            <div className="bg-red-100 p-2.5 rounded-xl text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>
          <span className="text-[11px] text-red-500 mt-2 block font-medium">
            {activeStatus === '4' ? '• التصفية مفعلة' : 'اضغط للتصفية'}
          </span>
        </div>

        {/* Due Today */}
        <div 
          onClick={() => setActiveStatus(activeStatus === '3' ? 'all' : '3')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
            activeStatus === '3'
              ? 'bg-orange-100 border-orange-500 shadow-md ring-2 ring-orange-200'
              : 'bg-orange-50/70 border-orange-200 hover:border-orange-400 hover:shadow-sm'
          }`}
          title="تصفية حسب مستحق اليوم"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 mb-1">مستحق اليوم</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-700">{totalDueToday}</p>
            </div>
            <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600">
              <Clock size={24} className={totalDueToday > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
          <span className="text-[11px] text-orange-500 mt-2 block font-medium">
            {activeStatus === '3' ? '• التصفية مفعلة' : 'اضغط للتصفية'}
          </span>
        </div>

        {/* Upcoming */}
        <div 
          onClick={() => setActiveStatus(activeStatus === '2' ? 'all' : '2')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
            activeStatus === '2'
              ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-200'
              : 'bg-amber-50/70 border-amber-200 hover:border-amber-400 hover:shadow-sm'
          }`}
          title="تصفية حسب قريب الاستحقاق"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-1">قريب الاستحقاق</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-700">{totalUpcoming}</p>
            </div>
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
              <Bell size={24} />
            </div>
          </div>
          <span className="text-[11px] text-amber-600 mt-2 block font-medium">
            {activeStatus === '2' ? '• التصفية مفعلة' : 'اضغط للتصفية'}
          </span>
        </div>

        {/* Affected Vehicles */}
        <div 
          onClick={() => setEntityFilter(entityFilter === 'vehicles' ? 'all' : 'vehicles')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
            entityFilter === 'vehicles'
              ? 'bg-blue-100 border-blue-500 shadow-md ring-2 ring-blue-200'
              : 'bg-blue-50/70 border-blue-200 hover:border-blue-400 hover:shadow-sm'
          }`}
          title="تصفية المركبات"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-1">مركبات متأثرة</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-700">{totalVehicles}</p>
            </div>
            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
              <Truck size={24} />
            </div>
          </div>
          <span className="text-[11px] text-blue-500 mt-2 block font-medium">
            {entityFilter === 'vehicles' ? '• التصفية مفعلة' : 'اضغط للتصفية'}
          </span>
        </div>

        {/* Affected Riders */}
        <div 
          onClick={() => setEntityFilter(entityFilter === 'riders' ? 'all' : 'riders')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
            entityFilter === 'riders'
              ? 'bg-purple-100 border-purple-500 shadow-md ring-2 ring-purple-200'
              : 'bg-purple-50/70 border-purple-200 hover:border-purple-400 hover:shadow-sm'
          }`}
          title="تصفية السائقين"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-1">سائقين متأثرين</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-700">{totalRiders}</p>
            </div>
            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
              <User size={24} />
            </div>
          </div>
          <span className="text-[11px] text-purple-500 mt-2 block font-medium">
            {entityFilter === 'riders' ? '• التصفية مفعلة' : 'اضغط للتصفية'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mx-4 md:mx-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث برقم المركبة، اللوحة، اسم السائق، الإقامة، الموقع، اسم الصنف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Location Dropdown */}
          <div className="w-full md:w-56">
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-slate-50 text-sm text-slate-700"
              >
                <option value="">كل المواقع السكنية</option>
                {housings.map((housing) => (
                  <option key={housing.id || housing.name} value={housing.name}>
                    {housing.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Entity Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setEntityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                entityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setEntityFilter('vehicles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                entityFilter === 'vehicles'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck size={13} />
              مركبات ({totalVehicles})
            </button>
            <button
              onClick={() => setEntityFilter('riders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                entityFilter === 'riders'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={13} />
              سائقين ({totalRiders})
            </button>
          </div>
        </div>

        {/* Status Filter Pills + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 ml-1">
              <Filter size={13} /> تصفية الحالة:
            </span>
            {statusFilters.map(f => {
              const isSelected = activeStatus === f.key;
              return (
                <button 
                  key={f.key} 
                  onClick={() => setActiveStatus(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected 
                      ? (f.activeClass || 'bg-blue-600 text-white border-blue-600 shadow-xs')
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center gap-1"
            >
              <X size={14} /> إعادة تعيين الفلاتر
            </button>
          )}
        </div>

        {/* Assignment filter pills for vehicles */}
        {(entityFilter === 'all' || entityFilter === 'vehicles') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 ml-1">
              <User size={13} /> حالة تعيين المركبة:
            </span>
            {[
              { id: 'all', label: 'كل المركبات' },
              { id: 'assigned', label: `مخصصة لسائق فقط (${assignedVehiclesCount})` },
              { id: 'unassigned', label: `مركبة غير مخصصة لسائق حالياً (${unassignedVehiclesCount})` },
            ].map(assign => (
              <button
                key={assign.id}
                onClick={() => setAssignmentFilter(assign.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  assignmentFilter === assign.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {assign.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="px-4 md:px-6">
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center text-slate-400 shadow-sm border border-slate-100">
            <span className="w-9 h-9 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
            <p className="text-sm font-medium text-slate-600">جاري فحص تنبيهات واستحقاقات الصيانة المباشرة...</p>
          </div>
        ) : rawTotalEntities === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 space-y-3">
            <CheckCircle size={52} className="mx-auto text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800">كل شيء سليم ولا توجد تنبيهات صيانة مستحقة!</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              لا توجد قطع غيار أو معدات متأخرة أو مستحقة الصيانة بتاريخ {checkDate}. كافة المركبات والمعدات في حالة ممتازة.
            </p>
          </div>
        ) : visibleCount === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 space-y-3">
            <Filter size={44} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">لا توجد عناصر تطابق معايير التصفية والبحث الحالية</h3>
            <p className="text-slate-500 text-xs">
              جرّب تغيير حالة الاستحقاق، أو تفريغ نص البحث، أو اختيار موقع آخر.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-2 text-xs">
              إلغاء التصفية
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vehicle Reminders */}
            {showVehicles && filteredVehicles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Truck className="text-blue-600" size={19} />
                    تنبيهات صيانة المركبات ({filteredVehicles.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredVehicles.map((vehicle, vIndex) => {
                    const rawItems = vehicle.dueItems || vehicle.items || vehicle.reminders || [];
                    const displayItems = activeStatus === 'all'
                      ? rawItems
                      : rawItems.filter(it => matchesStatus(it.status, activeStatus));

                    if (displayItems.length === 0) return null;

                    return (
                      <Card key={`v-${vIndex}`} className="border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 md:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shadow-xs">
                              <Truck size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900">
                                  {formatPlateNumber(vehicle.vehiclePlate) || vehicle.vehiclePlate || vehicle.vehicleNumber}
                                </h4>
                                {vehicle.vehicleNumber && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                                    #{vehicle.vehicleNumber}
                                  </span>
                                )}
                              </div>
                              {vehicle.location && (
                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                  <MapPin size={13} className="text-slate-400" />
                                  <span>{vehicle.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Driver Info */}
                          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs self-start md:self-auto">
                            {vehicle.assignedRiderName ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                  <User size={13} className="text-blue-500" />
                                  <span>السائق المسؤول: <strong className="text-slate-900">{vehicle.assignedRiderName}</strong></span>
                                </div>
                                {vehicle.assignedRiderIqamaNo && (
                                  <p className="text-[11px] text-slate-400 pr-4">
                                    رقم الإقامة: {vehicle.assignedRiderIqamaNo}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-amber-700 font-medium py-0.5">
                                <AlertTriangle size={13} className="text-amber-500" />
                                <span>مركبة غير مخصصة لسائق حالياً</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Due Items Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-xs md:text-sm">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 text-xs">
                                <th className="py-2.5 px-4">الصنف</th>
                                <th className="py-2.5 px-3">نوع البند</th>
                                <th className="py-2.5 px-3">دورة الصيانة</th>
                                <th className="py-2.5 px-3">آخر تنفيذ</th>
                                <th className="py-2.5 px-3">الاستحقاق القادم</th>
                                <th className="py-2.5 px-3">المهلة</th>
                                <th className="py-2.5 px-4">الحالة</th>
                                <th className="py-2.5 px-3">المصدر</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {displayItems.map((item, iIndex) => (
                                <tr key={iIndex} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3 px-4 font-bold text-slate-900">{item.itemName}</td>
                                  <td className="py-3 px-3"><ItemTypeBadge itemType={item.itemType} /></td>
                                  <td className="py-3 px-3 text-slate-600">
                                    كل {item.intervalDays} يوم
                                    {item.alertDaysBeforeDue > 0 && (
                                      <span className="block text-[11px] text-slate-400">تنبيه قبل {item.alertDaysBeforeDue} يوم</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 font-mono text-xs">{fmtDate(item.lastDoneAt)}</td>
                                  <td className="py-3 px-3 font-mono font-semibold text-slate-800 text-xs">{fmtDate(item.nextDueAt)}</td>
                                  <td className="py-3 px-3"><DaysUntilDueBadge days={item.daysUntilDue} /></td>
                                  <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                                  <td className="py-3 px-3">
                                    {item.recordSource && (
                                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                        {item.recordSource === 'Usage' ? 'صرف' : item.recordSource}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rider Reminders */}
            {showRiders && filteredRiders.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <User className="text-purple-600" size={19} />
                    تنبيهات معدات السائقين ({filteredRiders.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredRiders.map((rider, rIndex) => {
                    const rawItems = rider.dueItems || rider.items || rider.reminders || [];
                    const displayItems = activeStatus === 'all'
                      ? rawItems
                      : rawItems.filter(it => matchesStatus(it.status, activeStatus));

                    if (displayItems.length === 0) return null;

                    return (
                      <Card key={`r-${rIndex}`} className="border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 md:p-5 bg-gradient-to-r from-purple-50/40 to-white border-b border-purple-100/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl shadow-xs">
                              <User size={22} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900">
                                  {rider.riderNameAR || rider.riderName || rider.riderNameEN}
                                </h4>
                                {rider.workingId && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-mono font-bold border border-purple-200">
                                    كود: {rider.workingId}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                                {(rider.housingName || rider.location) && (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={13} className="text-slate-400" />
                                    {rider.housingName || rider.location}
                                  </span>
                                )}
                                {(rider.riderIqamaNo || rider.assignedRiderIqamaNo || rider.iqamaNo) && (
                                  <span>
                                    إقامة: <strong className="text-slate-700 font-mono">{rider.riderIqamaNo || rider.assignedRiderIqamaNo || rider.iqamaNo}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Due Items Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-xs md:text-sm">
                            <thead>
                              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 text-xs">
                                <th className="py-2.5 px-4">المعدة / الصنف</th>
                                <th className="py-2.5 px-3">نوع البند</th>
                                <th className="py-2.5 px-3">دورة الصيانة</th>
                                <th className="py-2.5 px-3">آخر تسليم</th>
                                <th className="py-2.5 px-3">الاستحقاق القادم</th>
                                <th className="py-2.5 px-3">المهلة</th>
                                <th className="py-2.5 px-4">الحالة</th>
                                <th className="py-2.5 px-3">المصدر</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {displayItems.map((item, iIndex) => (
                                <tr key={iIndex} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3 px-4 font-bold text-slate-900">{item.itemName}</td>
                                  <td className="py-3 px-3"><ItemTypeBadge itemType={item.itemType} /></td>
                                  <td className="py-3 px-3 text-slate-600">
                                    كل {item.intervalDays} يوم
                                    {item.alertDaysBeforeDue > 0 && (
                                      <span className="block text-[11px] text-slate-400">تنبيه قبل {item.alertDaysBeforeDue} يوم</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 font-mono text-xs">{fmtDate(item.lastDoneAt)}</td>
                                  <td className="py-3 px-3 font-mono font-semibold text-slate-800 text-xs">{fmtDate(item.nextDueAt)}</td>
                                  <td className="py-3 px-3"><DaysUntilDueBadge days={item.daysUntilDue} /></td>
                                  <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                                  <td className="py-3 px-3">
                                    {item.recordSource && (
                                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                        {item.recordSource === 'Usage' ? 'صرف' : item.recordSource}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
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
