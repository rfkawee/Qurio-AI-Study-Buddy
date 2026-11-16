import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ExternalLink, Search, Bookmark, Plus, 
  ChevronLeft, ChevronRight, Presentation, 
  FileCode, ZoomIn, ZoomOut, Loader2 
} from 'lucide-react';
import { YouTubeIcon } from './icons/YouTubeIcon';
import type { DocumentItem, DocumentContentResponse } from '../types';
import { fetchDocumentContent } from '../lib/api';

interface ContentReaderPanelProps {
  document: DocumentItem;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onOpenAddBookmark?: () => void;
  bookmarksCount?: number;
  onOpenBookmarkDrawer?: () => void;
}

export const ContentReaderPanel: React.FC<ContentReaderPanelProps> = ({
  document,
  currentPage,
  onPageChange,
  onOpenAddBookmark,
  bookmarksCount = 0,
  onOpenBookmarkDrawer,
}) => {
  const [contentData, setContentData] = useState<DocumentContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(13); // in px
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  const isYouTube = document.source_type === 'youtube' || document.filename.startsWith('[YouTube]');
  const isPPTX = document.source_type === 'pptx' || document.filename.toLowerCase().endsWith('.pptx');
  const isDocx = document.source_type === 'docx' || document.filename.toLowerCase().endsWith('.docx');

  // Load document pages/transcript
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchDocumentContent(document.id)
      .then((data) => {
        if (isMounted) {
          setContentData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat isi materi.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [document.id]);

  // Auto-scroll to active page / segment when currentPage changes
  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentPage]);

  const totalPages = contentData?.pages.length || document.page_count || 1;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getMediaBadge = () => {
    if (isYouTube) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
          <YouTubeIcon className="w-3 h-3 text-rose-600" />
          <span>YouTube Transkrip</span>
        </span>
      );
    }
    if (isPPTX) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
          <Presentation className="w-3 h-3 text-amber-600" />
          <span>Slide PowerPoint</span>
        </span>
      );
    }
    if (isDocx) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
          <FileText className="w-3 h-3 text-blue-600" />
          <span>Dokumen Word</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
        <FileCode className="w-3 h-3 text-slate-600" />
        <span>Berkas Teks</span>
      </span>
    );
  };

  // Filter pages or transcript lines by search
  const displayedPages = contentData?.pages.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.text.toLowerCase().includes(q) ||
      (p.title && p.title.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Precision Toolbar */}
      <div className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {getMediaBadge()}
          <span className="font-semibold text-slate-800 truncate text-xs" title={document.filename}>
            {document.filename.replace(/^\[YouTube\]\s*/i, '')}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Navigasi Halaman / Slide / Segmen */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums text-slate-600 px-1 font-medium">
              {isPPTX ? 'Slide' : isYouTube ? 'Segmen' : 'Hal'} {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
              title="Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => setFontSize((s) => Math.max(11, s - 1))}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Perkecil Ukuran Huruf"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(18, s + 1))}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Perbesar Ukuran Huruf"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Link Eksternal Video YouTube */}
          {isYouTube && (
            <a
              href={
                document.file_path && typeof document.file_path === 'string' && document.file_path.startsWith('http')
                  ? document.file_path
                  : 'https://www.youtube.com'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 transition text-[11px] font-medium"
              title="Buka Video di YouTube (Tab Baru)"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden md:inline">Buka di YouTube</span>
            </a>
          )}

          {/* Bookmark Button */}
          {onOpenAddBookmark && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
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
                  title={`Buka Bookmark (${bookmarksCount})`}
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
      </div>

      {/* Sub-header pencarian konten */}
      <div className="px-4 py-2 bg-white/60 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isYouTube ? "Cari kata dalam transkrip..." : "Cari teks dalam dokumen..."}
            className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <span className="text-[11px] text-slate-400">
          {isYouTube ? 'Transkrip teks instan (Super Ringan)' : 'Mode Baca Dokumen Bersih'}
        </span>
      </div>

      {/* Konten Utama Reader */}
      <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-xs font-medium">Memuat isi materi pembelajaran...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          </div>
        ) : displayedPages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <p className="text-xs">Tidak ada hasil yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          displayedPages.map((page) => {
            const isActive = page.page_number === currentPage;
            return (
              <div
                key={page.page_number}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => onPageChange(page.page_number)}
                className={`bg-white rounded-xl border p-4 md:p-5 transition-all shadow-2xs ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Header Tiap Halaman / Slide / Segmen Waktu */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {isPPTX ? `Slide ${page.page_number}` : isYouTube ? page.title || `Segmen ${page.page_number}` : `Halaman ${page.page_number}`}
                    </span>
                    {page.title && page.title !== `Halaman ${page.page_number}` && (
                      <span className="font-semibold text-slate-800 text-xs truncate max-w-sm">
                        {page.title}
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded-full">
                      Halaman Aktif
                    </span>
                  )}
                </div>

                {/* Teks Isi Konten */}
                <div 
                  className="text-slate-800 leading-relaxed whitespace-pre-wrap font-sans"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {page.text}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
