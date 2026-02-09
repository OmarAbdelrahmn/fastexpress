'use client';

import { useState } from 'react';
import { Building, Users, Package, Award, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, Calendar, Printer } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';


export default function HousingPeriodReport() {
  const { t } = useLanguage();
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
      setError(t('reports.housing.selectStartEndDates'));
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
        setSuccessMessage(t('reports.housing.reportLoadedSuccess'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(t('reports.housing.noDataForPeriod'));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || t('reports.housing.errorLoadingReport'));
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
              <p className="text-xs text-gray-500 mb-1">{t('reports.housing.completionRate')}</p>
              <p className="text-xl font-bold" style={{ color: isTop ? '#10b981' : '#f97316' }}>
                {data.completionRate?.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">{t('reports.housing.order')}</p>
              <p className="text-xl font-bold text-gray-800">{data.ordersCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">{t('reports.housing.rider')}</p>
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
        title={t('reports.housing.periodReportTitle')}
        subtitle={t('reports.housing.periodReportSubtitle')}
        icon={Building}
      />

      {/* Alerts */}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">{t('reports.housing.selectPeriod')}</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('reports.housing.startDate')}</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('reports.housing.endDate')}</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  {t('reports.housing.loadingText')}
                </>
              ) : (
                <>
                  <BarChart3 size={24} />
                  {t('reports.housing.viewReport')}
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 hover:shadow-lg flex items-center justify-center gap-3 font-bold text-lg transition-all"
              title={t('common.print')}
            >
              <Printer size={24} />
              <span className="hidden md:inline">{t('common.print')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Building}
              title={t('reports.housing.totalHousingsLabel')}
              value={reportData.housingBreakdowns?.length || 0}
              subtitle={t('reports.housing.activeUnitsLabel')}
              color="#3b82f6"
            />
            <StatCard
              icon={Users}
              title={t('reports.housing.totalRidersLabel')}
              value={reportData.totalRiders || 0}
              subtitle={t('reports.housing.activeRidersLabel')}
              color="#10b981"
            />
            <StatCard
              icon={Package}
              title={t('reports.housing.totalOrdersLabel')}
              value={reportData.totalOrders || 0}
              subtitle={t('reports.housing.allOrdersLabel')}
              color="#8b5cf6"
            />
            <StatCard
              icon={Award}
              title={t('reports.housing.avgRidersPerHousing')}
              value={reportData.housingBreakdowns?.length
                ? (reportData.totalRiders / reportData.housingBreakdowns.length).toFixed(1)
                : 0}
              subtitle={t('reports.housing.avgDistribution')}
              color="#f59e0b"
            />
          </div>

          {/* Top & Lowest Performers */}
          {(reportData.topPerformingHousing || reportData.lowestPerformingHousing) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportData.topPerformingHousing && (
                <PerformanceCard
                  title={t('reports.housing.topPerforming')}
                  data={reportData.topPerformingHousing}
                  type="top"
                />
              )}
              {reportData.lowestPerformingHousing && (
                <PerformanceCard
                  title={t('reports.housing.needsImprovement')}
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
                {t('reports.housing.housingDetails')} ({reportData.housingBreakdowns.length})
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
                          <p className="text-gray-300 text-sm">{t('reports.housing.clickForDetails')}</p>
                        </div>
                      </div>
                      <span className="text-white text-2xl">{expandedHousing === index ? '▼' : '◀'}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-gray-50">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{t('reports.housing.totalOrdersLabel')}</p>
                      <p className="text-2xl font-bold text-gray-800">{housing.dailyOrdersCount}</p>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="mx-auto mb-1 text-green-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">{t('reports.housing.acceptedLabel')}</p>
                      <p className="text-xl font-bold text-green-600">{housing.completedOrdersCount}</p>
                    </div>
                    <div className="text-center">
                      <XCircle className="mx-auto mb-1 text-red-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">{t('reports.housing.rejectedLabel')}</p>
                      <p className="text-xl font-bold text-red-600">{housing.rejectedOrdersCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{t('reports.housing.completionRate')}</p>
                      <p className={`text-xl font-bold ${housing.completionRate >= 90 ? 'text-green-600' :
                        housing.completionRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {housing.completionRate?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <Users className="mx-auto mb-1 text-blue-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">{t('reports.housing.rider')}</p>
                      <p className="text-xl font-bold text-blue-600">{housing.riderCount}</p>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className="mx-auto mb-1 text-orange-600" size={20} />
                      <p className="text-xs text-gray-500 mb-1">{t('reports.housing.problems')}</p>
                      <p className="text-xl font-bold text-orange-600">{housing.problematicOrdersCount}</p>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="px-6 py-4 bg-white border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{t('reports.housing.housingContributionLabel')}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${housing.housingContribution}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-blue-600">{housing.housingContribution?.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-600">{t('reports.housing.avgOrdersPerRider')}</span>
                        <span className="text-lg font-bold text-indigo-600">{housing.averageOrdersPerRider?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details - Riders */}
                  {expandedHousing === index && housing.riderAssignments && housing.riderAssignments.length > 0 && (
                    <div className="border-t-2 p-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="text-purple-600" size={20} />
                        {t('reports.housing.riderDetailsTitle')} ({housing.riderAssignments.length})
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.workingIdColumn')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.riderNameColumn')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.shiftsColumn')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.acceptedLabel')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.rejectedLabel')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.completionRate')}</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.housing.workingHoursColumn')}</th>
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
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.completionRate >= 90 ? 'bg-green-100 text-green-800' :
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
                                    <span className="text-xs text-gray-500">{t('reports.housing.hourLabel')}</span>
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