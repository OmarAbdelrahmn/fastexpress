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
              <p className="text-3xl font-bold text-red-700">{stats.inactive}</p>
            </div>
            <Users className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-rose-50 border-r-4 border-rose-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-600 mb-1">{t('status.fleeing')}</p>
              <p className="text-3xl font-bold text-rose-700">{stats.fleeing}</p>
            </div>
            <Users className="text-rose-500" size={40} />
          </div>
        </div>

        {/* Row 2: Secondary Stats */}
        <div className="bg-blue-50 border-r-4 border-blue-400 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">{t('status.vacation')}</p>
              <p className="text-3xl font-bold text-blue-700">{stats.vacation}</p>
            </div>
            <Users className="text-blue-400" size={40} />
          </div>
        </div>

        <div className="bg-yellow-50 border-r-4 border-yellow-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-1">{t('status.sick')}</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.sick}</p>
            </div>
            <Users className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">{t('status.accident')}</p>
              <p className="text-3xl font-bold text-orange-700">{stats.accident}</p>
            </div>
            <Users className="text-orange-500" size={40} />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <button
            onClick={() => router.push('/riders/search')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Search className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('riders.smartSearch')}</h3>
                <p className="text-sm text-gray-600">{t('riders.searchByAnyInfo')}</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/riders/filter')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('riders.advancedSearch')}</h3>
                <p className="text-sm text-gray-600">{t('riders.multiFilter')}</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/riders/change-working-id')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Package className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('riders.changeWorkingId')}</h3>
                <p className="text-sm text-gray-600">{t('riders.updateWorkingId')}</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/riders/add-to-employee')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Plus className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('riders.addToEmployee')}</h3>
                <p className="text-sm text-gray-600">{t('riders.convertEmployeeToRider')}</p>
              </div>
            </div>
          </button>
        </Card>
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