// ============================================================================
// Personal OS — Settings Service
// System Configuration, Auto-Start, Audio, Tray & Snapshot Management
// ============================================================================

import { databaseService } from '../database/database-service';
import { DatabaseSnapshot } from '../database/types';
import { ReminderSoundId, HeadphoneMode } from '@shared/types';
import { soundSynth } from '@/lib/sound-synth';

export interface SystemSettings {
  autoStart: boolean;
  closeToTray: boolean;
  soundEnabled: boolean;
  reminderSound: ReminderSoundId;
  audioVolume: number; // 0 - 100
  headphoneMode: HeadphoneMode;
  theme: 'dark' | 'light';
  dbPath?: string;
  appVersion: string;
}

export class SettingsService {
  public getSettings(): SystemSettings {
    const raw = databaseService.getSettings();
    const audioVolume = raw.audioVolume !== undefined ? parseInt(raw.audioVolume, 10) : 70;
    const reminderSound = (raw.reminderSound as ReminderSoundId) || 'bell';
    const headphoneMode = (raw.headphoneMode as HeadphoneMode) || 'normal';

    return {
      autoStart: raw.autoStart !== 'false',
      closeToTray: raw.closeToTray !== 'false',
      soundEnabled: raw.soundEnabled !== 'false',
      reminderSound,
      audioVolume: isNaN(audioVolume) ? 70 : audioVolume,
      headphoneMode,
      theme: (raw.theme as 'dark' | 'light') || 'dark',
      dbPath: 'personal_os_db.sqlite',
      appVersion: '1.0.0 (Pure Deterministic)',
    };
  }

  public updateSetting(key: keyof SystemSettings, value: any): void {
    databaseService.setSetting(String(key), String(value));

    if (key === 'audioVolume') {
      soundSynth.setMasterVolume(Number(value) / 100);
    } else if (key === 'headphoneMode') {
      soundSynth.setHeadphoneMode(value as HeadphoneMode);
    }
    
    // Notify native Electron runtime if available via IPC
    if (typeof window !== 'undefined') {
      if (key === 'autoStart') {
        const autoStartEnabled = Boolean(value);
        if (window.desktopNotifications?.setAutoStart) {
          window.desktopNotifications.setAutoStart(autoStartEnabled).catch?.((err: any) => {
            console.warn('[SettingsService] Failed to set auto-start:', err);
          });
        } else if ((window as any).electronAPI?.setAutoStart) {
          (window as any).electronAPI.setAutoStart(autoStartEnabled);
        }
      }
    }
  }

  public exportBackup(): string {
    const snapshot = databaseService.exportSnapshot();
    return JSON.stringify(snapshot, null, 2);
  }

  public importBackup(jsonString: string): boolean {
    try {
      const parsed: DatabaseSnapshot = JSON.parse(jsonString);
      return databaseService.restoreSnapshot(parsed);
    } catch (e) {
      console.error('[SettingsService] Failed to import backup:', e);
      return false;
    }
  }
}

export const settingsService = new SettingsService();
