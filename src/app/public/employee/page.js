'use client';

import { useState, useCallback } from 'react';

// ─── Translations ─────────────────────────────────────────────────────────────
const i18n = {
  ar: {
    dir: 'rtl',
    title: 'بوابة الموظف',
    subtitle: 'ابحث عن بياناتك وارفع وثائقك',
    iqamaLabel: 'رقم الإقامة',
    iqamaPlaceholder: 'أدخل رقم الإقامة',
    searchBtn: 'بحث',
    searching: 'جارٍ البحث...',
    uploading: 'جارٍ الرفع...',
    uploadBtn: 'رفع الوثائق',
    employeeInfo: 'بيانات الموظف',
    name: 'الاسم',
    jobTitle: 'المسمى الوظيفي',
    company: 'الشركة',
    status: 'الحالة',
    statusActive: 'نشط',
    statusInactive: 'غير نشط',
    stepUpload: 'رفع الوثائق',
    profileImage: 'صورة الملف الشخصي',
    passportImage: 'صورة جواز السفر',
    iqamaImage: 'صورة الإقامة',
    licenseImage: 'صورة رخصة القيادة',
    allowedTypes: 'JPG · PNG · WEBP · PDF (بحد أقصى 5 ميجابايت)',
    chooseFile: 'اختر ملفاً',
    fileSelected: 'تم اختيار:',
    successTitle: 'تم رفع الوثائق بنجاح ✅',
    successSub: 'تم حفظ جميع وثائقك بنجاح.',
    errorNotFound: 'لم يُعثر على موظف نشط بهذا الرقم.',
    errorInvalidType: 'نوع الملف غير مدعوم. الأنواع المسموح بها: jpg, jpeg, png, webp, pdf',
    errorTooLarge: 'حجم الملف يتجاوز 5 ميجابايت.',
    errorEmpty: 'الملف فارغ.',
    errorAllRequired: 'جميع الوثائق الأربع مطلوبة.',
    errorGeneric: 'حدث خطأ. حاول مجدداً.',
    resetBtn: 'بحث جديد',
    viewDoc: 'عرض',
    profileImageDoc: 'الصورة الشخصية',
    passportImageDoc: 'جواز السفر',
    iqamaImageDoc: 'الإقامة',
    licenseImageDoc: 'رخصة القيادة',
    langBtn: 'English',
  },
  en: {
    dir: 'ltr',
    title: 'Employee Portal',
    subtitle: 'Look up your info and upload your documents',
    iqamaLabel: 'Iqama Number',
    iqamaPlaceholder: 'Enter Iqama number',
    searchBtn: 'Search',
    searching: 'Searching...',
    uploading: 'Uploading...',
    uploadBtn: 'Upload Documents',
    employeeInfo: 'Employee Info',
    name: 'Name',
    jobTitle: 'Job Title',
    company: 'Company',
    status: 'Status',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    stepUpload: 'Upload Documents',
    profileImage: 'Profile Photo',
    passportImage: 'Passport Scan',
    iqamaImage: 'Iqama Card Scan',
    licenseImage: 'Driving License Scan',
    allowedTypes: 'JPG · PNG · WEBP · PDF (max 5 MB each)',
    chooseFile: 'Choose file',
    fileSelected: 'Selected:',
    successTitle: 'Documents Uploaded Successfully ✅',
    successSub: 'All your documents have been saved.',
    errorNotFound: 'No active employee was found with the given Iqama number.',
    errorInvalidType: 'File type not allowed. Accepted: jpg, jpeg, png, webp, pdf',
    errorTooLarge: 'File exceeds the 5 MB limit.',
    errorEmpty: 'File is empty.',
    errorAllRequired: 'All four documents are required.',
    errorGeneric: 'Something went wrong. Please try again.',
    resetBtn: 'New Search',
    viewDoc: 'View',
    profileImageDoc: 'Profile Photo',
    passportImageDoc: 'Passport',
    iqamaImageDoc: 'Iqama Card',
    licenseImageDoc: 'Driving License',
    langBtn: 'عربي',
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const UPLOAD_FIELDS = [
  { key: 'profileImage',  labelKey: 'profileImage' },
  { key: 'passportImage', labelKey: 'passportImage' },
  { key: 'iqamaImage',   labelKey: 'iqamaImage' },
  { key: 'licenseImage', labelKey: 'licenseImage' },
];

const RESULT_FIELDS = [
  { urlKey: 'profileImageUrl',  labelKey: 'profileImageDoc' },
  { urlKey: 'passportImageUrl', labelKey: 'passportImageDoc' },
  { urlKey: 'iqamaImageUrl',   labelKey: 'iqamaImageDoc' },
  { urlKey: 'licenseImageUrl', labelKey: 'licenseImageDoc' },
];

// ─── File Validation ──────────────────────────────────────────────────────────
function validateFile(file, t) {
  if (!file) return null;
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return t.errorInvalidType;
  if (file.size === 0) return t.errorEmpty;
  if (file.size > MAX_FILE_SIZE) return t.errorTooLarge;
  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  header: {
    width: '100%',
    maxWidth: '640px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    marginTop: '0.2rem',
  },
  langBtn: {
    background: 'rgba(56,189,248,0.12)',
    border: '1px solid rgba(56,189,248,0.3)',
    color: '#38bdf8',
    borderRadius: '2rem',
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '640px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.4rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  input: {
    flex: 1,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '0.875rem',
    padding: '0.8rem 1rem',
    color: '#f1f5f9',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    border: 'none',
    borderRadius: '0.875rem',
    padding: '0.8rem 1.5rem',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.15s',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  infoItem: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '0.875rem',
    padding: '0.9rem 1rem',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
    marginBottom: '0.3rem',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#e2e8f0',
    fontWeight: 600,
  },
  statusActive: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.15)',
    color: '#4ade80',
    padding: '0.2rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    border: '1px solid rgba(34,197,94,0.3)',
  },
  statusInactive: {
    display: 'inline-block',
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    padding: '0.2rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    border: '1px solid rgba(239,68,68,0.3)',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '0.875rem',
    padding: '0.9rem 1rem',
    color: '#f87171',
    fontSize: '0.9rem',
    marginTop: '0.75rem',
  },
  fileRow: {
    marginBottom: '1rem',
  },
  fileLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.4rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  fileInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px dashed rgba(255,255,255,0.2)',
    borderRadius: '0.875rem',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  fileInputHidden: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
  fileIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  fileText: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSelectedText: {
    fontSize: '0.85rem',
    color: '#38bdf8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
  },
  fileHint: {
    fontSize: '0.7rem',
    color: '#475569',
    marginTop: '0.3rem',
  },
  fileError: {
    fontSize: '0.78rem',
    color: '#f87171',
    marginTop: '0.3rem',
  },
  successCard: {
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '640px',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  successTitle: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#4ade80',
    marginBottom: '0.5rem',
  },
  successSub: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  urlGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    textAlign: 'left',
  },
  urlItem: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '0.875rem',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  urlLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },
  urlLink: {
    fontSize: '0.85rem',
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  resetBtn: {
    marginTop: '1.25rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '0.875rem',
    padding: '0.7rem 1.5rem',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  divider: {
    width: '100%',
    maxWidth: '640px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: '#475569',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
};

// ─── FileUploadRow Component ──────────────────────────────────────────────────
function FileUploadRow({ field, t, file, onChange, error }) {
  return (
    <div style={styles.fileRow}>
      <label style={styles.fileLabel}>{t[field.labelKey]}</label>
      <div style={styles.fileInputWrapper}>
        <span style={styles.fileIcon}>📎</span>
        <span style={file ? styles.fileSelectedText : styles.fileText}>
          {file ? `${t.fileSelected} ${file.name}` : t.chooseFile}
        </span>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          style={styles.fileInputHidden}
          onChange={(e) => onChange(field.key, e.target.files[0] || null)}
        />
      </div>
      <div style={styles.fileHint}>{t.allowedTypes}</div>
      {error && <div style={styles.fileError}>⚠ {error}</div>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublicEmployeePage() {
  const [lang, setLang] = useState('ar');
  const t = i18n[lang];

  // Lookup state
  const [iqamaNo, setIqamaNo] = useState('');
  const [employee, setEmployee] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Upload state
  const [files, setFiles] = useState({
    profileImage: null,
    passportImage: null,
    iqamaImage: null,
    licenseImage: null,
  });
  const [fileErrors, setFileErrors] = useState({});
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  const toggleLang = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'));

  // ── Lookup ──────────────────────────────────────────────────────────────────
  const handleLookup = useCallback(async () => {
    const num = iqamaNo.trim();
    if (!num) return;
    setLookupError('');
    setEmployee(null);
    setLookupLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/public/employees/${num}`);
      if (res.status === 404) {
        setLookupError(t.errorNotFound);
        return;
      }
      if (!res.ok) {
        setLookupError(t.errorGeneric);
        return;
      }
      const data = await res.json();
      setEmployee(data);
      // Reset upload state when finding a new employee
      setFiles({ profileImage: null, passportImage: null, iqamaImage: null, licenseImage: null });
      setFileErrors({});
      setUploadError('');
      setUploadResult(null);
    } catch {
      setLookupError(t.errorGeneric);
    } finally {
      setLookupLoading(false);
    }
  }, [iqamaNo, t]);

  // ── File change ─────────────────────────────────────────────────────────────
  const handleFileChange = useCallback((key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
    setFileErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    // Client-side validation
    const newErrors = {};
    let hasError = false;
    for (const field of UPLOAD_FIELDS) {
      const file = files[field.key];
      if (!file) {
        newErrors[field.key] = t.errorAllRequired;
        hasError = true;
      } else {
        const err = validateFile(file, t);
        if (err) {
          newErrors[field.key] = err;
          hasError = true;
        }
      }
    }
    setFileErrors(newErrors);
    if (hasError) return;

    setUploadError('');
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage',  files.profileImage);
      formData.append('passportImage', files.passportImage);
      formData.append('iqamaImage',    files.iqamaImage);
      formData.append('licenseImage',  files.licenseImage);

      const res = await fetch(
        `${BASE_URL}/api/public/employees/${employee.iqamaNo}/documents`,
        { method: 'POST', body: formData }
      );

      if (res.status === 404) { setUploadError(t.errorNotFound); return; }

      const body = await res.json();

      if (!res.ok) {
        const errTitle = body?.title || '';
        if (errTitle === 'InvalidFileType') setUploadError(t.errorInvalidType);
        else if (errTitle === 'FileTooLarge') setUploadError(t.errorTooLarge);
        else if (errTitle === 'EmptyFile')    setUploadError(t.errorEmpty);
        else setUploadError(t.errorGeneric);
        return;
      }

      setUploadResult(body);
    } catch {
      setUploadError(t.errorGeneric);
    } finally {
      setUploadLoading(false);
    }
  }, [files, employee, t]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setIqamaNo('');
    setEmployee(null);
    setLookupError('');
    setFiles({ profileImage: null, passportImage: null, iqamaImage: null, licenseImage: null });
    setFileErrors({});
    setUploadError('');
    setUploadResult(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...styles.page, direction: t.dir }}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoArea}>
          <h1 style={styles.logoTitle}>{t.title}</h1>
          <span style={styles.logoSub}>{t.subtitle}</span>
        </div>
        <button
          style={styles.langBtn}
          onClick={toggleLang}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(56,189,248,0.22)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(56,189,248,0.12)'; }}
        >
          🌐 {t.langBtn}
        </button>
      </div>

      {/* ─── Lookup Card ─── */}
      {!uploadResult && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>🪪 {t.iqamaLabel}</div>
          <div style={styles.inputGroup}>
            <div style={{ flex: 1 }}>
              <input
                style={styles.input}
                type="number"
                placeholder={t.iqamaPlaceholder}
                value={iqamaNo}
                onChange={(e) => setIqamaNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(56,189,248,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              style={{
                ...styles.primaryBtn,
                opacity: lookupLoading ? 0.7 : 1,
                cursor: lookupLoading ? 'not-allowed' : 'pointer',
              }}
              onClick={handleLookup}
              disabled={lookupLoading}
              onMouseOver={(e) => { if (!lookupLoading) e.currentTarget.style.opacity = '0.88'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = lookupLoading ? '0.7' : '1'; }}
            >
              {lookupLoading ? t.searching : t.searchBtn}
            </button>
          </div>
          {lookupError && <div style={styles.errorBox}>⚠ {lookupError}</div>}
        </div>
      )}

      {/* ─── Employee Info Card ─── */}
      {employee && !uploadResult && (
        <>
          <div style={styles.card}>
            <div style={styles.cardTitle}>👤 {t.employeeInfo}</div>
            <div style={styles.infoGrid}>
              <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                <div style={styles.infoLabel}>{t.name}</div>
                <div style={styles.infoValue}>
                  {lang === 'ar' ? employee.nameAR : employee.nameEN}
                  {employee.nameAR && employee.nameEN && lang === 'ar' && (
                    <span style={{ color: '#c3ceddff', fontSize: '0.85rem', fontWeight: 400, marginInlineStart: '0.5rem' }}>
                      ({employee.nameEN})
                    </span>
                  )}
                  {employee.nameAR && employee.nameEN && lang === 'en' && (
                    <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 400, marginInlineStart: '0.5rem' }}>
                      ({employee.nameAR})
                    </span>
                  )}
                </div>
                
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>{t.jobTitle}</div>
                <div style={styles.infoValue}>{employee.jobTitle || '—'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>{t.company}</div>
                <div style={styles.infoValue}>{employee.company || '—'}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>{t.status}</div>
                <div>
                  <span style={employee.status === 'enable' ? styles.statusActive : styles.statusInactive}>
                    {employee.status === 'enable' ? t.statusActive : t.statusInactive}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Divider ─── */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>{t.stepUpload}</span>
            <div style={styles.dividerLine} />
          </div>

          {/* ─── Upload Card ─── */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>📄 {t.stepUpload}</div>
            {UPLOAD_FIELDS.map((field) => (
              <FileUploadRow
                key={field.key}
                field={field}
                t={t}
                file={files[field.key]}
                onChange={handleFileChange}
                error={fileErrors[field.key]}
              />
            ))}
            {uploadError && <div style={styles.errorBox}>⚠ {uploadError}</div>}
            <button
              style={{
                ...styles.primaryBtn,
                width: '100%',
                marginTop: '0.5rem',
                opacity: uploadLoading ? 0.7 : 1,
                cursor: uploadLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                padding: '0.9rem',
              }}
              onClick={handleUpload}
              disabled={uploadLoading}
              onMouseOver={(e) => { if (!uploadLoading) e.currentTarget.style.opacity = '0.88'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = uploadLoading ? '0.7' : '1'; }}
            >
              {uploadLoading ? t.uploading : `🚀 ${t.uploadBtn}`}
            </button>
          </div>
        </>
      )}

      {/* ─── Success Card ─── */}
      {uploadResult && (
        <>
          <div style={styles.successCard}>
            <div style={styles.successTitle}>{t.successTitle}</div>
            <div style={styles.successSub}>{t.successSub}</div>
            <div style={{ ...styles.urlGrid, direction: 'ltr' }}>
              {RESULT_FIELDS.map(({ urlKey, labelKey }) =>
                uploadResult[urlKey] ? (
                  <div key={urlKey} style={styles.urlItem}>
                    <span style={styles.urlLabel}>{t[labelKey]}</span>
                    <a
                      href={`${BASE_URL}${uploadResult[urlKey]}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.urlLink}
                    >
                      🔗 {t.viewDoc}
                    </a>
                  </div>
                ) : null
              )}
            </div>
            <button
              style={styles.resetBtn}
              onClick={handleReset}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              🔄 {t.resetBtn}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
