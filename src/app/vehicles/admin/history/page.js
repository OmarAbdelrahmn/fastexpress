"use client";
import { useState, useEffect } from 'react';
import { Search, Car, User, Package, MapPin, Calendar, AlertTriangle, CheckCircle, Eye, Filter, RefreshCw, Clock, Activity, FileText } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';

export default function VehicleHistory() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllVehicles();
  }, []);

  const loadAllVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.get('/api/vehicles');
      setAllVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('فشل في تحميل قائمة المركبات');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleDetails = async (plateNumber) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const response = await ApiService.get(`/api/vehicles/vehicle-history/${plateNumber}`);
      // Response is an array, so we take all entries
      setSelectedVehicleHistory(Array.isArray(response) ? response : [response]);
    } catch (err) {
      setError(err.message || 'فشل في جلب بيانات المركبة');
      setSelectedVehicleHistory(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleVehicleClick = (vehicle) => {
    loadVehicleDetails(vehicle.plateNumberA);
  };

  const filteredVehicles = allVehicles.filter(v => 
    v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plateNumberE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.serialNumber?.toString().includes(searchTerm) ||
    v.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statusTypeDisplay) => {
    const status = statusTypeDisplay?.toLowerCase();
    if (status === 'taken') {
      return { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-blue-700', icon: 'text-blue-500' };
    } else if (status === 'available') {
      return { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-gradient-to-r from-green-500 to-green-600', text: 'text-green-700', icon: 'text-green-500' };
    } else if (status === 'stolen') {
      return { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-gradient-to-r from-red-500 to-red-600', text: 'text-red-700', icon: 'text-red-500' };
    } else if (status === 'problem') {
      return { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-orange-700', icon: 'text-orange-500' };
    }
    return { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gradient-to-r from-gray-500 to-gray-600', text: 'text-gray-700', icon: 'text-gray-500' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-10 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Car size={36} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">سجل المركبات</h1>
                  <p className="text-blue-100 mt-1">
                    {loading ? 'جاري التحميل...' : `${allVehicles.length} مركبة متاحة للمراجعة`}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={loadAllVehicles}
              disabled={loading}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 backdrop-blur-sm border border-white/20 hover:scale-105 transform"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Search and List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Alert Messages */}
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-xl shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-600" size={24} />
                  <div>
                    <h3 className="font-bold text-red-800 text-lg">خطأ</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Box */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter size={20} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">بحث وتصفية</h3>
              </div>

              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث برقم اللوحة، الرقم التسلسلي، الموقع..."
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {searchTerm && (
                <div className="mt-3 flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg">
                  <span className="text-blue-700 font-medium">
                    النتائج: {filteredVehicles.length} من {allVehicles.length}
                  </span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                  >
                    مسح
                  </button>
                </div>
              )}
            </div>

            {/* Vehicles List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  قائمة المركبات
                </h3>
              </div>

              <div className="max-h-[650px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 font-medium">جاري تحميل المركبات...</p>
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="text-center py-16">
                    <Car className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-600 font-medium">لا توجد نتائج</p>
                    <p className="text-gray-400 text-sm mt-1">جرب البحث بمعايير مختلفة</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredVehicles.map((vehicle) => {
                      const colors = getStatusColor(vehicle.statusTypeDisplay);
                      const isSelected = selectedVehicleHistory?.[0]?.plateNumberA === vehicle.plateNumberA;
                      
                      return (
                        <button
                          key={vehicle.id || vehicle.plateNumberA}
                          onClick={() => handleVehicleClick(vehicle)}
                          className={`w-full text-right p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-r-4 border-blue-600 shadow-md'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Car size={18} className={colors.icon} />
                              <span className="font-bold text-gray-900 text-lg">{vehicle.plateNumberA}</span>
                            </div>
                            {vehicle.statusTypeDisplay && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                vehicle.statusTypeDisplay.toLowerCase() === 'taken' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                vehicle.statusTypeDisplay.toLowerCase() === 'available' ? 'bg-green-100 text-green-700 border border-green-200' :
                                vehicle.statusTypeDisplay.toLowerCase() === 'stolen' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-orange-100 text-orange-700 border border-orange-200'
                              }`}>
                                {vehicle.statusTypeDisplay}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700 font-medium">{vehicle.vehicleNumber || 'N/A'}</p>
                            {vehicle.manufacturer && (
                              <p className="text-xs text-gray-500">{vehicle.manufacturer}</p>
                            )}
                            {vehicle.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin size={12} />
                                {vehicle.location}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - History Details */}
          <div className="lg:col-span-2">
            {loadingDetails ? (
              <div className="bg-white rounded-xl shadow-lg p-16 border border-gray-100">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-6 text-gray-600 font-medium text-lg">جاري تحميل سجل المركبة...</p>
                </div>
              </div>
            ) : selectedVehicleHistory && selectedVehicleHistory.length > 0 ? (
              <div className="space-y-6">
                {/* Vehicle Information - Shown Once */}
                {(() => {
                  const firstRecord = selectedVehicleHistory[0];
                  const colors = getStatusColor(firstRecord.statusTypeDisplay);
                  
                  return (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
                      {/* Vehicle Header */}
                      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                              <Car size={32} />
                            </div>
                            <div>
                              <h2 className="text-3xl font-bold">{firstRecord.plateNumberA}</h2>
                              <p className="text-blue-100 mt-1 font-medium">رقم المركبة: {firstRecord.vehicleNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-100 text-sm">إجمالي السجلات</p>
                            <p className="text-3xl font-bold">{selectedVehicleHistory.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8">
                        {/* Vehicle Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {firstRecord.vehicleNumber && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Package size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">رقم المركبة</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.vehicleNumber}</p>
                            </div>
                          )}

                          {firstRecord.serialNumber && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">الرقم التسلسلي</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.serialNumber}</p>
                            </div>
                          )}

                          {firstRecord.plateNumberE && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Car size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">رقم اللوحة (إنجليزي)</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.plateNumberE}</p>
                            </div>
                          )}

                          {firstRecord.manufacturer && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Car size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">الشركة المصنعة</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.manufacturer}</p>
                            </div>
                          )}

                          {firstRecord.manufactureYear && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">سنة الصنع</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.manufactureYear}</p>
                            </div>
                          )}

                          {firstRecord.location && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">الموقع</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.location}</p>
                            </div>
                          )}

                          {firstRecord.ownerName && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <User size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">اسم المالك</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.ownerName}</p>
                            </div>
                          )}

                          {firstRecord.ownerId && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Package size={16} className="text-blue-600" />
                                <span className="text-xs text-blue-600 font-semibold uppercase">رقم هوية المالك</span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{firstRecord.ownerId}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* History Records Timeline */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Clock size={24} />
                      </div>
                      <h3 className="text-2xl font-bold">سجل الحركة والأنشطة</h3>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="space-y-4">
                      {selectedVehicleHistory.map((record, index) => {
                        const colors = getStatusColor(record.statusTypeDisplay);
                        
                        return (
                          <div key={record.id || index} className={`${colors.bg} border-2 ${colors.border} rounded-xl p-2 shadow-md hover:shadow-xl transition-all duration-300`}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <Activity className={colors.icon} size={20} />
                                </div>
                                <div>
                                  <span className={`px-4 py-1.5 ${colors.badge} text-white rounded-full text-sm font-bold shadow-md inline-block`}>
                                    {record.statusTypeDisplay}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatDate(record.timestamp)}
                                  </p>
                                </div>
                              </div>
                              
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                record.isActive 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                <CheckCircle size={14} />
                                {record.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {record.riderName && (
                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User size={14} className="text-gray-500" />
                                    <span className="text-xs text-gray-500 font-semibold">اسم السائق</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">{record.riderName}</p>
                                </div>
                              )}

                              {record.riderNameE && (
                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User size={14} className="text-gray-500" />
                                    <span className="text-xs text-gray-500 font-semibold">اسم السائق (إنجليزي)</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">{record.riderNameE}</p>
                                </div>
                              )}

                              {record.employeeIqamaNo && (
                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText size={14} className="text-gray-500" />
                                    <span className="text-xs text-gray-500 font-semibold">رقم إقامة الموظف</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">{record.employeeIqamaNo}</p>
                                </div>
                              )}

                              {record.reason && (
                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText size={14} className="text-gray-500" />
                                    <span className="text-xs text-gray-500 font-semibold">السبب</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">{record.reason}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-16 border border-gray-100">
                <div className="text-center">
                  <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-32 h-32 flex items-center justify-center">
                    <Eye className="text-blue-400" size={64} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">اختر مركبة لعرض السجل</h3>
                  <p className="text-gray-600 text-lg">اختر مركبة من القائمة على اليسار لعرض سجل التفاصيل الكامل</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}