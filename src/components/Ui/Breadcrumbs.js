// File: src/components/Ui/Breadcrumb.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronLeft } from 'lucide-react';

// Map of paths to Arabic labels
const pathLabels = {
  dashboard: 'لوحة التحكم',
  reports: 'التقارير',
  'reports/monthly': 'تقارير شهرية',
  'reports/yearly': 'تقارير سنوية',
  'reports/company-performance': 'أداء الشركة',
  'reports/compare-company': 'مقارنة الشركات',
  'reports/riders': 'تقارير السائقين',
  'reports/compare-riders': 'مقارنة السائقين',
  'reports/housing': 'تقارير السكن',
  'reports/top-riders': 'أفضل السائقين',
  'reports/problems': 'تقارير المشاكل',
  vehicles: 'المركبات',
  'vehicles/available': 'المركبات المتاحة',
  'vehicles/taken': 'المركبات المستخدمة',
  'vehicles/create': 'إضافة مركبة',
  'vehicles/maintenance': 'الصيانة والمشاكل',
  'vehicles/history': 'سجل المركبات',
  riders: 'المناديب',
  'riders/create': 'إضافة المناديب',
  'riders/search': 'البحث عن المناديب',
  'riders/performance': 'أداء المناديب',
  employees: 'الموظفين',
  'employees/create': 'إضافة موظف',
  'employees/search': 'البحث عن موظف',
  housing: 'السكن',
  'housing/create': 'إضافة سكن',
  'housing/manage': 'إدارة السكن',
  'housing/add-employee': 'إضافة موظف إلى السكنات',
  'housing/move-employee': 'نقل موظف بين السكنات',
  shifts: 'الورديات',
  'shifts/create': 'إضافة وردية',
  'shifts/import': 'استيراد ورديات',
  'shifts/comparisons': 'المقارنات',
  'shifts/date-range': 'الورديات حسب الفترة',
  substitution: 'البدلاء',
  'substitution/new':'اضافة تبديل',
  'substitution/active': 'البدلاء النشطين',
  'substitution/inactive': 'البدلاء غير النشطين',
  'substitution/history': 'سجل البدلاء',
  companies: 'الشركات',
  'companies/create': 'إضافة شركة',
  'companies/manage': 'إدارة الشركات',
  admin: 'الإدارة',
  'admin/users': 'إدارة المستخدمين',
  'admin/roles': 'الصلاحيات',
  'admin/settings': 'الإعدادات',
  'admin/logs': 'سجل النشاطات',
  'admin/system-health': 'صحة النظام',
  register: 'إضافة مشرف جديد',
  'register/admin': 'إضافة أدمن جديد',
  'register/master': 'إضافة مدير جديد',
  account: 'الحساب',
  'account/profile': 'الملف الشخصي',
  'account/change-password': 'تغيير كلمة المرور',
};

export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove leading slash and split path
    const paths = pathname.replace(/^\//, '').split('/').filter(Boolean);
    
    const breadcrumbs = [
      { label: 'الرئيسية', path: '/dashboard', icon: Home }
    ];

    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += (index === 0 ? '' : '/') + segment;
      const label = pathLabels[currentPath] || segment;
      breadcrumbs.push({
        label,
        path: `/${currentPath}`,
        icon: null
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center gap-2 text-sm flex-row-reverse" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <div key={crumb.path} className="flex items-center gap-2 flex-row-reverse">
            {index > 0 && (
              <ChevronLeft 
                size={16} 
                className="text-white/70" 
              />
            )}
            
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