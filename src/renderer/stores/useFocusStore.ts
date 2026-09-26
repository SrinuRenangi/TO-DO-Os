import { create } from 'zustand';
import { FocusMode, SoundType } from '@shared/types';
import { soundSynth } from '@/lib/sound-synth';

interface FocusState {
  mode: FocusMode;
  targetMinutes: number;
  remainingSeconds: number;
  isRunning: boolean;
  activeSound: SoundType;
  volume: number;
  totalFocusMinutesToday: number;
  sessionsCompletedToday: number;

  // Actions
  setMode: (mode: FocusMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setSoundType: (sound: SoundType) => void;
  setVolume: (volume: number) => void;
}

const MODE_MINUTES: Record<FocusMode, number> = {
  pomodoro: 25,
  deep_work: 50,
  ultradian: 90,
  stopwatch: 0,
};

export const useFocusStore = create<FocusState>((set, get) => ({
  mode: 'deep_work',
  targetMinutes: 50,
  remainingSeconds: 50 * 60,
  isRunning: false,
  activeSound: 'none',
  volume: 0.25,
  totalFocusMinutesToday: 95,
  sessionsCompletedToday: 2,

  setMode: (mode) => {
    const mins = MODE_MINUTES[mode];
    set({
      mode,
      targetMinutes: mins,
      remainingSeconds: mins * 60,
      isRunning: false,
    });
    soundSynth.stopAmbientSound();
  },

  startTimer: () => {
    const { activeSound, volume } = get();
    set({ isRunning: true });
    soundSynth.playChime('start');
    if (activeSound !== 'none') {
      soundSynth.setAmbientSound(activeSound, volume);
    }
  },

  pauseTimer: () => {
    set({ isRunning: false });
    soundSynth.stopAmbientSound();
  },

  resetTimer: () => {
    const { mode } = get();
    const mins = MODE_MINUTES[mode];
    set({
      remainingSeconds: mins * 60,
      isRunning: false,
    });
    soundSynth.stopAmbientSound();
  },

  tick: () => {
    const { remainingSeconds, isRunning, mode, targetMinutes, totalFocusMinutesToday, sessionsCompletedToday } = get();
    if (!isRunning) return;

    if (mode === 'stopwatch') {
      set({ remainingSeconds: remainingSeconds + 1 });
      return;
    }

    if (remainingSeconds <= 1) {
      // Completed session
      soundSynth.playChime('complete');
      soundSynth.stopAmbientSound();
      set({
        isRunning: false,
        remainingSeconds: targetMinutes * 60,
        totalFocusMinutesToday: totalFocusMinutesToday + targetMinutes,
        sessionsCompletedToday: sessionsCompletedToday + 1,
      });
    } else {
      set({ remainingSeconds: remainingSeconds - 1 });
    }
  },

  setSoundType: (sound) => {
    const { isRunning, volume } = get();
    set({ activeSound: sound });
    if (isRunning) {
      soundSynth.setAmbientSound(sound, volume);
    }
  },

  setVolume: (volume) => {
    set({ volume });
    const { isRunning, activeSound } = get();
    if (isRunning && activeSound !== 'none') {
      soundSynth.setAmbientSound(activeSound, volume);
    }
  },
}));
