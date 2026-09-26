import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, CheckSquare, Flame, Clock, FileText, Sun, Moon, ArrowRight, Zap, Target } from 'lucide-react';
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

  // Command items
  const commands = [
    ...MODULE_REGISTRY.map((mod) => ({
      id: `nav-${mod.id}`,
      title: `Go to ${mod.name}`,
      subtitle: mod.description,
      category: 'Navigation',
      icon: <Command className="w-4 h-4 text-[#007AFF]" />,
      action: () => {
        setActiveModule(mod.id);
        setCommandPaletteOpen(false);
      },
    })),
    {
      id: 'cmd-focus-deep',
      title: 'Start 50-Min Deep Work Session',
      subtitle: 'Launches deep work timer with ambient focus sound',
      category: 'Focus',
      icon: <Zap className="w-4 h-4 text-[#8B5CF6]" />,
      action: () => {
        setMode('deep_work');
        startTimer();
        setActiveModule('dashboard');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'cmd-focus-pomo',
      title: 'Start 25-Min Pomodoro Session',
      subtitle: 'Classic productivity sprint',
      category: 'Focus',
      icon: <Clock className="w-4 h-4 text-[#F59E0B]" />,
      action: () => {
        setMode('pomodoro');
        startTimer();
        setActiveModule('dashboard');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'cmd-theme',
      title: `Toggle Theme (Current: ${theme === 'dark' ? 'Matte Obsidian' : 'Crisp White'})`,
      subtitle: 'Instantly toggle between Dark & Light mode',
      category: 'System',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#007AFF]" />,
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    },
  ];

  // Quick math evaluation
  const isMathExpr = /^[\d\s+\-*/().%^]+$/.test(query.trim()) && /[+\-*/%]/.test(query);
  let mathResult: number | null = null;
  if (isMathExpr) {
    try {
      // Safe math eval with Function
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
      if (mathResult !== null) {
        addTask(`Calculated: ${query} = ${mathResult}`, 'P2');
        setCommandPaletteOpen(false);
      } else if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#151922] shadow-2xl"
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.07)]">
              <Search className="w-5 h-5 text-[#94A3B8]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, jump to a module, or calculate (e.g. 15% * 850)..."
                className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none"
              />
              <kbd className="px-2 py-0.5 text-[10px] font-semibold text-[#94A3B8] bg-[rgba(255,255,255,0.06)] rounded border border-[rgba(255,255,255,0.1)]">
                ESC
              </kbd>
            </div>

            {/* Quick Math Result Callout */}
            {mathResult !== null && (
              <div className="p-3 mx-3 my-2 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#007AFF]">Result:</span>
                  <span className="text-base font-semibold text-[#F8FAFC] tabular-nums">{mathResult}</span>
                </div>
                <span className="text-[11px] text-[#94A3B8]">Press Enter to save as task</span>
              </div>
            )}

            {/* Command List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#64748B]">
                  No matching commands found.
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-[#007AFF] text-white shadow-md'
                          : 'hover:bg-[#1D2330] text-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#1D2330]'
                          }`}
                        >
                          {cmd.icon}
                        </div>
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              isSelected ? 'text-white' : 'text-[#F8FAFC]'
                            }`}
                          >
                            {cmd.title}
                          </div>
                          <div
                            className={`text-xs ${
                              isSelected ? 'text-white/80' : 'text-[#64748B]'
                            }`}
                          >
                            {cmd.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#1D2330] text-[#64748B]'
                          }`}
                        >
                          {cmd.category}
                        </span>
                        {isSelected && <ArrowRight className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[#10131A] text-[11px] text-[#64748B]">
              <div className="flex items-center gap-4">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
              </div>
              <div className="flex items-center gap-1 font-medium text-[#94A3B8]">
                <span>Personal OS</span>
                <span className="text-[#007AFF]">OmniBar</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
