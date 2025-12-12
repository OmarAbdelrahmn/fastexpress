'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, Clock, CheckCircle, XCircle, History, Users, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const API_BASE = "https://fastexpress.tryasp.net/api";

export default function SubstitutionsPage() {
  const { t, locale } = useLanguage();
  const [substitutions, setSubstitutions] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });

  const [formData, setFormData] = useState({
    actualRiderWorkingId: '',
    substituteWorkingId: '',
    reason: '',
    createdBy: ''
  });

  const loadSubstitutions = async () => {
    setLoading(true);
    try {
      let endpoint;

      switch (filter) {
        case 'active':
          endpoint = API_ENDPOINTS.SUBSTITUTION.ACTIVE;
          break;
        case 'inactive':
          endpoint = API_ENDPOINTS.SUBSTITUTION.INACTIVE;
          break;
        default:
          endpoint = API_ENDPOINTS.SUBSTITUTION.LIST;
      }

      const data = await ApiService.get(endpoint);

      setSubstitutions(Array.isArray(data) ? data : []);
      updateStats(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('substitution.connectionError') });
      setSubstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const active = data.filter(s => s.isActive).length;
    const inactive = data.filter(s => !s.isActive).length;
    setStats({ active, inactive, total: data.length });
  };

  useEffect(() => {
    loadSubstitutions();
  }, [filter]);

  const handleStop = async (workingId) => {
    if (!confirm(t('substitution.confirmStop'))) return;

    try {
      const data = await ApiService.put(API_ENDPOINTS.SUBSTITUTION.STOP(workingId));

      setMessage({ type: 'success', text: t('substitution.stopSuccess') });
      loadSubstitutions();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('substitution.connectionError') });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const requestPayload = {
        actualRiderWorkingId: formData.actualRiderWorkingId,
        substituteWorkingId: formData.substituteWorkingId,
        reason: formData.reason,
        createdBy: formData.createdBy || null
      };

      const response = await fetch(`${API_BASE}/substitution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: t('substitution.addSuccess') });
        setShowAddModal(false);
        setFormData({
          actualRiderWorkingId: '',
          substituteWorkingId: '',
          reason: '',
          createdBy: ''
        });
        loadSubstitutions();
      } else {
        const errorMessage = data.detail || data.error?.description || data.title || t('substitution.operationFailed');
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('substitution.connectionError') });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">

      <PageHeader
        title={t('substitution.title')}
        subtitle={t('substitution.subtitle')}
        icon={ArrowRightLeft}
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-r-4 border-blue-500 p-5 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">{t('substitution.totalSubstitutes')}</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <Users className="text-blue-500" size={40} />
            </div>
          </div>
          <div className="bg-white border-r-4 border-green-500 p-5 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">{t('substitution.active')}</p>
                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>
          <div className="bg-white border-r-4 border-gray-500 p-5 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('substitution.stopped')}</p>
                <p className="text-3xl font-bold text-gray-700">{stats.inactive}</p>
              </div>
              <XCircle className="text-gray-500" size={40} />
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === f
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {f === 'all' ? t('common.all') : f === 'active' ? t('substitution.active') : t('substitution.inactive')}
              </button>
            ))}
          </div>
        </div>

        {/* Substitutions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              {t('substitution.substitutes')} ({substitutions.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.originalRider')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.originalWorkingId')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.substituteRider')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.substituteWorkingId')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('common.reason')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.startDate')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.duration')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('common.status')}</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {substitutions.length > 0 ? (
                    substitutions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{sub.actualRiderName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {sub.actualRiderWorkingId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{sub.substituteRiderName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                            {sub.substituteWorkingId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-gray-600" title={sub.reason}>
                            {sub.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {formatDate(sub.startDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="font-medium">
                            {calculateDuration(sub.startDate, sub.endDate)} {t('substitution.days')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${sub.isActive
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {sub.isActive ? t('substitution.active') : t('substitution.stopped')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {sub.isActive && (
                            <button
                              onClick={() => handleStop(sub.actualRiderWorkingId)}
                              className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
                            >
                              {t('substitution.stop')}
                            </button>
                          )}
                          {!sub.isActive && sub.endDate && (
                            <span className="text-xs text-gray-500">
                              {formatDate(sub.endDate)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                        <History size={48} className="mx-auto mb-4 text-gray-300" />
                        {t('common.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{t('substitution.addNewSubstitute')}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">{t('substitution.importantNote')}:</p>
                    <p>{t('substitution.noteText')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('substitution.originalWorkingId')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={t('substitution.exampleOriginal')}
                    value={formData.actualRiderWorkingId}
                    onChange={(e) => setFormData({ ...formData, actualRiderWorkingId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('substitution.substituteWorkingId')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={t('substitution.exampleSubstitute')}
                    value={formData.substituteWorkingId}
                    onChange={(e) => setFormData({ ...formData, substituteWorkingId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('substitution.reasonLabel')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  placeholder={t('substitution.reasonPlaceholder')}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('substitution.createdBy')}
                </label>
                <input
                  type="text"
                  placeholder={t('substitution.createdByPlaceholder')}
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-bold flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t('substitution.saving')}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      {t('substitution.saveSubstitute')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}