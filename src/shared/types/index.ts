// ============================================================================
// Personal OS — Core Shared Domain Models & Types
// ============================================================================

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'canceled';

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
  dueDate?: string; // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
  dueTime?: string; // HH:MM
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
  completedDates: string[]; // YYYY-MM-DD array
  createdAt: string;
  updatedAt: string;
}

export type FocusMode = 'pomodoro' | 'deep_work' | 'ultradian' | 'stopwatch';
export type SoundType = 'none' | 'rain' | 'whitenoise' | 'gamma40hz' | 'stream';

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

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  tags: string[];
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO or HH:MM
  endTime: string;   // ISO or HH:MM
  isAllDay: boolean;
  category: 'event' | 'timeblock' | 'meeting' | 'reminder';
  color: string;
  location?: string;
  taskId?: string;
}

export interface Reminder {
  id: string;
  taskId?: string;
  title: string;
  triggerTime: string;
  isTriggered: boolean;
  isSnoozed: boolean;
  snoozeUntil?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number; // 0-100
  targetDate: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}

export type AppModuleId =
  | 'dashboard'
  | 'tasks'
  | 'notes'
  | 'habits'
  | 'goals'
  | 'focus'
  | 'calendar'
  | 'reminders'
  | 'analytics'
  | 'notifications'
  | 'calculator'
  | 'quick-capture'
  | 'command-palette'
  | 'ai'
  | 'tray'
  | 'settings';

export interface AppModuleMeta {
  id: AppModuleId;
  name: string;
  description: string;
  iconName: string;
  hotkey?: string;
  badgeCount?: number;
}
