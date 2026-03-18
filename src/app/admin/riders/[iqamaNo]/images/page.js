'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

const BASE_URL = 'https://fastexpress.tryasp.net';
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXT_LABEL = '.jpg .jpeg .png .webp .pdf';

const IMAGE_SLOTS = [
  { imageType: 1, labelKey: 'profile',   icon: User,      urlKey: 'profileImageUrl' },
  { imageType: 2, labelKey: 'passport',  icon: FileText,  urlKey: 'passportImageUrl' },
  { imageType: 3, labelKey: 'iqama',     icon: CreditCard,urlKey: 'iqamaImageUrl' },
  { imageType: 4, labelKey: 'license',   icon: Briefcase, urlKey: 'licenseImageUrl' },
  { imageType: 5, labelKey: 'workPermit',icon: Shield,    urlKey: 'workPermitImageUrl' },
  { imageType: 6, labelKey: 'additional1',icon: Plus,      urlKey: 'additionalImage1Url' },
  { imageType: 7, labelKey: 'additional2',icon: Plus,      urlKey: 'additionalImage2Url' },
  { imageType: 8, labelKey: 'additional3',icon: Plus,      urlKey: 'additionalImage3Url' },
  { imageType: 9, labelKey: 'additional4',icon: Plus,      urlKey: 'additionalImage4Url' },
];

function buildFullUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${BASE_URL}${relativeUrl}`;
}

export default function RiderImagesPage() {
  const router = useRouter();
  const params = useParams();
  const iqamaNo = params?.iqamaNo;
  const { t, locale } = useLanguage();

  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // imageType currently uploading
  const [deleting, setDeleting] = useState(null);   // imageType currently being deleted
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');

  // One ref per slot so we can trigger click programmatically
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (iqamaNo) loadImages();
  }, [iqamaNo]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE_DOCUMENTS.ALL_IMAGES(iqamaNo));
      setImages(data);
    } catch (err) {
      // 404 EmployeeDocuments.NotFound is expected when nothing uploaded yet
      if (err?.status === 404) {
        setImages({
          iqamaNo,
          profileImageUrl: null,
          passportImageUrl: null,
          iqamaImageUrl: null,
          licenseImageUrl: null,
          workPermitImageUrl: null,
          additionalImage1Url: null,
          additionalImage2Url: null,
          additionalImage3Url: null,
          additionalImage4Url: null,
        });
      } else {
        setErrorMessage(err?.message || t('riderImages.errorLoading'));
      }
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // ─── Upload ─────────────────────────────────────────────────────────────────
  const handleFileSelect = async (imageType, file) => {
    if (!file) return;

    // Client-side validations
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError(t('riderImages.invalidFileType').replace('{{allowedTypes}}', ALLOWED_EXT_LABEL));
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showError(t('riderImages.fileTooLarge').replace('{{maxSize}}', MAX_FILE_SIZE_MB));
      return;
    }

    setUploading(imageType);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('imageType', imageType);
      formData.append('file', file);

      await ApiService.uploadFormData(
        API_ENDPOINTS.EMPLOYEE_DOCUMENTS.UPLOAD_ONE(iqamaNo),
        formData
      );

      showSuccess(t('riderImages.uploadSuccess'));
      await loadImages();
    } catch (err) {
      showError(err?.message || t('riderImages.uploadFailed'));
    } finally {
      setUploading(null);
      // Clear the file input so same file can be re-selected
      if (fileInputRefs.current[imageType]) {
        fileInputRefs.current[imageType].value = '';
      }
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!slotToDelete) return;
    setDeleting(slotToDelete.imageType);
    setShowDeleteModal(false);
    try {
      await ApiService.delete(
        API_ENDPOINTS.EMPLOYEE_DOCUMENTS.DELETE_ONE(iqamaNo, slotToDelete.imageType)
      );
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
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3`}>
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
          const SlotIcon = slot.icon;
          const relUrl = images?.[slot.urlKey];
          const fullUrl = buildFullUrl(relUrl);
          const isPdf = fullUrl?.toLowerCase().endsWith('.pdf');
          const isUploading = uploading === slot.imageType;
          const isDeleting  = deleting  === slot.imageType;

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
                  <p className="font-semibold text-gray-800 text-sm">{t(`riderImages.slots.${slot.labelKey}`)}</p>
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
                  ) : (
                    <div className="relative w-full h-full min-h-[180px]">
                      <img
                        src={fullUrl}
                        alt={t(`riderImages.slots.${slot.labelKey}`)}
                        className="w-full h-full object-cover min-h-[180px] cursor-pointer"
                        onClick={() => { setPreviewUrl(fullUrl); setPreviewLabel(t(`riderImages.slots.${slot.labelKey}`)); }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        onClick={() => { setPreviewUrl(fullUrl); setPreviewLabel(t(`riderImages.slots.${slot.labelKey}`)); }}
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
                    <ImageIcon size={48} />
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
                  onChange={(e) => handleFileSelect(slot.imageType, e.target.files?.[0])}
                />

                <button
                  disabled={isUploading || isDeleting}
                  onClick={() => fileInputRefs.current[slot.imageType]?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium
                    bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload size={15} />
                  {fullUrl ? t('riderImages.replace') : t('riderImages.upload')}
                </button>

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

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="font-semibold text-gray-800">{previewLabel}</p>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <img
                src={previewUrl}
                alt={previewLabel}
                className="w-full max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
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
          <p className="text-sm text-gray-600">
            {t('riderImages.confirmDeleteSubmsg')}
          </p>
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
