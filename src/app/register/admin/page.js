"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Button from "@/components/Ui/Button";
import Input from "@/components/Ui/Input";
import Alert from "@/components/Ui/Alert";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TokenManager } from "@/lib/auth/tokenManager";
export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = TokenManager.getToken();
    if (!token || !TokenManager.isTokenValid()) {
      router.push("/login");
    }
  }, [router]);

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
      const response = await ApiService.post(
        API_ENDPOINTS.AUTH.ADMIN_REGISTER,
        formData
      );

      if (response) {
        setSuccess(true);
        setFormData({ username: "", password: "" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تسجيل المسؤول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1b428e] via-[#e8f4f8] to-white p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-[#ebb62b]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-[#1b428e] to-[#2563eb] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-[#1b428e] mb-2">
            تسجيل مسؤول جديد
          </h1>
          <p className="text-gray-600 font-medium">
            حساب مسؤول بصلاحيات متوسطة (Admin)
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert
            type="success"
            title="نجح التسجيل"
            message="تم إنشاء حساب المسؤول بنجاح"
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
            placeholder="أدخل اسم المستخدم للمسؤول"
            disabled={loading}
          />

          <div className="relative">
            <Input
              label="كلمة المرور"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="أدخل كلمة مرور قوية"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-[38px] text-[#1b428e] hover:text-[#e08911] transition-colors"
              title={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-[#1b428e] font-medium">
              ℹ️ ملاحظة: هذا الحساب سيحصل على صلاحيات إدارية متوسطة
            </p>
            <ul className="mt-2 text-xs text-gray-700 list-disc list-inside space-y-1">
              <li>إدارة الموظفين والمناديب</li>
              <li>إدارة المركبات والورديات</li>
              <li>عرض التقارير</li>
            </ul>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || success}
            variant="primary"
            className="w-full py-3 text-lg"
          >
            {loading ? "جاري التسجيل..." : "تسجيل مسؤول"}
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

        {/* Warning Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>⚠️ يتطلب تسجيل الدخول للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    </div>
  );
}
