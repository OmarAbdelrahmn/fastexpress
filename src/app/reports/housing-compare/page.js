'use client';

import { useState } from 'react';
import { Home, Search, Users, Package, TrendingUp, TrendingDown, Award, MapPin, AlertCircle, ArrowUp, ArrowDown, Minus, Lightbulb, Clock, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

const API_BASE = 'https://fastexpress.tryasp.net/api';

const HousingComparisonReport = () => {
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDate1, setStartDate1] = useState('');
  const [endDate1, setEndDate1] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedHousing, setExpandedHousing] = useState(null);

  const loadReport = async () => {
    if (!startDate || !endDate || !startDate1 || !endDate1) {
      setMessage({ type: 'error', text: 'الرجاء تحديد جميع التواريخ للفترتين' });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setComparisons(null);
    
    try {
      const response = await fetch(
        `${API_BASE}/Report/housing/compare?startDate=${startDate}&endDate=${endDate}&startDate1=${startDate1}&endDate1=${endDate1}`,
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('فشل في تحميل التقرير');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        setMessage({ 
          type: 'warning', 
          text: 'لا توجد بيانات للمقارنة بين الفترتين' 
        });
        setComparisons(null);
      } else {
        setComparisons(data);
        setMessage({ type: 'success', text: `تم تحميل ${data.length} مقارنة للسكنات بنجاح` });
      }
    } catch (error) {
      console.error('Error:', error);
      setComparisons(null);
      setMessage({ 
        type: 'error', 
        text: error.message || 'فشل في تحميل التقرير' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (value) => {
    if (value > 0) return <ArrowUp size={16} className="text-green-600" />;
    if (value < 0) return <ArrowDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getChangeColor = (value) => {
    if (value > 0) return 'text-green-600 bg-green-50';
    if (value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getChangeTextColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const Alert = ({ type, message, onClose }) => {
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };

    return (
      <div className={`p-4 rounded-lg border-2 ${colors[type]} flex items-center justify-between mb-6`}>
        <span>{message}</span>
        <button onClick={onClose} className="text-xl font-bold hover:opacity-70">&times;</button>
      </div>
    );
  };

  const calculateTotals = () => {
    if (!comparisons) return null;
    
    const totals = {
      period1: {
        totalOrders: 0,
        completedOrders: 0,
        rejectedOrders: 0,
        totalRiders: 0,
        totalHousings: comparisons.length
      },
      period2: {
        totalOrders: 0,
        completedOrders: 0,
        rejectedOrders: 0,
        totalRiders: 0,
        totalHousings: comparisons.length
      }
    };

    comparisons.forEach(comp => {
      totals.period1.totalOrders += comp.period1Breakdown?.dailyOrdersCount || 0;
      totals.period1.completedOrders += comp.period1Breakdown?.completedOrdersCount || 0;
      totals.period1.rejectedOrders += comp.period1Breakdown?.rejectedOrdersCount || 0;
      totals.period1.totalRiders += comp.period1Breakdown?.riderCount || 0;

      totals.period2.totalOrders += comp.period2Breakdown?.dailyOrdersCount || 0;
      totals.period2.completedOrders += comp.period2Breakdown?.completedOrdersCount || 0;
      totals.period2.rejectedOrders += comp.period2Breakdown?.rejectedOrdersCount || 0;
      totals.period2.totalRiders += comp.period2Breakdown?.riderCount || 0;
    });

    totals.period1.completionRate = totals.period1.totalOrders > 0 
      ? (totals.period1.completedOrders / totals.period1.totalOrders * 100).toFixed(1)
      : 0;
    totals.period2.completionRate = totals.period2.totalOrders > 0 
      ? (totals.period2.completedOrders / totals.period2.totalOrders * 100).toFixed(1)
      : 0;

    return totals;
  };

  const totals = calculateTotals();

  const ComparisonMetricCard = ({ label, period1Value, period2Value, difference, changePercent, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-600">{label}</h4>
        <Icon className="text-gray-400" size={24} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">الفترة 1</p>
          <p className="text-2xl font-bold text-blue-600">{period1Value}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">الفترة 2</p>
          <p className="text-2xl font-bold text-purple-600">{period2Value}</p>
        </div>
      </div>

      <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg ${getChangeColor(difference)}`}>
        {getChangeIcon(difference)}
        <span className="font-semibold text-sm">
          {difference > 0 ? '+' : ''}{difference}
        </span>
        <span className="text-xs">
          ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 " dir="rtl">
      {/* Header */}
      <PageHeader
              title="مقارنة أداء السكنات"
              subtitle="تحليل شامل ومقارنة متقدمة بين فترتين زمنيتين"
              icon={Home}
        />

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Date Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Search size={24} className="text-blue-600" />
          اختيار الفترات للمقارنة
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Period 1 */}
          <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-blue-700">الفترة الأولى</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">من تاريخ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Period 2 */}
          <div className="border-2 border-purple-200 rounded-xl p-5 bg-purple-50/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-purple-700">الفترة الثانية</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">من تاريخ</label>
                <input
                  type="date"
                  value={startDate1}
                  onChange={(e) => setStartDate1(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  value={endDate1}
                  onChange={(e) => setEndDate1(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={loadReport}
          disabled={loading || !startDate || !endDate || !startDate1 || !endDate1}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
              جاري التحميل...
            </>
          ) : (
            <>
              <Search size={24} />
              مقارنة الفترتين
            </>
          )}
        </button>
      </div>

      {/* No Data */}
      {!loading && !comparisons && hasSearched && (
        <div className="bg-white rounded-2xl shadow-lg p-16">
          <div className="text-center space-y-4">
            <AlertCircle size={80} className="mx-auto text-orange-400" />
            <h3 className="text-2xl font-bold text-gray-700">لا توجد بيانات للمقارنة</h3>
            <p className="text-gray-500">لم يتم العثور على سكنات في الفترتين المحددتين</p>
          </div>
        </div>
      )}

      {/* Report Display */}
      {comparisons && (
        <div className="space-y-6">
          {/* Overall Summary */}
          {totals && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ComparisonMetricCard
                label="إجمالي الطلبات"
                period1Value={totals.period1.totalOrders}
                period2Value={totals.period2.totalOrders}
                difference={totals.period2.totalOrders - totals.period1.totalOrders}
                changePercent={totals.period1.totalOrders > 0 
                  ? ((totals.period2.totalOrders - totals.period1.totalOrders) / totals.period1.totalOrders * 100)
                  : 0}
                icon={Package}
              />

              <ComparisonMetricCard
                label="الطلبات المقبولة"
                period1Value={totals.period1.completedOrders}
                period2Value={totals.period2.completedOrders}
                difference={totals.period2.completedOrders - totals.period1.completedOrders}
                changePercent={totals.period1.completedOrders > 0 
                  ? ((totals.period2.completedOrders - totals.period1.completedOrders) / totals.period1.completedOrders * 100)
                  : 0}
                icon={CheckCircle}
              />

              <ComparisonMetricCard
                label="إجمالي المناديب"
                period1Value={totals.period1.totalRiders}
                period2Value={totals.period2.totalRiders}
                difference={totals.period2.totalRiders - totals.period1.totalRiders}
                changePercent={totals.period1.totalRiders > 0 
                  ? ((totals.period2.totalRiders - totals.period1.totalRiders) / totals.period1.totalRiders * 100)
                  : 0}
                icon={Users}
              />

              <ComparisonMetricCard
                label="معدل الإنجاز %"
                period1Value={`${totals.period1.completionRate}%`}
                period2Value={`${totals.period2.completionRate}%`}
                difference={parseFloat(totals.period2.completionRate) - parseFloat(totals.period1.completionRate)}
                changePercent={totals.period1.completionRate > 0 
                  ? ((parseFloat(totals.period2.completionRate) - parseFloat(totals.period1.completionRate)) / parseFloat(totals.period1.completionRate) * 100)
                  : 0}
                icon={Award}
              />
            </div>
          )}

          {/* Housing Comparisons */}
          <div className="space-y-4">
            {comparisons.map((housing, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 cursor-pointer hover:from-gray-800 hover:to-gray-900 transition-all"
                     onClick={() => setExpandedHousing(expandedHousing === index ? null : index)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <MapPin className="text-white" size={28} />
                      <div>
                        <h3 className="text-xl font-bold text-white">{housing.housingName}</h3>
                        <p className="text-gray-300 text-sm">انقر لعرض التفاصيل الكاملة</p>
                      </div>
                    </div>
                    <div className="text-white">
                      {expandedHousing === index ? '▼' : '◀'}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">إجمالي الطلبات</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {housing.period1Breakdown?.dailyOrdersCount || 0}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-lg font-bold text-purple-600">
                        {housing.period2Breakdown?.dailyOrdersCount || 0}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${getChangeTextColor(housing.comparison?.dailyOrdersDifference)}`}>
                      {housing.comparison?.dailyOrdersDifference > 0 ? '+' : ''}
                      {housing.comparison?.dailyOrdersDifference || 0}
                      ({housing.comparison?.dailyOrdersChangePercent?.toFixed(1) || 0}%)
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">الطلبات المقبولة</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {housing.period1Breakdown?.completedOrdersCount || 0}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-lg font-bold text-purple-600">
                        {housing.period2Breakdown?.completedOrdersCount || 0}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${getChangeTextColor(housing.comparison?.completedOrdersDifference)}`}>
                      {housing.comparison?.completedOrdersDifference > 0 ? '+' : ''}
                      {housing.comparison?.completedOrdersDifference || 0}
                      ({housing.comparison?.completedOrdersChangePercent?.toFixed(1) || 0}%)
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">معدل الإنجاز</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {housing.period1Breakdown?.completionRate?.toFixed(1) || 0}%
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-lg font-bold text-purple-600">
                        {housing.period2Breakdown?.completionRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${getChangeTextColor(housing.comparison?.completionRateDifference)}`}>
                      {housing.comparison?.completionRateDifference > 0 ? '+' : ''}
                      {housing.comparison?.completionRateDifference?.toFixed(1) || 0}%
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">المناديب</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {housing.period1Breakdown?.riderCount || 0}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-lg font-bold text-purple-600">
                        {housing.period2Breakdown?.riderCount || 0}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${getChangeTextColor(housing.comparison?.riderCountDifference)}`}>
                      {housing.comparison?.riderCountDifference > 0 ? '+' : ''}
                      {housing.comparison?.riderCountDifference || 0}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">الطلبات المرفوضة</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {housing.period1Breakdown?.rejectedOrdersCount || 0}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-lg font-bold text-purple-600">
                        {housing.period2Breakdown?.rejectedOrdersCount || 0}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${getChangeTextColor(housing.comparison?.rejectedOrdersDifference)}`}>
                      {housing.comparison?.rejectedOrdersDifference > 0 ? '+' : ''}
                      {housing.comparison?.rejectedOrdersDifference || 0}
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {housing.insights && housing.insights.length > 0 && (
                  <div className="px-6 py-4 bg-amber-50 border-t-2 border-amber-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 mb-2">رؤى وملاحظات:</h4>
                        <ul className="space-y-1">
                          {housing.insights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-amber-800">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {expandedHousing === index && (
                  <div className="p-6 border-t-2">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">تفاصيل المقارنة الكاملة</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Period 1 Details */}
                      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
                        <h5 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          الفترة الأولى - {startDate} إلى {endDate}
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">إجمالي الطلبات:</span>
                            <span className="font-bold">{housing.period1Breakdown?.dailyOrdersCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طلبات مقبولة:</span>
                            <span className="font-bold text-green-600">{housing.period1Breakdown?.completedOrdersCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طلبات مرفوضة:</span>
                            <span className="font-bold text-red-600">{housing.period1Breakdown?.rejectedOrdersCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">معدل الإنجاز:</span>
                            <span className="font-bold">{housing.period1Breakdown?.completionRate?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">عدد المناديب:</span>
                            <span className="font-bold">{housing.period1Breakdown?.riderCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">متوسط الطلبات/مندوب:</span>
                            <span className="font-bold">{housing.period1Breakdown?.averageOrdersPerRider?.toFixed(1) || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المساهمة:</span>
                            <span className="font-bold">{housing.period1Breakdown?.housingContribution?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طلبات مشكلة:</span>
                            <span className="font-bold text-orange-600">{housing.period1Breakdown?.problematicOrdersCount || 0}</span>
                          </div>
                        </div>

                        {/* Riders Period 1 */}
                        {housing.period1Breakdown?.riderAssignments?.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-semibold text-blue-700 mb-2">المناديب:</h6>
                            <div className="space-y-2">
                              {housing.period1Breakdown.riderAssignments.map((rider, idx) => (
                                <div key={idx} className="bg-white rounded p-2 text-xs">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold">{rider.riderName}</span>
                                    <span className="text-gray-500">#{rider.workingId}</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-gray-600">
                                    <div>
                                      <span className="text-green-600 font-bold">{rider.ordersCompleted}</span> مقبول
                                    </div>
                                    <div>
                                      <span className="text-red-600 font-bold">{rider.ordersRejected}</span> مرفوض
                                    </div>
                                    <div>
                                      <Clock size={12} className="inline mr-1" />
                                      <span className="font-bold">{rider.totalWorkingHours}ساعة</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Period 2 Details */}
                      <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/30">
                        <h5 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          الفترة الثانية - {startDate1} إلى {endDate1}
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">إجمالي الطلبات:</span>
                            <span className="font-bold">{housing.period2Breakdown?.dailyOrdersCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طلبات مقبولة:</span>
                            <span className="font-bold text-green-600">{housing.period2Breakdown?.completedOrdersCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طلبات مرفوضة:</span>
                            <span className="font-bold text-red-600">{housing.period2Breakdown?.rejectedOrdersCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">معدل الإنجاز:</span>
                            <span className="font-bold">{housing.period2Breakdown?.completionRate?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">عدد المناديب:</span>
                            <span className="font-bold">{housing.period2Breakdown?.riderCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">متوسط الطلبات/مندوب:</span>
                            <span className="font-bold">{housing.period2Breakdown?.averageOrdersPerRider?.toFixed(1) || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">المساهمة:</span>
                            <span className="font-bold">{housing.period2Breakdown?.housingContribution?.toFixed(1) || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">طلبات مشكلة:</span>
                            <span className="font-bold text-orange-600">{housing.period2Breakdown?.problematicOrdersCount || 0}</span>
                          </div>
                        </div>

                        {/* Riders Period 2 */}
                        {housing.period2Breakdown?.riderAssignments?.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-semibold text-purple-700 mb-2">المناديب:</h6>
                            <div className="space-y-2">
                              {housing.period2Breakdown.riderAssignments.map((rider, idx) => (
                                <div key={idx} className="bg-white rounded p-2 text-xs">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold">{rider.riderName}</span>
                                    <span className="text-gray-500">#{rider.workingId}</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-gray-600">
                                    <div>
                                      <span className="text-green-600 font-bold">{rider.ordersCompleted}</span> مقبول
                                    </div>
                                    <div>
                                      <span className="text-red-600 font-bold">{rider.ordersRejected}</span> مرفوض
                                    </div>
                                    <div>
                                      <Clock size={12} className="inline mr-1" />
                                      <span className="font-bold">{rider.totalWorkingHours}ساعة</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Comparison Metrics */}
                    <div className="mt-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4">
                      <h5 className="font-bold text-gray-800 mb-3">ملخص التغييرات</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-gray-600 text-xs mb-1">تغيير الطلبات</p>
                          <p className={`font-bold text-lg ${getChangeTextColor(housing.comparison?.dailyOrdersDifference)}`}>
                            {housing.comparison?.dailyOrdersDifference > 0 ? '+' : ''}
                            {housing.comparison?.dailyOrdersDifference || 0}
                          </p>
                          <p className="text-xs text-gray-500">
                            ({housing.comparison?.dailyOrdersChangePercent?.toFixed(1) || 0}%)
                          </p>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-gray-600 text-xs mb-1">تغيير معدل الإنجاز</p>
                          <p className={`font-bold text-lg ${getChangeTextColor(housing.comparison?.completionRateDifference)}`}>
                            {housing.comparison?.completionRateDifference > 0 ? '+' : ''}
                            {housing.comparison?.completionRateDifference?.toFixed(1) || 0}%
                          </p>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-gray-600 text-xs mb-1">تغيير المناديب</p>
                          <p className={`font-bold text-lg ${getChangeTextColor(housing.comparison?.riderCountDifference)}`}>
                            {housing.comparison?.riderCountDifference > 0 ? '+' : ''}
                            {housing.comparison?.riderCountDifference || 0}
                          </p>
                        </div>
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-gray-600 text-xs mb-1">تغيير المساهمة</p>
                          <p className={`font-bold text-lg ${getChangeTextColor(housing.comparison?.housingContributionDifference)}`}>
                            {housing.comparison?.housingContributionDifference > 0 ? '+' : ''}
                            {housing.comparison?.housingContributionDifference?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousingComparisonReport;