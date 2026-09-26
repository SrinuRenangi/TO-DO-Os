import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Power,
  Database,
  Download,
  Upload,
  Sun,
  Moon,
  Volume2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { settingsService } from '@/services/settings/settings-service';
import { databaseService } from '@/services/database/database-service';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const { tasks, refreshTasks } = useTaskStore();
  const { notes, refreshNotes } = useNotesStore();
  const { reminders, refreshReminders } = useReminderStore();

  const [settings, setSettings] = useState(settingsService.getSettings());
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleToggleAutoStart = () => {
    const nextVal = !settings.autoStart;
    settingsService.updateSetting('autoStart', nextVal);
    setSettings((prev) => ({ ...prev, autoStart: nextVal }));
  };

  const handleToggleCloseToTray = () => {
    const nextVal = !settings.closeToTray;
    settingsService.updateSetting('closeToTray', nextVal);
    setSettings((prev) => ({ ...prev, closeToTray: nextVal }));
  };

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    settingsService.updateSetting('soundEnabled', nextVal);
    setSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
  };

  const handleExportBackup = () => {
    const json = settingsService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-os-backup-${new Date().toISOString().split('T')[0]}.json`;
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
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">System Settings & Control</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Manage 24/7 background runtime, system tray behavior, SQLite offline durability, and backups.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* 1. Background Runtime & Tray Settings */}
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(255,255,255,0.06)]">
            <Power className="w-4 h-4 text-[#4F8CFF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              24/7 Background Companion
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC]">Auto-Start on Boot</span>
              <p className="text-[11px] text-[#64748B]">Launch automatically in background on Windows startup</p>
            </div>
            <button
              onClick={handleToggleAutoStart}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                settings.autoStart
                  ? 'bg-[#4F8CFF]/15 text-[#4F8CFF] border-[#4F8CFF]/30'
                  : 'bg-[#1A2333] text-[#64748B]'
              }`}
            >
              {settings.autoStart ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC]">Close-to-Tray Mode</span>
              <p className="text-[11px] text-[#64748B]">Closing window continues background service execution</p>
            </div>
            <button
              onClick={handleToggleCloseToTray}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                settings.closeToTray
                  ? 'bg-[#4F8CFF]/15 text-[#4F8CFF] border-[#4F8CFF]/30'
                  : 'bg-[#1A2333] text-[#64748B]'
              }`}
            >
              {settings.closeToTray ? 'Active' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC]">Reminder Sound Chimes</span>
              <p className="text-[11px] text-[#64748B]">Play harmonic Web Audio chimes when reminders trigger</p>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                settings.soundEnabled
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                  : 'bg-[#1A2333] text-[#64748B]'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <div>
              <span className="text-xs font-semibold text-[#F8FAFC]">Theme Engine</span>
              <p className="text-[11px] text-[#64748B]">Deepin/Plasma Dark (#0B1220) or Crisp Light Mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1A2333] border border-[rgba(255,255,255,0.08)] text-[#F8FAFC]"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#4F8CFF]" />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>

        {/* 2. SQLite Database & Backup Engine */}
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[rgba(255,255,255,0.06)]">
            <Database className="w-4 h-4 text-[#22C55E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Offline SQLite Engine & Backups
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A2333] text-xs space-y-2">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>Database Engine</span>
              <span className="text-[#4F8CFF] font-semibold">SQLite (WAL Durability)</span>
            </div>
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>Network Dependency</span>
              <span className="text-[#22C55E] font-semibold">100% Offline (Zero AI)</span>
            </div>
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>Stored Tasks / Notes</span>
              <span className="text-[#F8FAFC] font-semibold">{tasks.length} tasks • {notes.length} notes</span>
            </div>
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>Active Reminders</span>
              <span className="text-[#F59E0B] font-semibold">{reminders.length} scheduled</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white bg-[#4F8CFF] hover:bg-[#3b82f6] transition-all shadow-md shadow-[#4F8CFF]/20"
            >
              <Download className="w-4 h-4" />
              <span>Export Database Snapshot (.json)</span>
            </button>

            <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1A2333] hover:bg-[#21293C] border border-[rgba(255,255,255,0.06)] cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Restore Database Snapshot (.json)</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            {backupStatus && (
              <p className="text-[11px] text-center text-[#22C55E] font-semibold mt-1">{backupStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
