// ============================================================================
// Personal OS — Calendar Service Rebuild (Pure Deterministic Engine)
// 100% Real SQLite Tasks & Events & Reminders Integration (Decoupled Tables)
// Interactive Month Grid, 7-Day Week, 24-Hour Day, and Chronological Agenda Views
// ============================================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Target,
  Leaf,
  Sparkles,
  LayoutGrid,
  Columns,
  Square,
  ListTodo,
  Search,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  X,
} from 'lucide-react';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useReminderStore } from '@/stores/useReminderStore';
import { calendarService } from '@/services/calendar/calendar-service';
import { taskService } from '@/services/tasks/task-service';
import { Priority } from '@shared/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CalendarView: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    entityFilter,
    setEntityFilter,
    selectedDate,
    setSelectedDate,
    currentYear,
    currentMonth,
    navigatePrevious,
    navigateNext,
    jumpToToday,
    addEvent,
    searchQuery,
    setSearchQuery,
  } = useCalendarStore();

  const { tasks, toggleTaskStatus } = useTaskStore();
  const { reminders, dismissReminder } = useReminderStore();

  // Create Event Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'event' | 'task'>('event');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => selectedDate);
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventEndTime, setNewEventEndTime] = useState('11:00');
  const [newEventCategory, setNewEventCategory] = useState<'meeting' | 'appointment' | 'conference' | 'special'>('meeting');
  const [newEventPriority, setNewEventPriority] = useState<Priority>('P2');

  // Expand Day Overlay State
  const [expandedDayDate, setExpandedDayDate] = useState<string | null>(null);

  // Live Current Time Ticker for Day/Week Red Line
  const [currentTime, setCurrentTime] = useState(new Date());
  const weekScrollRef = useRef<HTMLDivElement>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll timeline to current hour or 8 AM on mount
  useEffect(() => {
    const targetScroll = Math.max(0, (currentTime.getHours() - 1) * 60);
    if (weekScrollRef.current) weekScrollRef.current.scrollTop = targetScroll;
    if (dayScrollRef.current) dayScrollRef.current.scrollTop = targetScroll;
  }, [viewMode]);

  // Aggregate Real Unified Calendar Items filtered by entityFilter
  const unifiedItems = useMemo(() => {
    let items = calendarService.getUnifiedItems();
    if (entityFilter === 'tasks') {
      items = items.filter((i) => i.sourceType === 'task');
    } else if (entityFilter === 'events') {
      items = items.filter((i) => i.sourceType === 'event');
    } else if (entityFilter === 'reminders') {
      items = items.filter((i) => i.sourceType === 'reminder');
    }
    return items;
  }, [tasks, reminders, entityFilter]);

  // Format Dynamic Header Title based on View Mode
  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    }

    if (viewMode === 'week') {
      const weekCols = calendarService.getWeekDays(selectedDate);
      const start = weekCols[0];
      const end = weekCols[6];
      const startMonth = MONTH_NAMES[new Date(start.dateStr).getMonth()].slice(0, 3);
      const endMonth = MONTH_NAMES[new Date(end.dateStr).getMonth()].slice(0, 3);

      if (startMonth === endMonth) {
        return `${startMonth} ${start.dayNumber} – ${end.dayNumber}, ${currentYear}`;
      }
      return `${startMonth} ${start.dayNumber} – ${endMonth} ${end.dayNumber}, ${currentYear}`;
    }

    if (viewMode === 'day') {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    return 'Agenda Schedule';
  }, [viewMode, currentYear, currentMonth, selectedDate]);

  // Expanded Day Formatted Title
  const expandedDayTitle = useMemo(() => {
    if (!expandedDayDate) return '';
    const [y, m, d] = expandedDayDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [expandedDayDate]);

  // Handle Event / Task Creation
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    if (scheduleType === 'event') {
      addEvent(
        newEventTitle.trim(),
        newEventDate || selectedDate,
        newEventTime || '09:00',
        newEventEndTime || '10:00',
        newEventCategory
      );
    } else {
      taskService.createTask({
        title: newEventTitle.trim(),
        dueDate: newEventDate || selectedDate,
        dueTime: newEventTime || undefined,
        priority: newEventPriority,
      });
      useTaskStore.getState().refreshTasks();
      useCalendarStore.getState().refreshEvents();
    }

    setNewEventTitle('');
    setShowAddModal(false);
  };

  const openAddModalForDate = (dateStr: string, timeStr?: string) => {
    setNewEventDate(dateStr);
    if (timeStr) {
      setNewEventTime(timeStr);
      const [h, m] = timeStr.split(':').map(Number);
      const endH = String((h + 1) % 24).padStart(2, '0');
      setNewEventEndTime(`${endH}:${String(m).padStart(2, '0')}`);
    }
    setShowAddModal(true);
  };

  // Priority Badge Helper
  const renderPriorityBadge = (p?: Priority) => {
    switch (p) {
      case 'P0':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-500" />
            <span>P0</span>
          </span>
        );
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
            <span>P1</span>
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            <Target className="w-2.5 h-2.5 text-blue-600" />
            <span>P2</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Leaf className="w-2.5 h-2.5 text-emerald-600" />
            <span>P3</span>
          </span>
        );
    }
  };

  // Month Grid Data
  const monthGrid = useMemo(() => {
    return calendarService.getMonthGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Week Grid Data
  const weekDays = useMemo(() => {
    return calendarService.getWeekDays(selectedDate);
  }, [selectedDate]);

  // Hourly Slots Data
  const hourlySlots = useMemo(() => {
    return calendarService.getHourlySlots();
  }, []);

  // Today String
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className="max-w-[1460px] mx-auto space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <span>{headerTitle}</span>
            </h1>
            <span className="text-[11px] font-bold text-slate-500">
              Personal OS • Real SQLite Timeline Engine
            </span>
          </div>
        </div>

        {/* Action Controls: Navigation, Filters & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Entity Filters: All / Tasks / Events / Reminders */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setEntityFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                entityFilter === 'all'
                  ? 'bg-white shadow-2xs font-black text-slate-950 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setEntityFilter('tasks')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                entityFilter === 'tasks'
                  ? 'bg-white shadow-2xs font-black text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <CheckSquare className="w-3 h-3 text-blue-600" />
              <span>Tasks</span>
            </button>
            <button
              onClick={() => setEntityFilter('events')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                entityFilter === 'events'
                  ? 'bg-white shadow-2xs font-black text-purple-700 border border-purple-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <CalendarIcon className="w-3 h-3 text-purple-600" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setEntityFilter('reminders')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                entityFilter === 'reminders'
                  ? 'bg-white shadow-2xs font-black text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Bell className="w-3 h-3 text-emerald-600" />
              <span>Reminders</span>
            </button>
          </div>

          {/* Previous / Today / Next Navigation Controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-xl shadow-2xs">
            <button
              onClick={navigatePrevious}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1 text-xs font-black text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white shadow-2xs font-black text-slate-950 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white shadow-2xs font-black text-slate-950 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white shadow-2xs font-black text-slate-950 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Day</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white shadow-2xs font-black text-slate-950 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Add Item Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setNewEventDate(selectedDate);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Task</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Main View Container */}
      <div className="studio-panel p-5 overflow-hidden">
        {/* VIEW 1: MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="space-y-2">
            {/* Weekday Header Columns */}
            <div className="grid grid-cols-7 text-center text-xs font-black text-slate-600 pb-2 border-b border-slate-200">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* 35 or 42 Days Month Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthGrid.map((cell) => {
                const dayItems = unifiedItems.filter((i) => i.date === cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-[110px] md:min-h-[125px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                        : cell.isCurrentMonth
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        : 'bg-slate-50/70 border-slate-100 text-slate-400'
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          cell.isToday
                            ? 'bg-blue-600 text-white shadow-xs'
                            : cell.isCurrentMonth
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Quick Add Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddModalForDate(cell.dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 rounded transition-opacity"
                        title="Add item on this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day's Items Stack */}
                    <div className="space-y-1 my-1 flex-1 overflow-hidden">
                      {dayItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDayDate(cell.dateStr);
                          }}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                            item.sourceType === 'task'
                              ? item.isCompleted
                                ? 'bg-slate-100 text-slate-400 line-through'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                              : item.sourceType === 'event'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                          title={`${item.title} — click to view day schedule`}
                        >
                          {item.sourceType === 'event' ? (
                            <CalendarIcon className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                          ) : item.sourceType === 'reminder' ? (
                            <Bell className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          ) : (
                            <CheckSquare className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}

                      {dayItems.length > 3 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDayDate(cell.dateStr);
                          }}
                          className="w-full text-left text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-md transition-colors flex items-center justify-between shadow-2xs"
                        >
                          <span>+{dayItems.length - 3} more</span>
                          <span className="text-[9px] text-blue-500 font-extrabold uppercase">Expand</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Status / Count */}
                    <div className="text-[9px] font-bold text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                      {dayItems.length > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDayDate(cell.dateStr);
                          }}
                          className="hover:text-blue-600 font-black transition-colors"
                        >
                          {dayItems.length} {dayItems.length === 1 ? 'item' : 'items'}
                        </button>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: 7-DAY WEEK VIEW */}
        {viewMode === 'week' && (
          <div className="space-y-3">
            {/* Week Header with Days */}
            <div className="grid grid-cols-7 gap-2 pb-2 border-b border-slate-200 text-center">
              {weekDays.map((col) => (
                <div
                  key={col.dateStr}
                  onClick={() => setSelectedDate(col.dateStr)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    col.isToday
                      ? 'bg-blue-600 text-white shadow-xs border-blue-600'
                      : selectedDate === col.dateStr
                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                    {col.dayName}
                  </div>
                  <div className="text-lg font-black">{col.dayNumber}</div>
                </div>
              ))}
            </div>

            {/* Scrollable Hourly Week Grid */}
            <div ref={weekScrollRef} className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
              {hourlySlots.map((slot) => {
                const hourPrefix = `${String(slot.hour).padStart(2, '0')}:`;

                return (
                  <div key={slot.hour} className="grid grid-cols-7 gap-2 items-start border-t border-slate-100 pt-1.5">
                    {weekDays.map((col) => {
                      const slotItems = unifiedItems.filter(
                        (i) => i.date === col.dateStr && i.time && i.time.startsWith(hourPrefix)
                      );

                      return (
                        <div
                          key={col.dateStr}
                          onClick={() => openAddModalForDate(col.dateStr, slot.timeStr)}
                          className="min-h-[46px] p-1 rounded-xl bg-slate-50/50 hover:bg-blue-50/40 border border-dashed border-slate-200 transition-colors space-y-1 cursor-pointer"
                        >
                          {slotItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={(e) => e.stopPropagation()}
                              className={`p-1.5 rounded-lg text-[10px] font-bold shadow-2xs space-y-0.5 ${
                                item.sourceType === 'task'
                                  ? item.isCompleted
                                    ? 'bg-slate-100 text-slate-400 line-through'
                                    : 'bg-white border-l-4 border-l-blue-600 border border-slate-200 text-slate-900'
                                  : item.sourceType === 'event'
                                  ? 'bg-white border-l-4 border-l-purple-600 border border-slate-200 text-slate-900'
                                  : 'bg-white border-l-4 border-l-emerald-600 border border-slate-200 text-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] text-slate-600">{item.time}</span>
                                {item.priority && renderPriorityBadge(item.priority)}
                              </div>
                              <div className="truncate font-black text-slate-950">{item.title}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: 24-HOUR DAY VIEW */}
        {viewMode === 'day' && (
          <div className="space-y-4">
            {/* Day Header Status */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span className="font-black text-slate-950">
                  Timeline for {headerTitle}
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-blue-800 bg-white px-2.5 py-1 rounded-full border border-blue-200">
                {unifiedItems.filter((i) => i.date === selectedDate).length} Scheduled Items
              </span>
            </div>

            {/* Scrollable 24-Hour Timeline */}
            <div ref={dayScrollRef} className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
              {hourlySlots.map((slot) => {
                const hourPrefix = `${String(slot.hour).padStart(2, '0')}:`;
                const slotItems = unifiedItems.filter(
                  (i) => i.date === selectedDate && i.time && i.time.startsWith(hourPrefix)
                );

                return (
                  <div key={slot.hour} className="flex items-start gap-4 border-t border-slate-200 pt-2 min-h-[64px]">
                    {/* Time Label */}
                    <span className="w-16 font-mono text-xs font-black text-slate-600 shrink-0 pt-1">
                      {slot.label}
                    </span>

                    {/* Event Slot */}
                    <div className="flex-1 space-y-2">
                      {slotItems.length === 0 ? (
                        <div
                          onClick={() => openAddModalForDate(selectedDate, slot.timeStr)}
                          className="h-10 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 flex items-center px-3 text-slate-600 hover:text-blue-600 text-xs font-bold cursor-pointer transition-all"
                        >
                          + Click to schedule at {slot.label}
                        </div>
                      ) : (
                        slotItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                              item.sourceType === 'task'
                                ? item.isCompleted
                                  ? 'bg-slate-50 border-slate-200 text-slate-400'
                                  : 'bg-white border-blue-200 shadow-xs border-l-4 border-l-blue-600'
                                : item.sourceType === 'event'
                                ? 'bg-purple-50/50 border-purple-200 shadow-xs border-l-4 border-l-purple-600'
                                : 'bg-emerald-50/50 border-emerald-200 shadow-xs border-l-4 border-l-emerald-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Task / Event / Reminder Action Icon */}
                              {item.sourceType === 'task' ? (
                                <button
                                  onClick={() => toggleTaskStatus(item.sourceId)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                  {item.isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>
                              ) : item.sourceType === 'event' ? (
                                <CalendarIcon className="w-5 h-5 text-purple-600" />
                              ) : (
                                <button
                                  onClick={() => dismissReminder(item.sourceId)}
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <Bell className="w-5 h-5" />
                                </button>
                              )}

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-black ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                                    {item.title}
                                  </span>
                                  {item.priority && renderPriorityBadge(item.priority)}
                                </div>
                                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                  {item.sourceType === 'task' ? 'Task Deadline' : item.sourceType === 'event' ? `Calendar Event (${item.category || 'Meeting'})` : 'Native Reminder'} • {item.formattedTime}
                                </div>
                              </div>
                            </div>

                            <span className="text-[11px] font-mono font-bold text-slate-500">
                              {item.time}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: CHRONOLOGICAL AGENDA VIEW */}
        {viewMode === 'agenda' && (
          <div className="space-y-4">
            {/* Search Input for Agenda */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search upcoming schedule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            {/* Agenda List Grouped Chronologically */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {(() => {
                const agendaItems = calendarService.getAgendaItems(searchQuery).filter((i) => {
                  if (entityFilter === 'tasks') return i.sourceType === 'task';
                  if (entityFilter === 'events') return i.sourceType === 'event';
                  if (entityFilter === 'reminders') return i.sourceType === 'reminder';
                  return true;
                });

                if (agendaItems.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <CalendarCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
                      <p className="font-extrabold text-slate-800 text-sm">All caught up!</p>
                      <p className="text-xs text-slate-500">No scheduled items found.</p>
                    </div>
                  );
                }

                return agendaItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl bg-white border hover:border-slate-300 shadow-2xs flex items-center justify-between transition-all ${
                      item.sourceType === 'task'
                        ? 'border-l-4 border-l-blue-600 border-slate-200'
                        : item.sourceType === 'event'
                        ? 'border-l-4 border-l-purple-600 border-slate-200'
                        : 'border-l-4 border-l-emerald-600 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.sourceType === 'task' ? (
                        <button
                          onClick={() => toggleTaskStatus(item.sourceId)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      ) : item.sourceType === 'event' ? (
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      ) : (
                        <button
                          onClick={() => dismissReminder(item.sourceId)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                            {item.title}
                          </span>
                          {item.priority && renderPriorityBadge(item.priority)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {item.sourceType === 'task' ? 'Task' : item.sourceType === 'event' ? `Calendar Event (${item.category || 'Meeting'})` : 'Reminder'} • {item.date} at {item.formattedTime}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.sourceType === 'task'
                          ? 'bg-blue-100 text-blue-800'
                          : item.sourceType === 'event'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.date === todayStr ? 'Today' : item.date}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* 2.5 Expand Day Overlay Modal */}
      {expandedDayDate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setExpandedDayDate(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-300 space-y-4 max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Full Day Schedule
                </span>
                <h3 className="text-base font-black text-slate-950 mt-1">
                  {expandedDayTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {unifiedItems.filter((i) => i.date === expandedDayDate).length} scheduled items
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAddModalForDate(expandedDayDate)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedDayDate(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Event List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(() => {
                const dayItems = unifiedItems.filter((i) => i.date === expandedDayDate);
                if (dayItems.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                      <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">No scheduled items on this day.</p>
                      <button
                        type="button"
                        onClick={() => openAddModalForDate(expandedDayDate)}
                        className="text-xs font-extrabold text-blue-600 hover:underline"
                      >
                        Click to schedule a task or event
                      </button>
                    </div>
                  );
                }

                return dayItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      item.sourceType === 'task'
                        ? item.isCompleted
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white border-l-4 border-l-blue-600 border-slate-200 hover:border-blue-300 shadow-2xs'
                        : item.sourceType === 'event'
                        ? 'bg-white border-l-4 border-l-purple-600 border-purple-200 shadow-2xs'
                        : 'bg-emerald-50/50 border-l-4 border-l-emerald-600 border-emerald-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.sourceType === 'task' ? (
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(item.sourceId)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      ) : item.sourceType === 'event' ? (
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => dismissReminder(item.sourceId)}
                          className="text-emerald-600 hover:text-emerald-700"
                          title="Dismiss reminder"
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                            {item.title}
                          </span>
                          {item.priority && renderPriorityBadge(item.priority)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{item.sourceType === 'task' ? 'Task Deadline' : item.sourceType === 'event' ? `Calendar Event (${item.category || 'Meeting'})` : 'Native Reminder'}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-700 font-bold">{item.formattedTime || 'All Day'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.isCompleted
                          ? 'bg-slate-200 text-slate-600'
                          : item.sourceType === 'reminder'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.sourceType === 'event'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.isCompleted ? 'Completed' : item.sourceType === 'reminder' ? 'Reminder' : item.sourceType === 'event' ? (item.category || 'Event') : 'Active'}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Direct synchronization with SQLite database</span>
              <button
                type="button"
                onClick={() => setExpandedDayDate(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Add Event / Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-300 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Schedule Real Item</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Segmented Type Switcher: Event vs Task */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setScheduleType('event')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  scheduleType === 'event'
                    ? 'bg-white shadow-2xs text-purple-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Calendar Event</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('task')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  scheduleType === 'task'
                    ? 'bg-white shadow-2xs text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Task Deadline</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  {scheduleType === 'event' ? 'Event Title' : 'Task Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={scheduleType === 'event' ? 'e.g. Doctor Appointment, Strategic Sync' : 'e.g. Learn Java, Linux Audit'}
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              {scheduleType === 'event' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 font-bold text-slate-900 bg-white"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="appointment">Doctor Appointment</option>
                      <option value="conference">Conference</option>
                      <option value="special">Special Event / Birthday</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Priority</label>
                  <select
                    value={newEventPriority}
                    onChange={(e) => setNewEventPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 font-bold text-slate-900 bg-white"
                  >
                    <option value="P0">🔥 Urgent (P0)</option>
                    <option value="P1">⚡ High (P1)</option>
                    <option value="P2">🎯 Normal (P2)</option>
                    <option value="P3">🌿 Low (P3)</option>
                  </select>
                </div>
              )}

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
                  {scheduleType === 'event' ? 'Save Event' : 'Save Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Footer Status Bar */}
      <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-xs text-slate-800 font-bold">
        <span>Timeline Mode: {viewMode.toUpperCase()} | Active Filter: {entityFilter.toUpperCase()} | Scheduled Items: {unifiedItems.length}</span>
        <span className="text-slate-700 font-mono text-[11px] font-extrabold">* Real SQLite durability</span>
      </div>
    </div>
  );
};

export default CalendarView;
