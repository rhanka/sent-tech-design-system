# National Bank of Canada → Sentropic mapping

This package maps **National Bank of Canada** (bnc.ca / nbc.ca — Banque Nationale
du Canada, the Montréal-HQ chartered bank) onto the Sentropic token structure
(`TenantTheme`). National Bank's public site is an Adobe Experience Manager build
whose brand layer (`theme.min.css`) uses **literal hex values** (no CSS custom
properties). Every value here is **measured from the live storefront's
stylesheets**, fetched directly via `curl` (the brand `theme.min.css`, the React
`clientlib-base.min.css` and `clientlib.min.css`): the brand button family
(`btnRTE1/2/3`), the modern `input` / MUI `MuiTextField` field rules, the
`@font-face` family names, and the frequency-ranked hex palette of the whole
brand sheet. Only the font *names* are referenced (`"Gilroy"` body + `"Korolev"`
display — the brand's proprietary faces), never font binaries.

National Bank's identity is a **confident red-on-navy bank** system: the
signature **National Bank red `#e41c23`** (the single most-used brand hex, 108
occurrences) drives every primary CTA and brand accent; a deep **navy `#00314d`**
(the most-used text colour, 240 `color:` occurrences) is the primary ink and
heading colour; surfaces are **white** on faint grey; **buttons are fully rounded
pills** (measured CTA `border-radius: 58px`); form fields are **boxed outlines**
(white fill, thin grey `#e1e1e1` stroke, 6px radius); focus is an accessible
**blue `#1572c5`** (the measured MUI focused-field outline) — deliberately a
different hue from the red brand so the indicator never blends into a red control.

## Sources
- National Bank storefront (measured) — https://www.bnc.ca/ and
  https://www.nbc.ca/personal.html
- Brand layer (frequency-ranked literal hexes, `btnRTE*`, `@font-face`) —
  `https://www.bnc.ca/etc.clientlibs/web-sites-bncr/clientlibs/clientlib-site/theme.min.088b0040784f488f5ba8f374e2680914.css`
- Modern React field/focus layer (`input`, `MuiTextField`, focused outline) —
  `…/web-sites-toolkit/.../clientlib-base.min.b9e58db3….css` and
  `…/web-sites-react/components/web-sites-react/clientlib.min.6ec3856b….css`
- Brand colours/logo confirmed externally — https://logotyp.us/logo/nbc/ ,
  https://brandfetch.com/bnc.ca (red + blue brand pair).

## Colour mapping

| Sentropic role | National Bank source (measured) | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `tabs.activeText` / brand | `btnRTE3 background-color` (108× brand hex) | `#e41c23` |
| `action.primaryHover` | `btnRTE3:hover` / active deepening | `#be171d` |
| (red hover variant) | `btnRTE1:hover background-color` | `#cb191e` |
| (bright red accent / border) | red border/accent variant | `#eb212e` |
| `text.primary` / `surface.inverse` / heading ink | primary text colour (240× `color:`) | `#00314d` |
| (darkest navy, btn base ink) | `btnRTE3` base font colour | `#001e2e` |
| `data.category4` (slate-blue) | secondary heading/accent ink (56× `color:`) | `#425865` |
| `focus.color` / `cyan.50` / `data.category3` | modern MUI focused-field outline | `#1572c5` |
| `text.link` / `pagination.text` / `breadcrumb.linkText` | anchor / link accent | `#105797` |
| (body dark ink) | body dark ink (29× `color:`) | `#303030` |
| `slate.90` (strongest ink) | strongest ink / dark surface | `#121212` |
| `text.secondary` / `text.muted` | secondary text (107× `color:`) | `#565656` |
| `surface.default` / `surface.raised` / `action.primaryText` | surface default / CTA text | `#ffffff` |
| `surface.subtle` / card hover | faint page grey | `#f5f5f5` |
| `action.secondary` / `tag.neutralBackground` | faint neutral fill | `#f1f1f1` |
| `border.subtle` (field/divider stroke) | modern `input` border `1px solid #e1e1e1` | `#e1e1e1` |
| `border.strong` | secondary control border | `#d2d2d2` |
| `action.danger` / `feedback.error` | strong error red | `#d0011b` |
| (error text ink) | alert-danger text | `#a94442` |
| `feedback.success` | alert-success text (AA on white) | `#3c763d` |
| (success bright) | confirmation accent green | `#01b64b` |
| `feedback.warning` | alert-warning text | `#8a6d3b` |
| `feedback.info` | alert-info text | `#31708f` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **Brand `#e41c23` vs alternates** — the brand sheet carries several near reds
  (`#e41c23`, `#eb212e`, `#cb191e`, `#be171d`, `#d0011b`). `#e41c23` is the
  canonical brand red (most frequent, the `btnRTE3` CTA fill); `#be171d` is the
  hover/active deepen, `#d0011b` is the strong error/danger fill.
- **`red.100` `#fdecec`** — a faint red tint **derived** for soft fills; no single
  published source token.
- **The Sentropic `cyan` accent family** — National Bank has no separate cyan
  accent; its cool family is the steel/navy blues, mapped onto the `cyan` slot
  (`#eef6fb` / `#1572c5` / `#00314d`) so a distinct cool accent survives.
- **`focus.color` `#1572c5`** — the legacy brand sheet uses the Bootstrap focus
  ring (`5px auto -webkit-focus-ring-color` + blue glow); the modern React layer
  focuses fields with `#1572c5`. We encode an accessible **2px blue outline** in
  that measured hue — deliberately not the red brand.
- **`border.strong` `#d2d2d2` / `borderWidth.thin` 1px** — the modern field stroke
  is the measured `1px solid #e1e1e1`; `#d2d2d2` is the slightly stronger control
  border. The legacy `.form-control` is `1px solid #ccc` with `border-radius:0`;
  the modern `input` is `1px solid #e1e1e1` with `border-radius:6px` — the modern
  6px boxed outline is encoded.
- **The 8-colour categorical `data.*` palette** — National Bank publishes no
  single categorical token list; the scale is assembled from measured brand hexes
  (red lead, navy, steel/link blues, slate, success green, amber, secondary ink).
- **`shadow.*`** — mapped from measured button/card box-shadows (CTA hover
  `0 4px 8px rgba(0,0,0,0.1)`, field inset `inset 0 1px 3px rgba(12,3,3,0.14)`).
- **`motion.*`, `spacing.*`** — the site uses `transition … ease-in-out .15s` and
  a 4/8px-based padding ramp; exact duration steps are not separately tokenised,
  kept aligned with the base (`fast`/`normal`/`slow`).
- **`radius.pill` `999px`** — encodes the measured button `border-radius: 58px`
  (the brand's fully-rounded pill CTA); tags/badges follow the pill language.

## Typography
- **Body / UI / fields** (`font.sans`, `typography.control/field/label`):
  **`"Gilroy"`** — the brand's proprietary sans (measured `@font-face`:
  Gilroy-Light/Regular/Medium/SemiBold/Bold/UltraLight), with the brand's own
  `Arial, sans-serif` fallback. Base type **16px**.
- **Headings / display** (`font.display`): **`"Korolev"`** — the brand's
  proprietary condensed display face (measured `@font-face`: Korolev-Medium,
  Korolev-Bold), Gilroy/Arial fallback.
- **CTA labels** are **Gilroy-Medium (500)** at 16px with a measured **`.5px`
  letter-spacing**; **field text** is Gilroy-SemiBold/Regular 16px navy
  (measured modern `input { font-family:"Gilroy-SemiBold"; color:#00314d; }`);
  **labels** semibold (600).
- **Links** resolve to the **steel/deep blue** accent (`#105797` / `#1572c5`),
  underline on hover (measured anchor `text-decoration:none` at rest).
- **Monospace** (`font.mono`): not part of National Bank; the Sentropic mono stack
  is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#e1e1e1`, **6px radius**, measured modern `input`), not a
  filled-underline. The legacy `.form-control` is square (`border-radius:0`,
  `1px solid #ccc`); the modern React `input` / MUI field is the 6px boxed
  outline. Native `<select>` chevron redrawn in the navy ink `#00314d` with a
  ~36px gutter (`appearance:none`).
- **Radius**: **buttons are fully rounded pills** (measured `btnRTE2`/`btnRTE3`
  `border-radius: 58px` → `pill`); controls/inputs **6px**; cards **8px**. (The
  legacy Bootstrap `.btn`/`.form-control` are square 0px outliers; the brand CTA
  is the pill.)
- **Borders**: modern field/divider strokes **1px solid `#e1e1e1`**; brand accents
  **`#e41c23`** (red 1px on `btnRTE2/3`); error field border `1px solid #e41c23`.
- **Focus**: accessible **blue outline** (`focus.strategy: "outline"`, 2px,
  `#1572c5` = measured MUI focused-field outline) — deliberately **blue, not the
  red brand**, so the ring stays visible on red controls.
- **Buttons**: primary = **solid National Bank-red pill, white Gilroy-Medium
  (500) text** (measured `btnRTE3`: red `#e41c23` fill, white text, 58px radius,
  padding 10px/24px, hover `#be171d`, hover shadow `0 4px 8px rgba(0,0,0,0.1)`);
  secondary = **outlined red ghost** (transparent fill, red `#e41c23` border +
  red text, fills red with white text on hover — measured `btnRTE2`); a tertiary
  text button (`btnRTE1`) is red Gilroy-Medium label, underline on hover.
- **Tabs / sub-nav**: active = bold **red** label with a **red bottom indicator**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`; the measured 2px red
  under-rule).
- **Pagination**: borderless blue links; active page = **filled brand-red pill**,
  white text.
- **Tags / badges**: **pill** (`radius: 999px`) — faint-grey-fill tags with navy
  ink; brand-red filled badges with white text.
- **Density**: 16px base type, Gilroy-Medium control labels, ~40px CTAs (padding
  10px/24px) and ~40px inputs (padding 0/10px); comfortable whitespace; soft
  light-tinted elevation.

## Asset officiel
- National Bank wordmark + brand mark (the red/navy identity), served as official
  SVG/PNG from the site header and brand resources. Reuse the official asset (e.g.
  via brandfetch.com/bnc.ca or the site header logo) if a logo is needed.
  **Do not redraw** — reuse the official National Bank logo asset.
