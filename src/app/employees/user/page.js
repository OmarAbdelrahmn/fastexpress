'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/Ui/Card';
import PageHeader from '@/components/layout/pageheader';
import { UserCheck, UserX, Users, AlertCircle } from 'lucide-react';

export default function EmployeeUserPage() {
  const router = useRouter();

  const services = [
    {
      title: 'طلب تفعيل موظف',
      description: 'إرسال طلب لتفعيل موظف غير نشط',
      icon: UserCheck,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/employees/user/request-enable'
    },
    {
      title: 'طلب تعطيل موظف',
      description: 'إرسال طلب لتعطيل موظف نشط',
      icon: UserX,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      path: '/employees/user/request-disable'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="خدمات الموظفين - صلاحيات المستخدم"
        subtitle="إدارة طلبات تغيير حالة الموظفين"
        icon={Users}
      />

      {/* Information Banner */}
      <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">معلومات هامة</h3>
            <p className="text-sm text-blue-700">
              يمكنك إرسال طلبات لتفعيل أو تعطيل الموظفين. جميع الطلبات تتطلب موافقة المسؤول قبل التنفيذ.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <Card key={index}>
            <button
              onClick={() => router.push(service.path)}
              className="w-full p-6 text-right hover:bg-gray-50 rounded-lg transition"
            >
              <div className="flex items-start gap-4">
                <div className={`${service.bgColor} p-4 rounded-xl`}>
                  <service.icon className={service.iconColor} size={36} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">كيفية الاستخدام</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p>اختر نوع الطلب (تفعيل أو تعطيل)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <p>ابحث عن الموظف برقم الإقامة</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <p>أدخل سبب الطلب</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <p>أرسل الطلب وانتظر موافقة المسؤول</p>
          </div>
        </div>
      </Card>

      {/* Guidelines */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">الإرشادات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <UserCheck size={18} />
              طلب التفعيل
            </h4>
            <p className="text-sm text-green-700">
              استخدم هذا الخيار لطلب تفعيل موظف كان في حالة "غير نشط"
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <UserX size={18} />
              طلب التعطيل
            </h4>
            <p className="text-sm text-red-700">
              استخدم هذا الخيار لطلب تعطيل موظف نشط حالياً
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}