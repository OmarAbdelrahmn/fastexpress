'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Calendar, Search, Download, Filter, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DateRangeHistoryPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!startDate || !endDate) {
            setErrorMessage(t('employees.enterStartEndDate'));
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setErrorMessage(t('employees.startBeforeEnd'));
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setHasSearched(true);

        try {
            const data = await ApiService.get(
                `/api/employee/date-range?startDate=${startDate}&endDate=${endDate}`
            );

            setSearchResults(data);
            console.log(data);
            setSuccessMessage(t('employees.foundRecords').replace('{{count}}', data.totalRecords));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error searching history:', err);
            setErrorMessage(err?.message || t('employees.searchError'));
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setSearchResults(null);
        setHasSearched(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleExport = () => {
        if (!searchResults?.data || searchResults.data.length === 0) return;

        const exportData = searchResults.data.map(record => ({
            [t('employees.iqamaNumber')]: record.iqamaNo,
            [t('employees.nameArabic')]: record.employeeNameAR,
            [t('employees.nameEnglish')]: record.employeeNameEN,
            [t('employees.requestedStatus')]: record.requestedStatus,
            [t('common.reason')]: record.reason || '',
            [t('employees.requestedBy')]: record.requestedBy,
            [t('employees.requestDate')]: new Date(record.requestedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US'),
            [t('employees.resolution')]: record.isResolved ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
            [t('employees.approved')]: record.resolution || '-',
            [t('employees.resolvedBy')]: record.resolvedBy || '-',
            [t('employees.resolvedDate')]: record.resolvedAt ? new Date(record.resolvedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US') : '-'
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Status Changes");
        XLSX.writeFile(workbook, `status_changes_${startDate}_to_${endDate}.xlsx`);
    };

    const getResolutionBadge = (isResolved, resolution) => {
        if (!isResolved) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Clock size={12} />
                    {t('employees.pending')}
                </span>
            );
        }
        if (resolution === 'Approved') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle size={12} />
                    {t('employees.approved')}
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle size={12} />
                {t('employees.rejected')}
            </span>
        );
    };

    const columns = [
        {
            header: t('employees.iqamaNumber'),
            accessor: 'iqamaNo',
            render: (row) => (
                <button
                    onClick={() => router.push(`/admin/riders/manage/history/${row.iqamaNo}`)}
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {row.iqamaNo}
                </button>
            )
        },
        {
            header: t('common.name'),
            accessor: 'employeeNameAR',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.employeeNameAR}</span>
                    <span className="text-xs text-gray-500">{row.employeeNameEN}</span>
                </div>
            )
        },
        {
            header: t('employees.requestedStatus'),
            accessor: 'requestedStatus',
            render: (row) => <StatusBadge status={row.requestedStatus} />
        },
        {
            header: t('employees.requestedBy'),
            accessor: 'requestedBy',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <User size={14} className="text-gray-500" />
                    <span>{row.requestedBy}</span>
                </div>
            )
        },
        {
            header: t('employees.requestDate'),
            accessor: 'requestedAt',
            render: (row) => (
                <span className="text-sm text-gray-600">
                    {row.requestedAt ? new Date(row.requestedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US') : '-'}
                </span>
            )
        },
        {
            header: t('employees.resolvedBy'),
            accessor: 'resolvedBy',
            render: (row) => row.resolvedBy || '-'
        },
        {
            header: t('employees.resolvedDate'),
            accessor: 'resolvedAt',
            render: (row) => (
                <span className="text-sm text-gray-600">
                    {row.resolvedAt ? new Date(row.resolvedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US') : '-'}
                </span>
            )
        },
        {
            header: t('employees.resolution'),
            render: (row) => getResolutionBadge(row.isResolved, row.resolution)
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('employees.dateRangeTitle')}
                subtitle={t('employees.dateRangeSubtitle')}
                icon={Calendar}
            />

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

            {/* Search Form */}
            <Card>
                <form onSubmit={handleSearch} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Filter size={20} />
                        {t('employees.specifyTimeRange')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={t('employees.startDate')}
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                        <Input
                            label={t('employees.endDate')}
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            {t('employees.reset')}
                        </Button>
                        <Button type="submit" loading={loading} disabled={loading}>
                            <Search size={18} className="ml-2" />
                            {t('common.search')}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Results */}
            {hasSearched && searchResults && (
                <>
                    {/* Summary Card */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{t('employees.searchResults')}</h3>
                                <p className="text-sm text-gray-600">
                                    {t('employees.fromStatus')} {new Date(searchResults.startDate).toLocaleDateString(language === 'ar' ? 'en-US' : 'en-US')}
                                    {' '}{t('employees.toStatus')}{' '}
                                    {new Date(searchResults.endDate).toLocaleDateString(language === 'ar' ? 'en-US' : 'en-US')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-left">
                                    <p className="text-sm text-gray-600">{t('employees.totalRecords')}</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {searchResults.totalRecords}
                                    </p>
                                </div>
                                {searchResults.totalRecords > 0 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleExport}
                                    >
                                        <Download size={18} className="ml-2" />
                                        {t('common.exportExcel')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Results Table */}
                    <Card>
                        {searchResults.data && searchResults.data.length > 0 ? (
                            <Table
                                columns={columns}
                                data={searchResults.data}
                                loading={loading}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-600">{t('employees.noRecordsInRange')}</p>
                            </div>
                        )}
                    </Card>
                </>
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
                            <p>{t('employees.dateRangeInstructions1')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>{t('employees.dateRangeInstructions2')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>{t('employees.dateRangeInstructions3')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">4</span>
                            </div>
                            <p>{t('employees.dateRangeInstructions4')}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

