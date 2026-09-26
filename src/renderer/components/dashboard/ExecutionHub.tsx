import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Plus, Clock, Tag, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { Priority, Task } from '@shared/types';
import { getTodayDateString } from '@/lib/utils';

export const ExecutionHub: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, filterPriority, setFilterPriority } = useTaskStore();
  const { habits, toggleHabitToday } = useHabitStore();

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('P1');
  const today = getTodayDateString();

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newPriority, ['#flow']);
    setNewTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'ALL') return true;
    return t.priority === filterPriority;
  });

  const priorityStyles = {
    P0: { badge: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30', dot: 'bg-[#EF4444]' },
    P1: { badge: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30', dot: 'bg-[#F59E0B]' },
    P2: { badge: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/30', dot: 'bg-[#007AFF]' },
    P3: { badge: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/30', dot: 'bg-[#64748B]' },
  };

  return (
    <div className="space-y-6">
      {/* 1. Habit Momentum Barometer */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#151922] p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#F59E0B]/15 text-[#F59E0B]">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Daily Habit Momentum
            </h3>
          </div>
          <span className="text-[11px] text-[#64748B]">Non-negotiables</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {habits.map((habit) => {
            const isCompleted = habit.completedDates.includes(today);
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabitToday(habit.id)}
                className={`group flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isCompleted
                    ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                    : 'border-[rgba(255,255,255,0.07)] bg-[#1D2330] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isCompleted ? 'bg-[#22C55E] text-black font-bold' : 'border border-[rgba(255,255,255,0.2)] bg-[#151922]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        isCompleted ? 'line-through text-[#94A3B8]' : 'text-[#F8FAFC]'
                      }`}
                    >
                      {habit.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#64748B]">
                      <span className="text-[#F59E0B] font-semibold flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {habit.currentStreak}d
                      </span>
                      <span>• Target {habit.targetDaysPerWeek}x/wk</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Today's Priority Queue */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#151922] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#007AFF]/15 text-[#007AFF]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Execution Queue
            </h3>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#1D2330] text-[#94A3B8]">
              {tasks.filter((t) => t.status !== 'completed').length} active
            </span>
          </div>

          {/* Priority filter pills */}
          <div className="flex items-center gap-1 bg-[#1D2330] p-0.5 rounded-lg border border-[rgba(255,255,255,0.06)]">
            {(['ALL', 'P0', 'P1', 'P2'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterPriority(filter)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
                  filterPriority === filter
                    ? 'bg-[#007AFF] text-white'
                    : 'text-[#64748B] hover:text-[#F8FAFC]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Task Add Input */}
        <form onSubmit={handleInlineAdd} className="mb-4">
          <div className="flex items-center gap-2 p-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1D2330] focus-within:border-[#007AFF] transition-all">
            <Plus className="w-4 h-4 text-[#64748B] ml-1" />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add next high-impact task... (Press Enter)"
              className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none"
            />
            <div className="flex items-center gap-1">
              {(['P0', 'P1', 'P2'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                    newPriority === p
                      ? 'bg-[#007AFF] text-white'
                      : 'text-[#64748B] hover:text-[#94A3B8]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Task Cards List */}
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const isDone = task.status === 'completed';
              const pStyle = priorityStyles[task.priority];

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'border-transparent bg-[#1D2330]/40 opacity-60'
                      : 'border-[rgba(255,255,255,0.06)] bg-[#1D2330] hover:border-[rgba(255,255,255,0.14)] hover:bg-[#242B3B]'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-[#22C55E] text-black font-bold'
                          : 'border border-[rgba(255,255,255,0.2)] bg-[#151922] group-hover:border-[#007AFF]'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium transition-all ${
                            isDone ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata Chips */}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${pStyle.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                          {task.priority}
                        </span>

                        {task.estimatedMinutes && (
                          <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
                            <Clock className="w-3 h-3" />
                            {task.estimatedMinutes}m
                          </span>
                        )}

                        {task.subtasks.length > 0 && (
                          <span className="text-[10px] text-[#64748B]">
                            {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length} subtasks
                          </span>
                        )}

                        {task.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 text-[9px] rounded font-medium bg-[#151922] text-[#8B5CF6] border border-[#8B5CF6]/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
