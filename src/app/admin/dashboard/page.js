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
  ArrowRight,
  X,
  ChevronRight,
  Bike, // Replacement for Motorcycle which does not exist in Lucide
  Eye,
  EyeOff,
  LayoutList
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
// import SpecialReportTemplate from "@/components/dashboard/SpecialReportTemplate";
// import HousingReportTemplate from "@/components/dashboard/HousingReportTemplate";
// import HousingDetailedReportTemplate from "@/components/dashboard/HousingDetailedReportTemplate";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <p>Loading PDF...</p> }
);

// PDF Components
import HousingDetailedReportPDF from "@/components/dashboard/HousingDetailedReportPDF";
import SpecialReportPDF from "@/components/dashboard/SpecialReportPDF";
import HousingSummaryReportPDF from "@/components/dashboard/HousingSummaryReportPDF";

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
          !window.location.pathname.includes("/admin/login")
        ) {
          window.location.href = "/admin/login";
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
    STATISTICS: "/api/rider/statistics",
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
      employees: "/api/temp/employee-pending-status-changes"
    },
    REPORTS_SUMMARY: "/api/report/summary"
  },
};

export default function EnhancedDashboard() {
  const router = useRouter();
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
    pendempst: 0,
    activeHungerRiders: 0,
    activeKeetaRiders: 0,
    companyTotal: 0,
    companyRidersCount: 0,
    companyEmployeesCount: 0,
    monthAcceptedOrders: 0,
    hungerYesterdayOrders: 0,
    ketaYesterdayOrders: 0,
    activeYesterdayHunger: 0,
    ketaActiveRiders: 0,
    totalOrdersYesterday: 0,
    totalActiveRiders: 0,
    totalMonthOrders: 0
  });

  const [trends, setTrends] = useState({
    vehicles: 5.2,
    riders: 3.1,
    shifts: -2.4,
    housing: 8.3,
  });

  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    // Check for privacy mode setting
    const storedPrivacy = localStorage.getItem("dashboard_privacy_mode");
    if (storedPrivacy) {
      setIsPrivacyMode(JSON.parse(storedPrivacy));
    }

    // Add event listener for storage changes (in case changed in another tab/window)
    const handleStorageChange = () => {
      const updatedPrivacy = localStorage.getItem("dashboard_privacy_mode");
      if (updatedPrivacy) {
        setIsPrivacyMode(JSON.parse(updatedPrivacy));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-tab updates if needed, 
    // though simplest way is just to rely on mount/focus or standard flow. 
    // Since settings is a different page, navigating back will re-mount dashboard or we can rely on focus.

    loadDashboardData();

    return () => window.removeEventListener('storage', handleStorageChange);
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
        tempEmployeesRes,
        previousDayOrdersRes,
        statisticsRes,
        summaryData1
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
        get(API_ENDPOINTS.TEMP.VEHICLES.employees),
        get(API_ENDPOINTS.SHIFT.PREVIOUS_DAY_ACCEPTED),
        get(API_ENDPOINTS.RIDER.STATISTICS),
        get(API_ENDPOINTS.TEMP.REPORTS_SUMMARY),
      ]);

      const vehiclesSummary = vehicleStatusRes.data?.summary || {};
      const totalVehicles =
        vehicleStatusRes.data?.totalVehicles || vehiclesRes.data?.length || 0;
      const availableVehicles = vehiclesSummary?.availableCount || 0;
      const takenVehicles = vehiclesSummary?.takenCount || 0;
      const problemVehicles = vehiclesSummary?.problemCount || 0;

      const allRiders = ridersRes.data || [];
      const totalRiders = allRiders.length;
      const activeRiders = allRiders.filter(rider => rider.status === 'enable').length;
      const inactiveRiders = allRiders.length - activeRiders;

      let activeHungerRiders = 0;
      let activeKeetaRiders = 0;

      if (Array.isArray(allRiders)) {
        allRiders.forEach(rider => {
          if (rider.status === 'enable') {
            const companyProps = (rider.companyName || "").toLowerCase();
            if (companyProps.includes('hunger')) {
              activeHungerRiders++;
            } else if (companyProps.includes('keeta') || companyProps.includes('keta')) {
              activeKeetaRiders++;
            }
          }
        });
      }

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
      const tempEmployeesResData = tempEmployeesRes.data?.length || 0;
      const totalCompanies = companiesRes.data?.length || 0;
      const totalUsers = usersRes.data?.length || 0;
      const totalEmployees = employeesRes.data?.length || 0;

      const pendingRequests = Array.isArray(pendingRequestsRes.data)
        ? pendingRequestsRes.data.length
        : 0;
      const summaryData = summaryData1?.data || {};
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const yesterday = date.toISOString().split("T")[0];

      let todayShiftsCount = 0;
      let activeShiftsCount = 0;
      try {
        const shiftsRes = await get(
          `${API_ENDPOINTS.SHIFT.BY_DATE}?shiftDate=${yesterday}`
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
      // Handle Statistics Response (assuming structure, normalizing keys just in case)
      const statsData = statisticsRes?.data || {};
      // Try to find keys ignoring case if needed, or assume specific keys based on user request "Total and Riders and Employees"
      // Assuming API returns { total: X, riders: Y, employees: Z } or similar. 
      // User said "get three numbers the Total and Riders and Employees"
      // Let's look for likely keys.
      const companyTotal = statsData.total || statsData.Total || 0;
      const companyRidersCount = statsData.riders || statsData.Riders || 0;
      const companyEmployeesCount = statsData.employees || statsData.Employees || 0;
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
        previousDayTotalOrders: previousDayTotal,
        previousDayTotalRiders: previousDayRiders,
        pendempst: tempEmployeesResData,
        activeHungerRiders,
        activeKeetaRiders,
        companyTotal,
        companyRidersCount,
        companyEmployeesCount,
        monthAcceptedOrders: summaryData.totalMonthOrders || 0,
        hungerYesterdayOrders: summaryData.hunger?.acceptedOrders || 0,
        ketaYesterdayOrders: summaryData.keta?.acceptedOrders || 0,
        activeYesterdayHunger: summaryData.hunger?.totalShifts || 0,
        ketaActiveRiders: summaryData.keta?.totalShifts || 0,
        totalOrdersYesterday: summaryData.totalDayOrders || 0,
        totalActiveRiders: summaryData?.hungerMonthToDate?.acceptedOrders || 0,
        totalMonthOrders: summaryData?.ketaMonthToDate?.acceptedOrders || 0
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
      setHousingDetailedReportData(null); // Reset
      const response = await get("/api/report/special2");
      const data = response.data || {
        reportDate: "2025-12-14",
        housingDetails: [],
        grandTotalOrders: 0,
        grandTotalRiders: 0,
        companyName: "شركة الخدمة السريعة"
      };
      setHousingDetailedReportData(data);
      setIsPrinting(true);
    } catch (error) {
      console.error("Failed to fetch housing detailed report:", error);
      alert(t('common.error'));
    }
  };

  const handleSpecialReport = async () => {
    try {
      setSpecialReportData(null); // Reset
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
        "trendDescription": "🚀",
        "companyName": "شركة الخدمة السريعة"
      };
      setSpecialReportData(reportData);
      setIsPrinting(true);
    } catch (error) {
      console.error("Failed to fetch special report:", error);
      alert(t('common.error'));
    }
  };

  const handleHousingReport = async () => {
    try {
      setHousingReportData(null);
      const response = await get("/api/report/special1");
      const data = response.data || {
        reportDate: "2025-12-14",
        housingSummaries: [],
        totalOrders: 0,
        totalRiders: 0,
        averageOrdersPerRider: 0,
        companyName: "شركة الخدمة السريعة"
      };
      setHousingReportData(data);
      setIsPrinting(true);
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
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center p-2 rounded-xl border border-blue-50">
          <img src="/5.png" alt="Logo" className="w-14 h-14 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-500 text-sm">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-blue-100">
        <Clock size={16} color={COLORS.blue} />
        <span>{new Date().toLocaleDateString('ar-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
  );

  const StatCard = ({ title, value, subtitle, icon: Icon, color, link, background }) => (
    <Link href={link} className="block group">
      <div className={`rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${background} h-full`}>
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-lg transition-colors" style={getBgStyle(color)}>
            <Icon size={20} color={color} />
          </div>
          {/* Subtle background decoration */}
          <Icon className="absolute -left-4 -bottom-4 opacity-30 transform rotate-12 transition-transform group-hover:scale-110" size={80} color="white" />
        </div>

        <div className="relative z-10 ">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-white">{loading ? "..." : value}</h3>
            {value === "-*" && <EyeOff size={16} className="text-white/70" />}
          </div>
          <p className="font-medium text-white text-sm mb-1">{title}</p>
          <p className="text-[10px] text-white">{subtitle}</p>
        </div>
      </div>
    </Link>
  );

  const StatusButton = ({ title, value, subtitle, icon: Icon, count, link }) => {
    const hasPending = count > 0;
    const indicatorColor = hasPending ? "bg-red-500" : "bg-green-500";
    const indicatorText = hasPending ? "مطلوب إجراء" : "مكتمل";

    return (
      <Link href={link} className="block group w-full">
        <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-stretch">
          {/* Status Indicator Strip (End/Left side in RTL) */}
          <div className={`w-2 ${indicatorColor} absolute left-0 top-0 bottom-0`}></div>

          <div className="flex-1 p-4 flex items-center justify-between pl-6"> {/* Added padding-left to not overlap strip */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${hasPending ? 'bg-red-50' : 'bg-green-50'}`}>
                <Icon size={24} className={hasPending ? 'text-red-500' : 'text-green-500'} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${hasPending ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {indicatorText}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const NotificationFab = ({ title, count, icon: Icon, link }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    if (!isVisible) return null;

    return (
      <div className="relative group w-fit">
        {/* Popup Rectangle */}
        {showPopup && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(link);
            }}
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-max bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-100 cursor-pointer animate-fade-in flex items-center gap-3 z-50 print:hidden"
          >
            {/* Close Button for Popup */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(false);
              }}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors z-50"
            >
              <X size={12} />
            </button>

            <div className="flex flex-col">
              <span className="font-bold text-sm">{title}</span>
              <span className="text-xs text-gray-500">{count} طلب </span>
            </div>
            <div className="bg-blue-50 p-1.5 rounded-full">
              <ArrowRight size={14} className="text-blue-600 rtl:rotate-180" />
            </div>
            {/* Arrow pointing to icon */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-100"></div>
          </div>
        )}

        {/* Icon Button */}
        <button
          onClick={() => setShowPopup(!showPopup)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative group/btn
            ${count > 0
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse-slow'
              : 'bg-green-500 text-white hover:bg-green-600'
            }`}
        >
          <Icon size={24} />

          {/* Badge at top-left */}
          {count > 0 && (
            <span className="absolute -top-1 -left-1 bg-white text-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-red-500 shadow-sm z-10">
              {count > 9 ? '+9' : count}
            </span>
          )}

          {/* Close Circle Button (Appears on Hover at top-right) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-0.5 shadow-md border border-gray-100 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 z-20 cursor-pointer"
          >
            <X size={14} />
          </div>
        </button>
      </div>
    );
  };

  const QuickActionBtn = ({ title, subtitle, icon: Icon, color, onClick, background }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3 ${background} border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group text-right hover:border-blue-100`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg transition-colors">
            <Icon size={20} color={"white"} />
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-white">{subtitle}</p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ChevronRight size={14} color={COLORS.white} className="rtl:rotate-180" />
        </div>
      </button>
    );
  };

  const MiniStatRow = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-100 transition-colors cursor-default group">
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
    <div dir="rtl">
      {/* Printable Components */}
      {/* Download Modal */}
      {isPrinting && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setIsPrinting(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">تقرير جاهز للتحميل</h3>
              <p className="text-gray-500">تم تجهيز التقرير بنجاح، يرجى الضغط أدناه للتحميل</p>
            </div>

            {housingDetailedReportData && (
              <PDFDownloadLink
                document={<HousingDetailedReportPDF data={housingDetailedReportData} />}
                fileName={`تقرير تفصيلي بتاريخ${housingDetailedReportData.reportDate}.pdf`}
                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                }
              </PDFDownloadLink>
            )}

            {specialReportData && (
              <PDFDownloadLink
                document={<SpecialReportPDF data={specialReportData} />}
                fileName={`تقرير الفرق و النسبة حتى${specialReportData.period1Start}_${specialReportData.period2End}.pdf`}
                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                }
              </PDFDownloadLink>
            )}

            {housingReportData && (
              <PDFDownloadLink
                document={<HousingSummaryReportPDF data={housingReportData} />}
                fileName={`تقرير اجمالي بتاريخ${housingReportData.reportDate}.pdf`}
                className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:bg-blue-900 flex items-center justify-center gap-3 font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'جاري تجهيز الملف...' : 'تحميل التقرير (PDF)'
                }
              </PDFDownloadLink>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <PageHeader />

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t("dashboard.monthAcceptedOrders")}
            value={isPrivacyMode ? "-" : stats.monthAcceptedOrders}
            subtitle={t("dashboard.orders")}
            icon={CheckCircle}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
          />
          <StatCard
            title={t("dashboard.totalActiveRiders")}
            value={isPrivacyMode ? "-" : stats.totalActiveRiders}
            subtitle={t("dashboard.orders")}
            icon={Activity}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
          />
          <StatCard
            title={t("dashboard.totalMonthOrders")}
            value={isPrivacyMode ? "-" : stats.totalMonthOrders}
            subtitle={t("dashboard.orders")}
            icon={BarChart3}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
          />
          <StatCard
            title={t("dashboard.hungerYesterdayOrders")}
            value={stats.hungerYesterdayOrders}
            subtitle={t("dashboard.orders")}
            icon={ShoppingBag}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
          />
          <StatCard
            title={t("dashboard.ketaYesterdayOrders")}
            value={stats.ketaYesterdayOrders}
            subtitle={t("dashboard.orders")}
            icon={ShoppingBag}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
          />
          <StatCard
            title={t("dashboard.activeYesterdayHunger")}
            value={stats.activeYesterdayHunger}
            subtitle={t("dashboard.riders")}
            icon={Users}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
          />
          <StatCard
            title={t("dashboard.ketaActiveRiders")}
            value={stats.ketaActiveRiders}
            subtitle={t("dashboard.riders")}
            icon={Users}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
          />
          <StatCard
            title={t("dashboard.totalOrderYesterday")}
            value={stats.totalOrdersYesterday}
            subtitle={t("dashboard.total")}
            icon={Package}
            color="#ffffffff"
            link="#"
            background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
          />



        </div>

        {/* Notification Icons */}
        <div className="fixed bottom-6 left-6 flex flex-col gap-4 z-50">
          <NotificationFab
            title={t("dashboard.pendingApprovals")}
            count={stats.pendingRequests}
            icon={Car}
            link="/admin/vehicles/admin/users-requests"
          />
          <NotificationFab
            title={t("dashboard.pendingStatusChanges")}
            count={stats.pendempst}
            icon={Users}
            link="/admin/employees/admin/status-requests"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="space-y-4">
            {/* Company Statistics Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} color={COLORS.blue} />
                {t("dashboard.statistics")}
              </h3>
              <div className="space-y-4">
                <MiniStatRow
                  label={t("dashboard.companyTotal")}
                  value={stats.companyTotal}
                  icon={Users}
                  color={COLORS.blue}
                />
                <MiniStatRow
                  label={t("dashboard.companyRiders")}
                  value={stats.companyRidersCount}
                  icon={Car}
                  color={COLORS.orange}
                />
                <MiniStatRow
                  label={t("dashboard.companyEmployees")}
                  value={stats.companyEmployeesCount}
                  icon={Users}
                  color={COLORS.gray}
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">{t("reports.title")}</h2>

            <QuickActionBtn
              title={t("dashboard.monthlyPerformanceDiff")}
              subtitle={t("dashboard.printMonthlyPerformanceDiff")}
              icon={BarChart3}
              color={COLORS.white}
              background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
              onClick={() => {
                setHousingDetailedReportData(null);
                setHousingReportData(null);
                handleSpecialReport();
              }}
            />

            <QuickActionBtn
              title={t("dashboard.dailyTotalOrders")}
              subtitle={t("dashboard.dailyTotalOrders")}
              icon={TrendingUp}
              color={COLORS.black}
              background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
              onClick={() => {
                setSpecialReportData(null);
                setHousingDetailedReportData(null);
                handleHousingReport();
              }}
            />

            <QuickActionBtn
              title={t("dashboard.dailyDetailedOrders")}
              subtitle={t("dashboard.dailyDetailedOrders")}
              icon={Users}
              color={COLORS.black}
              background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
              onClick={() => {
                setSpecialReportData(null);
                setHousingReportData(null);
                handleHousingDetailedReport();
              }}
            />

            <QuickActionBtn
              title="تقارير كيتا"
              subtitle="لوحة التحكم بتقارير عمليات كيتا"
              icon={LayoutList}
              color={COLORS.white}
              background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
              onClick={() => router.push('/admin/reports/keta')}
            />
            {/* Company Statistics Card moved up */}
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

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
                    <span className="text-xl font-bold text-orange-500">{stats.riderEfficiency.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-orange-300 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(stats.riderEfficiency, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Riders by Company */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-2 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users size={20} color={COLORS.blue} />
                {t("dashboard.activeRidersByCompany")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MiniStatRow
                  label={t("dashboard.hunger")}
                  value={stats.activeHungerRiders}
                  icon={CheckCircle}
                  color={COLORS.orange}
                />
                <MiniStatRow
                  label={t("dashboard.keeta")}
                  value={stats.activeKeetaRiders}
                  icon={CheckCircle}
                  color={COLORS.blue}
                />
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
