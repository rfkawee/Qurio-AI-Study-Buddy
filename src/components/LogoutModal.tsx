import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string | null;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans select-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-rose-50/60 via-white to-orange-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 id="logout-title" className="text-base font-bold text-slate-800">
                Konfirmasi Keluar
              </h3>
              <p className="text-xs text-slate-500">Akhiri sesi belajar aktif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <p className="text-xs text-slate-700 leading-relaxed">
            Apakah Anda yakin ingin keluar dari akun{' '}
            <strong className="font-semibold text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              {userEmail || 'Pengguna'}
            </strong>?
          </p>

          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Seluruh dokumen materi dan riwayat tanya jawab Anda tetap tersimpan aman di akun Anda dan dapat diakses kembali setelah masuk.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Ya, Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
