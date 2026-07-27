'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit3, Plus, RefreshCw, XCircle } from 'lucide-react';
import Modal from '@/components/Ui/Model';
import Card from '@/components/Ui/Card';
import SearchableSelect from '@/components/Ui/SearchableSelect';
import { VacationService, displayRider, displayStage, displayStatus, itemId, listFromResponse } from '@/lib/api/vacationService';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const today = () => new Date().toISOString().slice(0, 10);
const dateValue = (value) => value ? String(value).slice(0, 10) : '—';

function Status({ status, stage }) {
  const statusValue = status ?? stage;
  const normalizedStatus = String(statusValue ?? '').toLowerCase();
  const tone = ['approved', 'active', '4', '5'].includes(normalizedStatus) ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    : ['rejected', 'cancelled', 'expired', '7', '8', '9'].includes(normalizedStatus) ? 'bg-rose-50 text-rose-700 ring-rose-600/20'
      : 'bg-amber-50 text-amber-700 ring-amber-600/20';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>{status !== null && status !== undefined ? displayStatus(status) : displayStage(stage)}</span>;
}

export default function MemberVacationPage() {
  const [requests, setRequests] = useState([]);
  const [riders, setRiders] = useState([]);
  const [vacationRiders, setVacationRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [range, setRange] = useState({ fromDate: today(), toDate: today() });
  const [form, setForm] = useState({ riderId: '', startDate: today(), endDate: today(), reason: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [requestData, riderData, activeData] = await Promise.all([
        VacationService.memberRequests(),
        ApiService.get(API_ENDPOINTS.MEMBER.RIDERS),
        VacationService.memberVacationRiders(range.fromDate, range.toDate),
      ]);
      setRequests(listFromResponse(requestData));
      setRiders(listFromResponse(riderData));
      setVacationRiders(listFromResponse(activeData));
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر تحميل بيانات الإجازات.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const refreshActive = async () => {
    try {
      const result = await VacationService.memberVacationRiders(range.fromDate, range.toDate);
      setVacationRiders(listFromResponse(result));
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر تحديث المناديب في الإجازة.' });
    }
  };

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((request) => ['pendingoperation', 'pendingaccountant', 'pendingadministration', '1', '2', '3'].includes(String(request.status).toLowerCase())).length,
    approved: requests.filter((request) => ['approved', 'active', '4', '5'].includes(String(request.status).toLowerCase())).length,
    active: vacationRiders.length,
  }), [requests, vacationRiders]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.riderId || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      if (modal?.type === 'new') {
        await VacationService.createMemberRequest({ riderId: Number(form.riderId), startDate: form.startDate, endDate: form.endDate });
        setNotice({ type: 'success', text: 'تم إرسال طلب الإجازة للمراجعة.' });
      } else if (modal?.type === 'change') {
        await VacationService.requestDateChange(itemId(modal.request), { startDate: form.startDate, endDate: form.endDate, reason: form.reason });
        setNotice({ type: 'success', text: 'تم إرسال طلب تعديل التواريخ للمراجعة.' });
      } else {
        await VacationService.requestCancellation(itemId(modal.request), { reason: form.reason });
        setNotice({ type: 'success', text: 'تم إرسال طلب الإلغاء للمراجعة.' });
      }
      setModal(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر حفظ الطلب.' });
    } finally { setSaving(false); }
  };

  const openNew = () => {
    setForm({ riderId: '', startDate: today(), endDate: today(), reason: '' });
    setModal({ type: 'new' });
  };
  const openChange = (request) => {
    setForm({ riderId: request.riderId || '', startDate: dateValue(request.startDate), endDate: dateValue(request.endDate), reason: '' });
    setModal({ type: 'change', request });
  };
  const openCancellation = (request) => {
    setForm({ riderId: request.riderId || '', startDate: '', endDate: '', reason: '' });
    setModal({ type: 'cancellation', request });
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلبات الإجازات</h1>
          <p className="text-gray-500">أرسل طلبات الإجازة وتابع الموافقات للمناديب في سكنك.</p>
        </div>
        <button onClick={openNew} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"><Plus size={18} /> طلب إجازة</button>
      </div>

      {notice && <div className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}><span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="إخفاء التنبيه"><XCircle size={18} /></button></div>}

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">سجل الطلبات</h2><p className="mt-0.5 text-xs text-slate-500">يمكن تعديل التواريخ أو طلب الإلغاء قبل اكتمال الإجراء.</p></div><button onClick={load} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="تحديث الطلبات"><RefreshCw size={18} /></button></div>
          {loading ? <Loading /> : requests.length === 0 ? <Empty text="لا توجد طلبات إجازة حتى الآن." /> : <div className="overflow-x-auto"><table className="min-w-full text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3 font-semibold">المندوب</th><th className="px-5 py-3 font-semibold">الفترة</th><th className="px-5 py-3 font-semibold">الحالة</th><th className="px-5 py-3 font-semibold">إجراء</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((request, index) => <tr key={itemId(request) || index}><td className="px-5 py-4 font-medium text-slate-800">{displayRider(request)}</td><td className="px-5 py-4 whitespace-nowrap text-slate-600">{dateValue(request.startDate)} <span className="text-slate-400">—</span> {dateValue(request.endDate)}</td><td className="px-5 py-4"><Status status={request.status} stage={request.stage} /></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openChange(request)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" title="تعديل التواريخ" aria-label="تعديل التواريخ"><Edit3 size={16} /></button><button onClick={() => openCancellation(request)} className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">إلغاء</button></div></td></tr>)}</tbody></table></div>}
        </Card>

        <Card className="p-0">
          <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">المناديب في إجازة</h2><p className="mt-1 text-xs text-slate-500">الطلبات المعتمدة أو الإجازات النشطة ضمن النطاق.</p></div><button onClick={refreshActive} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="تحديث القائمة"><RefreshCw size={18} /></button></div>
          <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium text-slate-600">من<input type="date" value={range.fromDate} onChange={(e) => setRange((old) => ({ ...old, fromDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></label><label className="text-xs font-medium text-slate-600">إلى<input type="date" value={range.toDate} onChange={(e) => setRange((old) => ({ ...old, toDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" /></label></div>
          <button onClick={refreshActive} className="mt-3 w-full rounded-lg border border-blue-200 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">عرض الفترة</button>
          <div className="mt-4 space-y-2">{loading ? <Loading /> : vacationRiders.length === 0 ? <Empty text="لا يوجد مندوب في إجازة ضمن هذه الفترة." /> : vacationRiders.map((rider, index) => <div key={rider.riderId || rider.id || index} className="rounded-xl bg-slate-50 p-3"><p className="font-semibold text-slate-800">{displayRider(rider)}</p><p className="mt-1 text-xs text-slate-500">{dateValue(rider.startDate)} — {dateValue(rider.endDate)}</p></div>)}</div>
        </Card>
      </div>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.type === 'new' ? 'طلب إجازة جديد' : modal?.type === 'change' ? 'طلب تعديل تواريخ' : 'طلب إلغاء الإجازة'}>
        <form className="space-y-4" onSubmit={submit}>
          {modal?.type === 'new' && <SearchableSelect
            label="المندوب"
            name="riderId"
            required
            value={form.riderId}
            onChange={(event) => setForm((old) => ({ ...old, riderId: event.target.value }))}
            placeholder="ابحث باسم المندوب العربي أو الإنجليزي"
            options={riders.map((rider) => ({
              id: rider.riderId || rider.id,
              name: [rider.nameAR || rider.nameAr || rider.name, rider.nameEN || rider.nameEn].filter(Boolean).join(' — ') || displayRider(rider),
            }))}
          />}
          {modal?.type !== 'cancellation' && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><DateInput label="تاريخ البداية" value={form.startDate} onChange={(value) => setForm((old) => ({ ...old, startDate: value }))} /><DateInput label="تاريخ النهاية" min={form.startDate} value={form.endDate} onChange={(value) => setForm((old) => ({ ...old, endDate: value }))} /></div>}
          {modal?.type !== 'new' && <label className="block text-sm font-semibold text-slate-700">السبب<textarea required value={form.reason} onChange={(e) => setForm((old) => ({ ...old, reason: e.target.value }))} className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 p-3" placeholder="اكتب السبب" /></label>}
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModal(null)} className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">إلغاء</button><button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'جارٍ الإرسال...' : 'إرسال الطلب'}</button></div>
        </form>
      </Modal>
    </div>
  );
}

function Loading() { return <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>; }
function Empty({ text }) { return <div className="py-10 text-center text-sm text-slate-500">{text}</div>; }
function DateInput({ label, value, min, onChange }) { return <label className="block text-sm font-semibold text-slate-700">{label}<input required type="date" min={min} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 p-3" /></label>; }
