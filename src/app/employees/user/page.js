'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/Ui/Card';
import PageHeader from '@/components/layout/pageheader';
import { UserCheck, UserX, Users, AlertCircle } from 'lucide-react';

export default function EmployeeUserPage() {
  const router = useRouter();

  const services = [
    {
      title: 'طلب تغيير حالة موظف',
      description: 'إرسال طلب لتغيير حالة موظف (نشط، غير نشط، هارب، إجازة، حادث، مريض)',
      icon: UserCheck,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/employees/user/request-change'
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
              يمكنك إرسال طلبات لتغيير حالة الموظفين إلى أي من الحالات الستة المتاحة. جميع الطلبات تتطلب موافقة المسؤول قبل التنفيذ.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
            <p>انقر على "طلب تغيير حالة موظف"</p>
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
            <p>اختر الحالة الجديدة (نشط، غير نشط، هارب، إجازة، حادث، مريض)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <p>أدخل سبب الطلب واسمك</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">5</span>
            </div>
            <p>أرسل الطلب وانتظر موافقة المسؤول</p>
          </div>
        </div>
      </Card>

      {/* Guidelines */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">الحالات المتاحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">نشط</h4>
            <p className="text-sm text-green-700">الموظف في حالة عمل نشطة</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">غير نشط</h4>
            <p className="text-sm text-red-700">الموظف غير نشط مؤقتاً</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
            <h4 className="font-bold text-rose-800 mb-2">هارب</h4>
            <p className="text-sm text-rose-700">الموظف في حالة هروب</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">إجازة</h4>
            <p className="text-sm text-blue-700">الموظف في إجازة مؤقتة</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-bold text-orange-800 mb-2">حادث</h4>
            <p className="text-sm text-orange-700">الموظف في إجازة مرضية بسبب حادث</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-2">مريض</h4>
            <p className="text-sm text-yellow-700">الموظف في إجازة مرضية</p>
          </div>
        </div>
      </Card>
    </div>
  );
}