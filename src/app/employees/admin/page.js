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
import {
  Plus, Search, Edit, Trash2, Eye, Users,
  FileSpreadsheet, Filter, AlertCircle, UserCheck,
  Clock, Archive, BarChart3, Calendar, History
} from 'lucide-react';

export default function EmployeeAdminPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.LIST);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setErrorMessage(err?.message || 'حدث خطأ في تحميل بيانات الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (iqamaNo) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      await ApiService.delete(API_ENDPOINTS.EMPLOYEE.DELETE(iqamaNo));
      setSuccessMessage('تم حذف الموظف بنجاح');
      loadEmployees();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setErrorMessage(err?.message || 'حدث خطأ في حذف الموظف');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const columns = [
    {
      header: 'رقم الإقامة',
      accessor: 'iqamaNo',
      render: (row) => (
        <span className="font-bold text-blue-600">{row.iqamaNo}</span>
      )
    },
    { header: 'الاسم (عربي)', accessor: 'nameAR' },
    { header: 'الاسم (إنجليزي)', accessor: 'nameEN' },
    { header: 'البلد', accessor: 'country' },
    { header: 'رقم الهاتف', accessor: 'phone' },
    { header: 'المسمى الوظيفي', accessor: 'jobTitle' },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/employees/admin/${row.iqamaNo}/details`)}
            className="text-green-600 hover:text-green-800 p-1"
            title="عرض التفاصيل"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => router.push(`/employees/admin/${row.iqamaNo}/edit`)}
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

  const filteredEmployees = employees.filter(emp =>
    emp.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.iqamaNo?.toString().includes(searchTerm) ||
    emp.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.sponsor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'enable').length,
    inactive: employees.filter(e => e.status === 'disable').length,
    countries: new Set(employees.map(e => e.country)).size
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الموظفين - لوحة المسؤول"
        subtitle={`إجمالي الموظفين: ${employees.length}`}
        icon={Users}
        actionButton={{
          text: 'إضافة موظف جديد',
          icon: <Plus size={18} />,
          onClick: () => router.push('/employees/admin/create'),
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">إجمالي الموظفين</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">النشطين</p>
              <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            </div>
            <UserCheck className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-r-4 border-red-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">غير النشطين</p>
              <p className="text-3xl font-bold text-red-700">{stats.inactive}</p>
            </div>
            <AlertCircle className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">عدد الدول</p>
              <p className="text-3xl font-bold text-purple-700">{stats.countries}</p>
            </div>
            <Filter className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <button
            onClick={() => router.push('/employees/admin/create')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Plus className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">إضافة موظف</h3>
                <p className="text-sm text-gray-600">موظف جديد</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/search')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Search className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">البحث الذكي</h3>
                <p className="text-sm text-gray-600">بحث متقدم</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/filter')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">البحث المتقدم</h3>
                <p className="text-sm text-gray-600">تصفية متعددة</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/statistics')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <BarChart3 className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">الإحصائيات</h3>
                <p className="text-sm text-gray-600">لوحة البيانات</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/date-range')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 p-3 rounded-lg">
                <Calendar className="text-cyan-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">السجل الزمني</h3>
                <p className="text-sm text-gray-600">حسب التاريخ</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/import-excel')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileSpreadsheet className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">استيراد Excel</h3>
                <p className="text-sm text-gray-600">رفع ملف</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/temp-imports')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">البيانات المؤقتة</h3>
                <p className="text-sm text-gray-600">مراجعة التحديثات</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/status-requests')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">طلبات الحالة</h3>
                <p className="text-sm text-gray-600">تفعيل/تعطيل</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/employees/admin/deleted')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <Archive className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">الموظفين المحذوفين</h3>
                <p className="text-sm text-gray-600">الأرشيف</p>
              </div>
            </div>
          </button>
        </Card>
      </div>

      {successMessage && (
        <Alert
          type="success"
          title="نجح"
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

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم الإقامة، البلد، أو الكفيل..."
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
    </div>
  );
}