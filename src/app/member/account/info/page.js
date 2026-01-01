'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { User, Mail, MapPin, Edit } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function MemberProfileEditPage() {
    const { t } = useLanguage();
    const { get, put, loading, error } = useApi();
    const [userData, setUserData] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const result = await get(API_ENDPOINTS.ACCOUNT.ME);
        if (result.data) {
            setUserData(result.data);
            setFormData({
                fullName: result.data.fullName || '',
                address: result.data.address || '',
            });
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await put(API_ENDPOINTS.ACCOUNT.UPDATE_INFO, formData);
            if (result.data) {
                setSuccessMessage(t('profile.updateSuccess'));
                setIsEditing(false);
                loadUserData();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            fullName: userData?.fullName || '',
            address: userData?.address || '',
        });
    };

    if (loading && !userData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="text-blue-600" />
                    {t('profile.personalInfo')}
                </h1>
                <p className="text-gray-500 mt-1">
                    تعديل البيانات الشخصية
                </p>
            </div>

            {successMessage && (
                <Alert
                    type="success"
                    title={t('common.success')}
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                />
            )}

            {error && (
                <Alert type="error" title={t('common.error')} message={error} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <Card className="lg:col-span-1">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                            <User className="text-white" size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                            {userData?.fullName || t('profile.username')}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 bg-gray-100 py-1 px-3 rounded-full inline-block font-mono">
                            @{userData?.userName}
                        </p>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                                <Edit size={16} />
                                {t('profile.editData')}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Profile Details Card */}
                <Card className="lg:col-span-2" title={t('profile.personalInfo')}>
                    {!isEditing ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <User size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">{t('profile.username')}</p>
                                    <p className="font-bold text-gray-900">{userData?.userName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Edit size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">{t('profile.fullName')}</p>
                                    <p className="font-bold text-gray-900">
                                        {userData?.fullName || t('profile.notSpecified')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">{t('profile.address')}</p>
                                    <p className="font-bold text-gray-900">
                                        {userData?.address || t('profile.notSpecified')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label={t('profile.fullName')}
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder={t('profile.enterFullName')}
                            />

                            <Input
                                label={t('profile.address')}
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder={t('profile.enterAddress')}
                            />

                            <div className="flex gap-3 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancel}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700">
                                    {t('profile.saveChanges')}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
