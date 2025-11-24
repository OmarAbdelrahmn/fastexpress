export const navigationConfig = {
  dashboard: {
    title: 'لوحة التحكم',
    icon: '🏠',
    path: '/dashboard',
  },

  reports: {
    title: 'التقارير',
    icon: '📊',
    routes: [
      { path: '/dashboard/reports/all', label: 'جميع التقارير' },
      { path: '/dashboard/reports/monthly', label: 'تقارير شهرية' },
      { path: '/dashboard/reports/yearly', label: 'تقارير سنوية' },
      { path: '/dashboard/reports/company-performance', label: 'أداء الشركة' },
      { path: '/dashboard/reports/compare-company', label: 'مقارنة الشركات' },
      { path: '/dashboard/reports/riders', label: 'تقارير السائقين' },
      { path: '/dashboard/reports/compare-riders', label: 'مقارنة السائقين' },
      { path: '/dashboard/reports/housing', label: 'تقارير السكن' },
      { path: '/dashboard/reports/top-riders', label: 'أفضل السائقين' },
      { path: '/dashboard/reports/problems', label: 'تقارير المشاكل' },
    ]
  },

  vehicles: {
    title: 'المركبات',
    icon: '🚗',
    routes: [
      { path: '/dashboard/vehicles/all', label: 'جميع المركبات' },
      { path: '/dashboard/vehicles/available', label: 'المركبات المتاحة' },
      { path: '/dashboard/vehicles/taken', label: 'المركبات المستخدمة' },
      { path: '/dashboard/vehicles/create', label: 'إضافة مركبة' },
      { path: '/dashboard/vehicles/maintenance', label: 'الصيانة والمشاكل' },
      { path: '/dashboard/vehicles/history', label: 'سجل المركبات' },
    ]
  },

  riders: {
    title: 'السائقين',
    icon: '👥',
    routes: [
      { path: '/dashboard/riders/all', label: 'جميع السائقين' },
      { path: '/dashboard/riders/create', label: 'إضافة سائق' },
      { path: '/dashboard/riders/search', label: 'البحث عن سائق' },
      { path: '/dashboard/riders/performance', label: 'أداء السائقين' },
    ]
  },

  employees: {
    title: 'الموظفين',
    icon: '👔',
    routes: [
      { path: '/dashboard/employees/all', label: 'جميع الموظفين' },
      { path: '/dashboard/employees/create', label: 'إضافة موظف' },
      { path: '/dashboard/employees/search', label: 'البحث عن موظف' },
    ]
  },

  housing: {
    title: 'السكن',
    icon: '🏘️',
    routes: [
      { path: '/dashboard/housing/all', label: 'جميع السكنات' },
      { path: '/dashboard/housing/create', label: 'إضافة سكن' },
      { path: '/dashboard/housing/manage', label: 'إدارة السكن' },
    ]
  },

  shifts: {
    title: 'الورديات',
    icon: '📅',
    routes: [
      { path: '/dashboard/shifts/all', label: 'جميع الورديات' },
      { path: '/dashboard/shifts/create', label: 'إضافة وردية' },
      { path: '/dashboard/shifts/import', label: 'استيراد ورديات' },
      { path: '/dashboard/shifts/comparisons', label: 'المقارنات' },
      { path: '/dashboard/shifts/date-range', label: 'الورديات حسب الفترة' },
    ]
  },

  substitution: {
    title: 'البدلاء',
    icon: '🔄',
    routes: [
      { path: '/dashboard/substitution/all', label: 'جميع البدلاء' },
      { path: '/dashboard/substitution/active', label: 'البدلاء النشطين' },
      { path: '/dashboard/substitution/inactive', label: 'البدلاء غير النشطين' },
      { path: '/dashboard/substitution/history', label: 'سجل البدلاء' },
    ]
  },

  company: {
    title: 'الشركات',
    icon: '🏢',
    routes: [
      { path: '/dashboard/companies/all', label: 'جميع الشركات' },
      { path: '/dashboard/companies/create', label: 'إضافة شركة' },
      { path: '/dashboard/companies/manage', label: 'إدارة الشركات' },
    ]
  },

  admin: {
    title: 'الإدارة',
    icon: '⚙️',
    routes: [
      { path: '/dashboard/admin/users', label: 'إدارة المستخدمين' },
      { path: '/dashboard/admin/roles', label: 'الصلاحيات' },
      { path: '/dashboard/admin/settings', label: 'الإعدادات' },
    ]
  },

  account: {
    title: 'الحساب',
    icon: '👤',
    routes: [
      { path: '/dashboard/account/profile', label: 'الملف الشخصي' },
      { path: '/dashboard/account/change-password', label: 'تغيير كلمة المرور' },
    ]
  }
};