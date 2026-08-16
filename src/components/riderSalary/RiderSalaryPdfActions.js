'use client';

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Files } from 'lucide-react';
import RiderSalaryDocument from './RiderSalaryDocument';

let pdfRenderQueue = Promise.resolve();

function getValue(source, camelName, pascalName) {
  return source?.[camelName] ?? source?.[pascalName];
}

function safeFilePart(value) {
  return String(value || 'rider')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'rider';
}

function getFileName(row, startDate) {
  const rider = getValue(row, 'rider', 'Rider') || {};
  const identifier =
    getValue(rider, 'workingId', 'WorkingId') ||
    getValue(row, 'iqamaNo', 'IqamaNo') ||
    getValue(rider, 'iqamaNo', 'IqamaNo');

  return `salary-${safeFilePart(identifier)}-${safeFilePart(startDate)}.pdf`;
}

function getBulkFileName(startDate, endDate) {
  return `salary-statements-${safeFilePart(startDate)}-${safeFilePart(endDate)}.pdf`;
}

function renderPdfBlob(document) {
  const renderTask = pdfRenderQueue.then(() => pdf(document).toBlob());
  pdfRenderQueue = renderTask.catch(() => undefined);
  return renderTask;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function RiderSalaryPdfDownload({ row, startDate, endDate, label, preparingLabel }) {
  const [isPreparing, setIsPreparing] = useState(false);
  const fileName = getFileName(row, startDate);

  const handleDownload = async () => {
    if (isPreparing) return;
    setIsPreparing(true);

    try {
      const blob = await renderPdfBlob(
        <RiderSalaryDocument row={row} startDate={startDate} endDate={endDate} />
      );
      downloadBlob(blob, fileName);
    } catch (error) {
      console.error('Rider salary PDF generation failed:', error);
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isPreparing}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#173e73] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#102f59] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
    >
      <Download aria-hidden="true" size={17} />
      <span>{isPreparing ? preparingLabel : label}</span>
    </button>
  );
}

export function BulkRiderSalaryDownload({ rows, startDate, endDate, label, preparingLabel }) {
  const [isPreparing, setIsPreparing] = useState(false);

  const handleDownloadAll = async () => {
    if (!rows?.length || isPreparing) return;
    setIsPreparing(true);

    try {
      const blob = await renderPdfBlob(
        <RiderSalaryDocument rows={rows} startDate={startDate} endDate={endDate} />
      );
      downloadBlob(blob, getBulkFileName(startDate, endDate));
    } catch (error) {
      console.error('Combined rider salary PDF generation failed:', error);
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadAll}
      disabled={!rows?.length || isPreparing}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ed8b00] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#d77e00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Files aria-hidden="true" size={18} />
      <span>{isPreparing ? preparingLabel : label}</span>
    </button>
  );
}
