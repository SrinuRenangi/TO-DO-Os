// ============================================================================
// Personal OS — Calendar Service
// Real Task & Reminder Scheduling Engine for Month, Week, Day & Agenda Views
// Pure Deterministic Productivity (Zero Fake Events)
// ============================================================================

import { taskService } from '../tasks/task-service';
import { reminderService } from '../reminders/reminder-service';
import { TaskEntity, ReminderEntity, Priority } from '../database/types';

export interface CalendarItem {
  id: string;
  sourceType: 'task' | 'reminder';
  sourceId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  formattedTime: string;
  priority?: Priority;
  isCompleted: boolean;
  urgency?: 'normal' | 'urgent' | 'critical';
  taskReference?: TaskEntity;
  reminderReference?: ReminderEntity;
}

export class CalendarService {
  /**
   * Aggregates real tasks and real reminders into unified calendar items.
   * Completely eliminates fake mock events.
   */
  public getUnifiedItems(): CalendarItem[] {
    const tasks = taskService.getAllTasks();
    const reminders = reminderService.getAllReminders();

    const items: CalendarItem[] = [];

    // Map Real Tasks
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
        isCompleted: task.status === 'completed',
        taskReference: task,
      });
    }

    // Map Real Independent Reminders (skip if already represented by taskId)
    for (const rem of reminders) {
      if (rem.taskId && tasks.some((t) => t.id === rem.taskId)) {
        continue; // Already shown via parent task
      }

      const dateStr = rem.triggerTime.split('T')[0];
      items.push({
        id: `cal-rem-${rem.id}`,
        sourceType: 'reminder',
        sourceId: rem.id,
        title: rem.title,
        date: dateStr,
        formattedTime: rem.dueTimeFormatted,
        isCompleted: rem.isTriggered,
        urgency: rem.urgency,
        reminderReference: rem,
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

  public getItemsForWeek(startDate: Date): CalendarItem[] {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return this.getUnifiedItems().filter((item) => {
      const itemDate = new Date(`${item.date}T00:00:00`);
      return itemDate >= start && itemDate < end;
    });
  }

  public getItemsForMonth(year: number, monthZeroIndexed: number): CalendarItem[] {
    const monthStr = String(monthZeroIndexed + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return this.getUnifiedItems().filter((item) => item.date.startsWith(prefix));
  }

  public getAgendaItems(limit = 20): CalendarItem[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getUnifiedItems()
      .filter((item) => item.date >= today)
      .slice(0, limit);
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
