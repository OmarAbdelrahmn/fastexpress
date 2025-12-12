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
import { Filter, Search, Eye, Edit, X } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function RiderMultiFilterPage() {
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
        inksa: '',
        workingId: '',
        companyName: ''
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
                `${API_ENDPOINTS.RIDER.SEARCH}?${queryParams.toString()}`
            );

            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error filtering riders:', err);
            setErrorMessage(err?.message || t('riders.searchError'));
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
            inksa: '',
            workingId: '',
            companyName: ''
        });
        setSearchResults([]);
        setHasSearched(false);
        setErrorMessage('');
    };

    const columns = [
        {
            header: t('riders.iqamaNumber'),
            accessor: 'iqamaNo',
            render: (row) => (
                <span className="font-bold text-blue-600">{row.iqamaNo}</span>
            )
        },
        { header: t('riders.nameArabic'), accessor: 'nameAR' },
        { header: t('riders.nameEnglish'), accessor: 'nameEN' },
        { header: t('riders.workingId'), accessor: 'workingId' },
        { header: t('riders.company'), accessor: 'companyName' },
        {
            header: t('riders.status'),
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            header: t('riders.actions'),
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/riders/${row.iqamaNo}`)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title={t('riders.viewDetails')}
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => router.push(`/riders/${row.iqamaNo}/edit`)}
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
                title={t('riders.filterTitle')}
                subtitle={t('riders.filterSubtitle')}
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
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.searchCriteria')}</h3>

                    {/* Personal Info Filters */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">{t('riders.personalInformation')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label={t('riders.nameArabic')}
                                type="text"
                                name="nameAR"
                                value={filters.nameAR}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchByArabicName')}
                            />

                            <Input
                                label={t('riders.nameEnglish')}
                                type="text"
                                name="nameEN"
                                value={filters.nameEN}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchByEnglishName')}
                            />

                            <Input
                                label={t('riders.country')}
                                type="text"
                                name="country"
                                value={filters.country}
                                onChange={handleInputChange}
                                placeholder={t('employees.searchByCountryPlaceholder')}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('riders.status')}
                                </label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">{t('riders.all')}</option>
                                    <option value="enable">{t('riders.active')}</option>
                                    <option value="disable">{t('riders.inactive')}</option>
                                    <option value="fleeing">{t('riders.fleeing')}</option>
                                    <option value="vacation">{t('riders.vacation')}</option>
                                    <option value="accident">{t('riders.accident')}</option>
                                    <option value="sick">{t('riders.sick')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('riders.inKSAFilter')}
                                </label>
                                <select
                                    name="inksa"
                                    value={filters.inksa}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">{t('riders.all')}</option>
                                    <option value="true">{t('common.yes')}</option>
                                    <option value="false">{t('common.no')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Work Info Filters */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">{t('riders.workInformation')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label={t('riders.workingId')}
                                type="text"
                                name="workingId"
                                value={filters.workingId}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchByWorkingId')}
                            />

                            <Input
                                label={t('riders.company')}
                                type="text"
                                name="companyName"
                                value={filters.companyName}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchByCompany')}
                            />

                            <Input
                                label={t('riders.jobTitle')}
                                type="text"
                                name="jobTitle"
                                value={filters.jobTitle}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchByJobTitle')}
                            />

                            <Input
                                label={t('riders.sponsor')}
                                type="text"
                                name="sponsor"
                                value={filters.sponsor}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchBySponsorName')}
                            />

                            <Input
                                label={t('riders.sponsorNumber')}
                                type="number"
                                name="sponsorNo"
                                value={filters.sponsorNo}
                                onChange={handleInputChange}
                                placeholder={t('riders.searchBySponsorNo')}
                            />
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">{t('riders.dates')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label={t('riders.iqamaEndGregorian')}
                                type="date"
                                name="iqamaEndM"
                                value={filters.iqamaEndM}
                                onChange={handleInputChange}
                            />

                            <Input
                                label={t('riders.iqamaEndHijri')}
                                type="text"
                                name="iqamaEndH"
                                value={filters.iqamaEndH}
                                onChange={handleInputChange}
                                placeholder={t('employees.dateExample')}
                            />

                            <Input
                                label={t('riders.passportEnd')}
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
                            {t('riders.reset')}
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
                        {t('riders.resultsCount')} ({searchResults.length})
                    </h3>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">{t('riders.searching')}</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600">{t('riders.noResultsMatch')}</p>
                            <p className="text-sm text-gray-500 mt-2">{t('riders.tryModifyingCriteria')}</p>
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
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.howToUse')}</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p>{t('riders.filterInstruction1')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>{t('riders.filterInstruction2')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>{t('riders.filterInstruction3')}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
