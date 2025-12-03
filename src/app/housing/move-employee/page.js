'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { RefreshCw, Save, ArrowRight, Home, Users } from 'lucide-react';

const API_BASE = 'https://fastexpress.tryasp.net';

export default function HousingMoveEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingHousings, setLoadingHousings] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [housings, setHousings] = useState([]);
  const [formData, setFormData] = useState({
    iqamaNo: '',
    oldHousingName: '',
    newHousingName: '',
  });

  useEffect(() => {
    loadHousings();
  }, []);

  const loadHousings = async () => {
    setLoadingHousings(true);
    try {
      const data = await ApiService.get('/api/Housing');
      setHousings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading housings:', err);
      setErrorMessage('حدث خطأ في تحميل قائمة السكنات');
    } finally {
      setLoadingHousings(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.oldHousingName === formData.newHousingName) {
      setErrorMessage('يجب أن يكون السكن الجديد مختلفاً عن السكن القديم');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // PUT /api/Housing/{IqamaNo}/change/{oldHousingName}/{NewHousingName}
      await ApiService.put(
        `/api/Housing/${formData.iqamaNo}/change/${formData.oldHousingName}/${formData.newHousingName}`,
        null
      );
      
      setSuccessMessage('تم نقل الموظف بنجاح');
      setTimeout(() => {
        router.push(`/housing/manage`);
      }, 1500);
    } catch (err) {
      console.error('Error moving employee:', err);
      if (err?.status === 404) {
        setErrorMessage('الموظف أو السكن غير موجود');
      } else if (err?.status === 400) {
        setErrorMessage('بيانات غير صحيحة. الرجاء التحقق من المدخلات.');
      } else if (err?.status === 409) {
        setErrorMessage('تعارض في البيانات');
      } else {
        setErrorMessage(err?.message || 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="نقل موظف بين السكنات"
        subtitle="قم بنقل موظف من سكن إلى آخر"
        icon={RefreshCw}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push(`/housing/manage`),
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

      {successMessage && (
        <Alert 
          type="success" 
          title="نجاح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">إجمالي السكنات المتاحة</p>
              <p className="text-3xl font-bold text-blue-700">{housings.length}</p>
            </div>
            <Home className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">إجمالي السعة المتاحة</p>
              <p className="text-3xl font-bold text-green-700">
                {housings.reduce((sum, h) => sum + (h.capacity - (h.employees.length  || 0)), 0)}
              </p>
            </div>
            <Users className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      <Card>
        {loadingHousings ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="text-orange-600 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-1">نقل الموظف</h3>
                  <p className="text-sm text-orange-600">
                    الرجاء إدخال رقم إقامة الموظف واختيار السكن الحالي والسكن الجديد
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Input
                label="رقم الإقامة"
                type="text"
                name="iqamaNo"
                value={formData.iqamaNo}
                onChange={handleInputChange}
                required
                placeholder="أدخل رقم إقامة الموظف"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    السكن الحالي <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="oldHousingName"
                    value={formData.oldHousingName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">اختر السكن الحالي</option>
                    {housings.map((housing) => (
                      <option key={housing.name} value={housing.name}>
                        {housing.name} - الإشغال: {housing.employees.length  || 0}/{housing.capacity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    السكن الجديد <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="newHousingName"
                    value={formData.newHousingName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">اختر السكن الجديد</option>
                    {housings
                      .filter(housing => housing.name !== formData.oldHousingName)
                      .map((housing) => (
                        <option key={housing.name} value={housing.name}>
                          {housing.name} - الإشغال: {housing.employees.length  || 0}/{housing.capacity}
                          {housing.employees.length  >= housing.capacity && ' (ممتلئ)'}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {formData.oldHousingName && formData.newHousingName && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Housing Info */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Home size={18} />
                    السكن الحالي
                  </h3>
                  {housings.find(h => h.name === formData.oldHousingName) && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-red-600 mb-1">العنوان</p>
                        <p className="font-medium text-gray-800">
                          {housings.find(h => h.name === formData.oldHousingName).address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-red-600 mb-1">الإشغال</p>
                        <p className="font-medium text-gray-800">
                          {housings.find(h => h.name === formData.oldHousingName).employees.length  || 0} / 
                          {housings.find(h => h.name === formData.oldHousingName).capacity}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* New Housing Info */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Home size={18} />
                    السكن الجديد
                  </h3>
                  {housings.find(h => h.name === formData.newHousingName) && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-green-600 mb-1">العنوان</p>
                        <p className="font-medium text-gray-800">
                          {housings.find(h => h.name === formData.newHousingName).address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 mb-1">الإشغال</p>
                        <p className="font-medium text-gray-800">
                          {housings.find(h => h.name === formData.newHousingName).employees.length  || 0} / 
                          {housings.find(h => h.name === formData.newHousingName).capacity}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`${API_BASE}/housing/manage`)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                <RefreshCw size={18} className="ml-2" />
                نقل الموظف
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}