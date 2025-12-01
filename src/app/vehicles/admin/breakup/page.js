'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { PackageX, Search, Car, Clock, MapPin, AlertCircle, Plus } from 'lucide-react';

export default function BreakUpVehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [breakUpVehicles, setBreakUpVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [breakUpReason, setBreakUpReason] = useState('');
  const [searchPlate, setSearchPlate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [breakUpData, availableData] = await Promise.all([
        ApiService.get('/api/vehicles/taken?statusFilter=breakup'),
        ApiService.get('/api/vehicles/available')
      ]);
      
      if (breakUpData && breakUpData.vehicles) {
        setBreakUpVehicles(breakUpData.vehicles);
      }
      setAvailableVehicles(Array.isArray(availableData) ? availableData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setErrorMessage('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const searchVehicle = async () => {
    if (!searchPlate.trim()) {
      setErrorMessage('الرجاء إدخال رقم اللوحة للبحث');
      return;
    }

    setSearchLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(`/api/vehicles/plate/${searchPlate}`);
      if (data && data.length > 0) {
        setSelectedVehicle(data[0]);
        setErrorMessage('');
      } else {
        setErrorMessage('لم يتم العثور على المركبة');
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('Error searching vehicle:', err);
      setErrorMessage('حدث خطأ في البحث عن المركبة');
      setSelectedVehicle(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMarkBreakUp = async (e) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      setErrorMessage('الرجاء البحث عن المركبة أولاً');
      return;
    }

    if (!breakUpReason.trim()) {
      setErrorMessage('الرجاء إدخال سبب التوقف عن الخدمة');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await ApiService.post(
        `/api/vehicles/break-up?plate=${selectedVehicle.plateNumberA}&reason=${encodeURIComponent(breakUpReason)}`
      );
      
      setSuccessMessage('تم وضع المركبة خارج الخدمة بنجاح');
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchPlate('');
        setBreakUpReason('');
        setActiveTab('list');
        loadData();
      }, 2000);
    } catch (err) {
      console.error('Error marking vehicle as break up:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء وضع المركبة خارج الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = breakUpVehicles.filter(v =>
    v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.serialNumber?.toString().includes(searchTerm) ||
    v.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <PageHeader
        title="المركبات خارج الخدمة"
        subtitle={`${breakUpVehicles.length} مركبة غير قابلة للاستخدام`}
        icon={PackageX}
        actionButton={{
          text: 'إضافة مركبة خارج الخدمة',
          icon: <Plus size={18} />,
          onClick: () => setActiveTab('add'),
        }}
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border-r-4 border-gray-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">خارج الخدمة</p>
                <p className="text-3xl font-bold text-gray-700">{breakUpVehicles.length}</p>
              </div>
              <PackageX className="text-gray-500" size={40} />
            </div>
          </div>

          <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">أنواع مختلفة</p>
                <p className="text-3xl font-bold text-blue-700">
                  {new Set(breakUpVehicles.map(v => v.vehicleType)).size}
                </p>
              </div>
              <Car className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">نتائج البحث</p>
                <p className="text-3xl font-bold text-orange-700">{filteredVehicles.length}</p>
              </div>
              <Search className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'list'
                ? 'text-gray-600 border-b-2 border-gray-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            قائمة المركبات ({breakUpVehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'add'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            إضافة مركبة خارج الخدمة
          </button>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <>
            {/* Search */}
            <Card>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="البحث برقم اللوحة، الرقم التسلسلي، السبب، أو الموقع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </Card>

            {/* Vehicles Grid */}
            <Card>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PackageX size={20} className="text-gray-600" />
                المركبات خارج الخدمة
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
                  <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">لا توجد مركبات خارج الخدمة</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.vehicleNumber}
                      className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 p-2 rounded-lg">
                            <PackageX className="text-gray-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{vehicle.plateNumberA}</h4>
                            <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-xs font-medium">
                          خارج الخدمة
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Car size={14} />
                          <span className="text-gray-600">الرقم التسلسلي:</span>
                          <span className="font-medium">{vehicle.serialNumber}</span>
                        </div>

                        {vehicle.location && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={14} />
                            <span className="text-gray-600">الموقع:</span>
                            <span className="font-medium">{vehicle.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={14} />
                          <span className="text-gray-600">منذ:</span>
                          <span className="font-medium">
                            {new Date(vehicle.since).toLocaleDateString('ar-SA')}
                          </span>
                        </div>

                        {vehicle.reason && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded mt-2">
                            <p className="text-xs text-red-800 font-medium mb-1">
                              <AlertCircle size={12} className="inline ml-1" />
                              سبب التوقف:
                            </p>
                            <p className="text-sm text-red-700">{vehicle.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* Add Tab */}
        {activeTab === 'add' && (
          <Card>
            <div className="space-y-6">
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">وضع مركبة خارج الخدمة</h3>
                    <p className="text-sm text-red-600">
                      قم بالبحث عن المركبة وإدخال سبب وضعها خارج الخدمة
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث عن المركبة
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
                    placeholder="أدخل رقم اللوحة..."
                    onKeyPress={(e) => e.key === 'Enter' && searchVehicle()}
                  />
                  <Button type="button" onClick={searchVehicle} loading={searchLoading} variant="secondary">
                    <Search size={18} />
                  </Button>
                </div>
              </div>

              {selectedVehicle && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-3">معلومات المركبة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 mb-1">رقم اللوحة</p>
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
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سبب التوقف عن الخدمة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={breakUpReason}
                      onChange={(e) => setBreakUpReason(e.target.value)}
                      required
                      rows={4}
                      placeholder="اشرح سبب وضع المركبة خارج الخدمة..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSelectedVehicle(null);
                        setSearchPlate('');
                        setBreakUpReason('');
                      }}
                      disabled={loading}
                    >
                      إلغاء
                    </Button>
                    <Button onClick={handleMarkBreakUp} loading={loading} disabled={loading}>
                      <PackageX size={18} className="ml-2" />
                      تأكيد التوقف عن الخدمة
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}