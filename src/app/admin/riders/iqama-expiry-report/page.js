'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Search, RefreshCw, Download, ArrowRight, Filter } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import * as XLSX from 'xlsx';

const URGENCY_LABELS = {
  0: { label: 'منتهية', color: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  1: { label: 'حرجة < 30 يوم', color: 'bg-orange-500', text: 'text-white', border: 'border-orange-400' },
  2: { label: 'تحذير 31–90 يوم', color: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-300' },
  3: { label: 'قريبة 91–180 يوم', color: 'bg-blue-400', text: 'text-white', border: 'border-blue-300' },
  4: { label: 'آمنة +180 يوم', color: 'bg-green-500', text: 'text-white', border: 'border-green-400' },
};

const URGENCY_OPTIONS = [
  { value: '', label: 'جميع المستويات' },
  { value: '0', label: '🔴 منتهية' },
  { value: '1', label: '🟠 حرجة (أقل من 30 يوم)' },
  { value: '2', label: '🟡 تحذير (31–90 يوم)' },
  { value: '3', label: '🔵 قريبة (91–180 يوم)' },
  { value: '4', label: '🟢 آمنة (أكثر من 180 يوم)' },
];

function SummaryCard({ icon: Icon, label, count, colorClass, bgClass }) {
  return (
    <div className={`rounded-xl border-2 ${bgClass} p-4 flex items-center gap-3`}>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{count ?? '–'}</p>
      </div>
    </div>
  );
}

export default function IqamaExpiryReportPage() {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ urgency: '', housingName: '', sponsor: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    total: report?.employees?.length || 0,
    active: report?.employees?.filter(r => r.status?.toLowerCase() === 'enable').length || 0,
    inactive: report?.employees?.filter(r => r.status?.toLowerCase() === 'disable').length || 0,
    vacation: report?.employees?.filter(r => r.status?.toLowerCase() === 'vacation').length || 0,
    sick: report?.employees?.filter(r => r.status?.toLowerCase() === 'sick').length || 0,
    accident: report?.employees?.filter(r => r.status?.toLowerCase() === 'accident').length || 0,
  };

  const filteredEmployees = (report?.employees || []).filter(rider => {
    const status = rider.status?.toLowerCase();

    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && status !== 'enable') return false;
      if (statusFilter === 'inactive' && status !== 'disable') return false;
      if (statusFilter === 'vacation' && status !== 'vacation') return false;
      if (statusFilter === 'sick' && status !== 'sick') return false;
      if (statusFilter === 'accident' && status !== 'accident') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesName = rider.nameAR?.toLowerCase().includes(q) || rider.nameEN?.toLowerCase().includes(q);
      const matchesIqama = rider.iqamaNo != null && String(rider.iqamaNo).toLowerCase().includes(q);
      const matchesHousing = rider.housingName?.toLowerCase().includes(q);
      const matchesSponsor = rider.sponsor?.toLowerCase().includes(q);
      if (!matchesName && !matchesIqama && !matchesHousing && !matchesSponsor) return false;
    }

    return true;
  });

  const loadReport = useCallback(async (customFilters = null) => {
    setLoading(true);
    const params = customFilters || filters;
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.IQAMA_EXPIRY_REPORT(params));
      setReport(data);
    } catch (err) {
      console.error('Error loading Iqama expiry report:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleUrgencyChange = (e) => {
    const value = e.target.value;
    const newFilters = { ...filters, urgency: value };
    setFilters(newFilters);
    loadReport(newFilters);
  };

  const handleSearch = () => loadReport();

  const handleExport = () => {
    if (!report?.employees?.length) return;
    const rows = report.employees.map(emp => ({
      'رقم الإقامة': emp.iqamaNo,
      'الاسم بالعربية': emp.nameAR,
      'الاسم بالإنجليزية': emp.nameEN,
      'المسمى الوظيفي': emp.jobTitle,
      'الكفيل': emp.sponsor,
      'رقم الكفيل': emp.sponsorNo,
      'الجنسية': emp.country,
      'الهاتف': emp.phone,
      'انتهاء الإقامة (م)': emp.iqamaEndM,
      'انتهاء الإقامة (هـ)': emp.iqamaEndH,
      'الأيام المتبقية': emp.daysUntilExpiryM,
      'مستوى الإلحاح': URGENCY_LABELS[emp.urgency]?.label ?? emp.urgency,
      'السكن': emp.housingName ?? '–',
      'عنوان السكن': emp.housingAddress ?? '–',
      'الحالة': emp.status,
      'داخل المملكة': emp.inksa ? 'نعم' : 'لا',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير الإقامة');
    XLSX.writeFile(wb, `iqama-expiry-report-${Date.now()}.xlsx`);
  };

  const getCompactDate = (d) => {
    if (!d) return '–';
    const parts = d.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[0]}/${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
    return d;
  };

  const columns = [
    {
      header: 'الاسم',
      render: (row) => (
        <button
          onClick={() => router.push(`/admin/riders/${row.iqamaNo}/details`)}
          className="text-blue-600 hover:underline font-medium text-right"
        >
          {row.nameAR}
        </button>
      ),
    },
    { header: 'رقم الإقامة', accessor: 'iqamaNo' },
    {
      header: 'الكفيل',
      render: (row) => (
        <div>
          <span>{row.sponsor ?? '–'}</span>
          {row.sponsorNo && (
            <p className="text-xs text-gray-500 mt-0.5">{row.sponsorNo}</p>
          )}
        </div>
      ),
    },
    { header: 'السكن', render: (row) => row.housingName ?? '–' },
    {
      header: 'انتهاء الإقامة (م)',
      render: (row) => <span className="font-mono text-sm">{getCompactDate(row.iqamaEndM)}</span>,
    },
    {
      header: 'الأيام المتبقية',
      render: (row) => {
        const days = row.daysUntilExpiryM;
        const color = days < 0 ? 'bg-red-600' : days < 30 ? 'bg-orange-500' : days < 90 ? 'bg-yellow-400 text-gray-900' : 'bg-blue-500';
        return (
          <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-sm`}>
            {days < 0 ? `منتهية (${Math.abs(days)} يوم)` : `${days} يوم`}
          </span>
        );
      },
    },
    {
      header: 'المستوى',
      render: (row) => {
        const u = URGENCY_LABELS[row.urgency];
        if (!u) return row.urgency;
        return <span className={`${u.color} ${u.text} text-xs font-bold px-2 py-0.5 rounded-sm`}>{u.label}</span>;
      },
    },
    {
      header: t('common.status'),
      render: (row) => <StatusBadge status={row.status} />
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="تقرير انتهاء الإقامة"
        subtitle="عرض جميع الموظفين مرتبين حسب أقرب تاريخ انتهاء إقامة"
        icon={AlertTriangle}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders'),
        }}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-4 md:px-6">
        <SummaryCard icon={XCircle}      label="منتهية"             count={report?.expiredCount}  colorClass="bg-red-600"    bgClass="border-red-200 bg-red-50" />
        <SummaryCard icon={AlertTriangle} label="حرجة (< 30 يوم)"  count={report?.criticalCount}  colorClass="bg-orange-500" bgClass="border-orange-200 bg-orange-50" />
        <SummaryCard icon={Clock}         label="تحذير (31–90 يوم)" count={report?.warningCount}   colorClass="bg-yellow-500" bgClass="border-yellow-200 bg-yellow-50" />
        <SummaryCard icon={Shield}        label="قريبة (91–180 يوم)"count={report?.upcomingCount}  colorClass="bg-blue-500"   bgClass="border-blue-200 bg-blue-50" />
        <SummaryCard icon={CheckCircle}   label="آمنة (> 180 يوم)"  count={report?.safeCount}      colorClass="bg-green-500"  bgClass="border-green-200 bg-green-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm mx-4 md:mx-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 border-b pb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">مستوى الإلحاح</label>
            <select
              name="urgency"
              value={filters.urgency}
              onChange={handleUrgencyChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {URGENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <RefreshCw size={16} className="animate-spin ml-1" /> : <Search size={16} className="ml-1" />}
              {t('common.search')}
            </Button>
            <Button onClick={handleExport} variant="secondary" disabled={!report?.employees?.length}>
              <Download size={16} />
            </Button>
          </div>
        </div>

        {/* Status Filter Logic (Like Riders Page) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={18} className="text-gray-600" />
            <h3 className="text-sm font-bold text-gray-800">{t('common.filter')} (الحالة)</h3>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: t('common.all'), count: stats.total, color: 'bg-blue-600' },
              { id: 'active', label: t('common.active'), count: stats.active, color: 'bg-green-600' },
              { id: 'inactive', label: t('common.inactive'), count: stats.inactive, color: 'bg-red-600' },
              { id: 'vacation', label: t('status.vacation'), count: stats.vacation, color: 'bg-blue-500' },
              { id: 'sick', label: t('status.sick'), count: stats.sick, color: 'bg-yellow-500' },
              { id: 'accident', label: t('status.accident'), count: stats.accident, color: 'bg-orange-500' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${statusFilter === btn.id
                  ? `${btn.color} text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>
        </div>

        {report && (
          <p className="text-xs text-gray-400 mt-2">
            نتائج البحث: <span className="font-bold text-gray-700">{filteredEmployees.length}</span> / <span className="font-bold text-gray-700">{report.totalEmployees}</span>
            {report.generatedAt && ` · تم التوليد: ${new Date(report.generatedAt).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`}
          </p>
        )}
      </div>

      {/* Search by Name / Iqama */}
      <div className="bg-white rounded-xl shadow-sm mx-4 md:mx-6 p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم السائق أو رقم الإقامة..."
              className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-500 hover:text-red-500 whitespace-nowrap"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm mx-4 md:mx-6 p-4">
        <Table
          columns={columns}
          data={filteredEmployees}
          loading={loading}
        />
      </div>
    </div>
  );
}
