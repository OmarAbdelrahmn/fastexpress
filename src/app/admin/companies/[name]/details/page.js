'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building, ArrowRight, Edit, Trash2, Mail, Phone, MapPin, FileText, Users } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyName = decodeURIComponent(params?.name || '');
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    if (companyName) {
      loadCompanyDetails();
    }
  }, [companyName]);

  const loadCompanyDetails = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      const companies = Array.isArray(data) ? data : [];
      const foundCompany = companies.find(c => c.name === companyName);

      if (foundCompany) {
        setCompany(foundCompany);
      } else {
        setErrorMessage(t('companies.companyNotFound'));
      }
    } catch (error) {
      setErrorMessage(t('companies.loadCompanyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('companies.confirmDeleteCompany', { name: companyName }))) return;

    try {
      await ApiService.delete(API_ENDPOINTS.COMPANY.DELETE(companyName));
      setMessage({ type: 'success', text: t('companies.deleteSuccess') });
      setTimeout(() => {
        router.push('/admin/companies');
      }, 2000);
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
        <PageHeader
          title={t('companies.companyDetails')}
          subtitle={t('common.loading')}
          icon={Building}
        />
        <div className="p-6">
          <Card>
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">{t('companies.loadingData')}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (errorMessage || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
        <PageHeader
          title={t('companies.companyDetails')}
          subtitle={t('riders.errorOccurred')}
          icon={Building}
          actionButton={{
            text: t('navigation.backToList'),
            icon: <ArrowRight size={18} />,
            onClick: () => router.push('/admin/companies'),
            variant: 'secondary'
          }}
        />
        <div className="p-6">
          <Alert
            type="error"
            title={t('common.error')}
            message={errorMessage || t('companies.companyNotFound')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title={company.name}
        subtitle={`${t('companies.companyCode')}: ${company.id}`}
        icon={Building}
        actionButton={{
          text: t('riders.editData'),
          icon: <Edit size={18} />,
          onClick: () => router.push(`/admin/companies/${encodeURIComponent(company.name)}/edit`),
        }}
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Company Header Card */}
        <Card>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 -m-6 mb-6 p-8 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <Building className="text-white" size={48} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{company.name}</h2>
                <p className="text-blue-100">{t('companies.activeCompany')}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <p className="text-blue-100 text-sm">{t('companies.companyCode')}</p>
                <p className="text-white text-2xl font-bold">{company.id}</p>
              </div>
            </div>
          </div>

          {company.details && (
            <div className="bg-blue-50 p-5 rounded-lg border-r-4 border-blue-500">
              <div className="flex items-start gap-3">
                <FileText className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-blue-800 mb-2">{t('companies.companyDetails')}</h3>
                  <p className="text-gray-700 leading-relaxed">{company.details}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Contact Information */}
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Phone className="text-green-600" size={24} />
            {t('companies.contactInfo')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.phone ? (
              <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="text-green-600" size={20} />
                  </div>
                  <p className="text-sm text-green-600 font-medium">{t('common.phone')}</p>
                </div>
                <p className="text-lg font-bold text-gray-800 mr-11">{company.phone}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 p-5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  <p className="text-gray-500">{t('companies.noPhoneNumber')}</p>
                </div>
              </div>
            )}

            {company.email ? (
              <div className="bg-purple-50 border-2 border-purple-200 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="text-purple-600" size={20} />
                  </div>
                  <p className="text-sm text-purple-600 font-medium">{t('common.email')}</p>
                </div>
                <p className="text-lg font-bold text-gray-800 mr-11 break-all">{company.email}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 p-5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <p className="text-gray-500">{t('companies.noEmail')}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Address Information */}
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="text-orange-600" size={24} />
            {t('companies.address')}
          </h3>

          {company.address ? (
            <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <MapPin className="text-orange-600" size={28} />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-2">{t('companies.companyAddress')}</p>
                  <p className="text-lg text-gray-800 leading-relaxed">{company.address}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl text-center">
              <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">{t('companies.noAddress')}</p>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.quickActions')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={() => router.push(`/admin/companies/${encodeURIComponent(company.name)}/edit`)}
              variant="secondary"
            >
              <Edit size={18} className="ml-2" />
              {t('riders.editData')}
            </Button>
            <Button
              onClick={() => router.push('/admin/companies')}
              variant="secondary"
            >
              <ArrowRight size={18} className="ml-2" />
              {t('navigation.backToList')}
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={18} className="ml-2" />
              {t('companies.deleteCompany')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}