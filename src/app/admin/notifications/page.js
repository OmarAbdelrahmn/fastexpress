'use client';

import { useEffect, useState } from 'react';
import { Bell, PenLine, Activity } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import NotificationComposer from '@/components/notifications/NotificationComposer';
import NotificationStatusCard from '@/components/notifications/NotificationStatusCard';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useNotificationCopy } from '@/components/notifications/notificationCopy';
import s from '@/components/notifications/notifications.module.css';

export default function AdminNotificationsPage() {
  const { c, dir } = useNotificationCopy();
  const [view, setView] = useState('compose');
  const [latest, setLatest] = useState(null);
  const [account, setAccount] = useState(null);
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    const user = TokenManager.getUserFromToken();
    const actor = user?.sub || user?.nameid || user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const role = user?.roles ?? user?.role ?? user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
    setIsMaster((Array.isArray(role) ? role : [role]).includes('Master'));
    // One account-scoped recovery pointer, never a fabricated notification history.
    if (actor) {
      const key = `staff-notification-latest:${actor}`;
      setAccount(key);
      try {
        const saved = JSON.parse(sessionStorage.getItem(key));
        if (saved?.requestId && typeof saved.title === 'string') setLatest(saved);
      } catch { /* Recovery is optional when browser storage is unavailable. */ }
    }
  }, []);

  function queued(requestId, result) {
    const notification = { requestId, title: result.title, timestamp: new Date().toISOString() };
    setLatest(notification);
    if (account) { try { sessionStorage.setItem(account, JSON.stringify(notification)); } catch { /* Keep tracking in memory. */ } }
    setView('track');
  }

  return <div className="space-y-6 pb-12" dir={dir}>
    <PageHeader title={c.title} subtitle={c.subtitle} icon={Bell} />
    <div className={s.page}>
    <nav className={s.nav} aria-label={c.title}><button type="button" aria-pressed={view === 'compose'} onClick={() => setView('compose')}><PenLine size={17} />{c.compose}</button><button type="button" aria-pressed={view === 'track'} onClick={() => setView('track')}><Activity size={17} />{c.track}</button></nav>
    <div hidden={view !== 'compose'}><NotificationComposer onSuccess={queued} audienceLabel={isMaster ? c.all : c.scope} allowRecipientSelection /></div>
    {view === 'track' && (latest ? <div className={s.form}><NotificationStatusCard key={latest.requestId} requestId={latest.requestId} title={latest.title} onReset={() => setView('compose')} /><p className={s.muted}>{c.recovery}</p></div> : <div className={`${s.card} ${s.empty}`}><span className={s.icon}><Activity size={24} /></span><h2>{c.empty}</h2><p className={s.muted}>{c.emptyHelp}</p><button type="button" className={s.primary} onClick={() => setView('compose')}><PenLine size={17} />{c.compose}</button></div>)}
    </div>
  </div>;
}
