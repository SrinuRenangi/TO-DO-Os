// ============================================================================
// Personal OS — Settings UX Redesign (KDE / Deepin / Modern Android Inspired)
// High-visibility Animated ON/OFF Switches & Comprehensive Reminder Audio Controls
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Power,
  Database,
  Download,
  Upload,
  Sun,
  Moon,
  Volume2,
  Headphones,
  Bell,
  Play,
  Square,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { settingsService } from '@/services/settings/settings-service';
import { SOUND_LIBRARY, soundSynth } from '@/lib/sound-synth';
import { ReminderSoundId, HeadphoneMode } from '@shared/types';

interface ModernSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ModernSwitch: React.FC<ModernSwitchProps> = ({ id, checked, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600 shadow-xs' : 'bg-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Track Label text inside */}
        <span
          className={`absolute text-[9px] font-black uppercase tracking-wider top-1 select-none transition-opacity duration-200 ${
            checked ? 'left-2 text-white opacity-100' : 'left-2 opacity-0'
          }`}
        >
          ON
        </span>
        <span
          className={`absolute text-[9px] font-black uppercase tracking-wider top-1 select-none transition-opacity duration-200 ${
            checked ? 'right-2 opacity-0' : 'right-2 text-slate-600 opacity-100'
          }`}
        >
          OFF
        </span>

        {/* Circular Knob with smooth slide animation */}
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Visual State Text Badge */}
      <span
        className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider select-none min-w-[34px] text-center ${
          checked
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-slate-200 text-slate-600 border border-slate-300'
        }`}
      >
        {checked ? 'ON' : 'OFF'}
      </span>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const { tasks, refreshTasks } = useTaskStore();
  const { notes, refreshNotes } = useNotesStore();
  const { reminders, refreshReminders } = useReminderStore();

  const [settings, setSettings] = useState(settingsService.getSettings());
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  // Sound Preview State
  const [activePreviewId, setActivePreviewId] = useState<ReminderSoundId | null>(() =>
    soundSynth.getActivePreviewId()
  );

  // Listen for preview stopping naturally
  useEffect(() => {
    const unsub = soundSynth.onPreviewStateChange((id) => {
      setActivePreviewId(id);
    });
    return () => unsub();
  }, []);

  const handleToggleAutoStart = (nextVal: boolean) => {
    settingsService.updateSetting('autoStart', nextVal);
    setSettings((prev) => ({ ...prev, autoStart: nextVal }));
  };

  const handleToggleCloseToTray = (nextVal: boolean) => {
    settingsService.updateSetting('closeToTray', nextVal);
    setSettings((prev) => ({ ...prev, closeToTray: nextVal }));
  };

  const handleToggleSound = (nextVal: boolean) => {
    settingsService.updateSetting('soundEnabled', nextVal);
    setSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
  };

  const handleVolumeChange = (volPercent: number) => {
    const clamped = Math.max(0, Math.min(100, volPercent));
    settingsService.updateSetting('audioVolume', clamped);
    setSettings((prev) => ({ ...prev, audioVolume: clamped }));
  };

  const handleHeadphoneModeChange = (mode: HeadphoneMode) => {
    settingsService.updateSetting('headphoneMode', mode);
    setSettings((prev) => ({ ...prev, headphoneMode: mode }));
  };

  const handleReminderSoundChange = (soundId: ReminderSoundId) => {
    settingsService.updateSetting('reminderSound', soundId);
    setSettings((prev) => ({ ...prev, reminderSound: soundId }));
  };

  const handleTogglePreview = (soundId: ReminderSoundId) => {
    const isPlaying = soundSynth.togglePreviewSound(soundId);
    setActivePreviewId(isPlaying ? soundId : null);
  };

  const handleExportBackup = () => {
    const json = settingsService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Backup exported cleanly to JSON snapshot.');
    setTimeout(() => setBackupStatus(null), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = settingsService.importBackup(content);
        if (success) {
          refreshTasks();
          refreshNotes();
          refreshReminders();
          setBackupStatus('Snapshot restored successfully.');
        } else {
          setBackupStatus('Error restoring backup file format.');
        }
        setTimeout(() => setBackupStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-[1460px] mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 uppercase">
            SETTINGS SERVICE: SYSTEM CONTROL
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
            Enterprise Configuration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Companion Daemon Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Section 1: Background Runtime & Desktop Companionship */}
        <div className="studio-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                24/7 Desktop Companion & Tray
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Windows Native
            </span>
          </div>

          {/* Toggle 1: Auto-Start on Boot */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-black text-slate-950">Auto-Start on Boot</span>
              <p className="text-[11px] text-slate-500 font-medium">Launch companion automatically on Windows startup</p>
            </div>
            <ModernSwitch
              id="switch-autostart"
              checked={settings.autoStart}
              onChange={handleToggleAutoStart}
            />
          </div>

          {/* Toggle 2: Close-to-Tray Mode */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-black text-slate-950">Close-to-Tray Mode</span>
              <p className="text-[11px] text-slate-500 font-medium">Closing window hides to system tray for persistent reminders</p>
            </div>
            <ModernSwitch
              id="switch-closetotray"
              checked={settings.closeToTray}
              onChange={handleToggleCloseToTray}
            />
          </div>

          {/* Toggle 3: Master Sound System */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-black text-slate-950">Audio Alarm & Chimes</span>
              <p className="text-[11px] text-slate-500 font-medium">Enable procedural Web Audio synthesis for alarms & reminders</p>
            </div>
            <ModernSwitch
              id="switch-sound"
              checked={settings.soundEnabled}
              onChange={handleToggleSound}
            />
          </div>

          {/* Toggle 4: Theme Surface */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-black text-slate-950">Theme Surface</span>
              <p className="text-[11px] text-slate-500 font-medium">Toggle High-Contrast Studio Dark or Bright Light</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 transition-colors shadow-2xs"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Studio Dark' : 'Bright Light'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Reminder Sound & Audio Master Settings */}
        <div className="studio-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                Reminder Audio & Volume Calibration
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Native Procedural Audio
            </span>
          </div>

          {/* Volume Slider: 0 - 100% (Default 70%) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-950">Master Alert Volume</span>
                <p className="text-[11px] text-slate-500 font-medium">Default: 70% • Controls procedural synthesizer output</p>
              </div>
              <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                {settings.audioVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audioVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="accent-blue-600 cursor-pointer w-full h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>0% (Silent)</span>
              <span>50%</span>
              <span>70% (Default)</span>
              <span>100% (Maximum)</span>
            </div>
          </div>

          {/* Headphone Friendly Mode: Low | Normal | Strong | Very Strong */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-600" />
              <div>
                <span className="text-xs font-black text-slate-950">Headphone Friendly Mode</span>
                <p className="text-[11px] text-slate-500 font-medium">User controlled dynamic gain curve — never assume</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {(['low', 'normal', 'strong', 'very_strong'] as HeadphoneMode[]).map((mode) => {
                const isSelected = settings.headphoneMode === mode;
                const labels: Record<HeadphoneMode, { title: string; desc: string }> = {
                  low: { title: 'Low', desc: 'Soft (35%)' },
                  normal: { title: 'Normal', desc: 'Balanced (70%)' },
                  strong: { title: 'Strong', desc: 'Full (100%)' },
                  very_strong: { title: 'Very Strong', desc: 'Boost (135%)' },
                };

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleHeadphoneModeChange(mode)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-black'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <div className="text-xs">{labels[mode].title}</div>
                    <div className={`text-[9px] ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      {labels[mode].desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Reminder Sound Selection with Preview */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-slate-950">Default Reminder Sound</span>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreview(settings.reminderSound)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  activePreviewId === settings.reminderSound
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {activePreviewId === settings.reminderSound ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Sound</span>
                  </>
                )}
              </button>
            </div>

            <select
              value={settings.reminderSound}
              onChange={(e) => handleReminderSoundChange(e.target.value as ReminderSoundId)}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white border border-slate-300 focus:border-blue-500 focus:outline-none"
            >
              {SOUND_LIBRARY.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category}) — {s.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: SQLite Database & Backup Engine */}
        <div className="studio-panel p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950">
                Offline SQLite Storage & Database Snapshots
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Zero External Network • 100% Private Offline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Engine</span>
              <span className="text-blue-700 font-black font-mono text-sm">SQLite 3 WAL</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Hardware ACID Durability</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Database Records</span>
              <span className="text-slate-950 font-black text-sm">{tasks.length} tasks • {notes.length} notes</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Persisted locally in database</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Active Reminders</span>
              <span className="text-amber-700 font-black text-sm">{reminders.length} scheduled</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Monitored 24/7 by daemon</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Privacy & AI</span>
              <span className="text-emerald-700 font-black text-sm">Zero AI / Telemetry</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Zero network transmissions</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Export Database Snapshot (.json)</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 cursor-pointer transition-all shadow-2xs">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Restore Database Snapshot (.json)</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          {backupStatus && (
            <p className="text-xs text-center text-emerald-800 font-bold bg-emerald-50 py-2 rounded-xl border border-emerald-200">
              {backupStatus}
            </p>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-xs text-slate-700 font-bold">
        <span>
          System Control: 24/7 Companion | Volume: {settings.audioVolume}% | Headphone Mode: {settings.headphoneMode.toUpperCase()}
        </span>
        <span className="text-slate-600 font-mono text-[11px]">* Real SQLite state synchronization</span>
      </div>
    </div>
  );
};

export default SettingsView;
