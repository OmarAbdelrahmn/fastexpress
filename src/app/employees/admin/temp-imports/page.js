'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

export default function TempImportsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [processLoading, setProcessLoading] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadPendingUpdates();
  }, []);

  const loadPendingUpdates = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get('/api/Temp/employees');
      setPendingUpdates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading pending updates:', err);
      setErrorMessage(err?.message || t('employees.errorLoadingTempData'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm(t('employees.confirmApproveAll'))) return;

    setProcessLoading(true);
    try {
      await ApiService.put('/api/Temp/employees', {
        resolution: 'Approved',
        resolvedBy: 'Admin'
      });

      setSuccessMessage(t('employees.approveAllSuccess'));
      setTimeout(() => {
        router.push('/employees/admin');
      }, 2000);
    } catch (err) {
      console.error('Error approving updates:', err);
      setErrorMessage(err?.message || t('employees.approveAllError'));
    } finally {
      setProcessLoading(false);
    }
  };

  const handleRejectAll = async () => {
    if (!confirm(t('employees.confirmRejectAll'))) return;

    setProcessLoading(true);
    try {
      await ApiService.put('/api/Temp/employees', {
        resolution: 'Rejected',
        resolvedBy: 'Admin'
      });

      setSuccessMessage(t('employees.rejectAllSuccess'));
      loadPendingUpdates();
    } catch (err) {
      console.error('Error rejecting updates:', err);
      setErrorMessage(err?.message || t('employees.rejectAllError'));
    } finally {
      setProcessLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('employees.tempDataTitle')}
          subtitle={t('common.loading')}
          icon={Clock}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('employees.loadingTempData')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.tempDataFromExcel')}
        subtitle={`${t('employees.pendingUpdatesCount')}: ${pendingUpdates.length}`}
        icon={Clock}
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

      {pendingUpdates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t('employees.noPendingUpdates')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('employees.allUpdatesProcessed')}
            </p>
            <Button onClick={() => router.push('/employees/admin/import-excel')}>
              {t('employees.importNewFile')}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Action Buttons */}
          <Card>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleRejectAll}
                variant="secondary"
                loading={processLoading}
                disabled={processLoading}
              >
                <XCircle size={18} className="ml-2" />
                {t('employees.rejectAll')}
              </Button>
              <Button
                onClick={handleApproveAll}
                loading={processLoading}
                disabled={processLoading}
              >
                <CheckCircle size={18} className="ml-2" />
                {t('employees.approveAll')}
              </Button>
            </div>
          </Card>

          {/* Pending Updates List */}
          <div className="space-y-4">
            {pendingUpdates.map((update) => (
              <Card key={update.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${update.isNewEmployee ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                      <User className={update.isNewEmployee ? 'text-green-600' : 'text-blue-600'} size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {update.employeeNameAR} - {update.employeeNameEN}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('employees.iqamaNumber')}: {update.iqamaNo}
                      </p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${update.isNewEmployee
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {update.isNewEmployee ? t('employees.newEmployee') : t('employees.dataUpdate')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{t('employees.uploadedBy')}: {update.uploadedBy}</p>
                    <p className="text-xs mt-1">
                      {new Date(update.uploadedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>

                {update.changes && update.changes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-700 mb-3">{t('employees.proposedChanges')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {update.changes.map((change, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-sm font-bold text-gray-800 mb-2">{change.fieldName}</p>
                          <div className="flex items-center gap-2 text-xs">
                            {change.oldValue && (
                              <>
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                  {t('employees.oldValue')}: {change.oldValue}
                                </span>
                                <span>→</span>
                              </>
                            )}
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {change.oldValue ? `${t('employees.newValue')}: ` : ''}{change.newValue}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Information Card */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('common.additionalInfo')}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.approve')}:</strong> {t('employees.approvalInfo')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.reject')}:</strong> {t('employees.rejectionInfo')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <AlertCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.newEmployee')}:</strong> {t('employees.newDataInfo')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}