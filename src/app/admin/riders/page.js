'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Plus, Search, Edit, Trash2, UserCheck, Eye, Users, UserCog, Building, Package, Filter, Download, AlertCircle, History } from 'lucide-react';
import MiniStatRow from '@/components/Ui/MiniStatRow';
import Modal from '@/components/Ui/Model';
import * as XLSX from 'xlsx';

export default function RidersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [riders, setRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const deleteReasons = [
    'خرج ولم يعد',
    'خروج نهائي',
    'متغيب عن العمل',
    'نقل كفالة',
    'اخرى'
  ];

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.RIDER.LIST);
      setRiders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading riders:', err);
      setErrorMessage(err?.message || t('riders.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (iqamaNo) => {
    setRiderToDelete(iqamaNo);
    setSelectedReason('');
    setCustomReason('');
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const finalReason = selectedReason === 'اخرى' ? customReason : selectedReason;

    if (!finalReason.trim()) {
      alert(t('common.required'));
      return;
    }

    if (deletePassword !== '9999') {
      alert(t('common.incorrectPassword') || 'كلمة المرور غير صحيحة');
      return;
    }

    try {
      await ApiService.delete(API_ENDPOINTS.RIDER.DELETE(riderToDelete), { Reason: finalReason });
      setSuccessMessage(t('riders.deleteSuccess'));
      setShowDeleteModal(false);
      setRiderToDelete(null);
      setSelectedReason('');
      setCustomReason('');
      setDeletePassword('');
      loadRiders();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting rider:', err);
      setErrorMessage(err?.message || t('riders.deleteError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleViewDetails = (iqamaNo) => {
    router.push(`/admin/riders/${iqamaNo}/details`);
  };

  const handleEdit = (iqamaNo) => {
    router.push(`/admin/riders/${iqamaNo}/edit`);
  };

  const handleExportExcel = () => {
    const data = filteredRiders.map(rider => ({
      [t('riders.iqamaNumber')]: rider.iqamaNo || '',
      [t('riders.nameArabic')]: rider.nameAR || '',
      [t('riders.nameEnglish')]: rider.nameEN || '',
      [t('riders.workingId')]: rider.workingId || '',
      [t('riders.company')]: rider.companyName || '',
      [t('riders.housing')]: rider.housingAddress || '',
      [t('riders.phoneNumber')]: rider.phone || '',
      [t('riders.nationality')]: rider.country || '',
      [t('common.status')]: rider.status || '',
      [t('employees.title')]: rider.isEmployee ? t('common.yes') : t('common.no')
    }));

    // Add summary row at the end
    data.push({
      [t('riders.iqamaNumber')]: '',
      [t('riders.nameArabic')]: '',
      [t('riders.nameEnglish')]: '',
      [t('riders.workingId')]: '',
      [t('riders.company')]: '',
      [t('riders.housing')]: '',
      [t('riders.phoneNumber')]: '',
      [t('riders.nationality')]: '',
      [t('common.status')]: '',
      [t('employees.title')]: ''
    });

    data.push({
      [t('riders.iqamaNumber')]: t('common.total'),
      [t('riders.nameArabic')]: filteredRiders.length,
      [t('riders.nameEnglish')]: '',
      [t('riders.workingId')]: '',
      [t('riders.company')]: '',
      [t('riders.housing')]: '',
      [t('riders.phoneNumber')]: '',
      [t('riders.nationality')]: '',
      [t('common.status')]: '',
      [t('employees.title')]: ''
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riders");
    XLSX.writeFile(wb, `Riders_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns = [
    { header: t('riders.iqamaNumber'), accessor: 'iqamaNo' },
    {
      header: t('riders.nameArabic'),
      accessor: 'nameAR',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.nameAR}</span>
          <span className="text-xs text-gray-500">{row.nameEN}</span>
        </div>
      )
    },
    {
      header: t('riders.sponsorInfo'),
      accessor: 'sponsor',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.sponsor || '-'}</span>
          <span className="text-xs text-gray-500">{row.sponsorNo || '-'}</span>
        </div>
      )
    },
    {
      header: t('riders.housing'),
      accessor: 'housingAddress',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.housingAddress || t('riders.notSpecified')}</span>
          <span className="text-xs text-gray-500">{row.phone || '-'}</span>
        </div>
      )
    },
    {
      header: t('riders.workingId'),
      accessor: 'workingId',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-blue-600">{row.workingId || 'N/A'}</span>
          <span className="text-xs text-gray-500">{row.companyName || ''}</span>
        </div>
      )
    },
    {
      header: t('common.status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: t('riders.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row.iqamaNo)}
            className="text-green-600 hover:text-green-800 p-1 cursor-pointer"
            title={t('riders.viewDetails')}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row.iqamaNo)}
            className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
            title={t('riders.edit')}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.iqamaNo)}
            className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
            title={t('riders.delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  // First filter by search term only
  const searchFilteredRiders = riders.filter(rider => {
    const matchesSearch =
      rider.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.workingId?.toString().includes(searchTerm) ||
      rider.iqamaNo?.toString().includes(searchTerm) ||
      rider.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.sponsor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.sponsorNo?.toString().includes(searchTerm) ||
      rider.housingAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate statistics based on search-filtered riders
  const stats = {
    total: searchFilteredRiders.length,
    active: searchFilteredRiders.filter(r => r.status?.toLowerCase() === 'enable' && !r.isEmployee).length,
    inactive: searchFilteredRiders.filter(r => r.status?.toLowerCase() === 'disable' && !r.isEmployee).length,
    fleeing: searchFilteredRiders.filter(r => r.status?.toLowerCase() === 'fleeing' && !r.isEmployee).length,
    vacation: searchFilteredRiders.filter(r => r.status?.toLowerCase() === 'vacation').length,
    sick: searchFilteredRiders.filter(r => r.status?.toLowerCase() === 'sick' && !r.isEmployee).length,
    accident: searchFilteredRiders.filter(r => r.status?.toLowerCase() === 'accident' && !r.isEmployee).length,
    other: searchFilteredRiders.filter(r => r.status?.toLowerCase() !== 'enable' && r.status?.toLowerCase() !== 'vacation').length,
    employees: searchFilteredRiders.filter(r => r.isEmployee).length,
    inactiveEmployees: searchFilteredRiders.filter(r => r.isEmployee && r.status?.toLowerCase() === 'disable').length,
    companies: new Set(searchFilteredRiders.map(r => r.companyName)).size,
    withHousing: searchFilteredRiders.filter(r => r.housingAddress).length
  };

  // Then apply status filter
  const filteredRiders = searchFilteredRiders.filter(rider => {
    const isEmployee = rider.isEmployee;
    const status = rider.status?.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && status === 'enable' && !isEmployee) ||
      (statusFilter === 'inactive' && status === 'disable' && !isEmployee) ||
      (statusFilter === 'fleeing' && status === 'fleeing' && !isEmployee) ||
      (statusFilter === 'vacation' && status === 'vacation') ||
      (statusFilter === 'sick' && status === 'sick' && !isEmployee) ||
      (statusFilter === 'accident' && status === 'accident' && !isEmployee) ||
      (statusFilter === 'other' && status !== 'enable' && status !== 'vacation') ||
      (statusFilter === 'employees' && isEmployee) ||
      (statusFilter === 'inactiveEmployees' && isEmployee && status === 'disable');

    return matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('employees.title')}
        subtitle={`${t('riders.totalRiders')}: ${filteredRiders.length}`}
        icon={UserCheck}
        actionButton={{
          text: t('riders.addNewRider'),
          icon: <Plus size={18} />,
          onClick: () => router.push('/admin/riders/create'),
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {/* Row 1: Main Stats */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">{t('riders.totalRiders')}</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">{t('common.active')}</p>
              <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            </div>
            <UserCheck className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">{t('common.inactive')}</p>
              <p className="text-3xl font-bold text-red-700">{stats.inactive}</p>
            </div>
            <Users className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">{t('riders.numberOfCompanies')}</p>
              <p className="text-3xl font-bold text-purple-700">{stats.companies}</p>
            </div>
            <Building className="text-purple-500" size={40} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {/* Management Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('riders.management')}
          </h3>
          <div className="flex flex-col gap-3">
            <MiniStatRow
              icon={Plus}
              title={t('riders.addNewRider')}
              description={t('riders.createNewProfile')}
              onClick={() => router.push('/admin/riders/create')}
              color="#16a34a" // green-600
              bgClass="bg-green-50"
            />
            <MiniStatRow
              icon={Edit}
              title={t('riders.editRider')}
              description={t('riders.modifyExistingProfile')}
              onClick={() => router.push('/admin/riders/search?action=edit')} // Placeholder route logic
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
            />
            {/* <MiniStatRow
              icon={Trash2}
              title={t('riders.deleteRider')}
              description={t('riders.removeProfile')}
              onClick={() => router.push('/admin/riders/search?action=delete')} // Placeholder route logic
              color="#dc2626" // red-600
              bgClass="bg-red-50"
            /> */}
            <MiniStatRow
              icon={Package}
              title={t('riders.changeWorkingId')}
              description={t('riders.updateWorkingId')}
              onClick={() => router.push('/admin/riders/change-working-id')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
            />
          </div>
        </div>



        {/* Others Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
            {t('common.others')}
          </h3>
          <div className="flex flex-col gap-3">
            {/* <MiniStatRow
              icon={UserCheck}
              title={t('riders.convertEmployeeToRider')}
              description={t('riders.convertEmployeeToRider')}
              onClick={() => router.push('/admin/riders/add-to-employee')}
              color="#0d9488" // teal-600
              bgClass="bg-teal-50"
            /> */}
            <MiniStatRow
              icon={UserCog}
              title={t('navigation.changeRole')}
              description={t('navigation.changeRole')}
              onClick={() => router.push('/admin/riders/change-role')}
              color="#2563eb" // blue-600
              bgClass="bg-blue-50"
            />
            <MiniStatRow
              icon={History}
              title={t('riders.workingIdHistory')}
              description={t('riders.viewWorkingIdHistoryDesc')}
              onClick={() => router.push('/admin/riders/working-id-history')}
              color="#ea580c" // orange-600
              bgClass="bg-orange-50"
            />
          </div>
        </div>


      </div>
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="hidden md:flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">{t('common.filter')}</h3>
              </div>
            </div>

            <div className="hidden md:flex flex-wrap gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('common.all')} ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('common.active')} ({stats.active})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('common.inactive')} ({stats.inactive})
              </button>
              <button
                onClick={() => setStatusFilter("fleeing")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "fleeing"
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('status.fleeing')} ({stats.fleeing})
              </button>
              <button
                onClick={() => setStatusFilter("vacation")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "vacation"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('status.vacation')} ({stats.vacation})
              </button>
              <button
                onClick={() => setStatusFilter("sick")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "sick"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('status.sick')} ({stats.sick})
              </button>
              <button
                onClick={() => setStatusFilter("accident")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "accident"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('status.accident')} ({stats.accident})
              </button>
              <button
                onClick={() => setStatusFilter("other")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "other"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                جميع الغير نشيط ({stats.other})
              </button>
              <button
                onClick={() => setStatusFilter("employees")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "employees"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('employees.title')} ({stats.employees})
              </button>
              <button
                onClick={() => setStatusFilter("inactiveEmployees")}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === "inactiveEmployees"
                  ? "bg-slate-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {t('employees.title')} {t('employees.inactiveEmployees')}  ({stats.inactiveEmployees})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('riders.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <Button
                onClick={handleExportExcel}
                className="!bg-green-600 hover:!bg-green-700 text-white !py-2 text-sm h-auto shadow-sm whitespace-nowrap"
              >
                <Download size={16} className="ml-2" />
                {t('common.exportExcel')}
              </Button>
            </div>
          </div>
        </div>


        <div className="hidden md:block">
          <Table
            columns={columns}
            data={filteredRiders}
            loading={loading}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
          ) : filteredRiders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">لا توجد بيانات</div>
          ) : (
            filteredRiders.map((rider, idx) => (
              <div key={rider.iqamaNo} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{rider.nameAR}</h3>
                        <div className="text-xs text-gray-500">{rider.nameEN}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                            {rider.workingId}
                          </span>
                          {rider.companyName && (
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                              {rider.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={rider.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 text-xs block mb-0.5">{t('riders.iqamaNumber')}</span>
                      <span className="font-mono text-gray-700">{rider.iqamaNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-0.5">{t('riders.phoneNumber')}</span>
                      <span className="font-mono text-gray-700" dir="ltr">{rider.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-0.5">{t('riders.sponsorInfo')}</span>
                      <span className="text-gray-700 truncate block">{rider.sponsor || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-0.5">{t('riders.housing')}</span>
                      <span className="text-gray-700 truncate block">{rider.housingAddress || '-'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(rider.iqamaNo)}
                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      title={t('riders.viewDetails')}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(rider.iqamaNo)}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title={t('riders.edit')}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(rider.iqamaNo)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title={t('riders.delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('riders.delete')}
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <p className="font-medium">{t('riders.confirmDelete')}</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('common.reason')} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{'اختر السبب'}</option>
              {deleteReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            {selectedReason === 'اخرى' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
                placeholder={t('common.reason')}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('common.password') || 'كلمة المرور'} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mt-1"
                placeholder={t('common.passwordPlaceholder') || 'أدخل كلمة المرور'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="!bg-red-600 hover:!bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={!selectedReason || (selectedReason === 'اخرى' && !customReason.trim()) || !deletePassword}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}