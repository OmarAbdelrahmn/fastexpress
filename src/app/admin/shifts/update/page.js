'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function UpdateShiftsPage() {
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [updateResult, setUpdateResult] = useState(null);

    const handleUpdate = async () => {
        if (!uploadFile) {
            setMessage({ type: 'error', text: t('shifts.selectFile') });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        setUpdateResult(null);

        try {
            const result = await ApiService.uploadFile(API_ENDPOINTS.SHIFT.UPDATE_EXCEL, uploadFile);

            setUpdateResult(result);
            const successCount = result.successCount || 0;
            const totalRecords = result.totalRecords || 0;
            setMessage({
                type: 'success',
                text: `${t('shifts.updateSuccess') || 'Update Successful'}: ${successCount} / ${totalRecords}`
            });
            setUploadFile(null);

        } catch (error) {
            console.error('Update error:', error);
            setMessage({
                type: 'error',
                text: error.message || t('shifts.updateError') || 'Update Failed'
            });
        } finally {
            setLoading(false);
        }
    };


    const safeRender = (value, fallback = '-') => {
        if (value === null || value === undefined || value === '') return fallback;
        return value;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
            <PageHeader
                title={t('shifts.updateShifts') || 'Update Shifts'}
                subtitle={t('shifts.updateShiftsSubtitle') || 'Update existing shifts via Excel'}
                icon={RefreshCw}
            />

            <div className="p-6 space-y-6">
                {/* Message Alert */}
                {message.text && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                        message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                            'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> :
                            message.type === 'warning' ? <AlertCircle size={20} /> :
                                <XCircle size={20} />}
                        <span className="flex-1">{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70">✕</button>
                    </div>
                )}

                {/* Upload Control */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="max-w-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.excelFile')}</label>
                        <div className="flex gap-4">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={handleUpdate}
                                disabled={loading || !uploadFile}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        {t('shifts.update') || 'Update'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {updateResult && (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-gray-500 text-sm mb-1">{t('shifts.totalRecords')}</p>
                                <p className="text-2xl font-bold text-gray-800">{safeRender(updateResult.totalRecords, 0)}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                                <p className="text-green-600 text-sm mb-1">{t('shifts.successfulUpdate') || 'Successful Updates'}</p>
                                <p className="text-2xl font-bold text-green-700">{safeRender(updateResult.successCount, 0)}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
                                <p className="text-red-600 text-sm mb-1">{t('shifts.notFound') || 'Not Found'}</p>
                                <p className="text-2xl font-bold text-red-700">{safeRender(updateResult.notFoundCount, 0)}</p>
                            </div>
                        </div>

                        {/* Successful Updates Table */}
                        {updateResult.successfulUpdates && updateResult.successfulUpdates.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-green-600 px-6 py-4 flex items-center gap-2">
                                    <CheckCircle className="text-white" size={20} />
                                    <h3 className="text-lg font-bold text-white">{t('shifts.successfulUpdatesList') || 'Successful Updates'}</h3>
                                </div>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.row')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.name')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.date')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.oldOrders') || 'Old Orders'}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.newOrders') || 'New Orders'}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.company')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {updateResult.successfulUpdates.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rowNumber}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.actualWorkingId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.riderName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shiftDate ? new Date(item.shiftDate).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.oldAcceptedOrders}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{item.newAcceptedOrders}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.companyName}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Not Found Shifts Table */}
                        {updateResult.notFoundShifts && updateResult.notFoundShifts.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-red-600 px-6 py-4 flex items-center gap-2">
                                    <XCircle className="text-white" size={20} />
                                    <h3 className="text-lg font-bold text-white">{t('shifts.notFoundShiftsList') || 'Not Found Shifts'}</h3>
                                </div>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.row')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.date')}</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.reason')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {updateResult.notFoundShifts.map((item, index) => (
                                                <tr key={index} className="hover:bg-red-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rowNumber}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.workingId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shiftDate ? new Date(item.shiftDate).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{item.reason}</td>
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
    );
}
