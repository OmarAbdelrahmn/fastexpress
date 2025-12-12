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
import { useLanguage } from '@/lib/context/LanguageContext';

function HousingCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
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
      setErrorMessage(t('housing.loadError'));
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
        await ApiService.put(`/api/housing/${editHousingName}`, {
          name: formData.name,
          address: formData.address,
          capacity: parseInt(formData.capacity),
          managerIqamaNo: formData.managerIqamaNo,
        });
        setSuccessMessage(t('housing.updateSuccess'));
      } else {
        await ApiService.post('/api/housing', {
          name: formData.name,
          address: formData.address,
          capacity: parseInt(formData.capacity),
          managerIqamaNo: formData.managerIqamaNo,
        });
        setSuccessMessage(t('housing.createSuccess'));
      }

      setTimeout(() => {
        router.push('/housing/manage');
      }, 1500);
    } catch (err) {
      console.error('Error saving housing:', err);
      if (err?.status === 409) {
        setErrorMessage(t('housing.duplicateError') || 'This housing already exists. Please use a different name.');
      } else if (err?.status === 400) {
        setErrorMessage(t('errors.generalError'));
      } else {
        setErrorMessage(err?.message || t('errors.generalError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? t('housing.editHousing') : t('housing.addHousing')}
        subtitle={isEditMode ? t('housing.editHousing') : t('housing.createHousing')}
        icon={Home}
        actionButton={{
          text: t('common.back'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/housing/manage'),
          variant: 'secondary'
        }}
      />

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title={t('common.success')}
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('housing.housingName')}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={t('housing.housingName')}
            />

            <Input
              label={t('housing.managerIqama')}
              type="text"
              name="managerIqamaNo"
              value={formData.managerIqamaNo}
              onChange={handleInputChange}
              required
              placeholder={t('housing.managerIqama')}
            />

            <Input
              label={t('housing.address')}
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder={t('housing.address')}
            />

            <Input
              label={t('housing.capacity')}
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
              placeholder={t('housing.capacity')}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <Save size={18} className="ml-2" />
              {isEditMode ? t('common.save') : t('housing.addHousing')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function HousingCreatePage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-6">{t('common.loading')}</div>}>
      <HousingCreateForm />
    </Suspense>
  );
}