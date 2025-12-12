"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  MapPin,
  Package,
} from "lucide-react";

export default function RequestTakeVehiclePage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [employeeIqama, setEmployeeIqama] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadAvailableVehicles();
  }, []);

  const loadAvailableVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get("/api/vehicles/available");
      setAvailableVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setErrorMessage(t("errors.loadingAvailableVehicles"));
    } finally {
      setLoading(false);
    }
  };

  const searchVehicle = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage(t("errors.enterPlateNumber"));
      return;
    }

    setSearchLoading(true);
    setErrorMessage("");
    try {
      const data = await ApiService.get(`/api/vehicles/plate/${searchTerm}`);
      if (data && data.length > 0) {
        const vehicle = data[0];
        const checkResult = await ApiService.get(
          `/api/vehicles/is-available/${vehicle.plateNumberA}`
        );
        if (checkResult) {
          setSelectedVehicle(vehicle);
          setErrorMessage("");
        } else {
          setErrorMessage(t("errors.vehicleNotReady"));
          setSelectedVehicle(null);
        }
      } else {
        setErrorMessage(t("errors.vehicleNotFound"));
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error("Error searching vehicle:", err);
      setErrorMessage(t("errors.vehicleNotReadyOrError"));
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedVehicle) {
      setErrorMessage(t("errors.selectVehicleFirst"));
      return;
    }

    if (!employeeIqama.trim()) {
      setErrorMessage(t("errors.enterIqamaNumber"));
      return;
    }

    if (!reason.trim()) {
      setErrorMessage(t("errors.enterReason"));
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const requestBody = {
        Plate: selectedVehicle.plateNumberA,
        riderIqamaNo: parseInt(employeeIqama, 10), // Parse as integer
        resolvedBy: employeeIqama.toString(),
      };

      await ApiService.post(
        `/api/temp/vehicle-request-take?reason=${encodeURIComponent(reason)}`,
        requestBody
      );

      setSuccessMessage(
        t("success.takingRequestSent")
      );
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchTerm("");
        setEmployeeIqama("");
        setReason("");
        loadAvailableVehicles();
      }, 2000);
    } catch (err) {
      console.error("Error submitting request:", err);
      setErrorMessage(err?.message || t("errors.requestSubmitError"));
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
        title={t("vehicles.requestTakeVehicle")}
        subtitle={t("vehicles.submitTakeRequest")}
        icon={Car}
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

        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">{t("messages.importantInfo")}</h3>
              <p className="text-sm text-blue-600">
                {t("messages.requestReviewNote")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">
                  {t("messages.availableVehiclesCount")}
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {availableVehicles.length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={36} />
            </div>
          </div>

          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">{t("vehicles.locatedVehicle")}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {availableVehicles.filter((v) => v.location).length}
                </p>
              </div>
              <MapPin className="text-blue-500" size={36} />
            </div>
          </div>

          <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">{t("vehicles.searchResults")}</p>
                <p className="text-2xl font-bold text-purple-700">
                  {filteredVehicles.length}
                </p>
              </div>
              <Search className="text-purple-500" size={36} />
            </div>
          </div>
        </div>

        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search size={20} />
              {t("vehicles.searchVehicle")}
            </h3>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("vehicles.enterPlateNumber")}
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

          {selectedVehicle && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Car size={18} />
                {t("vehicles.selectedVehicle")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600 mb-1">{t("vehicles.plateNumber")}</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.plateNumberA}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 mb-1">{t("vehicles.serialNumber")}</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.serialNumber}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 mb-1">{t("vehicles.vehicleType")}</p>
                  <p className="font-medium text-gray-800">
                    {selectedVehicle.vehicleType}
                  </p>
                </div>
                {selectedVehicle.location && (
                  <div>
                    <p className="text-green-600 mb-1">{t("vehicles.location")}</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.location}
                    </p>
                  </div>
                )}
                {selectedVehicle.manufacturer && (
                  <div>
                    <p className="text-green-600 mb-1">{t("vehicles.manufacturer")}</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.manufacturer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedVehicle && (
            <div className="space-y-6">
              <Input
                label={t("employees.employeeIqamaNumber")}
                type="number"
                value={employeeIqama}
                onChange={(e) => setEmployeeIqama(e.target.value)}
                required
                placeholder={t("employees.enterIqamaNumber")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("employees.requestReason")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder={t("employees.explainReason")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setSearchTerm("");
                    setEmployeeIqama("");
                    setReason("");
                  }}
                  disabled={loading}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  loading={loading}
                  disabled={loading}
                >
                  <CheckCircle size={18} className="ml-2" />
                  {t("common.sendRequest")}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {!selectedVehicle && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t("vehicles.availableVehicles")}
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="mt-4 text-gray-600">{t("vehicles.loadingData")}</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">
                  {t("vehicles.noAvailableVehicles")}
                </p>
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
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Car className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {vehicle.plateNumberA}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {vehicle.vehicleType}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                        {t("vehicles.available")}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Package size={14} />
                        <span className="text-gray-600">{t("messages.serial")}:</span>
                        <span className="font-medium">
                          {vehicle.serialNumber}
                        </span>
                      </div>
                      {vehicle.location && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin size={14} />
                          <span className="font-medium">
                            {vehicle.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
