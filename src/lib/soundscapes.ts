// Soundscape & Audio Synthesizer Engine for Qurio
// Uses Web Audio API for zero-latency, offline ambient generators and chimes.

import type { SoundscapeType, SoundscapeTrack } from '../types';

export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'rain',
    name: 'Hujan Lembut',
    category: 'Suara Alam',
    iconName: 'CloudRain',
    description: 'Derau pink lembut menyerupai hujan di jendela untuk meredam kebisingan sekitar.',
  },
  {
    id: 'ocean',
    name: 'Deru Ombak Laut',
    category: 'Suara Alam',
    iconName: 'Waves',
    description: 'Osilasi frekuensi rendah yang menenangkan seperti deburan ombak pantai.',
  },
  {
    id: 'binaural',
    name: 'Gelombang Fokus (40Hz)',
    category: 'Binaural Focus',
    iconName: 'Brain',
    description: 'Binaural beat gamma 40Hz yang terbukti menstimulasi konsentrasi dan daya ingat.',
  },
  {
    id: 'stream',
    name: 'Lo-Fi Chill Beats',
    category: 'Musik Belajar',
    iconName: 'Music',
    description: 'Aliran musik instrumen lo-fi santai tanpa vokal dari radio lo-fi publik.',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio17.mp3', // Public royalty-free chillhop/lofi stream
  },
];

class SoundscapeEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private streamAudio: HTMLAudioElement | null = null;
  private currentType: SoundscapeType | null = null;
  private volume: number = 0.5;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Chime sintetis manis untuk timer Pomodoro selesai
  public playChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6 arpeggio chime

      notes.forEach((freq, index) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        noteGain.gain.setValueAtTime(0, now + index * 0.12);
        noteGain.gain.linearRampToValueAtTime(0.2, now + index * 0.12 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain || this.audioCtx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.95);
      });
    } catch (e) {
      console.warn('Web Audio chime not supported or allowed yet:', e);
    }
  }

  // Synthesized Pink Noise Generator (Hujan & Alam)
  private createPinkNoiseNode(): AudioNode | null {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    return noise;
  }

  // Mulai memutar soundscape yang dipilih
  public play(type: SoundscapeType) {
    this.stop();
    this.initContext();
    if (!this.audioCtx || !this.masterGain) return;

    this.currentType = type;

    if (type === 'rain') {
      const noise = this.createPinkNoiseNode() as AudioBufferSourceNode;
      if (!noise) return;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

      noise.connect(filter);
      filter.connect(this.masterGain);
      noise.start();
      this.noiseNode = noise;
    } else if (type === 'ocean') {
      const noise = this.createPinkNoiseNode() as AudioBufferSourceNode;
      if (!noise) return;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.audioCtx.currentTime);

      const waveGain = this.audioCtx.createGain();
      waveGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);

      // Low frequency oscillator for wave swells (0.1 Hz)
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime);

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      lfo.connect(lfoGain.gain);

      noise.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(this.masterGain);

      noise.start();
      lfo.start();
      this.noiseNode = noise;
      this.lfoNode = lfo;
    } else if (type === 'binaural') {
      // 40Hz binaural beats (Deep Gamma / Intense Focus): 200Hz base + 240Hz
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const merger = this.audioCtx.createChannelMerger(2);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(200, this.audioCtx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(240, this.audioCtx.currentTime);

      osc1.connect(merger, 0, 0); // Kiri
      osc2.connect(merger, 0, 1); // Kanan
      merger.connect(this.masterGain);

      osc1.start();
      osc2.start();

      this.noiseNode = osc1;
      this.lfoNode = osc2;
    } else if (type === 'stream') {
      const track = SOUNDSCAPE_TRACKS.find((t) => t.id === 'stream');
      if (track?.streamUrl) {
        this.streamAudio = new Audio(track.streamUrl);
        this.streamAudio.volume = this.volume;
        this.streamAudio.crossOrigin = 'anonymous';
        this.streamAudio.play().catch((err) => {
          console.warn('Unable to play remote lo-fi audio stream:', err);
        });
      }
    }
  }

  // Hentikan semua suara yang sedang berjalan
  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {}
      this.noiseNode = null;
    }
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
      } catch {}
      this.lfoNode = null;
    }
    if (this.streamAudio) {
      this.streamAudio.pause();
      this.streamAudio.src = '';
      this.streamAudio = null;
    }
    this.currentType = null;
  }

  // Atur master volume (0.0 s/d 1.0)
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    if (this.streamAudio) {
      this.streamAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): SoundscapeType | null {
    return this.currentType;
  }

  public isPlaying(): boolean {
    return this.currentType !== null;
  }
}

export const soundscapeEngine = new SoundscapeEngine();
