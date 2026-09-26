import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Tag, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { Priority } from '@shared/types';

export const QuickCaptureModal: React.FC = () => {
  const { quickCaptureOpen, setQuickCaptureOpen } = useAppStore();
  const { addTask } = useTaskStore();
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P1');
  const [estimate, setEstimate] = useState<number>(30);
  const [tag, setTag] = useState('#focus');
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

    addTask(title.trim(), priority, [tag], estimate);
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
            className="w-full max-w-lg rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#151922] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#007AFF]/15 text-[#007AFF]">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Quick Capture</h3>
              </div>
              <button
                onClick={() => setQuickCaptureOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1D2330]"
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
                  placeholder="What needs to be done? (Press Enter to capture)"
                  className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1D2330] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none focus:border-[#007AFF]"
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
                      P2: 'text-[#007AFF] border-[#007AFF]/40 bg-[#007AFF]/10',
                      P3: 'text-[#64748B] border-[#64748B]/40 bg-[#64748B]/10',
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected ? `${colors[p]} shadow-sm` : 'text-[#64748B] border-transparent hover:bg-[#1D2330]'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimate Selection */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Estimate
                </span>
                <div className="flex gap-1.5">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstimate(mins)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        estimate === mins
                          ? 'border-[#007AFF] text-[#007AFF] bg-[#007AFF]/10'
                          : 'border-transparent text-[#64748B] hover:bg-[#1D2330]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Selection */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Tag
                </span>
                <div className="flex gap-1.5">
                  {['#focus', '#strategy', '#code', '#personal'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        tag === t
                          ? 'border-[#8B5CF6] text-[#8B5CF6] bg-[#8B5CF6]/10'
                          : 'border-transparent text-[#64748B] hover:bg-[#1D2330]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[rgba(255,255,255,0.07)]">
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] rounded-xl shadow-md disabled:opacity-40 transition-all"
                >
                  Add Task (↵)
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
