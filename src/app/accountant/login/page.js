"use client";

import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import { accountantAuthService } from '@/lib/api/accountantAuthService';
import { getCurrentAccountantUser, getRedirectForAuthenticatedUser } from '@/lib/auth/accountantAuth';
import { Calculator, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountantLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const user = getCurrentAccountantUser();
    if (user) {
      const redirectTo = getRedirectForAuthenticatedUser(user);
      if (redirectTo) router.push(redirectTo);
    }
  }, [router]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await accountantAuthService.login(formData);
      router.push(result.redirectTo);
    } catch (err) {
      if (err.redirectTo) {
        router.push(err.redirectTo);
        return;
      }

      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b428e] via-[#2555a8] to-[#ebb62b] p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-[#ebb62b]">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#ebb62b] to-[#e08911] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Calculator className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">تسجيل دخول المحاسب</h1>
          <p className="text-gray-600 font-medium text-sm md:text-base">الحسابات المالية - Express Service</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="اسم المستخدم"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="username"
          />

          <div className="relative">
            <Input
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute left-3 top-[38px] text-[#e08911] hover:text-[#ebb62b] transition-colors"
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
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>
      </div>
    </div>
  );
}
