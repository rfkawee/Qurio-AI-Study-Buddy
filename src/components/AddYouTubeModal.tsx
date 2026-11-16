import React, { useState } from 'react';
import { X, Loader2, AlertCircle, Link, CheckCircle2 } from 'lucide-react';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { addYouTubeReference } from '../lib/api';
import type { DocumentItem } from '../types';

interface AddYouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
}

export const AddYouTubeModal: React.FC<AddYouTubeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const newDoc = await addYouTubeReference(url.trim());
      setUrl('');
      onSuccess(newDoc);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses video YouTube.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-2xs">
              <YouTubeIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tambah Referensi YouTube</h2>
              <p className="text-[11px] text-slate-500">Ekstraksi transkrip & takarir materi edukasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1.5 flex items-center justify-between">
              <span>Tautan Video YouTube:</span>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-normal cursor-pointer"
              >
                Tempel dari Clipboard
              </button>
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-mono text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Mendukung link reguler, link pendek <code>youtu.be</code>, atau YouTube Shorts.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mode Ringan (Fast & Zero Lag)</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              Sistem akan mengekstrak transkrip teks dan menyajikannya di ruang belajar. Tidak menggunakan pemutar video berat sehingga peramban Anda tetap cepat dan hemat kuota.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-2 shadow-xs shadow-rose-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengekstrak Transkrip...</span>
                </>
              ) : (
                <>
                  <YouTubeIcon className="w-3.5 h-3.5 text-white" />
                  <span>Proses Materi Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
