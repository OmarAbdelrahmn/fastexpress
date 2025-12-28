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
import { useLanguage } from '@/lib/context/LanguageContext';
import { UserX, Search, ArrowRight, Send, User, AlertCircle } from 'lucide-react';

export default function RequestDisableEmployeePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchIqama, setSearchIqama] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [reason, setReason] = useState('');
  const [requestedBy, setRequestedBy] = useState('');

  const handleSearchEmployee = async () => {
    if (!searchIqama.trim()) {
      setErrorMessage(t('employees.enterIqamaRequired'));
      return;
    }

    setSearchLoading(true);
    setErrorMessage('');
    setEmployeeData(null);

    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.ONE(searchIqama));

      if (data) {
        const employee = data; // single returned object

        if (employee.status === 'disable') {
          setErrorMessage(t('employees.alreadyInactive'));
          return;
        }

        setEmployeeData(employee);
        setErrorMessage('');
      } else {
        setErrorMessage(t('employees.employeeNotFound'));
      }

    } catch (err) {
      console.error('Error searching employee:', err);
      setErrorMessage(err?.message || t('employees.searchEmployeeError'));
    } finally {
      setSearchLoading(false);
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeData) {
      setErrorMessage(t('employees.searchEmployeeFirst'));
      return;
    }

    if (!reason.trim()) {
      setErrorMessage(t('employees.enterReasonRequired'));
      return;
    }

    if (!requestedBy.trim()) {
      setErrorMessage(t('employees.enterRequesterName'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await ApiService.put(
        `/api/Temp/employee-request-disable/${employeeData.iqamaNo}?Reason=${encodeURIComponent(reason)}&RequestedBy=${encodeURIComponent(requestedBy)}`,
        {}
      );

      setSuccessMessage(t('employees.disableRequestSuccess'));

      setTimeout(() => {
        router.push('/employees/user');
      }, 2000);
    } catch (err) {
      console.error('Error submitting disable request:', err);
      setErrorMessage(err?.message || t('employees.requestSendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.requestDisableTitle')}
        subtitle={t('employees.requestDisableSubtitle')}
        icon={UserX}
        actionButton={{
          text: t('common.back'),
          icon: <ArrowRight size={18} />,
          onClick: () => router.push('/employees/user'),
          variant: 'secondary'
        }}
      />

      {/* Warning Message */}
      <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">{t('employees.disableWarning')}</h3>
            <p className="text-sm text-red-600">
              {t('employees.disableWarningText')}
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

      {/* Search Employee */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search size={20} />
          {t('employees.searchEmployee')}
        </h3>

        <div className="flex gap-3 mb-4">
          <Input
            label=""
            type="number"
            value={searchIqama}
            onChange={(e) => setSearchIqama(e.target.value)}
            placeholder={t('employees.enterIqamaNumber')}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchEmployee()}
          />
          <Button
            type="button"
            onClick={handleSearchEmployee}
            loading={searchLoading}
            disabled={searchLoading}
            className="mt-0"
          >
            <Search size={18} className="ml-2" />
            {t('common.search')}
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            {t('employees.searchActiveEmployee')}
          </p>
        </div>
      </Card>

      {/* Employee Information (if found) */}
      {employeeData && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            {t('employees.employeeInfo')}
          </h3>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                {t('employees.activeStatus')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-600 mb-1">{t('employees.iqamaNumber')}</p>
                <p className="font-bold text-gray-800">{employeeData.iqamaNo}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">{t('employees.nameArabic')}</p>
                <p className="font-bold text-gray-800">{employeeData.nameAR}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">{t('employees.nameEnglish')}</p>
                <p className="font-bold text-gray-800">{employeeData.nameEN}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">{t('employees.jobTitle')}</p>
                <p className="font-medium text-gray-800">{employeeData.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">{t('employees.country')}</p>
                <p className="font-medium text-gray-800">{employeeData.country}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-1">{t('employees.phone')}</p>
                <p className="font-medium text-gray-800">{employeeData.phone}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Request Form (only show if employee found) */}
      {employeeData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.requestDetails')}</h3>
            <div className="space-y-4">
              <Input
                label={t('employees.requesterName')}
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                required
                placeholder={t('employees.enterYourName')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('employees.disableReasonLabel')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  placeholder={t('employees.disableReasonPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>{t('employees.disableReasonNote')}</strong>
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEmployeeData(null);
                  setSearchIqama('');
                  setReason('');
                  setRequestedBy('');
                }}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                <Send size={18} className="ml-2" />
                {t('employees.sendRequestBtn')}
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Instructions */}
      {!employeeData && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.howToUse')}</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p>{t('employees.disableInstructions1')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p>{t('employees.disableInstructions2')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p>{t('employees.disableInstructions3')}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-100 p-1 rounded mt-0.5">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <p>{t('employees.disableInstructions4')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}