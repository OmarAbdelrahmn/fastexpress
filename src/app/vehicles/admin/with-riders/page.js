"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import PageHeader from "@/components/layout/pageheader";
import {
  Users,
  Search,
  Car,
  CheckCircle,
  AlertTriangle,
  Shield,
  PackageX,
  MapPin,
  Calendar,
  User,
  Package,
  Filter,
  Eye,
} from "lucide-react";
import { useLanguage } from '@/lib/context/LanguageContext';

export default function VehiclesWithRidersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // all, available, taken, problem, stolen, breakup
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get("/api/vehicles/with-riders");
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      setErrorMessage(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (vehicle) => {
    if (vehicle.isStolen) return "red";
    if (vehicle.isBreakUp) return "gray";
    if (vehicle.hasActiveProblem) return "orange";
    if (!vehicle.isAvailable) return "blue";
    return "green";
  };

  const getStatusText = (vehicle) => {
    if (vehicle.isStolen) return t('vehicles.statusStolen');
    if (vehicle.isBreakUp) return t('vehicles.statusBreakup');
    if (vehicle.hasActiveProblem)
      return `${t('vehicles.statusProblem')} (${vehicle.activeProblemsCount})`;
    if (!vehicle.isAvailable) return t('vehicles.statusTaken');
    return t('vehicles.statusAvailable');
  };

  const getStatusIcon = (vehicle) => {
    if (vehicle.isStolen) return Shield;
    if (vehicle.isBreakUp) return PackageX;
    if (vehicle.hasActiveProblem) return AlertTriangle;
    if (!vehicle.isAvailable) return Users;
    return CheckCircle;
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serialNumber?.toString().includes(searchTerm) ||
      v.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentRider?.riderName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && v.isAvailable) ||
      (statusFilter === "taken" &&
        !v.isAvailable &&
        !v.hasActiveProblem &&
        !v.isStolen &&
        !v.isBreakUp) ||
      (statusFilter === "problem" && v.hasActiveProblem) ||
      (statusFilter === "stolen" && v.isStolen) ||
      (statusFilter === "breakup" && v.isBreakUp);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.isAvailable).length,
    taken: vehicles.filter(
      (v) =>
        !v.isAvailable && !v.hasActiveProblem && !v.isStolen && !v.isBreakUp
    ).length,
    problems: vehicles.filter((v) => v.hasActiveProblem).length,
    stolen: vehicles.filter((v) => v.isStolen).length,
    breakup: vehicles.filter((v) => v.isBreakUp).length,
  };

  return (
    <div className="w-full">
      <PageHeader
        title={t('vehicles.vehiclesWithRidersTitle')}
        subtitle={`${filteredVehicles.length} ${t('vehicles.vehiclesWithRidersSubtitle')}`}
        icon={Users}
        actionButton={{
          text: t('common.refresh'),
          icon: <Users size={18} />,
          onClick: loadVehicles,
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

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 pt-5">
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 mb-1">{t('common.total')}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.total}
                </p>
              </div>
              <Car className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 mb-1">{t('vehicles.statusAvailable')}</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.available}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-indigo-50 border-r-4 border-indigo-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 mb-1">{t('vehicles.statusTaken')}</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {stats.taken}
                </p>
              </div>
              <Users className="text-indigo-500" size={32} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 mb-1">{t('vehicles.statusProblem')}</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.problems}
                </p>
              </div>
              <AlertTriangle className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 mb-1">{t('vehicles.statusStolen')}</p>
                <p className="text-2xl font-bold text-red-700">
                  {stats.stolen}
                </p>
              </div>
              <Shield className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-gray-50 border-r-4 border-gray-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">{t('vehicles.statusBreakup')}</p>
                <p className="text-2xl font-bold text-gray-700">
                  {stats.breakup}
                </p>
              </div>
              <PackageX className="text-gray-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={20} className="text-gray-600" />
              <h3 className="text-lg font-bold text-gray-800">{t('vehicles.filterResults')}</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('common.all')} ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter("available")}
                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "available"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('vehicles.statusAvailable')} ({stats.available})
              </button>
              <button
                onClick={() => setStatusFilter("taken")}
                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "taken"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('vehicles.statusTaken')} ({stats.taken})
              </button>
              <button
                onClick={() => setStatusFilter("problem")}
                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "problem"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('vehicles.statusProblem')} ({stats.problems})
              </button>
              <button
                onClick={() => setStatusFilter("stolen")}
                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "stolen"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('vehicles.statusStolen')} ({stats.stolen})
              </button>
              <button
                onClick={() => setStatusFilter("breakup")}
                className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === "breakup"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('vehicles.statusBreakup')} ({stats.breakup})
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder={t('vehicles.searchPlaceholderManage')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Vehicles Grid */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t('common.results')} ({filteredVehicles.length})
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVehicles.map((vehicle) => {
                const StatusIcon = getStatusIcon(vehicle);
                const statusColor = getStatusColor(vehicle);
                const colorClasses = {
                  green: {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    badge: "bg-green-600",
                    text: "text-green-600",
                    icon: "text-green-600",
                  },
                  blue: {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    badge: "bg-blue-600",
                    text: "text-blue-600",
                    icon: "text-blue-600",
                  },
                  orange: {
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    badge: "bg-orange-600",
                    text: "text-orange-600",
                    icon: "text-orange-600",
                  },
                  red: {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    badge: "bg-red-600",
                    text: "text-red-600",
                    icon: "text-red-600",
                  },
                  gray: {
                    bg: "bg-gray-50",
                    border: "border-gray-200",
                    badge: "bg-gray-600",
                    text: "text-gray-600",
                    icon: "text-gray-600",
                  },
                }[statusColor];

                return (
                  <div
                    key={vehicle.vehicleNumber}
                    className={`border-2 ${colorClasses.border} rounded-lg p-4 ${colorClasses.bg} hover:shadow-lg transition`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`bg-white p-2 rounded-lg`}>
                          <StatusIcon className={colorClasses.icon} size={20} />
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
                        className={`px-3 py-1 ${colorClasses.badge} text-white rounded-full text-xs font-medium`}
                      >
                        {getStatusText(vehicle)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Package size={14} />
                        <span className="text-gray-600">{t('vehicles.serialNumber')}:</span>
                        <span className="font-medium">
                          {vehicle.serialNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Car size={14} />
                        <span className="text-gray-600">{t('vehicles.vehicleNumber')}:</span>
                        <span className="font-medium">
                          {vehicle.vehicleNumber}
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

                      {vehicle.manufacturer && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Car size={14} />
                          <span className="font-medium">
                            {vehicle.manufacturer}
                          </span>
                          {vehicle.manufactureYear && (
                            <span className="text-gray-600">
                              ({vehicle.manufactureYear})
                            </span>
                          )}
                        </div>
                      )}

                      {vehicle.currentRider && (
                        <div className="bg-white border border-green-200 p-3 rounded-lg mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <User size={14} className="text-green-600" />
                            <span className="font-bold text-green-800 text-xs">
                              {t('vehicles.currentRider')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-700">
                              <strong>{vehicle.currentRider.riderName}</strong>
                            </p>
                            <p className="text-xs text-gray-600">
                              {t('vehicles.iqama')}: {vehicle.currentRider.employeeIqamaNo}
                            </p>
                            <p className="text-xs text-gray-600">
                              {t('vehicles.since')}:{" "}
                              {new Date(
                                vehicle.currentRider.takenDate
                              ).toLocaleDateString("en-US")}
                            </p>
                          </div>
                        </div>
                      )}

                      {vehicle.statusSince && (
                        <div className="flex items-center gap-2 text-gray-700 mt-2">
                          <Calendar size={14} />
                          <span className="text-gray-600">{t('vehicles.statusSince')}:</span>
                          <span className="text-xs font-medium">
                            {new Date(vehicle.statusSince).toLocaleDateString(
                              "en-US"
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t">
                      <Button
                        onClick={() =>
                          router.push(
                            `/vehicles/admin/details/${vehicle.plateNumberA}`
                          )
                        }
                        variant="secondary"
                        className="w-full"
                      >
                        <Eye size={16} className="ml-2" />
                        {t('vehicles.viewDetails')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
