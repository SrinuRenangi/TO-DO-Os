# Personal Organizer (Personal OS) — v1.0.0

[![Release](https://img.shields.io/badge/release-v1.0.0--RC1-blue.svg)](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/RELEASE_NOTES_v1.0.md)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/package.json)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-lightgrey.svg)]()
[![Database](https://img.shields.io/badge/storage-SQLite%20WAL-orange.svg)](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/DATABASE.md)
[![Zero-AI](https://img.shields.io/badge/philosophy-Deterministic%20%7C%20Zero--AI-purple.svg)]()

> **Industrial-grade, offline-first personal operating system and 24/7 desktop tray companion.** Engineered with SQLite Write-Ahead Logging (WAL) durability, native Windows Action Center toasts, zero external cloud dependencies, and zero speculative AI bloat.

---

## ⚡ Core Philosophy & Architecture Highlights

Personal Organizer is built for power users who demand uncompromising reliability, deterministic execution, and sub-100ms desktop responsiveness:

- **100% Local-First & Air-Gapped**: Runs entirely offline with zero external network requests or telemetry.
- **SQLite WAL Durability**: All tasks, subtasks, notes, reminders, and timers persist via `better-sqlite3` in Write-Ahead Logging (`PRAGMA journal_mode = WAL`) mode with foreign-key cascade integrity.
- **24/7 Tray Daemon**: Minimizes to the Windows system tray with continuous background scheduling, sleep/wake reconciliation, and launch-on-startup support.
- **Native Windows Action Center**: Dispatches native notifications with foreground window focus upon click.
- **Pure Deterministic Engine**: No speculative algorithms, no "productivity scores", no hallucinations—every metric is calculated directly from your actual data.

---

## 🖥️ The 7 Core Modules

| Module | Primary Capabilities |
| :--- | :--- |
| **1. Executive Dashboard** | 6 live real-data telemetry panels: Today's Tasks, Upcoming Reminders, Notification Audit Log, Calendar Snapshot, Wall-Clock Timer, and Quick Notes Scratchpad. |
| **2. Task Management** | Hierarchical subtasks, P0–P3 priority matrix, category grouping (`Engineering`, `Architecture`, `Product`, `Design`, `Personal`), recurring generators (`daily`, `weekly`, `monthly`, `custom`), multi-field sorting, and date filters. |
| **3. Interactive Calendar** | Deterministic 4-mode calendar (Month Grid, 7-Day Week, 24-Hour Day, Chronological Agenda) with direct mapping to SQLite task deadlines and reminders. |
| **4. Smart Reminders** | Native Windows toast alerts, multi-frequency chime synthesis (Web Audio API), snooze presets (`5m`, `15m`, `30m`, `1h`, `1d`), and automatic next-occurrence recalculation for recurring items. |
| **5. Notes & Scratchpad** | Markdown notes repository with live preview toggle, pin-to-top hierarchy, search indexing, and 1-click scratchpad-to-task conversion. |
| **6. Focus & Ambient Timer** | Pomodoro, Short Break, and Long Break presets with real-time analog clock synchronization and synthesized ambient noise generators (Rain, Wind, White Noise, Waves). |
| **7. Settings & Disaster Recovery** | System launch-on-startup toggle, single-click JSON snapshot export/import with validation, dark/light theme switching, and database status metrics. |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or `v24.x` (LTS recommended)
- **npm**: `v10.x` or `v11.x`
- **OS**: Windows 10 or Windows 11 (x64)

### Running in Development
```powershell
# Clone the repository
git clone https://github.com/SrinuRenangi/TO-DO-Os.git
cd TO-DO-Os

# Install dependencies
npm install

# Run the frontend dev server
npm run dev

# Launch desktop Electron companion
npm run desktop
```

### Launching Standalone Desktop Application
Double-click `Launch Personal Organizer.bat` in the root folder, or run:
```powershell
npm run desktop
```

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Ctrl + K` or `Cmd + K` | Open Raycast-style Command Palette | Global |
| `Ctrl + N` or `Cmd + N` | Quick Capture Task Modal | Global |
| `Escape` | Close modals / Clear search inputs | Modal / Search |
| `Enter` | Submit task creation / confirm action | Form inputs |

---

## 📦 Packaging & Distribution

Personal Organizer is configured for automated Windows packaging using `electron-builder`:

```powershell
# Build web assets and package Windows NSIS Installer & Portable binary
npm run package

# Test unpacked directory distribution
npm run package:dir
```

Output artifacts are generated in the `release/` directory:
- **NSIS Installer**: `Personal Organizer Setup 1.0.0.exe` (Desktop & Start Menu shortcuts, custom install directory)
- **Portable Binary**: `Personal Organizer 1.0.0.exe` (Self-contained, zero-install executable)

---

## 📚 Documentation Suite

Comprehensive technical and operational manuals are available:

- [ARCHITECTURE.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/ARCHITECTURE.md) — System architecture, IPC bridge, process isolation, and scheduler daemon.
- [USER_GUIDE.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/USER_GUIDE.md) — End-user operational manual for all 7 modules and workflows.
- [INSTALLATION.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/INSTALLATION.md) — Build prerequisites, compilation instructions, and installer flags.
- [DATABASE.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/DATABASE.md) — SQLite schema DDL, indexing strategy, foreign key cascades, and WAL configuration.
- [BACKUP_AND_RESTORE.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/BACKUP_AND_RESTORE.md) — JSON snapshot format, migration rules, and disaster recovery procedures.
- [TROUBLESHOOTING.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/TROUBLESHOOTING.md) — Action Center troubleshooting, background throttling, and database diagnostics.
- [RELEASE_NOTES_v1.0.md](file:///c:/Users/sriva/OneDrive/Desktop/Projects/TO-DO/RELEASE_NOTES_v1.0.md) — Version 1.0.0 feature highlights, performance benchmarks, and release verification.

---

## 🛡️ License

Personal Organizer is released under the **ISC License**. Built by the **Personal OS Team**.
