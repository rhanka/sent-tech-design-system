# Air Transat → Sentropic mapping

This package maps the **Air Transat** brand (airtransat.com — the Montréal-based
leisure airline / travel brand, part of Transat A.T. Inc.) onto the Sentropic
token structure (`TenantTheme`). Air Transat publishes **no public design-token
file**; every value below is **measured** from the live site's computed CSS
(inspected in a real browser), or **derived** and flagged "à confirmer". Only
font *names* are referenced — no font binaries.

## Sources
- Air Transat — https://www.airtransat.com
- Colours, radii, fields, focus and typography — MEASURED from the live computed
  CSS in a real browser (no public token export exists).

## Colour mapping

| Sentropic role | Source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | measured Transat blue (261 occurrences — most frequent brand colour) | `#005eba` |
| `action.primaryHover` / `surface.inverse` | measured deep navy band | `#002855` |
| accent (Sentropic `cyan`) / `data.category2` | measured light-blue accent | `#3fbbef` |
| darkest navy (`slate.90`) | measured terminal navy | `#0f254a` |
| `text.primary` | measured near-black body text | `#1a1a1a` |
| `text.secondary` | measured `rgb(105,105,105)` | `#696969` |
| `text.muted` | measured neutral grey | `#8a8f96` |
| `surface.subtle` / `action.secondary` | measured pale blue-grey fill | `#f2f6fb` |
| `border.subtle` / field hairline | measured `rgb(194,194,194)` | `#c2c2c2` |
| `surface.default` / `surface.raised` | white page background | `#ffffff` |
| `action.danger` / `feedback.error` | measured system red | `#d72020` |

### "À confirmer" (no measured Air Transat equivalent)
- `feedback.success` `#2e7d32`, `feedback.warning` `#b26a00` — restrained,
  WCAG-AA-on-white system hues; no Air Transat source. `feedback.info` /
  `status.processing` = the Transat blue `#005eba`, not a generic blue.
- The 8-colour categorical `data.*` palette — a coherent proposal from the
  measured brand blues (Transat blue → light-blue accent → deep navy) plus
  neutral greys and the restrained system hues; not an official scale.
- `shadow.*`, `motion.*`, and exact `spacing.*` steps — not strongly tokenised
  publicly; kept aligned with the Sentropic base (shadows are navy-tinted).

## Typography
- Air Transat's site font is **'Jokker'**, a proprietary geometric sans that is
  **not publicly distributable**. We **substitute Inter** (a close, open
  geometric humanist sans) and reference *names* only — **à confirmer** (Jokker
  proprietary, Inter is the substitute).
- **Headings / interactive / body / fields** (`font.sans`, `font.display`,
  `typography.control/field/label`): `'Inter', Helvetica, Arial, sans-serif`.
- **Monospace** (`font.mono`): the Sentropic mono stack is kept (Air Transat has
  no mono).
- Links are Transat blue at rest; underline appears on hover.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px `#c2c2c2`
  hairline, soft 6px radius); native `<select>` chevron redrawn in Transat blue.
- **Radius**: modern — `none 0`, `sm 2px`, `md 6px` (controls/inputs), `lg 10px`
  (cards); pills/chips stay `999px`.
- **Focus**: `strategy = "outline"` — a crisp 2px Transat-blue outline `#005eba`.
- **Buttons**: primary = solid Transat blue, navy `#002855` on hover; secondary =
  soft pale-blue-grey filled chip (`#f2f6fb` fill, navy text).
- **Tabs / sub-nav**: active tab = Transat-blue label with a bottom Transat-blue
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = filled Transat blue with
  white text.
- **Breadcrumb**: ink links, grey trail, Transat-blue current page.
- **Density**: touch-friendly controls (md ≈ 44px height) with generous
  horizontal padding.

## Official asset
- Air Transat wordmark / starfish logo — official brand asset; referenced by name
  only, never bundled.
