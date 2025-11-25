// File: src/app/vehicles/page.js
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Modal from '@/components/Ui/Model';
import Input from '@/components/Ui/Input';
import { Plus, Search, Edit, Trash2, Car, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';


export default function VehiclesPage() {
  const { get, post, put, delete: del, loading, error } = useApi();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({ available: 0, taken: 0, total: 0 });
  
  const [formData, setFormData] = useState({
    plateNumber: '',
    chassisNumber: '',
    serialNumber: '',
    location: '',
    isAvailable: true,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const result = await get(API_ENDPOINTS.VEHICLES.LIST);
    if (result.data) {
      setVehicles(result.data);
      calculateStats(result.data);
    }
  };

  const calculateStats = (vehiclesList) => {
    const available = vehiclesList.filter(v => v.isAvailable).length;
    const taken = vehiclesList.filter(v => !v.isAvailable).length;
    setStats({
      available,
      taken,
      total: vehiclesList.length
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingVehicle) {
        const result = await put(
          API_ENDPOINTS.VEHICLES.UPDATE(editingVehicle.plateNumber),
          formData
        );
        if (result.data) {
          setSuccessMessage('تم تحديث بيانات المركبة بنجاح');
        }
      } else {
        const result = await post(API_ENDPOINTS.VEHICLES.CREATE, formData);
        if (result.data) {
          setSuccessMessage('تم إضافة المركبة بنجاح');
        }
      }
      
      setIsModalOpen(false);
      resetForm();
      loadVehicles();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving vehicle:', err);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      chassisNumber: vehicle.chassisNumber,
      serialNumber: vehicle.serialNumber,
      location: vehicle.location,
      isAvailable: vehicle.isAvailable,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleNumber) => {
    if (confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
      const result = await del(API_ENDPOINTS.VEHICLES.DELETE(vehicleNumber));
      if (result.data) {
        setSuccessMessage('تم حذف المركبة بنجاح');
        loadVehicles();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      chassisNumber: '',
      serialNumber: '',
      location: '',
      isAvailable: true,
    });
    setEditingVehicle(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'رقم اللوحة', accessor: 'plateNumber' },
    { header: 'رقم الهيكل', accessor: 'chassisNumber' },
    { header: 'الرقم التسلسلي', accessor: 'serialNumber' },
    { 
      header: 'الحالة', 
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
          row.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.isAvailable ? (
            <>
              <CheckCircle size={14} />
              متاح
            </>
          ) : (
            <>
              <XCircle size={14} />
              مستخدم
            </>
          )}
        </span>
      )
    },
    { header: 'الموقع', accessor: 'location' },
    { 
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="تعديل"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.chassisNumber || row.plateNumber)}
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
    vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.serialNumber?.toString().includes(searchTerm) ||
    vehicle.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
      title="إدارة المركبات"
      subtitle={`إجمالي المركبات: ${stats.total}`}
      icon={Car}
      actionButton={{
        text: 'إضافة مركبة جديدة',
        icon: <Plus size={18} />,
        onClick: openCreateModal,
      }}
    />


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">إجمالي المركبات</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Car className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">المركبات المتاحة</p>
              <p className="text-3xl font-bold text-green-700">{stats.available}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">المركبات المستخدمة</p>
              <p className="text-3xl font-bold text-red-700">{stats.taken}</p>
            </div>
            <XCircle className="text-red-500" size={40} />
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

      {error && (
        <Alert type="error" title="خطأ" message={error} />
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث برقم اللوحة، رقم الهيكل، الرقم التسلسلي، أو الموقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="رقم اللوحة"
            type="text"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleInputChange}
            required
            disabled={editingVehicle !== null}
            placeholder="أدخل رقم اللوحة"
          />

          <Input
            label="رقم الهيكل"
            type="text"
            name="chassisNumber"
            value={formData.chassisNumber}
            onChange={handleInputChange}
            required
            placeholder="أدخل رقم الهيكل"
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
            label="الموقع"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="أدخل موقع المركبة"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleInputChange}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label className="text-sm text-gray-700">
              المركبة متاحة للاستخدام
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={loading}>
              {editingVehicle ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}