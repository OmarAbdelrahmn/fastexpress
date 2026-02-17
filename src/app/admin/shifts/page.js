'use client';

import { useState, useEffect } from 'react';
import { Calendar, Upload, FileSpreadsheet, Trash2, AlertCircle, CheckCircle, XCircle, FileText, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useLanguage } from '@/lib/context/LanguageContext';

const API_BASE = 'https://fastexpress.tryasp.net/api';

export default function ShiftsPage() {
  const { t } = useLanguage();
  const [shifts, setShifts] = useState([]);

  // FIX: Initialize with empty string to match server/client
  const [selectedDate, setSelectedDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [importResult, setImportResult] = useState(null);
  const [showImportDetails, setShowImportDetails] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');


  const normalizeServerDate = (value) => {
    // null/undefined
    if (value === null || value === undefined || value === '') return null;

    // If server already returned a Date string
    if (typeof value === 'string') {
      // handle .NET default min value or other sentinel values
      if (value.startsWith('0001') || value.startsWith('0000')) return null;
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // If server returned a Date-only object { year, month, day }
    if (typeof value === 'object') {
      // Some backends return DateOnly as { year, month, day } or { Year, Month, Day }
      const year = value.year ?? value.Year;
      const month = value.month ?? value.Month;
      const day = value.day ?? value.Day;

      if (!year || Number(year) <= 1) return null; // treat year 1 as empty
      try {
        // month in JS Date is 0-based
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        return isNaN(d.getTime()) ? null : d;
      } catch {
        return null;
      }
    }

    // unknown format
    return null;
  };

  // replace your formatDate with this (it accepts string/object/Date)
  const formatDate = (d) =>
    new Date(d).toISOString().substring(0, 10);



  const safeRender = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') return fallback;
    return value;
  };

  // FIX: Set the date only on client side after hydration
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      setSelectedDate(dateStr);
    }
  }, [selectedDate]);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadShifts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.SHIFT.BY_DATE, {
        shiftDate: selectedDate
      });

      setShifts(Array.isArray(data) ? data : []);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: t('shifts.loadError') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedDate) loadShifts();
  }, [selectedDate]);

  const handleImport = async () => {
    try {
      if (!uploadFile) {
        setMessage({ type: 'error', text: t('shifts.selectFile') });
        return;
      }

      // Validate date format
      if (!selectedDate || selectedDate === '') {
        setMessage({ type: 'error', text: t('shifts.selectDate') });
        return;
      }

      setLoading(true);
      setImportResult(null);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('excelFile', uploadFile);

      const token = TokenManager.getToken();

      const dateStr = String(selectedDate).split('T')[0];
      const url = `${API_BASE}/shift/import?ShiftDate=${dateStr}`;


      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });



      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        setShowImportDetails(true);

        const successCount = result.successCount || 0;
        const conflictCount = result.conflictCount || 0;
        const totalRecords = result.totalRecords || 0;

        if (conflictCount > 0) {
          setMessage({
            type: 'warning',
            text: `${t('shifts.importSuccess')}: ${successCount}. ${t('shifts.conflicts')}: ${conflictCount}`
          });
        } else {
          setMessage({
            type: 'success',
            text: `${t('shifts.importSuccess')}: ${successCount} / ${totalRecords}`
          });
        }

        setUploadFile(null);
        await loadShifts();
      } else {
        console.error('Server Error:', result);
        const errorMsg = result.title || result.message || result.error || t('shifts.importError');
        setMessage({
          type: 'error',
          text: String(errorMsg)
        });
      }
    } catch (error) {
      console.error('Exception caught:', error);
      console.error('Error stack:', error.stack);
      setMessage({
        type: 'error',
        text: `${t('shifts.importError')}: ${error.message || t('errors.generalError')}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDate = async () => {
    if (!selectedCompanyId) {
      setMessage({ type: 'error', text: t('riders.selectCompany') || 'Please select a company' });
      return;
    }

    const company = companies.find(c => String(c.id) === String(selectedCompanyId));
    const confirmMsg = `${t('shifts.confirmDelete')} (${company?.name || selectedCompanyId})`;

    setShowPasswordModal(true);
    setDeletePassword(''); // Reset password field
  };

  const handleConfirmDelete = async () => {
    if (deletePassword !== '2222') {
      alert(t('common.incorrectPassword') || 'Incorrect Password');
      return;
    }

    setShowPasswordModal(false);

    setLoading(true);
    try {
      const result = await ApiService.delete(API_ENDPOINTS.SHIFT.DELETE_BY_DATE, {
        shiftDate: selectedDate,
        companyId: selectedCompanyId
      });
      const totalDeleted = result.totalDeleted || 0;
      setMessage({
        type: 'success',
        text: `${t('shifts.deleteSuccess')}: ${totalDeleted}`
      });
      loadShifts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('shifts.deleteError') });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Incomplete': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Average': 'bg-blue-100 text-blue-800 border-blue-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200',
      'Absent': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredShifts = selectedCompanyId
    ? shifts.filter(shift => {
      const company = companies.find(c => String(c.id) === String(selectedCompanyId));
      return shift.companyName === company?.name;
    })
    : shifts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <PageHeader
        title={t('shifts.manageShifts')}
        subtitle={t('shifts.subtitle')}
        icon={Calendar}
      />

      <div className="p-6 space-y-6">
        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> :
              message.type === 'warning' ? <AlertCircle size={20} /> :
                <XCircle size={20} />}
            <span className="flex-1">{String(message.text)}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70">✕</button>
          </div>
        )}

        {/* Import Result Details */}
        {importResult && showImportDetails && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} />
                {t('shifts.importDetails')}
              </h3>
              <button
                onClick={() => setShowImportDetails(false)}
                className="text-white hover:bg-white/20 rounded p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-600 text-sm mb-1">{t('shifts.totalRecords')}</p>
                  <p className="text-3xl font-bold text-blue-700">{safeRender(importResult.totalRecords, 0)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-green-600 text-sm mb-1">{t('shifts.successfulImports')}</p>
                  <p className="text-3xl font-bold text-green-700">{safeRender(importResult.successCount, 0)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-600 text-sm mb-1">{t('shifts.errors')}</p>
                  <p className="text-3xl font-bold text-red-700">{safeRender(importResult.errorCount, 0)}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-600 text-sm mb-1">{t('shifts.conflicts')}</p>
                  <p className="text-3xl font-bold text-yellow-700">{safeRender(importResult.conflictCount, 0)}</p>
                </div>
              </div>

              {/* Errors List */}
              {importResult.errors && Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                      <XCircle size={18} />
                      {t('shifts.errors')} ({importResult.errors.length})
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-red-100">
                      <thead className="bg-red-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-red-700">{t('shifts.row')}</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-red-700">{t('riders.workingId')}</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-red-700">{t('common.error')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {importResult.errors.map((error, index) => (
                          <tr key={index} className="hover:bg-red-50">
                            <td className="px-4 py-2 text-sm text-red-600 font-medium">{safeRender(error.rowNumber)}</td>
                            <td className="px-4 py-2 text-sm text-red-700">{safeRender(error.workingId)}</td>
                            <td className="px-4 py-2 text-sm text-red-800">{safeRender(error.message)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conflicts List */}
              {importResult.conflicts && Array.isArray(importResult.conflicts) && importResult.conflicts.length > 0 && (
                <div className="border border-yellow-200 rounded-lg overflow-hidden">
                  <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                    <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                      <AlertCircle size={18} />
                      {t('shifts.conflicts')} ({importResult.conflicts.length})
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-yellow-100">
                      <thead className="bg-yellow-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">{t('riders.title')}</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">{t('shifts.date')}</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">{t('shifts.existingData')}</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">{t('shifts.newData')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-yellow-100">
                        {importResult.conflicts.map((conflict, index) => (
                          <tr key={index} className="hover:bg-yellow-50">
                            <td className="px-4 py-2 text-sm">
                              <div className="font-medium text-yellow-800">{safeRender(conflict.riderName)}</div>
                              <div className="text-xs text-yellow-600">{safeRender(conflict.companyName)}</div>
                            </td>
                            <td className="px-4 py-2 text-sm text-yellow-700">
                              {formatDate(conflict.shiftDate)}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="text-yellow-700">{t('shifts.orders')}: {safeRender(conflict.existingShift?.acceptedOrders, 0)}</div>
                              <div className="text-yellow-600">{t('shifts.rejected')}: {safeRender(conflict.existingShift?.rejectedOrders, 0)}</div>
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="text-yellow-700">{t('shifts.orders')}: {safeRender(conflict.newShift?.acceptedOrders, 0)}</div>
                              <div className="text-yellow-600">{t('shifts.rejected')}: {safeRender(conflict.newShift?.rejectedOrders, 0)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-wrap items-end gap-4">
            {/* Company Selection */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('riders.company')}</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('riders.selectCompany')}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.date')}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.excelFile')}</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                disabled={loading || !uploadFile}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium whitespace-nowrap"
              >
                <Upload size={18} />
                {t('shifts.import')}
              </button>
              <button
                onClick={loadShifts}
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                title={t('common.refresh') || 'Refresh'}
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={handleDeleteDate}
                disabled={loading}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                title={t('common.delete') || 'Delete'}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              {t('shifts.shiftsForDate')} - {selectedDate} ({filteredShifts.length} {t('shifts.shift')})
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-gray-300" />
                {t('shifts.noShifts')}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.riderName')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('companies.title')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.acceptedOrders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.rejectedOrders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.stackedDeliveries')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.workingHours')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShifts.map((shift, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{safeRender(shift.workingId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{safeRender(shift.riderName)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{safeRender(shift.companyName)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {safeRender(shift.acceptedDailyOrders, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-600 font-semibold">{safeRender(shift.rejectedDailyOrders, 0)}</div>
                        {shift.realRejectedDailyOrders > 0 && (
                          <div className="text-xs text-red-500">{t('shifts.actual')}: {safeRender(shift.realRejectedDailyOrders, 0)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-purple-600">{safeRender(shift.stackedDeliveries, 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shift.workingHours ? Number(shift.workingHours).toFixed(1) : '0.0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shift.shiftStatus)}`}>
                          {safeRender(shift.shiftStatus)}
                        </span>
                        {shift.hasRejectionProblem && (
                          <div className="text-xs text-red-600 mt-1">{t('shifts.penalty')}: {safeRender(shift.penaltyAmount, 0)}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-[90%]">
            <h3 className="text-xl font-bold mb-4">{t('common.enterPassword') || 'Enter Password'}</h3>
            <p className="text-gray-600 mb-4">
              {t('shifts.confirmDeleteMessage') || 'Please enter the password to confirm deletion.'}
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={t('common.password') || 'Password'}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('common.confirm') || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}