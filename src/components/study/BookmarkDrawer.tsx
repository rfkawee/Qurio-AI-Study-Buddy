import React, { useState } from 'react';
import { 
  X, Bookmark, Plus, Search, Trash2, 
  Copy, Check, ExternalLink, Filter 
} from 'lucide-react';
import type { BookmarkItem, BookmarkColor, DocumentItem } from '../../types';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentItem | null;
  bookmarks: BookmarkItem[];
  onDeleteBookmark: (id: string) => void;
  onOpenAddModal: () => void;
  onJumpToPage: (page: number) => void;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({
  isOpen,
  onClose,
  activeDoc,
  bookmarks,
  onDeleteBookmark,
  onOpenAddModal,
  onJumpToPage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<BookmarkColor | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter bookmarks
  const docBookmarks = activeDoc 
    ? bookmarks.filter((b) => b.document_id === activeDoc.id)
    : bookmarks;

  const filteredBookmarks = docBookmarks.filter((b) => {
    const matchesColor = selectedColor === 'all' || b.color === selectedColor;
    const matchesQuery = 
      b.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.note && b.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesColor && matchesQuery;
  });

  const handleCopyQuote = (b: BookmarkItem) => {
    navigator.clipboard.writeText(`"${b.quote}" (Halaman ${b.page})`);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getHighlightClass = (color: BookmarkColor) => {
    switch (color) {
      case 'yellow': return 'bookmark-highlight-yellow';
      case 'green': return 'bookmark-highlight-green';
      case 'pink': return 'bookmark-highlight-pink';
      case 'blue': return 'bookmark-highlight-blue';
      default: return 'bookmark-highlight-yellow';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-[#e2eaf2] flex flex-col font-sans">
      {/* Header Drawer */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaf2] bg-[#F5F7FB]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔖</span>
          <div>
            <h2 className="text-sm font-bold text-[#25344B]">Sorotan & Bookmark</h2>
            <p className="text-[11px] text-[#7487a3]">
              {activeDoc ? activeDoc.filename : 'Semua Dokumen'} ({filteredBookmarks.length} ditandai)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#397DE0] text-white text-xs font-semibold hover:bg-[#2e68bf] transition-all cursor-pointer shadow-sm hover:shadow"
            title="Tambah Bookmark Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-white transition cursor-pointer"
            title="Tutup Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 border-b border-[#e2eaf2] space-y-2 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#7487a3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kutipan atau catatan..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e2eaf2] bg-[#F5F7FB] focus:bg-white focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20 text-[#25344B]"
          />
        </div>

        {/* Color Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Warna:</span>
          </span>
          <button
            onClick={() => setSelectedColor('all')}
            className={`px-2 py-0.5 rounded-full border transition cursor-pointer ${
              selectedColor === 'all'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedColor('yellow')}
            className={`px-2 py-0.5 rounded-full border transition cursor-pointer ${
              selectedColor === 'yellow'
                ? 'bg-amber-100 text-amber-900 border-amber-400 font-semibold'
                : 'bg-amber-50/50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            🟡 Kuning
          </button>
          <button
            onClick={() => setSelectedColor('green')}
            className={`px-2 py-0.5 rounded-full border transition cursor-pointer ${
              selectedColor === 'green'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold'
                : 'bg-emerald-50/50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            🟢 Hijau
          </button>
          <button
            onClick={() => setSelectedColor('pink')}
            className={`px-2 py-0.5 rounded-full border transition cursor-pointer ${
              selectedColor === 'pink'
                ? 'bg-pink-100 text-pink-900 border-pink-400 font-semibold'
                : 'bg-pink-50/50 text-pink-700 border-pink-200 hover:bg-pink-100'
            }`}
          >
            🌸 Pink
          </button>
          <button
            onClick={() => setSelectedColor('blue')}
            className={`px-2 py-0.5 rounded-full border transition cursor-pointer ${
              selectedColor === 'blue'
                ? 'bg-sky-100 text-sky-900 border-sky-400 font-semibold'
                : 'bg-sky-50/50 text-sky-700 border-sky-200 hover:bg-sky-100'
            }`}
          >
            🔵 Biru
          </button>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {filteredBookmarks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 mb-3 shadow-2xs">
              <Bookmark className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-700">Belum Ada Bookmark</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1">
              Tandai kutipan atau materi penting dengan mengklik tombol "+ Tambah" di atas atau tombol "+ Bookmark" pada viewer PDF.
            </p>
          </div>
        ) : (
          filteredBookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden hover:shadow-xs transition group"
            >
              {/* Header Kartu Bookmark */}
              <div className="px-3 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => onJumpToPage(b.page)}
                  className="flex items-center gap-1.5 font-semibold text-indigo-700 hover:text-indigo-900 transition cursor-pointer"
                  title={`Lompat ke Halaman ${b.page}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Halaman {b.page}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyQuote(b)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                    title="Salin Kutipan"
                  >
                    {copiedId === b.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(b.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Bookmark"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Kutipan Teks dengan Sorotan */}
              <div
                onClick={() => onJumpToPage(b.page)}
                className={`p-3 text-xs leading-relaxed cursor-pointer font-serif transition ${getHighlightClass(
                  b.color
                )}`}
              >
                "{b.quote}"
              </div>

              {/* Catatan Pribadi (Jika Ada) */}
              {b.note && (
                <div className="px-3 py-2 bg-slate-50/40 border-t border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                  <span className="text-slate-400 italic">Catatan:</span>
                  <span className="font-sans">{b.note}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Klik bookmark untuk auto-jump ke halaman PDF</span>
        <button
          onClick={onClose}
          className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
        >
          Sembunyikan
        </button>
      </div>
    </div>
  );
};
