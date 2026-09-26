# Personal OS — Data Architecture & SQLite Schema Specification

> **Engine**: SQLite 3 via `better-sqlite3` (with web fallback / local storage bridge for browser preview)  
> **Journal Mode**: WAL (Write-Ahead Logging) for concurrent reads & microsecond writes  
> **Integrity**: Foreign key enforcement, strict type affinity, ACID transaction safety

---

## 1. Schema Design Philosophy

1. **Local-First & Offline-First**: 100% of user data resides on local disk. Zero cloud dependencies required for normal operations.
2. **Normalized Core with Fast Denormalized Views**: Critical relational models (Tasks, Subtasks, Habits, Notes) maintain strict foreign keys while maintaining denormalized aggregate columns for instant UI rendering.
3. **Auditability & Soft Deletion**: Every record possesses `created_at`, `updated_at`, and `archived_at` (soft delete) timestamps.
4. **Deterministic Migration Framework**: Incremental, monotonic SQL migration files (`001_initial_schema.sql`, `002_add_reminders.sql`) with schema version tracking in `_schema_migrations`.

---

## 2. Entity Relationship Diagram (ERD)

```
┌──────────────────┐        1:N        ┌──────────────────┐
│     projects     ├───────────────────┤      tasks       │
└──────────────────┘                   └────────┬─────────┘
                                                │ 1:N
                                       ┌────────┴─────────┐
                                       │     subtasks     │
                                       └──────────────────┘

┌──────────────────┐        1:N        ┌──────────────────┐
│      habits      ├───────────────────┤    habit_logs    │
└──────────────────┘                   └──────────────────┘

┌──────────────────┐        1:N        ┌──────────────────┐
│      goals       ├───────────────────┤   key_results    │
└──────────────────┘                   └──────────────────┘

┌──────────────────┐                   ┌──────────────────┐
│      notes       │                   │  focus_sessions  │
└──────────────────┘                   └──────────────────┘

┌──────────────────┐                   ┌──────────────────┐
│      events      │                   │    reminders     │
└──────────────────┘                   └──────────────────┘
```

---

## 3. SQL DDL Table Definitions

### 3.1 Migration Tracker
```sql
CREATE TABLE IF NOT EXISTS _schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Projects & Tasks
```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#007AFF',
  icon TEXT DEFAULT 'folder',
  archived_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('P0', 'P1', 'P2', 'P3')) DEFAULT 'P2',
  status TEXT CHECK(status IN ('todo', 'in_progress', 'completed', 'canceled')) DEFAULT 'todo',
  due_date TEXT, -- ISO8601 (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
  estimated_minutes INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  tags TEXT, -- JSON array of strings e.g. ["#code", "#deepwork"]
  sort_order REAL DEFAULT 0,
  completed_at DATETIME,
  archived_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Habits & Habit Logs
```sql
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'zap',
  color TEXT DEFAULT '#22C55E',
  frequency TEXT DEFAULT 'daily', -- 'daily', 'weekdays', 'weekly'
  target_days_per_week INTEGER DEFAULT 7,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  archived_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
```

### 3.4 Notes & Scratchpad
```sql
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  pinned INTEGER DEFAULT 0,
  tags TEXT, -- JSON array
  folder TEXT DEFAULT 'General',
  archived_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title,
  content,
  content='notes',
  content_rowid='rowid'
);
```

### 3.5 Focus Sessions
```sql
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL, -- 'pomodoro', 'deep_work', 'ultradian', 'stopwatch'
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  target_minutes INTEGER NOT NULL,
  actual_minutes INTEGER NOT NULL,
  completed INTEGER DEFAULT 1,
  started_at DATETIME NOT NULL,
  ended_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
```

### 3.6 Calendar Events & Reminders
```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  is_all_day INTEGER DEFAULT 0,
  category TEXT DEFAULT 'event', -- 'event', 'timeblock', 'meeting'
  color TEXT DEFAULT '#007AFF',
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  trigger_time DATETIME NOT NULL,
  is_triggered INTEGER DEFAULT 0,
  is_snoozed INTEGER DEFAULT 0,
  snooze_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.7 Key-Value Settings & System Config
```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Performance & Durability Pragmas

When initializing Better-SQLite3:
```javascript
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('temp_store = MEMORY');
db.pragma('cache_size = -64000'); // 64MB memory cache
```
This guarantees microsecond write speeds and zero database locks while safeguarding data integrity.
