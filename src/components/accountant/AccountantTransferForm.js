'use client';

import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import { accountingService } from '@/lib/api/accountingService';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const toLocalDateTimeValue = (value) => {
  if (!value) return new Date().toISOString().slice(0, 16);
  return new Date(value).toISOString().slice(0, 16);
};

export default function AccountantTransferForm({ initialData, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState({
    housingId: '',
    transferredAt: toLocalDateTimeValue(),
    notes: '',
    items: [{ itemId: '', itemType: 1, quantity: 1 }],
  });
  const [spareParts, setSpareParts] = useState([]);
  const [riderAccessories, setRiderAccessories] = useState([]);
  const [housings, setHousings] = useState([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    Promise.all([
      accountingService.spareParts.listAvailable().catch(() => []),
      accountingService.riderAccessories.listAvailable().catch(() => []),
      accountingService.lookups.getHousing().catch(() => []),
    ]).then(([parts, accessories, housingData]) => {
      setSpareParts(Array.isArray(parts) ? parts : []);
      setRiderAccessories(Array.isArray(accessories) ? accessories : []);
      setHousings(Array.isArray(housingData) ? housingData : []);
    });
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      housingId: initialData.housingId || '',
      transferredAt: toLocalDateTimeValue(initialData.transferredAt),
      notes: initialData.notes || '',
      items: initialData.items?.length
        ? initialData.items.map((item) => ({
            itemId: item.itemId || '',
            itemType: Number(item.itemType) || 1,
            quantity: item.quantity || 1,
          }))
        : [{ itemId: '', itemType: 1, quantity: 1 }],
    });
  }, [initialData]);

  useEffect(() => {
    let nextError = '';
    for (const item of formData.items) {
      if (!item.itemId) continue;
      const source = Number(item.itemType) === 1 ? spareParts : riderAccessories;
      const selected = source.find((option) => String(option.id) === String(item.itemId));
      const quantity = Number.parseInt(item.quantity, 10);
      if (!quantity || quantity < 1) {
        nextError = 'الكمية يجب أن تكون أكبر من صفر';
        break;
      }
      if (selected && quantity > Number(selected.quantity || 0)) {
        nextError = `الكمية المطلوبة تتجاوز المتوفر للصنف ${selected.name}`;
        break;
      }
    }
    setValidationError(nextError);
  }, [formData.items, riderAccessories, spareParts]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const updateItem = (index, field, value) => {
    setFormData((current) => {
      const items = [...current.items];
      items[index] = {
        ...items[index],
        [field]: value,
        ...(field === 'itemType' ? { itemId: '' } : {}),
      };
      return { ...current, items };
    });
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { itemId: '', itemType: 1, quantity: 1 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validationError) return;

    onSubmit({
      housingId: formData.housingId,
      transferredAt: new Date(formData.transferredAt).toISOString(),
      notes: formData.notes,
      items: formData.items.map((item) => ({
        itemId: item.itemId,
        itemType: Number(item.itemType),
        quantity: Number.parseInt(item.quantity, 10),
        unitPrice: 0,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {validationError && <Alert type="error" message={validationError} onClose={() => setValidationError('')} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchableSelect
          label="السكن"
          name="housingId"
          value={formData.housingId}
          onChange={handleChange}
          options={housings}
          placeholder="اختر السكن"
          required
        />
        <Input
          label="تاريخ التحويل"
          name="transferredAt"
          type="datetime-local"
          value={formData.transferredAt}
          onChange={handleChange}
          required
        />
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-bold text-slate-950">الأصناف</h3>
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus size={16} />
            إضافة صنف
          </Button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => {
            const options = Number(item.itemType) === 1 ? spareParts : riderAccessories;
            return (
              <div key={index} className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[180px_1fr_130px_40px]">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">نوع الصنف</label>
                  <select
                    value={item.itemType}
                    onChange={(event) => updateItem(index, 'itemType', Number(event.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={1}>قطع غيار</option>
                    <option value={2}>معدات السائقين</option>
                  </select>
                </div>
                <SearchableSelect
                  label="الصنف"
                  value={item.itemId}
                  onChange={(event) => updateItem(index, 'itemId', event.target.value)}
                  options={options}
                  placeholder="اختر الصنف"
                  required
                />
                <Input
                  label="الكمية"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                  required
                />
                <div className="flex items-end justify-end">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      title="حذف الصنف"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ملاحظات</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="أضف ملاحظات التحويل..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button type="submit" loading={isLoading} disabled={isLoading || !!validationError} className="bg-blue-600 hover:bg-blue-700">
          {initialData ? 'حفظ التعديل' : 'إنشاء تحويل'}
        </Button>
      </div>
    </form>
  );
}
