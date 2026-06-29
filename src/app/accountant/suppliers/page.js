'use client';

import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import { accountingService } from '@/lib/api/accountingService';
import { Building2, Edit, Mail, Phone, Plus, Power, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const EMPTY_FORM = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  taxNumber: '',
  commercialRegister: '',
};

export default function AccountantSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await accountingService.suppliers.list();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ في تحميل الموردين');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return suppliers;

    return suppliers.filter((supplier) =>
      [
        supplier.name,
        supplier.contactPerson,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplier.taxNumber,
        supplier.commercialRegister,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [searchTerm, suppliers]);

  const activeCount = suppliers.filter((supplier) => supplier.isActive).length;
  const inactiveCount = suppliers.length - activeCount;

  const openCreateForm = () => {
    setEditingSupplier(null);
    setFormData(EMPTY_FORM);
    setFormOpen(true);
    setErrorMessage('');
  };

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      taxNumber: supplier.taxNumber || '',
      commercialRegister: supplier.commercialRegister || '',
    });
    setFormOpen(true);
    setErrorMessage('');
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingSupplier(null);
    setFormData(EMPTY_FORM);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !formData.name.trim()) return;

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingSupplier) {
        await accountingService.suppliers.update(editingSupplier.id, formData);
        setSuccessMessage('تم تحديث المورد بنجاح');
      } else {
        await accountingService.suppliers.create(formData);
        setSuccessMessage('تم إضافة المورد بنجاح');
      }

      closeForm();
      await loadSuppliers();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ في حفظ المورد');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!confirm(`هل أنت متأكد من حذف المورد ${supplier.name || ''}؟`)) return;

    try {
      await accountingService.suppliers.delete(supplier.id);
      setSuccessMessage('تم حذف المورد بنجاح');
      await loadSuppliers();
    } catch (error) {
      setErrorMessage(error?.message || 'حدث خطأ في حذف المورد');
    }
  };

  const handleToggleStatus = async (supplier) => {
    const action = supplier.isActive ? 'تعطيل' : 'تفعيل';
    if (!confirm(`هل أنت متأكد من ${action} هذا المورد؟`)) return;

    try {
      await accountingService.suppliers.toggleActive(supplier.id);
      setSuccessMessage(`تم ${action} المورد بنجاح`);
      await loadSuppliers();
    } catch (error) {
      setErrorMessage(error?.message || `حدث خطأ في ${action} المورد`);
    }
  };

  const columns = [
    {
      header: 'اسم المورد',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-950">{row.name}</p>
          <p className="mt-1 text-xs text-slate-500">{row.contactPerson || '-'}</p>
        </div>
      ),
    },
    {
      header: 'معلومات الاتصال',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone size={14} className="text-slate-400" />
            <span dir="ltr">{row.phone || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Mail size={14} className="text-slate-400" />
            <span>{row.email || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'البيانات الرسمية',
      render: (row) => (
        <div className="space-y-1 text-sm text-slate-700">
          <p>الضريبي: {row.taxNumber || '-'}</p>
          <p>السجل: {row.commercialRegister || '-'}</p>
        </div>
      ),
    },
    {
      header: 'الحالة',
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
            row.isActive ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {row.isActive ? 'نشط' : 'غير نشط'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditForm(row)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
            title="تعديل"
          >
            <Edit size={17} />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
            title={row.isActive ? 'تعطيل' : 'تفعيل'}
          >
            <Power size={17} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            title="حذف"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">الموردين</h1>
          <p className="mt-1 text-sm text-slate-600">إدارة بيانات الموردين لحسابات الصيانة والمشتريات</p>
        </div>
        <Button type="button" onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={18} />
          إضافة مورد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">إجمالي الموردين</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">{suppliers.length}</p>
            </div>
            <Building2 className="text-slate-400" size={34} />
          </div>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">نشط</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-red-600">غير نشط</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{inactiveCount}</p>
        </div>
      </div>

      {successMessage && (
        <Alert type="success" title="نجح" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {errorMessage && (
        <Alert type="error" title="خطأ" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="البحث بالاسم، المسؤول، الهاتف، البريد، الرقم الضريبي، أو السجل التجاري..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-4 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <Table columns={columns} data={filteredSuppliers} loading={loading} />
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editingSupplier ? 'تعديل مورد' : 'إضافة مورد'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">الاسم مطلوب، وباقي البيانات حسب المتوفر من المورد.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="اسم المورد" name="name" value={formData.name} onChange={handleInputChange} required />
              <Input
                label="مسؤول التواصل"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
              />
              <Input label="الهاتف" name="phone" value={formData.phone} onChange={handleInputChange} dir="ltr" />
              <Input label="البريد الإلكتروني" name="email" value={formData.email} onChange={handleInputChange} />
              <Input label="الرقم الضريبي" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} />
              <Input
                label="السجل التجاري"
                name="commercialRegister"
                value={formData.commercialRegister}
                onChange={handleInputChange}
              />
              <div className="md:col-span-2">
                <Input label="العنوان" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                إلغاء
              </Button>
              <Button type="submit" loading={saving} disabled={saving || !formData.name.trim()} className="bg-blue-600 hover:bg-blue-700">
                {editingSupplier ? 'حفظ التعديل' : 'إضافة المورد'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
