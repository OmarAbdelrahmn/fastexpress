'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/Ui/Card';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { UserCheck, UserX, Users, AlertCircle } from 'lucide-react';

export default function EmployeeUserPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const services = [
    {
      title: t('employees.requestStatusChange'),
      description: t('employees.requestStatusChangeDesc'),
      icon: UserCheck,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/employees/user/request-change'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.userDashboard')}
        subtitle={t('employees.userDashboardSubtitle')}
        icon={Users}
      />

      {/* Information Banner */}
      <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">{t('common.importantInfo')}</h3>
            <p className="text-sm text-blue-700">
              {t('employees.userImportantInfo')}
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
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.howToUse')}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p>{t('employees.step1')}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <p>{t('employees.step2')}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <p>{t('employees.step3')}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <p>{t('employees.step4')}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded mt-0.5">
              <span className="text-blue-600 font-bold">5</span>
            </div>
            <p>{t('employees.step5')}</p>
          </div>
        </div>
      </Card>

      {/* Guidelines */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.availableStatuses')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">{t('employees.statusActive')}</h4>
            <p className="text-sm text-green-700">{t('employees.statusActiveDesc')}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">{t('employees.statusInactive')}</h4>
            <p className="text-sm text-red-700">{t('employees.statusInactiveDesc')}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
            <h4 className="font-bold text-rose-800 mb-2">{t('employees.statusFleeing')}</h4>
            <p className="text-sm text-rose-700">{t('employees.statusFleeingDesc')}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">{t('employees.statusVacation')}</h4>
            <p className="text-sm text-blue-700">{t('employees.statusVacationDesc')}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-bold text-orange-800 mb-2">{t('employees.statusAccident')}</h4>
            <p className="text-sm text-orange-700">{t('employees.statusAccidentDesc')}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-2">{t('employees.statusSick')}</h4>
            <p className="text-sm text-yellow-700">{t('employees.statusSickDesc')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
