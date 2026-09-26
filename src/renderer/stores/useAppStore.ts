import { create } from 'zustand';
import { AppModuleId, AppModuleMeta } from '@shared/types';

interface AppState {
  activeModule: AppModuleId;
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  quickCaptureOpen: boolean;
  notificationCenterOpen: boolean;
  unreadNotifications: number;
  activeWidgetIds: string[];

  // Actions
  setActiveModule: (module: AppModuleId) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  setNotificationCenterOpen: (open: boolean) => void;
  toggleNotificationCenter: () => void;
  decrementNotifications: () => void;
  reorderWidgets: (newOrder: string[]) => void;
}

export const MODULE_REGISTRY: AppModuleMeta[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'System Summary & Control Center', iconName: 'LayoutDashboard', hotkey: '1' },
  { id: 'tasks', name: 'Tasks', description: 'List & Kanban execution engine', iconName: 'CheckSquare', hotkey: '2' },
  { id: 'calendar', name: 'Calendar', description: 'Real tasks & scheduled timeline', iconName: 'Calendar', hotkey: '3' },
  { id: 'reminders', name: 'Reminders', description: '24/7 background audio alerts', iconName: 'Bell', hotkey: '4' },
  { id: 'notes', name: 'Notes', description: 'Markdown notes & pinned memos', iconName: 'FileText', hotkey: '5' },
  { id: 'timer', name: 'Timer', description: 'Pomodoro, stopwatch & countdown', iconName: 'Clock', hotkey: '6' },
  { id: 'settings', name: 'Settings', description: 'Auto-start, tray & backup durability', iconName: 'Settings', hotkey: '7' },
];

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  theme: 'dark',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  quickCaptureOpen: false,
  notificationCenterOpen: false,
  unreadNotifications: 0,
  activeWidgetIds: ['tasks', 'reminders', 'calendar', 'timer', 'notes', 'notifications'],

  setActiveModule: (module) => set({ activeModule: module }),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),
  setNotificationCenterOpen: (open) => set({ notificationCenterOpen: open }),
  toggleNotificationCenter: () =>
    set((state) => ({ notificationCenterOpen: !state.notificationCenterOpen })),
  decrementNotifications: () =>
    set((state) => ({ unreadNotifications: Math.max(0, state.unreadNotifications - 1) })),
  reorderWidgets: (newOrder) => set({ activeWidgetIds: newOrder }),
}));
