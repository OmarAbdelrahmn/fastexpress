'use client';

import { useEffect } from 'react';
import { FileSpreadsheet, X } from 'lucide-react';
import VehicleDocumentsImportView from './VehicleDocumentsImportView';

export default function VehicleDocumentsImportModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex items-center justify-center min-h-screen p-3 md:p-6">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
                <FileSpreadsheet size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">
                  استيراد وتحديث تواريخ رخص السير والفحص الدوري
                </h3>
                <p className="text-blue-100 text-xs">
                  تحديث مجمّع عبر ملف Excel (.xlsx) مع دعم التواريخ الهجرية والميلادية والمعاينة المسبقة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body: Scrollable */}
          <div className="p-5 md:p-6 overflow-y-auto flex-1">
            <VehicleDocumentsImportView
              onClose={onClose}
              onSuccess={onSuccess}
              isModal={true}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
            <div className="text-xs text-slate-500">
              <span>يتطلب صلاحية مدير (Admin) أو مشرف عام (Master)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
