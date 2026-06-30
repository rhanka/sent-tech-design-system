# Databricks → Sentropic mapping

This package maps the **public** Databricks brand system (the "Lava / Navy / Oat"
primary palette published in the Databricks brand & extended brand guidelines)
and the DM Sans brand typeface onto the Sentropic token structure
(`TenantTheme`). Only public brand colours and font *names* are referenced — no
font binaries. Databricks does not publish a full public token set (intermediate
greys, navy mid-tones, system/feedback colours, a data-vis scale), so those are
derived from the measured anchors and flagged under "À confirmer".

## Sources
- Databricks brand overview — https://brand.databricks.com/ and the Extended
  Brand Guidelines — https://brandguides.brandfolder.com/databricks-extended-brand-guidelines/colors
  (primary palette: **Lava 600, Navy 800, Oat Medium, Oat Light, White**).
- Lava 600 `#FF3621` confirmed across the brand portal, BrandColorCode
  (https://www.brandcolorcode.com/databricks) and the logo/brand write-up
  (https://www.designyourway.net/blog/databricks-logo/).
- Navy 800 `#1B3139`, Oat Medium `#DBD7CE`, Oat Light `#F4F0E7`, White `#FFFFFF`
  — Databricks extended brand guidelines / designyourway brand colour list.
- Typography — Databricks brand typography
  (https://brand.databricks.com/typography) ships **DM Sans** as the brand
  typeface; DM Mono is its companion monospace
  (https://fontsource.org/fonts/dm-sans).

## Colour mapping

| Sentropic role | Databricks token | Value | Provenance |
|---|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `blue.60` | Lava 600 | `#ff3621` | measured |
| `text.primary` / `surface.inverse` / `slate.90` | Navy 800 | `#1b3139` | measured |
| `surface.subtle` / `action.secondary` / `slate.10` | Oat Light | `#f4f0e7` | measured |
| `border.subtle` / `action.secondaryHover` / `slate.20` | Oat Medium | `#dbd7ce` | measured |
| `surface.default` / `surface.raised` / `slate.0` | White | `#ffffff` | measured |
| `action.primaryHover` / `blue.80` | darker Lava | `#e62d18` | derived (à confirmer) |
| `blue.10` light Lava fill | Lava tint | `#ffe7e2` | derived (à confirmer) |
| `action.danger` / `feedback.error` | deep red | `#c42b1c` | derived (à confirmer) |
| `text.secondary` / `slate.60` | navy-grey | `#5b6b71` | derived (à confirmer) |
| `slate.80` strong text | navy mid | `#2e4148` | derived (à confirmer) |
| `text.muted` | muted grey | `#8a9499` | derived (à confirmer) |
| `border.strong` | warm grey | `#b9b3a6` | derived (à confirmer) |
| accent (Sentropic `cyan`) | Databricks teal | `#1b7f93` | derived (à confirmer) |
| `feedback.success` | green | `#2f8a4e` | derived (à confirmer, AA on white) |
| `feedback.warning` | amber | `#b4540a` | derived (à confirmer, AA on white) |
| `feedback.info` | teal | `#1b7f93` | derived (à confirmer) |

### "À confirmer" (no direct Databricks public token)
- **Font stack fallbacks** beyond `'DM Sans'` / `'DM Mono'` (system-ui, etc.) —
  DM Sans is the measured brand typeface; the exact production CSS font stack and
  fallback order were not measured. The logo *wordmark* is a custom display
  letterform (historically described as "Montreal Serial"), not a running-text
  UI font — DM Sans is used for UI/body.
- **`blue.80` `#e62d18` / `action.primaryHover`** — darker Lava for hover; no
  published "Lava 700".
- **`blue.10` `#ffe7e2`** — light Lava fill tint.
- **`action.danger` / `feedback.error` `#c42b1c`** — a deeper red kept distinct
  from the orange-leaning Lava primary so destructive ≠ brand; no published token.
- **`slate.60` `#5b6b71`, `slate.80` `#2e4148`, `text.muted` `#8a9499`,
  `border.strong` `#b9b3a6`** — intermediate navy/warm greys derived between the
  measured Navy 800 and Oat anchors; Databricks publishes no public neutral scale.
- **`cyan.*` teal family (`#1b7f93` / `#e3f1f4` / `#11586a`)** — Databricks has no
  public cyan; a teal accent fills the Sentropic accent slot.
- **`feedback.*` (success/warning/error/info)** and **`status.*`** — no published
  Databricks system colours; derived for WCAG AA on white.
- **The 8-colour `data.*` palette** — a coherent proposal from the Lava / Navy /
  Oat brand + teal accent, not an official Databricks sequential data-vis scale.
- **`radius.*`** (sm 2px / md 4px / lg 8px), **`density.*`**, **`focus.*`**,
  **`shadow.*`**, **`motion.*`**, and the component overrides (tabs, pagination,
  breadcrumb, alert, accordion, tag, badge, choice, search, toggle) — approximate
  the crisp Databricks product look; exact specs not re-measured.

## Typography
- **Display / headings / buttons / body / fields** (`font.display`, `font.sans`,
  `typography.control`, `typography.label`, `typography.field`): `'DM Sans'`,
  system-ui fallback. Databricks uses DM Sans across the brand (medium 500 for
  interactive/labels, regular 400 for body/fields).
- **Monospace** (`font.mono`): `'DM Mono', monospace`.
- Links read as **Lava** red-orange text; underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, lightly rounded inputs (white
  fill, 1px `#dbd7ce` warm border, small radius). Not a filled-underline.
- **Radius**: crisp Databricks rounding — controls/inputs `md = 4px`, cards
  `lg = 8px`, `sm = 2px`, chips read as small 4px corners (à confirmer).
- **Focus**: `focus.strategy = "outline"` — a 2px Navy `#1b3139` outline (offset
  2px), kept distinct from the Lava brand red so focus never reads as an error
  (à confirmer).
- **Buttons**: primary = solid Lava `#ff3621` with white text; secondary = a
  Navy-outlined button (transparent fill, navy stroke + text, warm Oat-light
  `#f4f0e7` state-layer fill on hover).
- **Tabs**: active tab = Lava `#ff3621` medium label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless Navy links; active page = filled Navy `#1b3139`.
- **Chevron (native `<select>`)**: redrawn as a Navy `#1b3139` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: enterprise touch targets (md ≈ 40px control height); button label
  15px (`0.9375rem`) DM Sans medium.
- **Warm-neutral ground**: the Oat family (`#f4f0e7` / `#dbd7ce`) carries the
  warm cream backgrounds and borders that distinguish Databricks from cooler
  grey systems; Lava provides the bright pops on top.

## Asset officiel
- The Databricks logo (the stacked red-orange "bricks" mark + wordmark) is an
  official Databricks brand asset — reference it from the Databricks Brand
  Resource Center / press kit
  (https://www.databricks.com/company/newsroom/press-kit), do not redraw. Brand
  chrome should use the official Lava bricks mark, not a hand-drawn approximation.
