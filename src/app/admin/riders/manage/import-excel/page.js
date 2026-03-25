'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';

export default function ImportEmployeeExcelPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setErrorMessage(t('employees.selectExcelFile'));
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage(t('employees.selectFileToUpload'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const result = await ApiService.uploadFile('/api/Temp/import-employees', formData.get('excelFile'));
      setUploadResult(result);
      setSuccessMessage(result?.message || t('common.success'));

    } catch (err) {
      console.error('Error uploading file:', err);
      setErrorMessage(err?.message || t('employees.uploadErrorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.importExcelTitle')}
        subtitle={t('employees.importExcelSubtitle')}
        icon={FileSpreadsheet}
      />

      {/* Warning Message */}
      <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">{t('employees.importantNotice')}</h3>
            <p className="text-sm text-yellow-600">
              {t('employees.importTempNotice')}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert
          type="success"
          title={t('common.success')}
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          title={t('common.error')}
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            {t('employees.uploadResult')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">{t('employees.totalRows')}</p>
              <p className="text-2xl font-bold text-blue-700">{uploadResult.totalRows}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">{t('employees.newEmployees')}</p>
              <p className="text-2xl font-bold text-green-700">{uploadResult.newEmployees}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">{t('employees.existingEmployees')}</p>
              <p className="text-2xl font-bold text-purple-700">{uploadResult.existingEmployees}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">{t('employees.skippedRows')}</p>
              <p className="text-2xl font-bold text-orange-700">{uploadResult.skippedRows}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => router.push('/admin/riders/manage/temp-imports')}>
              {t('employees.viewPendingUpdates')}
            </Button>
          </div>

          {uploadResult.employeesInExcelNotInDB && uploadResult.employeesInExcelNotInDB.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-red-600 mb-3">{t('employees.employeesInExcelNotInDB')}</h4>
              <div className="bg-red-50 p-4 rounded-lg overflow-x-auto">
                <table className="min-w-full text-sm text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-red-200">
                      <th className="pb-2 font-semibold">{t('employees.excelColumns.iqamaNumber')}</th>
                      <th className="pb-2 font-semibold">{t('employees.excelColumns.passportNumber')}</th>
                      <th className="pb-2 font-semibold">{t('employees.excelColumns.profession')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.employeesInExcelNotInDB.map((emp, idx) => (
                      <tr key={idx} className="border-b border-red-100 last:border-0">
                        <td className="py-2">{emp.iqamaNo}</td>
                        <td className="py-2">{emp.passportNo || '-'}</td>
                        <td className="py-2">{emp.jobTitle || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {uploadResult.employeesInDBNotInExcel && uploadResult.employeesInDBNotInExcel.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-yellow-600 mb-3">{t('employees.employeesInDBNotInExcel')}</h4>
              <div className="bg-yellow-50 p-4 rounded-lg overflow-x-auto">
                <table className="min-w-full text-sm text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-yellow-200">
                      <th className="pb-2 font-semibold">{t('employees.excelColumns.iqamaNumber')}</th>
                      <th className="pb-2 font-semibold">{t('employees.excelColumns.nameArabic')}</th>
                      <th className="pb-2 font-semibold">{t('employees.excelColumns.profession')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.employeesInDBNotInExcel.map((emp, idx) => (
                      <tr key={idx} className="border-b border-yellow-100 last:border-0">
                        <td className="py-2">{emp.iqamaNo}</td>
                        <td className="py-2">{emp.nameAR || emp.employeeNameAR || '-'}</td>
                        <td className="py-2">{emp.jobTitle || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.uploadExcelFile')}</h3>

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
              {t('employees.selectExcelFileButton')}
            </label>
            {selectedFile && (
              <p className="mt-4 text-green-600 font-medium">
                {t('employees.selectedFile')}: {selectedFile.name}
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
            {t('employees.uploadFile')}
          </Button>
        </div>
      </Card>

      {/* Excel Format Instructions */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t('employees.excelFormatRequired')}</h3>
        <div className="space-y-4">
          <p className="text-gray-600">{t('employees.excelMustContain')}</p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">{t('employees.excelColumns.iqamaNumber')}</div>
              <div className="bg-white p-2 rounded border">{t('employees.excelColumns.iqamaExpiryHijri')}</div>
              <div className="bg-white p-2 rounded border">{t('employees.excelColumns.passportNumber')}</div>
              <div className="bg-white p-2 rounded border">{t('employees.excelColumns.passportExpiry')}</div>
              <div className="bg-white p-2 rounded border">{t('employees.excelColumns.employerNumber')}</div>
              <div className="bg-white p-2 rounded border">{t('employees.excelColumns.profession')}</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">{t('employees.importantNotes')}</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>{t('employees.iqamaColumnRequired')}</li>
              <li>{t('employees.columnNamesFlexible')}</li>
              <li>{t('employees.newDataAdded')}</li>
              <li>{t('employees.existingDataUpdated')}</li>
              <li>{t('employees.unchangedSkipped')}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}