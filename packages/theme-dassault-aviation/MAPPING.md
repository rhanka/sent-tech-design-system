# Dassault Aviation → Sentropic mapping

This package maps the **public** Dassault Aviation corporate design onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**: the
steel-blue token family (`:root{--color:#324b6b;...}`), the squared chrome,
the black running text and every feedback hue below are measured from the
brand's own compiled theme stylesheet; only public values and font *names*
are referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured facts: (1) Dassault links are **black** (`a{color:#000}`) at
> rest *and* on hover — the **underline** on hover (plus Dassault blue inside
> editorial content) is what makes a link, not a colour. (2) The brand colour
> is a **token family**, not a hex: `:root --color:#324b6b` re-scoped per
> business line (`.tax__color-defense/civil/espace/passion`), consumed through
> 169 `var(--color)` references. (3) The chrome is **squared** — 16 measured
> `border-radius:0` on buttons, inputs, selects, cards, modals and tabs.

Line numbers below are expanded lines of `app.2f218802.min.css`
(`sed 's/}/}\n/g'`, 2576 rules). Counts follow the stated convention: brand
region only (rules 62-1451 + 1584-2576, see Step 0.5), lowercased, one
occurrence = one declaration containing the hex; `#fff` and `#ffffff` are one
colour (the brand writes the short form exclusively — 162 vs 0 — transcribed
as `#ffffff`); no 8-digit alpha form exists in the sheet; `rgb()/rgba()` are
censused separately; `%23`-encoded hexes inside data-URIs (SVG artwork, e.g.
`%23324b6b` x22, `%23fff` x12, `%23000` x3) are excluded from literal counts.

## Upstream access

The live host `https://www.dassault-aviation.com/` sits behind an
Imperva/Incapsula bot challenge: bare curl, browser-UA-only and the full
browser header set (UA, Accept, Accept-Language, compressed encoding, Referer,
Sec-Fetch-*, Upgrade-Insecure-Requests) each return HTTP 200 with the ~957
byte challenge page (`/_Incapsula_Resource?...`, `incapsula` present) — three
repetitions of each form, 2026-09-25. The apex domain 301-redirects to `www`;
a cookie-jar replay does not pass the challenge (no JS execution available).
Per the review protocol (§12), measurement falls back to dated archived copies
of the brand's own pages below; the original-URL citation is kept and marked
`unverified, 2026-09-25, HTTP 200-challenge`.

## Sources

- Dassault Aviation homepage (EN, links the measured stylesheet family) —
  `https://www.dassault-aviation.com/en/` via Wayback capture 20250907234616
  (`<title>Dassault Aviation, a major player to aeronautics</title>`).
- Compiled theme CSS (measured) — `.../wp-content/themes/dassault-aviation-2021/dist/app.2f218802.min.css`
  via Wayback capture 20250723231844 (395 241 bytes, 0 `incapsula`). The exact
  build linked by the September page (`app.077f2c16.min.css`) is listed in CDX
  but its WARC is unserved (404); the July build is the closest served
  antecedent of the same theme.
- Stability corroboration (same values, see §Step 0.3) —
  `app.1b047e7d.min.css` (capture 20251130070705, 399 061 bytes) and
  `app.87ae9e4d.min.css` (capture 20240828190048, 422 072 bytes; the build
  linked by the FR homepage capture 20250122134748).
- No public tokenised design system is published by the brand; no aggregator
  value is used as an origin.

## Step 0.5 — brand region vs vendor blocks

- Vendor A, `normalize-scss` (bannered): expanded rules 1-42
  (`/*! normalize-scss | MIT/GPLv2 License | bit.ly/normalize-scss */`
  through `[hidden],template{display:none}`), bare element selectors.
- Vendor B, `slick-carousel` (de-bannered): rules 43-61, a contiguous run of
  namespace-free `.slick-*` rules (first
  `.slick-slider{box-sizing:border-box;-webkit-touch-callout:none;...}`, last
  `.slick-arrow.slick-hidden{display:none}`). Note: `.slick-list:focus{outline:0}`
  here is the vendor's, not the brand's.
- Vendor C, `leaflet` + `markercluster` (de-bannered): rules 1452-1583, a
  contiguous run of `.leaflet-*`/`.marker-cluster*` rules (first
  `.leaflet-image-layer,...`, last `.marker-cluster span{line-height:1.875rem}`).
  It carries lookalike hexes that are NOT brand colours and are never promoted:
  `#b5e28c #6ecc39 #f1d357 #f0c20c #fd9c73 #f18017 #0078a8 #ddd`, plus green/
  yellow cluster `rgba()/hsla()` fills. Its `#333` (x3) is counted separately
  from the brand's own `#333` (x9, thead/placeholder).
- Brand region: rules 62-1451 + 1584-2576 (2383 rules) — keyframes, `:root`
  tokens, `.tax__color-*`, `@font-face`, the whole theme, and brand-authored
  overrides of slick/Gravity-Forms/FacetWP/Flow-Flow/cookie-law/wcc selectors
  (these name site components or paint brand tokens, e.g.
  `.entry .slick-arrow{...background-color:var(--color)}`,
  `.gfield a:focus{outline-color:var(--color)}`).
- Flow-Flow social colours (`.ff-twitter a{color:#1e72aa}`,
  `.ff-facebook a{color:#3b5998}`, `.ff-instagram,.ff-youtube{color:#d02a3a}`,
  rules 1381-1383) are platform-imposed stock, excluded like any vendor default.
- Step 0.2: no `font-size` on `html` or `:root` in any of the three sheets
  (298/300/298 `font-size` declarations, none on the root) — the root is the
  16px user-agent default, so rem values transcribe 1:1.
- Step 0.3: the three sheets agree exactly — identical `:root`, identical
  `.tax__color-passion`, identical `body`, `.btn--primary`,
  `.message--success`, `.modal` (only line numbers shift). No host/page
  disagreement; the July 2025 (EN) sheet is primary.

## Colour mapping

| Sentropic role | Dassault Aviation source | Value |
|---|---|---|
| `action.primary` / `tabs.activeText` / `choice.labelColor` / `toggle.textColor` / `border.interactive` / `focus.color` | `--color` (`:root`, rule 74) | `#324b6b` (169 var + 204 lit) |
| `action.primaryHover` | `--color-dark` (`:root`) + `.btn--primary:hover` (rule 231) | `#273a52` (43 var + 52 lit) |
| `data.category8` / cyan accent | `--color-light` (`:root`) + footer/social/h6 (rules 415-429, 489) | `#415d80` (13 var + 15 lit) |
| `blue.10` / `cyan.10` (palest family step) | `--color-light-alt` (`:root`) + hero/sheet decorations (527-528, 1161-1162) | `#929fb0` (3 var + 5 lit) |
| `cyan.70` | `--color-dark-alt` (`:root`) + decorations (527, 1162, 1809) | `#596d87` (3 var + 5 lit) |
| `data.category5` | `.tax__color-defense --color` (rule 76) | `#4c5133` (re-scoped var only + 1 decl) |
| `data.category2` | `.tax__color-civil --color` (rule 77) + map fills (1331, 1353) | `#218737` (re-scoped var + 3 lit) |
| `data.category4` | `.tax__color-espace --color` (rule 78) + map fills (1333, 1355) | `#b05f03` (re-scoped var + 3 lit) |
| `data.category3` | `.tax__color-passion --color` (rule 79) + map fills (1332, 1354) | `#d51a36` (re-scoped var + 3 lit) |
| business-line dark/light steps (raw palette, no role) | `.tax__color-defense` (76): `--color-dark` / `--color-light` | `#43472c` / `#757648` (1 decl each) |
| business-line dark/light steps (raw palette, no role) | `.tax__color-civil` (77): `--color-dark` / `--color-light` (+ `--color-dark-alt` twin) | `#1c752f` (1 decl) / `#319a48` (2 decls) |
| business-line dark/light steps (raw palette, no role) | `.tax__color-espace` (78): `--color-dark` / `--color-light` (+ `-alt` twins) | `#a65b06` / `#c77211` (2 decls each) |
| business-line dark/light steps (raw palette, no role) | `.tax__color-passion` (79): `--color-dark` / `--color-light` | `#be1e36` / `#e32c47` (1 decl each) |
| `surface.default` / `surface.raised` / `field.fillBg` / `text.inverse` / `action.primaryText` | `body{background-color:#fff}` (rule 195), `.btn--primary{color:#fff}` (229), `.modal__inner` (738) | `#ffffff` (162 `#fff` lit, 0 `#ffffff`) |
| `surface.subtle` / `tag.neutralBackground` | `.entry__section--lightgray` (451), `.card--related` (653), checkbox fill (155) | `#f3f4f5` (38 lit) |
| `action.secondary` / `border.subtle` | `input{border:.0625rem solid #e8e9ed}` (138), `select` (146), menu/pagination/toggle fills | `#e8e9ed` (88 lit) |
| `action.secondaryHover` | `.form__radio:hover{background-color:#d1d2d5}` (323), checkbox border (155) | `#d1d2d5` (24 lit) |
| `breadcrumb.separator` | breadcrumb chevron (rule 828), card filet (653), hr (297) | `#a8adb4` (17 lit) |
| `text.muted` / `border.strong` / `buttonSecondary.border` | meta/time/copyright text (111, 306, 811, 1676), `.btn--outline` (247), input hover (142) | `#616a74` (24 lit, 5.49:1) |
| `text.secondary` / `pagination.text` | menu dropdown (2475), pagination (878), form labels (311), descriptions | `#414b56` (27 lit, 8.88:1) |
| table thead / placeholder (documented, no slot) | thead (115, 121), `::placeholder{color:#333}` (139-141) | `#333333` (9 lit brand + 3 vendor) |
| `text.primary` / `text.link` / `action.secondaryText` / `breadcrumb.linkText` | `body{color:#000}` (195), `a{color:#000}` (93-94), `.btn--outline{color:#000}` (247) | `#000000` (47 lit, 21.00:1) |
| `surface.inverse` / `data.category6` / `tag.neutralText` / select chevron | `h1-h4{color:#161c25}` (96, 99), footer menu/bottom-links (434, 1665), tooltip (384), select data-URI (146) | `#161c25` (40 lit, 17.12:1) |
| darkest slate step | `.footer__bottom{background-color:#10141a}` (431) | `#10141a` (3 lit) |
| `action.danger` / `feedback.error` / `status.failed` | `.message--error` (291) + `.btn--error` (234) | `#bd1919` (10 lit, 6.33:1) |
| error fill (documented, no slot) | `.message--error{background:#fbe3e4}` (291) | `#fbe3e4` (4 lit) |
| `feedback.warning` / `status.pending` | `.message--notice` (292) + `.btn--warning` (236) | `#514721` (5 lit, 9.24:1) |
| warning fill (documented, no slot) | `.message--notice{background:#fff6bf}` (292) | `#fff6bf` (4 lit) |
| `feedback.success` / `status.completed` | `.message--success` (293) + `.btn--success` (238) | `#264409` (5 lit, 10.98:1) |
| success fill (documented, no slot) | `.message--success{background:#e6efc2}` (293) | `#e6efc2` (4 lit) |
| `feedback.info` / `status.processing` | `.message--info` (294) + `.btn--info` (240) | `#205791` (5 lit, 7.41:1) |
| info fill (documented, no slot) | `.message--info{background:#d5edf8}` (294) | `#d5edf8` (4 lit) |
| `surface.overlay` | `.modal{background-color:rgba(0,0,0,.75)}` (737) | `rgb(0 0 0 / 0.75)` |
| `data.category7` | muted grey (shared with `text.muted`) | `#616a74` (see above) |
| `data.category1` | Dassault blue (shared with `action.primary`) | `#324b6b` (see above) |

Notes: (1) the four business-line base colours are operative through
re-scoping — under `.tax__color-*` the 169 `var(--color)` calls paint the line
colour — plus literal map fills for civil/espace/passion; defense has no
literal outside its declaration (rule 76) and is painted by re-scoping alone.
(1b) the eight dark/light steps above are declaration-only (no other literal
anywhere in the brand region); their `var()` consumption flows through the
shared `--color-light`/`--color-dark` names (13/43 refs, + 3/3 `-alt`), which
is unattributable per line — documented gap, nil impact (no role).
(2) `var(--color--dark)` (rule 2461) is a source typo resolving to nothing
(no such property declared); it carries no value. (3) `text.muted` at 5.49:1
and `text.secondary` at 8.88:1 both clear 4.5:1, so no sub-floor arbitration
applies; both ratios were second-checked by ordinal comparison against the
§9 `#767676` = 4.54 bound (all three channels darker ⇒ ratio above 4.54), a
method sharing no arithmetic with the WCAG computation, which itself was
calibrated on the §9 `#1e7e34` = 5.14 case. (4) `#929fb0` at 2.69:1 is never a
text or line role (decorations only).

## À confirmer (derived or no published brand token)

- **Categorical `data.*` palette** — the eight members are measured hues, but
  the brand publishes no 8-colour scale, so the assembly is a coherent
  proposal (`#324b6b`, `#218737`, `#d51a36`, `#b05f03`, `#4c5133`, `#161c25`,
  `#616a74`, `#415d80`).
- **`tag.*` and `badge.*`** — no tag/chip/badge component is published (grep
  over `tag/chip/badge` returns nothing); squared stand-ins from the
  card/meta/primary-button vocabulary (`radius 0`, `#f3f4f5`/`#161c25`,
  `#324b6b`/`#ffffff`, meta `0.875rem/700/1.25rem`, paddings, `1.5rem`
  min-heights).
- **`card.hoverBackground`** (`#ffffff`) — cards carry filets but no generic
  hover fill is published.
- **`search.*`** (`.9375rem`/`1.25rem`/`1.25rem`/`1.875rem`) — the generic
  boxed input metrics, because the three published search-field variants
  disagree with each other: white boxed with `padding-right:3rem` (rule 543),
  transparent borderless with `1.25rem`/`6.4375rem` pads (rule 2066, same
  selector, later wins), and the toolbox input with `padding-right:5rem` and
  `height:4.375rem` (rule 2425). No single search value exists.
- **`radius.pill`** (`999px`) — site pills vary by component (`50%`, `2rem`,
  `3.125rem`, `99rem`); no single pill value exists.
- **`shadow.medium` / `shadow.floating`** — only the header/dropdown shadow is
  published; these two reuse the Sentropic base.
- **`spacing.*`, `z.*`, `density.*`** — no tokenised scale, no brand z roles,
  and pad-driven generic controls with no `height`/`min-height` on the generic
  `.btn`/input/select rules (measured paddings: `.btn 1.3125rem 1.875rem`,
  inputs `.9375rem 1.25rem`, selects `1.125rem ... 1.25rem`). The declared
  heights are scoped, not generic, and excluded by scope (§8): the toolbox
  search input (`height:4.375rem`, rule 2425), the visually-hidden pattern
  (`height:.0625rem`, rules 153/164/320) and the custom checkbox/radio boxes
  (rules 155/156/166/167) — all reuse the Sentropic base.
- **`iconSize.md` / `iconSize.lg`** (`1.125rem`/`1.25rem`) — only the `1rem`
  `.icon` base is published; ad-hoc component sizes exist but form no scale.
- **`SantEliaScript`** — measured `@font-face` (400/700) and measured accent
  usage (passion-line hero/headband `strong`, rules 513/1069), but there is no
  accent slot in `foundation.font`; documented, not wired.
- **Pastel feedback fills** (`#fbe3e4`, `#fff6bf`, `#e6efc2`, `#d5edf8`) and
  alert hover tints (`#f5b6b9`, `#ffef8c`, `#d5e49a`, `#a9daf1`), error hover
  `#901313`, outline hovers `#4a5158`/`#223348`, table zebra `#f0f0f0`/`#f8f8f8`,
  dots `#c4c4c4` — measured, no Sentropic slot, documented here.
- **`code` radius `.1875rem`** (rules 128/133, also tables and `.btn--round`) —
  measured, no Sentropic slot for code geometry.

## Typography

- **Body / headings / controls / fields / labels / display** (`font.sans`,
  `font.display`, `typography.control/field/label`): **'DassaultAviationSans',
  sans-serif** — `@font-face` 300/400/700 + italics and 900 (rules 80-86);
  `body` (195), `h1-h4` (96, 99), `.btn` inherits, inputs (138), tabs (784).
  We reference the font *name* only.
- **Script accent**: **SantEliaScript** — `@font-face` 400/700 (rules 87-88),
  used on passion-line hero/headband title accents (rules 513, 1069). Name
  only; not wired (no slot — see À confirmer).
- **Monospace** (`font.mono`): **`monospace`** — the literal
  `code{font-family:monospace}` (rule 128) and `kbd,samp,tt` (rule 132).
- Links: black `#000000`, not underlined at rest, underlined on hover
  (rules 93-94); Dassault blue `#324b6b` on hover inside editorial content
  (rule 497).
- Buttons: uppercase 700, `.875rem/1rem`, `1px` tracking (rule 219). Fields:
  `1.25rem/1.875rem` (last of the `1.5`/`1.875rem` pair, rule 138). Labels:
  `.875rem` 400 with no `line-height` declared (rule 145 — inherits body
  `1.4`, rule 195); floating variant `.75rem` `#414b56` (rule 311).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill,
  1px `#e8e9ed` border, squared corners, rule 138; hover/focus border `#616a74`,
  rule 142; error border `#bd1919` with icon, hover `#901313`, rules 143-144).
  Native `<select>` chevron redrawn in ink `#161C25` with a `3.75rem` gutter
  (rule 146, data-URI transcribed verbatim).
- **Radius**: SQUARED — `0` on controls, inputs, selects, cards, modals, tabs
  (16 measured `border-radius:0`); `.1875rem` on code/pre/tables/`.btn--round`
  only.
- **Focus**: keyboard-only **outline**, `.125rem` (2px) solid with `.5rem`
  (8px) offset (rule 209, `currentColor`; `#324b6b` wherever a colour is named:
  rules 210, 244, 319, 349, 843, 1386, 1408, 2440, 2462, 2476...);
  `focus.strategy = "outline"`. Non-keyboard focus draws nothing (rule 216);
  the select draws a local ring instead (rule 150).
- **Buttons**: primary = solid Dassault blue `#324b6b` with **white** text
  (8.92:1) → hover/focus `#273a52` (rules 229, 231); secondary = **outlined**
  in muted grey `#616a74` with black text and transparent hover (rules 247-248);
  disabled = `opacity:.3` (rule 265).
- **Tabs / top-nav**: active tab = Dassault blue `#324b6b` label with a bottom
  filet indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`,
  rules 353-355 / 784-788); uppercase 700 `1rem/1.25rem` labels with
  `1.6875rem 2rem` padding (rule 784 — last of each doubled declaration wins).
- **Pagination**: borderless link-style pages in `#414b56` (`1.125rem/1.375rem`,
  `0 .3125rem` padding), current page bold `#324b6b` (rules 878-880); square
  `3rem` prev/next boxes in `#e8e9ed` with blue chevrons turning white on blue
  hover (rules 867-875). A second, circular system skins the wp-pagenavi plugin
  (rules 1617-1624: active page filled `#324b6b` with white text, corroborating
  the primary pair).
- **Cards**: no peripheral border; related/subpage = `#f3f4f5` with a `.125rem`
  `#a8adb4` bottom filet (653-655), job = `#e8e9ed` with a `.125rem` `#324b6b`
  filet (644); image overlay = Dassault blue at `.8` on hover (736; base
  734, also 631/683), plane overlay = `rgba(50,75,107,.9)` (701).
- **Alerts**: 5px left filet on an unfilled box, `2rem` padding (rule 288);
  per-severity pastel fills + text hues (rules 291-294).
- **Accordion**: white trigger, `.125rem` `#e8e9ed` bottom rule, ink 700 label,
  turning solid `#324b6b`/white on hover (839-845); `+` icon `#414B56` → `#fff`.
- **Toggle**: `#e8e9ed` pill track (`.25rem` inset) with `#414b56` knob, blue
  track + white knob when checked, blue uppercase label (375-382).
- **Checkbox/radio**: `#f3f4f5` fill + `#d1d2d5` border at rest, solid `#324b6b`
  with white tick when checked, blue semibold label (154-158, 165-166).
- **Modal**: `rgba(0,0,0,.75)` backdrop (737), white `37.5rem` inner (738).
- **Header/footer**: white sticky header (transparent on home, shadowed white
  on scroll, 388/2359); footer in Dassault blue with `#161c25` menu zone and
  `#10141a` bottom bar (408, 434, 1665, 431).
- **Motion**: `.2s`/`.3s` `ease` transitions (52/29 declarations — the 29 `.3s`
  declarations sit in 28 rules, rule 1369 `.ff-loadmore-wrapper .ff-btn`
  carrying two of them; one occurrence = one declaration, so the cascade winner
  is not what is counted), `.5s`
  slow (9 declarations; durations counted by value — `1.3s`/`2.3s` are not
  `.3s` — SVG path-data bytes excluded, rule 959),
  `cubic-bezier(.25,1,.5,1)` arrow signature (x25), `animate-arrow-*` keyframes
  (rules 62-73); elevation shadow `0 0 .3125rem .0625rem rgba(0,0,0,.1)` (rules
  831, 2306, 2359).

## Asset officiel

- Dassault Aviation identity = the "DA" monogram / Mirage-delta emblem with the
  **"DASSAULT AVIATION"** wordmark and *"Higher Together"* signature. Use the
  official SVG/PNG from the brand assets — **do not redraw the logo by hand**.
  This package references only font *names* and public colour values, never
  logo artwork or font binaries.
