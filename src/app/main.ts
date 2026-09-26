import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { runtimeDaemon } from './runtime';

let mainWindow: BrowserWindow | null = null;

// Enforce single instance lock for 24/7 daemon
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('[Main] Another instance is already running. Focusing existing instance.');
  app.quit();
} else {
  app.on('second-instance', () => {
    // If user attempts to run a second instance, restore and focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1024,
      minHeight: 720,
      backgroundColor: '#0F1117',
      frame: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#10131A',
        symbolColor: '#94A3B8',
        height: 40,
      },
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    // Bootstrap 24/7 runtime daemon (Tray, Scheduler, Watchdog, Power Monitor)
    runtimeDaemon.bootstrap(mainWindow);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  });

  app.on('window-all-closed', () => {
    // DO NOT QUIT on Windows/Linux — stay running in system tray
    console.log('[Main] All windows closed -> Personal OS daemon remains active in system tray');
  });
}
