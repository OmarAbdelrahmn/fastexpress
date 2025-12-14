"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Car,
  Users,
  TrendingUp,
  Package,
  Building2,
  Home,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  ShoppingBag,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight // Added new icon
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import SpecialReportTemplate from "@/components/dashboard/SpecialReportTemplate";
import HousingReportTemplate from "@/components/dashboard/HousingReportTemplate";
import HousingDetailedReportTemplate from "@/components/dashboard/HousingDetailedReportTemplate";

const TokenManager = {
  getToken: () =>
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
};

const API_BASE_URL = "https://fastexpress.tryasp.net";

class ApiService {
  static async request(endpoint, options = {}) {
    const token = TokenManager.getToken();

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        TokenManager.clearToken?.();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
        throw new Error(t('common.sessionExpired'));
      }

      if (!response.ok) {
        const errorMessage =
          data?.title ||
          data?.error?.description ||
          data?.detail ||
          `خطأ في الطلب: ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static get(endpoint) {
    return this.request(endpoint, { method: "GET" });
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
      setError(err.message || t('common.error'));
      setLoading(false);
      return { data: null, error: err.message };
    }
  }, []);

  return { get, loading, error };
};

const API_ENDPOINTS = {
  VEHICLES: {
    LIST: "/api/vehicles",
    GROUP_BY_STATUS: "/api/vehicles/group-by-status",
    AVAILABLE: "/api/vehicles/available",
    TAKEN: "/api/vehicles/taken",
    PROBLEM: "/api/vehicles/problem",
  },
  RIDER: {
    LIST: "/api/rider",
    INACTIVE: "/api/Rider/inactive",
  },
  ADMIN: { USERS: "/api/admin/users" },
  COMPANY: { LIST: "/api/company/" },
  HOUSING: { LIST: "/api/housing" },
  SHIFT: {
    LIST: "/api/shift/range",
    BY_DATE: "/api/shift/date",
    PREVIOUS_DAY_ACCEPTED: "/api/shift/accepted/previous-day",
  },
  EMPLOYEE: { LIST: "/api/employee" },
  REPORTS: { DASHBOARD: "/api/Report" },
  TEMP: {
    VEHICLES: {
      GET_PENDING: "/api/temp/vehicles",
    },
  },
};

export default function EnhancedDashboard() {
  const { t } = useLanguage();

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
    riderEfficiency: 0,
    previousDayTotalOrders: 0,
  });

  const [trends, setTrends] = useState({
    vehicles: 5.2,
    riders: 3.1,
    shifts: -2.4,
    housing: 8.3,
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
        pendingRequestsRes,
        previousDayOrdersRes,
      ] = await Promise.all([
        get(API_ENDPOINTS.VEHICLES.LIST),
        get(API_ENDPOINTS.VEHICLES.GROUP_BY_STATUS),
        get(API_ENDPOINTS.RIDER.LIST),
        get(API_ENDPOINTS.RIDER.INACTIVE),
        get(API_ENDPOINTS.ADMIN.USERS),
        get(API_ENDPOINTS.COMPANY.LIST),
        get(API_ENDPOINTS.HOUSING.LIST),
        get(API_ENDPOINTS.EMPLOYEE.LIST),
        get(API_ENDPOINTS.TEMP.VEHICLES.GET_PENDING),
        get(API_ENDPOINTS.SHIFT.PREVIOUS_DAY_ACCEPTED),
      ]);

      const vehiclesSummary = vehicleStatusRes.data?.summary || {};
      const totalVehicles =
        vehicleStatusRes.data?.totalVehicles || vehiclesRes.data?.length || 0;
      const availableVehicles = vehiclesSummary.availableCount || 0;
      const takenVehicles = vehiclesSummary.takenCount || 0;
      const problemVehicles = vehiclesSummary.problemCount || 0;

      const allRiders = ridersRes.data || [];
      const totalRiders = allRiders.length;
      const inactiveRiders = inactiveRidersRes.data?.length || 0;
      const activeRiders = totalRiders - inactiveRiders;

      const housingData = Array.isArray(housingRes.data)
        ? housingRes.data
        : [housingRes.data].filter(Boolean);
      const totalHousingCapacity = housingData.reduce(
        (sum, h) => sum + (h.capacity || 0),
        0
      );
      const totalHousingOccupied = housingData.reduce(
        (sum, h) => sum + (h.currentOccupancy || 0),
        0
      );
      const realOccupancyRate =
        totalHousingCapacity > 0
          ? Math.round((totalHousingOccupied / totalHousingCapacity) * 100)
          : 0;

      const totalCompanies = companiesRes.data?.length || 0;
      const totalUsers = usersRes.data?.length || 0;
      const totalEmployees = employeesRes.data?.length || 0;

      const pendingRequests = Array.isArray(pendingRequestsRes.data)
        ? pendingRequestsRes.data.length
        : 0;

      const today = new Date().toISOString().split("T")[0];

      let todayShiftsCount = 0;
      let activeShiftsCount = 0;
      try {
        const shiftsRes = await get(
          `${API_ENDPOINTS.SHIFT.BY_DATE}?shiftDate=${today}`
        );
        const todayShifts = shiftsRes.data || [];
        todayShiftsCount = todayShifts.length;
        activeShiftsCount = todayShifts.filter(
          (s) => s.isActive !== false
        ).length;
      } catch (err) {
        console.log("Shifts data not available:", err.message);
      }

      const vehicleUtilization =
        totalVehicles > 0
          ? ((takenVehicles / totalVehicles) * 100).toFixed(1)
          : 0;

      const riderEfficiency =
        totalRiders > 0 ? ((activeRiders / totalRiders) * 100).toFixed(1) : 0;

      let previousDayTotal = 0;
      let previousDayRiders = 0;

      if (
        previousDayOrdersRes.data &&
        Array.isArray(previousDayOrdersRes.data)
      ) {
        previousDayTotal = previousDayOrdersRes.data.reduce(
          (sum, shift) => sum + (shift.acceptedDailyOrders || 0),
          0
        );
        previousDayRiders = previousDayOrdersRes.data.length;
      }
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
        riderEfficiency: parseFloat(riderEfficiency),
        previousDayTotalOrders: previousDayTotal,
        previousDayTotalRiders: previousDayRiders,
      });

      setTrends({
        vehicles: parseFloat(vehicleUtilization) > 70 ? 5.2 : -3.1,
        riders: parseFloat(riderEfficiency) > 80 ? 3.1 : -2.4,
        shifts: todayShiftsCount > 30 ? 2.8 : -1.5,
        housing: realOccupancyRate > 75 ? 8.3 : -3.2,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };


  const [specialReportData, setSpecialReportData] = useState(null);
  const [housingReportData, setHousingReportData] = useState(null);
  const [housingDetailedReportData, setHousingDetailedReportData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleHousingDetailedReport = async () => {
    try {
      const response = await get("/api/report/special2");
      const data = response.data || {
        reportDate: "2025-12-14",
        housingDetails: [],
        grandTotalOrders: 0,
        grandTotalRiders: 0
      };
      setHousingDetailedReportData(data);
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("Failed to fetch housing detailed report:", error);
      alert(t('common.error'));
    }
  };

  const handleSpecialReport = async () => {
    try {
      const response = await get("/api/report/special");
      const reportData = response.data || {
        "period1Start": "2025-11-01",
        "period1End": "2025-11-13",
        "period2Start": "2025-12-01",
        "period2End": "2025-12-13",
        "period1TotalOrders": 0,
        "period2TotalOrders": 18,
        "ordersDifference": 18,
        "changePercentage": 10,
        "trendDescription": "🚀"
      };
      setSpecialReportData(reportData);
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("Failed to fetch special report:", error);
      alert(t('common.error'));
    }
  };

  const handleHousingReport = async () => {
    try {
      const response = await get("/api/report/special1");
      const data = response.data || {
        reportDate: "2025-12-14",
        housingSummaries: [],
        totalOrders: 0,
        totalRiders: 0,
        averageOrdersPerRider: 0
      };
      setHousingReportData(data);
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("Failed to fetch housing report:", error);
      alert(t('common.error'));
    }
  };

  // Color Palette Constants
  const COLORS = {
    blue: "#2563eb",   // blue-600
    orange: "#f97316", // orange-500
    gray: "#64748b",   // slate-500
    grayLight: "#94a3b8", // slate-400
  };

  // Helper for background color with opacity (approx 10%)
  const getBgStyle = (hex) => ({
    backgroundColor: `${hex}1A` // 1A is ~10% opacity in hex
  });

  const PageHeader = () => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-500 text-sm">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-blue-100">
        <Clock size={16} color={COLORS.blue} />
        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  );

  const StatCard = ({ title, value, subtitle, icon: Icon, color, link, background }) => (
    <Link href={link} className="block group">
      <div className={`rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${background}`}>
        <div className="flex justify-between items-start mb-4 ">
          <div className="p-3 rounded-xl transition-colors" style={getBgStyle(color)}>
            <Icon size={24} color={color} />
          </div>
          {/* Subtle background decoration */}
          <Icon className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 transition-transform group-hover:scale-110" size={100} color={color} />
        </div>

        <div className="relative z-10 ">
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{loading ? "..." : value}</h3>
          <p className="font-medium text-gray-700 mb-1">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
    </Link>
  );

  const QuickActionBtn = ({ title, subtitle, icon: Icon, color, onClick,background }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 ${background} border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group text-right hover:border-blue-100`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg transition-colors" style={getBgStyle(color)}>
            <Icon size={24} color={color} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
          <ChevronRight size={16} color={COLORS.grayLight} className="rtl:rotate-180" />
        </div>
      </button>
    );
  };

  const MiniStatRow = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-default group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md group-hover:bg-opacity-20 transition-all" style={getBgStyle(color)}>
          <Icon size={18} color={color} />
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100/500 p-4 md:p-8" dir="rtl">
      {/* Printable Components */}
      {specialReportData && <SpecialReportTemplate data={specialReportData} />}
      {housingReportData && <HousingReportTemplate data={housingReportData} />}
      {housingDetailedReportData && <HousingDetailedReportTemplate data={housingDetailedReportData} />}

      <div className="max-w-7xl mx-auto">
        <PageHeader />

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t("dashboard.totalVehicles")}
            value={stats.vehicles}
            subtitle={t("dashboard.vehiclesInFleet")}
            icon={Car}
            color={COLORS.black}
            link="/vehicles/admin"
            background="bg-gray-300"
          />
          <StatCard
            title={t("dashboard.allRiders")}
            value={stats.riders}
            subtitle={t("dashboard.fromRiders")}
            icon={Users}
            color={COLORS.black}
            link="/riders/"
            background="bg-blue-200"
          />
          <StatCard
            title={t("dashboard.todayShifts")}
            value={stats.activeShifts}
            subtitle={t("dashboard.shiftsSchedule")}
            icon={Calendar}
            color={COLORS.black}
            link="shifts/"
            background="bg-gray-300"
          />
          <StatCard
            title={t("dashboard.pendingApprovals")}
            value={stats.pendingRequests}
            subtitle={t("dashboard.hasPendingApprovals")}
            icon={FileText}
            color={COLORS.black}
            link="vehicles/admin/users-requests"
            background="bg-blue-200"
          />
        </div>

        {/* Quick Actions & Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("reports.title")}</h2>

            <QuickActionBtn
              title="تقرير الفرق الخاص"
              subtitle="طباعة تقرير الفروقات"
              icon={BarChart3}
              color={COLORS.black}
              background="bg-blue-300"
              onClick={() => {
                setHousingDetailedReportData(null);
                setHousingReportData(null);
                handleSpecialReport();
              }}
            />

            <QuickActionBtn
              title="تحليل المجموعات"
              subtitle="تقرير السكنات والطلبات"
              icon={TrendingUp}
              color={COLORS.black}
              background="bg-blue-300"
              onClick={() => {
                setSpecialReportData(null);
                setHousingDetailedReportData(null);
                handleHousingReport();
              }}
            />

            <QuickActionBtn
              title="تقرير المجموعات بالتفصيل"
              subtitle="تقرير المجموعات بالتفصيل"
              icon={Users}
              color={COLORS.black}
              background="bg-blue-300"
              onClick={() => {
                setSpecialReportData(null);
                setHousingReportData(null);
                handleHousingDetailedReport();
              }}
            />
          </div>

          {/* Middle & Right Column: Detailed Breakdown (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Vehicle Status */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Car size={20} color={COLORS.blue} />
                {t("dashboard.vehiclesBreakdown")}
              </h3>
              <div className="space-y-4">
                <MiniStatRow
                  label={t("dashboard.readyForDelivery")}
                  value={stats.availableVehicles}
                  icon={CheckCircle}
                  color={COLORS.blue}
                />
                <MiniStatRow
                  label={t("dashboard.inService")}
                  value={stats.takenVehicles}
                  icon={Users}
                  color={COLORS.gray}
                />
                <MiniStatRow
                  label={t("dashboard.inMaintenance")}
                  value={stats.problemVehicles}
                  icon={AlertTriangle}
                  color={COLORS.orange}
                />
              </div>
            </div>

            {/* Rider Status */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users size={20} color={COLORS.orange} />
                {t("dashboard.ridersStatus")}
              </h3>
              <div className="space-y-4">
                <MiniStatRow
                  label={t("dashboard.active")}
                  value={stats.activeRiders}
                  icon={CheckCircle}
                  color={COLORS.blue}
                />
                <MiniStatRow
                  label={t("dashboard.inactive")}
                  value={stats.inactiveRiders}
                  icon={Clock}
                  color={COLORS.gray}
                />
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase text-gray-400">{t("dashboard.performanceRate")}</span>
                    <span className="text-xl font-bold text-blue-600">{stats.riderEfficiency.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(stats.riderEfficiency, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            {/* System Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-2 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} color={COLORS.gray} />
                {t("dashboard.overview")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MiniStatRow
                  label={t("dashboard.theCompanies")}
                  value={stats.companies}
                  icon={Building2}
                  color={COLORS.blue}
                />
                <MiniStatRow
                  label={t("dashboard.theHousing")}
                  value={stats.housing}
                  icon={Home}
                  color={COLORS.gray}
                />
                <MiniStatRow
                  label={t("dashboard.theUsers")}
                  value={stats.users}
                  icon={Users}
                  color={COLORS.orange}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
