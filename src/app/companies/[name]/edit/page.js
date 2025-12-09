'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building, Save, ArrowRight, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyName = decodeURIComponent(params?.name || '');

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    address: '',
    phone: '',
    email: ''
  });


  useEffect(() => {
    if (companyName) {
      loadCompanyData();
    }
  }, [companyName]);

  const loadCompanyData = async () => {
    setLoadingData(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      const companies = Array.isArray(data) ? data : [];
      const foundCompany = companies.find(c => c.name === companyName);
      
      if (foundCompany) {
        setOriginalData(foundCompany);
        setFormData({
          name: foundCompany.name,
          details: foundCompany.details || '',
          address: foundCompany.address || '',
          phone: foundCompany.phone || '',
          email: foundCompany.email || ''
        });
      } else {
        setMessage({ type: 'error', text: 'لم يتم العثور على الشركة' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في تحميل بيانات الشركة' });
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'اسم الشركة مطلوب' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = ApiService.put(API_ENDPOINTS.COMPANY.UPDATE(companyName), formData);

        setMessage({ type: 'success', text: 'تم تحديث بيانات الشركة بنجاح' });
        setTimeout(() => {
          router.push('/companies');
        }, 2000);      
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.name !== originalData.name ||
      formData.details !== (originalData.details || '') ||
      formData.address !== (originalData.address || '') ||
      formData.phone !== (originalData.phone || '') ||
      formData.email !== (originalData.email || '')
    );
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
        <PageHeader
          title="تعديل بيانات الشركة"
          subtitle="جاري التحميل..."
          icon={Building}
        />
        <div className="p-6">
          <Card>
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">جاري تحميل البيانات...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="تعديل بيانات الشركة"
        subtitle={`تعديل: ${companyName}`}
        icon={Building}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/companies'),
          variant: 'secondary'
        }}
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Warning Banner */}
        {hasChanges() && (
          <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-yellow-800 mb-1">تحذير</h3>
                <p className="text-sm text-yellow-700">
                  لديك تغييرات غير محفوظة. تأكد من حفظ التغييرات قبل المغادرة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {message.text && (
          <Alert
            type={message.type}
            title={message.type === 'success' ? 'نجح' : 'خطأ'}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Building size={22} className="text-blue-600" />
              المعلومات الأساسية
            </h3>
            
            <div className="space-y-4">
              <div>
                <Input
                  label="اسم الشركة"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل اسم الشركة"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ تغيير اسم الشركة قد يؤثر على السجلات المرتبطة
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التفاصيل
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="أدخل تفاصيل عن الشركة (اختياري)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertCircle size={22} className="text-green-600" />
              معلومات الاتصال
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="رقم الهاتف"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="05xxxxxxxx"
              />

              <Input
                label="البريد الإلكتروني"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
              />
            </div>
          </Card>

          {/* Address Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertCircle size={22} className="text-purple-600" />
              معلومات العنوان
            </h3>
            
            <Input
              label="العنوان"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="أدخل عنوان الشركة"
            />
          </Card>

          {/* Comparison Card */}
          {originalData && hasChanges() && (
            <Card>
              <h3 className="text-lg font-bold text-gray-800 mb-4">مقارنة التغييرات</h3>
              <div className="space-y-3">
                {formData.name !== originalData.name && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">اسم الشركة</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">القديم</p>
                        <p className="text-sm text-red-600 line-through">{originalData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الجديد</p>
                        <p className="text-sm text-green-600 font-medium">{formData.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.phone !== (originalData.phone || '') && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">رقم الهاتف</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">القديم</p>
                        <p className="text-sm text-red-600 line-through">{originalData.phone || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الجديد</p>
                        <p className="text-sm text-green-600 font-medium">{formData.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.email !== (originalData.email || '') && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">القديم</p>
                        <p className="text-sm text-red-600 line-through">{originalData.email || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الجديد</p>
                        <p className="text-sm text-green-600 font-medium">{formData.email || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/companies')}
                disabled={loading}
              >
                <ArrowRight size={18} className="ml-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !hasChanges()}
              >
                <Save size={18} className="ml-2" />
                حفظ التعديلات
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}