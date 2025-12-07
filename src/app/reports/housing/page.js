'use client';

import { useState } from 'react';
import { Building, Users, Package, Award, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, Calendar } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';


export default function HousingPeriodReport() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedHousing, setExpandedHousing] = useState(null);

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) {
      setError('الرجاء تحديد تاريخ البداية والنهاية');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setReportData(null);

try {
  const data = await ApiService.get(API_ENDPOINTS.REPORTS.COMPARE_HOUSINGS, {
    startDate: form.startDate,
    endDate: form.endDate
  });
  
  if (data && data.housingBreakdowns && data.housingBreakdowns.length > 0) {
    setReportData(data);
    setSuccessMessage('تم جلب تقرير الإسكان بنجاح');
    setTimeout(() => setSuccessMessage(''), 3000);
  } else {
    setError('لا توجد بيانات للفترة المحددة');
  }
} catch (err) {
  console.error('Error:', err);
  setError(err.message || 'حدث خطأ أثناء جلب التقرير');
} finally {
  setLoading(false);
}
};

  const Alert = ({ type, message, onClose }) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    return (
      <div className={`border-2 rounded-lg p-4 mb-6 flex items-center justify-between ${styles[type]}`}>
        <span className="font-medium">{message}</span>
        {onClose && (
          <button onClick={onClose} className="text-xl font-bold hover:opacity-70">
            &times;
          </button>
        )}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <Icon size={40} style={{ color }} className="opacity-80" />
      </div>
    </div>
  );

  const PerformanceCard = ({ title, data, type }) => {
    const isTop = type === 'top';
    const bgColor = isTop ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-red-600';
    const icon = isTop ? '🏆' : '⚠️';

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${bgColor} px-6 py-4`}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award size={20} />
            {icon} {title}
          </h3>
        </div>
        <div className="p-6">
          <h4 className="text-2xl font-bold text-center mb-4" style={{ color: isTop ? '#10b981' : '#f97316' }}>
            {data.housingName}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">معدل الإنجاز</p>
              <p className="text-xl font-bold" style={{ color: isTop ? '#10b981' : '#f97316' }}>
                {data.completionRate?.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">الطلبات</p>
              <p className="text-xl font-bold text-gray-800">{data.ordersCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">المناديب</p>
              <p className="text-xl font-bold text-gray-800">{data.riderCount}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 " dir="rtl">
      <PageHeader
              title="تقرير الإسكان للفترة"
              subtitle="تحليل أداء وحدات الإسكان خلال فترة محددة"
              icon={Building}
            />

      {/* Alerts */}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">اختيار الفترة</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                جاري التحميل...
              </>
            ) : (
              <>
                <BarChart3 size={24} />
                عرض التقرير
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Building}
              title="إجمالي السكنات"
              value={reportData.housingBreakdowns?.length || 0}
              subtitle="عدد الوحدات النشطة"
              color="#3b82f6"
            />
            <StatCard
              icon={Users}
              title="إجمالي المناديب"
              value={reportData.totalRiders || 0}
              subtitle="المناديب العاملين"
              color="#10b981"
            />
            <StatCard
              icon={Package}
              title="إجمالي الطلبات"
              value={reportData.totalOrders || 0}
              subtitle="جميع الطلبات"
              color="#8b5cf6"
            />
            <StatCard
              icon={Award}
              title="متوسط المناديب/سكن"
              value={reportData.housingBreakdowns?.length 
                ? (reportData.totalRiders / reportData.housingBreakdowns.length).toFixed(1)
                : 0}
              subtitle="التوزيع المتوسط"
              color="#f59e0b"
            />
          </div>

          {/* Top & Lowest Performers */}
          {(reportData.topPerformingHousing || reportData.lowestPerformingHousing) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportData.topPerformingHousing && (
                <PerformanceCard
                  title="الأفضل أداءً"
                  data={reportData.topPerformingHousing}
                  type="top"
                />
              )}
              {reportData.lowestPerformingHousing && (
                <PerformanceCard
                  title="يحتاج تحسين"
                  data={reportData.lowestPerformingHousing}
                  type="lowest"
                />
              )}
            </div>
          )}

          {/* Housing Breakdowns */}
          {reportData.housingBreakdowns && reportData.housingBreakdowns.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Building className="text-blue-600" />
                تفاصيل السكنات ({reportData.housingBreakdowns.length})
              </h2>

              {reportData.housingBreakdowns.map((housing, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Housing Header */}
                  <div
                    className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 cursor-pointer hover:from-gray-800 hover:to-gray-900"
                    onClick={() => setExpandedHousing(expandedHousing === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Building className="text-white" size={28} />
                        <div>
                          <h3 className="text-xl font-bold text-white">{housing.housingName}</h3>
                          <p className="text-gray-300 text-sm">انقر لعرض التفاصيل</p>
                        </div>
                      </div>
                      <span className="text-white text-2xl">{expandedHousing === index ? '▼' : '◀'}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-gray-50">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">إجمالي الطلبات</p>
                      <p className="text-2xl font-bold text-gray-800">{housing.dailyOrdersCount}</p>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="mx-auto mb-1 text-green-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">مقبولة</p>
                      <p className="text-xl font-bold text-green-600">{housing.completedOrdersCount}</p>
                    </div>
                    <div className="text-center">
                      <XCircle className="mx-auto mb-1 text-red-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">مرفوضة</p>
                      <p className="text-xl font-bold text-red-600">{housing.rejectedOrdersCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">معدل الإنجاز</p>
                      <p className={`text-xl font-bold ${
                        housing.completionRate >= 90 ? 'text-green-600' :
                        housing.completionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {housing.completionRate?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <Users className="mx-auto mb-1 text-blue-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">المناديب</p>
                      <p className="text-xl font-bold text-blue-600">{housing.riderCount}</p>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className="mx-auto mb-1 text-orange-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">مشاكل</p>
                      <p className="text-xl font-bold text-orange-600">{housing.problematicOrdersCount}</p>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="px-6 py-4 bg-white border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">مساهمة السكن:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${housing.housingContribution}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-blue-600">{housing.housingContribution?.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-600">متوسط الطلبات لكل مندوب:</span>
                        <span className="text-lg font-bold text-indigo-600">{housing.averageOrdersPerRider?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details - Riders */}
                  {expandedHousing === index && housing.riderAssignments && housing.riderAssignments.length > 0 && (
                    <div className="border-t-2 p-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="text-purple-600" size={20} />
                        تفاصيل المناديب ({housing.riderAssignments.length})
                      </h4>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المندوب</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الورديات</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">مقبولة</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">مرفوضة</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الإنجاز</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ساعات العمل</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {housing.riderAssignments.map((rider, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="font-mono font-bold text-gray-700">#{rider.workingId}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                  {rider.riderName}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                    {rider.shiftsCount}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-600">
                                  {rider.ordersCompleted}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-red-600">
                                  {rider.ordersRejected}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    rider.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                                    rider.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {rider.completionRate?.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="font-semibold">{rider.totalWorkingHours}</span>
                                    <span className="text-xs text-gray-500">ساعة</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}