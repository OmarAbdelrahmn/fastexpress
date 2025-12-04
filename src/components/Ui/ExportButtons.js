'use client';
import { Download, FileText } from 'lucide-react';
import Button from './Button';

export default function ExportButtons({ onExportExcel, onExportPDF, loading = false }) {
  return (
    <div className="flex gap-2">
      <Button
        variant="success"
        onClick={onExportExcel}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Download size={18} />
        تصدير Excel
      </Button>
      <Button
        variant="danger"
        onClick={onExportPDF}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <FileText size={18} />
        تصدير PDF
      </Button>
    </div>
  );
}