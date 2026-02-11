'use client';
import { useState } from 'react';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import { Calendar, Search, FileSpreadsheet } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';
import { getHungerReportColumns } from '../reportColumns';
import * as XLSX from 'xlsx';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function DateRangePage() {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!startDate || !endDate) return;

        setLoading(true);
        setSearched(true);
        setError(null);
        try {
            const jsonData = await hungerService.getDateRangeReport(startDate, endDate);
            setData(Array.isArray(jsonData) ? jsonData : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!data || data.length === 0) return;

        const columns = getHungerReportColumns(t);
        // Map data to headers
        const exportData = data.map(item => {
            const row = {};
            columns.forEach(col => {
                if (col.accessor === 'performancePercentage' || col.accessor === 'performanceStatus') {
                    // Skip complex components or handle text
                    row[col.header] = item[col.accessor];
                } else if (col.render && (col.accessor === 'substituteWorkingId' || col.accessor === 'substituteRiderNameAR')) {
                    // Use the render logic for fallback text (since render returns string here)
                    const val = item[col.accessor];
                    row[col.header] = val || t('common.noData');
                } else if (col.accessor) {
                    row[col.header] = item[col.accessor];
                }
            });

            return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Hunger Report');
        XLSX.writeFile(workbook, `Hunger_Report_${startDate}_${endDate}.xlsx`);
    };

    const handleKamalExport = () => {
        if (!data || data.length === 0) return;

        const columns = getHungerReportColumns(t);
        // Map data to headers
        const exportData = data.map(item => {
            const row = {};
            columns.forEach(col => {
                // Skip substitution columns for Kamal Export
                if (col.accessor === 'substituteWorkingId' || col.accessor === 'substituteRiderNameAR') {
                    return;
                }

                let cellValue = item[col.accessor];

                // Kamal Logic: Override main fields if substitute exists
                if (col.accessor === 'actualRiderNameAR' && item.substituteRiderNameAR) {
                    cellValue = item.substituteRiderNameAR;
                }
                if (col.accessor === 'actualWorkingId' && item.substituteWorkingId) {
                    cellValue = item.substituteWorkingId;
                }

                if (col.accessor === 'performancePercentage' || col.accessor === 'performanceStatus') {
                    // Skip complex components or handle text
                    row[col.header] = cellValue;
                } else if (col.accessor) {
                    row[col.header] = cellValue;
                }
            });

            return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Kamal Report');
        XLSX.writeFile(workbook, `Kamal_Report_${startDate}_${endDate}.xlsx`);
    };

    const columns = getHungerReportColumns(t);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hungerDisabilities.dateRange')}
                subtitle={t('hungerDisabilities.dateRangeDesc')}
                icon={Calendar}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-wrap items-end gap-4">
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
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleSearch}
                                disabled={loading || !startDate || !endDate}
                                className="flex items-center gap-2"
                            >
                                <Search size={18} />
                                {t('shifts.search')}
                            </Button>

                            {data.length > 0 && (
                                <>
                                    <Button
                                        onClick={handleExport}
                                        variant="outline"
                                        className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                                    >
                                        <FileSpreadsheet size={18} />
                                        {t('hungerDisabilities.exportToExcel')}
                                    </Button>
                                    <Button
                                        onClick={handleKamalExport}
                                        variant="outline"
                                        className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                                    >
                                        <FileSpreadsheet size={18} />
                                        Kamal Export
                                    </Button>
                                </>
                            )}
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
                        <>
                            <div className="mb-4 text-sm text-gray-500">
                                {t('hungerDisabilities.dateRange')}: <span className="font-bold text-gray-900">{startDate}</span> {t('shifts.to')}: <span className="font-bold text-gray-900">{endDate}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <Table
                                    columns={columns}
                                    data={data}
                                    loading={loading}
                                />
                            </div>
                        </>
                    )}
                    {!searched && (
                        <div className="text-center text-gray-500 py-12">
                            {t('hungerDisabilities.selectPeriod')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
