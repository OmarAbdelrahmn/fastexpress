"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Corrected import
import { useApi } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ArrowRight, UserCog, Shield, Check, AlertCircle } from "lucide-react";

export default function UserRolesPage() {
    const { userName } = useParams();
    const router = useRouter();
    const { get, post, loading, error } = useApi();

    const [currentUser, setCurrentUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchData();
    }, [userName]);

    const fetchData = async () => {
        // Fetch User Details
        const userRes = await get(API_ENDPOINTS.ADMIN.BY_NAME(userName));
        if (userRes.data) {
            setCurrentUser(userRes.data);
            if (userRes.data.roles && userRes.data.roles.length > 0) {
                setSelectedRole(userRes.data.roles[0]);
            }
        }

        // Fetch Roles
        const rolesRes = await get(API_ENDPOINTS.ROLES.LIST);
        if (rolesRes.data) {
            setRoles(rolesRes.data);
        }
    };

    const handleRoleChange = async () => {
        setSuccessMessage("");
        setErrorMessage("");

        if (!selectedRole) return;

        const res = await post(API_ENDPOINTS.ADMIN.CHANGE_ROLE, {
            userName: userName,
            newRole: selectedRole,
        });

        if (res.data) {
            setSuccessMessage("تم تغيير دور المستخدم بنجاح");
            fetchData(); // Refresh data
        } else {
            setErrorMessage(res.error || "فشل تغيير الدور");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 dir-rtl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCog className="w-8 h-8 text-primary" />
                        إدارة دور المستخدم: {userName}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        تعديل صلاحيات المستخدم وتعيين الأدوار
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

            <div className="flex justify-center">
                {/* User Role Assignment Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit w-full max-w-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-bold">تغيير دور المستخدم</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <span className="text-sm text-blue-600 font-medium">الدور الحالي:</span>
                            <div className="text-xl font-bold text-blue-900 mt-1">
                                {currentUser?.roles?.join(" - ") || "غير محدد"}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اختر الدور الجديد
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">اختر دوراً...</option>
                                {roles
                                    .filter(r => !r.isDeleted) // Only show active roles for assignment
                                    .map((role, idx) => (
                                        <option key={role.id || idx} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <button
                            onClick={handleRoleChange}
                            disabled={loading || !selectedRole}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserCog className="w-5 h-5" />
                            تحديث الدور
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
