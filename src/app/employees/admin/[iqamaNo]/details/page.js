'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
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
        setErrorMessage('لم يتم العثور على الموظف');
      }
    } catch (err) {
      console.error('Error loading employee details:', err);
      setErrorMessage(err?.message || 'حدث خطأ في تحميل تفاصيل الموظف');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="تفاصيل الموظف"
          subtitle="جاري التحميل..."
          icon={User}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل التفاصيل...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (errorMessage || !employee) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="تفاصيل الموظف"
          subtitle="حدث خطأ"
          icon={User}
          actionButton={{
            text: 'العودة',
            icon: <ArrowRight size={18} />,
            onClick: () => router.back(),
            variant: 'secondary'
          }}
        />
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage || 'لم يتم العثور على الموظف'}
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.nameAR}`}
        subtitle={`رقم الإقامة: ${employee.iqamaNo}`}
        icon={User}
        actionButton={{
          text: 'تعديل',
          icon: <Edit size={18} />,
          onClick: () => router.push(`/employees/admin/${iqamaNo}/edit`)
        }}
      />

      {/* Status Banner */}
      <div className={`p-6 rounded-lg ${
        employee.status === 'enable' 
          ? 'bg-green-50 border-r-4 border-green-500' 
          : 'bg-red-50 border-r-4 border-red-500'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            employee.status === 'enable' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Shield className={employee.status === 'enable' ? 'text-green-600' : 'text-red-600'} size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${
              employee.status === 'enable' ? 'text-green-800' : 'text-red-800'
            }`}>
              {employee.status === 'enable' ? 'موظف نشط' : 'غير نشط'}
            </h2>
            <p className={employee.status === 'enable' ? 'text-green-600' : 'text-red-600'}>
              الحالة الحالية للموظف
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            المعلومات الشخصية
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">الاسم (عربي)</p>
                <p className="font-bold text-gray-800 text-lg">{employee.nameAR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الاسم (إنجليزي)</p>
                <p className="font-bold text-gray-800 text-lg">{employee.nameEN}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الإقامة</p>
                <p className="font-medium text-gray-800">{employee.iqamaNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الجواز</p>
                <p className="font-medium text-gray-800">{employee.passportNo || 'غير محدد'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">البلد</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <MapPin size={14} />
                  {employee.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone size={14} />
                  {employee.phone}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الميلاد</p>
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
            معلومات العمل
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">المسمى الوظيفي</p>
              <p className="font-bold text-blue-700 text-xl">{employee.jobTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">الكفيل</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Shield size={14} />
                  {employee.sponsor}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الكفيل</p>
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
          تفاصيل الإقامة والجواز
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">انتهاء الإقامة (ميلادي)</p>
            <p className="font-bold text-gray-800">{formatDate(employee.iqamaEndM)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">انتهاء الإقامة (هجري)</p>
            <p className="font-bold text-gray-800">{employee.iqamaEndH || 'غير محدد'}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">انتهاء الجواز</p>
            <p className="font-bold text-gray-800">{formatDate(employee.passportEnd)}</p>
          </div>
        </div>
      </Card>

      {/* Banking Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          المعلومات البنكية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">رقم الآيبان</p>
            <p className="font-medium text-gray-800 font-mono">{employee.iban || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">في السعودية (INKSA)</p>
            <p className={`font-bold ${employee.inksa ? 'text-green-600' : 'text-gray-600'}`}>
              {employee.inksa ? 'نعم' : 'لا'}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          التسجيل
        </h3>
        <div>
          <p className="text-sm text-gray-600 mb-1">تاريخ الإضافة للنظام</p>
          <p className="font-medium text-gray-800">
            {formatDate(employee.createdAt)}
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => router.push(`/employees/admin/${iqamaNo}/edit`)}
            variant="secondary"
          >
            <Edit size={18} className="ml-2" />
            تعديل البيانات
          </Button>
          <Button
            onClick={() => router.push('/employees/admin')}
            variant="secondary"
          >
            <ArrowRight size={18} className="ml-2" />
            العودة للقائمة
          </Button>
        </div>
      </Card>
    </div>
  );
}