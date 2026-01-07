'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  Plus, Search, Edit, Trash2, Eye, Users,
  FileSpreadsheet, Filter, AlertCircle, UserCheck,
  Clock, Archive, BarChart3, Calendar, History, Package
} from 'lucide-react';
import MiniStatRow from '@/components/Ui/MiniStatRow';

export default function EmployeeAdminPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.LIST);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setErrorMessage(err?.message || t('employees.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (iqamaNo) => {
    if (!confirm(t('employees.confirmDelete'))) return;

    try {
      await ApiService.delete(API_ENDPOINTS.EMPLOYEE.DELETE(iqamaNo));
      setSuccessMessage(t('employees.deleteSuccess'));
      loadEmployees();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setErrorMessage(err?.message || t('employees.deleteError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const columns = [
    {
      header: t('employees.iqamaNumber'),
      accessor: 'iqamaNo',
      render: (row) => (
        <span className="font-bold text-blue-600">{row.iqamaNo}</span>
      )
    },
    { header: t('employees.nameArabic'), accessor: 'nameAR' },
    { header: t('employees.nameEnglish'), accessor: 'nameEN' },
    { header: t('employees.country'), accessor: 'country' },
    { header: t('employees.phone'), accessor: 'phone' },
    { header: t('employees.jobTitle'), accessor: 'jobTitle' },
    {
      header: t('common.status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: t('employees.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/employees/admin/${row.iqamaNo}/details`)}
            className="text-green-600 hover:text-green-800 p-1"
            title={t('employees.viewDetails')}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => router.push(`/admin/employees/admin/${row.iqamaNo}/edit`)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('employees.edit')}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.iqamaNo)}
            className="text-red-600 hover:text-red-800 p-1"
            title={t('employees.delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.iqamaNo?.toString().includes(searchTerm) ||
    emp.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.sponsor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'enable').length,
    inactive: employees.filter(e => e.status === 'disable').length,
    countries: new Set(employees.map(e => e.country)).size
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.adminDashboard')}
        subtitle={`${t('employees.totalEmployees')}: ${employees.length}`}
        icon={Users}
        actionButton={{
          text: t('employees.addNewEmployee'),
          icon: <Plus size={18} />,
          onClick: () => router.push('/admin/employees/admin/create'),
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">{t('employees.totalEmployees')}</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">{t('employees.activeEmployees')}</p>
              <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            </div>
            <UserCheck className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t('employees.inactiveEmployees')}</p>
              <p className="text-3xl font-bold text-red-700">{stats.inactive}</p>
            </div>
            <AlertCircle className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">{t('employees.numberOfCountries')}</p>
              <p className="text-3xl font-bold text-purple-700">{stats.countries}</p>
            </div>
            <Filter className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* Management Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('employees.excelColumns.management')}
          </h3>
          <div className="flex flex-col gap-3">
            <MiniStatRow
              icon={Plus}
              title={t('employees.addEmployee')}
              description={t('employees.newEmployee')}
              onClick={() => router.push('/admin/employees/admin/create')}
              color="#16a34a" // green-600
              bgClass="bg-green-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={AlertCircle}
              title={t('employees.statusRequests')}
              description={t('employees.enableDisable')}
              onClick={() => router.push('/admin/employees/admin/status-requests')}
              color="#ca8a04" // yellow-600
              bgClass="bg-yellow-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={FileSpreadsheet}
              title={t('employees.importExcel')}
              description={t('employees.uploadFile')}
              onClick={() => router.push('/admin/employees/admin/import-excel')}
              color="#1a3b26ff" // green-600
              bgClass="bg-gray-100"
              className="!p-2"
            />
            <MiniStatRow
              icon={Clock}
              title={t('employees.tempData')}
              description={t('employees.reviewUpdates')}
              onClick={() => router.push('/admin/employees/admin/temp-imports')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
              className="!p-2"
            />
          </div>
        </div>

        {/* Search & Reports Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('employees.excelColumns.searchAndReports')}
          </h3>
          <div className="flex flex-col gap-3">
            <MiniStatRow
              icon={Search}
              title={t('employees.smartSearch')}
              description={t('employees.advancedSearch')}
              onClick={() => router.push('/admin/employees/admin/search')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
              className="!p-2"
            />
           <MiniStatRow
              icon={BarChart3}
              title={t('employees.statistics')}
              description={t('employees.dataDashboard')}
              onClick={() => router.push('/admin/employees/admin/statistics')}
              color="#2a86a1ff" // indigo-600
              bgClass="bg-gray-100"
              className="!p-2"
            />
            <MiniStatRow
              icon={Filter}
              title={t('employees.advancedSearch')}
              description={t('employees.multiFilter')}
              onClick={() => router.push('/admin/employees/admin/filter')}
              color="#9333ea" // purple-600
              bgClass="bg-purple-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={Calendar}
              title={t('employees.timeRecord')}
              description={t('employees.byDate')}
              onClick={() => router.push('/admin/employees/admin/date-range')}
              color="#0891b2" // cyan-600
              bgClass="bg-cyan-50"
              className="!p-2"
            />
          </div>
        </div>

        {/* Others Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('common.others')}
          </h3>
          <div className="flex flex-col gap-3">
            <MiniStatRow
              icon={Archive}
              title={t('employees.deletedEmployees')}
              description={t('employees.archive')}
              onClick={() => router.push('/admin/employees/admin/deleted')}
              color="#dc2626" // red-600
              bgClass="bg-red-50"
              className="!p-2"
            />
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert
          type="success"
          title={t('common.success')}
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('employees.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredEmployees}
          loading={loading}
        />
      </Card>
    </div>
  );
}