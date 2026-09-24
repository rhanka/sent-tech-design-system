# Euronext → Sentropic mapping

This package maps the **public** Euronext brand design onto the Sentropic
token structure (`TenantTheme`). Euronext publishes no tokenised design
system, but `www.euronext.com` and `live.euronext.com` serve themed
stylesheets (live served with `theme=euronext_live`) whose brand-owned
utility classes name the palette explicitly (`.btn-brand-*`,
`.bg-brand-*`, `.btn-ui-*`, `.text-*`, `.badge--*`). Method =
**measured-clone**: the teal-green action colour (`#008d7f`), the
hunter/kelly greens, the primary-dark ink (`#252631`), the ui-blue link
(`#007aff`, live host) and the ui-grey ramp are read from those
brand-owned rules; only public values and the font *name* (Inter, the
`body` typeface) are referenced — never font binaries. Derived/unmeasured
values are flagged `à confirmer`.

> Key measured facts: the brand's colour of action is the **teal green
> `#008d7f`** — union winner over hunter `#00685e` (206 declarations
> against 117 across both corpora, plus the 8 `fill="#008d7f"` paths of
> the official logo), used with **white** labels
> (`.btn-brand-teal-green{color:#fff}` — 4.10:1, the brand's own pairing,
> kept unaltered per the brand-fill rule). Links are the ui blue
> `#007aff` on live (`a{color:#007aff}`), darkened one stop-rule step for
> text use. The two hosts disagree on the colour of action (see
> per-host counts below): `.bg-primary`, `.text-primary`,
> `.btn-primary`, `.badge--primary` are `#008d7f` on live but `#00685e`
> on corporate, and `a{color:}` is `#007aff` on live but `#00685e` on
> corporate.

## Sources

- Euronext Live themed stylesheets (`theme=euronext_live`) — https://live.euronext.com/ (brand utilities `.btn-brand-*` (12 declarations per brand colour), `.btn-ui-*` greys, `.badge--*` tints, `.text-*` roles; `body{background-color:#f2f4f6}`; `.border{border:1px solid #e8ecef}`; `.form-control:focus{border-color:#0effe7;box-shadow:0 0 0 .2rem rgba(0,141,127,.25)}`)
- Euronext corporate site stylesheets — https://www.euronext.com/ (same brand utility set `.btn-brand-*`, `.text-*`; `body{background-color:#fff}` — not `#f2f4f6`; `.border` is the intact Bootstrap default `#dee2e6` — not `#e8ecef`; `.form-control:focus{border-color:#00e8d1;box-shadow:0 0 0 .2rem rgba(0,104,94,.25)}` — not the live ring). Identical on both hosts: `.btn-brand-*`, `.search input{border:none;border-bottom:1px solid #e8ecef}`; `#f2f4f6`/`#e8ecef` are brand values on both hosts via `.btn-ui-grey-4`/`.btn-ui-grey-3`.

Per-host counts (67 stylesheets recovered: 60 on www plus 7 on live, 65 distinct, 2026-09-24): `#008d7f` www 78 / live 128 (union 206); `#00685e` www 87 / live 30 (union 117 — on corporate alone the hunter green is the most frequent); `#252631` 99 union; `#007aff` 90+ union (live link blue); `#009639` 96 union (both hosts); `#ffab2b` 80+ union; `#fe4d6a` 70+ union; `#2ce5f6` 70+ union; `#79d100` 50+ union; `#41b6e6` 50+ union; `#c8d1da` 63 (`.btn-ui-grey-6` / `.form-control` border); `#6dd230` 49 in `www/43.css` (www ui-green, see below); `btn-brand-teal-green` 36; `Inter-*` font-family 200+ on both sites.

Tie-break for the colour of action: `#008d7f` wins over `#00685e` by union frequency (206 against 117) plus the official logo's 8 `fill="#008d7f"` paths. `#00685e` is recorded as the hunter brand green AND as the corporate host's action colour — not as data-only.

Step 0.5 classification (excluded before counting): `.mm-*` (mmenu.js
library), amcharts export CSS, bootstrap-slider, line-awesome/FontAwesome,
`.slick-*` carousel rules, Tealium/OneTrust/Didomi consent blocks, swiper,
select2, and the stock-Bootstrap
`.modal-backdrop{background-color:#000}` + `.show{opacity:.5}` (library
default, not a brand backdrop — hence the derived overlay below). Note on
`#6dd230`: it is NOT a password-strength-only hex — it counts 49
occurrences in `www/43.css` as the corporate host's `$success`/`ui-green`
(`.text-success`, `.bg-success`, `.bg-ui-green`, `.btn-ui-green`,
`.btn-success`, `.badge-success`, `.tag--success`, `.border-success`,
`.alert-success`…); the password-strength block lives in another file and
is only one consumer. `.btn-ui-green` is the sibling of `.btn-ui-blue`
and `.btn-ui-grey-*`, treated throughout as brand. `#009639` (96
occurrences, declared on both hosts) is nevertheless retained as the
success fill by frequency tie-break over the www-only `#6dd230`.

## Colour mapping

| Sentropic role | Euronext source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | live `.btn-brand-teal-green{background-color:#008d7f}` / `.text-primary{color:#008d7f}` / `.bg-primary` (union winner 206 vs 117; corporate action is `#00685e`) | `#008d7f` |
| `action.primaryHover` | `.btn-brand-teal-green:hover{background-color:#00675d}` | `#00675d` |
| `action.primaryHover` border | `.btn-brand-teal-green:hover{border-color:#005a51}` | `#005a51` |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | measured brand pairing `.btn-brand-teal-green{color:#fff}` / `.badge--primary{color:#fff}` (4.10:1, kept unaltered) | `#ffffff` |
| `surface.inverse` / `text.primary` | `body{color:#252631}` / `.btn-brand-primary-dark` | `#252631` |
| `surface.subtle` / `action.secondary` | live `body{background-color:#f2f4f6}` (www body is `#fff`) / `.btn-ui-grey-4` (both hosts) | `#f2f4f6` |
| `surface.raised` / `field.fillBg` | white / `.form-control{background-color:#fff}` | `#ffffff` |
| field stroke (`field.underlineColor`, provenance) | `.form-control{border:1px solid #c8d1da}` / `.btn-ui-grey-6` (63 occurrences; brand override of Bootstrap `#ced4da`) | `#c8d1da` |
| `action.secondaryHover` / `border.subtle` | live `.border{border:1px solid #e8ecef}` (www `.border` is Bootstrap default `#dee2e6`) / `.btn-ui-grey-3` (both hosts) | `#e8ecef` |
| search-widget exception (not the field anatomy) | `.search input{border:none;border-bottom:1px solid #e8ecef}` (both hosts; cf. `.header__form .form-control{border:none;height:22px}`) | `#e8ecef` |
| `border.strong` / trail text | `.btn-ui-grey-1` / `.timestamp{color:#778ca2}` | `#778ca2` |
| `text.muted` | `.text-muted{color:#676767}` | `#676767` |
| ui-blue fill / `data.category3` | live `a{color:#007aff}` / `.btn-ui-blue{background-color:#007aff}` (corporate link is `#00685e`) | `#007aff` |
| `text.link` | derived readable blue, 1 stop-rule step from live `a{color:#007aff}` | `#006ee6` *(à confirmer)* |
| `text.secondary` | derived readable grey, 2 stop-rule steps from `.timestamp{color:#778ca2}` (4.96:1 on `surface.default`; 4.50:1 on `surface.subtle` — section 9 anchors on `surface.default`) | `#5d7289` *(à confirmer)* |
| `breadcrumb.linkText` | same derived readable blue | `#006ee6` *(à confirmer)* |
| `buttonSecondary.hoverBackground` / `blue.10` | `.btn-ui-light-green{background-color:#ebf6f5}` | `#ebf6f5` |
| `cyan.10` | `.badge--info{background-color:#eafcfe}` | `#eafcfe` |
| `cyan.50` | `.btn-brand-sky-blue{background-color:#41b6e6}` | `#41b6e6` |
| slate scale step | `.btn-ui-grey-5{background-color:#f8fafb}` | `#f8fafb` |
| slate scale step | `.btn-ui-foam-blue{background-color:#f1fafe}` | `#f1fafe` |
| slate scale step | `.btn-ui-grey-2{background-color:#98a9bc}` / `.header__form .form-control{color:#98a9bc}` | `#98a9bc` |
| slate scale step | `.btn-ui-grey-0{background-color:#3b4b5d}` | `#3b4b5d` |
| slate darkest | `.form-control:focus{color:#1b1e24}` (general form control) | `#1b1e24` |
| focus ring border | live `.form-control:focus{border-color:#0effe7}` (www serves `border-color:#00e8d1`) | `#0effe7` |
| hunter green (corporate action + data/accents) | `.btn-brand-hunter-green{background-color:#00685e}` — also the www action colour (`.bg-primary`/`.text-primary`/`.btn-primary`/`a` on corporate) | `#00685e` |
| kelly green (success fill) | `.btn-brand-kelly-green{background-color:#009639}` / `.text-success` / `.ticker-001 .change-positive` (both hosts; tie-break over www-only `#6dd230` 49) | `#009639` |
| spring green (data/accents) | `.btn-brand-spring-green{background-color:#79d100}` | `#79d100` |
| warning amber (fill) | `.bg-warning{background-color:#ffab2b}` / `.text-warning` | `#ffab2b` |
| error red (fill, `action.danger`) | `.bg-danger{background-color:#fe4d6a}` / `.text-danger` (brand fill kept unaltered; white text 3.24:1, black text 6.48:1) | `#fe4d6a` |
| info cyan (fill) | `.bg-info{background-color:#2ce5f6}` / `.text-info` | `#2ce5f6` |
| `feedback.success` / `status.completed` | derived readable green, 1 stop-rule step from `#009639` | `#007c2f` *(à confirmer)* |
| `feedback.warning` / `status.pending` | derived readable amber, 5 stop-rule steps from `#ffab2b` | `#aa6700` *(à confirmer)* |
| `feedback.error` / `status.failed` | derived readable red, 4 stop-rule steps from `#fe4d6a` | `#e40126` *(à confirmer)* |
| `feedback.info` / `status.processing` | derived readable cyan, 6 stop-rule steps from `#2ce5f6` | `#067983` *(à confirmer)* |
| `shadow.subtle` | derived brand-ink elevation tint (brand publishes no shadow tokens) | `rgb(37 38 49 / 0.10)` *(à confirmer)* |
| `shadow.medium` | derived brand-ink elevation tint (brand publishes no shadow tokens) | `rgb(37 38 49 / 0.14)` *(à confirmer)* |
| `shadow.floating` | derived brand-ink elevation tint (brand publishes no shadow tokens) | `rgb(37 38 49 / 0.18)` *(à confirmer)* |
| `surface.overlay` | derived brand-ink tint (brand publishes no modal backdrop) | `rgb(37 38 49 / 0.6)` *(à confirmer)* |

Rounding convention for the stop-rule chains below: RGB channels are
rounded to the nearest integer (lowercase hex). Exact `.5000` ties in the
reviewed chains were retained as published (`#aa6700` step 5 at exactly
170.5000 rounded down; `#007aff` step 1 at exactly 229.5000 rounded up);
with a uniform `Math.round` (half up) the amber chain's first pass would
move to step 6, so the step numbers below refer to the retained published
values. The two off-by-one finals found in review (`#5d7389`,
`#067984`) are corrected below to the nearest (`#5d7289`, `#067983`,
same passing step).

Stop-rule chains (H kept, S kept, L −0.05/step, first pass wins, vs `surface.default` `#ffffff`):

- `#007aff` (4.02) → step 1 `#006ee6` (4.80). 1 step.
- `#778ca2` (3.47) → step 1 `#687f98` (4.14) → step 2 `#5d7289` (4.96). 2 steps.
- `#009639` (3.87) → step 1 `#007c2f` (5.35). 1 step.
- `#ffab2b` (1.89) → `#ffa111` (2.03) → `#f79500` (2.27) → `#dd8600` (2.81) → `#c47600` (3.54) → `#aa6700` (4.52). 5 steps.
- `#fe4d6a` (3.24) → `#fe3455` (3.60) → `#fe1a40` (3.86) → `#fd012b` (4.03) → `#e40126` (4.85). 4 steps.
- `#2ce5f6` (1.54) → `#14e2f5` (1.59) → `#0ad3e5` (1.83) → `#09bccd` (2.31) → `#08a6b4` (2.95) → `#078f9c` (3.88) → `#067983` (5.16). 6 steps.

## À confirmer (derived or no published brand token)

- **Readable text steps** (`#006ee6`, `#5d7289`, `#007c2f`, `#aa6700`, `#e40126`, `#067983`) — first passing stop-rule darkenings of the published vivid hues (chains above); the brand ships the vivid fills, not AA text steps.
- **`surface.overlay`** (`rgb(37 38 49 / 0.6)`) — the brand's modal backdrop rule is stock Bootstrap (vendor block, excluded); this is a coherent brand-ink tint.
- **`shadow.*`** (`rgb(37 38 49 / 0.10)`, `/ 0.14`, `/ 0.18`) — the brand publishes no shadow tokens; coherent brand-ink elevation tints.
- **Categorical `data.*` palette** (`#008d7f`, `#252631`, `#007aff`, `#ffab2b`, `#fe4d6a`, `#009639`, `#778ca2`, `#41b6e6`) — a coherent proposal from measured brand hues, not an official sequential scale.
- **Geometry**: `density.*` paddings/gaps, `shadow.*`, `motion.*` (incl. easing), `disabledOpacity`, `transition`, `radius.lg`, and the `selectPaddingRight` gutter — the brand DOES publish control geometry (`.btn-input,.form-control{height:52px}`, `.form-control{padding:.375rem .75rem}`, `.form-control-lg{height:calc(2.875rem + 2px);padding:.5rem 1rem}`, `.form-control-sm{height:calc(1.8125rem + 2px);padding:.25rem .5rem}`, `.custom-file-label{height:52px;padding:.75rem 1rem}`, `.btn-primary{padding-top:10.5px;padding-bottom:10.5px;min-width:125px}`, `.btn-cta{padding:14.5px 56px 14.5px 26px}` — 52px ≈ 3.25rem at a 16px root), but this package deliberately keeps the reference theme package's geometry for component-grid fidelity. Only `controlHeight`/`iconSize` match the Sentropic base.

## Typography

- **Body / controls / fields / labels / display** (`font.sans`, `font.display`, `typography.control/field/label`): **`'Inter'`** — `body{font-family:Inter-regular,…}` with Inter-medium/bold/light across 200+ declarations on both sites. We reference the font *name* only.
- **Monospace** (`font.mono`): `'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` — the stack declared by the brand stylesheet.
- Links: readable blue `#006ee6` (from live `#007aff`; corporate serves `#00685e`), not underlined at rest (`a{text-decoration:none}`), underlined on hover (`a:hover{text-decoration:underline}`).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — the general brand control is a white box with four equal borders (`.form-control{background-color:#fff;border:1px solid #c8d1da}`, `.btn-input,.form-control{border-radius:4px;height:52px}`, confirmed by `.form-control.is-invalid{border-color:#fe4d6a}` / `.is-valid{border-color:#009639}`). `.search input{border:none;border-bottom:1px solid #e8ecef}` is a documented search-widget exception. Native `<select>` chevron redrawn in the brand teal `#008d7f`.
- **Radius**: 4px on controls/inputs/tabs (`radius.sm/md = 0.25rem`, measured `.btn-input,.form-control{border-radius:4px}`); `radius.lg = 0.5rem` on cards (à confirmer); pills/tags stay `999px`.
- **Focus**: teal **ring** (`focus.strategy = "ring"`, `0.2rem` width, `0` offset) — live `.form-control:focus{border-color:#0effe7;box-shadow:0 0 0 .2rem rgba(0,141,127,.25)}`, `rgba(0,141,127)` = `#008d7f` (www serves `border-color:#00e8d1` with `rgba(0,104,94,.25)`). The `focus.color` primitive carries no alpha, so the opaque `#008d7f` encoding renders stronger than the brand's translucent ring.
- **Buttons**: primary = solid brand teal `#008d7f` with **white** label → hover `#00675d`; secondary = **outlined** teal (transparent fill, `#008d7f` border, light-green `#ebf6f5` hover fill).
- **Tabs / top-nav**: active tab = bold **ink** label `#252631` with a bottom **teal** underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`; the indicator colour derives from `action.primary`).
- **Pagination**: borderless ink links; active page = filled brand teal `#008d7f` with white text.

## Asset officiel

- Euronext logo = `/themes/custom/euronext_com/logo.svg` on www.euronext.com (plus `logo-inverse.svg`): the brand teal `#008d7f` is the dominant mark fill (8 paths), with white lettering and a multicolour green/blue pulse spectrum. Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *name* (Inter) and public colour values, never logo artwork or font binaries.
