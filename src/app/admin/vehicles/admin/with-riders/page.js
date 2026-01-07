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
  Filter,
  Eye,
  Package,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Shield,
  PackageX,
  Download
} from "lucide-react";
import * as XLSX from 'xlsx';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  VehicleStatusType,
  getVehicleStatusAttributes,
  normalizeVehicleStatus
} from "@/lib/constants/vehicleStatus";
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function VehiclesWithRidersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serialNumber?.toString().includes(searchTerm) ||
      v.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentRider?.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentRider?.riderNameE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentRider?.employeeIqamaNo?.toString().includes(searchTerm) ||
      v.currentRider?.workingId?.toString().includes(searchTerm) ||
      v.currentRider?.phoneNumber?.toString().includes(searchTerm) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const effectiveStatus =
      v.isStolen ? VehicleStatusType.Stolen :
        v.isBreakUp ? VehicleStatusType.BreakUp :
          v.hasActiveProblem ? VehicleStatusType.Problem :
            normalizeVehicleStatus(v.currentStatus) ||
            (!v.isAvailable ? VehicleStatusType.Taken : VehicleStatusType.Returned);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter.toLowerCase() === "returned" && effectiveStatus === VehicleStatusType.Returned) ||
      (statusFilter.toLowerCase() === "taken" && effectiveStatus === VehicleStatusType.Taken) ||
      (statusFilter.toLowerCase() === "problem" && effectiveStatus === VehicleStatusType.Problem) ||
      (statusFilter.toLowerCase() === "stolen" && effectiveStatus === VehicleStatusType.Stolen) ||
      (statusFilter.toLowerCase() === "breakup" && effectiveStatus === VehicleStatusType.BreakUp);

    return matchesSearch && matchesStatus;
  });

  const getStatsCount = (statusType) => {
    return vehicles.filter(v => {
      const effectiveStatus =
        v.isStolen ? VehicleStatusType.Stolen :
          v.isBreakUp ? VehicleStatusType.BreakUp :
            v.hasActiveProblem ? VehicleStatusType.Problem :
              normalizeVehicleStatus(v.currentStatus) ||
              (!v.isAvailable ? VehicleStatusType.Taken : VehicleStatusType.Returned);

      return effectiveStatus === statusType;
    }).length;
  };

  const stats = {
    total: vehicles.length,
    returned: getStatsCount(VehicleStatusType.Returned),
    taken: getStatsCount(VehicleStatusType.Taken),
    problems: getStatsCount(VehicleStatusType.Problem),
    stolen: getStatsCount(VehicleStatusType.Stolen),
    breakup: getStatsCount(VehicleStatusType.BreakUp),
  };


  const handleExportExcel = () => {
    const data = filteredVehicles.map(v => {
      const effectiveStatus =
        v.isStolen ? VehicleStatusType.Stolen :
          v.isBreakUp ? VehicleStatusType.BreakUp :
            v.hasActiveProblem ? VehicleStatusType.Problem :
              normalizeVehicleStatus(v.currentStatus) ||
              (!v.isAvailable ? VehicleStatusType.Taken : VehicleStatusType.Returned);

      const statusAttrs = getVehicleStatusAttributes(effectiveStatus, t);

      return {
        [t('vehicles.plateNumber')]: formatPlateNumber(v.plateNumberA),
        [t('vehicles.serialNumber')]: v.serialNumber,
        [t('vehicles.vehicleNumber')]: v.vehicleNumber,
        [t('vehicles.type')]: v.vehicleType,
        [t('vehicles.manufacturer')]: v.manufacturer,
        [t('vehicles.manufactureYear')]: v.manufactureYear,
        [t('vehicles.currentLocation')]: v.location || '-',
        [t('employees.riderName')]: v.currentRider?.riderName || '-',
        [t('employees.riderNameEn')]: v.currentRider?.riderNameE || '-',
        [t('employees.iqamaNumber')]: v.currentRider?.employeeIqamaNo || '-',
        [t('employees.phoneNumber')]: v.currentRider?.phoneNumber || '-',
        [t('vehicles.statuss')]: statusAttrs.label
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehicles");
    XLSX.writeFile(wb, `Vehicles_List_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                  {stats.returned}
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

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">{t('vehicles.filterResults')}</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
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

                {[
                  { type: VehicleStatusType.Returned, key: "returned", count: stats.returned },
                  { type: VehicleStatusType.Taken, key: "taken", count: stats.taken },
                  { type: VehicleStatusType.Problem, key: "problem", count: stats.problems },
                  { type: VehicleStatusType.Stolen, key: "stolen", count: stats.stolen },
                  { type: VehicleStatusType.BreakUp, key: "breakup", count: stats.breakup },
                ].map(item => {
                  const attrs = getVehicleStatusAttributes(item.type, t);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setStatusFilter(item.key)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${statusFilter === item.key
                        ? `${attrs.styles.badge} text-white`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {attrs.label} ({item.count})
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleExportExcel}
                className="!bg-green-600 hover:!bg-green-700 text-white !py-1.5 text-sm h-auto shadow-sm p-2"
              >
                <Download size={16} className="ml-2" />
                {t('common.exportExcel')}
              </Button>
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
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-start border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-start w-[25%]">{t('vehicles.vehicle')}</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-start w-[25%]">{t('vehicles.details')}</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-start w-[25%]">{t('employees.rider')}</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-start w-[15%]">{t('vehicles.statuss')}</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-start w-[10%]">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => {
                    const effectiveStatus =
                      vehicle.isStolen ? VehicleStatusType.Stolen :
                        vehicle.isBreakUp ? VehicleStatusType.BreakUp :
                          vehicle.hasActiveProblem ? VehicleStatusType.Problem :
                            normalizeVehicleStatus(vehicle.currentStatus) ||
                            (!vehicle.isAvailable ? VehicleStatusType.Taken : VehicleStatusType.Returned);

                    const attrs = getVehicleStatusAttributes(effectiveStatus, t);

                    return (
                      <tr key={vehicle.vehicleNumber} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${attrs.styles.bg} ${attrs.styles.text}`}>
                              <attrs.icon size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {formatPlateNumber(vehicle.plateNumberA)}
                              </div>
                              <div className="space-y-0.5 mt-1">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Package size={12} />
                                  <span>{vehicle.serialNumber}</span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Car size={12} />
                                  <span>{vehicle.vehicleNumber}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-medium text-gray-900">{vehicle.vehicleType}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {vehicle.manufacturer} {vehicle.manufactureYear ? `(${vehicle.manufactureYear})` : ''}
                          </div>
                          {vehicle.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin size={12} />
                              {vehicle.location}
                            </div>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          {vehicle.currentRider ? (
                            <div className="space-y-1">
                              <div className="font-bold text-gray-900 text-base">
                                {vehicle.currentRider.riderName || '-'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {vehicle.currentRider.riderNameE || '-'}
                              </div>
                              <div className="text-sm text-gray-500 flex flex-col gap-0.5 mt-1">
                                {vehicle.currentRider.employeeIqamaNo && (
                                  <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-fit text-xs font-medium">
                                    {t('employees.iqamaNumber')}: {vehicle.currentRider.employeeIqamaNo}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">-</span>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attrs.styles.badge} text-white`}>
                              {attrs.label}
                            </span>
                            {vehicle.statusSince && (
                              <div className="text-xs text-gray-400 flex items-center gap-1 px-1">
                                <Calendar size={12} />
                                {new Date(vehicle.statusSince).toLocaleDateString("en-US")}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top text-center">
                          <Button
                            onClick={() => router.push(`/admin/vehicles/admin/details/${vehicle.plateNumberA}`)}
                            variant="secondary"
                            className="!py-1.5 !px-3 text-sm h-auto"
                          >
                            <Eye size={16} className="mr-1.5" />
                            {t('vehicles.viewDetails')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
