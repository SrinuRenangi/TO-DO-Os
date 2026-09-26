import { app } from 'electron';

export class AutoStartService {
  private enabled: boolean = true;

  constructor() {
    this.syncFromSystem();
  }

  public isEnabled(): boolean {
    if (app && typeof app.getLoginItemSettings === 'function') {
      try {
        const settings = app.getLoginItemSettings();
        this.enabled = settings.openAtLogin;
      } catch (err) {
        console.warn('[AutoStart] Failed to query login item settings:', err);
      }
    }
    return this.enabled;
  }

  public setEnabled(enable: boolean): boolean {
    this.enabled = enable;
    if (app && typeof app.setLoginItemSettings === 'function') {
      try {
        app.setLoginItemSettings({
          openAtLogin: enable,
          openAsHidden: true, // Start minimized in system tray
          name: 'Personal OS',
          path: process.execPath,
          args: ['--hidden', '--background-daemon'],
        });
        console.log(`[AutoStart] Windows auto-startup set to: ${enable}`);
        return true;
      } catch (err) {
        console.error('[AutoStart] Failed to configure auto-startup:', err);
        return false;
      }
    }
    return true;
  }

  public toggle(): boolean {
    return this.setEnabled(!this.isEnabled());
  }

  private syncFromSystem(): void {
    if (app && typeof app.getLoginItemSettings === 'function') {
      try {
        const settings = app.getLoginItemSettings();
        this.enabled = settings.openAtLogin;
      } catch {
        this.enabled = true;
      }
    }
  }
}

export const autoStartService = new AutoStartService();
