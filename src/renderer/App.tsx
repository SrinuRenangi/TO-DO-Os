import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TaskSystemView } from '@/components/tasks/TaskSystemView';
import { NotesView } from '@/components/notes/NotesView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { FocusView } from '@/components/focus/FocusView';
import { NotificationCenterView } from '@/components/notifications/NotificationCenterView';
import { SettingsView } from '@/components/settings/SettingsView';
import { useAppStore } from '@/stores/useAppStore';
import { schedulerService } from '@/services/scheduler/scheduler-service';
import { databaseService } from '@/services/database/database-service';

import { useTaskStore } from '@/stores/useTaskStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

export const App: React.FC = () => {
  const activeModule = useAppStore((state) => state.activeModule);

  useEffect(() => {
    // 1. Synchronize SQLite WAL persistence and rehydrate stores
    databaseService.syncFromSQLite().then(() => {
      useTaskStore.getState().refreshTasks();
      useReminderStore.getState().refreshReminders();
      useNotesStore.getState().refreshNotes();
      useCalendarStore.getState().refreshEvents();
      useNotificationStore.getState().refreshNotifications();
    }).catch((err) => {
      console.warn('[App] SQLite initial sync:', err);
    });

    // 2. Start the continuous 24/7 background scheduler daemon
    schedulerService.start();

    // 3. Listen for immediate wake/unlock reconciliation from Electron PowerMonitor
    let unsubResume: (() => void) | undefined;
    if (typeof window !== 'undefined' && (window as any).desktopNotifications?.onSystemResumed) {
      unsubResume = (window as any).desktopNotifications.onSystemResumed(() => {
        console.log('[App] System resumed/unlocked from sleep. Catching up scheduler immediately.');
        schedulerService.tick();
      });
    }

    return () => {
      unsubResume?.();
      schedulerService.stop();
    };
  }, []);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TaskSystemView />;
      case 'calendar':
        return <CalendarView />;
      case 'reminders':
        return <NotificationCenterView />;
      case 'notes':
        return <NotesView />;
      case 'timer':
        return <FocusView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <AppShell>{renderActiveModule()}</AppShell>;
};

export default App;
