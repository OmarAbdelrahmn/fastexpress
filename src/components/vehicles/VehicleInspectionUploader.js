// File: src/components/vehicles/VehicleInspectionUploader.js
'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Gauge,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  validateInspectionFile,
  validateMileage,
} from '@/lib/services/vehicleInspectionService';

const PHOTO_CONFIG = [
  {
    key: 'frontImage',
    labelAr: 'صورة الواجهة الأمامية',
    labelEn: 'Front Photo',
    descAr: 'صورة واضحة لمقدمة المركبة تظهر اللوحة والصدام',
    descEn: 'Clear view of front bumper and plate',
  },
  {
    key: 'backImage',
    labelAr: 'صورة الواجهة الخلفية',
    labelEn: 'Back Photo',
    descAr: 'صورة واضحة لمؤخرة المركبة تظهر اللوحة والصدام',
    descEn: 'Clear view of rear bumper and plate',
  },
  {
    key: 'rightImage',
    labelAr: 'صورة الجانب الأيمن',
    labelEn: 'Right Side Photo',
    descAr: 'صورة كاملة للجانب الأيمن للمركبة',
    descEn: 'Full view of right side body panels',
  },
  {
    key: 'leftImage',
    labelAr: 'صورة الجانب الأيسر',
    labelEn: 'Left Side Photo',
    descAr: 'صورة كاملة للجانب الأيسر للمركبة',
    descEn: 'Full view of left side body panels',
  },
  {
    key: 'odometerImage',
    labelAr: 'صورة عداد المسافات',
    labelEn: 'Odometer Photo',
    descAr: 'صورة واضحة لشاشة العداد وقراءة الكيلومترات',
    descEn: 'Clear photo of dashboard odometer display',
  },
];

export default function VehicleInspectionUploader({
  title,
  subtitle,
  value = {},
  onChange,
  errors = {},
  prefix = 'Inspection',
  disabled = false,
  isArabic = true,
}) {
  const [previews, setPreviews] = useState({});
  const [localErrors, setLocalErrors] = useState({});
  const fileInputRefs = useRef({});

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    const newPreviews = {};
    PHOTO_CONFIG.forEach(({ key }) => {
      const file = value[key];
      if (file instanceof File || file instanceof Blob) {
        newPreviews[key] = URL.createObjectURL(file);
      } else if (typeof file === 'string' && file) {
        newPreviews[key] = file;
      }
    });

    setPreviews(newPreviews);

    return () => {
      Object.values(newPreviews).forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [value.frontImage, value.backImage, value.rightImage, value.leftImage, value.odometerImage]);

  const handleFileChange = (key, file) => {
    if (!file) return;

    const validation = validateInspectionFile(file, key);
    if (!validation.valid) {
      setLocalErrors((prev) => ({ ...prev, [key]: validation.error }));
      return;
    }

    setLocalErrors((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

    if (onChange) {
      onChange({
        ...value,
        [key]: file,
      });
    }
  };

  const handleRemoveFile = (key) => {
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].value = '';
    }
    setLocalErrors((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    if (onChange) {
      const updated = { ...value };
      delete updated[key];
      onChange(updated);
    }
  };

  const handleMileageChange = (e) => {
    const val = e.target.value;
    const validation = validateMileage(val);
    if (!validation.valid && val !== '') {
      setLocalErrors((prev) => ({ ...prev, mileageKm: validation.error }));
    } else {
      setLocalErrors((prev) => {
        const updated = { ...prev };
        delete updated.mileageKm;
        return updated;
      });
    }

    if (onChange) {
      onChange({
        ...value,
        mileageKm: val,
      });
    }
  };

  const completedPhotosCount = PHOTO_CONFIG.filter((p) => Boolean(value[p.key])).length;
  const isMileageFilled =
    value.mileageKm !== undefined &&
    value.mileageKm !== null &&
    String(value.mileageKm).trim() !== '' &&
    !localErrors.mileageKm &&
    !errors.mileageKm;

  const defaultTitle =
    prefix === 'ReturnInspection'
      ? isArabic
        ? 'فحص المركبة المعادة (الحالية)'
        : 'Returned Vehicle Inspection'
      : isArabic
      ? 'فحص استلام المركبة'
      : 'Vehicle Handover Inspection';

  const defaultSubtitle = isArabic
    ? 'يرجى التقاط ورفع 5 صور للمركبة من جميع الجهات وإدخال قراءة العداد بالكيلومترات (الحد الأقصى 5 ميجابايت لكل صورة، بصيغة JPEG أو PNG أو WebP).'
    : 'Please take and upload 5 clear photos of the vehicle and enter the current odometer reading in km (max 5 MB per photo, JPEG, PNG, or WebP).';

  return (
    <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="text-purple-600" size={22} />
            <h3 className="text-lg font-bold text-gray-900">{title || defaultTitle}</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle || defaultSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              completedPhotosCount === 5 && isMileageFilled
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {completedPhotosCount === 5 && isMileageFilled ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {completedPhotosCount}/5 {isArabic ? 'صور' : 'Photos'}
            {isMileageFilled && ` • ${isArabic ? 'تم العداد' : 'Odometer set'}`}
          </span>
        </div>
      </div>

      {/* 5 Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PHOTO_CONFIG.map(({ key, labelAr, labelEn, descAr, descEn }) => {
          const file = value[key];
          const previewUrl = previews[key];
          const fieldError = localErrors[key] || errors[key];
          const hasFile = Boolean(file || previewUrl);

          return (
            <div
              key={key}
              className={`flex flex-col rounded-xl border-2 transition-all overflow-hidden ${
                fieldError
                  ? 'border-red-300 bg-red-50/40'
                  : hasFile
                  ? 'border-green-300 bg-green-50/20'
                  : 'border-dashed border-gray-300 hover:border-purple-400 bg-gray-50/50'
              }`}
            >
              <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white/70">
                <span className="text-xs font-bold text-gray-800">
                  {isArabic ? labelAr : labelEn}
                </span>
                {hasFile && <CheckCircle2 size={14} className="text-green-600" />}
              </div>

              {/* Slot Area */}
              <div className="p-3 flex-1 flex flex-col justify-center items-center text-center">
                {hasFile && previewUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt={isArabic ? labelAr : labelEn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[key]?.click()}
                        disabled={disabled}
                        className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition shadow"
                        title={isArabic ? 'تغيير الصورة' : 'Change photo'}
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(key)}
                        disabled={disabled}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                        title={isArabic ? 'حذف' : 'Remove'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !disabled && fileInputRefs.current[key]?.click()}
                    className={`w-full py-6 flex flex-col items-center justify-center cursor-pointer transition ${
                      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-sm">
                      <Camera size={22} />
                    </div>
                    <span className="text-xs font-semibold text-purple-700">
                      {isArabic ? 'رفع صورة' : 'Upload photo'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 max-w-[140px] truncate">
                      {isArabic ? descAr : descEn}
                    </span>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={(el) => (fileInputRefs.current[key] = el)}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={disabled}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(key, f);
                  }}
                />
              </div>

              {/* File details & error */}
              {file instanceof File && (
                <div className="px-3 py-1.5 bg-white/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              )}

              {fieldError && (
                <div className="px-2 py-1 bg-red-100 border-t border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  <span className="truncate">{fieldError}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Odometer Mileage Input */}
      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Gauge size={22} />
            </div>
            <div>
              <label
                htmlFor={`${prefix}-mileage`}
                className="block text-sm font-bold text-gray-900"
              >
                {isArabic ? 'قراءة عداد الكيلومترات الحالية' : 'Current Odometer Reading (km)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">
                {isArabic
                  ? 'أدخل الرقم الظاهر في صورة العداد بالكيلومترات (رقم غير سالب حتى منزلة عشرية واحدة).'
                  : 'Enter the exact odometer reading shown in the photo (non-negative number up to 1 decimal place).'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <input
                id={`${prefix}-mileage`}
                type="number"
                step="0.1"
                min="0"
                disabled={disabled}
                value={value.mileageKm !== undefined ? value.mileageKm : ''}
                onChange={handleMileageChange}
                placeholder={isArabic ? 'مثال: 12345.5' : 'e.g. 12345.5'}
                className={`w-full px-4 py-2.5 rounded-xl border font-mono text-base font-bold transition outline-none ${
                  localErrors.mileageKm || errors.mileageKm
                    ? 'border-red-400 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                    : 'border-purple-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                }`}
              />
              <span className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-xs font-bold text-gray-400 pointer-events-none">
                {isArabic ? 'كم' : 'km'}
              </span>
            </div>
            {(localErrors.mileageKm || errors.mileageKm) && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                {localErrors.mileageKm || errors.mileageKm}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
