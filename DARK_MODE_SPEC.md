# PyLearn — Dark Mode Color System v2
**Space Gray + Soft Indigo Theme**

---

## Design Goals

| Before | After |
|---|---|
| Warm brown-black (`#0f0d0b`) — cave-like | Deep space gray (`#0d0f14`) — open, expansive |
| Amber as primary accent (everything) | Indigo for interaction · Amber for gamification |
| Cream text (`#fef3c7`) — warm but heavy | Slate text (`#e2e8f0`) — readable, cool, clean |
| Flat, uniform depth | Layered shadows + inner highlights |

---

## Color Palette

### Backgrounds — 4-layer depth system

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0d0f14` | Page background — deep space, very slightly blue |
| `--bg-surface` | `#131720` | Cards, panels, sidebar |
| `--bg-raised` | `#1a1f2e` | Pills, hover states, badges |
| `--bg-editor` | `#090b10` | Code editor only — near-black for max contrast |

**Key principle:** Each layer is ~7–10 lightness steps apart. The slight blue-gray tint (`#0d0f14` not `#0d0d0d`) prevents the "cave" effect of pure black-brown.

### Borders — subtle, cool

| Token | Value | Usage |
|---|---|---|
| `--border` | `#1e2333` | Default border — barely visible, adds structure |
| `--border-warm` | `#2a3044` | Hover/focus borders, active separators |

### Primary Accent — Soft Indigo

**Rationale:** Indigo is the canonical modern accent — used by Linear, Vercel, Notion, Raycast. It reads as "technical + premium" without being cold like pure blue.

| Token | Value | Hex Preview | Usage |
|---|---|---|---|
| `--accent` | `#818cf8` | indigo-400 | Active states, selected items, focus rings |
| `--accent-dim` | `#4338ca` | indigo-700 | Button gradient start, deep backgrounds |
| `--accent-light` | `#a5b4fc` | indigo-300 | Text on dark, stat values |
| `--accent-glow` | `rgba(129,140,248,0.22)` | — | Box shadows, ambient glow |

### Secondary Accent — Warm Amber (gamification only)

Amber is reserved exclusively for metrics that communicate *energy and momentum* — not interactive UI. This dual-accent system creates clear semantic meaning.

| Token | Value | Usage |
|---|---|---|
| `--amber` | `#f59e0b` | Streak indicator, hint box border, XP bar |
| `--amber-light` | `#fbbf24` | XP bar glow dot, active streak text |
| `--amber-dim` | `#78350f` | XP bar gradient start |

**Amber is used for:** XP progress bar · Streak count · Hint box accent · Toast notification

**Amber is NOT used for:** Buttons · Active nav states · Level badges · Badge tiles

### Semantic Colors

| Token | Value | Notes |
|---|---|---|
| `--success` | `#34d399` | Emerald-400 — cooler than lime, pairs with indigo |
| `--error` | `#f87171` | Rose-400 — warm enough to stand out |

### Text — Slate Scale

| Token | Value | Contrast on `bg-surface` | Usage |
|---|---|---|---|
| `--text-primary` | `#e2e8f0` | 12.4:1 ✓ | Headings, important values |
| `--text-secondary` | `#94a3b8` | 5.8:1 ✓ | Body text, descriptions |
| `--text-muted` | `#475569` | 2.8:1 | Labels, metadata, placeholders |
| `--text-code` | `#c4b5fd` | 9.1:1 ✓ | Code editor text — violet-300 |

**Why `#e2e8f0` not `#ffffff`?** Pure white on near-black creates harsh halation. Slate-200 sits at the sweet spot: readable without visual tension.

**Why violet for code text?** `#c4b5fd` (violet-300) on `#090b10` is both readable (9:1 contrast) and beautiful — it feels like a premium syntax theme rather than a generic terminal.

---

## Ambient Background System

The page background uses layered radial gradients to create a subtle sense of depth and space:

```css
/* Dark mode — indigo/violet nebula */
body::before {
  background:
    radial-gradient(ellipse 70% 45% at 15% 35%, rgba(99,102,241,0.07) 0%, transparent 65%),
    radial-gradient(ellipse 55% 40% at 85% 65%, rgba(139,92,246,0.05) 0%, transparent 55%),
    radial-gradient(ellipse 40% 30% at 50% 90%, rgba(79,70,229,0.04) 0%, transparent 50%);
}
```

These are extremely subtle (4–7% opacity) — barely perceptible, but they break the flat uniformity of a pure dark background. The effect looks like deep-space photography rather than a paint bucket.

The dot grid uses slate dots (`rgba(148,163,184,0.055)`) rather than warm ochre — maintaining the cool palette coherence.

---

## Component Color Assignments

### Header
| Element | Dark value |
|---|---|
| Logo icon background | `accent-dim → accent` gradient |
| XP progress bar | Amber shimmer (gamification) |
| Levels stat | `accent-light` text |
| Progress % | `success` text |
| Streak | Amber/orange (gamification) |
| Level badge | `rgba(129,140,248,0.1)` bg, `accent-light` text |
| Theme toggle hover | `accent` border |

### Sidebar — Level Selector
| State | Background | Border | Number | Text |
|---|---|---|---|---|
| Locked | transparent | transparent | 🔒 | `text-muted` @ 28% opacity |
| Open | transparent | transparent | number in `text-muted` | `text-muted` |
| Active | `rgba(129,140,248,0.09)` | `rgba(129,140,248,0.35)` | `accent-light` | `text-primary` |
| Done | `rgba(52,211,153,0.05)` | `rgba(52,211,153,0.2)` | ✓ in `success` | `text-secondary` |

Active node pulse ring: indigo radial expansion (`rgba(129,140,248,0.5) → transparent`)

Dot mini-map: `success` = completed · `accent` = current · `dot-empty` = locked

### Badges Panel
- Unlocked: `rgba(129,140,248,0.09)` bg, `rgba(129,140,248,0.28)` border, `accent-light` label
- Locked: `bg-raised`, `border`, grayscale emoji, `text-muted` label, 40% opacity

### Buttons
| Class | Gradient | Glow |
|---|---|---|
| `.btn-primary` (Run Code) | `accent-dim → accent` | `accent-glow` |
| `.btn-success` (Next Level) | `#065f46 → #34d399` | emerald |
| `.btn-ghost` | transparent | accent tint on hover |
| `.btn-danger` | transparent | rose on hover |

### Code Editor
- Background: `bg-editor` (#090b10)
- Text: `text-code` (#c4b5fd — violet)
- Caret: `accent-light`
- Selection: `rgba(129,140,248,0.2)`
- Toolbar: `#0f1118`
- Status bar: `#07090d`

---

## Shadow System

Dark mode uses a 3-layer shadow strategy for cards:

```css
box-shadow:
  0 1px 2px rgba(0,0,0,0.5),      /* crisp near shadow — defines edge */
  0 6px 24px rgba(0,0,0,0.4),     /* diffuse far shadow — lifts card */
  inset 0 1px 0 rgba(255,255,255,0.03); /* top inner highlight — simulates rim light */
```

The `inset` top highlight is crucial: it makes cards look like they're lit from above, creating natural depth without neon glow effects.

---

## Design Principles Applied

### 1. The Two-Accent Rule
Indigo = interaction (you click it). Amber = progress (you earned it). Never mix.

### 2. Layered Depth, Not Flat
4 distinct background values (`base → surface → raised → editor`) create a visual hierarchy without needing heavy shadows or outlines.

### 3. 70/20/10 Color Ratio
- 70% neutral backgrounds (space grays)
- 20% text/content (slate scale)
- 10% accent colors (indigo + amber highlights)

### 4. Cool Temperature, Warm Contrast
The backgrounds are cool (blue-gray). The amber accent pops against them. This is the same principle used by tools like Linear and Arc Browser — cool environment, warm energy.

### 5. Typography as Hierarchy
- `Sora 800` at `#e2e8f0` = primary heading
- `Sora 700` at `#94a3b8` = section labels
- `Nunito 400` at `#94a3b8` = body text
- `Fira Code` at `#c4b5fd` = code + metadata

Font weight and color together define 4 clear hierarchy levels — no need for size jumps.

---

## Token Quick Reference

```css
/* Paste this anywhere you need the full token set */
--accent:       #818cf8;  --accent-dim:   #4338ca;  --accent-light: #a5b4fc;
--amber:        #f59e0b;  --amber-light:  #fbbf24;
--success:      #34d399;  --error:        #f87171;
--bg-base:      #0d0f14;  --bg-surface:   #131720;
--bg-raised:    #1a1f2e;  --bg-editor:    #090b10;
--border:       #1e2333;  --border-warm:  #2a3044;
--text-primary: #e2e8f0;  --text-secondary:#94a3b8;
--text-muted:   #475569;  --text-code:    #c4b5fd;
```
