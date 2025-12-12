'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  User,
  AlertTriangle,
  RefreshCw,
  Package,
  Filter
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function PendingVehicleRequestsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, take, return, problem
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get('/api/temp/vehicles');
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading pending requests:', err);
      setErrorMessage(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (request, isApproved) => {
    setResolving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // resolution value (string)
      const resolutionValue = isApproved ? "Approved" : "Rejected";
      // Body to match backend schema
      const requestBody = {
        riderIqamaNo: parseInt(request?.riderIqamaNo),
        Resolution: resolutionValue,
        ResolvedBy: (request?.riderIqamaNo || "").toString(),   // Or logged-in user ID if available
        Plate: request.vehiclePlateNumber
      };

      // Query string (only note)
      const query = note ? `?note=${encodeURIComponent(note)}` : "";

      // POST instead of GET (should use POST when body exists)
      await ApiService.put(`/api/temp/vehicle-resolve${query}`, requestBody);

      setSuccessMessage(`${t('common.success')}: ${isApproved ? t('vehicles.approveRequest') : t('vehicles.rejectRequest')}`);
      setShowResolveModal(false);
      setSelectedRequest(null);
      setNote('');

      loadPendingRequests();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error resolving request:', err);
      setErrorMessage(err?.message || t('common.error'));
    } finally {
      setResolving(false);
    }
  };


  const openResolveModal = (request) => {
    setSelectedRequest(request);
    setNote('');
    setShowResolveModal(true);
  };

  const getOperationTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'taken': return t('vehicles.takeRequestLabel');
      case 'return': return t('vehicles.returnRequestLabel');
      case 'problem': return t('vehicles.problemReportLabel');
      default: return type;
    }
  };

  const getOperationTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'taken': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-600' };
      case 'return': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-600' };
      case 'problem': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-600' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-600' };
    }
  };

  const getOperationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'taken': return Car;
      case 'return': return RefreshCw;
      case 'problem': return AlertTriangle;
      default: return Package;
    }
  };

  const filteredRequests = pendingRequests.filter(req =>
    filterType === 'all' || req.operationType?.toLowerCase() === filterType
  );

  const stats = {
    total: pendingRequests.length,
    take: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'taken').length,
    return: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'return').length,
    problem: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'problem').length,
  };

  return (
    <div className="w-full">
      <PageHeader
        title={t('vehicles.pendingRequestsTitle')}
        subtitle={`${filteredRequests.length} ${t('vehicles.pendingRequestsSubtitle')}`}
        icon={ClipboardList}
        actionButton={{
          text: t('common.refresh'),
          icon: <RefreshCw size={18} />,
          onClick: loadPendingRequests,
          variant: 'secondary'
        }}
      />

      <div className="px-6 space-y-6">
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

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 mb-1">{t('vehicles.totalRequests')}</p>
                <p className="text-2xl font-bold text-purple-700">{stats.total}</p>
              </div>
              <ClipboardList className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 mb-1">{t('vehicles.takeRequests')}</p>
                <p className="text-2xl font-bold text-green-700">{stats.take}</p>
              </div>
              <Car className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 mb-1">{t('vehicles.returnRequests')}</p>
                <p className="text-2xl font-bold text-blue-700">{stats.return}</p>
              </div>
              <RefreshCw className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 mb-1">{t('vehicles.problemReports')}</p>
                <p className="text-2xl font-bold text-orange-700">{stats.problem}</p>
              </div>
              <AlertTriangle className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">{t('vehicles.filterRequests')}</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterType === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('common.all')} ({stats.total})
            </button>
            <button
              onClick={() => setFilterType('taken')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterType === 'taken'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('vehicles.statusTaken')} ({stats.take})
            </button>
            <button
              onClick={() => setFilterType('return')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterType === 'return'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('vehicles.returnRequests')} ({stats.return})
            </button>
            <button
              onClick={() => setFilterType('problem')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterType === 'problem'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('vehicles.statusProblem')} ({stats.problem})
            </button>
          </div>
        </Card>

        {/* Requests Grid */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {t('vehicles.requestsList')} ({filteredRequests.length})
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-gray-600">{t('vehicles.noPendingRequests')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request, index) => {
                const colors = getOperationTypeColor(request.operationType);
                const OperationIcon = getOperationIcon(request.operationType);

                return (
                  <div
                    key={index}
                    className={`border-2 ${colors.border} rounded-lg p-4 ${colors.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`bg-white p-2 rounded-lg`}>
                          <OperationIcon className={colors.text} size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{request.vehiclePlateNumber}</h4>
                          <p className={`text-xs ${colors.text}`}>
                            {getOperationTypeLabel(request.operationType)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 ${colors.badge} text-white rounded-full text-xs font-medium`}>
                        {t('vehicles.pending')}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={14} />
                        <span className="text-gray-600">{t('vehicles.iqamaNumber')}:</span>
                        <span className="font-medium">{request.riderIqamaNo}</span>
                      </div>

                      {request.requestedBy && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={14} />
                          <span className="text-gray-600">{t('vehicles.requester')}:</span>
                          <span className="font-medium">{request.requestedBy}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={14} />
                        <span className="text-gray-600">{t('common.date')}:</span>
                        <span className="text-xs font-medium">
                          {new Date(request.requestedAt || Date.now()).toLocaleString('en-Us')}
                        </span>
                      </div>

                      {request.reason && (
                        <div className="bg-white p-2 rounded mt-2">
                          <p className="text-xs text-gray-700">
                            <strong>{t('common.reason')}:</strong> {request.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        onClick={() => openResolveModal(request)}
                        variant="primary"
                        className="flex-1 text-sm"
                      >
                        <CheckCircle size={16} className="ml-1" />
                        {t('vehicles.review')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Resolve Modal */}
        {showResolveModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{t('vehicles.reviewRequestTitle')}</h2>
                  <button
                    onClick={() => {
                      setShowResolveModal(false);
                      setSelectedRequest(null);
                      setNote('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">{t('vehicles.requestDetails')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">{t('vehicles.operationType')}</p>
                        <p className="font-medium text-gray-800">
                          {getOperationTypeLabel(selectedRequest.operationType)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">{t('vehicles.plateNumber')}</p>
                        <p className="font-medium text-gray-800">{selectedRequest.vehiclePlateNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">{t('vehicles.employeeIqama')}</p>
                        <p className="font-medium text-gray-800">{selectedRequest.riderIqamaNo}</p>
                      </div>
                      {selectedRequest.requestedBy && (
                        <div>
                          <p className="text-gray-600 mb-1">{t('vehicles.requesterLabel')}</p>
                          <p className="font-medium text-gray-800">{selectedRequest.requestedBy}</p>
                        </div>
                      )}
                      {selectedRequest.reason && (
                        <div className="col-span-2">
                          <p className="text-gray-600 mb-1">{t('common.reason')}</p>
                          <p className="font-medium text-gray-800">{selectedRequest.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('vehicles.notesOptional')}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder={t('vehicles.notesPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      onClick={() => handleResolve(selectedRequest, false)}
                      loading={resolving}
                      disabled={resolving}
                      variant="secondary"
                      className="bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <XCircle size={18} className="ml-2" />
                      {t('vehicles.rejectRequest')}
                    </Button>
                    <Button
                      onClick={() => handleResolve(selectedRequest, true)}
                      loading={resolving}
                      disabled={resolving}
                    >
                      <CheckCircle size={18} className="ml-2" />
                      {t('vehicles.approveRequest')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}