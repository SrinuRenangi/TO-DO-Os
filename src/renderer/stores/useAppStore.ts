import { create } from 'zustand';
import { AppModuleId, AppModuleMeta } from '@shared/types';

interface AppState {
  activeModule: AppModuleId;
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  quickCaptureOpen: boolean;
  unreadNotifications: number;
  
  // Actions
  setActiveModule: (module: AppModuleId) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  decrementNotifications: () => void;
}

export const MODULE_REGISTRY: AppModuleMeta[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Central Command Center', iconName: 'LayoutDashboard', hotkey: '1' },
  { id: 'tasks', name: 'Task System', description: 'Linear-grade task engine', iconName: 'CheckSquare', hotkey: '2' },
  { id: 'notes', name: 'Notes System', description: 'Knowledge base & thoughts', iconName: 'FileText', hotkey: '3' },
  { id: 'habits', name: 'Habit Tracker', description: 'Atomic habits & streaks', iconName: 'Flame', hotkey: '4' },
  { id: 'focus', name: 'Focus Center', description: 'Deep work & Pomodoro', iconName: 'Clock', hotkey: '5' },
  { id: 'calendar', name: 'Calendar', description: 'Timeblocking & agenda', iconName: 'Calendar', hotkey: '6' },
  { id: 'goals', name: 'Goal Tracker', description: 'Objectives & Key Results', iconName: 'Target', hotkey: '7' },
  { id: 'reminders', name: 'Reminders', description: 'Smart escalating alerts', iconName: 'Bell', hotkey: '8' },
  { id: 'analytics', name: 'Analytics', description: 'Productivity trends', iconName: 'BarChart2', hotkey: '9' },
  { id: 'calculator', name: 'Calculator', description: 'Spotlight math & units', iconName: 'Calculator' },
  { id: 'ai', name: 'AI Assistant', description: 'Productivity copilot', iconName: 'Sparkles' },
  { id: 'settings', name: 'Settings', description: 'Preferences & backup', iconName: 'Settings' },
];

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  theme: 'dark',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  quickCaptureOpen: false,
  unreadNotifications: 3,

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
  decrementNotifications: () =>
    set((state) => ({ unreadNotifications: Math.max(0, state.unreadNotifications - 1) })),
}));
