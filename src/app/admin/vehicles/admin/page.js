"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import Card from "@/components/Ui/Card";
import MiniStatRow from "@/components/Ui/MiniStatRow";
import Button from "@/components/Ui/Button";
import Alert from "@/components/Ui/Alert";
import PageHeader from "@/components/layout/pageheader";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
  Car,
  Users,
  AlertTriangle,
  CheckCircle,
  Shield,
  PackageX,
  MapPin,
  Wrench,
  RefreshCw,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";

export default function VehicleAdminDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [groupedData, setGroupedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [supervisorRequestsCount, setSupervisorRequestsCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, groupedRes, tempVehiclesRes] = await Promise.all([
        ApiService.get("/api/vehicles/with-riders"),
        ApiService.get("/api/vehicles/group-by-status"),
        ApiService.get("/api/temp/vehicles"),
      ]);

      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
      setGroupedData(groupedRes);
      setSupervisorRequestsCount(Array.isArray(tempVehiclesRes) ? tempVehiclesRes.length : 0);
    } catch (err) {
      console.error("Error loading data:", err);
      setErrorMessage(t("vehicles.loadingError"));
    } finally {
      setLoading(false);
    }
  };

  const stats = groupedData?.summary || {
    availableCount: 0,
    takenCount: 0,
    problemCount: 0,
    stolenCount: 0,
    breakUpCount: 0,
  };

  const totalVehicles = groupedData?.totalVehicles || 0;
  const activeVehicles = stats.availableCount + stats.takenCount;
  const utilizationRate =
    totalVehicles > 0
      ? ((stats.takenCount / totalVehicles) * 100).toFixed(1)
      : 0;

  const othervehicles = totalVehicles - (stats.availableCount + stats.takenCount)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("vehicles.dashboard")}
        subtitle={t("vehicles.dashboardSubtitle")}
        icon={BarChart3}
        actionButton={{
          text: t("vehicles.refreshData"),
          icon: <RefreshCw size={18} />,
          onClick: loadData,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">{t("vehicles.total")}</p>
              <p className="text-4xl font-bold">{totalVehicles}</p>
            </div>
            <div className="bg-opacity-20 p-3 rounded-lg">
              <Car size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <TrendingUp size={16} />
            <span>{t("vehicles.inSystem")}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">{t("vehicles.available")}</p>
              <p className="text-4xl font-bold">{stats.availableCount}</p>
            </div>
            <div className="bg-opacity-20 p-3 rounded-lg">
              <CheckCircle size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-100 text-sm">
            <CheckCircle size={16} />
            <span>{t("vehicles.readyForUse")}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm mb-1">{t("vehicles.taken")}</p>
              <p className="text-4xl font-bold">{stats.takenCount}</p>
            </div>
            <div className="bg-opacity-20 p-3 rounded-lg">
              <Users size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <Users size={16} />
            <span>{t("vehicles.withEmployees")}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">{t("vehicles.utilizationRate")}</p>
              <p className="text-4xl font-bold">{utilizationRate}%</p>
            </div>
            <div className="bg-opacity-20 p-3 rounded-lg">
              <BarChart3 size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <TrendingUp size={16} />
            <span>{t("vehicles.operationalEfficiency")}</span>
          </div>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div
          className={`border-r-4 border-orange-500 bg-orange-50 p-5 rounded-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">{t("vehicles.problemsAndMaintenance")}</p>
              <p className="text-3xl font-bold text-orange-700">
                {stats.problemCount}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={36} />
          </div>
          <p className="text-xs text-orange-600 mt-2">{t("vehicles.needsRepair")}</p>
        </div>

        <div className={`border-r-4 border-red-500 bg-red-50 p-5 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t("vehicles.stolen")}</p>
              <p className="text-3xl font-bold text-red-700">
                {stats.stolenCount}
              </p>
            </div>
            <Shield className="text-red-500" size={36} />
          </div>
          <p className="text-xs text-red-600 mt-2">{t("vehicles.reported")}</p>
        </div>

        <div className={`border-r-4 border-gray-500 bg-gray-50 p-5 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("vehicles.outOfService")}</p>
              <p className="text-3xl font-bold text-gray-700">
                {stats.breakUpCount}
              </p>
            </div>
            <PackageX className="text-gray-500" size={36} />
          </div>
          <p className="text-xs text-gray-600 mt-2">{t("vehicles.unusable")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {/* 1. Search & Reports */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
            {t('employees.excelColumns.searchAndReports')}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <MiniStatRow
              icon={Users}
              title={t('vehicles.allVehicles')}
              description={t('vehicles.allVehiclesDesc')}
              onClick={() => router.push('/admin/vehicles/admin/with-riders')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={FileText}
              title={t('vehicles.vehicleHistory')}
              description={t('vehicles.vehicleRecords')}
              onClick={() => router.push('/admin/vehicles/admin/history')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
              className="!p-2"
            />
          </div>
        </div>

        {/* 2. Operations (Take/Return) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
            {t('employees.excelColumns.management')}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <MiniStatRow
              icon={Car}
              title={t('vehicles.takeVehicle')}
              description={t('vehicles.registerTakeVehicle')}
              onClick={() => router.push('/admin/vehicles/admin/take')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={RefreshCw}
              title={t('vehicles.returnVehicle')}
              description={t('vehicles.registerReturnVehicle')}
              onClick={() => router.push('/admin/vehicles/admin/return')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={RefreshCw}
              title={t('vehicles.switchVehicle') || 'تبديل مركبة'}
              description={t('vehicles.switchVehicleDesc') || 'تبديل مركبة لمندوب'}
              onClick={() => router.push('/admin/vehicles/admin/switch')}
              color="#9333ea" // purple-600
              bgClass="bg-purple-50"
              className="!p-2"
            />
          </div>
        </div>

        {/* 3. Management (Manage, Location, Requests) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
            {t('vehicles.manageVehicles')}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <MiniStatRow
              icon={Car}
              title={t('vehicles.manageVehicles')}
              description={t('vehicles.manageVehiclesDesc')}
              onClick={() => router.push('/admin/vehicles/admin/manage')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={MapPin}
              title={t('vehicles.changeLocation')}
              description={t('vehicles.updateLocations')}
              onClick={() => router.push('/admin/vehicles/admin/change-location')}
              color="#4b5563" // gray-600
              bgClass="bg-gray-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={Users}
              title={t('vehicles.supervisorRequests')}
              description={t('vehicles.supervisorRequestsDesc')}
              onClick={() => router.push('/admin/vehicles/admin/users-requests')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
              className="!p-2"
            />
          </div>
        </div>

        {/* 4. Problems */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
            {t('vehicles.problems')}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <MiniStatRow
              icon={AlertTriangle}
              title={t('vehicles.reportProblem')}
              description={t('vehicles.reportProblemDesc')}
              onClick={() => router.push('/admin/vehicles/admin/problems')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={Wrench}
              title={t('vehicles.fixProblems')}
              description={t('vehicles.solveProblems')}
              onClick={() => router.push('/admin/vehicles/admin/fix-problems')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
              className="!p-2"
            />
          </div>
        </div>

        {/* 5. Critical Status (Stolen, Breakup) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
            {t('common.others')}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <MiniStatRow
              icon={Shield}
              title={t('vehicles.stolenVehicles')}
              description={t('vehicles.reportedStolen')}
              onClick={() => router.push('/admin/vehicles/admin/stolen')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={RefreshCw}
              title={t('vehicles.recoverStolen')}
              description={t('vehicles.recoverStolenVehicles')}
              onClick={() => router.push('/admin/vehicles/admin/recover-stolen')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
              className="!p-2"
            />
            <MiniStatRow
              icon={PackageX}
              title={t('vehicles.outOfService')}
              description={t('vehicles.unusable')}
              onClick={() => router.push('/admin/vehicles/admin/breakup')}
              color="#4b5563" // gray-600
              bgClass="bg-gray-50"
              className="!p-2"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t("vehicles.loadingData")}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t("vehicles.statusSummary")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div>
              <h3 className="font-bold text-gray-700 mb-3">{t("vehicles.usageRates")}</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t("vehicles.available")}</span>
                    <span className="font-medium">
                      {((stats.availableCount / totalVehicles) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(stats.availableCount / totalVehicles) * 100
                          }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t("vehicles.used")}</span>
                    <span className="font-medium">
                      {((stats.takenCount / totalVehicles) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(stats.takenCount / totalVehicles) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t("vehicles.problems")}</span>
                    <span className="font-medium">
                      {((othervehicles / totalVehicles) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(othervehicles / totalVehicles) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10">
              <h3 className="font-bold text-gray-700 mb-3">{t("vehicles.quickStats")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t("vehicles.activeVehicles")}</span>
                  <span className="font-bold text-blue-600">
                    {activeVehicles}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t("vehicles.needsAttention")}</span>
                  <span className="font-bold text-orange-600">
                    {stats.problemCount + stats.stolenCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{t("vehicles.outOfService")}</span>
                  <span className="font-bold text-gray-600">
                    {stats.breakUpCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
