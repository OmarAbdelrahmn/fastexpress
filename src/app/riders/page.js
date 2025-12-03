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
import { Plus, Search, Edit, Trash2, UserCheck, Eye, Users, Building, Package } from 'lucide-react';

export default function RidersPage() {
  const router = useRouter();
  const [riders, setRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage(err?.message || 'حدث خطأ في تحميل بيانات المناديب');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (iqamaNo) => {
    if (!confirm('هل أنت متأكد من حذف هذا المندوب؟')) return;

    try {
      await ApiService.delete(API_ENDPOINTS.RIDER.DELETE(iqamaNo));
      setSuccessMessage('تم حذف المندوب بنجاح');
      loadRiders();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting rider:', err);
      setErrorMessage(err?.message || 'حدث خطأ في حذف المندوب');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleViewDetails = (iqamaNo) => {
    router.push(`/riders/${iqamaNo}/details`);
  };

  const handleEdit = (iqamaNo) => {
    router.push(`/riders/${iqamaNo}/edit`);
  };

  const columns = [
    { 
      header: 'رقم العمل',
      accessor: 'workingId',
      render: (row) => (
        <span className="font-bold text-blue-600">{row.workingId || 'N/A'}</span>
      )
    },
    { header: 'رقم الإقامة', accessor: 'iqamaNo' },
    { header: 'الاسم (عربي)', accessor: 'nameAR' },
    { header: 'الاسم (إنجليزي)', accessor: 'nameEN' },
    { 
      header: 'الشركة',
      accessor: 'companyName',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-gray-500" />
          <span>{row.companyName}</span>
        </div>
      )
    },
    { 
      header: 'السكن',
      accessor: 'housingAddress',
      render: (row) => (
        <span className="text-gray-600">{row.housingAddress || 'غير محدد'}</span>
      )
    },
    { 
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'enable' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.status === 'enable'  ? 'نشط' : 'غير نشط'}
        </span>
      )
    },
    { 
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleViewDetails(row.iqamaNo)}
            className="text-green-600 hover:text-green-800 p-1"
            title="عرض التفاصيل"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => handleEdit(row.iqamaNo)}
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
    rider.nameAR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.nameEN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.workingId?.toString().includes(searchTerm) ||
    rider.iqamaNo?.toString().includes(searchTerm) ||
    rider.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.sponsor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const stats = {
    total: riders.length,
    active: riders.filter(r => r.status === 'enable').length,
    companies: new Set(riders.map(r => r.companyName)).size,
    withHousing: riders.filter(r => r.housingAddress).length
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المناديب"
        subtitle={`إجمالي المناديب: ${riders.length}`}
        icon={UserCheck}
        actionButton={{
          text: 'إضافة مندوب جديد',
          icon: <Plus size={18} />,
          onClick: () => router.push('/riders/create'),
        }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">إجمالي المناديب</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-green-50 border-r-4 border-green-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">المناديب النشطين</p>
              <p className="text-3xl font-bold text-green-700">{stats.active}</p>
            </div>
            <UserCheck className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">عدد الشركات</p>
              <p className="text-3xl font-bold text-purple-700">{stats.companies}</p>
            </div>
            <Building className="text-purple-500" size={40} />
          </div>
        </div>

        <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">لديهم سكن</p>
              <p className="text-3xl font-bold text-orange-700">{stats.withHousing}</p>
            </div>
            <Package className="text-orange-500" size={40} />
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

      {errorMessage && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <button
            onClick={() => router.push('/riders/search')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Search className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">البحث الذكي</h3>
                <p className="text-sm text-gray-600">ابحث عن مندوب بأي معلومة</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/riders/change-working-id')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">تغيير رقم العمل</h3>
                <p className="text-sm text-gray-600">تحديث رقم عمل المندوب</p>
              </div>
            </div>
          </button>
        </Card>

        <Card>
          <button
            onClick={() => router.push('/riders/add-to-employee')}
            className="w-full p-4 text-right hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Plus className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">إضافة إلى موظف</h3>
                <p className="text-sm text-gray-600">تحويل موظف إلى مندوب</p>
              </div>
            </div>
          </button>
        </Card>
      </div>
      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم العمل، رقم الإقامة، الشركة، البلد، أو الكفيل..."
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

      {/* Quick Actions */}
      
    </div>
  );
}