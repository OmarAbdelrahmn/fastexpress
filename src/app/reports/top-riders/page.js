'use client';

import { useState, useEffect } from 'react';
import { Award, Search, Trophy, Medal } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';

export default function TopRidersPage() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topCount, setTopCount] = useState(10);
  const [companyFilter, setCompanyFilter] = useState('');
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

  const loadReport = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء تحديد تاريخ البداية والنهاية' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.post(API_ENDPOINTS.REPORTS.TOP_RIDERS_YEARLY, {
        startDate,
        endDate,
        topCount,
        companyFilter: companyFilter || null,
        sortBy: 0, // TotalOrders
        includeAllCompanies: true,
        minimumShifts: 5
      });
      setReport(data);
      setMessage({ type: 'success', text: 'تم تحميل التقرير بنجاح' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل التقرير' });
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <span className="text-gray-600 font-bold">#{rank}</span>;
  };

  const getPerformanceColor = (grade) => {
    switch (grade) {
      case 'Exceptional': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Average': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'BelowAverage': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="أفضل المناديب"
        subtitle="ترتيب وتحليل أداء أفضل المناديب"
        icon={Award}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            type="date"
            label="من تاريخ"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            type="date"
            label="إلى تاريخ"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <Input
            type="number"
            label="عدد المناديب"
            value={topCount}
            onChange={(e) => setTopCount(parseInt(e.target.value))}
            min="5"
            max="100"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الشركة (اختياري)</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الشركات</option>
              {companies.map((company, idx) => (
                <option key={idx} value={company.name}>{company.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReport}
              disabled={loading || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              عرض التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="m-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">إجمالي المناديب</p>
                <p className="text-3xl font-bold text-blue-600">{report.totalRiders}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">إجمالي الورديات</p>
                <p className="text-3xl font-bold text-purple-600">{report.totalShifts}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-green-600">{report.totalOrders}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">الفترة</p>
                <p className="text-sm font-bold text-gray-600">
                  {report.startDate} - {report.endDate}
                </p>
              </div>
            </Card>
          </div>

          {/* Top Riders Table */}
          <Card title={`أفضل ${report.topRiders?.length || 0} مندوب`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الترتيب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المندوب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشركة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الورديات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الإنجاز</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الأداء</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.topRiders?.map((rider, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {getRankIcon(rider.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{rider.workingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{rider.riderNameAR}</p>
                          <p className="text-xs text-gray-500">{rider.riderNameEN}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{rider.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <p className="font-bold">{rider.totalShifts}</p>
                          <p className="text-xs text-gray-500">
                            {rider.completedShifts}✓ {rider.incompleteShifts}⚠ {rider.failedShifts}✗
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <p className="font-bold text-green-600">{rider.totalAcceptedOrders}</p>
                          <p className="text-xs text-gray-500">
                            متوسط: {rider.averageOrdersPerShift.toFixed(1)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rider.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                          rider.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rider.completionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rider.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                          rider.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rider.performanceScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${
                          getPerformanceColor(rider.performanceGrade)
                        }`}>
                          {rider.performanceGrade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Company Breakdown */}
          {report.companyBreakdown?.companiesSummary && (
            <Card title="توزيع الشركات">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.companyBreakdown.companiesSummary.map((company, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg">{company.companyName}</h4>
                      <span className="text-sm font-bold text-blue-600">
                        {company.companyPerformanceScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">إجمالي المناديب</p>
                        <p className="font-bold">{company.totalRiders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">الورديات</p>
                        <p className="font-bold">{company.totalShifts}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">الطلبات</p>
                        <p className="font-bold text-green-600">{company.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">المتميزون</p>
                        <p className="font-bold text-purple-600">{company.topPerformersCount}</p>
                      </div>
                    </div>
                    {company.topPerformer && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-500 mb-1">الأفضل أداءً:</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{company.topPerformer.riderNameAR}</p>
                          <div className="flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={16} />
                            <span className="text-sm font-bold">
                              {company.topPerformer.totalAcceptedOrders} طلب
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}