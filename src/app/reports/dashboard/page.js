'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Building2, Users, Calendar, Package,
  Home, TrendingUp, Car, Clock, Award, AlertTriangle
} from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Card from '@/components/Ui/Card';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ComprehensiveDashboardPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (customStart = null, customEnd = null) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const params = {};
      if (customStart) params.startDate = customStart;
      if (customEnd) params.endDate = customEnd;

      const data = await ApiService.get(API_ENDPOINTS.REPORTS.DASHBOARD, params);
      setDashboard(data);
      setMessage({ type: 'success', text: t('reports.dataLoadedSuccess') });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('reports.dashboardPage.failedToLoadData') });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateRange = () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: t('reports.dashboardPage.pleaseSelectDates') });
      return;
    }
    loadDashboard(startDate, endDate);
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" >
      <PageHeader
        title={t('reports.dashboardPage.title')}
        subtitle={t('reports.dashboardPage.subtitle')}
        icon={BarChart3}
      />

      {message.text && (
        <div className="m-6">
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        </div>
      )}

      {/* Date Range Filter */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label={t('reports.dashboardPage.fromDate')}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label={t('reports.dashboardPage.toDate')}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end gap-2">
            <Button
              variant="primary"
              onClick={handleCustomDateRange}
              disabled={loading}
              className="flex-1"
            >
              {t('reports.dashboardPage.apply')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                loadDashboard();
              }}
              disabled={loading}
            >
              {t('reports.dashboardPage.reset')}
            </Button>
          </div>
        </div>
        {dashboard && (
          <div className="mt-3 text-sm text-gray-600 text-center">
            📅 {t('reports.dashboardPage.period1')}  {dashboard.periodEnd} :  {dashboard.periodStart} 
          </div>
        )}
      </div>

      {dashboard && (
        <div className="m-6 space-y-6">
          {/* Companies Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center gap-3">
              <Building2 className="text-white" size={28} />
              <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.companiesTitle')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.totalCompanies')}</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboard.companies.totalCompanies}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.activeCompanies')}</p>
                    <p className="text-3xl font-bold text-green-600">{dashboard.companies.activeCompanies}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.topCompany')}</p>
                    <p className="text-lg font-bold text-purple-600">
                      {dashboard.companies.topPerformingCompany || t('reports.dashboardPage.noData')}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.avgCompanyPerformance')}</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {dashboard.companies.averageCompanyPerformance.toFixed(1)}%
                    </p>
                  </div>
                </Card>
              </div>

              {dashboard.companies.companyDetails.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('reports.dashboardPage.companyName')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('reports.dashboardPage.dailyTarget')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('reports.dashboardPage.shifts')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('reports.dashboardPage.riders')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('reports.dashboardPage.orders')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">{t('reports.dashboardPage.performanceRate')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboard.companies.companyDetails.map((company, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{company.companyName}</td>
                          <td className="px-4 py-2">{company.dailyOrderTarget}</td>
                          <td className="px-4 py-2">{company.totalShifts}</td>
                          <td className="px-4 py-2">{company.activeRiders}</td>
                          <td className="px-4 py-2 text-green-600 font-semibold">
                            {company.totalAcceptedOrders}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                              company.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {company.performanceScore.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Riders Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
              <Users className="text-white" size={28} />
              <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.ridersTitle')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.totalRiders')}</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboard.riders.totalRiders}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.activeRiders')}</p>
                    <p className="text-3xl font-bold text-green-600">{dashboard.riders.activeRiders}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.inactiveRiders')}</p>
                    <p className="text-3xl font-bold text-red-600">{dashboard.riders.inactiveRiders}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.withWorkingId')}</p>
                    <p className="text-3xl font-bold text-purple-600">{dashboard.riders.ridersWithWorkingId}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.avgShifts')}</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {dashboard.riders.averageShiftsPerRider.toFixed(1)}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Shifts & Orders Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shifts */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
                <Calendar className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.shiftsTitle')}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.totalShifts')}</p>
                    <p className="text-2xl font-bold text-blue-600">{dashboard.shifts.totalShifts}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.completed')}</p>
                    <p className="text-2xl font-bold text-green-600">{dashboard.shifts.completedShifts}</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.incomplete')}</p>
                    <p className="text-2xl font-bold text-yellow-600">{dashboard.shifts.incompleteShifts}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.failed')}</p>
                    <p className="text-2xl font-bold text-red-600">{dashboard.shifts.failedShifts}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{t('reports.dashboardPage.completionRate')}</span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboard.shifts.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('reports.dashboardPage.avgWorkingHours')}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {dashboard.shifts.averageWorkingHoursPerShift.toFixed(1)} {t('reports.dashboardPage.hours')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
                <Package className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.ordersTitle')}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.totalOrders')}</p>
                    <p className="text-2xl font-bold text-blue-600">{dashboard.orders.totalOrders}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.accepted')}</p>
                    <p className="text-2xl font-bold text-green-600">{dashboard.orders.totalAcceptedOrders}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.rejected')}</p>
                    <p className="text-2xl font-bold text-red-600">{dashboard.orders.totalRejectedOrders}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.dashboardPage.stacked')}</p>
                    <p className="text-2xl font-bold text-purple-600">{dashboard.orders.totalStackedDeliveries}</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('reports.dashboardPage.acceptanceRate')}</span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboard.orders.acceptanceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('reports.dashboardPage.rejectionRate')}</span>
                    <span className="text-lg font-bold text-red-600">
                      {dashboard.orders.rejectionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('reports.dashboardPage.stackedRate')}</span>
                    <span className="text-lg font-bold text-purple-600">
                      {dashboard.orders.stackedDeliveryRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Housing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex items-center gap-3">
                <Award className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.performanceTitle')}</h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('reports.dashboardPage.overallPerformance')}</p>
                  <p className="text-4xl font-bold text-yellow-600">
                    {dashboard.performance.overallPerformanceScore.toFixed(1)}%
                  </p>
                </div>
                {dashboard.performance.topPerformers.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">🏆 {t('reports.dashboardPage.topPerformers')}</h3>
                    <div className="space-y-2">
                      {dashboard.performance.topPerformers.slice(0, 5).map((performer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">#{performer.workingId} - {performer.riderName}</span>
                          <span className="text-sm font-bold text-green-600">
                            {performer.totalOrders} {t('reports.dashboardPage.orders')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Housing */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <Home className="text-white" size={28} />
                <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.housingTitle')}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.totalHousings')}</p>
                      <p className="text-3xl font-bold text-blue-600">{dashboard.housing.totalHousings}</p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.activeHousings')}</p>
                      <p className="text-3xl font-bold text-green-600">{dashboard.housing.activeHousings}</p>
                    </div>
                  </Card>
                </div>
                {dashboard.housing.topPerformingHousing && (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('reports.dashboardPage.topHousing')}</p>
                    <p className="text-xl font-bold text-green-600">
                      {dashboard.housing.topPerformingHousing}
                    </p>
                  </div>
                )}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">{t('reports.dashboardPage.avgRidersPerHousing')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboard.housing.averageRidersPerHousing.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 flex items-center gap-3">
              <Car className="text-white" size={28} />
              <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.vehiclesTitle')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.totalVehicles')}</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboard.vehicle.totalVehicles}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.assigned')}</p>
                    <p className="text-3xl font-bold text-green-600">{dashboard.vehicle.assignedVehicles}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.unassigned')}</p>
                    <p className="text-3xl font-bold text-orange-600">{dashboard.vehicle.unassignedVehicles}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.expiredLicenses')}</p>
                    <p className="text-3xl font-bold text-red-600">{dashboard.vehicle.expiredLicenses}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.avgAge')}</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboard.vehicle.averageVehicleAge.toFixed(1)} {t('reports.dashboardPage.years')}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Trends Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4 flex items-center gap-3">
              <TrendingUp className="text-white" size={28} />
              <h2 className="text-xl font-bold text-white">{t('reports.dashboardPage.trendsTitle')}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.ordersGrowth')}</p>
                    <p className={`text-3xl font-bold ${dashboard.trends.ordersGrowthRate > 0 ? 'text-green-600' :
                      dashboard.trends.ordersGrowthRate < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {dashboard.trends.ordersGrowthRate.toFixed(1)}%
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.shiftsGrowth')}</p>
                    <p className={`text-3xl font-bold ${dashboard.trends.shiftsGrowthRate > 0 ? 'text-green-600' :
                      dashboard.trends.shiftsGrowthRate < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {dashboard.trends.shiftsGrowthRate.toFixed(1)}%
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">{t('reports.dashboardPage.performanceTrend')}</p>
                    <p className={`text-2xl font-bold ${dashboard.trends.performanceTrend === 'Improving' ? 'text-green-600' :
                      dashboard.trends.performanceTrend === 'Declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {dashboard.trends.performanceTrend === 'Improving' ? `📈 ${t('reports.dashboardPage.improving')}` :
                        dashboard.trends.performanceTrend === 'Declining' ? `📉 ${t('reports.dashboardPage.declining')}` : `➡️ ${t('reports.dashboardPage.stable')}`}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}