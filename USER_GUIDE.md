# Personal Organizer (Personal OS) — User Guide

Welcome to **Personal Organizer**, an industrial-grade, offline-first personal operating system designed to manage your tasks, reminders, schedule, and notes with maximum speed and zero friction.

---

## 📑 Table of Contents
1. [Getting Started & Interface Overview](#1-getting-started--interface-overview)
2. [Global Navigation & Shortcuts](#2-global-navigation--shortcuts)
3. [Module 1: Executive Dashboard](#3-module-1-executive-dashboard)
4. [Module 2: Task Management](#4-module-2-task-management)
5. [Module 3: Interactive Calendar](#5-module-3-interactive-calendar)
6. [Module 4: Smart Reminders & Action Center](#6-module-4-smart-reminders--action-center)
7. [Module 5: Notes & Scratchpad](#7-module-5-notes--scratchpad)
8. [Module 6: Focus & Ambient Sound Engine](#8-module-6-focus--ambient-sound-engine)
9. [Module 7: Settings & Backup Recovery](#9-module-7-settings--backup-recovery)
10. [System Tray & Background Daemon](#10-system-tray--background-daemon)

---

## 1. Getting Started & Interface Overview

Upon launching Personal Organizer, you will be presented with the primary workspace:
- **Left Navigation Rail**: Quick access to all 7 core modules, quick search, theme toggle, and database status.
- **Top Header Bar**: Current module title, quick search bar (`Ctrl+K`), quick task capture button (`Ctrl+N`), and theme switch.
- **Main Viewport**: Responsive, interactive canvas showing your active module.

---

## 2. Global Navigation & Shortcuts

Personal Organizer is optimized for keyboard-first efficiency:

| Keybinding | Function | Description |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | **Command Palette** | Instant fuzzy search across modules, commands, and settings. |
| `Ctrl + N` / `Cmd + N` | **Quick Capture** | Modal dialog to capture a new task from anywhere in the app. |
| `Escape` | **Dismiss / Close** | Closes any active modal, search palette, or popover. |
| `Enter` | **Submit** | Submits the current form or saves the active item. |

---

## 3. Module 1: Executive Dashboard

The Executive Dashboard acts as your central command deck, aggregating telemetry from all core services into 6 real-data panels:

1. **Today's Tasks**: Shows tasks due on today's date. Click the checkbox to mark tasks completed, or click any task to inspect details.
2. **Upcoming Reminders**: Displays imminent alarms scheduled for the next 24–48 hours. Includes 1-click snooze and dismiss actions.
3. **Notification Audit Feed**: Real-time log of recent notifications with priority status badges and relative timestamps.
4. **Calendar Snapshot**: Immediate visual agenda of today's schedule and events.
5. **Wall-Clock & Focus Timer**: Real-time analog clock paired with the active Pomodoro/Break session status.
6. **Quick Notes Scratchpad**: Rapid notepad for thoughts; contains a **"Convert to Task"** button to turn notes into actionable items.

---

## 4. Module 2: Task Management

### 4.1 Creating a Task
1. Navigate to **Tasks** in the left sidebar or press `Ctrl + N`.
2. Enter the task **Title** (required).
3. Select **Priority**:
   - **P0 Critical** (Red badge)
   - **P1 High** (Orange badge)
   - **P2 Normal** (Blue badge)
   - **P3 Low** (Green badge)
4. Choose a **Category**:
   - `Engineering`, `Architecture`, `Product`, `Design`, or `Personal`.
5. Specify **Due Date** (`YYYY-MM-DD`) and optional **Due Time** (`HH:MM`).
6. Set **Recurring Pattern**:
   - `None`, `Daily`, `Weekly`, `Monthly`, or `Custom`.
7. Configure **Reminder Alert**:
   - Toggle reminder enabled and select urgency level (`normal`, `urgent`, `critical`).
8. Click **Add Task**.

### 4.2 Subtasks & Hierarchical Decomposition
- Click on any task card to expand its detail drawer.
- In the **Subtasks** section, type a checklist item and press `Enter`.
- Check off subtasks as you complete them; progress updates automatically.

### 4.3 Sorting & Filtering
- **Date Filters**: Switch between `All`, `Today`, `Upcoming`, and `Overdue`.
- **Priority Filter**: Filter by `P0`, `P1`, `P2`, `P3`, or view all.
- **Category Filter**: View tasks by specific department or personal domain.
- **Sorting Fields**: Sort by `Due Date`, `Priority`, `Title`, or `Creation Date` in ascending or descending order.
- **View Modes**: Toggle between standard **List View** and visual **Kanban View**.

---

## 5. Module 3: Interactive Calendar

The Calendar service provides 4 deterministic views synchronized with your SQLite database:

1. **Month Grid View**: Traditional 35/42-day calendar matrix. Days with scheduled deadlines display color-coded priority pills.
2. **7-Day Week View**: Hourly time-grid across 7 columns (Monday to Sunday) mapping out due times.
3. **24-Hour Day View**: Detailed single-day timeline showing tasks and reminders scheduled throughout the day.
4. **Chronological Agenda View**: Linear chronological list of all future items grouped by date.

**Navigation**: Use the `<` and `>` buttons to advance or rewind months/weeks/days, or click **"Today"** to snap back to the current date.

---

## 6. Module 4: Smart Reminders & Action Center

Personal Organizer delivers reminders using both native Windows OS alerts and synthesized audio:

- **Windows Action Center**: Toast notifications appear in the bottom-right corner of your desktop. Clicking the notification restores Personal Organizer and highlights the relevant item.
- **Acoustic Chimes**: Custom harmonic chords synthesized via Web Audio API alert you even if you are looking away from your screen.
- **Snooze Presets**:
  - `5 minutes`
  - `15 minutes`
  - `30 minutes`
  - `1 hour`
  - `1 day`
- **Dismiss & Delete**: Mark reminders resolved to prevent future alerts.

---

## 7. Module 5: Notes & Scratchpad

A lightweight, distraction-free markdown environment:

- **Creating & Organizing Notes**: Click **"New Note"**, enter a title, and assign a folder category (`Engineering`, `Architecture`, `Personal`).
- **Markdown Editing**: Write in GitHub Flavored Markdown (headings, bold, italics, code blocks, lists).
- **Preview Toggle**: Switch between **Edit Mode** and **Preview Mode** to inspect rendered markdown.
- **Pinning**: Pin critical reference documents to keep them locked at the top of the list.
- **Scratchpad-to-Task**: Type notes quickly in the scratchpad, then click **"Convert to Task"** to automatically parse the first line into a P1 task with a `#capture` tag.

---

## 8. Module 6: Focus & Ambient Sound Engine

Stay in deep work with the integrated Pomodoro and Ambient Sound generator:

- **Timer Modes**:
  - **Pomodoro** (25 minutes)
  - **Short Break** (5 minutes)
  - **Long Break** (15 minutes)
- **Controls**: Start (`Play`), Pause (`Pause`), and Reset (`RotateCcw`).
- **Ambient Sound Synthesizer**: Generates background soundscapes locally without audio streaming or file loading:
  - 🌧️ **Rain**: Soothing pink-noise raindrops.
  - 💨 **Wind**: Low-frequency resonant breeze.
  - 📻 **White Noise**: Pure broadband masking noise.
  - 🌊 **Ocean Waves**: Modulated rhythmic coastal surf.
- **Volume Slider**: Adjust sound level from 0% to 100%.

---

## 9. Module 7: Settings & Backup Recovery

- **Launch on Startup**: Enable or disable Windows auto-start on boot. When enabled, Personal Organizer runs in the background system tray.
- **Theme**: Toggle between Dark Mode and Light Mode.
- **Database Snapshot Export**:
  - Click **"Export Database Backup"** to save a timestamped JSON snapshot containing all tasks, subtasks, notes, reminders, and timers.
- **Database Snapshot Restore**:
  - Click **"Restore from Backup"** to upload a previously exported JSON file. The system validates the schema and performs an atomic transaction restore.

---

## 10. System Tray & Background Daemon

Personal Organizer is designed as a continuous 24/7 desktop companion:

- **Minimizing**: Clicking the window `X` (Close) hides the window to the system tray rather than quitting.
- **System Tray Icon**:
  - **Left-Click**: Brings Personal Organizer to the foreground.
  - **Right-Click Menu**:
    - `Open Personal Organizer`: Restores window.
    - `New Task`: Opens Quick Capture modal.
    - `Snooze Alerts 30m`: Temporarily silences alerts.
    - `Mute Notifications`: Toggles audio chimes.
    - `Status: Ready`: Displays scheduler status.
    - `Quit Completely`: Terminates background daemon and closes the application.
