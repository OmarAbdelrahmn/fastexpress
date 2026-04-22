// File: src/components/Ui/Breadcrumb.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

const pathTranslationKeys = {
  dashboard: "navigation.dashboard",
  reports: "navigation.reports",

  // ─── Admin Reports ─────────────────────────────────────────────────────────
  "admin/reports": "reports.title",
  "admin/reports/monthly": "navigation.monthlyReports",
  "admin/reports/yearly": "navigation.yearlyReports",
  "admin/reports/company-performance": "navigation.companyPerformance",
  "admin/reports/compare-company": "navigation.compareCompany",
  "admin/reports/riders": "navigation.ridersReports",
  "admin/reports/housing": "navigation.housingReports",
  "admin/reports/top-riders": "navigation.topRiders",
  "admin/reports/problems": "navigation.problemsReports",
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
  "admin/reports/all-riders-history": "سجل كل المناديب",
  "admin/reports/compare-riders": "navigation.compareRiders",
  "admin/reports/other": "reports.otherReports",
  "admin/reports/performance": "reports.performance",
  "admin/reports/keta-validation": "keta.validationReport",
  "admin/reports/company-daily-trend": "companyDailyTrend.title",

  // Keta Reports
  "admin/reports/keta": "keta.reportsTitle",
  "admin/reports/keta/validation": "keta.validationReport",
  "admin/reports/keta/yearly-validation": "keta.yearlyValidation",
  "admin/reports/keta/daily-summary": "keta.dailySummary",
  "admin/reports/keta/daily-rider-details": "keta.riderDetails",
  "admin/reports/keta/cumulative-stats": "keta.cumulativeStats",
  "admin/reports/keta/rejection": "keta.rejectionReport",
  "admin/reports/keta/declined": "keta.declinedOrdersReport",

  // Hunger Reports
  "admin/reports/hunger": "hunger.reportsTitle",
  "admin/reports/hunger/summary": "hunger.summaryReport",
  "admin/reports/hunger/detailed-daily-performance": "reports.detailedDailyPerformance",
  "admin/reports/hunger/history": "reports.history",
  "admin/reports/hunger/monthly-validation": "hunger.monthlyValidation",
  "admin/reports/hunger/rejection": "hunger.rejectionReport",

  // ─── Vehicles ──────────────────────────────────────────────────────────────
  vehicles: "navigation.vehicles",
  "admin/vehicles": "vehicles.title",
  "admin/vehicles/available": "navigation.vehiclesAvailable",
  "admin/vehicles/taken": "navigation.vehiclesTaken",
  "admin/vehicles/create": "navigation.vehiclesCreate",
  "admin/vehicles/maintenance": "navigation.vehiclesMaintenance",
  "admin/vehicles/history": "navigation.vehiclesHistory",
  "admin/vehicles/admin": "vehicles.dashboard",
  "admin/vehicles/admin/available": "navigation.vehiclesAvailable",
  "admin/vehicles/admin/taken": "navigation.vehiclesTaken",
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
  "admin/vehicles/admin/out-of-service": "vehicles.outOfService",
  "admin/vehicles/admin/switch": "vehicles.switchVehicle",
  "admin/vehicles/admin/details": "navigation.vehicleDetails",

  // ─── Riders ────────────────────────────────────────────────────────────────
  riders: "navigation.riders",
  "admin/riders": "riders.manageEmployees",
  "admin/riders/create": "navigation.createRider",
  "admin/riders/search": "navigation.searchRiders",
  "admin/riders/performance": "navigation.ridersPerformance",
  "admin/riders/add-to-employee": "riders.addToEmployee",
  "admin/riders/change-role": "riders.changeRole",
  "admin/riders/change-working-id": "riders.changeWorkingId",
  "admin/riders/escaped": "riders.escaped",
  "admin/riders/filter": "riders.filter",
  "admin/riders/images": "riders.images",
  "admin/riders/iqama-expiry-report": "riders.iqamaExpiryReport",
  "admin/riders/working-id-history": "riders.workingIdHistory",
  "admin/riders/manage": "riders.manage",
  "admin/riders/manage/date-range": "riders.dateRange",
  "admin/riders/manage/deleted": "riders.deleted",
  "admin/riders/manage/history": "riders.history",
  "admin/riders/manage/import-excel": "riders.importExcel",
  "admin/riders/manage/statistics": "riders.statistics",
  "admin/riders/manage/status-changes": "riders.statusChanges",
  "admin/riders/manage/status-requests": "riders.statusRequests",
  "admin/riders/manage/temp-imports": "riders.tempImports",

  // ─── Employees ─────────────────────────────────────────────────────────────
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
  "admin/employees/admin/history": "employees.history",
  "admin/employees/user": "employees.userDashboard",

  // ─── Housing ───────────────────────────────────────────────────────────────
  housing: "navigation.housing",
  "admin/housing": "employees.housing",
  "admin/housing/create": "navigation.createHousing",
  "admin/housing/manage": "navigation.manageHousing",
  "admin/housing/add-employee": "navigation.addEmployeeToHousing",
  "admin/housing/move-employee": "navigation.moveEmployee",
  "admin/housing/remove-employee": "navigation.removeEmployeeFromHousing",

  // ─── Shifts ────────────────────────────────────────────────────────────────
  shifts: "navigation.shifts",
  "admin/shifts": "shifts.title",
  "admin/shifts/manage": "navigation.manageShifts",
  "admin/shifts/create": "navigation.createShift",
  "admin/shifts/import": "navigation.importShifts",
  "admin/shifts/comparisons": "navigation.comparisons",
  "admin/shifts/date-range": "navigation.shiftsByPeriod",
  "admin/shifts/update": "navigation.updateShifts",
  "admin/shifts/hunger-disabilities": "navigation.hungerDeficit",
  "admin/shifts/hunger-disabilities/import": "navigation.importShifts",
  "admin/shifts/hunger-disabilities/date-range": "navigation.shiftsByPeriod",
  "admin/shifts/hunger-disabilities/summary": "employees.summary",
  "admin/shifts/hunger-disabilities/month": "navigation.month",
  "admin/shifts/hunger-disabilities/rider": "navigation.rider",
  "admin/shifts/hunger-disabilities/year": "navigation.year",
  "admin/shifts/keta-freelancer": "navigation.ketaFreelancer",
  "admin/shifts/keta-freelancer/import": "navigation.importShifts",

  // ─── Substitution ──────────────────────────────────────────────────────────
  "admin/substitution": "navigation.substitution",
  "admin/substitution/new": "navigation.addSubstitution",
  "admin/substitution/history": "navigation.substituteHistory",
  "admin/substitution/import": "navigation.importSubstitution",

  // ─── Companies ─────────────────────────────────────────────────────────────
  companies: "navigation.companies",
  "admin/companies": "navigation.companies",
  "admin/companies/create": "navigation.createCompany",
  "admin/companies/manage": "navigation.manageCompanies",

  // ─── Maintenance ───────────────────────────────────────────────────────────
  maintenance: "navigation.maintenance",
  "admin/maintenance": "navigation.maintenance",
  "admin/maintenance/suppliers": "navigation.suppliers",
  "admin/maintenance/suppliers/create": "navigation.createSupplier",
  "admin/maintenance/spare-parts": "navigation.spareParts",
  "admin/maintenance/transfers": "navigation.maintenanceTransfers",
  "admin/maintenance/transfers/housing": "navigation.transfersToHousing",
  "admin/maintenance/all-housings-details": "navigation.allHousingsDetails",
  "admin/maintenance/rider-accessories": "navigation.riderAccessories",
  "admin/maintenance/bills": "navigation.maintenanceBills",
  "admin/maintenance/usage": "navigation.maintenanceUsage",
  "admin/maintenance/usage/rider-accessories": "navigation.riderAccessories",
  "admin/maintenance/usage/rider-accessories/history": "navigation.history",
  "admin/maintenance/usage/spare-parts": "navigation.spareParts",
  "admin/maintenance/usage/spare-parts/history": "navigation.history",
  "admin/maintenance/housing-costs": "navigation.maintenanceHousingCosts",
  "admin/maintenance/returns": "navigation.returnsManagement",

  // ─── Hunger ────────────────────────────────────────────────────────────────
  "admin/hunger": "hunger.title",
  "admin/hunger/wallet": "hunger.wallet",

  // ─── AI ────────────────────────────────────────────────────────────────────
  "admin/ai": "navigation.ai",

  // ─── Admin & Settings ──────────────────────────────────────────────────────
  admin: "navigation.admin",
  "admin/dashboard": "navigation.dashboard",
  "admin/users": "navigation.userManagement",
  "admin/users-management": "navigation.userManagement",
  "admin/roles": "navigation.roles",
  "admin/settings": "navigation.settings",

  "admin/logs": "navigation.activityLog",
  "admin/system-health": "navigation.systemHealth",

  // ─── Registration ──────────────────────────────────────────────────────────
  register: "navigation.addNewSupervisor",
  "admin/register": "navigation.addNewSupervisor",
  "admin/register/admin": "navigation.addNewAdmin",
  "admin/register/master": "navigation.addNewManager",

  // ─── Profile & Account ─────────────────────────────────────────────────────
  account: "navigation.account",
  profile: "navigation.profile",
  "admin/profile": "navigation.profile",
  "admin/profile/change-password": "navigation.changePassword",
  "admin/account/profile": "navigation.profile",
  "admin/account/change-password": "navigation.changePassword",

  // ─── Petrol ────────────────────────────────────────────────────────────────
  "admin/petrol": "navigation.petrol",
  "admin/petrol/upload": "navigation.petrolUpload",
  "admin/petrol/daily": "navigation.petrolDaily",
  "admin/petrol/riders": "navigation.petrolRiders",
  "admin/petrol/vehicles": "navigation.petrolVehicles",
  "admin/petrol/unattributed": "navigation.petrolUnattributed",

  // ─── Member Section ────────────────────────────────────────────────────────
  member: "navigation.member",
  "member/dashboard": "navigation.dashboard",
  "member/profile": "navigation.profile",
  "member/employees": "employees.title",
  "member/riders": "riders.manageEmployees",
  "member/disabilities": "navigation.disabilities",
  "member/substitutions": "navigation.substitution",

  // Member Account
  "member/account": "navigation.account",
  "member/account/change-password": "navigation.changePassword",
  "member/account/info": "navigation.accountInfo",

  // Member Actions
  "member/actions": "navigation.actions",
  "member/actions/employee-status-change": "employees.statusChange",
  "member/actions/switch-vehicle": "vehicles.switchVehicle",
  "member/actions/vehicle-fix-problem": "vehicles.fixProblems",
  "member/actions/vehicle-report-problem": "vehicles.reportProblem",
  "member/actions/vehicle-return": "vehicles.returnVehicle",
  "member/actions/vehicle-take": "vehicles.takeVehicle",

  // Member Maintenance
  "member/maintenance": "navigation.maintenance",
  "member/maintenance/cost-summary": "navigation.costSummary",
  "member/maintenance/rider-accessories": "navigation.riderAccessories",
  "member/maintenance/rider-accessories/history": "navigation.history",
  "member/maintenance/rider-accessories/stock": "navigation.stock",
  "member/maintenance/spare-parts": "navigation.spareParts",
  "member/maintenance/spare-parts/history": "navigation.history",
  "member/maintenance/spare-parts/stock": "navigation.stock",
  "member/maintenance/transfers": "navigation.maintenanceTransfers",

  // Member Reports
  "member/reports": "reports.title",
  "member/reports/compare-periods": "reports.comparePeriods",
  "member/reports/daily": "navigation.dailyReports",
  "member/reports/daily-detailed": "reports.dailyDetailed",
  "member/reports/daily-summary": "reports.dailySummary",
  "member/reports/monthly": "navigation.monthlyReports",
  "member/reports/rejection": "reports.comparison.rejectionMetrics",
  "member/reports/rider-daily": "reports.riderDaily",
  "member/reports/rider-history": "reports.riderReports",
  "member/reports/riders-summary": "reports.ridersSummary",

  // Member Requests
  "member/requests": "navigation.requests",
  "member/requests/employee-status": "employees.statusRequests",
  "member/requests/vehicles": "navigation.vehicleRequests",

  // Member Shifts
  "member/shifts": "shifts.title",
  "member/shifts/summary": "employees.summary",

  // Member Vehicles
  "member/vehicles": "vehicles.title",
  "member/vehicles/history": "navigation.vehiclesHistory",
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
  const visibleBreadcrumbs = breadcrumbs.length > 4 ? breadcrumbs.slice(0, 4) : breadcrumbs;

  return (
    <nav
      className="flex items-center gap-2 text-sm flex-row-reverse"
      aria-label="Breadcrumb"
    >
      {visibleBreadcrumbs.map((crumb, index) => {
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
