'use client';
import { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Search, Mail, Phone, MapPin, Settings } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    address: '',
    phone: '',
    email: ''
  });

  const API_BASE = 'http://localhost:5148/api';

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/company/employees`, {
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

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const url = `${API_BASE}/company`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'تم إضافة الشركة بنجاح' 
        });
        setIsModalOpen(false);
        resetForm();
        loadCompanies();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.title || 'فشلت العملية' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = async () => {
    if (!selectedCompany) return;
    setLoading(true);

    try {
      const url = `${API_BASE}/company/${selectedCompany.name}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          details: formData.details,
          address: formData.address,
          phone: formData.phone,
          email: formData.email
        })
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'تم تحديث الشركة بنجاح' 
        });
        setIsEditModalOpen(false);
        setSelectedCompany(null);
        resetForm();
        loadCompanies();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.title || 'فشلت العملية' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
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
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حذف الشركة' });
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      details: company.details || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || ''
    });
    setIsModalOpen(true);
  };

  const openEditCompanyModal = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      details: company.details || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || ''
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      details: '',
      address: '',
      phone: '',
      email: ''
    });
    setEditingCompany(null);
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="إدارة الشركات"
        subtitle={`إجمالي الشركات: ${companies.length}`}
        icon={Building}
      />

      <div className="p-6">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة شركة
          </button>
          
          <button
            onClick={() => {
              if (companies.length > 0) {
                openEditCompanyModal(companies[0]);
              } else {
                setMessage({ type: 'error', text: 'لا توجد شركات لتعديلها' });
              }
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
          >
            <Settings size={20} />
            تعديل بيانات شركة
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="float-left">✕</button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث بالاسم أو العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <h3 className="text-xl font-bold text-white">{company.name}</h3>
                </div>
                <div className="p-6 space-y-3">
                  {company.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span className="text-sm">{company.address}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <span className="text-sm">{company.phone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      <span className="text-sm">{company.email}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => openEditCompanyModal(company)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(company.name)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">إضافة شركة جديدة</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="اسم الشركة *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="التفاصيل"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              />
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : 'إضافة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Data Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="bg-green-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">تعديل بيانات الشركة</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="اسم الشركة *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
              <input
                type="text"
                placeholder="العنوان"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="التفاصيل"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
              />
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleEditCompany}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : 'تحديث'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}