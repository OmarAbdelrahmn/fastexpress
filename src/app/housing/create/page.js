'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Home, Save, ArrowRight } from 'lucide-react';

function HousingCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editHousingName = searchParams.get('edit');
  const isEditMode = !!editHousingName;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    managerIqamaNo: '',
  });

  useEffect(() => {
    if (isEditMode) {
      loadHousingData(editHousingName);
    }
  }, [editHousingName]);

  const loadHousingData = async (name) => {
    setLoading(true);
    try {
      const data = await ApiService.get(`/api/housing/${name}`);
      const housing = Array.isArray(data) ? data[0] : data;

      setFormData({
        name: housing.name || '',
        address: housing.address || '',
        capacity: housing.capacity || '',
        managerIqamaNo: housing.managerIqamaNo || housing.ManagerIqamaNo || '',
      });
    } catch (err) {
      console.error('Error loading housing:', err);
      setErrorMessage('حدث خطأ في تحميل بيانات السكن');
    } finally {
      setLoading(false);
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
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isEditMode) {
        // PUT /api/Housing/{name}
        await ApiService.put(`/api/housing/${editHousingName}`, {
          name: formData.name,
          address: formData.address,
          capacity: parseInt(formData.capacity),
          managerIqamaNo: formData.managerIqamaNo,
        });
        setSuccessMessage('تم تحديث بيانات السكن بنجاح');
      } else {
        // POST /api/Housing
        await ApiService.post('/api/housing', {
          name: formData.name,
          address: formData.address,
          capacity: parseInt(formData.capacity),
          managerIqamaNo: formData.managerIqamaNo,
        });
        setSuccessMessage('تم إضافة السكن بنجاح');
      }

      setTimeout(() => {
        router.push('/housing/manage');
      }, 1500);
    } catch (err) {
      console.error('Error saving housing:', err);
      if (err?.status === 409) {
        setErrorMessage('هذا السكن موجود بالفعل. الرجاء استخدام اسم مختلف.');
      } else if (err?.status === 400) {
        setErrorMessage('بيانات غير صحيحة. الرجاء التحقق من المدخلات.');
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
        title={isEditMode ? 'تعديل بيانات السكن' : 'إضافة سكن جديد'}
        subtitle={isEditMode ? 'تعديل معلومات السكن الحالي' : 'أدخل معلومات السكن الجديد'}
        icon={Home}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/housing/manage'),
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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="اسم السكن"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="أدخل اسم السكن"
            />

            <Input
              label="رقم إقامة المدير"
              type="text"
              name="managerIqamaNo"
              value={formData.managerIqamaNo}
              onChange={handleInputChange}
              required
              placeholder="أدخل رقم إقامة المدير"
            />

            <Input
              label="العنوان"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="أدخل العنوان"
            />

            <Input
              label="السعة"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
              placeholder="أدخل السعة"
              min="1"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/housing/manage')}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Save size={18} className="ml-2" />
              {isEditMode ? 'حفظ التعديلات' : 'إضافة السكن'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function HousingCreatePage() {
  return (
    <Suspense fallback={<div className="p-6">جاري التحميل...</div>}>
      <HousingCreateForm />
    </Suspense>
  );
}