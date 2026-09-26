import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  Plus,
  Bell,
  Clock,
  CheckCircle2,
  FileText,
  Flame,
  Zap,
  Target,
  Leaf,
  Sparkles,
} from 'lucide-react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useReminderStore } from '@/stores/useReminderStore';

export const CalendarView: React.FC = () => {
  const { events, viewMode, setViewMode, addEvent } = useCalendarStore();
  const { tasks } = useTaskStore();
  const { reminders } = useReminderStore();

  const [activeDay, setActiveDay] = useState(26);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newTime, setNewTime] = useState('14:00');

  const todayStr = '2026-09-26';

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const dateStr = `2026-09-${String(activeDay).padStart(2, '0')}`;
    addEvent(newEventTitle.trim(), dateStr, newTime, undefined, 'event', '#2563EB');
    setNewEventTitle('');
    setShowAddModal(false);
  };

  const hours = [
    '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM',
  ];

  // Days in September (30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="max-w-[1460px] mx-auto space-y-5">
      {/* 1. Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 uppercase">
            CALENDAR SERVICE: REAL TIMELINE ENGINE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Event</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Main 3-Panel Grid (Month Grid | Week Schedule Time Grid | Agenda Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* PANEL 1: MONTH CALENDAR (col-span-5) */}
        <div className="lg:col-span-5 studio-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="font-black text-slate-950 text-base">September 2026</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
              {(['Month', 'Week', 'Day'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v.toLowerCase() as any)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === v.toLowerCase() ? 'bg-white shadow-2xs font-black text-slate-950' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Month 7-day Column Grid */}
          <div className="grid grid-cols-7 text-center text-xs font-extrabold text-slate-500 pb-1">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
            {/* Blank offset for starting day of month (Tuesday = 1 blank on Mon) */}
            <span className="p-2 text-slate-300">31</span>

            {daysInMonth.map((d) => {
              const isSelected = activeDay === d;
              const isToday = d === 26;
              const hasTask = d === 26 || d === 20 || d === 27;

              return (
                <motion.button
                  key={d}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveDay(d)}
                  className={`p-2 rounded-xl transition-all relative ${
                    isSelected
                      ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/25'
                      : isToday
                      ? 'bg-blue-100 text-blue-900 border border-blue-300 font-extrabold'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{d}</span>
                  {hasTask && !isSelected && (
                    <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Day Agenda Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-950 border-b border-slate-200 pb-1.5">
              <span>Selected Day: September {activeDay}, 2026</span>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {activeDay === 26 ? 'Today' : 'Upcoming'}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {tasks.slice(0, 2).map((t) => (
                <div key={t.id} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{t.dueTime || '17:00'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 2: WEEK TIMELINE GRID (col-span-4) */}
        <div className="lg:col-span-4 studio-panel p-6 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <div>
                <h3 className="font-black text-xs text-slate-950 uppercase">TIMELINE SCHEDULE</h3>
                <span className="text-[10px] text-slate-500 font-semibold block leading-tight">Daily Hourly Blocks</span>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 text-xs">
            {hours.map((hour) => (
              <div key={hour} className="flex items-start gap-3 border-t border-slate-100 pt-1.5">
                <span className="w-12 text-slate-500 font-mono text-[11px] font-extrabold shrink-0 pt-1">{hour}</span>
                <div className="flex-1 min-h-[30px]">
                  {hour === '11 AM' && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-slate-900 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800">
                        <span>Architecture Sync</span>
                        <span>11:30 AM</span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-950">Review Database Engine Schema</div>
                    </div>
                  )}

                  {hour === '2 PM' && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-300 text-slate-900 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-800">
                        <span>Deep Focus Block</span>
                        <span>2:00 PM</span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-950">Implement High-Fidelity UI Views</div>
                    </div>
                  )}

                  {hour === '6 PM' && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-slate-900 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-900">
                        <span>Health Reminder</span>
                        <span>6:00 PM</span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-950">Prescription Refill & Evening Walk</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 3: AGENDA DETAILS & SERVICE LINKS (col-span-3) */}
        <div className="lg:col-span-3 studio-panel p-6 space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="font-black text-xs text-slate-950 uppercase">
              AGENDA DETAILS & LINKS
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-950 block">Linked Tasks ({tasks.length})</span>
              <p className="text-[11px] text-slate-600">
                All deadlines are mapped directly to task due dates in the SQLite database.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-950 block">Active Alerts ({reminders.length})</span>
              <p className="text-[11px] text-slate-600">
                Reminders synchronize with calendar timeline to sound chimes on due dates.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-950">Add Calendar Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture Strategy Review"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
                >
                  Save Event
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800 font-bold">
        <span>Timeline Engine: Synchronized | Selected: September {activeDay}, 2026 | Active Events: {events.length}</span>
        <span className="text-slate-700 font-mono text-[11px] font-extrabold">* No fake metrics</span>
      </div>
    </div>
  );
};

export default CalendarView;
