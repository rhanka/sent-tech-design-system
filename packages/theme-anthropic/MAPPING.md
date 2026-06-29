# Anthropic / Claude → Sentropic mapping

This package maps the **public** Anthropic brand and the visible
[claude.ai](https://claude.ai/) / [anthropic.com](https://www.anthropic.com/)
surfaces onto the Sentropic token structure (`TenantTheme`). Only public brand
colours, the warm neutral scale measured on the product, and font *names* are
referenced — no font binaries (Styrene, Copernicus and Tiempos are licensed
typefaces; we reference their names only).

## Sources
- **Anthropic brand guidelines** — the open `anthropics/skills`
  brand-guidelines skill (https://github.com/anthropics/skills/blob/main/skills/brand-guidelines/SKILL.md):
  Dark `#141413`, Light `#faf9f5`, Mid Gray `#b0aea5`, Light Gray `#e8e6dc`;
  accents Orange `#d97757`, Blue `#6a9bcc`, Green `#788c5d`.
- **claude.ai product surfaces** (measured / community design references —
  https://mobbin.com/colors/brand/claude and Claude design write-ups): Ivory
  canvas `#faf9f5`, Border Cream `#f0eee6`, darker terracotta `#c96442`, and the
  warm yellow-brown grey text scale `#4d4c48` / `#5e5d59` / `#87867f` (no cool
  blue-greys anywhere).
- **Typography** — Styrene (Berton Hasebe / Commercial Type) for the sans UI &
  headlines; the bespoke serif "Copernicus" (claude.ai logo/display) and "Tiempos"
  (Klim Type Foundry, marketing body) for the editorial serif. Refs:
  https://type.today/en/journal/anthropic and the claude.ai computed font stacks
  (`__copernicus_*`).

## Colour mapping

| Sentropic role | Anthropic token | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `tabs.activeText` / `focus.color` | Clay (accent Orange) | `#d97757` |
| `action.primaryHover` | Terracotta (darker clay) | `#c96442` |
| `blue.10` / light clay fill | light clay tint (derived) | `#f5e0d5` |
| accent (Sentropic `cyan`) | accent Blue | `#6a9bcc` |
| `surface.default` (warm canvas) | Light / Ivory | `#faf9f5` |
| `surface.subtle` / `action.secondary` / cream surfaces | Border Cream | `#f0eee6` |
| `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `border.subtle` / `action.secondaryHover` | Light Gray | `#e8e6dc` |
| `border.strong` / `text` placeholder | Mid Gray | `#b0aea5` |
| `text.muted` | warm tertiary grey | `#87867f` |
| `text.secondary` / breadcrumb trail | warm secondary grey | `#5e5d59` |
| strong text | warm strong grey | `#4d4c48` |
| `text.primary` / `text.link` / `surface.inverse` / ink badge | Dark / Ink | `#141413` |
| `action.danger` / `feedback.error` | warm brick red (derived) | `#b23c2c` |
| `feedback.success` | brand green darkened for AA (derived) | `#5f7355` |
| `feedback.warning` | warm amber darkened for AA (derived) | `#9a630d` |
| `feedback.info` | accent blue darkened for AA (derived) | `#4a749b` |

### "À confirmer" (no direct Anthropic public token, or derived)
- `clay.10` `#f5e0d5` — a light clay tint derived around the clay `#d97757`
  (no published light-clay token).
- `clay.bookCloth` `#cc785c` — the historical "Book cloth" clay of the brand
  block; kept as a `data.category7` companion, not re-measured against the
  current product accent.
- `blue.10` `#e6eef6` and `blue.dark` `#4a749b` — derived tints/shades around the
  accent Blue `#6a9bcc` (the darker shade is also `feedback.info`, picked for
  WCAG AA on white since `#6a9bcc` itself is ~2.7:1).
- `feedback.success` `#5f7355`, `feedback.warning` `#9a630d`, `feedback.error` /
  `action.danger` `#b23c2c` — Anthropic publishes no formal status scale; these
  are warm-palette values picked for WCAG AA on white (success darkened from the
  brand green; warning a warm amber; error a warm brick red).
- `action.primaryText` `#ffffff` on clay `#d97757` is ~2.9:1 — this matches the
  real product's white-on-clay CTA but is below WCAG AA; noted as the product's
  own choice. (Ink text on clay would pass AA but does not match the surface.)
- `data.*` 8-colour categorical palette — a coherent proposal from the Anthropic
  brand hues (clay, blue, green, ink, terracotta, mid grey, book cloth, kraft tan
  `#bfa07a`), not an official sequential data-vis scale.
- `radius.*`, `density.*`, `shadow.*`, `motion.*`, `disabledOpacity` — soft warm
  values approximating the claude.ai look; exact per-element specs not
  re-measured against the product CSS.
- `focus` technique (ring vs outline) — encoded as a soft clay ring; exact
  width/colour of the product focus-visible state not re-measured.

## Typography
- **Sans / UI / controls / labels / fields** (`font.sans`, `typography.control`,
  `typography.label`, `typography.field`): `'Styrene B', 'Styrene A',
  ui-sans-serif, system-ui, sans-serif` (Styrene medium 500 for labels/buttons,
  regular 400 for fields).
- **Display / headings** (`font.display`): `'Copernicus', 'Tiempos Headline',
  'Tiempos Text', Georgia, serif` — the book-title **serif** headline is the
  Anthropic signature (headings are serif, UI is sans).
- **Monospace** (`font.mono`): a system mono stack (Anthropic ships no public
  brand mono — "à confirmer").
- Links are subtle **ink** underlines (the clay is reserved for accents/CTAs);
  hover keeps the underline (thicker).

## Signatures anatomiques
- **Warm canvas**: `surface.default = #faf9f5` (ivory) with white raised cards —
  the whole app sits on a warm ivory, never pure white. The single most
  recognisable Anthropic trait.
- **Fields**: `field.style = "outline"` — boxed, softly-rounded inputs (white
  `#ffffff` fill on the ivory canvas, 1px `#e8e6dc` warm border, 8px radius). Not
  a filled-underline.
- **Radius**: soft warm rounding — controls/inputs `md = 8px`, cards `lg = 14px`,
  chips/CTAs pill (`pill = 999px`); `sm = 6px`.
- **Focus**: `focus.strategy = "ring"` — a soft clay `#d97757` ring (2px, offset
  2px).
- **Buttons**: primary = solid clay `#d97757` (white label) → terracotta
  `#c96442` on hover; secondary = warm ghost (transparent fill, `#e8e6dc` border,
  `#f0eee6` cream fill on hover).
- **Tabs**: active tab = clay `#d97757` medium label with a 2px bottom border
  indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless clay links; active page = filled clay `#d97757`
  (white text).
- **Chevron (native `<select>`)**: redrawn as a clay `#d97757` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: comfortable warm targets (md ≈ 40px control height) with generous
  horizontal padding (md inline 1.25rem); button label 15px (`0.9375rem`) medium.
- **Warm neutrals**: every grey has a yellow-brown undertone (`#4d4c48`,
  `#5e5d59`, `#87867f`, `#b0aea5`, `#e8e6dc`, `#f0eee6`) — no cool blue-greys.

## Asset officiel
- The Anthropic wordmark and the Claude "sunburst/asterisk" mark are official
  Anthropic brand assets — reference them from Anthropic's brand resources, do
  not redraw. Claude chrome should use the official Claude mark + the Copernicus
  serif wordmark, not a hand-drawn approximation.
