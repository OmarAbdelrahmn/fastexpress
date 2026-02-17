"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TokenManager } from "@/lib/auth/tokenManager";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Button from "@/components/Ui/Button";
import Input from "@/components/Ui/Input";
import Alert from "@/components/Ui/Alert";
import { Users, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function MemberLoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        iqamaNo: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const token = TokenManager.getToken();
        if (token) {
            router.push("/member/dashboard");
        }
    }, [router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await ApiService.post(API_ENDPOINTS.MEMBER.LOGIN, {
                iqamaNo: parseInt(formData.iqamaNo) || 0,
                password: formData.password
            });

            if (response?.token) {
                TokenManager.setToken(response.token);
                setTimeout(() => {
                    router.push("/member/dashboard");
                }, 100);
            } else {
                setError(t("errors.loginFailed") || "Login Failed");
                setLoading(false);
            }
        } catch (err) {
            console.error("Member Login error:", err);
            if (err.status === 401) {
                setError(t("errors.wrongCredentials") || "Invalid Credentials");
            } else {
                setError(err.message || t("errors.loginError") || "Login Error");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-blue-500">
                <div className="text-center mb-6 md:mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Users className="text-white w-10 h-10 md:w-12 md:h-12" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
                        {t("member.loginTitle")}
                    </h1>
                    <p className="text-gray-600 font-medium text-sm md:text-base">Fast Express</p>
                </div>

                {error && (
                    <div className="mb-4">
                        <Alert
                            type="error"
                            title="Error"
                            message={error}
                            onClose={() => setError(null)}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" noValidate>
                    <Input
                        label={t("auth.enterIqama")}
                        type="number"
                        name="iqamaNo"
                        value={formData.iqamaNo}
                        onChange={handleChange}
                        required
                        placeholder={t("auth.enterIqama")}
                        disabled={loading}
                        className="text-right"
                    />

                    <div className="relative">
                        <Input
                            label={t("auth.password")}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder={t("auth.enterPassword")}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-[38px] text-blue-500 hover:text-blue-700 transition-colors"
                            disabled={loading}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        loading={loading}
                        disabled={loading || !formData.iqamaNo || !formData.password}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? t("auth.loggingIn") : t("auth.login")}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <button
                        onClick={() => router.push('/admin/login')}
                        className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors"
                    >
                        تسجيل دخول كادمن
                    </button>
                </div>
            </div>
        </div>
    );
}
