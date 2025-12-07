'use client';

import { useState, useEffect } from 'react';
import { GitCompare, Upload, CheckCircle, XCircle, AlertTriangle, FileText, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';
import { Router } from 'next/router';
const API_BASE = 'https://fastexpress.tryasp.net/api';

export default function ShiftComparisonsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [comparisons, setComparisons] = useState(null);
  const [showDetails, setShowDetails] = useState({});

  const loadPendingComparisons = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.SHIFT.COMPARISONS, {
        shiftDate: selectedDate
      });
      
      setComparisons(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      if (error.status === 404) {
        setComparisons(null);
        setMessage({ type: 'info', text: 'لا توجد مقارنات معلقة لهذا التاريخ' });
      } else {
        setMessage({ type: 'error', text: error.message || 'فشل التحميل' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingComparisons();
  }, [selectedDate]);

  const handleCreateComparisons = async () => {
    if (!uploadFile) {
      setMessage({ type: 'error', text: 'الرجاء اختيار ملف Excel' });
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', uploadFile);

    setLoading(true);
    try {
        const token = TokenManager.getToken();
         if (!token) {
        Router.push('/login');
       }
      const response = await fetch(`${API_BASE}/shift/comparisons/import?shiftDate=${selectedDate}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setComparisons(result);
        setMessage({ 
          type: 'success', 
          text: `تم إنشاء ${result.totalComparisons} مقارنة (${result.newShifts} جديدة، ${result.updatedShifts} تحديثات)` 
        });
        setUploadFile(null);
      } else {
        setMessage({ type: 'error', text: result.title || 'فشل الاستيراد' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاستيراد' });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (choice) => {
    if (!confirm(`هل أنت متأكد من ${choice === '1' ? 'الإبقاء على البيانات الموجودة' : 'استخدام البيانات الجديدة'}؟`)) return;

    setLoading(true);
   try {
  const user = TokenManager.getUserFromToken();
  
  const result = await ApiService.post(API_ENDPOINTS.SHIFT.RESOLVE_COMPARISONS, {
    shiftDate: selectedDate,
    choice: parseInt(choice),
    resolvedBy: user?.unique_name || user?.name || 'someone'
  });

  setMessage({ 
    type: 'success', 
    text: `تم المعالجة: ${result.totalResolved}` 
  });
  setComparisons(null);
} catch (error) {
  setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء المعالجة' });
} finally {
  setLoading(false);
}
  };

  const toggleDetails = (index) => {
    setShowDetails(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getChangeIndicator = (diff) => {
    if (diff === 0) return null;
    return diff > 0 ? (
      <span className="text-green-600 flex items-center gap-1">
        <TrendingUp size={14} /> +{diff}
      </span>
    ) : (
      <span className="text-red-600 flex items-center gap-1">
        <TrendingDown size={14} /> {diff}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="مقارنة الورديات"
        subtitle="مراجعة واعتماد التغييرات في بيانات الورديات"
        icon={GitCompare}
      />

      <div className="p-6 space-y-6">
        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            message.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : 
             message.type === 'info' ? <FileText size={20} /> :
             <XCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">استيراد ملف المقارنة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملف Excel</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateComparisons}
                disabled={loading || !uploadFile}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                <Upload size={18} />
                إنشاء مقارنة
              </button>
            </div>
          </div>
        </div>

        {/* Comparisons Summary */}
        {comparisons && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
                <p className="text-blue-600 text-sm mb-1">إجمالي المقارنات</p>
                <p className="text-3xl font-bold text-blue-700">{comparisons.totalComparisons}</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-5 rounded-lg">
                <p className="text-green-600 text-sm mb-1">ورديات جديدة</p>
                <p className="text-3xl font-bold text-green-700">{comparisons.newShifts}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-lg">
                <p className="text-yellow-600 text-sm mb-1">تحديثات</p>
                <p className="text-3xl font-bold text-yellow-700">{comparisons.updatedShifts}</p>
              </div>
              <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
                <p className="text-red-600 text-sm mb-1">أخطاء</p>
                <p className="text-3xl font-bold text-red-700">{comparisons.errors?.length || 0}</p>
              </div>
            </div>

            {/* Resolution Buttons */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">إجراءات المقارنة</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleResolve('2')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                >
                  <CheckCircle size={20} />
                  اعتماد البيانات الجديدة
                </button>
                <button
                  onClick={() => handleResolve('1')}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                >
                  <XCircle size={20} />
                  الإبقاء على البيانات الموجودة
                </button>
              </div>
            </div>

            {/* Comparisons List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">التفاصيل ({comparisons.comparisons?.length || 0})</h3>
              
              {comparisons.comparisons?.map((comp, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div 
                    className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
                    onClick={() => toggleDetails(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <span className="text-2xl font-bold text-blue-600">{comp.workingId}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{comp.riderNameAR}</h4>
                          <p className="text-sm text-gray-600">{comp.riderNameEN} • {comp.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {comp.isSubstitution && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">
                            بديل (الأصلي: {comp.originalRiderWorkingId})
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          comp.oldData.acceptedOrders === null ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {comp.oldData.acceptedOrders === null ? 'جديد' : 'تحديث'}
                        </span>
                        <ArrowRight className={`transform transition-transform ${showDetails[index] ? 'rotate-90' : ''}`} size={20} />
                      </div>
                    </div>
                  </div>

                  {showDetails[index] && (
                    <div className="p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Old Data */}
                        <div className="bg-white p-5 rounded-lg border-2 border-gray-300">
                          <h5 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <XCircle size={18} className="text-gray-500" />
                            البيانات الحالية
                          </h5>
                          {comp.oldData.acceptedOrders === null ? (
                            <p className="text-gray-500 text-center py-8">لا توجد بيانات سابقة</p>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">الطلبات المقبولة:</span>
                                <span className="font-bold text-gray-800">{comp.oldData.acceptedOrders}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">الطلبات المرفوضة:</span>
                                <span className="font-bold text-gray-800">{comp.oldData.rejectedOrders}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">التوصيل المكدس:</span>
                                <span className="font-bold text-gray-800">{comp.oldData.stackedDeliveries || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">ساعات العمل:</span>
                                <span className="font-bold text-gray-800">{comp.oldData.workingHours?.toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">الحالة:</span>
                                <span className="font-bold text-gray-800">{comp.oldData.shiftStatus}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* New Data */}
                        <div className="bg-white p-5 rounded-lg border-2 border-green-400">
                          <h5 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500" />
                            البيانات الجديدة
                          </h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">الطلبات المقبولة:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{comp.newData.acceptedOrders}</span>
                                {getChangeIndicator(comp.analysis.ordersDifference)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">الطلبات المرفوضة:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{comp.newData.rejectedOrders}</span>
                                {getChangeIndicator(comp.analysis.rejectionsDifference)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">التوصيل المكدس:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{comp.newData.stackedDeliveries || 0}</span>
                                {getChangeIndicator(comp.analysis.stackedDeliveriesDifference)}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">ساعات العمل:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{comp.newData.workingHours?.toFixed(1)}</span>
                                {getChangeIndicator(comp.analysis.hoursDifference?.toFixed(1))}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">الحالة:</span>
                              <span className="font-bold text-gray-800">{comp.analysis.statusChange}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analysis */}
                      {comp.analysis.hasChanges && (
                        <div className={`mt-4 p-4 rounded-lg border ${
                          comp.analysis.recommendation.includes('Improvement') ? 'bg-green-50 border-green-200' : 
                          comp.analysis.recommendation.includes('decline') ? 'bg-red-50 border-red-200' : 
                          'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className={
                              comp.analysis.recommendation.includes('Improvement') ? 'text-green-600' : 
                              comp.analysis.recommendation.includes('decline') ? 'text-red-600' : 
                              'text-yellow-600'
                            } />
                            <div>
                              <h6 className="font-bold text-gray-800 mb-1">التوصية</h6>
                              <p className="text-sm text-gray-700">{comp.analysis.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!comparisons && !loading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <GitCompare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد مقارنات معلقة</h3>
            <p className="text-gray-500">قم برفع ملف Excel لإنشاء مقارنة جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
}