'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Calendar, RefreshCcw, Search, Target, Users } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Card from '@/components/Ui/Card';
import Input from '@/components/Ui/Input';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const numberValue = (value) => Number(value) || 0;

const formatDate = (value) => {
  if (!value) return '-';
  return String(value).split('T')[0];
};

const getRiyadhMonth = () => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: 'numeric',
  });

  const parts = formatter.formatToParts(new Date());
  return {
    year: parts.find((part) => part.type === 'year')?.value || '',
    month: parts.find((part) => part.type === 'month')?.value || '',
  };
};

const compactParams = (params) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      cleaned[key] = String(value).trim();
    }
  });
  return cleaned;
};

export default function BelowMonthlyTargetPage() {
  const { locale, t } = useLanguage();
  const isRtl = locale === 'ar';
  const [filters, setFilters] = useState(getRiyadhMonth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');

  const labels = t('reports.belowMonthlyTarget');

  const filteredRiders = useMemo(() => {
    const riders = Array.isArray(report?.riders) ? report.riders : [];
    
    let result = riders;
    if (selectedCompany === 'hunger') {
      result = result.filter((rider) => (rider.companyName || '').toLowerCase().includes('hunger'));
    } else if (selectedCompany === 'keeta') {
      result = result.filter((rider) => {
        const name = (rider.companyName || '').toLowerCase();
        return name.includes('keeta') || name.includes('keta');
      });
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return result;

    return result.filter((rider) => {
      const riderName = locale === 'ar' ? rider.riderNameAR : rider.riderNameEN;
      return [
        riderName,
        rider.riderNameAR,
        rider.riderNameEN,
        rider.iqamaNo,
        rider.workingId,
        rider.companyName,
        rider.housingName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [locale, report, searchQuery, selectedCompany]);

  const ridersBelowTargetFilteredCount = useMemo(() => {
    const riders = Array.isArray(report?.riders) ? report.riders : [];
    if (selectedCompany === 'all') return report?.totalRidersBelowTarget ?? riders.length;
    
    return riders.filter((rider) => {
      const name = (rider.companyName || '').toLowerCase();
      if (selectedCompany === 'hunger') return name.includes('hunger');
      if (selectedCompany === 'keeta') return name.includes('keeta') || name.includes('keta');
      return true;
    }).length;
  }, [report, selectedCompany]);

  const totals = useMemo(() => {
    const riders = Array.isArray(report?.riders) ? report.riders : [];
    const companyFiltered = riders.filter((rider) => {
      if (selectedCompany === 'all') return true;
      const name = (rider.companyName || '').toLowerCase();
      if (selectedCompany === 'hunger') return name.includes('hunger');
      if (selectedCompany === 'keeta') return name.includes('keeta') || name.includes('keta');
      return true;
    });

    return companyFiltered.reduce(
      (acc, rider) => {
        acc.acceptedOrders += numberValue(rider.totalAcceptedOrders);
        acc.remainingToDate += numberValue(rider.remainingToTargetToDate);
        acc.remainingMonthly += numberValue(rider.remainingToMonthlyTarget);
        return acc;
      },
      { acceptedOrders: 0, remainingToDate: 0, remainingMonthly: 0 }
    );
  }, [report, selectedCompany]);

  const loadReport = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.RIDERS_BELOW_MONTHLY_TARGET,
        compactParams({
          year: filters.year,
          month: filters.month,
        })
      );
      setReport(data);
    } catch (err) {
      console.error('Below monthly target report error:', err);
      setReport(null);
      setError(err.message || labels.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ icon: Icon, title, value, tone }) => (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl md:text-3xl font-bold ${tone}`}>{value}</p>
        </div>
        <Icon className={tone} size={34} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        icon={Target}
      />

      <div className="mx-4 md:mx-8 my-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-xl leading-none">&times;</button>
          </div>
        )}

        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{labels.filtersTitle}</h2>
                <p className="text-sm text-gray-500">{labels.filtersHint}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Input
                label={labels.year}
                type="number"
                min="2000"
                max="2100"
                value={filters.year}
                onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
                placeholder={labels.yearPlaceholder}
              />
              <Input
                label={labels.month}
                type="number"
                min="1"
                max="12"
                value={filters.month}
                onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                placeholder={labels.monthPlaceholder}
              />
              <Button onClick={loadReport} loading={loading} className="h-10">
                <RefreshCcw size={16} />
                {labels.load}
              </Button>
            </div>
          </div>
        </Card>

        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                title={labels.totalRidersWorked}
                value={report.totalRidersWorked ?? 0}
                tone="text-blue-600"
              />
              <StatCard
                icon={AlertTriangle}
                title={labels.totalRidersBelowTarget}
                value={ridersBelowTargetFilteredCount}
                tone="text-red-600"
              />
              <StatCard
                icon={BarChart3}
                title={labels.elapsedDays}
                value={`${report.elapsedDays ?? 0}/${report.daysInMonth ?? 0}`}
                tone="text-indigo-600"
              />
              <StatCard
                icon={Target}
                title={labels.remainingToDate}
                value={totals.remainingToDate.toLocaleString()}
                tone="text-orange-600"
              />
            </div>

            <Card>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{labels.periodTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(report.startDate)} - {formatDate(report.endDate)}
                    {' '}
                    ({report.isCurrentMonth ? labels.currentMonth : labels.closedMonth})
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(report.companyTargets || [])
                    .filter((company) => {
                      if (selectedCompany === 'all') return true;
                      const name = (company.companyName || '').toLowerCase();
                      if (selectedCompany === 'hunger') return name.includes('hunger');
                      if (selectedCompany === 'keeta') return name.includes('keeta') || name.includes('keta');
                      return true;
                    })
                    .map((company) => (
                      <div key={company.companyId} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="font-bold text-gray-800">{company.companyName}</p>
                        <p className="text-sm text-gray-600">
                          {labels.monthlyTarget}: <span className="font-semibold">{company.monthlyTarget}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {labels.targetToDate}: <span className="font-semibold">{company.targetToDate}</span>
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{labels.ridersTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {labels.ridersSubtitle.replace('{{count}}', filteredRiders.length)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="all">{labels.allCompanies}</option>
                    <option value="hunger">{labels.hunger}</option>
                    <option value="keeta">{labels.keeta}</option>
                  </select>
                  <div className="relative w-full sm:w-80">
                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 text-gray-400`} size={18} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={labels.searchPlaceholder}
                      className={`w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y divide-gray-200 text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">{labels.rider}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">{labels.company}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">{labels.housing}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center">{labels.acceptedOrders}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center">{labels.targetToDate}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center">{labels.remainingToDate}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center">{labels.remainingMonthly}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center">{labels.shifts}</th>
                      <th className="px-4 py-3 font-semibold text-gray-700 text-center">{labels.averageOrders}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredRiders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                          {labels.empty}
                        </td>
                      </tr>
                    ) : (
                      filteredRiders.map((rider, index) => {
                        const riderName = locale === 'ar'
                          ? rider.riderNameAR || rider.riderNameEN
                          : rider.riderNameEN || rider.riderNameAR;

                        return (
                          <tr key={`${rider.riderId}-${rider.workingId}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-gray-900">{riderName || '-'}</div>
                              <div className="text-xs text-gray-500">
                                {labels.iqama}: {rider.iqamaNo || '-'} | {labels.workingId}: {rider.workingId || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{rider.companyName || '-'}</td>
                            <td className="px-4 py-3">{rider.housingName || '-'}</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-700">{rider.totalAcceptedOrders ?? 0}</td>
                            <td className="px-4 py-3 text-center">{rider.targetToDate ?? 0}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-600">{rider.remainingToTargetToDate ?? 0}</td>
                            <td className="px-4 py-3 text-center">{rider.remainingToMonthlyTarget ?? 0}</td>
                            <td className="px-4 py-3 text-center">{rider.totalShifts ?? 0}</td>
                            <td className="px-4 py-3 text-center">{numberValue(rider.averageOrdersPerShift).toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                {labels.footerSummary
                  .replace('{{acceptedOrders}}', totals.acceptedOrders.toLocaleString())
                  .replace('{{remainingMonthly}}', totals.remainingMonthly.toLocaleString())}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
