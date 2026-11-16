import React from 'react';
import { 
  X, LayoutDashboard, FileText, BookOpen, 
  ShieldCheck, ArrowRight, Sparkles, Copy, Check
} from 'lucide-react';
import type { DocumentItem } from '../types';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  memberId: string;
  documents: DocumentItem[];
  onSelectDocAndOpenWorkspace?: (doc: DocumentItem) => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  memberId,
  documents,
  onSelectDocAndOpenWorkspace,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const totalPages = documents.reduce((acc, d) => acc + (d.page_count || 0), 0);
  const totalSizeMB = (documents.reduce((acc, d) => acc + (d.file_size_bytes || 0), 0) / (1024 * 1024)).toFixed(1);

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col font-sans">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dashboard Belajar</h2>
              <p className="text-[11px] text-slate-500">Ringkasan aktivitas materi & status akun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Konten Dashboard */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Kartu Profil Member */}
          <div className="bg-[#25344B] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9D8FF]">
                Akun Terdaftar Qurio
              </span>
              <h3 className="text-sm font-bold mt-0.5">{userEmail || 'Pelajar Qurio'}</h3>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white/10 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A9D8FF]" />
                <span className="font-mono text-[11px] text-[#A9D8FF]">{memberId}</span>
                <button
                  onClick={handleCopyId}
                  className="ml-1 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Salin ID Pelajar"
                >
                  {copied ? <Check className="w-3 h-3 text-[#A9E5C1]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="self-start sm:self-center">
              <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#A9E5C1] border border-[#10b981]/30 text-[11px] font-semibold font-mono">
                Status: Siap Belajar
              </span>
            </div>
          </div>

          {/* 3 Statistik Tabular */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#F5F7FB] p-3.5 rounded-xl border border-[#e2eaf2]">
              <div className="flex items-center gap-1.5 text-[#7487a3] mb-1">
                <FileText className="w-3.5 h-3.5 text-[#397DE0]" />
                <span className="text-[11px] font-semibold">Materi</span>
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#25344B]">{documents.length}</p>
            </div>

            <div className="bg-[#F5F7FB] p-3.5 rounded-xl border border-[#e2eaf2]">
              <div className="flex items-center gap-1.5 text-[#7487a3] mb-1">
                <BookOpen className="w-3.5 h-3.5 text-[#397DE0]" />
                <span className="text-[11px] font-semibold">Halaman</span>
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#25344B]">{totalPages}</p>
            </div>

            <div className="bg-[#F5F7FB] p-3.5 rounded-xl border border-[#e2eaf2]">
              <div className="flex items-center gap-1.5 text-[#7487a3] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD66B]" />
                <span className="text-[11px] font-semibold">Kapasitas</span>
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-[#25344B]">{totalSizeMB} MB</p>
            </div>
          </div>

          {/* Daftar Dokumen Belajar */}
          <div>
            <h4 className="text-[11px] font-bold text-[#475a75] uppercase tracking-wider mb-2">
              Daftar Materi Belajar ({documents.length})
            </h4>

            {documents.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">Belum ada dokumen yang diunggah.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (onSelectDocAndOpenWorkspace) {
                        onSelectDocAndOpenWorkspace(doc);
                      }
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {doc.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {doc.page_count} Hal • {(doc.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium shrink-0">
                      <span>Buka</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
