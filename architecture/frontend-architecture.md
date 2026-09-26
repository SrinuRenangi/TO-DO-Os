# Personal OS — Frontend Architecture Specification

> **Status**: Production Architecture  
> **Tech Stack**: React 18, TypeScript, TailwindCSS v4 / v3, Framer Motion, Zustand, Radix UI, Lucide Icons  
> **Target Form Factor**: Electron Desktop Application (Windows 11 / macOS / Linux)

---

## 1. Architectural Principles

1. **Unidirectional Data Flow**: Components read from reactive Zustand slices and dispatch discrete actions.
2. **State & UI Decoupling**: Business rules and state mutations live exclusively in store actions; presentation components remain declarative and pure.
3. **Sub-60fps Budget & Zero-Jank Motion**: Framer Motion transforms strictly leverage GPU-accelerated CSS properties (`transform: translate3d/scale`, `opacity`).
4. **Resilient Offline Architecture**: Every UI state is backed by local Zustand stores with seamless synchronization to the local SQLite engine via typed IPC.
5. **Universal Keyboard Ergonomics**: Raycast-style keyboard-first navigation via global listener and focus rings.

---

## 2. Directory Hierarchy & Clean Separation

```
src/
├── app/                       # Electron Main Process
│   ├── main.ts                # Application lifecycle & window creation
│   ├── tray.ts                # System tray & background daemon
│   ├── menu.ts                # Application menu & shortcuts
│   ├── store.ts               # Local persistence & config
│   └── database/              # SQLite database manager & migration runner
│       ├── db.ts              # Better-SQLite3 connection & WAL mode
│       ├── schema.sql         # Core DDL tables & indexes
│       └── migrations/        # Sequential versioned migrations
│
├── preload/                   # Secure Preload Bridge
│   ├── index.ts               # contextBridge exposure (window.electronAPI)
│   └── types.ts               # IPC Channel & Payload contracts
│
├── shared/                    # Code shared between Main & Renderer
│   ├── types/                 # Pure domain models (Task, Habit, Note, Event, etc.)
│   ├── constants/             # Design constants, channel names, keyboard maps
│   └── validation/            # Zod validation schemas
│
└── renderer/                  # React Frontend Application
    ├── index.html             # Shell template
    ├── main.tsx               # App entrypoint & Provider tree
    ├── App.tsx                # Layout shell & root router
    │
    ├── styles/                # CSS & Design System
    │   ├── globals.css        # Tailwind directives, theme variables, glassmorphism utilities
    │   └── animations.css     # Micro-interaction keyframes
    │
    ├── components/            # Reusable UI Component Library
    │   ├── ui/                # Atomic primitives (Button, Modal, Input, Badge, Dropdown)
    │   ├── layout/            # Shell, Sidebar, Titlebar, Header, CommandBar
    │   ├── dashboard/         # Dashboard-specific widgets (Zone A, B, C components)
    │   ├── tasks/             # Task list, task drawer, priority badge, filters
    │   ├── focus/             # Pomodoro dial, sound generator, session log
    │   ├── habits/            # Streak ring, habit cards, weekly tracker
    │   ├── calendar/          # Day timeline, week grid, event pill
    │   ├── notes/             # Markdown editor, scratchpad, note tree
    │   └── command-palette/   # Raycast-style Cmd+K spotlight dialog
    │
    ├── stores/                # Zustand State Slices
    │   ├── useAppStore.ts     # Global navigation, active tab, sidebar state, theme
    │   ├── useTaskStore.ts    # Tasks, subtasks, filter, search, CRUD actions
    │   ├── useHabitStore.ts   # Habits, daily logs, streak calculation
    │   ├── useFocusStore.ts   # Focus timer, active session, audio synth state
    │   ├── useNotesStore.ts   # Notes, active note, scratchpad buffer
    │   ├── useCalendarStore.ts# Events, timeblocks, active date range
    │   └── useSettingsStore.ts# User preferences, sound effects, shortcuts
    │
    ├── hooks/                 # Custom React Hooks
    │   ├── useKeyboardShortcuts.ts  # Global hotkey orchestrator (Ctrl+K, etc.)
    │   ├── useAudioSynthesizer.ts   # Zero-dependency Web Audio ambient generator
    │   ├── useProductivityScore.ts  # Dynamic daily score calculation
    │   └── useInterval.ts           # High-precision timer ticker
    │
    └── lib/                   # Utility Functions
        ├── date-utils.ts      # Formatting, relative times, week/month calculations
        ├── sound-synth.ts     # Web Audio API binaural & noise generator
        └── utils.ts           # Class merging (clsx/twMerge), ID generators
```

---

## 3. State Management Architecture (Zustand Slices)

### Store Topography
| Store | Domain Responsibilities | Persistence Strategy |
| :--- | :--- | :--- |
| `useAppStore` | Active view, navigation history, command palette open, notification toasts | LocalStorage + Memory |
| `useTaskStore` | Tasks list, filter states, active task drawer, reordering | SQLite table `tasks` |
| `useHabitStore` | Habits list, completions for today, streak cache | SQLite table `habits` & `habit_logs` |
| `useFocusStore` | Current timer mode, remaining seconds, active state, sound type | In-memory + SQLite `focus_sessions` on finish |
| `useNotesStore` | Scratchpad content, notes list, active note editing buffer | LocalStorage (scratchpad) + SQLite `notes` |
| `useCalendarStore`| Events for selected day, active timeblocks | SQLite table `events` |
| `useSettingsStore`| Theme (Dark/Light), audio volume, working hours | SQLite table `settings` |

---

## 4. Design System Tokens & Theming Engine

Personal OS implements CSS Custom Property tokens mapped to Tailwind classes. The design relies on high-contrast matte surfaces with translucent glass layers:

```css
:root {
  --color-primary: #007AFF;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;

  /* Dark Mode (Default) */
  --bg-app: #0F1117;
  --bg-surface: #151922;
  --bg-card: #1D2330;
  --bg-card-hover: #242B3B;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(0, 122, 255, 0.45);
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --glass-bg: rgba(21, 25, 34, 0.75);
  --glass-blur: 16px;
}

[data-theme='light'] {
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-card: #F1F5F9;
  --bg-card-hover: #E2E8F0;
  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-focus: rgba(0, 122, 255, 0.6);
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-blur: 16px;
}
```

---

## 5. Keyboard Navigation & Raycast Experience

A global keyboard listener (`useKeyboardShortcuts`) captures top-level events:
* `⌘K` or `Ctrl+K`: Toggle Command Palette.
* `⌘N` or `Ctrl+N`: Quick capture new task modal.
* `F`: Toggle Focus Timer (when not in text input).
* `1` - `9`: Quick jump to Navigation Module (1: Dashboard, 2: Tasks, 3: Notes, 4: Habits, etc.).
* `Esc`: Close open modal / drawer / unfocus input.
* `J` / `K`: Linear-style list selection movement.
* `X`: Toggle completion of currently focused list item.