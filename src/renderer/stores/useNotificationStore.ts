import { create } from 'zustand';
import { NotificationEntity } from '@/services/database/types';
import { notificationService, DispatchNotificationOptions } from '@/services/notifications/notification-service';

interface NotificationState {
  notifications: NotificationEntity[];
  unreadCount: number;
  refreshNotifications: () => void;
  dispatchNotification: (options: DispatchNotificationOptions) => NotificationEntity;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => {
  const getSnapshot = () => {
    const list = notificationService.getNotifications();
    return {
      notifications: list,
      unreadCount: list.filter((n) => !n.isRead).length,
    };
  };

  // Wire automatic subscription to NotificationService so any background notification dispatches
  notificationService.subscribe((list) => {
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.isRead).length,
    });
  });

  return {
    ...getSnapshot(),

    refreshNotifications: () => {
      set(getSnapshot());
    },

    dispatchNotification: (options: DispatchNotificationOptions) => {
      const entity = notificationService.dispatch(options);
      set(getSnapshot());
      return entity;
    },

    markAsRead: (id: string) => {
      notificationService.markAsRead(id);
      set(getSnapshot());
    },

    markAllAsRead: () => {
      const list = notificationService.getNotifications();
      list.forEach((n) => {
        if (!n.isRead) {
          notificationService.markAsRead(n.id);
        }
      });
      set(getSnapshot());
    },

    dismissNotification: (id: string) => {
      notificationService.deleteNotification(id);
      set(getSnapshot());
    },

    clearAll: () => {
      notificationService.clearAll();
      set(getSnapshot());
    },
  };
});
