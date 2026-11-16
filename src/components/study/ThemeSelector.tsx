import React from 'react';
import { Check, Sun, Moon, Coffee } from 'lucide-react';
import type { ColorTheme } from '../../types';

interface ThemeSelectorProps {
  currentTheme: ColorTheme;
  onSelectTheme: (theme: ColorTheme) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeOption {
  id: ColorTheme;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  bgPreview: string;
  borderPreview: string;
  accentPreview: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    name: 'Terang Modern (Qurio)',
    subtitle: 'Kanvas Cloud White bersih & Primary Blue',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
    bgPreview: '#F5F7FB',
    borderPreview: '#e2eaf2',
    accentPreview: '#397DE0',
  },
  {
    id: 'dark',
    name: 'Gelap Midnight',
    subtitle: 'Latar gelap pekat, nyaman di malam hari',
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
    bgPreview: '#090d16',
    borderPreview: '#1e293b',
    accentPreview: '#818cf8',
  },
  {
    id: 'warm',
    name: 'Sepia Hangat',
    subtitle: 'Kertas krem ala e-reader untuk mata lelah',
    icon: <Coffee className="w-4 h-4 text-amber-700" />,
    bgPreview: '#fcf9f2',
    borderPreview: '#e6d8c3',
    accentPreview: '#b45309',
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tema Warna Belajar</h2>
              <p className="text-[11px] text-slate-500">Pilih kenyamanan visual mata Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#397DE0] bg-[#ebf3fd] shadow-sm ring-1 ring-[#397DE0]'
                    : 'border-[#e2eaf2] hover:border-[#cbd7e6] hover:bg-[#F5F7FB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Swatch Preview */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border relative shadow-2xs"
                    style={{
                      backgroundColor: theme.bgPreview,
                      borderColor: theme.borderPreview,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.accentPreview }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#25344B]">{theme.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-[#397DE0] text-white text-[10px] font-semibold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7487a3]">{theme.subtitle}</p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#397DE0] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          Preferensi tema tersimpan otomatis di browser Anda.
        </div>
      </div>
    </div>
  );
};
