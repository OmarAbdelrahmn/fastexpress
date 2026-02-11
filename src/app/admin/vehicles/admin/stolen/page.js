"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import Input from "@/components/Ui/Input";
import PageHeader from "@/components/layout/pageheader";
import {
  Shield,
  AlertCircle,
  Search,
  RefreshCw,
  CheckCircle,
  Car,
  User,
  Clock
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  VehicleStatusType,
  getVehicleStatusAttributes
} from "@/lib/constants/vehicleStatus";
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function StolenVehiclesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [stolenVehicles, setStolenVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState("stolen"); // 'stolen' or 'report'

  // Report stolen form
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [reportData, setReportData] = useState({
    reporterIqama: "",
    reason: "",
  });

  // Recover stolen form
  const [recoverVehicle, setRecoverVehicle] = useState(null);
  const [recoveryDetails, setRecoveryDetails] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingVehicles(true);
    try {
      const [stolenData, availableData] = await Promise.all([
        ApiService.get("/api/vehicles/stolen"),
        ApiService.get("/api/vehicles/available"),
      ]);

      if (stolenData) {
        setStolenVehicles(Array.isArray(stolenData) ? stolenData : []);
      } else {
        setStolenVehicles([]);
      }
      setAvailableVehicles(Array.isArray(availableData) ? availableData : []);
    } catch (err) {
      console.error("Error loading data:", err);
      setErrorMessage(t('common.loadError'));
    } finally {
      setLoadingVehicles(false);
    }
  };

  const searchVehicle = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage(t('vehicles.enterPlateNumber'));
      return;
    }

    try {
      const data = await ApiService.get(`/api/vehicles/plate/${searchTerm}`);
      if (data && data.length > 0) {
        setSelectedVehicle(data[0]);
        setErrorMessage("");
      } else {
        setErrorMessage(t('vehicles.vehicleNotFound'));
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error("Error searching vehicle:", err);
      setErrorMessage(t('vehicles.searchError'));
      setSelectedVehicle(null);
    }
  };

  const handleReportStolen = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      setErrorMessage(t('vehicles.searchVehicleFirst'));
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const iqamaParam = reportData.reporterIqama
        ? `&reportedByIqamaNo=${reportData.reporterIqama}`
        : "";
      const reasonParam = reportData.reason
        ? `&reason=${encodeURIComponent(reportData.reason)}`
        : "";

      await ApiService.post(
        `/api/vehicles/stolen?plate=${selectedVehicle.plateNumberA}${iqamaParam}${reasonParam}`
      );

      setSuccessMessage(t('vehicles.reportStolenSuccess'));
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchTerm("");
        setReportData({ reporterIqama: "", reason: "" });
        setActiveTab("stolen");
        loadData();
      }, 2000);
    } catch (err) {
      console.error("Error reporting stolen:", err);
      setErrorMessage(err?.message || t('vehicles.reportStolenError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverStolen = async (e) => {
    e.preventDefault();

    if (!recoverVehicle) {
      setErrorMessage(t('vehicles.selectVehicleFirst'));
      return;
    }

    if (!recoveryDetails.trim()) {
      setErrorMessage(t('vehicles.enterRecoveryDetails'));
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await ApiService.put(
        `/api/vehicles/recover-stolen?plate=${recoverVehicle.plateNumberA
        }&reason=${encodeURIComponent(recoveryDetails)}`
      );

      setSuccessMessage(t('vehicles.recoverStolenSuccess'));
      setTimeout(() => {
        setRecoverVehicle(null);
        setRecoveryDetails("");
        loadData();
      }, 2000);
    } catch (err) {
      console.error("Error recovering stolen:", err);
      setErrorMessage(err?.message || t('vehicles.recoverStolenError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableVehicles = availableVehicles.filter(
    (v) =>
      v.plateNumberA?.includes(searchTerm) ||
      v.vehicleNumber?.includes(searchTerm)
  );

  // Stolen attributes
  const stolenAttrs = getVehicleStatusAttributes(VehicleStatusType.Stolen, t);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vehicles.stolenVehiclesTitle')}
        subtitle={t('vehicles.stolenVehiclesSubtitle')}
        icon={Shield}
      />

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title={t('common.success')}
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className={`bg-red-50 border-r-4 border-red-500 p-5 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t('vehicles.stolenVehiclesCount')}</p>
              <p className="text-3xl font-bold text-red-700">
                {stolenVehicles.length}
              </p>
            </div>
            <Shield className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">
                {t('vehicles.recoveredMonth')}
              </p>
              <p className="text-3xl font-bold text-green-700">0</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("stolen")}
          className={`px-6 py-3 font-medium transition ${activeTab === "stolen"
            ? "text-red-600 border-b-2 border-red-600"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          {t('vehicles.stolenVehiclesTab')} ({stolenVehicles.length})
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-6 py-3 font-medium transition ${activeTab === "report"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          {t('vehicles.reportStolenTab')}
        </button>
      </div>

      {/* Stolen Vehicles List */}
      {activeTab === "stolen" && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-red-600" />
            {t('vehicles.stolenVehiclesListTitle')}
          </h3>

          {loadingVehicles ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : stolenVehicles.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-600">{t('vehicles.noStolenVehicles')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stolenVehicles.map((vehicle) => {
                // Even for stolen list we can use helper to consistent styles if we wanted, 
                // but typically stolen are always RED. 
                // We kept the manual red styles in original but let's use the helper attributes to be consistent.
                return (
                  <div
                    key={vehicle.vehicleNumber}
                    className={`border-2 ${stolenAttrs.styles.border} rounded-lg p-4 ${stolenAttrs.styles.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${stolenAttrs.styles.bg.replace('bg-', 'bg-opacity-50 ')} p-2 rounded-lg`}>
                          <stolenAttrs.icon className={stolenAttrs.styles.text} size={20} />
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
                      <span className={`px-3 py-1 ${stolenAttrs.styles.badge} text-white rounded-full text-xs font-medium`}>
                        {stolenAttrs.label}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Car size={14} />
                        <span>{t('vehicles.serialNumber')}: {vehicle.serialNumber}</span>
                      </div>

                      {vehicle.riderName && vehicle.riderName !== "Unknown" && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={14} />
                          <span>{t('vehicles.lastRider')}: {vehicle.riderName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={14} />
                        <span>
                          {t('vehicles.reportDate')}:{" "}
                          {new Date(vehicle.since).toLocaleDateString("en-US")}
                        </span>
                      </div>

                      {vehicle.reason && (
                        <div className="bg-red-100 p-2 rounded mt-2">
                          <p className="text-xs text-red-800">
                            <strong>{t('vehicles.details')}:</strong> {vehicle.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        setRecoverVehicle(vehicle);
                        setRecoveryDetails("");
                      }}
                      variant="secondary"
                      className="w-full"
                    >
                      <RefreshCw size={16} className="ml-2" />
                      {t('vehicles.recoverVehicle')}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Report Stolen Form */}
      {activeTab === "report" && (
        <Card>
          <form onSubmit={handleReportStolen} className="space-y-6">
            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    {t('vehicles.reportStolenTitle')}
                  </h3>
                  <p className="text-sm text-red-600">
                    {t('vehicles.reportStolenDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vehicles.searchVehicle')}
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('vehicles.enterPlateNumber')}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), searchVehicle())
                  }
                />
                <Button
                  type="button"
                  onClick={searchVehicle}
                  variant="secondary"
                >
                  <Search size={18} />
                </Button>
              </div>
            </div>

            {selectedVehicle && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">
                    {t('vehicles.vehicleInfo')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 mb-1">{t('vehicles.plateNumber')}</p>
                      <p className="font-medium text-gray-800">
                        {formatPlateNumber(selectedVehicle.plateNumberA)}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 mb-1">{t('vehicles.serialNumber')}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.serialNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 mb-1">{t('vehicles.vehicleType')}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.vehicleType}
                      </p>
                    </div>
                  </div>
                </div>

                <Input
                  label={t('vehicles.reporterIqamaLabel')}
                  type="number"
                  value={reportData.reporterIqama}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      reporterIqama: e.target.value,
                    })
                  }
                  placeholder={t('vehicles.reporterIqamaPlaceholder')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('vehicles.theftDetails')}
                  </label>
                  <textarea
                    value={reportData.reason}
                    onChange={(e) =>
                      setReportData({ ...reportData, reason: e.target.value })
                    }
                    rows={4}
                    placeholder={t('vehicles.theftDetailsPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedVehicle(null);
                      setSearchTerm("");
                      setReportData({ reporterIqama: "", reason: "" });
                    }}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" loading={loading} disabled={loading}>
                    <Shield size={18} className="ml-2" />
                    {t('vehicles.confirmReport')}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Card>
      )}

      {/* Recover Stolen Modal */}
      {recoverVehicle && (
        <Card>
          <form onSubmit={handleRecoverStolen} className="space-y-6">
            <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">
                    {t('vehicles.recoverStolenTitle')}
                  </h3>
                  <p className="text-sm text-green-600">
                    {t('vehicles.selectedVehicle')}: <strong>{formatPlateNumber(recoverVehicle.plateNumberA)}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vehicles.recoveryDetails')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={recoveryDetails}
                onChange={(e) => setRecoveryDetails(e.target.value)}
                required
                rows={4}
                placeholder={t('vehicles.recoveryDetailsPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setRecoverVehicle(null);
                  setRecoveryDetails("");
                }}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                <CheckCircle size={18} className="ml-2" />
                {t('vehicles.confirmRecovery')}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
