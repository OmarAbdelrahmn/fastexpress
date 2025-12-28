'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Save, ArrowRight, Info } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CreateCompanyPage() {
  const { t } = useLanguage();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: t('companies.nameRequired') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await ApiService.post(API_ENDPOINTS.COMPANY.CREATE, formData);

      setMessage({ type: 'success', text: t('companies.createSuccess') });
      setTimeout(() => {
        router.push('/admin/companies');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: t('companies.connectionError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title={t('companies.addCompany')}
        subtitle={t('companies.enterCompanyData')}
        icon={Building}
        actionButton={{
          text: t('navigation.backToList'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/companies'),
          variant: 'secondary'
        }}
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-blue-800 mb-1">{t('common.importantInfo')}</h3>
              <p className="text-sm text-blue-700">
                {t('common.requiredFieldsNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <Alert
            type={message.type}
            title={message.type === 'success' ? t('common.success') : t('common.error')}
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
              {t('common.basicInfo')}
            </h3>

            <div className="space-y-4">
              <Input
                label={t('companies.companyName')}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={t('companies.enterCompanyName')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.details')}
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder={t('companies.enterDetailsOptional')}
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
              {t('common.contactInfo')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('common.phone')}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="05xxxxxxxx"
              />

              <Input
                label={t('admin.email')}
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
              {t('common.addressInfo')}
            </h3>

            <Input
              label={t('profile.address')}
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t('companies.enterAddress')}
            />
          </Card>

          {/* Action Buttons */}
          <Card>
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/companies')}
                disabled={loading}
              >
                <ArrowRight size={18} className="ml-2" />
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                <Save size={18} className="ml-2" />
                {t('companies.saveCompany')}
              </Button>
            </div>
          </Card>
        </form>

        {/* Preview Card */}
        {formData.name && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('common.dataPreview')}</h3>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Building className="text-white" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{formData.name}</h4>
                  <p className="text-blue-100 text-sm">{t('companies.newCompany')}</p>
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