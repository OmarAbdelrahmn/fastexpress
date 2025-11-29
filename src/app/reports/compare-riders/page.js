'use client';

import { useState } from 'react';
import { GitCompare, Search, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';

export default function CompareRidersPage() {
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState([]);
  const [period1Start, setPeriod1Start] = useState('');
  const [period1End, setPeriod1End] = useState('');
  const [period2Start, setPeriod2Start] = useState('');
  const [period2End, setPeriod2End] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadComparison = async () => {
    if (!period1Start || !period1End || !period2Start || !period2End) {
      setMessage({ type: 'error', text: 'الرجاء تحديد جميع التواريخ' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
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
      setComparisons(Array.isArray(data) ? data : []);
      setMessage({ type: 'success', text: `تم تحميل ${data.length} مقارنة` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل المقارنات' });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="مقارنة المناديب"
        subtitle="مقارنة أداء جميع المناديب بين فترتين زمنيتين"
        icon={GitCompare}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Period 1 */}
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-600 mb-3">الفترة الأولى</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="من تاريخ"
                value={period1Start}
                onChange={(e) => setPeriod1Start(e.target.value)}
                required
              />
              <Input
                type="date"
                label="إلى تاريخ"
                value={period1End}
                onChange={(e) => setPeriod1End(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Period 2 */}
          <div className="border-2 border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-purple-600 mb-3">الفترة الثانية</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="من تاريخ"
                value={period2Start}
                onChange={(e) => setPeriod2Start(e.target.value)}
                required
              />
              <Input
                type="date"
                label="إلى تاريخ"
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
            disabled={loading || !period1Start || !period1End || !period2Start || !period2End}
            loading={loading}
            className="w-full"
          >
            <Search size={18} />
            مقارنة الفترات
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {comparisons.length > 0 && (
        <div className="m-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي المناديب</p>
              <p className="text-3xl font-bold text-blue-600">{comparisons.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">تحسن الأداء</p>
              <p className="text-3xl font-bold text-green-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Better').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">تراجع الأداء</p>
              <p className="text-3xl font-bold text-red-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Worse').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">أداء مختلط</p>
              <p className="text-3xl font-bold text-yellow-600">
                {comparisons.filter(c => c.verdict?.overallResult === 'Mixed').length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Comparisons Table */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            نتائج المقارنة ({comparisons.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : comparisons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GitCompare size={48} className="mx-auto mb-4 text-gray-300" />
              {period1Start && period2Start 
                ? 'لا توجد بيانات للمقارنة' 
                : 'الرجاء تحديد الفترتين للمقارنة'}
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {comparisons.map((comparison, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  {/* Rider Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{comparison.riderName}</h3>
                      <p className="text-sm text-gray-500">رقم العمل: {comparison.workingId}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                      getVerdictColor(comparison.verdict?.overallResult)
                    }`}>
                      {comparison.verdict?.overallResult === 'Better' ? '✓ تحسن' :
                       comparison.verdict?.overallResult === 'Worse' ? '✗ تراجع' :
                       comparison.verdict?.overallResult === 'Mixed' ? '⚡ مختلط' : '= ثابت'}
                    </span>
                  </div>

                  {/* Verdict Summary */}
                  {comparison.verdict?.summary && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{comparison.verdict.summary}</p>
                    </div>
                  )}

                  {/* Comparison Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Working Days */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">أيام العمل</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-blue-600">{comparison.period1?.workingDays}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-purple-600">{comparison.period2?.workingDays}</span>
                      </div>
                      <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-bold ${
                        getChangeColor(comparison.comparison?.workingDaysDifference)
                      }`}>
                        {getChangeIcon(comparison.comparison?.workingDaysDifference)}
                        {comparison.comparison?.workingDaysChangePercent?.toFixed(1)}%
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">الطلبات المقبولة</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-blue-600">{comparison.period1?.totalAcceptedOrders}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-purple-600">{comparison.period2?.totalAcceptedOrders}</span>
                      </div>
                      <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-bold ${
                        getChangeColor(comparison.comparison?.ordersDifference)
                      }`}>
                        {getChangeIcon(comparison.comparison?.ordersDifference)}
                        {comparison.comparison?.ordersChangePercent?.toFixed(1)}%
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">معدل الإنجاز</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-blue-600">{comparison.period1?.completionRate?.toFixed(1)}%</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-purple-600">{comparison.period2?.completionRate?.toFixed(1)}%</span>
                      </div>
                      <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-bold ${
                        getChangeColor(comparison.comparison?.completionRateDifference)
                      }`}>
                        {getChangeIcon(comparison.comparison?.completionRateDifference)}
                        {comparison.comparison?.completionRateChangePercent?.toFixed(1)}%
                      </div>
                    </div>

                    {/* Performance Score */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">معدل الأداء</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-blue-600">{comparison.period1?.performanceScore?.toFixed(1)}%</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-purple-600">{comparison.period2?.performanceScore?.toFixed(1)}%</span>
                      </div>
                      <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-bold ${
                        getChangeColor(comparison.comparison?.performanceScoreDifference)
                      }`}>
                        {getChangeIcon(comparison.comparison?.performanceScoreDifference)}
                        {comparison.comparison?.performanceScoreChangePercent?.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  {comparison.keyInsights && comparison.keyInsights.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold text-sm text-gray-700 mb-2">💡 نقاط رئيسية:</h4>
                      <div className="space-y-1">
                        {comparison.keyInsights.map((insight, i) => (
                          <p key={i} className="text-xs text-gray-600 pr-4">• {insight}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {comparison.recommendations && comparison.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-bold text-sm text-gray-700 mb-2">📋 التوصيات:</h4>
                      <div className="space-y-1">
                        {comparison.recommendations.map((rec, i) => (
                          <p key={i} className="text-xs text-blue-600 pr-4">• {rec}</p>
                        ))}
                      </div>
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