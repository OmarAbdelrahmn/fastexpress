'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Filter, Search, Eye, Edit, X } from 'lucide-react';

export default function EmployeeMultiFilterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    iqamaEndH: '',
    iqamaEndM: '',
    sponsor: '',
    sponsorNo: '',
    passportEnd: '',
    jobTitle: '',
    nameAR: '',
    nameEN: '',
    country: '',
    status: '',
    inksa: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSearch = async (e) => {
    e?.preventDefault();

    setLoading(true);
    setErrorMessage('');
    setHasSearched(true);

    try {
      // Build query string with only non-empty filters
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });

      const data = await ApiService.get(
        `${API_ENDPOINTS.EMPLOYEE.SEARCH}?${queryParams.toString()}`
      );

      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error filtering employees:', err);
      setErrorMessage(err?.message || t('employees.searchError'));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      iqamaEndH: '',
      iqamaEndM: '',
      sponsor: '',
      sponsorNo: '',
      passportEnd: '',
      jobTitle: '',
      nameAR: '',
      nameEN: '',
      country: '',
      status: '',
      inksa: ''
    });
    setSearchResults([]);
    setHasSearched(false);
    setErrorMessage('');
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
    { header: t('employees.jobTitle'), accessor: 'jobTitle' },
    { header: t('employees.sponsor'), accessor: 'sponsor' },
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
            onClick={() => router.push(`/employees/admin/${row.iqamaNo}/details`)}
            className="text-green-600 hover:text-green-800 p-1"
            title={t('employees.viewDetails')}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => router.push(`/employees/admin/${row.iqamaNo}/edit`)}
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
        title={t('employees.filterTitle')}
        subtitle={t('employees.filterSubtitle')}
        icon={Filter}
      />

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Filter Form */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.searchCriteria')}</h3>

          {/* Personal Info Filters */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">{t('employees.personalInfoSection')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label={t('employees.nameArabic')}
                type="text"
                name="nameAR"
                value={filters.nameAR}
                onChange={handleInputChange}
                placeholder={t('employees.searchByNameArabicPlaceholder')}
              />

              <Input
                label={t('employees.nameEnglish')}
                type="text"
                name="nameEN"
                value={filters.nameEN}
                onChange={handleInputChange}
                placeholder={t('employees.searchByNameEnglishPlaceholder')}
              />

              <Input
                label={t('employees.country')}
                type="text"
                name="country"
                value={filters.country}
                onChange={handleInputChange}
                placeholder={t('employees.searchByCountryPlaceholder')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.status')}
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="enable">{t('employees.statusActive')}</option>
                  <option value="disable">{t('employees.statusInactive')}</option>
                  <option value="fleeing">{t('employees.statusFleeing')}</option>
                  <option value="vacation">{t('employees.statusVacation')}</option>
                  <option value="accident">{t('employees.statusAccident')}</option>
                  <option value="sick">{t('employees.statusSick')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('employees.inKSA')}
                </label>
                <select
                  name="inksa"
                  value={filters.inksa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="true">{t('common.yes')}</option>
                  <option value="false">{t('common.no')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Info Filters */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">{t('employees.workInfoSection')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label={t('employees.jobTitle')}
                type="text"
                name="jobTitle"
                value={filters.jobTitle}
                onChange={handleInputChange}
                placeholder={t('employees.searchByJobPlaceholder')}
              />

              <Input
                label={t('employees.sponsor')}
                type="text"
                name="sponsor"
                value={filters.sponsor}
                onChange={handleInputChange}
                placeholder={t('employees.searchBySponsorPlaceholder')}
              />

              <Input
                label={t('employees.sponsorNumber')}
                type="number"
                name="sponsorNo"
                value={filters.sponsorNo}
                onChange={handleInputChange}
                placeholder={t('employees.searchBySponsorNoPlaceholder')}
              />
            </div>
          </div>

          {/* Date Filters */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">{t('employees.datesSection')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label={t('employees.iqamaEndGregorian')}
                type="date"
                name="iqamaEndM"
                value={filters.iqamaEndM}
                onChange={handleInputChange}
              />

              <Input
                label={t('employees.iqamaEndHijri')}
                type="text"
                name="iqamaEndH"
                value={filters.iqamaEndH}
                onChange={handleInputChange}
                placeholder={t('employees.dateExample')}
              />

              <Input
                label={t('employees.passportEnd')}
                type="date"
                name="passportEnd"
                value={filters.passportEnd}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={loading}
            >
              <X size={18} className="ml-2" />
              {t('employees.reset')}
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Search size={18} className="ml-2" />
              {t('common.search')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t('employees.searchResults')} ({searchResults.length})
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">{t('employees.searching')}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">{t('employees.noResultsMatchCriteria')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('employees.tryModifyCriteria')}</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={searchResults}
              loading={loading}
            />
          )}
        </Card>
      )}

      {/* Instructions */}
      {!hasSearched && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.howToUse')}</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p>{t('employees.filterInstructions1')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p>{t('employees.filterInstructions2')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p>{t('employees.filterInstructions3')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
