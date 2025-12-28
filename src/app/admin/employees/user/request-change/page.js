'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { RefreshCcw, Search, ArrowRight, Send, User } from 'lucide-react';

export default function RequestChangeStatusPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [searchIqama, setSearchIqama] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [employeeData, setEmployeeData] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [reason, setReason] = useState('');
    const [requestedBy, setRequestedBy] = useState('');

    const handleSearchEmployee = async () => {
        if (!searchIqama.trim()) {
            setErrorMessage(t('employees.enterIqamaRequired'));
            return;
        }

        setSearchLoading(true);
        setErrorMessage('');
        setEmployeeData(null);
        setNewStatus('');

        try {
            const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.ONE(searchIqama));

            if (data) {
                setEmployeeData(data);
                setErrorMessage('');
            } else {
                setErrorMessage(t('employees.employeeNotFound'));
            }
        } catch (err) {
            console.error('Error searching employee:', err);
            setErrorMessage(err?.message || t('employees.searchEmployeeError'));
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!employeeData) {
            setErrorMessage(t('employees.searchEmployeeFirst'));
            return;
        }

        if (!newStatus) {
            setErrorMessage(t('employees.selectStatusRequired'));
            return;
        }

        if (newStatus === employeeData.status) {
            setErrorMessage(t('employees.sameStatusError'));
            return;
        }

        if (!reason.trim()) {
            setErrorMessage(t('employees.enterReasonRequired'));
            return;
        }

        if (!requestedBy.trim()) {
            setErrorMessage(t('employees.enterRequesterName'));
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await ApiService.post(
                '/api/Temp/request-change',
                {
                    iqamaNo: employeeData.iqamaNo,
                    newStatus: newStatus,
                    reason: reason,
                    requestedBy: requestedBy
                }
            );

            setSuccessMessage(t('employees.requestSentSuccess'));

            setTimeout(() => {
                router.push('/employees/user');
            }, 2000);
        } catch (err) {
            console.error('Error submitting status change request:', err);
            setErrorMessage(err?.message || t('employees.requestSendError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('employees.requestChangeTitle')}
                subtitle={t('employees.requestChangeSubtitle')}
                icon={RefreshCcw}
                actionButton={{
                    text: t('common.back'),
                    icon: <ArrowRight size={18} />,
                    onClick: () => router.push('/employees/user'),
                    variant: 'secondary'
                }}
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

            {/* Search Employee */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Search size={20} />
                    {t('employees.searchEmployee')}
                </h3>

                <div className="flex gap-3 mb-4">
                    <Input
                        label=""
                        type="number"
                        value={searchIqama}
                        onChange={(e) => setSearchIqama(e.target.value)}
                        placeholder={t('employees.enterIqamaNumber')}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchEmployee()}
                    />
                    <Button
                        type="button"
                        onClick={handleSearchEmployee}
                        loading={searchLoading}
                        disabled={searchLoading}
                        className="mt-0"
                    >
                        <Search size={18} className="ml-2" />
                        {t('common.search')}
                    </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                        {t('employees.searchForEmployee')}
                    </p>
                </div>
            </Card>

            {/* Employee Information (if found) */}
            {employeeData && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} />
                        {t('employees.employeeInfo')}
                    </h3>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600">{t('employees.currentStatus')}</span>
                            <StatusBadge status={employeeData.status} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('employees.iqamaNumber')}</p>
                                <p className="font-bold text-gray-800">{employeeData.iqamaNo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('employees.nameArabic')}</p>
                                <p className="font-bold text-gray-800">{employeeData.nameAR}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('employees.nameEnglish')}</p>
                                <p className="font-bold text-gray-800">{employeeData.nameEN}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('employees.jobTitle')}</p>
                                <p className="font-medium text-gray-800">{employeeData.jobTitle}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('employees.country')}</p>
                                <p className="font-medium text-gray-800">{employeeData.country}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('employees.phone')}</p>
                                <p className="font-medium text-gray-800">{employeeData.phone}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Request Form (only show if employee found) */}
            {employeeData && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.requestDetails')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('employees.newStatusLabel')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">{t('employees.selectNewStatus')}</option>
                                    <option value="enable">{t('employees.statusActive')}</option>
                                    <option value="disable">{t('employees.statusInactive')}</option>
                                    <option value="fleeing">{t('employees.statusFleeing')}</option>
                                    <option value="vacation">{t('employees.statusVacation')}</option>
                                    <option value="accident">{t('employees.statusAccident')}</option>
                                    <option value="sick">{t('employees.statusSick')}</option>
                                </select>
                                {newStatus && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-gray-600">{t('employees.preview')}</span>
                                        <StatusBadge status={newStatus} />
                                    </div>
                                )}
                            </div>

                            <Input
                                label={t('employees.requesterName')}
                                type="text"
                                value={requestedBy}
                                onChange={(e) => setRequestedBy(e.target.value)}
                                required
                                placeholder={t('employees.enterYourName')}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('employees.changeReason')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder={t('employees.changeReasonPlaceholder')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setEmployeeData(null);
                                    setSearchIqama('');
                                    setNewStatus('');
                                    setReason('');
                                    setRequestedBy('');
                                }}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" loading={loading} disabled={loading}>
                                <Send size={18} className="ml-2" />
                                {t('employees.sendRequestBtn')}
                            </Button>
                        </div>
                    </Card>
                </form>
            )}

            {/* Instructions */}
            {!employeeData && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.howToUse')}</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p>{t('employees.requestChangeInstructions1')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>{t('employees.requestChangeInstructions2')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>{t('employees.requestChangeInstructions3')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">4</span>
                            </div>
                            <p>{t('employees.requestChangeInstructions4')}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">5</span>
                            </div>
                            <p>{t('employees.requestChangeInstructions5')}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
