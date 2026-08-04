'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Coffee, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

const today = () => new Date().toISOString().slice(0, 10);
const blankShift = () => ({ shiftKey: '', startTime: '', endTime: '', minimumRiders: '', maximumRiders: '' });
const blankPattern = () => ({ periods: '', riderCount: '' });
const controlClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100';
const primaryClass = 'inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50';

export default function KeetaBreaksPage() {
    const { t, direction } = useLanguage();
    const [configurations, setConfigurations] = useState([]);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [configuration, setConfiguration] = useState({ effectiveFrom: today(), effectiveTo: '', breakPercentage: 5, roundingPolicy: 1, shifts: [blankShift()], shiftPatterns: [blankPattern()] });
    const [planForm, setPlanForm] = useState({ periodStart: today(), periodEnd: today(), configurationId: '' });
    const getMessage = err => {
        if (typeof err === 'string') return err;
        return err?.errorDescraiption || err?.detail || err?.message || err?.title || err?.error?.description || err?.error?.code || t('common.error');
    };
    const activeConfiguration = useMemo(() => Array.isArray(configurations) ? configurations.find(item => item && item.isActive) : null, [configurations]);

    const loadConfigurations = async () => {
        setLoading(true);
        try {
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.KEETA_BREAKS.CONFIGURATIONS);
            setConfigurations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[KeetaBreaks Error - loadConfigurations]:', err);
            setError(getMessage(err));
            setConfigurations([]);
        } finally { setLoading(false); }
    };
    useEffect(() => { loadConfigurations(); }, []);
    const run = async (key, action, success) => {
        setBusy(key); setError(''); setNotice('');
        try {
            const result = await action();
            console.log(`[KeetaBreaks Success - ${key}]:`, result);
            setNotice(success);
            return result ?? true;
        } catch (err) {
            console.error(`[KeetaBreaks Error - ${key}]:`, err);
            const msg = getMessage(err);
            setError(msg);
            return null;
        } finally { setBusy(''); }
    };
    const setShift = (index, field, value) => setConfiguration(current => ({ ...current, shifts: current.shifts.map((shift, i) => i === index ? { ...shift, [field]: value } : shift) }));
    const setPattern = (index, field, value) => setConfiguration(current => ({ ...current, shiftPatterns: current.shiftPatterns.map((pattern, i) => i === index ? { ...pattern, [field]: value } : pattern) }));
    const saveConfiguration = async () => {
        const payload = { ...configuration, effectiveTo: configuration.effectiveTo || null, breakPercentage: Number(configuration.breakPercentage), roundingPolicy: Number(configuration.roundingPolicy), shifts: configuration.shifts.map(shift => ({ ...shift, minimumRiders: Number(shift.minimumRiders), maximumRiders: Number(shift.maximumRiders) })), shiftPatterns: configuration.shiftPatterns.filter(pattern => pattern.periods.trim()).map(pattern => ({ periods: pattern.periods, riderCount: Number(pattern.riderCount) })) };
        const result = await run('configuration', () => ApiService.post(API_ENDPOINTS.REPORTS.KEETA_BREAKS.CONFIGURATIONS, payload), t('common.saveSuccess'));
        if (result) { await loadConfigurations(); setPlanForm(current => ({ ...current, configurationId: result.id })); }
    };
    const deleteConfiguration = async (version) => {
        if (typeof window !== 'undefined' && !window.confirm(t('common.deleteConfirm') || 'هل أنت متأكد من الحذف؟')) return;
        const result = await run(`delete-${version}`, () => ApiService.delete(API_ENDPOINTS.REPORTS.KEETA_BREAKS.CONFIGURATION_BY_VERSION(version)), t('common.deleteSuccess') || t('common.success'));
        if (result !== null) {
            await loadConfigurations();
        }
    };
    const calculateCapacity = async () => {
        const payload = { periodStart: planForm.periodStart, periodEnd: planForm.periodEnd, ...(planForm.configurationId && { configurationId: planForm.configurationId }) };
        const result = await run('plan', () => ApiService.post(API_ENDPOINTS.REPORTS.KEETA_BREAKS.CAPACITY_PLANS, payload), t('common.success'));
        if (result) setPlan(result);
    };

    return <div className="min-h-screen bg-gray-50 pb-12" dir={direction}>
        <PageHeader title={t('keta.breaks.pageTitle')} subtitle={t('keta.breaks.pageSubtitle')} icon={Coffee} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
            {(error || notice) && <div role="alert" className={`rounded-xl border px-4 py-3 flex gap-2 text-sm ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}<span>{error || notice}</span></div>}
            <section className="grid xl:grid-cols-[1.6fr_1fr] gap-6">
                <Panel title={t('keta.breaks.configuration')} icon={CalendarDays}>
                    {loading ? <Loading /> : <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><Field label={t('keta.breaks.effectiveFrom')}><input required type="date" value={configuration.effectiveFrom} onChange={e => setConfiguration({ ...configuration, effectiveFrom: e.target.value })} className={controlClass} /></Field><Field label={t('keta.breaks.effectiveTo')}><input type="date" value={configuration.effectiveTo} onChange={e => setConfiguration({ ...configuration, effectiveTo: e.target.value })} className={controlClass} /></Field><Field label={t('keta.breaks.breakPercentage')}><input required min="0" max="100" type="number" value={configuration.breakPercentage} onChange={e => setConfiguration({ ...configuration, breakPercentage: e.target.value })} className={controlClass} /></Field><Field label={t('keta.breaks.rounding')}><select value={configuration.roundingPolicy} onChange={e => setConfiguration({ ...configuration, roundingPolicy: e.target.value })} className={controlClass}><option value="1">{t('keta.breaks.floor')}</option><option value="2">{t('keta.breaks.ceiling')}</option><option value="3">{t('keta.breaks.nearest')}</option></select></Field></div>
                        <h3 className="font-semibold text-gray-800 mt-5 mb-2">{t('keta.breaks.shifts')}</h3><div className="space-y-2">{configuration.shifts.map((shift, index) => <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-xl bg-gray-50 p-2"><input aria-label="Shift key" placeholder="00:00-03:00" value={shift.shiftKey} onChange={e => setShift(index, 'shiftKey', e.target.value)} className={controlClass} /><input aria-label="Start time" type="time" value={shift.startTime} onChange={e => setShift(index, 'startTime', e.target.value)} className={controlClass} /><input aria-label="End time" type="time" value={shift.endTime} onChange={e => setShift(index, 'endTime', e.target.value)} className={controlClass} /><input aria-label="Minimum riders" placeholder="Min" type="number" value={shift.minimumRiders} onChange={e => setShift(index, 'minimumRiders', e.target.value)} className={controlClass} /><input aria-label="Maximum riders" placeholder="Max" type="number" value={shift.maximumRiders} onChange={e => setShift(index, 'maximumRiders', e.target.value)} className={controlClass} /></div>)}</div><button onClick={() => setConfiguration(current => ({ ...current, shifts: [...current.shifts, blankShift()] }))} className={`${secondaryClass} mt-3`}><Plus size={16} />{t('keta.breaks.addShift')}</button>
                        <h3 className="font-semibold text-gray-800 mt-5 mb-2">{t('keta.breaks.patterns')}</h3><p className="text-xs text-gray-500 mb-2">{t('keta.breaks.patternHint')}</p><div className="space-y-2">{configuration.shiftPatterns.map((pattern, index) => <div key={index} className="flex gap-2"><input aria-label={t('keta.breaks.pattern')} placeholder="00:00-03:00 + 16:00-20:00 + 20:00-00:00" value={pattern.periods} onChange={e => setPattern(index, 'periods', e.target.value)} className={controlClass} /><input aria-label={t('keta.breaks.riderCount')} placeholder={t('keta.breaks.riderCount')} min="0" type="number" value={pattern.riderCount} onChange={e => setPattern(index, 'riderCount', e.target.value)} className={`${controlClass} max-w-36`} />{configuration.shiftPatterns.length > 1 && <button aria-label={t('keta.breaks.remove')} onClick={() => setConfiguration(current => ({ ...current, shiftPatterns: current.shiftPatterns.filter((_, i) => i !== index) }))} className="text-red-600 px-2"><Trash2 size={18} /></button>}</div>)}</div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setConfiguration(current => ({ ...current, shiftPatterns: [...current.shiftPatterns, blankPattern()] }))} className={secondaryClass}><Plus size={16} />{t('keta.breaks.addPattern')}</button><button disabled={!!busy} onClick={saveConfiguration} className={primaryClass}><Busy busy={busy === 'configuration'} />{t('keta.breaks.saveConfiguration')}</button></div>
                    </>}
                </Panel>
                <Configurations configurations={configurations} t={t} onDelete={deleteConfiguration} busy={busy} />
            </section>
            <Panel title={t('keta.breaks.capacityPlan')} icon={Coffee}>
                <div className="grid md:grid-cols-4 gap-3 items-end"><Field label={t('keta.breaks.periodStart')}><input type="date" value={planForm.periodStart} onChange={e => setPlanForm({ ...planForm, periodStart: e.target.value })} className={controlClass} /></Field><Field label={t('keta.breaks.periodEnd')}><input type="date" value={planForm.periodEnd} onChange={e => setPlanForm({ ...planForm, periodEnd: e.target.value })} className={controlClass} /></Field><Field label={t('keta.breaks.configurationVersion')}><select value={planForm.configurationId} onChange={e => setPlanForm({ ...planForm, configurationId: e.target.value })} className={controlClass}><option value="">{activeConfiguration ? `${t('keta.breaks.activeConfiguration')} (v${activeConfiguration.version})` : t('keta.breaks.activeConfiguration')}</option>{configurations.map(c => <option key={c.id} value={c.id}>v{c.version} · {c.effectiveFrom}</option>)}</select></Field><button disabled={!!busy} onClick={calculateCapacity} className={primaryClass}><Busy busy={busy === 'plan'} />{t('keta.breaks.calculate')}</button></div>
                {plan && <CapacityPlan plan={plan} t={t} />}
            </Panel>
        </main>
    </div>;
}

function Configurations({ configurations, t, onDelete, busy }) { return <Panel title={t('keta.breaks.versions')} icon={CalendarDays}>{configurations.length ? <div className="space-y-3">{configurations.map(c => <div key={c.id} className={`rounded-xl border p-3 ${c.isActive ? 'border-amber-300 bg-amber-50' : 'border-gray-100'}`}><div className="flex justify-between items-center gap-2"><div className="flex items-center gap-2"><strong>v{c.version}</strong>{c.isActive && <span className="text-xs font-semibold text-amber-800">{t('keta.breaks.activeConfiguration')}</span>}</div>{onDelete && <button type="button" aria-label={t('common.delete') || 'Delete'} title={t('common.delete') || 'Delete'} disabled={busy === `delete-${c.version}`} onClick={() => onDelete(c.version)} className="text-red-600 hover:text-red-800 p-1 transition disabled:opacity-50 flex items-center gap-1"><Trash2 size={16} /><Busy busy={busy === `delete-${c.version}`} /></button>}</div><p className="text-xs text-gray-600 mt-1">{c.effectiveFrom} — {c.effectiveTo || '∞'}</p><p className="text-xs text-gray-600">{c.breakPercentage}% · {c.shifts?.length || 0} {t('keta.breaks.shifts')} · {c.shiftPatterns?.length || 0} {t('keta.breaks.patterns')}</p>{c.shiftPatterns?.map(pattern => <p key={pattern.id || pattern.periods} className="text-xs text-gray-500 mt-1">{pattern.periods}: <strong>{pattern.riderCount ?? 0}</strong> {t('keta.breaks.riders')}</p>)}</div>)}</div> : <Empty text={t('keta.breaks.noData')} />}</Panel>; }
function CapacityPlan({ plan, t }) { return <div className="mt-6 space-y-4"><div className="flex flex-wrap gap-3 text-sm text-gray-600"><span>v{plan.configurationVersion}</span><span>{plan.periodStart} — {plan.periodEnd}</span><span>{plan.breakPercentage}%</span></div>{plan.shiftTotals?.length > 0 && <section className="rounded-xl border overflow-hidden"><h3 className="font-semibold text-gray-800 px-4 py-3 bg-gray-50">{t('keta.breaks.shiftTotals')}</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500"><tr>{[t('keta.breaks.shifts'), t('keta.breaks.riderCount'), 'Min', 'Max', t('keta.breaks.percentageLimit'), t('keta.breaks.staffingLimit'), t('keta.breaks.effectiveLimit'), t('common.status')].map(header => <th key={header} className="text-start px-4 py-2">{header}</th>)}</tr></thead><tbody className="divide-y">{plan.shiftTotals.map(total => <tr key={total.shift}><td className="px-4 py-3">{total.shift}</td><td className="px-4 py-3 font-bold">{total.totalRiders}</td><td className="px-4 py-3">{total.minimumRiders}</td><td className="px-4 py-3">{total.maximumRiders}</td><td className="px-4 py-3">{total.breakLimitByPercentage}</td><td className="px-4 py-3">{total.breakLimitByMinimumStaffing}</td><td className="px-4 py-3 font-bold">{total.effectiveBreakLimit}</td><td className="px-4 py-3">{total.status}</td></tr>)}</tbody></table></div></section>}{(plan.dates || []).map(day => <section key={day.date} className="rounded-xl border overflow-hidden"><div className={`flex flex-wrap gap-2 px-4 py-3 font-semibold ${day.isEligible ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}><span>{day.date}</span><span>{day.dayName}</span><span>{day.isEligible ? t('keta.breaks.eligible') : day.prohibitionReason}</span></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="text-start px-4 py-2">{t('keta.breaks.pattern')}</th><th className="text-start px-4 py-2">{t('keta.breaks.riderCount')}</th><th className="text-start px-4 py-2">{t('keta.breaks.maximumBreakRiders')}</th><th className="text-start px-4 py-2">{t('common.status')}</th><th className="text-start px-4 py-2">{t('common.reason')}</th></tr></thead><tbody className="divide-y">{(day.patterns || []).map(pattern => <tr key={pattern.patternId}><td className="px-4 py-3">{pattern.periods}</td><td className="px-4 py-3">{pattern.riderCount}</td><td className="px-4 py-3 font-bold">{pattern.maximumBreakRiders}</td><td className="px-4 py-3">{pattern.status}</td><td className="px-4 py-3 text-gray-500">{pattern.reason || '-'}</td></tr>)}</tbody></table></div></section>)}</div>; }
function Panel({ title, icon: Icon, children }) { return <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"><h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Icon size={19} className="text-amber-600" />{title}</h2>{children}</section>; }
function Field({ label, children }) { return <label className="block text-sm font-medium text-gray-600 space-y-1"><span>{label}</span>{children}</label>; }
function Empty({ text }) { return <p className="p-5 text-sm text-gray-500 text-center">{text}</p>; }
function Loading() { return <div className="p-6 text-center"><LoaderCircle className="animate-spin mx-auto text-amber-600" /></div>; }
function Busy({ busy }) { return busy ? <LoaderCircle size={16} className="animate-spin" /> : null; }
