// File: src/components/Ui/Breadcrumb.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

// Map of paths to translation keys
const pathTranslationKeys = {
  dashboard: "navigation.dashboard",
  reports: "navigation.reports",
  "reports/monthly": "navigation.monthlyReports",
  "reports/yearly": "navigation.yearlyReports",
  "reports/company-performance": "navigation.companyPerformance",
  "reports/compare-company": "navigation.compareCompany",
  "reports/riders": "navigation.ridersReports",
  "reports/compare-riders": "navigation.compareRiders",
  "reports/housing": "navigation.housingReports",
  "reports/top-riders": "navigation.topRiders",
  "reports/problems": "navigation.problemsReports",
  vehicles: "navigation.vehicles",
  "vehicles/available": "navigation.vehiclesAvailable",
  "vehicles/taken": "navigation.vehiclesTaken",
  "vehicles/create": "navigation.vehiclesCreate",
  "vehicles/maintenance": "navigation.vehiclesMaintenance",
  "vehicles/history": "navigation.vehiclesHistory",
  riders: "navigation.riders",
  "riders/create": "navigation.createRider",
  "riders/search": "navigation.searchRiders",
  "riders/performance": "navigation.ridersPerformance",
  employees: "navigation.employees",
  "employees/create": "navigation.createEmployee",
  "employees/search": "navigation.searchEmployee",
  housing: "navigation.housing",
  "housing/create": "navigation.createHousing",
  "housing/manage": "navigation.manageHousing",
  "housing/add-employee": "navigation.addEmployeeToHousing",
  "housing/move-employee": "navigation.moveEmployee",
  shifts: "navigation.shifts",
  "shifts/create": "navigation.createShift",
  "shifts/import": "navigation.importShifts",
  "shifts/comparisons": "navigation.comparisons",
  "shifts/date-range": "navigation.shiftsByPeriod",
  substitution: "navigation.substitution",
  "substitution/new": "navigation.addSubstitution",
  "substitution/active": "navigation.activeSubstitutes",
  "substitution/inactive": "navigation.inactiveSubstitutes",
  "substitution/history": "navigation.substituteHistory",
  companies: "navigation.companies",
  "companies/create": "navigation.createCompany",
  "companies/manage": "navigation.manageCompanies",
  admin: "navigation.admin",
  "admin/users": "navigation.userManagement",
  "admin/roles": "navigation.roles",
  "admin/settings": "navigation.settings",
  "admin/logs": "navigation.activityLog",
  "admin/system-health": "navigation.systemHealth",
  register: "navigation.addNewSupervisor",
  "register/admin": "navigation.addNewAdmin",
  "register/master": "navigation.addNewManager",
  account: "navigation.account",
  "account/profile": "navigation.profile",
  "account/change-password": "navigation.changePassword",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove leading slash and split path
    const paths = pathname.replace(/^\//, "").split("/").filter(Boolean);

    const breadcrumbs = [{ label: t("navigation.home"), path: "/dashboard", icon: Home }];

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

