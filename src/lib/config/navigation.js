export const navigationConfig = {
  dashboard: {
    title: "navigation.dashboard",
    icon: "🏠",
    path: "/dashboard",
  },

  reports: {
    title: "navigation.reports",
    icon: "📊",
    routes: [
      { path: "/reports", label: "navigation.reportsCenter" },
      { path: "/reports/dashboard", label: "navigation.mainReport" },
    ],
  },

  vehicles: {
    title: "navigation.vehicles",
    icon: "🚗",
    routes: [
      { path: "vehicles/admin", label: "navigation.adminOperations" },
      { path: "vehicles/user", label: "navigation.supervisorOperations" },
    ],
  },

  riders: {
    title: "navigation.riders",
    icon: "👥",
    routes: [
      { path: "riders", label: "navigation.manageRiders" },
      { path: "riders/create", label: "navigation.createRider" },
      { path: "riders/search", label: "navigation.searchRiders" }
    ],
  },

  employees: {
    title: "navigation.employees",
    icon: "👔",
    routes: [
      { path: "employees/admin", label: "navigation.employeesAdmin" },
      { path: "employees/user", label: "navigation.employeesSupervisor" },
    ],
  },

  housing: {
    title: "navigation.housing",
    icon: "🏘️",
    routes: [
      { path: "housing", label: "navigation.allHousing" },
      { path: "housing/create", label: "navigation.createHousing" },
      { path: "housing/manage", label: "navigation.manageHousing" },
      { path: "housing/add-employee", label: "navigation.addEmployeeToHousing" },
      { path: "housing/move-employee", label: "navigation.moveEmployee" },
    ],
  },

  shifts: {
    title: "navigation.shifts",
    icon: "📅",
    routes: [
      { path: "shifts", label: "navigation.manageShifts" },
      { path: "shifts/comparisons", label: "navigation.comparisons" },
      { path: "shifts/date-range", label: "navigation.shiftsInPeriod" },
      { path: "shifts/hunger-disabilities", label: "navigation.hungerDeficit" },

    ],

  },

  substitution: {
    title: "navigation.substitution",
    icon: "🔄",
    routes: [
      { path: "substitution", label: "navigation.allSubstitutes" },
      { path: "substitution/new", label: "navigation.addSubstitution" },
      { path: "substitution/history", label: "navigation.substituteHistory" },
    ],
  },

  company: {
    title: "navigation.companies",
    icon: "🏢",
    routes: [
      { path: "companies", label: "navigation.allCompanies" },
      { path: "companies/create", label: "navigation.createCompany" },
    ],
  },

  admin: {
    title: "navigation.admin",
    icon: "👨‍✈️",
    routes: [
      { path: "register", label: "navigation.addNewSupervisor" },
      { path: "register/admin", label: "navigation.addNewAdmin" },
      { path: "register/master", label: "navigation.addNewManager" },
      { path: "admin/users", label: "navigation.userManagement" },
      { path: "admin/system-health", label: "navigation.systemHealth" },
    ],
  },

  account: {
    title: "navigation.account",
    icon: "👤",
    routes: [
      { path: "profile", label: "navigation.profile" },
      { path: "profile/change-password", label: "navigation.changePassword" },
    ],

  },

  sittings: {
    title: "navigation.settings",
    icon: "⚙️",
    routes: [
      { path: "/language", label: "navigation.languages" },
    ],
  }
};
