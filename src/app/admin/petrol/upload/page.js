'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle, XCircle, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiService } from '@/lib/api/apiService';

export default function PetrolUploadPage() {
  const [file, setFile] = useState(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [attributeLoading, setAttributeLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadResult, setUploadResult] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'attribute'

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'الرجاء اختيار ملف' });
      return;
    }
    if (!reportDate) {
      setMessage({ type: 'error', text: 'الرجاء اختيار تاريخ التقرير' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = `${API_ENDPOINTS.PETROL.UPLOAD}?reportDate=${reportDate}`;
      const data = await ApiService.uploadFormData(endpoint, formData);

      setMessage({ type: 'success', text: 'تم رفع الملف ومعالجته بنجاح.' });
      setUploadResult(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ في الاتصال بالخادم.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAttributePending = async () => {
    setAttributeLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await ApiService.post(API_ENDPOINTS.PETROL.ATTRIBUTE_PENDING, null);
      setMessage({ type: 'success', text: data?.message || 'تم إعادة تخصيص السجلات المعلقة بنجاح.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ في الاتصال بالخادم.' });
    } finally {
      setAttributeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="رفع البنزين وتخصيصه"
        subtitle="رفع تقارير البنزين بصيغة Excel أو تخصيص السجلات المعلقة"
        icon={UploadCloud}
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Tabs */}
        <div className="flex space-x-1 space-x-reverse bg-white/50 p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow hover:bg-gray-50' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
          >
            <FileSpreadsheet size={18} />
            رفع ملف البنزين
          </button>
          <button
            onClick={() => setActiveTab('attribute')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'attribute' ? 'bg-white text-purple-600 shadow hover:bg-gray-50' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
          >
            <RefreshCw size={18} />
            تخصيص السجلات العالقة
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="flex-1 font-medium">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>
              <XCircle size={18} />
            </button>
          </div>
        )}

        <div>
          {/* Upload Section */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 animate-in fade-in duration-300 relative">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="text-blue-500" />
                رفع ملف البنزين
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    تاريخ التقرير <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ملف Excel <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50">
                    <div className="space-y-1 text-center border-none">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1 border">
                          <span>اختر ملف Excel</span>
                          <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {file && <p className="text-sm text-blue-600 mt-2 font-medium">{file.name}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-bold flex items-center gap-2 shadow-md transition-all"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        جاري الدفع...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={20} />
                        رفع ومعالجة الملف
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pending Attribution Section */}
          {activeTab === 'attribute' && (
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <RefreshCw className="text-purple-500" />
                إعادة تخصيص السجلات
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                تستخدم هذه الأداة لتشغيل عملية التخصيص مرة أخرى لأي سجلات لم يتم ربطها بسائقين سابقاً. مفيدة إذا تم تحديث معلومات السائقين أو إغلاق الفترات بشكل صحيح.
              </p>

              <div className="flex justify-center mt-12 pb-6">
                <button
                  onClick={handleAttributePending}
                  disabled={attributeLoading}
                  className="w-full max-w-sm px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-bold flex justify-center items-center gap-3 shadow-lg transition-transform hover:-translate-y-1"
                >
                  {attributeLoading ? (
                    <>
                      <RefreshCw size={24} className="animate-spin" />
                      جاري التخصيص...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={24} />
                      تخصيص السجلات المتبقية المنتظرة
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Results Table */}
        {uploadResult && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8 border border-gray-100">
            <div className="bg-blue-600 px-6 py-4 flex flex-col md:flex-row justify-between items-center text-white gap-4">
              <h3 className="text-lg font-bold">نتائج رفع الملف</h3>
              <div className="flex flex-wrap justify-center gap-2 text-sm font-semibold">
                <span className="bg-blue-800 px-3 py-1 rounded-full">السطور المقروءة: {uploadResult?.totalRows || 0}</span>
                <span className="bg-green-500 px-3 py-1 rounded-full">مخصصة: {uploadResult?.successfullyAttributed || 0}</span>
                <span className="bg-orange-500 px-3 py-1 rounded-full">غير مخصصة: {uploadResult?.unattributed || 0}</span>
                <span className="bg-red-500 px-3 py-1 rounded-full">مركبات مجهولة: {uploadResult?.unresolvedVehicles || 0}</span>
              </div>
            </div>

            <div className="p-4 overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">اللوحة / المركبة</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">التكلفة</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">ملاحظات النظام</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadResult?.rows?.length > 0 ? (
                    uploadResult.rows.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-bold text-gray-900">{row.plateNumberE || 'N/A'}</div>
                          {row.resolvedVehicleNumber && (
                            <div className="text-xs text-gray-500">{row.resolvedVehicleNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-800">
                          {row.cost !== undefined ? `${row.cost} ريال` : '-'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {!row.vehicleResolved ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">مركبة غير معروفة</span>
                          ) : row.attributedRiderCount > 0 ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              مخصص ({row.attributedRiderCount} سائق)
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">غير مخصص لسائق</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600 max-w-md truncate">
                          {row.errorMessage ? (
                            <span className="text-red-600 font-medium">{row.errorMessage}</span>
                          ) : (
                            <span className="text-gray-400">لا يوجد (تم بنجاح)</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        لا توجد تفاصيل نتائج متوفرة في الملف المرفوع.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
