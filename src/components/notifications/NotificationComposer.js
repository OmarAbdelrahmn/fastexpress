'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Bell, Users, Home, UserRound, BarChart3, CheckCircle2, Send, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { NotificationService } from '@/lib/api/notificationService';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useNotificationCopy } from './notificationCopy';
import NotificationRiderPicker, { riderDisplayName } from './NotificationRiderPicker';
import s from './notifications.module.css';

const destinations = [['home', Home], ['profile', UserRound], ['performance_report', BarChart3]];
const windows = [[3600, 'h1'], [21600, 'h6'], [43200, 'h12'], [86400, 'h24'], [259200, 'd3'], [604800, 'd7']];

export default function NotificationComposer({ riderId = null, riderName = '', companyName = '', onSuccess, onStateChange, audienceLabel, allowRecipientSelection = false }) {
  const { c, locale, dir } = useNotificationCopy();
  const id = useId();
  const [recipientMode, setRecipientMode] = useState('broadcast');
  const [selectedRider, setSelectedRider] = useState(null);
  const [content, setContent] = useState({ en: { title: '', body: '' }, ar: { title: '', body: '' }, bn: { title: '', body: '' } });
  const [languages, setLanguages] = useState(['en']);
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [destination, setDestination] = useState('home');
  const saudiNow = new Date(Date.now() + 10800000);
  const currentYear = saudiNow.getUTCFullYear();
  const currentMonth = saudiNow.getUTCMonth() + 1;
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [expiry, setExpiry] = useState(86400);
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [command, setCommand] = useState(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const dialog = useRef(null);
  const reviewButton = useRef(null);
  const selectingRider = allowRecipientSelection && recipientMode === 'rider';
  const targetRiderId = selectingRider ? selectedRider?.riderId ?? null : riderId;
  const targetCompany = selectingRider ? selectedRider?.companyName || '' : companyName;
  const scope = selectingRider ? riderDisplayName(selectedRider, locale) || c.chooseRider : riderId != null ? riderName : audienceLabel || c.scope;
  const monthLabel = (value) => new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC', calendar: 'gregory' }).format(new Date(Date.UTC(2026, Number(value) - 1, 1)));
  const expiryLabel = c[windows.find(([value]) => value === expiry)?.[1]];

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { onStateChange?.({ submitting, uncertain }); }, [submitting, uncertain, onStateChange]);
  useEffect(() => {
    if (reviewing && !dialog.current?.open) dialog.current?.showModal();
    else if (!reviewing && dialog.current?.open) { dialog.current.close(); reviewButton.current?.focus(); }
  }, [reviewing]);

  function update(language, field, value) {
    setContent((previous) => ({ ...previous, [language]: { ...previous[language], [field]: value } }));
  }

  function review(event) {
    event.preventDefault();
    setError('');
    if (selectingRider && !selectedRider?.riderId) {
      setError(c.selectRiderError);
      event.currentTarget.querySelector('[role="combobox"]')?.focus();
      return;
    }
    const invalidLanguage = languages.find((language) => !content[language].title.trim() || !content[language].body.trim());
    if (invalidLanguage) {
      setError(c.errorRequired);
      const field = !content[invalidLanguage].title.trim() ? 'title' : 'body';
      document.getElementById(`${id}-${invalidLanguage}-${field}`)?.focus();
      return;
    }
    if (destination === 'performance_report' && (!/^\d{4}$/.test(year) || Number(year) < 2000 || Number(month) < 1 || Number(month) > 12 || Number(year) > currentYear || (Number(year) === currentYear && Number(month) > currentMonth))) {
      setError(c.errorPeriod); return;
    }
    try {
      setCommand(NotificationService.prepareCommand(targetRiderId, {
        content: Object.fromEntries(languages.map((language) => [language, content[language]])),
        data: destination === 'performance_report' ? { type: destination, year, month } : { type: destination },
        expiresInSeconds: expiry,
      }));
      setReviewing(true);
    } catch { setError(c.invalid); }
  }

  async function send() {
    if (!command || busy.current) return;
    busy.current = true;
    setSubmitting(true); setError('');
    const session = TokenManager.getToken();
    try {
      const result = await NotificationService.submitCommand(command);
      if (!mounted.current || TokenManager.getToken() !== session) return;
      setUncertain(false); setReviewing(false);
      onSuccess?.(result.requestId, { ...result, title: command.payload.content.en.title, content: command.payload.content, audience: scope });
      setContent({ en: { title: '', body: '' }, ar: { title: '', body: '' }, bn: { title: '', body: '' } });
      setLanguages(['en']); setPreviewLanguage('en'); setDestination('home'); setExpiry(86400); setCommand(null);
    } catch (err) {
      if (!mounted.current || TokenManager.getToken() !== session) return;
      if (err.isNetworkError || err.status >= 500) { setUncertain(true); setError(c.uncertain); }
      else if (err.status === 401) setError(c.session);
      else if (err.status === 403) setError(c.permission);
      else if (err.status === 409) setError(c.conflict);
      else if (err.status === 429) setError(c.rate);
      else setError(c.invalid);
    } finally {
      busy.current = false;
      if (mounted.current) setSubmitting(false);
    }
  }

  function fields(language) {
    return <div className={s.fields} dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}>
      {['title', 'body'].map((field) => {
        const fieldId = `${id}-${language}-${field}`;
        const limit = field === 'title' ? 120 : 500;
        const props = { id: fieldId, value: content[language][field], onChange: (event) => update(language, field, event.target.value), maxLength: limit, required: true, className: s.control, 'aria-describedby': `${fieldId}-count` };
        return <div key={field}>
          <div className={s.labelRow}><label htmlFor={fieldId}>{c[field === 'title' ? 'heading' : 'body']} <span aria-hidden="true">*</span></label><span id={`${fieldId}-count`} className={s.counter}>{content[language][field].length} / {limit}</span></div>
          {field === 'title' ? <input {...props} placeholder={language === 'en' ? 'e.g. Your monthly report is ready' : language === 'ar' ? 'مثال: تقريرك الشهري جاهز' : 'যেমন: আপনার মাসিক প্রতিবেদন প্রস্তুত'} /> : <textarea {...props} rows={4} placeholder={language === 'en' ? 'Let riders know what has changed and what to do next.' : language === 'ar' ? 'وضّح للمندوب ما الجديد وما الخطوة التالية.' : 'কী পরিবর্তন হয়েছে এবং কী করতে হবে তা জানান।'} />}
        </div>;
      })}
    </div>;
  }

  const activeLanguage = languages.includes(previewLanguage) ? previewLanguage : 'en';
  const preview = content[activeLanguage];
  const errorMessage = error && <div className={s.alert} role="alert"><AlertCircle size={20} /><span>{error}</span></div>;

  return <div className={s.root} dir={dir}>
    <div className={s.layout}>
      <form onSubmit={review} className={s.form}>
        {!reviewing && errorMessage}
        <fieldset disabled={submitting || uncertain}>
          <section className={`${s.card} ${s.audienceCard}`} aria-label={c.audience}>
            <div className={s.audience}>
            <span className={s.icon}><Users size={22} /></span>
            <div><p className={s.eyebrow}>{c.audience}</p><h2>{scope}</h2>{targetCompany && <p className={s.muted}>{targetCompany}</p>}<p className={s.muted}>{selectingRider || riderId != null ? c.singleRiderHelp : c.scopeHelp}</p></div>
            </div>
            {allowRecipientSelection && <div className={s.recipientSettings}>
              <label className={s.labelRow} htmlFor={`${id}-recipient-mode`}>{c.recipientMode}</label>
              <select id={`${id}-recipient-mode`} className={s.control} value={recipientMode} onChange={(event) => { setRecipientMode(event.target.value); setError(''); }}><option value="broadcast">{audienceLabel || c.scope}</option><option value="rider">{c.singleRider}</option></select>
              {selectingRider && <NotificationRiderPicker value={selectedRider} onChange={(rider) => { setSelectedRider(rider); setError(''); }} disabled={submitting || uncertain} />}
            </div>}
          </section>
          <section className={s.card}>
            <div className={s.sectionHead}><span className={s.step}>1</span><div><h2>{c.message}</h2><p className={s.muted}>{c.messageHelp}</p></div></div>
            <div className={s.labelRow}><span>{c.en}</span><span className={s.badge}>{c.required}</span></div>
            {fields('en')}
            <div className={s.translations}>
              <h3>{c.addTranslations} <span className={s.badge}>{c.optional}</span></h3><p className={s.muted}>{c.translationsHelp}</p>
              <div className={s.toggles}>{['ar', 'bn'].map((language) => <label key={language} className={s.toggle}><input type="checkbox" checked={languages.includes(language)} onChange={(event) => setLanguages((previous) => event.target.checked ? [...previous, language] : previous.filter((item) => item !== language))} />{c[language]} {!(language === 'ar' && locale === 'ar') && <span lang={language}>{language === 'ar' ? 'العربية' : 'বাংলা'}</span>}</label>)}</div>
              {languages.filter((language) => language !== 'en').map((language) => <section key={language} className={s.localeFields} aria-label={c[language]}><h3 className={s.labelRow}>{c[language]}</h3>{fields(language)}</section>)}
            </div>
          </section>
          <section className={s.card}>
            <div className={s.sectionHead}><span className={s.step}>2</span><div><h2>{c.destination}</h2><p className={s.muted}>{c.destinationHelp}</p></div></div>
            <div className={s.choices} role="group" aria-label={c.destination}>{destinations.map(([value, Icon]) => <button type="button" key={value} aria-pressed={destination === value} onClick={() => setDestination(value)} className={s.choice}><Icon size={21} /><strong>{c[value]}</strong><small>{c[`${value}Help`]}</small>{destination === value && <CheckCircle2 className={s.selected} size={15} />}</button>)}</div>
            {destination === 'performance_report' && <><div className={s.period}>
              <label htmlFor={`${id}-year`}>{c.year}<select id={`${id}-year`} className={s.control} value={year} onChange={(event) => { setYear(event.target.value); if (Number(event.target.value) === currentYear && Number(month) > currentMonth) setMonth(String(currentMonth)); }}>{Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label htmlFor={`${id}-month`}>{c.month}<select id={`${id}-month`} className={s.control} value={month} onChange={(event) => setMonth(event.target.value)}>{Array.from({ length: Number(year) === currentYear ? currentMonth : 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{monthLabel(value)}</option>)}</select></label>
            </div><p className={s.muted}>{c.reportNote}</p></>}
          </section>
          <section className={s.card}>
            <div className={s.sectionHead}><span className={s.step}>3</span><div><h2><label htmlFor={`${id}-expiry`}>{c.expiry}</label></h2><p className={s.muted}>{c.expiryHelp}</p></div></div>
            <select id={`${id}-expiry`} value={expiry} onChange={(event) => setExpiry(Number(event.target.value))} className={s.control}>{windows.map(([value, label]) => <option key={value} value={value}>{c[label]}</option>)}</select>
          </section>
        </fieldset>
        <div className={s.actions}>{uncertain ? <button type="button" className={s.primary} disabled={submitting} onClick={() => setReviewing(true)}>{c.retry}</button> : <button ref={reviewButton} type="submit" className={s.primary} disabled={submitting}><Eye size={18} />{c.review}</button>}</div>
      </form>
      <aside className={s.aside} aria-label={c.preview}>
        <div className={s.card}><div className={s.row}><Eye size={19} /><h2>{c.preview}</h2></div><p className={s.muted}>{c.previewHelp}</p>
          <div className={s.languagePicker} role="group" aria-label={c.preview}>{languages.map((language) => <button type="button" key={language} aria-pressed={activeLanguage === language} onClick={() => setPreviewLanguage(language)}>{c[language]}</button>)}</div>
          <div className={s.previewCanvas}><div className={s.notification} dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'} lang={activeLanguage}><div className={s.appLine}><Bell size={14} /><span>{c.app}</span><span>{c.now}</span></div><strong>{preview.title.trim() || c.emptyTitle}</strong><p>{preview.body.trim() || c.emptyBody}</p></div></div>
          <p className={s.muted}>{c.fallback}</p>
        </div>
        <div className={`${s.card} ${s.note}`}><ShieldCheck size={21} /><div><strong>{c.privacy}</strong>{c.privacyHelp}</div></div>
      </aside>
    </div>
    <dialog ref={dialog} className={`${s.dialog} ${s.root}`} dir={dir} aria-labelledby={`${id}-review-title`} onCancel={(event) => { event.preventDefault(); if (!submitting) setReviewing(false); }}>
      <h2 id={`${id}-review-title`} className="text-xl font-bold">{c.review}</h2><p className={s.muted}>{c.reviewHelp}</p>
      <dl className={s.reviewList}><div><dt>{c.audience}</dt><dd>{scope}</dd></div>{targetCompany && <div><dt>{c.company}</dt><dd>{targetCompany}</dd></div>}<div><dt>{c.destinationHelp}</dt><dd>{c[destination]}{destination === 'performance_report' && ` · ${monthLabel(month)} ${year}`}</dd></div><div><dt>{c.expiry}</dt><dd>{expiryLabel}</dd></div></dl>
      <p className={s.muted}>{c.fallback}</p>
      <div className={s.reviewMessages}>{languages.map((language) => <div key={language} className={s.notification} dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}><p className={s.eyebrow}>{c[language]}</p><strong>{content[language].title}</strong><p>{content[language].body}</p></div>)}</div>
      {reviewing && errorMessage}
      <div className={s.actions}><button type="button" className={s.secondary} onClick={() => setReviewing(false)} disabled={submitting}>{uncertain ? c.close : c.edit}</button><button type="button" className={s.primary} onClick={send} disabled={submitting}><Send size={17} />{submitting ? c.sending : uncertain ? c.retry : c.send}</button></div>
    </dialog>
  </div>;
}
