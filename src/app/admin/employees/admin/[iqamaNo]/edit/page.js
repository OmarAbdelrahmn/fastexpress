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
import { useLanguage } from '@/lib/context/LanguageContext';
import { Edit, ArrowRight, Save } from 'lucide-react';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const iqamaNo = params?.iqamaNo;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    iqamaEndM: '',
    iqamaEndH: '',
    passportNo: '',
    passportEnd: '',
    sponsor: '',
    sponsorNo: '',
    jobTitle: '',
    nameAR: '',
    nameEN: '',
    country: '',
    phone: '',
    dateOfBirth: '',
    status: '',
    iban: '',
    inksa: false
  });

  useEffect(() => {
    if (iqamaNo) {
      loadEmployeeData();
    }
  }, [iqamaNo]);

  const loadEmployeeData = async () => {
    setLoadingData(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.BY_IQAMA(iqamaNo));

      if (data && data.length > 0) {
        const employee = data[0];
        setOriginalData(employee);

        setFormData({
          iqamaEndM: employee.iqamaEndM?.split('T')[0] || '',
          iqamaEndH: employee.iqamaEndH || '',
          passportNo: employee.passportNo || '',
          passportEnd: employee.passportEnd?.split('T')[0] || '',
          sponsor: employee.sponsor || '',
          sponsorNo: employee.sponsorNo?.toString() || '',
          jobTitle: employee.jobTitle || '',
          nameAR: employee.nameAR || '',
          nameEN: employee.nameEN || '',
          country: employee.country || '',
          phone: employee.phone || '',
          dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
          status: employee.status || '',
          iban: employee.iban || '',
          inksa: employee.inksa || false
        });
      }
    } catch (err) {
      console.error('Error loading employee:', err);
      setErrorMessage(err?.message || t('employees.editLoadError'));
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
      // Only send changed fields (UEmpolyeeRequest allows partial updates)
      const requestData = {};

      // Compare and add only changed fields
      if (formData.iqamaEndM && formData.iqamaEndM !== originalData?.iqamaEndM?.split('T')[0]) {
        requestData.iqamaEndM = formData.iqamaEndM;
      }
      if (formData.iqamaEndH && formData.iqamaEndH !== originalData?.iqamaEndH) {
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
      if (formData.sponsorNo && parseInt(formData.sponsorNo) !== originalData?.sponsorNo) {
        requestData.sponserNo = parseInt(formData.sponsorNo);
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

      await ApiService.put(API_ENDPOINTS.EMPLOYEE.UPDATE(iqamaNo), requestData);

      setSuccessMessage(t('employees.updateSuccess'));
      setTimeout(() => {
        router.push('/admin/employees/admin');
      }, 2000);
    } catch (err) {
      console.error('Error updating employee:', err);
      setErrorMessage(err?.message || t('employees.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('employees.editTitle')}
          subtitle={t('employees.loadingData')}
          icon={Edit}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('employees.loadingData')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.editTitle')}
        subtitle={`${t('employees.iqamaNumber')}: ${iqamaNo}`}
        icon={Edit}
        actionButton={{
          text: t('employees.backToList'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/employees/admin'),
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.personalInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('employees.nameArabic')}
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              placeholder={t('employees.enterNameArabic')}
            />

            <Input
              label={t('employees.nameEnglish')}
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
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

            <Input
              label={t('employees.country')}
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder={t('employees.enterCountry')}
            />

            <Input
              label={t('employees.phone')}
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t('employees.enterPhone')}
            />

            <Input
              label={t('employees.dateOfBirth')}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('employees.statusLabel')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="enable">{t('employees.statusActive')}</option>
                <option value="disable">{t('employees.statusInactive')}</option>
                <option value="fleeing">{t('employees.statusFleeing')}</option>
                <option value="vacation">{t('employees.statusVacation')}</option>
                <option value="accident">{t('employees.statusAccident')}</option>
                <option value="sick">{t('employees.statusSick')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Iqama & Passport Details */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.iqamaPassportDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('employees.iqamaExpiryGregorian')}
              type="date"
              name="iqamaEndM"
              value={formData.iqamaEndM}
              onChange={handleInputChange}
            />

            <Input
              label={t('employees.iqamaExpiryHijriInput')}
              type="text"
              name="iqamaEndH"
              placeholder={t('employees.hijriExample')}
              value={formData.iqamaEndH}
              onChange={handleInputChange}
              dir="rtl"
            />

            <Input
              label={t('employees.passportExpiryDate')}
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
              placeholder={t('employees.enterSponsorNumber')}
            />

            <Input
              label={t('employees.sponsorName')}
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              placeholder={t('employees.enterSponsorName')}
            />

            <Input
              label={t('employees.jobTitle')}
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder={t('employees.jobTitleExample')}
            />
          </div>
        </Card>

        {/* Banking Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.bankingInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('employees.ibanNumberInput')}
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              placeholder={t('employees.ibanPlaceholder')}
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
                {t('employees.inKSACheckbox')}
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
              onClick={() => router.push('/admin/employees/admin')}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Save size={18} className="ml-2" />
              {t('employees.saveChanges')}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}