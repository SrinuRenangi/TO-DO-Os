# Personal OS — Phase 1 Execution Plan & Quality Gates

> **Standard**: SPEC ↓ PLAN ↓ ARCHITECT ↓ DESIGN ↓ IMPLEMENT ↓ VERIFY ↓ DOCUMENT ↓ COMMIT ↓ RELEASE  
> **Phase**: Phase 1 — Foundation, Design System & The Production-Grade Dashboard

---

## 1. Objectives & Deliverables

1. **Architecture & Specification (Complete)**:
   - [x] Vision & Core Mission Alignment (`docs/vision.md`)
   - [x] Definitive Dashboard Specification & PRD (`architecture/dashboard-spec.md`)
   - [x] System Architecture (`architecture/system-overview.md`)
   - [x] Frontend Architecture (`architecture/frontend-architecture.md`)
   - [x] Data Layer & SQLite Schema Architecture (`architecture/data-architecture.md`)
   - [x] IPC Architecture & Typed Contract (`architecture/ipc-architecture.md`)
   - [x] 16 Core Modules Specification (`architecture/modules-specification.md`)
   - [x] Design System & Visual Tokens (`design-system/tokens.md`)

2. **Phase 1 Implementation Plan**:
   - **Step 1: Core Type Definitions & Domain Contracts (`src/shared/types/`)**:
     - Task, Subtask, Priority, Status, Project models.
     - Habit, HabitLog, HabitFrequency models.
     - FocusSession, FocusMode, SoundType models.
     - Note, NoteFolder models.
     - CalendarEvent, Reminder models.
     - Global Navigation & System State.
   - **Step 2: Reactive State Management Layer (`src/renderer/stores/`)**:
     - `useAppStore`: Navigation, active module, search query, theme mode (Dark/Light).
     - `useTaskStore`: Tasks CRUD, filtering by priority/status, completion toggle, subtasks.
     - `useHabitStore`: Daily habits, streak increment logic, completion toggling.
     - `useFocusStore`: Pomodoro / Deep Work timer ticker, start/pause/reset, sound synthesizer trigger.
     - `useNotesStore`: Scratchpad persistent buffer with auto-save & convert to task action.
     - `useCalendarStore`: Daily events timeline & upcoming timeblocks.
   - **Step 3: Web Audio Ambient Synthesizer (`src/renderer/lib/sound-synth.ts`)**:
     - Pure Web Audio API engine (Rain, White Noise, 40Hz Gamma Focus Beats, Completion Chime) with 0 external dependencies.
   - **Step 4: Design System Primitives & Tokens (`src/renderer/styles/`)**:
     - Complete CSS token variables for Dark & Light modes.
     - Glassmorphism utility classes (`glass-panel`, `glass-card`).
     - SF Pro / Inter typography typography classes and tabular numbers.
   - **Step 5: Shell & Layout Components (`src/renderer/components/layout/`)**:
     - `AppShell`: Collapsible Arc-style sidebar with module shortcuts, active indicators, and notifications counter.
     - `TitleBar`: Native desktop window controls (minimize, maximize, close) and status heartbeat.
     - `CommandPalette`: Raycast-style `Cmd+K` / `Ctrl+K` searchable omnibar.
   - **Step 6: Production-Grade Dashboard Canvas (`src/renderer/components/dashboard/`)**:
     - `DashboardHeader`: Contextual greeting, real-time clock, productivity gauge (0-100), quick actions.
     - `ExecutionHub (Zone A)`: Priority queue (P0, P1, P2), inline completion, tag chips, habit momentum strip.
     - `TemporalEngine (Zone B)`: Focus session widget with live timer and ambient audio controls, Apple-grade day timeline.
     - `CognitiveSpace (Zone C)`: Scratchpad with 1-click task conversion, 7-day velocity bar chart, AI ambient briefing, SQLite system status.
   - **Step 7: Verification, Tests & Quality Gates**:
     - Unit tests for Zustand stores (tasks, habits, focus calculation, productivity score engine).
     - Component render verification and visual validation.

---

## 2. Quality Gates Checklist

- [ ] All 16 application module navigation items present and accessible in sidebar and Command Palette.
- [ ] Dashboard renders with pixel-perfect visual hierarchy adhering strictly to design tokens.
- [ ] No cheap gradients or generic cards. High-contrast matte obsidian background (`#0F1117`) with refined 1px borders (`rgba(255, 255, 255, 0.07)`).
- [ ] Live real-time clock and interactive Focus Timer with spring physics.
- [ ] Instant scratchpad with 1-click conversion to tasks.
- [ ] Keyboard navigation: `Ctrl+K` for Command Palette, `1`-`9` for modules, `Esc` to close modals.
- [ ] Light and Dark mode instant switching without styling breaks.
