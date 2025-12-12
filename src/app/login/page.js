// File: src/app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/auth/tokenManager';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = TokenManager.getToken();
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double submission
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, formData);

      if (response?.token) {
        TokenManager.setToken(response.token);
        // Small delay to ensure token is saved
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        setError(t('errors.loginFailed'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);

      // Handle different error types
      if (err.status === 401) {
        setError(t('errors.wrongCredentials'));
      } else if (err.status === 400) {
        setError(t('errors.enterCredentials'));
      } else if (err.status === 500) {
        setError(t('errors.serverError'));
      } else {
        setError(err.message || t('errors.loginError'));
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b428e] via-[#2555a8] to-[#ebb62b]">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-[#ebb62b]">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#ebb62b] to-[#e08911] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Truck className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1b428e] to-[#e08911] bg-clip-text text-transparent mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-600 font-medium">{t('auth.companyName')}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              title={t('auth.loginError')}
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label={t('auth.username')}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder={t('auth.enterUsername')}
            disabled={loading}
            autoComplete="username"
          />

          <div className="relative">
            <Input
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('auth.enterPassword')}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[38px] text-[#e08911] hover:text-[#ebb62b] transition-colors"
              title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || !formData.username || !formData.password}
            className="w-full bg-gradient-to-r from-[#ebb62b] to-[#e08911] hover:from-[#e08911] hover:to-[#ebb62b] text-white font-bold py-3 text-lg"
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-medium">{t('auth.adminsOnly')}</p>
          <p className="mt-2 text-xs text-gray-500">
            {t('auth.copyright')}
          </p>
        </div>
      </div>
    </div>
  );
}
