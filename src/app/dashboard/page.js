'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Car, Users, TrendingUp, Package, Building2, Home, 
  Calendar, Activity, AlertTriangle, CheckCircle, Clock,
  ArrowUp, ArrowDown, Minus, BarChart3
} from 'lucide-react';
import Link from 'next/link';

// Real API imports
const TokenManager = {
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
};

const API_BASE_URL = 'https://fastexpress.tryasp.net';

class ApiService {
  static async request(endpoint, options = {}) {
    const token = TokenManager.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        TokenManager.clearToken?.();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('انتهت صلاحية الجلسة');
      }

      if (!response.ok) {
        const errorMessage = data?.title || data?.error?.description || data?.detail || `خطأ في الطلب: ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
}

// Real API hook
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const get = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);

    try {
      const data = await ApiService.get(endpoint);
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message || 'حدث خطأ');
      setLoading(false);
      return { data: null, error: err.message };
    }
  }, []);

  return { get, loading, error };
};

const API_ENDPOINTS = {
  VEHICLES: { 
    LIST: '/api/vehicles',
    GROUP_BY_STATUS: '/api/vehicles/group-by-status',
    AVAILABLE: '/api/vehicles/available',
    TAKEN: '/api/vehicles/taken',
    PROBLEM: '/api/vehicles/problem'
  },
  RIDER: { 
    LIST: '/api/rider',
    INACTIVE: '/api/Rider/inactive'
  },
  ADMIN: { USERS: '/api/admin/users' },
  COMPANY: { LIST: '/api/company/' },
  HOUSING: { LIST: '/api/housing' },
  SHIFT: { 
    LIST: '/api/shift/range',
    BY_DATE: '/api/shift/date'
  },
  EMPLOYEE: { LIST: '/api/employee' },
  REPORTS: { DASHBOARD: '/api/Report' },
  TEMP: {
    VEHICLES: {
      GET_PENDING: '/api/temp/vehicles'
    }
  }
};

export default function EnhancedDashboard() {
  const { get, loading } = useApi();
  const [stats, setStats] = useState({
    vehicles: 0,
    availableVehicles: 0,
    takenVehicles: 0,
    problemVehicles: 0,
    riders: 0,
    activeRiders: 0,
    inactiveRiders: 0,
    users: 0,
    companies: 0,
    housing: 0,
    housingOccupancy: 0,
    todayShifts: 0,
    activeShifts: 0,
    employees: 0,
    pendingRequests: 0,
    vehicleUtilization: 0,
    riderEfficiency: 0
  });

  const [trends, setTrends] = useState({
    vehicles: 5.2,
    riders: 3.1,
    shifts: -2.4,
    housing: 8.3
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        vehiclesRes, 
        vehicleStatusRes,
        ridersRes,
        inactiveRidersRes,
        usersRes, 
        companiesRes, 
        housingRes,
        employeesRes,
        pendingRequestsRes
      ] = await Promise.all([
        get(API_ENDPOINTS.VEHICLES.LIST),
        get(API_ENDPOINTS.VEHICLES.GROUP_BY_STATUS),
        get(API_ENDPOINTS.RIDER.LIST),
        get(API_ENDPOINTS.RIDER.INACTIVE),
        get(API_ENDPOINTS.ADMIN.USERS),
        get(API_ENDPOINTS.COMPANY.LIST),
        get(API_ENDPOINTS.HOUSING.LIST),
        get(API_ENDPOINTS.EMPLOYEE.LIST),
        get(API_ENDPOINTS.TEMP.VEHICLES.GET_PENDING)
      ]);

      const vehiclesSummary = vehicleStatusRes.data?.summary || {};
      const totalVehicles = vehicleStatusRes.data?.totalVehicles || vehiclesRes.data?.length || 0;
      const availableVehicles = vehiclesSummary.availableCount || 0;
      const takenVehicles = vehiclesSummary.takenCount || 0;
      const problemVehicles = vehiclesSummary.problemCount || 0;
      
      const allRiders = ridersRes.data || [];
      const totalRiders = allRiders.length;
      const inactiveRiders = inactiveRidersRes.data?.length || 0;
      const activeRiders = totalRiders - inactiveRiders;
      
      const housingData = Array.isArray(housingRes.data) ? housingRes.data : [housingRes.data].filter(Boolean);
      const totalHousingCapacity = housingData.reduce((sum, h) => sum + (h.capacity || 0), 0);
      const totalHousingOccupied = housingData.reduce((sum, h) => sum + (h.currentOccupancy || 0), 0);
      const realOccupancyRate = totalHousingCapacity > 0 
        ? Math.round((totalHousingOccupied / totalHousingCapacity) * 100) 
        : 0;

      const totalCompanies = companiesRes.data?.length || 0;
      const totalUsers = usersRes.data?.length || 0;
      const totalEmployees = employeesRes.data?.length || 0;

      const pendingRequests = Array.isArray(pendingRequestsRes.data) 
        ? pendingRequestsRes.data.length 
        : 0;

      const today = new Date().toISOString().split('T')[0];
      
      let todayShiftsCount = 0;
      let activeShiftsCount = 0;
      try {
        const shiftsRes = await get(`${API_ENDPOINTS.SHIFT.BY_DATE}?shiftDate=${today}`);
        const todayShifts = shiftsRes.data || [];
        todayShiftsCount = todayShifts.length;
        activeShiftsCount = todayShifts.filter(s => s.isActive !== false).length;
      } catch (err) {
        console.log('Shifts data not available:', err.message);
      }

      const vehicleUtilization = totalVehicles > 0 
        ? ((takenVehicles / totalVehicles) * 100).toFixed(1)
        : 0;

      const riderEfficiency = totalRiders > 0
        ? ((activeRiders / totalRiders) * 100).toFixed(1)
        : 0;

      setStats({
        vehicles: totalVehicles,
        availableVehicles: availableVehicles,
        takenVehicles: takenVehicles,
        problemVehicles: problemVehicles,
        riders: totalRiders,
        activeRiders: activeRiders,
        inactiveRiders: inactiveRiders,
        users: totalUsers,
        companies: totalCompanies,
        housing: housingData.length,
        housingOccupancy: realOccupancyRate,
        todayShifts: todayShiftsCount,
        activeShifts: activeShiftsCount,
        employees: totalEmployees,
        pendingRequests: pendingRequests,
        vehicleUtilization: parseFloat(vehicleUtilization),
        riderEfficiency: parseFloat(riderEfficiency)
      });

      setTrends({
        vehicles: parseFloat(vehicleUtilization) > 70 ? 5.2 : -3.1,
        riders: parseFloat(riderEfficiency) > 80 ? 3.1 : -2.4,
        shifts: todayShiftsCount > 30 ? 2.8 : -1.5,
        housing: realOccupancyRate > 75 ? 8.3 : -3.2
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, linkText }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    teal: 'from-teal-500 to-teal-600',
    indigo: 'from-indigo-500 to-indigo-600',
    rose: 'from-rose-500 to-rose-600',
    amber: 'from-amber-500 to-amber-600'
  };

  const iconBgColors = {
    blue: 'bg-blue-800',
    green: 'bg-green-800',
    orange: 'bg-orange-800',
    purple: 'bg-purple-800',
    teal: 'bg-teal-800',
    indigo: 'bg-indigo-800',
    rose: 'bg-rose-800',
    amber: 'bg-amber-800'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <ArrowUp size={12} />;
    if (trend < 0) return <ArrowDown size={12} />;
    return <Minus size={12} />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Updated icon container - removed backdrop blur and added solid background */}
          <div className={`${iconBgColors[color]} bg-opacity-80 p-2.5 rounded-xl`}>
            <Icon size={22} className="text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 ${getTrendColor()} bg-white bg-opacity-20 px-2 py-1 rounded-full backdrop-blur-sm text-xs font-bold`}>
              {getTrendIcon()}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-white text-opacity-90 text-xs font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold mb-1.5">
            {loading ? '...' : value}
          </p>
          <p className="text-white text-opacity-80 text-xs">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

  const MiniStatCard = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      teal: 'bg-teal-50 border-teal-200 text-teal-700'
    };

    return (
      <div className={`${colorClasses[color]} border-2 rounded-xl p-3 hover:shadow-md transition-all`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-75 mb-1">{label}</p>
            <p className="text-xl font-bold">{loading ? '...' : value}</p>
          </div>
          <Icon size={20} className="opacity-60" />
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, description, color, onClick }) => {
    const colorClasses = {
      blue: 'hover:bg-blue-50 border-blue-300 text-blue-600',
      green: 'hover:bg-green-50 border-green-300 text-green-600',
      orange: 'hover:bg-orange-50 border-orange-300 text-orange-600',
      purple: 'hover:bg-purple-50 border-purple-300 text-purple-600'
    };

    return (
      <button
        onClick={onClick}
        className={`w-full p-4 border-2 border-dashed ${colorClasses[color]} rounded-xl transition-all hover:border-solid hover:shadow-lg text-right`}
      >
        <Icon className="mb-2" size={24} />
        <p className="font-bold text-base mb-0.5">{title}</p>
        <p className="text-xs opacity-75">{description}</p>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 md:p-6" dir="rtl">
      {/* Welcome Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white rounded-2xl shadow-xl p-4 md:p-8 mb-4 md:mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white opacity-5 rounded-full -mr-16 md:-mr-32 -mt-16 md:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white opacity-5 rounded-full -ml-12 md:-ml-24 -mb-12 md:-mb-24"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                <Activity size={28} className="md:w-10 md:h-10" />
                لوحة التحكم الرئيسية
              </h1>
              <p className="text-blue-100 text-sm md:text-lg">نظام إدارة الخدمات اللوجستية المتكامل</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 mt-3 md:mt-4 text-xs md:text-sm">
                <div className="flex items-center gap-2  bg-opacity-20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm">
                  <Calendar size={14} className="md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2  bg-opacity-20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-sm">
                  <Clock size={14} className="md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2">
              <div className=" bg-opacity-20 px-6 py-3 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-blue-100">الحالة العامة للنظام</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-lg font-bold">نشط</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
        <Link href="/vehicles/admin">
          <StatCard
            title="إجمالي المركبات"
            value={stats.vehicles}
            subtitle="مركبة في الأسطول"
            icon={Car}
            color="blue"
            linkText="عرض التفاصيل"
          />
        </Link>
        <Link href="/riders/">
          <StatCard
            title="السائقين النشطين"
            value={stats.activeRiders}
            subtitle={`من ${stats.riders} سائق`}
            icon={Users}
            color="green"
            linkText="إدارة السائقين"
          />
        </Link>
        <Link href="shifts/">
          <StatCard
            title="الورديات اليوم"
            value={stats.activeShifts}
            subtitle={`من ${stats.todayShifts} وردية`}
            icon={Calendar}
            color="purple"
            linkText="جدول الورديات"
          />
        </Link>
        <Link href="employees/">
          <StatCard
            title="إجمالي الموظفين"
            value={stats.employees}
            subtitle="موظف نشط"
            icon={Package}
            color="orange"
            linkText="قائمة الموظفين"
          />
        </Link>
      </div>

      {/* Detailed Statistics Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Vehicles Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
              <Car size={20} className="text-blue-600 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800">تفصيل المركبات</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <MiniStatCard icon={CheckCircle} label="متاحة" value={stats.availableVehicles} color="green" />
            <MiniStatCard icon={Users} label="قيد الاستخدام" value={stats.takenVehicles} color="blue" />
            <MiniStatCard icon={AlertTriangle} label="تحتاج صيانة" value={stats.problemVehicles} color="orange" />
          </div>
        </div>

        {/* Riders Status */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 md:p-3 rounded-lg">
              <Users size={20} className="text-green-600 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800">حالة السائقين</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <MiniStatCard icon={CheckCircle} label="نشط" value={stats.activeRiders} color="green" />
            <MiniStatCard icon={Clock} label="غير نشط" value={stats.inactiveRiders} color="red" />
            <MiniStatCard icon={TrendingUp} label="معدل الأداء" value={`${stats.riderEfficiency.toFixed(0)}%`} color="purple" />
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 md:p-3 rounded-lg">
              <BarChart3 size={20} className="text-purple-600 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800">نظرة عامة</h3>
          </div>
          <div className="space-y-2 md:space-y-3">
            <MiniStatCard icon={Building2} label="الشركات" value={stats.companies} color="blue" />
            <MiniStatCard icon={Home} label="السكنات" value={stats.housing} color="teal" />
            <MiniStatCard icon={Users} label="المستخدمين" value={stats.users} color="purple" />
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100 mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
          <Activity size={20} className="text-indigo-600 md:w-6 md:h-6" />
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link href="/vehicles/admin/manage">
            <QuickActionCard icon={Car} title="إضافة مركبة" description="تسجيل مركبة جديدة" color="blue" onClick={() => console.log('Add vehicle')} />
          </Link>
          <Link href="/riders/create">
            <QuickActionCard icon={Users} title="إضافة سائق" description="تسجيل سائق جديد" color="green" onClick={() => console.log('Add rider')} />
          </Link>
          <Link href="/shifts/">
            <QuickActionCard icon={Calendar} title="جدولة وردية" description="إنشاء وردية جديدة" color="purple" onClick={() => console.log('Schedule shift')} />
          </Link>
          <Link href="/reports/">
            <QuickActionCard icon={BarChart3} title="عرض التقارير" description="تقارير الأداء التفصيلية" color="orange" onClick={() => console.log('View reports')} />
          </Link>
        </div>
      </div>

      {/* Performance Metrics - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 p-2 md:p-3 rounded-lg">
            <TrendingUp size={20} className="text-indigo-600 md:w-6 md:h-6" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-gray-800">مؤشرات الأداء</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-gray-600">استخدام المركبات</span>
              <span className="text-xs md:text-sm font-bold text-indigo-600">{stats.vehicleUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 md:h-3 rounded-full transition-all duration-500" style={{width: `${Math.min(stats.vehicleUtilization, 100)}%`}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-gray-600">كفاءة السائقين</span>
              <span className="text-xs md:text-sm font-bold text-green-600">{stats.riderEfficiency.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 md:h-3 rounded-full transition-all duration-500" style={{width: `${Math.min(stats.riderEfficiency, 100)}%`}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-gray-600">إشغال السكنات</span>
              <span className="text-xs md:text-sm font-bold text-purple-600">{stats.housingOccupancy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 md:h-3 rounded-full transition-all duration-500" style={{width: `${Math.min(stats.housingOccupancy, 100)}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}