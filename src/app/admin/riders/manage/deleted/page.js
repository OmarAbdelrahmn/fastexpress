'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { Archive, Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function DeletedEmployeesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadDeletedEmployees();
  }, []);

  const loadDeletedEmployees = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.DELETED);
      const filteredData = Array.isArray(data)
        ? data.filter(emp => emp.iqamaNo?.toString() !== '9999')
        : [];
      setDeletedEmployees(filteredData);
    } catch (err) {
      console.error('Error loading deleted employees:', err);
      setErrorMessage(err?.message || t('employees.loadDeletedError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('profile.notSpecified');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      header: t('employees.iqamaNumber'),
      accessor: 'iqamaNo',
      render: (row) => (
        <span className="font-bold text-red-600">{row.iqamaNo}</span>
      )
    },
    {
      header: t('riders.workingId'),
      accessor: 'workingId',
      render: (row) => (
        <span className="font-bold text-gray-700">{row.workingId || '-'}</span>
      )
    },
    {
      header: t('employees.nameArabic'),
      accessor: 'nameAR',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{row.nameAR}</span>
          <span className="text-sm text-gray-500">{row.nameEN}</span>
        </div>
      )
    },
    { header: t('employees.sponsor'), accessor: 'sponsor' },
    {
      header: t('employees.sponsorNumber'),
      accessor: 'sponsorNo',
      render: (row) => (
        <span className="text-sm font-medium text-blue-600">{row.sponsorNo || '-'}</span>
      )
    },
    {
      header: t('common.reason'),
      accessor: 'status',
      render: (row) => {
        const status = row.status?.toLowerCase();
        const isDefaultStatus = !status || status === 'enable' || status === 'قيد التشغيل' || status === 'نشط' || status === 'نشط ' || status === 'تم الإيقاف';
        return (
          <span className="text-sm text-gray-600 italic">
            {isDefaultStatus ? '-' : row.status}
          </span>
        );
      }
    },
    {
      header: t('employees.deleteDate'),
      accessor: 'deletedAt',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.deletedAt)}
        </span>
      )
    }
  ];

  const filteredEmployees = deletedEmployees.filter(emp =>
    emp.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.iqamaNo?.toString().includes(searchTerm) ||
    emp.workingId?.toString().includes(searchTerm) ||
    emp.sponsorNo?.toString().includes(searchTerm) ||
    emp.sponsor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('employees.deletedEmployeesTitle')}
          subtitle={t('common.loading')}
          icon={Archive}
          actionButton={{
            text: t('navigation.backToList'),
            icon: <ArrowRight size={18} />,
            onClick: () => router.push('/admin/riders/manage'),
            variant: 'secondary'
          }}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('riders.loadingData')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.deletedEmployeesTitle')}
        subtitle={`${t('employees.totalDeleted')}: ${deletedEmployees.length}`}
        icon={Archive}
        actionButton={{
          text: t('navigation.backToList'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders/manage'),
          variant: 'secondary'
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t('employees.totalDeletedCount')}</p>
              <p className="text-3xl font-bold text-red-700">{deletedEmployees.length}</p>
            </div>
            <Archive className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">{t('employees.numberOfCountriesDeleted')}</p>
              <p className="text-3xl font-bold text-purple-700">
                {new Set(deletedEmployees.map(e => e.country)).size}
              </p>
            </div>
            <Archive className="text-purple-500" size={40} />
          </div>
        </div>

        <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">{t('employees.deletedThisMonth')}</p>
              <p className="text-3xl font-bold text-orange-700">
                {deletedEmployees.filter(e => {
                  const deleteDate = new Date(e.deletedAt);
                  const now = new Date();
                  return deleteDate.getMonth() === now.getMonth() &&
                    deleteDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Archive className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

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

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t('employees.noDeletedRecords')}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? t('employees.noMatchingResults') : t('employees.noEmployeesDeleted')}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredEmployees}
            loading={loading}
          />
        )}
      </Card>

      {/* Information Card */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.additionalInfo')}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <Archive size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.archive')}:</strong> {t('employees.archiveInfo')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <Archive size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.purpose')}:</strong> {t('employees.purposeInfo')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <Archive size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.note')}:</strong> {t('employees.noteInfo')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}