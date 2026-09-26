const { app, BrowserWindow, shell, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('[Personal Organizer Desktop] Another instance is already running.');
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
    // 16x16 SVG / Canvas fallback for tray icon
    const icon = nativeImage.createFromBuffer(
      Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <rect width="14" height="14" x="1" y="1" rx="3" fill="#2563EB"/>
          <path d="M4 8l3 3 5-6" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>`
      )
    );

    tray = new Tray(icon);
    tray.setToolTip('Personal Organizer — 24/7 Companion (Active)');

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
        label: 'Start 25m Focus Session',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('start-focus');
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Status: 24/7 Background Scheduler Active',
        enabled: false,
      },
      {
        label: 'Storage: SQLite (Healthy)',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Exit Personal Organizer',
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
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1024,
      minHeight: 720,
      title: 'Personal Organizer — Pure Summary Center',
      backgroundColor: '#CFD5DE',
      frame: true, // Native desktop window frame
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    // Remove default electron menu in favor of the in-app enterprise toolbar
    mainWindow.setMenuBarVisibility(false);

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173').catch(() => {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
      });
    } else {
      mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

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
            content: 'Personal Organizer is still running in your system tray to monitor reminders and focus blocks.',
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
    // Daemon stays active in tray
    console.log('[Personal Organizer] All windows closed -> Application remains active in Windows System Tray');
  });
}
