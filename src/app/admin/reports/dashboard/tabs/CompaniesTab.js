'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Building2, Calendar, TrendingUp, Users, Package, Clock } from 'lucide-react';

// Vibrant palette matching the screenshot colours
const COMPANY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

function formatDate(d) {
  // Returns  "YYYY-MM-DD" from DateOnly   e.g. { year, month, day }
  if (!d) return '';
  if (typeof d === 'string') return d.slice(0, 10);
  const pad = n => String(n).padStart(2, '0');
  return `${d.year ?? d.Year}-${pad(d.month ?? d.Month)}-${pad(d.day ?? d.Day)}`;
}

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={color} size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <h3 className="text-xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
      </div>
    </div>
  );
}

// ── Custom dot for LineChart (matches the screenshot) ────────────────────────
const CustomDot = ({ cx, cy, stroke }) => (
  <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="#fff" strokeWidth={2} />
);

// ── Company toggle pills ─────────────────────────────────────────────────────
function CompanyToggle({ companies, visible, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {companies.map((c, i) => {
        const color = COMPANY_COLORS[i % COMPANY_COLORS.length];
        const active = visible.includes(c.companyId);
        return (
          <button
            key={c.companyId}
            onClick={() => onToggle(c.companyId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              active ? 'text-white border-transparent shadow' : 'bg-white text-gray-500 border-gray-200'
            }`}
            style={active ? { backgroundColor: color, borderColor: color } : {}}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: active ? '#fff' : color }}
            />
            {c.companyName}
          </button>
        );
      })}
    </div>
  );
}

export default function CompaniesTab() {
  const { t, locale } = useLanguage();
  const isRtl = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Controls
  const [startDate, setStartDate] = useState(todayMinus(29)); // default last 30 days
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'
  const [quickDays, setQuickDays] = useState(30);
  const [visibleCompanies, setVisibleCompanies] = useState([]);

  // Derived: normalised day-level data for charts
  const [chartData, setChartData] = useState({ ordersPerDay: [], ridersPerDay: [], sharePerDay: [] });
  // All available companies for the dropdown
  const [allAvailableCompanies, setAllAvailableCompanies] = useState([]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const compId = selectedCompanyId === 'all' ? null : selectedCompanyId;
      const result = await ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.COMPANIES_REPORT(startDate, endDate, compId));
      
      // Sort the days arrays chronologically for each company
      if (result.companies) {
        result.companies.forEach(company => {
          if (company.days) {
            company.days.sort((a, b) => formatDate(a.date).localeCompare(formatDate(b.date)));
          }
        });
      }

      setData(result);
      setVisibleCompanies(result.companies?.map(c => c.companyId) ?? []);
      
      // Update dropdown list if it's the first fetch or "all" was selected
      if (selectedCompanyId === 'all' && result.companies) {
        setAllAvailableCompanies(result.companies.map(c => ({ id: c.companyId, name: c.companyName })));
      }
    } catch (err) {
      console.error('Companies report error:', err);
      setError(err.message || t('dashboardTabs.companies.loadError'));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedCompanyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Build chart series whenever data or visible companies change ──────────
  useEffect(() => {
    if (!data?.companies?.length) {
      setChartData({ ordersPerDay: [], ridersPerDay: [], sharePerDay: [] });
      return;
    }

    const displayed = data.companies.filter(c => visibleCompanies.includes(c.companyId));

    // Collect all dates (union) using ISO format for chronological sorting
    const dateMap = new Map();
    displayed.forEach(c => {
      c.days?.forEach(d => {
        const isoDate = formatDate(d.date);
        if (!dateMap.has(isoDate)) {
          dateMap.set(isoDate, d.dateLabel || isoDate);
        }
      });
    });

    const sortedIsoDates = [...dateMap.keys()].sort();

    const ordersPerDay = sortedIsoDates.map(isoDate => {
      const row = { dateLabel: dateMap.get(isoDate) };
      displayed.forEach(c => {
        const day = c.days?.find(d => formatDate(d.date) === isoDate);
        row[c.companyName] = day?.acceptedOrders ?? 0;
      });
      return row;
    });

    const ridersPerDay = sortedIsoDates.map(isoDate => {
      const row = { dateLabel: dateMap.get(isoDate) };
      displayed.forEach(c => {
        const day = c.days?.find(d => formatDate(d.date) === isoDate);
        row[c.companyName] = day?.uniqueRiders ?? 0;
      });
      return row;
    });

    const sharePerDay = sortedIsoDates.map(isoDate => {
      const row = { dateLabel: dateMap.get(isoDate) };
      displayed.forEach(c => {
        const day = c.days?.find(d => formatDate(d.date) === isoDate);
        row[c.companyName] = day?.acceptedOrders ?? 0;
      });
      return row;
    });

    setChartData({ ordersPerDay, ridersPerDay, sharePerDay });
  }, [data, visibleCompanies]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const applyQuickRange = (days) => {
    setQuickDays(days);
    setStartDate(todayMinus(days - 1));
    setEndDate(todayStr());
  };

  const toggleCompany = (id) => {
    setVisibleCompanies(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const displayed = data?.companies?.filter(c => visibleCompanies.includes(c.companyId)) ?? [];

  // ── Tooltip style ────────────────────────────────────────────────────────
  const tooltipStyle = { borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', direction: 'ltr' };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar size={18} className="text-blue-500 shrink-0" />
          <h3 className="font-bold text-gray-700 me-auto">
            {t('dashboardTabs.companies.filters')}
          </h3>

          {/* Quick range buttons */}
          <div className="flex gap-2">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => applyQuickRange(d)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  quickDays === d
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {d} {t('dashboardTabs.companies.days')}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <label className="font-medium">{t('common.from')}</label>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setQuickDays(null); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="font-medium">{t('common.to')}</label>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setQuickDays(null); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={fetchData}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              {t('common.refresh')}
            </button>
          </div>

          {/* Company dropdown */}
          <div className="flex items-center w-full md:w-auto">
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-48 bg-gray-50 text-gray-700"
            >
              <option value="all">{t('dashboardTabs.companies.allCompanies') || 'All companies'}</option>
              {allAvailableCompanies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* View mode */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden ms-auto">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-1.5 text-sm font-semibold transition-all ${
                viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('dashboardTabs.companies.chart')}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 text-sm font-semibold transition-all ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('dashboardTabs.companies.table')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading / Error ──────────────────────────────────────────────── */}
      {loading && (
        <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse text-lg">
          {t('dashboardTabs.companies.loading')}
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* ── Data ────────────────────────────────────────────────────────── */}
      {!loading && !error && data && (
        <>
          {/* KPI Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <StatCard
              label={t('dashboardTabs.companies.totalOrders')}
              value={data.grandTotalOrders}
              icon={Package}
              color="text-blue-500"
              bg="bg-blue-50"
            />
            <StatCard
              label={t('dashboardTabs.companies.totalHungerOrders') || 'Hunger Orders'}
              value={data.companies?.find(c => c.companyName.toLowerCase().includes('hunger'))?.totalOrders || 0}
              icon={Package}
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
            <StatCard
              label={t('dashboardTabs.companies.totalKetaOrders') || 'Keta Orders'}
              value={data.companies?.find(c => c.companyName.toLowerCase().includes('keta') || c.companyName.toLowerCase().includes('keeta'))?.totalOrders || 0}
              icon={Package}
              color="text-cyan-500"
              bg="bg-cyan-50"
            />
            <StatCard
              label={t('dashboardTabs.companies.totalRiders')}
              value={data.companies?.reduce((s, c) => s + c.totalUniqueRiders, 0) ?? 0}
              icon={Users}
              color="text-purple-500"
              bg="bg-purple-50"
            />
            <StatCard
              label={t('dashboardTabs.companies.daysInRange')}
              value={data.totalDays}
              icon={Calendar}
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
            <StatCard
              label={t('dashboardTabs.companies.companies')}
              value={data.totalCompanies}
              icon={Building2}
              color="text-orange-500"
              bg="bg-orange-50"
            />
            <StatCard
              label={t('dashboardTabs.companies.avgOrdersPerDay')}
              value={data.totalDays > 0 ? Math.round(data.grandTotalOrders / data.totalDays).toLocaleString() : 0}
              icon={TrendingUp}
              color="text-pink-500"
              bg="bg-pink-50"
            />
          </div>

          {/* Company toggles
          {data.companies?.length > 0 && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                {t('dashboardTabs.companies.toggleCompanies')}
              </p>
              <CompanyToggle
                companies={data.companies}
                visible={visibleCompanies}
                onToggle={toggleCompany}
              />
            </div>
          )} */}

          {viewMode === 'chart' ? (
            <div className="space-y-6">
              {/* Chart 0: Orders and Riders by Company */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-500" />
                  {t('dashboardTabs.companies.ordersAndRidersByCompany') || 'Orders & Riders by Company'}
                </h3>
                <div className="h-80" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayed} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="companyName" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f3f4f6' }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="totalOrders" name={t('dashboardTabs.companies.totalOrders') || 'Total Orders'} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      <Bar yAxisId="right" dataKey="totalUniqueRiders" name={t('dashboardTabs.companies.uniqueRiders') || 'Unique Riders'} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 1: Accepted orders per day */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">
                  {t('dashboardTabs.companies.acceptedOrdersPerDay')}
                </h3>
                <div className="h-72" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.ordersPerDay} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      {displayed.map((c, i) => (
                        <Line
                          key={c.companyId}
                          type="monotone"
                          dataKey={c.companyName}
                          stroke={COMPANY_COLORS[i % COMPANY_COLORS.length]}
                          strokeWidth={2.5}
                          dot={<CustomDot />}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Unique riders per day */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">
                  {t('dashboardTabs.companies.uniqueRidersPerDay')}
                </h3>
                <div className="h-72" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.ridersPerDay} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      {displayed.map((c, i) => (
                        <Line
                          key={c.companyId}
                          type="monotone"
                          dataKey={c.companyName}
                          stroke={COMPANY_COLORS[i % COMPANY_COLORS.length]}
                          strokeWidth={2}
                          strokeDasharray="5 3"
                          dot={<CustomDot />}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Daily order share (stacked bar) */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">
                  {t('dashboardTabs.companies.dailyOrderShare')}
                </h3>
                <div className="h-80" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.sharePerDay} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      {displayed.map((c, i) => (
                        <Bar
                          key={c.companyId}
                          dataKey={c.companyName}
                          stackId="a"
                          fill={COMPANY_COLORS[i % COMPANY_COLORS.length]}
                          radius={i === displayed.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            /* ── TABLE MODE ─────────────────────────────────────────────── */
            <div className="space-y-6">
              {data.companies?.map((company, ci) => (
                <div key={company.companyId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Company header */}
                  <div
                    className="px-5 py-4 flex flex-wrap items-center gap-4"
                    style={{ borderLeft: `4px solid ${COMPANY_COLORS[ci % COMPANY_COLORS.length]}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COMPANY_COLORS[ci % COMPANY_COLORS.length] }}
                      />
                      <span className="font-bold text-gray-800 text-base">{company.companyName}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 ms-auto text-sm text-gray-600">
                      <span><span className="font-semibold text-gray-800">{company.totalOrders.toLocaleString()}</span> {t('dashboardTabs.companies.totalOrders')}</span>
                      <span><span className="font-semibold text-gray-800">{company.totalShifts.toLocaleString()}</span> {t('dashboardTabs.companies.totalShifts')}</span>
                      <span><span className="font-semibold text-gray-800">{company.totalUniqueRiders}</span> {t('dashboardTabs.companies.uniqueRiders')}</span>
                      <span><span className="font-semibold text-gray-800">{company.avgOrdersPerDay.toFixed(1)}</span> {t('dashboardTabs.companies.avgOrdersPerDay')}</span>
                      <span><span className="font-semibold text-gray-800">{company.avgRidersPerDay.toFixed(1)}</span> {t('dashboardTabs.companies.avgRidersPerDay')}</span>
                    </div>
                  </div>

                  {/* Day-level table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                        <tr>
                          <th className="px-4 py-2 text-start font-semibold">{t('dashboardTabs.companies.date')}</th>
                          <th className="px-4 py-2 text-start font-semibold">{t('dashboardTabs.companies.dayOfWeek')}</th>
                          <th className="px-4 py-2 text-end font-semibold">{t('dashboardTabs.companies.accepted')}</th>
                          <th className="px-4 py-2 text-end font-semibold">{t('dashboardTabs.companies.rejected')}</th>
                          <th className="px-4 py-2 text-end font-semibold">{t('dashboardTabs.companies.uniqueRiders')}</th>
                          <th className="px-4 py-2 text-end font-semibold">{t('dashboardTabs.companies.shifts')}</th>
                          <th className="px-4 py-2 text-end font-semibold">{t('dashboardTabs.companies.avgOrdersPerRider')}</th>
                          <th className="px-4 py-2 text-end font-semibold">{t('dashboardTabs.companies.workingHours')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {company.days?.map((day, di) => (
                          <tr key={di} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2 text-gray-700 font-medium whitespace-nowrap">
                              {day.dateLabel ?? formatDate(day.date)}
                            </td>
                            <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{day.dayOfWeek}</td>
                            <td className="px-4 py-2 text-end font-semibold text-emerald-600">{day.acceptedOrders.toLocaleString()}</td>
                            <td className="px-4 py-2 text-end text-red-500">{day.rejectedOrders.toLocaleString()}</td>
                            <td className="px-4 py-2 text-end text-purple-600">{day.uniqueRiders}</td>
                            <td className="px-4 py-2 text-end text-blue-600">{day.totalShifts}</td>
                            <td className="px-4 py-2 text-end text-gray-700">{day.avgOrdersPerRider.toFixed(1)}</td>
                            <td className="px-4 py-2 text-end text-gray-700">{day.totalWorkingHours.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
