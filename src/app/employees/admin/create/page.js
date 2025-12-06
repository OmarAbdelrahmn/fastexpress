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
import { UserPlus, ArrowRight, Save } from 'lucide-react';

export default function CreateEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    iqamaNo: '',
    iqamaEndM: '',
    iqamaEndH: '',
    passportNo: '',
    passportEnd: '',
    sponsorNo: '',
    sponsor: '',
    jobTitle: '',
    nameAR: '',
    nameEN: '',
    country: '',
    phone: '',
    dateOfBirth: '',
    status: 'enable',
    iban: '',
    inksa: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const requestData = {
        iqamaNo: formData.iqamaNo,
        iqamaEndM: formData.iqamaEndM,
        iqamaEndH: formData.iqamaEndH,
        passportNo: formData.passportNo,
        passportEnd: formData.passportEnd || null,
        sponsorNo: parseInt(formData.sponsorNo),
        sponsor: formData.sponsor,
        jobTitle: formData.jobTitle,
        nameAR: formData.nameAR,
        nameEN: formData.nameEN,
        country: formData.country,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        status: formData.status,
        iban: formData.iban,
        inksa: formData.inksa
      };
      console.log('Request Data:', requestData);
      await ApiService.post(API_ENDPOINTS.EMPLOYEE.CREATE, requestData);
      
      setSuccessMessage('تم إضافة الموظف بنجاح');
      setTimeout(() => {
        router.push('/employees/admin');
      }, 1000);
    } catch (err) {
      console.error('Error creating employee:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء إضافة الموظف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إضافة موظف جديد"
        subtitle="أدخل بيانات الموظف الكاملة"
        icon={UserPlus}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/employees/admin'),
          variant: 'secondary'
        }}
      />

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">المعلومات الشخصية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="رقم الإقامة"
              type="number"
              name="iqamaNo"
              value={formData.iqamaNo}
              onChange={handleInputChange}
              required
              placeholder="أدخل رقم الإقامة"
            />

            <Input
              label="الاسم (عربي)"
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              required
              placeholder="أدخل الاسم بالعربي"
            />

            <Input
              label="الاسم (إنجليزي)"
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
              required
              placeholder="أدخل الاسم بالإنجليزي"
            />

            <Input
              label="رقم الجواز"
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleInputChange}
              placeholder="أدخل رقم الجواز"
            />

            <Input
              label="البلد"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              placeholder="أدخل البلد"
            />

            <Input
              label="رقم الهاتف"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="05xxxxxxxx"
            />

            <Input
              label="تاريخ الميلاد"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="enable">نشط</option>
                <option value="disable">غير نشط</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Iqama & Passport Details */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">تفاصيل الإقامة والجواز</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="تاريخ انتهاء الإقامة (ميلادي)"
              type="date"
              name="iqamaEndM"
              value={formData.iqamaEndM}
              onChange={handleInputChange}
              required
            />

            <Input
            label="تاريخ انتهاء الإقامة (هجري)"
            type="text"
            name="iqamaEndH"
            placeholder="مثال: 25-01-1425"
            value={formData.iqamaEndH}
            onChange={(e) =>
                setFormData({ ...formData, iqamaEndH: e.target.value })
            }
            dir="rtl"
            required
            />

            <Input
              label="تاريخ انتهاء الجواز"
              type="date"
              name="passportEnd"
              value={formData.passportEnd}
              onChange={handleInputChange}
            />
          </div>
        </Card>

        {/* Sponsor Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات الكفالة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="رقم الكفيل"
              type="number"
              name="sponsorNo"
              value={formData.sponsorNo}
              onChange={handleInputChange}
              required
              placeholder="أدخل رقم الكفيل"
            />

            <Input
              label="الكفيل"
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              required
              placeholder="أدخل اسم الكفيل"
            />

            <Input
              label="المسمى الوظيفي"
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              placeholder="مثال: موظف إداري"
            />
          </div>
        </Card>

        {/* Banking Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">المعلومات البنكية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم الآيبان"
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              placeholder="SA..."
            />

            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                name="inksa"
                checked={formData.inksa}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <label className="text-sm text-gray-700">
                في السعودية (INKSA)
              </label>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <Card>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/employees/admin')}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Save size={18} className="ml-2" />
              حفظ الموظف
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}