# SAQ → Sentropic mapping

This package maps **SAQ** (saq.com — Société des alcools du Québec, the Québec
state liquor retailer) onto the Sentropic token structure (`TenantTheme`). Every
value here is **measured from saq.com's public CSS** (the homepage plus the
storefront stylesheet `build/store/styles/main.css`): the dominant brand hexes,
the surface/grey ramp, the radii, the field/select treatment and the focus
technique. Only the font *name* is referenced (`"Maax"` — SAQ's proprietary brand
typeface, measured 254× in the stylesheet), never font binaries.

SAQ's identity is a **modern retail** system with a **wine heritage**: a bright
**coral-red `#fc4d30`** (the dominant brand hex, measured 16× on the homepage)
drives every primary action and CTA; the historic **deep burgundy `#7e003f`** (the
"wine" brand colour) anchors the reversed/inverse surface and a secondary accent;
a **teal `#004451`** is the cool accent; surfaces are **white** on a faint grey
page; ink is a **near-black `#1d1d1b`**; corners are **mostly square** (controls 0,
cards step to 8px); form fields are **boxed outlines** (white fill, 1px `#dde8e8`
border); focus is a **coral-red outline `#fc4d30`** (2px).

## Sources
- SAQ storefront (measured) — https://www.saq.com (homepage computed CSS) and the
  storefront stylesheet `build/store/styles/main.css`.
- Brand coral-red confirmed as the dominant brand hex (measured **16×** on the
  homepage); the "Maax" brand typeface measured **254×** in the stylesheet.

## Colour mapping

| Sentropic role | SAQ source (measured) | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `tabs.activeText` / brand | dominant brand hex (16× homepage) | `#fc4d30` |
| `action.primaryHover` | darkened `#fc4d30` (à confirmer) | `#e43d22` |
| `surface.inverse` / `action.secondaryText` / wine brand | deep burgundy ("wine") | `#7e003f` |
| `feedback.info` / teal accent | teal | `#004451` |
| (decorative brown) | brown (à confirmer) | `#5c2b17` |
| `text.primary` / `pagination.text` / `breadcrumb` current | near-black ink (à confirmer) | `#1d1d1b` |
| `text.secondary` / `border.strong` | measured secondary grey | `#878787` |
| `text.muted` | muted grey (à confirmer) | `#a0a0a0` |
| `surface.default` / `surface.raised` / `action.primaryText` | white | `#ffffff` |
| `surface.subtle` / `action.secondary` | measured subtle grey | `#f2f2f2` |
| `action.secondaryHover` / cream neutral | measured warm neutral (cream) | `#e1ded9` |
| `border.subtle` (field / divider stroke, 1px) | measured field/divider border | `#dde8e8` |
| `action.danger` / `feedback.error` | form / error red (à confirmer) | `#d0011b` |
| `feedback.success` | success green (à confirmer, AA on white) | `#2e7d32` |
| `feedback.warning` | warning amber (à confirmer, AA on white) | `#8a6d3b` |
| `surface.overlay` | modal backdrop (à confirmer) | `rgb(0 0 0 / 0.6)` |

## À confirmer (derived / no single published source)
- **`action.primaryHover` `#e43d22`** — a darkened step of the measured coral
  `#fc4d30`; no separately published hover token.
- **`text.primary` `#1d1d1b`** — the near-black ink; measured but recorded here as
  à confirmer per brief.
- **`text.muted` `#a0a0a0`** — muted grey, derived between `#878787` and white.
- **`brown` `#5c2b17`** — decorative only; not bound to a Sentropic role.
- **`action.danger` / `feedback.*` (`#d0011b` / `#2e7d32` / `#8a6d3b` / `#004451`)**
  — system/feedback hues; the danger red and info teal are measured-adjacent, the
  success/warning are AA-safe choices. All flagged à confirmer.
- **The Sentropic `blue` action family** — SAQ's primary action is coral, so the
  action steps map onto the coral scale; the lightest step uses the cream neutral
  `#e1ded9` (no published faint-coral tint).
- **The Sentropic `cyan` accent family** — mapped onto SAQ's measured teal `#004451`
  (with burgundy as the darkest cool step); no separate faint-teal tint published.
- **The 8-colour categorical `data.*` palette** — SAQ publishes no categorical
  token list; the scale is assembled from the measured brand hexes
  (coral / burgundy / teal / brown / grey / darkened-coral / ink / muted-grey),
  led by the brand coral.
- **`shadow.*`, `motion.*`, `spacing.*`** — not separately tokenised publicly; kept
  aligned with the Sentropic base.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`, `typography.*`):
  **`Maax`** — SAQ's proprietary brand typeface (measured **254×** in the
  stylesheet), with the brand's own `Helvetica, Arial, Verdana, sans-serif`
  fallback chain. Base type **16px**. Control labels **bold (700)**; body/field text
  **regular (400)**; labels semibold (500).
- **Monospace** (`font.mono`): **`Roboto, Helvetica, Arial, monospace`** (measured
  mono stack).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#dde8e8`, square control radius). Native `<select>` chevron redrawn in
  the near-black ink `#1d1d1b` with a ~36px gutter (`appearance: none`).
- **Radius**: **mostly square** (measured) — `none`/`sm` = **0**, `md`/`lg` =
  **0.5rem (8px)** = measured `.5em` on medium surfaces, `pill` = **999px** for
  chips. Controls (buttons/inputs) are square (0).
- **Borders**: field/divider strokes **1px solid `#dde8e8`**; strong borders
  `#878787`; brand accents `#fc4d30` / `#7e003f`.
- **Focus**: **coral-red outline** (`focus.strategy: "outline"`, **2px**, `#fc4d30`
  — the brand accent).
- **Buttons**: primary = **solid coral fill, white bold (700) text**, square (0
  radius), hover `#e43d22`; secondary = **neutral grey fill** (`#f2f2f2`) with a
  **burgundy `#7e003f`** label, cream `#e1ded9` hover.
- **Tabs / sub-nav**: active = bold **coral** label with a **coral bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = **filled coral square**,
  white text.
- **Tags / badges**: **pill** (`radius: 999px`) — grey-fill tags; coral-filled
  badges with white text.
- **Density**: 16px base type, bold 700 control labels; comfortable whitespace.

## Asset officiel
- SAQ wordmark (the "SAQ" logotype) is served as an official asset from the site
  header on saq.com. **Do not redraw** — reuse the official SAQ logo asset if a
  logo is needed.
