# Bureau Veritas → Sentropic mapping

This package maps the **public** Bureau Veritas website design onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**: every
brand value is read from the brand's own `bureauveritasbase` theme stylesheet
(the aggregated CSS served from the corporate homepage); only public values
and font *names* are referenced — no font binaries. Derived/unmeasured values
are flagged `à confirmer`.

> Key measured facts: the brand's colour of action is a deep blue, `#00049e`
> (filled buttons, links, dark section fills — 13.90:1 on white, so it passes
> every threshold as-is). The brand's status chips publish their own hues
> (teal `#00a49a` completed, amber `#ffc82c` requested, bright blue `#2c32ff`
> in-progress, grey `#bbbbbb` pending) and the brand **does publish red**:
> the keyword `red` (`#ff0000`, 4.00:1 on white — fails 4.5:1) is carried by
> brand-owned selectors (`.description.error`, `.field-description.error`,
> form error states, and the `.veristar-*` product namespace), so error roles
> derive from it by the stop rule (1 step → `#e60000`, 4.81:1).
> Fields are underline-style (transparent fill, bottom-only 1px grey stroke);
> focus thickens the underline to 2px in `#333333`, and the brand **keeps
> published focus outlines** (`outline:auto` on `textarea`,
> `.advanced-search-field` and the keyboard search-tool state;
> `outline:solid` on `.content-filters`) — so `focus.strategy = "outline"`
> is the measured technique, not the closest carrier.

## Sources

- Bureau Veritas corporate site (primary host) — https://group.bureauveritas.com/ (brand blue, links, buttons, fields, status chips, tag gradients, fonts, overlay)
- Bureau Veritas France site (secondary host) — https://www.bureauveritas.fr/ (byte-identical theme bundle — see host agreement below)
- Brand stylesheets measured (full query URLs in probe notes):
  - `https://cdn1-group.bureauveritas.com/…/css_k6O9Jd6ZYICBEApgndRYsC6Hr7aht-HbCHgzSECE_aI.css` (theme bundle, 1341518 bytes uncompressed)
  - `https://cdn1-www.bureauveritas.fr/…/css_3PCbIBPICuOcy_ldLene0ACw8dc9Jq5HpoZo-dSi1_M.css` (theme bundle, 1341518 bytes, identical)
- `rem` root: `html{font-size:16px}` — 1rem = 16px everywhere below.
- Capture date: **2026-09-25**. The aggregate URLs carry Drupal content
  hashes (`css_k6O9…`, `css_3PCb…`): if the brand republishes, the hashes
  change — a later re-reader must re-derive the bundle URLs from the
  homepage (`https://group.bureauveritas.com/` links the three `css_*`
  files) rather than replaying the query strings above.

## Upstream access

No workaround needed. Bare request, UA-only request and full browser header
set all answer `HTTP 200` on `https://group.bureauveritas.com/` (bare and
UA-only serve ~120KB HTML; the full-header request negotiates compressed
transfer). `https://www.bureauveritas.fr/` answers `HTTP 200` bare (~175KB).
Stylesheets were fetched with `Accept: text/css,*/*;q=0.1` plus the page as
`Referer`; all three bundles answer `HTTP 200` on both hosts.

## Host agreement (Step 0.3)

No divergence. Per-file occurrence counts are identical on both hosts, and
the theme bundles are byte-identical (`cmp` clean):

| Hex | corporate theme bundle | `.fr` theme bundle |
|---|---|---|
| `#00049e` | 75 | 75 |
| `#2c32ff` | 38 | 38 |
| `#00a49a` | 35 | 35 |
| `#ffc82c` | 3 | 3 |
| `#333` | 46 | 46 |
| `#00b0f0` | 36 | 36 |
| `#b6ff4e` | 32 | 32 |

The same selector declares the same value on both hosts (verified:
`.button-filled` is a member of the `background-color:#00049e` and
`color:#fff` rules in both bundles). The corporate host wins by programme
rank; either host would give the same theme.

## Brand region vs third-party blocks (Step 0.5)

The measured file is a Drupal CSS aggregate. It opens with Drupal
`starterkit_theme` messaging (`.messages--status/--warning/--error` with
`#325e1c`, `#77b259`, `#734c00`, `#e09600`, `#a51b00`, `#e62600`) and embeds
vendor widgets: **dropzone.js** (`.dz-*`, `#be2626`, `#a92222`, `#eee`,
`#ddd`, `border-radius:20px`), **Chosen** (`.chosen-*`, 206 mentions),
**jQuery UI** (`.ui-datepicker`, `.ui-state-active`), **Didomi**
(`.didomi-iframe-container`, ~299 mentions) and cookie-banner selectors
(`div#sliding-popup`). Hexes living only in those blocks (`#be2626`,
`#a92222`, `#e62600`, `#a51b00`, `#eee`, `#ddd`, `#666`, `#444`) are never
given brand roles. Didomi/cookie selectors sometimes share a brand rule's
selector list (e.g. the consent button inherits the filled-button fill);
there the *declaration* is brand-owned (`.button-filled` group) and the
value counts as brand. No per-file split was possible (single aggregate),
so the boundary is per-rule: a declaration counts only when at least one
brand-owned selector (site BEM: `.button-*`, `.tag-states`, `.teaser-*`,
`.link-std`, `.breadcrumb`, `.pager`, `form input*`, `.vertical-nav`,
`.page-*`) carries it. The keyword `red` passes this bar: it is carried
by `.description.error` / `.field-description.error` (whose plain variants
carry the measured `text.primary`), by eleven `form *.error` selectors, and
by the `.veristar-*` product namespace (99 `veristar` mentions) — so it
counts as brand-published even though `.messages--error` shares one of its
rules. Every count below is computed on the brand region
alone.

## Colour mapping

| Sentropic role | Bureau Veritas source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus` fill | `.button-filled{background-color:#00049e}` (exact-membership verified; also `ul.links a{color:#00049e}`, `.breadcrumb li a:hover,.breadcrumb li span{color:#00049e}`) | `#00049e` |
| `action.primaryHover` / `blue.80` | derived darker blue (brand hover inverts to white — not encodable, see À confirmer) | `#000385` *(à confirmer)* |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | `.button-filled{color:#fff}` (exact-membership verified), 13.90:1 on the brand blue | `#ffffff` |
| `action.secondary` / `surface.subtle` | `.wysiwyg table tr:nth-child(odd){background-color:#eaeaea}` + `.list-confirm-certificate--head`, `.translation .message-box--content` | `#eaeaea` |
| `action.secondaryHover` | measured pending grey reused (`.tag-states.pending`, `.tabs ul.primary a{color:#bbb}`) | `#bbbbbb` |
| `action.secondaryText` / `buttonSecondary.border` | `.button-action{color:#00049e}` + `.button-action{border-color:#00049e}` | `#00049e` |
| `action.danger` / `feedback.error` / `status.failed` | brand keyword `red` (`#ff0000`, 4.00:1 — fails 4.5:1) carried by `.description.error,.field-description.error`, eleven `form *.error` selectors and `.veristar-*` (see À confirmer for the 1-step chain), 4.81:1 | `#e60000` *(à confirmer)* |
| `text.primary` | `.description,.field-description{color:#333}` (also input focus text) | `#333333` |
| `text.secondary` | brand warm grey (`.border-color-third .paragraph-wysiwyg--content{border-color:#706f6f}` + verbatim fills: `.layer-long-verbatim.color-second` and `.list-little-verbatim.color-second .teaser-little-verbatim` are exact members of `{background-color:#706f6f}`), 5.01:1 | `#706f6f` |
| `text.muted` | **Section-9 routing.** The brand's de-emphasized text grey is `#bbbbbb` (`.comment__time` + `.tag-states.pending{color:#bbb}`) at **1.92:1**, which fails the 4.5:1 running-text floor and the 3:1 line floor alike — it would be the lowest text ratio in the repository. Routed to the brand's other measured text grey, `form input[…]{color:gray}` = `#808080` at **3.95:1**, which keeps the three-step ladder distinct (`#333333` 12.63 → `#706f6f` 5.01 → `#808080` 3.95) instead of collapsing muted into secondary. `#bbbbbb` stays in the raw palette and keeps its non-text roles (`status.pending` chip, `.button.is-disabled` fill, `action.secondaryHover` surface) | `#808080` |
| `text.inverse` | `.button-filled{color:#fff}` + reversed links, 13.90:1 on the brand blue | `#ffffff` |
| `text.link` | `ul.links a{color:#00049e}` (least-scoped general link rule), 13.90:1 | `#00049e` |
| `border.subtle` | `form .form-drop-file-zone{border-color:#eaeaea}` (exact membership), `.vertical-nav` links; page grid lines are drawn the same colour via `background-image:linear-gradient(90deg,#eaeaea 1px,transparent 0)` (gradient technique, not a border) | `#eaeaea` |
| `border.strong` | `.border-color-third .paragraph-wysiwyg--content{border-color:#706f6f}` | `#706f6f` |
| `surface.default` / `surface.raised` / `field.fillBg` | white page (`background-color:#fff` brand content group; inputs transparent over it) | `#ffffff` |
| `surface.inverse` | `.background-color-second .paragraph-wysiwyg--content{background-color:#00049e}` | `#00049e` |
| `surface.overlay` | `.main-menu--overlay` + `.burger-menu--overlay{background:rgba(51,51,51,.7)}`. Nuance: `.main-menu--overlay` also declares `opacity:.7`, so its effective opacity is ≈ 0.49 (0.7 × 0.7); `.burger-menu--overlay` declares no `opacity`, so it paints at the straight 0.7 alpha | `rgb(51 51 51 / 0.7)` |
| `feedback.success` / `status.completed` | `.tag-states.completed,.invoiced,.issued{color:#00a49a}` (3.10:1 — passes 3:1, fails 4.5:1 as text) | `#00a49a` |
| `feedback.warning` / `status.pending` (amber states) | `.tag-states.requested,.submitted{color:#ffc82c}` (1.55:1 — brand chip role) | `#ffc82c` |
| `feedback.info` / `status.processing` | `.tag-states.confirmed,.inprogress,.validated{color:#2c32ff;border-color:#2c32ff}` (6.98:1) | `#2c32ff` |
| `status.pending` | `.tag-states.pending{color:#bbb;border-color:#bbb}` (1.92:1 — brand chip role) | `#bbbbbb` |
| `blue.10` | `.vertical-nav … a.current{background-color:#b9baff}` (current-nav fill) | `#b9baff` |
| `cyan.50` / `data.category3` | tag gradient stop c-3 | `#00b4c4` |
| `cyan.70` / `data.category8` | tag gradient stop c-8 (also completed teal) | `#00a49a` |
| `data.category1` | tag gradient anchor c-1 | `#2c32ff` |
| `data.category2` | tag gradient stop c-2 | `#00b0f0` |
| `data.category4` | tag gradient stop c-4 (also new/top teaser titles) | `#82ca9c` |
| `data.category5` | tag gradient stop c-5 (brand blue) | `#00049e` |
| `data.category6` | tag gradient stop c-6 | `#9185be` |
| `data.category7` | tag gradient stop c-7 | `#b9baff` |
| `field.underlineColor` | `form input[…]{border-color:gray}` (resting field stroke, 3.95:1 as a line) | `#808080` |
| `focus.color` | general control focus rule `form input[…]:focus…{border-color:#333}` (34-selector brand rule, `:focus` selectors from the 23rd on; the only shadow focus, `.site-logo--inner a:focus`, is logo-scoped inset and rejected), 12.63:1 | `#333333` |
| `tag.neutralText` | `.tag-highlighted` (exact member of the 162-selector `{color:#333}` rule) + `.tag-states.cancelled{color:#333}`. `.tag-std` does NOT carry this value — it is an exact member of the 231-selector `{color:#fff}` rule (white on its gradient `:after`) | `#333333` |
| darkest slate | `.product--cta .button-action{color:#000}` + square list markers `{background-color:#000}` | `#000000` |

Contrast ratios (section-9 command): `#00049e` 13.90, `#2c32ff` 6.98,
`#00a49a` 3.10, `#ffc82c` 1.55, `#333333` 12.63, `#706f6f` 5.01, `#bbbbbb`
1.92, `#eaeaea` 1.20, `#808080` 3.95, `#ff0000` 4.00, `#e60000` 4.81 — all on
white; white on `#00049e` 13.90; `#00049e` on `#eaeaea` 11.55.

## À confirmer (derived or no published brand token)

- **Hover blue** (`#000385`) — the brand's real filled-button hover inverts
  to `{background-color:#fff;color:#00049e;border-color:#fff}` (exact
  membership verified for `.button-filled:hover`), which cannot serve as
  `primaryHover` (white text would sit on white). Derived instead by the
  HSL rule: start `#00049e` (13.90), keep H/S, L −0.05, 1 step →
  `#000385` (15.54; white text 15.54). Rounding: nearest, lowercase.
  Used for `action.primaryHover` and `blue.80`.
- **Error red** (`#e60000`, 4.81:1) — the brand publishes the keyword
  `red` (`#ff0000`) in brand-owned rules: `.description.error`,
  `.field-description.error` + form error states `{color:red}` (17
  selectors), the same form selectors `{border-color:red}` (11 selectors),
  and `.messages--error,.veristar-login-menu--title:after,
  .veristar-login-menu>h2:after{background-color:red}` (`.veristar-*` is the
  brand's product namespace). Start `#ff0000` (HSL H=0°, S=100%, L=50%,
  4.00:1 on white — fails 4.5:1); 1 stop-rule step (L 50%→45%) →
  `#e60000`, 4.81:1, first passing hex (step 2 `#cc0000` 5.89 and step 3
  `#b30000` 7.20 also pass but are not first). Rounding: nearest,
  lowercase. Used for `feedback.error`, `action.danger`, `status.failed`.
- **Tabs active label** (`#00049e`) — no brand tab-active colour; Drupal
  tabs read `#bbb` with a grey active fill. Routed to the brand action
  blue; geometry aligned with the reference theme package.
- **Pagination active fill + label** (`#00049e` / `#ffffff`, 13.90:1) —
  pager links read brand blue on hover; the filled active page is routed
  to the brand pair; geometry aligned with the reference package.
- **Badge fill + label** (`#00049e` / `#ffffff`) — no brand badge
  published; geometry aligned with the reference package.
- **Breadcrumb trail / separator** (`#333333` / `#bbbbbb`) — hover and
  current page are brand blue (measured); the plain trail and the
  currentColor separator fall back to measured neutrals; sizes aligned
  with the reference package.
- **Accordion trigger** (`#333333`) — bodies are colour-variant fills but
  no trigger-label colour is published; geometry aligned with the
  reference package.
- **Choice labels / toggle text** (`#333333`) — routed to the default
  text; toggle has no brand source at all.
- **Card border + line-height** (`1px`, `1.5`) — the brand publishes no
  card component at all (no card border, no card line-height; the published
  body line-height is 1.25 everywhere — body, display and label families);
  aligned with the reference theme package's geometry.
- **Card hover** (`#eaeaea`) — no brand card hover published; reuses the
  measured subtle surface.
- **Transition property** (`background-color, border-color, color`) — no
  brand transition shorthand published as a whole (buttons declare
  `transition:border .25s ease-out`, other controls `transition:all .25s
  ease-out`); carried from the measured parts. Duration `250ms` and easing
  `ease-out` are measured.
- **Tabs indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`)
  — the 2px bottom rule on `.tabs ul.primary` is measured, but that markup
  is Drupal local-tasks restyled inside the brand aggregate — the same kind
  of basis as the excluded `.messages` alert default. Kept (the declaration
  is in the brand's own stylesheet) and flagged, so the boundary decision
  is explicit on both sides.
- **Alert** (whole block) — no brand alert accent published (Drupal
  `.messages` excluded as a CMS default, the same basis as the flagged tabs
  indicator above); aligned with the reference theme
  package's geometry. The error *colour* itself is brand-measured (`red` —
  see the error-red row).
- **Shadows** (`shadow.*`: `subtle 0 1px 2px rgb(51 51 51 / 0.10)`,
  `medium 0 4px 12px rgb(51 51 51 / 0.14)`,
  `floating 0 8px 24px rgb(51 51 51 / 0.18)`) — the brand declares
  `box-shadow:none` on buttons and boxes and publishes no elevation scale;
  geometry aligned with the reference theme package, tint re-anchored on the
  brand's own near-black `#333333` (`rgb(51 51 51 / …)`) instead of the
  reference package's anthracite.
- **Motion fast** (`150ms`) — normal/slow/easing measured (`.25s`,
  `.35s`, `ease-out`); no fast step published.
- **Density sm/lg** — partial brand answers only: `.button-action.small`
  and `.button-filled.small` share the fluid small font-size rule capped at
  `1rem`; `.button-filled.x-small` / `.button-action.x-small` publish
  `line-height:1;padding:3px 3px 1px`; `.advanced-search-field.small`
  carries its own font steps. No heights, paddings, gaps or min-widths for
  a full sm/lg geometry (buttons carry `padding:20px` with no height); so
  sm/lg stay aligned with the reference theme package's geometry. Their
  `controlHeight` 2rem/3rem coincide with the Sentropic base.
- **Density md gap/minWidth** (`0.5rem` / `2.5rem`) — height, padding and
  font-size measured; no icon gap or minimum width published.
- **Select gutter** (`selectPaddingRight: 2.5rem`) — the chevron redraw
  follows the prescribed technique in the brand's measured grey (`fill="#333"`
  decoded from the `form select` base64 rule, positioned
  `calc(100% - 12px) 50%`); the gutter width itself is unpublished.
- **Tag lineHeight/minHeight** (`1.5rem`) — radius, padding, size and
  weight measured from `.tag-states`; no line-height published.
- **Categorical lime** (`#b6ff4e`, c-9) — measured ninth gradient stop,
  kept as context; only c-1…c-8 fit the eight data slots.
- **Font fallback stacks** — the six brand faces are measured
  (`@font-face` + usage rules); the exact `Arial, sans-serif` tails are a
  faithful expression of the published stacks.

## Typography

- **Body / fields** (`font.sans`, `typography.field`): **'Source-Sans-RegularPro'** — `form input[…]{font-family:Source-Sans-RegularPro,Arial,sans-serif}` and the fluid body rule. We reference the font *name* only.
- **Display / buttons / headings / controls** (`font.display`, `typography.control`): **'BureauVeritas-ExtBdUltraCond'** — `.h1,.heading-a/b/c`, `form button[…]` and `.button-action` share this uppercase display-face rule (family line-height 1.25), but the later button padding rules (`.button-action`, `.button-filled` exact members, equal specificity, no later reset except `.x-small` at line-height 1) set the effective button line-height to **0.9** — transcribed as `typography.control.lineHeight: "0.9"`. Banner titles use `BureauVeritas-ThinUltraCondensed`, step titles `BureauVeritas-LightUltraExpanded` (same family, noted context).
- **Faces inventoried**: six `@font-face` rules — `BureauVeritas-ExtBdUltraCond`, `BureauVeritas-LightUltraExpanded`, `BureauVeritas-ThinUltraCondensed`, `Source-Sans-RegularPro`, `Source-Sans-BoldPro`, `Source-Sans-LightPro`. `Source-Sans-LightPro` is consumed once (teaser/market descriptions, `.veristar-login-menu` items — `font-weight:300`, line-height 1.25); body/fields use RegularPro, labels BoldPro.
- **Labels** (`typography.label`): **'Source-Sans-BoldPro'** — `form .form-label,form label{font-family:Source-Sans-BoldPro,…}` at the fluid body size. We reference the font *name* only.
- **Monospace** (`font.mono`): system stack — the brand publishes no monospace face (no `mono` in any `font-family` declaration).
- Links: brand blue `#00049e` (`ul.links a`); running-text links underlined at rest and on hover (`.description a`, hover shifts colour to brand blue); signature links (`.link-std`) are uppercase, un-underlined, with a brand-blue arrow `::after` (data-URI SVG fill `#00049e`).

## Signatures anatomiques

- **Fields**: `field.style = "filled-underline"` — transparent fill, bottom-only 1px grey stroke (`border-width:0 0 1px`, `border-color:gray`), square corners, 40px box with 12px padding; focus thickens the underline to 2px in `#333333` with `outline:0` on inputs/selects, while `textarea`, `.advanced-search-field`, `.content-filters` and the keyboard search-tool keep published focus outlines (`outline:auto` / `outline:solid`, each with `border-bottom-width:inherit`). Native `<select>` (`appearance:none`, `background-position:calc(100% - 12px) 50%`) chevron is the brand's own grey (`fill="#333"` decoded from the `form select` base64 rule; inverted `.content-filters select` variant `fill="#fff"`; custom-select caret `.needs-select--inner:after` also grey, `border-color:gray`).
- **Control geometry searched** (evidence for the density path): brand button selectors publish `padding:20px` and font-size `1.563rem` but **no** `height`/`min-height` (greps for `height|min-height|padding` on `.button-filled` return only the padding rules); brand input selectors publish `height:40px` + `padding:12px` (`display:block;width:100%;height:40px;…padding:12px;…border-radius:0`); the custom selects (`.needs-select`, `.simple-sentence-select`) draw their 2px bottom line via `::before/::after`. Hence md transcribed (2.5rem / 0.75rem / 1.25rem at the 16px root), sm/lg carried as reference geometry.
- **Radius**: 0 on controls/inputs (`border-radius:0`), 10px on product surfaces (`.product--picture img`, `.product--cta .button-action`), 100px status pills (`.tag-states`), square gradient tags (`.tag-std`).
- **Focus**: `focus.strategy = "outline"` is the measured technique — the brand publishes focus outlines (`form textarea:focus{outline:auto}`, least-scoped and later than `outline:0` at equal specificity so it wins; `.advanced-search-field…:focus{outline:auto;…}`, `.content-filters…:focus{outline:solid;…}`, keyboard search-tool `outline:auto`). `width: 2px` and `color: #333333` transpose the measured *border* technique (the general control focus rule thickens the underline to 2px `#333`); the published outlines declare neither width nor colour. The only shadow-based focus (`.site-logo--inner a:focus{box-shadow:inset 0 0 0 4px #000}`) is logo-scoped and inset, so `ring` has no basis (trap: least-scoped general control rule wins).
- **Buttons**: primary = solid brand blue `#00049e` with white text → hover **inverts** to white fill + blue text; secondary (`.button-action`) = transparent fill, 2px blue border + blue text, hover clears the border; cancel = `#bbb` text + border; class-disabled buttons read `.button.is-disabled{opacity:.5;cursor:default}` while natively `:disabled` submit controls read `opacity:.7!important` with `pointer-events:none!important`. Labels uppercase condensed at 1.563rem, effective line-height 0.9 (see Typography).
- **Tabs / top-nav**: `.tabs ul.primary` draws a bottom 2px rule (`indicatorSide: "bottom"`, `indicatorMode: "border"`); links read `#bbb`.
- **Pagination**: `.pager` uses 5px radius; links read brand blue on hover; active page routed to the brand fill.
- **Status chips**: `.tag-states` are 100px bordered pills (10px bold labels): pending `#bbb`, requested/submitted `#ffc82c`, completed `#00a49a`, confirmed/in-progress `#2c32ff`.
- **Overlay**: dark-menu scrims in `rgba(51,51,51,.7)` (`.main-menu--overlay`, `.burger-menu--overlay`); video scrims in `#333` at 50%.

## Asset officiel

- Bureau Veritas logo = the "Shaping a World of Trust" wordmark/symbol set. Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package references only font *names* and public colour values, never logo artwork or font binaries.
