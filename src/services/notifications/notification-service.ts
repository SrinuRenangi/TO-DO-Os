// ============================================================================
// Personal OS — Notification Service
// Native Windows Desktop Notifications, Audio Chimes, and Action Center Feed
// ============================================================================

import { databaseService } from '../database/database-service';
import { NotificationEntity } from '../database/types';
import { generateId } from '@/lib/utils';
import { soundSynth } from '@/lib/sound-synth';
import { useAppStore } from '@/stores/useAppStore';

export type NotificationType = 'reminder' | 'task_due' | 'task_overdue' | 'timer_finished' | 'system';

export interface DispatchNotificationOptions {
  title: string;
  body: string;
  type?: NotificationType;
  urgency?: 'normal' | 'urgent' | 'critical';
  sound?: boolean;
  targetModule?: 'dashboard' | 'tasks' | 'calendar' | 'reminders' | 'notes' | 'timer' | 'settings';
  taskId?: string;
}

declare global {
  interface Window {
    desktopNotifications?: {
      isAvailable: boolean;
      showNotification: (payload: {
        id?: string;
        title: string;
        message?: string;
        body?: string;
        type?: NotificationType;
        urgency?: 'normal' | 'urgent' | 'critical';
        silent?: boolean;
        targetModule?: string;
        taskId?: string;
      }) => Promise<any>;
      getNotificationHistory: () => Promise<any[]>;
      onNotificationClicked: (callback: (data: { id: string; type: string; targetModule?: string; taskId?: string }) => void) => () => void;
      onNotificationDismissed: (callback: (data: { id: string }) => void) => () => void;
      getAutoStart?: () => Promise<boolean>;
      setAutoStart?: (enable: boolean) => Promise<boolean>;
    };
  }
}

export class NotificationService {
  private listeners: Set<(notifications: NotificationEntity[]) => void> = new Set();

  constructor() {
    this.setupDesktopNotificationBridge();
  }

  private setupDesktopNotificationBridge(): void {
    if (typeof window !== 'undefined' && window.desktopNotifications?.onNotificationClicked) {
      window.desktopNotifications.onNotificationClicked((data) => {
        console.log('[NotificationService] Native notification clicked:', data);
        if (data.targetModule) {
          useAppStore.getState().setActiveModule(data.targetModule as any);
        }
      });
    }
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

  public dispatch(options: DispatchNotificationOptions): NotificationEntity {
    const {
      title,
      body,
      type = 'system',
      urgency = 'normal',
      sound = true,
      targetModule,
      taskId,
    } = options;

    // 1. Play audio chime
    if (sound) {
      soundSynth.playChime(urgency === 'critical' ? 'alert' : 'complete');
    }

    // 2. Persist into SQLite notifications feed
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

    // 3. Dispatch Native Windows Desktop Notification via Electron Main Process
    if (typeof window !== 'undefined' && window.desktopNotifications?.showNotification) {
      window.desktopNotifications.showNotification({
        id: entity.id,
        title,
        message: body,
        type,
        urgency,
        silent: !sound,
        targetModule: targetModule || (type === 'timer_finished' ? 'timer' : type === 'reminder' ? 'reminders' : 'tasks'),
        taskId,
      }).catch((err) => {
        console.warn('[NotificationService] Native Windows notification dispatch failed:', err);
      });
    }

    return entity;
  }

  // --- Specialized Typed Dispatchers ---
  public dispatchReminder(title: string, body: string, urgency: 'normal' | 'urgent' | 'critical' = 'normal', taskId?: string): NotificationEntity {
    return this.dispatch({
      title: `Reminder: ${title}`,
      body,
      type: 'reminder',
      urgency,
      sound: true,
      targetModule: 'reminders',
      taskId,
    });
  }

  public dispatchTaskDue(title: string, dueDate: string, dueTime?: string, taskId?: string): NotificationEntity {
    const timeStr = dueTime ? ` at ${dueTime}` : '';
    return this.dispatch({
      title: `Task Due: ${title}`,
      body: `Due today (${dueDate}${timeStr}). Click to view tasks.`,
      type: 'task_due',
      urgency: 'urgent',
      sound: true,
      targetModule: 'tasks',
      taskId,
    });
  }

  public dispatchTaskOverdue(title: string, taskId?: string): NotificationEntity {
    return this.dispatch({
      title: `Task Overdue: ${title}`,
      body: 'This task is past its scheduled deadline and requires attention.',
      type: 'task_overdue',
      urgency: 'critical',
      sound: true,
      targetModule: 'tasks',
      taskId,
    });
  }

  public dispatchTimerFinished(label: string): NotificationEntity {
    return this.dispatch({
      title: 'Timer Complete! 🎯',
      body: `${label} session finished. Take a rest or start a new interval.`,
      type: 'timer_finished',
      urgency: 'urgent',
      sound: true,
      targetModule: 'timer',
    });
  }

  public dispatchSystem(title: string, body: string): NotificationEntity {
    return this.dispatch({
      title,
      body,
      type: 'system',
      urgency: 'normal',
      sound: false,
      targetModule: 'dashboard',
    });
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
