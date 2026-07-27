'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, RefreshCw, XCircle } from 'lucide-react';
import Modal from '@/components/Ui/Model';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import { TokenManager } from '@/lib/auth/tokenManager';
import { VacationService, displayAmendmentStatus, displayRider, displayStage, displayStatus, itemId, listFromResponse } from '@/lib/api/vacationService';

const blankFilters = { status: '', stage: '', riderId: '', fromDate: '', toDate: '', page: 1, pageSize: 50 };
const dateValue = (value) => value ? String(value).slice(0, 10) : '—';

function Status({ status, stage }) {
  const statusValue = status ?? stage;
  const normalizedStatus = String(statusValue ?? '').toLowerCase();
  const color = ['approved', 'active', '4', '5'].includes(normalizedStatus) ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : ['rejected', 'cancelled', 'expired', '7', '8', '9'].includes(normalizedStatus) ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${color}`}>{status !== null && status !== undefined ? displayStatus(status) : displayStage(stage)}</span>;
}

export default function AdminVacationPage() {
  const [requests, setRequests] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [changes, setChanges] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  const currentUser = TokenManager.getUserFromToken() || {};
  const rawRoles = currentUser.roles ?? currentUser.role ?? currentUser['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  const isMaster = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]).some((role) => String(role).toLowerCase() === 'master');

  const load = async (selectedFilters = filters) => {
    setLoading(true);
    try {
      const [requestsResult, inboxResult, changesResult, cancellationResult] = await Promise.all([
        VacationService.requests(selectedFilters), VacationService.inbox(), VacationService.dateChanges(), VacationService.cancellations(),
      ]);
      setRequests(listFromResponse(requestsResult));
      setInbox(listFromResponse(inboxResult));
      setChanges(listFromResponse(changesResult));
      setCancellations(listFromResponse(cancellationResult));
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر تحميل بيانات الإجازات.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const stats = useMemo(() => ({ requests: requests.length, inbox: inbox.length, changes: changes.length, cancellations: cancellations.length }), [requests, inbox, changes, cancellations]);

  const decide = async (endpoint, id, decision) => {
    setSaving(true);
    try {
      await endpoint(id, { decision, reason });
      setModal(null); setReason('');
      setNotice({ type: 'success', text: decision === 1 ? 'تم اعتماد القرار بنجاح.' : 'تم رفض الطلب بنجاح.' });
      await load();
    } catch (error) { setNotice({ type: 'error', text: error.message || 'تعذر حفظ القرار.' }); }
    finally { setSaving(false); }
  };

  const cancelRequest = async () => {
    setSaving(true);
    try {
      await VacationService.cancel(itemId(modal.item), { reason });
      setModal(null); setReason(''); setNotice({ type: 'success', text: 'تم إلغاء طلب الإجازة.' }); await load();
    } catch (error) { setNotice({ type: 'error', text: error.message || 'تعذر إلغاء الطلب.' }); }
    finally { setSaving(false); }
  };

  const applyFilters = (event) => { event.preventDefault(); load(filters); };

  return <section className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
    <PageHeader
      title="إدارة إجازات المناديب"
      subtitle="صندوق الموافقات، المتابعة، وصلاحيات سير عمل الإجازات."
      icon={CalendarCheck2}
      actions={<Button variant="outline" onClick={() => load()}><RefreshCw size={17} /> تحديث البيانات</Button>}
      stats={[
        { label: 'كل الطلبات', value: stats.requests },
        { label: 'بانتظار قرارك', value: stats.inbox },
        { label: 'تعديلات التواريخ', value: stats.changes },
        { label: 'طلبات الإلغاء', value: stats.cancellations },
      ]}
    />
    <div className="p-6 space-y-6">
      {notice && <div className={`flex justify-between gap-3 rounded-xl border p-4 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}><span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="إخفاء التنبيه"><XCircle size={18} /></button></div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200" role="tablist" aria-label="أقسام إدارة الإجازات">
        <button role="tab" aria-selected={activeTab === 'requests'} onClick={() => setActiveTab('requests')} className={`rounded-t-lg px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'requests' ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>صندوق الموافقات وسجل الطلبات</button>
        <button role="tab" aria-selected={activeTab === 'amendments'} onClick={() => setActiveTab('amendments')} className={`rounded-t-lg px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'amendments' ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>تعديلات وإلغاءات الإجازات</button>
      </div>

      {activeTab === 'requests' && <>
      <Card className="p-0"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">صندوق الموافقات</h2><p className="mt-1 text-xs text-slate-500">يعرض الطلبات القابلة للإجراء حسب صلاحيات الإجازات الممنوحة لك.</p></div>{loading ? <Loading /> : inbox.length === 0 ? <Empty text="لا توجد طلبات تتطلب قرارك حالياً." /> : <div className="grid gap-3 p-4 md:grid-cols-2">{inbox.map((request, index) => <RequestCard key={itemId(request) || index} item={request} actions={<><button onClick={() => { setReason(''); setModal({ type: 'decision', item: request }); }} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">اتخاذ قرار</button>{isMaster && <button onClick={() => { setReason(''); setModal({ type: 'cancel', item: request }); }} className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">إلغاء مباشر</button>}</>} />)}</div>}</Card>

      <Card className="p-0"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">سجل طلبات الإجازة</h2></div><form onSubmit={applyFilters} className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-3 xl:grid-cols-6"><Filter label="الحالة" value={filters.status} onChange={(value) => setFilters((old) => ({ ...old, status: value }))} options={[{ value: '1', label: 'بانتظار العمليات' }, { value: '2', label: 'بانتظار المحاسب' }, { value: '3', label: 'بانتظار الإدارة' }, { value: '4', label: 'معتمد' }, { value: '5', label: 'إجازة نشطة' }, { value: '6', label: 'مكتمل' }, { value: '7', label: 'مرفوض' }, { value: '8', label: 'ملغي' }, { value: '9', label: 'منتهي الصلاحية' }]} /><Filter label="المرحلة" value={filters.stage} onChange={(value) => setFilters((old) => ({ ...old, stage: value }))} options={[{ value: '1', label: 'العمليات' }, { value: '2', label: 'المحاسب' }, { value: '3', label: 'الإدارة' }]} /><label className="text-xs font-semibold text-slate-600">رقم المندوب<input value={filters.riderId} onChange={(e) => setFilters((old) => ({ ...old, riderId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label><DateFilter label="من" value={filters.fromDate} onChange={(value) => setFilters((old) => ({ ...old, fromDate: value }))} /><DateFilter label="إلى" value={filters.toDate} onChange={(value) => setFilters((old) => ({ ...old, toDate: value }))} /><button className="mt-auto min-h-10 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700">تطبيق</button></form>{loading ? <Loading /> : requests.length === 0 ? <Empty text="لا توجد طلبات مطابقة للتصفية." /> : <div className="overflow-x-auto"><table className="min-w-full text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">المندوب</th><th className="px-5 py-3">الفترة</th><th className="px-5 py-3">الحالة / المرحلة</th><th className="px-5 py-3">إجراء</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((request, index) => <tr key={itemId(request) || index}><td className="px-5 py-4 font-semibold text-slate-800">{displayRider(request)}</td><td className="px-5 py-4 whitespace-nowrap text-slate-600">{dateValue(request.startDate)} — {dateValue(request.endDate)}</td><td className="px-5 py-4"><Status status={request.status} stage={request.stage} /></td><td className="px-5 py-4">{isMaster && <button onClick={() => { setReason(''); setModal({ type: 'cancel', item: request }); }} className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">إلغاء</button>}</td></tr>)}</tbody></table></div>}</Card>
      </>}

      {activeTab === 'amendments' && <div className="grid gap-6 xl:grid-cols-2"><ReviewQueue title="طلبات تعديل التواريخ" items={changes} empty="لا توجد طلبات تعديل تواريخ." canResolve={isMaster} onResolve={(item) => { setReason(''); setModal({ type: 'date-change', item }); }} /><ReviewQueue title="طلبات إلغاء الإجازة المقدمة من المشرف" description="طلبات يرسلها العضو لإلغاء إجازة مندوب، ويعتمدها أو يرفضها الـ Master." items={cancellations} empty="لا توجد طلبات إلغاء إجازة مقدمة من الأعضاء." canResolve={isMaster} onResolve={(item) => { setReason(''); setModal({ type: 'cancellation', item }); }} /></div>}
    </div>
    <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.type === 'cancel' ? 'إلغاء الإجازة مباشرة' : modal?.type === 'decision' ? 'اتخاذ قرار على طلب الإجازة' : modal?.type === 'date-change' ? 'قرار تعديل التواريخ' : 'قرار طلب الإلغاء'}><div className="space-y-4"><p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{modal && displayRider(modal.item)}</p><label className="block text-sm font-semibold text-slate-700">سبب القرار<textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 p-3" placeholder="اكتب السبب (اختياري)" /></label><div className="flex justify-end gap-3"><button onClick={() => setModal(null)} className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">إلغاء</button>{modal?.type === 'cancel' ? <button disabled={saving} onClick={cancelRequest} className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'جارٍ الحفظ...' : 'تأكيد الإلغاء'}</button> : <><button disabled={saving} onClick={() => decide(modal.type === 'decision' ? VacationService.decide : modal.type === 'date-change' ? VacationService.decideDateChange : VacationService.decideCancellation, itemId(modal.item), 2)} className="rounded-lg border border-rose-200 px-4 py-2 font-semibold text-rose-700 hover:bg-rose-50">رفض</button><button disabled={saving} onClick={() => decide(modal.type === 'decision' ? VacationService.decide : modal.type === 'date-change' ? VacationService.decideDateChange : VacationService.decideCancellation, itemId(modal.item), 1)} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60">اعتماد</button></>}</div></div></Modal>
  </section>;
}

function RequestCard({ item, actions }) { return <article className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold text-slate-900">{displayRider(item)}</h3><p className="mt-1 text-xs text-slate-500">{dateValue(item.startDate)} — {dateValue(item.endDate)}</p></div><Status status={item.status} stage={item.stage} /></div><div className="mt-4 flex flex-wrap gap-2">{actions}</div></article>; }
function ReviewQueue({ title, description, items, empty, canResolve, onResolve }) { return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}{!canResolve && <p className="mt-1 text-xs text-slate-500">القرار النهائي متاح للـ Master فقط.</p>}</div><div className="divide-y divide-slate-100">{items.length === 0 ? <Empty text={empty} /> : items.map((item, index) => <div key={itemId(item) || index} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold text-slate-800">{displayRider(item)}</p><p className="mt-1 text-xs text-slate-500">{dateValue(item.startDate || item.requestedStartDate)} — {dateValue(item.endDate || item.requestedEndDate)}</p>{item.status !== undefined && item.status !== null && <p className="mt-1 text-xs font-medium text-slate-600">الحالة: {displayAmendmentStatus(item.status)}</p>}</div>{canResolve && <button onClick={() => onResolve(item)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">مراجعة</button>}</div>)}</div></section>; }
function Loading() { return <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>; }
function Empty({ text }) { return <div className="p-8 text-center text-sm text-slate-500">{text}</div>; }
function Filter({ label, value, onChange, options }) { return <label className="text-xs font-semibold text-slate-600">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"><option value="">الكل</option>{options.map((option) => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}</select></label>; }
function DateFilter({ label, value, onChange }) { return <label className="text-xs font-semibold text-slate-600">{label}<input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>; }
