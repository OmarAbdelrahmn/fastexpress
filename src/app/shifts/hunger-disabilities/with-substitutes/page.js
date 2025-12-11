'use client';
import { useState } from 'react';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import { UserCheck, Search } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';


export default function WithSubstitutesPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        // The query object is no longer needed as hungerService handles parameters directly
        // const query = new URLSearchParams();
        // if (startDate) query.append('startDate', startDate);
        // if (endDate) query.append('endDate', endDate);

        setLoading(true);
        setSearched(true);
        setError(null);
        try {
            const jsonData = await hungerService.getWithSubstitutesReport(startDate, endDate);
            setData(Array.isArray(jsonData) ? jsonData : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const columns = data.length > 0 ? Object.keys(data[0]).map(key => ({
        header: key,
        accessor: key
    })) : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title="مع بدلاء"
                subtitle="تقرير العجز مع وجود بدلاء"
                icon={UserCheck}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
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
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <Search size={18} />
                                عرض التقرير
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {searched ? (
                        <Table
                            columns={columns}
                            data={data}
                            loading={loading}
                        />
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            اضغط على عرض التقرير للبحث
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
