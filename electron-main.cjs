const { app, BrowserWindow, shell, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');

// Ensure Windows recognizes this as a distinct standalone taskbar application
app.setAppUserModelId('Personal.Organizer.DesktopApp');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('[Personal Organizer] Another instance is already running. Focusing existing window...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  function createTray() {
    try {
      const svgBuffer = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <rect width="28" height="28" x="2" y="2" rx="7" fill="#2563EB"/>
          <path d="M9 16l5 5 10-10" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      );
      const icon = nativeImage.createFromBuffer(svgBuffer).resize({ width: 16, height: 16 });
      tray = new Tray(icon);
      tray.setToolTip('Personal Organizer — Standalone Desktop System');

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open Personal Organizer',
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
        {
          label: 'Storage: SQLite WAL Durability',
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
    // Generate high-resolution desktop application icon for Windows Taskbar
    let appIcon = null;
    try {
      const iconSvg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3B82F6"/>
              <stop offset="50%" stop-color="#10B981"/>
              <stop offset="100%" stop-color="#F59E0B"/>
            </linearGradient>
          </defs>
          <rect width="60" height="60" x="2" y="2" rx="14" fill="url(#grad)"/>
          <rect width="48" height="48" x="8" y="8" rx="10" fill="#FFFFFF"/>
          <path d="M18 32l10 10 20-20" stroke="#2563EB" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      );
      appIcon = nativeImage.createFromBuffer(iconSvg).resize({ width: 64, height: 64 });
    } catch (e) {}

    mainWindow = new BrowserWindow({
      width: 1460,
      height: 920,
      minWidth: 1080,
      minHeight: 740,
      title: 'Personal Organizer',
      icon: appIcon,
      backgroundColor: '#CFD5DE',
      frame: true, // Native Windows OS titlebar & window controls
      show: true, // Show window immediately on desktop
      skipTaskbar: false, // Ensures it appears on the Windows Taskbar!
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    mainWindow.setMenuBarVisibility(false);

    // Load dev server if running, else load local offline built bundle
    const devServerUrl = 'http://localhost:5173';
    mainWindow.loadURL(devServerUrl).catch(() => {
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')).catch((err) => {
        console.error('Failed to load application:', err);
      });
    });

    mainWindow.show();
    mainWindow.focus();

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
            title: 'Personal Organizer',
            content: 'Personal Organizer is active in your system tray to monitor alerts and timers.',
          });
        }
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
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
    console.log('[Personal Organizer] Daemon remains active in system tray.');
  });
}
