"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Model from "@/components/Ui/Model";
import Alert from "@/components/Ui/Alert";
import { Building2, AlertTriangle, Save, Loader2, Edit, CheckCircle, loading } from "lucide-react";

export default function EditCompanyModal({ isOpen, onClose, rider, onSuccess }) {
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newCompanyId, setNewCompanyId] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchCompanies();
            setNewCompanyId("");
            setReason("");
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const response = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
            setCompanies(response);
        } catch (err) {
            console.error("Failed to fetch companies:", err);
            setError("فشل تحميل قائمة الشركات");
        } finally {
            setLoadingCompanies(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newCompanyId) {
            setError("الرجاء اختيار الشركة الجديدة");
            return;
        }

        if (rider?.companyId === parseInt(newCompanyId)) {
            setError("الشركة الجديدة يجب أن تكون مختلفة عن الشركة الحالية");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const payload = {
                riderId: rider.riderId,
                newCompanyId: parseInt(newCompanyId),
                reason: reason || null
            };

            await ApiService.post(API_ENDPOINTS.MEMBER.EDIT_RIDER_COMPANY, payload);

            setSuccess("تم تغيير الشركة بنجاح");
            onSuccess();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Failed to update company:", err);
            setError(err.message || "حدث خطأ أثناء تحديث الشركة");
        } finally {
            setSubmitting(false);
        }
    };

    if (!rider) return null;

    return (
        <Model
            isOpen={isOpen}
            onClose={onClose}
            title="تغيير شركة المندوب"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Rider Info Summary */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900">{rider.nameAR}</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            الشركة الحالية: <span className="font-semibold">{rider.companyName}</span>
                        </p>
                    </div>
                </div>

                {error && (
                    <Alert type="error" message={error} onClose={() => setError(null)} />
                )}

                {success && (
                    <Alert type="success" message={success} onClose={() => setSuccess(null)} />
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            الشركة الجديدة <span className="text-red-500">*</span>
                        </label>
                        {loadingCompanies ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <Loader2 size={16} className="animate-spin" />
                                جاري تحميل الشركات...
                            </div>
                        ) : (
                            <select
                                value={newCompanyId}
                                onChange={(e) => setNewCompanyId(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                required
                            >
                                <option value="">اختر الشركة...</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            سبب التغيير (اختياري)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="أدخل سبب تغيير الشركة..."
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        disabled={submitting}
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || loadingCompanies}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                حفظ التغييرات
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Model>
    );
}
