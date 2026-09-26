import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Flame,
  Target,
  Clock,
  Calendar,
  Bell,
  BarChart2,
  Calculator,
  Sparkles,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Plus,
  Circle,
  Minus,
  Square,
  X,
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
    setQuickCaptureOpen,
    unreadNotifications,
  } = useAppStore();

  // Attach global keyboard listener
  useKeyboardShortcuts();

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
    CheckSquare: <CheckSquare className="w-4 h-4" />,
    FileText: <FileText className="w-4 h-4" />,
    Flame: <Flame className="w-4 h-4" />,
    Target: <Target className="w-4 h-4" />,
    Clock: <Clock className="w-4 h-4" />,
    Calendar: <Calendar className="w-4 h-4" />,
    Bell: <Bell className="w-4 h-4" />,
    BarChart2: <BarChart2 className="w-4 h-4" />,
    Calculator: <Calculator className="w-4 h-4" />,
    Sparkles: <Sparkles className="w-4 h-4" />,
    Settings: <Settings className="w-4 h-4" />,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0F1117] text-[#F8FAFC]">
      {/* 1. Desktop Window Titlebar (Drag Region & Controls) */}
      <header className="h-10 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.06)] bg-[#10131A] select-none z-30">
        {/* Left: Window Dots & App Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 hover:bg-[#EF4444] transition-all cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 hover:bg-[#F59E0B] transition-all cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-[#22C55E]/80 hover:bg-[#22C55E] transition-all cursor-pointer" />
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-[rgba(255,255,255,0.08)]">
            <div className="w-2 h-2 rounded-full bg-[#007AFF] shadow-sm shadow-[#007AFF]" />
            <span className="text-xs font-bold tracking-wider text-[#F8FAFC]">PERSONAL OS</span>
            <span className="text-[10px] text-[#64748B] font-mono">v1.0.0-prod</span>
          </div>
        </div>

        {/* Center: Search pill (Cmd+K trigger) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#151922] hover:bg-[#1D2330] border border-[rgba(255,255,255,0.08)] text-xs text-[#94A3B8] transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or jump to...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#64748B] font-semibold border border-[rgba(255,255,255,0.08)]">
            ⌘K
          </kbd>
        </button>

        {/* Right: Theme Switcher & Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1D2330] transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#007AFF]" />}
          </button>
        </div>
      </header>

      {/* 2. Main Body: Sidebar + Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Arc-Inspired Collapsible Sidebar */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 68 : 240 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#151922] select-none z-20"
        >
          {/* Sidebar Top: Collapse Toggle & Quick Capture */}
          <div className="p-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)]">
            {!sidebarCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Command Hub
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1D2330] transition-colors ml-auto"
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
                      ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/25'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1D2330]'
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
                              ? 'bg-white/20 text-white'
                              : 'bg-[#1D2330] text-[#64748B] border border-[rgba(255,255,255,0.06)]'
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

          {/* Sidebar Footer: User Card */}
          <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#10131A]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white shadow-md">
                SR
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">Sri Renangi</div>
                  <div className="text-[10px] text-[#22C55E] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span>Single-User OS</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#0F1117]">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <QuickCaptureModal />
    </div>
  );
};
