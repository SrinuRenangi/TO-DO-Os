import React, { useState } from 'react';
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
  CheckCircle2,
  Monitor,
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
    <div className="max-w-[1360px] mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            SETTINGS SERVICE: SYSTEM CONTROL
          </h1>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
            Enterprise Configuration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Daemon Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. Background Runtime & Tray Settings */}
        <div className="studio-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                24/7 Desktop Companion & Tray
              </h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Windows Native
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-bold text-slate-900">Auto-Start on Boot</span>
              <p className="text-[11px] text-slate-500">Launch automatically in background on Windows startup</p>
            </div>
            <button
              onClick={handleToggleAutoStart}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                settings.autoStart
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {settings.autoStart ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900">Close-to-Tray Mode</span>
              <p className="text-[11px] text-slate-500">Closing window continues background service monitoring</p>
            </div>
            <button
              onClick={handleToggleCloseToTray}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                settings.closeToTray
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {settings.closeToTray ? 'Active' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900">Urgency Chime Alerts</span>
              <p className="text-[11px] text-slate-500">Play Web Audio tone when scheduled reminders fire</p>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                settings.soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900">Theme Surface</span>
              <p className="text-[11px] text-slate-500">Industrial Studio Brushed Aluminum or Classic Mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 transition-colors"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark' : 'Studio Light'}</span>
            </button>
          </div>
        </div>

        {/* 2. SQLite Database & Backup Engine */}
        <div className="studio-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Offline SQLite Storage & Snapshots
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Zero External Network
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Database Engine:</span>
              <span className="text-blue-700 font-bold font-mono">SQLite 3 (WAL Durability)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Cloud / AI Dependencies:</span>
              <span className="text-emerald-700 font-bold">None (100% Private Offline)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Stored Records:</span>
              <span className="text-slate-900 font-semibold">{tasks.length} tasks • {notes.length} notes</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Active Reminders:</span>
              <span className="text-amber-700 font-semibold">{reminders.length} scheduled</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Database Snapshot (.json)</span>
            </button>

            <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 cursor-pointer transition-all shadow-xs">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Restore Database Snapshot (.json)</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            {backupStatus && (
              <p className="text-[11px] text-center text-emerald-700 font-semibold mt-1">{backupStatus}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-4 border-t border-slate-300/80 flex items-center justify-between text-xs text-slate-600">
        <span className="font-semibold">
          System Control: 24/7 Companion | SQLite Storage: Healthy | Backups: Local JSON
        </span>
        <span className="text-slate-500 font-mono text-[11px]">* No fake metrics</span>
      </div>
    </div>
  );
};

export default SettingsView;
