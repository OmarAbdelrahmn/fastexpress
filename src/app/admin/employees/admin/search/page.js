'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { Search, User, Eye, Edit, Building, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function EmployeeSmartSearchPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!searchKeyword.trim()) {
      setErrorMessage(t('employees.enterSearchKeyword'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setHasSearched(true);

    try {
      const data = await ApiService.get(
        `${API_ENDPOINTS.EMPLOYEE.SMART_SEARCH}?q=${encodeURIComponent(searchKeyword)}`
      );

      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching employees:', err);
      setErrorMessage(err?.message || t('employees.searchError'));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (iqamaNo) => {
    router.push(`/admin/employees/admin/${iqamaNo}/details`);
  };

  const handleEdit = (iqamaNo) => {
    router.push(`/admin/employees/admin/${iqamaNo}/edit`);
  };

  const columns = [
    { header: t('employees.iqamaNumber'), accessor: 'iqamaNo' },
    { header: t('employees.nameArabic'), accessor: 'nameAR' },
    { header: t('employees.nameEnglish'), accessor: 'nameEN' },
    {
      header: t('employees.jobTitle'),
      accessor: 'jobTitle',
      render: (row) => (
        <span className="text-gray-600 font-medium">{row.jobTitle || t('common.notAvailable')}</span>
      )
    },
    {
      header: t('employees.sponsor'),
      accessor: 'sponsor',
      render: (row) => (
        <span className="text-gray-600">{row.sponsor || t('common.notAvailable')}</span>
      )
    },
    {
      header: t('common.status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row.iqamaNo)}
            className="text-green-600 hover:text-green-800 p-1"
            title={t('common.details')}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row.iqamaNo)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('common.edit')}
          >
            <Edit size={18} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.smartSearchTitle')}
        subtitle={t('employees.smartSearchSubtitle')}
        icon={Search}
      />

      {/* Search Input */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('employees.searchKeyword')}
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('employees.searchPlaceholderFull')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button type="submit" loading={loading} disabled={loading}>
                <Search size={18} className="ml-2" />
                {t('common.search')}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>{t('employees.tip')}:</strong> {t('employees.searchTipText')}
            </p>
          </div>
        </form>
      </Card>

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t('employees.searchResults')} ({searchResults.length})
          </h3>

          <Table
            columns={columns}
            data={searchResults}
            loading={loading}
          />
        </Card>
      )}

      {/* Search Tips */}
      {!hasSearched && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.searchTips')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('employees.searchByName')}</h4>
              <p className="text-sm text-gray-600">
                {t('employees.searchByNameDesc')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('employees.searchByCountry')}</h4>
              <p className="text-sm text-gray-600">
                {t('employees.searchByCountryDesc')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('employees.searchBySponsor')}</h4>
              <p className="text-sm text-gray-600">
                {t('employees.searchBySponsorDesc')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('employees.searchByJob')}</h4>
              <p className="text-sm text-gray-600">
                {t('employees.searchByJobDesc')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}