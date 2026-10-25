'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check, Loader2, RefreshCw, Search } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { riderService } from '@/lib/api/riderService';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useNotificationCopy } from './notificationCopy';
import s from './notifications.module.css';

export function riderDisplayName(rider, locale) {
  return (locale === 'ar' ? rider?.nameAR || rider?.nameEN : rider?.nameEN || rider?.nameAR) || '';
}

export default function NotificationRiderPicker({ value, onChange, disabled = false }) {
  const { c, locale } = useNotificationCopy();
  const id = useId();
  const input = useRef(null);
  const optionRefs = useRef([]);
  const operation = useRef(0);
  const mounted = useRef(false);
  const [riders, setRiders] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; operation.current += 1; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const session = TokenManager.getToken();
    let cancelled = false;
    setLoading(true); setError('');
    ApiService.get(API_ENDPOINTS.RIDER.LIST, {}, { signal: controller.signal }).then((response) => {
      if (cancelled || TokenManager.getToken() !== session) return;
      const rows = Array.isArray(response) ? response : response?.data || response?.items;
      if (!Array.isArray(rows)) throw new Error('Unexpected rider list response');
      // Keep identities internal. The visible options contain names and companies only.
      setRiders(rows.filter((rider) => rider && (rider.nameAR || rider.nameEN) && (rider.riderId || rider.iqamaNo)));
    }).catch((err) => {
      if (!cancelled && !controller.signal.aborted && TokenManager.getToken() === session) setError(err.status === 403 ? c.permission : c.ridersError);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [revision, c]);

  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(locale);
    return riders.filter((rider) => !term || [rider.nameAR, rider.nameEN, rider.companyName].some((text) => String(text || '').toLocaleLowerCase(locale).includes(term)))
      .sort((a, b) => riderDisplayName(a, locale).localeCompare(riderDisplayName(b, locale), locale));
  }, [riders, query, locale]);
  const options = matches.slice(0, 100);

  useEffect(() => { setActive(-1); }, [query, riders]);
  useEffect(() => { if (open && active >= 0) optionRefs.current[active]?.scrollIntoView({ block: 'nearest' }); }, [active, open]);

  async function choose(rider) {
    const attempt = ++operation.current;
    const session = TokenManager.getToken();
    setOpen(false); setError(''); setQuery('');
    onChange(null);
    setResolving(true);
    try {
      const resolved = Number.isSafeInteger(Number(rider.riderId)) && Number(rider.riderId) > 0
        ? rider
        : { ...rider, ...await riderService.getRiderByIqama(rider.iqamaNo) };
      if (!mounted.current || attempt !== operation.current || TokenManager.getToken() !== session) return;
      if (!Number.isSafeInteger(Number(resolved.riderId)) || Number(resolved.riderId) <= 0) throw new Error('Missing rider identity');
      onChange(resolved);
    } catch {
      if (mounted.current && attempt === operation.current && TokenManager.getToken() === session) setError(c.missingRider);
    } finally {
      if (mounted.current && attempt === operation.current) setResolving(false);
    }
  }

  function keyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); setOpen(true);
      setActive((previous) => event.key === 'ArrowDown' ? Math.min(previous + 1, options.length - 1) : Math.max(previous - 1, 0));
    } else if (event.key === 'Enter') {
      // Never submit the message while choosing a recipient.
      event.preventDefault();
      if (open && options[active]) choose(options[active]);
      else setOpen(true);
    } else if (event.key === 'Escape') {
      event.preventDefault(); setOpen(false); setQuery('');
    } else if (event.key === 'Tab') { setOpen(false); setQuery(''); }
  }

  return <div className={s.riderPicker} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(''); } }}>
    <label htmlFor={`${id}-input`} className={s.labelRow}>{c.chooseRider} <span aria-hidden="true">*</span></label>
    <div className={s.pickerControl}>
      <Search size={18} aria-hidden="true" />
      <input ref={input} id={`${id}-input`} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && active >= 0 && options[active] ? `${id}-option-${active}` : undefined} aria-describedby={`${id}-help`} aria-invalid={!!error} disabled={disabled || loading || resolving} autoComplete="off" value={open ? query : riderDisplayName(value, locale)} placeholder={loading ? c.ridersLoading : resolving ? c.riderResolving : c.riderSearch} onFocus={() => { setOpen(true); setQuery(''); }} onClick={() => setOpen(true)} onKeyDown={keyDown} onChange={(event) => { setQuery(event.target.value); setOpen(true); setError(''); onChange(null); }} />
      <button type="button" aria-label={c.chooseRider} aria-expanded={open} aria-controls={`${id}-list`} disabled={disabled || loading || resolving} onMouseDown={(event) => event.preventDefault()} onClick={() => { if (open) { setOpen(false); setQuery(''); } else { input.current?.focus(); setOpen(true); } }}>{loading || resolving ? <Loader2 size={18} className="animate-spin" /> : <ChevronDown size={18} />}</button>
    </div>
    {open && <ul id={`${id}-list`} className={s.riderOptions} role="listbox" aria-label={c.chooseRider}>
      {options.map((rider, index) => <li key={rider.riderId || rider.iqamaNo} id={`${id}-option-${index}`} ref={(node) => { optionRefs.current[index] = node; }} role="option" aria-selected={value?.riderId != null && String(value.riderId) === String(rider.riderId)} className={s.riderOption} data-active={active === index} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(rider)}>
        <span><strong>{riderDisplayName(rider, locale)}</strong><small>{[locale === 'ar' ? rider.nameEN : rider.nameAR, rider.companyName].filter(Boolean).join(' · ')}</small></span>{value?.riderId != null && String(value.riderId) === String(rider.riderId) && <Check size={18} />}
      </li>)}
      {!options.length && <li className={s.pickerEmpty} role="presentation">{riders.length ? c.ridersNoMatch : c.ridersEmpty}</li>}
      {matches.length > options.length && <li className={s.pickerEmpty} role="presentation">{c.ridersRefine}</li>}
    </ul>}
    <p id={`${id}-help`} className={s.muted}>{value ? [riderDisplayName(value, locale), value.companyName].filter(Boolean).join(' · ') : c.singleRiderHelp}</p>
    {(loading || resolving) && <p role="status" className={s.muted}>{loading ? c.ridersLoading : c.riderResolving}</p>}
    {error && <div className={s.pickerError} role="alert"><span>{error}</span><button type="button" className={s.secondary} disabled={disabled || loading} onClick={() => setRevision((number) => number + 1)}><RefreshCw size={15} />{c.reloadRiders}</button></div>}
  </div>;
}
