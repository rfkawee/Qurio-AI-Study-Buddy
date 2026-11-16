import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, SkipForward, X, 
  Settings2, Minimize2, Bell, Clock 
} from 'lucide-react';
import type { PomodoroMode, PomodoroSettings } from '../../types';
import { soundscapeEngine } from '../../lib/soundscapes';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  // External state shared with Navbar badge
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  mode: PomodoroMode;
  setMode: (mode: PomodoroMode) => void;
  cycleCount: number;
  setCycleCount: React.Dispatch<React.SetStateAction<number>>;
  settings: PomodoroSettings;
  setSettings: React.Dispatch<React.SetStateAction<PomodoroSettings>>;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  isRunning,
  setIsRunning,
  timeRemaining,
  setTimeRemaining,
  mode,
  setMode,
  cycleCount,
  setCycleCount,
  settings,
  setSettings,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer: number | null = null;
    if (isRunning) {
      timer = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Selesai! Bunyikan chime
            if (settings.autoPlayAudio) {
              soundscapeEngine.playChime();
            }

            // Ganti mode secara otomatis
            if (mode === 'focus') {
              const newCycle = cycleCount + 1;
              setCycleCount(newCycle);
              if (newCycle % 4 === 0) {
                setMode('long_break');
                return settings.longBreakMinutes * 60;
              } else {
                setMode('short_break');
                return settings.shortBreakMinutes * 60;
              }
            } else {
              setMode('focus');
              return settings.focusMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, mode, cycleCount, settings, setCycleCount, setMode, setTimeRemaining]);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') {
      setTimeRemaining(settings.focusMinutes * 60);
    } else if (newMode === 'short_break') {
      setTimeRemaining(settings.shortBreakMinutes * 60);
    } else {
      setTimeRemaining(settings.longBreakMinutes * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeRemaining(settings.focusMinutes * 60);
    } else if (mode === 'short_break') {
      setTimeRemaining(settings.shortBreakMinutes * 60);
    } else {
      setTimeRemaining(settings.longBreakMinutes * 60);
    }
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('short_break');
      setTimeRemaining(settings.shortBreakMinutes * 60);
    } else {
      setMode('focus');
      setTimeRemaining(settings.focusMinutes * 60);
    }
  };

  // Hitung total detik untuk progress bar
  const totalSeconds = mode === 'focus' 
    ? settings.focusMinutes * 60 
    : mode === 'short_break' 
    ? settings.shortBreakMinutes * 60 
    : settings.longBreakMinutes * 60;
  
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - timeRemaining) / totalSeconds) * 100));

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍅</span>
            <h2 className="text-sm font-bold text-slate-900">Pomodoro Study Timer</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer ${
                showSettings ? 'bg-slate-100 text-indigo-600' : ''
              }`}
              title="Atur Durasi"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Tutup / Perkecil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Setting Panel Drawer jika diaktifkan */}
        {showSettings ? (
          <div className="p-5 space-y-4 bg-slate-50/70 border-b border-slate-100 text-xs">
            <h3 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pengaturan Interval (Menit)</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Fokus</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.focusMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 25);
                    setSettings((s) => ({ ...s, focusMinutes: val }));
                    if (mode === 'focus' && !isRunning) setTimeRemaining(val * 60);
                  }}
                  className="w-full px-2 py-1.5 rounded-md border border-slate-200 bg-white text-center font-mono font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Istirahat Pndk</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.shortBreakMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 5);
                    setSettings((s) => ({ ...s, shortBreakMinutes: val }));
                    if (mode === 'short_break' && !isRunning) setTimeRemaining(val * 60);
                  }}
                  className="w-full px-2 py-1.5 rounded-md border border-slate-200 bg-white text-center font-mono font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Istirahat Pnjg</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.longBreakMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 15);
                    setSettings((s) => ({ ...s, longBreakMinutes: val }));
                    if (mode === 'long_break' && !isRunning) setTimeRemaining(val * 60);
                  }}
                  className="w-full px-2 py-1.5 rounded-md border border-slate-200 bg-white text-center font-mono font-semibold"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={settings.autoPlayAudio}
                onChange={(e) => setSettings((s) => ({ ...s, autoPlayAudio: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600"
              />
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Bunyikan bel audio sintetis saat waktu habis</span>
            </label>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-1.5 bg-indigo-600 text-white rounded-lg font-medium text-xs hover:bg-indigo-700 transition"
            >
              Simpan & Kembali
            </button>
          </div>
        ) : null}

        {/* Konten Utama Timer */}
        <div className="p-6 flex flex-col items-center">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs mb-6 w-full max-w-xs justify-center">
            <button
              onClick={() => handleSwitchMode('focus')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition cursor-pointer text-center ${
                mode === 'focus'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fokus
            </button>
            <button
              onClick={() => handleSwitchMode('short_break')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition cursor-pointer text-center ${
                mode === 'short_break'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Istirahat
            </button>
            <button
              onClick={() => handleSwitchMode('long_break')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition cursor-pointer text-center ${
                mode === 'long_break'
                  ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jeda Pnjg
            </button>
          </div>

          {/* Time Display */}
          <div className="text-center relative my-2">
            <span className="font-mono text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums">
              {formatTime}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'focus' 
                ? 'Sesi fokus membaca & memahami materi' 
                : 'Saatnya peregangan & istirahatkan mata'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-5">
            <div
              className={`h-full transition-all duration-500 ${
                mode === 'focus' ? 'bg-indigo-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Siklus Tracker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
            <span>Siklus:</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < (cycleCount % 4) ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  title={`Siklus ${i + 1}`}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-slate-400 ml-1">
              ({cycleCount} selesai)
            </span>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-7 py-3 rounded-full text-white font-semibold text-sm flex items-center gap-2 shadow-md transition cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Mulai</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Lewati Siklus"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tetap berjalan saat modal ditutup</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Perkecil ke Header</span>
          </button>
        </div>
      </div>
    </div>
  );
};
