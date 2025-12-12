'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, TrendingUp, Users, AlertCircle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import ExportButtons from '@/components/Ui/ExportButtons';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CompanyPerformancePage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false);

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
    if (!selectedCompany || !startDate || !endDate) {
      setMessage({ type: 'error', text: t('reports.pleaseSelectAllFields') });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setReport(null);


    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.COMPANY_PERFORMANCE,
        { companyName: selectedCompany, startDate, endDate }
      );

      if (!data) {
        setMessage({
          type: 'warning',
          text: `${t('reports.noDataForCompany')} ${selectedCompany} ${t('reports.inPeriod')}`
        });
        setReport(null);
      } else {
        setReport(data);
        setMessage({ type: 'success', text: t('reports.reportLoadedSuccess') });
      }
    } catch (error) {
      console.error('Error:', error);
      setReport(null);
      setMessage({
        type: 'error',
        text: t('reports.failedToLoadReports')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader 
        title={t('reports.companyPerformance')}
        subtitle={t('reports.companyPerformanceDesc')}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('companies.company')}</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('reports.selectCompany')}</option>
              {companies.map((company, idx) => (
                <option key={idx} value={company.name}>{company.name}</option>
              ))}
            </select>
          </div>

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

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReport}
              disabled={loading || !selectedCompany || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              {t('reports.showReport')}
            </Button>
          </div>
        </div>
      </div>
      {!loading && !report && hasSearched && (
        <div className="m-6 bg-white rounded-xl shadow-md p-12">
          <div className="text-center space-y-4">
            <AlertCircle size={64} className="mx-auto text-orange-400" />
            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {t('common.noData')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('reports.noReportForCompany')} {selectedCompany}
              </p>
              <p className="text-sm text-gray-400">
                {t('reports.ensureShiftsExist')} {startDate} {t('common.to')} {endDate}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Report Display */}
      {report && (

        <div className="m-6 space-y-6">
          <div className="m-6 flex justify-end">
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('reports.dailyTarget')}</p>
                <p className="text-3xl font-bold text-blue-600">{report.dailyOrderTarget}</p>
                <p className="text-xs text-gray-500 mt-1">{t('reports.ordersPerDay')}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('reports.expectedOrders')}</p>
                <p className="text-3xl font-bold text-purple-600">{report.expectedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">{t('reports.duringPeriod')}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('reports.acceptedOrders')}</p>
                <p className="text-3xl font-bold text-green-600">{report.totalAcceptedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">{t('reports.executedOrders')}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('reports.performanceRate')}</p>
                <p className={`text-3xl font-bold ${report.overallPerformanceScore >= 90 ? 'text-green-600' :
                  report.overallPerformanceScore >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {report.overallPerformanceScore.toFixed(1)}%
                </p>
              </div>
            </Card>
          </div>

          {/* Performance Details */}
          <Card title={t('reports.performanceDetails')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">{t('reports.workingDays')}</p>
                <p className="text-2xl font-bold">{report.totalWorkingDays}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.completedShifts')}</p>
                <p className="text-2xl font-bold text-green-600">{report.completedShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.incompleteShifts')}</p>
                <p className="text-2xl font-bold text-yellow-600">{report.incompleteShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.failedShifts')}</p>
                <p className="text-2xl font-bold text-red-600">{report.failedShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.rejectedOrders')}</p>
                <p className="text-2xl font-bold text-red-600">{report.totalRejectedOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.completionRate')}</p>
                <p className="text-2xl font-bold">
                  {((report.totalAcceptedOrders / report.expectedOrders) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.rejectionRate')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {((report.totalRejectedOrders / (report.totalAcceptedOrders + report.totalRejectedOrders)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Rider Performances */}
          <Card title={`${t('reports.riderPerformance')} (${report.riderPerformances?.length || 0} ${t('riders.title')})`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.riderName')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.title')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.completed')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.acceptedOrders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.rejectedOrders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.performanceRate')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.riderPerformances?.map((rider, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{rider.workingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.riderName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.totalShifts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600">{rider.completedShifts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {rider.totalAcceptedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                        {rider.totalRejectedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                          rider.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {rider.performanceScore.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}