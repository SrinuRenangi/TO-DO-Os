import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckSquare,
  Clock,
  ChevronRight,
  Plus,
  Flame,
  Zap,
  Target,
  Leaf,
  Trash2,
  CheckCircle2,
  Circle,
  Check,
  X,
  CalendarDays,
  Pin,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { formatRelativeTime } from '@/lib/utils';
import { AnalogClock } from './AnalogClock';
import { Priority } from '@shared/types';
import { eventsService } from '@/services/events/events-service';

export const DashboardView: React.FC = () => {
  const { setActiveModule, setQuickCaptureOpen } = useAppStore();
  const { tasks, toggleTaskStatus } = useTaskStore();
  const { reminders, snoozeReminder, dismissReminder, deleteReminder } = useReminderStore();
  const { notes, selectNote } = useNotesStore();
  const {
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
    clearAll,
  } = useNotificationStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [snapshotTab, setSnapshotTab] = useState<'tasks' | 'events'>('tasks');
  const [calendarFilter, setCalendarFilter] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customCalendarDate, setCustomCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
  
  const tomorrowDate = new Date(currentTime);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

  const selectedCalendarDate =
    calendarFilter === 'today' ? todayStr : calendarFilter === 'tomorrow' ? tomorrowStr : customCalendarDate;

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed');
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const displayTasks = todayTasks.length > 0 ? todayTasks : activeTasks.slice(0, 5);

  const dashboardNotes = useMemo(() => {
    return notes
      .filter((n) => (n.showOnDashboard !== undefined ? n.showOnDashboard : n.pinned))
      .slice(0, 5);
  }, [notes]);

  const activeReminders = reminders.slice(0, 4);

  const snapshotTasksForSelectedDate = useMemo(() => {
    return tasks.filter((t) => {
      if (t.dueDate === selectedCalendarDate) return true;
      if (t.recurring === 'daily' && t.dueDate && t.dueDate <= selectedCalendarDate) {
        return true;
      }
      return false;
    });
  }, [tasks, selectedCalendarDate]);

  const snapshotEventsForSelectedDate = useMemo(() => {
    return eventsService.getEventsForDate(selectedCalendarDate);
  }, [selectedCalendarDate]);

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

  const renderPriorityBadge = (priority?: Priority | string) => {
    switch (priority) {
      case 'P0':
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-500" />
            <span>P0 Critical</span>
          </span>
        );
      case 'P1':
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
            <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
            <span>P1 High</span>
          </span>
        );
      case 'P2':
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-900 border border-sky-200">
            <Target className="w-2.5 h-2.5 text-sky-600" />
            <span>P2 Normal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <Leaf className="w-2.5 h-2.5 text-emerald-600" />
            <span>P3 Low</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1460px] mx-auto space-y-6">
      {/* 1. Header with Clean Minimal Aesthetic */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            CONTROL CENTER
          </h1>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Personal OS Desktop Companion
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setQuickCaptureOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Task</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Top Row (3 Panels: Today's Tasks | Upcoming Reminders | Real Notification Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 1: Today's Tasks (col-span-4) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-4 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Today's Tasks</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModule('tasks')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <span>View All ({activeTasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {displayTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                  <p className="font-extrabold text-slate-800 text-xs">All clear</p>
                  <p className="text-[11px] text-slate-500">No active tasks pending for today.</p>
                </div>
              ) : (
                displayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                        title="Mark complete"
                      >
                        <Circle className="w-4 h-4 hover:fill-emerald-100" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate text-xs">{task.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {task.dueTime ? `Due at ${task.dueTime}` : task.dueDate || 'Today'}
                        </p>
                      </div>
                    </div>
                    {renderPriorityBadge(task.priority)}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Active: {activeTasks.length} tasks</span>
            <button
              onClick={() => setActiveModule('tasks')}
              className="text-blue-600 hover:text-blue-800 text-[10px] font-extrabold hover:underline"
            >
              Open Task Engine
            </button>
          </div>
        </motion.div>

        {/* Panel 2: Upcoming Real Reminders (col-span-4) */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-4 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Upcoming Reminders
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModule('reminders')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <span>View All ({reminders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {activeReminders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                  <p className="font-extrabold text-slate-800 text-xs">No active alerts</p>
                  <p className="text-[11px] text-slate-500">All scheduled alerts delivered.</p>
                </div>
              ) : (
                activeReminders.map((rem) => (
                  <motion.div
                    key={rem.id}
                    layout
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-white transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => dismissReminder(rem.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                          title="Complete reminder"
                        >
                          <Circle className="w-4 h-4 hover:fill-emerald-100" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {renderPriorityBadge(rem.urgency || 'normal')}
                            <span className="font-bold text-slate-900 truncate">{rem.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{rem.dueTimeFormatted || 'Scheduled'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => snoozeReminder(rem.id, 15)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 transition-colors"
                          title="Snooze 15 minutes"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => deleteReminder(rem.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] text-slate-600 font-bold">
            <span>24/7 Precision Alerting</span>
            <span className="text-emerald-600 font-mono text-[10px]">● Daemon Active</span>
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
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Notification Feed
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-extrabold text-slate-500 hover:text-rose-600 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50"
                  >
                    Clear All
                  </button>
                )}
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  unreadCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {unreadCount > 0 ? `${unreadCount} Unread` : 'All Read'}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                  <p className="font-extrabold text-slate-800 text-xs">No notifications</p>
                  <p className="text-[11px] text-slate-500">All alerts cleared.</p>
                </div>
              ) : (
                notifications.slice(0, 4).map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      notif.isRead
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-blue-200 shadow-2xs'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getNotifIconBg(notif.urgency)}`}>
                      {getNotifIcon(notif.urgency)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`truncate text-xs ${notif.isRead ? 'font-bold text-slate-800' : 'font-black text-slate-900'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-1 leading-snug">
                        {notif.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Mark Read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(notif.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Action Center Bridge</span>
            <span className="text-slate-500 font-mono text-[10px]">Windows Native</span>
          </div>
        </motion.div>

      </div>

      {/* 3. Bottom Row (3 Panels: Calendar Snapshot | Desk Clock | Pinned Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 4: Calendar Snapshot (col-span-4) with Day Filter (Today / Tomorrow / Custom) and Tabs [Tasks] vs [Events] */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-4 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Calendar Snapshot</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Segmented Tab: Tasks vs Events */}
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setSnapshotTab('tasks')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      snapshotTab === 'tasks'
                        ? 'bg-white shadow-2xs text-blue-700 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setSnapshotTab('events')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      snapshotTab === 'events'
                        ? 'bg-white shadow-2xs text-purple-700 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Events
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModule(snapshotTab === 'tasks' ? 'tasks' : 'calendar')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                >
                  <span>{snapshotTab === 'tasks' ? 'Tasks' : 'Calendar'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Quick Day Filter Buttons */}
            <div className="flex items-center gap-1.5 mb-3">
              <button
                onClick={() => setCalendarFilter('today')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarFilter === 'today'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setCalendarFilter('tomorrow')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  calendarFilter === 'tomorrow'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tomorrow
              </button>
              <div className="relative">
                <input
                  type="date"
                  value={customCalendarDate}
                  onChange={(e) => {
                    setCustomCalendarDate(e.target.value);
                    setCalendarFilter('custom');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold border transition-all ${
                    calendarFilter === 'custom'
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 text-xs">
              {snapshotTab === 'tasks' ? (
                snapshotTasksForSelectedDate.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckSquare className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <p className="font-bold text-xs text-slate-700">No tasks for {calendarFilter === 'today' ? 'today' : calendarFilter === 'tomorrow' ? 'tomorrow' : selectedCalendarDate}</p>
                    <p className="text-[10px] text-slate-500">Task list is clear and focused.</p>
                  </div>
                ) : (
                  snapshotTasksForSelectedDate.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setActiveModule('tasks')}
                      className="p-2.5 rounded-xl border border-blue-100 bg-white hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <p className="font-bold text-slate-900 truncate text-xs">{task.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium pl-5">
                          {task.dueTime ? `${task.dueTime} • ` : ''}
                          <span>Task</span>
                          {task.recurring && task.recurring !== 'none' && (
                            <span className="ml-1 text-blue-600 font-semibold">• Daily ({task.recurring})</span>
                          )}
                        </p>
                      </div>
                      {renderPriorityBadge(task.priority)}
                    </div>
                  ))
                )
              ) : (
                snapshotEventsForSelectedDate.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CalendarIcon className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <p className="font-bold text-xs text-slate-700">No events for {calendarFilter === 'today' ? 'today' : calendarFilter === 'tomorrow' ? 'tomorrow' : selectedCalendarDate}</p>
                    <p className="text-[10px] text-slate-500">Calendar schedule is open.</p>
                  </div>
                ) : (
                  snapshotEventsForSelectedDate.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setActiveModule('calendar')}
                      className="p-2.5 rounded-xl border border-purple-100 bg-white hover:bg-purple-50/40 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: evt.color || '#8B5CF6' }} />
                          <p className="font-bold text-slate-900 truncate text-xs">{evt.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium pl-4">
                          {evt.isAllDay ? 'All Day' : `${evt.startTime} - ${evt.endTime}`} •{' '}
                          <span className="capitalize font-semibold text-purple-700">{evt.category}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 capitalize">
                        {evt.category}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Filter: <strong className="text-blue-700 capitalize">{calendarFilter}</strong></span>
            <span className="text-slate-600 font-bold capitalize">
              {snapshotTab === 'tasks' ? `${snapshotTasksForSelectedDate.length} Tasks` : `${snapshotEventsForSelectedDate.length} Events`}
            </span>
          </div>
        </motion.div>

        {/* Panel 5: Desk Clock (col-span-5) — Clean Clock Only, Zero Timer Clutter */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-5 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Clock</h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Wall-Clock
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
              <div className="shrink-0 flex items-center justify-center">
                <AnalogClock size={145} />
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="text-3xl md:text-4xl font-mono font-black tracking-tight text-slate-950 tabular-nums">
                  {timeString}
                </div>
                <div className="text-sm font-bold text-slate-700">
                  {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Local System Synchronized Time
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Desktop Timekeeper</span>
            <span className="text-emerald-700 font-bold">● High Accuracy</span>
          </div>
        </motion.div>

        {/* Panel 6: Dashboard Notes (col-span-3) — Only Notes with Show On Dashboard Enabled */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="lg:col-span-3 studio-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-purple-600" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Dashboard Notes
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModule('notes')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Notes Module
              </motion.button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {dashboardNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <Pin className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <p className="font-bold text-slate-700">No notes on dashboard</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enable &quot;Show On Dashboard&quot; in the Notes module to keep priority notes visible here.
                  </p>
                </div>
              ) : (
                dashboardNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      selectNote(note.id);
                      setActiveModule('notes');
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 border-l-3 border-l-purple-500 bg-white hover:bg-purple-50/30 transition-all cursor-pointer shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{note.title || 'Untitled Note'}</h3>
                      <span className="text-[9px] font-extrabold text-purple-700 bg-purple-100 px-1 rounded flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" />
                        <span>{note.pinned ? 'Pinned' : 'Dashboard'}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-1">
                      {(note.content || '').replace(/^#+\s/g, '').slice(0, 70)}...
                    </p>
                    <div className="text-[9px] text-slate-400 font-bold">
                      {note.folder || 'Personal'} • {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Knowledge Quick-View</span>
            <span className="text-slate-500 text-[10px]">
              {dashboardNotes.length} on dashboard
            </span>
          </div>
        </motion.div>

      </div>

      {/* 4. Footer Status Bar with Real Telemetry */}
      <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700 font-semibold">
        <div className="flex items-center gap-3">
          <span>Active Tasks: <strong className="text-slate-900">{activeTasks.length}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Scheduled Alerts: <strong className="text-slate-900">{reminders.length}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Notes: <strong className="text-slate-900">{notes.length}</strong></span>
        </div>
        <div className="text-slate-600 font-mono text-[11px]">
          SQLite WAL • 100% Offline Durability
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
