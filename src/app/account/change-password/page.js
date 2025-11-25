// File: src/app/dashboard/account/change-password/page.js
'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

export default function ChangePasswordPage() {
  const { put, loading, error } = useApi();
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassord: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassord !== formData.confirmPassword) {
      setValidationError('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    // Validate password length
    if (formData.newPassord.length < 6) {
      setValidationError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      const payload = {
        currentPassword: formData.currentPassword,
        newPassord: formData.newPassord,
      };

      const result = await put(API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD, payload);
      if (result.data || !result.error) {
        setSuccessMessage('تم تغيير كلمة المرور بنجاح');
        setFormData({
          currentPassword: '',
          newPassord: '',
          confirmPassword: '',
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="تغيير كلمة المرور"
        subtitle="تحديث كلمة المرور الخاصة بك"
        icon={Lock}
      />

      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {(error || validationError) && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={validationError || error} 
          onClose={() => setValidationError('')}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Security Info Card */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-blue-800 mb-2">نصائح الأمان</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</li>
                <li>• لا تستخدم نفس كلمة المرور في مواقع أخرى</li>
                <li>• تأكد من أن كلمة المرور لا تقل عن 6 أحرف</li>
                <li>• لا تشارك كلمة المرور مع أي شخص</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <Card title="تغيير كلمة المرور">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="relative">
              <Input
                label="كلمة المرور الحالية"
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                placeholder="أدخل كلمة المرور الحالية"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute left-3 top-[38px] text-orange-500 hover:text-orange-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* New Password */}
            <div className="relative">
              <Input
                label="كلمة المرور الجديدة"
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassord"
                value={formData.newPassord}
                onChange={handleInputChange}
                required
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute left-3 top-[38px] text-orange-500 hover:text-orange-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                label="تأكيد كلمة المرور الجديدة"
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute left-3 top-[38px] text-orange-500 hover:text-orange-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassord && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">قوة كلمة المرور:</p>
                <div className="flex gap-1">
                  <div className={`h-2 flex-1 rounded ${
                    formData.newPassord.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`h-2 flex-1 rounded ${
                    formData.newPassord.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`h-2 flex-1 rounded ${
                    /[0-9]/.test(formData.newPassord) && /[a-zA-Z]/.test(formData.newPassord) 
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormData({
                  currentPassword: '',
                  newPassord: '',
                  confirmPassword: '',
                })}
              >
                إعادة تعيين
              </Button>
              <Button type="submit" loading={loading}>
                <Lock size={18} />
                تغيير كلمة المرور
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}