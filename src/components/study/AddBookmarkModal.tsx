import React, { useState } from 'react';
import { Bookmark, X, Highlighter } from 'lucide-react';
import type { BookmarkColor, BookmarkItem } from '../../types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  memberId: string;
  currentPage: number;
  onAddBookmark: (bookmark: BookmarkItem) => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  documentId,
  memberId,
  currentPage,
  onAddBookmark,
}) => {
  const [page, setPage] = useState<number>(currentPage);
  const [quote, setQuote] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [color, setColor] = useState<BookmarkColor>('yellow');

  // Sync page when modal opens
  React.useEffect(() => {
    setPage(currentPage);
  }, [currentPage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) return;

    const newBookmark: BookmarkItem = {
      id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      document_id: documentId,
      member_id: memberId,
      page: page,
      quote: quote.trim(),
      note: note.trim() || undefined,
      color: color,
      created_at: new Date().toISOString(),
    };

    onAddBookmark(newBookmark);
    setQuote('');
    setNote('');
    onClose();
  };

  const colors: { id: BookmarkColor; name: string; bg: string; dot: string }[] = [
    { id: 'yellow', name: 'Kuning', bg: 'bg-amber-100 border-amber-300', dot: 'bg-amber-500' },
    { id: 'green', name: 'Hijau', bg: 'bg-emerald-100 border-emerald-300', dot: 'bg-emerald-500' },
    { id: 'pink', name: 'Merah Muda', bg: 'bg-pink-100 border-pink-300', dot: 'bg-pink-500' },
    { id: 'blue', name: 'Biru', bg: 'bg-sky-100 border-sky-300', dot: 'bg-sky-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔖</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sorot & Bookmark Teks</h2>
              <p className="text-[11px] text-slate-500">Tandai kutipan atau inti pembahasan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Halaman */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-600 font-medium">Halaman PDF:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Halaman {page}
              </span>
            </div>
          </div>

          {/* Warna Sorotan */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1.5 flex items-center gap-1">
              <Highlighter className="w-3.5 h-3.5 text-slate-500" />
              <span>Warna Sorotan (Highlight Tag):</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    color === c.id
                      ? `${c.bg} font-semibold ring-2 ring-indigo-500 ring-offset-1`
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  <span className="text-[10px]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kutipan Teks */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Kutipan / Inti Pembahasan <span className="text-rose-500">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Tempel atau ketik kutipan materi penting dari halaman ini..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Catatan / Opini Tambahan */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Catatan Pribadi (Opsional):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Sering keluar di UTS bab 3..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs text-slate-800"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!quote.trim()}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Simpan Bookmark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
