// ============================================================================
// Personal OS — Web Audio API Native Ambient Synthesizer & Audio Engine
// Zero external asset dependencies. 100% native audio nodes.
// ============================================================================

import { SoundType } from '@shared/types';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private activeSourceNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentSound: SoundType = 'none';

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setAmbientSound(type: SoundType, volume: number = 0.25) {
    this.stopAmbientSound();
    if (type === 'none') {
      this.currentSound = 'none';
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    this.currentSound = type;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

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

  public stopAmbientSound() {
    if (this.activeSourceNode) {
      try {
        (this.activeSourceNode as AudioBufferSourceNode).stop();
      } catch {
        // Source node may already be disconnected
      }
      this.activeSourceNode.disconnect();
      this.activeSourceNode = null;
    }
    this.currentSound = 'none';
  }

  public getCurrentSound(): SoundType {
    return this.currentSound;
  }

  public playChime(kind: 'complete' | 'alert' | 'start' = 'complete') {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';

    if (kind === 'complete') {
      // Harmonic pentatonic resolution (C6 -> G6)
      osc.frequency.setValueAtTime(1046.50, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12); // G6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    } else if (kind === 'start') {
      // Focus start gentle ping
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } else {
      // Urgent soft alert
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  private playWhiteNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Filter to soft pink/brown noise
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.activeSourceNode = whiteNoise;
  }

  private playRainNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain boost
    }

    const rain = this.ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    rain.connect(filter);
    filter.connect(this.gainNode);
    rain.start();
    this.activeSourceNode = rain;
  }

  private playGammaBinaural() {
    if (!this.ctx || !this.gainNode) return;
    // 200 Hz carrier frequency with 40 Hz gamma difference (200Hz Left, 240Hz Right)
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(this.gainNode);

    oscLeft.start();
    oscRight.start();

    this.activeSourceNode = oscLeft;
  }

  private playStreamNoise() {
    if (!this.ctx || !this.gainNode) return;
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
    filter.connect(this.gainNode);
    stream.start();
    this.activeSourceNode = stream;
  }
}

export const soundSynth = new SoundSynthesizer();
