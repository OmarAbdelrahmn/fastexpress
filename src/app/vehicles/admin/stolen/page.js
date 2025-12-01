'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Shield, AlertCircle, CheckCircle, Car, Clock, User, Search, RefreshCw } from 'lucide-react';

export default function StolenVehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stolenVehicles, setStolenVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('stolen'); // 'stolen' or 'report'
  
  // Report stolen form
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [reportData, setReportData] = useState({
    reporterIqama: '',
    reason: ''
  });

  // Recover stolen form
  const [recoverVehicle, setRecoverVehicle] = useState(null);
  const [recoveryDetails, setRecoveryDetails] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingVehicles(true);
    try {
      const [stolenData, availableData] = await Promise.all([
        ApiService.get('/api/vehicles/stolen'),
        ApiService.get('/api/vehicles/available')
      ]);
      
      if (stolenData && stolenData.vehicles) {
        setStolenVehicles(stolenData.vehicles);
      }
      setAvailableVehicles(Array.isArray(availableData) ? availableData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setErrorMessage('حدث خطأ في تحميل البيانات');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const searchVehicle = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage('الرجاء إدخال رقم اللوحة للبحث');
      return;
    }

    try {
      const data = await ApiService.get(`/api/vehicles/plate/${searchTerm}`);
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
    }
  };

  const handleReportStolen = async (e) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      setErrorMessage('الرجاء البحث عن المركبة أولاً');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const iqamaParam = reportData.reporterIqama ? `&reportedByIqamaNo=${reportData.reporterIqama}` : '';
      const reasonParam = reportData.reason ? `&reason=${encodeURIComponent(reportData.reason)}` : '';
      
      await ApiService.post(
        `/api/vehicles/stolen?plate=${selectedVehicle.plateNumberA}${iqamaParam}${reasonParam}`
      );
      
      setSuccessMessage('تم الإبلاغ عن السرقة بنجاح');
      setTimeout(() => {
        setSelectedVehicle(null);
        setSearchTerm('');
        setReportData({ reporterIqama: '', reason: '' });
        setActiveTab('stolen');
        loadData();
      }, 2000);
    } catch (err) {
      console.error('Error reporting stolen:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء الإبلاغ عن السرقة');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverStolen = async (e) => {
    e.preventDefault();
    
    if (!recoverVehicle) {
      setErrorMessage('الرجاء اختيار المركبة أولاً');
      return;
    }

    if (!recoveryDetails.trim()) {
      setErrorMessage('الرجاء إدخال تفاصيل الاسترجاع');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await ApiService.put(
        `/api/vehicles/recover-stolen?plate=${recoverVehicle.plateNumberA}&reason=${encodeURIComponent(recoveryDetails)}`
      );
      
      setSuccessMessage('تم استرجاع المركبة بنجاح');
      setTimeout(() => {
        setRecoverVehicle(null);
        setRecoveryDetails('');
        loadData();
      }, 2000);
    } catch (err) {
      console.error('Error recovering stolen:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء استرجاع المركبة');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableVehicles = availableVehicles.filter(v =>
    v.plateNumberA?.includes(searchTerm) ||
    v.vehicleNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المركبات المسروقة"
        subtitle="الإبلاغ عن السرقات واسترجاع المركبات"
        icon={Shield}
      />

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">مركبات مسروقة</p>
              <p className="text-3xl font-bold text-red-700">{stolenVehicles.length}</p>
            </div>
            <Shield className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">تم الاسترجاع هذا الشهر</p>
              <p className="text-3xl font-bold text-green-700">0</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('stolen')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'stolen'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          المركبات المسروقة ({stolenVehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'report'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          الإبلاغ عن سرقة جديدة
        </button>
      </div>

      {/* Stolen Vehicles List */}
      {activeTab === 'stolen' && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-red-600" />
            المركبات المبلغ عن سرقتها
          </h3>

          {loadingVehicles ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : stolenVehicles.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-600">لا توجد مركبات مسروقة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {stolenVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicleNumber}
                  className="border-2 border-red-200 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Shield className="text-red-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{vehicle.plateNumberA}</h4>
                        <p className="text-xs text-gray-500">{vehicle.vehicleType}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                      مسروقة
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Car size={14} />
                      <span>الرقم التسلسلي: {vehicle.serialNumber}</span>
                    </div>

                    {vehicle.riderName && vehicle.riderName !== 'Unknown' && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={14} />
                        <span>آخر سائق: {vehicle.riderName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={14} />
                      <span>تاريخ الإبلاغ: {new Date(vehicle.since).toLocaleDateString('ar-SA')}</span>
                    </div>

                    {vehicle.reason && (
                      <div className="bg-red-100 p-2 rounded mt-2">
                        <p className="text-xs text-red-800">
                          <strong>تفاصيل:</strong> {vehicle.reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setRecoverVehicle(vehicle);
                      setRecoveryDetails('');
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    <RefreshCw size={16} className="ml-2" />
                    استرجاع المركبة
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Report Stolen Form */}
      {activeTab === 'report' && (
        <Card>
          <form onSubmit={handleReportStolen} className="space-y-6">
            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">الإبلاغ عن سرقة مركبة</h3>
                  <p className="text-sm text-red-600">
                    قم بالبحث عن المركبة وإدخال تفاصيل السرقة
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="أدخل رقم اللوحة..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchVehicle())}
                />
                <Button type="button" onClick={searchVehicle} variant="secondary">
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

                <Input
                  label="رقم إقامة المبلغ (اختياري)"
                  type="number"
                  value={reportData.reporterIqama}
                  onChange={(e) => setReportData({ ...reportData, reporterIqama: e.target.value })}
                  placeholder="أدخل رقم إقامة الشخص المبلغ..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تفاصيل السرقة
                  </label>
                  <textarea
                    value={reportData.reason}
                    onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                    rows={4}
                    placeholder="اشرح ظروف السرقة والتفاصيل المتاحة..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedVehicle(null);
                      setSearchTerm('');
                      setReportData({ reporterIqama: '', reason: '' });
                    }}
                    disabled={loading}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" loading={loading} disabled={loading}>
                    <Shield size={18} className="ml-2" />
                    تأكيد الإبلاغ
                  </Button>
                </div>
              </>
            )}
          </form>
        </Card>
      )}

      {/* Recover Stolen Modal */}
      {recoverVehicle && (
        <Card>
          <form onSubmit={handleRecoverStolen} className="space-y-6">
            <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">استرجاع مركبة مسروقة</h3>
                  <p className="text-sm text-green-600">
                    المركبة: <strong>{recoverVehicle.plateNumberA}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تفاصيل الاسترجاع <span className="text-red-500">*</span>
              </label>
              <textarea
                value={recoveryDetails}
                onChange={(e) => setRecoveryDetails(e.target.value)}
                required
                rows={4}
                placeholder="اشرح كيف تم استرجاع المركبة وحالتها..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setRecoverVehicle(null);
                  setRecoveryDetails('');
                }}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                <CheckCircle size={18} className="ml-2" />
                تأكيد الاسترجاع
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}