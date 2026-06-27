# AXA → Sentropic mapping

This package maps the **public** AXA brand design onto the Sentropic token
structure (`TenantTheme`). The brand anchors (AXA Blue, AXA Red, white) and the
corporate web typeface (Source Sans Pro) are **measured** from AXA's public
brand identity. AXA does not publish a complete public CSS token tree for greys
and semantic roles, so the neutral scale and the success/warning/info hues are
**derived** (WCAG AA on white) and listed under "À confirmer". Only public
brand values and font *names* are referenced — no binaries are shipped.

## Sources
- AXA Design System — https://designsystem.axa.com/ (brand palette: AXA Blue
  `#00008f`, AXA Red `#ff1721`; corporate typeface Source Sans Pro). JS-rendered;
  values cross-checked against the brand-colour references below.
- AXA logo / brand colour references (cross-check):
  - https://coloropedia.com/axa-colors-logo-codes/ (Dark Blue `#00008f`, Vivid Red `#ff1721`)
  - https://www.brandcolorcode.com/axa
  - https://colorswall.com/palette/354 (`#00008f`, `#ffffff`, `#e11721`)
- AXA typeface (Source Sans Pro) — https://fontslogo.com/axa-logo-font/ and
  AXA brand-design references.

## Colour mapping

| Sentropic role | AXA source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `surface.inverse` | AXA Blue (official) | `#00008f` |
| `action.danger` / data accent | AXA Red (official) | `#ff1721` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.subtle` | derived bg alt | `#f4f4f8` |
| `border.subtle` | derived | `#e1e1e8` |
| `border.strong` / field underline | derived | `#c4c4d0` |
| `text.muted` | derived | `#6e6e80` |
| `text.secondary` | derived | `#41415a` |
| `text.primary` | derived near-black | `#16161d` |
| `slate.90` (darkest) | derived dark AXA blue | `#000063` |

### "À confirmer" (derived / no public AXA token)
- `action.primaryHover` `#2a2aa8` — lighter interactive blue derived from AXA
  Blue (which is too dark to darken further for a visible hover state).
- `action.secondary` `#e5e5f4` / `secondaryHover` `#d6d6ec` — light blue tints
  derived from AXA Blue.
- Neutral grey scale (`#f4f4f8`, `#efeff2`, `#e1e1e8`, `#c4c4d0`, `#6e6e80`,
  `#41415a`, `#16161d`) — derived; AXA publishes no public neutral token tree.
- `feedback.success` `#137c3b`, `feedback.warning` `#b25e00`, `feedback.info`
  `#0061a8` — derived for WCAG AA on white; AXA publishes no public semantic tokens.
- `feedback.error` `#d5001c` — derived darker red from AXA Red for AA text on
  white (the brand red `#ff1721` is reserved for `action.danger`, which carries
  white text).
- `cyan.*` (`#e3f4f8`, `#0098b3`, `#0a6f85`) — AXA has no cyan; a derived teal
  accent fills the Sentropic cyan slot.
- The 8-colour categorical `data.*` palette — a coherent proposal anchored on the
  AXA blue/red; not an official sequential scale.
- `radius.*` (2px fields / 4px buttons / 8px cards) — measured visually on AXA
  web properties, not from a published token.
- `focus` (`2px`/`2px` AXA-blue outline) — outline technique observed on AXA web
  properties; exact width/offset à confirmer.
- `density.*`, `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`, `accordion.*`,
  `tag.*`, `badge.*`, `choice.*`, `search.*`, `toggle.*` metrics — recoloured with
  measured AXA values; exact paddings/sizes follow the base scale.
- `shadow.*`, `motion.*`, spacing — kept aligned with the Sentropic base.

## Typography
- **Display / body / interactive / fields** (`font.sans`, `font.display`,
  `typography.*`): `'Source Sans Pro', 'Source Sans 3', system-ui, Arial,
  sans-serif` — AXA's corporate web typeface (headlines use heavier weights).
- **Monospace** (`font.mono`): the Sentropic mono stack (no AXA mono face).
- Only the font **names** are referenced, never binaries.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed white inputs (`#ffffff` fill,
  1px `#c4c4d0` border, ~2px radius), native `<select>` chevron redrawn in AXA blue.
- **Radius**: CRISP brand — fields ~2px, buttons ~4px, cards ~8px; pills `999px`.
- **Focus**: high-contrast **AXA-blue** outline (`2px solid #00008f`, `2px` offset).
- **Buttons**: primary = solid AXA Blue (`#00008f`, hover `#2a2aa8`), white text,
  semibold; secondary = white/ghost with AXA-blue text and a light blue hover.
- **Tabs**: active tab = bold AXA-blue label with a bottom blue underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled AXA blue.
- **Density**: clean mid-height controls (md ≈ 44px field, lg ≈ 52px CTA).

## Asset officiel
- AXA logo = the white "AXA" wordmark with the red underbar on the deep-blue
  square. It is a registered trademark — use the official asset, do **not**
  redraw it by hand.
