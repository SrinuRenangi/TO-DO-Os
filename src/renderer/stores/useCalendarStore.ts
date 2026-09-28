// ============================================================================
// Personal OS — Calendar Store (Zustand)
// Manages View Mode, Real Date Navigation, Selected Date, and Agenda Filtering
// 100% Real SQLite Tasks & Reminders Integration
// ============================================================================

import { create } from 'zustand';
import { CalendarEvent } from '@shared/types';
import { calendarService, CalendarItem } from '@/services/calendar/calendar-service';
import { taskService } from '@/services/tasks/task-service';
import { reminderService } from '@/services/reminders/reminder-service';
import { eventsService } from '@/services/events/events-service';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';
export type CalendarEntityFilter = 'all' | 'tasks' | 'events' | 'reminders';

interface CalendarState {
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  entityFilter: CalendarEntityFilter;
  selectedDate: string; // YYYY-MM-DD
  currentYear: number;
  currentMonth: number; // 0-11
  searchQuery: string;

  // Actions
  refreshEvents: () => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setEntityFilter: (filter: CalendarEntityFilter) => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  jumpToToday: () => void;
  addEvent: (title: string, date: string, startTime?: string, endTime?: string, category?: string, isAllDay?: boolean, color?: string) => void;
  deleteEvent: (id: string) => void;
}

function calendarItemToEvent(item: CalendarItem): CalendarEvent {
  if (item.sourceType === 'event') {
    return {
      id: item.id,
      title: item.title,
      description: item.description || `Event (${item.category || 'general'})`,
      date: item.date,
      startTime: item.time || '09:00',
      endTime: item.endTime || '10:00',
      isAllDay: Boolean(item.isAllDay),
      category: (item.category as any) || 'meeting',
      color: item.color || '#8B5CF6',
    };
  }

  const isTask = item.sourceType === 'task';
  const color = isTask
    ? item.priority === 'P0'
      ? '#EF4444'
      : item.priority === 'P1'
      ? '#F59E0B'
      : '#3B82F6'
    : '#10B981';

  return {
    id: item.id,
    title: item.title,
    description: isTask ? `Priority: ${item.priority || 'P2'}` : `Reminder Urgency: ${item.urgency || 'normal'}`,
    date: item.date,
    startTime: item.time || (isTask ? '09:00' : '12:00'),
    endTime: item.time || (isTask ? '10:00' : '12:30'),
    isAllDay: !item.time,
    category: isTask ? 'timeblock' : 'reminder',
    color,
    taskId: isTask ? item.sourceId : undefined,
  };
}

function loadRealCalendarEvents(): CalendarEvent[] {
  const items = calendarService.getUnifiedItems();
  return items.map(calendarItemToEvent);
}

function getTodayString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const useCalendarStore = create<CalendarState>((set, get) => {
  const today = new Date();
  const todayStr = getTodayString();

  return {
    events: loadRealCalendarEvents(),
    viewMode: 'month',
    entityFilter: 'all',
    selectedDate: todayStr,
    currentYear: today.getFullYear(),
    currentMonth: today.getMonth(),
    searchQuery: '',

    refreshEvents: () => {
      set({ events: loadRealCalendarEvents() });
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setEntityFilter: (filter) => set({ entityFilter: filter }),
    setSelectedDate: (date) => {
      const [y, m] = date.split('-').map(Number);
      set({ selectedDate: date, currentYear: y, currentMonth: m - 1 });
    },
    setSearchQuery: (query) => set({ searchQuery: query }),

    navigatePrevious: () => {
      const { viewMode, currentYear, currentMonth, selectedDate } = get();

      if (viewMode === 'month') {
        let nextMonth = currentMonth - 1;
        let nextYear = currentYear;
        if (nextMonth < 0) {
          nextMonth = 11;
          nextYear--;
        }
        set({ currentMonth: nextMonth, currentYear: nextYear });
      } else if (viewMode === 'week') {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const prevWeek = new Date(y, m - 1, d - 7);
        const yStr = prevWeek.getFullYear();
        const mStr = String(prevWeek.getMonth() + 1).padStart(2, '0');
        const dStr = String(prevWeek.getDate()).padStart(2, '0');
        const newDate = `${yStr}-${mStr}-${dStr}`;
        set({
          selectedDate: newDate,
          currentYear: prevWeek.getFullYear(),
          currentMonth: prevWeek.getMonth(),
        });
      } else if (viewMode === 'day') {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const prevDay = new Date(y, m - 1, d - 1);
        const yStr = prevDay.getFullYear();
        const mStr = String(prevDay.getMonth() + 1).padStart(2, '0');
        const dStr = String(prevDay.getDate()).padStart(2, '0');
        const newDate = `${yStr}-${mStr}-${dStr}`;
        set({
          selectedDate: newDate,
          currentYear: prevDay.getFullYear(),
          currentMonth: prevDay.getMonth(),
        });
      } else {
        // Agenda view: step back 7 days
        const [y, m, d] = selectedDate.split('-').map(Number);
        const prevWeek = new Date(y, m - 1, d - 7);
        const yStr = prevWeek.getFullYear();
        const mStr = String(prevWeek.getMonth() + 1).padStart(2, '0');
        const dStr = String(prevWeek.getDate()).padStart(2, '0');
        set({ selectedDate: `${yStr}-${mStr}-${dStr}` });
      }
    },

    navigateNext: () => {
      const { viewMode, currentYear, currentMonth, selectedDate } = get();

      if (viewMode === 'month') {
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear++;
        }
        set({ currentMonth: nextMonth, currentYear: nextYear });
      } else if (viewMode === 'week') {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const nextWeek = new Date(y, m - 1, d + 7);
        const yStr = nextWeek.getFullYear();
        const mStr = String(nextWeek.getMonth() + 1).padStart(2, '0');
        const dStr = String(nextWeek.getDate()).padStart(2, '0');
        const newDate = `${yStr}-${mStr}-${dStr}`;
        set({
          selectedDate: newDate,
          currentYear: nextWeek.getFullYear(),
          currentMonth: nextWeek.getMonth(),
        });
      } else if (viewMode === 'day') {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const nextDay = new Date(y, m - 1, d + 1);
        const yStr = nextDay.getFullYear();
        const mStr = String(nextDay.getMonth() + 1).padStart(2, '0');
        const dStr = String(nextDay.getDate()).padStart(2, '0');
        const newDate = `${yStr}-${mStr}-${dStr}`;
        set({
          selectedDate: newDate,
          currentYear: nextDay.getFullYear(),
          currentMonth: nextDay.getMonth(),
        });
      } else {
        // Agenda view: step forward 7 days
        const [y, m, d] = selectedDate.split('-').map(Number);
        const nextWeek = new Date(y, m - 1, d + 7);
        const yStr = nextWeek.getFullYear();
        const mStr = String(nextWeek.getMonth() + 1).padStart(2, '0');
        const dStr = String(nextWeek.getDate()).padStart(2, '0');
        set({ selectedDate: `${yStr}-${mStr}-${dStr}` });
      }
    },

    jumpToToday: () => {
      const now = new Date();
      const todayString = getTodayString();
      set({
        selectedDate: todayString,
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth(),
      });
    },

    addEvent: (title, date, startTime = '09:00', endTime = '10:00', category = 'meeting', isAllDay = false, color = '#8B5CF6') => {
      // Writing to calendar writes a real Event into eventsService (persisted in SQLite events table)
      eventsService.createEvent({
        title,
        date,
        startTime,
        endTime,
        category: category as any,
        isAllDay,
        color,
      });
      set({ events: loadRealCalendarEvents() });
    },

    deleteEvent: (id) => {
      if (id.startsWith('cal-evt-')) {
        const evtId = id.replace('cal-evt-', '');
        eventsService.deleteEvent(evtId);
      } else if (id.startsWith('cal-task-')) {
        const taskId = id.replace('cal-task-', '');
        taskService.deleteTask(taskId);
      } else if (id.startsWith('cal-rem-')) {
        const remId = id.replace('cal-rem-', '');
        reminderService.deleteReminder(remId);
      }
      set({ events: loadRealCalendarEvents() });
    },
  };
});
