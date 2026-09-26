# Personal OS — 16 Core Modules Specification

> **Mission**: An intelligent, single-user desktop productivity ecosystem.  
> **Aesthetic Benchmarks**: Arc Browser · Notion · Linear · Raycast · Apple Calendar · TickTick · Motion · Superhuman · Obsidian · Microsoft Loop

---

## 1. Dashboard (Command Center)
* **Archetype**: Raycast + Notion Home + Linear Dashboard.
* **Role**: Primary landing view. Unifies the daily queue, Apple calendar timeline, focus timer, habit momentum, and cognitive scratchpad into one screen.
* **Key Components**:
  - `OSHeaderStrip`: Contextual greeting, real-time clock, productivity index radial gauge (0-100), quick command trigger.
  - `ExecutionHub (Zone A)`: Priority-ranked tasks (P0 Critical, P1 High, P2 Medium), instant inline completion, tag chips.
  - `TemporalEngine (Zone B)`: Deep work focus dial, active hour-by-hour day timeline, escalated alerts.
  - `CognitiveSpace (Zone C)`: Auto-saving markdown scratchpad, 7-day velocity chart, ambient intelligence summary.

---

## 2. Task System
* **Archetype**: Linear + Superhuman.
* **Role**: High-velocity task tracking with keyboard-first ergonomics.
* **Key Capabilities**:
  - Views: List View, Kanban Board, Eisenhower Matrix (Urgent vs Important), and Calendar View.
  - Granular Properties: Status (`todo`, `in_progress`, `completed`, `canceled`), Priority (`P0`, `P1`, `P2`, `P3`), Due Dates, Subtasks with progress bars, Estimated & Actual Time.
  - Hotkeys: `J`/`K` navigation, `X` toggle completion, `C` create task, `Backspace` delete.

---

## 3. Notes System
* **Archetype**: Notion + Obsidian.
* **Role**: Knowledge base and fleeting thought repository.
* **Key Capabilities**:
  - Hybrid Markdown & Rich Text editor with live preview.
  - Bidirectional Wikilinks (`[[Note Title]]`) for knowledge graph synthesis.
  - Folder categorization and pinned notes.
  - Code syntax highlighting, checklist items, and export to PDF/Markdown.

---

## 4. Habit Tracker
* **Archetype**: TickTick + Atomic Habits.
* **Role**: Habitual momentum and ritual adherence.
* **Key Capabilities**:
  - Streaks calculation: Current streak, longest streak, consistency percentage.
  - Visual Heatmap (GitHub-style 52-week grid and 30-day mini view).
  - Frequency rules: Daily, weekdays, or targeted N times per week.
  - Audio and haptic micro-interaction rewards on habit streak completion.

---

## 5. Goal Tracker
* **Archetype**: OKR (Objectives and Key Results) Framework.
* **Role**: Macro-level vision alignment connecting daily actions to quarterly goals.
* **Key Capabilities**:
  - Objectives with target dates and confidence ratings.
  - Quantifiable Key Results (e.g., "$0 to $50,000", "0 to 12 books").
  - Automatic progress calculation rolling up from connected project tasks.

---

## 6. Focus Center
* **Archetype**: Motion + Endel + Forest.
* **Role**: Deep work orchestration and distraction elimination.
* **Key Capabilities**:
  - Focus Modes: Pomodoro (25/5), Deep Work (50/10), Ultradian Rhythm (90m), Custom Stopwatch.
  - Zero-Dependency Web Audio Ambient Sound Generator: Rain, White Noise, 40Hz Gamma Focus Binaural Beats, Gentle Stream.
  - Fullscreen distraction-free HUD mode with large minimal typography.
  - Automatic session logging with task linkage and focus velocity analytics.

---

## 7. Calendar
* **Archetype**: Apple Calendar + Cron.
* **Role**: Visual temporal scheduling and timeblocking.
* **Key Capabilities**:
  - Day, Week, Month, and Agenda views.
  - Native Timeblocking: Drag-and-drop tasks directly onto the calendar to reserve hours.
  - Local ICS calendar import/export.
  - Dynamic red current-time marker updating every 60 seconds.

---

## 8. Reminder System
* **Archetype**: Due + Apple Reminders.
* **Role**: Non-ignorable alerting for critical temporal events.
* **Key Capabilities**:
  - Escalating alarms: Repetitive gentle chime until explicitly acknowledged or snoozed.
  - Smart presets: `+15 min`, `+1 hour`, `Tonight 8 PM`, `Tomorrow 9 AM`.
  - Native OS notifications and system tray flashing alerts.

---

## 9. Analytics Center
* **Archetype**: Linear Insights + Fitness Activity Rings.
* **Role**: Self-quantification and weekly retrospective intelligence.
* **Key Capabilities**:
  - Productivity Index Trend over 7, 30, and 90 days.
  - Focus Hours breakdown by project and time of day.
  - Habit consistency heatmaps and on-time completion rates.
  - Energy Curve Mapping (identifying personal peak productivity windows).

---

## 10. Notification Center
* **Archetype**: macOS Notification Stack + Raycast.
* **Role**: Centralized feed for system events, reminder alerts, and streak warnings.
* **Key Capabilities**:
  - Unread badge counters in the sidebar and system tray.
  - Grouping by category: Tasks, Habits, System, AI Briefing.
  - Inline action buttons: "Mark Done", "Snooze", "Open Note".

---

## 11. Calculator & Converter
* **Archetype**: Raycast Calculator + Alfred + Soulver.
* **Role**: Rapid mathematical and unit calculations without external tools.
* **Key Capabilities**:
  - Natural language expressions (e.g., `15% of 850`, `45 USD in EUR`, `3.5 hours in minutes`).
  - Running history tape with 1-click copy to clipboard.
  - Dedicated view and instant inline evaluation in Command Palette.

---

## 12. Quick Capture
* **Archetype**: Raycast Quick Note + Things Quick Entry.
* **Role**: Instant global capture modal callable from anywhere on the OS in <100ms.
* **Key Capabilities**:
  - Global hotkey invocation (`Ctrl+Shift+Space` or `Option+Space`).
  - Smart type auto-detection: Detects if input is a Task (`!P0 finish spec by 5pm`), a Habit, a Note, or an Event.
  - Sub-100ms cold invocation time.

---

## 13. Command Palette
* **Archetype**: Raycast + Linear Command Menu.
* **Role**: Universal search and action orchestrator (`Cmd+K` / `Ctrl+K`).
* **Key Capabilities**:
  - Fuzzy-search indexing over all 16 modules, tasks, habits, notes, and settings.
  - Command execution: "Toggle Dark Mode", "Start Pomodoro", "Create New Note", "Clear Scratchpad".
  - Instant navigation jump to any module using numbers or text query.

---

## 14. AI Assistant
* **Archetype**: OmniRoute + LangGraph architecture.
* **Role**: Intelligent productivity copilot and daily briefing engine.
* **Key Capabilities**:
  - Dual-engine routing: Supports local offline models (Ollama / Llama 3) and cloud APIs (OpenAI / Gemini / Anthropic).
  - Daily Plan Optimizer: Analyzes tasks, calendar blocks, and deadlines to generate an optimal daily schedule.
  - Natural language task parsing: Extracts dates, priority, and tags from free text.

---

## 15. System Tray & Ambient Daemon
* **Archetype**: native Windows 11 / macOS menu bar companion.
* **Role**: Persistent background presence ensuring zero missed reminders.
* **Key Capabilities**:
  - Minimizes to tray on window close with smooth background operation.
  - Tray context menu: Quick start focus, active timer progress, view today's tasks, quit.
  - Windows auto-start on boot capability.

---

## 16. Settings & Personalization
* **Archetype**: Apple System Settings + Arc Preferences.
* **Role**: Granular customization and local data management.
* **Key Capabilities**:
  - Theme Engine: Pure Matte Obsidian Dark Mode, Crisp Light Mode, and Auto System Sync.
  - Sound effects volume and ambient synthesizer controls.
  - Data Backup & Restore: 1-click JSON/SQLite backup, import/export.
  - Hotkey customizer and privacy diagnostics.
