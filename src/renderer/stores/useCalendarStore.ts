import { create } from 'zustand';
import { CalendarEvent } from '@shared/types';
import { calendarService, CalendarItem } from '@/services/calendar/calendar-service';
import { taskService } from '@/services/tasks/task-service';
import { reminderService } from '@/services/reminders/reminder-service';

interface CalendarState {
  events: CalendarEvent[];
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  selectedDate: string; // YYYY-MM-DD
  refreshEvents: () => void;
  setViewMode: (mode: 'month' | 'week' | 'day' | 'agenda') => void;
  setSelectedDate: (date: string) => void;
  addEvent: (title: string, date: string, startTime?: string, endTime?: string, category?: CalendarEvent['category'], color?: string) => void;
  deleteEvent: (id: string) => void;
}

function calendarItemToEvent(item: CalendarItem): CalendarEvent {
  const isTask = item.sourceType === 'task';
  const color = isTask
    ? item.priority === 'P0'
      ? '#EF4444'
      : item.priority === 'P1'
      ? '#F59E0B'
      : '#4F8CFF'
    : '#22C55E';

  return {
    id: item.id,
    title: item.title,
    description: isTask ? `Task priority: ${item.priority || 'P2'}` : `Reminder urgency: ${item.urgency || 'normal'}`,
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

export const useCalendarStore = create<CalendarState>((set) => ({
  events: loadRealCalendarEvents(),
  viewMode: 'week',
  selectedDate: new Date().toISOString().split('T')[0],

  refreshEvents: () => {
    set({ events: loadRealCalendarEvents() });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  addEvent: (title, date, startTime = '09:00', endTime = '10:00', category = 'timeblock', color = '#4F8CFF') => {
    // Creating an event on the calendar creates a real Task in taskService!
    taskService.createTask({
      title,
      dueDate: date,
      dueTime: startTime,
      priority: 'P2',
    });
    set({ events: loadRealCalendarEvents() });
  },

  deleteEvent: (id) => {
    if (id.startsWith('cal-task-')) {
      const taskId = id.replace('cal-task-', '');
      taskService.deleteTask(taskId);
    } else if (id.startsWith('cal-rem-')) {
      const remId = id.replace('cal-rem-', '');
      reminderService.deleteReminder(remId);
    }
    set({ events: loadRealCalendarEvents() });
  },
}));
