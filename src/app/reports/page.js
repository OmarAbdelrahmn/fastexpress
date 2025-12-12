"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Home,
  Calendar,
  Award
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
          path: "/reports/monthly",
          desc: t('reports.monthlyReportsDesc'),
        },
        {
          name: t('reports.yearlyReports'),
          path: "/reports/yearly",
          desc: t('reports.yearlyReportsDesc'),
        },
        {
          name: t('reports.customReports'),
          path: "/reports/custom-range",
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
          path: "/reports/company-performance",
          desc: t('reports.companyPerformanceDesc'),
        },
        {
          name: t('reports.compareCompanies'),
          path: "/reports/compare-company",
          desc: t('reports.compareCompaniesDesc'),
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
          path: "/reports/riders",
          desc: t('reports.ridersReportsDesc'),
        },
        {
          name: t('reports.compareRider'),
          path: "/reports/top-riders",
          desc: t('reports.compareRiderDesc'),
        },
        {
          name: t('reports.compareRiders'),
          path: "/reports/compare-riders",
          desc: t('reports.compareRidersDesc'),
        },
        {
          name: t('reports.topRidersByCompany'),
          path: "/reports/top-riders-company",
          desc: t('reports.topRidersByCompanyDesc'),
        },
        {
          name: t('reports.topRidersYearly.pageTitle'),
          path: "/reports/top-riders-yearly",
          desc: t('reports.topRidersYearlyDesc'),
        },
        {
          name: t('reports.topRidersMonthly'),
          path: "/reports/top-riders-monthly",
          desc: t('reports.topRidersMonthlyDesc'),
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
          path: "/reports/housing",
          desc: t('reports.housingReportDesc'),
        },
        {
          name: t('reports.housingCompare'),
          path: "/reports/housing-compare",
          desc: t('reports.housingCompareDesc'),
        },
        {
          name: t('reports.housingRiderCompare'),
          path: "/reports/housing-rider-compare",
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
          path: "/reports/problems",
          desc: t('reports.problemsReportsDesc'),
        },
        {
          name: t('reports.stackedDeliveries'),
          path: "/reports/stacked",
          desc: t('reports.stackedDeliveriesDesc'),
        },
        {
          name: t('reports.stackedDeliveriesRider'),
          path: "/reports/stacked",
          desc: t('reports.stackedDeliveriesRiderDesc'),
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

      {/* Report Categories */}
      <div className="m-6 space-y-6">
        {reportCategories.map((category, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div
              className={`bg-gradient-to-r ${category.color} px-6 py-4 flex items-center gap-3`}
            >
              <category.icon className="text-white" size={28} />
              <h2 className="text-xl font-bold text-white">{category.title}</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.reports.map((report, reportIdx) => (
                <Link
                  key={reportIdx}
                  href={report.path}
                  className="group block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 mb-2">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600">{report.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
