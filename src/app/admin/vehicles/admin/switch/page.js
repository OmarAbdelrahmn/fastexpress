"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import Input from "@/components/Ui/Input";
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
    Car,
    Search,
    CheckCircle,
    MapPin,
    User,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function SwitchVehiclePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Form fields
    const [riderIqama, setRiderIqama] = useState("");
    const [reason, setReason] = useState("");
    const [permission, setPermission] = useState("");
    const [permissionEndDate, setPermissionEndDate] = useState("");

    useEffect(() => {
        loadAvailableVehicles();
    }, []);

    const loadAvailableVehicles = async () => {
        setLoading(true);
        try {
            const data = await ApiService.get("/api/vehicles/available");

            setAvailableVehicles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading available vehicles:", err);
            setErrorMessage(t("common.loadError"));
        } finally {
            setLoading(false);
        }
    };

    const searchVehicle = async () => {
        if (!searchTerm.trim()) {
            setErrorMessage(t("vehicles.enterPlateNumber"));
            return;
        }

        setSearchLoading(true);
        setErrorMessage("");
        try {
            const data = await ApiService.get(`/api/vehicles/plate/${searchTerm}`);
            if (data && data.length > 0) {
                const vehicle = data[0];
                // Optional: Check if vehicle available logic if needed, but we assume we can switch to any valid vehicle or check availability
                const checkResult = await ApiService.get(
                    `/api/vehicles/is-available/${vehicle.plateNumberA}`
                );
                // If we want to strictly enforce switching ONLY to available vehicles:
                // if (!checkResult) toast error... but let's allow selection and let backend validation handle if mixed status is allowed.
                // For consistency with 'take' page, we might want to warn or prefer available ones.
                // 'take' page does check logic. We'll stick to basic select for now, as 'switch' might imply taking one that is already available.

                setSelectedVehicle(vehicle);
                setErrorMessage("");
            } else {
                setErrorMessage(t("vehicles.vehicleNotFound"));
                setSelectedVehicle(null);
            }
        } catch (err) {
            console.error("Error searching vehicle:", err);
            setErrorMessage(
                err?.message || t("vehicles.vehicleNotReadyOrError")
            );
            setSelectedVehicle(null);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSwitchVehicle = async (e) => {
        e.preventDefault();

        if (!selectedVehicle) {
            setErrorMessage(t("vehicles.selectVehicleFirst"));
            return;
        }

        if (!riderIqama.trim()) {
            setErrorMessage(t("vehicles.enterIqamaNumber"));
            return;
        }

        if (!reason.trim()) {
            setErrorMessage(t("vehicles.enterReason"));
            return;
        }

        if (!permission.trim()) {
            setErrorMessage(t("vehicles.permissionRequired"));
            return;
        }

        if (!permissionEndDate) {
            setErrorMessage(t("vehicles.permissionEndDateRequired"));
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            let finalPermissionEndDate = permissionEndDate;
            if (finalPermissionEndDate.length === 10) { // YYYY-MM-DD
                finalPermissionEndDate = `${finalPermissionEndDate}T23:59:59`;
            }

            // API expects querystring params
            const queryParams = {
                IqamaNo: riderIqama,
                newVehiclePlate: selectedVehicle.plateNumberA,
                reason: reason,
                permission: permission,
                permissionEndDate: finalPermissionEndDate
            };

            // ApiService.post signature: post(endpoint, data, params)
            // Since all data is in query params as requested
            await ApiService.post("/api/vehicles/switch", {}, queryParams);

            setSuccessMessage(t("vehicles.switchRequestSent") || "Vehicle switch request sent successfully");
            setTimeout(() => {
                setSelectedVehicle(null);
                setSearchTerm("");
                setRiderIqama("");
                setReason("");
                setPermission("");
                setPermissionEndDate("");
                loadAvailableVehicles();
                // Optional: redirect back to admin or stay? 'take' page clears form.
                router.push('/admin/vehicles/admin');
            }, 2000);
        } catch (err) {
            console.error("Error switching vehicle:", err);
            setErrorMessage(err?.message || t("vehicles.requestSubmitError"));
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = availableVehicles.filter(
        (v) =>
            v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.serialNumber?.toString().includes(searchTerm) ||
            v.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full">
            <PageHeader
                title={t("vehicles.switchVehicle") || "تبديل مركبة"}
                subtitle={t("vehicles.switchVehicleSubtitle") || "تسجيل تبديل مركبة لمندوب"}
                icon={RefreshCw}
                actionButton={{
                    text: t("vehicles.refreshData"),
                    icon: <CheckCircle size={18} />,
                    onClick: loadAvailableVehicles,
                    variant: "secondary",
                }}
            />

            <div className="px-6 space-y-6">
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

                {/* Search Section */}
                <Card>
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Search size={20} />
                            {t("vehicles.searchNewVehicle") || "البحث عن المركبة الجديدة"}
                        </h3>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t("vehicles.enterPlateNumberPlaceholder")}
                                    onKeyPress={(e) => e.key === "Enter" && searchVehicle()}
                                />
                            </div>
                            <Button
                                onClick={searchVehicle}
                                loading={searchLoading}
                                disabled={searchLoading}
                            >
                                <Search size={18} className="ml-2" />
                                {t("common.search")}
                            </Button>
                        </div>
                    </div>

                    {/* Selected Vehicle Info */}
                    {selectedVehicle && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <Car size={18} />
                                {t("vehicles.selectedVehicleInfo")}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-green-600 mb-1">{t("vehicles.plateNumberArabic")}</p>
                                    <p className="font-medium text-gray-800">
                                        {formatPlateNumber(selectedVehicle.plateNumberA)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-green-600 mb-1">{t("vehicles.plateNumberEnglish")}</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedVehicle.plateNumberE || t("vehicles.notSpecified")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-green-600 mb-1">{t("vehicles.vehicleType")}</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedVehicle.vehicleType}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Switch Vehicle Form */}
                    {selectedVehicle && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <User className="text-blue-600 mt-1" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-blue-800 mb-1">
                                            {t("vehicles.switchDetails") || "بيانات التبديل"}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <Input
                                type="text"
                                value={riderIqama}
                                onChange={(e) => setRiderIqama(e.target.value)}
                                placeholder={t("employees.enterIqamaNumber")}
                                label={t("employees.iqamaNumber")}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("vehicles.permission")} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={permission}
                                        onChange={(e) => setPermission(e.target.value)}
                                        required
                                        placeholder={t("vehicles.permissionPlaceholder") || "Authorization"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("vehicles.permissionEndDate")} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={permissionEndDate}
                                        onChange={(e) => setPermissionEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("vehicles.switchReason") || "سبب التبديل"} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder={t("vehicles.explainReason")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setSelectedVehicle(null);
                                        setSearchTerm("");
                                        setRiderIqama("");
                                        setReason("");
                                        setPermission("");
                                        setPermissionEndDate("");
                                    }}
                                    disabled={loading}
                                >
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    onClick={handleSwitchVehicle}
                                    loading={loading}
                                    disabled={loading}
                                >
                                    <RefreshCw size={18} className="ml-2" />
                                    {t("vehicles.submitSwitchRequest") || "اعتماد التبديل"}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Available Vehicles Grid like in Take Page */}
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        {t("vehicles.availableVehiclesList")}
                    </h3>

                    {loading && !selectedVehicle ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                            <p className="mt-4 text-gray-600">{t("vehicles.loadingData")}</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="mx-auto text-orange-500 mb-4" size={48} />
                            <p className="text-gray-600">{t("vehicles.noAvailableVehiclesText")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVehicles.map((vehicle) => (
                                <div
                                    key={vehicle.vehicleNumber}
                                    className="border-2 border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-lg transition cursor-pointer"
                                    onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setSearchTerm(vehicle.plateNumberA);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <Car className="text-green-600" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">
                                                    {formatPlateNumber(vehicle.plateNumberA)}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {vehicle.vehicleType}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                                            {t("vehicles.availableStatus")}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {vehicle.location && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <MapPin size={14} />
                                                <span className="font-medium">{vehicle.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
