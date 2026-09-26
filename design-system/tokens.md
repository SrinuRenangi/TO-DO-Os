# Personal OS — Design System & Visual Tokens

> **Design Philosophy**: Apple Human Interface Guidelines + Linear Precision + Arc Browser Elegance  
> **Forbidden**: Bootstrap styles, cheap gradients, cluttered cards, material ripples, generic templates.  
> **Mandatory**: 8px spatial grid, high-contrast matte surfaces, subtle glassmorphism, 1px translucent borders, spring motion curves.

---

## 1. Color Palette Tokens

### 1.1 Brand & Semantic Accents
| Token | Hex | Role | Usage Guidelines |
| :--- | :--- | :--- | :--- |
| `--color-primary` | `#007AFF` | Electric Royal Blue | Primary actions, active navigation states, focus rings |
| `--color-success` | `#22C55E` | Vivid Emerald | Completed tasks, streak milestones, positive deltas |
| `--color-warning` | `#F59E0B` | Warm Amber | P1 high priorities, approaching deadlines, snooze states |
| `--color-danger` | `#EF4444` | Crisp Crimson | P0 critical alerts, overdue tasks, destructive actions |
| `--color-purple` | `#8B5CF6` | Iris Violet | Goals, deep work focus sessions, AI intelligence |

### 1.2 Dark Mode Matrix (Default Surface System)
| Token | Hex / RGBA | Role | Visual Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-app` | `#0F1117` | Canvas Void | Deep obsidian background, foundation for all layers |
| `--bg-surface` | `#151922` | Structural Surface | Sidebar, header bar, panel backdrops |
| `--bg-card` | `#1D2330` | Interactive Card | Task cards, timeline blocks, metric widgets |
| `--bg-card-hover` | `#242B3B` | Card Hover | Responsive feedback state on mouse over |
| `--border-subtle`| `rgba(255, 255, 255, 0.07)` | Structural Edge | Razor-sharp 1px boundary dividing surfaces |
| `--border-hover` | `rgba(255, 255, 255, 0.14)` | Hover Edge | Elevated contrast on cursor approach |
| `--text-primary` | `#F8FAFC` | High-Emph Text | Headers, task titles, active counters |
| `--text-secondary`| `#94A3B8` | Med-Emph Text | Metadata, subtitles, time estimates, descriptions |
| `--text-muted` | `#64748B` | Low-Emph Text | Shortcut badges, timestamps, subtle captions |

### 1.3 Light Mode Matrix
| Token | Hex / RGBA | Role | Visual Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-app` | `#F8FAFC` | Bright Canvas | Clean off-white surface |
| `--bg-surface` | `#FFFFFF` | Structural Surface | Pure white elevation |
| `--bg-card` | `#F1F5F9` | Interactive Card | Subtle warm gray card container |
| `--bg-card-hover` | `#E2E8F0` | Card Hover | Crisp interactive hover feedback |
| `--border-subtle`| `rgba(0, 0, 0, 0.08)` | Structural Edge | Clean hairline border |
| `--border-hover` | `rgba(0, 0, 0, 0.16)` | Hover Edge | Enhanced boundary |
| `--text-primary` | `#0F172A` | High-Emph Text | Deep slate black |
| `--text-secondary`| `#475569` | Med-Emph Text | Readable neutral slate |
| `--text-muted` | `#94A3B8` | Low-Emph Text | Soft slate captions |

---

## 2. Typography Scale

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif;
```

| Class | Font Size | Line Height | Tracking | Weight | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-xl` | 32px (2rem) | 1.2 | -0.03em | 700 (Bold) | Dashboard Clock, Metric Hero |
| `title-lg` | 24px (1.5rem) | 1.3 | -0.025em | 600 (Semibold)| Module Headings, Greetings |
| `title-md` | 18px (1.125rem) | 1.4 | -0.02em | 600 (Semibold)| Section Titles, Modal Headers |
| `body-base` | 14px (0.875rem) | 1.5 | -0.01em | 400/500 | Task Titles, Note Text, Body |
| `caption-sm` | 12px (0.75rem) | 1.4 | 0 | 400/500 | Tags, Subtitles, Timestamps |
| `badge-xs` | 10px (0.625rem) | 1.2 | +0.02em | 600 | Hotkey Badges, Status Indicators |

*Note*: Timers, clocks, and score displays enforce `font-variant-numeric: tabular-nums` to eliminate layout jitter during transitions.

---

## 3. Elevation, Glassmorphism & Radii

### Radii Tokens
- **`rounded-md` (8px)**: Hotkey badges, small tags, subtask checkboxes.
- **`rounded-xl` (16px)**: Priority queue cards, quick buttons, dropdown menus.
- **`rounded-2xl` (20px)**: Widget containers, modal dialogs, timeline cards.
- **`rounded-3xl` (24px)**: Outer application shell canvas, command palette overlay.

### Glassmorphism System
```css
.glass-panel {
  background: rgba(21, 25, 34, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}
```

---

## 4. Motion & Animation Physics

Personal OS adheres to physical spring mechanics rather than linear tweens:

```typescript
export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const gentleSpring = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export const snappyHover = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1], // Apple cubic-bezier
};
```

- **Micro-interactions (Checkboxes, Toggles)**: 150ms spring response with immediate visual feedback.
- **Modal & Drawers**: 250ms slide-and-fade along the Y axis (`y: 8 -> 0`, `opacity: 0 -> 1`).
- **Tab Navigation**: 300ms layout cross-fade with persistent spatial continuity.
