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
import {
  StatCard, ChartCard, FilterBar, PillButton, DateInput, ViewToggle,
  ErrorBanner, EmptyState, ChartDot, TOOLTIP_STYLE, PALETTE, CHART_COLORS
} from './shared';

function formatDate(d) {
  if (!d) return '';
  if (typeof d === 'string') return d.slice(0, 10);
  const pad = n => String(n).padStart(2, '0');
  return `${d.year ?? d.Year}-${pad(d.month ?? d.Month)}-${pad(d.day ?? d.Day)}`;
}

function todayMinus(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function yesterday() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Compact company pill toggle */
function CompanyPills({ companies, visible, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {companies.map((c, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        const active = visible.includes(c.companyId);
        return (
          <button
            key={c.companyId}
            onClick={() => onToggle(c.companyId)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150"
            style={active
              ? { backgroundColor: color, borderColor: color, color: '#fff' }
              : { backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#64748b' }
            }
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? '#fff' : color }} />
            {c.companyName}
          </button>
        );
      })}
    </div>
  );
}

export default function CompaniesTab() {
  const { t } = useLanguage();

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [data, setData]                 = useState(null);
  const [startDate, setStartDate]       = useState(todayMinus(30));
  const [endDate, setEndDate]           = useState(yesterday());
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [viewMode, setViewMode]         = useState('chart');
  const [quickDays, setQuickDays]       = useState(30);
  const [visibleCompanies, setVisibleCompanies]   = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [chartData, setChartData]       = useState({ orders: [], riders: [], stacked: [] });

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const compId = selectedCompanyId === 'all' ? null : selectedCompanyId;
      const result = await ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.COMPANIES_REPORT(startDate, endDate, compId));
      if (result.companies) {
        result.companies.forEach(c => c.days?.sort((a, b) => formatDate(a.date).localeCompare(formatDate(b.date))));
      }
      setData(result);
      const ids = result.companies?.map(c => c.companyId) ?? [];
      setVisibleCompanies(ids);
      if (selectedCompanyId === 'all' && result.companies) {
        setAllCompanies(result.companies.map(c => ({ id: c.companyId, name: c.companyName })));
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedCompanyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!data?.companies?.length) { setChartData({ orders: [], riders: [], stacked: [] }); return; }
    const displayed = data.companies.filter(c => visibleCompanies.includes(c.companyId));
    const dateMap   = new Map();
    displayed.forEach(c => c.days?.forEach(d => {
      const iso = formatDate(d.date);
      if (!dateMap.has(iso)) dateMap.set(iso, d.dateLabel || iso);
    }));
    const dates = [...dateMap.keys()].sort();

    const build = (key) => dates.map(iso => {
      const row = { dateLabel: dateMap.get(iso) };
      displayed.forEach(c => {
        const day = c.days?.find(d => formatDate(d.date) === iso);
        row[c.companyName] = day?.[key] ?? 0;
      });
      return row;
    });

    setChartData({ orders: build('acceptedOrders'), riders: build('uniqueRiders'), stacked: build('acceptedOrders') });
  }, [data, visibleCompanies]);

  const applyQuick = (d) => { setQuickDays(d); setStartDate(todayMinus(d)); setEndDate(yesterday()); };
  const toggleCompany = (id) => setVisibleCompanies(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const displayed = data?.companies?.filter(c => visibleCompanies.includes(c.companyId)) ?? [];

  const kpis = data ? [
    { label: 'إجمالي الطلبات',       value: data.grandTotalOrders, icon: Package,   accent: PALETTE.blue },
    { label: 'إجمالي المناديب الفريدة', value: data.companies?.reduce((s, c) => s + c.totalUniqueRiders, 0) ?? 0, icon: Users, accent: PALETTE.violet },
    { label: 'الأيام في النطاق',      value: data.totalDays,        icon: Calendar,  accent: PALETTE.emerald },
    { label: 'الشركات',              value: data.totalCompanies,   icon: Building2, accent: PALETTE.amber },
    { label: 'متوسط الطلبات/يوم',    value: data.totalDays > 0 ? Math.round(data.grandTotalOrders / data.totalDays).toLocaleString() : 0, icon: TrendingUp, accent: PALETTE.rose },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar title="نطاق التقرير" icon={Calendar}>
        <div className="flex gap-1.5">
          {[7, 14, 30].map(d => (
            <PillButton key={d} active={quickDays === d} onClick={() => applyQuick(d)}>{d} يوم</PillButton>
          ))}
        </div>
        <DateInput label="من" value={startDate} onChange={e => { setStartDate(e.target.value); setQuickDays(null); }} />
        <DateInput label="إلى" value={endDate} onChange={e => { setEndDate(e.target.value); setQuickDays(null); }} />
        <button
          onClick={fetchData}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          تحديث
        </button>
        <select
          value={selectedCompanyId}
          onChange={e => setSelectedCompanyId(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">جميع الشركات</option>
          {allCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="mr-auto">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </FilterBar>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium">جاري تحميل البيانات...</p>
          </div>
        </div>
      )}

      {error && !loading && <ErrorBanner message={error} />}

      {!loading && !error && data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {kpis.map((k, i) => <StatCard key={i} {...k} />)}
          </div>

          {/* Company Toggles */}
          {data.companies?.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">تصفية الشركات</p>
              <CompanyPills companies={data.companies} visible={visibleCompanies} onToggle={toggleCompany} />
            </div>
          )}

          {viewMode === 'chart' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Orders per day */}
                <ChartCard title="الطلبات المقبولة / يوم" icon={Package} accent={PALETTE.blue}>
                  <div className="h-72" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.orders} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {displayed.map((c, i) => (
                          <Line
                            key={c.companyId}
                            type="monotone"
                            dataKey={c.companyName}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={2.5}
                            dot={<ChartDot />}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                {/* Riders per day */}
                <ChartCard title="المناديب الفريدون / يوم" icon={Users} accent={PALETTE.emerald}>
                  <div className="h-72" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.riders} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {displayed.map((c, i) => (
                          <Line
                            key={c.companyId}
                            type="monotone"
                            dataKey={c.companyName}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={2}
                            strokeDasharray="5 3"
                            dot={<ChartDot />}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Stacked Bar */}
              <ChartCard title="مقارنة الطلبات اليومية (مجمّعة)" icon={TrendingUp} accent={PALETTE.violet}>
                <div className="h-80" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.stacked} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {displayed.map((c, i) => (
                        <Bar
                          key={c.companyId}
                          dataKey={c.companyName}
                          stackId="s"
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          radius={i === displayed.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          ) : (
            /* TABLE MODE */
            <div className="space-y-5">
              {data.companies?.map((company, ci) => (
                <div key={company.companyId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Company header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-4" style={{ borderRight: `4px solid ${CHART_COLORS[ci % CHART_COLORS.length]}` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[ci % CHART_COLORS.length] }} />
                      <span className="font-bold text-slate-800">{company.companyName}</span>
                    </div>
                    <div className="mr-auto flex flex-wrap gap-5 text-xs text-slate-500">
                      {[
                        { label: 'الطلبات', value: company.totalOrders?.toLocaleString() },
                        { label: 'الشيفتات', value: company.totalShifts?.toLocaleString() },
                        { label: 'المناديب', value: company.totalUniqueRiders },
                        { label: 'متوسط/يوم', value: company.avgOrdersPerDay?.toFixed(1) },
                      ].map((s, j) => (
                        <span key={j}>
                          <span className="font-bold text-slate-700">{s.value}</span> {s.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Day table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          {['التاريخ', 'اليوم', 'مقبول', 'مرفوض', 'المناديب', 'الشيفتات', 'متوسط/مندوب', 'ساعات العمل'].map((h, j) => (
                            <th key={j} className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${j > 1 ? 'text-end' : 'text-start'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {company.days?.map((day, di) => (
                          <tr key={di} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-slate-700 font-medium text-xs whitespace-nowrap">{day.dateLabel ?? formatDate(day.date)}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{day.dayOfWeek}</td>
                            <td className="px-4 py-3 text-end font-bold text-emerald-600">{day.acceptedOrders?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-end text-rose-500">{day.rejectedOrders?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-end text-violet-600 font-medium">{day.uniqueRiders}</td>
                            <td className="px-4 py-3 text-end text-blue-600 font-medium">{day.totalShifts}</td>
                            <td className="px-4 py-3 text-end text-slate-600">{day.avgOrdersPerRider?.toFixed(1)}</td>
                            <td className="px-4 py-3 text-end text-slate-500">{day.totalWorkingHours?.toFixed(1)}</td>
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