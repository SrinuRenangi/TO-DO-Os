// ============================================================================
// Personal OS — Calendar Service & Unified Scheduling Engine
// Pure Deterministic Productivity (Zero Fake Events, 100% Real SQLite Tasks & Reminders)
// Dynamic Month Grid (Leap Year Safe), 7-Day Week, 24-Hour Day & Agenda Models
// ============================================================================

import { taskService } from '../tasks/task-service';
import { reminderService } from '../reminders/reminder-service';
import { eventsService } from '../events/events-service';
import { TaskEntity, ReminderEntity, EventEntity, Priority } from '../database/types';

export interface CalendarItem {
  id: string;
  sourceType: 'task' | 'event' | 'reminder';
  sourceId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  endTime?: string;
  formattedTime: string;
  priority?: Priority;
  status?: string;
  isCompleted: boolean;
  isSnoozed?: boolean;
  urgency?: 'normal' | 'urgent' | 'critical';
  category?: string;
  color?: string;
  isAllDay?: boolean;
  taskReference?: TaskEntity;
  eventReference?: EventEntity;
  reminderReference?: ReminderEntity;
}

export interface DayGridCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  month: number; // 0-11
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface WeekDayColumn {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue...
  fullDayName: string; // Monday, Tuesday...
  dayNumber: number;
  isToday: boolean;
}

export interface HourlySlot {
  hour: number; // 0-23
  timeStr: string; // "00:00", "01:00"...
  label: string; // "12 AM", "1 AM"...
}

export class CalendarService {
  /**
   * Check if a year is a leap year.
   */
  public isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get total days in month (handles February 28/29, 30, 31).
   */
  public getDaysInMonth(year: number, monthZeroIndexed: number): number {
    return new Date(year, monthZeroIndexed + 1, 0).getDate();
  }

  /**
   * Generate 35- or 42-cell Monday-first month grid with overflow from prev/next months.
   */
  public getMonthGrid(year: number, monthZeroIndexed: number): DayGridCell[] {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const daysInCurrentMonth = this.getDaysInMonth(year, monthZeroIndexed);
    const firstDayOfWeek = new Date(year, monthZeroIndexed, 1).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    // Convert to Monday = 0, Sunday = 6
    const mondayBasedOffset = (firstDayOfWeek + 6) % 7;

    const cells: DayGridCell[] = [];

    // 1. Previous month overflow
    if (mondayBasedOffset > 0) {
      const prevYear = monthZeroIndexed === 0 ? year - 1 : year;
      const prevMonth = monthZeroIndexed === 0 ? 11 : monthZeroIndexed - 1;
      const daysInPrevMonth = this.getDaysInMonth(prevYear, prevMonth);

      for (let i = mondayBasedOffset - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({
          dateStr,
          dayNumber: d,
          month: prevMonth,
          year: prevYear,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
        });
      }
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        month: monthZeroIndexed,
        year,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // 3. Next month overflow to complete the grid (total cells: 35 or 42)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    const nextYear = monthZeroIndexed === 11 ? year + 1 : year;
    const nextMonth = monthZeroIndexed === 11 ? 0 : monthZeroIndexed + 1;

    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }

  /**
   * Get 7-day Monday-to-Sunday columns for the week containing anchorDateStr.
   */
  public getWeekDays(anchorDateStr: string): WeekDayColumn[] {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [y, m, d] = anchorDateStr.split('-').map(Number);
    const anchor = new Date(y, m - 1, d);
    const dayOfWeek = anchor.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const diffToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(y, m - 1, d - diffToMonday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const columns: WeekDayColumn[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      columns.push({
        dateStr,
        dayName: dayNames[i],
        fullDayName: fullDayNames[i],
        dayNumber: current.getDate(),
        isToday: dateStr === todayStr,
      });
    }

    return columns;
  }

  /**
   * Generate 24 hourly timeline slots.
   */
  public getHourlySlots(): HourlySlot[] {
    const slots: HourlySlot[] = [];
    for (let h = 0; h < 24; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      let label = '';
      if (h === 0) label = '12 AM';
      else if (h < 12) label = `${h} AM`;
      else if (h === 12) label = '12 PM';
      else label = `${h - 12} PM`;

      slots.push({
        hour: h,
        timeStr,
        label,
      });
    }
    return slots;
  }

  /**
   * Aggregates real tasks and real reminders into unified calendar items.
   * Completely eliminates fake mock events.
   */
  public getUnifiedItems(): CalendarItem[] {
    const tasks = taskService.getAllTasks();
    const reminders = reminderService.getAllReminders();

    const items: CalendarItem[] = [];

    // 1. Map Real Tasks
    for (const task of tasks) {
      if (!task.dueDate) continue;

      let formattedTime = 'All Day';
      if (task.dueTime) {
        const [h, m] = task.dueTime.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        formattedTime = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(d);
      }

      items.push({
        id: `cal-task-${task.id}`,
        sourceType: 'task',
        sourceId: task.id,
        title: task.title,
        date: task.dueDate,
        time: task.dueTime,
        formattedTime,
        priority: task.priority,
        status: task.status,
        isCompleted: task.status === 'completed',
        taskReference: task,
      });
    }

    // 2. Map Real Independent Reminders
    for (const rem of reminders) {
      // If reminder is linked to a task, we already have the task on the calendar,
      // but if the task was completed or removed, or if it's standalone, map it.
      if (rem.taskId && tasks.some((t) => t.id === rem.taskId)) {
        continue; // Displayed via task reference
      }

      const dateStr = rem.triggerTime.split('T')[0];
      const timeParts = rem.triggerTime.split('T')[1];
      const timeStr = timeParts ? timeParts.substring(0, 5) : undefined;

      items.push({
        id: `cal-rem-${rem.id}`,
        sourceType: 'reminder',
        sourceId: rem.id,
        title: rem.title,
        date: dateStr,
        time: timeStr,
        formattedTime: rem.dueTimeFormatted,
        isCompleted: rem.isTriggered,
        isSnoozed: rem.isSnoozed,
        urgency: rem.urgency,
        reminderReference: rem,
      });
    }

    // 3. Map Real Calendar Events (Decoupled from Tasks)
    const events = eventsService.getAllEvents();
    for (const evt of events) {
      let formattedTime = 'All Day';
      if (!evt.isAllDay && evt.startTime) {
        formattedTime = `${evt.startTime}${evt.endTime ? ` - ${evt.endTime}` : ''}`;
      }

      items.push({
        id: `cal-evt-${evt.id}`,
        sourceType: 'event',
        sourceId: evt.id,
        title: evt.title,
        description: evt.description,
        date: evt.date,
        time: evt.startTime,
        endTime: evt.endTime,
        formattedTime,
        isCompleted: false,
        category: evt.category,
        color: evt.color || '#8B5CF6',
        isAllDay: evt.isAllDay,
        eventReference: evt,
      });
    }

    // Sort chronologically by date then time
    return items.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return (a.time || '00:00').localeCompare(b.time || '00:00');
    });
  }

  public getItemsForDate(dateStr: string): CalendarItem[] {
    return this.getUnifiedItems().filter((item) => item.date === dateStr);
  }

  public getItemsForWeek(anchorDateStr: string): CalendarItem[] {
    const weekDays = this.getWeekDays(anchorDateStr);
    const startDate = weekDays[0].dateStr;
    const endDate = weekDays[6].dateStr;

    return this.getUnifiedItems().filter((item) => item.date >= startDate && item.date <= endDate);
  }

  public getItemsForMonth(year: number, monthZeroIndexed: number): CalendarItem[] {
    const monthStr = String(monthZeroIndexed + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return this.getUnifiedItems().filter((item) => item.date.startsWith(prefix));
  }

  public getAgendaItems(searchQuery = ''): CalendarItem[] {
    const today = new Date().toISOString().split('T')[0];
    let items = this.getUnifiedItems().filter((item) => item.date >= today);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.title.toLowerCase().includes(q));
    }

    return items;
  }

  /**
   * Create task directly from calendar slot
   */
  public createScheduleItem(title: string, date: string, time?: string, priority: Priority = 'P2'): TaskEntity {
    return taskService.createTask({
      title,
      dueDate: date,
      dueTime: time,
      priority,
    });
  }
}

export const calendarService = new CalendarService();
