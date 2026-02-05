'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
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
  Filter,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatPlateNumber } from "@/lib/utils/formatters";

export default function PendingVehicleRequestsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, take, return, problem, switched
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [permission, setPermission] = useState('');
  const [permissionEndDate, setPermissionEndDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get('/api/temp/vehicles');
      console.log(data);

      let requests = Array.isArray(data) ? data : [];

      // Enhance switched requests with new vehicle info
      const enhancedRequests = await Promise.all(requests.map(async (req) => {
        if (req.operationType?.toLowerCase() === 'switched' && req.vehicleNumber) {
          try {
            // New vehicle info is stored in vehicleNumber for switched requests
            // We need to fetch the plate number for the NEW vehicle
            const newVehicleData = await ApiService.get(API_ENDPOINTS.VEHICLES.BY_CHASE(req.vehicleNumber));
            console.log(newVehicleData);
            return {
              ...req,
              newVehiclePlate: newVehicleData[0]?.plateNumberA || 'Unknown'
            };
          } catch (error) {
            console.error(`Error fetching new vehicle info for ${req.vehicleNumber}:`, error);
            return {
              ...req,
              newVehiclePlate: 'Unknown'
            };
          }
        }
        return req;
      }));

      setPendingRequests(enhancedRequests);
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
    setFieldErrors({});

    const errors = {};
    if (isApproved && (request.operationType?.toLowerCase() === 'taken' || request.operationType?.toLowerCase() === 'switched')) {
      if (!permission) {
        errors.permission = t('vehicles.permissionRequired');
      }
      if (!permissionEndDate) {
        errors.permissionEndDate = t('vehicles.permissionEndDateRequired');
      } else {
        const selectedDate = new Date(permissionEndDate);
        const now = new Date();
        selectedDate.setHours(23, 59, 59, 999);

        if (selectedDate <= now) {
          errors.permissionEndDate = t('vehicles.permissionDateFuture');
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setResolving(false);
      return;
    }

    try {
      const resolutionValue = isApproved ? "Approved" : "Rejected";
      let successMsg = "";

      if (request.operationType?.toLowerCase() === 'switched') {
        // Special handling for switch requests
        const payload = {
          operationId: request.id,
          resolution: resolutionValue,
          resolvedBy: "Omar", // Identifying user context if available
          note: note || "",
          permission: isApproved ? permission : null,
          permissionEndDate: isApproved ? new Date(`${permissionEndDate}T23:59:59.999`).toISOString() : null
        };

        await ApiService.post(API_ENDPOINTS.VEHICLES.RESOLVE_SWITCH, payload);
        successMsg = t('vehicles.switchRequestSent');

      } else {
        // Standard handling for other requests
        let permissionValue = "";
        let permissionEndDateValue = null;

        if (
          isApproved &&
          request?.operationType?.toLowerCase() === 'taken'
        ) {
          permissionValue = permission;
          permissionEndDateValue = new Date(
            `${permissionEndDate}T23:59:59.999`
          ).toISOString();
        }

        const payload = {
          riderIqamaNo: Number(request.riderIqamaNo),
          resolution: resolutionValue,
          resolvedBy: "Omar",
          plate: request?.vehiclePlateNumber,
          note: note || "",
          permission: isApproved ? permissionValue : null,
          permissionEndDate: permissionEndDateValue ?? null
        };

        await ApiService.put(`/api/temp/vehicle-resolve`, payload);

        successMsg = isApproved ? t('vehicles.approveRequest') : t('vehicles.rejectRequest');
      }

      setSuccessMessage(`${t('common.success')}: ${successMsg}`);

      setShowResolveModal(false);
      setSelectedRequest(null);
      setNote('');
      setPermission('');
      setPermissionEndDate('');
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
    setPermission(''); // Reset fields
    setPermissionEndDate('');
    setFieldErrors({});
    setShowResolveModal(true);
  };

  const getOperationTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'taken': return t('vehicles.takeRequestLabel');
      case 'returned': return t('vehicles.returnRequestLabel');
      case 'problem': return t('vehicles.problemReportLabel');
      case 'switched': return t('vehicles.switchVehicle');
      default: return type;
    }
  };

  const getOperationTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'taken': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-600' };
      case 'returned': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-600' };
      case 'problem': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-600' };
      case 'switched': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-600' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-600' };
    }
  };

  const getOperationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'taken': return Car;
      case 'returned': return RefreshCw;
      case 'problem': return AlertTriangle;
      case 'switched': return ArrowRight;
      default: return Package;
    }
  };

  const filteredRequests = pendingRequests.filter(req =>
    filterType === 'all' || req.operationType?.toLowerCase() === filterType
  );

  const stats = {
    total: pendingRequests.length,
    take: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'taken').length,
    return: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'returned').length,
    problem: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'problem').length,
    switched: pendingRequests.filter(r => r.operationType?.toLowerCase() === 'switched').length,
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-4">
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

          <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 mb-1">{t('vehicles.switchVehicle')}</p>
                <p className="text-2xl font-bold text-purple-700">{stats.switched}</p>
              </div>
              <RefreshCw className="text-purple-500" size={32} />
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
              onClick={() => setFilterType('returned')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterType === 'returned'
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
            <button
              onClick={() => setFilterType('switched')}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterType === 'switched'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('vehicles.switchVehicle')} ({stats.switched})
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
                const isSwitched = request.operationType?.toLowerCase() === 'switched';

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
                          {isSwitched ? (
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-800 line-through text-sm opacity-60">
                                {formatPlateNumber(request.newVehiclePlate)}
                              </h4>
                              <ArrowLeft size={14} className="text-gray-400" />
                              <h4 className="font-bold text-gray-800 border-b-2 border-purple-500 pb-0.5">
                                {formatPlateNumber(request.vehiclePlateNumber)}
                              </h4>
                            </div>
                          ) : (
                            <h4 className="font-bold text-gray-800">{formatPlateNumber(request.vehiclePlateNumber)}</h4>
                          )}

                          <p className={`text-xs ${colors.text} mt-1`}>
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
        {/* Resolve Modal - Visual Overhaul */}
        {showResolveModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">

              {/* Header */}
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{t('vehicles.reviewRequestTitle')}</h2>
                  <p className="text-gray-500 text-sm mt-1">Review the details below and take action</p>
                </div>
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedRequest(null);
                    setNote('');
                  }}
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shadow-sm border border-gray-100"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8">
                {/* Vehicle & Rider Info Block */}
                <div className="flex gap-6 mb-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('vehicles.requestDetails')}</p>
                    <div className="space-y-4">

                      {selectedRequest.operationType?.toLowerCase() === 'switched' ? (
                        <>
                          <div className="flex justify-between items-center bg-red-50 p-2 rounded">
                            <span className="text-gray-600 text-xs">{t('vehicles.returnRequestLabel')}</span>
                            <span className="font-bold text-gray-800 font-mono text-base line-through opacity-70">
                              {formatPlateNumber(selectedRequest.newVehiclePlate)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                            <span className="text-gray-600 text-xs">{t('vehicles.takeRequestLabel')}</span>
                            <span className="font-bold text-gray-800 font-mono text-lg">
                              {formatPlateNumber(selectedRequest.vehiclePlateNumber)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('vehicles.plateNumber')}</span>
                          <span className="font-bold text-gray-800 font-mono text-lg bg-gray-50 px-2 py-1 rounded">
                              {formatPlateNumber(selectedRequest.vehiclePlateNumber)}
                          </span>
                        </div>
                      )}


                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('vehicles.employeeIqama')}</span>
                        <span className="font-bold text-gray-800 font-mono">{selectedRequest.riderIqamaNo}</span>
                      </div>
                      {selectedRequest.requestedBy && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('vehicles.requester')}</span>
                          <span className="font-bold text-gray-800 font-mono">{selectedRequest.requestedBy}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('vehicles.operationType')}</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-xs ${getOperationTypeColor(selectedRequest.operationType).bg} ${getOperationTypeColor(selectedRequest.operationType).text}`}>
                          {getOperationTypeLabel(selectedRequest.operationType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Separator */}
                  <div className="w-px bg-gray-100"></div>

                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    {selectedRequest.reason ? (
                      <>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('common.reason')}</p>
                        <p className="text-gray-700 italic">"{selectedRequest.reason}"</p>
                      </>
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center justify-center h-full">
                        <Package size={48} className="mb-2 opacity-20" />
                        <span className="text-sm">No additional notes provided</span>
                      </div>
                    )}
                  </div>
                </div>


                {/* Action Form */}
                <div className="space-y-6">
                  {(selectedRequest.operationType?.toLowerCase() === 'taken' || selectedRequest.operationType?.toLowerCase() === 'switched') && (
                    <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-2xl">
                      <h3 className="text-purple-800 font-bold mb-4 flex items-center gap-2">
                        <CheckCircle size={18} /> {t('vehicles.approvalRequirements')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                            {t('vehicles.permission')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={permission}
                            onChange={(e) => {
                              setPermission(e.target.value);
                              if (fieldErrors.permission) setFieldErrors({ ...fieldErrors, permission: null });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none ${fieldErrors.permission ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                            placeholder="e.g. Monthly Delivery Authorization"
                          />
                          {fieldErrors.permission && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.permission}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                            {t('vehicles.permissionEndDate')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={permissionEndDate}
                            onChange={(e) => {
                              setPermissionEndDate(e.target.value);
                              if (fieldErrors.permissionEndDate) setFieldErrors({ ...fieldErrors, permissionEndDate: null });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none ${fieldErrors.permissionEndDate ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                          />
                          {fieldErrors.permissionEndDate && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.permissionEndDate}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                      {t('vehicles.notesOptional')}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder={t('vehicles.notesPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 justify-end pt-8 mt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleResolve(selectedRequest, false)}
                    loading={resolving}
                    disabled={resolving}
                    variant="secondary"
                    className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-transparent px-8 py-3 h-auto text-base rounded-xl"
                  >
                    <XCircle size={20} className="mr-2" />
                    {t('vehicles.rejectRequest')}
                  </Button>
                  <Button
                    onClick={() => handleResolve(selectedRequest, true)}
                    loading={resolving}
                    disabled={resolving}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 h-auto text-base rounded-xl shadow-lg shadow-purple-200"
                  >
                    <CheckCircle size={20} className="mr-2" />
                    {t('vehicles.approveRequest')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
