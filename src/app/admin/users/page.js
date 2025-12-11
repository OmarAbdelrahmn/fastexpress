// File: src/app/dashboard/admin/users/page.js
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
import PageHeader from '@/components/layout/pageheader';
import { Plus, Search, Edit, UserX, UserCheck, Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const { get, put, loading, error } = useApi();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'name', 'id'
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await get(API_ENDPOINTS.ADMIN.USERS);
    if (result.data) {
      setUsers(Array.isArray(result.data) ? result.data : [result.data]);
    }
  };

  const handleSearch = async () => {
    if (searchType === 'all') {
      loadUsers();
      return;
    }

    if (!searchValue.trim()) {
      setSuccessMessage('');
      return;
    }

    try {
      let result;
      if (searchType === 'name') {
        result = await get(API_ENDPOINTS.ADMIN.BY_NAME(searchValue));
      } else if (searchType === 'id') {
        result = await get(API_ENDPOINTS.ADMIN.BY_ID(searchValue));
      }

      if (result.data) {
        setUsers(Array.isArray(result.data) ? result.data : [result.data]);
        setSuccessMessage(`تم العثور على ${Array.isArray(result.data) ? result.data.length : 1} مستخدم`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error searching user:', err);
    }
  };

  const handleToggleStatus = async (userName, currentStatus) => {
    const action = currentStatus ? 'تعطيل' : 'تفعيل';
    if (confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) {
      try {
        const result = await put(API_ENDPOINTS.ADMIN.TOGGLE_STATUS(userName));
        if (result.data || !result.error) {
          setSuccessMessage(`تم ${action} المستخدم بنجاح`);
          loadUsers();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error toggling user status:', err);
      }
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'اسم المستخدم',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User className="text-orange-500" size={16} />
          <span className="font-medium">{row.userName}</span>
        </div>
      )
    },
    {
      header: 'الاسم الكامل',
      render: (row) => row.fullName || <span className="text-gray-400">لم يتم تحديده</span>
    },
    {
      header: 'العنوان',
      render: (row) => row.address || <span className="text-gray-400">لم يتم تحديده</span>
    },
    {
      header: 'الصلاحيات',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles && row.roles.length > 0 ? (
            row.roles.map((role, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <Shield size={12} />
                {role}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">لا توجد صلاحيات</span>
          )}
        </div>
      )
    },
    {
      header: 'الحالة',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${!row.isDisable
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {!row.isDisable ? (
            <>
              <UserCheck size={14} />
              نشط
            </>
          ) : (
            <>
              <UserX size={14} />
              معطل
            </>
          )}
        </span>
      )
    },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="عرض التفاصيل"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => window.location.href = `/admin/users/${row.userName}/roles`}
            className="text-purple-600 hover:text-purple-800 p-1"
            title="إدارة الأدوار"
          >
            <Shield size={18} />
          </button>
          <button
            onClick={() => handleToggleStatus(row.userName, !row.isDisable)}
            className={`${!row.isDisable ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} p-1`}
            title={!row.isDisable ? 'تعطيل' : 'تفعيل'}
          >
            {!row.isDisable ? <UserX size={18} /> : <UserCheck size={18} />}
          </button>
        </div>
      )
    },
  ];

  const filteredUsers = users.filter(user =>
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين"
        subtitle="إدارة حسابات المستخدمين والصلاحيات"
        icon={Shield}
        stats={[
          { label: 'إجمالي المستخدمين', value: users.length },
          { label: 'النشطين', value: users.filter(u => !u.isDisable).length },
          { label: 'المعطلين', value: users.filter(u => u.isDisable).length },
        ]}
      // statsClassName="text-lg md:text-xl font-bold"
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

      {/* Advanced Search */}
      <Card title="البحث المتقدم">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع البحث
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">جميع المستخدمين</option>
              <option value="name">البحث بالاسم</option>
              <option value="id">البحث بالمعرف</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              قيمة البحث
            </label>
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === 'name' ? 'أدخل اسم المستخدم' :
                  searchType === 'id' ? 'أدخل المعرف' :
                    'اختر نوع البحث'
              }
              disabled={searchType === 'all'}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              بحث
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Filter */}
      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="تصفية سريعة بالاسم، اسم المستخدم، العنوان، أو المعرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredUsers}
          loading={loading}
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title="تفاصيل المستخدم"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المعرف</p>
                  <p className="font-medium text-gray-800 text-xs break-all">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">اسم المستخدم</p>
                  <p className="font-medium text-gray-800">{selectedUser.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
                  <p className="font-medium text-gray-800">
                    {selectedUser.fullName || 'لم يتم تحديده'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">العنوان</p>
                  <p className="font-medium text-gray-800">
                    {selectedUser.address || 'لم يتم تحديده'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">الصلاحيات والحالة</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">الصلاحيات</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles && selectedUser.roles.length > 0 ? (
                      selectedUser.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium flex items-center gap-1"
                        >
                          <Shield size={14} />
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">لا توجد صلاحيات</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">حالة الحساب</p>
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-fit ${!selectedUser.isDisable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {!selectedUser.isDisable ? (
                      <>
                        <UserCheck size={16} />
                        الحساب نشط
                      </>
                    ) : (
                      <>
                        <UserX size={16} />
                        الحساب معطل
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                إغلاق
              </Button>
              <Button
                type="button"
                variant={!selectedUser.isDisable ? 'danger' : 'success'}
                onClick={() => {
                  handleToggleStatus(selectedUser.userName, !selectedUser.isDisable);
                  setIsModalOpen(false);
                }}
                loading={loading}
              >
                {!selectedUser.isDisable ? (
                  <>
                    <UserX size={18} />
                    تعطيل الحساب
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    تفعيل الحساب
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}