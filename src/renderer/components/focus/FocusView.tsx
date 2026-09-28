import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CloudRain,
  Wind,
  Radio,
  Waves,
  Square,
  Check,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useFocusStore } from '@/stores/useFocusStore';
import { formatSecondsToTime } from '@/lib/utils';
import { SoundType, ReminderSoundId } from '@shared/types';
import { TimerMode } from '@/services/database/types';
import { AnalogClock } from '@/components/dashboard/AnalogClock';
import { SOUND_LIBRARY, soundSynth } from '@/lib/sound-synth';

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
  } = useFocusStore();

  const [customMinutes, setCustomMinutes] = useState(25);

  // Active Sound Preview & Timer Alert Sound States
  const [activePreviewId, setActivePreviewId] = useState<ReminderSoundId | null>(() =>
    soundSynth.getActivePreviewId()
  );

  const [selectedAlertSound, setSelectedAlertSound] = useState<ReminderSoundId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('personal_os_timer_alert_sound');
      if (saved) return saved as ReminderSoundId;
    }
    return 'bell';
  });

  const [audioVolumePercent, setAudioVolumePercent] = useState<number>(() =>
    Math.round(soundSynth.getMasterVolume() * 100)
  );

  // Subscribe to preview status changes (auto-stop or external trigger)
  useEffect(() => {
    const unsubscribe = soundSynth.onPreviewStateChange((id) => {
      setActivePreviewId(id);
    });
    return () => unsubscribe();
  }, []);

  // Timer Completion Chime Trigger
  useEffect(() => {
    if (!isRunning && remainingSeconds === 0 && mode !== 'stopwatch') {
      soundSynth.playAlertSound(selectedAlertSound);
    }
  }, [isRunning, remainingSeconds, mode, selectedAlertSound]);

  const modes: { id: TimerMode; label: string; desc: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro', desc: '25m Focus' },
    { id: 'countdown', label: 'Countdown', desc: `${customMinutes}m Preset` },
    { id: 'stopwatch', label: 'Stopwatch', desc: 'Elapsed Count' },
  ];

  const ambientSounds: { type: SoundType; label: string; icon: React.ReactNode }[] = [
    { type: 'none', label: 'Mute', icon: <VolumeX className="w-3.5 h-3.5" /> },
    { type: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
    { type: 'whitenoise', label: 'Pink Noise', icon: <Wind className="w-3.5 h-3.5" /> },
    { type: 'gamma40hz', label: '40Hz Gamma', icon: <Radio className="w-3.5 h-3.5" /> },
    { type: 'stream', label: 'Stream', icon: <Waves className="w-3.5 h-3.5" /> },
  ];

  // Sound Preview Button handler: Play on click, stop on second click, starting another stops current
  const handleTogglePreview = (soundId: ReminderSoundId) => {
    const isPlaying = soundSynth.togglePreviewSound(soundId);
    setActivePreviewId(isPlaying ? soundId : null);
  };

  // Dedicated Alert Sound selection (separated from preview)
  const handleSelectAlertSound = (soundId: ReminderSoundId) => {
    setSelectedAlertSound(soundId);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('personal_os_timer_alert_sound', soundId);
      } catch {}
    }
  };

  const handleVolumeChange = (newVolPercent: number) => {
    setAudioVolumePercent(newVolPercent);
    soundSynth.setMasterVolume(newVolPercent / 100);
  };

  return (
    <div className="max-w-[1460px] mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 uppercase">
            TIMER SERVICE: FOCUS ENGINE
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
            Hardware Wall-Clock Synchronized
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Tray Service Active
          </span>
        </div>
      </div>

      {/* Grid: Primary Dial (7 cols) + Timer Sound Library & Settings (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Main Focus Dial Panel */}
        <div className="lg:col-span-7 studio-panel p-8 flex flex-col items-center justify-between min-h-[500px]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 w-full max-w-md justify-center">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id, m.id === 'countdown' ? customMinutes * 60 : undefined)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all text-center ${
                  mode === m.id
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {m.label} <span className="text-[10px] text-slate-500 font-bold">({m.desc})</span>
              </button>
            ))}
          </div>

          {/* Center: Analog & Digital Clocks side by side */}
          <div className="my-8 flex flex-col md:flex-row items-center justify-center gap-10 w-full">
            {/* Photorealistic SVG Clock */}
            <div className="w-48 h-48 drop-shadow-md shrink-0">
              <AnalogClock />
            </div>

            {/* Big Digits + Status */}
            <div className="text-center md:text-left">
              <div className="text-6xl md:text-7xl font-mono font-black tracking-tight text-slate-950 tabular-nums">
                {formatSecondsToTime(remainingSeconds)}
              </div>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                  Active Session
                </span>
                <span className="text-xs text-slate-600 font-bold">
                  {isRunning ? 'Counting down in real-time' : 'Ready to start focus block'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1 font-semibold">
                Mode: {mode.toUpperCase()} • Wall-Clock Hardware Accuracy
              </div>
            </div>
          </div>

          {/* Custom Duration Slider (if Countdown) */}
          {mode === 'countdown' && (
            <div className="mb-4 flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="font-bold">Duration:</span>
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
                className="accent-blue-600 cursor-pointer w-40"
              />
              <span className="font-mono font-black text-blue-600">{customMinutes} minutes</span>
            </div>
          )}

          {/* Primary Controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={resetTimer}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black transition-all shadow-xs flex items-center gap-2"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`flex items-center gap-2 px-9 py-2.5 rounded-xl text-xs font-black shadow-md transition-all text-white ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
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
                  <span>Start Focus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Sound Library, Preview & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Timer Sound Library & Preview Panel */}
          <div className="studio-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                  Timer Sound Library
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                10 Native Instruments
              </span>
            </div>

            {/* Clear Separation Note */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block text-[11px]">Active Alert Sound:</span>
                <span className="font-black text-blue-600 text-xs capitalize">
                  {selectedAlertSound.replace('_', ' ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold max-w-[180px] text-right">
                Click Preview to listen. Click Select to set as timer alarm.
              </span>
            </div>

            {/* Sound Library List with Separate Preview and Alert Selection */}
            <div className="space-y-1.5 max-h-[310px] overflow-y-auto pr-1">
              {SOUND_LIBRARY.map((s) => {
                const isSelected = selectedAlertSound === s.id;
                const isPreviewing = activePreviewId === s.id;

                return (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Left: Sound Name & Category */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleSelectAlertSound(s.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white hover:border-blue-400'
                        }`}
                        title="Set as Timer Alert Sound"
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div
                        className="cursor-pointer min-w-0 flex-1"
                        onClick={() => handleSelectAlertSound(s.id)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {s.name}
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            s.category === 'Calm'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.category === 'Alarm'
                              ? 'bg-amber-100 text-amber-800'
                              : s.category === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {s.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate font-medium">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Sound Preview Button (Play/Stop toggle, stops previous) */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePreview(s.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all shadow-2xs ${
                          isPreviewing
                            ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                        title={isPreviewing ? 'Stop Preview' : 'Play Preview'}
                      >
                        {isPreviewing ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audio Volume Slider */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                Alert Volume:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioVolumePercent}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="accent-blue-600 cursor-pointer w-28"
                />
                <span className="font-mono font-black text-slate-900 w-10 text-right">
                  {audioVolumePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Optional Acoustic Ambient Background (White Noise, Rain, etc.) */}
          <div className="studio-panel p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                  Ambient Focus Noise
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Continuous Synth</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {ambientSounds.map((s) => (
                <button
                  key={s.type}
                  onClick={() => setSoundType(s.type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-left ${
                    activeSound === s.type
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.icon}
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-xs text-slate-700 font-bold">
        <span>
          Focus Mode: {mode.toUpperCase()} | Alert Sound: {selectedAlertSound.toUpperCase()} | Engine: Hardware Synchronized
        </span>
        <span className="text-slate-600 font-mono text-[11px]">* Real SQLite state synchronization</span>
      </div>
    </div>
  );
};

export default FocusView;
