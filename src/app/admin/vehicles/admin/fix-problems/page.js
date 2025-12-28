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
  Wrench,
  AlertTriangle,
  CheckCircle,
  Car,
  Clock,
  User,
} from "lucide-react";
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function FixProblemsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [problemVehicles, setProblemVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fixReason, setFixReason] = useState("");

  useEffect(() => {
    loadProblemVehicles();
  }, []);

  const loadProblemVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const data = await ApiService.get("/api/vehicles/problem");
      if (data && Array.isArray(data)) {
        setProblemVehicles(data);
      } else {
        setProblemVehicles([]);
      }
    } catch (err) {
      console.error("Error loading problem vehicles:", err);
      setErrorMessage(t("vehicles.loadingError"));
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleFixProblem = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      setErrorMessage(t("vehicles.selectVehicleFirst"));
      return;
    }

    if (!fixReason.trim()) {
      setErrorMessage(t("vehicles.enterFixDetails"));
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await ApiService.post(
        `/api/vehicles/fix-problem?plate=${selectedVehicle.plateNumberA
        }&reason=${encodeURIComponent(fixReason)}`
      );

      setSuccessMessage(t("vehicles.fixSuccess"));
      setTimeout(() => {
        setSelectedVehicle(null);
        setFixReason("");
        loadProblemVehicles();
      }, 2000);
    } catch (err) {
      console.error("Error fixing problem:", err);
      setErrorMessage(err?.message || t("vehicles.fixError") || "Error fixing problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Full Width Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white px-8 py-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Wrench size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{t("vehicles.fixProblemsTitle")}</h1>
              <p className="text-orange-100">
                {t("vehicles.fixProblemsSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">{t("vehicles.problemVehicles")}</p>
                <p className="text-3xl font-bold text-orange-700">
                  {problemVehicles.length}
                </p>
              </div>
              <AlertTriangle className="text-orange-500" size={40} />
            </div>
          </div>

          <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">{t("vehicles.activeProblems")}</p>
                <p className="text-3xl font-bold text-blue-700">
                  {(Array.isArray(problemVehicles) ? problemVehicles : []).reduce(
                    (sum, v) => sum + (v.problemsCount || 0),
                    0
                  )}
                </p>
              </div>
              <AlertTriangle className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">{t("vehicles.fixedToday")}</p>
                <p className="text-3xl font-bold text-green-700">0</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>
        </div>

        {/* Problem Vehicles List */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-600" />
            {t("vehicles.vehiclesNeedFix")}
          </h3>

          {loadingVehicles ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">{t("vehicles.loadingData")}</p>
            </div>
          ) : problemVehicles.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-600">{t("vehicles.noVehiclesNeedFix")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {problemVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicleNumber}
                  className={`border-2 rounded-lg p-4 transition cursor-pointer ${selectedVehicle?.vehicleNumber === vehicle.vehicleNumber
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                    }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Car className="text-orange-600" size={20} />
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
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {vehicle.problemsCount} {t("vehicles.problem")}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Car size={14} />
                      <span>{t("vehicles.serialNumber")}: {vehicle.serialNumber}</span>
                    </div>

                    {vehicle.riderName && vehicle.riderName !== "N/A" && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} />
                        <span>{t("vehicles.lastRider")}: {vehicle.riderName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={14} />
                      <span>
                        {t("vehicles.since")}:{" "}
                        {new Date(vehicle.since).toLocaleDateString("en-US")}
                      </span>
                    </div>

                    {vehicle.reason && (
                      <div className="bg-orange-50 p-2 rounded mt-2">
                        <p className="text-xs text-orange-800">
                          <strong>{t("vehicles.reason")}:</strong> {vehicle.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Fix Form */}
        {selectedVehicle && (
          <Card>
            <form onSubmit={handleFixProblem} className="space-y-6">
              <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Wrench className="text-green-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">
                      {t("vehicles.fixProblem")}
                    </h3>
                    <p className="text-sm text-green-600">
                      {t("vehicles.selectedVehicle")}:{" "}
                      <strong>{formatPlateNumber(selectedVehicle.plateNumberA)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">
                  {t("vehicles.vehicleInfo")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">{t("vehicles.plateNumber")}</p>
                    <p className="font-medium text-gray-800">
                      {formatPlateNumber(selectedVehicle.plateNumberA)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t("vehicles.serialNumber")}</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.serialNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t("vehicles.problemsCount")}</p>
                    <p className="font-medium text-orange-600">
                      {selectedVehicle.problemsCount}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("vehicles.fixDetails")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={fixReason}
                  onChange={(e) => setFixReason(e.target.value)}
                  required
                  rows={4}
                  placeholder={t("vehicles.fixDetailsPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setFixReason("");
                  }}
                  disabled={loading}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" loading={loading} disabled={loading}>
                  <CheckCircle size={18} className="ml-2" />
                  {t("vehicles.confirmFix")}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
