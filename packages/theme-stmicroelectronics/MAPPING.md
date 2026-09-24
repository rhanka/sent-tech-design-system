# STMicroelectronics → Sentropic mapping

This package maps the **public** STMicroelectronics web design onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**: the
brand navy (`#03234b`) and brand yellow (`#ffd200`) are read from the official
newsroom site stylesheet, whose utility classes name them explicitly
(`.stn-bg--primary`, `.stn-bg--secondary`). Only public values and font
*names* are referenced — no font binaries. Derived/unmeasured values are
flagged `à confirmer`.

> Key measured fact: ST publishes no named token/variable file — the newsroom
> theme carries zero `--*` brand custom properties, so every value below is a
> measured literal (rank b), never a rank-a token reference. The corporate
> site `www.st.com` blocks non-browser requests (Akamai mitigation), so no
> value is read from it; the newsroom is the only accessible official
> stylesheet.

## Sources

- STMicroelectronics newsroom theme stylesheet (`st-news-v2/style.css`,
  WordPress theme — brand navy/yellow utilities, button/input/pagination
  rules, Arial body + ITCLubalinGraphStdMedium headings) —
  https://newsroom.st.com/wp-content/themes/st-news-v2/style.css
  (fetched 2026-09-24; per-file hex counts: `#03234b` ×102, `#525a63` ×45,
  `#e6e6e6` ×34, `#dbdee2` ×32, `#767c84` ×22, `#ffd200` ×19, `#f7f8fa` ×13,
  `#eeeff1` ×12, `#3cb4e6` ×9, `#569ff7` ×8 flatpickr library (excluded),
  `#2b8ec5` ×7, `#042e62` ×4, `#0f182f` ×3)
- STMicroelectronics newsroom homepage (confirms the theme in use) —
  https://newsroom.st.com/
- `www.st.com` homepage — https://www.st.com/content/st_com/en.html
  (measurement attempted 2026-09-24: unreachable from non-browser clients —
  HTTP/2 `INTERNAL_ERROR`, HTTP/1.1 timeout; no value taken from it)

## Colour mapping

| Sentropic role | STMicroelectronics source | Value |
|---|---|---|
| `action.primary` / `text.primary` / `surface` navy text | `.stn-bg--primary{background-color:#03234b}`, `body{color:#03234b}`, `h1-h6{color:#03234b}`, `.stn-button--primary{background-color:#03234b}` | `#03234b` |
| `action.primaryHover` | `.stn-button--primary:hover,:focus{background-color:#042e62}` | `#042e62` |
| `surface.inverse` | `.stn-latest--bg-primary-dark{background-color:#0f182f}` | `#0f182f` |
| `action.secondary` / `data.category2` | `.stn-bg--secondary{background-color:#ffd200}`, `.stn-button--secondary{background-color:#ffd200}` | `#ffd200` |
| `action.secondaryHover` | `.stn-header--border-right{border-right:1px solid #cca800}` (darker yellow, coherent hover) | `#cca800` *(à confirmer)* |
| `action.secondaryText` / `badge.infoText` | inherited body navy on the yellow fill (10.75:1) | `#03234b` |
| `action.primaryText` / `text.inverse` | `.stn-button--primary{color:#fff}` on navy (15.60:1) | `#ffffff` |
| `border.interactive` / `focus.color` | `.stn-form__checkbox:hover+label:before{border:2px solid #2b8ec5}` (3.63:1 as a line) | `#2b8ec5` |
| `text.link` / `feedback.info` / `breadcrumb.linkText` | `#2b8ec5` darkened by the stop rule (H/S kept) to 5.44:1 | `#22709b` *(à confirmer)* |
| `data.category3` / `badge.infoBackground` / pagination selected filet | `.stn-form__checkbox:checked+label:before{background-color:#3cb4e6}`, `.stn-pagination__list a.selected{border-left:2px solid #3cb4e6}`, `.modal-content input[type=text]:focus{border-color:#3cb4e6}` | `#3cb4e6` |
| `cyan.10` pale tint | measured pale blue tint in the theme stylesheet | `#b0dcef` |
| `blue.10` pale tint | `.stn-icon-search svg{stroke:#edf1f4}` | `#edf1f4` |
| `text.secondary` / `choice.labelColor` / pagination text | `.font-color--grey-neutral-1{color:#525a63}`, `.stn-card{color:#525a63}`, `.stn-pagination__page{color:#525a63}`, `.stn-form__checkbox+label{color:#525a63}` (7.00:1) | `#525a63` |
| `text.muted` | `#767c84` darkened by the stop rule (H/S kept) to 5.06:1 | `#6a6f76` *(à confirmer)* |
| `border.strong` / breadcrumb separator | `.stn-form__checkbox+label:before{border:2px solid #767c84}`, `.font-color--grey-text{color:#767c84}` | `#767c84` |
| `border.subtle` / field stroke / pagination border | `.stn-form__input{border:1px solid #dbdee2}`, `.stn-pagination__page{border:1px solid #dbdee2}` | `#dbdee2` |
| `surface.subtle` / card hover | `body{background-color:#f7f8fa}` | `#f7f8fa` |
| `tag.neutralBackground` | `.stn-pagination__dropdown:hover{background-color:#eeeff1}` | `#eeeff1` |
| `surface.default` / `surface.raised` / `field.fillBg` | `.stn-card{background-color:#fff}`, `.stn-form__input{background-color:#fff}` | `#ffffff` |
| `action.danger` / `feedback.error` / `data.category5` | `.modal-content .text-red{color:#e6007e}` (4.50:1 on white) | `#e6007e` |
| `feedback.success` / `data.category8` | derived deep green (5.14:1 on white) | `#1e7e34` *(à confirmer)* |
| `feedback.warning` | derived amber (5.02:1 on white) | `#b45309` *(à confirmer)* |

## À confirmer (derived or no published brand token)

- **Readable link/info blue** (`#22709b`) — the measured interactive blue
  `#2b8ec5` (3.63:1) fails the 4.5:1 text floor, so H/S were kept and L
  stepped down per the stop rule to the first passing hex (5.44:1).
- **Readable muted grey** (`#6a6f76`) — the measured placeholder grey
  `#767c84` (4.21:1) fails the 4.5:1 text floor; same stop rule (5.06:1).
- **Feedback green/amber** (`success #1e7e34`, `warning #b45309`) — the
  newsroom CSS publishes no success/warning hues; chosen to clear AA on
  white (5.14:1 / 5.02:1).
- **Secondary hover yellow** (`#cca800`) — measured only as a decorative
  header border; its use as the yellow-button hover fill is coherent but
  unmeasured.
- **Focus stand-in** (`outline` 2px in `#2b8ec5`) — the theme declares no
  persistent visible focus token (focus rules resolve to `outline:none` /
  border-color shifts); the outline strategy in the measured interactive
  blue (3.63:1 as a line) is the accessible stand-in.
- **Select chevron** (navy data-URI, `2.5rem` gutter) — no native-select
  brand styling published (custom `.edd` dropdowns); redrawn in the brand
  navy following the reference-package shape.
- **`radius.lg = "0.75rem 0"`** — the asymmetric button radius is measured
  (`.stn-button{border-radius:.75rem 0}`); carrying it on `lg` is the
  mapping choice.
- **`shadow.medium/floating`, sm/lg `density.*` paddings, `iconSize`,
  `spacing.*`, `motion.fast`** — not published as tokens; medium/floating
  extend the measured card shadow with a navy tint, geometry reuses the
  Sentropic base scale (same path as both reference packages: control-
  specific heights exist — 59px search fields, 2.5rem pagination pages —
  but no control size scale).
- **Categorical `data.*` palette** — drawn from the measured brand hues;
  only `category8` (success green) is derived.

## Typography

- **Body / controls / fields** (`font.sans`, `typography.control/field`):
  **'Arial'** — 27 `font-family:"Arial",sans-serif` declarations; buttons
  inherit it at weight 700, fields at 400. We reference the font *name*
  only.
- **Display / headings** (`font.display`):
  **'ITCLubalinGraphStdMedium'** — 14 heading declarations
  (`h1-h6{font-family:"ITCLubalinGraphStdMedium",sans-serif}`), plus 3
  `LubalinGraphStd-Medium` variants. We reference the font *name* only.
- **Labels** (`typography.label`): **'Arial'** 1rem weight 300 —
  `.stn-form__label{font-size:1rem;font-weight:300;color:#525a63}`.
- **Choice labels**: 17px bold grey —
  `.stn-form__checkbox+label{font-size:17px;font-weight:700;color:#525a63}`.
- **Monospace** (`font.mono`): system stack.
- Links: readable blue `#22709b`, underlined at rest and on hover (brand
  links read navy with a bottom rule or underlined).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff`
  fill, 1px `#dbdee2` border, `.stn-form__input`; placeholders `#767c84`).
  Native `<select>` chevron redrawn in the brand navy `#03234b`.
- **Radius**: 3px on cards (`radius.sm`), `.375rem` on control dropdowns
  (`radius.md`), asymmetric `.75rem 0` button signature (`radius.lg`);
  pills stay `999px`. Header dropdowns use `0 0 1.25rem 0`.
- **Focus**: accessible **outline** stand-in in the interactive blue
  `#2b8ec5` (`focus.strategy = "outline"`, 2px width, 2px offset) — the
  brand itself shows no persistent focus token.
- **Buttons**: primary = solid navy `#03234b` with **white text**
  (15.60:1) → hover `#042e62`; secondary = **solid brand yellow**
  `#ffd200` with navy text (10.75:1) → hover `#cca800`; signature
  asymmetric `.75rem 0` radius, no border.
- **Tabs / top-nav**: active tab = navy label `#03234b` with a bottom
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: bordered pages (`.375rem`, `#dbdee2`, grey `#525a63`
  labels, 2.5rem boxes); selected page = 2px light-blue `#3cb4e6` filet on
  a `#f7f8fa` fill with a navy label.

## Asset officiel

- STMicroelectronics logo: the dark-navy "ST" logotype. Use the official
  SVG/PNG from the brand assets — **do not redraw the logo by hand**. This
  package references only font *names* (Arial, ITCLubalinGraphStdMedium)
  and public colour values, never logo artwork or font binaries.
