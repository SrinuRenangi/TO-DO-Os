# Personal OS — Dashboard Specification & Product Requirements Document (PRD)

> **Document Version**: 1.0.0  
> **Status**: Approved / Production Baseline  
> **Owner**: Elite Architecture & Design Team  
> **Target Experience**: Arc Browser + Linear + Notion + Raycast + Apple Calendar

---

## 1. Executive Summary & Vision

The **Personal OS Dashboard** is not a simple status page or a collection of disconnected widgets. It is the **single unified command center** for an individual's entire life and cognitive workflow. 

It synthesizes four essential vectors of personal leadership:
1. **Active Execution (Linear)**: What must get done *right now* with zero ambiguity.
2. **Temporal Alignment (Apple Calendar & Motion)**: Where the user is in the river of time today.
3. **Habitual Momentum (TickTick & Atomic Habits)**: The non-negotiable rituals that compound long-term excellence.
4. **Cognitive Space (Notion & Obsidian)**: Instant fleeting capture and ambient intelligence without context switching.

---

## 2. Information Architecture & Spatial Layout

The Dashboard adheres to an **8px Golden Grid** with an asymmetrical **3-Zone Spatial Topology** framed by an ambient **Header Status Strip**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ OS HEADER STRIP: Contextual Greeting · Live Chrono · Productivity Pulse · Global Actions   │
├───────────────────────────────────────────────────────┬─────────────────────────────────────┤
│ ZONE A: EXECUTION HUB (42% Width)                    │ ZONE B: TEMPORAL & FOCUS (34% Width)│
│                                                       │                                     │
│ 1. Today's Priority Queue (P0/P1/P2)                  │ 1. Deep Work & Focus Timer Engine   │
│    - One-click completion & status transitions        │    - Active session / Pomodoro / 90m│
│    - Linear-style keyboard navigation (J/K/X)         │    - Ambient soundscape toggle      │
│    - Subtask progress & time-estimate tags            │                                     │
│                                                       │ 2. Apple-Grade Day Timeline         │
│ 2. Habit Momentum Barometer                           │    - Current hour indicator line    │
│    - Daily non-negotiables with streak counters       │    - Integrated events & timeblocks │
│    - Micro-check animations with haptic visual cues   │    - Next upcoming meeting/block    │
│                                                       │                                     │
│ 3. Active Goal Milestones (OKRs)                      │ 3. Escalated Smart Reminders        │
│    - Progress bars linked to projects & tasks         │    - High-urgency alerts & snooze   │
├───────────────────────────────────────────────────────┴─────────────────────────────────────┤
│ ZONE C: COGNITIVE INTELLIGENCE & AMBIENT DOCK (24% Width / Expandable)                     │
│                                                                                             │
│ 1. Notion/Obsidian Scratchpad: Fleeting thoughts buffer, instant 1-click Convert to Task    │
│ 2. 7-Day Velocity & Habit Heatmap: Recharts/D3 powered consistency metrics                  │
│ 3. Ambient AI Life Briefing: Contextual suggestions & end-of-day review prompt              │
│ 4. System Status & Offline DB Heartbeat: SQLite local sync indicator, backup timestamp      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 OS Header Strip (`DashboardHeader`)
* **Contextual Greeting**:
  - Dynamic time-aware greeting: `"Good morning, Sri"`, `"Deep focus afternoon"`, `"Winding down evening"`.
  - Subtitle: Date formatted cleanly (`"Saturday, September 26 • Week 39"`).
* **Productivity Score Engine (`ProductivityGauge`)**:
  - Live metric (0–100%) calculated dynamically:
    $$\text{Score} = 0.40 \times \text{Tasks} + 0.30 \times \text{Habits} + 0.20 \times \text{FocusTime} + 0.10 \times \text{Punctuality}$$
  - Radial SVG gauge with micro-glow on achievement thresholds (>80% = Emerald glow).
* **Command Bar Trigger (`QuickSearchBar`)**:
  - Pill button resembling Raycast: `"Press ⌘K or Ctrl+K to run command or capture..."`.
  - Hotkey badge with refined glass background (`rgba(255,255,255,0.08)`).
* **Global Action Trio**:
  - `+ New Task` (Shortcut: `C` or `Ctrl+N`)
  - `⚡ Start Focus` (Shortcut: `F` or `Ctrl+Shift+F`)
  - `📝 Quick Note` (Shortcut: `Ctrl+Shift+N`)

---

### 3.2 Zone A: Execution Hub (`ExecutionHub`)

#### Feature A.1: Today's Priority Queue (`PriorityQueue`)
* **Visual Styling**:
  - Linear-inspired minimalist card list.
  - Priority badging:
    - **P0 Critical** (`#EF4444` red dot + badge with subtle pulse)
    - **P1 High** (`#F59E0B` amber dot)
    - **P2 Medium** (`#007AFF` blue dot)
    - **P3 Low** (`#64748B` neutral slate dot)
* **Interactive Capabilities**:
  - Instant checkbox with spring scale animation on completion (`scale: [1, 1.25, 1]`).
  - Inline editing of title, estimate time (e.g., `45m`), and tags (`#code`, `#design`, `#strategy`).
  - Filter pills: `All (6)`, `High Priority (2)`, `Completed (4)`.
  - Drag-and-drop reordering for custom prioritization.

#### Feature A.2: Habit Momentum Barometer (`HabitMomentum`)
* **Styling & Interaction**:
  - Horizontal chip carousel or stack.
  - Each habit displays: Icon, Name (`"Morning Meditation"`, `"10k Steps"`, `"Deep Read"`), Current Streak (`🔥 14 days`), and interactive check ring.
  - Completion triggers subtle particle/glow effect.

#### Feature A.3: Active Goal Milestones (`GoalPreview`)
* **Visual Representation**:
  - Mini-cards of quarterly OKRs (e.g., `"Launch Personal OS v1.0" - 78%`).
  - Modern animated progress bar (`h-1.5 rounded-full bg-surface overflow-hidden`).

---

### 3.3 Zone B: Temporal & Focus Engine (`TemporalEngine`)

#### Feature B.1: Focus Center Widget (`FocusCenterWidget`)
* **Modes**:
  - **Pomodoro (25m / 5m)**
  - **Deep Work Flow (50m / 10m)**
  - **Ultradian Rhythm (90m)**
  - **Custom Timer & Stopwatch**
* **Controls**:
  - Large sleek digital readout with typography tracking.
  - Play / Pause / Reset / Skip controls with smooth Framer Motion spring physics.
  - Ambient Audio Selector: White noise, Rain, Binaural 40Hz focus, Cafe ambience (native Web Audio API synthesizer, 0 external dependencies).

#### Feature B.2: Day Timeline & Timeblocker (`DayTimeline`)
* **Design Philosophy**:
  - Inspired by Apple Calendar and Cron.
  - Vertical 24-hour / working-hour timeline with current red time-rule indicator that moves dynamically every minute.
  - Seamless merging of calendar events (Google/iCal synced or local) and scheduled task timeblocks.
  - Visual distinction between:
    - *Event* (bordered soft fill)
    - *Focus Block* (accent gradient border)
    - *Task Block* (solid surface card with completion checkbox)

#### Feature B.3: Escalated Reminders (`EscalatedReminders`)
* **Alert System**:
  - Glass card with warning accent border.
  - Snooze actions (`+15m`, `+1h`, `Tomorrow 9am`) and dismiss button.

---

### 3.4 Zone C: Cognitive Space & Intelligence (`CognitiveSpace`)

#### Feature C.1: Notion/Obsidian Instant Scratchpad (`ScratchpadWidget`)
* **Purpose**: Capture ideas immediately without leaving the flow.
* **Capabilities**:
  - Auto-saving local markdown textarea with debounce (300ms).
  - Quick action toolbar: `"Convert to Task"`, `"Save as Permanent Note"`, `"Clear"`.
  - Supports Markdown styling (`**bold**`, `- list`, `# heading`).

#### Feature C.2: 7-Day Velocity & Habit Heatmap (`VelocityMiniChart`)
* **Visuals**:
  - Mini SVG bar chart or GitHub-style 7-day contribution squares.
  - Shows productivity trends and daily completed items at a glance.

#### Feature C.3: Ambient AI Intelligence Briefing (`AIBriefingWidget`)
* **Content**:
  - Concise bullet synthesis generated locally:
    - *"You have 2 high-priority tasks remaining today. 45 min available until 3:00 PM."*
    - *"Streak alert: You are 1 habit away from a 7-day clean sweep."*

#### Feature C.4: System Status & Offline DB Heartbeat (`SystemHeartbeat`)
* **Information**:
  - Status: `● SQLite Local Engine: Active (3.4 MB)`
  - Last backup: `12 mins ago`
  - Battery / Memory utilization stats.

---

## 4. Visual Standards & Motion Design

1. **Aesthetic Tone**:
   - Matte Obsidian Dark Mode by default (`#0F1117` base, `#151922` surface, `#1D2330` cards).
   - Razor-sharp 1px borders with `rgba(255, 255, 255, 0.07)`.
   - Subtle radial glow on primary highlights (`#007AFF20`).
2. **Motion Choreography (Framer Motion)**:
   - Initial load: Staggered fade-in-up (`staggerChildren: 0.05, duration: 0.3s, ease: "easeOut"`).
   - Hover states: `y: -2px`, card border highlight transitions over `150ms`.
   - Completion transitions: Subtle scale bump followed by clean strike-through and soft slide to completed tray.
3. **Typography**:
   - System font stack: `Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`.
   - Tabular figures (`font-variant-numeric: tabular-nums`) on all clocks, timers, and metrics to prevent layout jitter.

---

## 5. Verification & Acceptance Criteria

- [ ] **Responsiveness**: Renders flawlessly from 1024x768 to 4K Ultrawide desktop viewports.
- [ ] **Speed**: Sub-60ms first contentful render; zero lag during active focus timer ticks.
- [ ] **Offline Resilience**: 100% functional without an internet connection.
- [ ] **Accessibility**: Full keyboard navigable (Tab, Arrow keys, Enter, Escape, J/K shortcuts).
- [ ] **Theme parity**: Seamless toggle between Dark Mode (`#0F1117`) and Light Mode (`#F8FAFC`).
