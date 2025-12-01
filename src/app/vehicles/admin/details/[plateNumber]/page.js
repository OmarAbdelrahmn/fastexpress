'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { 
  Car, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  PackageX,
  MapPin,
  Calendar,
  User,
  Package,
  Building,
  FileText,
  Clock,
  Activity
} from 'lucide-react';

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const plate = params?.plateNumber || '';

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [vehicle, setVehicle] = useState(null);


  // console.log("PARAMS:", useParams());

  useEffect(() => {
    if (plate) {
      loadVehicleDetails();
    }
  }, [plate]);

  const loadVehicleDetails = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(`/api/vehicles/with-rider/${plate}`);
      setVehicle(data);
    } catch (err) {
      console.error('Error loading vehicle details:', err);
      setErrorMessage('حدث خطأ في تحميل تفاصيل المركبة');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!vehicle) return { text: '', color: 'gray', icon: Car };
    
    if (vehicle.isStolen) return { text: 'مسروقة', color: 'red', icon: Shield };
    if (vehicle.isBreakUp) return { text: 'خارج الخدمة', color: 'gray', icon: PackageX };
    if (vehicle.hasActiveProblem) return { text: `مشاكل نشطة (${vehicle.activeProblemsCount})`, color: 'orange', icon: AlertTriangle };
    if (!vehicle.isAvailable) return { text: 'مستخدمة', color: 'blue', icon: User };
    return { text: 'متاحة', color: 'green', icon: CheckCircle };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <div className="w-full">
        <PageHeader
          title="تفاصيل المركبة"
          subtitle="جاري التحميل..."
          icon={Car}
        />
        <div className="px-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل تفاصيل المركبة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !vehicle) {
    return (
      <div className="w-full">
        <PageHeader
          title="تفاصيل المركبة"
          subtitle="حدث خطأ"
          icon={Car}
          actionButton={{
            text: 'العودة',
            icon: <ArrowRight size={18} />,
            onClick: () => router.back(),
            variant: 'secondary'
          }}
        />
        <div className="px-6">
          <Alert 
            type="error" 
            title="خطأ" 
            message={errorMessage || 'لم يتم العثور على المركبة'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title={`مركبة ${vehicle.plateNumberA}`}
        subtitle={vehicle.vehicleType}
        icon={Car}
        actionButton={{
          text: 'العودة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.back(),
          variant: 'secondary'
        }}
      />

      <div className="px-6 space-y-6">
        {/* Status Banner */}
        <div className={`bg-${statusInfo.color}-50 border-r-4 border-${statusInfo.color}-500 p-6 rounded-lg`}>
          <div className="flex items-center gap-4">
            <div className={`bg-${statusInfo.color}-100 p-3 rounded-xl`}>
              <StatusIcon className={`text-${statusInfo.color}-600`} size={32} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold text-${statusInfo.color}-800`}>{statusInfo.text}</h2>
              <p className={`text-${statusInfo.color}-600`}>الحالة الحالية للمركبة</p>
            </div>
          </div>
        </div>

        {/* Main Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Car size={20} />
              معلومات المركبة
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">رقم اللوحة (عربي)</p>
                  <p className="font-bold text-gray-800 text-lg">{vehicle.plateNumberA}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">رقم اللوحة (إنجليزي)</p>
                  <p className="font-bold text-gray-800 text-lg">{vehicle.plateNumberE || 'غير محدد'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">رقم المركبة</p>
                  <p className="font-medium text-gray-800">{vehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الرقم التسلسلي</p>
                  <p className="font-medium text-gray-800">{vehicle.serialNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">نوع المركبة</p>
                  <p className="font-medium text-gray-800">{vehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الموقع الحالي</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin size={14} />
                    {vehicle.location || 'غير محدد'}
                  </p>
                </div>
              </div>

              {vehicle.manufacturer && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الشركة المصنعة</p>
                    <p className="font-medium text-gray-800">{vehicle.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">سنة الصنع</p>
                    <p className="font-medium text-gray-800">{vehicle.manufactureYear || 'غير محدد'}</p>
                  </div>
                </div>
              )}

              {vehicle.licenseExpiryDate && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-yellow-600" />
                    <p className="text-sm font-bold text-yellow-800">تاريخ انتهاء الرخصة</p>
                  </div>
                  <p className="text-yellow-700 font-medium">
                    {new Date(vehicle.licenseExpiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Owner Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building size={20} />
              معلومات المالك
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم المالك</p>
                <p className="font-medium text-gray-800 text-lg">{vehicle.ownerName || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">رقم هوية المالك</p>
                <p className="font-medium text-gray-800">{vehicle.ownerId || 'غير محدد'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Rider Information */}
        {vehicle.currentRider && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              السائق الحالي
            </h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-600 mb-1">رقم الإقامة</p>
                  <p className="font-bold text-blue-800">{vehicle.currentRider.employeeIqamaNo}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">الاسم (عربي)</p>
                  <p className="font-medium text-gray-800">{vehicle.currentRider.riderName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">الاسم (إنجليزي)</p>
                  <p className="font-medium text-gray-800">{vehicle.currentRider.riderNameE}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">تاريخ الاستلام</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(vehicle.currentRider.takenDate).toLocaleDateString('en-US')}
                  </p>
                </div>
                {vehicle.currentRider.takenReason && (
                  <div className="col-span-full">
                    <p className="text-sm text-blue-600 mb-1">سبب الاستلام</p>
                    <p className="font-medium text-gray-800">{vehicle.currentRider.takenReason}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Status Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={20} />
            حالة المركبة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">الحالة الحالية</p>
              <p className="font-bold text-gray-800">{vehicle.currentStatus}</p>
            </div>
            {vehicle.statusSince && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">في هذه الحالة منذ</p>
                <p className="font-medium text-gray-800">
                  {new Date(vehicle.statusSince).toLocaleString('en-Us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">متاحة للاستخدام</p>
              <p className="font-bold text-gray-800 flex items-center gap-2">
                {vehicle.isAvailable ? (
                  <>
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-green-600">نعم</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="text-red-600" />
                    <span className="text-red-600">لا</span>
                  </>
                )}
              </p>
            </div>
            {vehicle.hasActiveProblem && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 mb-1">مشاكل نشطة</p>
                <p className="font-bold text-orange-800">{vehicle.activeProblemsCount}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Warning Flags */}
        {(vehicle.isStolen || vehicle.isBreakUp || vehicle.hasActiveProblem) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicle.isStolen && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="text-red-600" size={24} />
                  <div>
                    <p className="font-bold text-red-800">مركبة مسروقة</p>
                    <p className="text-sm text-red-600">مبلغ عن سرقة هذه المركبة</p>
                  </div>
                </div>
              </div>
            )}
            {vehicle.isBreakUp && (
              <div className="bg-gray-50 border-r-4 border-gray-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <PackageX className="text-gray-600" size={24} />
                  <div>
                    <p className="font-bold text-gray-800">خارج الخدمة</p>
                    <p className="text-sm text-gray-600">المركبة غير قابلة للاستخدام</p>
                  </div>
                </div>
              </div>
            )}
            {vehicle.hasActiveProblem && (
              <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-orange-600" size={24} />
                  <div>
                    <p className="font-bold text-orange-800">مشاكل نشطة</p>
                    <p className="text-sm text-orange-600">
                      {vehicle.activeProblemsCount} مشكلة تحتاج إلى إصلاح
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Action Buttons */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
            
              onClick={() => router.push(`/vehicles/admin/history/${vehicle.plateNumberA}`)}
              variant="secondary"
            >
              <FileText size={18} className="ml-2" />
              السجل
            </Button>
            <Button
              onClick={() => router.push('/vehicles/admin/change-location')}
              variant="secondary"
            >
              <MapPin size={18} className="ml-2" />
              تغيير الموقع
            </Button>
            {vehicle.hasActiveProblem && (
              <Button
                onClick={() => router.push('/vehicles/admin/fix-problems')}
                variant="secondary"
              >
                <AlertTriangle size={18} className="ml-2" />
                إصلاح المشاكل
              </Button>
            )}
            <Button
              onClick={() => router.push('/vehicles/admin/manage')}
              variant="secondary"
            >
              <Car size={18} className="ml-2" />
              تعديل البيانات
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}