'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
    History, ArrowRight, User, TrendingUp, CheckCircle,
    XCircle, Clock, Calendar, FileText, Building, Home
} from 'lucide-react';

export default function EmployeeHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const { t, language } = useLanguage();
    const iqamaNo = params?.iqamaNo;

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [historyData, setHistoryData] = useState(null);

    useEffect(() => {
        if (iqamaNo) {
            loadHistory();
        }
    }, [iqamaNo]);

    const loadHistory = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const data = await ApiService.get(`/api/Temp/employee/history/${iqamaNo}`);
            setHistoryData(data);
        } catch (err) {
            console.error('Error loading employee history:', err);
            setErrorMessage(err?.message || t('employees.historyLoadError'));
        } finally {
            setLoading(false);
        }
    };

    const getResolutionBadge = (resolution) => {
        if (resolution === 'Approved') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('employees.approved')}
                </span>
            );
        } else if (resolution === 'Rejected') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {t('employees.rejected')}
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {t('employees.pending')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={t('employees.historyTitle')}
                    subtitle={t('common.loading')}
                    icon={History}
                />
                <Card>
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">{t('employees.loadingHistory')}</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!historyData) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={t('employees.historyTitle')}
                    subtitle={t('employees.noHistoryData')}
                    icon={History}
                    actionButton={{
                        text: t('common.back'),
                        icon: <ArrowRight size={18} />,
                        onClick: () => router.push('/admin/riders/manage'),
                        variant: 'secondary'
                    }}
                />
                <Card>
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {t('employees.noData')}
                        </h3>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('employees.historySubtitle')}
                subtitle={`${t('employees.iqamaNumber')}: ${historyData.iqamaNo}`}
                icon={History}
                actionButton={{
                    text: t('common.back'),
                    icon: <ArrowRight size={18} />,
                    onClick: () => router.push('/admin/riders/manage'),
                    variant: 'secondary'
                }}
            />

            {errorMessage && (
                <Alert
                    type="error"
                    title={t('common.error')}
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            {/* Employee Info */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={20} />
                    {t('employees.employeeInfoSection')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{t('employees.iqamaNumber')}</p>
                        <p className="font-bold text-gray-800">{historyData.iqamaNo}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{t('employees.nameArabic')}</p>
                        <p className="font-bold text-gray-800">{historyData.nameAR}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{t('employees.nameEnglish')}</p>
                        <p className="font-bold text-gray-800">{historyData.nameEN}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{t('employees.currentStatus')}</p>
                        <StatusBadge status={historyData.currentStatus} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">{t('employees.employeeType')}</p>
                        <p className="font-medium text-gray-800">{historyData.employeeType}</p>
                    </div>
                    {historyData.companyName && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                <Building size={14} />
                                {t('employees.company')}
                            </p>
                            <p className="font-medium text-gray-800">{historyData.companyName}</p>
                        </div>
                    )}
                    {historyData.housingName && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                <Home size={14} />
                                {t('employees.housing')}
                            </p>
                            <p className="font-medium text-gray-800">{historyData.housingName}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 mb-1">{t('employees.totalChanges')}</p>
                            <p className="text-3xl font-bold text-blue-700">{historyData.totalStatusChanges}</p>
                        </div>
                        <TrendingUp className="text-blue-500" size={40} />
                    </div>
                </div>

                <div className="bg-yellow-50 border-r-4 border-yellow-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 mb-1">{t('employees.pendingRequests')}</p>
                            <p className="text-3xl font-bold text-yellow-700">{historyData.pendingRequests}</p>
                        </div>
                        <Clock className="text-yellow-500" size={40} />
                    </div>
                </div>

                <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 mb-1">{t('employees.approvedRequests')}</p>
                            <p className="text-3xl font-bold text-green-700">{historyData.approvedChanges}</p>
                        </div>
                        <CheckCircle className="text-green-500" size={40} />
                    </div>
                </div>

                <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 mb-1">{t('employees.rejectedRequests')}</p>
                            <p className="text-3xl font-bold text-red-700">{historyData.rejectedChanges}</p>
                        </div>
                        <XCircle className="text-red-500" size={40} />
                    </div>
                </div>
            </div>

            {/* Status Change History Timeline */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    {t('employees.statusChangeHistory')} ({historyData.statusChangeHistory?.length || 0})
                </h3>

                {historyData.statusChangeHistory && historyData.statusChangeHistory.length > 0 ? (
                    <div className="space-y-4">
                        {historyData.statusChangeHistory.map((change, index) => (
                            <div
                                key={change.id}
                                className="border-r-4 border-blue-500 bg-gray-50 p-4 rounded-lg hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <StatusBadge status={change.requestedStatus} />
                                            {getResolutionBadge(change.resolution)}
                                        </div>

                                        {change.reason && (
                                            <div className="bg-white border border-blue-200 p-3 rounded-lg mb-2">
                                                <p className="text-sm font-bold text-blue-800 mb-1">{t('employees.requestReasonLabel')}:</p>
                                                <p className="text-sm text-gray-700">{change.reason}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User size={14} />
                                                <span>{t('employees.requestedBy')}: {change.requestedBy}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock size={14} />
                                                <span>{t('employees.requestDate')}: {new Date(change.requestedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US')}</span>
                                            </div>
                                            {change.isResolved && change.resolvedBy && (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <User size={14} />
                                                        <span>{t('employees.resolvedBy')}: {change.resolvedBy}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock size={14} />
                                                        <span>{t('employees.resolvedDate')}: {new Date(change.resolvedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US')}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {change.adminNotes && (
                                            <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                                <p className="text-sm font-bold text-yellow-800 mb-1">{t('employees.adminNotes')}:</p>
                                                <p className="text-sm text-gray-700">{change.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">{t('employees.noStatusChangeHistory')}</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
