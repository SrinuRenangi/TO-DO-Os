import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Bell,
  Clock,
  Calendar,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  ExternalLink,
  Volume2,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { databaseService } from '@/services/database/database-service';
import { NotificationEntity } from '@/services/database/types';
import { formatDisplayDate } from '@/lib/utils';

export const DashboardView: React.FC = () => {
  const { setActiveModule, setQuickCaptureOpen } = useAppStore();
  
  // Real Service Stores
  const { tasks, toggleTaskStatus, addTask } = useTaskStore();
  const { reminders, snoozeReminder, dismissReminder, addReminder } = useReminderStore();
  const { notes, selectNote, createNote } = useNotesStore();
  const { events } = useCalendarStore();
  const { mode, remainingSeconds, isRunning, startTimer, pauseTimer, resetTimer, setMode } = useFocusStore();

  // Notification Feed from databaseService
  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Inline Quick Add inputs
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskTime, setQuickTaskTime] = useState('18:00');
  const [quickReminderTitle, setQuickReminderTitle] = useState('');
  const [quickReminderTime, setQuickReminderTime] = useState('18:00');

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    setNotifications(databaseService.getNotifications());
    return () => clearInterval(clock);
  }, []);

  const refreshNotifications = () => {
    setNotifications(databaseService.getNotifications());
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask(quickTaskTitle.trim(), 'P1', 'Engineering', undefined, quickTaskTime);
    setQuickTaskTitle('');
    refreshNotifications();
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReminderTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const [h, m] = quickReminderTime.split(':').map(Number);
    const trig = new Date();
    trig.setHours(h, m, 0, 0);

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(trig);

    addReminder(quickReminderTitle.trim(), trig.toISOString(), formattedTime, 'urgent');
    setQuickReminderTitle('');
    refreshNotifications();
  };

  const clearAllNotifications = () => {
    databaseService.clearNotifications();
    setNotifications([]);
  };

  // Filter Today's Tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.status === 'todo');
  const pendingTasks = tasks.filter((t) => t.status === 'todo');
  const activeReminders = reminders.filter((r) => !r.isTriggered);

  // Timer format
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const { weekday, monthDay } = formatDisplayDate(currentTime);
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* 1. Header Strip (Executive Personal OS Summary) */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827]/90 backdrop-blur-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                24/7 Daemon Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#4F8CFF] bg-[#4F8CFF]/15 border border-[#4F8CFF]/30">
                Pure Deterministic (Zero-AI)
              </span>
              <span className="text-xs text-[#94A3B8]">
                {weekday}, {monthDay}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#F8FAFC]">
              Personal OS <span className="text-[#4F8CFF] font-medium text-lg ml-2">Your Life. Your System. One Dashboard.</span>
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              Active command center: <span className="text-[#F8FAFC] font-semibold">{pendingTasks.length}</span> pending tasks,{' '}
              <span className="text-[#F8FAFC] font-semibold">{activeReminders.length}</span> scheduled reminders,{' '}
              <span className="text-[#F8FAFC] font-semibold">{notes.length}</span> persistent notes.
            </p>
          </div>

          {/* Live Chrono & Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-center px-5 py-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1A2333]/90 shadow-md">
              <span className="text-[9px] uppercase tracking-widest font-black text-[#64748B]">System Clock</span>
              <span className="text-xl font-mono font-bold tracking-wider text-[#F8FAFC] tabular-nums">
                {timeString}
              </span>
            </div>

            <button
              onClick={() => setActiveModule('tasks')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F8CFF] hover:bg-[#3b82f6] shadow-lg shadow-[#4F8CFF]/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Summary Grid: Today's Tasks & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TODAY'S TASKS (Real Tasks from taskService) */}
        <div className="lg:col-span-7 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F8FAFC]">Today's Tasks</h2>
                  <p className="text-[11px] text-[#94A3B8]">Direct from SQLite Task Engine</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModule('tasks')}
                className="flex items-center gap-1 text-xs font-semibold text-[#4F8CFF] hover:underline"
              >
                <span>All Tasks ({tasks.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Quick Add Task */}
            <form onSubmit={handleCreateTask} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="Add task e.g. Buy Medicine..."
                className="flex-1 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none focus:border-[#4F8CFF]/60"
              />
              <input
                type="time"
                value={quickTaskTime}
                onChange={(e) => setQuickTaskTime(e.target.value)}
                className="px-2 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs text-[#F8FAFC] outline-none"
              />
              <button
                type="submit"
                disabled={!quickTaskTitle.trim()}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#4F8CFF] hover:bg-[#3b82f6] disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Task List */}
            <div className="mt-4 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {todayTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  No tasks scheduled for today. Create one above!
                </div>
              ) : (
                todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#1A2333]/70 hover:bg-[#1A2333] transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          t.status === 'completed'
                            ? 'bg-[#22C55E] border-[#22C55E] text-black font-bold'
                            : 'border-[rgba(255,255,255,0.2)] hover:border-[#4F8CFF]'
                        }`}
                      >
                        {t.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="truncate">
                        <span
                          className={`text-xs font-medium block truncate ${
                            t.status === 'completed' ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'
                          }`}
                        >
                          {t.title}
                        </span>
                        {t.dueTime && (
                          <span className="text-[10px] text-[#94A3B8]">
                            Due at {t.dueTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          t.priority === 'P0'
                            ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                            : t.priority === 'P1'
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                            : 'bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/30'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* UPCOMING REMINDERS (Real Reminders from reminderService) */}
        <div className="lg:col-span-5 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F8FAFC]">Upcoming Reminders</h2>
                  <p className="text-[11px] text-[#94A3B8]">24/7 Background Alerting Engine</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModule('reminders')}
                className="flex items-center gap-1 text-xs font-semibold text-[#F59E0B] hover:underline"
              >
                <span>Reminders ({reminders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Set Reminder */}
            <form onSubmit={handleCreateReminder} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={quickReminderTitle}
                onChange={(e) => setQuickReminderTitle(e.target.value)}
                placeholder="Set reminder..."
                className="flex-1 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none focus:border-[#F59E0B]/60"
              />
              <input
                type="time"
                value={quickReminderTime}
                onChange={(e) => setQuickReminderTime(e.target.value)}
                className="px-2 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs text-[#F8FAFC] outline-none"
              />
              <button
                type="submit"
                disabled={!quickReminderTitle.trim()}
                className="px-3 py-2 rounded-xl text-xs font-bold text-black bg-[#F59E0B] hover:bg-[#d97706] disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Set</span>
              </button>
            </form>

            {/* Reminders Feed */}
            <div className="mt-4 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {reminders.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  No upcoming reminders. All caught up!
                </div>
              ) : (
                reminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#1A2333]/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#F8FAFC] block truncate">{r.title}</span>
                        <span className="text-[10px] text-[#4F8CFF] font-semibold">{r.dueTimeFormatted}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => snoozeReminder(r.id, 15)}
                        title="Snooze 15 minutes"
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#111827] text-[#94A3B8] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.06)]"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => dismissReminder(r.id)}
                        title="Complete reminder"
                        className="p-1 rounded-lg text-[#22C55E] hover:bg-[#22C55E]/15 border border-[rgba(255,255,255,0.06)]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Secondary Row: Running Timer, Calendar Snapshot & Recent Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* RUNNING TIMER (Real Timer Service) */}
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4F8CFF]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">System Timer</h3>
              </div>
              <button
                onClick={() => setActiveModule('timer')}
                className="text-[11px] font-semibold text-[#4F8CFF] hover:underline"
              >
                Open Full
              </button>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 rounded-xl bg-[#1A2333]">
              {(['pomodoro', 'countdown', 'stopwatch'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                    mode === m ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Big Timer Digits */}
            <div className="my-6 text-center">
              <div className="text-4xl font-mono font-bold tracking-tight text-[#F8FAFC] tabular-nums">
                {formattedTimer}
              </div>
              <div className="text-[11px] font-medium text-[#94A3B8] mt-1 capitalize">
                {isRunning ? '● Active Running in Background' : 'Paused (Wall-Clock Durable)'}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isRunning
                    ? 'bg-[#F59E0B] text-black hover:bg-[#d97706]'
                    : 'bg-[#4F8CFF] text-white hover:bg-[#3b82f6]'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onClick={resetTimer}
                className="p-2 rounded-xl bg-[#1A2333] hover:bg-[#21293C] text-[#94A3B8] hover:text-[#F8FAFC] border border-[rgba(255,255,255,0.06)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CALENDAR SNAPSHOT (Real Unified Items from calendarService) */}
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">Calendar Snapshot</h3>
              </div>
              <button
                onClick={() => setActiveModule('calendar')}
                className="text-[11px] font-semibold text-[#22C55E] hover:underline"
              >
                View Grid
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B]">No upcoming items scheduled.</div>
              ) : (
                events.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#1A2333]/70 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <span className="text-xs font-semibold text-[#F8FAFC] block truncate">{evt.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {evt.date} • {evt.startTime}
                      </span>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: evt.color || '#4F8CFF' }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RECENT NOTES (Real Notes from notesService) */}
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#A855F7]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">Recent Notes</h3>
              </div>
              <button
                onClick={() => setActiveModule('notes')}
                className="text-[11px] font-semibold text-[#A855F7] hover:underline"
              >
                All Notes ({notes.length})
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B]">No notes yet. Create your first!</div>
              ) : (
                notes.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      selectNote(n.id);
                      setActiveModule('notes');
                    }}
                    className="p-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#1A2333]/70 hover:bg-[#1A2333] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F8FAFC] truncate">{n.title}</span>
                      {n.pinned && <span className="text-[9px] text-[#F59E0B] font-bold">PINNED</span>}
                    </div>
                    <p className="text-[10px] text-[#94A3B8] truncate mt-1">
                      {n.content.replace(/[#*`\n]/g, ' ').slice(0, 60)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. NOTIFICATION & AUDIT FEED (Real SQLite Notification Log) */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <h3 className="text-sm font-bold text-[#F8FAFC]">System Notification Feed</h3>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-[11px] text-[#EF4444] hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2 max-h-[140px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#64748B]">
              No alerts in notification log. Native Windows notifications will appear here as they trigger.
            </div>
          ) : (
            notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className="p-2.5 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[#1A2333]/50 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-[#F8FAFC]">{notif.title}</span>
                  <span className="text-[#94A3B8] ml-2">{notif.body}</span>
                </div>
                <span className="text-[10px] text-[#64748B] tabular-nums shrink-0">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
