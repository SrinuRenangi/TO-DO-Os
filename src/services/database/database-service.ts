// ============================================================================
// Personal OS — Database Service & Offline Durability Engine
// Pure SQLite & Local Persistence with Automated Backup & Restore
// ============================================================================

import {
  TaskEntity,
  ReminderEntity,
  NoteEntity,
  TimerEntity,
  NotificationEntity,
  DatabaseSnapshot,
  EventEntity,
} from './types';

const STORAGE_KEY = 'personal_os_db_v1';

const INITIAL_TIMER: TimerEntity = {
  id: 'main-timer',
  mode: 'pomodoro',
  targetSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  isRunning: false,
  label: 'Focus Flow',
  updatedAt: new Date().toISOString(),
};

const INITIAL_EVENTS: EventEntity[] = [
  {
    id: 'event-1',
    title: 'Doctor Appointment',
    description: 'Annual health and wellness routine checkup.',
    startTime: '14:00',
    endTime: '15:00',
    date: new Date().toISOString().split('T')[0],
    isAllDay: false,
    category: 'appointment',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-2',
    title: 'Strategic Architecture Sync',
    description: 'Quarterly engineering milestone review and sync.',
    startTime: '10:00',
    endTime: '11:30',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    isAllDay: false,
    category: 'meeting',
    color: '#6366F1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-3',
    title: 'Product Design Conference',
    description: 'Keynote presentation and personal systems engineering symposium.',
    startTime: '09:00',
    endTime: '17:00',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    isAllDay: true,
    category: 'conference',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_TASKS: TaskEntity[] = [
  {
    id: 'task-1',
    title: 'Buy Medicine & Prescription Refill',
    description: 'Ensure critical medication is picked up from pharmacy before closing.',
    priority: 'P0',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    recurring: 'none',
    subtasks: [
      { id: 'sub-1', taskId: 'task-1', title: 'Check doctor prescription', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-2', taskId: 'task-1', title: 'Pick up at local pharmacy', completed: false, createdAt: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Linux Control Center System Audit',
    description: 'Verify 24/7 background scheduler CPU consumption (<0.1%) and memory footprint (<200MB).',
    priority: 'P1',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '15:30',
    recurring: 'daily',
    subtasks: [
      { id: 'sub-3', taskId: 'task-2', title: 'Verify close-to-tray window interception', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-4', taskId: 'task-2', title: 'Audit missed reminder wake-up reconciliation', completed: true, createdAt: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-daily-1',
    title: 'Learn Java',
    description: 'Core language study, concurrency, and virtual thread design patterns.',
    priority: 'P1',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '08:00',
    recurring: 'daily',
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-daily-2',
    title: 'Fine Tuning',
    description: 'Model weight optimization and offline dataset curation.',
    priority: 'P1',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:00',
    recurring: 'daily',
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Weekly Knowledge Base Review & Notes Consolidation',
    description: 'Review pinned technical notes and organize architecture specifications.',
    priority: 'P2',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    dueTime: '11:00',
    recurring: 'weekly',
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_REMINDERS: ReminderEntity[] = [
  {
    id: 'rem-1',
    taskId: 'task-1',
    title: 'Buy Medicine & Prescription Refill',
    triggerTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    dueTimeFormatted: '6:00 PM',
    isTriggered: false,
    isSnoozed: false,
    urgency: 'critical',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    taskId: 'task-2',
    title: 'Linux Control Center System Audit',
    triggerTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    dueTimeFormatted: '3:30 PM',
    isTriggered: false,
    isSnoozed: false,
    urgency: 'urgent',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_NOTES: NoteEntity[] = [
  {
    id: 'note-1',
    title: 'Personal OS — Core Reliability Principles',
    content: `# Personal OS — Core Reliability Principles

1. **Deterministic Execution**: Zero AI, zero stochastic prompts. Pure mathematical reliability.
2. **24/7 Desktop Companion**: Runs continuously in background system tray.
3. **Services-First Architecture**: Database -> Service -> Business Logic -> State -> UI.
4. **Offline First**: All tasks, reminders, notes, and timers function without network access.`,
    pinned: true,
    folder: 'Architecture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'System Telemetry & Performance Limits',
    content: `# System Telemetry Targets

- **Idle RAM**: <200MB (Verified ~112MB)
- **Idle CPU**: <2% (Scheduler delta timers run at 0.08% CPU)
- **Startup**: <3s cold boot`,
    pinned: false,
    folder: 'Engineering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: Record<string, string> = {
  autoStart: 'true',
  closeToTray: 'true',
  soundEnabled: 'true',
  theme: 'dark',
};

const INITIAL_NOTIFICATIONS: NotificationEntity[] = [
  {
    id: 'notif-1',
    title: 'Reminder Engine Online',
    body: '24/7 background scheduler daemon initialized with Web Audio chimes.',
    urgency: 'urgent',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Database WAL Snapshot',
    body: 'SQLite transaction journal persisted cleanly with zero schema errors.',
    urgency: 'normal',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Desktop Companion Armed',
    body: 'Personal Organizer offline desktop environment loaded and ready.',
    urgency: 'normal',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    isRead: true,
  },
];

declare global {
  interface Window {
    sqliteDB?: {
      isAvailable: boolean;
      getTasks: () => Promise<TaskEntity[]>;
      saveTask: (task: TaskEntity) => Promise<TaskEntity>;
      deleteTask: (id: string) => Promise<boolean>;
      addSubtask: (subtask: any) => Promise<any>;
      toggleSubtask: (taskId: string, subtaskId: string) => Promise<boolean>;
      deleteSubtask: (taskId: string, subtaskId: string) => Promise<boolean>;
      getReminders: () => Promise<ReminderEntity[]>;
      saveReminder: (reminder: ReminderEntity) => Promise<ReminderEntity>;
      deleteReminder: (id: string) => Promise<boolean>;
      getNotes: () => Promise<NoteEntity[]>;
      saveNote: (note: NoteEntity) => Promise<NoteEntity>;
      deleteNote: (id: string) => Promise<boolean>;
      getEvents: () => Promise<EventEntity[]>;
      saveEvent: (event: EventEntity) => Promise<EventEntity>;
      deleteEvent: (id: string) => Promise<boolean>;
      getTimer: () => Promise<TimerEntity>;
      saveTimer: (timer: TimerEntity) => Promise<TimerEntity>;
      getNotifications: () => Promise<NotificationEntity[]>;
      addNotification: (notif: NotificationEntity) => Promise<boolean>;
      markNotificationRead: (id: string) => Promise<boolean>;
      deleteNotification: (id: string) => Promise<boolean>;
      clearNotifications: () => Promise<boolean>;
      getSettings: () => Promise<Record<string, string>>;
      setSetting: (key: string, value: string) => Promise<boolean>;
      exportSnapshot: () => Promise<DatabaseSnapshot>;
      restoreSnapshot: (snapshot: DatabaseSnapshot) => Promise<boolean>;
      getInfo: () => Promise<{ type: string; journalMode: string; path: string }>;
    };
  }
}

export class DatabaseService {
  private inMemoryDb: {
    tasks: TaskEntity[];
    reminders: ReminderEntity[];
    notes: NoteEntity[];
    events: EventEntity[];
    timer: TimerEntity;
    notifications: NotificationEntity[];
    settings: Record<string, string>;
  };

  constructor() {
    this.inMemoryDb = this.loadFromStorage();
    this.syncFromSQLite();
  }

  public isSQLiteActive(): boolean {
    return typeof window !== 'undefined' && Boolean(window.sqliteDB?.isAvailable);
  }

  public async syncFromSQLite(): Promise<void> {
    if (typeof window === 'undefined' || !window.sqliteDB?.isAvailable) return;
    try {
      const [tasks, reminders, notes, events, timer, notifications, settings] = await Promise.all([
        window.sqliteDB.getTasks(),
        window.sqliteDB.getReminders(),
        window.sqliteDB.getNotes(),
        window.sqliteDB.getEvents ? window.sqliteDB.getEvents() : Promise.resolve([]),
        window.sqliteDB.getTimer(),
        window.sqliteDB.getNotifications(),
        window.sqliteDB.getSettings(),
      ]);

      this.inMemoryDb = {
        tasks: tasks && tasks.length > 0 ? tasks : this.inMemoryDb.tasks,
        reminders: reminders && reminders.length > 0 ? reminders : this.inMemoryDb.reminders,
        notes: notes && notes.length > 0 ? notes : this.inMemoryDb.notes,
        events: events && events.length > 0 ? events : this.inMemoryDb.events,
        timer: timer || this.inMemoryDb.timer,
        notifications: notifications && notifications.length > 0 ? notifications : this.inMemoryDb.notifications,
        settings: settings && Object.keys(settings).length > 0 ? settings : this.inMemoryDb.settings,
      };

      this.persistToStorage();
      console.log('[DatabaseService] Synchronized with native SQLite WAL database.');
    } catch (err) {
      console.warn('[DatabaseService] SQLite sync error, fallback active:', err);
    }
  }

  // --- Tasks CRUD ---
  public getTasks(): TaskEntity[] {
    return [...this.inMemoryDb.tasks];
  }

  public saveTask(task: TaskEntity): TaskEntity {
    const existingIndex = this.inMemoryDb.tasks.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      this.inMemoryDb.tasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      this.inMemoryDb.tasks.unshift(task);
    }
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.saveTask(task).catch((err) => console.warn('[DatabaseService] SQLite saveTask error:', err));
    }
    return task;
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.inMemoryDb.tasks.length;
    this.inMemoryDb.tasks = this.inMemoryDb.tasks.filter((t) => t.id !== id);
    // Also cascade delete linked reminders
    this.inMemoryDb.reminders = this.inMemoryDb.reminders.filter((r) => r.taskId !== id);
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.deleteTask(id).catch((err) => console.warn('[DatabaseService] SQLite deleteTask error:', err));
    }
    return this.inMemoryDb.tasks.length !== initialLen;
  }

  // --- Reminders CRUD ---
  public getReminders(): ReminderEntity[] {
    return [...this.inMemoryDb.reminders];
  }

  public saveReminder(reminder: ReminderEntity): ReminderEntity {
    const idx = this.inMemoryDb.reminders.findIndex((r) => r.id === reminder.id);
    if (idx >= 0) {
      this.inMemoryDb.reminders[idx] = reminder;
    } else {
      this.inMemoryDb.reminders.push(reminder);
    }
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.saveReminder(reminder).catch((err) => console.warn('[DatabaseService] SQLite saveReminder error:', err));
    }
    return reminder;
  }

  public deleteReminder(id: string): boolean {
    const len = this.inMemoryDb.reminders.length;
    this.inMemoryDb.reminders = this.inMemoryDb.reminders.filter((r) => r.id !== id);
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.deleteReminder(id).catch((err) => console.warn('[DatabaseService] SQLite deleteReminder error:', err));
    }
    return this.inMemoryDb.reminders.length !== len;
  }

  // --- Notes CRUD ---
  public getNotes(): NoteEntity[] {
    return [...this.inMemoryDb.notes];
  }

  public saveNote(note: NoteEntity): NoteEntity {
    const idx = this.inMemoryDb.notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      this.inMemoryDb.notes[idx] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      this.inMemoryDb.notes.unshift(note);
    }
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.saveNote(note).catch((err) => console.warn('[DatabaseService] SQLite saveNote error:', err));
    }
    return note;
  }

  public deleteNote(id: string): boolean {
    const len = this.inMemoryDb.notes.length;
    this.inMemoryDb.notes = this.inMemoryDb.notes.filter((n) => n.id !== id);
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.deleteNote(id).catch((err) => console.warn('[DatabaseService] SQLite deleteNote error:', err));
    }
    return this.inMemoryDb.notes.length !== len;
  }

  // --- Events CRUD ---
  public getEvents(): EventEntity[] {
    return [...this.inMemoryDb.events];
  }

  public saveEvent(event: EventEntity): EventEntity {
    const idx = this.inMemoryDb.events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      this.inMemoryDb.events[idx] = event;
    } else {
      this.inMemoryDb.events.push(event);
    }
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable && window.sqliteDB.saveEvent) {
      window.sqliteDB.saveEvent(event).catch((err) => console.warn('[DatabaseService] SQLite saveEvent error:', err));
    }
    return event;
  }

  public deleteEvent(id: string): boolean {
    const len = this.inMemoryDb.events.length;
    this.inMemoryDb.events = this.inMemoryDb.events.filter((e) => e.id !== id);
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable && window.sqliteDB.deleteEvent) {
      window.sqliteDB.deleteEvent(id).catch((err) => console.warn('[DatabaseService] SQLite deleteEvent error:', err));
    }
    return this.inMemoryDb.events.length !== len;
  }

  // --- Timer ---
  public getTimer(): TimerEntity {
    return { ...this.inMemoryDb.timer };
  }

  public saveTimer(timer: TimerEntity): TimerEntity {
    this.inMemoryDb.timer = { ...timer, updatedAt: new Date().toISOString() };
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.saveTimer(timer).catch((err) => console.warn('[DatabaseService] SQLite saveTimer error:', err));
    }
    return this.inMemoryDb.timer;
  }

  // --- Notifications ---
  public getNotifications(): NotificationEntity[] {
    return [...this.inMemoryDb.notifications];
  }

  public addNotification(notification: NotificationEntity): void {
    this.inMemoryDb.notifications.unshift(notification);
    if (this.inMemoryDb.notifications.length > 100) {
      this.inMemoryDb.notifications.pop();
    }
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.addNotification(notification).catch((err) => console.warn('[DatabaseService] SQLite addNotification error:', err));
    }
  }

  public markNotificationRead(id: string): void {
    this.inMemoryDb.notifications = this.inMemoryDb.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.markNotificationRead(id).catch((err) => console.warn('[DatabaseService] SQLite markNotificationRead error:', err));
    }
  }

  public deleteNotification(id: string): void {
    this.inMemoryDb.notifications = this.inMemoryDb.notifications.filter((n) => n.id !== id);
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.deleteNotification(id).catch((err) => console.warn('[DatabaseService] SQLite deleteNotification error:', err));
    }
  }

  public clearNotifications(): void {
    this.inMemoryDb.notifications = [];
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.clearNotifications().catch((err) => console.warn('[DatabaseService] SQLite clearNotifications error:', err));
    }
  }

  // --- Settings ---
  public getSettings(): Record<string, string> {
    return { ...this.inMemoryDb.settings };
  }

  public setSetting(key: string, value: string): void {
    this.inMemoryDb.settings[key] = value;
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.isAvailable) {
      window.sqliteDB.setSetting(key, value).catch((err) => console.warn('[DatabaseService] SQLite setSetting error:', err));
    }
  }

  // --- Backup & Restore ---
  public exportSnapshot(): DatabaseSnapshot {
    return {
      version: '1.0.0-linux-2030',
      exportedAt: new Date().toISOString(),
      tasks: this.inMemoryDb.tasks,
      reminders: this.inMemoryDb.reminders,
      notes: this.inMemoryDb.notes,
      events: this.inMemoryDb.events,
      timer: this.inMemoryDb.timer,
      notifications: this.inMemoryDb.notifications,
      settings: this.inMemoryDb.settings,
    };
  }

  public restoreSnapshot(snapshot: DatabaseSnapshot): boolean {
    if (!snapshot || !Array.isArray(snapshot.tasks)) return false;
    this.inMemoryDb = {
      tasks: snapshot.tasks,
      reminders: snapshot.reminders || [],
      notes: snapshot.notes || [],
      events: snapshot.events || [],
      timer: snapshot.timer || INITIAL_TIMER,
      notifications: snapshot.notifications || [],
      settings: snapshot.settings || INITIAL_SETTINGS,
    };
    this.persistToStorage();
    return true;
  }

  // --- Internal Storage Sync ---
  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            tasks: parsed.tasks || INITIAL_TASKS,
            reminders: parsed.reminders || INITIAL_REMINDERS,
            notes: parsed.notes || INITIAL_NOTES,
            events: parsed.events || INITIAL_EVENTS,
            timer: parsed.timer || INITIAL_TIMER,
            notifications: parsed.notifications && parsed.notifications.length > 0 ? parsed.notifications : INITIAL_NOTIFICATIONS,
            settings: parsed.settings || INITIAL_SETTINGS,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Failed to load local storage, initializing baseline:', err);
      }
    }
    return {
      tasks: INITIAL_TASKS,
      reminders: INITIAL_REMINDERS,
      notes: INITIAL_NOTES,
      events: INITIAL_EVENTS,
      timer: INITIAL_TIMER,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
    };
  }

  private persistToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryDb));
      } catch (err) {
        console.error('[DatabaseService] Storage persist error:', err);
      }
    }
  }
}

export const databaseService = new DatabaseService();
