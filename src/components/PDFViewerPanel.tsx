import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, ZoomIn, ZoomOut, FileText, Bookmark, Plus } from 'lucide-react';
import type { DocumentItem } from '../types';
import { getDocumentPdfUrl } from '../lib/api';
import { ContentReaderPanel } from './ContentReaderPanel';

interface PDFViewerPanelProps {
  document: DocumentItem | null;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onOpenAddBookmark?: () => void;
  bookmarksCount?: number;
  onOpenBookmarkDrawer?: () => void;
}

export const PDFViewerPanel: React.FC<PDFViewerPanelProps> = ({
  document,
  currentPage,
  onPageChange,
  onOpenAddBookmark,
  bookmarksCount = 0,
  onOpenBookmarkDrawer,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  // Trigger subtle pulse highlight when page changes (e.g. from citation click)
  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 1200);
    return () => clearTimeout(timer);
  }, [currentPage]);

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#F5F7FB]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#e2eaf2] flex items-center justify-center text-[#397DE0] mb-3 shadow-xs">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-[#25344B] text-base">Materi Belum Dipilih</h3>
        <p className="text-xs text-[#7487a3] max-w-xs mt-1.5 leading-relaxed">
          Pilih salah satu materi di perpustakaan atau tambahkan berkas belajar Anda untuk ditampilkan bersama Qurio.
        </p>
      </div>
    );
  }

  // Jika bukan berkas PDF (misal: YouTube, DOCX, PPTX, TXT), gunakan ContentReaderPanel ringan
  const isNonPdf = (document.source_type && document.source_type !== 'pdf') || !document.filename.toLowerCase().endsWith('.pdf');
  if (isNonPdf) {
    return (
      <ContentReaderPanel
        document={document}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onOpenAddBookmark={onOpenAddBookmark}
        bookmarksCount={bookmarksCount}
        onOpenBookmarkDrawer={onOpenBookmarkDrawer}
      />
    );
  }

  const pdfUrl = getDocumentPdfUrl(document.id);
  const totalPages = document.page_count;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      onPageChange(val);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F7FB] overflow-hidden">
      {/* Precision PDF Toolbar */}
      <div className="h-11 bg-white border-b border-[#e2eaf2] px-3.5 flex items-center justify-between text-xs shrink-0 shadow-[0_1px_2px_rgba(37,52,75,0.03)]">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <FileText className="w-3.5 h-3.5 text-[#397DE0] shrink-0" />
          <span className="font-semibold text-[#25344B] truncate text-xs" title={document.filename}>
            {document.filename}
          </span>
        </div>

        {/* Navigasi Halaman dengan Efek Pulse */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-[#F5F7FB] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Halaman Sebelumnya"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border border-[#e2eaf2] bg-[#F5F7FB] transition-all ${
            isPulsing ? 'pulse-highlight' : ''
          }`}>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              className="w-9 text-center bg-transparent text-xs font-mono tabular-nums font-bold text-[#25344B] focus:outline-hidden"
              aria-label="Halaman saat ini"
            />
            <span className="text-[#7487a3] font-mono text-[11px]">/ {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-[#F5F7FB] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Halaman Berikutnya"
            aria-label="Halaman Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom & External Link */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Perkecil"
            aria-label="Perkecil"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 w-8 text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Perbesar"
            aria-label="Perbesar"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 ml-0.5 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Buka PDF di Tab Baru"
            aria-label="Buka PDF di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tombol Bookmark & Sorotan */}
        {onOpenAddBookmark && (
          <div className="flex items-center gap-1 shrink-0 ml-2 border-l border-slate-200 pl-2">
            <button
              onClick={onOpenAddBookmark}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition cursor-pointer"
              title="Tandai / Sorot Halaman Ini"
            >
              <Plus className="w-3 h-3 text-amber-600" />
              <span>Bookmark</span>
            </button>
            {onOpenBookmarkDrawer && (
              <button
                onClick={onOpenBookmarkDrawer}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer relative"
                title={`Buka Daftar Bookmark (${bookmarksCount})`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {bookmarksCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {bookmarksCount}
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Frame PDF Asli */}
      <div className="flex-1 w-full h-full bg-slate-200/50 overflow-hidden relative">
        <iframe
          key={`${document.id}-page-${currentPage}-${zoomLevel}`}
          src={`${pdfUrl}#page=${currentPage}&zoom=${zoomLevel}`}
          className="w-full h-full border-none"
          title="Pratinjau PDF Asli"
        />
      </div>
    </div>
  );
};
