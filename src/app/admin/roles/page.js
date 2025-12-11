"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Shield, Check, X, AlertCircle } from "lucide-react";

export default function RolesManagementPage() {
    const { get, put, loading, error } = useApi();
    const [roles, setRoles] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        const rolesRes = await get(API_ENDPOINTS.ROLES.LIST);
        if (rolesRes.data) {
            setRoles(rolesRes.data);
        }
    };

    const handleToggleRoleStatus = async (roleName) => {
        setSuccessMessage("");
        setErrorMessage("");

        const res = await put(API_ENDPOINTS.ROLES.TOGGLE_STATUS(roleName), {});

        if (res.data || res.error === null) {
            setSuccessMessage(`تم تغيير حالة الدور ${roleName} بنجاح`);
            fetchRoles();
        } else {
            setErrorMessage(res.error || "فشل تغيير حالة الدور");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 dir-rtl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-8 h-8 text-purple-600" />
                        إدارة الأدوار
                    </h1>
                    <p className="text-gray-500 mt-1">
                        التحكم في تفعيل وتعطيل الأدوار في النظام
                    </p>
                </div>
            </div>

            {(error || errorMessage) && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error || errorMessage}</span>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>{successMessage}</span>
                </div>
            )}

            {loading && <div className="text-center py-8">جاري التحميل...</div>}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-purple-600" />
                        <h2 className="text-lg font-bold">كل الأدوار المتاحة</h2>
                    </div>
                </div>

                <div className="space-y-3">
                    {roles.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">لا توجد أدوار متاحة</p>
                    ) : (
                        roles.map((role, idx) => (
                            <div
                                key={role.id || idx}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${role.isDeleted
                                    ? "bg-gray-50 border-gray-200 opacity-75"
                                    : "bg-white border-gray-200 hover:border-blue-300"
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className={`font-bold ${role.isDeleted ? "text-gray-500 line-through" : "text-gray-800"}`}>
                                        {role.name}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full w-fit mt-1 ${role.isDeleted
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                        }`}>
                                        {role.isDeleted ? "محذوف / غير نشط" : "نشط"}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleToggleRoleStatus(role.name)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${role.isDeleted
                                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                        }`}
                                >
                                    {role.isDeleted ? (
                                        <>
                                            <Check className="w-4 h-4" /> تفعيل
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-4 h-4" /> تعطيل
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
