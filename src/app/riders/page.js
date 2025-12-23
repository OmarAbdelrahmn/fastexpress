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
import { Plus, Search, Edit, Trash2, UserCheck, Eye, Users, Building, Package, Filter } from 'lucide-react';
import MiniStatRow from '@/components/Ui/MiniStatRow';

export default function RidersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [riders, setRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.LIST);
      setRiders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading riders:', err);
      setErrorMessage(err?.message || t('riders.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (iqamaNo) => {
    if (!confirm(t('riders.confirmDelete'))) return;

    try {
      await ApiService.delete(API_ENDPOINTS.RIDER.DELETE(iqamaNo));
      setSuccessMessage(t('riders.deleteSuccess'));
      loadRiders();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting rider:', err);
      setErrorMessage(err?.message || t('riders.deleteError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleViewDetails = (iqamaNo) => {
    router.push(`/riders/${iqamaNo}/details`);
  };

  const handleEdit = (iqamaNo) => {
    router.push(`/riders/${iqamaNo}/edit`);
  };

  const columns = [
    {
      header: t('riders.workingId'),
      accessor: 'workingId',
      render: (row) => (
        <span className="font-bold text-blue-600">{row.workingId || 'N/A'}</span>
      )
    },
    { header: t('riders.iqamaNumber'), accessor: 'iqamaNo' },
    { header: t('riders.nameArabic'), accessor: 'nameAR' },
    { header: t('riders.nameEnglish'), accessor: 'nameEN' },
    {
      header: t('riders.company'),
      accessor: 'companyName',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-gray-500" />
          <span>{row.companyName}</span>
        </div>
      )
    },
    {
      header: t('riders.housing'),
      accessor: 'housingAddress',
      render: (row) => (
        <span className="text-gray-600">{row.housingAddress || t('riders.notSpecified')}</span>
      )
    },
    {
      header: t('riders.target'),
      accessor: 'target',
    },
    {
      header: t('ridersPerformance.performanceRate'),
      accessor: 'performanceRate',
    },
    {
      header: t('common.status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: t('riders.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row.iqamaNo)}
            className="text-green-600 hover:text-green-800 p-1"
            title={t('riders.viewDetails')}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row.iqamaNo)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('riders.edit')}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.iqamaNo)}
            className="text-red-600 hover:text-red-800 p-1"
            title={t('riders.delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  const filteredRiders = riders.filter(rider => {
    const matchesSearch =
      rider.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.workingId?.toString().includes(searchTerm) ||
      rider.iqamaNo?.toString().includes(searchTerm) ||
      rider.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.sponsor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && rider.status.toLowerCase() === 'enable') ||
      (statusFilter === 'inactive' && rider.status.toLowerCase() === 'disable') ||
      (statusFilter === 'fleeing' && rider.status.toLowerCase() === 'fleeing') ||
      (statusFilter === 'vacation' && rider.status.toLowerCase() === 'vacation') ||
      (statusFilter === 'sick' && rider.status.toLowerCase() === 'sick') ||
      (statusFilter === 'accident' && rider.status.toLowerCase() === 'accident');

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: riders.length,
    active: riders.filter(r => r.status.toLowerCase() === 'enable').length,
    other: riders.length - riders.filter(r => r.status.toLowerCase() === 'enable').length,
    inactive: riders.filter(r => r.status.toLowerCase() === 'disable').length,
    fleeing: riders.filter(r => r.status.toLowerCase() === 'fleeing').length,
    vacation: riders.filter(r => r.status.toLowerCase() === 'vacation').length,
    sick: riders.filter(r => r.status.toLowerCase() === 'sick').length,
    accident: riders.filter(r => r.status.toLowerCase() === 'accident').length,
    companies: new Set(riders.map(r => r.companyName)).size,
    withHousing: riders.filter(r => r.housingAddress).length
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('riders.manageRiders')}
        subtitle={`${t('riders.totalRiders')}: ${riders.length}`}
        icon={UserCheck}
        actionButton={{
          text: t('riders.addNewRider'),
          icon: <Plus size={18} />,
          onClick: () => router.push('/riders/create'),
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Main Stats */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">{t('riders.totalRiders')}</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">{t('common.active')}</p>
              <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            </div>
            <UserCheck className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t('common.inactive')}</p>
              <p className="text-3xl font-bold text-red-700">{stats.other}</p>
            </div>
            <Users className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">{t('riders.numberOfCompanies')}</p>
              <p className="text-3xl font-bold text-purple-700">{stats.companies}</p>
            </div>
            <Building className="text-purple-500" size={40} />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Management Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('riders.management')}
          </h3>
          <div className="flex flex-col gap-3">
            <MiniStatRow
              icon={Plus}
              title={t('riders.addNewRider')}
              description={t('riders.createNewProfile')}
              onClick={() => router.push('/riders/create')}
              color="#16a34a" // green-600
              bgClass="bg-green-50"
            />
            <MiniStatRow
              icon={Edit}
              title={t('riders.editRider')}
              description={t('riders.modifyExistingProfile')}
              onClick={() => router.push('/riders/search?action=edit')} // Placeholder route logic
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
            />
            <MiniStatRow
              icon={Trash2}
              title={t('riders.deleteRider')}
              description={t('riders.removeProfile')}
              onClick={() => router.push('/riders/search?action=delete')} // Placeholder route logic
              color="#dc2626" // red-600
              bgClass="bg-red-50"
            />
            <MiniStatRow
              icon={Package}
              title={t('riders.changeWorkingId')}
              description={t('riders.updateWorkingId')}
              onClick={() => router.push('/riders/change-working-id')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
            />
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('riders.searchTools')}
          </h3>
          <div className="flex flex-col gap-3">
            <MiniStatRow
              icon={Search}
              title={t('riders.smartSearch')}
              description={t('riders.searchByAnyInfo')}
              onClick={() => router.push('/riders/search')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
            />
            <MiniStatRow
              icon={Filter}
              title={t('riders.advancedSearch')}
              description={t('riders.multiFilter')}
              onClick={() => router.push('/riders/filter')}
              color="#9333ea" // purple-600
              bgClass="bg-purple-50"
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
              icon={UserCheck}
              title={t('riders.addToEmployee')}
              description={t('riders.convertEmployeeToRider')}
              onClick={() => router.push('/riders/add-to-employee')}
              color="#0d9488" // teal-600
              bgClass="bg-teal-50"
            />
          </div>
        </div>
      </div>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">{t('common.filter')}</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('common.all')} ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('common.active')} ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "inactive"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('common.inactive')} ({stats.inactive})
            </button>
            <button
              onClick={() => setStatusFilter("fleeing")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "fleeing"
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('status.fleeing')} ({stats.fleeing})
            </button>
            <button
              onClick={() => setStatusFilter("vacation")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "vacation"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('status.vacation')} ({stats.vacation})
            </button>
            <button
              onClick={() => setStatusFilter("sick")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "sick"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('status.sick')} ({stats.sick})
            </button>
            <button
              onClick={() => setStatusFilter("accident")}
              className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "accident"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {t('status.accident')} ({stats.accident})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('riders.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>


        <Table
          columns={columns}
          data={filteredRiders}
          loading={loading}
        />
      </Card>

      {/* Quick Actions */}

    </div>
  );
}