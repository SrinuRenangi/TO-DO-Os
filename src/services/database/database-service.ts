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

const INITIAL_EVENTS: EventEntity[] = [];

const INITIAL_TASKS: TaskEntity[] = [];

const INITIAL_REMINDERS: ReminderEntity[] = [];

const INITIAL_NOTES: NoteEntity[] = [];

const INITIAL_SETTINGS: Record<string, string> = {
  autoStart: 'true',
  closeToTray: 'true',
  soundEnabled: 'true',
  theme: 'dark',
};

const INITIAL_NOTIFICATIONS: NotificationEntity[] = [];

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
      clearAllUserData?: () => Promise<boolean>;
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
        tasks: Array.isArray(tasks) ? tasks : this.inMemoryDb.tasks,
        reminders: Array.isArray(reminders) ? reminders : this.inMemoryDb.reminders,
        notes: Array.isArray(notes) ? notes : this.inMemoryDb.notes,
        events: Array.isArray(events) ? events : this.inMemoryDb.events,
        timer: timer || this.inMemoryDb.timer,
        notifications: Array.isArray(notifications) ? notifications : this.inMemoryDb.notifications,
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

  public clearAllData(): void {
    this.inMemoryDb = {
      tasks: [],
      reminders: [],
      notes: [],
      events: [],
      timer: { ...INITIAL_TIMER },
      notifications: [],
      settings: { ...INITIAL_SETTINGS },
    };
    this.persistToStorage();
    if (typeof window !== 'undefined' && window.sqliteDB?.clearAllUserData) {
      window.sqliteDB.clearAllUserData().catch((err) =>
        console.warn('[DatabaseService] SQLite clearAllUserData error:', err)
      );
    }
  }

  // --- Internal Storage Sync ---
  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : INITIAL_TASKS,
            reminders: Array.isArray(parsed.reminders) ? parsed.reminders : INITIAL_REMINDERS,
            notes: Array.isArray(parsed.notes) ? parsed.notes : INITIAL_NOTES,
            events: Array.isArray(parsed.events) ? parsed.events : INITIAL_EVENTS,
            timer: parsed.timer || INITIAL_TIMER,
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
            settings: parsed.settings || INITIAL_SETTINGS,
          };
        }
      } catch (err) {
        console.warn('[DatabaseService] Failed to load local storage, initializing baseline:', err);
      }
    }
    return {
      tasks: [...INITIAL_TASKS],
      reminders: [...INITIAL_REMINDERS],
      notes: [...INITIAL_NOTES],
      events: [...INITIAL_EVENTS],
      timer: { ...INITIAL_TIMER },
      notifications: [...INITIAL_NOTIFICATIONS],
      settings: { ...INITIAL_SETTINGS },
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
