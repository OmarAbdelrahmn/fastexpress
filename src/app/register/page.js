// File: src/app/register/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/auth/tokenManager';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is authenticated (required for registration)
//   useEffect(() => {
//     const token = TokenManager.getToken();
//     if (!token || !TokenManager.isTokenValid()) {
//       router.push('/login');
//     }
//   }, [router]);

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
      const response = await ApiService.post(API_ENDPOINTS.AUTH.REGISTER, formData);
      
      if (response) {
        setSuccess(true);
        setFormData({ username: '', password: '' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b428e] via-[#2555a8] to-[#ebb62b] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-[#ebb62b]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#ebb62b] to-[#e08911] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <UserPlus className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1b428e] to-[#e08911] bg-clip-text text-transparent mb-2">
            تسجيل مستخدم جديد
          </h1>
          <p className="text-gray-600 font-medium">حساب مستخدم عادي</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert 
            type="success" 
            title="نجح التسجيل" 
            message="تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول"
          />
        )}

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            title="خطأ في التسجيل"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="اسم المستخدم"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="أدخل اسم المستخدم"
            disabled={loading}
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[38px] text-[#e08911] hover:text-[#ebb62b] transition-colors"
              title={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-[#ebb62b] to-[#e08911] hover:from-[#e08911] hover:to-[#ebb62b] text-white font-bold py-3 text-lg"
          >
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </Button>
        </form>

        {/* Back to Dashboard Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/dashboard" 
            className="text-[#1b428e] hover:text-[#e08911] font-medium inline-flex items-center gap-2 transition-colors"
          >
            <ArrowRight size={18} />
            العودة إلى لوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}