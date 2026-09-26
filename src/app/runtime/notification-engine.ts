import { Notification, app } from 'electron';
import { NotificationPayload } from './types';

export class NotificationEngine {
  private history: NotificationPayload[] = [];
  private readonly maxHistory = 100;
  private soundEnabled: boolean = true;

  public notify(payload: NotificationPayload): boolean {
    // Add to circular memory history
    this.history.unshift(payload);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    if (!Notification.isSupported()) {
      console.warn('[NotificationEngine] Native notifications not supported in current environment');
      return false;
    }

    try {
      const nativeNotification = new Notification({
        title: payload.title,
        body: payload.body,
        silent: payload.sound === false || !this.soundEnabled,
        urgency: payload.urgency || 'normal',
        timeoutType: payload.urgency === 'critical' ? 'never' : 'default',
      });

      nativeNotification.on('click', () => {
        // Broadcast notification click to restore window
        app.emit('personal-os:notification-click', payload);
      });

      nativeNotification.show();
      return true;
    } catch (err) {
      console.error('[NotificationEngine] Failed to dispatch native notification:', err);
      return false;
    }
  }

  public getRecentNotifications(): NotificationPayload[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }
}

export const notificationEngine = new NotificationEngine();
