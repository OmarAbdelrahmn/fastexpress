'use client';
import { Download, FileText } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ExportButtons({ onExportExcel, onExportPDF, loading = false }) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2">
      <Button
        variant="success"
        onClick={onExportExcel}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Download size={18} />
        {t("common.exportExcel")}
      </Button>
      <Button
        variant="danger"
        onClick={onExportPDF}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <FileText size={18} />
        {t("common.exportPDF")}
      </Button>
    </div>
  );
}