import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, LayoutDashboard, Settings, LogOut, 
  BookOpen, Sparkles, ChevronRight, ShieldCheck, FileText
} from 'lucide-react';

interface ProfileDropdownProps {
  userEmail: string;
  memberId: string;
  documentsCount: number;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
  onOpenWorkspace?: () => void;
  isWorkspace?: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userEmail,
  memberId,
  documentsCount,
  onOpenDashboard,
  onOpenSettings,
  onLogout,
  onNavigateHome,
  onOpenWorkspace,
  isWorkspace = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat pengguna klik di luar elemen
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Burger & Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-[#F5F7FB] border border-[#e2eaf2] px-3 py-1.5 rounded-xl transition-all cursor-pointer group shadow-2xs"
        title="Menu Profil & Navigasi Qurio"
      >
        <div className="w-6 h-6 rounded-lg bg-[#397DE0] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-left hidden sm:flex">
          <span className="text-[#25344B] font-semibold text-xs leading-none truncate max-w-[130px]">
            {userEmail}
          </span>
          <span className="text-[10px] text-[#7487a3] font-mono mt-0.5">
            {memberId}
          </span>
        </div>
        <Menu className="w-3.5 h-3.5 text-[#7487a3] group-hover:text-[#25344B] transition-colors ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#e2eaf2] overflow-hidden z-50">
          {/* Header Profil Singkat */}
          <div className="p-3.5 border-b border-[#e2eaf2] bg-[#F5F7FB]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#397DE0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#25344B] truncate">{userEmail}</p>
                <div className="inline-flex items-center gap-1 text-[10px] text-[#397DE0] font-mono font-semibold mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#397DE0]" />
                  <span>{memberId}</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#e2eaf2] flex items-center justify-between text-[11px] text-[#7487a3]">
              <span className="flex items-center gap-1 font-medium">
                <FileText className="w-3 h-3 text-[#397DE0]" />
                <span>Materi Belajar:</span>
              </span>
              <span className="font-semibold text-[#25344B] tabular-nums">{documentsCount} Dokumen</span>
            </div>
          </div>

          {/* Navigasi Utama */}
          <div className="p-2 space-y-1 text-xs">
            {isWorkspace && onNavigateHome && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateHome();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F5F7FB] text-[#25344B] font-semibold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#397DE0]" />
                  <span>Halaman Beranda</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
            )}

            {!isWorkspace && onOpenWorkspace && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenWorkspace();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Buka Ruang Belajar</span>
                </div>
                <ChevronRight className="w-3 h-3 text-indigo-500" />
              </button>
            )}

            {/* Tombol Dashboard */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenDashboard();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Dashboard Belajar</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </button>

            {/* Tombol Settings */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Informasi Akun</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </button>
          </div>

          {/* Tombol Logout */}
          <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
