// ============================================================================
// Personal OS — Core Shared Domain Models & Types (Pure Deterministic)
// Zero AI / LLM Dependencies. 100% Reliable Desktop Types.
// ============================================================================

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'canceled';
export type TaskCategory = 'Engineering' | 'Product' | 'Strategy' | 'Personal' | 'Admin';
export type RecurringPattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  recurring: RecurringPattern;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  sortOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type FocusMode = 'pomodoro' | 'deep_work' | 'ultradian' | 'stopwatch' | 'countdown';
export type SoundType = 'none' | 'rain' | 'whitenoise' | 'gamma40hz' | 'stream';

export type ReminderSoundId =
  | 'bell'
  | 'crystal'
  | 'focus'
  | 'soft_alarm'
  | 'gentle_chime'
  | 'digital_alarm'
  | 'classic_alarm'
  | 'morning_alarm'
  | 'deep_gong'
  | 'task_complete';

export type HeadphoneMode = 'low' | 'normal' | 'strong' | 'very_strong';

export interface FocusSession {
  id: string;
  mode: FocusMode;
  taskId?: string;
  taskTitle?: string;
  targetMinutes: number;
  actualMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt?: string;
  soundType: SoundType;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  showOnDashboard?: boolean;
  tags: string[];
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // HH:MM or ISO
  endTime: string;   // HH:MM or ISO
  date: string;      // YYYY-MM-DD
  isAllDay: boolean;
  category: 'event' | 'timeblock' | 'meeting' | 'appointment' | 'special' | 'conference' | 'reminder';
  color: string;
  location?: string;
  taskId?: string;
}

export interface Reminder {
  id: string;
  taskId?: string;
  title: string;
  triggerTime: string; // ISO
  dueTimeFormatted: string; // e.g. "6:00 PM"
  isTriggered: boolean;
  isSnoozed: boolean;
  snoozeUntil?: string;
  urgency: 'normal' | 'urgent' | 'critical';
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number; // 0-100
  targetDate: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  milestones: Milestone[];
}

export type AppModuleId =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'reminders'
  | 'notes'
  | 'timer'
  | 'settings';

export interface AppModuleMeta {
  id: AppModuleId;
  name: string;
  description: string;
  iconName: string;
  hotkey?: string;
  badgeCount?: number;
}
