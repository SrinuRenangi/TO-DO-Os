import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TaskSystemView } from '@/components/tasks/TaskSystemView';
import { NotesView } from '@/components/notes/NotesView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { FocusView } from '@/components/focus/FocusView';
import { NotificationCenterView } from '@/components/notifications/NotificationCenterView';
import { SettingsView } from '@/components/settings/SettingsView';
import { useAppStore } from '@/stores/useAppStore';

export const App: React.FC = () => {
  const activeModule = useAppStore((state) => state.activeModule);

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
