# Fireworks AI → Sentropic mapping

This package maps the **public** Fireworks AI brand (the 2024 Monogram redesign,
as shipped on [fireworks.ai](https://fireworks.ai/)) onto the Sentropic token
structure (`TenantTheme`). Every colour is **measured** from the site's Tailwind
v4 OKLCH design-token palette (the `--color-*` and `--background` custom
properties in the production stylesheet), converted to sRGB hex. Only public
brand colours and font *names* are referenced — no font binaries.

Fireworks is a **dark-first** brand ("inherently dark", per Monogram), so this is
a `mode: "dark"` clone: the near-black developer stage with the vivid "Fireworks
Purple" accent. The light end of the neutral ramp is kept for the inverse surface.

## Sources
- Fireworks AI production CSS (Tailwind v4 OKLCH tokens), fetched from
  `https://fireworks.ai/_next/static/css/*.css`:
  - Brand purple ramp `--color-purple-25 … --color-purple-900` (the most-used
    accent, ~96 references; `--color-purple-400 = oklch(52% .28 284.9)`).
  - Neutral ramp `--color-neutrals-25 … --color-neutrals-900` + the dark app
    `--background: oklch(17.8% .0048 274.69)`.
  - Marine/teal secondary `--color-marine-400 … 700`; status ramps
    `--color-red-*`, `--color-success-*`, `--color-warning-*`, `--color-blue-*`.
  - Standard easing `--ease-in-out: cubic-bezier(.4, 0, .2, 1)`.
  - App fonts (next/font `@font-face`, 6 preloaded woff2): **Aspekta** (weights
    400/550/700/900 — primary UI typeface), **Favorit** (550 — display accent),
    **Inter** (variable fallback).
- Brand story / "Fireworks Purple" (sourced from Akihabara Electric Town, Tokyo)
  and the dark, developer-oriented identity —
  https://monogram.io/portfolio/fireworks-ai (Monogram x Fireworks AI redesign).

OKLCH → sRGB hex conversions done locally (D65, gamma-corrected sRGB).

## Colour mapping

| Sentropic role | Fireworks token | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / badge | `--color-purple-400` (Fireworks Purple) | `#6726fe` |
| `action.primaryHover` | `--color-purple-300` | `#8349fe` |
| `text.link` / `tabs.activeText` / pagination + breadcrumb links | `--color-purple-200` | `#9d72fe` |
| brand tint (foundation `blue.10`) | `--color-purple-100` | `#b695fd` |
| deep brand purple (foundation `blue.80`) | `--color-purple-600` | `#3c1590` |
| accent (Sentropic `cyan.50`) / `feedback.info` | `--color-marine-500` | `#00e6cc` |
| `cyan.10` / `cyan.70` | `--color-marine-400` / `--color-marine-700` | `#00fce2` / `#1da28f` |
| `surface.default` | `--background` (oklch 17.8%) | `#101113` |
| `surface.subtle` | `--color-neutrals-900` | `#16181d` |
| `surface.raised` / card / `action.secondary` / field fill | `--color-neutrals-800` | `#1a1a1f` |
| `border.subtle` / `action.secondaryHover` | `--color-neutrals-700` | `#28282e` |
| `border.strong` / `buttonSecondary.border` | `--color-neutrals-600` | `#3a3a40` |
| `text.muted` / breadcrumb trail + separator | `--color-neutrals-400` | `#696969` |
| `text.secondary` | `--color-neutrals-200` | `#bababa` |
| `text.primary` / `surface.inverse` / off-white labels | `--color-neutrals-50` | `#f2f2f2` |
| `text.inverse` | `--color-neutrals-900` | `#16181d` |
| `action.primaryText` / pagination active text | white | `#ffffff` |
| `action.danger` / `feedback.error` | `--color-red-500` | `#f14539` |
| `feedback.success` | `--color-success-400` | `#26d581` |
| `feedback.warning` | `--color-warning-400` | `#fcb02a` |
| info blue (data) | `--color-blue-300` | `#1756ff` |
| coral (data) | `--color-red-400` | `#fa7066` |

### "À confirmer" (derived or no direct Fireworks public token)
- `feedback.info` = marine teal `#00e6cc` — Fireworks has no published "info"
  semantic token; the marine secondary accent is mapped to info (and `status.processing`).
- System ramp step choice — the **lighter** `*-400` steps (`success #26d581`,
  `warning #fcb02a`) are chosen for legibility on the near-black stage; the `*-500`
  values are also published. `error` uses `red-500 #f14539`.
- `action.primaryHover` `#8349fe` (`purple-300`) — brightens the brand purple on
  hover for dark-mode visibility; the site's exact hover token was not isolated.
- `radius.*` — mapped from the measured Tailwind `--radius*` scale (sm .25 / md
  .375 / lg .5 / xl .75rem); exact per-component radii approximate.
- `density.*`, `disabledOpacity`, `iconSize`, `shadow.*`, `motion` durations —
  comfortable defaults aligned with the Sentropic base; only the standard easing
  `cubic-bezier(.4,0,.2,1)` is measured.
- `focus` (purple ring, 3px / offset 2px) — technique inferred from the brand
  accent; the exact focus shadow spec was not isolated.
- `font.mono` = **IBM Plex Mono** — the platform's likely code voice (a
  `--font-ibm-plex-mono` token appears in the bundle); no dedicated mono woff2 is
  preloaded by the marketing site.
- The 8-colour categorical `data.*` palette — a coherent proposal from the
  measured brand + accent ramp, not an official sequential scale.
- `data.category8` `#ababab` (`--color-neutrals-300`).

## Typography
- **Body / UI** (`font.sans`, `typography.control/field/label`): `'Aspekta',
  'Inter', system-ui, …` — Aspekta is the Fireworks app's primary typeface
  (loaded in weights 400/550/700/900).
- **Display / headings** (`font.display`): `'Favorit', 'Aspekta', 'Inter', …` —
  Favorit (550) is the brand display accent.
- **Monospace** (`font.mono`): `'IBM Plex Mono', ui-monospace, …` (à confirmer).
- Links are **not** underlined at rest (light-purple text); underline on hover.

## Signatures anatomiques
- **Mode**: dark-first (`mode: "dark"`) — near-black stage `#101113`, off-white
  text `#f2f2f2`, single vivid Fireworks Purple `#6726fe` accent.
- **Fields**: `field.style = "outline"` — boxed inputs with a recessed dark fill
  (`neutrals-800 #1a1a1f`), 1px border, rounded control radius. Not a
  filled-underline.
- **Radius**: moderately rounded — controls/inputs `md = 8px`, cards `lg = 12px`,
  chips/CTAs read as pills (`pill = 999px`); `sm = 6px`.
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in the Fireworks
  Purple `#6726fe` (3px, offset 2px) on the dark stage.
- **Buttons**: primary = solid Fireworks Purple `#6726fe` (white text), hover
  brightens to `#8349fe`; secondary = minimal ghost (transparent fill, neutral
  `#3a3a40` outline + off-white text, subtle `#1a1a1f` fill on hover).
- **Tabs**: active tab = light-purple `#9d72fe` label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless purple links; active page = filled Fireworks Purple
  with white text.
- **Chevron (native `<select>`)**: redrawn as an off-white `#f2f2f2` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: comfortable touch targets (md ≈ 40px control height) with generous
  horizontal padding; control label 15px (`0.9375rem`) medium.
- **Secondary accent**: marine teal `#00e6cc` (`--color-marine-500`) — the cool
  companion to the brand purple, used for info / data-vis.

## Asset officiel
- The Fireworks AI wordmark + logomark (the Monogram redesign) are official
  Fireworks brand assets — reference them from the official brand/press kit, do
  not redraw. Fireworks chrome should use the real Fireworks logo on the dark
  stage, not a hand-drawn approximation.
