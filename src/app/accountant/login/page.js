"use client";

import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';
import { APP_ROLES, getAppForUser, getAppUrl, getDashboardPathForApp, hasAnyRole } from '@/lib/config/appConfig';
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
    const user = TokenManager.getUserFromToken();
    if (user) {
      const app = getAppForUser(user);
      if (app) router.push(getAppUrl(app, getDashboardPathForApp(app)));
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
      const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      if (!response?.token) {
        setError('Login failed');
        setLoading(false);
        return;
      }

      TokenManager.setToken(response.token);
      const user = TokenManager.getUserFromToken();

      if (!hasAnyRole(user, APP_ROLES.accountant)) {
        const app = getAppForUser(user);
        if (app) {
          router.push(getAppUrl(app, getDashboardPathForApp(app)));
          return;
        }

        TokenManager.clearToken();
        setError('This login is for accountant users only.');
        setLoading(false);
        return;
      }

      router.push('/accountant/dashboard');
    } catch (err) {
      setError(err.message || 'Login error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-700 p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-emerald-500">
        <div className="text-center mb-8">
          <div className="bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Calculator className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Accountant Login</h1>
          <p className="text-gray-600 font-medium text-sm md:text-base">Express Service Finance</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Username"
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
              label="Password"
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
              className="absolute left-3 top-[38px] text-emerald-600 hover:text-emerald-700 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || !formData.username || !formData.password}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
