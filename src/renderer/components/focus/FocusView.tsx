import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CloudRain,
  Wind,
  Radio,
  Waves,
  Shield,
  BellRing,
} from 'lucide-react';
import { useFocusStore } from '@/stores/useFocusStore';
import { formatSecondsToTime } from '@/lib/utils';
import { SoundType } from '@shared/types';
import { TimerMode } from '@/services/database/types';

export const FocusView: React.FC = () => {
  const {
    mode,
    setMode,
    remainingSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    activeSound,
    setSoundType,
    volume,
    setVolume,
  } = useFocusStore();

  const [customMinutes, setCustomMinutes] = useState(15);

  const modes: { id: TimerMode; label: string; desc: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro', desc: '25 min' },
    { id: 'countdown', label: 'Countdown', desc: `${customMinutes} min` },
    { id: 'stopwatch', label: 'Stopwatch', desc: 'Count up' },
  ];

  const sounds: { type: SoundType; label: string; icon: React.ReactNode }[] = [
    { type: 'none', label: 'Mute', icon: <Volume2 className="w-4 h-4" /> },
    { type: 'rain', label: 'Rain', icon: <CloudRain className="w-4 h-4" /> },
    { type: 'whitenoise', label: 'Pink Noise', icon: <Wind className="w-4 h-4" /> },
    { type: 'gamma40hz', label: '40Hz Gamma', icon: <Radio className="w-4 h-4" /> },
    { type: 'stream', label: 'Stream', icon: <Waves className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8">
      {/* Header Bar */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">System Timer & Focus Engine</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Wall-clock accurate background ticking with native sound alerts on completion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            Background Reliable
          </span>
        </div>
      </div>

      {/* Main Focus Dial Canvas */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1A2333] border border-[rgba(255,255,255,0.06)] mb-8 z-10">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id, m.id === 'countdown' ? customMinutes * 60 : undefined)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === m.id
                  ? 'bg-[#4F8CFF] text-white shadow-lg shadow-[#4F8CFF]/25'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {m.label} <span className="opacity-70 font-normal">({m.desc})</span>
            </button>
          ))}
        </div>

        {/* Custom duration slider for Countdown */}
        {mode === 'countdown' && (
          <div className="mb-6 flex items-center gap-3 bg-[#1A2333] px-4 py-2 rounded-2xl border border-[rgba(255,255,255,0.06)] text-xs text-[#F8FAFC]">
            <span>Duration:</span>
            <input
              type="range"
              min="1"
              max="90"
              value={customMinutes}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCustomMinutes(val);
                setMode('countdown', val * 60);
              }}
              className="accent-[#4F8CFF] cursor-pointer w-32"
            />
            <span className="font-mono font-bold text-[#4F8CFF]">{customMinutes}m</span>
          </div>
        )}

        {/* Big Monospace Digits */}
        <div className="text-7xl md:text-9xl font-mono font-black tracking-tight text-[#F8FAFC] tabular-nums my-4 select-none">
          {formatSecondsToTime(remainingSeconds)}
        </div>

        <p className="text-xs font-semibold text-[#94A3B8] mb-8">
          {isRunning ? 'Running continuously in background tray' : 'Paused • State stored in local database'}
        </p>

        {/* Primary Controls */}
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] hover:bg-[#21293C] text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold shadow-xl transition-all ${
              isRunning
                ? 'bg-[#F59E0B] text-black hover:bg-[#d97706] shadow-[#F59E0B]/20'
                : 'bg-[#4F8CFF] text-white hover:bg-[#3b82f6] shadow-[#4F8CFF]/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Timer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ambient Soundscapes Strip */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#4F8CFF]" />
              <span>Offline Soundscape Generator</span>
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Harmonic noise synth generated via Web Audio API without network downloads.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sounds.map((s) => (
              <button
                key={s.type}
                onClick={() => setSoundType(s.type)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  activeSound === s.type
                    ? 'bg-[#4F8CFF]/20 text-[#4F8CFF] border-[#4F8CFF]/40 font-bold'
                    : 'bg-[#1A2333] text-[#94A3B8] border-[rgba(255,255,255,0.06)] hover:text-[#F8FAFC]'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}

            {activeSound !== 'none' && (
              <div className="flex items-center gap-2 ml-2 bg-[#1A2333] px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.06)]">
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="accent-[#4F8CFF] cursor-pointer w-20"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusView;
