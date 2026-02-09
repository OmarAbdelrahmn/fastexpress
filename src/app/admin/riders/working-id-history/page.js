'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { History, Search, Building, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function WorkingIdHistoryPage() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const initialIqama = searchParams.get('iqama') || '';

    const [iqamaNo, setIqamaNo] = useState(initialIqama);
    const [loading, setLoading] = useState(false);
    const [allRiders, setAllRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [data, setData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchHistory = async (searchIqama) => {
        if (!searchIqama || searchIqama.toString().trim() === '') {
            setErrorMessage(t('riders.enterIqamaNumber'));
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setData(null);
        setShowResults(false);

        try {
            const response = await ApiService.get(API_ENDPOINTS.REPORTS.WORKING_ID_HISTORY(searchIqama));
            setData(response);
            setIqamaNo(searchIqama);
        } catch (err) {
            console.error('Error fetching working ID history:', err);
            setErrorMessage(err?.message || t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        fetchHistory(iqamaNo);
    };

    // Load all riders on mount
    useEffect(() => {
        const loadRiders = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.RIDER.LIST);
                setAllRiders(Array.isArray(response) ? response : []);
            } catch (err) {
                console.error('Error loading riders:', err);
            }
        };
        loadRiders();

        if (initialIqama) {
            fetchHistory(initialIqama);
        }
    }, [initialIqama]);

    const handleNameSearch = (term) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredRiders([]);
            setShowResults(false);
            return;
        }

        const filtered = allRiders.filter(rider =>
            rider.nameAR?.toLowerCase().includes(term.toLowerCase()) ||
            rider.nameEN?.toLowerCase().includes(term.toLowerCase()) ||
            rider.iqamaNo?.toString().includes(term) ||
            rider.workingId?.toString().includes(term)
        ).slice(0, 10); // Limit to 10 results for performance

        setFilteredRiders(filtered);
        setShowResults(true);
    };

    const selectRider = (rider) => {
        setIqamaNo(rider.iqamaNo);
        setSearchTerm(`${rider.nameAR || rider.nameEN} (${rider.workingId || 'N/A'})`);
        setShowResults(false);
        fetchHistory(rider.iqamaNo);
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('riders.currentlyActive');
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('riders.workingIdHistory')}
                subtitle={t('riders.viewWorkingIdHistoryDesc')}
                icon={History}
            />

            {/* Search Section */}
            <Card>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('riders.searchByAnyInfo')}
                            </label>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleNameSearch(e.target.value)}
                                    placeholder={t('riders.searchPlaceholder')}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {showResults && filteredRiders.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                    {filteredRiders.map((rider) => (
                                        <button
                                            key={rider.iqamaNo}
                                            type="button"
                                            onClick={() => selectRider(rider)}
                                            className="w-full text-right px-4 py-2 hover:bg-orange-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{rider.nameAR || rider.nameEN}</span>
                                                <span className="text-xs text-gray-500">
                                                    {t('riders.iqamaNumber')}: {rider.iqamaNo} | {t('riders.workingId')}: {rider.workingId || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {rider.companyName}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-64">
                            <Input
                                label={t('riders.iqamaNumber')}
                                type="text"
                                value={iqamaNo}
                                onChange={(e) => setIqamaNo(e.target.value)}
                                placeholder={t('riders.enterIqamaNumber')}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button type="submit" loading={loading} disabled={loading || !iqamaNo}>
                                <Search size={18} className="ml-2" />
                                {t('common.search')}
                            </Button>
                        </div>
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

            {loading && (
                <Card>
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                    </div>
                </Card>
            )}

            {data && !loading && (
                <div className="space-y-6">
                    {/* Rider Information */}
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.riderInfo')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-blue-600 mb-1 text-sm">{t('riders.nameArabic')}</p>
                                <p className="font-bold text-gray-800">{data.riderNameAR}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-blue-600 mb-1 text-sm">{t('riders.nameEnglish')}</p>
                                <p className="font-bold text-gray-800">{data.riderNameEN}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-green-600 mb-1 text-sm">{t('riders.currentWorkingId')}</p>
                                <p className="font-bold text-gray-800 text-xl">{data.currentWorkingId}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-green-600 mb-1 text-sm">{t('riders.currentCompany')}</p>
                                <p className="font-bold text-gray-800 flex items-center gap-2">
                                    <Building size={16} />
                                    {data.currentCompanyName}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs mb-0.5">{t('riders.totalCompanyChanges')}</p>
                                    <h3 className="text-2xl font-bold text-blue-600">{data.totalCompanyChanges}</h3>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Building className="text-blue-600 w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs mb-0.5">{t('riders.totalWorkingIdChanges')}</p>
                                    <h3 className="text-2xl font-bold text-purple-600">{data.totalWorkingIdChanges}</h3>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <History className="text-purple-600 w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* History Timeline */}
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={20} />
                            {t('riders.historyTimeline')}
                        </h3>

                        {data.history && data.history.length > 0 ? (
                            <div className="space-y-4">
                                {data.history.map((record, index) => (
                                    <div
                                        key={record.id}
                                        className={`border-r-4 p-4 rounded-lg ${record.isActive
                                            ? 'bg-green-50 border-green-500'
                                            : 'bg-gray-50 border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-xl font-bold text-gray-900">
                                                        {record.workingId}
                                                    </h4>
                                                    {record.isActive && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                            <CheckCircle size={14} className="ml-1" />
                                                            {t('riders.currentlyActive')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">{t('riders.company')}</p>
                                                        <p className="font-medium text-gray-800 flex items-center gap-1">
                                                            <Building size={14} />
                                                            {record.companyName}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">{t('common.startDate')}</p>
                                                        <p className="font-medium text-gray-800 flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {formatDate(record.startDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">{t('common.endDate')}</p>
                                                        <p className="font-medium text-gray-800 flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            {formatDate(record.endDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">{t('riders.durationDays')}</p>
                                                        <p className="font-bold text-blue-600 flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {record.durationDays} {t('common.day')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <XCircle size={48} className="mx-auto mb-2 text-gray-400" />
                                <p>{t('riders.noHistoryFound')}</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
