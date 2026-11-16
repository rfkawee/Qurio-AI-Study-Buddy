import React from 'react';
import { 
  ArrowLeft, FileText, Headphones, 
  Palette, Edit3, Bookmark 
} from 'lucide-react';
import type { DocumentItem, ColorTheme } from '../types';
import { ProfileDropdown } from './ProfileDropdown';
import { QurioLogo } from './QurioLogo';

interface NavbarProps {
  activeDoc: DocumentItem | null;
  userEmail?: string | null;
  memberId?: string;
  documentsCount?: number;
  onLogout?: () => void;
  onBackToLanding?: () => void;
  onOpenDashboard?: () => void;
  onOpenSettings?: () => void;
  // Study Toolkit Enhancements
  onOpenPomodoro?: () => void;
  pomodoroRunning?: boolean;
  pomodoroTime?: string;
  onOpenLofi?: () => void;
  lofiPlaying?: boolean;
  onOpenThemeSelector?: () => void;
  currentTheme?: ColorTheme;
  onOpenNotes?: () => void;
  onOpenBookmarks?: () => void;
  bookmarksCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeDoc,
  userEmail,
  memberId,
  documentsCount = 0,
  onLogout,
  onBackToLanding,
  onOpenDashboard,
  onOpenSettings,
  onOpenPomodoro,
  pomodoroRunning = false,
  pomodoroTime = '25:00',
  onOpenLofi,
  lofiPlaying = false,
  onOpenThemeSelector,
  currentTheme = 'light',
  onOpenNotes,
  onOpenBookmarks,
  bookmarksCount = 0,
}) => {
  return (
    <header className="h-14 border-b border-[#e2eaf2] bg-white/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-[0_1px_3px_rgba(37,52,75,0.03)]">
      <div className="flex items-center gap-3 overflow-hidden">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="p-1.5 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-[#F5F7FB] transition-colors cursor-pointer"
            title="Kembali ke Beranda"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div 
          onClick={onBackToLanding}
          className="cursor-pointer shrink-0 transition-transform hover:scale-[1.02]"
          title="Ke Beranda Qurio"
        >
          <QurioLogo size="sm" showBadge={true} badgeText="Workspace" />
        </div>

        {activeDoc && (
          <div className="hidden xl:flex items-center gap-2 ml-3 pl-3 border-l border-[#e2eaf2] text-xs text-[#7487a3] overflow-hidden">
            <FileText className="w-3.5 h-3.5 text-[#397DE0] shrink-0" />
            <span className="font-semibold text-[#25344B] truncate max-w-[200px]">{activeDoc.filename}</span>
            <span className="tabular-nums font-mono text-[#7487a3]">({activeDoc.page_count} Hal)</span>
          </div>
        )}
      </div>

      {/* Center/Right: Study Toolkit Bar (Pomodoro, Lofi, Theme, Notes, Bookmarks) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Pomodoro Timer Button */}
        {onOpenPomodoro && (
          <button
            onClick={onOpenPomodoro}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              pomodoroRunning
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs animate-pulse'
                : 'bg-white hover:bg-[#F5F7FB] text-[#25344B] border-[#e2eaf2]'
            }`}
            title="Pomodoro Study Timer"
          >
            <span className="text-xs">🍅</span>
            <span className="font-mono tabular-nums font-semibold">{pomodoroTime}</span>
          </button>
        )}

        {/* Lo-Fi & Ambient Soundscape Button */}
        {onOpenLofi && (
          <button
            onClick={onOpenLofi}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              lofiPlaying
                ? 'bg-[#ebf3fd] text-[#397DE0] border-[#A9D8FF] shadow-2xs'
                : 'bg-white hover:bg-[#F5F7FB] text-[#25344B] border-[#e2eaf2]'
            }`}
            title="Lo-Fi & Study Ambience"
          >
            {lofiPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 bg-[#397DE0] rounded-full eq-bar-1" />
                <div className="w-0.5 bg-[#397DE0] rounded-full eq-bar-2" />
                <div className="w-0.5 bg-[#397DE0] rounded-full eq-bar-3" />
              </div>
            ) : (
              <Headphones className="w-3.5 h-3.5 text-[#7487a3]" />
            )}
            <span className="hidden md:inline text-[11px] font-semibold">
              {lofiPlaying ? 'Playing' : 'Lo-Fi'}
            </span>
          </button>
        )}

        {/* Quick Color Theme Switcher */}
        {onOpenThemeSelector && (
          <button
            onClick={onOpenThemeSelector}
            className="p-1.5 rounded-xl border border-[#e2eaf2] bg-white hover:bg-[#F5F7FB] text-[#7487a3] hover:text-[#25344B] transition cursor-pointer"
            title={`Ganti Tema Warna (Saat ini: ${currentTheme})`}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mini Notes Drawer Button */}
        {onOpenNotes && (
          <button
            onClick={onOpenNotes}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#e2eaf2] bg-white hover:bg-[#F5F7FB] text-[#25344B] text-xs font-semibold transition cursor-pointer"
            title="Buka Mini Notes Scratchpad"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#397DE0]" />
            <span className="hidden lg:inline text-[11px]">Catatan</span>
          </button>
        )}

        {/* Bookmarks Drawer Button */}
        {onOpenBookmarks && (
          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#e2eaf2] bg-white hover:bg-[#F5F7FB] text-[#25344B] text-xs font-semibold transition cursor-pointer relative"
            title={`Buka Sorotan & Bookmark (${bookmarksCount})`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#FFD66B]" />
            <span className="hidden lg:inline text-[11px]">Bookmark</span>
            {bookmarksCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                {bookmarksCount}
              </span>
            )}
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Navigasi cepat ke Beranda */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>Beranda</span>
          </button>
        )}

        {/* Profile Dropdown */}
        {userEmail && (
          <ProfileDropdown
            userEmail={userEmail}
            memberId={memberId || 'MBR-GUEST'}
            documentsCount={documentsCount}
            onOpenDashboard={onOpenDashboard || (() => {})}
            onOpenSettings={onOpenSettings || (() => {})}
            onLogout={onLogout || (() => {})}
            onNavigateHome={onBackToLanding}
            isWorkspace={true}
          />
        )}
      </div>
    </header>
  );
};

