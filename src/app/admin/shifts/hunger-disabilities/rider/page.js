'use client';
import { useState } from 'react';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import { User, Search } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';
import { getHungerReportColumns } from '../reportColumns';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function RiderPage() {
    const { t, language } = useLanguage();
    const [workingId, setWorkingId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!workingId) return;

        setLoading(true);
        setSearched(true);
        setError(null);
        try {
            const jsonData = await hungerService.getRiderReport(workingId, startDate, endDate);
            setData(Array.isArray(jsonData) ? jsonData : [jsonData]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = getHungerReportColumns(t);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hungerDisabilities.riderDeficit')}
                subtitle={t('hungerDisabilities.riderDeficitDesc')}
                icon={User}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('hungerDisabilities.workingId')}</label>
                            <input
                                type="text"
                                value={workingId}
                                onChange={(e) => setWorkingId(e.target.value)}
                                placeholder={t('hungerDisabilities.searchByWorkingId')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shifts.startDate')}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('shifts.endDate')}</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <Button
                                onClick={handleSearch}
                                disabled={loading || !workingId}
                                className="flex items-center gap-2"
                            >
                                <Search size={18} />
                                {t('shifts.search')}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {searched && (
                        <div className="overflow-x-auto">
                            <Table
                                columns={columns}
                                data={data}
                                loading={loading}
                            />
                        </div>
                    )}
                    {!searched && (
                        <div className="text-center text-gray-500 py-12">
                            {t('hungerDisabilities.searchByWorkingId')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
