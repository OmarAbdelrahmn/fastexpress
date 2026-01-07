// File: src/components/Ui/Breadcrumb.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

const pathTranslationKeys = {
  dashboard: "navigation.dashboard",
  reports: "navigation.reports",
  "admin/reports/monthly": "navigation.monthlyReports",
  "admin/reports/yearly": "navigation.yearlyReports",
  "admin/reports/company-performance": "navigation.companyPerformance",
  "admin/reports/compare-company": "navigation.compareCompany",
  "admin/reports/riders": "navigation.ridersReports",
  "admin/reports/housing": "navigation.housingReports",
  "admin/reports/top-riders": "navigation.topRiders",
  "admin/reports/problems": "navigation.problemsReports",
  // New Reports Pages
  "admin/reports/dailyreports": "navigation.dailyReports",
  "admin/reports/custom-range": "reports.customReports",
  "admin/reports/dashboard": "reports.dashboard",
  "admin/reports/housing-compare": "reports.housingCompare",
  "admin/reports/housing-rider-compare": "reports.housingRiderCompare",
  "admin/reports/rider-performance": "reports.riderPerformance",
  "admin/reports/stacked": "reports.stackedDeliveries",
  "admin/reports/top-riders-company": "reports.topRidersByCompany",
  "admin/reports/top-riders-monthly": "reports.topRidersMonthly",
  "admin/reports/top-riders-yearly": "reports.topRidersYearly.pageTitle",
  "admin/reports/rejection": "reports.comparison.rejectionMetrics",
  "admin/reports/history": "reports.riderReports",
  "admin/reports": "reports.title",
  vehicles: "navigation.vehicles",
  "admin/vehicles/available": "navigation.vehiclesAvailable",
  "admin/vehicles/taken": "navigation.vehiclesTaken",
  "admin/vehicles/create": "navigation.vehiclesCreate",
  "admin/vehicles/maintenance": "navigation.vehiclesMaintenance",
  "admin/vehicles/history": "navigation.vehiclesHistory",
  riders: "navigation.riders",
  "admin/riders/create": "navigation.createRider",
  "admin/riders/search": "navigation.searchRiders",
  "admin/riders/performance": "navigation.ridersPerformance",
  employees: "employees.title",
  "admin/employees": "employees.title",
  "admin/employees/admin": "employees.adminDashboard",
  "admin/employees/admin/create": "employees.addNewEmployee",
  "admin/employees/admin/search": "employees.smartSearch",
  "admin/employees/admin/filter": "employees.advancedSearch",
  "admin/employees/admin/date-range": "employees.byDate",
  "admin/employees/admin/statistics": "employees.statistics",
  "admin/employees/admin/deleted": "employees.deletedEmployees",
  "admin/employees/admin/status-requests": "employees.statusRequests",
  "admin/employees/admin/import-excel": "employees.importExcel",
  "admin/employees/admin/temp-imports": "employees.tempData",
  "admin/employees/user": "employees.userDashboard",
  housing: "navigation.housing",
  "admin/housing": "employees.housing",
  "admin/housing/create": "navigation.createHousing",
  "admin/housing/manage": "navigation.manageHousing",
  "admin/housing/add-employee": "navigation.addEmployeeToHousing",
  "admin/housing/move-employee": "navigation.moveEmployee",
  shifts: "navigation.shifts",
  "admin/shifts/comparisons": "navigation.comparisons",
  "admin/shifts/date-range": "navigation.shiftsByPeriod",
  "admin/shifts/hunger-disabilities": "navigation.hungerDeficit",
  "admin/shifts/hunger-disabilities/import": "navigation.importShifts",
  "admin/shifts/hunger-disabilities/date-range": "navigation.shiftsByPeriod",
  "admin/shifts/hunger-disabilities/summary": "employees.summary",
  "admin/shifts": "shifts.title",
  "admin/substitution": "navigation.substitution",
  "admin/substitution/new": "navigation.addSubstitution",
  "admin/substitution/history": "navigation.substituteHistory",
  companies: "navigation.companies",
  "admin/companies/create": "navigation.createCompany",
  "admin/companies/manage": "navigation.manageCompanies",
  admin: "navigation.admin",
  "admin/users": "navigation.userManagement",
  "admin/roles": "navigation.roles",
  "admin/settings": "navigation.settings",
  "admin/logs": "navigation.activityLog",
  "admin/system-health": "navigation.systemHealth",
  register: "navigation.addNewSupervisor",
  "admin/register/admin": "navigation.addNewAdmin",
  "admin/register/master": "navigation.addNewManager",
  account: "navigation.account",
  "admin/account/profile": "navigation.profile",
  "admin/account/change-password": "navigation.changePassword",
  // Vehicle Admin Routes
  "admin/vehicles": "vehicles.title",
  "admin/vehicles/admin": "vehicles.dashboard",
  "admin/vehicles/admin/with-riders": "vehicles.vehiclesWithRidersTitle",
  "admin/vehicles/admin/history": "navigation.vehiclesHistory",
  "admin/vehicles/admin/take": "vehicles.takeVehicle",
  "admin/vehicles/admin/return": "vehicles.returnVehicle",
  "admin/vehicles/admin/manage": "navigation.manageVehicles",
  "admin/vehicles/admin/change-location": "vehicles.changeLocation",
  "admin/vehicles/admin/users-requests": "vehicles.supervisorRequests",
  "admin/vehicles/admin/problems": "vehicles.reportProblem",
  "admin/vehicles/admin/fix-problems": "vehicles.fixProblems",
  "admin/vehicles/admin/stolen": "vehicles.stolenVehicles",
  "admin/vehicles/admin/recover-stolen": "vehicles.recoverStolen",
  "admin/vehicles/admin/breakup": "vehicles.breakUpVehiclesTitle",
  "admin/riders": "riders.manageEmployees",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove leading slash and split path
    const paths = pathname.replace(/^\//, "").split("/").filter(Boolean);

    const breadcrumbs = [{ label: t("navigation.home"), path: "/admin/dashboard", icon: Home }];

    let currentPath = "";
    paths.forEach((segment, index) => {
      currentPath += (index === 0 ? "" : "/") + segment;
      const translationKey = pathTranslationKeys[currentPath];
      const label = translationKey ? t(translationKey) : segment;
      breadcrumbs.push({
        label,
        path: `/${currentPath}`,
        icon: null,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav
      className="flex items-center gap-2 text-sm flex-row-reverse"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <div
            key={crumb.path}
            className="flex items-center gap-2 flex-row-reverse"
          >
            {index > 0 && <ChevronLeft size={16} className="text-white/70" />}

            {isLast ? (
              <span className="flex items-center gap-1.5 text-white font-semibold flex-row-reverse">
                {Icon && <Icon size={16} />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors flex-row-reverse"
              >
                {Icon && <Icon size={16} />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

