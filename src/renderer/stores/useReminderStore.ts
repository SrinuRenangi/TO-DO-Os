import { create } from 'zustand';
import { Reminder } from '@shared/types';
import { reminderService } from '@/services/reminders/reminder-service';
import { ReminderEntity } from '@/services/database/types';

interface ReminderState {
  reminders: Reminder[];
  refreshReminders: () => void;
  addReminder: (title: string, triggerTime: string, dueTimeFormatted: string, urgency?: Reminder['urgency'], taskId?: string) => Reminder;
  snoozeReminder: (id: string, minutes: number) => void;
  dismissReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  triggerReminder: (id: string) => void;
}

function entityToReminder(r: ReminderEntity): Reminder {
  return {
    id: r.id,
    taskId: r.taskId,
    title: r.title,
    triggerTime: r.triggerTime,
    dueTimeFormatted: r.dueTimeFormatted,
    isTriggered: r.isTriggered,
    isSnoozed: r.isSnoozed,
    snoozeUntil: r.snoozeUntil,
    urgency: r.urgency,
  };
}

function loadReminders(): Reminder[] {
  return reminderService.getAllReminders().map(entityToReminder);
}

export const useReminderStore = create<ReminderState>((set) => ({
  reminders: loadReminders(),

  refreshReminders: () => {
    set({ reminders: loadReminders() });
  },

  addReminder: (title, triggerTime, dueTimeFormatted, urgency = 'normal', taskId) => {
    const created = reminderService.createReminder({
      title,
      triggerTime,
      dueTimeFormatted,
      urgency,
      taskId,
    });
    set({ reminders: loadReminders() });
    return entityToReminder(created);
  },

  snoozeReminder: (id, minutes) => {
    reminderService.snoozeReminder(id, minutes);
    set({ reminders: loadReminders() });
  },

  dismissReminder: (id) => {
    reminderService.completeReminder(id);
    set({ reminders: loadReminders() });
  },

  deleteReminder: (id) => {
    reminderService.deleteReminder(id);
    set({ reminders: loadReminders() });
  },

  triggerReminder: (id) => {
    // When manually triggered or triggered by scheduler
    set({ reminders: loadReminders() });
  },
}));
