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
  Wrench,
  Search,
  Eye,
} from "lucide-react";

export default function ProblemsVehiclesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [problemVehicles, setProblemVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadProblemVehicles();
  }, []);

  const loadProblemVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get("/api/vehicles/problem");
      if (data && data.vehicles) {
        setProblemVehicles(Array.isArray(data) ? data : []);
      } else {
        setProblemVehicles([]);
      }
    } catch (err) {
      console.error("Error loading problem vehicles:", err);
      setErrorMessage(t("vehicles.loadingError"));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleFixRedirect = (vehicle) => {
    router.push(`/vehicles/admin/fix-problems?plate=${vehicle.plateNumberA}`);
  };

  const filteredVehicles = (Array.isArray(problemVehicles) ? problemVehicles : []).filter(
    (v) =>
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProblems = (Array.isArray(problemVehicles) ? problemVehicles : []).reduce(
    (sum, v) => sum + (v.problemsCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("vehicles.problemsTitle")}
        subtitle={t("vehicles.vehiclesNeedMaintenance", { count: filteredVehicles.length })}
        icon={AlertTriangle}
        actionButton={{
          text: t("vehicles.refreshData"),
          icon: <AlertTriangle size={18} />,
          onClick: loadProblemVehicles,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">{t("vehicles.problemVehiclesCount")}</p>
              <p className="text-3xl font-bold text-orange-700">
                {problemVehicles.length}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t("vehicles.totalProblems")}</p>
              <p className="text-3xl font-bold text-red-700">{totalProblems}</p>
            </div>
            <Wrench className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">{t("vehicles.displayedResults")}</p>
              <p className="text-3xl font-bold text-purple-700">
                {filteredVehicles.length}
              </p>
            </div>
            <Search className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={t("vehicles.searchPlaceholderProblems")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </Card>

      {/* Vehicles Grid */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-600" />
          {t("vehicles.vehiclesNeedMaintenanceTitle")}
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">{t("vehicles.loadingData")}</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-gray-600">
              {t("vehicles.noVehiclesNeedMaintenance")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.vehicleNumber}
                className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <AlertTriangle className="text-orange-600" size={20} />
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
                  <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-medium">
                    {vehicle.problemsCount || 1} {t("vehicles.problem")}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car size={14} />
                    <span className="text-xs">
                      {t("vehicles.serialNumber")}: {vehicle.serialNumber}
                    </span>
                  </div>

                  {vehicle.riderName &&
                    vehicle.riderName !== "N/A" &&
                    vehicle.riderName !== "Unknown" && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={14} />
                        <span className="text-xs">
                          {t("vehicles.lastRider")}: {vehicle.riderName}
                        </span>
                      </div>
                    )}

                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={14} />
                    <span className="text-xs">
                      {t("vehicles.since")}: {new Date(vehicle.since).toLocaleDateString("en-US")}
                    </span>
                  </div>

                  {vehicle.reason && (
                    <div className="bg-orange-100 p-2 rounded mt-2">
                      <p className="text-xs text-orange-800">
                        <strong>{t("vehicles.problemLabel")}</strong> {vehicle.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(vehicle)}
                    variant="secondary"
                    className="flex-1 text-sm"
                  >
                    <Eye size={16} className="ml-1" />
                    {t("common.details")}
                  </Button>
                  <Button
                    onClick={() => handleFixRedirect(vehicle)}
                    className="flex-1 text-sm"
                  >
                    <Wrench size={16} className="ml-1" />
                    {t("vehicles.fix")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("vehicles.vehicleDetails")}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Problem Status */}
                <div className="bg-orange-50 p-4 rounded-lg border-r-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-orange-600" size={20} />
                    <h3 className="font-bold text-orange-800">
                      {t("vehicles.problemStatus")} - {selectedVehicle.problemsCount || 1} {t("vehicles.problem")}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    {t("vehicles.since")}:{" "}
                    {new Date(selectedVehicle.since).toLocaleString("en-US")}
                  </p>
                  {selectedVehicle.reason && (
                    <div className="mt-3 bg-orange-100 p-3 rounded">
                      <p className="text-sm text-orange-900">
                        <strong>{t("vehicles.problemDescription")}:</strong>
                        <br />
                        {selectedVehicle.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3">
                    {t("vehicles.vehicleInfo")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">{t("vehicles.plateNumber")}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.plateNumberA}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">{t("vehicles.serialNumber")}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.serialNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">{t("vehicles.vehicleType")}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.vehicleType}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">{t("vehicles.vehicleNumber")}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.vehicleNumber}
                      </p>
                    </div>
                    {selectedVehicle.location && (
                      <div className="col-span-2">
                        <p className="text-gray-600 mb-1">{t("vehicles.location")}</p>
                        <p className="font-medium text-gray-800">
                          {selectedVehicle.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Rider Info */}
                {selectedVehicle.riderName &&
                  selectedVehicle.riderName !== "N/A" &&
                  selectedVehicle.riderName !== "Unknown" && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-3">
                        {t("vehicles.lastRiderInfo")}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600 mb-1">{t("vehicles.riderName")}</p>
                          <p className="font-medium text-gray-800">
                            {selectedVehicle.riderName}
                          </p>
                        </div>
                        {selectedVehicle.riderIqamaNo && (
                          <div>
                            <p className="text-blue-600 mb-1">{t("vehicles.iqamaNumber")}</p>
                            <p className="font-medium text-gray-800">
                              {selectedVehicle.riderIqamaNo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Manufacturing Info */}
                {selectedVehicle.manufacturer && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">
                      {t("vehicles.manufacturingInfo")}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">{t("vehicles.manufacturer")}</p>
                        <p className="font-medium text-gray-800">
                          {selectedVehicle.manufacturer}
                        </p>
                      </div>
                      {selectedVehicle.manufactureYear && (
                        <div>
                          <p className="text-gray-600 mb-1">{t("vehicles.manufactureYear")}</p>
                          <p className="font-medium text-gray-800">
                            {selectedVehicle.manufactureYear}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  variant="secondary"
                >
                  {t("common.close")}
                </Button>
                <Button onClick={() => handleFixRedirect(selectedVehicle)}>
                  <Wrench size={18} className="ml-2" />
                  {t("vehicles.goToFix")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
