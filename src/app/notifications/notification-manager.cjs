// ============================================================================
// Personal OS — Main Process Desktop Notification Manager
// Native Windows Action Center Integration with Action Handling & Queueing
// ============================================================================

const { Notification, nativeImage } = require('electron');
const path = require('path');
const { databaseManager } = require('../database/database-manager.cjs');

class MainNotificationService {
  constructor() {
    this.mainWindow = null;
    this.queue = [];
    this.isProcessing = false;
    this.appIcon = null;
    this.setupIcon();
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  setupIcon() {
    try {
      const svgBuffer = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <rect width="60" height="60" x="2" y="2" rx="14" fill="#2563EB"/>
          <path d="M18 32l10 10 20-20" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      );
      this.appIcon = nativeImage.createFromBuffer(svgBuffer).resize({ width: 64, height: 64 });
    } catch (e) {
      this.appIcon = null;
    }
  }

  /**
   * Dispatches a native desktop notification to Windows Action Center
   * Operates reliably even when mainWindow is minimized or hidden in tray
   */
  showNotification(payload) {
    const id = payload.id || 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const entry = {
      id,
      title: payload.title || 'Personal Organizer',
      message: payload.message || payload.body || '',
      type: payload.type || 'system',
      urgency: payload.urgency || 'normal',
      silent: Boolean(payload.silent),
      targetModule: payload.targetModule || (payload.type === 'timer_finished' ? 'timer' : payload.type === 'reminder' ? 'reminders' : 'tasks'),
      taskId: payload.taskId || null,
      createdAt: new Date().toISOString(),
      clicked: false,
      dismissed: false,
    };

    // 1. Persist to SQLite Notification History
    try {
      databaseManager.saveNotificationHistory(entry);
    } catch (err) {
      console.warn('[MainNotificationService] Failed to persist history:', err.message);
    }

    // 2. Queue for native delivery
    this.queue.push(entry);
    this.processQueue();

    return entry;
  }

  processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const item = this.queue.shift();

    try {
      if (!Notification || typeof Notification.isSupported !== 'function' || !Notification.isSupported()) {
        console.warn('[MainNotificationService] Native Notification API is not available or supported in this runtime');
        this.isProcessing = false;
        this.processQueue();
        return;
      }

      const notificationOptions = {
        title: item.title,
        body: item.message,
        silent: item.silent,
        urgency: item.urgency === 'critical' ? 'critical' : 'normal',
      };

      if (this.appIcon) {
        notificationOptions.icon = this.appIcon;
      }

      const nativeNotif = new Notification(notificationOptions);

      // Handle Click Action: Bring Window to Front and Navigate
      nativeNotif.on('click', () => {
        console.log(`[MainNotificationService] Notification clicked: ${item.id} (${item.type})`);
        
        // 1. Bring application window to front
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) this.mainWindow.restore();
          if (!this.mainWindow.isVisible()) this.mainWindow.show();
          this.mainWindow.focus();

          // 2. Notify renderer of click action and navigation target
          this.mainWindow.webContents.send('notification-clicked', {
            id: item.id,
            type: item.type,
            targetModule: item.targetModule,
            taskId: item.taskId,
          });
        }

        // 3. Update history in SQLite
        try {
          databaseManager.updateNotificationHistoryAction(item.id, { clicked: true });
        } catch (e) {}
      });

      // Handle Dismiss Action
      nativeNotif.on('close', () => {
        console.log(`[MainNotificationService] Notification dismissed: ${item.id}`);
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('notification-dismissed', { id: item.id });
        }
        try {
          databaseManager.updateNotificationHistoryAction(item.id, { dismissed: true });
        } catch (e) {}
      });

      // If mainWindow is hidden in tray or minimized, restore and focus so user never misses reminder
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
        }
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.focus();
        this.mainWindow.flashFrame(true);

        this.mainWindow.webContents.send('reminder-alert-triggered', {
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type,
          urgency: item.urgency,
          taskId: item.taskId,
        });
      }

      // Dispatch native notification
      nativeNotif.show();
    } catch (err) {
      console.error('[MainNotificationService] Error dispatching native notification:', err);
    } finally {
      // Small debounce before processing next item in queue to avoid OS toast storm
      setTimeout(() => {
        this.isProcessing = false;
        this.processQueue();
      }, 250);
    }
  }

  getHistory() {
    return databaseManager.getNotificationHistory();
  }
}

const mainNotificationService = new MainNotificationService();

module.exports = {
  mainNotificationService,
  MainNotificationService,
};
