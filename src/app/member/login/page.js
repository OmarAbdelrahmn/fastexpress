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

    // Check if already logged in (optional, might want to differentiate member token)
    useEffect(() => {
        // For now, assuming same token storage. If Members need different token handling, 
        // we might need to adjust TokenManager.
        const token = TokenManager.getToken();
        if (token) {
            // Ideally we verify if it is a member token vs admin token, 
            // but for now redirecting to member dashboard if token exists.
            // Ensuring we don't redirect if we are on login intended to switch users
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
            // API expects { iqamaNo, password }
            // Using API_ENDPOINTS.MEMBER.LOGIN
            const response = await ApiService.post(API_ENDPOINTS.MEMBER.LOGIN, {
                iqamaNo: parseInt(formData.iqamaNo) || 0, // Ensure integer if required
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-blue-500">
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Users className="text-white" size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">
                        Member Login
                    </h1>
                    <p className="text-gray-600 font-medium">Fast Express</p>
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

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <Input
                        label={t("auth.enterIqama")}
                        type="number"
                        name="iqamaNo"
                        value={formData.iqamaNo}
                        onChange={handleChange}
                        required
                        placeholder={t("auth.enterIqama")}
                        disabled={loading}
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
                    >
                        {loading ? t("auth.loggingIn") : t("auth.login")}
                    </Button>
                </form>
            </div>
        </div>
    );
}
