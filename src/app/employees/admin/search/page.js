'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
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
    router.push(`/employees/admin/${iqamaNo}/details`);
  };

  const handleEdit = (iqamaNo) => {
    router.push(`/employees/admin/${iqamaNo}/edit`);
  };

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

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">{t('employees.searching')}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">{t('employees.noResultsMatch')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('employees.tryDifferentKeywords')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((employee) => (
                <div
                  key={employee.iqamaNo}
                  className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{employee.nameAR}</h4>
                        <p className="text-xs text-gray-500">{employee.nameEN}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.status === 'Enable'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      }`}>
                      {employee.status === 'Enable' ? t('status.enable') : t('status.disable')}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={14} />
                      <span className="text-xs">{t('employees.iqamaNumber')}: {employee.iqamaNo}</span>
                    </div>

                    {employee.country && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={14} />
                        <span className="text-xs">{employee.country}</span>
                      </div>
                    )}

                    {employee.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={14} />
                        <span className="text-xs">{employee.phone}</span>
                      </div>
                    )}

                    {employee.jobTitle && (
                      <div className="bg-green-50 border border-green-200 p-2 rounded">
                        <p className="text-xs text-green-700">
                          <strong>{t('employees.jobTitle')}:</strong> {employee.jobTitle}
                        </p>
                      </div>
                    )}

                    {employee.sponsor && (
                      <div className="bg-purple-50 border border-purple-200 p-2 rounded">
                        <p className="text-xs text-purple-700">
                          <strong>{t('employees.sponsor')}:</strong> {employee.sponsor}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDetails(employee.iqamaNo)}
                      variant="secondary"
                      className="flex-1 text-sm"
                    >
                      <Eye size={16} className="ml-1" />
                      {t('common.details')}
                    </Button>
                    <Button
                      onClick={() => handleEdit(employee.iqamaNo)}
                      className="flex-1 text-sm"
                    >
                      <Edit size={16} className="ml-1" />
                      {t('common.edit')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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