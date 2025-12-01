'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { RefreshCw, Search, CheckCircle, AlertCircle, Car, User, Clock, MapPin } from 'lucide-react';

export default function RequestReturnVehiclePage() {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [takenVehicles, setTakenVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [employeeIqama, setEmployeeIqama] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadTakenVehicles();
  }, []);

  const loadTakenVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/vehicles/taken');
      if (data && data.vehicles) {
        setTakenVehicles(data.vehicles);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setErrorMessage('حدث خطأ في تحميل المركبات المستخدمة');
    } finally {
      setLoading(false);
    }
  };

  const searchVehicle = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage('الرجاء إدخال رقم اللوحة للبحث');
      return;
    }

    setSearchLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(`/api/vehicles/with-rider/${searchTerm}`);
      if (data && data.currentRider) {
        setSelectedVehicle(data);
        // Store the rider's iqama number as a string
        setEmployeeIqama(data.currentRider.employeeIqamaNo?.toString() || '');
        setErrorMessage('');
      } else {
        setErrorMessage('المركبة غير مستخدمة حالياً أو غير موجودة');
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('Error searching vehicle:', err);
      setErrorMessage('المركبة غير موجودة أو غير مستخدمة حالياً');
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedVehicle) {
      setErrorMessage('الرجاء اختيار المركبة أولاً');
      return;
    }

    if (!employeeIqama.trim()) {
      setErrorMessage('الرجاء إدخال رقم الإقامة');
      return;
    }

    // Validate that employeeIqama matches the current rider
    if (selectedVehicle.currentRider && 
        employeeIqama !== selectedVehicle.currentRider.employeeIqamaNo?.toString()) {
      setErrorMessage('رقم الإقامة المدخل لا يطابق السائق الحالي للمركبة');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('الرجاء إدخال سبب الطلب');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const requestBody = {
        Plate: selectedVehicle.plateNumberA,
        riderIqamaNo: parseInt(employeeIqama, 10), // Parse as integer
        resolvedBy: employeeIqama.toString()
      };

      console.log('Submitting request:', requestBody); // Debug log

      await ApiService.post(
        `/api/temp/vehicle-request-return?reason=${encodeURIComponent(reason)}`, 
        requestBody
      );
      
      setSuccessMessage('تم إرسال طلب إرجاع المركبة بنجاح. في انتظار الموافقة.');
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchTerm('');
        setEmployeeIqama('');
        setReason('');
        loadTakenVehicles();
      }, 2000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = takenVehicles.filter(v =>
    v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.serialNumber?.toString().includes(searchTerm) ||
    v.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <PageHeader
        title="طلب إرجاع مركبة"
        subtitle="قدم طلب لإرجاع مركبة بعد الانتهاء من استخدامها"
        icon={RefreshCw}
      />

      <div className="px-6 space-y-6">
        {errorMessage && (
          <Alert 
            type="error" 
            title="خطأ" 
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        {successMessage && (
          <Alert 
            type="success" 
            title="نجاح" 
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-orange-800 mb-1">معلومات مهمة</h3>
              <p className="text-sm text-orange-600">
                سيتم إرسال طلبك للمسؤول للمراجعة والموافقة. تأكد من إرجاع المركبة بحالة جيدة.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">مركبات مستخدمة</p>
                <p className="text-2xl font-bold text-blue-700">{takenVehicles.length}</p>
              </div>
              <Car className="text-blue-500" size={36} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">سائقين نشطين</p>
                <p className="text-2xl font-bold text-green-700">
                  {new Set(takenVehicles.map(v => v.riderIqamaNo)).size}
                </p>
              </div>
              <User className="text-green-500" size={36} />
            </div>
          </div>

          <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">نتائج البحث</p>
                <p className="text-2xl font-bold text-purple-700">{filteredVehicles.length}</p>
              </div>
              <Search className="text-purple-500" size={36} />
            </div>
          </div>
        </div>

        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search size={20} />
              البحث عن المركبة
            </h3>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="أدخل رقم اللوحة..."
                  onKeyPress={(e) => e.key === 'Enter' && searchVehicle()}
                />
              </div>
              <Button 
                onClick={searchVehicle}
                loading={searchLoading}
                disabled={searchLoading}
              >
                <Search size={18} className="ml-2" />
                بحث
              </Button>
            </div>
          </div>

          {selectedVehicle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Car size={18} />
                معلومات المركبة المحددة
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-blue-600 mb-1">رقم اللوحة (عربي)</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.plateNumberA}</p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">الرقم التسلسلي</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.serialNumber}</p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">نوع المركبة</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.vehicleType}</p>
                </div>
                <div>
                  <p className="text-blue-600 mb-1">رقم المركبة</p>
                  <p className="font-medium text-gray-800">{selectedVehicle.vehicleNumber}</p>
                </div>
                {selectedVehicle.location && (
                  <div>
                    <p className="text-blue-600 mb-1">الموقع</p>
                    <p className="font-medium text-gray-800">{selectedVehicle.location}</p>
                  </div>
                )}
              </div>

              {selectedVehicle.currentRider && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <User size={16} />
                    معلومات السائق الحالي
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-600 mb-1">رقم الإقامة</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.currentRider.employeeIqamaNo}</p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">الاسم (عربي)</p>
                      <p className="font-medium text-gray-800">{selectedVehicle.currentRider.riderName}</p>
                    </div>
                    <div>
                      <p className="text-green-600 mb-1">تاريخ الاستلام</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedVehicle.currentRider.takenDate).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    {selectedVehicle.currentRider.takenReason && (
                      <div className="col-span-2">
                        <p className="text-green-600 mb-1">سبب الاستلام</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.currentRider.takenReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedVehicle && (
            <div className="space-y-6">
              <div>
                <Input
                  label="رقم إقامة السائق الحالي"
                  type="text"
                  value={employeeIqama}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    setEmployeeIqama(value);
                  }}
                  required
                  placeholder="أدخل رقم الإقامة..."
                  disabled={true} // Make it read-only since it should match the current rider
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ملاحظة: يجب أن يطابق رقم الإقامة السائق الحالي للمركبة
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب إرجاع المركبة <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="اشرح سبب إرجاع المركبة (مثل: انتهاء الدوام، انتهاء المهمة، إلخ)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedVehicle(null);
                    setSearchTerm('');
                    setEmployeeIqama('');
                    setReason('');
                  }}
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <Button onClick={handleSubmitRequest} loading={loading} disabled={loading}>
                  <CheckCircle size={18} className="ml-2" />
                  إرسال الطلب
                </Button>
              </div>
            </div>
          )}
        </Card>

        {!selectedVehicle && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">المركبات المستخدمة حالياً</h3>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <p className="text-gray-600">لا توجد مركبات مستخدمة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicleNumber}
                    className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-lg transition cursor-pointer"
                    onClick={() => {
                      setSearchTerm(vehicle.plateNumberA);
                      searchVehicle();
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Car className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{vehicle.plateNumberA}</h4>
                          <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                        مستخدمة
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {vehicle.riderName && vehicle.riderName !== 'N/A' && (
                        <div className="bg-green-50 border border-green-200 p-2 rounded">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User size={14} className="text-green-600" />
                            <span className="font-medium">{vehicle.riderName}</span>
                          </div>
                        </div>
                      )}

                      {vehicle.location && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin size={14} />
                          <span className="font-medium">{vehicle.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={14} />
                        <span className="text-gray-600">منذ:</span>
                        <span className="font-medium text-xs">
                          {new Date(vehicle.since).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}