const { app, BrowserWindow, shell, Tray, Menu, nativeImage, ipcMain, powerMonitor } = require('electron');
const path = require('path');
const { databaseManager } = require('./src/app/database/database-manager.cjs');
const { registerDatabaseIpcHandlers } = require('./src/app/database/ipc-handlers.cjs');
const { mainNotificationService } = require('./src/app/notifications/notification-manager.cjs');
const { registerNotificationIpcHandlers } = require('./src/app/notifications/ipc-notification-handlers.cjs');

// Ensure Windows recognizes this as a distinct standalone taskbar application
app.setAppUserModelId('Personal.Command.Center');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('[Personal Command Center] Another instance is already running. Focusing existing window...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  let mainWindow = null;
  let tray = null;
  let isQuitting = false;

  function createTray() {
    try {
      // Create a modern dark-mode compatible tray icon
      const svgBuffer = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <path d="M16 2C7.16 2 2 7.16 2 13s5.16 11 11 11 11-5.16 11-11S24.84 2 16 2zm0 2c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7 3.13-7 7-7zm0-2c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM13 21h-2v-2h2v2zm0-4h-2V13h2v8zm0-4h-2V9h2v5zm4 8h-2v-2h2v2zm0-4h-2V13h2v8zm0-4h-2V9h2v5zm4-8h-2v-2h2v2zm0-4h-2V5h2v2zm0-4h-2V1h2v4zm4 8h-2v-2h2v2zm0-4h-2V13h2v8zm0-4h-2V9h2v5z" fill="#007AFF"/>
        </svg>`
      );
      const icon = nativeImage.createFromBuffer(svgBuffer).resize({ width: 16, height: 16 });
      tray = new Tray(icon);
      tray.setToolTip('Personal Command Center — 24/7 Active');

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show Personal Command Center',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            }
          },
        },
        {
          label: 'New Task',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.webContents.send('quick-add-task');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Status: 24/7 Companion Active',
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Exit Application',
          click: () => {
            isQuitting = true;
            app.quit();
          },
        },
      ]);

      tray.setContextMenu(contextMenu);
      tray.on('double-click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    } catch (err) {
      console.warn('Tray icon initialization note:', err.message);
    }
  }

  function createWindow() {
    // Generate high-resolution icon for Windows Taskbar
    let appIcon = null;
    try {
      const iconSvg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <path d="M16 2C7.16 2 2 7.16 2 13s5.16 11 11 11 11-5.16 11-11S24.84 2 16 2zm0 2c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7 3.13-7 7-7zm0-2c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0-2c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7 7-7zm0 2c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zM36 30L29 21l5-5L43 25l-5 5zm0-17L33 14l5-5L47 17l-5 5zm0 12L33 22l5-5L47 25l-5 5z" fill="#FFFFFF"/>
        </svg>`
      );
      appIcon = nativeImage.createFromBuffer(iconSvg).resize({ width: 64, height: 64 });
    } catch (e) {}

    // Determine if we should start hidden in tray (for auto-start scenarios)
    const startHidden = process.argv.includes('--hidden') || process.argv.includes('--background-daemon');

    mainWindow = new BrowserWindow({
      width: 1460,
      height: 920,
      minWidth: 1080,
      minHeight: 740,
      title: 'Personal Command Center',
      icon: appIcon,
      backgroundColor: '#0F1117',  // Dark mode base - matches design system
      frame: true, // Native Windows OS titlebar & window controls
      show: false, // Never show window on creation - always start in tray
      skipTaskbar: true, // Removed from taskbar - lives only in system tray
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        backgroundThrottling: false, // Ensures scheduler and timers continue running when minimized/hidden in tray
      },
    });

    mainWindow.setMenuBarVisibility(false);

    // Load local offline built bundle (offline-first)
    // Dev server connection is handled separately; ensure we always have a fallback
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')).catch((err) => {
      console.error('Failed to load application:', err);
    });

    // When startHidden is true (auto-start from Windows login), immediately minimize to tray
    if (startHidden) {
      mainWindow.hide();
      console.log('[Personal Command Center] Started silently in background tray mode on Windows login.');
    }

    // Attach to Notification Manager for Action Center click foregrounding
    mainNotificationService.setMainWindow(mainWindow);

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    // Close to Tray behavior (24/7 background companion)
    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow.hide();
        if (tray) {
          tray.displayBalloon?.({
            title: 'Personal Command Center',
            content: 'Personal Command Center is active in your system tray to monitor alerts and timers.',
          });
        }
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
      mainNotificationService.setMainWindow(null);
    });
  }

  app.whenReady().then(() => {
    // 1. Initialize SQLite Database Engine & Repository
    try {
      databaseManager.initialize(app.getPath('userData'));
      registerDatabaseIpcHandlers();
      registerNotificationIpcHandlers();
    } catch (err) {
      console.error('[Personal Command Center] SQLite/Notification initialization error:', err);
    }

    // 2. Register Windows Auto-Start on Startup (Background Tray Mode)
    try {
      // Primary method: Electron's setLoginItemSettings (works on Windows 10+)
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        path: process.execPath,
        args: ['--hidden', '--background-daemon'],
      });
      console.log('[Personal Command Center] Registered Windows launch-on-startup in background tray.');
    } catch (err) {
      // Fallback: Create a shortcut in the Windows Startup folder
      try {
        const { app } = require('electron');
        const fs = require('fs');
        const path = require('path');
        const startupPath = path.join(
          app.getPath('userData'),
          '..',
          'Roaming',
          'Microsoft',
          'Windows',
          'Start Menu',
          'Programs',
          'Startup'
        );
        const shortcutName = 'Personal Command Center.lnk';
        const shortcutPath = path.join(startupPath, shortcutName);
        const targetPath = process.execPath;
        const args = ['--hidden', '--background-daemon'];
        const shell = require('electron').shell;

        // Check if shortcut already exists
        if (!fs.existsSync(shortcutPath)) {
          // Create a basic .lnk file (Windows shortcut format)
          // .lnk files are binary, so we'll use a simple approach:
          // Create a VBScript to create the shortcut
          const vbsScript = `
            Set WshShell = WScript.CreateObject("WScript.Shell")
            WshShell.CreateShortcut("${shortcutPath}").TargetPath = "${targetPath}"
            WshShell.CreateShortcut("${shortcutPath}").Arguments = "${args.join(' ')}"
          `;
          const vbsPath = path.join(app.getPath('temp'), 'create_shortcut.vbs');
          fs.writeFileSync(vbsPath, vbsScript);
          require('child_process').execSync(`cscript //Nologo "${vbsPath}"`);
          fs.unlinkSync(vbsPath);
        }
        console.log('[Personal Command Center] Created Windows Startup folder fallback shortcut.');
      } catch (fallbackErr) {
        console.warn('[Personal Command Center] AutoStart registration note:', err.message, `| Fallback error: ${fallbackErr.message}`);
      }
    }

    // Auto-Start IPC Handlers
    ipcMain.handle('app:autostart:get', async () => {
      try {
        return app.getLoginItemSettings().openAtLogin;
      } catch (e) {
        return true;
      }
    });

    ipcMain.handle('app:autostart:set', async (_event, enable) => {
      try {
        app.setLoginItemSettings({
          openAtLogin: Boolean(enable),
          openAsHidden: true,
          path: process.execPath,
          args: ['--hidden', '--background-daemon'],
        });
        return true;
      } catch (e) {
        return false;
      }
    });

    createWindow();
    createTray();

    // Power Monitor: System Sleep/Wake and Screen Unlock detection
    try {
      powerMonitor.on('resume', () => {
        console.log('[Personal Command Center] PowerMonitor: System resumed from sleep. Triggering scheduler catch-up.');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('system-resumed');
        }
      });
      powerMonitor.on('unlock-screen', () => {
        console.log('[Personal Command Center] PowerMonitor: Screen unlocked. Triggering scheduler catch-up.');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('system-resumed');
        }
      });
    } catch (err) {
      console.warn('[Personal Command Center] PowerMonitor registration note:', err.message);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        // On macOS re-create window, on Windows we just ensure tray is set up
        if (process.platform !== 'darwin') {
          // Window already created or we just ensure tray
        }
      } else if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  app.on('window-all-closed', () => {
    // Companion continues running in system tray
    console.log('[Personal Command Center] Daemon remains active in system tray.');
  });
}