# Release Verification Checklists — Personal Organizer v1.0.0

This document contains the 6 exhaustive test checklists required for public release certification of **Personal Organizer v1.0.0**.

---

## 📋 Checklist 1: Pre-Release Checklist

| # | Item | Verification Procedure | Expected Result | Status |
| :-: | :--- | :--- | :--- | :-: |
| 1.1 | **Clean Build** | Run `npm run build` | Compiles without errors or warnings in `< 1000ms`. | **PASS** |
| 1.2 | **Type Integrity** | Run `npx tsc --noEmit` | Returns exit code 0 with 0 errors or diagnostic warnings. | **PASS** |
| 1.3 | **Automated Tests** | Run `npm test` | All 21 tests pass across 4 test suites. | **PASS** |
| 1.4 | **No-AI Mandate** | Inspect `MODULE_REGISTRY` & test suite | Exactly 7 core modules registered; 0 AI modules or fake metrics. | **PASS** |
| 1.5 | **Metadata Parity** | Inspect `package.json` | Version is `1.0.0`, author is `Personal OS Team`, name is `personal-organizer`. | **PASS** |
| 1.6 | **Icon Assets** | Inspect `assets/icon.svg` | Crisp 256x256 vector application icon with brand palette. | **PASS** |
| 1.7 | **Offline Air-Gap** | Inspect network requests in DevTools | 0 outgoing HTTP requests, 0 external font CDNs loaded. | **PASS** |

---

## 💨 Checklist 2: Smoke Test Checklist

| # | Workflow | Test Steps | Expected Outcome | Status |
| :-: | :--- | :--- | :--- | :-: |
| 2.1 | **App Startup** | Launch via `Launch Personal Organizer.bat` or `npm run desktop` | App launches in under 1 second; window renders cleanly. | **PASS** |
| 2.2 | **Module Nav** | Click through all 7 sidebar navigation icons | Each module loads immediately with zero blank screens or render flicker. | **PASS** |
| 2.3 | **Command Palette** | Press `Ctrl + K` | Raycast-style command palette animates in; typing filters actions; `Esc` closes. | **PASS** |
| 2.4 | **Quick Capture** | Press `Ctrl + N` | Quick capture modal appears; form submits task; disappears on `Enter` or `Esc`. | **PASS** |
| 2.5 | **Theme Toggle** | Click Dark/Light toggle in sidebar | Interface transitions between dark and light themes instantly. | **PASS** |
| 2.6 | **Analog Clock** | Observe clock on Dashboard / Focus view | Second hand sweeps smoothly in real time without CPU spikes. | **PASS** |

---

## 🔄 Checklist 3: Regression Checklist

| # | Subsystem | Test Steps | Expected Outcome | Status |
| :-: | :--- | :--- | :--- | :-: |
| 3.1 | **Task CRUD** | 1. Create task with P0 priority, category `Engineering`, due date.<br>2. Edit title and priority.<br>3. Toggle status to completed.<br>4. Delete task. | Task saves to SQLite, updates in real time, reflects on Dashboard, and deletes cleanly without lingering artifacts. | **PASS** |
| 3.2 | **Subtask Cascade** | 1. Create parent task with 3 subtasks.<br>2. Toggle 2 subtasks completed.<br>3. Delete parent task. | Subtask progress displays 2/3; deleting parent deletes all child subtasks via SQLite foreign key cascade. | **PASS** |
| 3.3 | **Task Sorting** | Toggle sort order by Due Date, Priority, and Title. | Tasks reorder deterministically in ascending and descending sequences. | **PASS** |
| 3.4 | **Notes Markdown** | 1. Create new note with `# Header`, `**bold**`, and code blocks.<br>2. Toggle Preview mode.<br>3. Pin note to top. | Markdown renders correctly formatted HTML typography; pinned note sticks to the top drawer. | **PASS** |
| 3.5 | **Scratchpad Sync** | Type text into Quick Notes scratchpad on Dashboard; navigate away and return. | Scratchpad content persists across view navigation and restarts. | **PASS** |
| 3.6 | **Focus Timer** | Start 25-minute Pomodoro session; pause and resume; reset. | Timer decrements accurately by 1 second; state persists without time skips. | **PASS** |

---

## 💾 Checklist 4: Backup & Restore Test Checklist

| # | Test Case | Test Steps | Expected Outcome | Status |
| :-: | :--- | :--- | :--- | :-: |
| 4.1 | **Snapshot Export** | 1. Navigate to Settings.<br>2. Click "Export Database Backup". | JSON file downloads with timestamped filename containing full database tables. | **PASS** |
| 4.2 | **Schema Integrity** | Inspect exported JSON file structure in text editor. | File contains `version: "1.0.0"`, `timestamp`, and arrays for `tasks`, `reminders`, `notes`, `timers`. | **PASS** |
| 4.3 | **Atomic Restore** | 1. Add unique task "Restoration Test Canary".<br>2. Export backup.<br>3. Delete canary task.<br>4. Click "Restore from Backup" and select file. | Canary task is restored; SQLite transaction completes with 0 errors; UI refreshes instantly. | **PASS** |
| 4.4 | **Subtask Idempotency** | Repeat snapshot restore 3 consecutive times with subtasks present (DEF-01 verification). | Restores complete cleanly with 0 UNIQUE constraint violations or crashes. | **PASS** |
| 4.5 | **Corrupt File Guard** | Upload invalid JSON or random `.txt` file into restore dialog. | System rejects file safely with user error banner; existing database remains untouched. | **PASS** |

---

## 🔔 Checklist 5: System Tray & Lifecycle Test Checklist

| # | Scenario | Test Steps | Expected Outcome | Status |
| :-: | :--- | :--- | :--- | :-: |
| 5.1 | **Close to Tray** | Click the window `X` (Close) button. | Window hides from screen; process remains active in Windows system tray. | **PASS** |
| 5.2 | **Tray Left-Click** | Left-click the Personal Organizer icon in system tray. | Window is restored to foreground and receives keyboard focus. | **PASS** |
| 5.3 | **Tray Context Menu** | Right-click system tray icon. | Native Windows context menu appears with all 6 menu actions. | **PASS** |
| 5.4 | **Quick Task from Tray** | Click "New Task" from tray context menu. | Window restores and immediately displays Quick Capture modal. | **PASS** |
| 5.5 | **Single Instance** | Attempt to run a second instance while app is active. | Second instance immediately yields; existing instance is focused and restored. | **PASS** |
| 5.6 | **Clean Shutdown** | Right-click tray icon and select "Quit Completely". | Background daemon shuts down cleanly; SQLite WAL log checkpoints; process exits. | **PASS** |

---

## ⏰ Checklist 6: Reminder & Scheduler Test Checklist

| # | Scenario | Test Steps | Expected Outcome | Status |
| :-: | :--- | :--- | :--- | :-: |
| 6.1 | **Alarm Trigger** | Create reminder scheduled for +30 seconds. Wait. | Within 10s of scheduled time, Windows Action Center toast appears and Web Audio chime sounds. | **PASS** |
| 6.2 | **Toast Focus** | Click on the native Windows notification toast banner. | Personal Organizer window is focused and brought to foreground. | **PASS** |
| 6.3 | **Snooze Presets** | Click "Snooze 5m" on triggered reminder in Notification Center. | Reminder rescheduled to +5 minutes; status updates to snoozed; toast dismisses. | **PASS** |
| 6.4 | **Recurring Alarm** | Create task with Daily recurrence and reminder enabled. Mark task complete. | Scheduler advances reminder scheduled time by +24 hours; task resets for next cycle. | **PASS** |
| 6.5 | **Sleep/Wake Recovery** | Set reminder for +1 minute. Put PC to sleep for 2 minutes. Wake PC. | Within 10 seconds of wake, scheduler detects sleep time gap and immediately triggers overdue alarm. | **PASS** |
| 6.6 | **Mute Alerts** | Right-click tray and toggle "Mute Notifications". Trigger an alarm. | Visual notification appears in audit log, but audio chime remains silent. | **PASS** |
