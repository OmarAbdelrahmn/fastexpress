'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  User,
  ArrowRight,
  Edit,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Building,
  FileText,
  Shield,
  Briefcase
} from 'lucide-react';

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const iqamaNo = params?.iqamaNo;

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    if (iqamaNo) {
      loadEmployeeDetails();
    }
  }, [iqamaNo]);

  const loadEmployeeDetails = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.BY_IQAMA(iqamaNo));

      if (data && data.length > 0) {
        setEmployee(data[0]);
      } else {
        setErrorMessage(t('employees.employeeNotFound'));
      }
    } catch (err) {
      console.error('Error loading employee details:', err);
      setErrorMessage(err?.message || t('employees.detailsLoadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('employees.detailsTitle')}
          subtitle={t('employees.loadingDetails')}
          icon={User}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('employees.loadingDetails')}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (errorMessage || !employee) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('employees.detailsTitle')}
          subtitle={t('employees.errorOccurred')}
          icon={User}
          actionButton={{
            text: t('common.back'),
            icon: <ArrowRight size={18} />,
            onClick: () => router.back(),
            variant: 'secondary'
          }}
        />
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage || t('employees.employeeNotFound')}
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('employees.notDefined');
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.nameAR}`}
        subtitle={`${t('employees.iqamaNumber')}: ${employee.iqamaNo}`}
        icon={User}
        actionButton={{
          text: t('employees.editBtn'),
          icon: <Edit size={18} />,
          onClick: () => router.push(`/employees/admin/${iqamaNo}/edit`)
        }}
      />

      {/* Status Banner */}
      <div className={`p-6 rounded-lg ${employee.status === 'enable'
          ? 'bg-green-50 border-r-4 border-green-500'
          : 'bg-red-50 border-r-4 border-red-500'
        }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${employee.status === 'enable' ? 'bg-green-100' : 'bg-red-100'
            }`}>
            <Shield className={employee.status === 'enable' ? 'text-green-600' : 'text-red-600'} size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${employee.status === 'enable' ? 'text-green-800' : 'text-red-800'
              }`}>
              {employee.status === 'enable' ? t('employees.activeEmployee') : t('employees.inactiveEmployee')}
            </h2>
            <p className={employee.status === 'enable' ? 'text-green-600' : 'text-red-600'}>
              {t('employees.currentStatusLabel')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            {t('employees.personalInfo')}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.nameArabic')}</p>
                <p className="font-bold text-gray-800 text-lg">{employee.nameAR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.nameEnglish')}</p>
                <p className="font-bold text-gray-800 text-lg">{employee.nameEN}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.iqamaNumber')}</p>
                <p className="font-medium text-gray-800">{employee.iqamaNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.passportNumber')}</p>
                <p className="font-medium text-gray-800">{employee.passportNo || t('employees.notDefined')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.country')}</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <MapPin size={14} />
                  {employee.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.phone')}</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone size={14} />
                  {employee.phone}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">{t('employees.dateOfBirth')}</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(employee.dateOfBirth)}
              </p>
            </div>
          </div>
        </Card>

        {/* Work Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase size={20} />
            {t('employees.workInfo')}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('employees.jobTitle')}</p>
              <p className="font-bold text-blue-700 text-xl">{employee.jobTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.sponsor')}</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Shield size={14} />
                  {employee.sponsor}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('employees.sponsorNumber')}</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <FileText size={14} />
                  {employee.sponsorNo}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Iqama & Passport Details */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} />
          {t('employees.iqamaPassportDetails')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">{t('employees.iqamaExpiryGreg')}</p>
            <p className="font-bold text-gray-800">{formatDate(employee.iqamaEndM)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">{t('employees.iqamaExpiryHijri')}</p>
            <p className="font-bold text-gray-800">{employee.iqamaEndH || t('employees.notDefined')}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">{t('employees.passportExpiry')}</p>
            <p className="font-bold text-gray-800">{formatDate(employee.passportEnd)}</p>
          </div>
        </div>
      </Card>

      {/* Banking Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          {t('employees.bankingInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('employees.ibanNumber')}</p>
            <p className="font-medium text-gray-800 font-mono">{employee.iban || t('employees.notDefined')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('employees.inKSA')}</p>
            <p className={`font-bold ${employee.inksa ? 'text-green-600' : 'text-gray-600'}`}>
              {employee.inksa ? t('employees.yes') : t('employees.no')}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          {t('employees.registrationSection')}
        </h3>
        <div>
          <p className="text-sm text-gray-600 mb-1">{t('employees.addedToSystemDate')}</p>
          <p className="font-medium text-gray-800">
            {formatDate(employee.createdAt)}
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('common.quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => router.push(`/employees/admin/${iqamaNo}/edit`)}
            variant="secondary"
          >
            <Edit size={18} className="ml-2" />
            {t('employees.editData')}
          </Button>
          <Button
            onClick={() => router.push('/employees/admin')}
            variant="secondary"
          >
            <ArrowRight size={18} className="ml-2" />
            {t('employees.backToList')}
          </Button>
        </div>
      </Card>
    </div>
  );
}