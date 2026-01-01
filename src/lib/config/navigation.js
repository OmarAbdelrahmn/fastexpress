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
  requests: {
    title: "الطلبات",
    icon: "📝",
    routes: [
      { path: "/member/requests/employee-status", label: "طلبات تغيير حالة الموظفين" },
      { path: "/member/requests/vehicles", label: "طلبات عمليات المركبات" },
    ],
  },
  disabilities: {
    title: "navigation.disabilities",
    icon: "⚠️",
    path: "/member/disabilities",
  },
  reports: {
    title: "navigation.reports",
    icon: "📊",
    routes: [
      {
        path: "/member/reports",
        label: "navigation.reportsCenter",
      },
      // {
      //   path: `/member/reports/monthly?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`,
      //   label: "navigation.monthlyReports",
      // },
      {
        path: "/member/reports/daily",
        label: "التقرير اليومي",
      },
      {
        path: "/member/reports/compare-periods",
        label: "مقارنة الفترات",
      },
      {
        path: "/member/reports/rejection",
        label: "تقرير الطلبات المرفوضة",
      },
      {
        path: "/member/reports/riders-summary",
        label: "ملخص المناديب",
      },
      {
        path: "/member/reports/rider-daily",
        label: "تفاصيل المندوب اليومية",
      },
      {
        path: "/member/reports/rider-history",
        label: "سجل المندوب",
      }
    ],
  },
  actions: {
    title: "common.others",
    icon: "⚡",
    routes: [
      { path: "/member/actions/employee-status-change", label: "طلب تغيير حالة موظف" },
      { path: "/member/actions/vehicle-take", label: "طلب استلام مركبة" },
      { path: "/member/actions/vehicle-return", label: "طلب ايقاف مركبة" },
      { path: "/member/actions/vehicle-report-problem", label: "الإبلاغ عن مشكلة مركبة" },
      { path: "/member/actions/vehicle-fix-problem", label: "إصلاح مشكلة مركبة" },
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
    path: "/admin",
  },

  reports: {
    title: "navigation.reports",
    icon: "📊",
    routes: [
      { path: "/admin/reports", label: "navigation.reportsCenter" },
      { path: "/admin/reports/dashboard", label: "navigation.mainReport" },
      { path: "/admin/reports/dailyreports", label: "navigation.dailyReports" },
    ],
  },

  vehicles: {
    title: "navigation.vehicles",
    icon: "🚗",
    path: "/admin/vehicles",
  },

  riders: {
    title: "navigation.riders",
    icon: "👥",
    routes: [
      { path: "/admin/riders", label: "navigation.manageRiders" },
      { path: "/admin/riders/create", label: "navigation.createRider" },
      { path: "/admin/riders/search", label: "navigation.searchRiders" }
    ],
  },

  employees: {
    title: "navigation.employees",
    icon: "👔",
    path: "/admin/employees",
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
    ],
  },

  shifts: {
    title: "navigation.shifts",
    icon: "📅",
    routes: [
      { path: "/admin/shifts", label: "navigation.manageShifts" },
      { path: "/admin/shifts/comparisons", label: "navigation.comparisons" },
      { path: "/admin/shifts/date-range", label: "navigation.shiftsInPeriod" },
      { path: "/admin/shifts/hunger-disabilities", label: "navigation.hungerDeficit" },

    ],

  },

  substitution: {
    title: "navigation.substitution",
    icon: "🔄",
    routes: [
      { path: "/admin/substitution", label: "navigation.allSubstitutes" },
      { path: "/admin/substitution/new", label: "navigation.addSubstitution" },
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
      { path: "/language", label: "navigation.languages" },
    ],
  }
};
