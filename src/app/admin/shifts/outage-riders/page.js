'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle, Clock, Edit, FileSpreadsheet, ListChecks, Phone, Plus, RefreshCw, Search, Trash2, Upload, UserRound, Users, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const labels = {
  en: {
    title: 'Outside Rider Performances',
    subtitle: 'Manage outside rider info and import outage shift performance',
    performanceTab: 'Import & Performance Records',
    ridersTab: 'Outside Riders Info',
    riderInfoTitle: 'Outside Rider Info',
    riderInfoCreateTitle: 'Create New Outside Rider Info',
    riderInfoListTitle: 'Outside Riders',
    performanceTitle: 'Manual Performance Record',
    importTitle: 'Import Shift Excel',
    filtersTitle: 'Performance Filters',
    performanceListTitle: 'Performance Records',
    riderId: 'Rider ID',
    phoneNumber: 'Phone Number',
    outRiderInfo: 'Outside Rider',
    shiftDate: 'Shift Date',
    from: 'From',
    to: 'To',
    acceptedOrders: 'Completed Deliveries',
    rejectedOrders: 'Declined Deliveries',
    workingHours: 'Actual Working Hours',
    uploadedAt: 'Uploaded At',
    uploadedBy: 'Uploaded By',
    createdAt: 'Created At',
    createdBy: 'Created By',
    excelFile: 'Excel File',
    create: 'Create',
    update: 'Update',
    reset: 'Reset',
    search: 'Search',
    refresh: 'Refresh',
    import: 'Import',
    actions: 'Actions',
    totalRowsProcessed: 'Rows Processed',
    recordsCreated: 'Records Created',
    warnings: 'Warnings',
    totalRiders: 'Outside Riders',
    totalWorkingHours: 'Working Hours',
    avgWorkingHours: 'Avg. Working Hours',
    importResults: 'Import Results',
    parserWarningsOnly: 'Parser Warnings',
    noRiders: 'No outside rider info records found',
    noRecords: 'No performance records found',
    selectFile: 'Please choose an Excel file',
    selectDate: 'Please select a shift date',
    selectRider: 'Please select an outside rider',
    fillRiderRequired: 'Rider ID and phone number are required',
    fillPerformanceRequired: 'Outside rider, accepted orders, rejected orders, and working hours are required',
    importSuccess: 'Excel imported successfully',
    riderCreateSuccess: 'Outside rider created successfully',
    riderUpdateSuccess: 'Outside rider updated successfully',
    riderDeleteSuccess: 'Outside rider deleted successfully',
    performanceCreateSuccess: 'Performance record created successfully',
    performanceUpdateSuccess: 'Performance record updated successfully',
    performanceDeleteSuccess: 'Performance record deleted successfully',
    loadError: 'Could not load records',
    deleteRiderConfirm: 'Delete this outside rider info record?',
    deletePerformanceConfirm: 'Delete this performance record?',
  },
  ar: {
    title: 'أداء مناديب الخارج',
    subtitle: 'إدارة بيانات مناديب الخارج واستيراد أداء الشفتات',
    performanceTab: 'الاستيراد وسجلات الأداء',
    ridersTab: 'بيانات مناديب الخارج',
    riderInfoTitle: 'بيانات مندوب الخارج',
    riderInfoCreateTitle: 'إنشاء بيانات مندوب خارج جديد',
    riderInfoListTitle: 'مناديب الخارج',
    performanceTitle: 'سجل أداء يدوي',
    importTitle: 'استيراد ملف الشفتات',
    filtersTitle: 'فلاتر الأداء',
    performanceListTitle: 'سجلات الأداء',
    riderId: 'معرف المندوب',
    phoneNumber: 'رقم الجوال',
    outRiderInfo: 'مندوب الخارج',
    shiftDate: 'تاريخ الشفت',
    from: 'من',
    to: 'إلى',
    acceptedOrders: 'الطلبات المكتملة',
    rejectedOrders: 'الطلبات المرفوضة',
    workingHours: 'ساعات العمل الفعلية',
    uploadedAt: 'تاريخ الرفع',
    uploadedBy: 'رفع بواسطة',
    createdAt: 'تاريخ الإنشاء',
    createdBy: 'أنشئ بواسطة',
    excelFile: 'ملف Excel',
    create: 'إنشاء',
    update: 'تحديث',
    reset: 'إعادة تعيين',
    search: 'بحث',
    refresh: 'تحديث',
    import: 'استيراد',
    actions: 'الإجراءات',
    totalRowsProcessed: 'الصفوف المعالجة',
    recordsCreated: 'السجلات المنشأة',
    warnings: 'التحذيرات',
    totalRiders: 'مناديب الخارج',
    totalWorkingHours: 'ساعات العمل',
    avgWorkingHours: 'متوسط ساعات العمل',
    importResults: 'نتائج الاستيراد',
    parserWarningsOnly: 'تحذيرات القراءة',
    noRiders: 'لا توجد بيانات مناديب خارج',
    noRecords: 'لا توجد سجلات أداء',
    selectFile: 'يرجى اختيار ملف Excel',
    selectDate: 'يرجى اختيار تاريخ الشفت',
    selectRider: 'يرجى اختيار مندوب الخارج',
    fillRiderRequired: 'معرف المندوب ورقم الجوال مطلوبان',
    fillPerformanceRequired: 'مندوب الخارج والطلبات المكتملة والمرفوضة وساعات العمل مطلوبة',
    importSuccess: 'تم استيراد الملف بنجاح',
    riderCreateSuccess: 'تم إنشاء بيانات المندوب بنجاح',
    riderUpdateSuccess: 'تم تحديث بيانات المندوب بنجاح',
    riderDeleteSuccess: 'تم حذف بيانات المندوب بنجاح',
    performanceCreateSuccess: 'تم إنشاء سجل الأداء بنجاح',
    performanceUpdateSuccess: 'تم تحديث سجل الأداء بنجاح',
    performanceDeleteSuccess: 'تم حذف سجل الأداء بنجاح',
    loadError: 'تعذر تحميل السجلات',
    deleteRiderConfirm: 'هل تريد حذف بيانات مندوب الخارج؟',
    deletePerformanceConfirm: 'هل تريد حذف سجل الأداء؟',
  },
};

const getToday = () => new Date().toISOString().split('T')[0];

const emptyRiderForm = {
  riderId: '',
  phoneNumber: '',
};

const emptyPerformanceForm = {
  outRiderInfoId: '',
  acceptedOrders: '',
  rejectedOrders: '',
  workingHours: '',
  shiftDate: getToday(),
};

const compactParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      cleaned[key] = String(value).trim();
    }
  });
  return cleaned;
};

const formatDateOnly = (value) => {
  if (!value) return '-';
  return String(value).split('T')[0];
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
      active
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.blue}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <Icon size={28} className="opacity-75" />
      </div>
    </div>
  );
};

export default function OutageRiderPerformancesPage() {
  const { locale } = useLanguage();
  const text = labels[locale === 'en' ? 'en' : 'ar'];
  const [activeTab, setActiveTab] = useState('performance');
  const [riders, setRiders] = useState([]);
  const [records, setRecords] = useState([]);
  const [riderFilters, setRiderFilters] = useState({ riderId: '', phoneNumber: '' });
  const [performanceFilters, setPerformanceFilters] = useState({
    riderId: '',
    from: getToday(),
    to: getToday(),
  });
  const [riderForm, setRiderForm] = useState(emptyRiderForm);
  const [performanceForm, setPerformanceForm] = useState(emptyPerformanceForm);
  const [editingRiderId, setEditingRiderId] = useState(null);
  const [editingPerformanceId, setEditingPerformanceId] = useState(null);
  const [uploadDate, setUploadDate] = useState(getToday());
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [savingRider, setSavingRider] = useState(false);
  const [savingPerformance, setSavingPerformance] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const stats = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        acc.total += 1;
        acc.acceptedOrders += Number(record.acceptedOrders) || 0;
        acc.rejectedOrders += Number(record.rejectedOrders) || 0;
        acc.workingHours += Number(record.workingHours) || 0;
        return acc;
      },
      { total: 0, acceptedOrders: 0, rejectedOrders: 0, workingHours: 0 }
    );
  }, [records]);

  const riderStats = useMemo(() => {
    const withPhone = riders.filter((rider) => Boolean(rider.phoneNumber)).length;
    return {
      total: riders.length,
      withPhone,
      withoutPhone: Math.max(riders.length - withPhone, 0),
    };
  }, [riders]);

  const averageWorkingHours = stats.total > 0 ? (stats.workingHours / stats.total).toFixed(1) : '0';

  const showMessage = (type, value) => {
    setMessage({ type, text: value });
  };

  const loadRiders = async (nextFilters = riderFilters) => {
    setLoadingRiders(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.OUT_RIDER_INFOS.LIST, compactParams(nextFilters));
      const sortedRiders = Array.isArray(data)
        ? [...data].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0))
        : [];
      setRiders(sortedRiders);
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setLoadingRiders(false);
    }
  };

  const loadPerformanceRecords = async (nextFilters = performanceFilters) => {
    setLoadingRecords(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.OUTAGE_SHIFT_PERFORMANCES.LIST, compactParams(nextFilters));
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRiders();
    loadPerformanceRecords();
  }, []);

  const handleSaveRider = async () => {
    if (!riderForm.riderId.trim() || !riderForm.phoneNumber.trim()) {
      showMessage('error', text.fillRiderRequired);
      return;
    }

    const payload = {
      riderId: riderForm.riderId.trim(),
      phoneNumber: riderForm.phoneNumber.trim(),
    };

    setSavingRider(true);
    try {
      if (editingRiderId) {
        await ApiService.put(API_ENDPOINTS.OUT_RIDER_INFOS.UPDATE(editingRiderId), payload);
        showMessage('success', text.riderUpdateSuccess);
      } else {
        await ApiService.post(API_ENDPOINTS.OUT_RIDER_INFOS.CREATE, payload);
        showMessage('success', text.riderCreateSuccess);
      }
      setRiderForm(emptyRiderForm);
      setEditingRiderId(null);
      await loadRiders();
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setSavingRider(false);
    }
  };

  const handleEditRider = (rider) => {
    setEditingRiderId(rider.id);
    setRiderForm({
      riderId: rider.riderId || '',
      phoneNumber: rider.phoneNumber || '',
    });
  };

  const handleDeleteRider = async (rider) => {
    if (!window.confirm(text.deleteRiderConfirm)) return;

    setLoadingRiders(true);
    try {
      await ApiService.delete(API_ENDPOINTS.OUT_RIDER_INFOS.DELETE(rider.id));
      showMessage('success', text.riderDeleteSuccess);
      await loadRiders();
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadDate) {
      showMessage('error', text.selectDate);
      return;
    }
    if (!uploadFile) {
      showMessage('error', text.selectFile);
      return;
    }

    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const data = await ApiService.uploadFormData(
        `${API_ENDPOINTS.OUTAGE_SHIFT_PERFORMANCES.UPLOAD}?${new URLSearchParams({ shiftDate: uploadDate })}`,
        formData
      );
      setUploadResult(data);
      setUploadFile(null);
      showMessage('success', text.importSuccess);
      await loadPerformanceRecords();
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePerformance = async () => {
    if (
      !performanceForm.outRiderInfoId ||
      performanceForm.acceptedOrders === '' ||
      performanceForm.rejectedOrders === '' ||
      performanceForm.workingHours === ''
    ) {
      showMessage('error', text.fillPerformanceRequired);
      return;
    }
    if (!performanceForm.shiftDate) {
      showMessage('error', text.selectDate);
      return;
    }

    const payload = {
      outRiderInfoId: Number(performanceForm.outRiderInfoId),
      acceptedOrders: Number(performanceForm.acceptedOrders),
      rejectedOrders: Number(performanceForm.rejectedOrders),
      workingHours: Number(performanceForm.workingHours),
    };

    if (
      !Number.isFinite(payload.outRiderInfoId) ||
      !Number.isFinite(payload.acceptedOrders) ||
      !Number.isFinite(payload.rejectedOrders) ||
      !Number.isFinite(payload.workingHours)
    ) {
      showMessage('error', text.fillPerformanceRequired);
      return;
    }

    setSavingPerformance(true);
    try {
      if (editingPerformanceId) {
        await ApiService.put(API_ENDPOINTS.OUTAGE_SHIFT_PERFORMANCES.UPDATE(editingPerformanceId), payload, {
          shiftDate: performanceForm.shiftDate,
        });
        showMessage('success', text.performanceUpdateSuccess);
      } else {
        await ApiService.post(API_ENDPOINTS.OUTAGE_SHIFT_PERFORMANCES.CREATE, payload, {
          shiftDate: performanceForm.shiftDate,
        });
        showMessage('success', text.performanceCreateSuccess);
      }
      setPerformanceForm({ ...emptyPerformanceForm, shiftDate: performanceForm.shiftDate });
      setEditingPerformanceId(null);
      await loadPerformanceRecords();
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setSavingPerformance(false);
    }
  };

  const handleEditPerformance = (record) => {
    setEditingPerformanceId(record.id);
    setPerformanceForm({
      outRiderInfoId: record.outRiderInfoId ? String(record.outRiderInfoId) : '',
      acceptedOrders: record.acceptedOrders ?? '',
      rejectedOrders: record.rejectedOrders ?? '',
      workingHours: record.workingHours ?? '',
      shiftDate: formatDateOnly(record.shiftDate) === '-' ? getToday() : formatDateOnly(record.shiftDate),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePerformance = async (record) => {
    if (!window.confirm(text.deletePerformanceConfirm)) return;

    setLoadingRecords(true);
    try {
      await ApiService.delete(API_ENDPOINTS.OUTAGE_SHIFT_PERFORMANCES.DELETE(record.id));
      showMessage('success', text.performanceDeleteSuccess);
      await loadPerformanceRecords();
    } catch (error) {
      showMessage('error', error.message || text.loadError);
    } finally {
      setLoadingRecords(false);
    }
  };

  const selectedRiderLabel = (rider) => `${rider.riderId || '-'} - ${rider.phoneNumber || '-'}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader
        title={text.title}
        subtitle={text.subtitle}
        icon={FileSpreadsheet}
      />

      <div className="p-6 space-y-6">
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70">x</button>
          </div>
        )}

        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto w-fit max-w-full">
          <TabButton
            active={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
            icon={FileSpreadsheet}
            label={text.performanceTab}
          />
          <TabButton
            active={activeTab === 'riders'}
            onClick={() => setActiveTab('riders')}
            icon={Users}
            label={text.ridersTab}
          />
        </div>

        {activeTab === 'performance' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard icon={ListChecks} label={text.performanceListTitle} value={stats.total} tone="blue" />
            <StatCard icon={CheckCircle} label={text.acceptedOrders} value={stats.acceptedOrders} tone="green" />
            <StatCard icon={XCircle} label={text.rejectedOrders} value={stats.rejectedOrders} tone="red" />
            <StatCard icon={Clock} label={text.totalWorkingHours} value={stats.workingHours.toFixed(1)} tone="indigo" />
            <StatCard icon={BarChart3} label={text.avgWorkingHours} value={averageWorkingHours} tone="slate" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Users} label={text.totalRiders} value={riderStats.total} tone="blue" />
            <StatCard icon={Phone} label={text.phoneNumber} value={riderStats.withPhone} tone="green" />
            <StatCard icon={AlertCircle} label={text.warnings} value={riderStats.withoutPhone} tone="amber" />
          </div>
        )}

        <div className="space-y-6">
          <section className={`${activeTab === 'riders' ? '' : 'hidden'} bg-white rounded-xl shadow-md border border-gray-100 p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <UserRound className="text-blue-600" size={22} />
              <h2 className="text-xl font-bold text-gray-900">{text.riderInfoCreateTitle}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.riderId}</label>
                <input
                  value={riderForm.riderId}
                  onChange={(e) => setRiderForm({ ...riderForm, riderId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="R123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.phoneNumber}</label>
                <input
                  value={riderForm.phoneNumber}
                  onChange={(e) => setRiderForm({ ...riderForm, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="966500000000"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRiderForm(emptyRiderForm);
                  setEditingRiderId(null);
                }}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {text.reset}
              </button>
              <button
                onClick={handleSaveRider}
                disabled={savingRider}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {editingRiderId ? <Edit size={18} /> : <Plus size={18} />}
                {editingRiderId ? text.update : text.create}
              </button>
            </div>
          </section>

          <section className={`${activeTab === 'performance' ? '' : 'hidden'} bg-white rounded-xl shadow-md border border-gray-100 p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <Upload className="text-green-600" size={22} />
              <h2 className="text-xl font-bold text-gray-900">{text.importTitle}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.shiftDate}</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{text.excelFile}</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadFile}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <Upload size={18} />
                {uploading ? `${text.import}...` : text.import}
              </button>
            </div>

            {uploadResult && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-700">{text.totalRowsProcessed}</p>
                    <p className="text-2xl font-bold text-blue-900">{uploadResult.totalRowsProcessed ?? 0}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <p className="text-sm text-green-700">{text.recordsCreated}</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.recordsCreated ?? 0}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <p className="text-sm text-amber-700">{text.warnings}</p>
                    <p className="text-2xl font-bold text-amber-900">{uploadResult.warnings?.length ?? 0}</p>
                  </div>
                </div>

                {['warnings', 'parserWarningsOnly'].map((key) => (
                  Array.isArray(uploadResult[key]) && uploadResult[key].length > 0 && (
                    <div key={key} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                      <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
                        <AlertCircle size={18} />
                        {key === 'warnings' ? text.warnings : text.parserWarningsOnly}
                      </h3>
                      <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                        {uploadResult[key].map((warning, index) => (
                          <li key={index}>{String(warning)}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            )}
          </section>
        </div>


        <section className={`${activeTab === 'riders' ? '' : 'hidden'} bg-white rounded-xl shadow-md border border-gray-100 p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <Search className="text-blue-600" size={22} />
            <h2 className="text-xl font-bold text-gray-900">{text.riderInfoListTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <input
              value={riderFilters.riderId}
              onChange={(e) => setRiderFilters({ ...riderFilters, riderId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={text.riderId}
            />
            <input
              value={riderFilters.phoneNumber}
              onChange={(e) => setRiderFilters({ ...riderFilters, phoneNumber: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={text.phoneNumber}
            />
            <div className="flex gap-2">
              <button
                onClick={() => loadRiders()}
                disabled={loadingRiders}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search size={18} />
                {text.search}
              </button>
              <button
                onClick={() => {
                  const clearedFilters = { riderId: '', phoneNumber: '' };
                  setRiderFilters(clearedFilters);
                  loadRiders(clearedFilters);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                title={text.reset}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            {loadingRiders ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : riders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">{text.noRiders}</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.riderId}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.phoneNumber}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.createdAt}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.createdBy}</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{rider.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-700">{rider.riderId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateTime(rider.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.createdBy || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => handleEditRider(rider)} className="text-blue-600 hover:text-blue-900 mx-2" title={text.update}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteRider(rider)} className="text-red-600 hover:text-red-900 mx-2" title={text.deleteRiderConfirm}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className={`${activeTab === 'performance' ? '' : 'hidden'} bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden`}>
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{text.performanceListTitle}</h2>
            <button
              onClick={() => loadPerformanceRecords()}
              disabled={loadingRecords}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg disabled:opacity-50"
              title={text.refresh}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                value={performanceFilters.riderId}
                onChange={(e) => setPerformanceFilters({ ...performanceFilters, riderId: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={text.riderId}
              />
              <input
                type="date"
                value={performanceFilters.from}
                onChange={(e) => setPerformanceFilters({ ...performanceFilters, from: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                title={text.from}
              />
              <input
                type="date"
                value={performanceFilters.to}
                onChange={(e) => setPerformanceFilters({ ...performanceFilters, to: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                title={text.to}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => loadPerformanceRecords()}
                  disabled={loadingRecords}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  {text.search}
                </button>
                <button
                  onClick={() => {
                    const clearedFilters = { riderId: '', from: '', to: '' };
                    setPerformanceFilters(clearedFilters);
                    loadPerformanceRecords(clearedFilters);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  title={text.reset}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingRecords ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-gray-300" />
                {text.noRecords}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.outRiderInfo}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.riderId}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.shiftDate}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.acceptedOrders}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.rejectedOrders}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.workingHours}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.uploadedAt}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{text.uploadedBy}</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{text.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{record.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.outRiderInfoId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-700">{record.riderId || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateOnly(record.shiftDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-700">{record.acceptedOrders ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-red-700">{record.rejectedOrders ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.workingHours ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateTime(record.uploadedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.uploadedBy || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button onClick={() => handleEditPerformance(record)} className="text-blue-600 hover:text-blue-900 mx-2" title={text.update}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeletePerformance(record)} className="text-red-600 hover:text-red-900 mx-2" title={text.deletePerformanceConfirm}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
