# Personal OS — IPC Architecture & Inter-Process Contracts

> **Security Model**: Context Isolation = true, Node Integration = false, Sandbox = true  
> **Pattern**: Strongly typed two-way `ipcRenderer.invoke` + one-way `ipcRenderer.send` / `ipcMain.on` via `contextBridge`

---

## 1. Security Architecture

Electron's security model strictly partitions the application:
1. **Main Process (`src/app/`)**: Full Node.js and OS system access. Directly operates Better-SQLite3, system tray, global shortcuts, and file systems.
2. **Preload Script (`src/preload/`)**: Creates a secure, immutable API surface (`window.electronAPI`) using `contextBridge.exposeInMainWorld`.
3. **Renderer Process (`src/renderer/`)**: Pure browser execution sandbox. Can NEVER directly access filesystem or native libraries.

```
┌────────────────────────────────┐
│   Renderer (React / UI)        │
│   window.electronAPI.tasks.get │
└───────────────┬────────────────┘
                │ Typed invoke()
                ▼
┌────────────────────────────────┐
│   Preload (contextBridge)      │
│   ipcRenderer.invoke('db:tasks'│
└───────────────┬────────────────┘
                │ Protected IPC Channel
                ▼
┌────────────────────────────────┐
│   Main Process (Node.js)       │
│   SQLite Better-SQLite3 Engine │
└────────────────────────────────┘
```

---

## 2. Strongly Typed API Contract (`window.electronAPI`)

```typescript
export interface ElectronAPI {
  // Database Operations
  db: {
    // Tasks
    getTasks: (filter?: TaskFilter) => Promise<Task[]>;
    createTask: (data: CreateTaskInput) => Promise<Task>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
    deleteTask: (id: string) => Promise<boolean>;

    // Habits
    getHabits: () => Promise<HabitWithLogs[]>;
    createHabit: (data: CreateHabitInput) => Promise<Habit>;
    toggleHabitToday: (id: string, date: string) => Promise<{ completed: boolean; streak: number }>;

    // Notes
    getNotes: (folder?: string) => Promise<Note[]>;
    saveNote: (note: SaveNoteInput) => Promise<Note>;
    deleteNote: (id: string) => Promise<boolean>;

    // Focus Sessions
    logFocusSession: (session: FocusSessionInput) => Promise<FocusSession>;
    getFocusStats: () => Promise<FocusStats>;

    // Calendar & Reminders
    getEvents: (startDate: string, endDate: string) => Promise<CalendarEvent[]>;
    createEvent: (data: CreateEventInput) => Promise<CalendarEvent>;
    getReminders: () => Promise<Reminder[]>;
  };

  // Window & System Controls
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    toggleFullScreen: () => void;
    isMaximized: () => Promise<boolean>;
  };

  // System Tray & Notifications
  system: {
    showNotification: (options: { title: string; body: string; sound?: boolean }) => void;
    setBadgeCount: (count: number) => void;
    getSystemInfo: () => Promise<{ platform: string; arch: string; version: string; memory: number }>;
  };

  // Sound & Ambient Engine (native / fallback)
  audio: {
    playNotificationSound: (soundName: 'ping' | 'done' | 'alert') => void;
  };

  // Event Listeners from Main to Renderer
  on: (channel: string, listener: (...args: any[]) => void) => () => void;
}
```

---

## 3. Web & Browser Environment Fallback

To support instant developer iteration, testing in standard browsers, and Vitest test environments without needing Electron active, the frontend includes a **Dual-Mode Adapter**:
- If `window.electronAPI` is present: Uses high-performance native IPC calls to SQLite.
- If `window.electronAPI` is undefined (web dev or browser preview): Automatically delegates to an in-memory/LocalStorage resilient adapter with identical TypeScript interfaces.
- Zero mock code required in UI components—the adapter layer handles switching transparently.
