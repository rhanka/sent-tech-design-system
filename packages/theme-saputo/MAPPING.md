# Saputo → Sentropic mapping

This package maps **Saputo** (saputo.com — Saputo Inc., the Montréal-HQ global
dairy company) onto the Sentropic token structure (`TenantTheme`). Saputo's
corporate site is a Sitecore build whose brand stylesheet (`mainmin.css`) uses
**literal hex values** (no CSS custom properties). Every value here is **measured
from the live site's stylesheet**, fetched directly via `curl` (the homepage and
its `mainmin.css` bundle): the brand button rules (`.cta-container .button`,
`button.secondary-cta`), the `input[type=text]` / `select` field rules, the
`font-family` declarations, and the frequency-ranked hex palette of the whole
sheet. Only the font *names* are referenced (`"Open Sans"` body/UI/headings +
`"FlamaSemicondensed"` hero display), never font binaries.

Saputo's identity is a **confident red-on-white food brand** system: the signature
**Saputo red `#e31c23`** (the single most-used brand hex, 88 occurrences) drives
every primary CTA, link and brand accent; a **scarlet secondary red `#e33225`**
(64×) is the accent variant (the 4px menu under-rule, "new" chips, secondary
borders); primary ink is **pure black `#000`** (Saputo sets body text and headings
in black); surfaces are **white** on faint grey; **headings are bold UPPERCASE
Open Sans**; corners are **squarish** (measured CTA `border-radius: 3px`, content
`5px`, fields `4px`; only chips round fully to a `100px` pill); form fields are
**boxed outlines** (white fill, a 1px black stroke, 4px radius); focus is encoded
as a **red outline** (`#e31c23`).

## Sources
- Saputo corporate homepage (measured) — https://www.saputo.com/en
- Brand stylesheet (frequency-ranked literal hexes, `.cta-container .button`,
  `input`/`select`, `font-family`) — `https://www.saputo.com/-/media/ecosystem/divisions/corporate-services/sites/saputo-com/saputo-com-documents/mainmin.css`
- Brand colours/logo confirmed externally — the Saputo red wordmark (red-on-white
  identity).

## Colour mapping

| Sentropic role | Saputo source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `pagination.text` / brand | `.cta-container .button` background-color (88× brand hex) | `#e31c23` |
| `action.primaryHover` | `.cta-container .button:hover` (rgb 211,40,27) | `#d3281b` |
| `tabs.activeText` / `badge.infoBackground` / `data.category3` | scarlet menu 4px under-rule / "new" chips / secondary borders (64×) | `#e33225` |
| `feedback.info` / `status.processing` / `cyan.50` / `data.category2` | alternate CTA fill / steel-blue link accent | `#0464ac` |
| `surface.inverse` / `data.category5` | dark promo-band background | `#4f0710` |
| `text.primary` / heading ink / `slate.80/90` | primary text + headings (`body{color:#000}`) | `#000000` |
| `text.secondary` / `breadcrumb.text` / `data.category7` | secondary / caption text (26× `color:#333`) | `#333333` |
| `text.muted` / `slate.60` / `data.category8` | muted text | `#666666` |
| (placeholder / faint text) | placeholder / faint text | `#999999` |
| `data.category6` (warm stone) | warm stone/taupe accent neutral | `#988b83` |
| `surface.default` / `surface.raised` / `action.primaryText` / `field.fillBg` | surface default / CTA text | `#ffffff` |
| `surface.subtle` / card hover / `slate.10` | faint page grey | `#f5f5f5` |
| `action.secondary` / `tag.neutralBackground` | light neutral fill (chips, 14×) | `#ededed` |
| `border.subtle` (divider/hairline) / `slate.20` | divider / hairline (9×) | `#e5e5e5` |
| `border.strong` | secondary divider | `#dedede` |
| `feedback.success` / `status.completed` / `data.category4` | success fill (AA on white) | `#5d993c` |
| (success bright) | bright confirmation accent green | `#04aa6d` |
| `feedback.error` / `action.danger` / `status.failed` | `input-validation-error` border / danger | `#e31c23` |
| `surface.overlay` | modal backdrop `rgba(0,0,0,.5)` | `rgb(0 0 0 / 0.5)` |

### "À confirmer" (derived / no single published source)
- **Brand `#e31c23` vs `#e33225`** — the sheet carries two near reds: `#e31c23`
  (88×, the canonical brand red / CTA fill / links) and `#e33225` (64×, the
  scarlet accent — the 4px menu under-rule, "new" chips, secondary borders).
  `#e31c23` is the primary action; `#e33225` is the scarlet accent
  (`tabs.activeText`, `badge`). The hover red `#d3281b` is the measured
  `rgb(211.35, 39.75, 27.15)` `.button:hover` value rounded to hex.
- **`red.100` `#fdecec`** — a faint red tint **derived** for soft fills; no single
  published source token.
- **The Sentropic `cyan` accent family** — Saputo has no separate cyan accent; its
  cool family is the steel-blue `#0464ac`, mapped onto the `cyan` slot
  (`#e8ebf4` measured panel tint / `#0464ac` / `#4f0710` wine) so a distinct cool
  accent survives.
- **`feedback.warning` `#8a6d00`** — Saputo publishes **no** dedicated warning hex
  (the only yellow in the sheet is `#ff0`, a debug/highlight). `#8a6d00` is a
  **derived** amber that is AA-legible on white.
- **`focus.color` `#e31c23`** — Saputo's native field focus is a soft grey border
  (`hsl(0,0%,77%)`) + glow `0 0 10px 1px rgba(0,0,0,0.1)`, and choice controls use
  a `1px dotted` outline. We surface the **brand red** as a clearly visible 2px
  accessible focus indicator (brand-forward).
- **The 8-colour categorical `data.*` palette** — Saputo publishes no single
  categorical token list; the scale is assembled from measured brand hexes (red
  lead, steel-blue, scarlet, success green, wine, stone, secondary/mid ink).
- **`shadow.*`** — mapped from measured menu/card box-shadows (dropdown
  `0 5px 5px rgba(0,0,0,0.1)`, mega-menu `0 5px 10px rgba(0,0,0,0.15)`).
- **`motion.*`, `spacing.*`, `disabledOpacity`** — the site uses `transition: all
  250ms ease` (CTAs) / `300ms ease` (menus) and a 4/8px padding ramp; exact
  duration steps and a disabled-state opacity are not separately tokenised, kept
  aligned with the base.
- **`radius.pill` `100px`** — encodes the measured chip `border-radius: 100px`
  (also `17.5px` on red toggle chips); the CTA radius is the squarish `3px`/`4px`,
  not a pill.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `typography.control/field/label`):
  **`"Open Sans"`** — Saputo's site face (measured `body{font-family:"Open Sans"}`
  and `h1,h2,.headline{font-family:"Open Sans";font-weight:bold;
  text-transform:uppercase}`), with a `Helvetica Neue, Arial` fallback. Base type
  ~15px; headings are **bold UPPERCASE**.
- **Hero / display** (`font.display`): **`"FlamaSemicondensed"`** — the large
  hero/banner display face (measured `.hero …{font-family:"FlamaSemicondensed"}`,
  font-sizes 50px/20px), Open Sans/Arial fallback. (A `"BurfordBase"` face also
  appears once on a decorative element; FlamaSemicondensed is the dominant display.)
- **CTA labels** are **bold (700) UPPERCASE Open Sans** at ~13px (measured
  `.button{font-weight:bold;text-transform:uppercase;font-size:13px}`); **field
  text** is Open Sans 16px black; **labels** semibold (600).
- **Links** are the **brand red** `#e31c23`, **bold**, underline on hover (measured
  `a{font-weight:bold;color:#e31c23}`, no underline at rest).
- **Monospace** (`font.mono`): not part of Saputo; the Sentropic mono stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** black
  stroke `#000`, **4px radius**, measured `input[type=text]{border:1px solid #000;
  border-radius:4px;height:35px;padding:0 12px}`), not a filled-underline.
  Validation-error border is the brand red `#e31c23`. Native `<select>` chevron
  redrawn in black with a ~36px gutter (`appearance:none`, measured
  `select{-webkit-appearance:none}`).
- **Radius**: **squarish** — measured CTA `border-radius: 3px`, fields `4px`, the
  most common content radius `5px`, cards/menus `12px`; **only chips round fully**
  (measured `border-radius: 100px` / `17.5px`). `radius.md = 4px` (field), the
  derived component **button radius follows `radius.md` = 4px**; `radius.pill =
  100px` (chips/tags/badges).
- **Borders**: divider/field strokes **1px** (`#e5e5e5` divider, `#000` field);
  brand CTA border **2px solid `#e31c23`**; error field border `1px solid #e31c23`.
- **Focus**: brand-**red outline** (`focus.strategy: "outline"`, 2px, `#e31c23`) —
  surfacing the brand red as a visible accessible indicator (Saputo's native focus
  is a soft grey border + glow / `1px dotted` on choice controls).
- **Buttons**: primary = **solid Saputo-red, white bold UPPERCASE Open Sans label**
  (measured `.cta-container .button`: red `#e31c23` fill, 2px red border, white
  text, height 40px, padding 8px/30px, hover `#d3281b` + shadow `0 0 10px 1px
  rgba(0,0,0,0.1)`); secondary = **outlined red ghost** (white fill, red `#e31c23`
  border + red text, fills red with white text on hover — measured
  `button.secondary-cta`).
- **Tabs / sub-nav**: active = bold **scarlet** label with a **scarlet bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`; the measured
  2px/4px scarlet `#e33225` under-rule).
- **Pagination**: borderless red links; active page = **filled brand-red pill**,
  white text.
- **Tags / badges**: **pill** (`radius: 100px`) — faint-grey-fill (`#ededed`) tags
  with black ink; scarlet-filled (`#e33225`) "new" badges with white uppercase text.
- **Density**: ~15px base type, bold UPPERCASE Open Sans control labels, ~40px CTAs
  (padding 8px/30px) and ~35px inputs (padding 0/12px); comfortable whitespace;
  soft light-tinted elevation.

## Asset officiel
- Saputo red wordmark (the red-on-white identity), served as the official asset
  from the site header. Reuse the official Saputo logo asset if a logo is needed.
  **Do not redraw** — reuse the official Saputo logo asset.
