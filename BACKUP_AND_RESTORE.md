# Backup & Disaster Recovery Guide — Personal Organizer v1.0.0

## 1. Overview

Personal Organizer incorporates an enterprise-grade disaster recovery architecture featuring:
- **Single-Click JSON Snapshot Export & Import**: Complete system portability across machines.
- **Atomic Transactions**: All imports run inside a single `db.transaction()` wrapper—either 100% of data is restored or the operation safely rolls back.
- **Idempotent Cascade Handling**: Subtasks and reminders are deduplicated during restoration to prevent unique constraint failures.
- **Direct WAL File-Level Backups**: Standard SQLite file copying for enterprise automation.

---

## 2. JSON Snapshot Format Specification

When exported, the backup file is formatted as a structured JSON object with complete table fidelity:

```json
{
  "version": "1.0.0",
  "timestamp": "2026-09-28T18:00:00.000Z",
  "system": "Personal Organizer Standalone Desktop OS",
  "data": {
    "tasks": [
      {
        "id": "task_1790409476851",
        "title": "Deploy v1.0 Production Release",
        "description": "<!--category:Engineering-->Execute final release checklist.",
        "priority": "P0",
        "status": "todo",
        "dueDate": "2026-09-29",
        "dueTime": "14:00",
        "recurring": "none",
        "subtasks": [
          {
            "id": "subtask_1790409476852",
            "taskId": "task_1790409476851",
            "title": "Verify Electron Builder targets",
            "completed": 1,
            "createdAt": "2026-09-28T18:05:00.000Z"
          }
        ],
        "createdAt": "2026-09-28T18:00:00.000Z",
        "updatedAt": "2026-09-28T18:05:00.000Z"
      }
    ],
    "reminders": [
      {
        "id": "rem_1790409476853",
        "taskId": "task_1790409476851",
        "title": "Reminder: Deploy v1.0 Production Release",
        "scheduledTime": "2026-09-29T13:45:00.000Z",
        "urgency": "critical",
        "recurring": "none",
        "status": "pending",
        "createdAt": "2026-09-28T18:00:00.000Z"
      }
    ],
    "notes": [
      {
        "id": "note_1790409476854",
        "title": "Release Architecture Specifications",
        "content": "# Production Architecture Notes\n- SQLite WAL durability verified.",
        "category": "Architecture",
        "pinned": 1,
        "createdAt": "2026-09-28T18:00:00.000Z",
        "updatedAt": "2026-09-28T18:00:00.000Z"
      }
    ],
    "timers": [],
    "notifications": [],
    "settings": {
      "theme": "dark",
      "launchOnStartup": "true"
    }
  }
}
```

---

## 3. UI Export & Restore Procedures

### 3.1 Exporting a Snapshot
1. Launch Personal Organizer and navigate to **Settings** (gear icon in sidebar).
2. Scroll to the **Data Management & Backup** section.
3. Click the **"Export Database Backup"** button.
4. Your browser/desktop environment will prompt you to save a JSON file named:
   `personal_organizer_backup_<YYYY-MM-DD>.json`.
5. Store this file in a secure location (cloud drive, external drive, or encrypted archive).

### 3.2 Restoring from a Snapshot
1. Open **Settings > Data Management & Backup**.
2. Click **"Restore from Backup"**.
3. Select your previously exported `.json` file in the Windows file dialog.
4. The application executes the restore sequence:
   - Validates JSON format and schema integrity.
   - Clears existing tables cleanly.
   - Restores tasks, child subtasks, reminders, notes, and preferences.
   - Automatically synchronizes all active UI stores.
5. A confirmation banner will indicate: *"Database restored successfully."*

---

## 4. File-Level Backup Procedure

For automated nightly backups or enterprise server backups, you can back up the raw SQLite files directly:

### Step 1: Locate the SQLite Database
The SQLite database resides in:
```text
%APPDATA%\personal-organizer\
```
Or in the root of the portable distribution folder:
- `personal_organizer.db`
- `personal_organizer.db-wal`
- `personal_organizer.db-shm`

### Step 2: Safe Copy (With Checkpointing)
Because SQLite operates in WAL mode, active transactions may reside in `personal_organizer.db-wal`. To ensure a complete backup without stopping the background tray daemon:
```powershell
# Using SQLite CLI to checkpoint and copy cleanly:
sqlite3 "personal_organizer.db" "PRAGMA wal_checkpoint(TRUNCATE);"
Copy-Item "personal_organizer.db" "C:\Backups\personal_organizer_$(Get-Date -Format 'yyyyMMdd').db"
```
Or if Personal Organizer is closed completely (via Tray > Quit Completely):
```powershell
Copy-Item "personal_organizer.*" "C:\Backups\"
```

---

## 5. Disaster Recovery Procedures

### Scenario A: Accidental Data Deletion
1. Open **Settings**.
2. Click **"Restore from Backup"**.
3. Select the most recent JSON backup to restore your exact system state.

### Scenario B: Database File Corruption (e.g., Disk Failure)
1. Quit Personal Organizer completely (`Right-click tray icon > Quit Completely`).
2. Navigate to `%APPDATA%\personal-organizer\`.
3. Move or delete corrupted `personal_organizer.db*` files.
4. Launch Personal Organizer. The database manager will detect the missing database and automatically initialize a clean, seeded SQLite WAL schema.
5. Open **Settings > Restore from Backup** to restore your snapshot.

### Scenario C: Migrating to a New Machine
1. On the old machine, click **Settings > Export Database Backup**.
2. Transfer the exported `.json` file to your new machine (via USB or network).
3. Install Personal Organizer on the new machine.
4. Open **Settings > Restore from Backup** and select the file.
5. All tasks, reminders, notes, and custom categories are instantly restored.
