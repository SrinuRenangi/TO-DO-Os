import { create } from 'zustand';
import { timerService } from '@/services/timer/timer-service';
import { TimerEntity, TimerMode } from '@/services/database/types';
import { soundSynth } from '@/lib/sound-synth';
import { SoundType } from '@shared/types';

interface TimerState {
  mode: TimerMode;
  targetSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  activeSound: SoundType;
  volume: number;

  // Actions
  setMode: (mode: TimerMode, customSeconds?: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setSoundType: (sound: SoundType) => void;
  setVolume: (volume: number) => void;
  syncWithService: (entity: TimerEntity) => void;
}

const initialTimer = timerService.getTimer();

export const useFocusStore = create<TimerState>((set, get) => {
  // Subscribe to real background timer service
  timerService.subscribe((timerEntity) => {
    set({
      mode: timerEntity.mode,
      targetSeconds: timerEntity.targetSeconds,
      remainingSeconds: timerEntity.remainingSeconds,
      isRunning: timerEntity.isRunning,
    });
  });

  return {
    mode: initialTimer.mode,
    targetSeconds: initialTimer.targetSeconds,
    remainingSeconds: initialTimer.remainingSeconds,
    isRunning: initialTimer.isRunning,
    activeSound: 'none',
    volume: 0.25,

    setMode: (mode, customSeconds) => {
      timerService.setMode(mode, customSeconds);
      soundSynth.stopAmbientSound();
    },

    startTimer: () => {
      const { activeSound, volume } = get();
      timerService.start();
      soundSynth.playChime('start');
      if (activeSound !== 'none') {
        soundSynth.setAmbientSound(activeSound, volume);
      }
    },

    pauseTimer: () => {
      timerService.pause();
      soundSynth.stopAmbientSound();
    },

    resetTimer: () => {
      timerService.reset();
      soundSynth.stopAmbientSound();
    },

    setSoundType: (sound) => {
      const { isRunning, volume } = get();
      set({ activeSound: sound });
      if (isRunning) {
        if (sound === 'none') {
          soundSynth.stopAmbientSound();
        } else {
          soundSynth.setAmbientSound(sound, volume);
        }
      }
    },

    setVolume: (volume) => {
      const { isRunning, activeSound } = get();
      set({ volume });
      if (isRunning && activeSound !== 'none') {
        soundSynth.setAmbientSound(activeSound, volume);
      }
    },

    syncWithService: (entity) => {
      set({
        mode: entity.mode,
        targetSeconds: entity.targetSeconds,
        remainingSeconds: entity.remainingSeconds,
        isRunning: entity.isRunning,
      });
    },
  };
});
