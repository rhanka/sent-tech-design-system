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
  (fetched 2026-09-24; per-file hex counts: `#03234b` ×102, `#fff`/`#ffffff`
  ×82, `#525a63` ×45, `#e6e6e6` ×34 (25 of which inside the embedded
  flatpickr vendor block — excluded as third-party), `#dbdee2` ×32,
  `#767c84` ×22, `#ffd200` ×19, `#f7f8fa` ×13, `#eeeff1` ×12, `#3cb4e6` ×9,
  `#569ff7` ×8 flatpickr library (excluded), `#2b8ec5` ×7, `#042e62` ×4,
  `#0f182f` ×3)
- Union of stylesheets: the newsroom homepage links six stylesheets — the
  theme `style.css` above, `wp-includes/css/dist/block-library/style.min.css`,
  `wp-includes/css/classic-themes.min.css`,
  `wp-content/plugins/related/css/frontend-style.css`, the bundled
  `st-news-v2/js/thirdparty/jquery-ui/jquery-ui.min.css`, and
  `https://search.st.com/widgets/searchbox/index.css`. All five retrievable
  sheets were fetched 2026-09-24 and contain no brand hex, so no role
  changes; the searchbox sheet is unreachable from non-browser clients
  (unverified, 2026-09-24, connection blocked — curl HTTP 000).
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
| `border.interactive` / `focus.color` | `.stn-form__checkbox:hover+label:before{border:2px solid #2b8ec5}` (3.63:1 as a line). The only focus colour the brand declares (`.modal-content input[type=text]:focus{border-color:#3cb4e6}`) fails the 3:1 line floor (2.37:1) and is replaced by this hover blue — see `À confirmer` | `#2b8ec5` |
| `text.link` / `feedback.info` / `breadcrumb.linkText` | `#2b8ec5` (3.63:1) → `#267fb0` 4.43 (fail) → `#22709b` 5.44 (pass at step 2, stop rule, H/S kept) | `#22709b` *(à confirmer)* |
| `data.category3` / `badge.infoBackground` / pagination selected filet | `.stn-form__checkbox:checked+label:before{background-color:#3cb4e6}`, `.stn-pagination__list a.selected{border-left:2px solid #3cb4e6}`, `.modal-content input[type=text]:focus{border-color:#3cb4e6}` | `#3cb4e6` |
| `surface.overlay` | `.stn-overlay{background-color:rgba(0,0,0,.5)}` (`.stn-filters-overlay` declares `rgba(0,0,0,.75)`; the lighter backdrop is kept — `.modal-backdrop{background:rgba(0,0,0,.7)}` is Bootstrap scaffolding, excluded) | `rgb(0 0 0 / 0.5)` |
| `shadow.subtle/medium/floating` | measured `.stn-card` shadow `0 0 4px 0 rgba(3,35,75,.05)`; medium/floating are the reference package's geometry re-tinted navy — see `À confirmer` | `rgb(3 35 75 / 0.05)`, `rgb(3 35 75 / 0.14)` *(à confirmer)*, `rgb(3 35 75 / 0.18)` *(à confirmer)* |
| `cyan.10` pale tint | `.stn-footer__nav-item:hover{color:#b0dcef}` — a hovered footer-link colour, reused as the pale tint (role adapted — see `À confirmer`) | `#b0dcef` |
| `blue.10` pale tint | `.stn-icon-search svg{stroke:#edf1f4}` | `#edf1f4` |
| `text.secondary` / `choice.labelColor` / pagination text | `.font-color--grey-neutral-1{color:#525a63}`, `.stn-card{color:#525a63}`, `.stn-pagination__page{color:#525a63}`, `.stn-form__checkbox+label{color:#525a63}` (7.00:1) | `#525a63` |
| `text.muted` | `#767c84` (4.21:1) darkened by the stop rule (H/S kept, step 1) to 5.06:1 | `#6a6f77` *(à confirmer)* |
| `border.strong` / breadcrumb separator | `.stn-form__checkbox+label:before{border:2px solid #767c84}`, `.font-color--grey-text{color:#767c84}` | `#767c84` |
| `border.subtle` / field stroke / pagination border | `.stn-form__input{border:1px solid #dbdee2}`, `.stn-pagination__page{border:1px solid #dbdee2}` | `#dbdee2` |
| `surface.subtle` | `body{background-color:#f7f8fa}`; the `#f7f8fa` hovers are `.stn-pagination__list li`, `.stn-header__blockmenu-item`, `.stn-page-navigation__search-item` (submenu hovers are `#f7f6f6`) | `#f7f8fa` |
| `card.hoverBackground` | measured card hover changes only the shadow (`.stn-card:hover{box-shadow:0 3px 3px 0 rgba(3,35,75,.15)}`), so the fill is kept at white | `#ffffff` *(à confirmer)* |
| `tag.neutralBackground` | `.stn-pagination__dropdown:hover{background-color:#eeeff1}` | `#eeeff1` |
| `surface.default` / `surface.raised` / `field.fillBg` | `.stn-card{background-color:#fff}`, `.stn-form__input{background-color:#fff}` | `#ffffff` |
| `action.danger` / `feedback.error` / `data.category5` | `.modal-content .text-red{color:#e6007e}` (4.50:1 on white) — a single occurrence carrying three roles: weak basis, see `À confirmer` | `#e6007e` |
| `feedback.success` / `data.category8` | derived deep green (5.14:1 on white) | `#1e7e34` *(à confirmer)* |
| `feedback.warning` | derived amber (5.02:1 on white) | `#b45309` *(à confirmer)* |
| `breadcrumb.currentWeight` | `.stn-page-header__breadcrumb .page{font-weight:600}` — the brand breadcrumb is white-on-dark, so porting it onto light roles is an adaptation | `600` *(à confirmer)* |
| `tabs.paddingBlock` | `.stn-page-navigation__tabs a{padding:1rem 0}` | `1rem` |
| `alert.*` (whole block) | no alert, notice or message rule in the newsroom CSS — aligned with the reference theme package's geometry | — *(à confirmer)* |
| `search.*` (whole block) | measured search fields carry icon gutters (`.stn-form__input{padding:.75rem 3rem .75rem 4rem;height:59px}`, `.stn-page-navigation__search-input .stn-form__input{padding:9px 36px}`), unmappable onto this symmetric model — aligned with the reference theme package's geometry | — *(à confirmer)* |
| `tabs` (except `paddingBlock`), `pagination` (`paddingBlock`/`paddingInline`/`fontSize`/`lineHeight`), `density.*` | no brand size scale published — aligned with the reference theme package's geometry | — *(à confirmer)* |

## À confirmer (derived or no published brand token)

- **Readable link/info blue** (`#22709b`) — the measured interactive blue
  `#2b8ec5` (3.63:1) fails the 4.5:1 text floor, so H/S were kept and L
  stepped down per the stop rule: step 1 `#267fb0` 4.43 (fail), step 2
  `#22709b` 5.44 (first pass, kept).
- **Readable muted grey** (`#6a6f77`) — the measured placeholder grey
  `#767c84` (4.21:1) fails the 4.5:1 text floor; same stop rule, step 1
  `#6a6f77` 5.06 (first pass, kept).
- **Feedback green/amber** (`success #1e7e34`, `warning #b45309`) — the
  newsroom CSS publishes no success/warning hues; chosen to clear AA on
  white (5.14:1 / 5.02:1).
- **Secondary hover yellow** (`#cca800`) — measured only as a decorative
  header border; its use as the yellow-button hover fill is coherent but
  unmeasured.
- **Focus stand-in** (`outline` 2px in `#2b8ec5`) — the only focus colour
  the brand declares (`.modal-content input[type=text]:focus{border-color:#3cb4e6}`)
  fails the 3:1 line floor (2.37:1), so it is replaced by the measured
  interactive (hover) blue `#2b8ec5` (3.63:1 as a line) as the accessible
  outline stand-in.
- **`#e6007e` on three roles** — a single occurrence
  (`.modal-content .text-red`) carries `action.danger`, `feedback.error`
  and `data.category5`: weak basis, kept for lack of any other brand red.
- **Pale tint role** (`#b0dcef`) — the unique occurrence is a hovered
  footer-link colour (`.stn-footer__nav-item:hover{color:#b0dcef}`), not a
  surface tint; reusing it as `cyan.10` is a role adaptation.
- **Card hover fill** (`#ffffff`) — the measured hover changes only the
  shadow, so the fill is kept unchanged rather than inventing a hover tint.
- **Breadcrumb adaptation** (`currentWeight 600`) — the measured weight is
  kept, but the brand breadcrumb is white-on-dark while these roles render
  on light surfaces: the port is an adaptation, not a transcription.
- **Select chevron** (navy data-URI, `2.5rem` gutter) — no native-select
  brand styling published (custom `.edd` dropdowns); redrawn in the brand
  navy following the reference-package shape.
- **`radius.lg = "0.75rem 0"`** — the asymmetric button radius is measured
  (`.stn-button{border-radius:.75rem 0}`); carrying it on `lg` is the
  mapping choice.
- **`shadow.medium/floating`, `density.*`, `font.mono`, `iconSize`,
  `spacing.*`, `motion.fast`, `radius.pill`, `alert.*`, `search.*`, `tabs`
  (except `paddingBlock`), `pagination` paddings/type** — not published as
  brand tokens; medium/floating are the reference theme package's geometry
  re-tinted with the brand navy, and the geometry values are aligned with
  the reference theme package's geometry (checked against
  `packages/tokens/src/foundation.ts`: only `controlHeight` matches the
  Sentropic base — `density.sm.paddingInline` 0.5 vs 0.75rem,
  `density.sm.gap` 0.5 vs 0.375rem, `density.md.paddingBlock` 0.375 vs 0,
  `density.md.paddingInline` 0.75 vs 1rem, `density.lg.paddingInline` 1 vs
  1.25rem, and the `fontSize` key is absent from the base; `font.mono`
  likewise differs from the base stack). Control-specific heights exist —
  59px search fields, 2.5rem pagination pages — but no control size scale.
- **`motion.slow = "450ms"`** —
  `.modal-content input[type=text]{transition:box-shadow .45s,border-color .45s ease-in-out}`:
  a field transition, carried as the slow duration (not a general brand
  duration).
- **`disabledOpacity = "0.35"`** —
  `#newsletter-subscription-validation-popup .validation-form .newsletter-submit.disabled{opacity:.35}`
  (a same-valued third-party `.swiper-button-disabled` exists; the cited
  rule is the brand one).
- **`typography.field.size = "1rem"`** — `1rem` is measured on `.stn-button`
  and `.stn-form__label`, but no field rule declares it (measured body copy
  is `body{font-size:1.0625rem}`); **`typography.label.lineHeight = "1.5"`**
  is declared nowhere (`.stn-form__label` carries size/weight/colour only).
- **Categorical `data.*` palette** — drawn from the measured brand hues;
  only `category8` (success green) is derived.

## Typography

- **Body / controls / fields** (`font.sans`, `typography.control/field`):
  **'Arial'** — 27 `font-family:"Arial",sans-serif` declarations; buttons
  inherit it at weight 700, fields at 400. We reference the font *name*
  only.
- **Display / headings** (`font.display`):
  **'ITCLubalinGraphStdMedium'** — the `h6,h5,h4,h3,h2,h1` rule carries the
  face, and section/header rules reuse it across the sheet; 2
  `LubalinGraphStd-Medium` variants also occur. We reference the font
  *name* only.
- **Labels** (`typography.label`): **'Arial'** 1rem weight 300 —
  `.stn-form__label{font-size:1rem;font-weight:300;color:#525a63}` (no
  line-height declared — see `À confirmer`).
- **Choice labels**: 17px bold grey —
  `.stn-form__checkbox+label{font-size:17px;font-weight:700;color:#525a63}`.
- **Monospace** (`font.mono`): system stack, aligned with the reference
  theme package's stack (differs from the Sentropic base).
- **Body copy**: `body{font-family:"Arial",sans-serif;font-size:1.0625rem;line-height:1.5}`.
- Links: readable blue `#22709b`, underlined at rest and on hover (brand
  links read navy with a bottom rule or underlined).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff`
  fill, 1px `#dbdee2` border, `.stn-form__input`; placeholders `#767c84`).
  Native `<select>` chevron redrawn in the brand navy `#03234b`.
- **Radius**: 3px on cards (`radius.sm`), `.375rem` on control dropdowns
  (`radius.md`), asymmetric `.75rem 0` button signature (`radius.lg`);
  pills stay `999px` (no pill radius declared by the brand — the `50px`
  radii are flatpickr). Header dropdowns use `0 0 1.25rem 0`.
- **Focus**: accessible **outline** stand-in in the interactive (hover) blue
  `#2b8ec5` (`focus.strategy = "outline"`, 2px width, 2px offset) — the
  only brand-declared focus colour (`#3cb4e6`) fails the 3:1 line floor and
  is replaced (see `À confirmer`).
- **Buttons**: primary = solid navy `#03234b` with **white text**
  (15.60:1) → hover `#042e62`; secondary = **solid brand yellow**
  `#ffd200` with navy text (10.75:1) → hover `#cca800`; signature
  asymmetric `.75rem 0` radius, no border.
- **Tabs / top-nav**: active tab = navy label `#03234b` with a bottom
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`); block
  padding is the measured `.stn-page-navigation__tabs a{padding:1rem 0}`,
  the rest aligns with the reference package. Brand breadcrumb weight
  (`600`) is measured; its port onto light roles is an adaptation.
- **Pagination**: bordered pages (`.375rem`, `#dbdee2`, grey `#525a63`
  labels, 2.5rem boxes); selected page = 2px light-blue `#3cb4e6` filet on
  a `#f7f8fa` fill with a navy label. Paddings/type align with the
  reference package.
- **Alert / search**: no brand rule publishes either geometry (zero
  alert/notice/message selectors; search fields carry asymmetric icon
  gutters) — both blocks align with the reference package.
- **Cards**: hover changes only the shadow
  (`.stn-card:hover{box-shadow:0 3px 3px 0 rgba(3,35,75,.15)}`), so the fill
  stays white; modal backdrop is the measured `.stn-overlay` black 50%.

## Asset officiel

- STMicroelectronics logo: the dark-navy "ST" logotype. Use the official
  SVG/PNG from the brand assets — **do not redraw the logo by hand**. This
  package references only font *names* (Arial, ITCLubalinGraphStdMedium)
  and public colour values, never logo artwork or font binaries.
