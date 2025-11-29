'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, TrendingUp, TrendingDown, Users } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';

export default function CompareCompanyPage() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [comparison, setComparison] = useState(null);
  const [period1Start, setPeriod1Start] = useState('');
  const [period1End, setPeriod1End] = useState('');
  const [period2Start, setPeriod2Start] = useState('');
  const [period2End, setPeriod2End] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: 'error', text: 'الرجاء اختيار شركة' });
      return;
    }
    if (!period1Start || !period1End || !period2Start || !period2End) {
      setMessage({ type: 'error', text: 'الرجاء تحديد جميع التواريخ' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
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
      setComparison(data);
      setMessage({ type: 'success', text: 'تم تحميل المقارنة بنجاح' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل المقارنة' });
      setComparison(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="مقارنة الشركات"
        subtitle="مقارنة أداء الشركة بين فترتين زمنيتين"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">اختر الشركة</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر شركة</option>
            {companies.map((company, idx) => (
              <option key={idx} value={company.name}>{company.name}</option>
            ))}
          </select>
        </div>

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
            disabled={loading || !selectedCompany || !period1Start || !period1End || !period2Start || !period2End}
            loading={loading}
            className="w-full"
          >
            <Search size={18} />
            مقارنة الفترات
          </Button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="m-6 space-y-6">
          {/* Company Header */}
          <Card>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{comparison.companyName}</h2>
              <p className="text-lg text-gray-600">الاتجاه العام: 
                <span className={`font-bold mr-2 ${
                  comparison.overallTrend === 'Improving' ? 'text-green-600' :
                  comparison.overallTrend === 'Declining' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {comparison.overallTrend === 'Improving' ? '📈 تحسن' :
                  comparison.overallTrend === 'Declining' ? '📉 تراجع' : '➡️ ثابت'}
                </span>
              </p>
            </div>
          </Card>

          {/* Comparison Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Working Days */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">أيام العمل</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.workingDays}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.workingDays}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${
                  getChangeColor(comparison.comparison?.workingDaysDifference)
                }`}>
                  {getChangeIcon(comparison.comparison?.workingDaysDifference)}
                  {comparison.comparison?.workingDaysChangePercent?.toFixed(1)}%
                </div>
              </div>
            </Card>

            {/* Accepted Orders */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">الطلبات المقبولة</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.totalAcceptedOrders}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.totalAcceptedOrders}</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${
                  getChangeColor(comparison.comparison?.ordersDifference)
                }`}>
                  {getChangeIcon(comparison.comparison?.ordersDifference)}
                  {comparison.comparison?.ordersChangePercent?.toFixed(1)}%
                </div>
              </div>
            </Card>

            {/* Completion Rate */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">معدل الإنجاز</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.completionRate?.toFixed(1)}%</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.completionRate?.toFixed(1)}%</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${
                  getChangeColor(comparison.comparison?.completionRateDifference)
                }`}>
                  {getChangeIcon(comparison.comparison?.completionRateDifference)}
                  {comparison.comparison?.completionRateChangePercent?.toFixed(1)}%
                </div>
              </div>
            </Card>

            {/* Performance Score */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">معدل الأداء</p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-blue-600 font-bold">{comparison.period1?.performanceScore?.toFixed(1)}%</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg text-purple-600 font-bold">{comparison.period2?.performanceScore?.toFixed(1)}%</span>
                </div>
                <div className={`flex items-center justify-center gap-1 text-sm font-bold ${
                  getChangeColor(comparison.comparison?.performanceScoreDifference)
                }`}>
                  {getChangeIcon(comparison.comparison?.performanceScoreDifference)}
                  {comparison.comparison?.performanceScoreChangePercent?.toFixed(1)}%
                </div>
              </div>
            </Card>
          </div>

          {/* Top Improved Riders */}
          {comparison.topImprovedRiders && comparison.topImprovedRiders.length > 0 && (
            <Card title="🏆 أفضل المناديب تحسناً">
              <div className="space-y-3">
                {comparison.topImprovedRiders.slice(0, 5).map((rider, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-green-600">#{idx + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800">{rider.riderName}</p>
                        <p className="text-sm text-gray-500">رقم العمل: {rider.workingId}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-green-600">
                        {rider.comparison?.ordersChangePercent?.toFixed(1)}% ↑
                      </p>
                      <p className="text-xs text-gray-500">
                        {rider.period1?.totalAcceptedOrders} → {rider.period2?.totalAcceptedOrders}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Declined Riders */}
          {comparison.topDeclinedRiders && comparison.topDeclinedRiders.length > 0 && (
            <Card title="⚠️ المناديب الأكثر تراجعاً">
              <div className="space-y-3">
                {comparison.topDeclinedRiders.slice(0, 5).map((rider, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-red-600">#{idx + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800">{rider.riderName}</p>
                        <p className="text-sm text-gray-500">رقم العمل: {rider.workingId}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-red-600">
                        {rider.comparison?.ordersChangePercent?.toFixed(1)}% ↓
                      </p>
                      <p className="text-xs text-gray-500">
                        {rider.period1?.totalAcceptedOrders} → {rider.period2?.totalAcceptedOrders}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Detailed Metrics Grid */}
          <Card title="تفاصيل المقارنة الشاملة">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">الورديات المكتملة</p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{comparison.period1?.completedShifts}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">{comparison.period2?.completedShifts}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">الورديات غير المكتملة</p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{comparison.period1?.incompleteShifts}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">{comparison.period2?.incompleteShifts}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">الورديات الفاشلة</p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{comparison.period1?.failedShifts}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">{comparison.period2?.failedShifts}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">الطلبات المرفوضة</p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{comparison.period1?.totalRejectedOrders}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">{comparison.period2?.totalRejectedOrders}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">ساعات العمل</p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{comparison.period1?.totalWorkingHours?.toFixed(1)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">{comparison.period2?.totalWorkingHours?.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">الغرامات</p>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{comparison.period1?.totalPenaltyAmount?.toFixed(0)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-600">{comparison.period2?.totalPenaltyAmount?.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}