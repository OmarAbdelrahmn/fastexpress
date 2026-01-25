'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { UserPlus, ArrowRight, Save } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';


export default function CreateRiderPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [housings, setHousings] = useState([]);

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
    inksa: true,
    workingId: '',
    tshirtSize: '',
    licenseNumber: '',
    companyName: '',
    isEmployee: false,
  });

  useEffect(() => {
    loadCompanies();
    loadHousings();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading companies:', err);
      setErrorMessage(t('riders.loadCompaniesError'));
    }
  };

  const loadHousings = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.HOUSING.LIST);
      setHousings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading housings:', err);
      // Optional: show error or just log it
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
      const requestData = {
        iqamaNo: parseInt(formData.iqamaNo),
        iqamaEndM: formData.iqamaEndM,
        iqamaEndH: formData.iqamaEndH,
        passportNo: formData.passportNo,
        passportEnd: formData.passportEnd || null,
        sponsorNo: formData.sponsorNo,
        sponsor: formData.sponsor,
        jobTitle: formData.jobTitle,
        nameAR: formData.nameAR,
        nameEN: formData.nameEN,
        country: formData.country,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        status: formData.status,
        iban: formData.iban,
        inksa: formData.inksa,
        workingId: formData.workingId,
        tshirtSize: formData.tshirtSize,
        licenseNumber: '0',
        companyName: formData.companyName,
        isEmployee: formData.isEmployee
      };

      console.log('Submitting rider data:', requestData);
      console.log('Submitting rider data:', requestData);
      await ApiService.post(API_ENDPOINTS.RIDER.CREATE, requestData);

      // Add to housing if selected
      if (formData.housingName) {
        try {
          // The API endpoint seems to be (iqamaNo, housingName)
          // based on: ADD_EMPLOYEE: (iqamaNo, housingName) => `/api/housing/${iqamaNo}/add/${housingName}`
          await ApiService.put(
            API_ENDPOINTS.HOUSING.ADD_EMPLOYEE(requestData.iqamaNo, formData.housingName)
          );
        } catch (housingErr) {
          console.error('Error adding to housing:', housingErr);
          // We don't fail the whole process if housing add fails, but maybe alert user?
          // For now, proceeding as success but logging error.
        }
      }

      setSuccessMessage(t('riders.createSuccess'));
      setTimeout(() => {
        router.push('/admin/riders');
      }, 2000);
    } catch (err) {
      console.error('Error creating rider:', err);
      setErrorMessage(err?.message || t('riders.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('riders.addRider')}
        subtitle={t('riders.enterRiderData')}
        icon={UserPlus}
        actionButton={{
          text: t('navigation.backToList'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders'),
          variant: 'secondary'
        }}
      />

      {successMessage && (
        <Alert
          type="success"
          title={t('common.success')}
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">{t('employees.personalInfo')}</h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isEmployee"
                id="isEmployee"
                checked={formData.isEmployee}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="isEmployee" className="text-sm font-medium text-gray-700 cursor-pointer">
                {t('common.isEmployee')}
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('employees.iqamaNumber')}
              type="number"
              name="iqamaNo"
              value={formData.iqamaNo}
              onChange={handleInputChange}
              required
              placeholder={t('employees.enterIqamaNumber')}
            />

            <Input
              label={t('employees.nameArabic')}
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              required
              placeholder={t('employees.enterNameArabic')}
            />

            <Input
              label={t('employees.nameEnglish')}
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
              required
              placeholder={t('employees.enterNameEnglish')}
            />

            <Input
              label={t('employees.passportNumber')}
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleInputChange}
              placeholder={t('employees.enterPassportNumber')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدولة <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">اختر الدولة</option>
                {[
                  "المملكة العربية السعودية", "مصر", "الهند", "باكستان", "بنغلاديش", "الفلبين",
                  "السودان", "اليمن", "الأردن", "سوريا", "لبنان", "فلسطين", "العراق",
                  "الإمارات العربية المتحدة", "الكويت", "سلطنة عمان", "البحرين", "قطر",
                  "المغرب", "تونس", "الجزائر", "ليبيا", "الصومال", "جيبوتي", "موريتانيا",
                  "جزر القمر", "سريلانكا", "نيبال", "إندونيسيا", "ماليزيا", "أفغانستان",
                  "تركيا", "إيران"
                ].sort().map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('common.phone')}
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="05xxxxxxxx"
            />

            <Input
              label={t('employees.dateOfBirth')}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="enable">{t('status.enable')}</option>
                <option value="disable">{t('status.disable')}</option>
                <option value="fleeing">{t('status.fleeing')}</option>
                <option value="vacation">{t('status.vacation')}</option>
                <option value="accident">{t('status.accident')}</option>
                <option value="sick">{t('status.sick')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Iqama & Passport Details */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.iqamaPassportDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('employees.iqamaEndDateM')}
              type="date"
              name="iqamaEndM"
              value={formData.iqamaEndM}
              onChange={handleInputChange}
              required
            />

            <Input
              label={t('employees.iqamaEndDateH')}
              type="text"
              name="iqamaEndH"
              placeholder={t('employees.iqamaEndDateHExample')}
              value={formData.iqamaEndH}
              onChange={(e) =>
                setFormData({ ...formData, iqamaEndH: e.target.value })
              }
              dir="rtl"
              required
            />

            <Input
              label={t('employees.passportEndDate')}
              type="date"
              name="passportEnd"
              value={formData.passportEnd}
              onChange={handleInputChange}
            />
          </div>
        </Card>

        {/* Sponsor Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.sponsorInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('employees.sponsorNumber')}
              type="number"
              name="sponsorNo"
              value={formData.sponsorNo}
              onChange={handleInputChange}
              required
              placeholder={t('employees.enterSponsorNumber')}
            />

            <Input
              label={t('employees.sponsor')}
              type="text"
              name="sponsor"
              value={formData.sponsor || 'الخدمة السريعة'}
              onChange={handleInputChange}
              required
              placeholder={t('employees.enterSponsorName')}
            />

            <Input
              label={t('employees.jobTitle')}
              type="text"
              name="jobTitle"
              value={formData.jobTitle || 'سائق دراجة نارية'}
              onChange={handleInputChange}
              required
              placeholder={t('riders.jobTitleExample')}
            />
          </div>
        </Card>

        {/* Banking Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.bankingInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('employees.iban')}
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              placeholder="SA..."
            />
          </div>
        </Card>

        {/* Rider Specific Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.riderInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('riders.workingId')}
              type="text"
              name="workingId"
              value={formData.workingId}
              onChange={handleInputChange}
              placeholder={t('riders.enterWorkingId')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('riders.tshirtSize')} {!formData.isEmployee && <span className="text-red-500">*</span>}
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleInputChange}
                required={!formData.isEmployee}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('riders.selectSize')}</option>
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
                {t('riders.company')}
              </label>
              <select
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">{t('riders.selectCompany')}</option>
                {companies.map((company) => (
                  <option key={company.name} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السكن
              </label>
              <select
                name="housingName"
                value={formData.housingName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">السكن</option>
                {housings.map((h) => (
                  <option key={h.id || h.name} value={h.name}>
                    {h.name}
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
              onClick={() => router.push('/admin/riders')}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Save size={18} className="ml-2" />
              {t('riders.saveRider')}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}