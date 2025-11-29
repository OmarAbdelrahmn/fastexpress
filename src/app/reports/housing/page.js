'use client';

import { useState, useEffect } from 'react';
import { Home, Search } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import Modal from '@/components/Ui/Model';

export default function HousingReportsPage() {
  const [loading, setLoading] = useState(false);
  const [housings, setHousings] = useState([]);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedHousing, setSelectedHousing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  useEffect(() => {
    loadHousings();
  }, []);

  const loadHousings = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.HOUSING.LIST);
      setHousings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load housings:', error);
    }
  };

  const loadReport = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء تحديد تاريخ البداية والنهاية' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.HOUSING_RIDERS,
        { startDate, endDate }
      );
      setReport(data);
      setMessage({ type: 'success', text: 'تم تحميل التقرير بنجاح' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل التقرير' });
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const viewHousingDetails = async (housing) => {
    setLoading(true);
    try {
      const riders = await ApiService.get(
        API_ENDPOINTS.REPORTS.HOUSING_RIDERS,
        { 
          housingName: housing.housingName,
          startDate,
          endDate
        }
      );
      setSelectedHousing({ ...housing, riders });
      setShowModal(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل تحميل تفاصيل السكن' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="تقارير السكن"
        subtitle="تحليل أداء السكنات والمناديب"
        icon={Home}
      />

      {message.text && (
        <div className="m-6">
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        </div>
      )}

      {/* Filters */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label="من تاريخ"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            type="date"
            label="إلى تاريخ"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReport}
              disabled={loading || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              عرض التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="m-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">إجمالي السكنات</p>
                <p className="text-3xl font-bold text-blue-600">
                  {report.housingBreakdowns?.length || 0}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">إجمالي المناديب</p>
                <p className="text-3xl font-bold text-purple-600">{report.totalRiders || 0}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-green-600">{report.totalOrders || 0}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">متوسط المناديب/سكن</p>
                <p className="text-3xl font-bold text-orange-600">
                  {report.housingBreakdowns?.length 
                    ? (report.totalRiders / report.housingBreakdowns.length).toFixed(1)
                    : 0}
                </p>
              </div>
            </Card>
          </div>

          {/* Top & Bottom Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.topPerformingHousing && (
              <Card title="🏆 الأفضل أداءً">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {report.topPerformingHousing.housingName}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">معدل الإنجاز</p>
                      <p className="text-xl font-bold text-green-600">
                        {report.topPerformingHousing.completionRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الطلبات</p>
                      <p className="text-xl font-bold">{report.topPerformingHousing.ordersCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المناديب</p>
                      <p className="text-xl font-bold">{report.topPerformingHousing.riderCount}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {report.lowestPerformingHousing && (
              <Card title="⚠️ يحتاج تحسين">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 mb-2">
                    {report.lowestPerformingHousing.housingName}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">معدل الإنجاز</p>
                      <p className="text-xl font-bold text-red-600">
                        {report.lowestPerformingHousing.completionRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الطلبات</p>
                      <p className="text-xl font-bold">{report.lowestPerformingHousing.ordersCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">المناديب</p>
                      <p className="text-xl font-bold">{report.lowestPerformingHousing.riderCount}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Housing Table */}
          <Card title="تفاصيل السكنات">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم السكن</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المناديب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طلبات مقبولة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طلبات مرفوضة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الإنجاز</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متوسط/مندوب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.housingBreakdowns?.map((housing, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {housing.housingName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {housing.riderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {housing.dailyOrdersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {housing.completedOrdersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                        {housing.rejectedOrdersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          housing.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                          housing.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {housing.completionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {housing.averageOrdersPerRider.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          onClick={() => viewHousingDetails(housing)}
                          className="text-sm"
                        >
                          التفاصيل
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Housing Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`تفاصيل ${selectedHousing?.housingName || ''}`}
        size="xl"
      >
        {selectedHousing && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">المناديب</p>
                <p className="text-2xl font-bold">{selectedHousing.riderCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الطلبات</p>
                <p className="text-2xl font-bold">{selectedHousing.dailyOrdersCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">معدل الإنجاز</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedHousing.completionRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">متوسط/مندوب</p>
                <p className="text-2xl font-bold">
                  {selectedHousing.averageOrdersPerRider.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Riders Table */}
            {selectedHousing.riderAssignments && selectedHousing.riderAssignments.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">المناديب في السكن</h4>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">رقم العمل</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الاسم</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الورديات</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">طلبات مقبولة</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">طلبات مرفوضة</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">معدل الإنجاز</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedHousing.riderAssignments.map((rider, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap font-medium">
                            {rider.workingId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{rider.riderName}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{rider.shiftsCount}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-green-600">
                            {rider.ordersCompleted}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-red-600">
                            {rider.ordersRejected}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rider.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                              rider.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {rider.completionRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}