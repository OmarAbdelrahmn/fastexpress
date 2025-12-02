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
  Package,
  FileText,
  Shield,
  Briefcase
} from 'lucide-react';

export default function RiderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const iqamaNo = params?.iqamaNo;

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [rider, setRider] = useState(null);

  useEffect(() => {
    if (iqamaNo) {
      loadRiderDetails();
    }
  }, [iqamaNo]);

  const loadRiderDetails = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.BY_IQAMA(iqamaNo));
      
      if (data && data.length > 0) {
        setRider(data[0]);
      } else {
        setErrorMessage('لم يتم العثور على المندوب');
      }
    } catch (err) {
      console.error('Error loading rider details:', err);
      setErrorMessage(err?.message || 'حدث خطأ في تحميل تفاصيل المندوب');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="تفاصيل المندوب"
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

  if (errorMessage || !rider) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="تفاصيل المندوب"
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
          message={errorMessage || 'لم يتم العثور على المندوب'}
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
        title={`${rider.nameAR}`}
        subtitle={`رقم العمل: ${rider.workingId || 'N/A'} | رقم الإقامة: ${rider.iqamaNo}`}
        icon={User}
        actionButton={{
          text: 'تعديل',
          icon: <Edit size={18} />,
          onClick: () => router.push(`/riders/${iqamaNo}/edit`)
        }}
      />

      {/* Status Banner */}
      <div className={`p-6 rounded-lg ${
        rider.status === 'enable' 
          ? 'bg-green-50 border-r-4 border-green-500' 
          : 'bg-red-50 border-r-4 border-red-500'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            rider.status === 'enable' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Shield className={rider.status === 'enable' ? 'text-green-600' : 'text-red-600'} size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${
              rider.status === 'enable' ? 'text-green-800' : 'text-red-800'
            }`}>
              {rider.status === 'enable' ? 'مندوب نشط' : 'غير نشط'}
            </h2>
            <p className={rider.status === 'enable' ? 'text-green-600' : 'text-red-600'}>
              الحالة الحالية للمندوب
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
                <p className="font-bold text-gray-800 text-lg">{rider.nameAR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الاسم (إنجليزي)</p>
                <p className="font-bold text-gray-800 text-lg">{rider.nameEN}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الإقامة</p>
                <p className="font-medium text-gray-800">{rider.iqamaNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الجواز</p>
                <p className="font-medium text-gray-800">{rider.passportNo || 'غير محدد'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">البلد</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <MapPin size={14} />
                  {rider.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone size={14} />
                  {rider.phone}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الميلاد</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(rider.dateOfBirth)}
              </p>
            </div>
          </div>
        </Card>

        {/* Rider Work Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase size={20} />
            معلومات العمل
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم العمل</p>
                <p className="font-bold text-blue-700 text-xl">{rider.workingId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">المسمى الوظيفي</p>
                <p className="font-medium text-gray-800">{rider.jobTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">الشركة</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Building size={14} />
                  {rider.companyName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم الرخصة</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <FileText size={14} />
                  {rider.licenseNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">مقاس التيشرت</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Package size={14} />
                  {rider.tshirtSize}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">السكن</p>
                <p className="font-medium text-gray-800">
                  {rider.housingAddress || 'غير محدد'}
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
            <p className="font-bold text-gray-800">{formatDate(rider.iqamaEndM)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">انتهاء الإقامة (هجري)</p>
            <p className="font-bold text-gray-800">{formatDate(rider.iqamaEndH)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 mb-1 text-sm">انتهاء الجواز</p>
            <p className="font-bold text-gray-800">{formatDate(rider.passportEnd)}</p>
          </div>
        </div>
      </Card>

      {/* Sponsor Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield size={20} />
          معلومات الكفالة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">الكفيل</p>
            <p className="font-medium text-gray-800">{rider.sponsor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">رقم الكفيل</p>
            <p className="font-medium text-gray-800">{rider.sponserNo || 'غير محدد'}</p>
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
            <p className="font-medium text-gray-800 font-mono">{rider.iban || 'غير محدد'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">في السعودية (INKSA)</p>
            <p className={`font-bold ${rider.inksa ? 'text-green-600' : 'text-gray-600'}`}>
              {rider.inksa ? 'نعم' : 'لا'}
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
            {formatDate(rider.createdAt)}
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => router.push(`/riders/${iqamaNo}/edit`)}
            variant="secondary"
          >
            <Edit size={18} className="ml-2" />
            تعديل البيانات
          </Button>
          <Button
            onClick={() => router.push('/riders')}
            variant="secondary"
          >
            <ArrowRight size={18} className="ml-2" />
            العودة للقائمة
          </Button>
          <Button
            onClick={() => router.push(`/shifts/rider/${rider.workingId}`)}
            variant="secondary"
          >
            <Calendar size={18} className="ml-2" />
            عرض الورديات
          </Button>
          <Button
            onClick={() => router.push(`/reports/riders/${rider.workingId}/renge`)}
            variant="secondary"
          >
            <FileText size={18} className="ml-2" />
            التقارير
          </Button>
        </div>
      </Card>
    </div>
  );
}