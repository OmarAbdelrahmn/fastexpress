'use client';

import { UploadCloud, FileText, Car, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/layout/pageheader';

export default function PetrolManagementDashboard() {
  const links = [
    {
      title: "رفع وتخصيص البنزين",
      description: "رفع ملفات الإكسل الجديدة، وإعادة تخصيص السجلات المعلقة للمركبات والسائقين.",
      icon: UploadCloud,
      href: "/admin/petrol/upload",
      color: "blue"
    },
    {
      title: "تقارير بنزين السائقين",
      description: "استعراض تكاليف البنزين الملزم بها كل سائق بعد تقسيمها وفلترتها باليوم والشهر.",
      icon: FileText,
      href: "/admin/petrol/riders",
      color: "green"
    },
    {
      title: "تقارير بنزين المركبات",
      description: "متابعة إجمالي التكاليف الاستهلاكية الخاصة بكل مركبة وقائمة المستفيدين منها.",
      icon: Car,
      href: "/admin/petrol/vehicles",
      color: "purple"
    },
    {
      title: "السجلات غير المخصصة",
      description: "مراجعة وحل السجلات المعلقة التي لم يتمكن النظام من ربطها بسائقين للتوثيق المالي.",
      icon: AlertTriangle,
      href: "/admin/petrol/unattributed",
      color: "red"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="مركز إدارة البنزين"
        subtitle="إدارة عمليات الرفع، التخصيص، ومتابعة تقارير السائقين والمركبات"
        icon={UploadCloud}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4">
          {links.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link key={idx} href={link.href}>
                <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-r-8 border-${link.color}-500 group flex items-start cursor-pointer hover:-translate-y-1`}>
                  <div className={`bg-${link.color}-50 p-4 rounded-xl ml-6 group-hover:bg-${link.color}-100 transition-colors`}>
                    <Icon size={40} className={`text-${link.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{link.title}</h2>
                    <p className="text-gray-600 leading-relaxed font-medium">
                      {link.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center pt-2">
                    <ArrowLeft size={24} className={`text-gray-300 group-hover:text-${link.color}-500 transition-colors transform group-hover:-translate-x-2`} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm text-center max-w-4xl mx-auto">
           <h3 className="text-lg font-bold text-blue-800 mb-2">تعليمات هامة للاستخدام</h3>
           <p className="text-blue-900 leading-relaxed font-medium">
             لتحديث وتخصيص البيانات بأفضل كفاءة، تأكد من تحديث سجلات دوام المندوبين بانتظام واستكمال النواقص قبل رفع ملفات البنزين اليومية أو إعادة محاولة تخصيص السجلات العالقة.
           </p>
        </div>
      </div>
    </div>
  );
}
