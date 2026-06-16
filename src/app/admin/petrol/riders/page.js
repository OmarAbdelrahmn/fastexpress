'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, FileText, Activity, AlertCircle, RefreshCw, Car, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import PageHeader from '@/components/layout/pageheader';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiService } from '@/lib/api/apiService';

export default function PetrolRidersPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [activeTab, setActiveTab] = useState('summary');
  const [riders, setRiders] = useState([]);
  const [housingData, setHousingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [housingLoading, setHousingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedHousing, setSelectedHousing] = useState('');

  const exportToExcel = () => {
    if (activeTab === 'summary') {
      const dataToExport = filteredRiders.map(r => ({
        'الرقم المدني (الإقامة)': r.riderIqamaNo,
        'اسم السائق': r.riderNameAR || r.riderNameEN || 'غير معروف',
        'مجموع التكلفة (ريال)': r.totalCost || 0,
        'عدد المركبات المستخدمة': r.uniqueVehiclesUsed || 0,
        'عدد المرات': r.totalDaysWithCost || 0,
        'إجمالي الطلبات': r.totalAcceptedOrders || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Petrol Riders Summary");
      XLSX.writeFile(workbook, `Petrol_Riders_Summary_${year}_${month}.xlsx`);
    } else {
      const dataToExport = filteredHousingData.map(r => ({
        'الرقم المدني (الإقامة)': r.riderIqamaNo,
        'اسم السائق': r.riderNameAR || r.riderNameEN || 'غير معروف',
        'الشركة': r.companyName || 'غير معروف',
        'السكن': r.housingName || 'غير معروف',
        'المركبات المستخدمة': (r.vehiclesUsed || []).join(', '),
        'مجموع التكلفة (ريال)': r.totalCost || 0,
        'عدد الأيام بتكلفة': r.daysWithCost || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Petrol Company Housing Report");
      XLSX.writeFile(workbook, `Petrol_Company_Housing_Report_${year}_${month}.xlsx`);
    }
  };

  const fetchRiders = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const data = await ApiService.get(API_ENDPOINTS.PETROL.RIDERS_SUMMARY(year, month));
      setRiders(data || []);
    } catch (error) {
      setMessage(error.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHousingReport = async () => {
    setHousingLoading(true);
    setMessage('');

    try {
      const data = await ApiService.get(API_ENDPOINTS.PETROL.COMPANY_HOUSING_REPORT(year, month));
      setHousingData(data || []);
    } catch (error) {
      setMessage(error.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setHousingLoading(false);
    }
  };

  const refreshData = () => {
    if (activeTab === 'summary') {
      fetchRiders();
    } else {
      fetchHousingReport();
    }
  };

  useEffect(() => {
    setSelectedCompany('');
    setSelectedHousing('');
    refreshData();
  }, [year, month, activeTab]);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const filteredRiders = riders.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.riderIqamaNo || '').toString().includes(q) ||
      (r.riderNameAR || '').toLowerCase().includes(q) ||
      (r.riderNameEN || '').toLowerCase().includes(q)
    );
  });

  const companies = Array.from(new Set(housingData.map(r => r.companyName).filter(Boolean)));
  const housings = Array.from(new Set(housingData.map(r => r.housingName).filter(Boolean)));

  const filteredHousingData = housingData.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = (
      (r.riderIqamaNo || '').toString().includes(q) ||
      (r.riderNameAR || '').toLowerCase().includes(q) ||
      (r.riderNameEN || '').toLowerCase().includes(q) ||
      (r.companyName || '').toLowerCase().includes(q) ||
      (r.housingName || '').toLowerCase().includes(q)
    );
    const matchesCompany = !selectedCompany || r.companyName === selectedCompany;
    const matchesHousing = !selectedHousing || r.housingName === selectedHousing;
    return matchesSearch && matchesCompany && matchesHousing;
  });

  const isCurrentTabEmpty = activeTab === 'summary' 
    ? filteredRiders.length === 0 
    : filteredHousingData.length === 0;

  const isCurrentTabLoading = activeTab === 'summary' ? loading : housingLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="ملخص بنزين السائقين"
        subtitle="تقرير شامل لتكاليف البنزين لكل سائق خلال الشهر المحدد"
        icon={User}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="text-gray-500" size={20} />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <div className="flex items-center w-full md:w-auto mt-2 md:mt-0">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map(m => (
                <option key={m} value={m}>شهر {m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={refreshData}
            disabled={isCurrentTabLoading}
            className="md:mr-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            {isCurrentTabLoading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            تحديث
          </button>

          <button
            onClick={exportToExcel}
            disabled={isCurrentTabLoading || isCurrentTabEmpty}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            <Download size={18} />
            استخراج Excel
          </button>
        </div>

        {message && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="flex bg-white p-1 rounded-xl shadow-md border border-gray-100 max-w-md">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center transition-all duration-200 ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            ملخص البنزين العام
          </button>
          <button
            onClick={() => setActiveTab('company_housing')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-center transition-all duration-200 ${
              activeTab === 'company_housing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            تقرير الشركة والسكن
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
          <Search className="text-gray-400 shrink-0" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'summary'
                ? "ابحث برقم الإقامة أو اسم السائق..."
                : "ابحث برقم الإقامة، السائق، الشركة، أو السكن..."
            }
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xs shrink-0"
            >
              ✕ مسح
            </button>
          )}
        </div>

        {/* Company & Housing Filters */}
        {activeTab === 'company_housing' && (
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4 items-center border border-blue-50/50 max-w-2xl">
            <div className="flex items-center gap-2 w-full md:w-auto md:flex-1">
              <span className="text-sm font-bold text-gray-700 shrink-0">الشركة:</span>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
              >
                <option value="">كل الشركات</option>
                {companies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto md:flex-1">
              <span className="text-sm font-bold text-gray-700 shrink-0">السكن:</span>
              <select
                value={selectedHousing}
                onChange={(e) => setSelectedHousing(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
              >
                <option value="">كل السكنات</option>
                {housings.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {(selectedCompany || selectedHousing) && (
              <button
                onClick={() => {
                  setSelectedCompany('');
                  setSelectedHousing('');
                }}
                className="text-red-500 hover:text-red-700 font-bold text-sm shrink-0 mt-2 md:mt-0 transition-colors cursor-pointer"
              >
                ✕ إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText />
              {activeTab === 'summary' ? (
                <>السائقين الذين استهلكوا البنزين ({filteredRiders.length}{search ? ` من ${riders.length}` : ''})</>
              ) : (
                <>تقرير الشركة والسكن للبنزين ({filteredHousingData.length}{search ? ` من ${housingData.length}` : ''})</>
              )}
            </h3>
          </div>

          {isCurrentTabLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'summary' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الرقم المدني (الإقامة)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">اسم السائق</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">مجموع التكلفة (ريال)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">عدد المركبات المستخدمة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">عدد المرات</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">إجمالي الطلبات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRiders.length > 0 ? (
                    filteredRiders.map((row, index) => (
                      <tr key={row.riderIqamaNo || index} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                            {row.riderIqamaNo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-r-4 border-transparent hover:border-blue-500">
                          {row.riderNameAR || row.riderNameEN || 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-blue-700">{row.totalCost?.toFixed(2) || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Car size={16} />
                            {row.uniqueVehiclesUsed || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Activity size={16} />
                            {row.totalDaysWithCost || 0} مرة
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/petrol/riders/${row.riderIqamaNo}?year=${year}&month=${month}`}
                            className="bg-blue-50 text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                          >
                            عرض التفاصيل
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              {row.totalAcceptedOrders ?? 0}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        لا توجد بيانات بنزين للسائقين في هذا الشهر.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الرقم المدني (الإقامة)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">اسم السائق</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الشركة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">السكن</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المركبات المستخدمة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">مجموع التكلفة (ريال)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">أيام التكلفة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHousingData.length > 0 ? (
                    filteredHousingData.map((row, index) => (
                      <tr key={row.riderIqamaNo || index} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                            {row.riderIqamaNo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-r-4 border-transparent hover:border-blue-500">
                          {row.riderNameAR || row.riderNameEN || 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                          {row.companyName || 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                          {row.housingName || 'غير محدد'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {row.vehiclesUsed && row.vehiclesUsed.length > 0 ? (
                              row.vehiclesUsed.map((vehicle, vIdx) => (
                                <span key={vIdx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100 flex items-center gap-1">
                                  <Car size={10} />
                                  {vehicle}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">لا يوجد</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-blue-700">{row.totalCost?.toFixed(2) || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Activity size={16} />
                            {row.daysWithCost || 0} يوم
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/petrol/riders/${row.riderIqamaNo}?year=${year}&month=${month}`}
                            className="bg-blue-50 text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                          >
                            عرض التفاصيل
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        لا توجد بيانات سكن وشركات للسائقين في هذا الشهر.
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
}
