'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import Modal from '@/components/Ui/Model';
import {
  ArrowRight,
  Upload,
  Trash2,
  User,
  FileText,
  CreditCard,
  Shield,
  Briefcase,
  Plus,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Eye,
  X,
  Download,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

const BASE_URL = 'https://fastexpress.tryasp.net';
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXT_LABEL = '.jpg .jpeg .png .webp .pdf';

const IMAGE_SLOTS = [
  { imageType: 1, labelKey: 'profile',    icon: User,      urlKey: 'profileImageUrl',    isCircle: true },
  { imageType: 2, labelKey: 'passport',   icon: FileText,  urlKey: 'passportImageUrl',   isCircle: false },
  { imageType: 3, labelKey: 'iqama',      icon: CreditCard,urlKey: 'iqamaImageUrl',      isCircle: false },
  { imageType: 4, labelKey: 'license',    icon: Briefcase, urlKey: 'licenseImageUrl',    isCircle: false },
  { imageType: 5, labelKey: 'workPermit', icon: Shield,    urlKey: 'workPermitImageUrl', isCircle: false },
  { imageType: 6, labelKey: 'additional1',icon: Plus,      urlKey: 'additionalImage1Url',isCircle: false },
  { imageType: 7, labelKey: 'additional2',icon: Plus,      urlKey: 'additionalImage2Url',isCircle: false },
  { imageType: 8, labelKey: 'additional3',icon: Plus,      urlKey: 'additionalImage3Url',isCircle: false },
  { imageType: 9, labelKey: 'additional4',icon: Plus,      urlKey: 'additionalImage4Url',isCircle: false },
];

function buildFullUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${BASE_URL}${relativeUrl}`;
}

// ─── Crop Modal ───────────────────────────────────────────────────────────────
function CropModal({ imageSrc, label, onConfirm, onCancel, locale }) {
  const canvasRef   = useRef(null);
  const imageRef    = useRef(null);
  // drag state
  const dragRef     = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const [scale, setScale]     = useState(1);
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCircle, setIsCircle]     = useState(false);

  const CANVAS_SIZE = 400;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Clip circle mask
    if (isCircle) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const w = img.naturalWidth  * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, offset.x + (CANVAS_SIZE - w) / 2, offset.y + (CANVAS_SIZE - h) / 2, w, h);

    if (isCircle) ctx.restore();

    // Overlay: darken outside circle
    if (isCircle) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2, true);
      ctx.fill();
      // circle border
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo((CANVAS_SIZE/3)*i, 0); ctx.lineTo((CANVAS_SIZE/3)*i, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, (CANVAS_SIZE/3)*i); ctx.lineTo(CANVAS_SIZE, (CANVAS_SIZE/3)*i); ctx.stroke();
      }
      ctx.restore();
    }
  }, [scale, offset, isCircle]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, offsetX: offset.x, offsetY: offset.y };
    setIsDragging(true);
  };
  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.offsetX + dx, y: dragRef.current.offsetY + dy });
  };
  const handleMouseUp = () => { dragRef.current.active = false; setIsDragging(false); };

  // Touch support
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    dragRef.current = { active: true, startX: t.clientX, startY: t.clientY, offsetX: offset.x, offsetY: offset.y };
  };
  const handleTouchMove = (e) => {
    if (!dragRef.current.active) return;
    const t = e.touches[0];
    setOffset({ x: dragRef.current.offsetX + t.clientX - dragRef.current.startX, y: dragRef.current.offsetY + t.clientY - dragRef.current.startY });
  };
  const handleTouchEnd = () => { dragRef.current.active = false; };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img    = imageRef.current;
    if (!canvas || !img) return;

    // Export final canvas (circle: draw clean without darken overlay)
    const out    = document.createElement('canvas');
    out.width    = CANVAS_SIZE;
    out.height   = CANVAS_SIZE;
    const ctx    = out.getContext('2d');
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2, 0, Math.PI*2);
      ctx.clip();
    }
    const w = img.naturalWidth  * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, offset.x + (CANVAS_SIZE - w)/2, offset.y + (CANVAS_SIZE - h)/2, w, h);
    out.toBlob((blob) => { if (blob) onConfirm(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      {/* Hidden image for drawing */}
      <img
        ref={imageRef}
        src={imageSrc}
        alt=""
        crossOrigin="anonymous"
        className="hidden"
        onLoad={() => {
          const img = imageRef.current;
          if (!img) return;
          // fit image into canvas on load
          const fit = Math.min(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight);
          setScale(fit);
          setOffset({ x: 0, y: 0 });
        }}
      />

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-blue-600" />
            <p className="font-semibold text-gray-800">{label} — Crop &amp; Position</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex flex-col items-center gap-4 p-5">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-xl border border-gray-200 shadow-inner"
            style={{ width: 320, height: 320, cursor: isDragging ? 'grabbing' : 'grab', background: '#111' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Controls */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            ><ZoomOut size={16} /></button>

            <input
              type="range" min={0.1} max={5} step={0.05}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600"
            />

            <button
              onClick={() => setScale(s => Math.min(5, s + 0.1))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            ><ZoomIn size={16} /></button>

            <button
              onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Reset"
            ><RotateCcw size={16} /></button>
          </div>

          {/* Circle toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <div
              className={`w-10 h-5 rounded-full transition-colors ${isCircle ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsCircle(v => !v)}
            >
              <div className={`w-5 h-5 rounded-full bg-white border border-gray-300 shadow transition-transform ${isCircle ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            Circle preview
          </label>

          <p className="text-xs text-gray-400 text-center">Drag to position · scroll/slider to zoom</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Crop size={15} /> Apply & Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RiderImagesPage() {
  const router = useRouter();
  const params = useParams();
  const iqamaNo = params?.iqamaNo;
  const { t, locale } = useLanguage();

  const [images, setImages]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage,   setErrorMessage]   = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete]       = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [previewIsCircle, setPreviewIsCircle] = useState(false);

  // Crop state
  const [cropSrc,    setCropSrc]   = useState(null);
  const [cropSlot,   setCropSlot]  = useState(null);
  const [cropLabel,  setCropLabel] = useState('');

  const fileInputRefs = useRef({});
  const pendingFileRef = useRef(null); // raw File before crop

  useEffect(() => { if (iqamaNo) loadImages(); }, [iqamaNo]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE_DOCUMENTS.ALL_IMAGES(iqamaNo));
      setImages(data);
    } catch (err) {
      if (err?.status === 404) {
        setImages({
          iqamaNo,
          profileImageUrl: null, passportImageUrl: null, iqamaImageUrl: null,
          licenseImageUrl: null, workPermitImageUrl: null,
          additionalImage1Url: null, additionalImage2Url: null,
          additionalImage3Url: null, additionalImage4Url: null,
        });
      } else {
        setErrorMessage(err?.message || t('riderImages.errorLoading'));
      }
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 4000); };
  const showError   = (msg) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000); };

  // ─── Upload (raw file → crop → upload) ──────────────────────────────────────
  const handleFileSelect = (slot, file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError(t('riderImages.invalidFileType').replace('{{allowedTypes}}', ALLOWED_EXT_LABEL));
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showError(t('riderImages.fileTooLarge').replace('{{maxSize}}', MAX_FILE_SIZE_MB));
      return;
    }

    // PDFs skip crop
    if (file.type === 'application/pdf') {
      uploadFile(slot.imageType, file);
      return;
    }

    // Open crop modal
    const objectUrl = URL.createObjectURL(file);
    pendingFileRef.current = file;
    setCropSrc(objectUrl);
    setCropSlot(slot);
    setCropLabel(t(`riderImages.slots.${slot.labelKey}`));
  };

  const handleCropConfirm = async (blob) => {
    const slot = cropSlot;
    closeCrop();
    const croppedFile = new File([blob], pendingFileRef.current?.name || 'image.jpg', { type: 'image/jpeg' });
    await uploadFile(slot.imageType, croppedFile);
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropSlot(null);
    pendingFileRef.current = null;
    // Clear the input
    if (cropSlot) {
      const ref = fileInputRefs.current[cropSlot.imageType];
      if (ref) ref.value = '';
    }
  };

  const uploadFile = async (imageType, file) => {
    setUploading(imageType);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('imageType', imageType);
      formData.append('file', file);
      await ApiService.uploadFormData(API_ENDPOINTS.EMPLOYEE_DOCUMENTS.UPLOAD_ONE(iqamaNo), formData);
      showSuccess(t('riderImages.uploadSuccess'));
      await loadImages();
    } catch (err) {
      showError(err?.message || t('riderImages.uploadFailed'));
    } finally {
      setUploading(null);
      const ref = fileInputRefs.current[imageType];
      if (ref) ref.value = '';
    }
  };

  // ─── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async (fullUrl, label) => {
    try {
      const response = await fetch(fullUrl);
      const blob     = await response.blob();
      const ext      = fullUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const a        = document.createElement('a');
      a.href         = URL.createObjectURL(blob);
      a.download     = `${label.replace(/\s+/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      // fallback: open in new tab
      window.open(fullUrl, '_blank');
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!slotToDelete) return;
    setDeleting(slotToDelete.imageType);
    setShowDeleteModal(false);
    try {
      await ApiService.delete(API_ENDPOINTS.EMPLOYEE_DOCUMENTS.DELETE_ONE(iqamaNo, slotToDelete.imageType));
      showSuccess(t('riderImages.deleteSuccess').replace('{{label}}', t(`riderImages.slots.${slotToDelete.labelKey}`)));
      await loadImages();
    } catch (err) {
      showError(err?.message || t('riderImages.deleteFailed'));
    } finally {
      setDeleting(null);
      setSlotToDelete(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('riderImages.title')} subtitle={t('riderImages.loading')} icon={ImageIcon} />
        <Card>
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <PageHeader
        title={t('riderImages.title')}
        subtitle={t('riderImages.subtitle').replace('{{iqamaNo}}', iqamaNo)}
        icon={ImageIcon}
        actionButton={{
          text: t('riderImages.back'),
          icon: <ArrowRight size={18} className={locale === 'ar' ? '' : 'rotate-180'} />,
          onClick: () => router.push(`/admin/riders/${iqamaNo}/details`),
          variant: 'secondary',
        }}
      />

      {/* Alerts */}
      {successMessage && (
        <Alert type="success" title={t('riderImages.success')} message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {errorMessage && (
        <Alert type="error" title={t('riderImages.error')} message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">{t('riderImages.importantNotes')}</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>{t('riderImages.maxSizeNote').replace('{{maxSize}}', MAX_FILE_SIZE_MB)}</li>
            <li>{t('riderImages.allowedTypesNote').replace('{{allowedTypes}}', ALLOWED_EXT_LABEL)}</li>
            <li>{t('riderImages.replaceNote')}</li>
            <li>{t('riderImages.deleteNote')}</li>
          </ul>
        </div>
      </div>

      {/* 9-slot grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {IMAGE_SLOTS.map((slot) => {
          const SlotIcon   = slot.icon;
          const relUrl     = images?.[slot.urlKey];
          const fullUrl    = buildFullUrl(relUrl);
          const isPdf      = fullUrl?.toLowerCase().endsWith('.pdf');
          const isUploading = uploading === slot.imageType;
          const isDeleting  = deleting  === slot.imageType;
          const label       = t(`riderImages.slots.${slot.labelKey}`);

          return (
            <div
              key={slot.imageType}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
            >
              {/* Slot header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SlotIcon size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                </div>
                {fullUrl && !isDeleting && (
                  <CheckCircle size={16} className={`text-green-500 ${locale === 'ar' ? 'mr-auto' : 'ml-auto'}`} />
                )}
              </div>

              {/* Preview area */}
              <div className="relative flex-1 min-h-[180px] bg-gray-50 flex items-center justify-center">
                {isUploading || isDeleting ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                    <p className="text-xs text-gray-500">{isUploading ? t('riderImages.uploading') : t('riderImages.deleting')}</p>
                  </div>
                ) : fullUrl ? (
                  isPdf ? (
                    <div className="flex flex-col items-center gap-3 p-4">
                      <FileText size={48} className="text-red-400" />
                      <p className="text-xs text-gray-500 text-center">{t('riderImages.pdfFile')}</p>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} /> {t('riderImages.openFile')}
                      </a>
                    </div>
                  ) : slot.isCircle ? (
                    /* ── Circle preview (profile) ── */
                    <div className="flex flex-col items-center gap-3 py-5">
                      <div
                        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-200 cursor-pointer group"
                        onClick={() => { setPreviewUrl(fullUrl); setPreviewLabel(label); setPreviewIsCircle(true); }}
                      >
                        <img
                          src={fullUrl}
                          alt={label}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                          <Eye size={22} className="text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Profile Photo</p>
                    </div>
                  ) : (
                    /* ── Regular image preview ── */
                    <div className="relative w-full h-full min-h-[180px]">
                      <img
                        src={fullUrl}
                        alt={label}
                        className="w-full h-full object-cover min-h-[180px] cursor-pointer"
                        onClick={() => { setPreviewUrl(fullUrl); setPreviewLabel(label); setPreviewIsCircle(false); }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        onClick={() => { setPreviewUrl(fullUrl); setPreviewLabel(label); setPreviewIsCircle(false); }}
                        className="absolute inset-0 flex items-end justify-end p-2 opacity-0 hover:opacity-100 bg-black/10 transition-opacity"
                      >
                        <div className="bg-white rounded-lg p-1 shadow">
                          <Eye size={16} className="text-gray-700" />
                        </div>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300 p-6">
                    {slot.isCircle ? (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <User size={36} className="text-gray-300" />
                      </div>
                    ) : (
                      <ImageIcon size={48} />
                    )}
                    <p className="text-xs text-gray-400">{t('riderImages.notUploaded')}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                {/* Hidden file input */}
                <input
                  ref={(el) => { fileInputRefs.current[slot.imageType] = el; }}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(slot, e.target.files?.[0])}
                />

                {/* Upload / Replace */}
                <button
                  disabled={isUploading || isDeleting}
                  onClick={() => fileInputRefs.current[slot.imageType]?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium
                    bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload size={15} />
                  {fullUrl ? t('riderImages.replace') : t('riderImages.upload')}
                </button>

                {/* Download — only when image exists & not PDF */}
                {fullUrl && !isPdf && (
                  <button
                    disabled={isUploading || isDeleting}
                    onClick={() => handleDownload(fullUrl, label)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium
                      bg-green-50 text-green-600 hover:bg-green-100 border border-green-200
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t('riderImages.download') || 'Download'}
                  >
                    <Download size={15} />
                  </button>
                )}

                {/* Download PDF */}
                {fullUrl && isPdf && (
                  <a
                    href={fullUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium
                      bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors"
                    title="Download PDF"
                  >
                    <Download size={15} />
                  </a>
                )}

                {/* Delete */}
                {fullUrl && (
                  <button
                    disabled={isUploading || isDeleting}
                    onClick={() => { setSlotToDelete(slot); setShowDeleteModal(true); }}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium
                      bg-red-50 text-red-600 hover:bg-red-100 border border-red-200
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Crop Modal ── */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          label={cropLabel}
          locale={locale}
          onConfirm={handleCropConfirm}
          onCancel={closeCrop}
        />
      )}

      {/* ── Image preview modal ── */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="font-semibold text-gray-800">{previewLabel}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(previewUrl, previewLabel)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                  >
                    <Download size={15} /> Download
                  </button>
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className={`flex items-center justify-center p-4 bg-gray-900 ${previewIsCircle ? 'py-10' : ''}`}>
                <img
                  src={previewUrl}
                  alt={previewLabel}
                  className={`max-h-[70vh] object-contain ${previewIsCircle ? 'rounded-full w-72 h-72 object-cover border-4 border-white/20 shadow-2xl' : 'w-full'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSlotToDelete(null); }}
        title={t('riderImages.confirmDeleteTitle')}
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <p className="font-medium">
              {t('riderImages.confirmDeleteMsg')} <strong>{slotToDelete ? t(`riderImages.slots.${slotToDelete.labelKey}`) : ''}</strong>؟
            </p>
          </div>
          <p className="text-sm text-gray-600">{t('riderImages.confirmDeleteSubmsg')}</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSlotToDelete(null); }}>
              {t('riderImages.cancel')}
            </Button>
            <Button className="!bg-red-600 hover:!bg-red-700 text-white" onClick={confirmDelete}>
              <Trash2 size={16} className={locale === 'ar' ? 'ml-2' : 'mr-2'} />
              {t('riderImages.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
