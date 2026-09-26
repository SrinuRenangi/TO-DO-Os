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
  LogOut,
  CalendarDays,
} from 'lucide-react';
import { useAppStore, MODULE_REGISTRY } from '@/stores/useAppStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CommandPalette } from './CommandPalette';
import { QuickCaptureModal } from './QuickCaptureModal';

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
    <div className="flex flex-col h-screen w-screen overflow-hidden select-none bg-[#CFD5DE] font-sans text-slate-800">
      {/* 1. Header (Persistent White Enterprise Bar — Image 1 reference) */}
      <header className="h-13 flex items-center justify-between px-5 bg-white border-b border-gray-200/90 z-30 shadow-xs shrink-0">
        {/* Left: App Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3B82F6] via-[#10B981] to-[#F59E0B] p-[1.5px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
              <div className="w-4 h-3 bg-gradient-to-br from-[#2563EB] to-[#0D9488] rounded-xs shadow-inner" />
            </div>
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">Personal Organizer</span>
        </div>

        {/* Center: Search Bar */}
        <div className="relative">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-4 py-1.5 w-80 md:w-96 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-gray-200/80 text-xs text-slate-500 transition-colors"
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
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Calendar"
          >
            <CalendarDays className="w-4 h-4 stroke-[1.8]" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveModule('reminders')}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="Notifications & Reminders"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300 shadow-xs flex items-center justify-center overflow-hidden">
              <span className="text-[11px] font-bold text-amber-900">SO</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Viewport: Vertical Sidebar + Brushed Metal Studio Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Minimal Left Vertical Bar ~72px) */}
        <aside className="w-[72px] bg-[#ECEEF2] border-r border-slate-300/80 flex flex-col items-center py-3.5 shrink-0 z-20">
          <nav className="flex-1 space-y-3 w-full px-2">
            {MODULE_REGISTRY.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  title={mod.name}
                  className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white shadow-sm text-slate-900 font-bold border border-slate-300/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-black/5 font-medium'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>
                    {iconMap[mod.name] || <LayoutGrid className="w-5 h-5 stroke-[1.75]" />}
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{mod.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Readouts */}
          <div className="w-full px-2 pt-3 border-t border-slate-300/70 text-center space-y-1">
            <div className="text-[9px] font-mono text-slate-500 font-semibold leading-tight">Data: 10%</div>
            <div className="text-[9px] font-mono text-slate-500 font-semibold leading-tight">Data: 22:08</div>
            <button
              onClick={() => setActiveModule('settings')}
              className="mt-1 p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors"
              title="System Exit / Settings"
            >
              <LogOut className="w-3.5 h-3.5 mx-auto rotate-180" />
            </button>
          </div>
        </aside>

        {/* Brushed Metal Canvas Workspace */}
        <main className="flex-1 overflow-y-auto brushed-metal-canvas p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <QuickCaptureModal />
    </div>
  );
};

export default AppShell;
