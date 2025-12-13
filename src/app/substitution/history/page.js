'use client';

import { useState } from 'react';
import { History, Search, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function SubstitutionHistoryPage() {
  const { t, language } = useLanguage();
  const [workingId, setWorkingId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    if (!workingId) {
      setMessage({ type: 'error', text: t('substitution.enterWorkingId') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setHasSearched(true);

    try {
      const data = await ApiService.get(API_ENDPOINTS.SUBSTITUTION.HISTORY(workingId));

      setHistory(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        setMessage({ type: 'info', text: t('substitution.noHistoryFound') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('errors.generalError') });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'en-US' : 'en-US', {
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
    const diffInMs = end - start;
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
      return `${hours} ${t('substitution.hour')}`;
    } else if (days === 1) {
      return t('substitution.oneDay');
    } else if (days === 2) {
      return t('substitution.twoDays');
    } else if (days <= 10) {
      return `${days} ${t('substitution.days')}`;
    } else {
      return `${days} ${t('substitution.day')}`;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        {t('substitution.active')}
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200">
        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
        {t('substitution.stopped')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Header */}
      <PageHeader
        title={t('substitution.historyTitle')}
        subtitle={t('substitution.historySubtitle')}
        icon={History}
      />

      <div className="p-6 space-y-6">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('substitution.workingId')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={t('substitution.searchPlaceholder')}
                  value={workingId}
                  onChange={(e) => setWorkingId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t('substitution.searching')}
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      {t('substitution.search')}
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <AlertCircle size={14} className="inline mr-1" />
                {t('substitution.searchNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> :
              message.type === 'error' ? <XCircle size={20} /> :
              <AlertCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={20} />
                {t('substitution.results')} ({history.length})
              </h3>
              {history.length > 0 && (
                <span className="text-blue-100 text-sm">
                  {t('substitution.workingId')}: {workingId}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {history.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">#</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.originalRider')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.originalWorkingId')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.substituteRider')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.substituteWorkingId')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.reason')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.startDate')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.endDate')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.duration')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">{t('substitution.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-blue-50/50 transition-colors ${
                            item.actualRiderWorkingId === workingId ? 'bg-yellow-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-600 font-medium">{index + 1}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.actualRiderName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.actualRiderWorkingId === workingId
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.actualRiderWorkingId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.substituteRiderName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              item.substituteWorkingId === workingId
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.substituteWorkingId}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs truncate text-gray-600" title={item.reason}>
                              {item.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              {formatDate(item.startDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.endDate ? (
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                {formatDate(item.endDate)}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">{t('substitution.ongoing')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="font-medium">
                              {calculateDuration(item.startDate, item.endDate)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.isActive)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <History size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">{t('substitution.noResults')}</p>
                    <p className="text-sm text-gray-400 mt-2">{t('substitution.searchAnother')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        {!hasSearched && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('substitution.howToUse')}</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{t('substitution.howToUseNote1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{t('substitution.howToUseNote2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{t('substitution.howToUseNote3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}