"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import Input from "@/components/Ui/Input";
import PageHeader from "@/components/layout/pageheader";
import {
  RefreshCw,
  Shield,
  Search,
  Car,
  Clock,
  User,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function RecoverStolenPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [stolenVehicles, setStolenVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [recoveryDetails, setRecoveryDetails] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStolenVehicles();
  }, []);

  const loadStolenVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const data = await ApiService.get("/api/vehicles/stolen");
      if (data) {
        setStolenVehicles(Array.isArray(data) ? data : []);
      } else {
        setStolenVehicles([]);
      }
    } catch (err) {
      console.error("Error loading stolen vehicles:", err);
      setErrorMessage(t('common.loadError'));
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleRecoverStolen = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
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
        `/api/vehicles/recover-stolen?plate=${selectedVehicle.plateNumberA
        }&reason=${encodeURIComponent(recoveryDetails)}`
      );

      setSuccessMessage(t('vehicles.recoverStolenSuccess'));
      setTimeout(() => {
        setSelectedVehicle(null);
        setRecoveryDetails("");
        loadStolenVehicles();
      }, 2000);
    } catch (err) {
      console.error("Error recovering stolen vehicle:", err);
      setErrorMessage(err?.message || t('vehicles.recoverStolenError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = (Array.isArray(stolenVehicles) ? stolenVehicles : []).filter(
    (v) =>
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serialNumber?.toString().includes(searchTerm) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <PageHeader
        title={t('vehicles.recoverStolenPageTitle')}
        subtitle={`${stolenVehicles.length} ${t('vehicles.stolenVehiclesSubtitleCount')}`}
        icon={RefreshCw}
        actionButton={{
          text: t('common.refresh'),
          icon: <RefreshCw size={18} />,
          onClick: loadStolenVehicles,
          variant: "secondary",
        }}
      />

      <div className="px-6 space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
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
                  {t('vehicles.recoveredToday')}
                </p>
                <p className="text-3xl font-bold text-green-700">0</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">{t('vehicles.searchResults')}</p>
                <p className="text-3xl font-bold text-orange-700">
                  {filteredVehicles.length}
                </p>
              </div>
              <Search className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <div className="mb-4">
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t('vehicles.searchPlaceholderStolen')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </Card>

        {/* Stolen Vehicles List */}
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
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-600">{t('vehicles.noStolenVehicles')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicleNumber}
                  className={`border-2 rounded-lg p-4 transition ${selectedVehicle?.vehicleNumber === vehicle.vehicleNumber
                    ? "border-green-500 bg-green-50"
                    : "border-red-200 bg-red-50"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Shield className="text-red-600" size={20} />
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
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                      {t('vehicles.stolenStatus')}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Car size={14} />
                      <span className="text-gray-600">{t('vehicles.serialNumber')}:</span>
                      <span className="font-medium">
                        {vehicle.serialNumber}
                      </span>
                    </div>

                    {vehicle.riderName && vehicle.riderName !== "Unknown" && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={14} />
                        <span className="text-gray-600">{t('vehicles.lastRider')}:</span>
                        <span className="font-medium">{vehicle.riderName}</span>
                      </div>
                    )}

                    {vehicle.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={14} />
                        <span className="text-gray-600">{t('vehicles.lastLocation')}:</span>
                        <span className="font-medium">{vehicle.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={14} />
                      <span className="text-gray-600">{t('vehicles.reportDate')}:</span>
                      <span className="font-medium">
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
                      setSelectedVehicle(vehicle);
                      setRecoveryDetails("");
                    }}
                    variant={
                      selectedVehicle?.vehicleNumber === vehicle.vehicleNumber
                        ? "primary"
                        : "secondary"
                    }
                    className="w-full"
                  >
                    <RefreshCw size={16} className="ml-2" />
                    {selectedVehicle?.vehicleNumber === vehicle.vehicleNumber
                      ? t('vehicles.selected')
                      : t('vehicles.recoverVehicle')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recover Form */}
        {selectedVehicle && (
          <Card>
            <div className="space-y-6">
              <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">
                      {t('vehicles.recoverStolenTitle')}
                    </h3>
                    <p className="text-sm text-green-600">
                      {t('vehicles.selectVehicle')}:{" "}
                      <strong>{selectedVehicle.plateNumberA}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">
                  {t('vehicles.vehicleInfo')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.plateNumber')}</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.plateNumberA}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.serialNumber')}</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.serialNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.vehicleType')}</p>
                    <p className="font-medium text-gray-800">
                      {selectedVehicle.vehicleType}
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
                    setSelectedVehicle(null);
                    setRecoveryDetails("");
                  }}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleRecoverStolen}
                  loading={loading}
                  disabled={loading}
                >
                  <CheckCircle size={18} className="ml-2" />
                  {t('vehicles.confirmRecovery')}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
