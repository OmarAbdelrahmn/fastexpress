'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock, RefreshCw, Users, Smartphone, PenLine } from 'lucide-react';
import { NotificationService } from '@/lib/api/notificationService';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useNotificationCopy } from './notificationCopy';
import s from './notifications.module.css';

const activeStates = ['queued', 'expanding', 'processing'];
const terminalStates = ['completed', 'completed_with_errors'];

export default function NotificationStatusCard({ requestId, title, initialData = null, onReset = null }) {
  const { c, locale, dir } = useNotificationCopy();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auto, setAuto] = useState(false);
  const [revision, setRevision] = useState(0);
  const cooldownUntil = useRef(0);
  const lastRequest = useRef(requestId);

  useEffect(() => {
    let disposed = false;
    let timer;
    let inFlight = false;
    let failures = 0;
    let shouldPoll = true;
    let controller;
    const session = TokenManager.getToken();
    if (lastRequest.current !== requestId) {
      setData(initialData);
      cooldownUntil.current = 0;
      lastRequest.current = requestId;
    }
    setLoading(true);
    setError('');
    setAuto(false);

    function schedule(delay) {
      clearTimeout(timer);
      if (!disposed && shouldPoll) timer = setTimeout(load, delay);
    }

    async function load() {
      clearTimeout(timer);
      if (disposed || inFlight || !requestId || !shouldPoll) return;
      if (TokenManager.getToken() !== session) { setData(null); setError(c.session); setLoading(false); setAuto(false); shouldPoll = false; return; }
      if (document.visibilityState === 'hidden') return;
      const cooldown = cooldownUntil.current - Date.now();
      if (cooldown > 0) { setLoading(false); setError(c.cooldown); schedule(cooldown); return; }
      inFlight = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      setLoading(true);
      let delay = 10000;
      try {
        const result = await NotificationService.getStatus(requestId, controller.signal);
        if (disposed || TokenManager.getToken() !== session) return;
        setData(result); setError(''); failures = 0;
        shouldPoll = activeStates.includes(result.status);
        setAuto(shouldPoll);
      } catch (err) {
        if (disposed || TokenManager.getToken() !== session) return;
        if ([401, 403, 404].includes(err.status)) {
          shouldPoll = false;
          setData(null);
          setError(err.status === 401 ? c.session : err.status === 403 ? c.permission : c.unavailable);
        } else if (err.status === 429) {
          const retry = Number(err.retryAfter);
          const retryDate = Date.parse(err.retryAfter);
          delay = Math.min(2147483647, Math.max(1000, retry > 0 ? retry * 1000 : Number.isFinite(retryDate) ? retryDate - Date.now() : 60000));
          cooldownUntil.current = Date.now() + delay;
          setError(c.cooldown);
        } else {
          failures += 1;
          delay = Math.min(60000, 10000 * 2 ** Math.min(failures, 3));
          shouldPoll = failures < 4;
          setError(c.stale);
        }
        setAuto(false);
      } finally {
        clearTimeout(timeout);
        inFlight = false;
        if (!disposed && TokenManager.getToken() === session) { setLoading(false); schedule(delay); }
      }
    }

    const visibility = () => {
      if (document.visibilityState === 'hidden') clearTimeout(timer);
      else load();
    };
    load();
    document.addEventListener('visibilitychange', visibility);
    return () => { disposed = true; clearTimeout(timer); controller?.abort(); document.removeEventListener('visibilitychange', visibility); };
  }, [requestId, initialData, revision, c]);

  const known = activeStates.includes(data?.status) || terminalStates.includes(data?.status);
  const status = known ? data.status : 'unknown';
  const completed = status === 'completed';
  const StatusIcon = completed ? CheckCircle2 : status === 'completed_with_errors' || !known ? AlertCircle : Clock;
  const formatCount = (key) => Number.isFinite(data?.[key]) ? new Intl.NumberFormat(locale).format(data[key]) : '—';
  const formatDate = (value) => NotificationService.formatUtcTimestamp(value, locale);
  function metric(key, tone) {
    return <div key={key} className={s.metric} data-tone={tone}><dt>{c[key]}</dt><dd>{formatCount(key)}</dd></div>;
  }

  return <section className={`${s.card} ${s.root}`} dir={dir} aria-label={c.delivery} aria-busy={loading}>
    <div className={s.statusHead}><div className={s.row}><span className={s.icon}><Activity size={23} /></span><div><p className={s.eyebrow}>{c.delivery}</p><h2 className="break-words">{title || c.track}</h2></div></div><button type="button" className={s.secondary} disabled={loading || Date.now() < cooldownUntil.current} onClick={() => setRevision((value) => value + 1)}><RefreshCw size={16} />{c.refresh}</button></div>
    {error && <div className={s.alert} role="alert"><AlertCircle size={19} /><span>{error}</span></div>}
    {!data && loading && <p className={`${s.muted} py-8`} role="status">{c.loading}</p>}
    {data && <>
      <div className={s.statusBanner} data-tone={completed && data.acceptedDeliveries > 0 ? 'success' : completed || status === 'completed_with_errors' || !known ? 'warning' : undefined} role="status"><StatusIcon size={23} className="shrink-0" /><div><strong>{c[status]}{!known && typeof data.status === 'string' ? ` (${data.status})` : ''}</strong><p>{completed && data.acceptedDeliveries === 0 ? c.zero : c[`${status}Help`]}</p>{auto && <p>{c.auto}</p>}</div></div>
      <div className={s.stats}>
        <section><div className={s.row}><Users size={18} /><h3>{c.riders}</h3></div><dl className={s.metrics}>{metric('audienceRiders')}{metric('skippedNoDeviceRiders')}</dl></section>
        <section><div className={s.row}><Smartphone size={18} /><h3>{c.devices}</h3></div><dl className={s.metrics}>{metric('totalDeliveries')}{metric('acceptedDeliveries', 'success')}{metric('pendingDeliveries')}{metric('failedDeliveries', 'warning')}{metric('expiredDeliveries')}{metric('skippedDeliveries')}</dl></section>
      </div>
      <p className={s.muted}>{c.acceptedNote}</p>
      <div className={s.timing}><p>{c.created}: {formatDate(data.createdAtUtc)}</p><p>{c.expires}: {formatDate(data.expiresAtUtc)}</p></div>
    </>}
    {onReset && <div className={`${s.actions} mt-6`}><button type="button" className={s.primary} onClick={onReset}><PenLine size={17} />{c.new}</button></div>}
  </section>;
}
