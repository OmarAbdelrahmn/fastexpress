'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Package, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function ChangeWorkingIdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    oldWorkingId: '',
    newWorkingId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.oldWorkingId || !formData.newWorkingId) {
      setErrorMessage('الرجاء إدخال كلا الرقمين');
      return;
    }

    if (formData.oldWorkingId === formData.newWorkingId) {
      setErrorMessage('رقم العمل الجديد يجب أن يكون مختلفاً عن القديم');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await ApiService.post(API_ENDPOINTS.RIDER.CHANGE_WORKING_ID, null, {
        oldWorkingId: formData.oldWorkingId,
        newWorkingId: formData.newWorkingId
      });
      
      setSuccessMessage('تم تغيير رقم العمل بنجاح');
      setTimeout(() => {
        setFormData({ oldWorkingId: '', newWorkingId: '' });
        router.push('/riders');
      }, 2000);
    } catch (err) {
      console.error('Error changing working ID:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء تغيير رقم العمل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="تغيير رقم العمل"
        subtitle="تحديث رقم عمل مندوب موجود"
        icon={Package}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/riders'),
          variant: 'secondary'
        }}
      />

      {/* Warning Message */}
      <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">تحذير هام</h3>
            <p className="text-sm text-yellow-600">
              تغيير رقم العمل سيؤثر على جميع السجلات المرتبطة بالمندوب. تأكد من صحة البيانات قبل التغيير.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">كيفية التغيير</h3>
            <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
              <li>أدخل رقم العمل الحالي للمندوب</li>
              <li>أدخل رقم العمل الجديد المطلوب</li>
              <li>تأكد من عدم وجود مندوب آخر بنفس رقم العمل الجديد</li>
              <li>سيتم تحديث جميع السجلات المرتبطة تلقائياً</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="رقم العمل الحالي"
                type="number"
                name="oldWorkingId"
                value={formData.oldWorkingId}
                onChange={handleInputChange}
                required
                placeholder="أدخل رقم العمل الحالي"
              />
              <p className="text-xs text-gray-500 mt-1">
                رقم العمل الموجود حالياً للمندوب
              </p>
            </div>

            <div>
              <Input
                label="رقم العمل الجديد"
                type="number"
                name="newWorkingId"
                value={formData.newWorkingId}
                onChange={handleInputChange}
                required
                placeholder="أدخل رقم العمل الجديد"
              />
              <p className="text-xs text-gray-500 mt-1">
                رقم العمل الجديد المطلوب
              </p>
            </div>
          </div>

          {/* Confirmation Section */}
          {formData.oldWorkingId && formData.newWorkingId && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <h4 className="font-bold text-green-800">معاينة التغيير</h4>
              </div>
              <p className="text-sm text-green-700">
                سيتم تغيير رقم العمل من <strong className="text-green-800">{formData.oldWorkingId}</strong> إلى <strong className="text-green-800">{formData.newWorkingId}</strong>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/riders')}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <CheckCircle size={18} className="ml-2" />
              تأكيد التغيير
            </Button>
          </div>
        </form>
      </Card>

      {/* Information Card */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات إضافية</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>الورديات:</strong> ستبقى جميع الورديات السابقة مرتبطة برقم العمل القديم
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>التقارير:</strong> التقارير الجديدة ستستخدم رقم العمل الجديد
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>السجلات:</strong> رقم الإقامة يبقى ثابتاً ولا يتغير
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}