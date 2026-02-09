'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import Modal from '@/components/Ui/Model';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CompareCompanyPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [comparison, setComparison] = useState(null);
  const [period1Start, setPeriod1Start] = useState('');
  const [period1End, setPeriod1End] = useState('');
  const [period2Start, setPeriod2Start] = useState('');
  const [period2End, setPeriod2End] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showRiderModal, setShowRiderModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const loadComparison = async () => {
    if (!selectedCompany) {
      setMessage({ type: 'error', text: t('reports.comparison.pleaseSelectCompany') });
      return;
    }
    if (!period1Start || !period1End || !period2Start || !period2End) {
      setMessage({ type: 'error', text: t('reports.comparison.pleaseSelectDates') });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setComparison(null);

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.COMPARE_COMPANY_PERIODS,
        {
          companyName: selectedCompany,
          period1Start,
          period1End,
          period2Start,
          period2End
        }
      );

      if (!data) {
        setMessage({
          type: 'warning',
          text: `${t('reports.comparison.noDataComparison')} ${selectedCompany}`
        });
        setComparison(null);
      } else {
        setComparison(data);
        setMessage({ type: 'success', text: t('reports.comparison.loadSuccess') });
      }
    } catch (error) {
      console.error('Error:', error);
      setComparison(null);
      setMessage({
        type: 'error',
        text: t('reports.comparison.loadFailed')
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (value) => {
    if (value > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (value < 0) return <TrendingDown size={16} className="text-red-600" />;
    return null;
  };

  const getVerdictColor = (result) => {
    switch (result) {
      case 'Better': return 'bg-green-100 text-green-800 border-green-300';
      case 'Worse': return 'bg-red-100 text-red-800 border-red-300';
      case 'Mixed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVerdictText = (result) => {
    switch (result) {
      case 'Better': return `✓ ${t('reports.comparison.better')}`;
      case 'Worse': return `✗ ${t('reports.comparison.worse')}`;
      case 'Mixed': return `⚡ ${t('reports.comparison.mixed')}`;
      default: return `= ${t('reports.comparison.stable')}`;
    }
  };

  const viewRiderDetails = (rider) => {
    setSelectedRider(rider);
    setShowRiderModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('reports.comparison.companyComparison')}
        subtitle={t('reports.comparison.companyComparisonDesc')}
        icon={Building2}
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

      {/* Filters */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('reports.comparison.selectCompany')}</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('reports.comparison.selectCompany')}</option>
            {companies.map((company, idx) => (
              <option key={idx} value={company.name}>{company.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Period 1 */}
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-600 mb-3">{t('reports.comparison.period1')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label={t('common.from')}
                value={period1Start}
                onChange={(e) => setPeriod1Start(e.target.value)}
                required
              />
              <Input
                type="date"
                label={t('common.to')}
                value={period1End}
                onChange={(e) => setPeriod1End(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Period 2 */}
          <div className="border-2 border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-purple-600 mb-3">{t('reports.comparison.period2')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label={t('common.from')}
                value={period2Start}
                onChange={(e) => setPeriod2Start(e.target.value)}
                required
              />
              <Input
                type="date"
                label={t('common.to')}
                value={period2End}
                onChange={(e) => setPeriod2End(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="primary"
            onClick={loadComparison}
            disabled={loading || !selectedCompany || !period1Start || !period1End || !period2Start || !period2End}
            loading={loading}
            className="w-full"
          >
            <Search size={18} />
            {t('reports.comparison.comparePeriods')}
          </Button>
        </div>
      </div>

      {/* No Data Message */}
      {!loading && !comparison && hasSearched && (
        <div className="m-6 bg-white rounded-xl shadow-md p-12">
          <div className="text-center space-y-4">
            <AlertCircle size={64} className="mx-auto text-orange-400" />
            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {t('reports.comparison.noDataComparison')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('reports.comparison.notEnoughData')}
              </p>
              <p className="text-sm text-gray-400">
                {t('reports.comparison.ensureShifts')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="m-6 space-y-6">
          {/* Company Header */}
          <Card>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{comparison.companyName}</h2>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg text-gray-600">{t('reports.comparison.overallTrend')}:</p>
                <span className={`px-4 py-2 rounded-full font-bold ${comparison.overallTrend === 'Improving' ? 'bg-green-100 text-green-700' :
                  comparison.overallTrend === 'Declining' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                  {comparison.overallTrend === 'Improving' ? `📈 ${t('reports.comparison.significantImprovement')}` :
                    comparison.overallTrend === 'Declining' ? `📉 ${t('reports.comparison.performanceDecline')}` : `➡️ ${t('reports.comparison.stablePerformance')}`}
                </span>
              </div>
            </div>
          </Card>

          {/* Main Comparison Metrics - 8 Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Working Days */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.workingDays')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.workingDays}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.workingDays}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(comparison.comparison?.workingDaysDifference)
                  }`}>
                  {getChangeIcon(comparison.comparison?.workingDaysDifference)}
                  <span>{Math.abs(comparison.comparison?.workingDaysChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            {/* Accepted Orders */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.acceptedOrders')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.totalAcceptedOrders}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.totalAcceptedOrders}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(comparison.comparison?.ordersDifference)
                  }`}>
                  {getChangeIcon(comparison.comparison?.ordersDifference)}
                  <span>{Math.abs(comparison.comparison?.ordersChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            {/* Completion Rate */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.completionRate')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.completionRate?.toFixed(1)}%</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.completionRate?.toFixed(1)}%</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(comparison.comparison?.completionRateDifference)
                  }`}>
                  {getChangeIcon(comparison.comparison?.completionRateDifference)}
                  <span>{Math.abs(comparison.comparison?.completionRateChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            {/* Performance Score */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.performanceScore')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.performanceScore?.toFixed(1)}%</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.performanceScore?.toFixed(1)}%</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(comparison.comparison?.performanceScoreDifference)
                  }`}>
                  {getChangeIcon(comparison.comparison?.performanceScoreDifference)}
                  <span>{Math.abs(comparison.comparison?.performanceScoreChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            {/* Stacked Deliveries */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.stackedDeliveries')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.totalStackedDeliveries}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.totalStackedDeliveries}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('reports.comparison.averagePerDay')}: {comparison.period2?.averageStackedPerDay?.toFixed(1)}
                </p>
              </div>
            </Card>

            {/* Average Orders Per Day */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.averageOrdersPerDay')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.averageOrdersPerDay?.toFixed(1)}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.averageOrdersPerDay?.toFixed(1)}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(comparison.comparison?.averageOrdersPerDayDifference)
                  }`}>
                  {getChangeIcon(comparison.comparison?.averageOrdersPerDayDifference)}
                  <span>{Math.abs(comparison.comparison?.averageOrdersPerDayChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            {/* Working Hours */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.workingHours')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.totalWorkingHours?.toFixed(1)}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.totalWorkingHours?.toFixed(1)}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(comparison.comparison?.workingHoursDifference)
                  }`}>
                  {getChangeIcon(comparison.comparison?.workingHoursDifference)}
                  <span>{Math.abs(comparison.comparison?.workingHoursChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            {/* Penalties */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.penalties')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.totalPenaltyAmount?.toFixed(0)}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.totalPenaltyAmount?.toFixed(0)}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${getChangeColor(-comparison.comparison?.penaltyDifference)
                  }`}>
                  {getChangeIcon(-comparison.comparison?.penaltyDifference)}
                  <span>{Math.abs(comparison.comparison?.penaltyChangePercent || 0).toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Shifts Status Comparison */}
          <Card title={t('reports.comparison.shiftsStatusComparison')}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Completed */}
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  {t('reports.comparison.completed')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl text-blue-600 font-bold">{comparison.period1?.completedShifts}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-xl text-purple-600 font-bold">{comparison.period2?.completedShifts}</span>
                </div>
              </div>

              {/* Incomplete */}
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  {t('reports.comparison.incomplete')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl text-blue-600 font-bold">{comparison.period1?.incompleteShifts}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-xl text-purple-600 font-bold">{comparison.period2?.incompleteShifts}</span>
                </div>
              </div>

              {/* Failed */}
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600" />
                  {t('reports.comparison.failed')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl text-blue-600 font-bold">{comparison.period1?.failedShifts}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-xl text-purple-600 font-bold">{comparison.period2?.failedShifts}</span>
                </div>
              </div>

              {/* Absent */}
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Users size={16} className="text-gray-600" />
                  {t('reports.comparison.absent')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl text-blue-600 font-bold">{comparison.period1?.absentShifts}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-xl text-purple-600 font-bold">{comparison.period2?.absentShifts}</span>
                </div>
              </div>

              {/* Problematic */}
              <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-600" />
                  {t('reports.comparison.problems')}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl text-blue-600 font-bold">{comparison.period1?.problematicShiftsCount}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-xl text-purple-600 font-bold">{comparison.period2?.problematicShiftsCount}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Rejection Metrics */}
          <Card title={t('reports.comparison.rejectionMetrics')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.totalRejected')}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl text-blue-600 font-bold">{comparison.period1?.totalRejectedOrders}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-2xl text-purple-600 font-bold">{comparison.period2?.totalRejectedOrders}</span>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.realRejected')}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl text-blue-600 font-bold">{comparison.period1?.totalRealRejectedOrders}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-2xl text-purple-600 font-bold">{comparison.period2?.totalRealRejectedOrders}</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">{t('reports.comparison.rejectionRate')}</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-2xl text-blue-600 font-bold">
                    {((comparison.period1?.totalRejectedOrders / (comparison.period1?.totalAcceptedOrders + comparison.period1?.totalRejectedOrders)) * 100 || 0).toFixed(1)}%
                  </span>
                  <span className="text-gray-400">←</span>
                  <span className="text-2xl text-purple-600 font-bold">
                    {((comparison.period2?.totalRejectedOrders / (comparison.period2?.totalAcceptedOrders + comparison.period2?.totalRejectedOrders)) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className={`text-center text-sm font-bold ${getChangeColor(-comparison.comparison?.rejectionRateDifference)
                  }`}>
                  {Math.abs(comparison.comparison?.rejectionRateChangePercent || 0).toFixed(1)}% {t('reports.comparison.change')}
                </div>
              </div>
            </div>
          </Card>

          {/* Top Improved Riders */}
          {comparison.topImprovedRiders && comparison.topImprovedRiders.length > 0 && (
            <Card title={`🏆 ${t('reports.comparison.topImprovedRiders')}`}>
              <div className="space-y-3">
                {comparison.topImprovedRiders.slice(0, 5).map((rider, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => viewRiderDetails(rider)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-green-600">#{idx + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800">{rider.riderName}</p>
                        <p className="text-sm text-gray-500">{t('reports.comparison.workingNumber')}: {rider.workingId}</p>
                      </div>
                      {rider.verdict && (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getVerdictColor(rider.verdict.overallResult)}`}>
                          {getVerdictText(rider.verdict.overallResult)}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                        <TrendingUp size={20} />
                        {Math.abs(rider.comparison?.ordersChangePercent || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {rider.period1?.totalAcceptedOrders} ← {rider.period2?.totalAcceptedOrders} {t('reports.comparison.orders')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Declined Riders */}
          {comparison.topDeclinedRiders && comparison.topDeclinedRiders.length > 0 && (
            <Card title={`⚠️ ${t('reports.comparison.topDeclinedRiders')}`}>
              <div className="space-y-3">
                {comparison.topDeclinedRiders.slice(0, 5).map((rider, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => viewRiderDetails(rider)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-red-600">#{idx + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800">{rider.riderName}</p>
                        <p className="text-sm text-gray-500">{t('reports.comparison.workingNumber')}: {rider.workingId}</p>
                      </div>
                      {rider.verdict && (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getVerdictColor(rider.verdict.overallResult)}`}>
                          {getVerdictText(rider.verdict.overallResult)}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-red-600 flex items-center gap-1">
                        <TrendingDown size={20} />
                        {Math.abs(rider.comparison?.ordersChangePercent || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {rider.period1?.totalAcceptedOrders} ← {rider.period2?.totalAcceptedOrders} {t('reports.comparison.orders')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Company Breakdowns Comparison */}
          {comparison.period1?.companyBreakdowns && comparison.period1.companyBreakdowns.length > 0 && (
            <Card title={t('reports.comparison.subCompaniesComparison')}>
              <div className="space-y-4">
                {comparison.period1.companyBreakdowns.map((company1, idx) => {
                  const company2 = comparison.period2?.companyBreakdowns?.find(c => c.companyName === company1.companyName);
                  if (!company2) return null;

                  return (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-lg mb-3">{company1.companyName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">{t('reports.comparison.workingDays')}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-600 font-bold">{company1.workingDays}</span>
                            <span className="text-gray-400">←</span>
                            <span className="text-sm text-purple-600 font-bold">{company2.workingDays}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('reports.comparison.orders')}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-600 font-bold">{company1.totalAcceptedOrders}</span>
                            <span className="text-gray-400">←</span>
                            <span className="text-sm text-purple-600 font-bold">{company2.totalAcceptedOrders}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('reports.comparison.performanceScore')}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-600 font-bold">{company1.performanceScore.toFixed(1)}%</span>
                            <span className="text-gray-400">←</span>
                            <span className="text-sm text-purple-600 font-bold">{company2.performanceScore.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('reports.comparison.stackedPerDay')}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-600 font-bold">{company1.averageStackedPerShift.toFixed(1)}</span>
                            <span className="text-gray-400">←</span>
                            <span className="text-sm text-purple-600 font-bold">{company2.averageStackedPerShift.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Rider Details Modal */}
      <Modal
        isOpen={showRiderModal}
        onClose={() => setShowRiderModal(false)}
        title={`${t('reports.comparison.riderDetails')}: ${selectedRider?.riderName || ''}`}
        size="xl"
      >
        {selectedRider && (
          <div className="space-y-6">
            {/* Rider Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.comparison.riderName')}</p>
                  <p className="text-lg font-bold">{selectedRider.riderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.comparison.workingNumber')}</p>
                  <p className="text-lg font-bold">#{selectedRider.workingId}</p>
                </div>
              </div>
              {selectedRider.verdict && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{t('reports.comparison.overallAssessment')}:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getVerdictColor(selectedRider.verdict.overallResult)
                      }`}>
                      {getVerdictText(selectedRider.verdict.overallResult)}
                    </span>
                  </div>
                  {selectedRider.verdict.summary && (
                    <p className="text-sm text-gray-700 mt-2">{selectedRider.verdict.summary}</p>
                  )}
                </div>
              )}
            </div>

            {/* Performance Comparison */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.acceptedOrders')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-600 font-bold">{selectedRider.period1?.totalAcceptedOrders}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{selectedRider.period2?.totalAcceptedOrders}</span>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.completionRate')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-600 font-bold">{selectedRider.period1?.completionRate?.toFixed(1)}%</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{selectedRider.period2?.completionRate?.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.performanceScore')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-600 font-bold">{selectedRider.period1?.performanceScore?.toFixed(1)}%</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{selectedRider.period2?.performanceScore?.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.workingDays')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-600 font-bold">{selectedRider.period1?.workingDays}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{selectedRider.period2?.workingDays}</span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.stackedDeliveries')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-600 font-bold">{selectedRider.period1?.totalStackedDeliveries}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{selectedRider.period2?.totalStackedDeliveries}</span>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.penalties')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-600 font-bold">{selectedRider.period1?.totalPenaltyAmount?.toFixed(0)}</span>
                  <span className="text-gray-400">←</span>
                  <span className="text-lg text-purple-600 font-bold">{selectedRider.period2?.totalPenaltyAmount?.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {selectedRider.keyInsights && selectedRider.keyInsights.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  💡 {t('reports.comparison.keyInsights')}
                </h4>
                <ul className="space-y-2">
                  {selectedRider.keyInsights.map((insight, i) => (
                    <li key={i} className="text-sm text-gray-700 pr-4 relative">
                      <span className="absolute right-0 top-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {selectedRider.recommendations && selectedRider.recommendations.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  📋 {t('reports.comparison.recommendations')}
                </h4>
                <ul className="space-y-2">
                  {selectedRider.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-700 pr-4 relative">
                      <span className="absolute right-0 top-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shifts Breakdown */}
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-xs text-gray-600">{t('reports.comparison.completed')}</p>
                <p className="text-sm font-bold">{selectedRider.period2?.completedShifts}</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <p className="text-xs text-gray-600">{t('reports.comparison.incomplete')}</p>
                <p className="text-sm font-bold">{selectedRider.period2?.incompleteShifts}</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="text-xs text-gray-600">{t('reports.comparison.failed')}</p>
                <p className="text-sm font-bold">{selectedRider.period2?.failedShifts}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">{t('reports.comparison.absent')}</p>
                <p className="text-sm font-bold">{selectedRider.period2?.absentShifts}</p>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <p className="text-xs text-gray-600">{t('reports.comparison.problems')}</p>
                <p className="text-sm font-bold">{selectedRider.period2?.problematicShiftsCount}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}