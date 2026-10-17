---
version: 1.0
name: AppKitX Design System
description: Precision — a light, technical visual system for a global platform of free calculators, converters, and developer utilities. Teal accent, cool neutral grays, compact density, monospace details for numeric and code work, and a search-first navigation model.
updated: 2026-10-17
---

# AppKitX Design System

## Overview

AppKitX is a global platform of free online calculators, converters, and developer utilities. The design system exists to make **tool discovery effortless and task completion fast**: users arrive with a task, find the right tool in seconds, complete it without friction, and trust the result.

The visual identity is **Precision** — a light, technical aesthetic built on a single teal accent, cool neutral grays, compact density, and monospace details for numeric and code work. Chrome is quiet; the tools are the interface.

### Design principles

1. **Task first.** Every screen prioritizes the tool, its inputs, and its output over marketing. No decorative filler.
2. **Search is navigation.** The fastest path to any tool is the search palette. Navigation is a fallback, not the primary route.
3. **Clarity over decoration.** No decorative gradients, no stock photography, no ornamental chrome. Contrast, alignment, and rhythm carry the design.
4. **One accent.** Teal (`--color-accent`) carries every interactive signal. Status colors appear only for status. There is no second brand color.
5. **Compact but breathable.** Dense enough to scan dozens of tools in one viewport; spaced enough to read and operate comfortably.
6. **Accessible by default.** WCAG 2.2 AA is the floor, not an enhancement. See the Accessibility Requirements section.
7. **Honest UI.** No dark patterns, no fake urgency, no engagement traps. Results are shown plainly and copyable.

---

## Color

### Primitive palette

Cool neutrals (slate family) + teal accent family + three status families. Primitives are reference values only — components always use the semantic roles below.

| Primitive            | Hex                   | Notes                           |
| -------------------- | --------------------- | ------------------------------- |
| teal-50              | `#f0fdfa`             | Accent tint surfaces            |
| teal-100             | `#ccfbf1`             | Accent tint borders             |
| teal-600             | `#0d9488`             | Focus ring                      |
| teal-700             | `#0f766e`             | Primary accent (actions, links) |
| teal-800             | `#115e59`             | Accent hover                    |
| teal-900             | `#134e4a`             | Accent pressed                  |
| slate-50             | `#f8fafc`             | Page background tint            |
| slate-100            | `#f1f5f9`             | Muted fills                     |
| slate-200            | `#e2e8f0`             | Structural borders              |
| slate-300            | `#cbd5e1`             | Strong structural borders       |
| slate-400            | `#94a3b8`             | Disabled text                   |
| slate-500            | `#64748b`             | Muted text, control borders     |
| slate-600            | `#475569`             | Secondary text                  |
| slate-700            | `#334155`             | —                               |
| slate-900            | `#0f172a`             | Primary text                    |
| white                | `#ffffff`             | Canvas                          |
| green-50 / green-700 | `#f0fdf4` / `#15803d` | Success                         |
| red-50 / red-700     | `#fef2f2` / `#b91c1c` | Error                           |
| amber-50 / amber-700 | `#fffbeb` / `#b45309` | Warning                         |

### Semantic roles (CSS custom properties)

Components reference these names only. Never use primitive values directly.

| Token                                        | Value                 | Role                                                              |
| -------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| `--color-accent`                             | `#0f766e`             | All interactive elements: links, primary actions, selected states |
| `--color-accent-hover`                       | `#115e59`             | Accent hover                                                      |
| `--color-accent-active`                      | `#134e4a`             | Accent pressed                                                    |
| `--color-accent-subtle`                      | `#f0fdfa`             | Tinted surfaces: selected chips, result panels, icon tiles        |
| `--color-accent-subtle-border`               | `#ccfbf1`             | Borders on tinted surfaces                                        |
| `--color-focus-ring`                         | `#0d9488`             | Keyboard focus indicator                                          |
| `--color-text-primary`                       | `#0f172a`             | Headings, body copy, values                                       |
| `--color-text-secondary`                     | `#475569`             | Supporting copy, card descriptions, nav links                     |
| `--color-text-muted`                         | `#64748b`             | Meta, captions, placeholders, helper text                         |
| `--color-text-disabled`                      | `#94a3b8`             | Disabled labels and icons (contrast-exempt)                       |
| `--color-text-on-accent`                     | `#ffffff`             | Text/icons on accent fills                                        |
| `--color-surface`                            | `#ffffff`             | Default canvas: page, cards, inputs                               |
| `--color-surface-subtle`                     | `#f8fafc`             | Section bands, footer, hover fills, output panes                  |
| `--color-surface-muted`                      | `#f1f5f9`             | Inline code, keyboard hints, disabled fills                       |
| `--color-border-subtle`                      | `#e2e8f0`             | Structural borders: cards, dividers, table rules                  |
| `--color-border-strong`                      | `#cbd5e1`             | Emphasized structural borders (card hover)                        |
| `--color-border-control`                     | `#64748b`             | Boundaries of interactive controls (inputs, outlined buttons)     |
| `--color-overlay`                            | `rgb(15 23 42 / 0.4)` | Modal scrim                                                       |
| `--color-success` / `--color-success-subtle` | `#15803d` / `#f0fdf4` | Success text / surfaces                                           |
| `--color-error` / `--color-error-subtle`     | `#b91c1c` / `#fef2f2` | Error text / surfaces                                             |
| `--color-warning` / `--color-warning-subtle` | `#b45309` / `#fffbeb` | Warning text / surfaces                                           |

### Contrast requirements

All ratios are computed with the WCAG 2.2 relative-luminance formula for the exact token pairs below. Text requires ≥4.5:1; non-text boundaries and focus indicators require ≥3:1.

**Text on surfaces** (≥4.5:1):

| Pair                                 | Ratio   |
| ------------------------------------ | ------- |
| `text-primary` on `surface`          | 17.85:1 |
| `text-primary` on `surface-subtle`   | 17.06:1 |
| `text-primary` on `surface-muted`    | 16.30:1 |
| `text-primary` on `accent-subtle`    | 17.12:1 |
| `text-secondary` on `surface`        | 7.58:1  |
| `text-secondary` on `surface-subtle` | 7.24:1  |
| `text-secondary` on `surface-muted`  | 6.92:1  |
| `text-secondary` on `accent-subtle`  | 7.27:1  |
| `text-muted` on `surface`            | 4.76:1  |
| `text-muted` on `surface-subtle`     | 4.55:1  |
| `text-muted` on `accent-subtle`      | 4.56:1  |

**Accent interactive states** (≥4.5:1):

| Pair                                          | Ratio  |
| --------------------------------------------- | ------ |
| `accent` on `surface` (links)                 | 5.47:1 |
| `accent` on `surface-subtle`                  | 5.23:1 |
| `accent` on `surface-muted`                   | 5.00:1 |
| `accent` on `accent-subtle` (selected chip)   | 5.25:1 |
| `accent-hover` on `surface` (hover)           | 7.58:1 |
| `accent-active` on `surface` (pressed)        | 9.48:1 |
| `text-on-accent` on `accent` (primary button) | 5.47:1 |
| `text-on-accent` on `accent-hover`            | 7.58:1 |
| `text-on-accent` on `accent-active`           | 9.48:1 |

**Status text** (≥4.5:1):

| Pair                                                        | Ratio                    |
| ----------------------------------------------------------- | ------------------------ |
| `success` on `surface` / `success-subtle` / `accent-subtle` | 5.02:1 / 4.79:1 / 4.81:1 |
| `error` on `surface` / `error-subtle` / `accent-subtle`     | 6.47:1 / 5.91:1 / 6.20:1 |
| `warning` on `surface` / `warning-subtle`                   | 5.02:1 / 4.84:1          |

**Non-text boundaries and indicators** (≥3:1):

| Pair                                 | Ratio  |
| ------------------------------------ | ------ |
| `focus-ring` on `surface`            | 3.74:1 |
| `focus-ring` on `surface-subtle`     | 3.58:1 |
| `focus-ring` on `surface-muted`      | 3.42:1 |
| `focus-ring` on `accent-subtle`      | 3.59:1 |
| `border-control` on `surface`        | 4.76:1 |
| `border-control` on `surface-subtle` | 4.55:1 |
| `border-control` on `surface-muted`  | 4.34:1 |

**Exempt and not permitted:**

- `text-disabled` on `surface` (2.56:1) and on `accent-subtle` (2.46:1) — disabled text is contrast-exempt; never use these roles for enabled content.
- `border-subtle` (1.23:1) and `border-strong` (1.48:1) on `surface` — decorative structural borders, exempt; they must never be the only boundary of an interactive control.
- **Not permitted:** `text-muted` on `surface-muted` (4.34:1) fails the 4.5:1 text requirement. Keyboard-hint chips use `text-secondary` (6.92:1) instead.

### Usage rules

- Teal is the only interactive signal. If it responds to a click, it is teal (or a defined neutral/status variant for that specific control).
- Status colors never decorate — they mark success, error, or warning states only.
- Structural borders are decorative and may be light; interactive control boundaries must meet 3:1 (`--color-border-control`).
- Text is always one of the semantic text roles. Never pure black; never raw primitives.
- Any new foreground/background combination must be added to the contrast table with a computed ratio before it is used.

---

## Typography

### Families

| Token         | Stack                                                                       | Usage                                      |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| `--font-sans` | `"Inter Variable", system-ui, -apple-system, sans-serif`                    | All UI and prose                           |
| `--font-mono` | `"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace` | Numeric inputs, results, code, hashes, IDs |

Both fonts are self-hosted via Fontsource (`@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`), licensed under SIL OFL 1.1. No CDN loading.

### Scale

| Token                | Size | Weight | Line height | Tracking           | Usage                                           |
| -------------------- | ---- | ------ | ----------- | ------------------ | ----------------------------------------------- |
| `--text-display`     | 40px | 600    | 1.15        | -0.01em            | Page hero headline                              |
| `--text-headline`    | 28px | 600    | 1.25        | -0.005em           | Section and tool page headings                  |
| `--text-title`       | 20px | 600    | 1.4         | 0                  | Sub-sections, related-tools headings            |
| `--text-body-lg`     | 18px | 400    | 1.6         | 0                  | Hero subline, lead paragraphs                   |
| `--text-body`        | 16px | 400    | 1.6         | 0                  | Default paragraph and body copy                 |
| `--text-body-strong` | 16px | 600    | 1.5         | 0                  | Inline emphasis, card titles                    |
| `--text-small`       | 14px | 400    | 1.55        | 0                  | Card descriptions, secondary rows               |
| `--text-label`       | 14px | 500    | 1.4         | 0                  | Form labels, UI labels, nav links               |
| `--text-button`      | 15px | 500    | 1.2         | 0                  | Button labels                                   |
| `--text-chip`        | 13px | 500    | 1.2         | 0                  | Category chips, tags                            |
| `--text-caption`     | 13px | 400    | 1.45        | 0                  | Meta, helper text                               |
| `--text-overline`    | 12px | 600    | 1.4         | 0.08em (uppercase) | Eyebrows, table headers, footer column headings |
| `--text-micro`       | 12px | 400    | 1.4         | 0                  | Legal, footnotes                                |
| `--text-mono-input`  | 15px | 400    | 1.5         | 0                  | Code/numeric input (`--font-mono`)              |
| `--text-mono-result` | 28px | 500    | 1.2         | -0.01em            | Calculator result values (`--font-mono`)        |

### Rules

- Weights are **400 / 500 / 600**. Weight 500 is a first-class citizen for labels, buttons, and chips.
- Tracking is neutral. Only display sizes carry a slight negative tighten (-0.01em). No px-based tracking values.
- Body copy is **16px / 1.6** — comfortable reading at UI scale without oversized text.
- **Numeric contexts always use tabular figures**: `font-variant-numeric: tabular-nums` on all calculator inputs, results, counters, and tables. Developer tools may additionally enable `slashed-zero` in hex/code contexts.
- Monospace is a functional signal (numbers, code), never decorative.
- Uppercase is reserved for overline labels only; never uppercase body copy or buttons.

---

## Spacing & Layout

### Spacing scale

A 4px base grid. All spacing values are multiples of 4:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

### Layout constants

| Token                     | Value                      | Usage                                      |
| ------------------------- | -------------------------- | ------------------------------------------ |
| `--layout-nav-height`     | 64px                       | Global navigation bar                      |
| `--layout-container`      | 1200px                     | Default page shell (grids, sections)       |
| `--layout-prose`          | 720px                      | Long-form educational content, legal pages |
| `--layout-tool`           | 640px                      | Tool panels and search input widths        |
| `--layout-section-y`      | 96px desktop / 64px mobile | Vertical rhythm between page sections      |
| `--layout-grid-gap`       | 24px desktop / 16px mobile | Tool grid gutters                          |
| `--layout-card-padding`   | 20px                       | Tool card interior                         |
| `--layout-panel-padding`  | 24px                       | Tool/calculator panel interior             |
| `--layout-control-height` | 44px                       | Default interactive control height         |

### Grid

- Tool grids: **4 columns** ≥1280px → **3** ≥1024px → **2** ≥640px → **1** below.
- Prose and tool panels are single-column and centered.
- Gutters: 24px desktop, 16px mobile. Cards align to the container, never full-bleed.
- Density is a scanability goal, not a quota. At 1280px the 4-column grid should present most of a tool section within one viewport, but card size is driven by content: title, up to two readable description lines, and the action row. Never shrink type, truncate descriptions below two readable lines, or compress the hero to fit more cards.

---

## Radii, Borders & Elevation

### Radii

| Token           | Value  | Usage                                   |
| --------------- | ------ | --------------------------------------- |
| `--radius-sm`   | 6px    | Inline code, keyboard hints, small tags |
| `--radius-md`   | 8px    | Buttons, inputs, icon tiles, sub-panels |
| `--radius-lg`   | 12px   | Cards, tool panels, result panels       |
| `--radius-xl`   | 16px   | Modals, search palette                  |
| `--radius-full` | 9999px | Category chips, avatars                 |

Buttons are **rectangular** (radius-md). Full-pill shapes are reserved for chips — the opposite of a pill-first button grammar.

### Borders

- Default card and divider border: `1px solid var(--color-border-subtle)`.
- Interactive control boundary: `1px solid var(--color-border-control)` (inputs, outlined buttons, segmented tracks).
- Focus: `2px solid var(--color-focus-ring)` with a `2px` offset everywhere (see Accessibility → Focus indicator).
- Error: `1px solid var(--color-error)` on the control; message below.

### Elevation

Elevation is **functional layering**, not decoration. Cards are flat at rest.

| Token         | Value                                                              | Usage                          |
| ------------- | ------------------------------------------------------------------ | ------------------------------ |
| `--shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.06), 0 2px 4px rgb(15 23 42 / 0.06)`   | Card hover, sticky action bars |
| `--shadow-md` | `0 4px 8px rgb(15 23 42 / 0.08), 0 2px 4px rgb(15 23 42 / 0.06)`   | Dropdowns, popovers, toasts    |
| `--shadow-lg` | `0 12px 24px rgb(15 23 42 / 0.12), 0 4px 8px rgb(15 23 42 / 0.08)` | Search palette, modals         |

No other shadows exist. Never apply shadows to text, headings, or flat surfaces.

---

## Interaction States

Every interactive element defines the full set. Hover is a state like any other — it must be specified, not left to defaults.

| State                          | Treatment                                                                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hover**                      | Color shift only: accent → `--color-accent-hover`; text-secondary → text-primary; card border → border-strong + `--shadow-sm`                                                                                                  |
| **Active (pressed)**           | Deeper color: accent → `--color-accent-active`. **No transform/scale effects.**                                                                                                                                                |
| **Focus-visible**              | `2px solid --color-focus-ring` with a `2px` offset everywhere. The offset gap separates the ring from the component, so it stays visible on accent-filled buttons and tinted panels alike. Never removed. See Focus indicator. |
| **Disabled**                   | `--color-surface-muted` fill, `--color-text-disabled` text, `cursor: not-allowed`. No opacity-only treatments.                                                                                                                 |
| **Selected** (chips, segments) | `--color-accent-subtle` fill, `--color-accent` border/text                                                                                                                                                                     |
| **Error**                      | `--color-error` border + message with icon; `aria-invalid="true"`                                                                                                                                                              |
| **Success**                    | `--color-success` text + icon (e.g., "Copied", valid JSON)                                                                                                                                                                     |
| **Loading**                    | Skeleton blocks in `--color-surface-muted`; no spinners under 300ms                                                                                                                                                            |

---

## Breakpoints & Responsive Behavior

| Token             | Width  | Key changes                                             |
| ----------------- | ------ | ------------------------------------------------------- |
| `--breakpoint-sm` | 640px  | Tool grid 1→2 columns; footer columns stack → 2         |
| `--breakpoint-md` | 768px  | Global nav expands from mobile drawer; footer 4 columns |
| `--breakpoint-lg` | 1024px | Tool grid 3 columns; developer-tool panes side-by-side  |
| `--breakpoint-xl` | 1280px | Tool grid 4 columns; full density                       |

### Collapsing rules

- **Global nav**: full links ≥768px; below: logo + search icon + menu button opening a drawer.
- **Hero**: display type steps 40 → 32 → 28px; search input goes full-width.
- **Tool grid**: 4 → 3 → 2 → 1 columns (see Grid).
- **Search palette**: ≥640px centered panel; below, full-screen sheet.
- **Developer tools**: split panes stack vertically below 1024px.
- **Calculator**: always single column, max 640px — works identically at every width.
- **Footer**: 4 columns ≥768px → 2 → 1.

---

## Accessibility Requirements

WCAG 2.2 AA baseline. These are requirements, not guidelines:

- **Contrast**: text ≥4.5:1, UI component boundaries and focus indicators ≥3:1. Use the semantic roles; they are tuned to pass.
- **Touch/click targets**: interactive controls are **44×44px minimum** by default. Dense desktop toolbars may use 36px controls with ≥8px spacing (still above the 24px WCAG minimum).
- **Focus**: every interactive element has a visible `:focus-visible` ring (see Focus indicator below). Never `outline: none` without a replacement.
- **Keyboard**: all functionality works without a pointer. The search palette opens with `⌘K` / `Ctrl+K` and closes with `Escape`; lists support arrow keys.
- **Forms**: every input has a visible `<label>`; errors are programmatically associated (`aria-describedby`, `aria-invalid`); result updates use `aria-live="polite"`.
- **Landmarks**: `header` / `nav` / `main` / `footer` on every page; a "Skip to content" link is the first focusable element.
- **Motion**: respect `prefers-reduced-motion` — transitions become instant; no autoplaying motion.
- **Images**: `alt` required; decorative graphics use `aria-hidden`.
- **Zoom**: layout remains functional at 200% zoom and 320px viewport width.

### Focus indicator

- **Geometry**: `2px` ring in `--color-focus-ring` with a `2px` offset on every interactive element. The offset gap is mandatory — it keeps the ring from merging with an accent fill (for example, a primary button on a white page) and reveals the adjacent surface between the component and the ring.
- **Visibility rule**: the ring must hold ≥3:1 against the adjacent surface on every surface it can appear on, and the component must remain distinguishable from the ring. Because the ring never touches accent fills, one ring definition works on white pages, subtle bands, muted fills, and tinted result panels.
- **Verified pairs**: focus-ring on surface 3.74:1, on surface-subtle 3.58:1, on surface-muted 3.42:1, on accent-subtle 3.59:1 — all pass (see Contrast requirements).
- **Verification method**: (1) ratios are computed with the WCAG relative-luminance formula for every surface a ring can appear on and recorded in the Contrast requirements table; (2) every interactive component's focus state is keyboard-tested in the running UI, and ring color, width, and offset are asserted in end-to-end checks where the harness supports computed-style assertions.

---

## Components

### Global navigation

- White surface, `1px` border-bottom (`--color-border-subtle`), height `--layout-nav-height` (64px), sticky.
- Left: AppKitX logo (original mark + wordmark, Inter 600 18px, `--color-text-primary`).
- Center/right: primary links (Tools, Categories, About) in `--text-label`, `--color-text-secondary`; hover → `--color-text-primary`.
- Right: **search trigger** — the visual anchor of the nav: 44px outlined button (border-control, radius-md) with search icon, "Search" label, and a `⌘K` hint in a `--color-surface-muted` chip with `--color-text-secondary` text. Opens the search palette.
- Mobile (<768px): logo + icon-only search button + menu button (44×44). Menu opens a drawer with full-width 48px link rows.
- Active page link: `--color-text-primary` + `2px` accent underline offset below the label.

### Search palette (⌘K)

The primary navigation surface. Opened by `⌘K`/`Ctrl+K` or the nav search trigger.

- Overlay `--color-overlay`; panel: max-width 640px, `--radius-xl`, `--shadow-lg`, top 15vh.
- Input row (56px): search icon + text input (16px, `--font-sans`) + `Esc` hint chip (`--color-surface-muted` fill, `--color-text-secondary` text).
- Results: grouped by "Tools" and "Categories" with `--text-overline` headers; rows 56px: icon tile (32px, `--radius-md`, `--color-accent-subtle` bg, accent icon), tool name (`--text-label`), category (`--text-caption`, muted). Keyboard-selected row: `--color-surface-subtle` fill.
- Empty state: "No tools match "<query>"" + suggestion to browse categories.
- Mobile: full-screen sheet, input pinned top.

### Homepage hero

Compact and functional — not a full-viewport marketing block.

- Left-aligned composition, padding 64px top / 48px bottom desktop (40/32 mobile).
- Headline `--text-display`; subline `--text-body-lg` in `--color-text-secondary`, max-width 560px.
- **Hero search input**: 56px tall, `--radius-lg`, `--color-border-control` border, search icon, placeholder "Search free tools…", full focus ring. Submits to the search results page; `⌘K` opens the palette from anywhere.
- Category chip rail below (24px gap): overline label "Browse by category" + chips.

### Category chips

- Height 32px, `--radius-full`, `1px solid --color-border-subtle`, white surface, `--text-chip`, `--color-text-secondary`.
- Hover: border-strong, text-primary. Selected: accent-subtle fill, accent border and text.
- Rendered as links on category pages; as filter toggles inside tool UIs (e.g., unit type).
- Wrap on desktop; horizontally scrollable on mobile with visible first/last chips.

### Tool card

- White surface, `--radius-lg`, `1px solid --color-border-subtle`, padding `--layout-card-padding` (20px). Flat at rest.
- The **entire card is a link**. Focus-visible ring wraps the card.
- Contents: icon tile (40px, `--radius-md`, accent-subtle bg, Lucide icon 20px accent), title (`--text-body-strong`), one-line description (`--text-small`, text-secondary, 2-line clamp), "Open tool" row (`--text-label`, accent + arrow icon).
- Hover: border-strong + `--shadow-sm`; the arrow icon shifts 2px right.
- Grid: see Grid section. Never nest cards.

### Calculator interface

Single column, max `--layout-tool` (640px). Structure top to bottom:

1. **Panel** (card, `--radius-lg`, padding 24px) containing the form:
   - Labels (`--text-label`) above every input; optional helper text (`--text-caption`, muted) below.
   - Inputs: 44px, `--radius-md`, border-control, `--font-mono` + `tabular-nums` for numeric fields; 16px minimum font size.
   - Segmented control for modes: `--color-surface-muted` track, white selected segment with `--shadow-sm`, `--text-label`; 44px.
   - Primary "Calculate" button (full-width, 44px) + secondary "Reset" (outlined).
2. **Result panel** (`--radius-lg`, `--color-accent-subtle` background, padding 20px):
   - Overline label "Result" (`--text-overline`, `--color-text-secondary`); value in `--text-mono-result` (mono, tabular-nums, `--color-text-primary`).
   - Copy-to-clipboard icon button (44×44, ghost) top-right; success feedback swaps icon to a check in `--color-success` for 2s.
   - Before first calculation: value shows "—" in text-disabled with caption "Results appear here" (`--text-caption`, `--color-text-muted`).
   - `aria-live="polite"` announces updated values.
3. **Explanation** below the panel: `--text-small`, text-secondary — the formula used, in prose with inline code.

Validation: errors appear inline under the offending field (error color, 13px, alert icon, `aria-describedby`); the Calculate button stays enabled and validation runs on submit.

### Developer tool interface

- Header row: tool title (`--text-title`) + actions — primary action button, then ghost buttons (Copy, Clear, Sample) in a `--text-button` row.
- Body: two sub-panels (input / output), each `--radius-md`, `1px solid --color-border-control`, mono 15px text.
  - Input: editable `<textarea>`, min-height 240px, white.
  - Output: read-only, `--color-surface-subtle` background, selectable.
  - ≥1024px: side-by-side (1fr 1fr, 16px gap). Below: stacked.
- Status line below (`--text-caption`, muted): character count, validity ("Valid JSON"), processing state.
- Errors: input border → error color, message row below with icon; output pane keeps the last valid result.
- All actions keyboard-reachable; Copy uses the same success feedback as the calculator.

### Inputs & validation

- Text input: 44px, `--radius-md`, border-control, padding 10/14, 16px text.
- Focus: border color shifts to `--color-accent`, plus the standard focus ring (`2px` + `2px` offset, see Focus indicator) — including inputs inside panels.
- Error: error border + message below with icon. Never rely on color alone — always pair with text and an icon.
- Success (e.g., valid hash): green check icon inline.
- Disabled: surface-muted fill, text-disabled.
- Select and textarea follow the same geometry; textarea min-height 160px.

### Results & output

- Calculator results: accent-subtle panel, mono value, copy affordance (see Calculator interface).
- Developer output: surface-subtle pane with mono text, copy affordance in toolbar.
- Numbers always `tabular-nums`. Long values wrap; never truncate a result.
- Every result is selectable text — never render values as images.

### Related tools

- Section heading `--text-title` + optional "See all" link (ghost, accent).
- Grid of 3 (≥1024px) / 2 / 1 tool cards.
- Placed after the tool's explanation content, before the footer.

### Educational content

- Prose column: `--layout-prose` (720px), left-aligned.
- Body `--text-body`; paragraphs spaced 16px; headings `--text-headline` (48px top margin) and `--text-title` (32px top margin).
- Links: accent, underlined with 2px offset; hover → accent-hover.
- Inline code: `--font-mono` 14px in `--color-text-primary` on `--color-surface-muted`, `--radius-sm`, 2/6 padding.
- Tables: full-width, overline headers, row rules in border-subtle, cell padding 12px.
- Blockquotes: 2px accent left border, 16px padding-left, text-secondary.
- This is where trust is built: show the formula, the assumptions, and the worked example for every calculator.

### Footer

- `--color-surface-subtle` background, `1px` border-top (border-subtle), padding 48px top/bottom.
- Columns: Tools, Categories, Company, Legal — headings `--text-overline` (muted), links `--text-small` text-secondary, hover accent. 4 columns ≥768px → 2 → 1.
- Legal row: border-top, 12px `--text-micro` in text-muted: "© 2026 AppKitX" + Privacy / Terms links.

### Legal pages

- Prose layout (`--layout-prose`), `--text-caption` "Last updated" line under the headline.
- Same typography rules as educational content.

### Empty & error states

- **404**: centered, `--text-headline`, one line of guidance, hero search input, popular-tool chips.
- **Empty search**: icon + "No tools match "<query>"" + chip suggestions.
- **Empty category**: icon + "Tools are on the way" + "Browse all tools" link.
- **Tool error**: error-subtle panel (`--radius-lg`) with alert icon, plain-language message, and a "Try again" ghost button. Never expose raw stack traces.

---

## Assets & Licensing

- **Fonts**: Inter and JetBrains Mono via Fontsource, SIL OFL 1.1, self-hosted. No proprietary fonts, no CDN loading.
- **Icons**: Lucide (ISC license). Retain the copyright and license notice — see `LICENSES.md`. Icons render inline as SVG at 16/20/24px with `stroke-width: 2`, color `currentColor`.
- **Logo**: the AppKitX wordmark and mark are original works. The final logo mark is pending design; the wordmark (Inter 600) is approved for interim use.
- **Imagery**: no stock photography or third-party illustrations. Tool visuals are live UI or original SVG diagrams only.
- **Policy**: any new third-party asset (icon set, illustration, font, image) requires its source and license documented in `LICENSES.md` before merge. Public accessibility of an asset does not imply a license to use it.

---

## Implementation Notes

### Tokenization policy

Global tokens are required for values that repeat across components or encode system-level decisions:

- **Colors**: all component colors come from semantic color roles. Color literals (hex, `rgb()`, named colors) never appear in component code or component specs.
- **Shared dimensions**: anything referenced by more than one component, or that encodes a system-level decision, is a global token — the type scale, spacing steps, radii, shadows, breakpoints, layout constants, control heights, and focus geometry.

A one-off dimension that belongs to a single component's internals may stay local to that component, documented in its spec, when both hold:

1. it is used in exactly one component, and
2. it does not encode a system-level decision.

Examples of legitimate local values: the 2px arrow shift on tool-card hover, the search palette's 15vh top offset, the textarea min-height. Examples that must be global tokens: control heights (44px), container widths (1200 / 720 / 640px), section rhythm (96px), grid gutters, and focus ring geometry (2px ring + 2px offset).

### Working rules

- **Single source of truth**: every global token is defined once as a CSS custom property in the tokens layer (`src/styles/tokens.css`), consumed by Tailwind v4 through `@theme`.
- **Semantic-first**: components use semantic roles (`--color-accent`, `--color-text-primary`), never primitive values (`#0f766e`, slate-900).
- **Token naming**: `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--breakpoint-*`, `--layout-*`.
- **One component at a time**: when extending the system, reference the component name directly, define its states from the Interaction States table, and add any new token to this document in the same change.
- **Dark mode** is not specified in v1.0. The semantic role structure is designed so a dark theme can be added later by re-valuing roles, not rewriting components.

---

## Migration from the previous specification (alpha)

The alpha spec is superseded. The Step 1 scaffold implemented the alpha tokens; it must be refactored to this spec in a follow-up change before it is considered compliant.

| Alpha token                                                                                                              | v1.0 replacement                                                      |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `--color-primary` `#0066cc`                                                                                              | `--color-accent` `#0f766e`                                            |
| `--color-primary-focus` `#0071e3`                                                                                        | `--color-focus-ring` `#0d9488`                                        |
| `--color-primary-on-dark` `#2997ff`                                                                                      | Removed — no dark surfaces in v1.0                                    |
| `--color-ink` / `--color-body` `#1d1d1f`                                                                                 | `--color-text-primary` `#0f172a`                                      |
| `--color-ink-muted-80` / `-48`                                                                                           | `--color-text-secondary` / `--color-text-muted`                       |
| `--color-canvas-parchment` `#f5f5f7`                                                                                     | `--color-surface-subtle` `#f8fafc`                                    |
| `--color-surface-tile-1/2/3`, `surface-black`, `surface-pearl`                                                           | Removed — replaced by `surface-subtle` / `surface-muted`              |
| `--color-hairline` / `--color-divider-soft`                                                                              | `--color-border-subtle`; add `--color-border-control` for controls    |
| `--color-chip-translucent*`                                                                                              | Removed                                                               |
| Alpha display/text typography tokens (17px body, px tracking, weights 300/400/600/700)                                   | v1.0 scale: 16px body, em tracking, weights 400/500/600               |
| Radius grammar 0/5/8/11/18/pill                                                                                          | 6/8/12/16/full (buttons become radius-md rectangles)                  |
| `--shadow-product` (single decorative shadow)                                                                            | `--shadow-sm/md/lg` (functional layering)                             |
| Breakpoints 420/641/834/1069/1441                                                                                        | 640/768/1024/1280                                                     |
| `global-nav` (black, 44px) + `sub-nav-frosted`                                                                           | Single white 64px global nav + ⌘K search palette                      |
| `product-tile-*`, `environment-quote-card`                                                                               | Removed — hero + tool grids                                           |
| `store-utility-card`                                                                                                     | Tool card (radius 12, padding 20, whole-card link)                    |
| `button-primary` (pill) / `button-secondary-pill` / `button-dark-utility` / `button-pearl-capsule` / `button-store-hero` | Button set: primary / secondary / ghost / destructive, sizes 36/44/48 |
| `search-input` (pill, 44px)                                                                                              | Search input (radius-lg, 56px hero / 44px inline) + search palette    |
| `configurator-option-chip`                                                                                               | Category chip / segmented control                                     |
| `floating-sticky-bar`                                                                                                    | Sticky action bar (`--shadow-sm`)                                     |
| Footer dense 2.41 leading                                                                                                | Footer: 14px links, overline headings, standard leading               |
