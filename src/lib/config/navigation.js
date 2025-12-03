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
      { path: "/reports", label: "مركز التقارير" },
      { path: "/reports/dashboard", label: "التقرير الرئيسي" },
    ],
  },

  vehicles: {
    title: "المركبات",
    icon: "🚗",
    routes: [
      { path: "vehicles/admin", label: "عمليات الادمن" },
      { path: "vehicles/user", label: "عمليات المشرف" },
    ],
  },

  riders: {
    title: "المناديب",
    icon: "👥",
    routes: [
      { path: "riders", label: "جميع المناديب" },
      { path: "riders/create", label: "إضافة المناديب" },
      { path: "riders/search", label: "البحث عن المناديب" }
    ],
  },

  employees: {
    title: "الموظفين",
    icon: "👔",
    routes: [
      { path: "employees/admin", label: "الموظفين للادمن" },
      { path: "employees/user", label: "الموظفين للمشرف" },
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
      { path: "substitution/new", label: "اضافة تبديل" },
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
