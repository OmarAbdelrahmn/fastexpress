'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';

export default function ImportEmployeeExcelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setErrorMessage('الرجاء اختيار ملف Excel صحيح (.xlsx أو .xls)');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('الرجاء اختيار ملف للرفع');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const response = await ApiService.uploadFile('/api/Temp/import-employees', formData.get('excelFile'));
      if (!response.ok) {
        throw new Error('فشل رفع الملف');
      }

      const result = await response.json();
      setUploadResult(result);
      setSuccessMessage(result.message || 'تم رفع الملف بنجاح');
      
      setTimeout(() => {
        router.push('/employee/admin/temp-imports');
      }, 3000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="استيراد الموظفين من Excel"
        subtitle="رفع ملف Excel لإضافة أو تحديث بيانات الموظفين"
        icon={FileSpreadsheet}
      />

      {/* Warning Message */}
      <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">تنبيه هام</h3>
            <p className="text-sm text-yellow-600">
              البيانات المرفوعة ستكون في حالة مؤقتة وتتطلب الموافقة قبل الحفظ النهائي. 
              يمكنك مراجعتها من صفحة "البيانات المؤقتة".
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            نتيجة الرفع
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">إجمالي الصفوف</p>
              <p className="text-2xl font-bold text-blue-700">{uploadResult.totalRows}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">موظفين جدد</p>
              <p className="text-2xl font-bold text-green-700">{uploadResult.newEmployees}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">موظفين موجودين</p>
              <p className="text-2xl font-bold text-purple-700">{uploadResult.existingEmployees}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">صفوف متخطاة</p>
              <p className="text-2xl font-bold text-orange-700">{uploadResult.skippedRows}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">رفع ملف Excel</h3>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excelFile"
            />
            <label 
              htmlFor="excelFile" 
              className="cursor-pointer inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              اختر ملف Excel
            </label>
            {selectedFile && (
              <p className="mt-4 text-green-600 font-medium">
                الملف المختار: {selectedFile.name}
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload} 
            loading={loading} 
            disabled={!selectedFile || loading}
            className="w-full"
          >
            <Upload size={18} className="ml-2" />
            رفع الملف
          </Button>
        </div>
      </Card>

      {/* Excel Format Instructions */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">تنسيق ملف Excel المطلوب</h3>
        <div className="space-y-4">
          <p className="text-gray-600">يجب أن يحتوي ملف Excel على الأعمدة التالية:</p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">رقم الاقامة</div>
              <div className="bg-white p-2 rounded border">الاسم بالغة العربيه</div>
              <div className="bg-white p-2 rounded border">الاسم بالغة الانجليزية</div>
              <div className="bg-white p-2 rounded border">تاريخ انتهاء الاقامة</div>
              <div className="bg-white p-2 rounded border">تاريخ انتهاء الاقامة بالهجري</div>
              <div className="bg-white p-2 rounded border">رقم الجواز</div>
              <div className="bg-white p-2 rounded border">تاريخ انتهاء الجواز</div>
              <div className="bg-white p-2 rounded border">كفالة</div>
              <div className="bg-white p-2 rounded border">رقم صاحب العمل</div>
              <div className="bg-white p-2 rounded border">المهنة</div>
              <div className="bg-white p-2 rounded border">الدولة</div>
              <div className="bg-white p-2 rounded border">الهاتف</div>
              <div className="bg-white p-2 rounded border">تاريخ الميلاد</div>
              <div className="bg-white p-2 rounded border">الحالة</div>
              <div className="bg-white p-2 rounded border">IBAN</div>
              <div className="bg-white p-2 rounded border">خارج المملكه</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">ملاحظات هامة:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>يجب أن يكون عمود "رقم الاقامة" موجوداً دائماً</li>
              <li>يمكن استخدام الأسماء العربية أو الإنجليزية للأعمدة</li>
              <li>البيانات الجديدة ستضاف كموظفين جدد</li>
              <li>البيانات الموجودة ستحدث فقط إذا كانت مختلفة</li>
              <li>الصفوف بدون تغييرات سيتم تخطيها تلقائياً</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Download Template
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">تحميل نموذج Excel</h3>
        <p className="text-gray-600 mb-4">
          يمكنك تحميل نموذج Excel جاهز يحتوي على الأعمدة المطلوبة
        </p>
        <Button variant="secondary">
          <Download size={18} className="ml-2" />
          تحميل النموذج
        </Button>
      </Card> */}
    </div>
  );
}