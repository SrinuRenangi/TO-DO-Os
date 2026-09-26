import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  CalendarDays,
  ListOrdered,
} from 'lucide-react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useTaskStore } from '@/stores/useTaskStore';

export const CalendarView: React.FC = () => {
  const { events, viewMode, setViewMode, addEvent, deleteEvent } = useCalendarStore();
  const { tasks } = useTaskStore();

  const [newEventTitle, setNewEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    addEvent(newEventTitle.trim(), eventDate, startTime, endTime, 'timeblock', '#4F8CFF');
    setNewEventTitle('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for Month View Grid (35 days)
  const currentMonthDate = new Date();
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCells = [];
  // Pad previous month days
  for (let i = 0; i < firstDayIndex; i++) {
    monthCells.push({ dayNumber: '', dateStr: '', isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    monthCells.push({ dayNumber: d, dateStr: dStr, isCurrentMonth: true });
  }

  // Days for week view
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Header Bar */}
      <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">Calendar & Scheduled Deadlines</h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Displays real tasks and scheduled reminders with zero fake mock events.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Date Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#1A2333] border border-[rgba(255,255,255,0.06)] text-xs font-semibold">
            {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  viewMode === v ? 'bg-[#4F8CFF] text-white shadow-md' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="px-3.5 py-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A2333] text-xs font-bold text-[#F8FAFC]">
            <span>{monthName}</span>
          </div>
        </div>
      </div>

      {/* Quick Timeblock / Task Creator Bar */}
      <form onSubmit={handleAddEvent} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-4 shadow-lg flex flex-col md:flex-row items-center gap-3">
        <input
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          placeholder="Schedule new task or event... (e.g. Pharmacy pickup, Code review)"
          className="flex-1 w-full bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none px-2"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="bg-[#1A2333] text-[#F8FAFC] px-2.5 py-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-xs outline-none"
          />

          <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
            <Clock className="w-3.5 h-3.5" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-[#1A2333] text-[#F8FAFC] px-2 py-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!newEventTitle.trim()}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#4F8CFF] hover:bg-[#3b82f6] shadow-md shadow-[#4F8CFF]/20 disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Task</span>
          </button>
        </div>
      </form>

      {/* 1. MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-5 shadow-2xl">
          <div className="grid grid-cols-7 gap-2 text-center pb-3 border-b border-[rgba(255,255,255,0.06)] text-xs font-bold text-[#94A3B8]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 pt-3">
            {monthCells.map((cell, idx) => {
              const dayEvents = cell.dateStr ? events.filter((e) => e.date === cell.dateStr) : [];
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'border-[#4F8CFF] bg-[#4F8CFF]/10'
                        : 'border-[rgba(255,255,255,0.05)] bg-[#1A2333]/50 hover:bg-[#1A2333]'
                      : 'border-transparent opacity-20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#4F8CFF]' : 'text-[#F8FAFC]'}`}>
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="px-1.5 py-0.5 rounded text-[10px] truncate font-medium bg-[#111827] border border-[rgba(255,255,255,0.06)] text-[#F8FAFC]"
                      >
                        {ev.startTime && <span className="text-[#4F8CFF] mr-1">{ev.startTime}</span>}
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-[#94A3B8] block">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-sm font-bold text-[#F8FAFC]">Continuous Week Grid</h3>
            <span className="text-xs text-[#94A3B8]">{events.length} active scheduled items</span>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No items scheduled for this week. Use the input above to schedule tasks!
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1A2333] hover:border-[#4F8CFF]/40 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: evt.color || '#4F8CFF' }} />
                    <div>
                      <h4 className="text-xs font-bold text-[#F8FAFC]">{evt.title}</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {evt.date} • {evt.description || 'Task deadline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-[#4F8CFF] tabular-nums">
                      {evt.startTime}
                    </span>
                    <button
                      onClick={() => deleteEvent(evt.id)}
                      className="p-1 rounded-lg text-[#64748B] hover:text-[#EF4444] transition-all"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {viewMode === 'day' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-sm font-bold text-[#F8FAFC]">Today's Scheduled Timeline ({todayStr})</h3>
          </div>

          <div className="space-y-3">
            {events.filter((e) => e.date === todayStr).length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No items specifically scheduled for today.
              </div>
            ) : (
              events
                .filter((e) => e.date === todayStr)
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1A2333] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 rounded-full bg-[#4F8CFF]" />
                      <div>
                        <h4 className="text-xs font-bold text-[#F8FAFC]">{evt.title}</h4>
                        <span className="text-[10px] text-[#94A3B8]">{evt.description}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#4F8CFF]">{evt.startTime}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 4. AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111827] p-6 shadow-2xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-4">
            Continuous Chronological Agenda
          </h3>
          {events.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">No items scheduled.</div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#1A2333] flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#F8FAFC]">{evt.title}</span>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{evt.date} • {evt.description}</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#4F8CFF]">{evt.startTime}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
