'use client';

import { useState } from 'react';
import { Calendar, Search, FileText, BarChart3 } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function YearlyReportsPage() {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [workingId, setWorkingId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const loadAllRiders = async () => {
    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setReports([]);

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.YEARLY_ALL,
        { year }
      );

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage({
          type: 'warning',
          text: `${t('reports.noYearlyReports')} ${year}`
        });
        setReports([]);
      } else {
        const reportsArray = Array.isArray(data) ? data : [data];
        setReports(reportsArray);
        setMessage({
          type: 'success',
          text: `${t('reports.loadedReports')} ${reportsArray.length}`
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setReports([]);
      setMessage({
        type: 'error',
        text: t('reports.failedToLoadReports')
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSingleRider = async () => {
    if (!workingId) {
      setMessage({ type: 'error', text: t('reports.pleaseEnterWorkingId') });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setReports([]);

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.YEARLY(workingId),
        { year }
      );

      if (!data) {
        setMessage({
          type: 'warning',
          text: `${t('reports.noDataForRider')} #${workingId} ${t('reports.inYear')} ${year}`
        });
        setReports([]);
      } else {
        setReports([data]);
        setMessage({ type: 'success', text: t('reports.reportLoadedSuccess') });
      }
    } catch (error) {
      console.error('Error:', error);
      setReports([]);
      setMessage({
        type: 'error',
        text: `${t('reports.failedToLoadRiderReport')} #${workingId}`
      });
    } finally {
      setLoading(false);
    }
  };
  const viewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const monthNames = locale === 'ar' ? [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ] : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('reports.yearlyReports')}
        subtitle={t('reports.yearlyReportsSubtitle')}
        icon={Calendar}
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
          <Input
            type="number"
            label={t('reports.year')}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
          />

          <Input
            type="text"
            label={t('reports.workingIdOptional')}
            value={workingId}
            onChange={(e) => setWorkingId(e.target.value)}
            placeholder={t('reports.searchSpecificRider')}
          />

          <div className="flex items-end">
            <Button
              variant="blue"
              onClick={loadAllRiders}
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              <FileText size={18} />
              {t('reports.allRiders')}
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadSingleRider}
              disabled={loading || !workingId}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              {t('common.search')}
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            {t('reports.yearlyReports')} - {year} ({reports.length} {t('reports.report')})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              {t('common.noData')}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.riderName')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.workingDays')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.acceptedOrders')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.rejectedOrders')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.workingHours')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('reports.performanceRate')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{report.workingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.riderName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.totalWorkingDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                      {report.totalAcceptedOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                      {report.totalRejectedOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.totalWorkingHours.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.averagePerformanceScore >= 90 ? 'bg-green-100 text-green-800' :
                        report.averagePerformanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {report.averagePerformanceScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        onClick={() => viewDetails(report)}
                        className="text-sm"
                      >
                        {t('common.details')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('reports.yearlyReportDetails')}
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('reports.riderName')}</p>
                <p className="text-lg font-bold">{selectedReport.riderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('riders.workingId')}</p>
                <p className="text-lg font-bold">{selectedReport.workingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.year')}</p>
                <p className="text-lg font-bold">{selectedReport.year}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold mb-3">{t('reports.performanceStats')}</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('reports.workingDays')}</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedReport.totalWorkingDays}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.completedShifts')}</p>
                  <p className="text-2xl font-bold text-green-600">{selectedReport.completedShifts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.incompleteShifts')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{selectedReport.incompleteShifts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.failedShifts')}</p>
                  <p className="text-2xl font-bold text-red-600">{selectedReport.failedShifts}</p>
                </div>
              </div>
            </div>

            {/* Monthly Breakdowns */}
            {selectedReport.monthlyBreakdowns && selectedReport.monthlyBreakdowns.length > 0 && (
              <div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  {t('reports.monthlyDistribution')}
                </h4>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {selectedReport.monthlyBreakdowns.map((monthly, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-blue-600">{monthNames[monthly.month - 1]}</span>
                        <span className="text-sm font-bold">{monthly.performanceScore.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('reports.workingDays')}:</span>
                          <span className="font-medium">{monthly.workingDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('reports.acceptedOrders')}:</span>
                          <span className="font-medium text-green-600">{monthly.totalAcceptedOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('reports.rejectedOrders')}:</span>
                          <span className="font-medium text-red-600">{monthly.totalRejectedOrders}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Breakdowns */}
            {selectedReport.yearlyCompanyBreakdowns && selectedReport.yearlyCompanyBreakdowns.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">{t('reports.companyDistribution')}</h4>
                <div className="space-y-2">
                  {selectedReport.yearlyCompanyBreakdowns.map((company, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{company.companyName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{t('reports.days')}: {company.totalWorkingDays}</span>
                        <span className="text-sm text-green-600">{t('reports.orders')}: {company.totalAcceptedOrders}</span>
                        <span className="text-sm font-bold">{company.averagePerformanceScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}