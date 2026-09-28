// ============================================================================
// Personal OS — Reminder Service
// 24/7 Scheduling, Escalation, Snooze Presets, and Sound Chimes
// ============================================================================

import { databaseService } from '../database/database-service';
import { ReminderEntity, RecurringPattern } from '../database/types';
import { generateId } from '@/lib/utils';
import { notificationService } from '../notifications/notification-service';

export interface CreateReminderInput {
  title: string;
  triggerTime: string; // ISO 8601 string
  dueTimeFormatted: string; // e.g. "6:00 PM"
  urgency?: 'normal' | 'urgent' | 'critical';
  taskId?: string;
}

export class ReminderService {
  public getAllReminders(): ReminderEntity[] {
    return databaseService.getReminders().sort(
      (a, b) => new Date(a.triggerTime).getTime() - new Date(b.triggerTime).getTime()
    );
  }

  public getReminderById(id: string): ReminderEntity | undefined {
    return databaseService.getReminders().find((r) => r.id === id);
  }

  public createReminder(input: CreateReminderInput): ReminderEntity {
    const newReminder: ReminderEntity = {
      id: generateId('rem'),
      taskId: input.taskId,
      title: input.title.trim(),
      triggerTime: input.triggerTime,
      dueTimeFormatted: input.dueTimeFormatted,
      isTriggered: false,
      isSnoozed: false,
      urgency: input.urgency || 'normal',
      createdAt: new Date().toISOString(),
    };

    databaseService.saveReminder(newReminder);
    return newReminder;
  }

  public snoozeReminder(id: string, minutes: number): ReminderEntity | null {
    const reminder = this.getReminderById(id);
    if (!reminder) return null;

    const newTriggerTime = new Date(Date.now() + minutes * 60000).toISOString();
    const updatedReminder: ReminderEntity = {
      ...reminder,
      isTriggered: false,
      isSnoozed: true,
      triggerTime: newTriggerTime,
      dueTimeFormatted: `Snoozed (+${minutes}m)`,
      snoozeUntil: newTriggerTime,
    };

    databaseService.saveReminder(updatedReminder);
    return updatedReminder;
  }

  public completeReminder(id: string): boolean {
    const reminder = this.getReminderById(id);
    if (!reminder) return false;

    // Delete reminder and mark completed
    return databaseService.deleteReminder(id);
  }

  public deleteReminder(id: string): boolean {
    return databaseService.deleteReminder(id);
  }

  public checkAndTriggerDueReminders(): ReminderEntity[] {
    const now = Date.now();
    const reminders = this.getAllReminders();
    const dueReminders: ReminderEntity[] = [];

    for (const reminder of reminders) {
      if (!reminder.isTriggered && new Date(reminder.triggerTime).getTime() <= now) {
        // Trigger notification & sound alert
        notificationService.dispatch({
          title: `Personal OS Reminder: ${reminder.title}`,
          body: `Scheduled for ${reminder.dueTimeFormatted}. Complete or snooze task.`,
          urgency: reminder.urgency,
          sound: true,
        });

        const triggeredReminder: ReminderEntity = {
          ...reminder,
          isTriggered: true,
        };
        databaseService.saveReminder(triggeredReminder);
        dueReminders.push(triggeredReminder);

        // If reminder is linked to a recurring task, schedule the next recurring reminder instance
        if (reminder.taskId) {
          const task = databaseService.getTasks().find((t) => t.id === reminder.taskId);
          if (task && task.recurring && task.recurring !== 'none') {
            const nextDate = this.calculateNextRecurrenceDate(reminder.triggerTime, task.recurring);
            if (nextDate) {
              const nextReminder: ReminderEntity = {
                id: generateId('rem'),
                taskId: task.id,
                title: reminder.title,
                triggerTime: nextDate.toISOString(),
                dueTimeFormatted: reminder.dueTimeFormatted,
                isTriggered: false,
                isSnoozed: false,
                urgency: reminder.urgency,
                createdAt: new Date().toISOString(),
              };
              databaseService.saveReminder(nextReminder);
              console.log(`[ReminderService] Scheduled next recurring reminder for task ${task.id} at ${nextDate.toISOString()}`);
            }
          }
        }
      }
    }

    return dueReminders;
  }

  private calculateNextRecurrenceDate(isoString: string, pattern: RecurringPattern): Date | null {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    if (pattern === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (pattern === 'weekdays') {
      const day = d.getDay();
      d.setDate(d.getDate() + (day === 5 ? 3 : day === 6 ? 2 : 1));
    } else if (pattern === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (pattern === 'monthly') {
      d.setMonth(d.getMonth() + 1);
    } else {
      return null;
    }
    return d;
  }
}

export const reminderService = new ReminderService();
