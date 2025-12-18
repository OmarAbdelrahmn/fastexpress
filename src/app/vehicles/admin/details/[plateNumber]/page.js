"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import PageHeader from "@/components/layout/pageheader";
import {
  Car,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Shield,
  PackageX,
  MapPin,
  Calendar,
  User,
  Package,
  Building,
  FileText,
  Clock,
  Activity,
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  VehicleStatusType,
  getVehicleStatusAttributes,
  normalizeVehicleStatus
} from "@/lib/constants/vehicleStatus";
import { formatPlateNumber, formatLicenseExpiry } from "@/lib/utils/formatters";

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const plate = params?.plateNumber || "";
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    if (plate) {
      loadVehicleDetails();
    }
  }, [plate]);

  const loadVehicleDetails = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(`/api/vehicles/with-rider/${plate}`);
      setVehicle(data);
    } catch (err) {
      console.error("Error loading vehicle details:", err);
      setErrorMessage(t("vehicles.loadDetailsError"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!vehicle) return { label: "", color: "gray", icon: Car, styles: { bg: "", border: "", text: "", badge: "" } };

    const vStatus = normalizeVehicleStatus(vehicle.statusType);
    const effectiveStatus = vStatus || (
      vehicle.isStolen ? VehicleStatusType.Stolen :
        vehicle.isBreakUp ? VehicleStatusType.BreakUp :
          vehicle.hasActiveProblem ? VehicleStatusType.Problem :
            !vehicle.isAvailable ? VehicleStatusType.Taken :
              VehicleStatusType.Returned
    );

    const attrs = getVehicleStatusAttributes(effectiveStatus, t);

    // Override label for Taken if needed, or keeping it strictly consistent
    // The original code used "In Use" for Taken/Unavailable. Helper uses "Taken" (or translation). 
    // We'll trust the helper's translation key 'vehicles.statusTaken' maps to "Taken" or "In Use" as preferred.
    // If we want to strictly match "In Use" we might need to check the translation key.

    return attrs;
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <div className="w-full">
        <PageHeader
          title={t("vehicles.vehicleDetails")}
          subtitle={t("common.loading")}
          icon={Car}
        />
        <div className="px-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t("vehicles.loadingVehicleDetails")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !vehicle) {
    return (
      <div className="w-full">
        <PageHeader
          title={t("vehicles.vehicleDetails")}
          subtitle={t("riders.errorOccurred")}
          icon={Car}
          actionButton={{
            text: t("common.back"),
            icon: <ArrowRight size={18} />,
            onClick: () => router.back(),
            variant: "secondary",
          }}
        />
        <div className="px-6">
          <Alert
            type="error"
            title={t("common.error")}
            message={errorMessage || t("vehicles.vehicleNotFound")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title={`${t("vehicles.vehicle")} ${formatPlateNumber(vehicle.plateNumberA)}`}
        subtitle={vehicle.vehicleType}
        icon={Car}
        actionButton={{
          text: t("common.back"),
          icon: <ArrowRight size={18} />,
          onClick: () => router.back(),
          variant: "secondary",
        }}
      />

      <div className="px-6 space-y-6">
        {/* Status Banner */}
        <div
          className={`${statusInfo.styles.bg} border-r-4 ${statusInfo.styles.border.replace('border-', 'border-r-')} p-6 rounded-lg`}
        >
          <div className="flex items-center gap-4">
            <div className={`bg-white p-3 rounded-xl`}>
              <StatusIcon
                className={`${statusInfo.styles.text}`}
                size={32}
              />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${statusInfo.styles.text.replace('text-', 'text-opacity-80-')}`}>
                {statusInfo.label}
              </h2>
              <p className={`${statusInfo.styles.text} text-opacity-80`}>
                {t("vehicles.currentVehicleStatus")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Car size={20} />
              {t("vehicles.vehicleInfo")}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("vehicles.plateNumberArabic")}
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {formatPlateNumber(vehicle.plateNumberA)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("vehicles.plateNumberEnglish")}
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {vehicle.plateNumberE || t("profile.notSpecified")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("vehicles.vehicleNumber")}</p>
                  <p className="font-medium text-gray-800">
                    {vehicle.vehicleNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("vehicles.serialNumberFull")}</p>
                  <p className="font-medium text-gray-800">
                    {vehicle.serialNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("vehicles.vehicleType")}</p>
                  <p className="font-medium text-gray-800">
                    {vehicle.vehicleType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("vehicles.currentLocation")}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin size={14} />
                    {vehicle.location || t("profile.notSpecified")}
                  </p>
                </div>
              </div>

              {vehicle.manufacturer && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("vehicles.manufacturer")}</p>
                    <p className="font-medium text-gray-800">
                      {vehicle.manufacturer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("vehicles.manufactureYear")}</p>
                    <p className="font-medium text-gray-800">
                      {vehicle.manufactureYear || t("profile.notSpecified")}
                    </p>
                  </div>
                </div>
              )}

              {vehicle.licenseExpiryDate && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-yellow-600" />
                    <p className="text-sm font-bold text-yellow-800">
                      {t("vehicles.licenseExpiryDate")}
                    </p>
                  </div>
                  <p className="text-yellow-700 font-medium">
                    {formatLicenseExpiry(vehicle.licenseExpiryDate)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Owner Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building size={20} />
              {t("vehicles.ownerInfo")}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("vehicles.ownerName")}</p>
                <p className="font-medium text-gray-800 text-lg">
                  {vehicle.ownerName || t("profile.notSpecified")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("vehicles.ownerIdNumber")}</p>
                <p className="font-medium text-gray-800">
                  {vehicle.ownerId || t("profile.notSpecified")}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Rider Information */}
        {vehicle.currentRider && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              {t("vehicles.currentRider")}
            </h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-600 mb-1">{t("employees.iqamaNumber")}</p>
                  <p className="font-bold text-blue-800">
                    {vehicle.currentRider.employeeIqamaNo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">{t("riders.nameArabic")}</p>
                  <p className="font-medium text-gray-800">
                    {vehicle.currentRider.riderName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">{t("riders.nameEnglish")}</p>
                  <p className="font-medium text-gray-800">
                    {vehicle.currentRider.riderNameE}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">{t("vehicles.receiveDate")}</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(
                      vehicle.currentRider.takenDate
                    ).toLocaleDateString("en-US")}
                  </p>
                </div>
                {vehicle.currentRider.takenReason && (
                  <div className="col-span-full">
                    <p className="text-sm text-blue-600 mb-1">{t("vehicles.receiveReason")}</p>
                    <p className="font-medium text-gray-800">
                      {vehicle.currentRider.takenReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Status Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={20} />
            {t("vehicles.vehicleStatus")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t("vehicles.currentStatus")}</p>
              <p className="font-bold text-gray-800">{vehicle.currentStatus}</p>
            </div>
            {vehicle.statusSince && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t("vehicles.inThisStatusSince")}</p>
                <p className="font-medium text-gray-800">
                  {new Date(vehicle.statusSince).toLocaleString("en-Us", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                {t("vehicles.readyForUse")}
              </p>
              <p className="font-bold text-gray-800 flex items-center gap-2">
                {vehicle.isAvailable ? (
                  <>
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-green-600">{t("common.yes")}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="text-red-600" />
                    <span className="text-red-600">{t("common.no")}</span>
                  </>
                )}
              </p>
            </div>
            {vehicle.hasActiveProblem && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 mb-1">{t("vehicles.activeProblemsStatus")}</p>
                <p className="font-bold text-orange-800">
                  {vehicle.activeProblemsCount}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Warning Flags */}
        {(vehicle.isStolen ||
          vehicle.isBreakUp ||
          vehicle.hasActiveProblem) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vehicle.isStolen && (
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="text-red-600" size={24} />
                    <div>
                      <p className="font-bold text-red-800">{t("vehicles.stolenVehicle")}</p>
                      <p className="text-sm text-red-600">
                        {t("vehicles.stolenReport")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {vehicle.isBreakUp && (
                <div className="bg-gray-50 border-r-4 border-gray-500 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <PackageX className="text-gray-600" size={24} />
                    <div>
                      <p className="font-bold text-gray-800">{t("vehicles.outOfService")}</p>
                      <p className="text-sm text-gray-600">
                        {t("vehicles.vehicleNotUsable")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {vehicle.hasActiveProblem && (
                <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-orange-600" size={24} />
                    <div>
                      <p className="font-bold text-orange-800">{t("vehicles.activeProblemsStatus")}</p>
                      <p className="text-sm text-orange-600">
                        {vehicle.activeProblemsCount} {t("vehicles.problemsNeedFix")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        {/* Action Buttons */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t("riders.quickActions")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => router.push("/vehicles/admin/change-location")}
              variant="secondary"
            >
              <MapPin size={18} className="ml-2" />
              {t("vehicles.changeLocation")}
            </Button>
            {vehicle.hasActiveProblem && (
              <Button
                onClick={() => router.push("/vehicles/admin/fix-problems")}
                variant="secondary"
              >
                <AlertTriangle size={18} className="ml-2" />
                {t("vehicles.fixProblems")}
              </Button>
            )}
            <Button
              onClick={() => router.push("/vehicles/admin/manage")}
              variant="secondary"
            >
              <Car size={18} className="ml-2" />
              {t("riders.editData")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
