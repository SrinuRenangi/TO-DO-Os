// ============================================================================
// Personal OS — Web Audio API Native Sound Synthesizer & Audio Engine
// Zero external asset dependencies. 100% native audio nodes.
// ============================================================================

import { SoundType, ReminderSoundId, HeadphoneMode } from '@shared/types';

export interface SoundMeta {
  id: ReminderSoundId;
  name: string;
  category: 'Calm' | 'Focus' | 'Alarm' | 'Urgent' | 'Success';
  description: string;
}

export const SOUND_LIBRARY: SoundMeta[] = [
  { id: 'bell', name: 'Bell', category: 'Calm', description: 'Resonant tubular brass bell with rich overtones' },
  { id: 'crystal', name: 'Crystal', category: 'Calm', description: 'Shimmering glass harmonic crystalline chime' },
  { id: 'focus', name: 'Focus', category: 'Focus', description: 'Warm marimba acoustic pulse for deep work' },
  { id: 'gentle_chime', name: 'Gentle Chime', category: 'Calm', description: 'Soothing wind-chime triad arpeggio' },
  { id: 'soft_alarm', name: 'Soft Alarm', category: 'Alarm', description: 'Pulsating two-tone warm melodic reminder' },
  { id: 'digital_alarm', name: 'Digital Alarm', category: 'Alarm', description: 'Modern crisp dual-chirp digital alert' },
  { id: 'classic_alarm', name: 'Classic Alarm', category: 'Alarm', description: 'Resonant twin-bell mechanical alarm cadence' },
  { id: 'morning_alarm', name: 'Morning Alarm', category: 'Alarm', description: 'Uplifting ascending dawn major chord arpeggio' },
  { id: 'deep_gong', name: 'Deep Gong', category: 'Urgent', description: 'Low brass reverberant gong with rich sub-bass' },
  { id: 'task_complete', name: 'Task Complete', category: 'Success', description: 'Triumphant celebratory harmonic chord' },
];

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private activeSourceNode: AudioNode | null = null;
  private ambientGainNode: GainNode | null = null;
  private currentAmbient: SoundType = 'none';

  // Preview & Alert Audio Nodes Tracker
  private activePreviewOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private activePreviewGains: GainNode[] = [];
  private activePreviewId: ReminderSoundId | null = null;
  private previewTimeout: any = null;
  private previewListeners: Array<(id: ReminderSoundId | null) => void> = [];

  // Master Settings
  private masterVolume: number = 0.7; // 0.0 - 1.0 (default: 70%)
  private headphoneMode: HeadphoneMode = 'normal';

  constructor() {
    this.loadAudioPreferences();
  }

  public onPreviewStateChange(cb: (id: ReminderSoundId | null) => void): () => void {
    this.previewListeners.push(cb);
    cb(this.activePreviewId);
    return () => {
      this.previewListeners = this.previewListeners.filter((l) => l !== cb);
    };
  }

  private notifyPreviewListeners(): void {
    for (const listener of this.previewListeners) {
      try {
        listener(this.activePreviewId);
      } catch {}
    }
  }

  public loadAudioPreferences(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('personal_os_audio_volume');
        if (savedVol !== null) this.masterVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));

        const savedHp = localStorage.getItem('personal_os_headphone_mode');
        if (savedHp && ['low', 'normal', 'strong', 'very_strong'].includes(savedHp)) {
          this.headphoneMode = savedHp as HeadphoneMode;
        }
      } catch (e) {}
    }
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('personal_os_audio_volume', String(this.masterVolume));
      } catch (e) {}
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setHeadphoneMode(mode: HeadphoneMode): void {
    this.headphoneMode = mode;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('personal_os_headphone_mode', mode);
      } catch (e) {}
    }
  }

  public getHeadphoneMode(): HeadphoneMode {
    return this.headphoneMode;
  }

  private getEffectiveGainMultiplier(): number {
    let modeMult = 0.7;
    switch (this.headphoneMode) {
      case 'low':
        modeMult = 0.35;
        break;
      case 'normal':
        modeMult = 0.7;
        break;
      case 'strong':
        modeMult = 1.0;
        break;
      case 'very_strong':
        modeMult = 1.35;
        break;
    }
    return this.masterVolume * modeMult;
  }

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return Boolean(this.ctx);
  }

  // ==========================================================================
  // AMBIENT SOUND GENERATORS (Focus View Background Noise)
  // ==========================================================================

  public setAmbientSound(type: SoundType, volume: number = 0.25): void {
    this.stopAmbientSound();
    if (type === 'none') {
      this.currentAmbient = 'none';
      return;
    }

    if (!this.initContext() || !this.ctx) return;

    this.currentAmbient = type;
    this.ambientGainNode = this.ctx.createGain();
    const effectiveVol = volume * this.getEffectiveGainMultiplier();
    this.ambientGainNode.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);
    this.ambientGainNode.connect(this.ctx.destination);

    if (type === 'whitenoise') {
      this.playWhiteNoise();
    } else if (type === 'rain') {
      this.playRainNoise();
    } else if (type === 'gamma40hz') {
      this.playGammaBinaural();
    } else if (type === 'stream') {
      this.playStreamNoise();
    }
  }

  public stopAmbientSound(): void {
    if (this.activeSourceNode) {
      try {
        (this.activeSourceNode as AudioBufferSourceNode).stop();
      } catch {}
      this.activeSourceNode.disconnect();
      this.activeSourceNode = null;
    }
    this.currentAmbient = 'none';
  }

  public getCurrentSound(): SoundType {
    return this.currentAmbient;
  }

  // ==========================================================================
  // PREVIEW SYSTEM (Toggle Click to Play/Stop, Single Active Sound)
  // ==========================================================================

  public togglePreviewSound(soundId: ReminderSoundId): boolean {
    if (this.activePreviewId === soundId) {
      this.stopPreview();
      return false; // Now stopped
    } else {
      this.stopPreview();
      this.activePreviewId = soundId;
      this.notifyPreviewListeners();
      this.playSynthesizedSound(soundId, true);
      return true; // Now playing
    }
  }

  public stopPreview(): void {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    this.activePreviewOscillators.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
      } catch {}
      try {
        node.disconnect();
      } catch {}
    });
    this.activePreviewOscillators = [];

    this.activePreviewGains.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {}
    });
    this.activePreviewGains = [];
    this.activePreviewId = null;
    this.notifyPreviewListeners();
  }

  public getActivePreviewId(): ReminderSoundId | null {
    return this.activePreviewId;
  }

  // ==========================================================================
  // ALERT / REMINDER SOUND DISPATCH
  // ==========================================================================

  public playAlertSound(soundId: ReminderSoundId = 'bell'): void {
    this.stopPreview();
    this.playSynthesizedSound(soundId, false);
  }

  public playChime(kind: 'complete' | 'alert' | 'start' = 'complete'): void {
    if (kind === 'complete') {
      this.playAlertSound('task_complete');
    } else if (kind === 'alert') {
      this.playAlertSound('soft_alarm');
    } else {
      this.playAlertSound('focus');
    }
  }

  // ==========================================================================
  // CORE PROCEDURAL SOUND SYNTHESIS ENGINE (10 Rich Harmonic Instruments)
  // ==========================================================================

  private playSynthesizedSound(soundId: ReminderSoundId, isPreview: boolean): void {
    if (!this.initContext() || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const effectiveVol = Math.min(1.0, this.getEffectiveGainMultiplier());

    masterGain.gain.setValueAtTime(effectiveVol, now);
    masterGain.connect(ctx.destination);

    if (isPreview) {
      this.activePreviewGains.push(masterGain);
    }

    const trackOsc = (osc: OscillatorNode | AudioBufferSourceNode) => {
      if (isPreview) this.activePreviewOscillators.push(osc);
    };

    switch (soundId) {
      // 1. BELL: Rich tubular bell with fundamental (587.33Hz D5) + harmonic overtones
      case 'bell': {
        const partials = [
          { f: 587.33, g: 0.35, d: 1.8 },
          { f: 1174.66, g: 0.20, d: 1.2 },
          { f: 1761.99, g: 0.12, d: 0.8 },
          { f: 2349.32, g: 0.08, d: 0.5 },
        ];
        partials.forEach(({ f, g, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(g, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + d);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + d + 0.05);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(2000);
        break;
      }

      // 2. CRYSTAL: Shimmering high-register crystalline glass chord
      case 'crystal': {
        const notes = [1046.50, 1318.51, 1567.98, 1975.53]; // C6, E6, G6, B6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 1.25);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(1600);
        break;
      }

      // 3. FOCUS: Warm marimba acoustic pulse for deep work
      case 'focus': {
        const marimbaNotes = [440, 659.25]; // A4 -> E5
        marimbaNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.25, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.5);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(900);
        break;
      }

      // 4. SOFT ALARM: Warm pulsating two-tone melodic reminder
      case 'soft_alarm': {
        const tones = [523.25, 659.25, 523.25, 659.25]; // C5, E5, C5, E5
        tones.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.18;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.17);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(1000);
        break;
      }

      // 5. GENTLE CHIME: Soothing wind-chime triad arpeggio
      case 'gentle_chime': {
        const freqs = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.14;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 1.15);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(1800);
        break;
      }

      // 6. DIGITAL ALARM: Modern crisp dual-chirp digital alert
      case 'digital_alarm': {
        for (let burst = 0; burst < 3; burst++) {
          const t = now + burst * 0.22;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.setValueAtTime(1760, t + 0.05);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.setValueAtTime(0.001, t + 0.1);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.11);
          trackOsc(osc);
        }
        if (isPreview) this.schedulePreviewAutoStop(900);
        break;
      }

      // 7. CLASSIC ALARM: Mechanical twin-bell ring cadence
      case 'classic_alarm': {
        for (let ring = 0; ring < 6; ring++) {
          const t = now + ring * 0.1;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(ring % 2 === 0 ? 784 : 880, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.09);
          trackOsc(osc);
        }
        if (isPreview) this.schedulePreviewAutoStop(900);
        break;
      }

      // 8. MORNING ALARM: Ascending dawn major chord arpeggio
      case 'morning_alarm': {
        const dawnNotes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
        dawnNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.13;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 1.25);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(2000);
        break;
      }

      // 9. DEEP GONG: Low brass reverberant gong with rich sub-bass
      case 'deep_gong': {
        const gongPartials = [
          { f: 110.0, g: 0.35, d: 2.2 },  // A2
          { f: 220.0, g: 0.22, d: 1.8 },  // A3
          { f: 330.0, g: 0.14, d: 1.2 },  // E4
          { f: 550.0, g: 0.08, d: 0.7 },  // C#5
        ];
        gongPartials.forEach(({ f, g, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(g, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + d);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + d + 0.05);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(2500);
        break;
      }

      // 10. TASK COMPLETE: Triumphant celebratory harmonic chord
      case 'task_complete':
      default: {
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.08;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.95);
          trackOsc(osc);
        });
        if (isPreview) this.schedulePreviewAutoStop(1400);
        break;
      }
    }
  }

  private schedulePreviewAutoStop(durationMs: number): void {
    if (this.previewTimeout) clearTimeout(this.previewTimeout);
    this.previewTimeout = setTimeout(() => {
      this.stopPreview();
    }, durationMs);
  }

  // ==========================================================================
  // AMBIENT NOISE PROCEDURAL GENERATORS
  // ==========================================================================

  private playWhiteNoise() {
    if (!this.ctx || !this.ambientGainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGainNode);
    whiteNoise.start();
    this.activeSourceNode = whiteNoise;
  }

  private playRainNoise() {
    if (!this.ctx || !this.ambientGainNode) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const rain = this.ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    rain.connect(filter);
    filter.connect(this.ambientGainNode);
    rain.start();
    this.activeSourceNode = rain;
  }

  private playGammaBinaural() {
    if (!this.ctx || !this.ambientGainNode) return;
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(this.ambientGainNode);

    oscLeft.start();
    oscRight.start();

    this.activeSourceNode = oscLeft;
  }

  private playStreamNoise() {
    if (!this.ctx || !this.ambientGainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const stream = this.ctx.createBufferSource();
    stream.buffer = buffer;
    stream.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    stream.connect(filter);
    filter.connect(this.ambientGainNode);
    stream.start();
    this.activeSourceNode = stream;
  }
}

export const soundSynth = new SoundSynthesizer();
