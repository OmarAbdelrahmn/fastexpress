// File: src/app/dashboard/account/profile/page.js
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { User, Mail, MapPin } from 'lucide-react';

export default function ProfilePage() {
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
        setSuccessMessage('تم تحديث البيانات بنجاح');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="الملف الشخصي"
        subtitle="إدارة معلوماتك الشخصية"
        icon={User}
      />

      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {error && (
        <Alert type="error" title="خطأ" message={error} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="text-white" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {userData?.fullName || 'اسم المستخدم'}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              @{userData?.userName}
            </p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                تعديل البيانات
              </Button>
            )}
          </div>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2" title="المعلومات الشخصية">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="text-orange-500 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">اسم المستخدم</p>
                  <p className="font-medium text-gray-800">{userData?.userName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="text-orange-500 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
                  <p className="font-medium text-gray-800">
                    {userData?.fullName || 'لم يتم تحديده'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="text-orange-500 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">العنوان</p>
                  <p className="font-medium text-gray-800">
                    {userData?.address || 'لم يتم تحديده'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="الاسم الكامل"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="أدخل الاسم الكامل"
              />

              <Input
                label="العنوان"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="أدخل العنوان"
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  إلغاء
                </Button>
                <Button type="submit" loading={loading}>
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}