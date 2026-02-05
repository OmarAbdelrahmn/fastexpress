'use client';

import { useState } from 'react';
import { GitCompare, Search, TrendingUp, TrendingDown, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Package, DollarSign, BarChart3, Users, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CompareRidersPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState([]);
  const [period1Start, setPeriod1Start] = useState('');
  const [period1End, setPeriod1End] = useState('');
  const [period2Start, setPeriod2Start] = useState('');
  const [period2End, setPeriod2End] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedRider, setExpandedRider] = useState(null);

  const toggleRider = (workingId) => {
    if (expandedRider === workingId) {
      setExpandedRider(null);
    } else {
      setExpandedRider(workingId);
    }
  };

  const loadComparison = async () => {
    if (!period1Start || !period1End || !period2Start || !period2End) {
      setMessage({ type: 'error', text: t('reports.comparison.pleaseSelectDates') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setComparisons([]);

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.RIDERS_COMPARE_PERIODS,
        {
          period1Start,
          period1End,
          period2Start,
          period2End
        }
      );


      if (data && Array.isArray(data)) {
        setComparisons(data);
        setMessage({
          type: 'success',
          text: t('reports.comparison.ridersLoadedSuccess', { count: data.length })
        });
      } else {
        setComparisons([]);
        setMessage({
          type: 'warning',
          text: t('reports.comparison.noDataForComparisonPeriods')
        });
      }

    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setMessage({
        type: 'error',
        text: t('reports.comparison.errorLoadingComparison')
      });
      setComparisons([]);
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
    if (value > 0) return <TrendingUp size={16} className="inline" />;
    if (value < 0) return <TrendingDown size={16} className="inline" />;
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

  const formatNumber = (num) => {
    return num?.toFixed(1) || '0.0';
  };

  const MetricCard = ({ label, period1Value, period2Value, difference, changePercent, icon: Icon }) => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className="text-gray-500" />}
        <p className="text-xs text-gray-600 font-medium">{label}</p>
      </div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-center flex-1">
          <p className="text-sm text-blue-600 font-bold">{period1Value}</p>
          <p className="text-xs text-gray-400">{t('reports.comparison.period1')}</p>
        </div>
        <div className={`text-gray-400 text-lg ${language === 'ar' ? 'rotate-180' : ''}`}>→</div>
        <div className="text-center flex-1">
          <p className="text-sm text-purple-600 font-bold">{period2Value}</p>
          <p className="text-xs text-gray-400">{t('reports.comparison.period2')}</p>
        </div>
      </div>
      <div className={`text-center text-xs font-bold ${getChangeColor(difference)}`}>
        {getChangeIcon(difference)}
        <span className="mr-1">{difference > 0 ? '+' : ''}{formatNumber(difference)}</span>
        <span className="mr-1">({changePercent > 0 ? '+' : ''}{formatNumber(changePercent)}%)</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Header */}
      <PageHeader
        title={t('reports.comparison.ridersCompareTitle')}
        subtitle={t('reports.comparison.ridersCompareSubtitle')}
        icon={GitCompare}
      />

      {/* Alert Message */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-800' :
            message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Date Filters */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Period 1 */}
            <div className="border-2 border-blue-300 rounded-lg p-5 bg-blue-50">
              <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                {t('reports.comparison.period1')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.from')}</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={period1Start}
                    onChange={(e) => setPeriod1Start(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.to')}</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={period1End}
                    onChange={(e) => setPeriod1End(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Period 2 */}
            <div className="border-2 border-purple-300 rounded-lg p-5 bg-purple-50">
              <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                {t('reports.comparison.period2')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.from')}</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={period2Start}
                    onChange={(e) => setPeriod2Start(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.to')}</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={period2End}
                    onChange={(e) => setPeriod2End(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={loadComparison}
            disabled={loading || !period1Start || !period1End || !period2Start || !period2End}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {t('reports.comparison.loadingDataText')}
              </>
            ) : (
              <>
                <Search size={20} />
                {t('reports.comparison.comparePeriods')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      {comparisons.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-blue-500">
              <Users className="mx-auto mb-2 text-blue-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">{t('reports.comparison.totalRiders')}</p>
              <p className="text-3xl font-bold text-blue-600">{comparisons.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-green-500">
              <TrendingUp className="mx-auto mb-2 text-green-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">{t('reports.comparison.performanceImprovement')}</p>
              <p className="text-3xl font-bold text-green-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Better').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-red-500">
              <TrendingDown className="mx-auto mb-2 text-red-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">{t('reports.comparison.performanceDeclineCount')}</p>
              <p className="text-3xl font-bold text-red-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Worse').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-yellow-500">
              <BarChart3 className="mx-auto mb-2 text-yellow-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">{t('reports.comparison.mixedPerformanceCount')}</p>
              <p className="text-3xl font-bold text-yellow-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Mixed').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pb-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <GitCompare size={24} />
              {t('reports.comparison.detailedComparisonResults')} ({comparisons.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">{t('reports.comparison.loadingDataText')}</p>
            </div>
          ) : comparisons.length === 0 ? (
            <div className="text-center py-16">
              <GitCompare size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">
                {period1Start && period2Start
                  ? t('reports.comparison.noDataForComparisonPeriods')
                  : t('reports.comparison.noDataSelectPeriods')}
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {comparisons.map((comparison, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all">
                  {/* Rider Header */}
                  <div
                    className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-200 cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => toggleRider(comparison.workingId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                          {comparison.riderName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{comparison.riderName}</h3>
                          <p className="text-sm text-gray-600">{t('reports.comparison.workingNumber')}: <span className="font-bold">{comparison.workingId}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {comparison.verdict?.improvementScore && (
                          <div className="text-center bg-white rounded-lg px-4 py-2 shadow-sm hidden md:block">
                            <p className="text-xs text-gray-500">{t('reports.comparison.improvementScore')}</p>
                            <p className="text-2xl font-bold text-blue-600">{formatNumber(comparison.verdict.improvementScore)}</p>
                          </div>
                        )}
                        <span className={`px-6 py-3 rounded-full text-base font-bold border-2 shadow-sm ${getVerdictColor(comparison.verdict?.overallResult)
                          }`}>
                          {comparison.verdict?.overallResult === 'Better' ? t('reports.comparison.improvedPerformance') :
                            comparison.verdict?.overallResult === 'Worse' ? t('reports.comparison.declinedPerformance') :
                              comparison.verdict?.overallResult === 'Mixed' ? t('reports.comparison.mixedPerformanceLabel') : t('reports.comparison.stablePerformance')}
                        </span>
                        {expandedRider === comparison.workingId ? (
                          <ChevronUp size={24} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedRider === comparison.workingId && (
                    <div className="p-6">
                      {/* Verdict Summary */}
                      {comparison.verdict?.summary && (
                        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-r-4 border-blue-500">
                          <p className="text-base text-gray-800 font-medium">{comparison.verdict.summary}</p>
                        </div>
                      )}

                      {/* Core Metrics */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 size={20} className="text-blue-600" />
                          {t('reports.comparison.coreMetrics')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <MetricCard
                            label={t('reports.comparison.workingDays')}
                            period1Value={comparison.period1?.workingDays}
                            period2Value={comparison.period2?.workingDays}
                            difference={comparison.comparison?.workingDaysDifference}
                            changePercent={comparison.comparison?.workingDaysChangePercent}
                            icon={Calendar}
                          />
                          <MetricCard
                            label={t('reports.comparison.acceptedOrders')}
                            period1Value={comparison.period1?.totalAcceptedOrders}
                            period2Value={comparison.period2?.totalAcceptedOrders}
                            difference={comparison.comparison?.ordersDifference}
                            changePercent={comparison.comparison?.ordersChangePercent}
                            icon={Package}
                          />
                          <MetricCard
                            label={t('reports.comparison.averageOrdersPerDay')}
                            period1Value={formatNumber(comparison.period1?.averageOrdersPerDay)}
                            period2Value={formatNumber(comparison.period2?.averageOrdersPerDay)}
                            difference={comparison.comparison?.averageOrdersPerDayDifference}
                            changePercent={comparison.comparison?.averageOrdersPerDayChangePercent}
                            icon={TrendingUp}
                          />
                          <MetricCard
                            label={`${t('reports.comparison.completionRate')} %`}
                            period1Value={formatNumber(comparison.period1?.completionRate)}
                            period2Value={formatNumber(comparison.period2?.completionRate)}
                            difference={comparison.comparison?.completionRateDifference}
                            changePercent={comparison.comparison?.completionRateChangePercent}
                            icon={CheckCircle}
                          />
                        </div>
                      </div>

                      {/* Performance & Hours */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Clock size={20} className="text-purple-600" />
                          {t('reports.comparison.performanceAndHours')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <MetricCard
                            label={`${t('reports.comparison.performanceScore')} %`}
                            period1Value={formatNumber(comparison.period1?.performanceScore)}
                            period2Value={formatNumber(comparison.period2?.performanceScore)}
                            difference={comparison.comparison?.performanceScoreDifference}
                            changePercent={comparison.comparison?.performanceScoreChangePercent}
                            icon={BarChart3}
                          />
                          <MetricCard
                            label={t('reports.comparison.workingHours')}
                            period1Value={formatNumber(comparison.period1?.totalWorkingHours)}
                            period2Value={formatNumber(comparison.period2?.totalWorkingHours)}
                            difference={comparison.comparison?.workingHoursDifference}
                            changePercent={comparison.comparison?.workingHoursChangePercent}
                            icon={Clock}
                          />
                          <MetricCard
                            label={t('reports.comparison.stackedDeliveries')}
                            period1Value={comparison.period1?.totalStackedDeliveries || 0}
                            period2Value={comparison.period2?.totalStackedDeliveries || 0}
                            difference={0}
                            changePercent={0}
                            icon={Package}
                          />
                          <MetricCard
                            label={t('reports.comparison.stackedPerDay')}
                            period1Value={formatNumber(comparison.period1?.averageStackedPerDay)}
                            period2Value={formatNumber(comparison.period2?.averageStackedPerDay)}
                            difference={0}
                            changePercent={0}
                            icon={TrendingUp}
                          />
                        </div>
                      </div>

                      {/* Shifts Breakdown */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Calendar size={20} className="text-green-600" />
                          {t('reports.comparison.shiftsBreakdown')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <MetricCard
                            label={t('reports.comparison.completed')}
                            period1Value={comparison.period1?.completedShifts}
                            period2Value={comparison.period2?.completedShifts}
                            difference={0}
                            changePercent={0}
                            icon={CheckCircle}
                          />
                          <MetricCard
                            label={t('reports.comparison.incomplete')}
                            period1Value={comparison.period1?.incompleteShifts}
                            period2Value={comparison.period2?.incompleteShifts}
                            difference={0}
                            changePercent={0}
                            icon={AlertTriangle}
                          />
                          <MetricCard
                            label={t('reports.comparison.failed')}
                            period1Value={comparison.period1?.failedShifts}
                            period2Value={comparison.period2?.failedShifts}
                            difference={0}
                            changePercent={0}
                            icon={XCircle}
                          />
                          <MetricCard
                            label={t('reports.comparison.absent')}
                            period1Value={comparison.period1?.absentShifts}
                            period2Value={comparison.period2?.absentShifts}
                            difference={0}
                            changePercent={0}
                            icon={XCircle}
                          />
                        </div>
                      </div>

                      {/* Orders & Rejections */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Package size={20} className="text-orange-600" />
                          {t('reports.comparison.ordersAndRejection')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <MetricCard
                            label={t('reports.comparison.totalRejected')}
                            period1Value={comparison.period1?.totalRejectedOrders}
                            period2Value={comparison.period2?.totalRejectedOrders}
                            difference={0}
                            changePercent={0}
                            icon={XCircle}
                          />
                          <MetricCard
                            label={t('reports.comparison.realRejected')}
                            period1Value={comparison.period1?.totalRealRejectedOrders}
                            period2Value={comparison.period2?.totalRealRejectedOrders}
                            difference={0}
                            changePercent={0}
                            icon={XCircle}
                          />
                          <MetricCard
                            label={t('reports.comparison.rejectionRate')}
                            period1Value={`${formatNumber((comparison.period1?.totalRejectedOrders / comparison.period1?.totalAcceptedOrders * 100) || 0)}%`}
                            period2Value={`${formatNumber((comparison.period2?.totalRejectedOrders / comparison.period2?.totalAcceptedOrders * 100) || 0)}%`}
                            difference={comparison.comparison?.rejectionRateDifference}
                            changePercent={comparison.comparison?.rejectionRateChangePercent}
                            icon={TrendingDown}
                          />
                          <MetricCard
                            label={t('reports.comparison.problematicShifts')}
                            period1Value={comparison.period1?.problematicShiftsCount}
                            period2Value={comparison.period2?.problematicShiftsCount}
                            difference={comparison.comparison?.problematicShiftsDifference}
                            changePercent={comparison.comparison?.problematicShiftsChangePercent}
                            icon={AlertTriangle}
                          />
                        </div>
                      </div>

                      {/* Penalties */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <DollarSign size={20} className="text-red-600" />
                          {t('reports.comparison.penalties')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <MetricCard
                            label={t('reports.comparison.totalPenalties')}
                            period1Value={`${formatNumber(comparison.period1?.totalPenaltyAmount)}`}
                            period2Value={`${formatNumber(comparison.period2?.totalPenaltyAmount)}`}
                            difference={comparison.comparison?.penaltyDifference}
                            changePercent={comparison.comparison?.penaltyChangePercent}
                            icon={DollarSign}
                          />
                        </div>
                      </div>

                      {/* Top Improvements & Declines */}
                      {(comparison.verdict?.topImprovements?.length > 0 || comparison.verdict?.topDeclines?.length > 0) && (
                        <div className="mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Top Improvements */}
                            {comparison.verdict?.topImprovements?.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                  <TrendingUp size={18} />
                                  {t('reports.comparison.largestImprovements')}
                                </h5>
                                <div className="space-y-2">
                                  {comparison.verdict.topImprovements.map((imp, i) => (
                                    <div key={i} className="bg-white rounded p-3 text-sm">
                                      <p className="font-bold text-gray-800">{imp.metricName}</p>
                                      <p className="text-green-600 font-bold">
                                        +{formatNumber(imp.changePercent)}% ({imp.changeValue > 0 ? '+' : ''}{formatNumber(imp.changeValue)})
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Top Declines */}
                            {comparison.verdict?.topDeclines?.length > 0 && (
                              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                                <h5 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                                  <TrendingDown size={18} />
                                  {t('reports.comparison.largestDeclines')}
                                </h5>
                                <div className="space-y-2">
                                  {comparison.verdict.topDeclines.map((dec, i) => (
                                    <div key={i} className="bg-white rounded p-3 text-sm">
                                      <p className="font-bold text-gray-800">{dec.metricName}</p>
                                      <p className="text-red-600 font-bold">
                                        {formatNumber(dec.changePercent)}% ({formatNumber(dec.changeValue)})
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Key Insights */}
                      {comparison.keyInsights && comparison.keyInsights.length > 0 && (
                        <div className="mb-6 bg-blue-50 rounded-lg p-5 border-r-4 border-blue-500">
                          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                            💡 {t('reports.comparison.keyInsights')}
                          </h4>
                          <div className="space-y-2">
                            {comparison.keyInsights.map((insight, i) => (
                              <p key={i} className="text-sm text-gray-700 pr-4 flex items-start">
                                <span className="text-blue-500 ml-2">•</span>
                                {insight}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {comparison.recommendations && comparison.recommendations.length > 0 && (
                        <div className="bg-purple-5 0 rounded-lg p-5 border-r-4 border-purple-500">
                          <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                            📋 {t('reports.comparison.recommendations')}
                          </h4>
                          <div className="space-y-2">
                            {comparison.recommendations.map((rec, i) => (
                              <p key={i} className="text-sm text-gray-700 pr-4 flex items-start">
                                <span className="text-purple-500 ml-2">•</span>
                                {rec}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}