"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/layout/pageheader";
import { Settings, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
    const [privacyMode, setPrivacyMode] = useState(false);

    useEffect(() => {
        const storedPrivacy = localStorage.getItem("dashboard_privacy_mode");
        if (storedPrivacy) {
            setPrivacyMode(JSON.parse(storedPrivacy));
        }
    }, []);

    const handleToggle = () => {
        const newState = !privacyMode;
        setPrivacyMode(newState);
        localStorage.setItem("dashboard_privacy_mode", JSON.stringify(newState));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            <PageHeader
                title="الإعدادات العامة"
                subtitle="تخصيص إعدادات لوحة التحكم"
                icon={Settings}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">الخصوصية والعرض</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            تحكم في كيفية عرض البيانات الحساسة على لوحة التحكم
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${privacyMode ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {privacyMode ? <EyeOff size={24} /> : <Eye size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">إخفاء البيانات الحساسة</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        عند التفعيل، سيتم إخفاء (تشفير) الأرقام في البطاقات الثلاث الأولى في لوحة التحكم الرئيسية.
                                    </p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={handleToggle}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${privacyMode ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`${privacyMode ? '-translate-x-6' : '-translate-x-1'
                                        } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
