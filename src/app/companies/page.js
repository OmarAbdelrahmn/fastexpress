'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Plus, Search, Eye, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Alert from '@/components/Ui/Alert';

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = 'https://fastexpress.tryasp.net/api';

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/company/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل تحميل الشركات' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyName) => {
    if (!confirm(`هل أنت متأكد من حذف شركة ${companyName}؟`)) return;

    try {
      const response = await fetch(`${API_BASE}/company/${companyName}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم حذف الشركة بنجاح' });
        loadCompanies();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حذف الشركة' });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const stats = {
    total: companies.length,
    withEmail: companies.filter(c => c.email).length,
    withPhone: companies.filter(c => c.phone).length,
    withAddress: companies.filter(c => c.address).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="إدارة الشركات"
        subtitle={`إجمالي الشركات: ${companies.length}`}
        icon={Building}
        actionButton={{
          text: 'إضافة شركة جديدة',
          icon: <Plus size={18} />,
          onClick: () => router.push('/companies/create'),
        }}
      />

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">إجمالي الشركات</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <Building className="text-blue-200" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">لديها بريد</p>
                <p className="text-4xl font-bold">{stats.withEmail}</p>
              </div>
              <Mail className="text-green-200" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">لديها هاتف</p>
                <p className="text-4xl font-bold">{stats.withPhone}</p>
              </div>
              <Phone className="text-purple-200" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">لديها عنوان</p>
                <p className="text-4xl font-bold">{stats.withAddress}</p>
              </div>
              <MapPin className="text-orange-200" size={48} />
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <Alert
            type={message.type}
            title={message.type === 'success' ? 'نجح' : 'خطأ'}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}

        {/* Search Bar */}
        <Card>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث بالاسم، العنوان، أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Companies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">جاري تحميل الشركات...</p>
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <Building className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600 text-lg">لا توجد شركات مسجلة</p>
              <p className="text-gray-500 text-sm mt-2">ابدأ بإضافة شركة جديدة</p>
              <button
                onClick={() => router.push('/companies/create')}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus size={20} />
                إضافة شركة
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-300"
              >
                {/* Company Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                      <Building className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{company.name}</h3>
                      <p className="text-blue-100 text-sm">رمز: {company.id}</p>
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="p-5 space-y-3">
                  {company.details && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">{company.details}</p>
                    </div>
                  )}

                  {company.address && (
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">{company.address}</span>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={18} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{company.phone}</span>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={18} className="text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{company.email}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      onClick={() => router.push(`/companies/${encodeURIComponent(company.name)}/details`)}
                      className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Eye size={18} />
                      عرض
                    </button>
                    <button
                      onClick={() => router.push(`/companies/${encodeURIComponent(company.name)}/edit`)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Edit size={18} />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(company.name)}
                      className="bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}