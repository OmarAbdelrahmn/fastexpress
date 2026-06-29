// User Navigation Configuration (formerly Member)
export const userNavigationConfig = {
  dashboard: {
    title: "navigation.dashboard",
    icon: "🏠",
    path: "/member/dashboard",
  },
  riders: {
    title: "navigation.riders",
    icon: "🏍️",
    path: "/member/riders",
  },
  shifts: {
    title: "navigation.shifts",
    icon: "📅",
    path: "/member/shifts",
  },
  vehicles: {
    title: "navigation.vehicles",
    icon: "🚗",
    path: "/member/vehicles",
  },
  maintenance: {
    title: "navigation.maintenance",
    icon: "🔧",
    routes: [
      { path: "/member/maintenance/spare-parts", label: "navigation.spareParts" },
      { path: "/member/maintenance/rider-accessories", label: "navigation.riderAccessories" },
      { path: "/member/maintenance/cost-summary", label: "navigation.costSummary" },
      { path: "/member/maintenance/transfers", label: "navigation.maintenanceTransfers" },
      { path: "/member/maintenance/reminders", label: "navigation.reminders" },
    ],
  },
  requests: {
    title: "navigation.requests",
    icon: "📝",
    routes: [
      { path: "/member/requests/employee-status", label: "navigation.employeeStatusRequests" },
      { path: "/member/requests/vehicles", label: "navigation.vehicleRequests" },
    ],
  },
  reports: {
    title: "navigation.reports",
    icon: "📊",
    routes: [
      {
        path: "/member/reports",
        label: "navigation.reportsCenter",
      },
      {
        path: "/member/reports/daily",
        label: "navigation.dailyReports",
      },
      {
        path: "/member/reports/compare-periods",
        label: "navigation.comparePeriods",
      },
      {
        path: "/member/reports/rejection",
        label: "navigation.rejectedOrdersReport",
      },
      {
        path: "/member/reports/riders-summary",
        label: "navigation.ridersSummaryReport",
      },
      {
        path: "/member/reports/rider-daily",
        label: "navigation.riderDailyReport",
      },
      {
        path: "/member/reports/rider-history",
        label: "navigation.riderYearlyPerformanceReport",
      }
    ],
  },
  actions: {
    title: "common.others",
    icon: "⚡",
    routes: [
      { path: "/member/actions/employee-status-change", label: "navigation.requestEmployeeStatusChange" },
      { path: "/member/actions/vehicle-take", label: "navigation.requestVehicleTake" },
      { path: "/member/actions/vehicle-return", label: "navigation.requestVehicleReturn" },
      { path: "/member/actions/vehicle-report-problem", label: "navigation.requestVehicleDisable" },
      { path: "/member/actions/vehicle-fix-problem", label: "navigation.requestVehicleEnable" },
      { path: "/member/actions/switch-vehicle", label: "navigation.requestVehicleSwitch" },
    ],
  },
  account: {
    title: "navigation.account",
    icon: "👤",
    routes: [
      { path: "/member/profile", label: "navigation.myDetails" },
      { path: "/member/account/info", label: "navigation.personalInfo" },
      { path: "/member/account/change-password", label: "navigation.changePassword" },
    ],
  },
};

// Admin Navigation Configuration
export const adminNavigationConfig = {
  dashboard: {
    title: "navigation.dashboard",
    icon: "🏠",
    path: "/admin/live-stats",
  },

  reports: {
    title: "navigation.reports",
    icon: "📊",
    routes: [
      { path: "/admin/reports", label: "navigation.reportsCenter" },
      { path: "/admin/reports/dashboard", label: "navigation.mainReport" },
    ],
  },

  vehicles: {
    title: "navigation.vehicles",
    icon: "🚗",
    routes: [
      { path: "/admin/vehicles/with-riders", label: "navigation.vehiclesWithRiders" },
      { path: "/admin/vehicles", label: "navigation.manageVehicles" },
      { path: "/admin/vehicles/take", label: "navigation.takeVehicle" },
    ],
  },

  riders: {
    title: "navigation.employees",
    icon: "👥",
    routes: [
      { path: "/admin/riders", label: "employees.manageEmployees" },
      { path: "/admin/riders/search", label: "employees.searchEmployee" },
      { path: "/admin/riders/manage", label: "employees.manageEmployees" },
      { path: "/admin/riders/escaped", label: "navigation.escaped" },
    ],
  },

  housing: {
    title: "navigation.housing",
    icon: "🏘️",
    routes: [
      { path: "/admin/housing", label: "navigation.allHousing" },
      { path: "/admin/housing/create", label: "navigation.createHousing" },
      { path: "/admin/housing/manage", label: "navigation.manageHousing" },
      { path: "/admin/housing/add-employee", label: "navigation.addEmployeeToHousing" },
      { path: "/admin/housing/move-employee", label: "navigation.moveEmployee" },
      { path: "/admin/housing/remove-employee", label: "navigation.removeEmployeeFromHousing" },
    ],
  },

  shifts: {
    title: "navigation.shifts",
    icon: "📅",
    routes: [
      { path: "/admin/shifts", label: "navigation.manageShifts" },
      { path: "/admin/shifts/comparisons", label: "navigation.comparisons" },
      { path: "/admin/shifts/date-range", label: "navigation.shiftsInPeriod" },
      { path: "/admin/shifts/update", label: "navigation.updateShifts" },
      { path: "/admin/hunger", label: "navigation.hunger" },
      { path: "/admin/keeta", label: "navigation.keeta" },
    ],
  },

  substitution: {
    title: "navigation.substitution",
    icon: "🔄",
    routes: [
      { path: "/admin/substitution", label: "navigation.allSubstitutes" },
      { path: "/admin/substitution/new", label: "navigation.addSubstitution" },
      { path: "/admin/substitution/import", label: "navigation.importSubstitution" },
      { path: "/admin/substitution/history", label: "navigation.substituteHistory" },
    ],
  },

  company: {
    title: "navigation.companies",
    icon: "🏢",
    routes: [
      { path: "/admin/companies", label: "navigation.allCompanies" },
      { path: "/admin/companies/create", label: "navigation.createCompany" },
    ],
  },

  maintenance: {
    title: "navigation.maintenance",
    icon: "🔧",
    routes: [
      { path: "/admin/maintenance/suppliers", label: "navigation.suppliers" },
      { path: "/admin/maintenance/money-spending", label: "navigation.maintenanceMoneySpending" },
      { path: "/admin/maintenance/bills", label: "navigation.maintenanceBills" },
      { path: "/admin/maintenance/spare-parts", label: "navigation.spareParts" },
      { path: "/admin/maintenance/rider-accessories", label: "navigation.riderAccessories" },
      { path: "/admin/maintenance/transfers", label: "navigation.maintenanceTransfers" },
      { path: "/admin/maintenance/returns", label: "navigation.returnsManagement" },
    ],
  },

  petrol: {
    title: "navigation.petrol",
    icon: "⛽",
    routes: [
      { path: "/admin/petrol/upload", label: "navigation.petrolUpload" },
      { path: "/admin/petrol/riders", label: "navigation.petrolRiders" },
      { path: "/admin/petrol/vehicles", label: "navigation.petrolVehicles" },
      { path: "/admin/petrol/unattributed", label: "navigation.petrolUnattributed" },
    ],
  },

  admin: {
    title: "navigation.admin",
    icon: "👨‍✈️",
    routes: [
      { path: "/admin/register", label: "navigation.addNewSupervisor" },
      { path: "/admin/register/admin", label: "navigation.addNewAdmin" },
      { path: "/admin/register/master", label: "navigation.addNewManager" },
      { path: "/admin/users-management", label: "navigation.userManagement" },
      { path: "/admin/system-health", label: "navigation.systemHealth" },
    ],
  },

  account: {
    title: "navigation.account",
    icon: "👤",
    routes: [
      { path: "/admin/profile", label: "navigation.profile" },
      { path: "/admin/profile/change-password", label: "navigation.changePassword" },
    ],
  },

  sittings: {
    title: "navigation.settings",
    icon: "⚙️",
    routes: [
      { path: "/admin/settings", label: "navigation.generalSettings" },
      { path: "/language", label: "navigation.languages" },
    ],
  }
};

// Accountant Navigation Configuration
export const accountantNavigationConfig = {
  dashboard: {
    title: "navigation.dashboard",
    icon: "🏠",
    path: "/accountant/dashboard",
  },

  companyBills: {
    title: "navigation.accountingCompanyBills",
    icon: "🧾",
    path: "/accountant/company-bills",
  },

  companyFinance: {
    title: "navigation.accountingCompanyFinance",
    icon: "💰",
    path: "/accountant/company-finance",
  },

  salaries: {
    title: "navigation.accountingSalaries",
    icon: "💳",
    path: "/accountant/salaries",
  },

  payments: {
    title: "navigation.accountingPayments",
    icon: "🏦",
    path: "/accountant/payments",
  },

  financialItems: {
    title: "navigation.accountingFinancialItems",
    icon: "📌",
    path: "/accountant/financial-items",
  },

  loans: {
    title: "navigation.accountingLoans",
    icon: "💵",
    path: "/accountant/loans",
  },

  riderProfile: {
    title: "navigation.accountingRiderProfile",
    icon: "👤",
    path: "/accountant/rider-profile",
  },

  accountingReports: {
    title: "navigation.accountingReports",
    icon: "📊",
    path: "/accountant/reports",
  },

  sittings: {
    title: "navigation.settings",
    icon: "⚙️",
    routes: [
      { path: "/language", label: "navigation.languages" },
    ],
  },
};
