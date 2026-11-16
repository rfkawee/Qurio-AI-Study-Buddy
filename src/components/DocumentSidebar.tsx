import React, { useRef, useState } from 'react';
import { 
  Upload, FileText, Trash2, AlertCircle, Loader2, 
  Presentation, FileCode 
} from 'lucide-react';
import { YouTubeIcon } from './icons/YouTubeIcon';
import type { DocumentItem } from '../types';
import { uploadDocument, deleteDocument } from '../lib/api';

interface DocumentSidebarProps {
  documents: DocumentItem[];
  activeDoc: DocumentItem | null;
  onSelectDoc: (doc: DocumentItem) => void;
  onRefreshDocs: () => void;
  onOpenAddYouTube?: () => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onRefreshDocs,
  onOpenAddYouTube,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isSupported = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt', '.md'].some(ext => lowerName.endsWith(ext));
    if (!isSupported) {
      setUploadError('Format tidak didukung. Format yang diterima: PDF, Word (.docx), PowerPoint (.pptx), Catatan (.txt, .md).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file melebihi batas 5 MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newDoc = await uploadDocument(file);
      onRefreshDocs();
      onSelectDoc(newDoc);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah dokumen.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;
    try {
      await deleteDocument(docId);
      onRefreshDocs();
    } catch (err) {
      alert('Gagal menghapus dokumen.');
    }
  };

  const getDocIcon = (doc: DocumentItem) => {
    const isYT = doc.source_type === 'youtube' || doc.filename.startsWith('[YouTube]');
    const isPptx = doc.source_type === 'pptx' || doc.filename.toLowerCase().endsWith('.pptx');
    const isDocx = doc.source_type === 'docx' || doc.filename.toLowerCase().endsWith('.docx');
    const isTxt = doc.source_type === 'txt' || doc.filename.toLowerCase().endsWith('.txt') || doc.filename.toLowerCase().endsWith('.md');

    if (isYT) return <YouTubeIcon className="w-3.5 h-3.5 text-rose-500" />;
    if (isPptx) return <Presentation className="w-3.5 h-3.5 text-amber-500" />;
    if (isDocx) return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    if (isTxt) return <FileCode className="w-3.5 h-3.5 text-slate-500" />;
    return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
  };

  return (
    <aside className="w-72 border-r border-[#e2eaf2] bg-white flex flex-col h-[calc(100vh-3.5rem)] shrink-0">
      <div className="p-3.5 border-b border-[#e2eaf2]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#25344B]">Perpustakaan Materi</h2>
          <span className="text-[11px] font-mono tabular-nums bg-[#ebf3fd] text-[#397DE0] border border-[#A9D8FF]/60 px-2 py-0.5 rounded-full font-semibold">
            {documents.length} Materi
          </span>
        </div>

        {/* Input file multi-format */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
          className="hidden"
        />

        {/* Tombol Aksi: Upload Berkas & Tambah YouTube */}
        <div className="mt-3 flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#397DE0] hover:bg-[#2e68bf] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
            title="Unggah Berkas (PDF, Word, PPTX, TXT)"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-white" />
            )}
            <span className="truncate">{isUploading ? 'Memproses...' : 'Unggah Berkas'}</span>
          </button>

          {onOpenAddYouTube && (
            <button
              onClick={onOpenAddYouTube}
              className="py-2 px-2.5 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
              title="Tambah Referensi Video YouTube"
            >
              <YouTubeIcon className="w-3.5 h-3.5 text-rose-600" />
              <span>+ YouTube</span>
            </button>
          )}
        </div>

        {uploadError && (
          <div className="mt-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Daftar Dokumen */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {documents.length === 0 ? (
          <div className="text-center py-12 px-3">
            <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-[#25344B] font-semibold">Belum ada materi</p>
            <p className="text-[11px] text-[#7487a3] mt-0.5">
              Unggah file PDF/Word/PPTX/TXT atau tambahkan link YouTube.
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const isActive = activeDoc?.id === doc.id;
            const isYT = doc.source_type === 'youtube' || doc.filename.startsWith('[YouTube]');
            const cleanTitle = doc.filename.replace(/^\[YouTube\]\s*/i, '');

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#ebf3fd] border-[#A9D8FF] text-[#25344B] shadow-2xs font-semibold'
                    : 'bg-white border-transparent hover:border-[#e2eaf2] hover:bg-[#F5F7FB] text-[#475a75]'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden mr-1">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive ? 'bg-[#397DE0] text-white' : 'bg-[#F5F7FB] text-[#7487a3]'
                    }`}
                  >
                    {getDocIcon(doc)}
                  </div>
                  <div className="overflow-hidden">
                    <p
                      className="text-xs truncate font-semibold"
                      title={doc.filename}
                    >
                      {cleanTitle}
                    </p>
                    <p className="text-[10px] text-[#7487a3] font-mono">
                      {isYT ? `${doc.page_count} Segmen Transkrip` : `${doc.page_count} Hal`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#7487a3] hover:text-rose-600 rounded-lg transition cursor-pointer"
                    title="Hapus Dokumen"
                    aria-label="Hapus Dokumen"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
