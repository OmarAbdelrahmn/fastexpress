'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function RiderStackedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workingId = params?.workingId;
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load report on component mount and when workingId changes
  const loadReport = useCallback(async () => {
    if (!workingId) {
      setMessage({ type: 'error', text: t('stackedReport.workingIdMissing') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.STACKED(workingId),
        { params: { year, month } }
      );

      setReport(data);
      setMessage({ type: 'success', text: t('reports.reportLoadedSuccess') });
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.response?.data?.message || error.message || t('reports.failedToLoadRiderReport');
      setMessage({ type: 'error', text: errorMessage });
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [workingId, year, month, t]);

  useEffect(() => {
    if (workingId) {
      loadReport();
    } else {
      setMessage({ type: 'error', text: t('stackedReport.workingIdMissingInLink') });
    }
  }, [workingId, loadReport, t]); // Added loadReport dependency, ensured by useCallback


  // Fallback if month keys don't exist, though usually frameworks handle date formatting better. 
  // Assuming keys might not exist, let's keep array index but maybe rely on standard logic or english fallbacks if needed.
  // Actually, checking previous files, month names might not be in generic locs.
  // But standard practice: use a formatter or just simple lookups.
  // For safety, I'll use the hardcoded names for now or try to use a safe localized approach if possible, but strict translation is safer with keys.
  // Wait, I don't recall seeing months in keys. Let's use `new Date().toLocaleDateString` for month name if possible, or leave as is if no keys.
  // The original code had hardcoded Arabic months. I should replace with localized version.
  const getMonthName = (m) => {
    const date = new Date(year, m - 1, 1);
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('stackedReport.riderReportTitle', { id: workingId })}
        subtitle={t('stackedReport.subtitleDetail')}
        icon={Package}
      />

      {/* Back Button */}
      <div className="m-6">
        <Button
          variant="outline"
          onClick={() => router.push('/reports/stacked')}
          className="flex items-center gap-2"
        >
          {language === 'ar' ? <ArrowRight size={18} /> : <ArrowRight size={18} className="rotate-180" />}
          {t('stackedReport.backToList')}
        </Button>
      </div>

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
            label={t('riders.workingId')}
            value={workingId}
            onChange={(e) => {
              const newWorkingId = e.target.value;
              if (newWorkingId) {
                router.push(`/reports/stacked/${newWorkingId}`);
              }
            }}
            placeholder={t('riders.enterWorkingId')}
          />
          <Input
            type="number"
            label={t('reports.year')}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
          />

          <Input
            type="number"
            label={t('reports.month')}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            min="1"
            max="12"
          />

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReport}
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              <Calendar size={18} />
              {t('stackedReport.updateReport')}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="m-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('stackedReport.rider')}</p>
                <p className="text-lg font-bold text-blue-600">{report.riderName}</p>
                <p className="text-sm text-gray-500">#{report.workingId}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('stackedReport.period')}</p>
                <p className="text-lg font-bold text-purple-600">
                  {getMonthName(report.month)} {report.year}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('stackedReport.totalStackedWarning')}</p>
                <p className="text-3xl font-bold text-red-600">{report.totalStackedDeliveries}</p>
                <p className="text-xs text-red-500">{t('stackedReport.shouldReduce')}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('stackedReport.averageStacked')}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {report.averageStackedPerShift.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">{t('stackedReport.perRider')}</p>
                {/* Note: 'perRider' key might mean 'for each rider' in list view, here it means per shift. 
                    Checking keys: 'averageStackedPerShift' key exists? 'avgStackedPerShift': 'متوسط التوصيلات لكل وردية' 
                    Wait, let's use t('stackedReport.perShift') if it exists or 'reports.perShift'.
                    In ar.json: "perRider": "لكل مندوب"
                    The card says "متوسط التكديس" (Average Stacked) then subtext "لكل وردية" (Per Shift).
                    Code previously reused 'averageStackedPerShift' for title AND value?
                    No, previous code: <p>متوسط التكديس</p> ... <p>لكل وردية</p>.
                    Let's use t('reports.perShift') if possible or check 'avgStackedPerShift' label context.
                    'avgStackedPerShift' in my implementation plan is "متوسط التوصيلات لكل وردية".
                    I'll use specific parts if available or generic.
                    Actually, I can just use "stackedReport.averageStackedPerShift" as the label since it contains "per shift".
                    But here it splits it.
                    I will use t('reports.perShift') if it exists, otherwise t('stackedReport.avgStackedPerShift') for the whole thing or hardcode 'Per Shift' logic.
                    Key 'perRider' is available. `perShift` is NOT explicitly available in recent additions.
                    But `averageStackedPerShift` key is "متوسط التكديس/وردية".
                    I'll change the UI slightly to use full label or add `perShift` key.
                    I'll add `perShift` to `stackedReport` via multi-replace if I really need or just render `t('stackedReport.avgStackedPerShift')` as title?
                    No, let's stick to the visual structure.
                    I will check ar.json for "perShift" or similar.
                    "shiftsStats" exists.
                    I will use t('stackedReport.avgStackedPerShift') for the title and remove the subtitle "per shift" if it repeats, or just add "perShift" to plan/impl.
                    Actually, checking existing keys:
                    "averageStacked": "متوسط التكديس",
                    "perRider": "لكل مندوب", (This was in stacked main report)
                    Here we need "Per Shift".
                    "averageStackedPerShift": "متوسط التكديس/وردية" (This key exists in stackedReport namespace).
                    I will use t('stackedReport.averageStackedPerShift') as the label.
                */}
                {/* Re-evaluating: Previous code: Title "متوسط التكديس", Value, Subtitle "لكل وردية". 
                     I will use t('stackedReport.averageStacked') for title.
                     For subtitle, I'll use t('reports.shift') if exists, or just leave it blank if self-explanatory, 
                     OR construct it.
                     Actually, I'll update the label to be clearer.
                 */}
                <p className="text-xs text-gray-500">{t('stackedReport.averageStackedPerShift')}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">{t('stackedReport.maxStacked')}</p>
                <p className="text-3xl font-bold text-red-600">{report.maxStackedInDay}</p>
                {report.maxStackedDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(report.maxStackedDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card title={t('stackedReport.performanceOverview')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">{t('reports.totalShifts')}</p>
                <p className="text-2xl font-bold">{report.totalShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('stackedReport.averageStacked')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {report.averageStackedPerShift.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('stackedReport.stackedPercentage')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {report.dailyBreakdown
                    ? ((report.dailyBreakdown.filter(d => d.stackedDeliveries > 0).length / report.dailyBreakdown.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('stackedReport.overallPerformanceStatus')}</p>
                <p className={`text-2xl font-bold ${report.averageStackedPerShift < 3 ? 'text-green-600' :
                  report.averageStackedPerShift < 5 ? 'text-blue-600' :
                    report.averageStackedPerShift < 8 ? 'text-orange-600' :
                      'text-red-600'
                  }`}>
                  {report.averageStackedPerShift < 3 ? '✅' :
                    report.averageStackedPerShift < 5 ? '⚠️' :
                      report.averageStackedPerShift < 8 ? '🔴' :
                        '🚨'}
                </p>
              </div>
            </div>
          </Card>

          {/* Daily Chart */}
          <Card title={t('stackedReport.dailyBreakdown')}>
            <div className="flex items-end justify-between gap-2 h-64 p-4">
              {report.dailyBreakdown?.map((day, idx) => {
                const maxStacked = Math.max(...report.dailyBreakdown.map(d => d.stackedDeliveries));
                const height = maxStacked > 0 ? (day.stackedDeliveries / maxStacked) * 100 : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-700">{day.stackedDeliveries}</p>
                      {day.stackedPercentage > 0 && (
                        <p className={`text-[10px] font-semibold ${day.stackedPercentage >= 40 ? 'text-red-600' :
                          day.stackedPercentage >= 20 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                          {day.stackedPercentage.toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${day.stackedDeliveries >= 10 ? 'bg-gradient-to-t from-red-500 to-red-300' :
                        day.stackedDeliveries >= 5 ? 'bg-gradient-to-t from-orange-500 to-orange-300' :
                          day.stackedDeliveries > 0 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                            'bg-gray-200'
                        }`}
                      style={{ height: `${height}%`, minHeight: day.stackedDeliveries > 0 ? '10px' : '5px' }}
                      title={`${day.date}: ${day.stackedDeliveries} ${t('stackedReport.stackedDeliveries')} ${t('common.from')} ${day.acceptedOrders}`}
                    />
                    <p className="text-[10px] text-gray-500">
                      {new Date(day.date).getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-red-500 to-red-300"></div>
                <span>{t('stackedReport.highStacked')} (≥10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-orange-500 to-orange-300"></div>
                <span>{t('stackedReport.mediumStacked')} (5-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-yellow-500 to-yellow-300"></div>
                <span>{t('stackedReport.lowStacked')} (1-4)</span>
              </div>
            </div>
          </Card>

          {/* Daily Details Table */}
          <Card title={t('stackedReport.dailyDetails')}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>{t('common.date')}</th>
                    <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>{t('stackedReport.day')}</th>
                    <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>{t('stackedReport.stackedDeliveries')}</th>
                    <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>{t('reports.acceptedOrders')}</th>
                    <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>{t('stackedReport.stackedPercentage')}</th>
                    <th className={`px-4 py-3 ${language === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500`}>{t('stackedReport.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.dailyBreakdown?.map((day, idx) => {
                    const dayDate = new Date(day.date);
                    const dayName = dayDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long' });

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {dayDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {dayName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-lg font-bold ${day.stackedDeliveries >= 10 ? 'text-red-600' :
                            day.stackedDeliveries >= 5 ? 'text-orange-600' :
                              day.stackedDeliveries > 0 ? 'text-yellow-600' :
                                'text-green-600'
                            }`}>
                            {day.stackedDeliveries}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {day.acceptedOrders}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${day.stackedPercentage >= 40 ? 'bg-red-100 text-red-800' :
                            day.stackedPercentage >= 20 ? 'bg-orange-100 text-orange-800' :
                              day.stackedPercentage > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {day.stackedPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {day.stackedDeliveries === 0 ? (
                            <span className="text-green-600">✅ {t('stackedReport.excellent')}</span>
                          ) : day.stackedDeliveries < 5 ? (
                            <span className="text-blue-600">⚠️ {t('stackedReport.acceptable')}</span>
                          ) : day.stackedDeliveries < 10 ? (
                            <span className="text-orange-600">🔴 {t('stackedReport.needsImprovement')}</span>
                          ) : (
                            <span className="text-red-600">🚨 {t('stackedReport.critical')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title={t('stackedReport.worst5Days')}>
              <div className="space-y-2">
                {report.dailyBreakdown
                  ?.sort((a, b) => b.stackedDeliveries - a.stackedDeliveries)
                  .slice(0, 5)
                  .map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">
                          {day.stackedDeliveries}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({day.stackedPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title={t('stackedReport.performanceRates')}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('stackedReport.avgAcceptedOrders')}</span>
                  <span className="font-bold">
                    {report.dailyBreakdown
                      ? (report.dailyBreakdown.reduce((sum, d) => sum + d.acceptedOrders, 0) / report.dailyBreakdown.length).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('stackedReport.avgStackedPercentage')}</span>
                  <span className="font-bold text-orange-600">
                    {report.dailyBreakdown
                      ? (report.dailyBreakdown.reduce((sum, d) => sum + d.stackedPercentage, 0) / report.dailyBreakdown.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('stackedReport.daysWithoutStacked')}</span>
                  <span className="font-bold text-green-600">
                    {report.dailyBreakdown?.filter(d => d.stackedDeliveries === 0).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('stackedReport.daysHighStacked')}</span>
                  <span className="font-bold text-red-600">
                    {report.dailyBreakdown?.filter(d => d.stackedDeliveries >= 10).length || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card title={t('stackedReport.evaluation')}>
              <div className="space-y-3">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('stackedReport.overallPerformanceStatus')}</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {report.averageStackedPerShift < 3 ? `✅ ${t('stackedReport.excellent')}` :
                      report.averageStackedPerShift < 5 ? `⚠️ ${t('stackedReport.acceptable')}` :
                        report.averageStackedPerShift < 8 ? `🔴 ${t('stackedReport.needsImprovement')}` :
                          `🚨 ${t('stackedReport.critical')}`}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {report.averageStackedPerShift < 3 && (
                    <p className="text-green-600 p-2 bg-green-50 rounded">✓ {t('stackedReport.analysis.lowStackedGood')}</p>
                  )}
                  {report.averageStackedPerShift >= 8 && (
                    <p className="text-red-600 p-2 bg-red-50 rounded">⚠ {t('stackedReport.analysis.highStackedWarning')}</p>
                  )}
                  {report.maxStackedInDay >= 15 && (
                    <p className="text-red-600 p-2 bg-red-50 rounded">{t('stackedReport.highStackedDaily')}</p>
                  )}
                  {report.dailyBreakdown?.filter(d => d.stackedDeliveries === 0).length >= report.dailyBreakdown?.length * 0.5 && (
                    <p className="text-green-600 p-2 bg-green-50 rounded">{t('stackedReport.halfDaysNoStacked')}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}