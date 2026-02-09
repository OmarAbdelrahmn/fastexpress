'use client';

import { useState } from 'react';
import { Trophy, Award, Medal, TrendingUp, CheckCircle, Users, Calendar } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function TopRidersMonthlyPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    topCount: 10,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setReportData(null);

    let safeYear = parseInt(form.year, 10);
    if (isNaN(safeYear)) safeYear = new Date().getFullYear();

    let safeMonth = parseInt(form.month, 10);
    if (isNaN(safeMonth) || safeMonth < 1 || safeMonth > 12) {
      safeMonth = new Date().getMonth() + 1;
    }

    let safeTopCount = parseInt(form.topCount, 10);
    if (isNaN(safeTopCount) || safeTopCount < 1) safeTopCount = 10;

    try {
      const result = await ApiService.get(API_ENDPOINTS.REPORTS.TOP_RIDERS_MONTHLY, {
        year: safeYear,
        month: safeMonth,
        topCount: safeTopCount,
      });

      if (result && result.topRiders && result.topRiders.length > 0) {
        setReportData(result);
        setMessage({
          type: 'success',
          text: `${t('reports.loadedReports')} ${result.topRiders.length} ${t('riders.title')}`
        });
      } else {
        setReportData(null);
        setMessage({
          type: 'warning',
          text: t('reports.noReportsForPeriod')
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setReportData(null);
      setMessage({
        type: 'error',
        text: error.message || t('reports.failedToLoadReports')
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'Exceptional': 'bg-purple-100 text-purple-800',
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <Award className="text-blue-500" size={20} />;
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('reports.topRidersMonthly')}
        subtitle={t('reports.topRidersMonthlyDesc')}
        icon={Trophy}
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

      {/* Form */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          {t('reports.searchCriteria')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label={t('reports.year')}
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) || '' })}
              required
            />
            <Input
              label={t('reports.month')}
              type="number"
              min="1"
              max="12"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
            />
            <Input
              label={t('reports.ridersCount')}
              type="number"
              min="1"
              max="50"
              value={form.topCount}
              onChange={(e) => setForm({ ...form, topCount: parseInt(e.target.value, 10) || 10 })}
              placeholder={t('common.default') + ": 10"}
            />
            <div className="flex items-end">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                <Trophy size={18} />
                {t('reports.showRanking')}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {reportData && reportData.topRiders && reportData.topRiders.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="m-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-2">{t('reports.totalRiders')}</p>
                <p className="text-3xl font-bold text-blue-600">{reportData.totalRiders}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-2">{t('reports.totalShifts')}</p>
                <p className="text-3xl font-bold text-purple-600">{reportData.totalShifts}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-2">{t('reports.totalOrders')}</p>
                <p className="text-3xl font-bold text-green-600">{reportData.totalOrders}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-2">{t('reports.averagePerformance')}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {(reportData.topRiders.reduce((sum, r) => sum + r.performanceScore, 0) / reportData.topRiders.length).toFixed(2)}
                </p>
              </div>
            </Card>
          </div>

          {/* Top 3 Podium */}
          {reportData.topRiders.length >= 3 && (
            <div className="m-6 grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <Card className="bg-gray-50 border-2 border-gray-300">
                <div className="text-center space-y-3">
                  <Medal className="text-gray-400 mx-auto" size={48} />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-lg font-semibold">{reportData.topRiders[1].riderNameAR}</p>
                    <p className="text-sm text-gray-600">{t('riders.workingId')}: {reportData.topRiders[1].workingId}</p>
                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs mt-2">
                      {reportData.topRiders[1].companyName}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.score')}</p>
                    <p className="text-2xl font-bold text-gray-700">{reportData.topRiders[1].performanceScore.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.orders')}</p>
                    <p className="text-xl font-bold text-gray-700">{reportData.topRiders[1].totalAcceptedOrders}</p>
                  </div>
                </div>
              </Card>

              {/* 1st Place */}
              <Card className="bg-yellow-50 border-4 border-yellow-400 transform scale-105">
                <div className="text-center space-y-3">
                  <Trophy className="text-yellow-500 mx-auto" size={64} />
                  <div>
                    <p className="text-4xl font-bold text-yellow-600">1</p>
                    <p className="text-xl font-bold">{reportData.topRiders[0].riderNameAR}</p>
                    <p className="text-sm text-gray-600">{t('riders.workingId')}: {reportData.topRiders[0].workingId}</p>
                    <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-sm mt-2 font-medium">
                      {reportData.topRiders[0].companyName}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.score')}</p>
                    <p className="text-3xl font-bold text-yellow-600">{reportData.topRiders[0].performanceScore.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.orders')}</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.topRiders[0].totalAcceptedOrders}</p>
                  </div>
                </div>
              </Card>

              {/* 3rd Place */}
              <Card className="bg-orange-50 border-2 border-orange-300">
                <div className="text-center space-y-3">
                  <Medal className="text-orange-600 mx-auto" size={48} />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-lg font-semibold">{reportData.topRiders[2].riderNameAR}</p>
                    <p className="text-sm text-gray-600">{t('riders.workingId')}: {reportData.topRiders[2].workingId}</p>
                    <span className="inline-block px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-xs mt-2">
                      {reportData.topRiders[2].companyName}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.score')}</p>
                    <p className="text-2xl font-bold text-orange-600">{reportData.topRiders[2].performanceScore.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">{t('reports.orders')}</p>
                    <p className="text-xl font-bold text-orange-600">{reportData.topRiders[2].totalAcceptedOrders}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Company Breakdown */}
          {reportData.companyBreakdown && reportData.companyBreakdown.companiesSummary && (
            <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white">{t('reports.companyPerformance')}</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportData.companyBreakdown.companiesSummary.map((company, idx) => (
                    <Card key={idx} className="border-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-gray-800">{company.companyName}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(company.topPerformer?.performanceGrade)}`}>
                            {company.companyPerformanceScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600 text-xs">{t('riders.title')}</p>
                            <p className="font-bold">{company.totalRiders}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600 text-xs">{t('shifts.title')}</p>
                            <p className="font-bold">{company.totalShifts}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600 text-xs">{t('reports.orders')}</p>
                            <p className="font-bold">{company.totalOrders}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-600 text-xs">{t('reports.dailyTarget')}</p>
                            <p className="font-bold">{company.dailyOrderTarget}</p>
                          </div>
                        </div>
                        {company.topPerformer && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-600 mb-1">{t('reports.bestPerformer')}:</p>
                            <p className="font-semibold text-sm">{company.topPerformer.riderNameAR}</p>
                            <p className="text-xs text-gray-500">({company.topPerformer.workingId})</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Full Ranking Table */}
          <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white">{t('reports.fullRanking')} ({reportData.topRiders.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.rank')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.name')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('companies.company')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.score')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.rating')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.orders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.rejectionRate')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.workingHours')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.topRiders.map((rider) => (
                    <tr key={rider.riderId} className={`border-2 ${getMedalColor(rider.rank)} hover:bg-gray-50`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getMedalIcon(rider.rank)}
                          <span className="text-lg font-bold">{getRankBadge(rider.rank)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{rider.workingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold">{rider.riderNameAR}</p>
                          <p className="text-xs text-gray-500">{rider.riderNameEN}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {rider.companyName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-purple-600">{rider.performanceScore.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(rider.performanceGrade)}`}>
                          {t('reports.grades.' + rider.performanceGrade?.toLowerCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {rider.totalAcceptedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${rider.rejectionRate > 20 ? 'text-red-600' : rider.rejectionRate > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {typeof rider.rejectionRate === 'number' ? rider.rejectionRate.toFixed(2) : rider.rejectionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.totalWorkingHours ? Number(rider.totalWorkingHours).toFixed(2) : '0.00'}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="m-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('reports.generalStats')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{t('reports.averageOrders')}</p>
                <p className="text-2xl font-bold">
                  {(reportData.topRiders.reduce((sum, r) => sum + r.totalAcceptedOrders, 0) / reportData.topRiders.length).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{t('reports.averageWorkingHours')}</p>
                <p className="text-2xl font-bold">
                  {(reportData.topRiders.reduce((sum, r) => sum + r.totalWorkingHours, 0) / reportData.topRiders.length).toFixed(2)}h
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{t('reports.highestScore')}</p>
                <p className="text-2xl font-bold">
                  {Math.max(...reportData.topRiders.map(r => r.performanceScore)).toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">{t('reports.averageRejectionRate')}</p>
                <p className="text-2xl font-bold">
                  {(reportData.topRiders.reduce((sum, r) => sum + r.rejectionRate, 0) / reportData.topRiders.length).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Data Message */}
      {!loading && reportData && reportData.topRiders && reportData.topRiders.length === 0 && (
        <div className="m-6 bg-white rounded-xl shadow-md p-12">
          <div className="text-center text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
            <p>{t('reports.noReportsForPeriod')}</p>
          </div>
        </div>
      )}
    </div>
  );
}