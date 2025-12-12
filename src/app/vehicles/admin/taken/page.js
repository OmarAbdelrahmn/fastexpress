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
  Users,
  Search,
  Car,
  MapPin,
  Calendar,
  User,
  Clock,
  Eye,
  AlertTriangle,
  Shield,
  PackageX,
} from "lucide-react";

export default function TakenVehiclesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("unavailable"); // unavailable, problem, stolen, breakup, all
  const [vehiclesData, setVehiclesData] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [filterStatus]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(
        `/api/vehicles/taken?statusFilter=${filterStatus}`
      );
      setVehiclesData(data);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setErrorMessage(t("vehicles.loadingError"));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const vehicles = vehiclesData?.vehicles || [];

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.statusType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Taken":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-600",
          badge: "bg-blue-600",
        };
      case "Problem":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-600",
          badge: "bg-orange-600",
        };
      case "Stolen":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          badge: "bg-red-600",
        };
      case "BreakUp":
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-600",
          badge: "bg-gray-600",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-600",
          badge: "bg-blue-600",
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Taken":
        return t("vehicles.inUse");
      case "Problem":
        return t("vehicles.problems");
      case "Stolen":
        return t("vehicles.stolen");
      case "BreakUp":
        return t("vehicles.outOfService");
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Taken":
        return Users;
      case "Problem":
        return AlertTriangle;
      case "Stolen":
        return Shield;
      case "BreakUp":
        return PackageX;
      default:
        return Car;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("vehicles.takenAndProblemsTitle")}
        subtitle={t("vehicles.vehicleCount", { count: filteredVehicles.length })}
        icon={Users}
        actionButton={{
          text: t("vehicles.refreshData"),
          icon: <Users size={18} />,
          onClick: loadVehicles,
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 mb-1">{t("vehicles.inUse")}</p>
              <p className="text-2xl font-bold text-blue-700">
                {vehiclesData?.takenCount || 0}
              </p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 mb-1">{t("vehicles.problems")}</p>
              <p className="text-2xl font-bold text-orange-700">
                {vehiclesData?.problemCount || 0}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 mb-1">{t("vehicles.stolen")}</p>
              <p className="text-2xl font-bold text-red-700">
                {vehiclesData?.stolenCount || 0}
              </p>
            </div>
            <Shield className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-50 border-r-4 border-gray-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">{t("vehicles.outOfService")}</p>
              <p className="text-2xl font-bold text-gray-700">
                {vehiclesData?.breakUpCount || 0}
              </p>
            </div>
            <PackageX className="text-gray-500" size={32} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 mb-1">{t("vehicles.total")}</p>
              <p className="text-2xl font-bold text-purple-700">
                {vehiclesData?.totalCount || 0}
              </p>
            </div>
            <Car className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterStatus("unavailable")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === "unavailable"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("vehicles.inUse")} ({vehiclesData?.takenCount || 0})
          </button>
          <button
            onClick={() => setFilterStatus("problem")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === "problem"
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("vehicles.problems")} ({vehiclesData?.problemCount || 0})
          </button>
          <button
            onClick={() => setFilterStatus("stolen")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === "stolen"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("vehicles.stolen")} ({vehiclesData?.stolenCount || 0})
          </button>
          <button
            onClick={() => setFilterStatus("breakup")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === "breakup"
              ? "bg-gray-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("vehicles.outOfService")} ({vehiclesData?.breakUpCount || 0})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {t("vehicles.all")} ({vehiclesData?.totalCount || 0})
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={t("vehicles.searchPlaceholderRider")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Vehicles Grid */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          {t("vehicles.vehiclesList")}
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t("vehicles.loadingDataMessage")}</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">{t("vehicles.noVehiclesFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const colors = getStatusColor(vehicle.statusType);
              const StatusIcon = getStatusIcon(vehicle.statusType);

              return (
                <div
                  key={vehicle.vehicleNumber}
                  className={`border-2 ${colors.border} rounded-lg p-4 ${colors.bg} hover:shadow-md transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`${colors.bg} p-2 rounded-lg`}>
                        <StatusIcon className={colors.text} size={20} />
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
                    <span
                      className={`px-3 py-1 ${colors.badge} text-white rounded-full text-xs font-medium`}
                    >
                      {getStatusLabel(vehicle.statusType)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Car size={14} />
                      <span className="text-xs">
                        {t("vehicles.serialNumberLabel")} {vehicle.serialNumber}
                      </span>
                    </div>

                    {vehicle.riderName &&
                      vehicle.riderName !== "N/A" &&
                      vehicle.riderName !== "Unknown" && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={14} />
                          <span className="text-xs">{vehicle.riderName}</span>
                        </div>
                      )}

                    {vehicle.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={14} />
                        <span className="text-xs">{vehicle.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={14} />
                      <span className="text-xs">
                        {t("vehicles.sinceLabel")}{" "}
                        {new Date(vehicle.since).toLocaleDateString("en-US")}
                      </span>
                    </div>

                    {vehicle.reason && (
                      <div className={`${colors.bg} p-2 rounded mt-2`}>
                        <p className={`text-xs ${colors.text}`}>
                          <strong>{t("vehicles.reason")}</strong> {vehicle.reason}
                        </p>
                      </div>
                    )}

                    {vehicle.problemsCount > 0 && (
                      <div className="bg-orange-100 px-2 py-1 rounded">
                        <p className="text-xs text-orange-700">
                          <strong>{t("vehicles.problemsCountLabel")}</strong> {vehicle.problemsCount}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleViewDetails(vehicle)}
                    variant="secondary"
                    className="w-full text-sm"
                  >
                    <Eye size={16} className="ml-2" />
                    {t("vehicles.viewDetails")}
                  </Button>
                </div>
              );
            })}
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
                {/* Status Info */}
                <div
                  className={`${getStatusColor(selectedVehicle.statusType).bg
                    } p-4 rounded-lg border-r-4 ${getStatusColor(
                      selectedVehicle.statusType
                    ).border.replace("border-", "border-r-")}`}
                >
                  <h3
                    className={`font-bold ${getStatusColor(selectedVehicle.statusType).text
                      } mb-2`}
                  >
                    {t("vehicles.vehicleStatus")} {getStatusLabel(selectedVehicle.statusType)}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {t("vehicles.sinceLabel")}{" "}
                    {new Date(selectedVehicle.since).toLocaleString("en-US")}
                  </p>
                  {selectedVehicle.reason && (
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>{t("vehicles.reason")}</strong> {selectedVehicle.reason}
                    </p>
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
                      <p className="text-gray-600 mb-1">{t("vehicles.location")}</p>
                      <p className="font-medium text-gray-800">
                        {selectedVehicle.location || t("vehicles.notSpecified")}
                      </p>
                    </div>
                    {selectedVehicle.manufacturer && (
                      <>
                        <div>
                          <p className="text-gray-600 mb-1">{t("vehicles.manufacturer")}</p>
                          <p className="font-medium text-gray-800">
                            {selectedVehicle.manufacturer}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">{t("vehicles.manufactureYear")}</p>
                          <p className="font-medium text-gray-800">
                            {selectedVehicle.manufactureYear || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rider Info */}
                {selectedVehicle.riderName &&
                  selectedVehicle.riderName !== "N/A" &&
                  selectedVehicle.riderName !== "Unknown" && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-3">
                        {t("vehicles.riderInfo")}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600 mb-1">
                            {t("vehicles.riderNameArabic")}
                          </p>
                          <p className="font-medium text-gray-800">
                            {selectedVehicle.riderName}
                          </p>
                        </div>
                        {selectedVehicle.riderNameE &&
                          selectedVehicle.riderNameE !== "N/A" && (
                            <div>
                              <p className="text-blue-600 mb-1">
                                {t("vehicles.riderNameEnglish")}
                              </p>
                              <p className="font-medium text-gray-800">
                                {selectedVehicle.riderNameE}
                              </p>
                            </div>
                          )}
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

                {/* Owner Info */}
                {selectedVehicle.ownerName && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">
                      {t("vehicles.ownerInfo")}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">{t("vehicles.ownerName")}</p>
                        <p className="font-medium text-gray-800">
                          {selectedVehicle.ownerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">{t("vehicles.ownerIdNumber")}</p>
                        <p className="font-medium text-gray-800">
                          {selectedVehicle.ownerId || t("vehicles.notSpecified")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  variant="secondary"
                >
                  {t("vehicles.close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
