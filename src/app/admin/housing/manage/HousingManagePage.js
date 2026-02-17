'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Modal from '@/components/Ui/Model';
import PageHeader from '@/components/layout/pageheader';
import { Home, Plus, Search, Edit, Trash2, Users, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function HousingManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [housings, setHousings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedHousing, setSelectedHousing] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Delete Password State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [housingToDelete, setHousingToDelete] = useState(null);

  useEffect(() => {
    try {
      const success = searchParams?.get('success');
      const error = searchParams?.get('error');

      if (success) {
        setSuccessMessage(decodeURIComponent(success));
        setTimeout(() => setSuccessMessage(''), 3000);
        router.replace('/admin/housing/manage');
      }

      if (error) {
        setErrorMessage(decodeURIComponent(error));
        setTimeout(() => setErrorMessage(''), 5000);
        router.replace('/admin/housing/manage');
      }
    } catch (err) {
      console.error('Error reading search params:', err);
    }

    loadHousings();
  }, []);

  const loadHousings = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/Housing');
      setHousings(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Error loading housings:', err);
      setErrorMessage(t('housing.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (housing) => {
    setHousingToDelete(housing);
    setDeletePassword('');
    setIsDeleteModalOpen(true);
  };

  const verifyAndDelete = async () => {
    if (deletePassword !== '4444') {
      setErrorMessage(t('common.wrongPassword') || 'Wrong Password');
      return;
    }

    try {
      await ApiService.delete(`/api/Housing/${housingToDelete.name}`);
      setSuccessMessage(t('housing.deleteSuccess'));
      loadHousings();
      setIsDeleteModalOpen(false);
      setHousingToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting housing:', err);
      setErrorMessage(t('housing.deleteError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleViewDetails = async (housing) => {
    try {
      const data = await ApiService.get(`/api/Housing/${housing.name}`);
      setSelectedHousing(Array.isArray(data) ? data[0] : data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Error loading housing details:', err);
      setErrorMessage(t('housing.loadError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEdit = (housing) => {
    router.push(`/admin/housing/create?edit=${housing.name}`);
  };

  const columns = [
    {
      header: t('housing.housingName'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Home className="text-blue-500" size={16} />
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    {
      header: t('housing.address'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <MapPin className="text-gray-400" size={14} />
          <span>{row.address}</span>
        </div>
      )
    },
    { header: t('housing.capacity'), accessor: 'capacity' },
    {
      header: t('housing.currentOccupancy'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${row.employees.length >= row.capacity ? 'text-red-600' : 'text-green-600'
            }`}>
            {row.employees.length || 0} / {row.capacity}
          </span>
          {row.employees.length >= row.capacity && (
            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
              {t('housing.full')}
            </span>
          )}
        </div>
      )
    },
    {
      header: t('housing.managerIqama'),
      render: (row) => (
        <span className="font-medium">
          {row.managerIqamaNo || row.ManagerIqamaNo || '---'}
        </span>
      )
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-green-600 hover:text-green-800 p-1"
            title={t('housing.viewResidents')}
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('common.edit')}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-600 hover:text-red-800 p-1"
            title={t('common.delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  const filteredHousings = housings.filter(housing =>
    (housing.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (housing.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (housing.managerIqamaNo?.toString() || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('housing.manageHousing')}
        subtitle={`${t('housing.totalHousing')}: ${housings.length}`}
        icon={Home}
        actionButton={{
          text: t('housing.addHousing'),
          icon: <Plus size={18} />,
          onClick: () => router.push('/admin/housing/create'),
        }}
      />

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">{t('housing.totalHousing')}</p>
              <p className="text-3xl font-bold text-blue-700">{housings.length}</p>
            </div>
            <Home className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">{t('housing.totalCapacity')}</p>
              <p className="text-3xl font-bold text-green-700">
                {housings.reduce((sum, h) => sum + (h.capacity || 0), 0)}
              </p>
            </div>
            <Users className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">{t('housing.currentOccupancy')}</p>
              <p className="text-3xl font-bold text-orange-700">
                {housings.reduce((sum, h) => sum + (h.currentOccupancy || 0), 0)}
              </p>
            </div>
            <Users className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button onClick={() => router.push('/admin/housing/create')}>
            <Plus size={18} className="ml-2" />
            {t('housing.addHousing')}
          </Button>
        </div>

        <Table
          columns={columns}
          data={filteredHousings}
          loading={loading}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedHousing(null);
        }}
        title={t('common.details')}
        size="lg"
      >
        {selectedHousing && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">{t('common.details')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('housing.housingName')}</p>
                  <p className="font-medium text-gray-800">{selectedHousing.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('housing.address')}</p>
                  <p className="font-medium text-gray-800">{selectedHousing.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('housing.capacity')}</p>
                  <p className="font-medium text-gray-800">{selectedHousing.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('housing.currentOccupancy')}</p>
                  <p className="font-medium text-gray-800">
                    {selectedHousing.employees.length || 0} / {selectedHousing.capacity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('housing.managerIqama')}</p>
                  <p className="font-medium text-gray-800">{selectedHousing.managerIqamaNo}</p>
                </div>
                {selectedHousing.managerName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('housing.manager')}</p>
                    <p className="font-medium text-gray-800">{selectedHousing.managerName}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedHousing.employees && selectedHousing.employees.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">
                  {t('housing.residents')} ({selectedHousing.employees.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedHousing.employees.map((emp, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{emp.nameAR}</p>
                          <p className="text-sm text-gray-500">{emp.nameEN}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">{emp.jobTitle}</p>
                          <p className="text-xs text-gray-500">{t('employees.iqamaNumber')}: {emp.iqamaNo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedHousing(null);
                }}
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Password Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setHousingToDelete(null);
          setDeletePassword('');
        }}
        title={t('common.confirmDelete') || 'Confirm Delete'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('common.enterPasswordToDelete') || 'Please enter the password to confirm deletion.'}
          </p>

          <div>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('common.password') || 'Password'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setHousingToDelete(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={verifyAndDelete}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}