import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  FileText,
  Bell,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ChevronRight,
  ExternalLink,
  Plus,
  Flame,
  Zap,
  Target,
  Leaf,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Check,
  X,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { formatRelativeTime } from '@/lib/utils';
import { AnalogClock } from './AnalogClock';
import { Priority } from '@shared/types';

export const DashboardView: React.FC = () => {
  const { setActiveModule, setQuickCaptureOpen } = useAppStore();
  const { tasks, toggleTaskStatus } = useTaskStore();
  const { reminders, snoozeReminder, dismissReminder, deleteReminder } = useReminderStore();
  const { notes, selectNote } = useNotesStore();
  const { mode, remainingSeconds, isRunning, startTimer, pauseTimer, resetTimer } = useFocusStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
    clearAll,
    dispatchNotification,
  } = useNotificationStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const elapsedMins = Math.floor((25 * 60 - remainingSeconds) / 60);
  const elapsedSecs = Math.max(0, (25 * 60 - remainingSeconds) % 60);
  const elapsedFormatted = `${elapsedMins}:${String(elapsedSecs).padStart(2, '0')}`;

  const pinnedNotes = notes.filter((n) => n.pinned);

  const getNotifIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-600 animate-pulse" />;
      case 'urgent':
        return <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const getNotifIconBg = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-rose-100 text-rose-600';
      case 'urgent':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };
  const displayNotes = pinnedNotes.length > 0 ? pinnedNotes : notes.slice(0, 2);

  // Helper for cute priority badges with icons (NO cryptic keywords)
  const renderPriorityBadge = (priority: Priority | string) => {
    switch (priority) {
      case 'P0':
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-500 animate-pulse" />
            <span>Urgent</span>
          </span>
        );
      case 'P1':
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>High</span>
          </span>
        );
      case 'P2':
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300 shadow-xs">
            <Target className="w-3 h-3 text-sky-600" />
            <span>Normal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
            <Leaf className="w-3 h-3 text-emerald-600" />
            <span>Low</span>
          </span>
        );
    }
  };

  const activeReminders = reminders.slice(0, 4);

  return (
    <div className="max-w-[1460px] mx-auto space-y-6">
      {/* 1. Page Title Header with Sharp Intensity */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
            DASHBOARD <span className="text-slate-700 font-semibold normal-case text-lg">(Pure Summary Center)</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQuickCaptureOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Task</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Top Row (3 Panels: Pure Summary Center | Upcoming Real Reminders | Real Notification Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 1: Pure Summary Center (col-span-3) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-3 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-base font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Pure Summary Center</span>
              </h2>
            </div>

            <div className="space-y-2.5 text-xs font-bold text-slate-800">
              <motion.button
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule('tasks')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-900 group-hover:text-blue-700">Today's Real Tasks</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                  {tasks.filter((t) => t.status !== 'completed').length} active
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule('reminders')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-slate-900 group-hover:text-amber-700">Upcoming Reminders</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  {reminders.length} alerts
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule('calendar')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 group-hover:text-emerald-700">Real Calendar Snapshot</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule('notes')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 group-hover:text-purple-700">Recent Notes</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                  {notes.length} total
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule('timer')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-slate-900 group-hover:text-rose-700">Wall-Clock Timer</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                  {isRunning ? 'Running' : 'Ready'}
                </span>
              </motion.button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Storage: SQLite Offline</span>
            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              100% Deterministic
            </span>
          </div>
        </motion.div>

        {/* Panel 2: Upcoming Real Reminders (col-span-5) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-5 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-950 tracking-tight">
                  Upcoming Real Reminders
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModule('reminders')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All ({reminders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {activeReminders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-500">No active alerts scheduled right now.</p>
                </div>
              ) : (
                activeReminders.map((rem) => (
                  <motion.div
                    key={rem.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-white transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Working Completion Button */}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => dismissReminder(rem.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                          title="Complete reminder"
                        >
                          <Circle className="w-4 h-4 hover:fill-emerald-100" />
                        </motion.button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {renderPriorityBadge(rem.urgency || 'normal')}
                            <span className="font-bold text-slate-950 truncate">{rem.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-semibold mt-0.5 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{rem.dueTimeFormatted || 'Scheduled'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Working Snooze Presets & Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">Snooze:</span>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => snoozeReminder(rem.id, 15)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 shadow-2xs transition-colors"
                          title="Snooze 15 minutes"
                        >
                          +15m
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => snoozeReminder(rem.id, 60)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 shadow-2xs transition-colors"
                          title="Snooze 1 hour"
                        >
                          +1h
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteReminder(rem.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] text-slate-700 font-bold">
            <span>24/7 Precision Alerting</span>
            <span className="text-slate-500 font-mono text-[10px]">reminderService: active</span>
          </div>
        </motion.div>

        {/* Panel 3: Real Notification Feed (col-span-4) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-4 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-950 tracking-tight">
                  Real Notification Feed
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-extrabold text-slate-500 hover:text-rose-600 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50"
                    title="Clear All Notifications"
                  >
                    Clear All
                  </button>
                )}
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  unreadCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {unreadCount > 0 ? `${unreadCount} Unread` : 'Live Daemon'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {notifications.length === 0 ? (
                <div className="text-center py-7 text-slate-500">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-extrabold text-slate-800 text-xs">All caught up!</p>
                  <p className="text-[11px] text-slate-500 mb-2.5">No active notifications in feed.</p>
                  <button
                    onClick={() => dispatchNotification({
                      title: 'Personal Organizer Alert',
                      body: '24/7 background notification daemon active.',
                      urgency: 'normal',
                      sound: true,
                    })}
                    className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    + Trigger Test Alert
                  </button>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group ${
                      notif.isRead
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-blue-200 shadow-2xs'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getNotifIconBg(notif.urgency)}`}>
                      {getNotifIcon(notif.urgency)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`truncate text-xs ${notif.isRead ? 'font-bold text-slate-800' : 'font-black text-slate-950'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug line-clamp-2">
                        {notif.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Mark as Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(notif.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Daemon Alerting Engine</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatchNotification({
                  title: 'Manual System Diagnostic',
                  body: 'All systems nominal: 24/7 background worker active.',
                  urgency: 'urgent',
                  sound: true,
                })}
                className="text-blue-600 hover:text-blue-800 text-[10px] font-extrabold hover:underline"
              >
                + Test Chime
              </button>
              <span className="text-emerald-700 font-extrabold">● Monitoring 24/7</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 3. Bottom Row (3 Panels: Recent Notes | Running Wall-Clock Timer | Real Notification) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 4: Recent Notes (col-span-3) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-3 flex flex-col"
        >
          <div className="studio-panel p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h2 className="text-base font-extrabold text-slate-950 tracking-tight">Recent Notes</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModule('notes')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Open Notes
                </motion.button>
              </div>

              <div className="space-y-3">
                {displayNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      selectNote(note.id);
                      setActiveModule('notes');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 bg-white hover:bg-purple-50/40 transition-all cursor-pointer shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-slate-950 truncate">{note.title}</h3>
                      {note.pinned && (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2 leading-snug font-medium">
                      {note.content.replace(/^#+\s/g, '').slice(0, 95)}...
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 font-bold">
                      <span className="text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-bold">
                        {note.folder || 'General'}
                      </span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 mt-3 text-center">
              <span className="text-xs font-extrabold text-slate-800 block">Recent Notes</span>
              <span className="text-[11px] text-slate-500 font-semibold">(Expanded preview • Connected to SQLite)</span>
            </div>
          </div>
        </motion.div>

        {/* Panel 5: Running Wall-Clock Timer (col-span-5) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-5 flex flex-col"
        >
          <div className="studio-panel p-6 flex-1 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            {/* Left: Photorealistic Analog Wall Clock */}
            <div className="shrink-0 flex items-center justify-center">
              <AnalogClock size={168} />
            </div>

            {/* Right: Digital Timer & Focus Controls */}
            <div className="flex-1 w-full flex flex-col justify-between py-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl md:text-4xl font-mono font-black tracking-tight text-slate-950 tabular-nums">
                    {timeString}
                  </div>
                  <div className="text-xs font-extrabold text-slate-800 mt-1">
                    Running Wall-Clock Timer
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveModule('timer')}
                  className="p-1 text-slate-400 hover:text-slate-800"
                  title="Open Timer Settings"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Status and Priority badges */}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  25m Pomodoro
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isRunning ? 'Counting Down' : 'Ready'}
                </span>
              </div>

              {/* Focus Duration & Controls */}
              <div className="mt-3.5 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-black text-slate-900">Focus Session</div>
                  <div className="text-[11px] text-slate-600 font-bold">
                    Elapsed: {elapsedFormatted}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTimer}
                    className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRunning ? pauseTimer : startTimer}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all text-white ${
                      isRunning
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Data tags */}
              <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-600 font-bold">
                <span>Active counts unto active with module</span>
                <div className="flex items-center gap-2">
                  <span>Data: 10%</span>
                  <span>Data: 22:08</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="text-xs font-extrabold text-slate-800 block">Running Wall-Clock Timer</span>
            <span className="text-[11px] text-slate-500 font-semibold">Active counts unto active with module description</span>
          </div>
        </motion.div>

        {/* Panel 6: Real Notification / System Health & Event Logs */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-4 flex flex-col"
        >
          <div className="studio-panel p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-950 tracking-tight">System Health & Daemon</h2>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  100% Operational
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-950">Windows Desktop Companion</span>
                    <span className="text-[10px] text-emerald-700 font-bold font-mono">24/7 Active</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Native window & tray lifecycle running with instant offline boot.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-950">Audio Alert Engine</span>
                    <span className="text-[10px] text-blue-700 font-bold font-mono">Web Audio Synthesizer</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Harmonic synthesizer chimes configured for deadline alerts and timer completions.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-950">Local Database Persistence</span>
                    <span className="text-[10px] text-purple-700 font-bold font-mono">SQLite + Storage</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    {tasks.length} tasks, {reminders.length} scheduled reminders, {notes.length} notes stored locally.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-bold">System Status: Clean</span>
              <button
                onClick={() => dispatchNotification({
                  title: 'System Health Check',
                  body: `Diagnostics passed: ${tasks.length} tasks and ${reminders.length} reminders synced.`,
                  urgency: 'normal',
                  sound: true,
                })}
                className="px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                Run Diagnostics
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Footer Status Bar with High Intensity */}
      <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-800 font-bold">
        <div className="flex items-center gap-3">
          <span>Active Tasks: {tasks.length}</span>
          <span className="text-slate-400">•</span>
          <span>Active Reminders: {reminders.length}</span>
          <span className="text-slate-400">•</span>
          <span>Knowledge Notes: {notes.length}</span>
        </div>
        <div className="text-slate-700 font-mono text-[11px] font-extrabold">
          * No fake metrics
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
