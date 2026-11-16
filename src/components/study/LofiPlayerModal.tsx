import React, { useState } from 'react';
import { 
  X, Volume2, VolumeX, Play, Pause, 
  CloudRain, Waves, Brain, Music, Sparkles 
} from 'lucide-react';
import type { SoundscapeType } from '../../types';
import { SOUNDSCAPE_TRACKS, soundscapeEngine } from '../../lib/soundscapes';

interface LofiPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // External state shared with Navbar
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrackId: SoundscapeType;
  setCurrentTrackId: (id: SoundscapeType) => void;
  volume: number;
  setVolume: (vol: number) => void;
}

export const LofiPlayerModal: React.FC<LofiPlayerModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  setIsPlaying,
  currentTrackId,
  setCurrentTrackId,
  volume,
  setVolume,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  if (!isOpen) return null;

  const handleTogglePlay = (trackId?: SoundscapeType) => {
    const targetId = trackId || currentTrackId;

    if (isPlaying && currentTrackId === targetId) {
      soundscapeEngine.stop();
      setIsPlaying(false);
    } else {
      setCurrentTrackId(targetId);
      soundscapeEngine.setVolume(isMuted ? 0 : volume);
      soundscapeEngine.play(targetId);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
    soundscapeEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume || 0.5);
      soundscapeEngine.setVolume(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      soundscapeEngine.setVolume(0);
    }
  };

  const getTrackIcon = (id: SoundscapeType) => {
    switch (id) {
      case 'rain': return <CloudRain className="w-4 h-4 text-sky-500" />;
      case 'ocean': return <Waves className="w-4 h-4 text-cyan-500" />;
      case 'binaural': return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'stream': return <Music className="w-4 h-4 text-rose-500" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Lo-Fi & Study Ambience</h2>
              <p className="text-[11px] text-slate-500">Suara penenang konsentrasi & fokus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Selection List */}
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {SOUNDSCAPE_TRACKS.map((track) => {
            const isThisActive = currentTrackId === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => handleTogglePlay(track.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isThisActive
                    ? 'border-indigo-500 bg-indigo-50/60 shadow-2xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isThisActive ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 shadow-2xs'
                  }`}>
                    {isThisActive ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-white rounded-full eq-bar-1" />
                        <div className="w-0.5 bg-white rounded-full eq-bar-2" />
                        <div className="w-0.5 bg-white rounded-full eq-bar-3" />
                      </div>
                    ) : (
                      getTrackIcon(track.id)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{track.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{track.description}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  <button
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      isThisActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isThisActive ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master Audio Controller Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
          {/* Volume Control Slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMute}
              className="p-1 rounded text-slate-500 hover:text-slate-900 transition cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-indigo-600" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              title="Volume Audio"
            />
            <span className="text-[11px] font-mono text-slate-500 w-8 text-right tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Audio sintetis Web Audio bekerja 100% offline tanpa delay.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
