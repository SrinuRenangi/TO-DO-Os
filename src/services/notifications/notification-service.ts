// ============================================================================
// Personal OS — Notification Service
// Native Desktop Banners, Audio Chimes, and Action Center Feed
// ============================================================================

import { databaseService } from '../database/database-service';
import { NotificationEntity } from '../database/types';
import { generateId } from '@/lib/utils';
import { soundSynth } from '@/lib/sound-synth';

export interface DispatchNotificationOptions {
  title: string;
  body: string;
  urgency?: 'normal' | 'urgent' | 'critical';
  sound?: boolean;
}

export class NotificationService {
  private listeners: Set<(notifications: NotificationEntity[]) => void> = new Set();

  constructor() {
    this.requestPermission();
  }

  public subscribe(listener: (notifications: NotificationEntity[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const list = this.getNotifications();
    this.listeners.forEach((fn) => {
      try {
        fn(list);
      } catch (err) {
        console.error('[NotificationService] Listener error:', err);
      }
    });
  }

  public requestPermission(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }

  public dispatch(options: DispatchNotificationOptions): NotificationEntity {
    const { title, body, urgency = 'normal', sound = true } = options;

    // 1. Play native audio chime
    if (sound) {
      soundSynth.playChime(urgency === 'critical' ? 'alert' : 'complete');
    }

    // 2. Dispatch native OS notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          silent: !sound,
        });
      } catch (err) {
        console.warn('[NotificationService] Native banner dispatch failed:', err);
      }
    }

    // 3. Save into local persistent database for notification feed
    const entity: NotificationEntity = {
      id: generateId('notif'),
      title,
      body,
      urgency,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    databaseService.addNotification(entity);
    this.notifyListeners();
    return entity;
  }

  public getNotifications(): NotificationEntity[] {
    return databaseService.getNotifications();
  }

  public markAsRead(id: string): void {
    databaseService.markNotificationRead(id);
    this.notifyListeners();
  }

  public deleteNotification(id: string): void {
    databaseService.deleteNotification(id);
    this.notifyListeners();
  }

  public clearAll(): void {
    databaseService.clearNotifications();
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
