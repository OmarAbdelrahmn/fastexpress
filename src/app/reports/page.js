// File: src/app/reports/page.js
'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { FileText, Calendar, TrendingUp, Users, Building } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

export default function ReportsPage() {
  const { get, loading, error } = useApi();
  const [reportData, setReportData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [reportType, setReportType] = useState('');

  const [monthlyForm, setMonthlyForm] = useState({
    workingId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [yearlyForm, setYearlyForm] = useState({
    workingId: '',
    year: new Date().getFullYear(),
  });

  const [dateRangeForm, setDateRangeForm] = useState({
    startDate: '',
    endDate: '',
  });

  const handleMonthlyReport = async () => {
    try {
      const result = await get(
        API_ENDPOINTS.REPORTS.MONTHLY(monthlyForm.workingId),
        { year: monthlyForm.year, month: monthlyForm.month }
      );
      if (result.data) {
        setReportData(result.data);
        setReportType('monthly');
        setSuccessMessage('تم جلب التقرير الشهري بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
    }
  };

  const handleYearlyReport = async () => {
    try {
      const result = await get(
        API_ENDPOINTS.REPORTS.YEARLY(yearlyForm.workingId),
        { year: yearlyForm.year }
      );
      if (result.data) {
        setReportData(result.data);
        setReportType('yearly');
        setSuccessMessage('تم جلب التقرير السنوي بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching yearly report:', err);
    }
  };

  const handleAllRidersMonthly = async () => {
    try {
      const result = await get(
        API_ENDPOINTS.REPORTS.MONTHLY_ALL,
        { year: monthlyForm.year, month: monthlyForm.month }
      );
      if (result.data) {
        setReportData(result.data);
        setReportType('all-monthly');
        setSuccessMessage('تم جلب التقرير الشهري لجميع السائقين بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching all riders monthly report:', err);
    }
  };

  const handleDashboard = async () => {
    try {
      const params = {};
      if (dateRangeForm.startDate && dateRangeForm.endDate) {
        params.startDate = dateRangeForm.startDate;
        params.endDate = dateRangeForm.endDate;
      }
      
      const result = await get(API_ENDPOINTS.REPORTS.DASHBOARD, params);
      if (result.data) {
        setReportData(result.data);
        setReportType('dashboard');
        setSuccessMessage('تم جلب بيانات لوحة المعلومات بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
      title="التقارير والإحصائيات"
      subtitle="عرض وتحليل البيانات"
      icon={FileText}
    />


      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {error && (
        <Alert type="error" title="خطأ" message={error} />
      )}

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard Report */}
        <Card title="لوحة المعلومات الشاملة">
          <div className="space-y-4">
            <FileText className="text-orange-500" size={32} />
            <p className="text-sm text-gray-600">
              عرض إحصائيات شاملة للنظام
            </p>
            <div className="space-y-2">
              <Input
                label="تاريخ البداية (اختياري)"
                type="date"
                value={dateRangeForm.startDate}
                onChange={(e) => setDateRangeForm({
                  ...dateRangeForm,
                  startDate: e.target.value
                })}
              />
              <Input
                label="تاريخ النهاية (اختياري)"
                type="date"
                value={dateRangeForm.endDate}
                onChange={(e) => setDateRangeForm({
                  ...dateRangeForm,
                  endDate: e.target.value
                })}
              />
            </div>
            <Button 
              onClick={handleDashboard}
              loading={loading}
              className="w-full"
            >
              عرض لوحة المعلومات
            </Button>
          </div>
        </Card>

        {/* Monthly Report */}
        <Card title="التقرير الشهري">
          <div className="space-y-4">
            <Calendar className="text-blue-500" size={32} />
            <p className="text-sm text-gray-600">
              تقرير شهري لسائق محدد
            </p>
            <Input
              label="رقم العمل"
              type="number"
              value={monthlyForm.workingId}
              onChange={(e) => setMonthlyForm({
                ...monthlyForm,
                workingId: e.target.value
              })}
              placeholder="أدخل رقم العمل"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="السنة"
                type="number"
                value={monthlyForm.year}
                onChange={(e) => setMonthlyForm({
                  ...monthlyForm,
                  year: e.target.value
                })}
              />
              <Input
                label="الشهر"
                type="number"
                min="1"
                max="12"
                value={monthlyForm.month}
                onChange={(e) => setMonthlyForm({
                  ...monthlyForm,
                  month: e.target.value
                })}
              />
            </div>
            <Button 
              onClick={handleMonthlyReport}
              loading={loading}
              className="w-full"
            >
              عرض التقرير
            </Button>
          </div>
        </Card>

        {/* All Riders Monthly */}
        <Card title="التقرير الشهري - جميع السائقين">
          <div className="space-y-4">
            <Users className="text-green-500" size={32} />
            <p className="text-sm text-gray-600">
              تقرير شهري لجميع السائقين
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="السنة"
                type="number"
                value={monthlyForm.year}
                onChange={(e) => setMonthlyForm({
                  ...monthlyForm,
                  year: e.target.value
                })}
              />
              <Input
                label="الشهر"
                type="number"
                min="1"
                max="12"
                value={monthlyForm.month}
                onChange={(e) => setMonthlyForm({
                  ...monthlyForm,
                  month: e.target.value
                })}
              />
            </div>
            <Button 
              onClick={handleAllRidersMonthly}
              loading={loading}
              className="w-full"
            >
              عرض التقرير
            </Button>
          </div>
        </Card>

        {/* Yearly Report */}
        <Card title="التقرير السنوي">
          <div className="space-y-4">
            <TrendingUp className="text-purple-500" size={32} />
            <p className="text-sm text-gray-600">
              تقرير سنوي لسائق محدد
            </p>
            <Input
              label="رقم العمل"
              type="number"
              value={yearlyForm.workingId}
              onChange={(e) => setYearlyForm({
                ...yearlyForm,
                workingId: e.target.value
              })}
              placeholder="أدخل رقم العمل"
            />
            <Input
              label="السنة"
              type="number"
              value={yearlyForm.year}
              onChange={(e) => setYearlyForm({
                ...yearlyForm,
                year: e.target.value
              })}
            />
            <Button 
              onClick={handleYearlyReport}
              loading={loading}
              className="w-full"
            >
              عرض التقرير
            </Button>
          </div>
        </Card>
      </div>

      {/* Report Display */}
      {reportData && (
        <Card title={`نتائج التقرير - ${reportType}`}>
          <div className="overflow-auto">
            <pre className="bg-gray-50 p-4 rounded-lg text-sm">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}