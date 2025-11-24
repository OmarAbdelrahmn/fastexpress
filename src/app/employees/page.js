// File: src/app/employees/page.js
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
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';

export default function EmployeesPage() {
  const { get, post, put, delete: del, loading, error } = useApi();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    iqamaNo: '',
    name: '',
    phoneNumber: '',
    nationality: '',
    jobTitle: '',
    salary: '',
    companyName: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const result = await get(API_ENDPOINTS.EMPLOYEE.LIST);
    if (result.data) {
      setEmployees(result.data);
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
      if (editingEmployee) {
        const result = await put(
          API_ENDPOINTS.EMPLOYEE.UPDATE(editingEmployee.iqamaNo),
          formData
        );
        if (result.data) {
          setSuccessMessage('تم تحديث بيانات الموظف بنجاح');
        }
      } else {
        const result = await post(API_ENDPOINTS.EMPLOYEE.CREATE, formData);
        if (result.data) {
          setSuccessMessage('تم إضافة الموظف بنجاح');
        }
      }
      
      setIsModalOpen(false);
      resetForm();
      loadEmployees();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      iqamaNo: employee.iqamaNo,
      name: employee.name,
      phoneNumber: employee.phoneNumber,
      nationality: employee.nationality,
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      companyName: employee.companyName,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (iqamaNo) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      const result = await del(API_ENDPOINTS.EMPLOYEE.DELETE(iqamaNo));
      if (result.data) {
        setSuccessMessage('تم حذف الموظف بنجاح');
        loadEmployees();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      iqamaNo: '',
      name: '',
      phoneNumber: '',
      nationality: '',
      jobTitle: '',
      salary: '',
      companyName: '',
    });
    setEditingEmployee(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'رقم الإقامة', accessor: 'iqamaNo' },
    { header: 'الاسم', accessor: 'name' },
    { header: 'رقم الهاتف', accessor: 'phoneNumber' },
    { header: 'الجنسية', accessor: 'nationality' },
    { header: 'المسمى الوظيفي', accessor: 'jobTitle' },
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

  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.iqamaNo?.toString().includes(searchTerm) ||
    employee.phoneNumber?.includes(searchTerm) ||
    employee.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
        <Button onClick={openCreateModal}>
          <Plus size={18} />
          إضافة موظف جديد
        </Button>
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
              placeholder="البحث بالاسم، رقم الإقامة، رقم الهاتف، أو الشركة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredEmployees} 
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
        title={editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم الإقامة"
              type="number"
              name="iqamaNo"
              value={formData.iqamaNo}
              onChange={handleInputChange}
              required
              disabled={editingEmployee !== null}
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
              label="رقم الهاتف"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              placeholder="أدخل رقم الهاتف"
            />

            <Input
              label="الجنسية"
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              required
              placeholder="أدخل الجنسية"
            />

            <Input
              label="المسمى الوظيفي"
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              placeholder="أدخل المسمى الوظيفي"
            />

            <Input
              label="الراتب"
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="أدخل الراتب"
            />

            <Input
              label="اسم الشركة"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="أدخل اسم الشركة"
              className="md:col-span-2"
            />
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
              {editingEmployee ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}