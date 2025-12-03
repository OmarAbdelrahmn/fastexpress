'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Save, ArrowRight, Info } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';

export default function CreateCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    address: '',
    phone: '',
    email: ''
  });

  const API_BASE = 'https://fastexpress.tryasp.net/api';

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
      const response = await fetch(`${API_BASE}/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم إضافة الشركة بنجاح' });
        setTimeout(() => {
          router.push('/companies');
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.title || 'فشلت العملية' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="إضافة شركة جديدة"
        subtitle="قم بإدخال بيانات الشركة الجديدة"
        icon={Building}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/companies'),
          variant: 'secondary'
        }}
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-blue-800 mb-1">معلومات هامة</h3>
              <p className="text-sm text-blue-700">
                جميع الحقول المميزة بـ <span className="text-red-500">*</span> مطلوبة. 
                تأكد من صحة البيانات قبل الحفظ.
              </p>
            </div>
          </div>
        </div>

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
              <Input
                label="اسم الشركة"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="أدخل اسم الشركة"
              />

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
              <Info size={22} className="text-green-600" />
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
              <Info size={22} className="text-purple-600" />
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
                disabled={loading}
              >
                <Save size={18} className="ml-2" />
                حفظ الشركة
              </Button>
            </div>
          </Card>
        </form>

        {/* Preview Card */}
        {formData.name && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">معاينة البيانات</h3>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Building className="text-white" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{formData.name}</h4>
                  <p className="text-blue-100 text-sm">شركة جديدة</p>
                </div>
              </div>
              
              {formData.details && (
                <p className="text-white/90 text-sm mb-3 bg-white/10 p-3 rounded">
                  {formData.details}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.phone && (
                  <div className="text-white/90 text-sm bg-white/10 p-2 rounded">
                    📞 {formData.phone}
                  </div>
                )}
                {formData.email && (
                  <div className="text-white/90 text-sm bg-white/10 p-2 rounded">
                    ✉️ {formData.email}
                  </div>
                )}
                {formData.address && (
                  <div className="text-white/90 text-sm bg-white/10 p-2 rounded md:col-span-2">
                    📍 {formData.address}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}