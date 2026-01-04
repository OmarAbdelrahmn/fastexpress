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
import { Search, UserCheck, Eye, Edit, Building, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function RiderSmartSearchPage() {
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
      setErrorMessage(t('riders.enterSearchKeyword'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setHasSearched(true);

    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.SMART_SEARCH, {
        keyword: searchKeyword
      });

      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching riders:', err);
      setErrorMessage(err?.message || t('riders.searchError'));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (iqamaNo) => {
    router.push(`/admin/riders/${iqamaNo}/details`);
  };

  const handleEdit = (iqamaNo) => {
    router.push(`/admin/riders/${iqamaNo}/edit`);
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
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('riders.smartSearchTitle')}
        subtitle={t('riders.smartSearchSubtitle')}
        icon={Search}
      />

      {/* Search Input */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('riders.searchKeyword')}
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('riders.searchPlaceholderFull')}
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
              <strong>{t('riders.tip')}:</strong> {t('riders.searchTipText')}
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
            {t('riders.searchResults')} ({searchResults.length})
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.searchTips')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('riders.searchByName')}</h4>
              <p className="text-sm text-gray-600">
                {t('riders.searchByNameDesc')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('riders.searchByCountry')}</h4>
              <p className="text-sm text-gray-600">
                {t('riders.searchByCountryDesc')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('riders.searchBySponsor')}</h4>
              <p className="text-sm text-gray-600">
                {t('riders.searchBySponsorDesc')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-2">{t('riders.searchByJob')}</h4>
              <p className="text-sm text-gray-600">
                {t('riders.searchByJobDesc')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}