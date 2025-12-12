'use client';

import { useState } from 'react';
import { Calendar, Search, FileText } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CustomRangeReportsPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const loadAllRiders = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: t('reports.pleaseSelectDates') });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setReports([]);

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.CUSTOM_PERIOD_ALL,
        { startDate, endDate }
      );

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage({
          type: 'warning',
          text: `${t('reports.noReportsFrom')} ${startDate} ${t('common.to')} ${endDate}`
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
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: t('reports.pleaseSelectDates') });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setReports([]);

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.CUSTOM_PERIOD(workingId),
        { startDate, endDate }
      );

      if (!data) {
        setMessage({
          type: 'warning',
          text: `${t('reports.noDataForRider')} #${workingId} ${t('reports.inPeriod')}`
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
        text: t('reports.failedToLoadReports')
      });
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('reports.customReports')}
        subtitle={t('reports.customReportsSubtitle')}
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
              disabled={loading || !startDate || !endDate}
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
              disabled={loading || !workingId || !startDate || !endDate}
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
            {t('reports.customReports')}
            {startDate && endDate && ` - ${t('common.from')} ${startDate} ${t('common.to')} ${endDate}`}
            ({reports.length} {t('reports.report')})
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.overallPerformanceScore >= 90 ? 'bg-green-100 text-green-800' :
                        report.overallPerformanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {report.overallPerformanceScore.toFixed(1)}%
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
        title={t('reports.reportDetails')}
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('reports.riderName')}</p>
                <p className="text-lg font-bold">{selectedReport.riderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('riders.workingId')}</p>
                <p className="text-lg font-bold">{selectedReport.workingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.from')}</p>
                <p className="text-lg font-bold">{selectedReport.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('common.to')}</p>
                <p className="text-lg font-bold">{selectedReport.endDate}</p>
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

            {/* Company Breakdowns */}
            {selectedReport.companyBreakdowns && selectedReport.companyBreakdowns.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">{t('reports.companyDistribution')}</h4>
                <div className="space-y-2">
                  {selectedReport.companyBreakdowns.map((company, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{company.companyName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{t('reports.days')}: {company.workingDays}</span>
                        <span className="text-sm text-green-600">{t('reports.orders')}: {company.totalAcceptedOrders}</span>
                        <span className="text-sm font-bold">{company.performanceScore.toFixed(1)}%</span>
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