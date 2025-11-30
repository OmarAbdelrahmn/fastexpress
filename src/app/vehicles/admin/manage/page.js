'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Modal from '@/components/Ui/Model';
import Input from '@/components/Ui/Input';
import { Plus, Search, Edit, Trash2, Car, Eye, Settings } from 'lucide-react';

export default function VehicleManagePage() {
  const router = useRouter();
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
      setErrorMessage('حدث خطأ في تحميل البيانات');
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
            ownerId: parseInt(formData.ownerId),
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
        setSuccessMessage('تم تحديث بيانات المركبة بنجاح');
      } else {
        // Create new vehicle
        await ApiService.post('/api/vehicles', {
          vehicleNumber: formData.vehicleNumber,
          vehicleType: formData.vehicleType,
          serialNumber: parseInt(formData.serialNumber),
          plateNumberA: formData.plateNumberA,
          plateNumberE: formData.plateNumberE,
          ownerId: parseInt(formData.ownerId),
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
        setSuccessMessage('تم إضافة المركبة بنجاح');
      }
      
      setIsModalOpen(false);
      resetForm();
      loadVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ البيانات');
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
    if (confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
      try {
        await ApiService.delete(`/api/vehicles/${vehicleNumber}`);
        setSuccessMessage('تم حذف المركبة بنجاح');
        loadVehicles();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        setErrorMessage('حدث خطأ في حذف المركبة');
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
      header: 'رقم اللوحة', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Car className="text-blue-500" size={16} />
          <span className="font-medium">{row.plateNumberA}</span>
        </div>
      )
    },
    { header: 'رقم المركبة', accessor: 'vehicleNumber' },
    { header: 'الرقم التسلسلي', accessor: 'serialNumber' },
    { header: 'النوع', accessor: 'vehicleType' },
    { header: 'الشركة المصنعة', accessor: 'manufacturer' },
    { header: 'سنة الصنع', accessor: 'manufactureYear' },
    { header: 'الموقع', accessor: 'location' },
    { 
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleViewDetails(row)}
            className="text-green-600 hover:text-green-800 p-1"
            title="عرض التفاصيل"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="تعديل"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.vehicleNumber)}
            className="text-red-600 hover:text-red-800 p-1"
            title="حذف"
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
      {/* Full Width Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">إدارة المركبات</h1>
              <p className="text-purple-100">عرض وتعديل وحذف بيانات المركبات</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg transition font-medium"
          >
            <Plus size={18} />
            <span>إضافة مركبة جديدة</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {successMessage && (
          <Alert 
            type="success" 
            title="نجاح" 
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">إجمالي المركبات</p>
                <p className="text-3xl font-bold text-blue-700">{vehicles.length}</p>
              </div>
              <Car className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">مركبات محددة الموقع</p>
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
                <p className="text-sm text-orange-600 mb-1">النتائج المعروضة</p>
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
                placeholder="البحث برقم اللوحة، رقم المركبة، النوع، أو الموقع..."
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
          title={editingVehicle ? 'تعديل بيانات المركبة' : 'إضافة مركبة جديدة'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="رقم المركبة"
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  required
                  disabled={editingVehicle !== null}
                  placeholder="أدخل رقم المركبة"
                />

                <Input
                  label="نوع المركبة"
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: دراجة نارية، سيارة..."
                />

                <Input
                  label="الرقم التسلسلي"
                  type="number"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل الرقم التسلسلي"
                />

                <Input
                  label="رقم اللوحة (عربي)"
                  type="text"
                  name="plateNumberA"
                  value={formData.plateNumberA}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل رقم اللوحة بالعربي"
                />

                <Input
                  label="رقم اللوحة (إنجليزي)"
                  type="text"
                  name="plateNumberE"
                  value={formData.plateNumberE}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم اللوحة بالإنجليزي"
                />

                <Input
                  label="الموقع"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="أدخل موقع المركبة"
                />
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">معلومات المالك</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="رقم هوية المالك"
                  type="number"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل رقم الهوية"
                />

                <Input
                  label="اسم المالك"
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المالك"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">تفاصيل المركبة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="الشركة المصنعة"
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="مثال: هوندا، تويوتا..."
                />

                <Input
                  label="سنة الصنع"
                  type="number"
                  name="manufactureYear"
                  value={formData.manufactureYear}
                  onChange={handleInputChange}
                  placeholder="مثال: 2023"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />

                <Input
                  label="تاريخ انتهاء الرخصة"
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Images (Optional) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">الصور (اختياري)</h3>
              <p className="text-sm text-gray-600 mb-4">يمكنك إضافة روابط الصور أو تركها فارغة</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="صورة المركبة"
                  type="text"
                  name="vehicleImagePath"
                  value={formData.vehicleImagePath}
                  onChange={handleInputChange}
                  placeholder="رابط صورة المركبة"
                />

                <Input
                  label="صورة الرخصة"
                  type="text"
                  name="licenseImagePath"
                  value={formData.licenseImagePath}
                  onChange={handleInputChange}
                  placeholder="رابط صورة الرخصة"
                />

                <Input
                  label="صورة إضافية 1"
                  type="text"
                  name="extraImage"
                  value={formData.extraImage}
                  onChange={handleInputChange}
                  placeholder="رابط صورة إضافية"
                />

                <Input
                  label="صورة إضافية 2"
                  type="text"
                  name="extraImage1"
                  value={formData.extraImage1}
                  onChange={handleInputChange}
                  placeholder="رابط صورة إضافية"
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
                إلغاء
              </Button>
              <Button type="submit" loading={loading} disabled={loading}>
                {editingVehicle ? 'تحديث' : 'إضافة'}
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
          title="تفاصيل المركبة"
          size="lg"
        >
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">رقم المركبة</p>
                    <p className="font-medium">{selectedVehicle.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">نوع المركبة</p>
                    <p className="font-medium">{selectedVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">رقم اللوحة (عربي)</p>
                    <p className="font-medium">{selectedVehicle.plateNumberA}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">رقم اللوحة (إنجليزي)</p>
                    <p className="font-medium">{selectedVehicle.plateNumberE || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">الرقم التسلسلي</p>
                    <p className="font-medium">{selectedVehicle.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">الموقع</p>
                    <p className="font-medium">{selectedVehicle.location || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">الشركة المصنعة</p>
                    <p className="font-medium">{selectedVehicle.manufacturer || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">سنة الصنع</p>
                    <p className="font-medium">{selectedVehicle.manufactureYear || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">اسم المالك</p>
                    <p className="font-medium">{selectedVehicle.ownerName || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">رقم هوية المالك</p>
                    <p className="font-medium">{selectedVehicle.ownerId || 'غير محدد'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 mb-1">تاريخ انتهاء الرخصة</p>
                    <p className="font-medium">
                      {selectedVehicle.licenseExpiryDate 
                        ? new Date(selectedVehicle.licenseExpiryDate).toLocaleDateString('en-US')
                        : 'غير محدد'}
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