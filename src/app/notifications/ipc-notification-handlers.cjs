// ============================================================================
// Personal OS — Main Process Desktop Notification IPC Bridge
// Handles 'show-notification', 'notification-history', and action dispatch
// ============================================================================

const { ipcMain } = require('electron');
const { mainNotificationService } = require('./notification-manager.cjs');

function registerNotificationIpcHandlers() {
  ipcMain.handle('show-notification', async (_event, payload) => {
    return mainNotificationService.showNotification(payload);
  });

  ipcMain.handle('notification-history', async () => {
    return mainNotificationService.getHistory();
  });

  console.log('[NotificationIPC] Registered show-notification & notification-history IPC channels.');
}

module.exports = {
  registerNotificationIpcHandlers,
};
