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
import { Package, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ChangeWorkingIdPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    oldWorkingId: '',
    newWorkingId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.oldWorkingId || !formData.newWorkingId) {
      setErrorMessage(t('riders.enterBothNumbers'));
      return;
    }

    if (formData.oldWorkingId === formData.newWorkingId) {
      setErrorMessage(t('riders.newMustBeDifferent'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await ApiService.post(API_ENDPOINTS.RIDER.CHANGE_WORKING_ID, null, {
        oldWorkingId: formData.oldWorkingId,
        newWorkingId: formData.newWorkingId
      });

      setSuccessMessage(t('riders.workingIdChangedSuccess'));
      setTimeout(() => {
        setFormData({ oldWorkingId: '', newWorkingId: '' });
        router.push('/admin/riders');
      }, 2000);
    } catch (err) {
      console.error('Error changing working ID:', err);
      setErrorMessage(err?.message || t('riders.workingIdChangeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('riders.changeWorkingIdTitle')}
        subtitle={t('riders.changeWorkingIdSubtitle')}
        icon={Package}
        actionButton={{
          text: t('navigation.backToList'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/admin/riders'),
          variant: 'secondary'
        }}
      />

      {/* Warning Message */}
      <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">{t('riders.importantWarning')}</h3>
            <p className="text-sm text-yellow-600">
              {t('riders.changeWorkingIdWarning')}
            </p>
          </div>
        </div>
      </div>

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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">{t('riders.howToChange')}</h3>
            <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
              <li>{t('riders.enterCurrentWorkingId')}</li>
              <li>{t('riders.enterNewWorkingId')}</li>
              <li>{t('riders.ensureUniqueWorkingId')}</li>
              <li>{t('riders.recordsWillUpdate')}</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label={t('riders.currentWorkingId')}
                type="text"
                name="oldWorkingId"
                value={formData.oldWorkingId}
                onChange={handleInputChange}
                required
                placeholder={t('riders.enterCurrentWorkingIdPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('riders.currentWorkingIdHint')}
              </p>
            </div>

            <div>
              <Input
                label={t('riders.newWorkingId')}
                type="text"
                name="newWorkingId"
                value={formData.newWorkingId}
                onChange={handleInputChange}
                required
                placeholder={t('riders.enterNewWorkingIdPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('riders.newWorkingIdHint')}
              </p>
            </div>
          </div>

          {/* Confirmation Section */}
          {formData.oldWorkingId && formData.newWorkingId && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <h4 className="font-bold text-green-800">{t('riders.changePreview')}</h4>
              </div>
              <p className="text-sm text-green-700">
                {t('riders.workingIdWillChange')} <strong className="text-green-800">{formData.oldWorkingId}</strong> → <strong className="text-green-800">{formData.newWorkingId}</strong>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/admin/riders')}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              <CheckCircle size={18} className="ml-2" />
              {t('riders.confirmChange')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Information Card */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('riders.additionalInfo')}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('shifts.title')}:</strong> {t('riders.shiftsNote').split(':')[1]}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('reports.title')}:</strong> {t('riders.reportsNote').split(':')[1]}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('riders.iqamaNumber')}:</strong> {t('riders.recordsNote').split(':')[1]}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}