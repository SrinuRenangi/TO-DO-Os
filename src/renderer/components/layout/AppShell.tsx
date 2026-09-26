import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Clock,
  Calendar,
  Bell,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore, MODULE_REGISTRY } from '@/stores/useAppStore';
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
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    setCommandPaletteOpen,
    unreadNotifications,
  } = useAppStore();

  useKeyboardShortcuts();

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
    CheckSquare: <CheckSquare className="w-4 h-4" />,
    Calendar: <Calendar className="w-4 h-4" />,
    Bell: <Bell className="w-4 h-4" />,
    FileText: <FileText className="w-4 h-4" />,
    Clock: <Clock className="w-4 h-4" />,
    Settings: <Settings className="w-4 h-4" />,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B1220] text-[#F8FAFC]">
      {/* 1. Linux Desktop Control Center Top Bar */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.06)] bg-[#111827] select-none z-30">
        {/* Left: Window Controls & OS Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-sm shadow-[#EF4444]/40 cursor-pointer" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-sm shadow-[#F59E0B]/40 cursor-pointer" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-sm shadow-[#22C55E]/40 cursor-pointer" />
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-[rgba(255,255,255,0.08)]">
            <div className="w-2 h-2 rounded-full bg-[#4F8CFF] shadow-sm shadow-[#4F8CFF]" />
            <span className="text-xs font-black tracking-widest text-[#F8FAFC]">PERSONAL OS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1A2333] text-[#4F8CFF] font-mono border border-[#4F8CFF]/30">
              Desktop Native
            </span>
          </div>
        </div>

        {/* Center: Omni Search & Capture (Ctrl+K) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#1A2333] hover:bg-[#21293C] border border-[rgba(255,255,255,0.08)] hover:border-[#4F8CFF]/40 text-xs text-[#94A3B8] transition-all"
        >
          <Search className="w-3.5 h-3.5 text-[#4F8CFF]" />
          <span>Quick Command Bar...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#64748B] font-mono font-bold border border-[rgba(255,255,255,0.08)]">
            Ctrl+K
          </kbd>
        </button>

        {/* Right: Telemetry, Notification Bell & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Live System Companion badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#1A2333] border border-[rgba(255,255,255,0.06)] text-[11px] text-[#94A3B8]">
            <span className="text-[#4F8CFF] font-semibold">Offline SQLite</span>
            <span className="text-[#64748B]">•</span>
            <span className="text-[#22C55E] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              24/7 Tray Active
            </span>
          </div>

          {/* Reminders Shortcut */}
          <button
            onClick={() => setActiveModule('reminders')}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#4F8CFF] hover:bg-[#1A2333] relative transition-colors"
            title="Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2333] transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#4F8CFF]" />}
          </button>
        </div>
      </header>

      {/* 2. Main Body: Linux Desktop Sidebar + Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 68 : 240 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#111827] select-none z-20"
        >
          {/* Sidebar Top */}
          <div className="p-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)]">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                Productivity Suite
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#4F8CFF] hover:bg-[#1A2333] transition-colors ml-auto"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Module Nav Links */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {MODULE_REGISTRY.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  title={mod.name}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-[#4F8CFF] text-white shadow-md shadow-[#4F8CFF]/30 font-bold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A2333]'
                  }`}
                >
                  <span className={`p-1 rounded-lg ${isActive ? 'text-white' : 'text-[#64748B]'}`}>
                    {iconMap[mod.iconName] || <LayoutDashboard className="w-4 h-4" />}
                  </span>

                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{mod.name}</span>
                      {mod.hotkey && (
                        <kbd
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isActive
                              ? 'bg-black/20 text-white font-bold'
                              : 'bg-[#1A2333] text-[#64748B] border border-[rgba(255,255,255,0.06)]'
                          }`}
                        >
                          {mod.hotkey}
                        </kbd>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer: 24/7 Companion Badge */}
          <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#0B1220]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/30 flex items-center justify-center text-xs font-black shadow-sm">
                OS
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">Personal OS</div>
                  <div className="text-[10px] text-[#22C55E] flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    <span>24/7 Companion Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#0B1220]">
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
