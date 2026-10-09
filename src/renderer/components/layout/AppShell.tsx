import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  CheckSquare,
  Calendar,
  Bell,
  FileText,
  Timer,
  Settings,
  Search,
  CalendarDays,
  User,
} from 'lucide-react';
import { useAppStore, MODULE_REGISTRY } from '@/stores/useAppStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CommandPalette } from './CommandPalette';
import { QuickCaptureModal } from './QuickCaptureModal';
import { ReminderAlertModal } from '@/components/reminders/ReminderAlertModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    activeModule,
    setActiveModule,
    setCommandPaletteOpen,
  } = useAppStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  useKeyboardShortcuts();

  const iconMap: Record<string, React.ReactNode> = {
    Dashboard: <LayoutGrid className="w-5 h-5 stroke-[1.75]" />,
    Tasks: <CheckSquare className="w-5 h-5 stroke-[1.75]" />,
    Calendar: <Calendar className="w-5 h-5 stroke-[1.75]" />,
    Reminders: <Bell className="w-5 h-5 stroke-[1.75]" />,
    Notes: <FileText className="w-5 h-5 stroke-[1.75]" />,
    Timer: <Timer className="w-5 h-5 stroke-[1.75]" />,
    Settings: <Settings className="w-5 h-5 stroke-[1.75]" />,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden select-none bg-[#0F1117] text-[#EAEAEA] font-sans">
      {/* 1. Header (Persistent Dark Mode Bar) */}
      <header className="h-14 flex items-center justify-between px-6 bg-[#151922] border-b border-slate-500/50 z-30 shrink-0">
        {/* Left: App Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#007AFF] via-[#00C2FF] to-[#5E5CE6] p-[1.5px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#1D2330] rounded-[6px] flex items-center justify-center">
              <div className="w-4 h-3 bg-gradient-to-br from-[#007AFF] to-[#00C2FF] rounded-xs shadow-inner" />
            </div>
          </div>
          <span className="font-bold text-sm tracking-tight text-[#EAEAEA]">Personal Command Center</span>
        </div>

        {/* Center: Search Bar */}
        <div className="relative">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 w-80 md:w-96 rounded-full bg-[#1D2330] hover:#007AFF border border-slate-500/30 text-xs text-slate-400 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-400 font-mono shadow-xs border border-gray-200">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions (Calendar, Notifications, User Profile) */}
        <div className="flex items-center gap-3.5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveModule('calendar')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#007AFF] hover:bg-slate-500/20 transition-colors"
            title="Open Calendar"
          >
            <CalendarDays className="w-4 h-4 stroke-[1.8]" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveModule('reminders')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#007AFF] hover:bg-slate-500/20 transition-colors relative"
            title="Notifications & Reminders"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#007AFF] border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-500/30">
            <div className="w-7 h-7 rounded-full bg-[#1D2330] hover:bg-[#252A3A] border border-slate-500/30 shadow-2xs flex items-center justify-center text-slate-400 transition-colors">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Viewport: Sidebar + Dark Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Dark Vertical Bar) */}
        <aside className="w-[64px] bg-[#151922] border-r border-slate-500/30 flex flex-col items-center py-3 shrink-0 z-20">
          <nav className="flex-1 space-y-2 w-full px-2">
            {MODULE_REGISTRY.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  title={mod.name}
                  className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white font-medium border border-white/20'
                      : 'text-slate-400 hover:text-[#007AFF] hover:bg-slate-500/20 transition-colors'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {iconMap[mod.name] || <LayoutGrid className="w-5 h-5 stroke-[1.75]" />}
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{mod.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Readouts */}
          <div className="w-full px-2 pt-2 border-t border-slate-500/20 text-center space-y-1">
            <div className="text-[9px] font-mono text-slate-500 font-semibold leading-tight">SQLite WAL</div>
            <div className="text-[9px] font-mono text-[#00C2FF] font-semibold leading-tick">● 24/7 Active</div>
            <button
              onClick={() => setActiveModule('settings')}
              className="mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-500/20 transition-colors"
              title="System Settings"
            >
              <Settings className="w-3.5 h-3.5 mx-auto" />
            </button>
          </div>
        </aside>

        {/* Dark Canvas Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0F1117]">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <QuickCaptureModal />
      <ReminderAlertModal />
    </div>
  );
};

export default AppShell;