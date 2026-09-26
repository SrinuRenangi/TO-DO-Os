import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Waves, CloudRain, Wind, Radio, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useFocusStore } from '@/stores/useFocusStore';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { formatSecondsToTime } from '@/lib/utils';
import { FocusMode, SoundType } from '@shared/types';

export const TemporalEngine: React.FC = () => {
  const {
    mode,
    setMode,
    remainingSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    activeSound,
    setSoundType,
    volume,
    setVolume,
    totalFocusMinutesToday,
    sessionsCompletedToday,
  } = useFocusStore();

  const { events } = useCalendarStore();
  const [currentMinute, setCurrentMinute] = useState(new Date().getHours() * 60 + new Date().getMinutes());

  // High precision ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Red line indicator update
  useEffect(() => {
    const timeTracker = setInterval(() => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timeTracker);
  }, []);

  const sounds: { type: SoundType; label: string; icon: React.ReactNode }[] = [
    { type: 'none', label: 'Mute', icon: <Volume2 className="w-3.5 h-3.5" /> },
    { type: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
    { type: 'whitenoise', label: 'White', icon: <Wind className="w-3.5 h-3.5" /> },
    { type: 'gamma40hz', label: '40Hz Gamma', icon: <Radio className="w-3.5 h-3.5" /> },
    { type: 'stream', label: 'Stream', icon: <Waves className="w-3.5 h-3.5" /> },
  ];

  const modes: { id: FocusMode; label: string; duration: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro', duration: '25m' },
    { id: 'deep_work', label: 'Deep Work', duration: '50m' },
    { id: 'ultradian', label: 'Ultradian', duration: '90m' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Deep Work & Focus Timer Engine */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#151922] p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#8B5CF6]/15 text-[#8B5CF6]">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Focus Flow Engine
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
            <span>{sessionsCompletedToday} sessions</span>
            <span>•</span>
            <span className="text-[#8B5CF6] font-semibold">{totalFocusMinutesToday}m logged</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 rounded-xl bg-[#1D2330] border border-[rgba(255,255,255,0.06)] gap-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === m.id
                  ? 'bg-[#8B5CF6] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {m.label} ({m.duration})
            </button>
          ))}
        </div>

        {/* Big Digital Readout */}
        <div className="py-6 flex flex-col items-center justify-center">
          <motion.div
            key={remainingSeconds}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-mono font-bold tracking-tight text-[#F8FAFC] tabular-nums"
          >
            {formatSecondsToTime(remainingSeconds)}
          </motion.div>
          <span className="text-xs text-[#64748B] mt-1 font-medium">
            {isRunning ? 'Flow state active' : 'Ready to start focus block'}
          </span>
        </div>

        {/* Play/Pause/Reset Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-[#1D2330] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#242B3B] border border-[rgba(255,255,255,0.08)] transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-xl transition-all hover:scale-105 ${
              isRunning
                ? 'bg-[#EF4444] hover:bg-[#DC2626] shadow-[#EF4444]/25'
                : 'bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[#8B5CF6]/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Flow</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Engage Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient Soundscape Synthesizer */}
        <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">
              Ambient Soundscape (Web Audio API)
            </span>
            {activeSound !== 'none' && (
              <span className="text-[10px] font-semibold text-[#8B5CF6]">Active</span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {sounds.map((s) => (
              <button
                key={s.type}
                onClick={() => setSoundType(s.type)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl border text-[10px] font-medium transition-all ${
                  activeSound === s.type
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[#1D2330] text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                {s.icon}
                <span className="mt-1">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Apple-Grade Day Timeline */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#151922] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#007AFF]/15 text-[#007AFF]">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Today's Unified Timeline
            </h3>
          </div>
          <span className="text-[11px] text-[#64748B]">Events & Blocks</span>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#1D2330] hover:border-[rgba(255,255,255,0.12)] transition-all"
            >
              <div
                className="w-1.5 self-stretch rounded-full"
                style={{ backgroundColor: evt.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#F8FAFC]">{evt.title}</h4>
                  <span className="text-[10px] font-mono text-[#94A3B8] tabular-nums">
                    {evt.startTime} - {evt.endTime}
                  </span>
                </div>
                {evt.description && (
                  <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">{evt.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${evt.color}20`,
                      color: evt.color,
                    }}
                  >
                    {evt.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
