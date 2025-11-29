"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // استخدام Link للتنقل للصفحة الجديدة
import { Plus, ArrowRightLeft } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

const SubstitutionsPage = () => {
  const [substitutions, setSubstitutions] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = 'https://fastexpress.tryasp.net/api';

  const loadSubstitutions = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' ? '' : `/${filter}`;
      const response = await fetch(`${API_BASE}/substitution${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubstitutions(Array.isArray(data) ? data : []);
      } else {
        const errorMessage = data.detail || data.error?.description || data.title || 'فشل تحميل البدلاء';
        setMessage({ type: 'error', text: errorMessage });
        setSubstitutions([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
      setSubstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubstitutions();
  }, [filter]);

  const handleStop = async (workingId) => {
    if (!confirm('هل أنت متأكد من إيقاف هذا البديل؟')) return;

    try {
      const response = await fetch(`${API_BASE}/substitution/${workingId}/stop`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم إيقاف البديل بنجاح' });
        loadSubstitutions();
      } else {
        const errorMessage = data.detail || data.error?.description || data.title || 'فشل إيقاف البديل';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      
      {/* Header */}
      <PageHeader
        title="إدارة البدلاء"
        subtitle="عرض وإدارة بدلاء المناديب"
        icon={ArrowRightLeft}
      />
      
      <div className="px-6 pb-6 mt-8">
        
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="float-left">✕</button>
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <Link
            href="/substitution/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            إضافة بديل
          </Link>

          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
              >
                {f === 'all' ? 'الكل' : f === 'active' ? 'النشطين' : 'غير النشطين'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">اسم المندوب</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم العمل الأصلي</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم العمل البديل</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">السبب</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {substitutions.length > 0 ? (
                    substitutions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sub.actualRiderName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{sub.actualRiderWorkingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{sub.substituteWorkingId}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={sub.reason}>{sub.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(sub.startDate).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            sub.isActive 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {sub.isActive ? 'نشط' : 'متوقف'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {sub.isActive && (
                            <button
                              onClick={() => handleStop(sub.actualRiderWorkingId)}
                              className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                            >
                              إيقاف
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        لا توجد بيانات للعرض حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubstitutionsPage;