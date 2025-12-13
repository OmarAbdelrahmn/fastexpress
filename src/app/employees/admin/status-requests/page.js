'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AlertCircle, CheckCircle, XCircle, User, Clock } from 'lucide-react';

export default function StatusRequestsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get('/api/Temp/employee-pending-status-changes');
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading status requests:', err);
      setErrorMessage(err?.message || t('employees.errorLoadingRequests'));
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (iqamaNo, resolution, adminNotes = '') => {
    const confirmMessage = resolution === 'Approved'
      ? t('employees.confirmApprove')
      : t('employees.confirmReject');
    if (!confirm(confirmMessage)) return;

    setProcessingId(iqamaNo);
    try {
      await ApiService.post('/api/Temp/employee-resolve-status-changes', {
        iqamaNo: iqamaNo,
        resolution: resolution,
        resolvedBy: 'Admin',
        adminNot: adminNotes
      });

      const successMsg = resolution === 'Approved'
        ? t('employees.approveSuccess')
        : t('employees.rejectSuccess');
      setSuccessMessage(successMsg);
      loadPendingRequests();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error resolving request:', err);
      setErrorMessage(err?.message || t('employees.resolveError'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('employees.statusRequestsTitle')}
          subtitle={t('common.loading')}
          icon={AlertCircle}
        />
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{t('employees.loadingRequests')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.statusRequestsTitle')}
        subtitle={`${t('employees.statusRequestsSubtitle')}: ${pendingRequests.length}`}
        icon={AlertCircle}
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

      {pendingRequests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t('employees.noPendingRequests')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('employees.allRequestsProcessed')}
            </p>
            <Button onClick={() => router.push('/employees/admin')}>
              {t('employees.backToMainList')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${request.action === 'enable' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <User className={request.action === 'enable' ? 'text-green-600' : 'text-red-600'} size={28} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {request.employeeNameAR}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {t('employees.statusChangeRequest')}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {request.employeeNameEN}
                    </p>

                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-600">{t('employees.fromStatus')}</span>
                        <div className="mt-1">
                          <StatusBadge status={request.currentStatus} />
                        </div>
                      </div>
                      <div className="text-gray-400">←</div>
                      <div>
                        <span className="text-xs text-gray-600">{t('employees.toStatus')}</span>
                        <div className="mt-1">
                          <StatusBadge status={request.requestedStatus} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">{t('employees.iqamaNumber')}</p>
                        <p className="font-bold text-gray-800">{request.employeeIqamaNo}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">{t('employees.requestDate')}</p>
                        <p className="font-medium text-gray-800 flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(request.requestedAt).toLocaleString(language === 'ar' ? 'en-US' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-3">
                        <p className="text-sm font-bold text-blue-800 mb-1">{t('employees.requestReason')}</p>
                        <p className="text-sm text-blue-700">{request.reason}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} />
                      <span>{t('employees.requestedBy')}: {request.requestedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mr-4">
                  <Button
                    onClick={() => handleResolve(request.employeeIqamaNo, 'Approved')}
                    disabled={processingId === request.employeeIqamaNo}
                    loading={processingId === request.employeeIqamaNo}
                    className="whitespace-nowrap"
                  >
                    <CheckCircle size={18} className="ml-2" />
                    {t('employees.approve')}
                  </Button>
                  <Button
                    onClick={() => handleResolve(request.employeeIqamaNo, 'Rejected')}
                    variant="secondary"
                    disabled={processingId === request.employeeIqamaNo}
                    className="whitespace-nowrap"
                  >
                    <XCircle size={18} className="ml-2" />
                    {t('employees.reject')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Information Card */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('common.additionalInfo')}</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 p-1 rounded mt-0.5">
              <CheckCircle size={14} className="text-blue-600" />
            </div>
            <p>
              <strong>{t('employees.approve')}:</strong> {t('employees.statusChangeInfo')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="bg-red-100 p-1 rounded mt-0.5">
              <XCircle size={14} className="text-red-600" />
            </div>
            <p>
              <strong>{t('employees.reject')}:</strong> {t('employees.rejectionInfoStatus')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}