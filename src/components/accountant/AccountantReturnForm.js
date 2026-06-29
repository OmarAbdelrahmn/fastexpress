'use client';

import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import { accountingService } from '@/lib/api/accountingService';
import { getCurrentAccountantUser } from '@/lib/auth/accountantAuth';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const EMPTY_ITEM = { itemId: '', itemType: 1, quantity: 1, unitPrice: 0 };

export default function AccountantReturnForm({ initialData, suppliers = [], onSubmit, onCancel, isLoading = false }) {
  const currentUser = getCurrentAccountantUser();
  const [formData, setFormData] = useState({
    supplierId: '',
    returnNumber: '',
    reason: '',
    processedBy: currentUser?.unique_name || currentUser?.userName || currentUser?.name || '',
    notes: '',
    items: [EMPTY_ITEM],
  });
  const [spareParts, setSpareParts] = useState([]);
  const [riderAccessories, setRiderAccessories] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      const [parts, accessories] = await Promise.all([
        accountingService.spareParts.listAvailable().catch(() => []),
        accountingService.riderAccessories.listAvailable().catch(() => []),
      ]);
      setSpareParts(Array.isArray(parts) ? parts : []);
      setRiderAccessories(Array.isArray(accessories) ? accessories : []);
    };

    loadItems();
  }, []);

  useEffect(() => {
    if (!initialData) {
      setFormData({
        supplierId: '',
        returnNumber: '',
        reason: '',
        processedBy: currentUser?.unique_name || currentUser?.userName || currentUser?.name || '',
        notes: '',
        items: [EMPTY_ITEM],
      });
      return;
    }

    setFormData({
      supplierId: initialData.supplierId || '',
      returnNumber: initialData.returnNumber || '',
      reason: initialData.reason || '',
      processedBy: initialData.processedBy || currentUser?.unique_name || currentUser?.userName || currentUser?.name || '',
      notes: initialData.notes || '',
      items: initialData.items?.length
        ? initialData.items.map((item) => ({
            itemId: item.itemId || '',
            itemType: Number(item.itemType || 1),
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            itemName: item.itemName || '',
          }))
        : [EMPTY_ITEM],
    });
  }, [initialData, currentUser?.name, currentUser?.unique_name, currentUser?.userName]);

  const totalAmount = useMemo(
    () =>
      formData.items.reduce(
        (total, item) => total + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0
      ),
    [formData.items]
  );

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((current) => {
      const items = current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const nextItem = { ...item, [field]: value };

        if (field === 'itemType') {
          nextItem.itemType = Number(value);
          nextItem.itemId = '';
          nextItem.itemName = '';
          nextItem.unitPrice = 0;
        }

        if (field === 'itemId' && value) {
          const source = nextItem.itemType === 1 ? spareParts : riderAccessories;
          const selectedItem = source.find((option) => String(option.id) === String(value));
          if (selectedItem) {
            nextItem.itemName = selectedItem.name || '';
            nextItem.unitPrice = selectedItem.price || 0;
          }
        }

        return nextItem;
      });

      return { ...current, items };
    });
  };

  const addItem = () => {
    setFormData((current) => ({ ...current, items: [...current.items, { ...EMPTY_ITEM }] }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      supplierId: Number(formData.supplierId),
      returnNumber: formData.returnNumber,
      reason: formData.reason,
      processedBy: formData.processedBy,
      notes: formData.notes,
      items: formData.items.map((item) => {
        const source = Number(item.itemType) === 1 ? spareParts : riderAccessories;
        const selectedItem = source.find((option) => String(option.id) === String(item.itemId));

        return {
          itemId: Number(item.itemId),
          itemName: item.itemName || selectedItem?.name || '',
          itemType: Number(item.itemType),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        };
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchableSelect
          label="المورد"
          name="supplierId"
          value={formData.supplierId}
          onChange={handleFieldChange}
          options={suppliers}
          required
          placeholder="اختر المورد"
        />
        <Input
          label="رقم المرتجع"
          name="returnNumber"
          value={formData.returnNumber}
          onChange={handleFieldChange}
          required
          placeholder="RET-001"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="سبب الإرجاع"
          name="reason"
          value={formData.reason}
          onChange={handleFieldChange}
          required
          placeholder="سبب الإرجاع..."
        />
        <Input label="بواسطة" name="processedBy" value={formData.processedBy} onChange={handleFieldChange} />
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-bold text-slate-950">الأصناف المرتجعة</h3>
          <Button type="button" variant="secondary" onClick={addItem} className="text-sm">
            <Plus size={16} />
            إضافة صنف
          </Button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 lg:grid-cols-12">
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">النوع</label>
                <select
                  value={item.itemType}
                  onChange={(event) => handleItemChange(index, 'itemType', event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value={1}>قطع غيار</option>
                  <option value={2}>معدات السائقين</option>
                </select>
              </div>
              <div className="lg:col-span-4">
                <SearchableSelect
                  label="الصنف"
                  value={item.itemId}
                  onChange={(event) => handleItemChange(index, 'itemId', event.target.value)}
                  options={item.itemType === 1 ? spareParts : riderAccessories}
                  placeholder="اختر الصنف"
                  required
                />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="الكمية"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="سعر الوحدة"
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(event) => handleItemChange(index, 'unitPrice', event.target.value)}
                  required
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">الإجمالي</label>
                <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-bold text-blue-700">
                  {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)}
                </div>
              </div>
              {formData.items.length > 1 && (
                <div className="lg:col-span-12">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    حذف الصنف
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
          <span className="font-bold text-slate-800">المبلغ الإجمالي للمرتجع</span>
          <span className="text-xl font-bold text-blue-700">{totalAmount.toFixed(2)} ر.س</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">ملاحظات</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleFieldChange}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="أضف ملاحظات إضافية..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
        <Button type="submit" loading={isLoading} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {initialData ? 'تحديث' : 'تأكيد المرتجع'}
        </Button>
      </div>
    </form>
  );
}
