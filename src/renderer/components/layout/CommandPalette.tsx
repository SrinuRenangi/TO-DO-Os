import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, CheckSquare, Clock, FileText, Sun, Moon, ArrowRight, Zap, Bell, Calendar } from 'lucide-react';
import { useAppStore, MODULE_REGISTRY } from '@/stores/useAppStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { useTaskStore } from '@/stores/useTaskStore';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveModule, toggleTheme, theme } = useAppStore();
  const { startTimer, setMode } = useFocusStore();
  const { addTask } = useTaskStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const commands = [
    ...MODULE_REGISTRY.map((mod) => ({
      id: `nav-${mod.id}`,
      title: `Jump to ${mod.name}`,
      subtitle: mod.description,
      category: 'Navigation',
      icon: <Command className="w-4 h-4 text-[#4F8CFF]" />,
      action: () => {
        setActiveModule(mod.id);
        setCommandPaletteOpen(false);
      },
    })),
    {
      id: 'cmd-focus-pomo',
      title: 'Start 25-Min Pomodoro Sprint',
      subtitle: 'Launches background pomodoro timer',
      category: 'Timer',
      icon: <Clock className="w-4 h-4 text-[#4F8CFF]" />,
      action: () => {
        setMode('pomodoro');
        startTimer();
        setActiveModule('dashboard');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'cmd-focus-countdown',
      title: 'Start 15-Min Quick Countdown',
      subtitle: 'Launches 15m focus countdown',
      category: 'Timer',
      icon: <Clock className="w-4 h-4 text-[#F59E0B]" />,
      action: () => {
        setMode('countdown', 15 * 60);
        startTimer();
        setActiveModule('dashboard');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'cmd-theme',
      title: `Toggle Theme (Current: ${theme === 'dark' ? 'Deepin Dark' : 'Light'})`,
      subtitle: 'Toggle between Dark & Light mode',
      category: 'System',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#4F8CFF]" />,
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    },
  ];

  // Safe Math evaluation
  const isMathExpr = /^[\d\s+\-*/().%^]+$/.test(query.trim()) && /[+\-*/%]/.test(query);
  let mathResult: number | null = null;
  if (isMathExpr) {
    try {
      mathResult = Function(`"use strict"; return (${query})`)();
    } catch {
      mathResult = null;
    }
  }

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] shadow-2xl overflow-hidden"
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)] bg-[#1A2333]">
              <Search className="w-4 h-4 text-[#4F8CFF]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type command, calculate (e.g. 45 * 12), or navigate..."
                className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#64748B] font-mono border border-[rgba(255,255,255,0.06)]">
                ESC
              </kbd>
            </div>

            {/* Live Math Calculator Result */}
            {mathResult !== null && (
              <div className="p-3 bg-[#4F8CFF]/10 border-b border-[#4F8CFF]/20 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Calculation result:</span>
                <span className="text-sm font-mono font-bold text-[#4F8CFF]">{mathResult}</span>
              </div>
            )}

            {/* Command Results */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B]">No matching commands found.</div>
              ) : (
                filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                      selectedIndex === idx
                        ? 'bg-[#1A2333] border border-[#4F8CFF]/30 text-[#F8FAFC]'
                        : 'text-[#94A3B8] hover:bg-[#1A2333]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.06)]">
                        {cmd.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F8FAFC]">{cmd.title}</div>
                        <div className="text-[10px] text-[#64748B]">{cmd.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#111827] text-[#64748B] font-mono">
                        {cmd.category}
                      </span>
                      {selectedIndex === idx && <ArrowRight className="w-3.5 h-3.5 text-[#4F8CFF]" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
