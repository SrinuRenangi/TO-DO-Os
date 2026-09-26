// ============================================================================
// Personal OS — Settings Service
// System Configuration, Auto-Start, Tray Behavior & Snapshot Management
// ============================================================================

import { databaseService } from '../database/database-service';
import { DatabaseSnapshot } from '../database/types';

export interface SystemSettings {
  autoStart: boolean;
  closeToTray: boolean;
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  dbPath?: string;
  appVersion: string;
}

export class SettingsService {
  public getSettings(): SystemSettings {
    const raw = databaseService.getSettings();
    return {
      autoStart: raw.autoStart !== 'false',
      closeToTray: raw.closeToTray !== 'false',
      soundEnabled: raw.soundEnabled !== 'false',
      theme: (raw.theme as 'dark' | 'light') || 'dark',
      dbPath: 'personal_os_db.sqlite',
      appVersion: '1.0.0 (Pure Deterministic)',
    };
  }

  public updateSetting(key: keyof SystemSettings, value: any): void {
    databaseService.setSetting(String(key), String(value));
    
    // Notify native Electron runtime if available via IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      if (key === 'autoStart') {
        (window as any).electronAPI.setAutoStart?.(Boolean(value));
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
