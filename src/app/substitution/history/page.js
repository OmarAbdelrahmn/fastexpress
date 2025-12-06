'use client';

import { useState } from 'react';
import { History, Search, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
const API_BASE = 'https://fastexpress.tryasp.net/api';

export default function SubstitutionHistoryPage() {
  const [workingId, setWorkingId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!workingId) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رقم العمل' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setHasSearched(true);

    try {
      const response = await fetch(`${API_BASE}/substitution/history/${workingId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      const data = await response.json();

      if (response.ok) {
        setHistory(Array.isArray(data) ? data : []);
        if (data.length === 0) {
          setMessage({ type: 'info', text: 'لا يوجد سجل استبدال لهذا الرقم' });
        }
      } else {
        const errorMessage = data.detail || data.error?.description || data.title || 'فشل تحميل السجل';
        setMessage({ type: 'error', text: errorMessage });
        setHistory([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      return `${hours} ساعة`;
    } else if (days === 1) {
      return `يوم واحد`;
    } else if (days === 2) {
      return `يومين`;
    } else if (days <= 10) {
      return `${days} أيام`;
    } else {
      return `${days} يوم`;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        نشط
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200">
        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
        متوقف
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      {/* Header */}
            <PageHeader
              title="سجل البدلاء"
              subtitle="عرض السجل الكامل للاستبدالات حسب رقم العمل"
              icon={History}
            />

      <div className="p-6 space-y-6">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رقم العمل <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="أدخل رقم العمل للبحث..."
                  value={workingId}
                  onChange={(e) => setWorkingId(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      بحث
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <AlertCircle size={14} className="inline mr-1" />
                سيظهر السجل لجميع الحالات التي كان فيها هذا الرقم مندوباً أصلياً أو بديلاً
              </p>
            </div>
          </form>
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
                نتائج البحث ({history.length})
              </h3>
              {history.length > 0 && (
                <span className="text-blue-100 text-sm">
                  رقم العمل: {workingId}
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
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المندوب الأصلي</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم العمل الأصلي</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المندوب البديل</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم العمل البديل</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">السبب</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ البدء</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ الانتهاء</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المدة</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الحالة</th>
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
                              <span className="text-gray-400 italic">مستمر</span>
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
                    <p className="text-lg font-medium">لا توجد نتائج</p>
                    <p className="text-sm text-gray-400 mt-2">قم بالبحث عن رقم عمل آخر</p>
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
                <h3 className="text-lg font-bold text-gray-800 mb-2">كيفية استخدام البحث</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>أدخل رقم العمل الذي تريد البحث عن سجله</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>سيظهر لك جميع حالات الاستبدال المرتبطة بهذا الرقم سواء كان مندوباً أصلياً أو بديلاً</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>الصفوف المميزة بلون أصفر تشير إلى تطابق رقم العمل المبحوث عنه</span>
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