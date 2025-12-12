'use client';
import { useState } from 'react';
import PageHeader from '@/components/layout/pageheader';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ImportPage() {
    const { t } = useLanguage();
    const [file, setFile] = useState(null);
    const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResponse(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const data = await hungerService.importHungerFile(file, shiftDate);
            setResponse(data);
        } catch (err) {
            setError(err.message || t('hungerDisabilities.importError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hungerDisabilities.importFile')}
                subtitle={t('hungerDisabilities.importFileDesc')}
                icon={Upload}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t('shifts.shiftDate')}
                        </label>
                        <input
                            type="date"
                            value={shiftDate}
                            onChange={(e) => setShiftDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t('hungerDisabilities.selectFile')}
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">{t('common.import')}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">XLSX, XLS</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    {file && (
                        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-between">
                            <span className="truncate">{file.name}</span>
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-white font-bold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {loading ? t('common.loading') : t('common.import')}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {response && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CheckCircle className="text-green-500" /> {t('common.results')}
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-100 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-500">{t('hungerDisabilities.recordsCount')}</p>
                                    <p className="text-2xl font-bold">{response.totalRecords}</p>
                                </div>
                                <div className="bg-green-100 p-4 rounded-lg text-center">
                                    <p className="text-sm text-green-600">{t('common.success')}</p>
                                    <p className="text-2xl font-bold text-green-700">{response.successCount}</p>
                                </div>
                                <div className="bg-red-100 p-4 rounded-lg text-center">
                                    <p className="text-sm text-red-600">{t('common.error')}</p>
                                    <p className="text-2xl font-bold text-red-700">{response.errorCount}</p>
                                </div>
                            </div>

                            {response.errors && response.errors.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-bold mb-2 flex items-center gap-2 text-red-600">
                                        <AlertTriangle /> {t('common.details')}
                                    </h4>
                                    <div className="bg-white border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('shifts.row')}</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('hungerDisabilities.workingId')}</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.reason')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {response.errors.map((err, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{err.rowNumber}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{err.workingId}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{err.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
