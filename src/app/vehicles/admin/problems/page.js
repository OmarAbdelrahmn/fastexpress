"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  AlertTriangle,
  Car,
  User,
  Clock,
  Search,
  CheckCircle,
  FileText,
  MapPin
} from "lucide-react";
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function ProblemsVehiclesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await ApiService.get("/api/vehicles/taken?statusFilter=unavailable");
      if (data && Array.isArray(data.vehicles)) {
        setAllVehicles(data.vehicles);
      } else {
        setAllVehicles([]);
      }
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setErrorMessage(t("vehicles.loadingError"));
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setReason("");
    setShowReportModal(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setErrorMessage(t("vehicles.enterProblemReason"));
      return;
    }

    if (!selectedVehicle?.plateNumberA || !selectedVehicle?.riderIqamaNo) {
      setErrorMessage(t("vehicles.missingVehicleInfo"));
      return;
    }

    setLoadingSubmit(true);
    setErrorMessage("");

    try {
      const queryParams = new URLSearchParams({
        plate: selectedVehicle.plateNumberA,
        riderIqamaNo: selectedVehicle.riderIqamaNo,
        reason: reason
      }).toString();

      await ApiService.post(`/api/vehicles/report-problem?${queryParams}`);

      setSuccessMessage(t("vehicles.reportProblemSuccess"));
      setTimeout(() => {
        setShowReportModal(false);
        setSuccessMessage("");
        setSelectedVehicle(null);
        setReason("");
        loadVehicles(); // Reload to update status potentially
      }, 2000);

    } catch (err) {
      console.error("Error reporting problem:", err);
      setErrorMessage(err.message || t("vehicles.reportProblemError"));
    } finally {
      setLoadingSubmit(false);
    }
  };

  const filteredVehicles = allVehicles.filter(
    (v) =>
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serialNumber?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("vehicles.reportProblemTitle")}
        subtitle={t("vehicles.reportProblemSubtitle")}
        icon={AlertTriangle}
        actionButton={{
          text: t("vehicles.refreshData"),
          icon: <AlertTriangle size={18} />,
          onClick: loadVehicles,
          variant: "secondary",
        }}
        gradient="from-red-600 to-red-800"
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

      {/* Search */}
      <Card>
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={t("vehicles.searchPlaceholderReport")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {t("common.showing")} {filteredVehicles.length} {t("vehicles.activeVehicles")}
        </div>
      </Card>

      {/* Vehicles Grid */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600">{t("vehicles.loadingVehicles")}</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">
              {t("vehicles.noActiveVehiclesFound")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id || vehicle.plateNumberA}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <Car className="text-red-600" size={20} />
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
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car size={14} />
                    <span className="text-xs">
                      {t("vehicles.serialNumber")}: {vehicle.serialNumber}
                    </span>
                  </div>

                  {vehicle.riderName && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={14} />
                      <span className="text-xs">
                        {t("vehicles.rider")}: {vehicle.riderName}
                      </span>
                    </div>
                  )}

                  {vehicle.location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={14} />
                      <span className="text-xs">
                        {vehicle.location}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleReportClick(vehicle)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <AlertTriangle size={16} className="ml-2" />
                  {t("vehicles.reportProblemButton")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Report Modal */}
      {showReportModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={24} />
                  {t("vehicles.reportProblemTitle")}
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitProblem} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Car size={16} className="text-gray-500" />
                    {t("vehicles.vehicleInfo")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">{t("vehicles.plateNumber")}</p>
                      <p className="font-bold text-gray-900">
                        {formatPlateNumber(selectedVehicle.plateNumberA)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">{t("vehicles.serialNumber")}</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.serialNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    {t("vehicles.riderInfo")}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 mb-1">{t("vehicles.riderName")}</p>
                      <p className="font-bold text-gray-900">{selectedVehicle.riderName}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 mb-1">{t("vehicles.iqamaNumber")}</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.riderIqamaNo}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("vehicles.problemReason")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={4}
                    placeholder={t("vehicles.describeProblemPlaceholder")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowReportModal(false)}
                    disabled={loadingSubmit}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    loading={loadingSubmit}
                    disabled={loadingSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <AlertTriangle size={18} className="ml-2" />
                    {t("vehicles.submitReport")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
