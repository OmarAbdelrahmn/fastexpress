'use client';

import { useState, useEffect } from 'react';
import { Trophy, Search, Download, Award, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function TopRidersCompanyPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const result = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      if (result) {
        setCompanies(result.map(c => c.name || c.companyName || c));
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadReports = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: t('reports.pleaseSelectDates') });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setData({});

    try {
      const result = await ApiService.get(
        API_ENDPOINTS.REPORTS.TOP_RIDERS_COMPANY,
        { Start: startDate, End: endDate }
      );

      if (!result || Object.keys(result).length === 0) {
        setMessage({
          type: 'warning',
          text: t('reports.noReportsForPeriod')
        });
        setData({});
      } else {
        setData(result);
        const totalRiders = Object.values(result).flat().length;
        setMessage({
          type: 'success',
          text: `${t('reports.loadedReports')} ${totalRiders} ${t('riders.title')} ${t('reports.from')} ${Object.keys(result).length} ${t('companies.title')}`
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setData({});
      setMessage({
        type: 'error',
        text: t('reports.failedToLoadReports')
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

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const allRiders = Object.entries(data).flatMap(([company, riders]) =>
    riders.map(rider => ({ ...rider, company }))
  );

  const filteredRiders = selectedCompany === 'all'
    ? allRiders
    : allRiders.filter(r => r.company === selectedCompany);



  const exportToCSV = () => {
    const csvContent = [
      [t('reports.rank'), t('riders.workingId'), t('common.name'), t('companies.company'), t('reports.score'), t('reports.rating'), t('reports.acceptedOrders'), t('reports.rejectedOrders'), t('reports.workingHours'), t('reports.rejectionRate')],
      ...filteredRiders.map(r => [
        r.rank,
        r.workingId,
        r.riderNameAR,
        r.companyName,
        r.performanceScore.toFixed(2),
        t('reports.grades.' + r.performanceGrade?.toLowerCase()),
        r.totalAcceptedOrders,
        r.totalRejectedOrders,
        r.totalWorkingHours,
        (typeof r.rejectionRate === 'number' ? r.rejectionRate.toFixed(2) : r.rejectionRate) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `top_riders_${startDate}_${endDate}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('reports.topRidersByCompany')}
        subtitle={t('reports.topRidersByCompanyDesc')}
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

      {/* Filters */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            type="date"
            label={t('common.from')}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            type="date"
            label={t('common.to')}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('companies.company')}</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('reports.allCompanies')}</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReports}
              disabled={loading || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              {t('reports.showReport')}
            </Button>
          </div>

          {filteredRiders.length > 0 && (
            <div className="flex items-end">
              <Button
                variant="success"
                onClick={exportToCSV}
                className="w-full"
              >
                <Download size={18} />
                {t('reports.exportCSV')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {allRiders.length > 0 && (
        <div className="m-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-2">{t('reports.totalRiders')}</p>
              <p className="text-3xl font-bold text-blue-600">{allRiders.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-2">{t('reports.totalOrders')}</p>
              <p className="text-3xl font-bold text-green-600">
                {allRiders.reduce((sum, r) => sum + r.totalAcceptedOrders, 0)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-2">{t('reports.averagePerformance')}</p>
              <p className="text-3xl font-bold text-purple-600">
                {(allRiders.reduce((sum, r) => sum + r.performanceScore, 0) / allRiders.length).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Riders Grid */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            {t('reports.topRiders')} ({filteredRiders.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
            {startDate && endDate
              ? t('reports.noReportsForPeriod')
              : t('reports.pleaseSelectPeriod')}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRiders.sort((a, b) => a.rank - b.rank).map((rider) => (
              <div key={rider.riderId} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getRankBadge(rider.rank)}</span>
                      <h3 className="text-xl font-bold text-gray-800">{rider.riderNameAR}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{rider.riderNameEN}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {rider.companyName}
                      </span>
                      <span className="text-gray-500 text-sm">{t('riders.workingId')}: {rider.workingId}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold text-center ${getGradeColor(rider.performanceGrade)}`}>
                    <div className="text-2xl">{rider.performanceScore.toFixed(2)}</div>
                    <div className="text-xs">{t('reports.grades.' + rider.performanceGrade?.toLowerCase())}</div>
                  </div>
                </div>

                {/* Achievements */}
                {rider.achievements && rider.achievements.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {rider.achievements.map((achievement, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {achievement}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">{t('reports.acceptedOrders')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{rider.totalAcceptedOrders}</p>
                    <p className="text-xs text-gray-500">{t('reports.average')}: {rider.averageOrdersPerShift}/{t('shifts.shift')}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-gray-600">{t('reports.rejectionRate')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{typeof rider.rejectionRate === 'number' ? rider.rejectionRate.toFixed(2) : rider.rejectionRate}%</p>
                    <p className="text-xs text-gray-500">{rider.totalRejectedOrders} {t('reports.rejected')}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600">{t('reports.workingHours')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{rider.totalWorkingHours ? Number(rider.totalWorkingHours).toFixed(2) : '0.00'}h</p>
                    <p className="text-xs text-gray-500">{rider.totalShifts} {t('shifts.title')}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">{t('reports.stacked')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{rider.totalStackedDeliveries}</p>
                    <p className="text-xs text-gray-500">{t('reports.average')}: {rider.averageStackedPerShift}/{t('shifts.shift')}</p>
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between text-sm pt-4 border-t">
                  <div className="text-center">
                    <p className="text-gray-600">{t('reports.completionRate')}</p>
                    <p className="font-bold text-green-600">{rider.completionRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">{t('reports.penalties')}</p>
                    <p className="font-bold text-red-600">{rider.totalPenalty}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">{t('reports.problematicShifts')}</p>
                    <p className="font-bold text-orange-600">{rider.problematicShiftsCount}</p>
                  </div>
                </div>

                {rider.isSubstitutionActive && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                    <span className="text-yellow-800 text-sm font-medium">🔄 {t('substitution.active')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}