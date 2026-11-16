import React from 'react';
import { 
  X, Settings, ShieldCheck, 
  Trash2, CheckCircle2, Palette, Check 
} from 'lucide-react';
import type { ColorTheme } from '../types';
import { THEME_OPTIONS } from './study/ThemeSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  memberId: string;
  currentTheme?: ColorTheme;
  onSelectTheme?: (theme: ColorTheme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  memberId,
  currentTheme = 'light',
  onSelectTheme,
}) => {
  const [clearedNotice, setClearedNotice] = React.useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    if (window.confirm('Atur ulang preferensi tampilan ke kondisi bawaan? (Sesi login Anda tetap aman)')) {
      const savedEmail = localStorage.getItem('qurio_user_email');
      const savedMember = localStorage.getItem('qurio_member_id');
      localStorage.clear();
      if (savedEmail) {
        localStorage.setItem('qurio_user_email', savedEmail);
      }
      if (savedMember) {
        localStorage.setItem('qurio_member_id', savedMember);
      }
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#25344B]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#e2eaf2] overflow-hidden max-h-[85vh] flex flex-col font-sans">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaf2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ebf3fd] text-[#397DE0] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#25344B]">Informasi Akun</h2>
              <p className="text-[11px] text-[#7487a3]">Informasi akun belajar Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-[#F5F7FB] transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Konten Pengaturan */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#25344B]">
          {clearedNotice && (
            <div className="p-3 rounded-xl bg-[#f0fbf5] border border-[#A9E5C1] text-[#059669] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
              <span>Preferensi tampilan berhasil diperbarui.</span>
            </div>
          )}

          {/* Bagian 1: Akun & Keanggotaan */}
          <div className="bg-[#F5F7FB] p-4 rounded-xl border border-[#e2eaf2] space-y-2">
            <h4 className="font-semibold text-[#25344B] text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#397DE0]" />
              <span>Informasi Akun Pelajar</span>
            </h4>
            <div className="flex items-center justify-between py-1 border-b border-[#e2eaf2] text-[11px]">
              <span className="text-[#7487a3]">Email Akun:</span>
              <span className="font-semibold text-[#25344B]">{userEmail || 'Tamu'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#e2eaf2] text-[11px]">
              <span className="text-[#7487a3]">ID Pelajar:</span>
              <span className="font-mono font-semibold text-[#397DE0]">{memberId}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[11px]">
              <span className="text-[#7487a3]">Keamanan Materi:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#f0fbf5] text-[#059669] border border-[#A9E5C1] font-mono text-[10px] font-semibold">
                Dokumen Pribadi & Terlindungi
              </span>
            </div>
          </div>

          {/* Bagian 2: Tema Tampilan */}
          {onSelectTheme && (
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <h4 className="font-semibold text-slate-900 text-[11px] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tema Warna Tampilan</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className={`p-2 rounded-lg border text-left transition flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white/60'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border shrink-0"
                        style={{
                          backgroundColor: theme.bgPreview,
                          borderColor: theme.borderPreview,
                        }}
                      />
                      <div className="flex-1 truncate">
                        <span className="text-[11px] font-medium text-slate-800 block truncate">
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Atur Ulang Tampilan */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#25344B] text-xs">Atur Ulang Tampilan</p>
              <p className="text-[11px] text-[#7487a3]">Kembalikan preferensi warna & tampilan ke bawaan</p>
            </div>
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2eaf2] hover:border-rose-300 hover:bg-rose-50 text-[#7487a3] hover:text-rose-600 font-semibold transition-colors cursor-pointer text-xs shadow-2xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Atur Ulang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
