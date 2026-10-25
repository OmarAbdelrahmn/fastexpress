'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Bell, AlertCircle, X } from 'lucide-react';
import NotificationComposer from './NotificationComposer';
import NotificationStatusCard from './NotificationStatusCard';
import { useNotificationCopy } from './notificationCopy';
import s from './notifications.module.css';

export default function RiderNotificationModal({ isOpen, onClose, rider }) {
  const { c, locale, dir } = useNotificationCopy();
  const id = useId();
  const dialog = useRef(null);
  const [latest, setLatest] = useState(null);
  const [sendState, setSendState] = useState({ submitting: false, uncertain: false });
  // Use the explicit backend rider identity, never an employee/Iqama/working ID.
  const riderId = rider?.riderId;
  const validRider = Number.isSafeInteger(Number(riderId)) && Number(riderId) > 0;
  const name = locale === 'ar' ? rider?.nameAR || rider?.nameEN : rider?.nameEN || rider?.nameAR;
  const locked = sendState.submitting;

  useEffect(() => {
    if (isOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [isOpen]);

  useEffect(() => { setLatest(null); setSendState({ submitting: false, uncertain: false }); }, [riderId]);

  return <dialog ref={dialog} className={`${s.dialog} ${s.root}`} style={{ width: 'min(1040px, calc(100vw - 32px))' }} dir={dir} aria-labelledby={`${id}-title`} onCancel={(event) => { event.preventDefault(); if (!locked) onClose(); }}>
    <div className={s.statusHead}><div className={s.row}><span className={s.icon}><Bell size={22} /></span><div><h2 id={`${id}-title`} className="text-lg font-bold">{c.compose}</h2><p className={s.muted}>{name}</p></div></div><button type="button" className={s.secondary} aria-label={c.close} title={c.close} disabled={locked} onClick={onClose}><X size={20} /></button></div>
    <div className="pt-5">{!validRider ? <div className={s.alert} role="alert"><AlertCircle size={20} /><p>{c.missingRider}</p></div> : latest ? (isOpen && <NotificationStatusCard requestId={latest.requestId} title={latest.title} onReset={() => setLatest(null)} />) : <NotificationComposer key={riderId} riderId={riderId} riderName={name || (locale === 'ar' ? 'المندوب' : 'Rider')} companyName={rider?.companyName || ''} onStateChange={setSendState} onSuccess={(requestId, result) => { setLatest({ requestId, title: result.title }); setSendState({ submitting: false, uncertain: false }); }} />}</div>
  </dialog>;
}
