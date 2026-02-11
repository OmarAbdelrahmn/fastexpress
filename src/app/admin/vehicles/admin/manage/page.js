'use client';

import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Modal from '@/components/Ui/Model';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import { Search, Edit, Trash2, Car, Eye, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { formatPlateNumber, formatLicenseExpiry } from "@/lib/utils/formatters";

export default function VehicleManagePage() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '',
    serialNumber: '',
    plateNumberA: '',
    plateNumberE: '',
    ownerId: '',
    ownerName: '',
    manufacturer: '',
    manufactureYear: '',
    licenseExpiryDate: '',
    location: '',
    vehicleImagePath: '',
    licenseImagePath: '',
    extraImage: '',
    extraImage1: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/vehicles');
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setErrorMessage(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (editingVehicle) {
        // Update vehicle
        await ApiService.put(
          `/api/vehicles/${editingVehicle.plateNumberA}`,
          {
            vehicleType: formData.vehicleType,
            serialNumber: parseInt(formData.serialNumber),
            plateNumberA: formData.plateNumberA,
            plateNumberE: formData.plateNumberE,
            ownerId: formData.ownerId,
            ownerName: formData.ownerName,
            manufacturer: formData.manufacturer,
            manufactureYear: parseInt(formData.manufactureYear),
            licenseExpiryDate: formData.licenseExpiryDate,
            location: formData.location,
            vehicleImagePath: formData.vehicleImagePath,
            licenseImagePath: formData.licenseImagePath,
            extraImage: formData.extraImage,
            extraImage1: formData.extraImage1
          }
        );
        setSuccessMessage(t('vehicles.updateVehicleSuccess'));
      } else {
        // Create new vehicle
        await ApiService.post('/api/vehicles', {
          vehicleNumber: formData.vehicleNumber,
          vehicleType: formData.vehicleType,
          serialNumber: parseInt(formData.serialNumber),
          plateNumberA: formData.plateNumberA,
          plateNumberE: formData.plateNumberE,
          ownerId: formData.ownerId,
          ownerName: formData.ownerName,
          manufacturer: formData.manufacturer,
          manufactureYear: parseInt(formData.manufactureYear),
          licenseExpiryDate: formData.licenseExpiryDate,
          location: formData.location,
          vehicleImagePath: formData.vehicleImagePath || null,
          licenseImagePath: formData.licenseImagePath || null,
          extraImage: formData.extraImage || null,
          extraImage1: formData.extraImage1 || null
        });
        setSuccessMessage(t('vehicles.addVehicleSuccess'));
      }

      setIsModalOpen(false);
      resetForm();
      loadVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setErrorMessage(err?.message || t('common.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      serialNumber: vehicle.serialNumber.toString(),
      plateNumberA: vehicle.plateNumberA,
      plateNumberE: vehicle.plateNumberE || '',
      ownerId: vehicle.ownerId?.toString() || '',
      ownerName: vehicle.ownerName || '',
      manufacturer: vehicle.manufacturer || '',
      manufactureYear: vehicle.manufactureYear?.toString() || '',
      licenseExpiryDate: vehicle.licenseExpiryDate ? vehicle.licenseExpiryDate.split('T')[0] : '',
      location: vehicle.location || '',
      vehicleImagePath: vehicle.vehicleImagePath || '',
      licenseImagePath: vehicle.licenseImagePath || '',
      extraImage: vehicle.extraImage || '',
      extraImage1: vehicle.extraImage1 || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleNumber) => {
    if (confirm(t('vehicles.confirmDeleteVehicle'))) {
      try {
        await ApiService.delete(`/api/vehicles/${vehicleNumber}`);
        setSuccessMessage(t('vehicles.deleteVehicleSuccess'));
        loadVehicles();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        setErrorMessage(t('vehicles.deleteVehicleError'));
        setTimeout(() => setErrorMessage(''), 5000);
      }
    }
  };

  const handleViewDetails = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      vehicleType: '',
      serialNumber: '',
      plateNumberA: '',
      plateNumberE: '',
      ownerId: '',
      ownerName: '',
      manufacturer: '',
      manufactureYear: '',
      licenseExpiryDate: '',
      location: '',
      vehicleImagePath: '',
      licenseImagePath: '',
      extraImage: '',
      extraImage1: ''
    });
    setEditingVehicle(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: t('vehicles.plateNumber'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Car className="text-blue-500" size={16} />
          <span className="font-medium">{formatPlateNumber(row.plateNumberA)}</span>
        </div>
      )
    },
    { header: t('vehicles.vehicleNumber'), accessor: 'vehicleNumber' },
    { header: t('vehicles.serialNumber'), accessor: 'serialNumber' },
    { header: t('vehicles.vehicleType'), accessor: 'vehicleType' },
    { header: t('vehicles.manufacturer'), accessor: 'manufacturer' },
    { header: t('vehicles.manufactureYear'), accessor: 'manufactureYear' },
    { header: t('vehicles.location'), accessor: 'location' },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-green-600 hover:text-green-800 p-1"
            title={t('vehicles.viewDetails')}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('common.edit')}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.vehicleNumber)}
            className="text-red-600 hover:text-red-800 p-1"
            title={t('common.delete')}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.serialNumber?.toString().includes(searchTerm) ||
    vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <PageHeader
        title={t('vehicles.manageVehiclesTitle')}
        subtitle={t('vehicles.manageVehiclesSubtitle')}
        icon={Settings}
      />

      <div className="px-6 space-y-6">
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">{t('vehicles.totalVehicles')}</p>
                <p className="text-3xl font-bold text-blue-700">{vehicles.length}</p>
              </div>
              <Car className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">{t('vehicles.locatedVehicles')}</p>
                <p className="text-3xl font-bold text-green-700">
                  {vehicles.filter(v => v.location).length}
                </p>
              </div>
              <Settings className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">{t('vehicles.displayedResults')}</p>
                <p className="text-3xl font-bold text-orange-700">{filteredVehicles.length}</p>
              </div>
              <Search className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        <Card>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('vehicles.searchPlaceholderManage')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredVehicles}
            loading={loading}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingVehicle ? t('vehicles.editVehicleTitle') : t('vehicles.addNewVehicle')}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">{t('vehicles.basicInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('vehicles.vehicleNumber')}
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  required
                  disabled={editingVehicle !== null}
                  placeholder={t('vehicles.vehicleNumber')}
                />

                <Input
                  label={t('vehicles.vehicleType')}
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  placeholder={t('vehicles.vehicleType')}
                />

                <Input
                  label={t('vehicles.serialNumber')}
                  type="number"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                  placeholder={t('vehicles.serialNumber')}
                />

                <Input
                  label={t('vehicles.plateNumberArabic')}
                  type="text"
                  name="plateNumberA"
                  value={formData.plateNumberA}
                  onChange={handleInputChange}
                  required
                  placeholder={t('vehicles.plateNumberArabic')}
                />

                <Input
                  label={t('vehicles.plateNumberEnglish')}
                  type="text"
                  name="plateNumberE"
                  value={formData.plateNumberE}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.plateNumberEnglish')}
                />

                <Input
                  label={t('vehicles.location')}
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.location')}
                />
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">{t('vehicles.ownerInfo')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('vehicles.ownerId')}
                  type="number"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  required
                  placeholder={t('vehicles.ownerId')}
                />

                <Input
                  label={t('vehicles.ownerName')}
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.ownerName')}
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">{t('vehicles.vehicleDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('vehicles.manufacturer')}
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.manufacturer')}
                />

                <Input
                  label={t('vehicles.manufactureYear')}
                  type="number"
                  name="manufactureYear"
                  value={formData.manufactureYear}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.yearPlaceholder')}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />

                <Input
                  label={t('vehicles.licenseExpiryDate')}
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Images (Optional) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">{t('vehicles.imagesOptional')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('vehicles.imagesNote')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('vehicles.vehicleImage')}
                  type="text"
                  name="vehicleImagePath"
                  value={formData.vehicleImagePath}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.vehicleImage')}
                />

                <Input
                  label={t('vehicles.licenseImage')}
                  type="text"
                  name="licenseImagePath"
                  value={formData.licenseImagePath}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.licenseImage')}
                />

                <Input
                  label={t('vehicles.extraImage1')}
                  type="text"
                  name="extraImage"
                  value={formData.extraImage}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.extraImage1')}
                />

                <Input
                  label={t('vehicles.extraImage2')}
                  type="text"
                  name="extraImage1"
                  value={formData.extraImage1}
                  onChange={handleInputChange}
                  placeholder={t('vehicles.extraImage2Placeholder')}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {editingVehicle ? t('common.update') : t('common.add')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedVehicle(null);
          }}
          title={t('vehicles.vehicleDetailsTitle')}
          size="lg"
        >
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">{t('vehicles.basicInfo')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.vehicleNumber')}</p>
                    <p className="font-medium">{selectedVehicle.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.vehicleType')}</p>
                    <p className="font-medium">{selectedVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.plateNumberArabic')}</p>
                    <p className="font-medium">{formatPlateNumber(selectedVehicle.plateNumberA)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.plateNumberEnglish')}</p>
                    <p className="font-medium">{selectedVehicle.plateNumberE || t('vehicles.notSpecified')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.serialNumber')}</p>
                    <p className="font-medium">{selectedVehicle.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.location')}</p>
                    <p className="font-medium">{selectedVehicle.location || t('vehicles.notSpecified')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.manufacturer')}</p>
                    <p className="font-medium">{selectedVehicle.manufacturer || t('vehicles.notSpecified')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.manufactureYear')}</p>
                    <p className="font-medium">{selectedVehicle.manufactureYear || t('vehicles.notSpecified')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.ownerName')}</p>
                    <p className="font-medium">{selectedVehicle.ownerName || t('vehicles.notSpecified')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">{t('vehicles.ownerId')}</p>
                    <p className="font-medium">{selectedVehicle.ownerId || t('vehicles.notSpecified')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 mb-1">{t('vehicles.licenseExpiryDate')}</p>
                    <p className="font-medium">
                      {selectedVehicle.licenseExpiryDate
                        ? formatLicenseExpiry(selectedVehicle.licenseExpiryDate)
                        : t('vehicles.notSpecified')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}