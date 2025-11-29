'use client';

import { useState } from 'react';
import { GitCompare, Search, TrendingUp, TrendingDown, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Package, DollarSign, BarChart3, Users } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function CompareRidersPage() {
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState([]);
  const [period1Start, setPeriod1Start] = useState('');
  const [period1End, setPeriod1End] = useState('');
  const [period2Start, setPeriod2Start] = useState('');
  const [period2End, setPeriod2End] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedRider, setExpandedRider] = useState(null);

  // const loadComparison = async () => {
  //   if (!period1Start || !period1End || !period2Start || !period2End) {
  //     setMessage({ type: 'error', text: 'الرجاء تحديد جميع التواريخ' });
  //     return;
      
  //   }

  //   setLoading(true);
  //   setMessage({ type: '', text: '' });
    
  //   setTimeout(() => {
  //     setComparisons([]);
  //     setMessage({ type: 'success', text: 'تم تحميل البيانات بنجاح' });
  //     setLoading(false);
  //   }, 1000);
  // };


  const loadComparison = async () => {
    if (!period1Start || !period1End || !period2Start || !period2End) {
      setMessage({ type: 'error', text: 'الرجاء تحديد جميع التواريخ' });
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

      console.log(data);

      if (data && Array.isArray(data)) {
        setComparisons(data);
        setMessage({
          type: 'success',
          text: `تم تحميل بيانات ${data.length} مندوب بنجاح`
        });
      } else {
        setComparisons([]);
        setMessage({
          type: 'warning',
          text: 'لا توجد بيانات للمقارنة في الفترتين المحددتين'
        });
      }

    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setMessage({ 
        type: 'error', 
        text: 'حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى' 
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
          <p className="text-xs text-gray-400">الفترة 1</p>
        </div>
        <div className="text-gray-400 text-lg rtl:rotate-180">→</div>
        <div className="text-center flex-1">
          <p className="text-sm text-purple-600 font-bold">{period2Value}</p>
          <p className="text-xs text-gray-400">الفترة 2</p>
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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      {/* Header */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <GitCompare size={40} />
            <div>
              <h1 className="text-3xl font-bold">مقارنة المناديب</h1>
              <p className="text-blue-100 mt-1">مقارنة شاملة لأداء جميع المناديب بين فترتين زمنيتين</p>
            </div>
          </div>
        </div>
      </div> */}

      <PageHeader
        title="مقارنة المناديب"
        subtitle="مقارنة شاملة لأداء جميع المناديب بين فترتين زمنيتين"
        icon={GitCompare}
      />

      {/* Alert Message */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className={`p-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-100 text-red-800' :
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
                الفترة الأولى
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={period1Start}
                    onChange={(e) => setPeriod1Start(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
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
                الفترة الثانية
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={period2Start}
                    onChange={(e) => setPeriod2Start(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
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
                جاري التحميل...
              </>
            ) : (
              <>
                <Search size={20} />
                مقارنة الفترات
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
              <p className="text-gray-600 text-sm mb-1">إجمالي المناديب</p>
              <p className="text-3xl font-bold text-blue-600">{comparisons.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-green-500">
              <TrendingUp className="mx-auto mb-2 text-green-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">تحسن الأداء</p>
              <p className="text-3xl font-bold text-green-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Better').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-red-500">
              <TrendingDown className="mx-auto mb-2 text-red-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">تراجع الأداء</p>
              <p className="text-3xl font-bold text-red-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Worse').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 text-center border-t-4 border-yellow-500">
              <BarChart3 className="mx-auto mb-2 text-yellow-500" size={32} />
              <p className="text-gray-600 text-sm mb-1">أداء مختلط</p>
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
              نتائج المقارنة التفصيلية ({comparisons.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : comparisons.length === 0 ? (
            <div className="text-center py-16">
              <GitCompare size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">
                {period1Start && period2Start 
                  ? 'لا توجد بيانات للمقارنة في الفترتين المحددتين' 
                  : 'الرجاء تحديد الفترتين للمقارنة'}
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {comparisons.map((comparison, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all">
                  {/* Rider Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                          {comparison.riderName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{comparison.riderName}</h3>
                          <p className="text-sm text-gray-600">رقم العمل: <span className="font-bold">{comparison.workingId}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {comparison.verdict?.improvementScore && (
                          <div className="text-center bg-white rounded-lg px-4 py-2 shadow-sm">
                            <p className="text-xs text-gray-500">درجة التحسن</p>
                            <p className="text-2xl font-bold text-blue-600">{formatNumber(comparison.verdict.improvementScore)}</p>
                          </div>
                        )}
                        <span className={`px-6 py-3 rounded-full text-base font-bold border-2 shadow-sm ${
                          getVerdictColor(comparison.verdict?.overallResult)
                        }`}>
                          {comparison.verdict?.overallResult === 'Better' ? '✓ أداء متحسن' :
                           comparison.verdict?.overallResult === 'Worse' ? '✗ أداء متراجع' :
                           comparison.verdict?.overallResult === 'Mixed' ? '⚡ أداء مختلط' : '= أداء ثابت'}
                        </span>
                      </div>
                    </div>
                  </div>

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
                        المقاييس الأساسية
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                          label="أيام العمل"
                          period1Value={comparison.period1?.workingDays}
                          period2Value={comparison.period2?.workingDays}
                          difference={comparison.comparison?.workingDaysDifference}
                          changePercent={comparison.comparison?.workingDaysChangePercent}
                          icon={Calendar}
                        />
                        <MetricCard
                          label="إجمالي الطلبات المقبولة"
                          period1Value={comparison.period1?.totalAcceptedOrders}
                          period2Value={comparison.period2?.totalAcceptedOrders}
                          difference={comparison.comparison?.ordersDifference}
                          changePercent={comparison.comparison?.ordersChangePercent}
                          icon={Package}
                        />
                        <MetricCard
                          label="متوسط الطلبات/اليوم"
                          period1Value={formatNumber(comparison.period1?.averageOrdersPerDay)}
                          period2Value={formatNumber(comparison.period2?.averageOrdersPerDay)}
                          difference={comparison.comparison?.averageOrdersPerDayDifference}
                          changePercent={comparison.comparison?.averageOrdersPerDayChangePercent}
                          icon={TrendingUp}
                        />
                        <MetricCard
                          label="معدل الإنجاز %"
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
                        الأداء وساعات العمل
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                          label="معدل الأداء %"
                          period1Value={formatNumber(comparison.period1?.performanceScore)}
                          period2Value={formatNumber(comparison.period2?.performanceScore)}
                          difference={comparison.comparison?.performanceScoreDifference}
                          changePercent={comparison.comparison?.performanceScoreChangePercent}
                          icon={BarChart3}
                        />
                        <MetricCard
                          label="ساعات العمل الإجمالية"
                          period1Value={formatNumber(comparison.period1?.totalWorkingHours)}
                          period2Value={formatNumber(comparison.period2?.totalWorkingHours)}
                          difference={comparison.comparison?.workingHoursDifference}
                          changePercent={comparison.comparison?.workingHoursChangePercent}
                          icon={Clock}
                        />
                        <MetricCard
                          label="الطلبات المكدسة"
                          period1Value={comparison.period1?.totalStackedDeliveries || 0}
                          period2Value={comparison.period2?.totalStackedDeliveries || 0}
                          difference={0}
                          changePercent={0}
                          icon={Package}
                        />
                        <MetricCard
                          label="متوسط التكديس/اليوم"
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
                        تفصيل الشفتات
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                          label="شفتات مكتملة"
                          period1Value={comparison.period1?.completedShifts}
                          period2Value={comparison.period2?.completedShifts}
                          difference={0}
                          changePercent={0}
                          icon={CheckCircle}
                        />
                        <MetricCard
                          label="شفتات غير مكتملة"
                          period1Value={comparison.period1?.incompleteShifts}
                          period2Value={comparison.period2?.incompleteShifts}
                          difference={0}
                          changePercent={0}
                          icon={AlertTriangle}
                        />
                        <MetricCard
                          label="شفتات فاشلة"
                          period1Value={comparison.period1?.failedShifts}
                          period2Value={comparison.period2?.failedShifts}
                          difference={0}
                          changePercent={0}
                          icon={XCircle}
                        />
                        <MetricCard
                          label="شفتات غياب"
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
                        الطلبات والرفض
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                          label="الطلبات المرفوضة"
                          period1Value={comparison.period1?.totalRejectedOrders}
                          period2Value={comparison.period2?.totalRejectedOrders}
                          difference={0}
                          changePercent={0}
                          icon={XCircle}
                        />
                        <MetricCard
                          label="الرفض الفعلي"
                          period1Value={comparison.period1?.totalRealRejectedOrders}
                          period2Value={comparison.period2?.totalRealRejectedOrders}
                          difference={0}
                          changePercent={0}
                          icon={XCircle}
                        />
                        <MetricCard
                          label="معدل الرفض"
                          period1Value={`${formatNumber((comparison.period1?.totalRejectedOrders / comparison.period1?.totalAcceptedOrders * 100) || 0)}%`}
                          period2Value={`${formatNumber((comparison.period2?.totalRejectedOrders / comparison.period2?.totalAcceptedOrders * 100) || 0)}%`}
                          difference={comparison.comparison?.rejectionRateDifference}
                          changePercent={comparison.comparison?.rejectionRateChangePercent}
                          icon={TrendingDown}
                        />
                        <MetricCard
                          label="الشفتات الإشكالية"
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
                        الغرامات
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                          label="إجمالي الغرامات"
                          period1Value={`${formatNumber(comparison.period1?.totalPenaltyAmount)} ر.س`}
                          period2Value={`${formatNumber(comparison.period2?.totalPenaltyAmount)} ر.س`}
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
                                أكبر التحسينات
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
                                أكبر التراجعات
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
                          💡 النقاط الرئيسية
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
                          📋 التوصيات
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}