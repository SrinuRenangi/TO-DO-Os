// ============================================================================
// Personal OS — Core Database Types & Entity Models
// Pure Desktop Productivity System (No AI, 100% Deterministic)
// ============================================================================

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type TaskStatus = 'todo' | 'completed';
export type RecurringPattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface SubtaskEntity {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskEntity {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  recurring: RecurringPattern;
  subtasks: SubtaskEntity[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderEntity {
  id: string;
  taskId?: string;
  title: string;
  triggerTime: string; // ISO 8601
  dueTimeFormatted: string; // e.g. "6:00 PM"
  isTriggered: boolean;
  isSnoozed: boolean;
  snoozeUntil?: string;
  urgency: 'normal' | 'urgent' | 'critical';
  createdAt: string;
}

export interface NoteEntity {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export type TimerMode = 'pomodoro' | 'stopwatch' | 'countdown';

export interface TimerEntity {
  id: string;
  mode: TimerMode;
  targetSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  lastStartedAt?: number; // Unix ms
  label?: string;
  updatedAt: string;
}

export interface NotificationEntity {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  urgency: 'normal' | 'urgent' | 'critical';
}

export interface SettingsEntity {
  key: string;
  value: string;
  updatedAt: string;
}

export interface DatabaseSnapshot {
  version: string;
  exportedAt: string;
  tasks: TaskEntity[];
  reminders: ReminderEntity[];
  notes: NoteEntity[];
  timer: TimerEntity;
  notifications: NotificationEntity[];
  settings: Record<string, string>;
}
