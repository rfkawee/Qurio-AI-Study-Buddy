import React, { useRef, useState } from 'react';
import { 
  Upload, LogIn, FileText, MessageSquare, 
  Award, ChevronRight, Loader2, AlertCircle, Bookmark, ArrowRight,
  Sparkles
} from 'lucide-react';
import { YouTubeIcon } from './icons/YouTubeIcon';
import type { DocumentItem } from '../types';
import { uploadDocument } from '../lib/api';
import { ProfileDropdown } from './ProfileDropdown';
import { QurioLogo } from './QurioLogo';

interface LandingPageProps {
  userEmail: string | null;
  memberId?: string;
  documents: DocumentItem[];
  onOpenAuth: (customMessage?: string) => void;
  onLogout: () => void;
  onUploadSuccess: (newDoc: DocumentItem) => void;
  onOpenWorkspace: (doc?: DocumentItem) => void;
  onFileSelectedPreAuth: (file: File) => void;
  isAutoUploading?: boolean;
  onOpenDashboard?: () => void;
  onOpenSettings?: () => void;
  onOpenAddYouTube?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  userEmail,
  memberId,
  documents,
  onOpenAuth,
  onLogout,
  onUploadSuccess,
  onOpenWorkspace,
  onFileSelectedPreAuth,
  isAutoUploading = false,
  onOpenDashboard,
  onOpenSettings,
  onOpenAddYouTube,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewHighlightedPage, setPreviewHighlightedPage] = useState<number>(14);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isSupported = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt', '.md'].some(ext => lowerName.endsWith(ext));
    if (!isSupported) {
      setUploadError('Hanya format file .pdf, .docx, .pptx, dan .txt yang didukung.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file melebihi batas 5 MB.');
      return;
    }

    // Jika user belum login, simpan file sebagai pending upload dan arahkan ke login modal
    if (!userEmail) {
      setUploadError(null);
      onFileSelectedPreAuth(file);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newDoc = await uploadDocument(file);
      onUploadSuccess(newDoc);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah materi.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col font-sans selection:bg-[#A9D8FF] selection:text-[#25344B]">
      {/* Navbar Minimalis Qurio */}
      <header className="h-16 border-b border-[#e2eaf2] bg-white/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_3px_rgba(37,52,75,0.03)]">
        <div className="flex items-center gap-3">
          <QurioLogo size="md" showTagline={false} showBadge={true} badgeText="Your Smart Study Buddy" />
        </div>

        {/* Tombol Auth / Profile Dropdown */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <ProfileDropdown
              userEmail={userEmail}
              memberId={memberId || 'MBR-GUEST'}
              documentsCount={documents.length}
              onOpenDashboard={onOpenDashboard || (() => {})}
              onOpenSettings={onOpenSettings || (() => {})}
              onLogout={onLogout}
              onOpenWorkspace={() => onOpenWorkspace()}
              isWorkspace={false}
            />
          ) : (
            <button
              onClick={() => onOpenAuth()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#397DE0] hover:bg-[#2e68bf] text-white text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex flex-col items-center">
        {/* Hero Copy */}
        <div className="text-center max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ebf3fd] border border-[#A9D8FF]/70 text-[#397DE0] text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD66B] fill-[#FFD66B]" />
            <span>AI Study Buddy Berbasis Dokumen Asli Anda</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#25344B] tracking-tight leading-[1.15]">
            Belajar Lebih Cerdas & Cepat Bersama <span className="text-[#397DE0]">Qurio</span>
          </h1>

          <p className="mt-4 text-sm md:text-base text-[#475a75] max-w-2xl leading-relaxed">
            Unggah modul PDF, diktat kuliah, atau buku pelajaran. Qurio menjawab pertanyaan Anda dengan sitasi halaman terverifikasi <span className="font-mono text-[#397DE0] font-semibold">[Halaman X]</span>, menyusun intisari ringkasan, dan menyiapkan kuis evaluasi pemahaman instan.
          </p>
        </div>

        {/* INTERACTIVE SPLIT-SCREEN PREVIEW */}
        <div className="w-full mt-10 rounded-2xl border border-[#cbd7e6] bg-white p-2.5 sm:p-3.5 shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#e2eaf2] bg-[#F5F7FB] rounded-t-xl text-xs text-[#7487a3]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd7e6]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd7e6]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd7e6]"></span>
              <span className="ml-2 font-mono text-[11px] text-[#475a75] font-semibold">preview-workspace.qurio.app</span>
            </div>
            <span className="text-[11px] text-[#397DE0] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FFD66B]" />
              <span>Interaktif: Coba klik sitasi halaman</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white rounded-b-xl border border-t-0 border-[#e2eaf2] overflow-hidden min-h-[300px]">
            {/* Sisi Kiri: Mockup PDF Viewer */}
            <div className="p-4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between bg-slate-50/40">
              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Modul_Fisika_Modern_Bab3.pdf</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums font-medium ${
                  previewHighlightedPage === 14 
                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-400/50' 
                    : 'bg-slate-200/70 text-slate-700'
                }`}>
                  Hal {previewHighlightedPage} / 45
                </div>
              </div>

              {/* Teks Lembaran PDF Mockup */}
              <div className="flex-1 p-3 bg-white rounded border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                  Bagian 3.2: Efek Fotolistrik & Dualisme Gelombang Partikel
                </p>
                <p className="text-[12px] text-slate-600">
                  Percobaan efek fotolistrik membuktikan bahwa cahaya memiliki sifat partikel yang disebut foton. Energi kinetik maksimum elektron yang lepas tidak bergantung pada intensitas cahaya, melainkan pada frekuensi gelombang cahaya yang menyinari permukaan logam tersebut.
                </p>
                <div className={`p-2 rounded border transition-colors ${
                  previewHighlightedPage === 14
                    ? 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                    : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}>
                  <span className="text-[10px] font-mono font-semibold text-indigo-600 block mb-0.5">
                    [Kutipan Halaman 14]:
                  </span>
                  <p className="text-[11px] italic">
                    "Persamaan Einstein: E_k = h.f - W_0, di mana W_0 adalah fungsi kerja logam."
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Viewer Presisi In-App</span>
                <span className="font-mono">Skala: 100%</span>
              </div>
            </div>

            {/* Sisi Kanan: Mockup AI Chat & Sitasi */}
            <div className="p-4 flex flex-col justify-between bg-white">
              <div className="space-y-3">
                {/* User Message */}
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-[#25344B] text-white rounded-2xl rounded-br-xs px-3.5 py-2 text-xs max-w-[85%] shadow-2xs">
                    Mengapa energi kinetik fotoelektron tidak dipengaruhi intensitas cahaya?
                  </div>
                </div>

                {/* AI Assistant Message with Citation Button */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#397DE0] text-white flex items-center justify-center shrink-0 text-xs font-extrabold shadow-xs">
                    Q
                  </div>
                  <div className="bg-[#F5F7FB] border border-[#e2eaf2] rounded-2xl rounded-tl-xs p-3.5 text-xs text-[#25344B] leading-relaxed max-w-[90%] shadow-2xs">
                    <p>
                      Berdasarkan materi yang dipelajari, elektron menyerap satu foton sekaligus. Peningkatan intensitas hanya menambah jumlah foton, bukan energi masing-masing foton. Energi kinetik elektron hanya ditentukan oleh frekuensi cahaya dan fungsi kerja logam.
                    </p>
                    
                    {/* Tag Sitasi Interaktif */}
                    <div className="mt-2.5 pt-2 border-t border-[#e2eaf2] flex items-center gap-2">
                      <span className="text-[11px] text-[#7487a3]">Rujukan Faktual:</span>
                      <button
                        onClick={() => setPreviewHighlightedPage(14)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ebf3fd] hover:bg-[#397DE0] text-[#397DE0] hover:text-white border border-[#A9D8FF]/70 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Klik untuk melompatkan preview ke Halaman 14"
                      >
                        <Bookmark className="w-3 h-3 text-[#FFD66B]" />
                        <span>[Halaman 14]</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#e2eaf2] flex items-center justify-between text-[11px] text-[#7487a3]">
                <span>Jawaban Cepat Real-Time</span>
                <span className="text-[#397DE0] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#A9E5C1]"></span>
                  <span>100% Berbasis Dokumen Asli</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DROPZONE INTAKE BENCH */}
        <div className="w-full max-w-xl mt-12">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
            className="hidden"
          />

          <div
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              isDragging
                ? 'border-[#397DE0] bg-[#ebf3fd]/80 shadow-md scale-[1.01]'
                : 'border-[#cbd7e6] hover:border-[#397DE0] bg-white hover:bg-[#F5F7FB]/60 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#ebf3fd] border border-[#A9D8FF]/70 flex items-center justify-center text-[#397DE0] mb-3 shadow-2xs">
              {isUploading || isAutoUploading ? (
                <Loader2 className="w-7 h-7 animate-spin text-[#397DE0]" />
              ) : (
                <Upload className="w-7 h-7 text-[#397DE0]" />
              )}
            </div>

            <h3 className="font-bold text-[#25344B] text-base md:text-lg">
              {isUploading || isAutoUploading
                ? 'Sedang Memproses & Mengindeks Dokumen...'
                : 'Unggah Berkas Materi Belajar Anda'}
            </h3>

            <p className="mt-1 text-xs text-[#7487a3] max-w-sm leading-relaxed">
              Seret dan lepaskan berkas modul ke area ini, atau klik untuk memilih file dari perangkat Anda.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-[#7487a3]">
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] border border-[#e2eaf2]">Maks. 5 MB</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] border border-[#e2eaf2]">Tanpa Batas Halaman</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#ebf3fd] border border-[#A9D8FF]/60 font-semibold text-[#397DE0]">PDF, Word, PPTX, TXT</span>
            </div>
          </div>

          {/* Opsi Referensi Video YouTube */}
          {onOpenAddYouTube && (
            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                onClick={onOpenAddYouTube}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-[#e2eaf2] hover:border-rose-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <YouTubeIcon className="w-4 h-4 text-rose-600" />
                <span>Atau Tambahkan Referensi Video YouTube (Tempel Link)</span>
              </button>
            </div>
          )}

          {uploadError && (
            <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* PERSONAL LIBRARY SHELF (Jika User Memiliki Dokumen) */}
        {documents.length > 0 && (
          <div className="w-full max-w-4xl mt-14 pt-10 border-t border-[#e2eaf2]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#25344B] tracking-tight">Perpustakaan Materi Anda</h2>
                <p className="text-xs text-[#7487a3]">Pilih dokumen yang sudah pernah diunggah untuk melanjutkan sesi belajar bersama Qurio.</p>
              </div>
              <button
                onClick={() => onOpenWorkspace()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e2eaf2] bg-white hover:bg-[#F5F7FB] text-[#25344B] text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow"
              >
                <span>Buka Ruang Belajar</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#397DE0]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenWorkspace(doc)}
                  className="p-4 rounded-2xl border border-[#e2eaf2] bg-white hover:border-[#A9D8FF] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ebf3fd] flex items-center justify-center text-[#397DE0] shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs text-[#25344B] truncate group-hover:text-[#397DE0] transition-colors">
                        {doc.filename}
                      </h4>
                      <p className="text-[11px] text-[#7487a3] font-mono mt-0.5">
                        {doc.page_count} Halaman
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#e2eaf2] flex items-center justify-between text-[11px] text-[#7487a3]">
                    <span className="font-medium">Mulai Belajar</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#397DE0] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 PILAR FITUR BELAJAR (Friendly Modern Cards) */}
        <div className="w-full max-w-4xl mt-16 pt-10 border-t border-[#e2eaf2]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-[#e2eaf2] bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#ebf3fd] text-[#397DE0] flex items-center justify-center mb-3.5 shadow-2xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#25344B] text-sm">Tanya Jawab & Sitasi Faktual</h3>
              <p className="mt-1.5 text-xs text-[#475a75] leading-relaxed">
                Asisten akademis Qurio menjawab pertanyaan Anda hanya berdasarkan materi dokumen dengan sitasi halaman langsung [Halaman X].
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e2eaf2] bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#fff9e6] text-[#b45309] flex items-center justify-center mb-3.5 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#25344B] text-sm">Ringkasan Eksekutif & Glosarium</h3>
              <p className="mt-1.5 text-xs text-[#475a75] leading-relaxed">
                Dapatkan rangkuman bab, poin penting ujian, dan glosarium definisi istilah kunci secara otomatis dalam sekejap.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e2eaf2] bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-[#f0fbf5] text-[#059669] flex items-center justify-center mb-3.5 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#25344B] text-sm">Kuis Pilihan Ganda Interaktif</h3>
              <p className="mt-1.5 text-xs text-[#475a75] leading-relaxed">
                Uji penguasaan materi dengan kuis adaptif, evaluasi skor mendalam per opsi jawaban, dan sitasi referensi akurat.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bersahabat */}
      <footer className="border-t border-[#e2eaf2] bg-white/70 py-6 px-6 text-center text-xs text-[#7487a3]">
        <p>Qurio • Your Smart Study Buddy — Teman Belajar Cerdas Berbasis Dokumen Asli Anda</p>
      </footer>
    </div>
  );
};
