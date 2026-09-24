# Euronext → Sentropic mapping

This package maps the **public** Euronext brand design onto the Sentropic
token structure (`TenantTheme`). Euronext publishes no tokenised design
system, but `euronext.com` and `live.euronext.com` serve a shared themed
stylesheet (live served with `theme=euronext_live`) whose brand-owned
utility classes name the palette explicitly (`.btn-brand-*`,
`.bg-brand-*`, `.btn-ui-*`, `.text-*`, `.badge--*`). Method =
**measured-clone**: the teal-green action colour (`#008d7f`), the
hunter/kelly greens, the primary-dark ink (`#252631`), the ui-blue link
(`#007aff`) and the ui-grey ramp are read from those brand-owned rules;
only public values and the font *name* (Inter, the `body` typeface) are
referenced — never font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured fact: the brand's colour of action is the **teal green
> `#008d7f`** (`.btn-primary`, `.bg-primary`, `.text-primary`), used with
> **white** labels (`.btn-brand-teal-green{color:#fff}` — 4.10:1, the
> brand's own pairing, kept as-is). Links are the ui blue `#007aff`
> (`a{color:#007aff}`), darkened one stop-rule step for text use.

## Sources

- Euronext corporate site stylesheets — https://www.euronext.com/ (brand utilities `.btn-brand-*`, `.text-*`, `body` ink/background, `.border`, `.search input` underline, `.form-control:focus` ring)
- Euronext Live themed stylesheets (`theme=euronext_live`) — https://live.euronext.com/ (same brand utility set: 12 `.btn-brand-*` declarations per brand colour, `.btn-ui-*` greys, `.badge--*` tints, `.text-*` roles)
- Brand colour cross-check (aggregator mirror, never an origin) — brand-palette listings of Euronext teal/green

Per-file counts (union of both corpora, 2026-09-24): `btn-brand-teal-green`
36, `#008d7f` 200+, `#00685e` 180+, `#252631` 100+, `#007aff` 90+,
`#009639` 90+, `#ffab2b` 80+, `#fe4d6a` 70+, `#2ce5f6` 70+, `#79d100`
50+, `#41b6e6` 50+, `Inter-*` font-family 200+.

Step 0.5 classification (excluded before counting): `.mm-*` (mmenu.js
library), amcharts export CSS, bootstrap-slider, line-awesome/FontAwesome,
`.slick-*` carousel rules, the Drupal password-strength module
(`.password-strength__indicator`, `#6dd230`), and the stock-Bootstrap
`.modal-backdrop{background-color:#000}` + `.show{opacity:.5}` (library
default, not a brand backdrop — hence the derived overlay below).

## Colour mapping

| Sentropic role | Euronext source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | `.btn-brand-teal-green{background-color:#008d7f}` / `.text-primary{color:#008d7f}` / `.bg-primary` | `#008d7f` |
| `action.primaryHover` | `.btn-brand-teal-green:hover{background-color:#00675d}` | `#00675d` |
| `action.primaryHover` border | `.btn-brand-teal-green:hover{border-color:#005a51}` | `#005a51` |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | `.btn-brand-teal-green{color:#fff}` / `.badge--primary{color:#fff}` | `#ffffff` |
| `surface.inverse` / `text.primary` | `body{color:#252631}` / `.btn-brand-primary-dark` | `#252631` |
| `surface.subtle` / `action.secondary` | `body{background-color:#f2f4f6}` / `.btn-ui-grey-4` | `#f2f4f6` |
| `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `action.secondaryHover` / `border.subtle` / field underline | `.border{border:1px solid #e8ecef}` / `.search input{border-bottom:1px solid #e8ecef}` | `#e8ecef` |
| `border.strong` / trail text | `.btn-ui-grey-1` / `.timestamp{color:#778ca2}` | `#778ca2` |
| `text.muted` | `.text-muted{color:#676767}` | `#676767` |
| `text.link` | derived readable blue, 1 stop-rule step from `a{color:#007aff}` | `#006ee6` *(à confirmer)* |
| `text.secondary` | derived readable grey, 2 stop-rule steps from `.timestamp{color:#778ca2}` | `#5d7389` *(à confirmer)* |
| `breadcrumb.linkText` | same derived readable blue | `#006ee6` *(à confirmer)* |
| `buttonSecondary.hoverBackground` / `blue.10` | `.btn-ui-light-green{background-color:#ebf6f5}` | `#ebf6f5` |
| `cyan.10` | `.badge--info{background-color:#eafcfe}` | `#eafcfe` |
| `cyan.50` | `.btn-brand-sky-blue{background-color:#41b6e6}` | `#41b6e6` |
| slate scale step | `.btn-ui-grey-5{background-color:#f8fafb}` | `#f8fafb` |
| slate scale step | `.btn-ui-foam-blue{background-color:#f1fafe}` | `#f1fafe` |
| slate scale step | `.btn-ui-grey-2{background-color:#98a9bc}` / `.header__form .form-control{color:#98a9bc}` | `#98a9bc` |
| slate scale step | `.btn-ui-grey-0{background-color:#3b4b5d}` | `#3b4b5d` |
| slate darkest | `.form-control:focus{color:#1b1e24}` | `#1b1e24` |
| hunter green (data/accents) | `.btn-brand-hunter-green{background-color:#00685e}` | `#00685e` |
| kelly green (success fill) | `.btn-brand-kelly-green{background-color:#009639}` / `.text-success` / `.ticker-001 .change-positive` | `#009639` |
| spring green (data/accents) | `.btn-brand-spring-green{background-color:#79d100}` | `#79d100` |
| warning amber (fill) | `.bg-warning{background-color:#ffab2b}` / `.text-warning` | `#ffab2b` |
| error red (fill, `action.danger`) | `.bg-danger{background-color:#fe4d6a}` / `.text-danger` | `#fe4d6a` |
| info cyan (fill) | `.bg-info{background-color:#2ce5f6}` / `.text-info` | `#2ce5f6` |
| `feedback.success` / `status.completed` | derived readable green, 1 stop-rule step from `#009639` | `#007c2f` *(à confirmer)* |
| `feedback.warning` / `status.pending` | derived readable amber, 5 stop-rule steps from `#ffab2b` | `#aa6700` *(à confirmer)* |
| `feedback.error` / `status.failed` | derived readable red, 4 stop-rule steps from `#fe4d6a` | `#e40126` *(à confirmer)* |
| `feedback.info` / `status.processing` | derived readable cyan, 6 stop-rule steps from `#2ce5f6` | `#067984` *(à confirmer)* |
| `surface.overlay` | derived brand-ink tint (brand publishes no modal backdrop) | `rgb(37 38 49 / 0.6)` *(à confirmer)* |

Stop-rule chains (H kept, S kept, L −0.05/step, first pass wins, vs `surface.default` `#ffffff`):

- `#007aff` (4.02) → step 1 `#006ee6` (4.80). 1 step.
- `#778ca2` (3.47) → step 1 `#687f98` (4.14) → step 2 `#5d7389` (4.91). 2 steps.
- `#009639` (3.87) → step 1 `#007c2f` (5.35). 1 step.
- `#ffab2b` (1.89) → `#ffa111` (2.03) → `#f79500` (2.27) → `#dd8600` (2.81) → `#c47600` (3.54) → `#aa6700` (4.52). 5 steps.
- `#fe4d6a` (3.24) → `#fe3455` (3.60) → `#fe1a40` (3.86) → `#fd012b` (4.03) → `#e40126` (4.85). 4 steps.
- `#2ce5f6` (1.54) → `#14e2f5` (1.59) → `#0ad3e5` (1.83) → `#09bccd` (2.31) → `#08a6b4` (2.95) → `#078f9c` (3.88) → `#067984` (5.15). 6 steps.

## À confirmer (derived or no published brand token)

- **Readable text steps** (`#006ee6`, `#5d7389`, `#007c2f`, `#aa6700`, `#e40126`, `#067984`) — first passing stop-rule darkenings of the published vivid hues (chains above); the brand ships the vivid fills, not AA text steps.
- **`surface.overlay`** (`rgb(37 38 49 / 0.6)`) — the brand's modal backdrop rule is stock Bootstrap (vendor block, excluded); this is a coherent brand-ink tint.
- **Categorical `data.*` palette** (`#008d7f`, `#252631`, `#007aff`, `#ffab2b`, `#fe4d6a`, `#009639`, `#778ca2`, `#41b6e6`) — a coherent proposal from measured brand hues, not an official sequential scale.
- **Geometry**: `density.*` paddings/gaps, `shadow.*`, `motion.*` (incl. easing), `disabledOpacity`, `transition`, `radius.lg`, and the `selectPaddingRight` gutter — not published by the brand; aligned with the reference theme package's geometry. Only `controlHeight`/`iconSize` match the Sentropic base.
- **`action.primaryText` white on teal (4.10:1)** — the brand's own pairing (`.btn-brand-teal-green{color:#fff}`), kept unaltered per the brand-fill rule; below 4.5:1 but above 3:1.

## Typography

- **Body / controls / fields / labels / display** (`font.sans`, `font.display`, `typography.control/field/label`): **`'Inter'`** — `body{font-family:Inter-regular,…}` with Inter-medium/bold/light across 200+ declarations on both sites. We reference the font *name* only.
- **Monospace** (`font.mono`): `'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace` — the stack declared by the brand stylesheet.
- Links: readable blue `#006ee6`, not underlined at rest (`a{text-decoration:none}`), underlined on hover (`a:hover{text-decoration:underline}`).

## Signatures anatomiques

- **Fields**: `field.style = "filled-underline"` — the brand's own search input draws a single bottom stroke (`.search input{border:none;border-bottom:1px solid #e8ecef}`) on a white fill. Native `<select>` chevron redrawn in the brand teal `#008d7f`.
- **Radius**: 4px on controls/inputs/tabs (`radius.sm/md = 0.25rem`, measured `.btn` / `border-radius:4px`); `radius.lg = 0.5rem` on cards (à confirmer); pills/tags stay `999px`.
- **Focus**: teal **ring** (`focus.strategy = "ring"`, `0.2rem` width, `0` offset) — `.form-control:focus{border-color:#0effe7;box-shadow:0 0 0 .2rem rgba(0,141,127,.25)}`, `rgba(0,141,127)` = `#008d7f`.
- **Buttons**: primary = solid brand teal `#008d7f` with **white** label → hover `#00675d`; secondary = **outlined** teal (transparent fill, `#008d7f` border, light-green `#ebf6f5` hover fill).
- **Tabs / top-nav**: active tab = bold **ink** label `#252631` with a bottom **teal** underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`; the indicator colour derives from `action.primary`).
- **Pagination**: borderless ink links; active page = filled brand teal `#008d7f` with white text.

## Asset officiel

- Euronext logo = `/themes/custom/euronext_com/logo.svg` on www.euronext.com (plus `logo-inverse.svg`): the brand teal `#008d7f` is the dominant mark fill (8 paths), with white lettering and a multicolour green/blue pulse spectrum. Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *name* (Inter) and public colour values, never logo artwork or font binaries.
