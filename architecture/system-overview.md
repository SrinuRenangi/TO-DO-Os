# System Overview

## Architecture Philosophy

Personal OS is built as a **modular, scalable, offline-first Electron application** with a React frontend and SQLite backend. The architecture follows clean separation of concerns:

### High-Level Layers

```
┌─────────────────────────────────────┐
│           PRESENTATION LAYER          │
│  (React + TailwindCSS + Framer Motion)│
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│          APPLICATION LAYER            │
│  (Zustand state management, services) │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│          DOMAIN LAYER                 │
│  (Business logic, use cases)          │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│          INFRASTRUCTURE LAYER         │
│  (SQLite, File System, OS Integration)│
└─────────────────────────────────────┘
```

### Key Design Decisions

1. **Electron + React**: Chosen for premium UI capabilities (glassmorphism, animations, charts) while maintaining native desktop experience
2. **SQLite**: Offline-first storage with local queries, no server required
3. **Zustand**: Simple, scalable state management without boilerplate
4. **TailwindCSS + Custom Config**: Utility-first with design system tokens for consistent theming
5. **Framer Motion**: Production-grade animations and gestures

### Module Structure

```
src/
├── app/              # Electron main process
├── preload/          # Preload script (bridge between React and Node)
├── renderer/         # React source
│   ├── components/   # UI component library
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # Zustand stores
│   ├── lib/          # Utilities (formatters, validators)
│   └── pages/        # Page components
├── shared/           # Shared types and utilities
│   ├── types.ts
│   ├── constants.ts
│   └── api.ts
└── electron/         # Electron-specific configs
```

### Data Flow

1. UI dispatches actions → Zustand store
2. Store updates state → React re-renders
3. Side effects (API calls, file ops) → Electron main process
4. Main process interacts with SQLite
5. Results flow back through preload script → store → UI

### Non-Goals (initially)
- Multi-user support (single-user optimized)
- Cloud sync (offline-first local only)
- AI reasoning (Phase 8)
- Web integration (pure desktop experience)