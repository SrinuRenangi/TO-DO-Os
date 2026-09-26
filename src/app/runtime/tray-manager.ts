import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron';
import { autoStartService } from './auto-start';
import { watchdogService } from './watchdog';

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;

  public initialize(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;

    // Intercept window close to minimize to tray instead of quitting
    this.mainWindow.on('close', (event) => {
      if (!(app as any).isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
        console.log('[TrayManager] Main window closed -> minimized to background tray (24/7 runtime active)');
      }
    });

    this.createTray();
  }

  public updateTooltip(statusText: string): void {
    if (this.tray) {
      this.tray.setToolTip(`Personal OS — ${statusText}`);
    }
  }

  public restoreWindow(): void {
    if (!this.mainWindow) return;

    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  private createTray(): void {
    // Generate an in-memory high-res icon if image file not loaded
    const icon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAD9JREFUOE9jZKAQMFKon2HUAAYGhn8M1DWEgYGB4T81DCHDYDRgGBkMowEGpUYR4kYjAwPDfzgfGg2jAQYlRgEAM8YREfO7kQ8AAAAASUVORK5CYII=',
        'base64'
      )
    );

    try {
      this.tray = new Tray(icon);
      this.tray.setToolTip('Personal OS — 24/7 Intelligent Desktop Companion');

      // Click to toggle window
      this.tray.on('click', () => {
        if (this.mainWindow?.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.restoreWindow();
        }
      });

      this.tray.on('double-click', () => {
        this.restoreWindow();
      });

      this.updateContextMenu();
    } catch (err) {
      console.warn('[TrayManager] Failed to mount native system tray icon:', err);
    }
  }

  public updateContextMenu(): void {
    if (!this.tray) return;

    const { memoryMB, uptimeSeconds } = watchdogService.getResourceUsage();
    const autoStart = autoStartService.isEnabled();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Personal OS — Dashboard',
        icon: undefined,
        click: () => this.restoreWindow(),
      },
      { type: 'separator' },
      {
        label: '⚡ Start 25m Focus Block',
        click: () => {
          this.restoreWindow();
          this.mainWindow?.webContents.send('personal-os:quick-focus');
        },
      },
      {
        label: '➕ Quick Capture Task (Ctrl+N)',
        click: () => {
          this.restoreWindow();
          this.mainWindow?.webContents.send('personal-os:quick-capture');
        },
      },
      { type: 'separator' },
      {
        label: 'Auto-Start on Boot',
        type: 'checkbox',
        checked: autoStart,
        click: (item) => {
          autoStartService.setEnabled(item.checked);
        },
      },
      {
        label: `Runtime: Healthy (${memoryMB}MB RAM • ${Math.round(uptimeSeconds / 60)}m uptime)`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Exit Personal OS',
        click: () => {
          (app as any).isQuitting = true;
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }
}

export const trayManager = new TrayManager();
