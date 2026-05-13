---
name: Academix
description: Editorial, structured operational backbone for academic institutions.
colors:
  ink: "#09090b"
  ink-soft: "#18181b"
  paper: "#ffffff"
  paper-soft: "#fafafa"
  rule: "#e4e4e7"
  rule-strong: "#27272a"
  muted-surface: "#f4f4f5"
  muted-ink: "#71717a"
  ring: "#09090b"
  ring-dark: "#d4d4d8"
  alert: "#ef4444"
  alert-dark: "#a50e0e"
  affirm: "#16a34a"
  affirm-dark: "#15803d"
  data-1: "#2662d9"
  data-2: "#2eb88a"
  data-3: "#e88c30"
  data-4: "#af57db"
  data-5: "#e23670"
typography:
  display:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "1.15"
    letterSpacing: "-0.015em"
  title:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "-0.005em"
  body:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.55"
    letterSpacing: "0"
  body-arabic:
    fontFamily: "var(--font-tajawal), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.7"
    letterSpacing: "0"
  label:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1.4"
    letterSpacing: "0.02em"
rounded:
  sm: "0.165rem"
  md: "0.375rem"
  lg: "0.5rem"
spacing:
  hairline: "1px"
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  xxl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.paper-soft}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.25rem"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-soft}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.25rem"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.25rem"
  card-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
---

# Design System: Academix

## 1. Overview

**Creative North Star: "The Registrar's Ledger"**

Academix is set, not styled. The system treats the screen the way a registrar's office treats a printed form: a clear page, ruled margins, exact labels, no ornament. Density sits at the comfortable end of "office software you keep open all day" — generous enough to scan a roster at a glance, tight enough that nothing wastes a row. Color is reserved as punctuation: a single near-black ink does almost all the work; saturated hues appear only inside charts or as the controlled signal of an alert, never as decoration.

What this system explicitly is not: a SaaS template (no cream surfaces, no gradient buttons, no decorative hero metric blocks), not cartoony EdTech (no mascots, no candy primaries, no rounded-everything), not a developer tool (no terminal-on-black aesthetic, no monospace UI). Auth is treated as a doorway, not a marketing surface. The interface should read as if a typographer, not a brand designer, made the last pass.

**Key Characteristics:**
- Near-monochrome ink palette with a single dark accent doing the work of "primary".
- Type-led hierarchy: scale and weight first, color a distant third.
- Flat by default. Borders and tonal layering carry depth; shadows are rare.
- Generous side margins, varied vertical rhythm, no obligatory cards.
- Bidirectional from the ground up: logical properties, mirrored icons, both fonts loaded.

## 2. Colors: The Ink and Paper Palette

A near-monochrome system tinted toward neutral zinc. The palette is intentionally narrow so that the few non-neutral colors (alert red, affirm green, chart hues) feel like signal, not noise.

### Primary
- **Ink Soft** (`#18181b`): The single working "primary". Used for primary buttons, focus rings, selection backgrounds, body text in light mode. This is the color that does almost everything.
- **Ink** (`#09090b`): The deepest neutral. Heading text, foreground over paper. Reserved for the highest-contrast type.

### Neutral (the field the type sits on)
- **Paper** (`#ffffff`): Page background in light mode. Card and input surfaces.
- **Paper Soft** (`#fafafa`): Inverted text on dark surfaces, primary-foreground.
- **Rule** (`#e4e4e7`): Borders, input strokes, dividers in light mode. The system's quiet skeleton.
- **Rule Strong** (`#27272a`): The same role in dark mode; also secondary/muted surface in dark.
- **Muted Surface** (`#f4f4f5`): Subdued backgrounds: secondary buttons, hover plates, badge fills, sidebar accent.
- **Muted Ink** (`#71717a`): Supporting text, placeholder, captions, helper copy under inputs.

### Signal (use sparingly; never decoratively)
- **Alert** (`#ef4444` / dark `#a50e0e`): Destructive actions, validation errors, removal confirms. Never used for "warning" pseudo-emphasis.
- **Affirm** (`#16a34a` / dark `#15803d`): Success toast, verified state, positive deltas. Never used to "make the form feel friendly".

### Data (charts only)
- **data-1** `#2662d9`, **data-2** `#2eb88a`, **data-3** `#e88c30`, **data-4** `#af57db`, **data-5** `#e23670`. These five exist for `recharts` series only. They are out of bounds for UI chrome, buttons, badges, or backgrounds.

### Named Rules
**The Ink-First Rule.** If a value can be expressed in ink or paper, it must be. Color is the last lever reached, not the first. A label, a border, a heading: none of them get a hue unless the role demands signal.

**The One-Accent Rule.** Academix has no brand accent color in the SaaS sense. The "accent" token is a 50%-transparent mix of the working ink; it exists for subtle plates, not identity. Resist adding a brand hue retroactively.

## 3. Typography

**Display / Body Font (LTR):** Inter (with `ui-sans-serif, system-ui` fallbacks).
**Display / Body Font (RTL):** Tajawal (with same sans fallback).
**Label / Mono Font:** none distinct; small caps role handled by Inter at weight 500 with letter-spacing.

**Character:** A workhorse pairing. Inter is chosen for the same reason newspapers commission a custom sans: it disappears on the page. Tajawal mirrors that calm in Arabic. Neither font is allowed to perform; both are dialed slightly tighter in tracking on display sizes so headings read as set type, not as UI text scaled up.

### Hierarchy

- **Display** (`1.875rem / 30px`, weight 600, line-height 1.1, tracking -0.02em): Auth page title ("Welcome back", "Create your account"). Largest type on any standard surface that is not marketing.
- **Headline** (`1.5rem / 24px`, weight 600, line-height 1.15, tracking -0.015em): Page titles inside the app shell. Dialog titles.
- **Title** (`1rem / 16px`, weight 600, line-height 1.4): Section headers, card titles, field-group headings.
- **Body** (`0.875rem / 14px`, weight 400, line-height 1.55): All running text. Form labels at weight 500. Capped at 65ch for long-form blocks; auth forms are intrinsically narrower and don't need an explicit cap.
- **Body (Arabic)** (`0.875rem / 14px`, line-height 1.7): Same role in RTL with a looser leading because Tajawal needs the breathing room.
- **Label / Eyebrow** (`0.75rem / 12px`, weight 500, tracking 0.02em): Step indicators, helper text, breadcrumbs, supporting metadata. Sentence case unless the dictionary supplies all-caps copy explicitly.

### Named Rules
**The Set-Don't-Style Rule.** Hierarchy is built with scale (≥1.25 ratio between steps) and weight (400 vs 500 vs 600), not with color or background fills. If a heading needs a color to feel important, the layout is wrong.

**The No-Gradient-Text Rule.** Headings are a single solid color. Always.

## 4. Elevation

Flat by default. Academix does not own a shadow scale; the few shadows that exist live inside vendor components (Radix popovers, dropdowns, tooltips) and use a single low elevation. Depth is conveyed by tonal layering — `paper` over `muted-surface`, separated by a hairline `rule` — not by drop shadows.

### Shadow Vocabulary
- **Popover / Dropdown** (`box-shadow: 0 4px 12px -2px rgb(0 0 0 / 0.08)`): The only ambient shadow used. Applied automatically by Radix-based components; do not extend.
- **Focus ring** (`outline: 2px solid var(--ring); outline-offset: 2px`): The system's only "elevation on interaction". Always solid, never glowing.

### Named Rules
**The Flat-By-Default Rule.** No surface gets a shadow at rest. If something needs to feel raised, raise it with a border and a contrasting tonal background, not with a soft drop shadow.

**The No-Glassmorphism Rule.** `backdrop-filter: blur(...)` is banned outside the navigation header's scrolled state and the standard Radix dialog overlay. Decorative glass cards are out.

## 5. Components

### Buttons
- **Shape:** Radius `md` (`calc(0.5rem * 0.75)` ≈ 6px). Never fully rounded except the icon-only square variant.
- **Primary:** `ink-soft` on `paper-soft`. Padding `0 1rem`, height `2.25rem`. Hover: nudges to deeper `ink`. No glow, no scale.
- **Outline:** `paper` background, `rule` border, `ink-soft` text. The default for "secondary" action in a button pair.
- **Ghost:** No fill, no border. Hover plates with `muted-surface`. Used for menu items, table row actions, anywhere the chrome should disappear at rest.
- **Destructive:** Reserved for irreversible actions; `alert` fill, `paper-soft` text.

### Inputs
- **Shape:** Radius `md`, height `2.25rem`, padding inline `0.75rem`.
- Border `rule` at rest, `ring` on focus, `alert` on validation error.
- Label sits above the field at weight 500. Helper / error text sits below at the `label` token. No floating labels.

### Cards
- Used sparingly. A card is appropriate when content is a discrete object the user can act on (a course, an applicant, an invoice). Not appropriate as visual decoration around a section heading.
- Surface `paper`, `rule` border (no shadow), radius `lg`, padding `lg`. Never nested.

### Steps (multi-step forms, e.g. register)
- Connector lines are `rule` at rest, `ink-soft` when the connector precedes the active step.
- Step bubbles are circular, `rule` border, `ink-soft` fill when complete, `paper` with `ink-soft` border when active.
- Labels sit under the bubble at the `label` token weight 500. Always visible (no icon-only step indicators).

### Toasts (sonner)
- Top-end aligned. Width 360px maximum. `paper` surface, `rule` border, no shadow. Destructive variant flips to `alert` background.

### Auth Layout
- Two-column on `md+`: form panel (max width 28rem, centered, generous vertical rhythm) and a side image panel (`basis-1/2`, hidden below `md`).
- Single column on mobile: form panel fills the viewport with `padding-inline: lg`, side image is dropped (do not stack it above the form).
- Brand mark and language / mode controls live in a top utility row that runs full width; they are chrome, not content.

## 6. Do's and Don'ts

### Do
- Treat color as signal, not decoration. Reach for type and space first.
- Use logical properties (`padding-inline`, `margin-block`, `start`/`end`) everywhere. Test every screen in RTL.
- Vary spacing for rhythm: tight groupings (`sm`) for related fields, generous separations (`xl`/`xxl`) between distinct regions.
- Keep auth pages quiet. Title, form, footer link. Nothing else.
- Use the `Steps` component for multi-step registration; show progress, never just "next/back" with no signal.

### Don't
- Don't use a brand accent color. The product doesn't have one.
- Don't introduce gradients anywhere: not in buttons, not in backgrounds, not in text.
- Don't wrap every section in a card. If the spacing alone communicates grouping, that is the grouping.
- Don't nest cards. Ever.
- Don't add decorative illustrations to auth surfaces. The optional `imgSrc` side panel is a single calm photograph or a typographic plate, not a stock illustration.
- Don't use `box-shadow` for "depth" on resting surfaces. Borders and tone do that job.
- Don't write marketing copy inside the product. Labels are exact and short; helper text explains a constraint, not a feature.
- Don't use side-stripe borders (`border-left: 4px solid accent`) on cards or alerts. Use a full border + tonal background instead.
