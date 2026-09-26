# Personal OS — Linux Desktop 2030 Aesthetic & Design Specification

> **Design Paradigm**: KDE Plasma · Garuda Linux · Deepin Linux · Hyprland · Cosmic Desktop  
> **Strict Prohibition**: No Apple/macOS aesthetics, No Windows styles, No generic SaaS dashboards, Zero AI/LLM components.  
> **Vision**: A high-velocity, native desktop productivity control center built in 2030.

---

## 1. Visual Language & Philosophy

Personal OS moves away from soft pastel aesthetics and adopts the **bold, high-precision visual architecture of modern Linux Wayland desktop environments**:

1. **Hyprland Geometry & Neon Borders**:
   - Razor-sharp floating panels with 1px luminous borders.
   - Cyan/Teal accent highlights (`#00F0FF`) paired with Deepin Obsidian (`#0B0D13`) and Plasma Violet (`#8B5CF6`).
   - Subtle outer glow on active/focused widgets (`box-shadow: 0 0 24px rgba(0, 240, 255, 0.12)`).

2. **Garuda / Deepin Glassmorphism**:
   - Deep background blur (`backdrop-filter: blur(24px) saturate(190%)`).
   - Multi-layered translucent surfaces (`rgba(17, 21, 30, 0.75)`).
   - Semi-transparent floating HUD widgets with rounded corners (14px–20px).

3. **Cosmic / KDE Plasma Control Center Ergonomics**:
   - Real-time hardware and daemon telemetry (RAM usage, CPU percentage, scheduler ticks, local SQLite WAL state).
   - High information density with zero clutter.
   - Modular, draggable, customizable floating cards.
   - Keyboard-first command palette (`Ctrl+K`) and quick capture (`Ctrl+N`).

---

## 2. Linux Color Matrix

| Role | Color | Hex | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Void** | Deep Cosmic Black | `#0B0D13` | Root desktop surface |
| **Surface Layer 1** | Garuda Obsidian | `#11151F` | Sidebar, header bar, panel base |
| **Surface Layer 2** | Floating Plasma Card | `#181E2C` | Task cards, widgets, containers |
| **Surface Hover** | Deepin Elevated | `#21293C` | Hover feedback state |
| **Neon Cyan Accent** | Hyprland Cyber Cyan | `#00F0FF` | Primary active accent, focus rings, progress bars |
| **Violet Accent** | Plasma Purple | `#8B5CF6` | Goals, deep work sessions, timeline blocks |
| **Emerald Accent** | Cosmic Green | `#10B981` | Completed tasks, streak milestones, healthy status |
| **Amber Accent** | Wayland Warning | `#F59E0B` | P1 priorities, snooze states, deadlines |
| **Crimson Accent** | Garuda Danger | `#F43F5E` | P0 critical alerts, overdue tasks, stop timer |

---

## 3. Widget Customizability & Floating Architecture

The Dashboard operates as an **interactive desktop control grid**:
- **System Telemetry Bar**: Live clock, uptime counter, RAM usage (<200MB budget), scheduler delta timer indicator.
- **Draggable Floating Cards**:
  - `TasksWidget`: High-priority execution queue with inline completion.
  - `RemindersWidget`: Escalated upcoming alert queue with 1-click snooze.
  - `FocusHudWidget`: Big digital timer with ambient sound synthesizer.
  - `CalendarSnapshotWidget`: Day timeline with red time-rule marker.
  - `HabitHeatmapWidget`: Streaks and 30-day consistency heatmap.
  - `GoalProgressWidget`: Quarterly milestone bars.
  - `QuickNotesWidget`: Markdown buffer with 1-click Convert to Task.
  - `NotificationCenterWidget`: Actionable system reminder feed.
