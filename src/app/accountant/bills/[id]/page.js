'use client';

import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import { accountingService } from '@/lib/api/accountingService';
import { ArrowRight, Building2, Calendar, FileText, Hash, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getItemTypeName = (type) => {
  if (Number(type) === 1) return 'قطع غيار';
  if (Number(type) === 2) return 'معدات السائقين';
  return 'غير محدد';
};

export default function AccountantBillDetailsPage() {
  const params = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBill = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await accountingService.bills.getById(params.id);
        setBill(data);
      } catch (err) {
        setError(err?.message || 'حدث خطأ في تحميل بيانات الفاتورة');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadBill();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link href="/accountant/bills">
          <Button variant="outline">
            <ArrowRight size={18} />
            العودة للفواتير
          </Button>
        </Link>
        <Alert type="error" title="خطأ" message={error || 'الفاتورة غير موجودة'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">فاتورة رقم: {bill.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-slate-600">تفاصيل الفاتورة والأصناف المرتبطة بها</p>
        </div>
        <Link href="/accountant/bills">
          <Button variant="outline">
            <ArrowRight size={18} />
            العودة للفواتير
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">عدد الأصناف</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{bill.items?.length || bill.totalItems || 0}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">المبلغ الإجمالي</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{formatMoney(bill.totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">المورد</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{bill.supplierName || '-'}</p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-950">
          <FileText size={21} className="text-blue-700" />
          معلومات الفاتورة
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Hash size={16} />
              رقم الفاتورة
            </p>
            <p className="font-bold text-slate-950">{bill.invoiceNumber}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Building2 size={16} />
              المورد
            </p>
            <p className="font-bold text-slate-950">{bill.supplierName || '-'}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Calendar size={16} />
              التاريخ
            </p>
            <p className="font-bold text-slate-950">{formatDate(bill.invoiceDate || bill.processedAt)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-1 text-sm font-semibold text-slate-500">ملاحظات</p>
            <p className="font-bold text-slate-950">{bill.notes || '-'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-950">
          <Package size={21} className="text-blue-700" />
          أصناف الفاتورة
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">الصنف</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">النوع</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">الكمية</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">سعر الوحدة</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {bill.items?.map((item, index) => {
                const lineTotal = item.totalPrice ?? item.lineTotal ?? Number(item.quantity || 0) * Number(item.unitPrice || 0);
                return (
                  <tr key={item.id || `${item.itemId}-${index}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-950">{item.itemName || item.itemId}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{getItemTypeName(item.itemType)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatMoney(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-700">{formatMoney(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                  الإجمالي
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-700">{formatMoney(bill.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
