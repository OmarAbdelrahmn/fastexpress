'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  User, 
  Search, 
  Filter,
  FileText,
  MapPin,
  Tag,
  Clock3,
  CalendarCheck2
} from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';

export default function MaintenanceRemindersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Date State - initialized to KSA today (Asia/Riyadh timezone)
  const getKSAToday = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
  };
  const [checkDate, setCheckDate] = useState(getKSAToday());
  
  // Tab State: 'vehicles' or 'riders'
  const [activeTab, setActiveTab] = useState('vehicles');
  
  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadReminders();
  }, [checkDate]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      // Fetch reminders from the GET /api/member/maintenance/reminders endpoint
      const response = await ApiService.get(API_ENDPOINTS.MEMBER.REMINDERS(checkDate));
      setData(response || null);
    } catch (error) {
      console.error('Error loading maintenance reminders:', error);
      showAlert('error', 'حدث خطأ أثناء تحميل تنبيهات الصيانة');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Format Date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'غير محدد';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Get status badge properties
  const getStatusBadgeProps = (status) => {
    const s = String(status);
    switch (s) {
      case '4':
      case 'Overdue':
        return {
          text: 'متأخر جداً',
          classes: 'bg-red-50 text-red-700 border-red-200 border-2 font-bold ring-2 ring-red-100/50'
        };
      case '3':
      case 'DueToday':
        return {
          text: 'مستحق اليوم',
          classes: 'bg-orange-50 text-orange-700 border-orange-200 border-2 font-bold ring-2 ring-orange-100/50 animate-pulse'
        };
      case '2':
      case 'Upcoming':
        return {
          text: 'قريب الاستحقاق',
          classes: 'bg-amber-50 text-amber-700 border-amber-200 border-2 font-semibold'
        };
      case '5':
      case 'NeverDone':
        return {
          text: 'لم يتم الإنجاز مسبقاً',
          classes: 'bg-gray-100 text-gray-700 border-gray-300 border-2 font-semibold'
        };
      default:
        return {
          text: status || 'غير معروف',
          classes: 'bg-gray-50 text-gray-600 border-gray-200 border'
        };
    }
  };

  // Get Item Type details
  const getItemTypeLabel = (type) => {
    return type === 1 ? 'قطعة غيار' : 'معدات سائق';
  };

  // Helper to match status against Legacy strings or API numeric codes
  const matchesStatus = (itemStatus, filter) => {
    if (filter === 'All') return true;
    const itemStr = String(itemStatus);
    const filterStr = String(filter);
    return itemStr === filterStr ||
           (filterStr === 'Overdue' && itemStr === '4') ||
           (filterStr === 'DueToday' && itemStr === '3') ||
           (filterStr === 'Upcoming' && itemStr === '2') ||
           (filterStr === 'NeverDone' && itemStr === '5');
  };

  // Filter and Search Logic
  const getFilteredVehicles = () => {
    if (!data?.vehicleReminders) return [];
    
    return data.vehicleReminders.filter(v => {
      // 1. Search filter
      const matchesSearch = 
        v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedRiderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedRiderIqamaNo?.toString().includes(searchQuery);

      // 2. Status filter
      if (statusFilter === 'All') return matchesSearch;
      
      const hasMatchingStatusItem = v.dueItems?.some(item => matchesStatus(item.status, statusFilter));
      return matchesSearch && hasMatchingStatusItem;
    });
  };

  const getFilteredRiders = () => {
    if (!data?.riderReminders) return [];
    
    return data.riderReminders.filter(r => {
      // 1. Search filter
      const matchesSearch = 
        r.riderNameAR?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.riderNameEN?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.workingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.housingName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.riderIqamaNo?.toString().includes(searchQuery);

      // 2. Status filter
      if (statusFilter === 'All') return matchesSearch;
      
      const hasMatchingStatusItem = r.dueItems?.some(item => matchesStatus(item.status, statusFilter));
      return matchesSearch && hasMatchingStatusItem;
    });
  };

  const filteredVehicles = getFilteredVehicles();
  const filteredRiders = getFilteredRiders();

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Hero Section / Header */}
      <div className="bg-gradient-to-l from-purple-600 via-violet-700 to-blue-700 p-4 md:p-5 rounded-2xl shadow-lg text-white relative overflow-hidden mx-2 md:mx-4">
        <div className="absolute right-0 top-0 w-56 h-56 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-fuchsia-400/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-row items-center justify-between gap-3">
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 flex-shrink-0">
              <Wrench size={20} className="text-fuchsia-200" />
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight leading-tight">تنبيهات الصيانة</h1>
          </div>

          {/* Date Picker chip */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 flex-shrink-0">
            <Calendar size={15} className="text-fuchsia-200 flex-shrink-0" />
            <label className="text-xs font-semibold text-white/80 whitespace-nowrap hidden sm:block">التاريخ :</label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none w-32"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-4">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div className="space-y-2">
              <p className="text-gray-500 text-xs md:text-sm font-medium">المركبات المتأثرة</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{data.totalAffectedVehicles}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl text-purple-700">
              <Wrench size={24} />
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div className="space-y-2">
              <p className="text-gray-500 text-xs md:text-sm font-medium">السائقين المتأثرين</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{data.totalAffectedRiders}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
              <User size={24} />
            </div>
          </div>

          <div className="bg-red-50/50 p-4 md:p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div className="space-y-2">
              <p className="text-red-700/80 text-xs md:text-sm font-medium">عناصر متأخرة جداً</p>
              <h3 className="text-2xl md:text-3xl font-bold text-red-700">{data.totalOverdueItems}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-xl text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="bg-orange-50/50 p-4 md:p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div className="space-y-2">
              <p className="text-orange-700/80 text-xs md:text-sm font-medium">مستحقة اليوم</p>
              <h3 className="text-2xl md:text-3xl font-bold text-orange-700">{data.totalDueTodayItems}</h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <Clock size={24} className="animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Filtering and Search Area */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mx-2 md:mx-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'vehicles' ? "البحث برقم المركبة، اللوحة، المندوب، السكن..." : "البحث باسم السائق، الرقم الوظيفي، الهوية، السكن..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 ml-2 flex items-center gap-1">
              <Filter size={14} /> تصفية بالحالة:
            </span>
            {[
              { id: 'All', label: 'الكل' },
              { id: 'Overdue', label: 'متأخر جداً' },
              { id: 'DueToday', label: 'مستحق اليوم' },
              { id: 'Upcoming', label: 'قريب الاستحقاق' },
              { id: 'NeverDone', label: 'لم ينجز سابقاً' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  statusFilter === status.id 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mx-2 md:mx-4">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 mb-6 bg-white p-2 rounded-t-xl">
          <button
            onClick={() => { setActiveTab('vehicles'); setSearchQuery(''); }}
            className={`flex-1 py-3 px-4 text-center font-bold text-sm md:text-base border-b-2 transition-all duration-300 cursor-pointer flex justify-center items-center gap-2 ${
              activeTab === 'vehicles'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg'
            }`}
          >
            <Wrench size={18} />
            <span>تنبيهات صيانة المركبات</span>
            {data?.vehicleReminders && (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold">
                {data.vehicleReminders.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => { setActiveTab('riders'); setSearchQuery(''); }}
            className={`flex-1 py-3 px-4 text-center font-bold text-sm md:text-base border-b-2 transition-all duration-300 cursor-pointer flex justify-center items-center gap-2 ${
              activeTab === 'riders'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg'
            }`}
          >
            <User size={18} />
            <span>تنبيهات معدات السائقين</span>
            {data?.riderReminders && (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold">
                {data.riderReminders.length}
              </span>
            )}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">جاري جلب تنبيهات الصيانة...</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div>
            {activeTab === 'vehicles' ? (
              // VEHICLES REMINDERS TAB
              <div className="space-y-6">
                {filteredVehicles.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4">
                    <CheckCircle className="text-green-500" size={48} />
                    <h3 className="text-lg font-bold text-gray-900">لا توجد تنبيهات صيانة للمركبات</h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      كل المركبات في حالة ممتازة ومواعيد صيانتها وجداول قطع غيارها غير متأخرة أو مطابقة للتصفية المحددة.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredVehicles.map((vehicle, vIndex) => (
                      <div 
                        key={vIndex} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                      >
                        {/* Header Info */}
                        <div className="bg-slate-55 border-b border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-purple-100 text-purple-700 p-3 rounded-2xl self-start">
                              <Wrench size={24} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">المركبة: {formatPlateNumber(vehicle.vehiclePlate)}</h3>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <MapPin size={13} className="text-gray-400" /> {vehicle.location || 'السكن غير محدد'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Driver Info */}
                          <div className="bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-100 text-xs md:text-sm md:self-center">
                            {vehicle.assignedRiderName ? (
                              <div className="space-y-1">
                                <p className="text-gray-500 font-medium flex items-center gap-1.5">
                                  <User size={14} className="text-gray-400" />
                                  <span>السائق المسؤول: <strong className="text-gray-800">{vehicle.assignedRiderName}</strong></span>
                                </p>
                                <p className="text-gray-400 font-light pr-5">
                                  رقم الإقامة: {vehicle.assignedRiderIqamaNo}
                                </p>
                              </div>
                            ) : (
                              <p className="text-amber-600 font-medium flex items-center gap-1">
                                <AlertTriangle size={14} /> مركبة غير مخصصة لسائق حالياً
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Due Items Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                                <th className="p-4">اسم قطعة الغيار</th>
                                <th className="p-4">نوع الصيانة</th>
                                <th className="p-4">الفترة الدورية</th>
                                <th className="p-4">آخر صيانة</th>
                                <th className="p-4">الاستحقاق القادم</th>
                                <th className="p-4">المهلة المتبقية</th>
                                <th className="p-4">حالة الاستحقاق</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                              {vehicle.dueItems
                                .filter(item => matchesStatus(item.status, statusFilter))
                                .map((item, iIndex) => {
                                  const badge = getStatusBadgeProps(item.status);
                                  return (
                                    <tr key={iIndex} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="p-4 font-bold text-gray-900">{item.itemName}</td>
                                      <td className="p-4 text-gray-500 text-xs">
                                        <span className="flex items-center gap-1.5">
                                          <Tag size={13} className="text-purple-400" />
                                          {getItemTypeLabel(item.itemType)}
                                        </span>
                                      </td>
                                      <td className="p-4 text-gray-600 text-xs">كل {item.intervalDays} أيام</td>
                                      <td className="p-4 text-gray-500 text-xs">{formatDate(item.lastDoneAt)}</td>
                                      <td className="p-4 text-gray-800 text-xs font-semibold">{formatDate(item.nextDueAt)}</td>
                                      <td className="p-4 text-xs font-medium">
                                        {item.daysUntilDue < 0 ? (
                                          <span className="text-red-650 font-bold flex items-center gap-1">
                                            <Clock3 size={12} /> متأخر بـ {Math.abs(item.daysUntilDue)} يوم
                                          </span>
                                        ) : item.daysUntilDue === 0 ? (
                                          <span className="text-orange-600 font-bold flex items-center gap-1">
                                            <CalendarCheck2 size={12} /> مستحق اليوم
                                          </span>
                                        ) : (
                                          <span className="text-emerald-600">متبقي {item.daysUntilDue} يوم</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.classes}`}>
                                          {badge.text}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // RIDERS REMINDERS TAB
              <div className="space-y-6">
                {filteredRiders.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4">
                    <CheckCircle className="text-green-500" size={48} />
                    <h3 className="text-lg font-bold text-gray-900">لا توجد تنبيهات لمعدات السائقين</h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      جميع السائقين لديهم معدات سلامة سارية الصلاحية وغير متأخرة أو مطابقة للتصفية المحددة.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredRiders.map((rider, rIndex) => (
                      <div 
                        key={rIndex} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                      >
                        {/* Header Info */}
                        <div className="bg-slate-55 border-b border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl self-start">
                              <User size={24} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">{rider.riderNameAR || rider.riderNameEN}</h3>
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-0.5 rounded-lg text-xs font-semibold">
                                  كود: {rider.workingId}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <MapPin size={13} className="text-gray-400" /> {rider.housingName || 'السكن غير محدد'}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span>هوية / إقامة: {rider.riderIqamaNo}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Due Items Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                                <th className="p-4">اسم المعدات</th>
                                <th className="p-4">نوع الصيانة</th>
                                <th className="p-4">الفترة الدورية</th>
                                <th className="p-4">آخر تاريخ تسليم</th>
                                <th className="p-4">الاستحقاق القادم</th>
                                <th className="p-4">المهلة المتبقية</th>
                                <th className="p-4">حالة الاستحقاق</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                              {rider.dueItems
                                .filter(item => matchesStatus(item.status, statusFilter))
                                .map((item, iIndex) => {
                                  const badge = getStatusBadgeProps(item.status);
                                  return (
                                    <tr key={iIndex} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="p-4 font-bold text-gray-900">{item.itemName}</td>
                                      <td className="p-4 text-gray-500 text-xs">
                                        <span className="flex items-center gap-1.5">
                                          <Tag size={13} className="text-blue-400" />
                                          {getItemTypeLabel(item.itemType)}
                                        </span>
                                      </td>
                                      <td className="p-4 text-gray-600 text-xs">كل {item.intervalDays} أيام</td>
                                      <td className="p-4 text-gray-500 text-xs">{formatDate(item.lastDoneAt)}</td>
                                      <td className="p-4 text-gray-800 text-xs font-semibold">{formatDate(item.nextDueAt)}</td>
                                      <td className="p-4 text-xs font-medium">
                                        {item.daysUntilDue < 0 ? (
                                          <span className="text-red-650 font-bold flex items-center gap-1">
                                            <Clock3 size={12} /> متأخر بـ {Math.abs(item.daysUntilDue)} يوم
                                          </span>
                                        ) : item.daysUntilDue === 0 ? (
                                          <span className="text-orange-600 font-bold flex items-center gap-1">
                                            <CalendarCheck2 size={12} /> مستحق اليوم
                                          </span>
                                        ) : (
                                          <span className="text-emerald-600">متبقي {item.daysUntilDue} يوم</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.classes}`}>
                                          {badge.text}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
