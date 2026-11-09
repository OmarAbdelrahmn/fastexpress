// File: src/components/vehicles/VehicleInspectionModal.js
'use client';

import React, { useState } from 'react';
import {
  X,
  Camera,
  Gauge,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle,
  Car,
  ArrowRightLeft,
} from 'lucide-react';
import { resolveInspectionImageUrl } from '@/lib/services/vehicleInspectionService';

const PHOTO_LABELS = [
  { key: 'frontImageUrl', labelAr: 'الواجهة الأمامية', labelEn: 'Front' },
  { key: 'backImageUrl', labelAr: 'الواجهة الخلفية', labelEn: 'Back' },
  { key: 'rightImageUrl', labelAr: 'الجانب الأيمن', labelEn: 'Right Side' },
  { key: 'leftImageUrl', labelAr: 'الجانب الأيسر', labelEn: 'Left Side' },
  { key: 'odometerImageUrl', labelAr: 'عداد المسافات', labelEn: 'Odometer' },
];

export default function VehicleInspectionModal({
  isOpen,
  onClose,
  inspection,
  returnInspection,
  vehiclePlate,
  riderName,
  isArabic = true,
  title,
}) {
  const [activeTab, setActiveTab] = useState('take'); // 'take' | 'return'
  const [lightboxIndex, setLightboxIndex] = useState(null); // null | number

  if (!isOpen) return null;

  const currentInspection =
    activeTab === 'return' && returnInspection ? returnInspection : inspection || returnInspection;

  const photos = currentInspection
    ? PHOTO_LABELS.map((item) => ({
        ...item,
        url: resolveInspectionImageUrl(currentInspection[item.key]),
      })).filter((p) => Boolean(p.url))
    : [];

  const hasBoth = Boolean(inspection && returnInspection);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {title || (isArabic ? 'تقرير فحص المركبة' : 'Vehicle Inspection Report')}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 font-mono">
                {vehiclePlate && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                    {vehiclePlate}
                  </span>
                )}
                {riderName && <span>{riderName}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs for Switch requests (take vs return) */}
        {hasBoth && (
          <div className="px-6 pt-3 bg-gray-50 border-b border-gray-200 flex gap-2">
            <button
              onClick={() => setActiveTab('take')}
              className={`px-4 py-2 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'take'
                  ? 'border-purple-600 text-purple-700 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Car size={16} />
              {isArabic ? 'فحص المركبة البديلة (استلام)' : 'Replacement Vehicle Inspection'}
            </button>
            <button
              onClick={() => setActiveTab('return')}
              className={`px-4 py-2 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
                activeTab === 'return'
                  ? 'border-purple-600 text-purple-700 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <ArrowRightLeft size={16} />
              {isArabic ? 'فحص المركبة المعادة (إرجاع)' : 'Returned Vehicle Inspection'}
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!currentInspection ? (
            <div className="text-center py-12 text-gray-400">
              <Camera size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">
                {isArabic ? 'لا توجد بيانات فحص متاحة لهذه العملية' : 'No inspection data available for this record.'}
              </p>
            </div>
          ) : (
            <>
              {/* Inspection Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Odometer */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow">
                    <Gauge size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-purple-700 font-bold block">
                      {isArabic ? 'قراءة عداد المسافات' : 'Odometer Reading'}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                      {currentInspection.mileageKm !== undefined && currentInspection.mileageKm !== null
                        ? Number(currentInspection.mileageKm).toLocaleString()
                        : '—'}{' '}
                      <span className="text-sm font-bold text-gray-500">
                        {isArabic ? 'كم' : 'km'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Captured Time */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                    <Clock size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-blue-700 font-bold block">
                      {isArabic ? 'تاريخ ووقت الفحص' : 'Captured At'}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      {currentInspection.capturedAtUtc
                        ? new Date(currentInspection.capturedAtUtc).toLocaleString(
                            isArabic ? 'ar-SA' : 'en-US'
                          )
                        : isArabic
                        ? 'غير محدد'
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  {isArabic ? 'الصور المرفوعة (5 صور)' : 'Uploaded Photos (5 angles)'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((item, idx) => (
                    <div
                      key={item.key}
                      onClick={() => setLightboxIndex(idx)}
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>{isArabic ? item.labelAr : item.labelEn}</span>
                        <Maximize2 size={13} className="text-gray-400 group-hover:text-purple-600" />
                      </div>
                      <div className="relative aspect-video bg-gray-900 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={isArabic ? item.labelAr : item.labelEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Maximize2 size={16} />
                          {isArabic ? 'تكبير الصورة' : 'View full'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition shadow"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar */}
          <div
            className="absolute top-4 inset-x-6 flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-base">
                {isArabic
                  ? photos[lightboxIndex].labelAr
                  : photos[lightboxIndex].labelEn}
              </span>
              <span className="text-xs text-gray-400">
                ({lightboxIndex + 1} / {photos.length})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={photos[lightboxIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white"
                title={isArabic ? 'فتح في نافذة جديدة' : 'Open original'}
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Image */}
          <div
            className="relative max-w-5xl max-h-[80vh] flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex].url}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Navigation Controls */}
          {photos.length > 1 && (
            <div
              className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                }
                className="p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition pointer-events-auto shadow-lg"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                }
                className="p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition pointer-events-auto shadow-lg"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
