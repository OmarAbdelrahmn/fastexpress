'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { riderService, buildRiderUpdatePayload } from '@/lib/api/riderService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Edit, ArrowRight, Save, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import YesNoSwitch from '@/components/Ui/YesNoSwitch';

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
  const [housings, setHousings] = useState([]);
  const [loadingHousings, setLoadingHousings] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [workingIdSuggestions, setWorkingIdSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
    status: 'enable',
    iban: '',
    inksa: true,
    workingId: '',
    employeeIqamaNo: '',
    tshirtSize: '',
    licenseNumber: '',
    companyName: '',
    isEmployee: false,
    isFreelancer: false,
    housingId: '',
  });

  useEffect(() => {
    if (iqamaNo) {
      loadInitialData();
    }
  }, [iqamaNo]);

  // Load companies, housings, and rider data in parallel
  const loadInitialData = async () => {
    setLoadingData(true);
    setErrorMessage('');
    try {
      const [companiesRes, housingsRes, rider] = await Promise.all([
        ApiService.get(API_ENDPOINTS.COMPANY.LIST).catch(() => []),
        ApiService.get(API_ENDPOINTS.HOUSING.LIST).catch(() => []),
        riderService.getRiderByIqama(iqamaNo),
      ]);

      const loadedCompanies = Array.isArray(companiesRes) ? companiesRes : [];
      const loadedHousings = Array.isArray(housingsRes) ? housingsRes : [];
      setCompanies(loadedCompanies);
      setHousings(loadedHousings);

      // Auto-match housingId by name if housingId is empty but address/name is provided
      let resolvedHousingId = rider.housingId;
      if (!resolvedHousingId && rider.housingAddress && loadedHousings.length > 0) {
        const matched = loadedHousings.find(
          (h) => h.name?.trim().toLowerCase() === rider.housingAddress.trim().toLowerCase()
        );
        if (matched) {
          resolvedHousingId = matched.id;
        }
      }

      const initialRider = {
        ...rider,
        housingId: resolvedHousingId !== undefined && resolvedHousingId !== null ? resolvedHousingId : '',
      };

      setOriginalData(initialRider);
      setFormData({
        iqamaEndM: initialRider.iqamaEndM || '',
        iqamaEndH: initialRider.iqamaEndH || '',
        passportNo: initialRider.passportNo || '',
        passportEnd: initialRider.passportEnd || '',
        sponsorNo: initialRider.sponsorNo || '',
        sponsor: initialRider.sponsor || '',
        jobTitle: initialRider.jobTitle || '',
        nameAR: initialRider.nameAR || '',
        nameEN: initialRider.nameEN || '',
        country: initialRider.country || '',
        phone: initialRider.phone || '',
        dateOfBirth: initialRider.dateOfBirth || '',
        status: initialRider.status || 'enable',
        iban: initialRider.iban || '',
        inksa: Boolean(initialRider.inksa),
        workingId: initialRider.workingId || '',
        employeeIqamaNo: initialRider.employeeIqamaNo || (initialRider.iqamaNo ? String(initialRider.iqamaNo) : ''),
        tshirtSize: initialRider.tshirtSize || '',
        licenseNumber: initialRider.licenseNumber || '',
        companyName: initialRider.companyName || '',
        isEmployee: Boolean(initialRider.isEmployee),
        isFreelancer: Boolean(initialRider.isFreelancer),
        housingId: initialRider.housingId !== '' ? String(initialRider.housingId) : '',
      });
    } catch (err) {
      console.error('Error loading initial rider data:', err);
      setErrorMessage(err?.userMessage || err?.message || t('riders.loadRiderError') || 'خطأ في تحميل بيانات المندوب');
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch working ID suggestions when company changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!formData.companyName || !originalData || formData.companyName === originalData.companyName) {
        setWorkingIdSuggestions(null);
        return;
      }

      const selectedCompany = companies.find((c) => c.name === formData.companyName);
      if (!selectedCompany) return;

      setLoadingSuggestions(true);
      try {
        const suggestions = await ApiService.get(
          API_ENDPOINTS.REPORTS.SUGGEST_WORKING_ID(iqamaNo, selectedCompany.id)
        );
        setWorkingIdSuggestions(suggestions);
      } catch (err) {
        console.error('Error fetching working ID suggestions:', err);
        setWorkingIdSuggestions(null);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [formData.companyName, companies, originalData, iqamaNo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const useSuggestedWorkingId = (suggestedId) => {
    setFormData((prev) => ({
      ...prev,
      workingId: String(suggestedId),
    }));
  };

  // Compute modified fields dynamically for preview
  const diffInfo = useMemo(() => {
    if (!originalData) return { hasChanges: false, changedFields: [], payload: {} };
    return buildRiderUpdatePayload(formData, originalData);
  }, [formData, originalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!diffInfo.hasChanges) {
      setErrorMessage('لم تقم بتعديل أي بيانات لحفظها');
      return;
    }

    // Validate company name against existing companies if provided
    if (diffInfo.payload.companyName && companies.length > 0) {
      const companyExists = companies.some((c) => c.name === diffInfo.payload.companyName);
      if (!companyExists) {
        setErrorMessage('الشركة المحددة غير موجودة في النظام. يرجى اختيار شركة صالحة.');
        return;
      }
    }

    setLoading(true);

    try {
      // Send partial update payload containing only changed fields
      const updatedRider = await riderService.updateRider(iqamaNo, diffInfo.payload);

      // Re-populate state with the complete updated rider object returned from API
      if (updatedRider) {
        setOriginalData(updatedRider);
        setFormData((prev) => ({
          ...prev,
          iqamaEndM: updatedRider.iqamaEndM || prev.iqamaEndM,
          iqamaEndH: updatedRider.iqamaEndH || prev.iqamaEndH,
          passportNo: updatedRider.passportNo ?? prev.passportNo,
          passportEnd: updatedRider.passportEnd || prev.passportEnd,
          sponsorNo: updatedRider.sponsorNo != null ? String(updatedRider.sponsorNo) : prev.sponsorNo,
          sponsor: updatedRider.sponsor ?? prev.sponsor,
          jobTitle: updatedRider.jobTitle ?? prev.jobTitle,
          nameAR: updatedRider.nameAR ?? prev.nameAR,
          nameEN: updatedRider.nameEN ?? prev.nameEN,
          country: updatedRider.country ?? prev.country,
          phone: updatedRider.phone ?? prev.phone,
          dateOfBirth: updatedRider.dateOfBirth || prev.dateOfBirth,
          status: updatedRider.status || prev.status,
          iban: updatedRider.iban ?? prev.iban,
          inksa: updatedRider.inksa !== undefined ? Boolean(updatedRider.inksa) : prev.inksa,
          workingId: updatedRider.workingId != null ? String(updatedRider.workingId) : prev.workingId,
          employeeIqamaNo: updatedRider.employeeIqamaNo != null ? String(updatedRider.employeeIqamaNo) : prev.employeeIqamaNo,
          tshirtSize: updatedRider.tshirtSize ?? prev.tshirtSize,
          licenseNumber: updatedRider.licenseNumber ?? prev.licenseNumber,
          companyName: updatedRider.companyName ?? prev.companyName,
          isEmployee: updatedRider.isEmployee !== undefined ? Boolean(updatedRider.isEmployee) : prev.isEmployee,
          isFreelancer: updatedRider.isFreelancer !== undefined ? Boolean(updatedRider.isFreelancer) : prev.isFreelancer,
          housingId: updatedRider.housingId != null ? String(updatedRider.housingId) : '',
        }));
      }

      setSuccessMessage(t('riders.updateSuccess') || 'تم تحديث بيانات المندوب بنجاح');
      setTimeout(() => {
        router.push('/admin/riders');
      }, 1500);
    } catch (err) {
      console.error('Error updating rider:', err);
      setErrorMessage(err?.userMessage || err?.errorDescription || err?.detail || err?.message || t('riders.updateError') || 'خطأ في تحديث بيانات المندوب');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('riders.editRider') || 'تعديل بيانات المندوب'}
          subtitle={t('common.loading') || 'جاري التحميل...'}
          icon={Edit}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('riders.loadingData') || 'جاري تحميل بيانات المندوب...'}</p>
          </div>
        </Card>
      </div>
    );
  }

  const isFleeing = formData.status === 'fleeing';

  return (
    <div className="space-y-4">
      <PageHeader
        title={formData.nameAR || formData.nameEN || `${t('riders.editRider') || 'تعديل بيانات المندوب'}`}
        subtitle={`${t('riders.iqamaNumber') || 'رقم الإقامة'}: ${iqamaNo}`}
        icon={Edit}
        actionButton={{
          text: t('navigation.backToList') || 'العودة للقائمة',
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders'),
          variant: 'secondary',
        }}
      />

      {successMessage && (
        <Alert
          type="success"
          title={t('common.success') || 'تم بنجاح'}
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error') || 'خطأ'}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Changes Tracker Banner */}
      {diffInfo.hasChanges && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-600 shrink-0" />
            <span>
              تم إجراء <strong>{diffInfo.changedFields.length}</strong> تعديل(ات) سيتم إرسالها فقط في الطلب الجزئي:{' '}
              <span className="font-mono text-[11px] text-blue-950">
                {diffInfo.changedFields.join(', ')}
              </span>
            </span>
          </div>
          <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full font-semibold text-[11px]">
            تحديث جزئي جاهز
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information & Iqama Details */}
        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-3">
            {t('riders.personalInfo') || 'البيانات الشخصية'} & {t('riders.iqamaPassportDetails') || 'بيانات الإقامة وجواز السفر'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label={t('riders.nameArabic') || 'الاسم بالعربية'}
              type="text"
              name="nameAR"
              value={formData.nameAR}
              onChange={handleInputChange}
              placeholder={t('riders.enterNameArabicPlaceholder') || 'الاسم بالعربية'}
            />

            <Input
              label={t('riders.nameEnglish') || 'الاسم بالإنجليزية'}
              type="text"
              name="nameEN"
              value={formData.nameEN}
              onChange={handleInputChange}
              placeholder={t('riders.enterNameEnglishPlaceholder') || 'الاسم بالإنجليزية'}
            />

            <Input
              label={t('riders.passportNumber') || 'رقم جواز السفر'}
              type="text"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleInputChange}
              placeholder={t('riders.enterPassportNumber') || 'رقم الجواز'}
            />

            <Input
              label={t('riders.country') || 'الجنسية / البلد'}
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder={t('riders.enterCountry') || 'الدولة'}
            />

            <Input
              label={t('riders.phone') || 'رقم الجوال'}
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="05xxxxxxxx"
            />

            <Input
              label={t('riders.dateOfBirth') || 'تاريخ الميلاد'}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.status') || 'الحالة'}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="enable">{t('riders.active') || 'نشط (enable)'}</option>
                <option value="disable">{t('riders.inactive') || 'معطل (disable)'}</option>
                <option value="fleeing">{t('riders.fleeing') || 'هروب (fleeing)'}</option>
                <option value="vacation">{t('riders.vacation') || 'إجازة (vacation)'}</option>
                <option value="accident">{t('riders.accident') || 'حادث (accident)'}</option>
                <option value="sick">{t('riders.sick') || 'مرضي (sick)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                داخل المملكة (In KSA)
              </label>
              <div className="flex items-center h-[34px]">
                <YesNoSwitch
                  value={formData.inksa}
                  onChange={(val) => setFormData((prev) => ({ ...prev, inksa: val }))}
                  yesLabel={t('common.yes') || 'نعم'}
                  noLabel={t('common.no') || 'لا'}
                />
              </div>
            </div>

            <Input
              label={t('riders.iqamaEndDateGregorian') || 'تاريخ انتهاء الإقامة (ميلادي)'}
              type="date"
              name="iqamaEndM"
              value={formData.iqamaEndM}
              onChange={handleInputChange}
            />

            <Input
              label={t('riders.iqamaEndDateHijri') || 'تاريخ انتهاء الإقامة (هجري)'}
              type="date"
              name="iqamaEndH"
              value={formData.iqamaEndH}
              onChange={handleInputChange}
            />

            <Input
              label={t('riders.passportEndDate') || 'تاريخ انتهاء جواز السفر'}
              type="date"
              name="passportEnd"
              value={formData.passportEnd}
              onChange={handleInputChange}
            />
          </div>

          {/* Fleeing status warning banner */}
          {isFleeing && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">تنبيه بشأن حالة الهروب (Fleeing):</p>
                <p>
                  تحويل حالة المندوب إلى "هروب" سيقوم تلقائياً بإنشاء سجل هروب وإلغاء تسكين المندوب في السكن الحالي.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Sponsor, Banking & Rider Information */}
        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-3">
            {t('riders.sponsorInfo') || 'بيانات الكفيل'}, {t('riders.bankingInfo') || 'البيانات البنكية'} & {t('riders.riderInfo') || 'بيانات المندوب'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label={t('riders.sponsorNumber') || 'رقم الكفيل'}
              type="text"
              name="sponsorNo"
              value={formData.sponsorNo}
              onChange={handleInputChange}
              placeholder={t('riders.enterSponsorNumber') || '700xxxxxxx'}
            />

            <Input
              label={t('riders.sponsor') || 'اسم الكفيل'}
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              placeholder={t('riders.enterSponsorName') || 'اسم الكفيل'}
            />

            <Input
              label={t('riders.jobTitle') || 'المسمى الوظيفي'}
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder={t('riders.jobTitleExample') || 'سائق توصيل'}
            />

            <Input
              label={t('riders.ibanNumber') || 'رقم الآيبان (IBAN)'}
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleInputChange}
              placeholder="SA..."
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.company') || 'الشركة المشغلة'}
              </label>
              <select
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">{t('riders.selectCompany') || 'اختر الشركة'}</option>
                {companies.map((company) => (
                  <option key={company.name} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Input
                label={t('riders.workingId') || 'معرف العمل (Working ID)'}
                type="text"
                name="workingId"
                value={formData.workingId}
                onChange={handleInputChange}
                placeholder={t('riders.enterWorkingId') || 'مثال: RDR-1002'}
              />

              {/* Working ID Suggestions */}
              {loadingSuggestions && (
                <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-600">{t('common.loading') || 'جاري التحميل'}...</p>
                </div>
              )}

              {workingIdSuggestions && !loadingSuggestions && workingIdSuggestions.hasPreviousHistory && (
                <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs font-medium text-green-800 mb-1">
                    {t('riders.suggestedWorkingId') || 'معرف العمل المقترح'}:
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-green-900">
                      {workingIdSuggestions.suggestedWorkingId}
                    </span>
                    <button
                      type="button"
                      onClick={() => useSuggestedWorkingId(workingIdSuggestions.suggestedWorkingId)}
                      className="px-2 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      {t('riders.useSuggested') || 'استخدام هذا المعرف'}
                    </button>
                  </div>

                  {workingIdSuggestions.allPreviousIds && workingIdSuggestions.allPreviousIds.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-xs font-medium text-green-800 mb-1">
                        {t('riders.allPreviousIds') || 'جميع المعرفات السابقة'}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {workingIdSuggestions.allPreviousIds.map((item, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => useSuggestedWorkingId(item.workingId)}
                            className="px-1.5 py-0.5 bg-white border border-green-300 text-green-800 text-xs rounded hover:bg-green-100 transition-colors"
                          >
                            {item.workingId} ({item.daysUsed}d)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.tshirtSize') || 'مقاس التيشيرت'}
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">{t('riders.selectSize') || 'اختر المقاس'}</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
            </div>

            <Input
              label={t('riders.licenseNumber') || 'رقم الرخصة (License Number)'}
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder={t('riders.enterLicenseNumber') || 'LIC-99999'}
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.housing') || 'السكن'}
              </label>
              <select
                name="housingId"
                value={formData.housingId}
                onChange={handleInputChange}
                disabled={loadingHousings || isFleeing}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
              >
                <option value="">
                  {loadingHousings
                    ? t('common.loading') || 'جاري التحميل...'
                    : t('riders.selectHousing') || 'اختر السكن (أو بدون سكن)'}
                </option>
                {housings.map((housing) => (
                  <option key={housing.id} value={housing.id}>
                    {housing.name}
                  </option>
                ))}
              </select>
              {isFleeing && (
                <p className="text-[11px] text-gray-500 mt-0.5">معطل لأن المندوب بحالة هروب</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('riders.freelancerStatus') || 'حالة العمل الحر (Freelancer)'}
              </label>
              <div className="flex items-center h-[34px]">
                <YesNoSwitch
                  value={formData.isFreelancer}
                  onChange={(val) => setFormData((prev) => ({ ...prev, isFreelancer: val }))}
                  yesLabel={t('common.yes') || 'نعم'}
                  noLabel={t('common.no') || 'لا'}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="text-xs text-gray-500">
              {diffInfo.hasChanges ? (
                <span className="text-orange-600 font-medium flex items-center gap-1">
                  <Info size={14} />
                  لديك تعديلات غير محفوظة ({diffInfo.changedFields.length} حقل)
                </span>
              ) : (
                <span className="text-gray-400">لم يتم تعديل أي حقل بعد</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/riders')}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {t('common.cancel') || 'إلغاء'}
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !diffInfo.hasChanges}
                className="w-full sm:w-auto"
              >
                <Save size={18} className="ml-2" />
                {t('riders.saveChanges') || 'حفظ التعديلات'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}