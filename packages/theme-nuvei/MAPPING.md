# Nuvei → Sentropic mapping

This package maps **Nuvei** (nuvei.com — the Montréal-headquartered fintech /
payments company) onto the Sentropic token structure (`TenantTheme`). Every
value here is **measured from nuvei.com's public CSS** (computed styles on the
live marketing site: buttons, links, headings, surfaces, inputs and selects).
Only the font *name* is referenced (`"Inter Tight"` — the site's display + body
sans), never font binaries. Anything derived rather than directly measured is
flagged "à confirmer" below and inline in `src/index.ts`.

Nuvei's identity is a **modern payments / fintech** system: a **deep indigo
`#160850`** (the dominant brand colour — measured 159× across the site) drives
every primary action, the brand ink and the inverse surface; a bright **cyan
`#0C98D4`** is the interactive / link accent; a hot **magenta `#E40046`** is the
brand's danger / alert hue. Surfaces are **white** on a faint **cream** page
(`#FAF9F8`); corners are **modern-fintech rounded** (4 / 8 / 12px); form fields
are **boxed outlines** (white fill, 1px `#CFC9C2` stroke, redrawn select
chevron); focus is a **2px cyan ring `#0C98D4`** — deliberately a different hue
from the indigo brand so the indicator never blends into an indigo control.

## Sources
- Nuvei storefront (measured) — https://nuvei.com/
  (computed CSS via in-browser inspection: brand colour dominance count, button /
  link / heading / surface / input computed styles, font stack).
- Deep indigo `#160850` confirmed as the dominant brand colour (measured 159×).

## Colour mapping

| Sentropic role | Nuvei source (measured) | Value |
|---|---|---|
| `action.primary` / `text.primary` / `surface.inverse` / `border.interactive` / brand | deep indigo, dominant brand colour (159×) | `#160850` |
| `action.primaryHover` | deeper indigo hover step | `#2a1a6e` |
| `text.link` / `pagination.text` / `breadcrumb.linkText` / `focus.color` / `feedback.info` | cyan link / interactive accent | `#0C98D4` |
| `action.danger` / `feedback.error` | brand magenta | `#E40046` |
| `text.secondary` / `text.muted`-fallback / `border.strong` | secondary text | `#6B778C` |
| `text.muted` | muted text | `#8c95a6` |
| `surface.default` / `surface.raised` / `action.primaryText` | white | `#ffffff` |
| `surface.subtle` / `action.secondary` / card hover | faint cream page | `#FAF9F8` |
| `action.secondaryHover` | secondary button hover | `#efe9e6` |
| `border.subtle` (field / select stroke, 1px) | measured field stroke | `#CFC9C2` |
| `feedback.success` | AA-safe green | `#2e7d32` |
| `feedback.warning` | AA-safe amber | `#b26a00` |
| `surface.overlay` | indigo-tinted backdrop (≈60%) | `rgb(22 8 80 / 0.6)` |

## "À confirmer" (derived / no single published source)
- **`text.muted` `#8c95a6`** — derived lighter step of the secondary `#6B778C`;
  the exact muted-text token was not isolated. (`text.secondary` `#6B778C` is
  measured.)
- **`feedback.success` `#2e7d32` / `feedback.warning` `#b26a00`** — chosen as
  AA-safe green / amber; Nuvei does not publish distinct success / warning hues
  on the marketing site. `feedback.error` / `feedback.info` reuse the measured
  brand magenta / cyan.
- **`feedback.info` `#0C98D4`** — the brand cyan reused as info; AA-safety on
  white as a text colour is borderline (used as an accent / border, not body
  text), flagged here.
- **`action.secondary` `#FAF9F8` / `secondaryHover` `#efe9e6`** — the cream
  secondary surface + hover are derived from the marketing CTA pairing; Nuvei's
  precise secondary-button tokens were not isolated.
- **Radius ramp `4 / 8 / 12px`** — derived from the modern-fintech look;
  the exact `--radius-*` tokens were not isolated. `none 0` / `pill 999px` standard.
- **The 8-colour categorical `data.*` palette** — assembled from the brand hues
  (indigo `#160850`, cyan `#0C98D4`, magenta `#E40046`, deeper indigo `#2a1a6e`)
  plus neutral greys (`#6B778C`, `#8c95a6`) and two deepened steps (`#0a6a96`,
  `#a3002f`) for contrast. Not a single published categorical token list.
- **`shadow.*`** — soft indigo-tinted elevation, derived (exact shadow tokens not
  published).
- **`motion.*`, `spacing.*`** — standard short transitions and a 4px-based ramp,
  kept aligned with the Sentropic base (exact durations not separately tokenised).
- **Link rest decoration** — measured as `none` on the marketing site; underline
  applied on hover (`typography.link.textDecorationHover: "underline"`).

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.*`): **`"Inter Tight"`** — the site's display + body sans
  (measured), with a `system-ui, sans-serif` fallback chain. Base type **16px**.
- **Control labels** are **semibold (600)** (measured); body and field text is
  **regular (400)**; labels medium (500).
- **Links** are the **cyan accent `#0C98D4`**; underline on hover.
- **Monospace** (`font.mono`): not part of Nuvei; a `ui-monospace` system stack
  is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#CFC9C2`, **4px radius**), not a filled-underline. Native `<select>`
  chevron redrawn in the deep-indigo ink `#160850` with a ~36px gutter
  (`appearance: none`, `padding-right: 2.25rem`).
- **Radius**: modern-fintech rounding `0 / 4 / 8 / 12 / 999`. Controls use **4px**
  (`sm`); larger surfaces 8px (`md`); cards 12px (`lg`).
- **Borders**: body dividers + field strokes **1px solid** `#CFC9C2`; brand
  accents `#160850` / `#0C98D4`.
- **Focus**: a **cyan ring** (`focus.strategy: "ring"`, **2px**, offset 2px,
  `#0C98D4`) — deliberately cyan, **not the indigo brand**, so the ring stays
  visible on indigo controls.
- **Buttons**: primary = **solid deep-indigo fill, white semibold (600) text**
  (hover `#2a1a6e`); secondary = **soft cream fill** (`#FAF9F8`), indigo text,
  `#CFC9C2` stroke, `#efe9e6` hover.
- **Tabs / sub-nav**: active = bold **indigo** label with an **indigo bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless cyan links; active page = **filled indigo square**,
  white text.
- **Tags / badges**: **pill** (`radius: 999px`) — cream-fill tags with indigo
  ink; indigo-filled badges with white text.
- **Density**: 16px base type, semibold 600 control labels, comfortable
  whitespace, soft indigo-tinted elevation.

## Asset officiel
- Nuvei wordmark / logo, served as an official SVG from the site header
  (nuvei.com). **Do not redraw** — reuse the official Nuvei logo asset if a logo
  is needed.
