"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowRight, UserPlus } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const AddSubstitutionPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Updated form data to match API request structure
  const [formData, setFormData] = useState({
    actualRiderWorkingId: '',
    substituteWorkingId: '',
    reason: '',
    createdBy: ''
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
  const requestPayload = {
    actualRiderWorkingId: formData.actualRiderWorkingId,
    substituteWorkingId: formData.substituteWorkingId,
    reason: formData.reason,
    createdBy: formData.createdBy || null
  };

  const data = await ApiService.post(API_ENDPOINTS.SUBSTITUTION.CREATE, requestPayload);
  
  setMessage({ type: 'success', text: 'تم إضافة البديل بنجاح، جاري التحويل...' });
  
  setTimeout(() => {
    router.push('/substitution');
  }, 1500);
} catch (error) {
  setMessage({ type: 'error', text: error.message || 'حدث خطأ في الاتصال بالخادم' });
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      
      {/* Header */}
      <PageHeader
        title="إضافة بديل جديد"
        subtitle="تسجيل بيانات بديل لمندوب وتوثيق السبب"
        icon={UserPlus}
      />

      <div className="px-6 pb-6 mt-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Back Button */}
          <button 
            onClick={() => router.back()} 
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowRight size={20} />
            العودة للقائمة
          </button>

          {/* Alert Messages */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 shadow-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold">{message.text}</span>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">بيانات البديل</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم العمل الأصلي <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: 1025"
                    value={formData.actualRiderWorkingId}
                    onChange={(e) => setFormData({...formData, actualRiderWorkingId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">رقم العمل للمندوب الأصلي</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم العمل البديل <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: 9901"
                    value={formData.substituteWorkingId}
                    onChange={(e) => setFormData({...formData, substituteWorkingId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">رقم العمل الذي سيحل محل المندوب الأصلي</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  سبب الاستبدال <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  placeholder="يرجى كتابة سبب الاستبدال بوضوح..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تم الإنشاء بواسطة
                </label>
                <input
                  type="text"
                  placeholder="اسم المستخدم المسؤول"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({...formData, createdBy: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      حفظ البيانات
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubstitutionPage;