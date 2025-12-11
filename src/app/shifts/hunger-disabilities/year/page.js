'use client';
import { useState } from 'react';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import { Calendar, Search, FileSpreadsheet } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';
import { hungerReportColumns } from '../reportColumns';
import * as XLSX from 'xlsx';


export default function YearPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setError(null);
        try {
            const jsonData = await hungerService.getYearReport(year);
            setData(Array.isArray(jsonData) ? jsonData : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!data || data.length === 0) return;

        // Map data to headers
        const exportData = data.map(item => {
            const row = {};
            hungerReportColumns.forEach(col => {
                if (col.accessor === 'performancePercentage' || col.accessor === 'performanceStatus') {
                    row[col.header] = item[col.accessor];
                } else if (col.render && (col.accessor === 'substituteWorkingId' || col.accessor === 'substituteRiderNameAR')) {
                    const val = item[col.accessor];
                    row[col.header] = val || 'لا يوجد';
                } else if (col.accessor) {
                    row[col.header] = item[col.accessor];
                }
            });
            return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Hunger Report');
        XLSX.writeFile(workbook, `Hunger_Report_Year_${year}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            <PageHeader
                title="التقرير السنوي"
                subtitle="عرض عجز هنجر لسنة محددة"
                icon={Calendar}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <Search size={18} />
                                عرض التقرير
                            </Button>

                            {data.length > 0 && (
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                                >
                                    <FileSpreadsheet size={18} />
                                    طباعة لملف Excel
                                </Button>
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
                                تقرير سنة: <span className="font-bold text-gray-900">{year}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <Table
                                    columns={hungerReportColumns}
                                    data={data}
                                    loading={loading}
                                />
                            </div>
                        </>
                    )}
                    {!searched && (
                        <div className="text-center text-gray-500 py-12">
                            الرجاء اختيار الفترة والضغط على عرض التقرير
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
