export const navigationConfig = {
  dashboard: {
    title: "لوحة التحكم",
    icon: "🏠",
    path: "/dashboard",
  },

  reports: {
    title: "التقارير",
    icon: "📊",
    routes: [
      { path: "/reports", label: "جميع التقارير" },
      { path: "/reports/monthly", label: "تقارير شهرية" },
      { path: "/reports/yearly", label: "تقارير سنوية" },
      { path: "/reports/company-performance", label: "أداء الشركة" },
      { path: "/reports/compare-company", label: "مقارنة الشركات" },
      { path: "/reports/riders", label: "تقارير السائقين" },
      { path: "/reports/compare-riders", label: "مقارنة السائقين" },
      { path: "/reports/housing", label: "تقارير السكن" },
      { path: "/reports/top-riders", label: "أفضل السائقين" },
      { path: "/reports/problems", label: "تقارير المشاكل" },
    ],
  },

  vehicles: {
    title: "المركبات",
    icon: "🚗",
    routes: [
      { path: "vehicles/", label: "جميع المركبات" },
      { path: "vehicles/available", label: "المركبات المتاحة" },
      { path: "vehicles/taken", label: "المركبات المستخدمة" },
      { path: "vehicles/create", label: "إضافة مركبة" },
      { path: "vehicles/maintenance", label: "الصيانة والمشاكل" },
      { path: "vehicles/history", label: "سجل المركبات" },
    ],
  },

  riders: {
    title: "المناديب",
    icon: "👥",
    routes: [
      { path: "riders", label: "جميع المناديب" },
      { path: "riders/create", label: "إضافة المناديب" },
      { path: "riders/search", label: "البحث عن المناديب" },
      { path: "riders/performance", label: "أداء المناديب" },
    ],
  },

  employees: {
    title: "الموظفين",
    icon: "👔",
    routes: [
      { path: "employees", label: "جميع الموظفين" },
      { path: "employees/create", label: "إضافة موظف" },
      { path: "employees/search", label: "البحث عن موظف" },
    ],
  },

  housing: {
    title: "السكن",
    icon: "🏘️",
    routes: [
      { path: "housing", label: "جميع السكنات" },
      { path: "housing/create", label: "إضافة سكن" },
      { path: "housing/manage", label: "إدارة السكن" },
      { path: "housing/add-employee", label: "اضافة موظف الى السكنات" },
      { path: "housing/move-employee", label: "نقل موظف بين السكنات" },
    ],
  },

  shifts: {
    title: "الورديات",
    icon: "📅",
    routes: [
      { path: "shifts", label: "جميع الورديات" },
      { path: "shifts/create", label: "إضافة وردية" },
      { path: "shifts/import", label: "استيراد ورديات" },
      { path: "shifts/comparisons", label: "المقارنات" },
      { path: "shifts/date-range", label: "الورديات حسب الفترة" },
    ],
  },

  substitution: {
    title: "البدلاء",
    icon: "🔄",
    routes: [
      { path: "substitution", label: "جميع البدلاء" },
      { path: "substitution/active", label: "البدلاء النشطين" },
      { path: "substitution/inactive", label: "البدلاء غير النشطين" },
      { path: "substitution/history", label: "سجل البدلاء" },
    ],
  },

  company: {
    title: "الشركات",
    icon: "🏢",
    routes: [
      { path: "companies", label: "جميع الشركات" },
      { path: "companies/create", label: "إضافة شركة" },
      { path: "companies/manage", label: "إدارة الشركات" },
    ],
  },

  admin: {
    title: "الإدارة",
    icon: "⚙️",
    routes: [      
      { path: "register", label: "اضافة مشرف جديد" },
      { path: "register/admin", label: "اضافة ادمن جديد" },
      { path: "register/master", label: "اضافة مدير جديد" },
      { path: "admin/users", label: "إدارة المستخدمين" },
      { path: "admin/roles", label: "الصلاحيات" },
      { path: "admin/settings", label: "الإعدادات" },
      { path: "admin/logs", label: "سجل النشاطات" },
      { path : "admin/system-health", label: "صحة النظام" },

    ],
  },

  account: {
    title: "الحساب",
    icon: "👤",
    routes: [
      { path: "account/profile", label: "الملف الشخصي" },
      { path: "account/change-password", label: "تغيير كلمة المرور" },
    ],
  },
};
