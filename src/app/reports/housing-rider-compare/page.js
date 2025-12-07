// File: src/app/reports/housing-period/page.js
"use client";

import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Input from "@/components/Ui/Input";
import Alert from "@/components/Ui/Alert";
import {
  Home,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from "@/lib/api/apiService";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function HousingPeriodPage() {
  const [reportData, setReportData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [housingList, setHousingList] = useState([]);
  const [loadingHousing, setLoadingHousing] = useState(true);

  const [form, setForm] = useState({
    housingName: "",
    period1Start: "",
    period1End: "",
    period2Start: "",
    period2End: "",
  });

  // Fetch housing list on component mount
  useEffect(() => {
    const fetchHousingList = async () => {
      try {
        setLoadingHousing(true);
        const data = await ApiService.get(API_ENDPOINTS.HOUSING.LIST);
        setHousingList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching housing list:", err);
      } finally {
        setLoadingHousing(false);
      }
    };

    fetchHousingList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.HOUSING_RIDERS_COMPARE,
        {
          housingName: form.housingName,
          period1Start: form.period1Start,
          period1End: form.period1End,
          period2Start: form.period2Start,
          period2End: form.period2End,
        }
      );
      setReportData(data);
      setSuccessMessage("تم جلب تقرير المقارنة بنجاح");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error fetching housing riders comparison:", err);
      setError(err.message || "فشل تحميل التقرير");
    } finally {
      setLoading(false);
    }
  };

  const renderTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="text-green-500" size={20} />;
    if (value < 0) return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-500" size={20} />;
  };

  const renderChangePercent = (value) => {
    const color =
      value > 0
        ? "text-green-600"
        : value < 0
        ? "text-red-600"
        : "text-gray-600";
    const sign = value > 0 ? "+" : "";
    return (
      <span className={`${color} font-semibold`}>
        {sign}
        {value.toFixed(1)}%
      </span>
    );
  };

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  const prepareChartData = (breakdown) => {
    if (!breakdown?.riderAssignments) return [];
    return breakdown.riderAssignments.map((rider) => ({
      name: rider.riderName,
      completed: rider.ordersCompleted,
      rejected: rider.ordersRejected,
      total: rider.ordersCompleted + rider.ordersRejected,
      rate: rider.completionRate,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقرير مقارنة الإسكان والمناديب"
        subtitle="مقارنة شاملة لأداء الإسكان والمناديب بين فترتين زمنيتين"
        icon={Home}
      />

      {successMessage && (
        <Alert
          type="success"
          title="نجح"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {error && (
        <Alert
          type="error"
          title="خطأ"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* Form */}
      <Card title="اختيار الفترات للمقارنة">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الإسكان
            </label>
            <select
              value={form.housingName}
              onChange={(e) =>
                setForm({ ...form, housingName: e.target.value })
              }
              required
              disabled={loadingHousing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">اختر الإسكان</option>
              {housingList.map((housing) => (
                <option key={housing.id} value={housing.name}>
                  {housing.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period 1 */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">
                الفترة الأولى
              </h3>
              <div className="space-y-3">
                <Input
                  label="تاريخ البداية"
                  type="date"
                  value={form.period1Start}
                  onChange={(e) =>
                    setForm({ ...form, period1Start: e.target.value })
                  }
                  required
                />
                <Input
                  label="تاريخ النهاية"
                  type="date"
                  value={form.period1End}
                  onChange={(e) =>
                    setForm({ ...form, period1End: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Period 2 */}
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="text-lg font-semibold mb-3 text-green-900">
                الفترة الثانية
              </h3>
              <div className="space-y-3">
                <Input
                  label="تاريخ البداية"
                  type="date"
                  value={form.period2Start}
                  onChange={(e) =>
                    setForm({ ...form, period2Start: e.target.value })
                  }
                  required
                />
                <Input
                  label="تاريخ النهاية"
                  type="date"
                  value={form.period2End}
                  onChange={(e) =>
                    setForm({ ...form, period2End: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            عرض المقارنة
          </Button>
        </form>
      </Card>

      {/* Report Data */}
      {reportData && (
        <>
          {/* Insights */}
          {reportData.insights && reportData.insights.length > 0 && (
            <Card>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="text-purple-500" size={24} />
                  رؤى وملاحظات
                </h3>
                <ul className="space-y-2">
                  {reportData.insights.map((insight, index) => (
                    <li key={index} className="text-gray-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Comparison Overview */}
          {reportData.comparison && (
            <Card title="نظرة عامة على المقارنة">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Daily Orders */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-gray-700">
                      الطلبات اليومية
                    </span>
                    {renderTrendIcon(
                      reportData.comparison.dailyOrdersChangePercent
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-blue-600">
                      {reportData.comparison.dailyOrdersDifference > 0
                        ? "+"
                        : ""}
                      {reportData.comparison.dailyOrdersDifference}
                    </span>
                    <span className="text-lg text-gray-600">طلب</span>
                  </div>
                  <div className="text-lg">
                    {renderChangePercent(
                      reportData.comparison.dailyOrdersChangePercent
                    )}
                  </div>
                </div>

                {/* Completed Orders */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-gray-700">
                      الطلبات المكتملة
                    </span>
                    {renderTrendIcon(
                      reportData.comparison.completedOrdersChangePercent
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-green-600">
                      {reportData.comparison.completedOrdersDifference > 0
                        ? "+"
                        : ""}
                      {reportData.comparison.completedOrdersDifference}
                    </span>
                    <span className="text-lg text-gray-600">طلب</span>
                  </div>
                  <div className="text-lg">
                    {renderChangePercent(
                      reportData.comparison.completedOrdersChangePercent
                    )}
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-gray-700">
                      معدل الإكمال
                    </span>
                    {renderTrendIcon(
                      reportData.comparison.completionRateChangePercent
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-purple-600">
                      {reportData.comparison.completionRateDifference > 0
                        ? "+"
                        : ""}
                      {reportData.comparison.completionRateDifference.toFixed(
                        1
                      )}
                    </span>
                    <span className="text-lg text-gray-600">%</span>
                  </div>
                  <div className="text-lg">
                    {renderChangePercent(
                      reportData.comparison.completionRateChangePercent
                    )}
                  </div>
                </div>

                {/* Riders Count */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-gray-700">
                      عدد المناديب
                    </span>
                    {renderTrendIcon(
                      reportData.comparison.riderCountChangePercent
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-yellow-600">
                      {reportData.comparison.riderCountDifference > 0
                        ? "+"
                        : ""}
                      {reportData.comparison.riderCountDifference}
                    </span>
                    <span className="text-lg text-gray-600">مندوب</span>
                  </div>
                  <div className="text-lg">
                    {renderChangePercent(
                      reportData.comparison.riderCountChangePercent
                    )}
                  </div>
                </div>

                {/* Rejected Orders */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-gray-700">
                      الطلبات المرفوضة
                    </span>
                    {renderTrendIcon(
                      reportData.comparison.rejectionRateChangePercent * -1
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-red-600">
                      {reportData.comparison.rejectedOrdersDifference > 0
                        ? "+"
                        : ""}
                      {reportData.comparison.rejectedOrdersDifference}
                    </span>
                    <span className="text-lg text-gray-600">طلب</span>
                  </div>
                  <div className="text-lg">
                    {renderChangePercent(
                      reportData.comparison.rejectionRateChangePercent
                    )}
                  </div>
                </div>

                {/* Housing Contribution */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-gray-700">
                      مساهمة الإسكان
                    </span>
                    {renderTrendIcon(
                      reportData.comparison.housingContributionDifference
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-indigo-600">
                      {reportData.comparison.housingContributionDifference > 0
                        ? "+"
                        : ""}
                      {reportData.comparison.housingContributionDifference.toFixed(
                        1
                      )}
                    </span>
                    <span className="text-lg text-gray-600">%</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Period Breakdowns Side by Side */}
          <div className="grid grid-cols-1 gap-6">
            {/* Period 1 Breakdown */}
            {reportData.period1Breakdown && (
              <Card>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-lg -mt-6 -mx-6 mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    الفترة الأولى - التفاصيل
                  </h2>
                  <p className="text-blue-100">
                    {form.period1Start} - {form.period1End}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Summary Stats - Bigger */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="text-blue-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          الطلبات اليومية
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-blue-600">
                        {reportData.period1Breakdown.dailyOrdersCount}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="text-green-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          مكتمل
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-green-600">
                        {reportData.period1Breakdown.completedOrdersCount}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border-2 border-red-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <XCircle className="text-red-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          مرفوض
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-red-600">
                        {reportData.period1Breakdown.rejectedOrdersCount}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-purple-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          معدل الإكمال
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-purple-600">
                        {reportData.period1Breakdown.completionRate}%
                      </p>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-600 mb-1">عدد المناديب</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reportData.period1Breakdown.riderCount}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">
                        متوسط الطلبات/مندوب
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {reportData.period1Breakdown.averageOrdersPerRider}
                      </p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">
                        الطلبات الإشكالية
                      </p>
                      <p className="text-2xl font-bold text-pink-600">
                        {reportData.period1Breakdown.problematicOrdersCount}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <p className="text-sm text-gray-600 mb-1">
                        مساهمة الإسكان
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {reportData.period1Breakdown.housingContribution}%
                      </p>
                    </div>
                  </div>

                  {/* Charts */}
                  {reportData.period1Breakdown.riderAssignments &&
                    reportData.period1Breakdown.riderAssignments.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart - Orders by Rider */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="text-blue-500" />
                            الطلبات حسب المندوب
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={prepareChartData(
                                reportData.period1Breakdown
                              )}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar
                                dataKey="completed"
                                fill="#10b981"
                                name="مكتمل"
                              />
                              <Bar
                                dataKey="rejected"
                                fill="#ef4444"
                                name="مرفوض"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Pie Chart - Completion Rate */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                          <h3 className="text-lg font-semibold mb-4">
                            توزيع الطلبات
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "مكتمل",
                                    value:
                                      reportData.period1Breakdown
                                        .completedOrdersCount,
                                  },
                                  {
                                    name: "مرفوض",
                                    value:
                                      reportData.period1Breakdown
                                        .rejectedOrdersCount,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {/* Riders Table */}
                  {reportData.period1Breakdown.riderAssignments && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-blue-500 px-6 py-3">
                        <h4 className="text-lg font-semibold text-white">
                          تفاصيل المناديب
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                المندوب
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                الورديات
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                ساعات العمل
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                مكتمل
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                مرفوض
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                المعدل
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.period1Breakdown.riderAssignments.map(
                              (rider) => (
                                <tr
                                  key={rider.riderId}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-base">
                                    {rider.riderName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-base">
                                    {rider.shiftsCount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-base">
                                    <span className="flex items-center gap-1">
                                      <Clock
                                        size={16}
                                        className="text-gray-500"
                                      />
                                      {rider.totalWorkingHours}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-base font-bold text-green-600">
                                      {rider.ordersCompleted}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-base font-bold text-red-600">
                                      {rider.ordersRejected}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        rider.completionRate >= 90
                                          ? "bg-green-100 text-green-700"
                                          : rider.completionRate >= 70
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {rider.completionRate}%
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Period 2 Breakdown */}
            {reportData.period2Breakdown && (
              <Card>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-lg -mt-6 -mx-6 mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    الفترة الثانية - التفاصيل
                  </h2>
                  <p className="text-green-100">
                    {form.period2Start} - {form.period2End}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Summary Stats - Bigger */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="text-blue-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          الطلبات اليومية
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-blue-600">
                        {reportData.period2Breakdown.dailyOrdersCount}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="text-green-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          مكتمل
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-green-600">
                        {reportData.period2Breakdown.completedOrdersCount}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border-2 border-red-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <XCircle className="text-red-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          مرفوض
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-red-600">
                        {reportData.period2Breakdown.rejectedOrdersCount}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-purple-500" size={24} />
                        <span className="text-sm font-medium text-gray-700">
                          معدل الإكمال
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-purple-600">
                        {reportData.period2Breakdown.completionRate}%
                      </p>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-600 mb-1">عدد المناديب</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reportData.period2Breakdown.riderCount}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">
                        متوسط الطلبات/مندوب
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {reportData.period2Breakdown.averageOrdersPerRider}
                      </p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">
                        الطلبات الإشكالية
                      </p>
                      <p className="text-2xl font-bold text-pink-600">
                        {reportData.period2Breakdown.problematicOrdersCount}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <p className="text-sm text-gray-600 mb-1">
                        مساهمة الإسكان
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {reportData.period2Breakdown.housingContribution}%
                      </p>
                    </div>
                  </div>

                  {/* Charts */}
                  {reportData.period2Breakdown.riderAssignments &&
                    reportData.period2Breakdown.riderAssignments.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart - Orders by Rider */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="text-green-500" />
                            الطلبات حسب المندوب
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={prepareChartData(
                                reportData.period2Breakdown
                              )}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar
                                dataKey="completed"
                                fill="#10b981"
                                name="مكتمل"
                              />
                              <Bar
                                dataKey="rejected"
                                fill="#ef4444"
                                name="مرفوض"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Pie Chart - Completion Rate */}
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                          <h3 className="text-lg font-semibold mb-4">
                            توزيع الطلبات
                          </h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "مكتمل",
                                    value:
                                      reportData.period2Breakdown
                                        .completedOrdersCount,
                                  },
                                  {
                                    name: "مرفوض",
                                    value:
                                      reportData.period2Breakdown
                                        .rejectedOrdersCount,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#ef4444" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {/* Riders Table */}
                  {reportData.period2Breakdown.riderAssignments && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-green-500 px-6 py-3">
                        <h4 className="text-lg font-semibold text-white">
                          تفاصيل المناديب
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                المندوب
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                الورديات
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                ساعات العمل
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                مكتمل
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                مرفوض
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                                المعدل
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.period2Breakdown.riderAssignments.map(
                              (rider) => (
                                <tr
                                  key={rider.riderId}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-base">
                                    {rider.riderName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-base">
                                    {rider.shiftsCount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-base">
                                    <span className="flex items-center gap-1">
                                      <Clock
                                        size={16}
                                        className="text-gray-500"
                                      />
                                      {rider.totalWorkingHours}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-base font-bold text-green-600">
                                      {rider.ordersCompleted}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-base font-bold text-red-600">
                                      {rider.ordersRejected}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        rider.completionRate >= 90
                                          ? "bg-green-100 text-green-700"
                                          : rider.completionRate >= 70
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {rider.completionRate}%
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
