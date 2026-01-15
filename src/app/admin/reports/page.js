"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Home,
  Calendar,
  Award,
  Building,
  Clock,
  History
} from "lucide-react";
import PageHeader from "@/components/layout/pageheader";
import Link from "next/link";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.REPORTS.DASHBOARD);
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportCategories = [
    {
      title: t('reports.periodReports'),
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      reports: [
        {
          name: t('reports.monthlyReports'),
          path: "/admin/reports/monthly",
          desc: t('reports.monthlyReportsDesc'),
        },
        {
          name: t('reports.yearlyReports'),
          path: "/admin/reports/yearly",
          desc: t('reports.yearlyReportsDesc'),
        },
        {
          name: t('reports.customReports'),
          path: "/admin/reports/custom-range",
          desc: t('reports.customReportsDesc'),
        },
      ],
    },
    {
      title: t('reports.companyReports'),
      icon: Package,
      color: "from-green-500 to-green-600",
      reports: [
        {
          name: t('reports.companyPerformance'),
          path: "/admin/reports/company-performance",
          desc: t('reports.companyPerformanceDesc'),
        },
        {
          name: t('reports.compareCompanies'),
          path: "/admin/reports/compare-company",
          desc: t('reports.compareCompaniesDesc'),
        },
        {
          name: "تحقق كيتا",
          path: "/admin/reports/keta-validation",
          desc: "تقرير التحقق من أداء مناديب كيتا",
        },
      ],
    },
    {
      title: t('reports.riderReports'),
      icon: Users,
      color: "from-purple-500 to-purple-600",
      reports: [
        {
          name: t('reports.ridersReports'),
          path: "/admin/reports/riders",
          desc: t('reports.ridersReportsDesc'),
        },
        {
          name: t('reports.compareRider'),
          path: "/admin/reports/top-riders",
          desc: t('reports.compareRiderDesc'),
        },
        {
          name: t('reports.compareRiders'),
          path: "/admin/reports/compare-riders",
          desc: t('reports.compareRidersDesc'),
        },
        {
          name: t('reports.topRidersByCompany'),
          path: "/admin/reports/top-riders-company",
          desc: t('reports.topRidersByCompanyDesc'),
        },
        {
          name: t('reports.topRidersYearly.pageTitle'),
          path: "/admin/reports/top-riders-yearly",
          desc: t('reports.topRidersYearlyDesc'),
        },
        {
          name: t('reports.topRidersMonthly'),
          path: "/admin/reports/top-riders-monthly",
          desc: t('reports.topRidersMonthlyDesc'),
        },
        {
          name: "تقرير أداء المندوب التفصيلي",
          path: "/admin/reports/rider-performance",
          desc: "تقرير تفصيلي يومي لأداء المندوب (سابقاً Rider Daily)",
        },
      ],
    },
    {
      title: t('reports.housingReports'),
      icon: Home,
      color: "from-orange-500 to-orange-600",
      reports: [
        {
          name: t('reports.housingReport'),
          path: "/admin/reports/housing",
          desc: t('reports.housingReportDesc'),
        },
        {
          name: t('reports.housingCompare'),
          path: "/admin/reports/housing-compare",
          desc: t('reports.housingCompareDesc'),
        },
        {
          name: t('reports.housingRiderCompare'),
          path: "/admin/reports/housing-rider-compare",
          desc: t('reports.housingRiderCompareDesc'),
        },
      ],
    },
    {
      title: t('reports.otherReports'),
      icon: BarChart3,
      color: "from-red-500 to-red-600",
      reports: [
        {
          name: t('reports.problemsReports'),
          path: "/admin/reports/problems",
          desc: t('reports.problemsReportsDesc'),
        },
        {
          name: t('reports.stackedDeliveries'),
          path: "/admin/reports/stacked",
          desc: t('reports.stackedDeliveriesDesc'),
        },
      ],
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100"
    >
      <PageHeader
        title={t('reports.reportsCenter')}
        subtitle={t('reports.reportsCenterSubtitle')}
        icon={BarChart3}
      />

      {/* Dashboard Summary */}
      {dashboardData && (
        <div className="m-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t('reports.totalCompanies')}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData.companies?.totalCompanies || 0}
                </p>
              </div>
              <Package className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t('reports.totalRiders')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData.riders?.totalRiders || 0}
                </p>
              </div>
              <Users className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t('reports.totalOrders')}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData.orders?.totalAcceptedOrders || 0}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t('reports.performanceRate')}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {dashboardData.performance?.overallPerformanceScore?.toFixed(
                    1
                  ) || 0}
                  %
                </p>
              </div>
              <Award className="text-orange-500" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Important Reports Section */}
      <div className="m-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-indigo-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center gap-4">
            <Award className="text-white" size={36} />
            <div>
              <h2 className="text-2xl font-bold text-white">
                التقارير المهمة
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                التقارير الأساسية والأكثر استخداماً
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/reports/rejection"
                className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Building className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                    تقرير رفض الطلبات
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  عرض تفاصيل الرفض لجميع مجموعات السكن مع إحصائيات شاملة للسائقين
                </p>
              </Link>

              <Link
                href="/admin/reports/performance"
                className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Clock className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                    تقرير أداء المناديب
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  متابعة ساعات العمل، أيام الغياب، والطلبات لجميع المناديب في السكنات
                </p>
              </Link>

              <Link
                href="/admin/reports/rider-performance"
                className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <History className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                    أداء المندوب
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  استعراض أداء المندوب
                </p>
              </Link>

              <Link
                href="/admin/reports/history"
                className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <History className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                    سجل المندوب
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  استعراض السجل التاريخي للمندوب والنشاط الشهري عبر السنوات
                </p>
              </Link>

              <Link
                href="/admin/reports/detailed-daily-performance"
                className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Calendar className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                    التقرير التفصيلي
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  عرض الأداء التفصيلي لجميع المناديب في كل مجموعات السكن
                </p>
              </Link>

              <Link
                href="/admin/reports/keta-validation"
                className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Calendar className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                    تقرير كيتا
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  عرض تقرير التحقق من كيتا
                </p>
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* Other Reports Link */}
      <div className="m-6 flex justify-start">
        <Link href="/admin/reports/other">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group">
            <BarChart3 size={20} />
            <span className="font-semibold">تقارير أخرى</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
