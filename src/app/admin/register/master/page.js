// File: src/app/register/master/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/auth/tokenManager';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { Crown, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function MasterRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Access Password State
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  // Check if user is authenticated (required for registration)
  useEffect(() => {
    const token = TokenManager.getToken();
    if (!token || !TokenManager.isTokenValid()) {
      router.push('/admin/login');
    }
  }, [router]);

  const handlePasswordVerify = () => {
    if (accessPassword === '0123456789') {
      setIsPasswordVerified(true);
      setPasswordError('');
    } else {
      setPasswordError(t('common.wrongPassword') || 'Wrong Password');
      setAttemptCount(prev => prev + 1);
      if (attemptCount >= 2) {
        router.push('/admin/dashboard');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post(API_ENDPOINTS.AUTH.MASTER_REGISTER, formData);

      if (response) {
        setSuccess(true);
        setFormData({ username: '', password: '' });
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || t('auth.masterRegisterError'));
    } finally {
      setLoading(false);
    }
  };

  // Show password verification modal first
  if (!isPasswordVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b428e] via-[#ebb62b] to-[#e08911] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-[#1b428e]">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-[#1b428e] to-[#2858b8] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Crown className="text-[#ebb62b]" size={40} />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1b428e] to-[#ebb62b] bg-clip-text text-transparent mb-2">
              {t('auth.accessProtected') || 'Access Protected'}
            </h2>
            <p className="text-gray-600">
              {t('auth.enterAccessPassword') || 'Enter password to access registration'}
            </p>
          </div>

          {passwordError && (
            <Alert
              type="error"
              title={t('common.error')}
              message={passwordError}
              onClose={() => setPasswordError('')}
            />
          )}

          <div className="space-y-4">
            <Input
              label={t('common.password') || 'Password'}
              type="password"
              value={accessPassword}
              onChange={(e) => setAccessPassword(e.target.value)}
              placeholder={t('auth.enterPassword')}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerify()}
              autoFocus
            />
            <Button
              onClick={handlePasswordVerify}
              className="w-full bg-gradient-to-r from-[#1b428e] to-[#2858b8] hover:from-[#2858b8] hover:to-[#1b428e] text-white font-bold py-3"
            >
              {t('common.verify') || 'Verify'}
            </Button>
            <Link
              href="/admin/dashboard"
              className="block text-center text-[#1b428e] hover:text-[#e08911] font-medium transition-colors"
            >
              {t('navigation.backToDashboard')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b428e] via-[#ebb62b] to-[#e08911] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-[#1b428e]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#1b428e] to-[#2858b8] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Crown className="text-[#ebb62b]" size={48} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1b428e] to-[#ebb62b] bg-clip-text text-transparent mb-2">
            {t('auth.registerNewMaster')}
          </h1>
          <p className="text-gray-600 font-medium">{t('auth.masterAccount')}</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert
            type="success"
            title={t('auth.registerSuccess')}
            message={t('auth.masterRegisterSuccess')}
          />
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            title={t('auth.registerError')}
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('auth.username')}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder={t('auth.enterMasterUsername')}
            disabled={loading}
          />

          <div className="relative">
            <Input
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('auth.enterVeryStrongPassword')}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[38px] text-[#e08911] hover:text-[#ebb62b] transition-colors"
              title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-bold mb-2">
              🔐 {t('auth.masterWarningTitle')}
            </p>
            <p className="text-xs text-red-700">
              {t('auth.masterWarningText')}
            </p>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-[#1b428e] to-[#2858b8] hover:from-[#2858b8] hover:to-[#1b428e] text-white font-bold py-3 text-lg"
          >
            {loading ? t('auth.registering') : t('auth.registerMaster')}
          </Button>
        </form>

        {/* Back to Dashboard Link */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/dashboard"
            className="text-[#1b428e] hover:text-[#e08911] font-medium inline-flex items-center gap-2 transition-colors"
          >
            <ArrowRight size={18} />
            {t('navigation.backToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}