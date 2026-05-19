'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from "@/lib/context/LanguageContext";
import { Ban, Search, Car, Clock, MapPin, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function OutOfServiceVehiclesPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [outOfServiceVehicles, setOutOfServiceVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [outOfServiceReason, setOutOfServiceReason] = useState('');
  const [searchPlate, setSearchPlate] = useState('');

  // Modal for Restoring Vehicle
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [vehicleToRestore, setVehicleToRestore] = useState(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [outOfServiceData, availableData] = await Promise.all([
        ApiService.get('/api/vehicles/out-of-service').catch(() => []),
        ApiService.get('/api/vehicles/available').catch(() => [])
      ]);

      if (outOfServiceData) {
        setOutOfServiceVehicles(Array.isArray(outOfServiceData) ? outOfServiceData : []);
      }
      setAvailableVehicles(Array.isArray(availableData) ? availableData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      // setErrorMessage(t('vehicles.loadingError') || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableVehicles = availableVehicles.filter(v =>
    v.plateNumberA?.toLowerCase().includes(searchPlate.toLowerCase()) ||
    v.vehicleNumber?.toLowerCase().includes(searchPlate.toLowerCase()) ||
    v.serialNumber?.toString().includes(searchPlate) ||
    v.location?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const handleMarkOutOfService = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      setErrorMessage(t('vehicles.selectVehicleFirst') || 'الرجاء اختيار مركبة أولاً');
      return;
    }

    if (!outOfServiceReason.trim()) {
      setErrorMessage(t('vehicles.enterReason') || 'الرجاء إدخال السبب');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // POST /api/vehicles/out-of-service?vehicleNumber=...&reason=...
      await ApiService.post(
        `/api/vehicles/out-of-service?vehicleNumber=${encodeURIComponent(selectedVehicle.vehicleNumber)}&reason=${encodeURIComponent(outOfServiceReason)}`
      );

      setSuccessMessage(t('vehicles.outOfServiceSuccess') || 'تم تحويل المركبة إلى خارج الخدمة بنجاح');
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchPlate('');
        setOutOfServiceReason('');
        setActiveTab('list');
        loadData();
      }, 2000);
    } catch (err) {
      console.error('Error marking vehicle as out of service:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء تحويل المركبة إلى خارج الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const openRestoreModal = (vehicle) => {
    setVehicleToRestore(vehicle);
    setRestoreReason('');
    setIsRestoreModalOpen(true);
  };

  const handleRestoreVehicle = async () => {
    if (!vehicleToRestore) return;

    if (!restoreReason.trim()) {
      setErrorMessage(t('vehicles.enterRestoreReason') || 'الرجاء إدخال سبب الإعادة إلى الخدمة');
      return;
    }

    setRestoreLoading(true);
    try {
      // PUT /api/vehicles/restore-out-of-service?vehicleNumber=...&reason=...
      await ApiService.put(
        `/api/vehicles/restore-out-of-service?vehicleNumber=${encodeURIComponent(vehicleToRestore.vehicleNumber)}&reason=${encodeURIComponent(restoreReason)}`
      );

      setSuccessMessage(t('vehicles.restoreSuccess') || 'تم استعادة المركبة بنجاح');
      setIsRestoreModalOpen(false);
      setVehicleToRestore(null);
      loadData();
    } catch (err) {
      console.error('Error restoring vehicle:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء استعادة المركبة');
    } finally {
      setRestoreLoading(false);
    }
  };

  const filteredVehicles = outOfServiceVehicles.filter(v =>
    v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.serialNumber?.toString().includes(searchTerm) ||
    v.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full relative">
      <PageHeader
        title={t('vehicles.actualOutOfService') || 'مركبات خارج الخدمة'}
        subtitle={`${outOfServiceVehicles.length} ${t('vehicles.unusableVehicles') || 'مركبة غير متاحة للاستخدام'}`}
        icon={Ban}
        actionButton={{
          text: t('vehicles.addOutOfServiceVehicle') || 'إضافة مركبة خارج الخدمة',
          icon: <Plus size={18} />,
          onClick: () => setActiveTab('add'),
        }}
      />

      <div className="px-6 space-y-6">
        {errorMessage && (
          <Alert
            type="error"
            title={t('common.error') || 'خطأ'}
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            title={t('common.success') || 'نجاح'}
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-50 border-r-4 border-slate-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{t('vehicles.actualOutOfService') || 'خارج الخدمة'}</p>
                <p className="text-3xl font-bold text-slate-700">{outOfServiceVehicles.length}</p>
              </div>
              <Ban className="text-slate-500" size={40} />
            </div>
          </div>

          <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">{t('vehicles.differentTypes') || 'أنواع مختلفة'}</p>
                <p className="text-3xl font-bold text-blue-700">
                  {new Set(outOfServiceVehicles.map(v => v.vehicleType)).size}
                </p>
              </div>
              <Car className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">{t('vehicles.searchResults') || 'نتائج البحث'}</p>
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
            className={`px-6 py-3 font-medium transition ${activeTab === 'list'
                ? 'text-slate-700 border-b-2 border-slate-700'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            {t('vehicles.vehiclesList') || 'قائمة المركبات'} ({outOfServiceVehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 font-medium transition ${activeTab === 'add'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            {t('vehicles.addOutOfServiceVehicle') || 'إضافة مركبة خارج الخدمة'}
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
                    placeholder={t('vehicles.searchPlaceholderBreakup') || 'البحث عن مركبة...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            </Card>

            {/* Vehicles Grid */}
            <Card>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Ban size={20} className="text-slate-600" />
                {t('vehicles.actualOutOfService') || 'المركبات خارج الخدمة'}
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
                  <p className="mt-4 text-gray-600">{t('vehicles.loadingData') || 'جاري تحميل البيانات...'}</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">{t('vehicles.noVehiclesFound') || 'لا توجد مركبات مطابقة للبحث'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.vehicleNumber}
                      className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-200 p-2 rounded-lg">
                              <Ban className="text-slate-700" size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{formatPlateNumber(vehicle.plateNumberA)}</h4>
                              <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-slate-600 text-white rounded-full text-xs font-medium">
                            {t('vehicles.actualOutOfService') || 'خارج الخدمة'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Car size={14} />
                            <span className="text-gray-600">{t('vehicles.serialNumber') || 'رقم التسلسل'}:</span>
                            <span className="font-medium">{vehicle.serialNumber}</span>
                          </div>

                          {vehicle.location && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin size={14} />
                              <span className="text-gray-600">{t('vehicles.location') || 'الموقع'}:</span>
                              <span className="font-medium">{vehicle.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => openRestoreModal(vehicle)}
                          className="w-full sm:w-auto bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                        >
                          <RefreshCw size={16} className="mr-2" />
                          {t('vehicles.restoreOutOfService') || 'إعادة للخدمة'}
                        </Button>
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
                    <h3 className="font-semibold text-red-800 mb-1">{t('vehicles.markOutOfService') || 'تحويل لخارج الخدمة'}</h3>
                    <p className="text-sm text-red-600">
                      {t('vehicles.outOfServiceDesc') || 'سيتم إيقاف عمل المركبة وتسجيلها كخارج الخدمة.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Vehicle */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Search size={20} />
                  {t('vehicles.searchVehicle') || 'البحث عن مركبة'}
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={searchPlate}
                      onChange={(e) => setSearchPlate(e.target.value)}
                      placeholder={t('vehicles.enterPlateNumberPlaceholder') || 'أدخل رقم اللوحة...'}
                    />
                  </div>
                </div>
              </div>

              {/* Available Vehicles Grid */}
              {!selectedVehicle && (
                <div className="mt-6">
                  {filteredAvailableVehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t('vehicles.noVehiclesFound') || 'لم يتم العثور على المركبة'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAvailableVehicles.slice(0, 12).map((vehicle) => (
                        <div
                          key={vehicle.vehicleNumber}
                          className="border-2 border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-lg transition cursor-pointer"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setSearchPlate(vehicle.plateNumberA || '');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Car className="text-green-600" size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {formatPlateNumber(vehicle.plateNumberA)}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {vehicle.vehicleType}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                              {t('vehicles.availableStatus') || 'متاحة'}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            {vehicle.location && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin size={14} />
                                <span className="font-medium">{vehicle.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedVehicle && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-3">{t('vehicles.vehicleInfo') || 'معلومات المركبة'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 mb-1">{t('vehicles.plateNumber') || 'رقم اللوحة'}</p>
                        <p className="font-medium text-gray-800">{formatPlateNumber(selectedVehicle.plateNumberA)}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 mb-1">{t('vehicles.serialNumber') || 'رقم التسلسل'}</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.serialNumber}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 mb-1">{t('vehicles.vehicleType') || 'نوع المركبة'}</p>
                        <p className="font-medium text-gray-800">{selectedVehicle.vehicleType}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('vehicles.outOfServiceReason') || 'سبب إيقاف الخدمة'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={outOfServiceReason}
                      onChange={(e) => setOutOfServiceReason(e.target.value)}
                      required
                      rows={4}
                      placeholder={t('vehicles.breakUpReasonPlaceholder') || 'اكتب السبب هنا...'}
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
                        setOutOfServiceReason('');
                      }}
                      disabled={loading}
                    >
                      {t('common.cancel') || 'إلغاء'}
                    </Button>
                    <Button onClick={handleMarkOutOfService} loading={loading} disabled={loading}>
                      <Ban size={18} className="ml-2" />
                      {t('vehicles.confirmOutOfService') || 'تأكيد تحويل المركبة'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Restore Modal overlay */}
      {isRestoreModalOpen && vehicleToRestore && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="text-green-600" size={20} />
              {t('vehicles.restoreOutOfService') || 'إعادة للخدمة'}
            </h3>
            
            <div className="mb-4 text-sm text-gray-600">
              <p>هل أنت متأكد من إعادة المركبة ({formatPlateNumber(vehicleToRestore.plateNumberA)}) للخدمة؟</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vehicles.enterRestoreReason') || 'سبب الإعادة للخدمة'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                required
                rows={3}
                placeholder={t('vehicles.restoreReasonPlaceholder') || 'اكتب السبب هنا...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setVehicleToRestore(null);
                }}
                disabled={restoreLoading}
              >
                {t('common.cancel') || 'إلغاء'}
              </Button>
              <Button
                onClick={handleRestoreVehicle}
                loading={restoreLoading}
                disabled={restoreLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('common.confirm') || 'تأكيد'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
