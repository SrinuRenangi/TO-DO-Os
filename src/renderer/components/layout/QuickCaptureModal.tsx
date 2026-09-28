import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { Priority } from '@shared/types';

export const QuickCaptureModal: React.FC = () => {
  const { quickCaptureOpen, setQuickCaptureOpen } = useAppStore();
  const { addTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P1');
  const [dueTime, setDueTime] = useState('18:00');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickCaptureOpen) {
      setTitle('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickCaptureOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title.trim(), priority, 'Engineering', undefined, dueTime, 'none', undefined, ['#capture']);
    setQuickCaptureOpen(false);
  };

  return (
    <AnimatePresence>
      {quickCaptureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Quick Capture Task</h3>
              </div>
              <button
                onClick={() => setQuickCaptureOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A2333]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title (e.g. Buy Medicine, Review system specs)..."
                  className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none focus:border-[#4F8CFF]/60"
                />
              </div>

              {/* Priority Selection */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Priority
                </span>
                <div className="flex gap-1.5">
                  {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map((p) => {
                    const isSelected = priority === p;
                    const colors = {
                      P0: 'text-[#EF4444] border-[#EF4444]/40 bg-[#EF4444]/10',
                      P1: 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10',
                      P2: 'text-[#4F8CFF] border-[#4F8CFF]/40 bg-[#4F8CFF]/10',
                      P3: 'text-[#64748B] border-[#64748B]/40 bg-[#64748B]/10',
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all ${
                          isSelected ? `${colors[p]} shadow-sm` : 'text-[#64748B] border-transparent hover:bg-[#1A2333]'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Time */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Due Time
                </span>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-[#1A2333] border border-[rgba(255,255,255,0.08)] text-[#F8FAFC] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  onClick={() => setQuickCaptureOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#4F8CFF] hover:bg-[#3b82f6] rounded-xl shadow-md disabled:opacity-40 transition-all"
                >
                  Capture Task (↵)
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickCaptureModal;
