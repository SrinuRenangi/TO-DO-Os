# Personal OS — 24/7 Runtime & Native Desktop Daemon Specification

> **Document Version**: 1.0.0  
> **Status**: Approved Production Specification  
> **Target OS**: Windows 11 / 10 Native Desktop Runtime  
> **Objective**: 365-Day Unattended Stability, <200MB Idle RAM, <2% Idle CPU, Sub-10ms Wakeup Reconciliation

---

## 1. Architectural Topology & Service Hierarchy

Personal OS operates as a **persistent background daemon** that hosts an on-demand, hardware-accelerated presentation shell (Dashboard). Closing the main window never terminates the application; it transitions into a low-power background mode.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PERSONAL OS RUNTIME DAEMON                            │
│  (Single-Instance Supervisor Process · Electron Main · Node.js 20+ Runtime) │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │   System Tray Manager │  │  Auto-Startup Service │  │ Watchdog Engine │  │
│  │  - Minimize to tray   │  │  - Windows Registry/  │  │ - Service Pings │  │
│  │  - Dynamic tray menu  │  │    LoginItemSettings  │  │ - Auto-Recovery │  │
│  │  - Quick capture trigger│ │  - Silent background  │  │ - Leak Auditing │  │
│  └───────────┬───────────┘  └───────────────────────┘  └────────┬────────┘  │
│              │                                                   │          │
│  ┌───────────▼───────────┐  ┌───────────────────────┐  ┌─────────▼───────┐  │
│  │  Background Scheduler │  │  Notification Engine  │  │  Power Monitor  │  │
│  │  - Delta-timer Queue  │  │  - Windows Native API │  │  - Sleep/Resume │  │
│  │  - Recurring tasks    │  │  - Audio escalation   │  │  - Hibernate    │  │
│  │  - Habit & Goal ticks │  │  - Snooze & Action bus│  │  - Reconciliation│ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └─────────────────┘  │
│              │                          │                                   │
│  ┌───────────▼──────────────────────────▼───────────┐                       │
│  │       Local Database & State Recovery Engine     │                       │
│  │  - Better-SQLite3 WAL Engine                     │                       │
│  │  - Session & Timer Snapshots                     │                       │
│  │  - 100% Offline Durability                       │                       │
│  └──────────────────────────────────────────────────┘                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ IPC (Context Isolated)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (On-Demand Dashboard Canvas)               │
│         (React 18 + TailwindCSS + Framer Motion + Web Audio Synthesizer)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Service Specifications

### 2.1 Auto-Startup Service (`AutoStartService`)
* **Mechanism**: Electron `app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true, path: process.execPath })`.
* **Behavior**:
  - Automatically initializes on Windows boot.
  - Launches in **headless tray mode** (`openAsHidden: true`): system tray icon initializes silently, background scheduler starts, main window remains unmapped until explicitly invoked.
  - Configurable toggle in Settings persisted to SQLite `settings` table.

### 2.2 System Tray Manager (`TrayManager`)
* **Window Interception**:
  - `mainWindow.on('close', (e) => { if (!app.isQuitting) { e.preventDefault(); mainWindow.hide(); } })`.
* **Tray Capabilities**:
  - High-DPI icon with dynamic status dot (Active Focus, Pending Reminders, Idle).
  - Native Context Menu:
    - *Open Personal OS Dashboard* (Double click or menu click)
    - *Start Quick 25m Focus Block*
    - *Add Quick Task*
    - *Active Timer Display* (`Flow: 38:12 remaining`)
    - *Mute Audio / Ambient Sound*
    - *Quit Personal OS* (Requires explicit user confirmation)

### 2.3 Precision Event-Driven Background Scheduler (`BackgroundScheduler`)
* **Anti-Pattern Avoided**: Zero polling loops (`setInterval(..., 1000)` checking all DB tables every second is strictly prohibited).
* **Architecture**: **Delta-Timer Min-Heap Queue**:
  - All upcoming deadlines (task due dates, reminders, habit check prompts, automated database backups) are maintained in a memory-efficient priority queue sorted by timestamp.
  - The scheduler sleeps until the exact timestamp of the nearest event via a single `setTimeout`.
  - When an event fires or when new tasks are added via IPC, the schedule calculates the next sleep delta and re-arms.
  - Typical CPU utilization: **0.00%** while waiting.

### 2.4 Notification Engine & Escalation System (`NotificationEngine`)
* **Native Integration**: Leverages native Windows 10/11 Action Center notifications (`new Notification({ title, body, icon, sound })`).
* **Escalation Levels**:
  1. **Level 1 (Subtle / Informational)**: Quiet toast in tray, no intrusive audio (e.g. habit reminder, daily briefing).
  2. **Level 2 (Standard Actionable)**: Native notification banner with gentle chime and inline actions (`Done`, `Snooze 15m`).
  3. **Level 3 (P0 Critical / Urgent)**: Repetitive chime every 3 minutes and tray flashing until explicitly acknowledged or dismissed.

### 2.5 Sleep, Hibernate & Wakeup Reconciler (`PowerMonitorService`)
* **OS Events**:
  - `powerMonitor.on('suspend')`: Pauses active countdown timers, snapshots state to SQLite `runtime_state`, flushes WAL journal.
  - `powerMonitor.on('resume')`: Calculates elapsed suspension time ($\Delta t = t_{\text{resume}} - t_{\text{suspend}}$).
* **Reconciliation Algorithm**:
  1. Identifies all reminders and deadlines where $t_{\text{due}} \le t_{\text{resume}}$.
  2. Batches missed notifications into a consolidated "While you were away" executive summary.
  3. Resumes or adjusts active focus timers based on user recovery policy.

### 2.6 Startup & Crash Recovery Engine (`RecoveryEngine`)
* **Cold Boot Resilience**:
  - On application startup, reads `runtime_state` table.
  - If a focus session was running prior to unexpected shutdown or crash, calculates elapsed duration and logs completed or partial minutes.
  - Re-arms recurring cron schedules and rebuilds the scheduler priority queue.

### 2.7 Watchdog & Self-Healing Supervisor (`WatchdogService`)
* **Health Heartbeat**:
  - Performs an internal health ping every 60 seconds across all 5 sub-services.
  - Verifies SQLite connection vitality via `SELECT 1`.
  - Audits memory footprint: triggers V8 garbage collection hint if memory creeps above 180MB in background state.
  - If any sub-service throws an unhandled error, the watchdog captures the exception, logs it, and restarts the sub-service without taking down the process.

---

## 3. Resource Budget & 365-Day Stability Guarantees

| Metric | Target | Enforcement Strategy |
| :--- | :--- | :--- |
| **Idle Memory (Background Tray)** | $< 120\text{ MB}$ | Chromium renderer process sleeping or background throttled; DOM unmounted from memory when closed for >30 minutes. |
| **Idle CPU** | $< 0.5\%$ | Event-driven delta timers; zero active `setInterval` loops when idle. |
| **Storage Growth** | $< 50\text{ MB/year}$ | SQLite auto-vacuum enabled, log rotation capped at 10,000 entries. |
| **Uptime Resilience** | 365 days | No global uncollected event listeners; all callbacks use WeakRef or explicit lifecycle disposers. |
