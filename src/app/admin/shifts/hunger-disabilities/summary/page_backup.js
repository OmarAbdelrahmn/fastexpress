'use client';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import { BarChart3 } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';
import { useLanguage } from '@/lib/context/LanguageContext';


export default function SummaryPage() {
    const { t } = useLanguage();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const jsonData = await hungerService.getSummary();
            // Handle both array (table) or object (convert to array or specific display)
            // Assuming array for Table component for now, or wrapping object in array
            setData(Array.isArray(jsonData) ? jsonData : [jsonData]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Define generic columns since we don't know exact fields
    // In a real scenario, we'd inspect the API or have a spec. 
    // For now, I'll generate columns dynamically from the first item if possible, 
    // or define some likely ones.
    const columns = data.length > 0 ? Object.keys(data[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        accessor: key
    })) : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('substitution.summary')}
                subtitle={t('substitution.summaryDesc')}
                icon={BarChart3}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <Table
                        columns={columns}
                        data={data}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
