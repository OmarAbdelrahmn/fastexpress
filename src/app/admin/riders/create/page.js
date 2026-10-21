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
import { UserPlus, ArrowRight, Save, UserCheck, Briefcase } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import YesNoSwitch from '@/components/Ui/YesNoSwitch';
import { gregorianToHijri } from '@/lib/utils/formatters';

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
    sponsor: 'الخدمة السريعة',
    jobTitle: 'سائق دراجة نارية',
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
    licenseNumber: '0',
    companyName: '',
    housingName: '',
    isEmployee: false,
    isFreelancer: false,
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    if (name === 'iqamaEndM') {
      const hijriDate = gregorianToHijri(updatedValue);
      setFormData((prev) => ({
        ...prev,
        iqamaEndM: updatedValue,
        iqamaEndH: hijriDate || prev.iqamaEndH,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.iqamaNo) {
      setErrorMessage(t('employees.enterIqamaNumber') || 'يرجى إدخال رقم الإقامة');
      setLoading(false);
      return;
    }

    const hijriCalculated = formData.iqamaEndM ? gregorianToHijri(formData.iqamaEndM) : '';
    const finalHijri = formData.iqamaEndH || hijriCalculated || '';

    try {
      const requestData = {
        iqamaNo: parseInt(formData.iqamaNo, 10),
        iqamaEndM: formData.iqamaEndM,
        iqamaEndH: finalHijri,
        passportNo: formData.passportNo || '',
        passportEnd: formData.passportEnd || null,
        sponsorNo: formData.sponsorNo,
        sponsor: formData.sponsor || 'الخدمة السريعة',
        jobTitle: formData.jobTitle || 'سائق دراجة نارية',
        nameAR: formData.nameAR,
        nameEN: formData.nameEN,
        country: formData.country,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        status: formData.status,
        iban: formData.iban || '',
        inksa: Boolean(formData.inksa),
        workingId: formData.workingId || '',
        tshirtSize: formData.tshirtSize || '',
        licenseNumber: '0',
        companyName: formData.companyName || '',
        isEmployee: Boolean(formData.isEmployee),
        isFreelancer: Boolean(formData.isFreelancer),
      };

      await ApiService.post(API_ENDPOINTS.RIDER.CREATE, requestData);

      // Add to housing if selected
      if (formData.housingName) {
        try {
          await ApiService.put(
            API_ENDPOINTS.HOUSING.ADD_EMPLOYEE(requestData.iqamaNo, formData.housingName)
          );
        } catch (housingErr) {
          console.error('Error adding to housing:', housingErr);
        }
      }

      setSuccessMessage(t('riders.createSuccess'));
      setTimeout(() => {
        router.push('/admin/riders');
      }, 1500);
    } catch (err) {
      console.error('Error creating rider:', err);
      setErrorMessage(err?.message || t('riders.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full max-w-none pb-6"> 
       <PageHeader
        title={t('riders.addRider')}
        subtitle={t('riders.enterRiderData')}
        icon={UserPlus}
        actionButton={{
          text: t('navigation.backToList'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders'),
          variant: 'secondary',
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

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Section 1: Personal & Identification Details */}
        <Card bodyClassName="p-4 sm:p-5">
          <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-gray-100">
            <div className="w-1.5 h-4 bg-[#1b428e] rounded-full"></div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <UserCheck size={16} className="text-[#1b428e]" />
              {t('employees.personalInfo')} & {t('employees.iqamaPassportDetails')}
            </h3>
          </div>

          {/* Personal Information (8 fields in 2 rows of 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3.5">
            <Input
              label={t('employees.iqamaNumber')}
              type="number"
              name="iqamaNo"
              value={formData.iqamaNo}
              onChange={handleInputChange}
              required
              compact
              placeholder={t('employees.enterIqamaNumber')}
            />

            <Input
              label={t('employees.nameArabic')}
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              required
              compact
              placeholder={t('employees.enterNameArabic')}
            />

            <Input
              label={t('employees.nameEnglish')}
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
              required
              compact
              placeholder={t('employees.enterNameEnglish')}
            />

            <Input
              label={t('common.phone')}
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              compact
              placeholder="05xxxxxxxx"
            />

            <div>
              <SearchableSelect
                label={t('employees.country')}
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                placeholder="اختر الدولة"
                options={[
                  "المملكة العربية السعودية", "مصر", "الهند", "باكستان", "بنغلاديش", "الفلبين",
                  "السودان", "اليمن", "الأردن", "سوريا", "لبنان", "فلسطين", "العراق",
                  "الإمارات العربية المتحدة", "الكويت", "سلطنة عمان", "البحرين", "قطر",
                  "المغرب", "تونس", "الجزائر", "ليبيا", "الصومال", "جيبوتي", "موريتانيا",
                  "جزر القمر", "سريلانكا", "نيبال", "إندونيسيا", "ماليزيا", "أفغانستان",
                  "تركيا", "إيران"
                ].sort()}
              />
            </div>

            <Input
              label={t('employees.dateOfBirth')}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
              compact
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('common.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b428e] focus:border-transparent bg-white"
              >
                <option value="enable">{t('status.enable')}</option>
                <option value="disable">{t('status.disable')}</option>
                <option value="fleeing">{t('status.fleeing')}</option>
                <option value="vacation">{t('status.vacation')}</option>
                <option value="accident">{t('status.accident')}</option>
                <option value="sick">{t('status.sick')}</option>
              </select>
            </div>

            <Input
              label={t('employees.passportNumber')}
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleInputChange}
              compact
              placeholder={t('employees.enterPassportNumber')}
            />
          </div>

          {/* Expiry Dates (2 balanced columns side-by-side) */}
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t('employees.iqamaEndDateM')}
                type="date"
                name="iqamaEndM"
                value={formData.iqamaEndM}
                onChange={handleInputChange}
                required
                compact
              />

              <Input
                label={t('employees.passportEndDate')}
                type="date"
                name="passportEnd"
                value={formData.passportEnd}
                onChange={handleInputChange}
                compact
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Sponsor, Job & Housing Details */}
        <Card bodyClassName="p-4 sm:p-5">
          <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-gray-100">
            <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Briefcase size={16} className="text-orange-500" />
              {t('employees.sponsorInfo')} & {t('riders.riderInfo')}
            </h3>
          </div>

          {/* 8 fields in 2 rows of 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label={t('employees.sponsorNumber')}
              type="number"
              name="sponsorNo"
              value={formData.sponsorNo}
              onChange={handleInputChange}
              required
              compact
              placeholder={t('employees.enterSponsorNumber')}
            />

            <Input
              label={t('employees.sponsor')}
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              required
              compact
              placeholder={t('employees.enterSponsorName')}
            />

            <Input
              label={t('employees.jobTitle')}
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              compact
              placeholder={t('riders.jobTitleExample')}
            />

            <Input
              label={t('employees.iban')}
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              compact
              placeholder="SA..."
            />

            <Input
              label={t('riders.workingId')}
              type="text"
              name="workingId"
              value={formData.workingId}
              onChange={handleInputChange}
              compact
              placeholder={t('riders.enterWorkingId')}
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.company')}
              </label>
              <select
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b428e] focus:border-transparent bg-white"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                السكن
              </label>
              <select
                name="housingName"
                value={formData.housingName}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b428e] focus:border-transparent bg-white"
              >
                <option value="">السكن</option>
                {housings.map((h) => (
                  <option key={h.id || h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.tshirtSize')} {!formData.isEmployee && <span className="text-red-500">*</span>}
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleInputChange}
                required={!formData.isEmployee}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b428e] focus:border-transparent bg-white"
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
          </div>
        </Card>

        {/* Section 3: Status & Options Bar */}
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-700">موظف (ليس مندوب توصيل):</span>
              <YesNoSwitch
                value={formData.isEmployee}
                onChange={(val) => setFormData((prev) => ({ ...prev, isEmployee: val }))}
                yesLabel={t('common.yes')}
                noLabel={t('common.no')}
              />
            </div>

            <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-700">داخل المملكة (In KSA):</span>
              <YesNoSwitch
                value={formData.inksa}
                onChange={(val) => setFormData((prev) => ({ ...prev, inksa: val }))}
                yesLabel={t('common.yes')}
                noLabel={t('common.no')}
              />
            </div>

            <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-700">حالة الفريلانسر (Freelancer):</span>
              <YesNoSwitch
                value={formData.isFreelancer}
                onChange={(val) => setFormData((prev) => ({ ...prev, isFreelancer: val }))}
                yesLabel={t('common.yes')}
                noLabel={t('common.no')}
              />
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500">
            * الحقول المميزة بعلامة النجمة إلزامية
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => router.push('/admin/riders')}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="blue"
              size="sm"
              loading={loading}
              disabled={loading}
            >
              <Save size={16} className="ml-1.5" />
              {t('riders.saveRider')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}