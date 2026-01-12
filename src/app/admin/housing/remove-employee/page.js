"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import Input from "@/components/Ui/Input";
import PageHeader from "@/components/layout/pageheader";
import { UserMinus, Trash2, ArrowRight, Home, Users, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";


export default function HousingRemoveEmployeePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [loadingHousings, setLoadingHousings] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [housings, setHousings] = useState([]);
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [iqamaNo, setIqamaNo] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        loadHousings();
    }, []);

    const loadHousings = async () => {
        setLoadingHousings(true);
        try {
            const data = await ApiService.get("/api/Housing");
            // Ensure data is array, handle single object response if necessary
            setHousings(Array.isArray(data) ? data : (data ? [data] : []));
        } catch (err) {
            console.error("Error loading housings:", err);
            setErrorMessage(t("housing.loadError"));
            setHousings([]);
        } finally {
            setLoadingHousings(false);
        }
    };

    const handleSearch = async () => {
        if (!iqamaNo.trim()) {
            setErrorMessage(t("employees.enterIqamaNumber"));
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setEmployeeInfo(null);
        setShowConfirm(false);

        const searchTerm = iqamaNo.trim();

        try {
            // Find which housing the employee belongs to from the summary list
            let targetHousingName = null;

            for (const housing of housings) {
                if (!housing.employees || !Array.isArray(housing.employees)) continue;
                const exists = housing.employees.some(
                    (emp) => String(emp.iqamaNo) === searchTerm
                );
                if (exists) {
                    targetHousingName = housing.name;
                    break;
                }
            }

            if (targetHousingName) {
                // Fetch detailed housing data to get full employee details (names)
                const data = await ApiService.get(`/api/Housing/${targetHousingName}`);
                const detailedHousing = Array.isArray(data) ? data[0] : data;

                if (detailedHousing && detailedHousing.employees) {
                    const detailedEmployee = detailedHousing.employees.find(
                        (emp) => String(emp.iqamaNo) === searchTerm
                    );

                    if (detailedEmployee) {
                        setEmployeeInfo({
                            ...detailedEmployee,
                            housingName: detailedHousing.name,
                            housingAddress: detailedHousing.address,
                        });
                        setShowConfirm(true);
                    } else {
                        setErrorMessage(t("housing.employeeNotFoundInHousing"));
                    }
                } else {
                    setErrorMessage(t("housing.loadError"));
                }
            } else {
                setErrorMessage(t("housing.employeeNotFoundInHousing"));
            }
        } catch (err) {
            console.error("Error searching for employee:", err);
            setErrorMessage(t("errors.generalError"));
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!employeeInfo) return;

        setErrorMessage("");
        setSuccessMessage("");
        setLoading(true);

        try {
            await ApiService.delete(
                `/api/housing/remove-from-housing/${iqamaNo.trim()}`
            );

            setSuccessMessage(t("housing.removeFromHousingSuccess"));
            setEmployeeInfo(null);
            setIqamaNo("");
            setShowConfirm(false);

            // Reload housings to get updated data
            await loadHousings();

            setTimeout(() => {
                router.push(`/admin/housing/manage`);
            }, 2000);
        } catch (err) {
            console.error("Error removing employee from housing:", err);
            if (err?.status === 404) {
                setErrorMessage(t("housing.employeeNotFound"));
            } else if (err?.status === 400) {
                setErrorMessage(t("errors.generalError"));
            } else {
                setErrorMessage(err?.message || t("errors.generalError"));
            }
        } finally {
            setLoading(false);
        }
    };

    const getTotalOccupancy = () => {
        return housings.reduce((sum, h) => sum + (h.employees?.length || 0), 0);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("housing.removeEmployee")}
                subtitle={t("housing.removeEmployeeFromHousing")}
                icon={UserMinus}
                actionButton={{
                    text: t("common.back"),
                    icon: <ArrowRight size={18} />,
                    onClick: () => router.push(`/admin/housing/manage`),
                    variant: "secondary",
                }}
            />

            {errorMessage && (
                <Alert
                    type="error"
                    title={t("common.error")}
                    message={errorMessage}
                    onClose={() => setErrorMessage("")}
                />
            )}

            {successMessage && (
                <Alert
                    type="success"
                    title={t("common.success")}
                    message={successMessage}
                    onClose={() => setSuccessMessage("")}
                />
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 mb-1">
                                {t("housing.totalHousing")}
                            </p>
                            <p className="text-3xl font-bold text-blue-700">
                                {housings.length}
                            </p>
                        </div>
                        <Home className="text-blue-500" size={40} />
                    </div>
                </div>

                <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 mb-1">
                                {t("housing.totalOccupancy")}
                            </p>
                            <p className="text-3xl font-bold text-orange-700">
                                {getTotalOccupancy()}
                            </p>
                        </div>
                        <Users className="text-orange-500" size={40} />
                    </div>
                </div>
            </div>

            <Card>
                {loadingHousings ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <UserMinus className="text-red-600 mt-1" size={24} />
                                <div>
                                    <h3 className="font-semibold text-red-800 mb-1">
                                        {t("housing.removeEmployee")}
                                    </h3>
                                    <p className="text-sm text-red-600">
                                        {t("housing.removeEmployeeDescription")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Search Section */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Input
                                        label={t("employees.iqamaNumber")}
                                        type="text"
                                        value={iqamaNo}
                                        onChange={(e) => setIqamaNo(e.target.value)}
                                        placeholder={t("employees.enterIqamaNumber")}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={!iqamaNo.trim() || loading}
                                        loading={loading}
                                    >
                                        {t("common.search")}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Employee Info and Confirmation */}
                        {showConfirm && employeeInfo && (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="text-yellow-600 mt-1" size={24} />
                                        <div>
                                            <h3 className="font-semibold text-yellow-800 mb-1">
                                                {t("housing.confirmRemovalTitle")}
                                            </h3>
                                            <p className="text-sm text-yellow-700">
                                                {t("housing.confirmRemovalMessage")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">
                                        {t("employees.title")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {t("employees.iqamaNumber")}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {employeeInfo.iqamaNo}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {t("employees.nameArabic")}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {employeeInfo.nameAR || t("common.notSpecified")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {t("employees.nameEnglish")}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {employeeInfo.nameEN || t("common.notSpecified")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                                        <Home size={18} />
                                        {t("housing.currentHousing")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-red-600 mb-1">
                                                {t("housing.housingName")}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {employeeInfo.housingName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-red-600 mb-1">
                                                {t("housing.address")}
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {employeeInfo.housingAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowConfirm(false);
                                            setEmployeeInfo(null);
                                            setIqamaNo("");
                                        }}
                                        disabled={loading}
                                    >
                                        {t("common.cancel")}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleRemove}
                                        loading={loading}
                                        disabled={loading}
                                        variant="danger"
                                    >
                                        <Trash2 size={18} className="ml-2" />
                                        {t("housing.confirmRemoval")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
