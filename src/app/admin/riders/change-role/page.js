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
import { ArrowRight, Search, UserCog, User, Briefcase } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ChangeRolePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [searchIqama, setSearchIqama] = useState('');

    const handleSearch = async () => {
        if (!searchIqama.trim()) {
            setErrorMessage(t('navigation.enterIqama'));
            return;
        }

        setSearchLoading(true);
        setErrorMessage('');
        setUserData(null);
        setSuccessMessage('');

        try {
            // Try searching as Rider first
            let data = await ApiService.get(API_ENDPOINTS.RIDER.BY_IQAMA(searchIqama));

            // If not found or empty, try Employee
            if (!data || (Array.isArray(data) && data.length === 0)) {
                const employeeData = await ApiService.get(API_ENDPOINTS.EMPLOYEE.BY_IQAMA(searchIqama));
                if (employeeData) {
                    data = employeeData;
                }
            }

            const user = Array.isArray(data) ? data[0] : data;

            if (user) {
                setUserData(user);
            } else {
                setErrorMessage(t('riders.employeeNotFound'));
            }
        } catch (err) {
            console.error('Error searching user:', err);
            // Fallback search in Employee if Rider search failed (though handled above mostly)
            try {
                const employeeData = await ApiService.get(API_ENDPOINTS.EMPLOYEE.BY_IQAMA(searchIqama));
                const user = Array.isArray(employeeData) ? employeeData[0] : employeeData;
                if (user) {
                    setUserData(user);
                    setErrorMessage('');
                } else {
                    setErrorMessage(t('riders.employeeNotFound'));
                }
            } catch (e) {
                setErrorMessage(t('riders.searchEmployeeError'));
            }
        } finally {
            setSearchLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!userData) return;

        if (!confirm(t('navigation.confirmRoleChange'))) return;

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await ApiService.post(API_ENDPOINTS.EMPLOYEE.CHANGE_EMPLOYEE_RIDER(userData.iqamaNo));

            setSuccessMessage(t('navigation.roleChangeSuccess'));
            // Refresh data to show new status
            handleSearch();
        } catch (err) {
            console.error('Error changing role:', err);
            setErrorMessage(err?.message || t('navigation.roleChangeError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('navigation.changeRole')}
                subtitle={t('riders.convertEmployeeSubtitle')} // Reusing subtitle or add new
                icon={UserCog}
                actionButton={{
                    text: t('navigation.backToList'),
                    icon: <ArrowRight size={18} />,
                    onClick: () => router.push('/admin/riders'),
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

            {/* Search Section */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Search size={20} />
                    {t('navigation.searchByIqama')}
                </h3>

                <div className="flex gap-3">
                    <Input
                        label=""
                        type="number"
                        value={searchIqama}
                        onChange={(e) => setSearchIqama(e.target.value)}
                        placeholder={t('navigation.enterIqama')}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                        type="button"
                        onClick={handleSearch}
                        loading={searchLoading}
                        disabled={searchLoading}
                        className="mt-0"
                    >
                        <Search size={18} className="ml-2" />
                        {t('common.search')}
                    </Button>
                </div>
            </Card>

            {/* User Details & Action */}
            {userData && (
                <Card>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <User size={20} />
                                {t('navigation.userInfo')}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <Briefcase size={16} className="text-blue-600" />
                            <span className="text-sm text-blue-800 font-medium">
                                {t('navigation.currentRole')}: {userData.isEmployee ? t('navigation.employee') : t('navigation.rider')}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{t('riders.iqamaNumber')}</p>
                                <p className="font-bold text-gray-800">{userData.iqamaNo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{t('riders.nameArabic')}</p>
                                <p className="font-bold text-gray-800">{userData.nameAR}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{t('riders.nameEnglish')}</p>
                                <p className="font-bold text-gray-800">{userData.nameEN}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleChangeRole}
                            loading={loading}
                            disabled={loading}
                            variant={userData.isEmployee ? "default" : "secondary"} // Visual distinction
                            className={userData.isEmployee ? "!bg-green-600 hover:!bg-green-700" : "!bg-blue-600 hover:!bg-blue-700 text-white"}
                        >
                            <UserCog size={18} className="ml-2" />
                            {userData.isEmployee ? t('navigation.switchToRider') : t('navigation.switchToEmployee')}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
