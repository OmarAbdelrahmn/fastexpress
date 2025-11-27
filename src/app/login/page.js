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

export default function LoginPage() {
  const router = useRouter();
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
        setError('فشل تسجيل الدخول - لم يتم استلام رمز الوصول');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error types
      if (err.status === 401) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      } else if (err.status === 400) {
        setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      } else if (err.status === 500) {
        setError('خطأ في الخادم. الرجاء المحاولة لاحقاً');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
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
            نظام إدارة الخدمات اللوجستية
          </h1>
          <p className="text-gray-600 font-medium">شركة الخدمة السريعة</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert 
              type="error" 
              title="خطأ في تسجيل الدخول"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="اسم المستخدم"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="أدخل اسم المستخدم"
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
              placeholder="أدخل كلمة المرور"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[38px] text-[#e08911] hover:text-[#ebb62b] transition-colors"
              title={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
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

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-medium">للمسؤولين فقط</p>
          <p className="mt-2 text-xs text-gray-500">
            © 2025 شركة الخدمة السريعة
          </p>
        </div>
      </div>
    </div>
  );
}