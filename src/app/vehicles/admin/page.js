"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import PageHeader from "@/components/layout/pageheader";
import Link from "next/link";
import {
  Car,
  Users,
  AlertTriangle,
  CheckCircle,
  Shield,
  PackageX,
  MapPin,
  Wrench,
  RefreshCw,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";

export default function VehicleAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [groupedData, setGroupedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, groupedRes] = await Promise.all([
        ApiService.get("/api/vehicles/with-riders"),
        ApiService.get("/api/vehicles/group-by-status"),
      ]);

      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
      setGroupedData(groupedRes);
    } catch (err) {
      console.error("Error loading data:", err);
      setErrorMessage("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const stats = groupedData?.summary || {
    availableCount: 0,
    takenCount: 0,
    problemCount: 0,
    stolenCount: 0,
    breakUpCount: 0,
  };

  const totalVehicles = groupedData?.totalVehicles || 0;
  const activeVehicles = stats.availableCount + stats.takenCount;
  const utilizationRate =
    totalVehicles > 0
      ? ((stats.takenCount / totalVehicles) * 100).toFixed(1)
      : 0;

  const quickActions = [
    {
      title: "جميع المركبات",
      description: "عرض شامل للمركبات والمناديب",
      icon: Users,
      color: "purple",
      path: "/vehicles/admin/with-riders",
      count: totalVehicles,
    },
    {
      title: "إدارة المركبات",
      description: "عرض وتعديل بيانات المركبات",
      icon: Car,
      color: "blue",
      path: "/vehicles/admin/manage",
      count: totalVehicles,
    },
    {
      title: "طلبات المشرفين",
      description: "طلبات المشرفين للموافقة",
      icon: Users,
      color: "blue",
      path: "/vehicles/admin/users-requests",
      count: stats.takenCount,
    },
    {
      title: "المشاكل والصيانة",
      description: "المركبات التي تحتاج إصلاح",
      icon: AlertTriangle,
      color: "orange",
      path: "/vehicles/admin/problems",
      count: stats.problemCount,
    },
    {
      title: "المركبات المسروقة",
      description: "المركبات المبلغ عن سرقتها",
      icon: Shield,
      color: "red",
      path: "/vehicles/admin/stolen",
      count: stats.stolenCount,
    },
    {
      title: "خارج الخدمة",
      description: "المركبات غير القابلة للاستخدام",
      icon: PackageX,
      color: "gray",
      path: "/vehicles/admin/breakup",
      count: stats.breakUpCount,
    },
    {
      title: "تغيير الموقع",
      description: "تحديث مواقع المركبات",
      icon: MapPin,
      color: "teal",
      path: "/vehicles/admin/change-location",
      count: null,
    },
    {
      title: "إصلاح المشاكل",
      description: "حل مشاكل المركبات",
      icon: Wrench,
      color: "indigo",
      path: "/vehicles/admin/fix-problems",
      count: null,
    },
    {
      title: "استرجاع المسروقة",
      description: "استرجاع المركبات المسروقة",
      icon: RefreshCw,
      color: "emerald",
      path: "/vehicles/admin/recover-stolen",
      count: null,
    },
    {
      title: "أخذ مركبة",
      description: "تسجيل استلام مركبة للمندوب",
      icon: Car,
      color: "green",
      path: "/vehicles/admin/take",
      count: null,
    },
    {
      title: "إرجاع مركبة",
      description: "تسجيل إرجاع مركبة من المندوب",
      icon: RefreshCw,
      color: "orange",
      path: "/vehicles/admin/return",
      count: null,
    },
    {
      title: "سجل المركبات",
      description: "تاريخ وسجلات المركبات",
      icon: FileText,
      color: "indigo",
      path: "/vehicles/admin/history",
      count: null,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-gray-500",
        light: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-gray-500",
        light: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
      orange: {
        bg: "bg-gray-500",
        light: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
      },
      red: {
        bg: "bg-gray-500",
        light: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
      },
      gray: {
        bg: "bg-gray-500",
        light: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      },
      teal: {
        bg: "bg-gray-500",
        light: "bg-teal-50",
        text: "text-teal-600",
        border: "border-teal-200",
      },
      indigo: {
        bg: "bg-gray-500",
        light: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
      emerald: {
        bg: "bg-gray-500",
        light: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      purple: {
        bg: "bg-gray-500",
        light: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم المركبات"
        subtitle="إدارة شاملة لجميع المركبات والعمليات"
        icon={BarChart3}
        actionButton={{
          text: "تحديث البيانات",
          icon: <RefreshCw size={18} />,
          onClick: loadData,
          variant: "secondary",
        }}
      />

      {errorMessage && (
        <Alert
          type="error"
          title="خطأ"
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي المركبات</p>
              <p className="text-4xl font-bold">{totalVehicles}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Car size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <TrendingUp size={16} />
            <span>في النظام</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">جاهزة للتسليم</p>
              <p className="text-4xl font-bold">{stats.availableCount}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CheckCircle size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-100 text-sm">
            <CheckCircle size={16} />
            <span>جاهزة للاستخدام</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm mb-1">في الخدمة</p>
              <p className="text-4xl font-bold">{stats.takenCount}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <Users size={16} />
            <span>مع الموظفين</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">نسبة الاستخدام</p>
              <p className="text-4xl font-bold">{utilizationRate}%</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <BarChart3 size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <TrendingUp size={16} />
            <span>كفاءة التشغيل</span>
          </div>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`border-r-4 border-orange-500 bg-orange-50 p-5 rounded-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">مشاكل وصيانة</p>
              <p className="text-3xl font-bold text-orange-700">
                {stats.problemCount}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={36} />
          </div>
          <p className="text-xs text-orange-600 mt-2">تحتاج إلى إصلاح</p>
        </div>

        <div className={`border-r-4 border-red-500 bg-red-50 p-5 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">مسروقة</p>
              <p className="text-3xl font-bold text-red-700">
                {stats.stolenCount}
              </p>
            </div>
            <Shield className="text-red-500" size={36} />
          </div>
          <p className="text-xs text-red-600 mt-2">مبلغ عنها</p>
        </div>

        <div className={`border-r-4 border-gray-500 bg-gray-50 p-5 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">خارج الخدمة</p>
              <p className="text-3xl font-bold text-gray-700">
                {stats.breakUpCount}
              </p>
            </div>
            <PackageX className="text-gray-500" size={36} />
          </div>
          <p className="text-xs text-gray-600 mt-2">غير قابلة للاستخدام</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          الإجراءات السريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);

            return (
              <Link key={action.path} href={action.path}>
                <div
                  className={`border ${colors.border} rounded-xl p-5 hover:shadow-lg transition cursor-pointer bg-white`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${colors.light} p-3 rounded-lg`}>
                      <Icon className={colors.text} size={24} />
                    </div>
                    {action.count !== null && (
                      <span
                        className={`px-3 py-1 ${colors.light} ${colors.text} rounded-full text-sm font-bold`}
                      >
                        {action.count}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <span>الانتقال</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6">ملخص الحالة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-3">نسب الاستخدام</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">جاهزة للتسليم</span>
                    <span className="font-medium">
                      {((stats.availableCount / totalVehicles) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (stats.availableCount / totalVehicles) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">مستخدمة</span>
                    <span className="font-medium">
                      {((stats.takenCount / totalVehicles) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(stats.takenCount / totalVehicles) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">مشاكل</span>
                    <span className="font-medium">
                      {((stats.problemCount / totalVehicles) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(stats.problemCount / totalVehicles) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10">
              <h3 className="font-bold text-gray-700 mb-3">إحصائيات سريعة</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">المركبات النشطة</span>
                  <span className="font-bold text-blue-600">
                    {activeVehicles}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">تحتاج انتباه</span>
                  <span className="font-bold text-orange-600">
                    {stats.problemCount + stats.stolenCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">خارج الخدمة</span>
                  <span className="font-bold text-gray-600">
                    {stats.breakUpCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
