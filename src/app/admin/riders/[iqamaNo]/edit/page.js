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
import { useLanguage } from '@/lib/context/LanguageContext';

export default function EditRiderPage() {
  const router = useRouter();
  const params = useParams();
  const iqamaNo = params?.iqamaNo;
  const { t } = useLanguage();
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
    sponsorNo: '',
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
    licenseNumber: '',
    companyName: '',
    isEmployee: false
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
          sponsorNo: rider.sponsorNo || '',
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
          licenseNumber: rider.licenseNumber || '',
          companyName: rider.companyName || '',
          isEmployee: rider.isEmployee || false
        });
      }
    } catch (err) {
      console.error('Error loading rider:', err);
      setErrorMessage(err?.message || t('riders.loadRiderError'));
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
      const requestData = {};

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
      if (formData.sponsorNo !== originalData?.sponsorNo) {
        requestData.sponsorNo = formData.sponsorNo;
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
      if (formData.workingId && formData.workingId !== originalData?.workingId) {
        requestData.workingId = formData.workingId;
      }
      if (formData.tshirtSize !== originalData?.tshirtSize) {
        requestData.tshirtSize = formData.tshirtSize;
      }
      if (formData.licenseNumber !== originalData?.licenseNumber) {
        requestData.licenseNumber = formData.licenseNumber;
      }
      if (formData.companyName !== originalData?.companyName) {
        requestData.companyName = formData.companyName === '' ? null : formData.companyName;
      }

      await ApiService.put(API_ENDPOINTS.RIDER.UPDATE(iqamaNo), requestData);

      setSuccessMessage(t('riders.updateSuccess'));
      setTimeout(() => {
        router.push('/admin/riders');
      }, 2000);
    } catch (err) {
      console.error('Error updating rider:', err);
      setErrorMessage(err?.message || t('riders.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('riders.editRider')}
          subtitle={t('common.loading')}
          icon={Edit}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('riders.loadingData')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${formData.nameAR}`}
        subtitle={formData.isEmployee
          ? `${t('riders.iqamaNumber')}: ${formData.iqamaNo}`
          : `${t('riders.workingId')}: ${formData.workingId || 'N/A'} | ${t('riders.iqamaNumber')}: ${formData.iqamaNo}`
        }
        icon={Edit}
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.personalInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('riders.nameArabic')}
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              placeholder={t('riders.enterNameArabicPlaceholder')}
            />

            <Input
              label={t('riders.nameEnglish')}
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
              placeholder={t('riders.enterNameEnglishPlaceholder')}
            />

            <Input
              label={t('riders.passportNumber')}
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleInputChange}
              placeholder={t('riders.enterPassportNumber')}
            />

            <Input
              label={t('riders.country')}
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder={t('riders.enterCountry')}
            />

            <Input
              label={t('riders.phone')}
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="05xxxxxxxx"
            />

            <Input
              label={t('riders.dateOfBirth')}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('riders.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="enable">{t('riders.active')}</option>
                <option value="disable">{t('riders.inactive')}</option>
                <option value="fleeing">{t('riders.fleeing')}</option>
                <option value="vacation">{t('riders.vacation')}</option>
                <option value="accident">{t('riders.accident')}</option>
                <option value="sick">{t('riders.sick')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Iqama & Passport Details */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.iqamaPassportDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('riders.iqamaEndDateGregorian')}
              type="date"
              name="iqamaEndM"
              value={formData.iqamaEndM}
              onChange={handleInputChange}
            />

            <Input
              label={t('riders.iqamaEndDateHijri')}
              type="date"
              name="iqamaEndH"
              value={formData.iqamaEndH}
              onChange={handleInputChange}
            />

            <Input
              label={t('riders.passportEndDate')}
              type="date"
              name="passportEnd"
              value={formData.passportEnd}
              onChange={handleInputChange}
            />
          </div>
        </Card>

        {/* Sponsor Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.sponsorInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('riders.sponsorNumber')}
              type="text"
              name="sponsorNo"
              value={formData.sponsorNo}
              onChange={handleInputChange}
              placeholder={t('riders.enterSponsorNumber')}
            />

            <Input
              label={t('riders.sponsor')}
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              placeholder={t('riders.enterSponsorName')}
            />

            <Input
              label={t('riders.jobTitle')}
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder={t('riders.jobTitleExample')}
            />
          </div>
        </Card>

        {/* Banking Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.bankingInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('riders.ibanNumber')}
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
              type="number"
              name="workingId"
              value={formData.workingId}
              onChange={handleInputChange}
              placeholder={t('riders.enterWorkingId')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('riders.tshirtSize')}
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleInputChange}
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
              {t('riders.saveChanges')}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}