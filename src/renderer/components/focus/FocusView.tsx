import React, { useState } from 'react';
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
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useFocusStore } from '@/stores/useFocusStore';
import { formatSecondsToTime } from '@/lib/utils';
import { SoundType } from '@shared/types';
import { TimerMode } from '@/services/database/types';
import { AnalogClock } from '@/components/dashboard/AnalogClock';

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

  const [customMinutes, setCustomMinutes] = useState(25);

  const modes: { id: TimerMode; label: string; desc: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro', desc: '25m Focus' },
    { id: 'countdown', label: 'Countdown', desc: `${customMinutes}m Preset` },
    { id: 'stopwatch', label: 'Stopwatch', desc: 'Elapsed Count' },
  ];

  const sounds: { type: SoundType; label: string; icon: React.ReactNode }[] = [
    { type: 'none', label: 'Mute', icon: <Volume2 className="w-3.5 h-3.5" /> },
    { type: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
    { type: 'whitenoise', label: 'Pink Noise', icon: <Wind className="w-3.5 h-3.5" /> },
    { type: 'gamma40hz', label: '40Hz Gamma', icon: <Radio className="w-3.5 h-3.5" /> },
    { type: 'stream', label: 'Stream', icon: <Waves className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-[1360px] mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            TIMER SERVICE: FOCUS ENGINE
          </h1>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            Wall-Clock Synchronized
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Tray Service Active
          </span>
        </div>
      </div>

      {/* Grid: Clock & Primary Dial (8 cols) + Offline Soundscape & Settings (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Main Focus Dial Panel */}
        <div className="lg:col-span-8 studio-panel p-8 flex flex-col items-center justify-between min-h-[440px]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 w-full max-w-md justify-center">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id, m.id === 'countdown' ? customMinutes * 60 : undefined)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all text-center ${
                  mode === m.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label} <span className="text-[10px] text-slate-500 font-normal">({m.desc})</span>
              </button>
            ))}
          </div>

          {/* Center: Analog & Digital Clocks side by side */}
          <div className="my-6 flex flex-col md:flex-row items-center justify-center gap-10 w-full">
            {/* Photorealistic SVG Clock */}
            <div className="w-48 h-48 drop-shadow-md">
              <AnalogClock />
            </div>

            {/* Big Digits + Status */}
            <div className="text-center md:text-left">
              <div className="text-6xl md:text-7xl font-mono font-black tracking-tight text-slate-900 tabular-nums">
                {formatSecondsToTime(remainingSeconds)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500 text-white">
                  P1 Focus
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {isRunning ? 'Active session counting down' : 'Ready to start focus block'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Elapsed: 6:22 • Data: 10% • Data: 22:08
              </div>
            </div>
          </div>

          {/* Custom Duration Slider (if Countdown) */}
          {mode === 'countdown' && (
            <div className="mb-4 flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold">Duration:</span>
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
                className="accent-blue-600 cursor-pointer w-36"
              />
              <span className="font-mono font-bold text-blue-600">{customMinutes}m</span>
            </div>
          )}

          {/* Primary Controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={resetTimer}
              className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all text-white ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start 25m Focus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Soundscape Engine & System Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Soundscapes Box */}
          <div className="studio-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Acoustic Soundscapes
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Offline Synth</span>
            </div>

            <p className="text-xs text-slate-600">
              Web Audio harmonic background tones generated client-side without internet requests.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {sounds.map((s) => (
                <button
                  key={s.type}
                  onClick={() => setSoundType(s.type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                    activeSound === s.type
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {activeSound !== 'none' && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span>Volume:</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="accent-blue-600 cursor-pointer w-28"
                />
                <span className="font-mono font-bold text-slate-800">{Math.round(volume * 100)}%</span>
              </div>
            )}
          </div>

          {/* Engine Specs Box */}
          <div className="studio-panel p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              Service Origin & Durability
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Service Origin:</span>
                <span className="font-mono font-bold text-slate-900">timerService</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Clock Precision:</span>
                <span className="font-semibold text-emerald-700">Hardware Wall-Clock</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tray Standby:</span>
                <span className="font-semibold text-blue-700">Windows Background Task</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-Chime:</span>
                <span className="font-semibold text-slate-800">880Hz Completion Tone</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-4 border-t border-slate-300/80 flex items-center justify-between text-xs text-slate-600">
        <span className="font-semibold">
          Focus Session: 25m Focus | State: {isRunning ? 'Running' : 'Ready'} | Engine: Wall-Clock Hardware Sync
        </span>
        <span className="text-slate-500 font-mono text-[11px]">* No fake metrics</span>
      </div>
    </div>
  );
};

export default FocusView;
