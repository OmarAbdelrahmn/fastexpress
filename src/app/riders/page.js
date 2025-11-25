// File: src/app/riders/page.js
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
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

export default function RidersPage() {
  const { get, post, put, delete: del, loading, error } = useApi();
  const [riders, setRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    workingId: '',
    iqamaNo: '',
    name: '',
    companyName: '',
  });

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    const result = await get(API_ENDPOINTS.RIDER.LIST);
    if (result.data) {
      setRiders(result.data);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRider) {
        const result = await put(
          API_ENDPOINTS.RIDER.UPDATE(editingRider.iqamaNo),
          formData
        );
        if (result.data) {
          setSuccessMessage('تم تحديث بيانات السائق بنجاح');
        }
      } else {
        const result = await post(API_ENDPOINTS.RIDER.CREATE, formData);
        if (result.data) {
          setSuccessMessage('تم إضافة السائق بنجاح');
        }
      }
      
      setIsModalOpen(false);
      resetForm();
      loadRiders();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving rider:', err);
    }
  };

  const handleEdit = (rider) => {
    setEditingRider(rider);
    setFormData({
      workingId: rider.workingId,
      iqamaNo: rider.iqamaNo,
      name: rider.name,
      companyName: rider.companyName,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (iqamaNo) => {
    if (confirm('هل أنت متأكد من حذف هذا السائق؟')) {
      const result = await del(API_ENDPOINTS.RIDER.DELETE(iqamaNo));
      if (result.data) {
        setSuccessMessage('تم حذف السائق بنجاح');
        loadRiders();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      workingId: '',
      iqamaNo: '',
      name: '',
      companyName: '',
    });
    setEditingRider(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'رقم العمل', accessor: 'workingId' },
    { header: 'رقم الإقامة', accessor: 'iqamaNo' },
    { header: 'الاسم', accessor: 'name' },
    { header: 'الشركة', accessor: 'companyName' },
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
            onClick={() => handleDelete(row.iqamaNo)}
            className="text-red-600 hover:text-red-800 p-1"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    },
  ];

  const filteredRiders = riders.filter(rider =>
    rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.workingId?.toString().includes(searchTerm) ||
    rider.iqamaNo?.toString().includes(searchTerm) ||
    rider.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة السائقين"
        subtitle={`إجمالي السائقين: ${riders.length}`}
        icon={UserCheck}
        actionButton={{
          text: 'إضافة سائق جديد',
          icon: <Plus size={18} />,
          onClick: openCreateModal,
        }}
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

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم العمل، رقم الإقامة، أو الشركة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredRiders} 
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
        title={editingRider ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="رقم العمل"
            type="number"
            name="workingId"
            value={formData.workingId}
            onChange={handleInputChange}
            required
            placeholder="أدخل رقم العمل"
          />

          <Input
            label="رقم الإقامة"
            type="number"
            name="iqamaNo"
            value={formData.iqamaNo}
            onChange={handleInputChange}
            required
            disabled={editingRider !== null}
            placeholder="أدخل رقم الإقامة"
          />

          <Input
            label="الاسم الكامل"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="أدخل الاسم"
          />

          <Input
            label="اسم الشركة"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="أدخل اسم الشركة"
          />

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
              {editingRider ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}