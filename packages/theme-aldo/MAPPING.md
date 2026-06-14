# ALDO → Sentropic mapping

This package maps **ALDO** (aldoshoes.com — the Montréal-HQ footwear & fashion
house) onto the Sentropic token structure (`TenantTheme`). ALDO runs on a Shopify
storefront and publishes **no** design-token file, so every value here is
**measured from the live site's computed CSS** (inspected in a real browser).
Only font *names* are referenced ("Helvetica Neue", Arial), never font binaries.

ALDO's identity is a fashion **black-on-white** system — square corners, thin
hairline borders, a black "Add to Bag" CTA — lit by a single **signature bright
yellow** (`#ffef71`, the dominant brand accent, measured 26×). The yellow is the
highlight: it carries the foundation accent, the `action.secondary` chip surface,
a `data.*` category, and reads as the selection/highlight accent.

## Sources
- ALDO storefront (measured) — https://www.aldoshoes.com (computed CSS via in-browser inspection)
- ALDO Canada home — https://www.aldoshoes.com/ca/en/
- Note: as a Shopify theme, third-party widgets (consent, reviews) inject their
  own CSS custom properties. Those are **NOT** ALDO brand tokens and were
  deliberately excluded from this mapping.

## Colour mapping

| Sentropic role | ALDO source (measured) | Value |
|---|---|---|
| `action.primary` / `surface.inverse` / `text.link` / `border.interactive` / `focus.color` | black CTA fill / ink | `#000000` |
| `action.primaryHover` | measured primary hover | `#111111` |
| `text.primary` / `tabs.activeText` / `breadcrumb.currentText` | measured body ink | `#111111` |
| `surface.default` / `surface.raised` / `action.primaryText` | page background | `#ffffff` |
| **`action.secondary` / `cyan.50` accent / `tag.neutralBackground` / `data.category1`** | **signature brand yellow (26×)** | **`#ffef71`** |
| `text.secondary` / `border.strong` / `breadcrumb.separator` | secondary text / strong border | `#5c5f62` |
| `border.subtle` / field border | subtle / field border | `#e2e2e2` |
| `surface.subtle` / faint hover | faint alt surface | `#f7f7f7` |
| `text.muted` | muted text | `#8a8d90` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.5)` |

### "À confirmer" (derived / no isolated ALDO source)
- **`action.secondaryHover` / `cyan.70` `#ffe94d`** — one step deeper on the
  signature yellow for the hover affordance; not separately measured.
- **`cyan.10` `#fffbcf`** — a pale wash of the signature yellow for the lightest
  accent tint; derived.
- **`text.muted` `#8a8d90`, `surface.subtle` `#f7f7f7`, `border.subtle` `#e2e2e2`**
  — measured approximately; flagged à confirmer pending a second read.
- **All feedback / status hues** — ALDO shows no measured success/warning/error/
  info colour. `feedback.success #2e7d32`, `feedback.warning #b26a00` (dark amber,
  AA on white), `feedback.error #c0202e`, `feedback.info #1169da` are restrained
  AA-safe defaults, **entirely à confirmer**.
- **`action.danger` `#c0202e`** — derived restrained red, no measured equivalent.
- **The Sentropic `blue` role family** — ALDO has no decorative brand blue; mapped
  onto the monochrome black/grey scale. The `cyan` accent slot carries the yellow.
- **Radii** — ALDO is mostly square (fashion convention); `none/sm = 0`, with a
  hair of softening (`md 2px`, `lg 4px`) and `pill 999px` for the yellow chip.
  Exact per-control radii à confirmer.
- **The 8-colour categorical `data.*` palette** — ALDO publishes no data-vis
  scale; this is a proposal starting with the signature yellow, then black + greys
  + complementary system hues.
- **`shadow.*`, `motion.*`, `spacing.*`** — not strongly tokenised on the site;
  aligned with the Sentropic base.

## Typography
- **Body / UI / fields** (`font.sans`, `typography.field/control/label`):
  **`'Helvetica Neue', Arial, sans-serif`** — the safe neo-grotesque stack. The
  exact licensed Shopify webfont could not be isolated; names only, à confirmer.
- **Display** (`font.display`): same Helvetica-family grotesque stack.
- **Monospace** (`font.mono`): not part of ALDO; a `ui-monospace` system stack kept.
- Control labels (the bag/checkout CTAs) are **UPPERCASE**; body/field text is
  sentence case. Links are plain black at rest; the underline appears on hover.

## Signatures anatomiques
- **Signature accent**: a single **bright yellow `#ffef71`** is the brand
  highlight — `action.secondary` chip surface, `cyan` accent family, `tag`
  neutral chip, and the leading `data` category. This is the colour that
  distinguishes ALDO from a pure monochrome fashion clone.
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, thin hairline
  border `#e2e2e2`, square). Native `<select>` chevron redrawn in pure black.
- **Radius**: mostly square (`none/sm = 0`), with a hair of softening on buttons
  (`md 2px`) and cards (`lg 4px`); the yellow chip reads as a pill (`999px`).
- **Borders**: thin **hairlines** — subtle/field `#e2e2e2`, strong `#5c5f62`,
  black accents `#000000`.
- **Focus**: crisp **black outline** (`focus.strategy: "outline"`, 2px, black) —
  fashion convention. ALDO focuses in black; the yellow reads as the highlight.
- **Buttons**: primary = **solid black fill, white uppercase text** (the "Add to
  Bag" CTA); secondary = the **signature yellow chip** (yellow fill, dark ink).
- **Tabs / sub-nav**: active = bold ink label with a **black bottom underline**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = **filled black square**,
  white text.
- **Density**: grotesque type (13px controls), ~44px touch CTAs, whitespace-heavy
  layout, light elevation (hairlines over shadow).

## Asset officiel
- The ALDO wordmark (the all-caps "ALDO" logotype) is served from the site header.
  **Do not redraw** — reuse the official ALDO wordmark asset if a logo is needed.
