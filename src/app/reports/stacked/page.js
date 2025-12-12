'use client';

import { useState } from 'react';
import { Package, Search, Calendar } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import Modal from '@/components/Ui/Model';
import { useRouter } from "next/navigation";
import { useLanguage } from '@/lib/context/LanguageContext';

export default function StackedDeliveriesPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const router = useRouter();

  const loadReport = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: t('reports.comparison.pleaseSelectDates') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.STACKED,
        { startDate, endDate }
      );
      setReport(data);
      setMessage({ type: 'success', text: t('reports.reportLoadedSuccess') + ` - ${data.totalRiders} ${t('reports.riders')}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('reports.failedToLoadReports') });
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const viewRiderDetails = (rider) => {
    setSelectedRider(rider);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
  };

  // Set default dates (current month)
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('reports.stackedReport.title')}
        subtitle={t('reports.stackedReport.subtitle')}
        icon={Package}
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
            type="date"
            label={t('common.startDate')}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            type="date"
            label={t('common.endDate')}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={setCurrentMonth}
              className="w-full"
            >
              <Calendar size={18} />
              {t('common.currentMonth') || "Current Month"}
            </Button>
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
              {t('reports.generateReport')}
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
                <p className="text-gray-500 text-sm mb-2">{t('reports.period')}</p>
                <p className="text-sm font-bold text-purple-600">
                  {formatDate(report.startDate)}
                </p>
                <p className="text-xs text-gray-500">{t('common.to') || "to"}</p>
                <p className="text-sm font-bold text-purple-600">
                  {formatDate(report.endDate)}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('reports.totalRiders')}</p>
                <p className="text-3xl font-bold text-blue-600">{report.totalRiders}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">⚠️ {t('reports.stackedReport.totalStacked')}</p>
                <p className="text-3xl font-bold text-red-600">{report.totalStackedDeliveries}</p>
                <p className="text-xs text-red-500">{t('reports.stackedReport.shouldReduce')}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('reports.stackedReport.averageStacked')}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {report.averageStackedPerRider.toFixed(1)}
                </p>
                <p className="text-xs text-orange-500">{t('reports.stackedReport.perRider')}</p>
              </div>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card title={t('reports.stackedReport.performanceOverview')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">{t('reports.totalShifts')}</p>
                <p className="text-2xl font-bold">{report.totalShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.stackedReport.averageStackedPerShift')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {(report.totalStackedDeliveries / report.totalShifts).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">⚠️ {t('reports.stackedReport.maxStacked')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.max(...report.riderSummaries.map(r => r.totalStackedDeliveries))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reports.stackedReport.averagePercentage')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(report.riderSummaries.reduce((sum, r) => sum + r.totalStackedPercentage, 0) / report.riderSummaries.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Riders Table */}
          <Card title={t('reports.riderDetails')}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('reports.rider')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('reports.comparison.workingNumber')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('reports.stackedDeliveries')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('reports.shifts')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('reports.stackedReport.averageStackedPerShift')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('reports.stackedReport.maxStacked')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">%</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.riderSummaries
                    .sort((a, b) => b.totalStackedDeliveries - a.totalStackedDeliveries)
                    .map((rider, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {rider.riderName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          #{rider.workingId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-red-600 font-bold text-lg">
                            {rider.totalStackedDeliveries}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {rider.totalShifts}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold">
                            {rider.averageStackedPerShift.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <span className="text-red-600 font-bold">
                              {rider.maxStackedInDay}
                            </span>
                            {rider.maxStackedDate && (
                              <p className="text-xs text-gray-500">
                                {formatDate(rider.maxStackedDate)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${rider.totalStackedPercentage >= 40 ? 'bg-red-100 text-red-800' :
                            rider.totalStackedPercentage >= 20 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {rider.totalStackedPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => viewRiderDetails(rider)}
                              className="text-xs"
                            >
                              {t('reports.stackedReport.viewSummary')}
                            </Button>
                          </div>

                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title={`⚠️ ${t('reports.stackedReport.top5Stacked')}`}>
              <div className="space-y-2">
                {report.riderSummaries
                  .sort((a, b) => b.totalStackedDeliveries - a.totalStackedDeliveries)
                  .slice(0, 5)
                  .map((rider, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-l from-red-50 to-white rounded-lg border border-red-100">
                      <div>
                        <p className="font-bold text-gray-800">{rider.riderName}</p>
                        <p className="text-xs text-gray-500">#{rider.workingId}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-red-600">
                          {rider.totalStackedDeliveries}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rider.totalStackedPercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title={`📊 ${t('reports.stackedReport.performanceDistribution')}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">🔴 {t('reports.stackedReport.highStacked')} (≥ 8)</span>
                  <span className="font-bold text-red-600">
                    {report.riderSummaries.filter(r => r.averageStackedPerShift >= 8).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">🟠 {t('reports.stackedReport.mediumStacked')} (5-8)</span>
                  <span className="font-bold text-orange-600">
                    {report.riderSummaries.filter(r => r.averageStackedPerShift >= 5 && r.averageStackedPerShift < 8).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">🟢 {t('reports.stackedReport.lowStacked')} ({'<'} 5)</span>
                  <span className="font-bold text-green-600">
                    {report.riderSummaries.filter(r => r.averageStackedPerShift < 5).length}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600">⚠️ {t('reports.stackedReport.maxStackedPercentage')}</span>
                  <span className="font-bold text-red-600">
                    {Math.max(...report.riderSummaries.map(r => r.totalStackedPercentage)).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card title={`🎯 ${t('reports.stackedReport.evaluation')}`}>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('reports.stackedReport.overallPerformanceStatus')}</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {report.averageStackedPerRider < 3 ? `✅ ${t('reports.stackedReport.excellent')}` :
                      report.averageStackedPerRider < 5 ? `⚠️ ${t('reports.stackedReport.acceptable')}` :
                        report.averageStackedPerRider < 8 ? `🔴 ${t('reports.stackedReport.needsImprovement')}` :
                          `🚨 ${t('reports.stackedReport.critical')}`}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {report.averageStackedPerRider < 3 && (
                    <p className="text-green-600 p-2 bg-green-50 rounded">✓ {t('reports.stackedReport.analysis.lowStackedGood')}</p>
                  )}
                  {report.averageStackedPerRider >= 8 && (
                    <p className="text-red-600 p-2 bg-red-50 rounded">⚠ {t('reports.stackedReport.analysis.highStackedWarning')}</p>
                  )}
                  {report.totalStackedDeliveries >= 100 && (
                    <p className="text-orange-600 p-2 bg-orange-50 rounded">⚠ {t('reports.stackedReport.analysis.largeVolumeWarning')}</p>
                  )}
                  {Math.max(...report.riderSummaries.map(r => r.totalStackedPercentage)) >= 40 && (
                    <p className="text-red-600 p-2 bg-red-50 rounded">🚨 {t('reports.stackedReport.analysis.ridersHighPercentage')}</p>
                  )}
                </div>
                <div className="space-y-2 text-sm mt-4">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">{t('reports.avgShiftsPerRider')}</span>
                    <span className="font-bold">{(report.totalShifts / report.totalRiders).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">{t('reports.totalWorkingDays')}</span>
                    <span className="font-bold">{report.totalShifts}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Rider Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedRider ? `${t('reports.details')} ${selectedRider.riderName}` : t('reports.riderDetails')}
        size="lg"
      >
        {selectedRider && (
          <div className="space-y-6">
            {/* Rider Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">{t('reports.comparison.workingNumber')}</p>
                <p className="text-2xl font-bold text-blue-600">#{selectedRider.workingId}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">⚠️ {t('reports.stackedReport.totalStacked')}</p>
                <p className="text-2xl font-bold text-red-600">{selectedRider.totalStackedDeliveries}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">{t('reports.stackedReport.averageStackedPerShift')}</p>
                <p className="text-2xl font-bold text-orange-600">{selectedRider.averageStackedPerShift.toFixed(1)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">%</p>
                <p className="text-2xl font-bold text-purple-600">{selectedRider.totalStackedPercentage.toFixed(1)}%</p>
              </div>
            </div>

            {/* Performance Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">{t('reports.performanceDetails')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('reports.totalShifts')}:</span>
                  <span className="font-semibold">{selectedRider.totalShifts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('reports.stackedReport.maxStackedInDay')}:</span>
                  <span className="font-semibold text-red-600">{selectedRider.maxStackedInDay}</span>
                </div>
                {selectedRider.maxStackedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('reports.date')}:</span>
                    <span className="font-semibold">
                      {formatDate(selectedRider.maxStackedDate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">{t('reports.status')}:</span>
                  <span className={`font-bold ${selectedRider.averageStackedPerShift < 3 ? 'text-green-600' :
                    selectedRider.averageStackedPerShift < 5 ? 'text-blue-600' :
                      selectedRider.averageStackedPerShift < 8 ? 'text-orange-600' :
                        'text-red-600'
                    }`}>
                    {selectedRider.averageStackedPerShift < 3 ? `✅ ${t('reports.stackedReport.excellent')}` :
                      selectedRider.averageStackedPerShift < 5 ? `⚠️ ${t('reports.stackedReport.acceptable')}` :
                        selectedRider.averageStackedPerShift < 8 ? `🔴 ${t('reports.stackedReport.needsImprovement')}` :
                          `🚨 ${t('reports.stackedReport.critical')}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}