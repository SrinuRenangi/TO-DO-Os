// ============================================================================
// Personal OS — SQLite Database Manager & Repository Layer
// Powered by better-sqlite3 with Write-Ahead Logging (WAL) Durability
// ============================================================================

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  initialize(userDataPath) {
    if (this.db) return this.db;

    const storageDir = userDataPath || path.join(__dirname, '..', '..', '..');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    this.dbPath = path.join(storageDir, 'personal_organizer.db');
    console.log('[DatabaseManager] Initializing SQLite database at:', this.dbPath);

    this.db = new Database(this.dbPath);

    // Performance & WAL configuration
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache

    this.runMigrations();
    this.seedDefaultsIfEmpty();

    return this.db;
  }

  getDbPath() {
    return this.dbPath;
  }

  runMigrations() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const ddl = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(ddl);
    }

    // Verify migration record
    const hasMigration = this.db.prepare('SELECT version FROM _schema_migrations WHERE version = 1').get();
    if (!hasMigration) {
      this.db.prepare('INSERT INTO _schema_migrations (version, name) VALUES (1, ?)').run('initial_core_schema');
    }

    // Ensure notes table has show_on_dashboard column
    try {
      this.db.exec('ALTER TABLE notes ADD COLUMN show_on_dashboard INTEGER DEFAULT 0');
    } catch (_err) {
      // Column already exists
    }
  }

  seedDefaultsIfEmpty() {
    const taskCount = this.db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    if (taskCount === 0) {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const insertTask = this.db.prepare(`
        INSERT INTO tasks (id, title, description, priority, status, due_date, due_time, recurring, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertSubtask = this.db.prepare(`
        INSERT INTO subtasks (id, task_id, title, completed, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertReminder = this.db.prepare(`
        INSERT INTO reminders (id, task_id, title, trigger_time, due_time_formatted, is_triggered, is_snoozed, urgency, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertNote = this.db.prepare(`
        INSERT INTO notes (id, title, content, pinned, folder, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const seedTx = this.db.transaction(() => {
        // Seed Task 1
        insertTask.run(
          'task-1',
          'Buy Medicine & Prescription Refill',
          'Ensure critical medication is picked up from pharmacy before closing.',
          'P0',
          'todo',
          today,
          '18:00',
          'none',
          now,
          now
        );
        insertSubtask.run('sub-1', 'task-1', 'Check doctor prescription', 1, 0, now);
        insertSubtask.run('sub-2', 'task-1', 'Pick up at local pharmacy', 0, 1, now);

        // Seed Task 2
        insertTask.run(
          'task-2',
          'System Diagnostics & Background Audit',
          'Verify background scheduler and offline SQLite WAL storage durability.',
          'P1',
          'todo',
          today,
          '15:30',
          'daily',
          now,
          now
        );
        insertSubtask.run('sub-3', 'task-2', 'Verify system tray daemon', 1, 0, now);
        insertSubtask.run('sub-4', 'task-2', 'Audit missed reminder reconciliation', 1, 1, now);

        // Seed Task 3
        insertTask.run(
          'task-3',
          'Weekly Knowledge Base Review & Notes Consolidation',
          'Review pinned technical notes and organize architecture specifications.',
          'P2',
          'todo',
          new Date(Date.now() + 86400000).toISOString().split('T')[0],
          '11:00',
          'weekly',
          now,
          now
        );

        // Seed Persistent Daily Tasks (Issue 6)
        insertTask.run(
          'task-daily-1',
          'Learn Java',
          'Core language study, concurrency, and virtual thread design patterns.',
          'P1',
          'todo',
          today,
          '08:00',
          'daily',
          now,
          now
        );

        insertTask.run(
          'task-daily-2',
          'Fine Tuning',
          'Model weight optimization and offline dataset curation.',
          'P1',
          'todo',
          today,
          '17:00',
          'daily',
          now,
          now
        );

        // Seed Calendar Events (Distinct from Tasks - Issue 2)
        const insertEvent = this.db.prepare(`
          INSERT INTO events (id, title, description, start_time, end_time, is_all_day, category, color, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertEvent.run(
          'event-1',
          'Doctor Appointment',
          'Annual health and wellness routine checkup.',
          `${today}T14:00:00.000Z`,
          `${today}T15:00:00.000Z`,
          0,
          'appointment',
          '#8B5CF6',
          now
        );

        insertEvent.run(
          'event-2',
          'Strategic Architecture Sync',
          'Quarterly engineering milestone review and sync.',
          `${new Date(Date.now() + 86400000).toISOString().split('T')[0]}T10:00:00.000Z`,
          `${new Date(Date.now() + 86400000).toISOString().split('T')[0]}T11:30:00.000Z`,
          0,
          'meeting',
          '#6366F1',
          now
        );

        // Seed Reminders
        const remTime1 = new Date(new Date().setHours(18, 0, 0, 0)).toISOString();
        const remTime2 = new Date(new Date().setHours(15, 30, 0, 0)).toISOString();
        insertReminder.run('rem-1', 'task-1', 'Buy Medicine & Prescription Refill', remTime1, '6:00 PM', 0, 0, 'critical', now);
        insertReminder.run('rem-2', 'task-2', 'System Diagnostics & Background Audit', remTime2, '3:30 PM', 0, 0, 'urgent', now);

        // Seed Notes
        insertNote.run(
          'note-1',
          'Personal OS — Core Reliability Principles',
          '# Personal OS — Core Reliability Principles\n\n1. **Deterministic Execution**: Zero stochastic behavior. Pure mathematical reliability.\n2. **24/7 Desktop Companion**: Runs continuously in background system tray.\n3. **SQLite First**: True SQLite Write-Ahead Logging (WAL).\n4. **Offline First**: All tasks, reminders, notes, and timers function without network access.',
          1,
          'Architecture',
          now,
          now
        );
        insertNote.run(
          'note-2',
          'System Telemetry & Performance Limits',
          '# System Telemetry Targets\n\n- **Idle RAM**: <200MB\n- **Idle CPU**: <2% in background\n- **Startup**: <2s cold boot',
          0,
          'Engineering',
          now,
          now
        );

        // Seed Timer
        this.db.prepare(`
          INSERT OR REPLACE INTO timer (id, mode, target_seconds, remaining_seconds, is_running, label, updated_at)
          VALUES ('main-timer', 'pomodoro', 1500, 1500, 0, 'Focus Flow', ?)
        `).run(now);

        // Seed Notifications
        this.db.prepare(`
          INSERT OR REPLACE INTO notifications (id, title, body, urgency, timestamp, is_read)
          VALUES 
          ('notif-1', 'SQLite WAL Journal Online', 'Real better-sqlite3 database initialized cleanly with WAL durability.', 'urgent', ?, 0),
          ('notif-2', 'Desktop Daemon Armed', 'Personal Organizer background companion active with native event scheduler.', 'normal', ?, 0)
        `).run(new Date(Date.now() - 10 * 60000).toISOString(), new Date(Date.now() - 30 * 60000).toISOString());

        // Seed Settings
        this.db.prepare(`
          INSERT OR REPLACE INTO settings (key, value, updated_at)
          VALUES 
          ('autoStart', 'true', ?),
          ('closeToTray', 'true', ?),
          ('soundEnabled', 'true', ?),
          ('theme', 'dark', ?)
        `).run(now, now, now, now);
      });

      seedTx();
      console.log('[DatabaseManager] SQLite database seeded with initial baseline.');
    }
  }

  // ==========================================================================
  // Tasks & Subtasks Repository
  // ==========================================================================
  getTasks() {
    const tasks = this.db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC, created_at DESC').all();
    const subtasks = this.db.prepare('SELECT * FROM subtasks ORDER BY sort_order ASC').all();

    const subtaskMap = new Map();
    for (const sub of subtasks) {
      if (!subtaskMap.has(sub.task_id)) subtaskMap.set(sub.task_id, []);
      subtaskMap.get(sub.task_id).push({
        id: sub.id,
        taskId: sub.task_id,
        title: sub.title,
        completed: Boolean(sub.is_completed || sub.completed),
        createdAt: sub.created_at,
      });
    }

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      priority: t.priority,
      status: t.status,
      dueDate: t.due_date,
      dueTime: t.due_time || undefined,
      recurring: t.recurring || 'none',
      subtasks: subtaskMap.get(t.id) || [],
      completedAt: t.completed_at || undefined,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  getTaskById(id) {
    const t = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!t) return null;
    const subtasks = this.db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC').all(id);
    return {
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      priority: t.priority,
      status: t.status,
      dueDate: t.due_date,
      dueTime: t.due_time || undefined,
      recurring: t.recurring || 'none',
      subtasks: subtasks.map(s => ({
        id: s.id,
        taskId: s.task_id,
        title: s.title,
        completed: Boolean(s.is_completed || s.completed),
        createdAt: s.created_at
      })),
      completedAt: t.completed_at || undefined,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

  saveTask(task) {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, priority, status, due_date, due_time, recurring, completed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        priority = excluded.priority,
        status = excluded.status,
        due_date = excluded.due_date,
        due_time = excluded.due_time,
        recurring = excluded.recurring,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      task.id,
      task.title,
      task.description || null,
      task.priority || 'P2',
      task.status || 'todo',
      task.dueDate || new Date().toISOString().split('T')[0],
      task.dueTime || null,
      task.recurring || 'none',
      task.completedAt || null,
      task.createdAt || now,
      task.updatedAt || now
    );

    if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
      const insertSub = this.db.prepare(`
        INSERT INTO subtasks (id, task_id, title, completed, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          completed = excluded.completed,
          sort_order = excluded.sort_order
      `);
      task.subtasks.forEach((s, idx) => {
        insertSub.run(s.id, task.id, s.title, s.completed ? 1 : 0, idx, s.createdAt || now);
      });
    }

    return task;
  }

  deleteTask(id) {
    this.db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(id);
    this.db.prepare('DELETE FROM reminders WHERE task_id = ?').run(id);
    const info = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return info.changes > 0;
  }

  addSubtask(subtask) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO subtasks (id, task_id, title, completed, sort_order, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        completed = excluded.completed,
        sort_order = excluded.sort_order
    `).run(subtask.id, subtask.taskId, subtask.title, subtask.completed ? 1 : 0, now);
    return subtask;
  }

  toggleSubtask(taskId, subtaskId) {
    const sub = this.db.prepare('SELECT completed FROM subtasks WHERE id = ?').get(subtaskId);
    if (!sub) return false;
    const next = sub.completed ? 0 : 1;
    this.db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(next, subtaskId);
    return true;
  }

  deleteSubtask(taskId, subtaskId) {
    const info = this.db.prepare('DELETE FROM subtasks WHERE id = ?').run(subtaskId);
    return info.changes > 0;
  }

  // ==========================================================================
  // Reminders Repository
  // ==========================================================================
  getReminders() {
    const rows = this.db.prepare('SELECT * FROM reminders ORDER BY trigger_time ASC').all();
    return rows.map((r) => ({
      id: r.id,
      taskId: r.task_id || undefined,
      title: r.title,
      triggerTime: r.trigger_time,
      dueTimeFormatted: r.due_time_formatted,
      isTriggered: Boolean(r.is_triggered),
      isSnoozed: Boolean(r.is_snoozed),
      snoozeUntil: r.snooze_until || undefined,
      urgency: r.urgency || 'normal',
      createdAt: r.created_at,
    }));
  }

  saveReminder(reminder) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO reminders (id, task_id, title, trigger_time, due_time_formatted, is_triggered, is_snoozed, snooze_until, urgency, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        trigger_time = excluded.trigger_time,
        due_time_formatted = excluded.due_time_formatted,
        is_triggered = excluded.is_triggered,
        is_snoozed = excluded.is_snoozed,
        snooze_until = excluded.snooze_until,
        urgency = excluded.urgency
    `).run(
      reminder.id,
      reminder.taskId || null,
      reminder.title,
      reminder.triggerTime,
      reminder.dueTimeFormatted,
      reminder.isTriggered ? 1 : 0,
      reminder.isSnoozed ? 1 : 0,
      reminder.snoozeUntil || null,
      reminder.urgency || 'normal',
      reminder.createdAt || now
    );
    return reminder;
  }

  deleteReminder(id) {
    const info = this.db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
    return info.changes > 0;
  }

  // ==========================================================================
  // Notes Repository
  // ==========================================================================
  getNotes() {
    const rows = this.db.prepare('SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC').all();
    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content || '',
      pinned: Boolean(n.pinned),
      showOnDashboard: n.show_on_dashboard !== null && n.show_on_dashboard !== undefined ? Boolean(n.show_on_dashboard) : Boolean(n.pinned),
      folder: n.folder || 'General',
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
  }

  saveNote(note) {
    const now = new Date().toISOString();
    const showOnDashboard = note.showOnDashboard !== undefined ? (note.showOnDashboard ? 1 : 0) : (note.pinned ? 1 : 0);
    this.db.prepare(`
      INSERT INTO notes (id, title, content, pinned, show_on_dashboard, folder, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        pinned = excluded.pinned,
        show_on_dashboard = excluded.show_on_dashboard,
        folder = excluded.folder,
        updated_at = excluded.updated_at
    `).run(
      note.id,
      note.title,
      note.content || '',
      note.pinned ? 1 : 0,
      showOnDashboard,
      note.folder || 'General',
      note.createdAt || now,
      note.updatedAt || now
    );
    return note;
  }

  deleteNote(id) {
    const info = this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return info.changes > 0;
  }

  // ==========================================================================
  // Calendar Events Repository (Distinct from Tasks)
  // ==========================================================================
  getEvents() {
    const rows = this.db.prepare('SELECT * FROM events ORDER BY start_time ASC').all();
    return rows.map((e) => {
      let date = new Date().toISOString().split('T')[0];
      let startTime = '09:00';
      let endTime = '10:00';
      if (e.start_time) {
        if (e.start_time.includes('T')) {
          const parts = e.start_time.split('T');
          date = parts[0];
          startTime = parts[1].substring(0, 5);
        } else {
          date = e.start_time;
        }
      }
      if (e.end_time) {
        if (e.end_time.includes('T')) {
          endTime = e.end_time.split('T')[1].substring(0, 5);
        } else {
          endTime = e.end_time;
        }
      }
      return {
        id: e.id,
        title: e.title,
        description: e.description || '',
        startTime,
        endTime,
        date,
        isAllDay: Boolean(e.is_all_day),
        category: e.category || 'meeting',
        color: e.color || '#8B5CF6',
        createdAt: e.created_at,
      };
    });
  }

  saveEvent(event) {
    const now = new Date().toISOString();
    const dateStr = event.date || (event.startTime && event.startTime.includes('-') ? event.startTime.split('T')[0] : now.split('T')[0]);
    const startHour = event.startTime && !event.startTime.includes('-') ? event.startTime : '09:00';
    const endHour = event.endTime && !event.endTime.includes('-') ? event.endTime : startHour;
    const fullStartTime = `${dateStr}T${startHour}:00.000Z`;
    const fullEndTime = `${dateStr}T${endHour}:00.000Z`;
    this.db.prepare(`
      INSERT INTO events (id, title, description, start_time, end_time, is_all_day, category, color, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        is_all_day = excluded.is_all_day,
        category = excluded.category,
        color = excluded.color
    `).run(
      event.id,
      event.title,
      event.description || '',
      fullStartTime,
      fullEndTime,
      event.isAllDay ? 1 : 0,
      event.category || 'meeting',
      event.color || '#8B5CF6',
      event.createdAt || now
    );
    return event;
  }

  deleteEvent(id) {
    const info = this.db.prepare('DELETE FROM events WHERE id = ?').run(id);
    return info.changes > 0;
  }

  // ==========================================================================
  // Timer Repository
  // ==========================================================================
  getTimer() {
    const row = this.db.prepare('SELECT * FROM timer WHERE id = ?').get('main-timer');
    if (!row) {
      return {
        id: 'main-timer',
        mode: 'pomodoro',
        targetSeconds: 1500,
        remainingSeconds: 1500,
        isRunning: false,
        label: 'Focus Flow',
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      id: row.id,
      mode: row.mode,
      targetSeconds: row.target_seconds,
      remainingSeconds: row.remaining_seconds,
      isRunning: Boolean(row.is_running),
      lastStartedAt: row.last_started_at || undefined,
      label: row.label || undefined,
      updatedAt: row.updated_at,
    };
  }

  saveTimer(timer) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO timer (id, mode, target_seconds, remaining_seconds, is_running, last_started_at, label, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        mode = excluded.mode,
        target_seconds = excluded.target_seconds,
        remaining_seconds = excluded.remaining_seconds,
        is_running = excluded.is_running,
        last_started_at = excluded.last_started_at,
        label = excluded.label,
        updated_at = excluded.updated_at
    `).run(
      'main-timer',
      timer.mode,
      timer.targetSeconds,
      timer.remainingSeconds,
      timer.isRunning ? 1 : 0,
      timer.lastStartedAt || null,
      timer.label || 'Focus Flow',
      now
    );
    return timer;
  }

  // ==========================================================================
  // Notifications Repository
  // ==========================================================================
  getNotifications() {
    const rows = this.db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 100').all();
    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      urgency: n.urgency,
      timestamp: n.timestamp,
      isRead: Boolean(n.is_read),
    }));
  }

  addNotification(notification) {
    this.db.prepare(`
      INSERT INTO notifications (id, title, body, urgency, timestamp, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        is_read = excluded.is_read
    `).run(
      notification.id,
      notification.title,
      notification.body,
      notification.urgency || 'normal',
      notification.timestamp,
      notification.isRead ? 1 : 0
    );
  }

  markNotificationRead(id) {
    this.db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  }

  deleteNotification(id) {
    this.db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  }

  clearNotifications() {
    this.db.prepare('DELETE FROM notifications').run();
  }

  // ==========================================================================
  // Notification History Repository (Windows Action Center Tracking)
  // ==========================================================================
  saveNotificationHistory(entry) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO notification_history (id, title, message, type, created_at, clicked, dismissed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        message = excluded.message,
        type = excluded.type,
        clicked = excluded.clicked,
        dismissed = excluded.dismissed
    `).run(
      entry.id,
      entry.title,
      entry.message || entry.body || '',
      entry.type || 'system',
      entry.created_at || entry.createdAt || now,
      entry.clicked ? 1 : 0,
      entry.dismissed ? 1 : 0
    );
    return entry;
  }

  updateNotificationHistoryAction(id, actions) {
    if (actions.clicked !== undefined) {
      this.db.prepare('UPDATE notification_history SET clicked = ? WHERE id = ?').run(actions.clicked ? 1 : 0, id);
    }
    if (actions.dismissed !== undefined) {
      this.db.prepare('UPDATE notification_history SET dismissed = ? WHERE id = ?').run(actions.dismissed ? 1 : 0, id);
    }
  }

  getNotificationHistory() {
    const rows = this.db.prepare('SELECT * FROM notification_history ORDER BY created_at DESC LIMIT 100').all();
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      created_at: r.created_at,
      clicked: Boolean(r.clicked),
      dismissed: Boolean(r.dismissed),
    }));
  }

  // ==========================================================================
  // Settings Repository
  // ==========================================================================
  getSettings() {
    const rows = this.db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return settings;
  }

  setSetting(key, value) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).run(key, String(value), now);
  }

  // ==========================================================================
  // Snapshot Backup & Restore
  // ==========================================================================
  exportSnapshot() {
    return {
      version: '1.0.0-sqlite-wal',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      events: this.getEvents(),
      reminders: this.getReminders(),
      notes: this.getNotes(),
      timer: this.getTimer(),
      notifications: this.getNotifications(),
      settings: this.getSettings(),
    };
  }

  restoreSnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.tasks)) return false;

    const restoreTx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM tasks').run();
      this.db.prepare('DELETE FROM subtasks').run();
      this.db.prepare('DELETE FROM events').run();
      this.db.prepare('DELETE FROM reminders').run();
      this.db.prepare('DELETE FROM notes').run();
      this.db.prepare('DELETE FROM timer').run();
      this.db.prepare('DELETE FROM notifications').run();
      this.db.prepare('DELETE FROM settings').run();

      for (const t of snapshot.tasks) {
        this.saveTask(t);
      }

      if (Array.isArray(snapshot.events)) {
        for (const e of snapshot.events) {
          this.saveEvent(e);
        }
      }

      if (Array.isArray(snapshot.reminders)) {
        for (const r of snapshot.reminders) {
          this.saveReminder(r);
        }
      }

      if (Array.isArray(snapshot.notes)) {
        for (const n of snapshot.notes) {
          this.saveNote(n);
        }
      }

      if (snapshot.timer) {
        this.saveTimer(snapshot.timer);
      }

      if (Array.isArray(snapshot.notifications)) {
        for (const notif of snapshot.notifications) {
          this.addNotification(notif);
        }
      }

      if (snapshot.settings && typeof snapshot.settings === 'object') {
        for (const [k, v] of Object.entries(snapshot.settings)) {
          this.setSetting(k, v);
        }
      }
    });

    restoreTx();
    return true;
  }
}

const databaseManager = new DatabaseManager();
module.exports = { databaseManager, DatabaseManager };
