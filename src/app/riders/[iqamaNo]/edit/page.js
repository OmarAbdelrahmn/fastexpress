'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Edit, ArrowRight, Save } from 'lucide-react';

export default function EditRiderPage() {
  const router = useRouter();
  const params = useParams();
  const iqamaNo = params?.iqamaNo;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  
  const [formData, setFormData] = useState({
    iqamaEndM: '',
    iqamaEndH: '',
    passportNo: '',
    passportEnd: '',
    sponsor: '',
    jobTitle: '',
    nameAR: '',
    nameEN: '',
    country: '',
    phone: '',
    dateOfBirth: '',
    status: '',
    iban: '',
    inksa: false,
    workingId: '',
    tshirtSize: '',
    licenseNumber: '',
    companyName: ''
  });

  useEffect(() => {
    if (iqamaNo) {
      loadRiderData();
      loadCompanies();
    }
  }, [iqamaNo]);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadRiderData = async () => {
    setLoadingData(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.BY_IQAMA(iqamaNo));
      
      if (data && data.length > 0) {
        const rider = data[0];
        setOriginalData(rider);
        
        setFormData({
          iqamaEndM: rider.iqamaEndM?.split('T')[0] || '',
          iqamaEndH: rider.iqamaEndH?.split('T')[0] || '',
          passportNo: rider.passportNo || '',
          passportEnd: rider.passportEnd?.split('T')[0] || '',
          sponsor: rider.sponsor || '',
          jobTitle: rider.jobTitle || '',
          nameAR: rider.nameAR || '',
          nameEN: rider.nameEN || '',
          country: rider.country || '',
          phone: rider.phone || '',
          dateOfBirth: rider.dateOfBirth?.split('T')[0] || '',
          status: rider.status || '',
          iban: rider.iban || '',
          inksa: rider.inksa || false,
          workingId: rider.workingId?.toString() || '',
          tshirtSize: rider.tshirtSize || '',
          licenseNumber: rider.licenseNumber || '',
          companyName: rider.companyName || ''
        });
      }
    } catch (err) {
      console.error('Error loading rider:', err);
      setErrorMessage(err?.message || 'حدث خطأ في تحميل بيانات المندوب');
    } finally {
      setLoadingData(false);
    }
  };

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
      // Only send changed fields (URiderRequest allows partial updates)
      const requestData = {};
      
      // Compare and add only changed fields
      if (formData.iqamaEndM && formData.iqamaEndM !== originalData?.iqamaEndM?.split('T')[0]) {
        requestData.iqamaEndM = formData.iqamaEndM;
      }
      if (formData.iqamaEndH && formData.iqamaEndH !== originalData?.iqamaEndH?.split('T')[0]) {
        requestData.iqamaEndH = formData.iqamaEndH;
      }
      if (formData.passportNo !== originalData?.passportNo) {
        requestData.passportNo = formData.passportNo;
      }
      if (formData.passportEnd && formData.passportEnd !== originalData?.passportEnd?.split('T')[0]) {
        requestData.passportEnd = formData.passportEnd;
      }
      if (formData.sponsor !== originalData?.sponsor) {
        requestData.sponsor = formData.sponsor;
      }
      if (formData.jobTitle !== originalData?.jobTitle) {
        requestData.jobTitle = formData.jobTitle;
      }
      if (formData.nameAR !== originalData?.nameAR) {
        requestData.nameAR = formData.nameAR;
      }
      if (formData.nameEN !== originalData?.nameEN) {
        requestData.nameEN = formData.nameEN;
      }
      if (formData.country !== originalData?.country) {
        requestData.country = formData.country;
      }
      if (formData.phone !== originalData?.phone) {
        requestData.phone = formData.phone;
      }
      if (formData.dateOfBirth && formData.dateOfBirth !== originalData?.dateOfBirth?.split('T')[0]) {
        requestData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.status !== originalData?.status) {
        requestData.status = formData.status;
      }
      if (formData.iban !== originalData?.iban) {
        requestData.iban = formData.iban;
      }
      if (formData.inksa !== originalData?.inksa) {
        requestData.inksa = formData.inksa;
      }
      if (formData.workingId && parseInt(formData.workingId) !== originalData?.workingId) {
        requestData.workingId = parseInt(formData.workingId);
      }
      if (formData.tshirtSize !== originalData?.tshirtSize) {
        requestData.tshirtSize = formData.tshirtSize;
      }
      if (formData.licenseNumber !== originalData?.licenseNumber) {
        requestData.licenseNumber = formData.licenseNumber;
      }
      if (formData.companyName !== originalData?.companyName) {
        requestData.companyName = formData.companyName;
      }

      await ApiService.put(API_ENDPOINTS.RIDER.UPDATE(iqamaNo), requestData);
      
      setSuccessMessage('تم تحديث بيانات المندوب بنجاح');
      setTimeout(() => {
        router.push('/riders');
      }, 2000);
    } catch (err) {
      console.error('Error updating rider:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء تحديث بيانات المندوب');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="تعديل بيانات المندوب"
          subtitle="جاري التحميل..."
          icon={Edit}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="تعديل بيانات المندوب"
        subtitle={`رقم الإقامة: ${iqamaNo}`}
        icon={Edit}
        actionButton={{
          text: 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/riders'),
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
              label="الاسم (عربي)"
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              placeholder="أدخل الاسم بالعربي"
            />

            <Input
              label="الاسم (إنجليزي)"
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
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
              placeholder="أدخل البلد"
            />

            <Input
              label="رقم الهاتف"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="05xxxxxxxx"
            />

            <Input
              label="تاريخ الميلاد"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
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
                <option value="Active">نشط</option>
                <option value="Inactive">غير نشط</option>
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
            />

            <Input
              label="تاريخ انتهاء الإقامة (هجري)"
              type="date"
              name="iqamaEndH"
              value={formData.iqamaEndH}
              onChange={handleInputChange}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الكفيل"
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              placeholder="أدخل اسم الكفيل"
            />

            <Input
              label="المسمى الوظيفي"
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="مثال: مندوب توصيل"
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

        {/* Rider Specific Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات المندوب</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="رقم العمل"
              type="number"
              name="workingId"
              value={formData.workingId}
              onChange={handleInputChange}
              placeholder="أدخل رقم العمل"
            />

            <Input
              label="رقم الرخصة"
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="أدخل رقم الرخصة"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مقاس التيشرت
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">اختر المقاس</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الشركة
              </label>
              <select
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">اختر الشركة</option>
                {companies.map((company) => (
                  <option key={company.name} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <Card>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/riders')}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Save size={18} className="ml-2" />
              حفظ التعديلات
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}