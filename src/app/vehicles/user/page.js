'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import Link from 'next/link';
import { 
  Car, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ArrowRight,
  Package,
  FileText
} from 'lucide-react';

export default function VehiclesUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [takenVehicles, setTakenVehicles] = useState([]);
  const [problemVehicles, setProblemVehicles] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [availableData, takenData, problemData] = await Promise.all([
        ApiService.get('/api/vehicles/available'),
        ApiService.get('/api/vehicles/taken'),
        ApiService.get('/api/vehicles/problem')
      ]);
      
      setAvailableVehicles(Array.isArray(availableData) ? availableData : []);
      setTakenVehicles(takenData?.vehicles || []);
      setProblemVehicles(problemData?.vehicles || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setErrorMessage('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'طلب استلام مركبة',
      description: 'قدم طلب لاستلام مركبة متاحة',
      icon: Car,
      color: 'green',
      path: '/vehicles/user/request-take',
      count: availableVehicles.length
    },
    {
      title: 'طلب إرجاع مركبة',
      description: 'قدم طلب لإرجاع مركبة مستخدمة',
      icon: RefreshCw,
      color: 'blue',
      path: '/vehicles/user/request-return',
      count: takenVehicles.length
    },
    {
      title: 'الإبلاغ عن مشكلة',
      description: 'أبلغ عن مشكلة في مركبة',
      icon: AlertTriangle,
      color: 'orange',
      path: '/vehicles/user/request-problem',
      count: null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: { 
        bg: 'bg-green-50', 
        light: 'bg-green-100', 
        text: 'text-green-600', 
        border: 'border-green-200',
        badge: 'bg-green-600'
      },
      blue: { 
        bg: 'bg-blue-50', 
        light: 'bg-blue-100', 
        text: 'text-blue-600', 
        border: 'border-blue-200',
        badge: 'bg-blue-600'
      },
      orange: { 
        bg: 'bg-orange-50', 
        light: 'bg-orange-100', 
        text: 'text-orange-600', 
        border: 'border-orange-200',
        badge: 'bg-orange-600'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة طلبات المركبات"
        subtitle="قدم طلبات الاستلام والإرجاع والإبلاغ عن المشاكل"
        icon={Car}
        actionButton={{
          text: 'تحديث البيانات',
          icon: <RefreshCw size={18} />,
          onClick: loadDashboardData,
          variant: 'secondary'
        }}
      />

      {errorMessage && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">مركبات متاحة</p>
              <p className="text-4xl font-bold">{availableVehicles.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CheckCircle size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-100 text-sm">
            <CheckCircle size={16} />
            <span>جاهزة للاستلام</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">مركبات مستخدمة</p>
              <p className="text-4xl font-bold">{takenVehicles.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <User size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <User size={16} />
            <span>قيد الاستخدام</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm mb-1">مشاكل مبلغ عنها</p>
              <p className="text-4xl font-bold">{problemVehicles.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <AlertTriangle size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <AlertTriangle size={16} />
            <span>تحتاج صيانة</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">إجمالي المركبات</p>
              <p className="text-4xl font-bold">
                {availableVehicles.length + takenVehicles.length + problemVehicles.length}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Car size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <Package size={16} />
            <span>في النظام</span>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">كيفية استخدام النظام</h3>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• لاستلام مركبة: اختر "طلب استلام مركبة" وابحث عن المركبة المتاحة</li>
              <li>• لإرجاع مركبة: اختر "طلب إرجاع مركبة" وحدد المركبة التي تريد إرجاعها</li>
              <li>• للإبلاغ عن مشكلة: اختر "الإبلاغ عن مشكلة" واكتب وصفاً تفصيلياً للمشكلة</li>
              <li>• سيتم مراجعة جميع الطلبات من قبل الإدارة قبل الموافقة عليها</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-6">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);
            
            return (
              <Link key={action.path} href={action.path}>
                <div className={`border-2 ${colors.border} rounded-xl p-6 hover:shadow-xl transition cursor-pointer bg-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${colors.light} p-4 rounded-lg`}>
                      <Icon className={colors.text} size={28} />
                    </div>
                    {action.count !== null && (
                      <span className={`px-4 py-1.5 ${colors.badge} text-white rounded-full text-sm font-bold`}>
                        {action.count}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <span>الانتقال</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity Overview */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Vehicles Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                مركبات متاحة للاستلام
              </h3>
              <Link href="/vehicles/user/request-take">
                <Button variant="secondary" className="text-sm">
                  عرض الكل
                  <ArrowRight size={16} className="mr-2" />
                </Button>
              </Link>
            </div>
            
            {availableVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 text-sm">لا توجد مركبات متاحة حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableVehicles.slice(0, 3).map((vehicle) => (
                  <div
                    key={vehicle.vehicleNumber}
                    className="border-2 border-green-200 rounded-lg p-3 bg-green-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Car className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{vehicle.plateNumberA}</p>
                          <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                        متاحة
                      </span>
                    </div>
                  </div>
                ))}
                {availableVehicles.length > 3 && (
                  <p className="text-center text-sm text-gray-600 pt-2">
                    و {availableVehicles.length - 3} مركبات أخرى
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Taken Vehicles Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                مركبات قيد الاستخدام
              </h3>
              <Link href="/vehicles/user/request-return">
                <Button variant="secondary" className="text-sm">
                  عرض الكل
                  <ArrowRight size={16} className="mr-2" />
                </Button>
              </Link>
            </div>
            
            {takenVehicles.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 text-sm">لا توجد مركبات مستخدمة حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {takenVehicles.slice(0, 3).map((vehicle) => (
                  <div
                    key={vehicle.vehicleNumber}
                    className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Car className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{vehicle.plateNumberA}</p>
                          <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                        مستخدمة
                      </span>
                    </div>
                    {vehicle.riderName && vehicle.riderName !== 'N/A' && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                        <User size={12} />
                        <span>{vehicle.riderName}</span>
                      </div>
                    )}
                  </div>
                ))}
                {takenVehicles.length > 3 && (
                  <p className="text-center text-sm text-gray-600 pt-2">
                    و {takenVehicles.length - 3} مركبات أخرى
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Problem Vehicles Alert */}
      {problemVehicles.length > 0 && (
        <Card>
          <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-600 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-2">
                  مركبات تحتاج إلى انتباه
                </h3>
                <p className="text-sm text-orange-600 mb-3">
                  يوجد {problemVehicles.length} مركبة مبلغ عنها بمشاكل. تأكد من عدم استخدامها حتى يتم إصلاحها.
                </p>
                <Link href="/vehicles/user/request-problem">
                  <Button variant="secondary" className="text-sm">
                    <AlertTriangle size={16} className="ml-2" />
                    الإبلاغ عن مشكلة جديدة
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Tips */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">نصائح الاستخدام</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg mt-1">
                <CheckCircle className="text-blue-600" size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">عند الاستلام</h4>
                <p className="text-sm text-gray-600">تأكد من فحص المركبة والتأكد من عدم وجود أضرار قبل الاستلام</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg mt-1">
                <RefreshCw className="text-green-600" size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">عند الإرجاع</h4>
                <p className="text-sm text-gray-600">تأكد من إرجاع المركبة نظيفة وبنفس الحالة التي استلمتها بها</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-lg mt-1">
                <AlertTriangle className="text-orange-600" size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">عند ملاحظة مشكلة</h4>
                <p className="text-sm text-gray-600">أبلغ فوراً عن أي مشكلة ولا تستخدم المركبة إذا كانت المشكلة خطيرة</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg mt-1">
                <Clock className="text-purple-600" size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">أوقات المعالجة</h4>
                <p className="text-sm text-gray-600">ستتم مراجعة طلبك خلال 24 ساعة من تقديمه</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}