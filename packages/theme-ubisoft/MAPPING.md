# Ubisoft (UDS) → Sentropic mapping

This package maps **Ubisoft** (ubisoft.com — the global game publisher, whose
largest studio is Ubisoft Montréal) onto the Sentropic token structure
(`TenantTheme`). Ubisoft ships a real, in-page design system — **UDS (Ubisoft
Design System)** — whose CSS custom properties (`--color-semantic-*`,
`--color-brand-*`, `--color-surface-*`, `--color-text-*`, `--color-neutral-*`,
`--color-palette-*`, `--radius-*`, `--border-*`, `--size-*`) are **measured from
the live site's stylesheets** (the Next.js `_next/static/css/*` bundles, fetched
directly). Only font *names* are referenced ("Ubisoft Sans", "Open Sans"), never
font binaries.

Ubisoft's UDS default theme is **dark-first and stark**: a near-pure-black stage
(`--color-surface-0: #0d0d0d`), **white text applied at decreasing opacities**
over that black, white-with-alpha neutral surfaces/borders, and a single
interactive accent — the unmistakable **Ubisoft blue** (`#006ef5`, lighter
variant `#3da2ff` for hovers / field borders / the focus ring). Corners are
**subtle** (controls land on `--radius-2: 8px`). This is therefore a **dark**
theme (`mode: "dark"`).

> **Note on alpha → flat hex.** UDS text and neutral colours are `hsla(0,0%,100%,α)`
> (white at opacity) over the `#0d0d0d` stage. The Sentropic token tree is
> hex-based, so each is **pre-blended to its flat hex equivalent over #0d0d0d**
> (e.g. heading `white @ .975` → `#f9f9f9`). The source opacity is documented in
> each row below.

## Sources
- Ubisoft home (measured) — https://www.ubisoft.com/en-us
- UDS stylesheet bundles (fetched directly):
  - https://static-dm.ubisoft.com/1wd-ubisoft-com/prod/_next/static/css/1c64b1fcb7d2e553.css
  - https://static-dm.ubisoft.com/1wd-ubisoft-com/prod/_next/static/css/7df7b3b291fc0ad5.css
  - https://static-dm.ubisoft.com/1wd-ubisoft-com/prod/_next/static/css/b63707dbd9cb9f47.css (+ 47b…, 4918…, 850c…)
- Token namespace: `.uds`, `.uds.dark.theme-default` (the published default is the dark theme).

## Colour mapping

| Sentropic role | Ubisoft / UDS source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `feedback.info` / `status.processing` / pagination active | `--color-brand-primary-main` / `--color-semantic-interactive-main` | `#006ef5` |
| `action.primaryHover` / `border.interactive` / `focus.color` / field active border | `--color-brand-primary-variant` / `--color-semantic-interactive-variant` | `#3da2ff` |
| (link hover) | `--color-link-hover` | `#5ab0ff` |
| (link active) / `blue.80` | `--color-link-active` | `#77beff` |
| `surface.default` / `surface.overlay` base | `--color-surface-0` / `--color-overlay-rgb 13,13,13` | `#0d0d0d` |
| `surface.subtle` / `field.fillBg` | `--color-surface-1` / `--color-neutral-main-1` (white @ .075) | `#1f1f1f` |
| `surface.raised` / `border.subtle` / secondary surface | `--color-surface-2` / `--color-neutral-main-2` (white @ .15) | `#313131` |
| `border.strong` | `--color-neutral-main-4` (white @ .3) | `#565656` |
| `text.primary` / tabs active / breadcrumb current / `action.secondaryText` | `--color-text-heading` (white @ .975) | `#f9f9f9` |
| `text.secondary` / pagination text / `toggle.textColor` | `--color-text-body` (white @ .825) | `#d5d5d5` |
| `text.muted` / breadcrumb separator | `--color-text-caption` (white @ .6) | `#9e9e9e` |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | `--color-neutral-main-full` | `#ffffff` |
| `text.inverse` | `--color-neutral-variant-full` (text on the blue CTA / light) | `#000000` |
| `feedback.success` / `status.completed` | `--color-semantic-positive-main` | `#2d8656` |
| `feedback.warning` / `status.pending` | `--color-semantic-warning-main` | `#bd5b05` |
| `action.danger` / `feedback.error` / `status.failed` | `--color-semantic-negative-main` | `#cc2828` |
| (error field box-shadow) | `--color-semantic-negative-variant` | `#f17474` |
| `data.category1..8` | `--color-palette-{blue,indigo,violet,pink,orange,green,turquoise,yellow}-main` | `#1f7ead`, `#3043e8`, `#6f43ef`, `#d317aa`, `#dc3318`, `#18862a`, `#218371`, `#9a6f19` |

### "À confirmer" (derived or no distinct UDS source)
- **Alpha → flat-hex blends** — all text (`#f9f9f9`, `#d5d5d5`, `#9e9e9e`) and
  neutral (`#1f1f1f`, `#313131`, `#434343`, `#565656`, `#686868`) values are the
  source `hsla(0,0%,100%,α)` **pre-blended over #0d0d0d**. Faithful on the dark
  stage; exact rendering differs if the surface beneath isn't #0d0d0d.
- **`feedback.info` `#006ef5`** — UDS exposes no distinct "info" hue; the
  interactive brand blue is reused (à confirmer).
- **The Sentropic `cyan` family** — UDS has no separate cyan accent; mapped to the
  blue variant + `--color-palette-turquoise-main #218371` (à confirmer).
- **`disabledOpacity` `0.4`** — UDS dims disabled controls but the exact opacity
  was not isolated; sensible default (à confirmer).
- **`shadow.*`, `motion.*`, `spacing.*`** — `--color-shadow-*` (.075/.15/.225 +
  over-content .6) and `--border-*` (0–10px) were measured; durations are aligned
  to the base (control transitions ≈ .2s ease measured).
- **`density.*` heights** — derived from `--size-9/10/11` (36/40/48px); md targets
  ~44–48px (à confirmer exact per-size mapping).
- **High-contrast focus** — UDS also exposes a `2px solid #fd0` accessibility focus
  mode; this theme encodes the **default brand** blue-variant outline.

## Typography
- **Headings / brand titles / controls** (`font.display`, `typography.control`):
  **`Ubisoft Sans`** — Ubisoft's proprietary face (measured `font-family: Ubisoft
  Sans,Roboto,sans-serif`), Roboto fallback. Name referenced only.
- **Body / UI / fields** (`font.sans`, `typography.field`, `typography.label`):
  **`Open Sans`** — the dominant body webfont (measured `font-family: Open Sans,
  Open Sans Alt,sans-serif`, 106 declarations). Name referenced only.
- **Monospace** (`font.mono`): not part of UDS; the Sentropic mono stack kept.
- Base type is **16px** (`--font-size-body-medium`); small 14px, xsmall 12px;
  headings 18–56px (`--font-size-heading-h3…display`). UDS controls are **not**
  uppercase (sentence case).
- Links are the **brand blue** at rest (not underlined), brightening to
  `#5ab0ff` on hover.

## Signatures anatomiques
- **Mode**: **dark-first** (`mode: "dark"`) — the UDS default renders on the
  `#0d0d0d` stage with white-over-black text.
- **Fields**: `field.style = "outline"` — a **boxed** field with `border-radius:
  var(--radius-2)` (**8px**) on the dark stage, `fillBg #1f1f1f`; the border turns
  to the blue variant `#3da2ff` (2px) when active, and an error shows `box-shadow:
  0 0 0 2px #f17474`. Native `<select>` chevron redrawn in the blue variant.
- **Radius**: **subtle** — measured `--radius-*` ramp `0 / 4 / 8 / 16 / 24 / 32 /
  40 / 48 / 56 / 64px` + `--radius-full: 10000px`. Controls/inputs/tabs = **8px**
  (`--radius-2`); cards = 16px (`--radius-3`); pills/circular = `--radius-full`.
- **Borders**: the UDS control/focus/secondary-button border is **2px**
  (`--border-2`); dividers are 1px (`--border-1`).
- **Focus**: **blue outline** (`focus.strategy: "outline"`, 2px, `#3da2ff`) —
  measured `outline: var(--border-2) solid var(--color-brand-primary-variant)`.
  The indicator is the lighter blue variant so it reads on the dark stage and on a
  filled blue control. (A high-contrast `2px solid #fd0` mode also exists.)
- **Buttons**: primary = **solid Ubisoft-blue fill, white text, 8px radius**
  (measured `.uds-button.uds-primary { background: #006ef5; color: #fff }`);
  secondary = **outlined** (transparent fill, **2px white** border + white text,
  `--color-neutral-main-2` fill on the "quiet" hover).
- **Tabs / sub-nav**: active = near-white heading-ink label with a **bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless body-ink links; active page = **filled blue**, white
  text.
- **Data-vis**: a **real, official** 11-hue UDS palette (`--color-palette-*`); the
  first 8 main steps map directly to `data.category1..8`.
- **Density**: tall controls (36/40/48px from `--size-9/10/11`), 16px base type,
  dark soft elevation (`--color-shadow-*`).

## Asset officiel
- The **Ubisoft swirl** logo (the white-on-transparent spiral wordmark) is served
  from the site's global navigation as an inline SVG —
  `https://static-dm.ubisoft.com/global-navigation-prod/prod/1/global-navigation.js`
  injects the official header logo. **Do not redraw** — reuse the official Ubisoft
  swirl asset if a logo is needed.
