# Design System — Product Design Reference

A unified design specification for a single cohesive product spanning dashboard, modals, forms, templates, calendar, and landing page flows. All components share one visual language, color system, and typographic hierarchy.

---

## 1. Design Tokens

### 1.1 Color Palette

Primary brand colors anchoring every surface and interaction:

```
--color-bg-base:        #fcfcfc   /* page background, card fills */
--color-bg-soft:        #eef2fb   /* sidebar, secondary surfaces, hover states */
--color-bg-accent:      #d6e4ff   /* active states, selected items, highlights */
--color-accent-blue:    #3b5bdb   /* primary CTA buttons, links, progress bars */
--color-accent-indigo:  #4c6ef5   /* chart fills, badge backgrounds */
--color-accent-violet:  #7c3aed   /* tags, category pills (use sparingly) */

--color-text-primary:   #1a1a2e   /* headings, high-emphasis labels */
--color-text-secondary: #4a5568   /* body copy, descriptions */
--color-text-muted:     #94a3b8   /* placeholders, timestamps, helper text */

--color-border:         #e2e8f0   /* default card/input borders */
--color-border-focus:   #3b5bdb   /* focused input outlines */

--color-success:        #22c55e
--color-warning:        #f59e0b
--color-danger:         #ef4444
--color-info:           #3b82f6
```

Semantic usage rules:
- `#fcfcfc` — always the outermost page/modal background. Never use pure white (#ffffff) or gray (#f5f5f5).
- `#eef2fb` — sidebar fills, card secondary zones, table row hovers, input backgrounds.
- `#d6e4ff` — active nav items, selected row highlights, button hover backgrounds, chip fills.
- `#3b5bdb` — the single accent color for all primary actions (Send, Sign up, Preview, Pay).

### 1.2 Typography

**Primary font family: Poppins** (Google Fonts) — used for all UI text.

```css
font-family: 'Poppins', sans-serif;
```

Type scale:

| Role              | Size  | Weight | Line Height | Use |
|-------------------|-------|--------|-------------|-----|
| Display / Hero    | 48px  | 700    | 1.1         | Landing page headline |
| H1 / Page title   | 28px  | 600    | 1.2         | "Welcome, Jane" |
| H2 / Section      | 20px  | 600    | 1.3         | Card titles, modal titles |
| H3 / Subsection   | 16px  | 500    | 1.4         | Account names, sidebar items |
| Body              | 14px  | 400    | 1.6         | Descriptions, form labels |
| Caption / Meta    | 12px  | 400    | 1.5         | Dates, amounts, placeholders |
| Micro / Badge     | 11px  | 500    | 1.4         | Tags, status pills |

Rules:
- Sentence case everywhere. No ALL CAPS headings. No Title Case on body text.
- Letter-spacing: `0` for body, `-0.01em` for H1/Display, `0.04em` for badge/micro text only.
- Numeric figures: use tabular nums (`font-variant-numeric: tabular-nums`) in all financial amounts, dates, and table cells.

### 1.3 Spacing

Base unit: `4px`. All spacing is a multiple of 4.

```
xs:   4px
sm:   8px
md:  12px
lg:  16px
xl:  24px
2xl: 32px
3xl: 48px
4xl: 64px
```

### 1.4 Border Radius

```
--radius-sm:   6px    /* badges, chips, small tags */
--radius-md:   10px   /* inputs, buttons, small cards */
--radius-lg:   14px   /* main cards, panels */
--radius-xl:   20px   /* modals, drawers */
--radius-full: 9999px /* avatar circles, toggle pills */
```

### 1.5 Elevation / Shadow

No heavy drop shadows. Subtle borders replace elevation in most cases.

```
--shadow-card:    0 1px 4px rgba(59, 91, 219, 0.06)
--shadow-modal:   0 8px 40px rgba(26, 26, 46, 0.12)
--shadow-popover: 0 4px 20px rgba(26, 26, 46, 0.08)
```

### 1.6 Motion

```
--transition-fast:   120ms ease
--transition-base:   200ms ease
--transition-slow:   320ms cubic-bezier(0.4, 0, 0.2, 1)
```

Hover states: background color transition only. Active states: `scale(0.98)`. Modal open: fade + translate-y(8px → 0). No bounce, no spring on utility UI.

---

## 2. Layout

### 2.1 Shell Structure

```
┌──────────────────────────────────────────────────────┐
│  Top bar (60px, sticky)                              │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  Main content area                        │
│ (228px)  │  padding: 32px 40px                       │
│          │                                           │
└──────────┴───────────────────────────────────────────┘
```

- Sidebar background: `#eef2fb`
- Top bar background: `#fcfcfc`, border-bottom: `1px solid #e2e8f0`
- Main content background: `#fcfcfc`
- Content max-width: `1280px`, centered with auto margins on wide viewports

### 2.2 Grid

Dashboard content uses a 12-column CSS grid, `gap: 20px`.
- Full-width cards: `grid-column: span 12`
- Half-width cards (2-up): `grid-column: span 6`
- Third-width cards: `grid-column: span 4`

---

## 3. Components

### 3.1 Sidebar Navigation

Visual spec:
- Width: 228px, full-height, `background: #eef2fb`
- Right border: `1px solid #e2e8f0`
- Logo / workspace name at top: 60px header, `background: #fcfcfc`, border-bottom same as topbar
- Nav items: 36px tall, 12px horizontal padding, `border-radius: 8px`, full-width
- Font: Poppins 13px / 500 weight
- Icon: 16px, left-aligned, 8px gap to label text
- Default state: `color: #4a5568`, icon `color: #94a3b8`
- Hover state: `background: #d6e4ff`, `color: #1a1a2e`
- Active / selected state: `background: #d6e4ff`, `color: #3b5bdb`, icon `color: #3b5bdb`
- Badge (e.g. "8" on Tasks): pill, `background: #3b5bdb`, `color: #fff`, 11px / 500, min-width 18px
- Section labels (e.g. "Workflows"): 10px / 600, `color: #94a3b8`, `letter-spacing: 0.08em`, uppercase, 16px top margin, 4px bottom margin
- Collapsible items: chevron icon, rotates 180° on expand, `transition: 200ms ease`

---

### 3.2 Top Bar

Visual spec:
- Height: 60px, sticky top
- Background: `#fcfcfc`, border-bottom: `1px solid #e2e8f0`
- Left: workspace logo (32px) + workspace name (Poppins 14px / 500) + dropdown chevron
- Center: global search input — width 400px, `background: #eef2fb`, `border: 1px solid #e2e8f0`, `border-radius: 10px`, 36px tall, placeholder text 13px muted, keyboard shortcut badge (⌘K) right-aligned inside input
- Right: "Move money" CTA button + icon strip (eye-hide, bell, avatar)
  - "Move money" button: `background: #fcfcfc`, `border: 1px solid #e2e8f0`, `border-radius: 8px`, 13px / 500, with dropdown chevron
  - Icon buttons: 36px circle, `background: transparent`, hover `background: #eef2fb`
  - Avatar: 32px circle, `border-radius: 9999px`

---

### 3.3 Dashboard — Main Content

**Page header**
- "Welcome, Jane" — Poppins 28px / 600, `color: #1a1a2e`
- Top margin from top bar: 32px

**Quick action bar**
- Horizontal row of pill buttons: Send, Transfer, Deposit, Request, Upload bill
- Height: 36px, `border-radius: 9999px`, `border: 1px solid #e2e8f0`, `background: #fcfcfc`
- Font: Poppins 13px / 500, `color: #1a1a2e`
- Icon left of label: 14px
- Active/primary (Send): `background: #3b5bdb`, `color: #fff`, `border-color: #3b5bdb`
- Right-aligned: "Customize" link in muted text with ⋮ icon
- Gap between pills: 8px

**Balance card** (left half-width)
- `background: #fcfcfc`, `border: 1px solid #e2e8f0`, `border-radius: 14px`, `padding: 24px`
- Title: "Mercury balance" — 13px / 500, muted + verified shield icon in `#3b5bdb`
- Balance amount: 32px / 700, `color: #1a1a2e`. Cents in superscript, smaller (20px)
- Time filter: "Last 30 days" dropdown — 12px / 500, muted
- Trend indicators: up arrow (green `#22c55e`) / down arrow (red `#ef4444`) + amount, 12px / 500
- Toggle icons (line chart / grid): 32px button, `background: #eef2fb`, `border-radius: 8px`
- Chart area: fills remaining card space
  - Chart line: `#3b5bdb`, stroke-width 1.5px
  - Fill under line: `#d6e4ff` at 40% opacity
  - X-axis labels: Poppins 11px, `color: #94a3b8`
  - No visible Y-axis or horizontal gridlines
- X-axis date labels: Mar 4, Mar 9, Mar 14, Mar 19, Mar 24 — evenly spaced

**Accounts card** (right half-width)
- Same card style as balance card
- Header: "Accounts" label 14px / 600 + "+" add button + "⋮" menu (both 32px circle, `background: #eef2fb`)
- Each account row:
  - 40px tall, vertically centered
  - Left: circular icon (32px, custom pattern/glyph in muted gray, `background: #eef2fb`, `border-radius: 9999px`)
  - Account name: 13px / 500, `color: #1a1a2e`
  - Balance: right-aligned, 13px / 500, `color: #1a1a2e`. Cents in superscript smaller (10px)
  - Divider: none between rows, just spacing
- "View all accounts" row at bottom:
  - "+2" badge: `background: #eef2fb`, `border-radius: 9999px`, 12px / 500
  - Text: 13px / 500, `color: #3b5bdb`

**Disputes card** (left half-width, below)
- Same card style
- Header: "Disputes" + pagination (1/9, chevron left/right) + "⋮" menu
- Pagination: 12px / 400, muted
- Content: title 14px / 500 + subtitle 12px muted + link arrow
- Progress bar area: two-segment bar
  - Filled segment: `background: #3b5bdb`, `border-radius: 4px`
  - Partial segment: `background: #d6e4ff`
  - Remaining: `background: #e2e8f0`
  - Height: 4px, full card width
- Stat: "Open disputes" label muted 12px, value "103 transactions" 14px / 600
- "View →" link: `color: #3b5bdb`, 13px / 500, right-aligned

**Credit Card card** (right half-width, below)
- Header: "Credit Card" 14px / 600 + card icon button + "⋮"
- Balance: 28px / 700 with superscript cents
- Progress bar: single fill `background: #3b5bdb`, `border-radius: 4px`, 6px tall, full width
- Metadata row: "Balance ●" + "Pending ●" dots (blue + muted), right: "$21,249 available" muted
- Autopay row: sync icon + "Autopay" label, date below in 14px / 500
- "Pay" button: `background: #eef2fb`, `border-radius: 9999px`, 13px / 500, right-aligned

---

### 3.4 Upload Modal

Visual spec:
- Overlay: `background: rgba(26, 26, 46, 0.40)`, full-screen
- Modal container: `background: #fcfcfc`, `border-radius: 20px`, `box-shadow: 0 8px 40px rgba(26,26,46,0.12)`, max-width 520px, centered
- Padding: 32px
- Title: "Upload image" — Poppins 22px / 600, `color: #1a1a2e`
- Close button: "×" — 32px, top-right, `color: #94a3b8`, hover `color: #1a1a2e`

**Drop zone**
- `background: #eef2fb`
- `border: 1.5px dashed #94a3b8` (dashed, not solid)
- `border-radius: 16px`
- Padding: 48px 32px
- Icon: image-add glyph, 40px, `color: #1a1a2e`
- Primary text: "Drop an image or browse file" — Poppins 18px / 600, `color: #1a1a2e`, margin-top 16px
- Drag-over state: `border-color: #3b5bdb`, `background: #d6e4ff`

**Supported formats section** (inside drop zone, below primary text)
- "Supported formats" label: 13px / 500, `color: #4a5568`, margin-top 24px
- Format tags: `.png .jpeg`, `Dimension >64x64px`, `File size ≤5MB`
  - Each: `border: 1px solid #e2e8f0`, `border-radius: 6px`, `background: #fcfcfc`, padding 4px 12px, 12px / 500, `color: #4a5568`
  - Gap between tags: 8px

**Divider**
- "Or" text centered with horizontal lines either side
- Line: `1px solid #e2e8f0`, `color: #94a3b8`, 12px / 400

**Link input row**
- Input: full-width, 44px tall, `border: 1px solid #e2e8f0`, `border-radius: 10px`, `background: #fcfcfc`
- Left icon: link icon, 16px, `color: #94a3b8`, 12px left padding
- Placeholder: "Drop an image link" — 13px, `color: #94a3b8`
- "Search" button: attached right, `background: #eef2fb`, `border-radius: 0 10px 10px 0`, `border-left: 1px solid #e2e8f0`, 13px / 500, `color: #1a1a2e`

---

### 3.5 Templates / Selection Panel

Visual spec (full-screen modal or route-level page):
- Background: `#fcfcfc`
- Top bar: "← Choose list  |  Templates" breadcrumb — 14px / 500, `color: #4a5568`. Separator `|` muted. "Templates" is the active segment in `color: #1a1a2e`
- Close "×" button: top-right, 32px

**Left sidebar (category filter)**
- Width: 220px, `background: #fcfcfc`, right border `1px solid #e2e8f0`
- Section label: "USE CASES" — 10px / 600, `color: #94a3b8`, letter-spacing 0.08em, uppercase
- Category items: 36px rows, 12px horizontal padding
  - Icon: 20px colored circle/glyph left of label
  - Label: 14px / 500, `color: #4a5568`
  - Hover: `background: #eef2fb`
  - Selected: `background: #d6e4ff`, `color: #3b5bdb`
  - Right: circular checkbox (24px), `border: 1.5px solid #e2e8f0`, checked fill `#3b5bdb`

**Right content area (template list)**
- Top: search input — full-width, `background: #fcfcfc`, no visible border at rest (bottom border only on focus), placeholder "Search for templates, topics, goals..." — 16px, `color: #94a3b8`
- Template rows separated by `1px solid #e2e8f0` dividers
- Each template row: 3-column layout
  - Left: 120×80px preview thumbnail, `border-radius: 8px`, `border: 1px solid #e2e8f0`, `background: #eef2fb`
  - Center: title 16px / 600 `color: #1a1a2e` (with emoji prefix), description 13px / 400 `color: #4a5568` (2 lines max), tags as pills below
    - Tag pills: `background: #eef2fb`, `border-radius: 6px`, padding 3px 10px, 11px / 500, color varies by category
  - Right: icon clusters (view type icons: grid, list, table, kanban, +N overflow) + action icons (table, calendar, board)
    - View icons: 20px, `color: #94a3b8`, hover `color: #3b5bdb`
    - "+7" overflow badge: 11px / 500, `color: #4a5568`
  - Row padding: 20px 24px, hover `background: #eef2fb`

**Bottom action bar**
- `border-top: 1px solid #e2e8f0`, padding 16px 24px
- Left: navigate arrows ↑↓ with "Navigate" label — 12px / 400, muted
- Right: "Start from Scratch ↵" — 13px / 500, muted + "Preview template ↵" — primary button, `background: #3b5bdb`, `color: #fff`, `border-radius: 8px`, 13px / 500, keyboard shortcut badge inside

---

### 3.6 Calendar View

Visual spec:
- **Left panel (sidebar)**: 220px, `background: #fcfcfc`
  - "+" add button: 32px circle, `background: #d6e4ff`, `color: #3b5bdb`, top-right
  - Inbox, Updates, My Focus, Calendar, Tasks, Projects — nav items per sidebar spec above
  - "Contacts" section with search input, `background: #eef2fb`, `border-radius: 8px`
  - Inbox items: label left, count badge right, 13px / 400
  - Today's tasks list: 13px / 400, `color: #4a5568`, with day label right-aligned muted
  - This week: same, with small doc-attach icon on some items

- **Calendar grid (center)**: fills remaining width
  - Header: month+year "Sep 2024" (16px / 600) + week badge "W37" (`background: #eef2fb`, `border-radius: 6px`, 12px / 500) + prev/next chevrons
  - Right: record dot (red, 8px), search icon, overflow "⋯", "Schedule" tab button (`background: #3b5bdb`, `color: #fff`, `border-radius: 8px`)
  - Column headers: day-of-week + date number. Active day ("Wed 11"): date circle `background: #3b5bdb`, `color: #fff`, 20px circle
  - Time gutter (left): 12px, `color: #94a3b8`, right-aligned in 48px column
  - All-day row: event chips full-width per column, `border-radius: 6px`, `border: 1px solid #e2e8f0`, 12px / 400
  - Time grid lines: `1px solid #e2e8f0`, full-width horizontal

  **Event color coding:**
  - Purple/indigo (`#d6e4ff` bg, `#3b5bdb` text): Deep Work, Creative Work
  - Salmon/red (`#fde8e8` bg, `#c0392b` text): Client/Team meetings, Admin
  - Green (`#e6f4ea` bg, `#22863a` text): Planning, Design Execution
  - Yellow/amber (`#fef9c3` bg, `#a16207` text): Lunch/Break
  - Blue (`#eef2fb` bg, `#3b5bdb` text): Design Revisions, Collaboration
  - All events: `border-radius: 6px`, padding 6px 8px, 12px / 500 title, 11px muted subtitle (time + location)

- **Right panel (share availability drawer)**: 320px, `border-left: 1px solid #e2e8f0`
  - Title: "Share availability" — 18px / 600
  - Subtitle: 13px / 400, muted
  - Fields: icon + label + value rows, 16px tall, `color: #1a1a2e`
  - Toggle switch: 36px × 20px pill, `background: #e2e8f0` (off) / `#3b5bdb` (on)
  - Slot list: dates + time ranges in 13px / 400
  - "Close Esc" ghost button + "Copy availability ⌘C" primary button at bottom

  **Scheduling tooltip / popover:**
  - `background: #3b5bdb`, `color: #fff`, `border-radius: 12px`, padding 16px 20px, max-width 280px
  - Title: 14px / 600, white
  - Bullet rows: checkmark icon + 13px / 400 description
  - Close "×": top-right, white, 12px
  - "I understand" button: `background: #fff`, `color: #3b5bdb`, `border-radius: 8px`, 13px / 500
  - "Learn more" ghost: `color: #d6e4ff`, 13px / 400

  **Add teammates input (inline overlay):**
  - Full-width input on calendar, `background: #fcfcfc`, `border: 1px solid #e2e8f0`, `border-radius: 10px`, placeholder 16px muted
  - Duration / range chips: `background: #eef2fb`, `border-radius: 6px`, with keyboard shortcut badge
  - "Show proposal" primary button: `background: #3b5bdb`, `color: #fff`, `border-radius: 8px`, sparkle icon left, 13px / 500

---

### 3.7 Landing Page (Airtable-style flow)

**Announcement banner**
- Full-width, `background: #eef2fb`, height 36px, centered
- Sparkle icon + text + "Learn more →" link in `color: #3b5bdb`
- 12px / 500

**Top navigation**
- `background: #fcfcfc`, `border-bottom: 1px solid #e2e8f0`, height 60px
- Logo: left, 28px height
- Nav links: Platform, Solutions, Resources, Pricing — 14px / 500, `color: #4a5568`, hover `color: #1a1a2e`
- Right: "Contact Sales" ghost button (`border: 1px solid #e2e8f0`, `border-radius: 8px`) + "Sign up for free" primary button (`background: #3b5bdb`, `color: #fff`, `border-radius: 8px`) + "Sign in" text link muted
- Button height: 36px

**Hero section**
- Background: soft periwinkle gradient mesh — `background: linear-gradient(135deg, #eef2fb 0%, #d6e4ff 50%, #fcfcfc 100%)`, no noise
- Layout: 2-column, 50/50 at desktop
- Left column:
  - "NEW" pill badge: `background: linear-gradient(90deg, #d6e4ff, #eef2fb)`, `border-radius: 9999px`, 11px / 600, `color: #3b5bdb`
  - "Build apps instantly with AI →" — 13px / 500, `color: #1a1a2e`, pill with arrow
  - Headline: 48px / 700, `color: #1a1a2e`, 2–3 lines, tight line-height (1.1)
  - Subheadline: 18px / 400, `color: #4a5568`, margin-top 16px
  - CTA row: "Sign up for free" primary (44px, `border-radius: 10px`, `background: #3b5bdb`) + "Contact Sales" outlined (same height, `border: 1.5px solid #1a1a2e`, `color: #1a1a2e`, `border-radius: 10px`)
  - Gap between CTAs: 12px
- Right column: floating product UI screenshots
  - 3–4 overlapping UI card mockups at various z-levels
  - Cards: `background: #fcfcfc`, `border-radius: 12px`, `border: 1px solid #e2e8f0`, `box-shadow: 0 4px 20px rgba(26,26,46,0.08)`
  - Subtle vertical offset stagger (bottom card behind, top card fully visible)
  - No rotation — cards are axis-aligned

---

## 4. Interaction Patterns

### Focus states
All interactive elements: `outline: 2px solid #3b5bdb; outline-offset: 2px` on focus-visible. Never remove outlines without replacement.

### Button states
- Default → Hover: background lightens 8% or shifts to `#d6e4ff`
- Active: `transform: scale(0.98)`
- Disabled: `opacity: 0.4`, `cursor: not-allowed`

### Form inputs
- Default border: `1px solid #e2e8f0`
- Hover border: `1px solid #94a3b8`
- Focus border: `2px solid #3b5bdb` (replaces 1px)
- Error border: `2px solid #ef4444` + error message 12px below in `color: #ef4444`
- Height: 40px (standard), 36px (compact), 48px (hero/large)
- `border-radius: 10px`
- `background: #fcfcfc`

### Loading / skeleton
- Skeleton blocks: `background: linear-gradient(90deg, #eef2fb 25%, #d6e4ff 50%, #eef2fb 75%)`, animated shimmer, `border-radius: 6px`

---

## 5. Iconography

- Style: outline icons only (no filled variants)
- Stroke width: 1.5px
- Size: 16px inline, 20px navigation, 24px feature/hero icons
- Color: inherits from context — muted `#94a3b8` by default, primary `#3b5bdb` on active states
- Recommended library: Tabler Icons (outline set) — consistent stroke weight across all screens

---

## 6. Responsive Breakpoints

| Breakpoint | Width      | Layout changes |
|------------|------------|----------------|
| Mobile     | < 768px    | Sidebar collapses to bottom tab bar; cards go full-width; hero is single column |
| Tablet     | 768–1024px | Sidebar hidden behind hamburger; 2-col grid becomes 1-col |
| Desktop    | 1024–1280px| Full layout as specced above |
| Wide       | > 1280px   | Max content width 1280px, centered with `#fcfcfc` side gutters |

---

## 7. Accessibility

- Minimum color contrast: 4.5:1 for body text, 3:1 for large text and UI components
- Focus indicators: always visible (never `outline: none` without replacement)
- All icon-only buttons require `aria-label`
- Form inputs require associated `<label>` elements
- Modal dialogs: focus trapped inside, `role="dialog"`, `aria-modal="true"`, Escape to close
- Color is never the sole differentiator (always paired with text or icon)
- Motion respects `prefers-reduced-motion: reduce` — disable transitions and animations

---

## 3.8 Forms System

A unified form system shared across onboarding, uploads, workspace setup, scheduling, billing, recruiting, and template creation flows.

### Form Philosophy

The entire product ecosystem should feel:
- calm
- structured
- lightweight
- highly scannable
- productivity-first

Forms must never feel enterprise-heavy or visually dense.

Every form should:
- prioritize whitespace over separators
- avoid excessive borders
- use progressive disclosure
- guide users through one mental step at a time
- visually resemble Linear, Airtable, Notion Calendar, Mercury, and modern AI-native SaaS tools

---

### Form Container Styles

#### Standard form card

```css
background: #fcfcfc;
border: 1px solid #e2e8f0;
border-radius: 16px;
padding: 24px;
box-shadow: 0 1px 4px rgba(59, 91, 219, 0.06);
