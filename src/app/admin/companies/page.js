'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Plus, Search, Eye, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Alert from '@/components/Ui/Alert';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function CompaniesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [companyToDelete, setCompanyToDelete] = useState(null);


  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    }
    catch (error) {
      setMessage({ type: 'error', text: t('companies.loadError') });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (companyName) => {
    setCompanyToDelete(companyName);
    setShowPasswordModal(true);
    setDeletePassword('');
  };

  const handleConfirmDelete = async () => {
    if (deletePassword !== '3333') {
      alert(t('common.incorrectPassword') || 'Incorrect Password');
      return;
    }

    setShowPasswordModal(false);

    try {
      await ApiService.delete(API_ENDPOINTS.COMPANY.DELETE(companyToDelete));

      setMessage({ type: 'success', text: t('companies.deleteSuccess') });
      loadCompanies();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      setMessage({ type: 'error', text: t('companies.deleteError') });
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
        title={t('companies.manageCompanies')}
        subtitle={`${t('companies.totalCompanies')}: ${companies.length}`}
        icon={Building}
        actionButton={{
          text: t('companies.addCompany'),
          icon: <Plus size={18} />,
          onClick: () => router.push('/admin/companies/create'),
        }}
      />

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">{t('companies.totalCompanies')}</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <Building className="text-blue-200" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">{t('companies.withEmail')}</p>
                <p className="text-4xl font-bold">{stats.withEmail}</p>
              </div>
              <Mail className="text-green-200" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">{t('companies.withPhone')}</p>
                <p className="text-4xl font-bold">{stats.withPhone}</p>
              </div>
              <Phone className="text-purple-200" size={48} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">{t('companies.withAddress')}</p>
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
            title={message.type === 'success' ? t('common.success') : t('common.error')}
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
              placeholder={t('common.search')}
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
              <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <Building className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600 text-lg">{t('common.noData')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('companies.addCompany')}</p>
              <button
                onClick={() => router.push('/admin/companies/create')}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus size={20} />
                {t('companies.addCompany')}
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
                      <p className="text-blue-100 text-sm">ID: {company.id}</p>
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
                      onClick={() => router.push(`/admin/companies/${encodeURIComponent(company.name)}/details`)}
                      className="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Eye size={18} />
                      {t('common.view')}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/companies/${encodeURIComponent(company.name)}/edit`)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Edit size={18} />
                      {t('common.edit')}
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

      {
        showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-[90%]">
              <h3 className="text-xl font-bold mb-4">{t('common.enterPassword') || 'Enter Password'}</h3>
              <p className="text-gray-600 mb-4">
                {t('companies.confirmDeleteMessage') || 'Please enter the password to confirm deletion.'}
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t('common.password') || 'Password'}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {t('common.confirm') || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}