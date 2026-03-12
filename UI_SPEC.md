# PyLearn — UI Design Specification
**Version 2.0 · Warm Scholar Game Theme**

---

## 1. Design Philosophy

PyLearn's UI is guided by three principles:

| Principle | Meaning |
|---|---|
| **Warmth** | The palette skews amber/gold rather than cold blue — encouraging, not clinical |
| **Game feel** | Every interaction should feel like progress. Leveling up, streaks, and badges reinforce intrinsic motivation |
| **Clarity first** | Visual hierarchy always serves the learning objective. No decoration that distracts |

---

## 2. Design Tokens

### 2.1 Color Palette

```
Background layers (darkest → lightest)
  --bg-base     #0f0d0b  Page background — deepest warm black
  --bg-surface  #1a1612  Card background
  --bg-raised   #221e19  Elevated / hover surfaces
  --bg-editor   #0c0a08  Code editor — nearly pure black for contrast

Borders
  --border      #2e271f  Default border — warm dark
  --border-warm #3d3328  Hover / active border

Primary accent — Amber/Gold (energy, achievement)
  --amber       #f59e0b
  --amber-light #fbbf24
  --amber-dim   #92400e  Dark amber for button gradients
  --amber-glow  rgba(245,158,11,0.25)

Secondary accent — Teal (calm, knowledge)
  --teal        #2dd4bf
  --teal-dim    #0f766e

Semantic
  --success     #4ade80  Correct answers, completed levels
  --error       #fb7185  Incorrect output, destructive actions
  --info        #60a5fa  Informational hints, notes

Text
  --text-primary   #fef3c7  Headings — warm cream
  --text-secondary #a8947a  Body text — warm tan
  --text-muted     #5c4f3d  Labels, metadata — warm brown-grey
  --text-code      #fde68a  Code editor text — warm yellow
```

### 2.2 Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / headings | Sora | 700–800 | 18–24px |
| Labels, buttons | Sora | 600–700 | 11–14px |
| Body text | Nunito | 400–600 | 13–15px |
| Code, metadata | Fira Code | 400–600 | 10–14px |

**Rationale:** Sora is geometric and clean but with enough personality to feel "designed". Nunito's rounded terminals make body text warm and readable. Fira Code's ligatures make code beautiful.

### 2.3 Spacing & Radii

```
Border radii
  --r-sm  6px   Inline chips, small elements
  --r-md  10px  Buttons, input fields
  --r-lg  14px  Cards, panels
  --r-xl  20px  Modals, large surfaces

Gap scale (use multiples of 4)
  xs  4px    Between related micro-elements
  sm  8px    Between list items
  md  14px   Between panel sections
  lg  20px   Between major layout regions
  xl  24px   Page padding / layout gaps
```

### 2.4 Shadows & Glow

```
--shadow-card   0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)
--shadow-amber  0 0 20px rgba(245,158,11,0.3)   — active, glowing states
--shadow-teal   0 0 20px rgba(45,212,191,0.2)   — informational glow
```

---

## 3. Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  HEADER (sticky, 60px + 3px XP bar)                 │
├────────────┬────────────────────────────────────────┤
│            │                                        │
│  SIDEBAR   │  MAIN CONTENT                          │
│  252px     │  flex-1, min-width: 0                  │
│            │                                        │
│ Level Map  │  Level Header Card                     │
│ Badges     │  Concept + Task (2-col grid)           │
│ Reset Btn  │  Code Editor                           │
│            │  Feedback Panel (conditional)          │
│            │  Action Bar                            │
│            │                                        │
└────────────┴────────────────────────────────────────┘
```

**Z-index stacking order (no overlaps):**
```
  Body / layout     z-index: 0
  Sticky header     z-index: 200
  Sidebar           z-index: 1  (sticky, below header)
  Toast notification z-index: 1200  (top right, fixed)
  Modal backdrop    z-index: 1100
  Modal content     z-index: 1101 (via stacking context)
```

---

## 4. Component Specifications

### 4.1 Header

**Height:** 60px + 3px XP progress bar = 63px total  
**Position:** sticky, top: 0  
**Background:** rgba(15,13,11, 0.96) + 16px backdrop blur

**XP Progress Bar (top 3px strip)**
- Full-width gradient shimmer: `#92400e → #f59e0b → #fbbf24`
- Tracks `completed.length / 30 * 100%`
- Transition: `width 0.9s cubic-bezier(0.4,0,0.2,1)`
- Amber glow: `box-shadow: 0 0 6px rgba(245,158,11,0.5)`

**Logo**
- 38×38px icon tile (amber gradient, 10px radius)
- "PyLearn" in Sora 800, --text-primary
- Subtitle: "python journey" in Fira Code 9px uppercase, --text-muted

**Stat Pills** (right side, pill-shaped containers)
- Levels completed: `N/30`, amber, with glow when N > 0
- % complete: Sora 700, --success color
- Streak: flame icon when ≥ 3, sparkle when ≥ 1, sleep otherwise; color shifts orange → amber with streak count
- Current level badge: amber-tinted pill `LVL N`

---

### 4.2 Sidebar

**Width:** 252px fixed, sticky below header  
**Max height:** calc(100vh - 90px), overflow hidden, internal scroll

#### 4.2.1 Level Selector

**Top section (non-scrolling):**
- "Levels" label + count (Sora uppercase)
- Mini XP bar (same amber shimmer, 8px height)
- Category filter: horizontal scrollable pill row

**Level list (scrolling):**

| Status | Background | Border | Number indicator | Text color |
|---|---|---|---|---|
| Locked | transparent | transparent | 🔒 icon | --text-muted (30% opacity) |
| Open | transparent | transparent | number, muted | --text-muted |
| Active | amber 10% | amber 30% | number, amber, glow | --text-primary |
| Done | green 5% | green 15% | ✓, green | --text-secondary |

**Active node animation:** `pulse-ring` — amber ring radiates outward every 2.2s  
**Hover:** translateX(3px) for all non-locked items

**Bottom dot-map (non-scrolling):**
- 30 dots, 6px circles
- green = done, amber = current, dark = locked
- Compact visual overview of all progress

#### 4.2.2 Badges Panel

- 3×2 grid of badge tiles (6 badges total)
- Unlocked: amber tinted, glow, colored
- Locked: grayscale filter, 35% opacity
- Title + tooltip on hover
- Unlock animation: `node-unlock` — scale from 50% with bounce

#### 4.2.3 Reset Progress

- Visually separated in a coral/red tinted container
- Brief explanatory text (11px, muted)
- "🗑️ Reset all progress" button — `btn-danger` style
- Always visible, never hidden — critical discoverability requirement

---

### 4.3 Main Content Area

#### 4.3.1 Level Header Card

- Full-width card with a 4px colored top strip (matches category color)
- Category icon: 54×54px tile, category bg color
- Meta row: level number (monospace) + category pill + completion badge
- Title: Sora 800, 21px, --text-primary
- Description: Nunito 13.5px, --text-secondary

#### 4.3.2 Concept + Task Grid (50/50)

**Concept card:**
- Standard `.card` surface
- 📖 icon + "CONCEPT" label
- Body in Nunito 13px, --text-secondary, 1.7 line-height

**Task card:**
- Amber-tinted surface with left border accent (3px amber)
- 🎯 icon + "YOUR TASK" label
- Task text: Nunito 13.5px, amber-yellow (`--text-code`), bold
- Expected output block: monospace, --success color, dark bg

#### 4.3.3 Code Editor

**Container:** 12px radius, dark border, 20px drop shadow

**Toolbar (9px):**
- Left: macOS-style window dots (coral, amber, green — purely decorative)
- Center: filename `solution.py` in Fira Code muted
- Right: `Python 3 · UTF-8 · spaces:4` metadata in tiny muted text

**Line numbers (42px column):**
- Fira Code 12px, --text-muted (#3d3328)
- Separated by a thin warm border
- Count updates dynamically as user types

**Textarea:**
- Text: `#fde68a` (warm yellow) for readability on near-black
- Caret: `#f59e0b` amber
- Selection: 20% amber tint
- Tab key inserts 4 spaces (preventDefault + manual insertion)
- Grows with content, minimum 8 visible lines

**Status bar (5px, bottom):**
- Line, column count
- Ready / ⏳ running state indicator
- "ctrl+enter to run" shortcut reminder (right-aligned)

#### 4.3.4 Hint Box

- Triggered by "💡 Hint" button toggle
- Left border accent: 3px amber
- Amber-tinted background
- Slide-in animation from left
- Collapses on second click (toggle)
- Never obscures other content — normal document flow

#### 4.3.5 Feedback Panel

**Success state (`.feedback-success`):**
- Green-tinted background + border
- ✓ checkmark in green circle
- "Correct! Great work." heading in --success
- Side-by-side output comparison (your output / expected) — both green
- Insight callout (amber tint with 💡 icon)
- `success-burst` animation: gentle scale pulse

**Error state (`.feedback-error`):**
- Coral-tinted background + border
- ✗ in coral circle
- "Not quite — keep trying!" heading in --error
- Side-by-side: your output (coral) vs expected (green)
- Solution reveal block: Fira Code, blue-tinted
- Insight callout (amber tint with 💡 icon)
- `fadeUp` animation from below

**Both states:** Always in document flow (never a popup/overlay), rendered below the editor.

#### 4.3.6 Action Bar

Fixed layout: `display: flex, flex-wrap: wrap, gap: 10px`

| Button | Class | Position | When |
|---|---|---|---|
| ▶ Run Code | `btn-primary` (amber) | Left | Always |
| 💡 Hint / 🔦 Hide hint | `btn-ghost` (amber tint when active) | Left | Always |
| ↺ Reset | `btn-ghost` | Left | Always |
| Next Level → | `btn-success` (green) | `margin-left: auto` | After correct answer only |
| 🏆 Course Complete! | amber gradient tile | `margin-left: auto` | Last level, correct |

**Run button states:**
- Default: amber gradient, amber glow shadow
- Hover: translateY(-1px), brighter glow
- Active: translateY(0), slightly dimmer
- Disabled/running: 50% opacity, "⟳ Running…" with spinning icon, `cursor: not-allowed`

---

### 4.4 Toast Notification (Streak)

**Trigger:** Any correct answer that raises streak to ≥ 2

**Positioning:**
```css
position: fixed;
top: 76px;    /* 60px header + 16px gap — below header, never overlapping */
right: 24px;
z-index: 1200; /* above modal backdrop */
```

**Animation:** `float-toast` — slides in from right, holds 2.2s, fades out. Total: 2.9s, then removed from DOM.

**Content:** Dynamic message based on streak count:
- 2: "Nice pair! 🎉"
- 3: "On fire! 🔥"
- 5: "Unstoppable! ⚡"
- 10+: "Legendary! 🌟"

**Accessibility:** `pointer-events: none` — never blocks any interactive elements

---

### 4.5 Reset Confirmation Modal

**Trigger:** "Reset all progress" button in sidebar

**Backdrop:**
- `position: fixed; inset: 0; z-index: 1100`
- `background: rgba(0,0,0,0.75)` + `backdrop-filter: blur(6px)`
- Click-outside closes the modal

**Card:**
- `.card` + `.anim-pop` entrance animation
- Max width 420px, 92% on small screens
- 60×60px warning icon tile (coral tinted)
- Bold "Reset all progress?" heading
- Clear consequences listed with "cannot be undone" in --error
- Two buttons: "Cancel" (ghost) + "Yes, reset everything" (coral gradient, full-width)

---

## 5. Animation Inventory

| Name | Duration | Easing | Usage |
|---|---|---|---|
| `fadeUp` | 350ms | ease | Level view entrance, feedback panel |
| `fadeIn` | 250ms | ease | Modal backdrop |
| `slideRight` | 300ms | ease | Hint box |
| `pop` | 450ms | cubic-bezier(0.34,1.56,0.64,1) | Modal card, success buttons |
| `shimmer` | 2500ms | linear, infinite | XP bar gradient sweep |
| `pulse-ring` | 2200ms | ease-out, infinite | Active level node in sidebar |
| `float-toast` | 2900ms | ease, once | Streak toast (in + hold + out) |
| `success-burst` | 400ms | ease | Feedback panel success state |
| `node-unlock` | 500ms | ease | Badge appearing after earning |
| `spin` | 900ms | linear, infinite | Run button loading spinner |

**Performance note:** All animations use `transform` and `opacity` — GPU composited, no layout thrashing.

---

## 6. Interaction States

### Level nodes (sidebar)
- `locked` → disabled, 30% opacity, 🔒 icon, `cursor: not-allowed`
- `open` → interactive, hover shifts right 3px
- `active` → amber background + border + pulse-ring glow
- `done` → green tint, checkmark, slightly muted text

### Buttons
- All buttons have 150ms transitions on transform + box-shadow
- Hover lifts (+translateY(-1px)) with intensified shadow
- Active presses down (+translateY(0)) with reduced shadow
- Disabled: 50% opacity, no hover effect

### Editor
- Normal: `#fde68a` text on `#0c0a08` bg — 15:1 contrast ratio
- Focus: no additional styling needed (tab key behavior overridden)
- Typing expands editor row count dynamically

---

## 7. Accessibility Notes

| Requirement | Implementation |
|---|---|
| Color contrast | Text primary (#fef3c7) on bg-surface (#1a1612) = 12.5:1 ✓ |
| Code text (#fde68a on #0c0a08) | = 14.8:1 ✓ |
| Interactive elements | All buttons have visible focus states via browser default |
| Locked levels | `disabled` attribute on `<button>` + `cursor: not-allowed` |
| Modal trap | Click-outside closes; Cancel button always present |
| Toast | `pointer-events: none` — never traps focus or blocks clicks |
| Reset warning | Consequences stated in plain language before destructive action |

---

## 8. Responsive Behavior

The layout is designed for 1280px+ viewports. At smaller sizes:

| Breakpoint | Behavior |
|---|---|
| < 1024px | Sidebar collapses; consider hidden-by-default drawer (future) |
| < 768px | Concept/Task grid stacks to single column |
| < 480px | Action bar wraps; buttons go full-width |

---

## 9. File Structure

```
src/
├── index.css                   # Design tokens + keyframes + utility classes
├── App.jsx                     # Root — progress state, toast, modal, layout
├── components/
│   ├── Header.jsx              # Sticky header with XP bar + stat pills
│   ├── LevelSelector.jsx       # Sidebar level map + category filter
│   ├── BadgesPanel.jsx         # Achievement grid
│   ├── CodeEditor.jsx          # Dark editor with line numbers
│   ├── LevelView.jsx           # Level header, concept/task, editor, feedback
│   └── FeedbackPanel.jsx       # Success/error output comparison
├── utils/
│   └── pyRunner.js             # Python→JS transpiler (single-pass)
└── data/
    └── levels.js               # 30 level definitions + badges + categories
```

---

## 10. Key Design Decisions & Rationale

**Why amber/gold as the primary accent?**  
Blue is the default choice for "tech" UIs, which reads as cold and corporate. Amber evokes warmth, achievement, and celebration — the emotional register of a good learning experience. It also creates clear visual hierarchy: amber = "do this now" (CTA, active state), green = "success", coral = "error/warning".

**Why no popups for feedback?**  
Inline feedback (below the editor, in document flow) means users can scroll up to reread the task while looking at what went wrong. Popups break the spatial relationship between code and output.

**Why is "Reset All Progress" visible but not prominent?**  
Discoverability matters — burying it creates frustration. But it's styled with a warning container and requires confirmation. The two-step (button → modal → confirm) prevents accidents without hiding the feature.

**Why fixed z-index stacking for toast vs. modal?**  
Both are `position: fixed`. Toast is z-index 1200, modal is 1100. This means: toast renders above modal backdrop. If a streak happens while the reset modal is open (edge case), the toast is still visible. The toast uses `pointer-events: none` so it never blocks modal interaction.
