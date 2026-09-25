# Eiffage → Sentropic mapping

This package maps the **public eiffage.com stylesheet** onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: the Eiffage
action red, the black/slate/grey text scale, the footer dark and the light
greys are read from the brand's own CSS rules; only public values and font
*names* are referenced — no font binaries. Derived/unmeasured values are
flagged `à confirmer`.

> Key measured fact: Eiffage's red `#eb0000` already clears WCAG AA as a fill
> carrying white text (4.63:1) — exactly how the brand uses it (`.main
> .btn-bg`: red fill, white label) — so `action.primary` keeps the brand red
> with a white `primaryText`, while every *text/line* interactive role that
> the brand draws in slate (`text.link`, and the link/tabs/pagination text)
> stays on the readable dark slate `#333745` (11.84:1).

## Sources

- Eiffage homepage (origin) — `https://www.eiffage.com/` (all values below;
  fetched 2026-09-25, HTTP 200 on the bare request)
- Eiffage screen stylesheet — `https://www.eiffage.com/generated-resources/a352be2ff41ef596c491281929c72ce.min.css?1789571816562`
  (the brand bundle: keyframes + brand components + embedded vendor blocks)
- Eiffage font sheet — `https://www.eiffage.com/modules/EIFFAGEUXDesignTemplates/css/fonts.css`
  (Montserrat `@font-face` set — the brand face)
- `https://www.eiffage.fr/` — 301-redirects to `https://www.eiffage.com/`
  serving the **same** stylesheets (no divergence; see "Hosts" below)

## Vendor boundary (Step 0.5)

The bundle is mostly the brand (BEM components: `.btn-bg`, `.tg-link`,
`.contact .form__*`, `.footer-block`, `.tabs`, `.sup-header`, …), but it
embeds third-party blocks whose hexes were **excluded before counting**:

- `.mCS*` (malihu custom scrollbar — owns ALL `border-radius: 2px` ×6 and
  `16px` ×6) · `.tns-*` (tiny-slider — owns `#f00`, `.tns-nav button`
  `border-radius: 0`) · `.os-*` (OverlayScrollbars — owns
  `border-radius: 0`) · `.c3-*` (C3.js charts — owns `#4682b4` in
  `.c3-region`) · keyframes/m-scrollbar resets at the head of the file.
- Marker counts in the brand region: `tealium/oneTrust/didomi/swiper/slick/
  bootstrap` = 0 occurrences each; no consent-banner block exists in this
  bundle, so no consent hex could leak in.
- No positional boundary exists in this file: vendor blocks are
  **interleaved** with brand rules (`.c3-*` at lines 1579–19391, `.os-*` at
  1739–2235, `.tns-*` at 11964–17885, `.mCS*` from 18716 into a
  min-width-1024px media query), so exclusions below are by **selector
  namespace**, not by line range. Every count below is computed on
  brand-namespaced rules only; per-file counts are given because the brand
  serves a single bundle.

Excluded although frequent-looking: `#007dbd` (4× across
`.contact .form-files__label*` rules + `.edito-full-picture .media.blue` at
line 15364 — scoped accents, not a site value), `#ff0000` (pure red, 4× in
`.alert-bg-white .alert-content-text` + `.description--nav` —
a developer-default-looking one-off, kept as context only), `#f00` (2×:
vendor `.tns-controls button:hover path{fill:#f00}` at 17789 + brand
`.events .liste-complete-item__event a:hover …` at 23656 — a hover
one-off, not a site value), `#008a09` (2×) / `#fed100` (5×) / `#6d6f72`
(5×) (`.edito-focus.*` editorial variants + `.edito-full-picture .media.*`
swatches + career-header `.btn-bg` recolour for `#fed100`; three of the
`#6d6f72` live in `.safety__*` rules and one in a vendor `.mCS*` rule —
none is a site-wide value), `acumin-pro` (1 rule, `.breadcrumb__nav`,
against 152 Montserrat declarations — legacy exception, not the site face),
`Avenir-Black` (4 rules, all scoped to `.safety__*` — legacy exception).

## Hosts (Step 0.3)

`eiffage.com` and `eiffage.fr` do **not** disagree: `eiffage.fr` answers
`301 → https://www.eiffage.com/`, and the redirected page links the same two
bundle URLs (`8971d73a…min.css` print, `a352be2f…min.css` screen). Single
host, no tie-break needed — `eiffage.com` wins as the canonical source.

## `rem` root (Step 0.2)

`html { font-size: 18px; }` (lines 204–206; no `font-size` redefinition in
any media query, none on `body` or `:root`) — the brand root is **18px**,
not 16px. Every brand `rem` below is converted (×18 ÷ 16). `px` values pass
through. Full replayed inventory:

- `.contact .form__input--*` (rule at lines 3013–3025)
  `font-size: 0.833333333333333rem` (line 3023) × 18 = 15px → shipped
  `typography.field.size = 0.9375rem` (15 ÷ 16).
- Same rule `line-height: 0.888888888888889rem` (line 3024) × 18 = 16px →
  16 ÷ 15 = 1.0667 → shipped `typography.field.lineHeight = 1.07`.
- `.tg-link` (lines 1337–1346) `font-size: 1rem` × 18 = 18px → shipped
  `typography.control.size = 1.125rem` (18 ÷ 16).
- Same rule `line-height: 1em` = 18px on an 18px font → ratio 1.0 →
  shipped `typography.control.lineHeight = 1`.
- `.main .btn-bg` `padding: 11.5px 6.6%`: the **block** 11.5px IS
  transcribed (`density.*.paddingBlock = 0.71875rem`, 11.5 ÷ 16 — seven
  declarations across five contexts, see Signatures); the **inline** `%`
  is fluid and has no fixed-`rem` equivalent (not transcribed);
  `.tabs label` `padding: 0.8em 0.5em` (em, not transcribed); the
  max-width-767px override `font-size: 0.777777777777778rem` (line 3030,
  = 14px, mobile breakpoint — the shipped field value follows the base
  rule).

## Colour mapping

| Sentropic role | Eiffage source | Value |
|---|---|---|
| `action.primary` (button fill) | `.main .btn-bg{background-color:#eb0000}` | `#eb0000` |
| `action.primaryText` (text on red) | `.main .btn-bg{color:#fff}` (4.63:1) | `#ffffff` |
| `action.primaryHover` | derived darker red (brand hover inverts — no darker red published) | `#bf0000` *(à confirmer)* |
| `surface.default` / `surface.raised` | `body{background-color:#fff}` | `#ffffff` |
| `text.primary` | `body{color:#000}` | `#000000` |
| `surface.inverse` | `.footer-block{background-color:#333}` (line 7669; dark footer, white text — tie-break recorded below) | `#333333` |
| `text.inverse` | `.footer-block{color:#fff}` + `.main .btn-bg{color:#fff}` | `#ffffff` |
| `text.secondary` | `.title{color:#333745}` + `.tg-link{color:#333745}` (`color:` ×77, 11.84:1) | `#333745` |
| `text.muted` | meta grey (`color: #757575` ×53 as the `color` property, 4.61:1) | `#757575` |
| `text.link` | `.tg-link{color:#333745}` (rest; hover recolours to `#eb0000`) | `#333745` |
| `border.subtle` | hairline grey (`.stock .table--current-day__row`, popin-press inputs) | `#dedede` |
| `border.strong` | `.contact .form__input--*{border-bottom/border-right:2px solid #757575}` | `#757575` |
| `border.interactive` / `focus.color` | brand red (scoped focus rules `.nav button:focus{color:#eb0000}`, `.menu__search .search__input:focus{caret-color:#eb0000}`; 4.63:1 clears 3:1) | `#eb0000` |
| `surface.subtle` / `action.secondary` | `.news-filters`, `.liste-complete__filters-tags`, `.liste-carrieres__filters-tags{background:#eee}` | `#eeeeee` |
| `action.secondaryHover` | hairline grey as deeper neutral | `#dedede` |
| `action.secondaryText` | `#333745` on `#eeeeee` (10.21:1) | `#333745` |
| `action.danger` / `feedback.error` | derived red (AA on white) | `#b3261e` *(à confirmer)* |
| `feedback.success` | derived green (AA on white) | `#1e7e34` *(à confirmer)* |
| `feedback.warning` | derived amber (AA on white) | `#8a5a00` *(à confirmer)* |
| `feedback.info` | derived blue (AA on white) | `#0b5fa5` *(à confirmer)* |
| `surface.overlay` | `.popin-intro__bkg{background:rgba(255,255,255,0.4)}` (brand modal veil) | `rgb(255 255 255 / 0.4)` |
| `status.pending` / `processing` / `completed` / `failed` | derived (follow feedback) | `warning/info/success/error` *(à confirmer)* |
| `data.category1..8` | brand-led categorical proposal (no brand scale published) | red/slate/derived hues *(à confirmer)* |
| `slate.90` darkest | `.contact .form__input--*{color:#111}` (form near-black) | `#111111` |

Tie-break recorded: `#333` occurs exactly once in the whole bundle (line
7669, `.footer-block`), while `#333745` carries six `background`/`background-color`
declarations (lines 7199, 7261, 7588, 10877, 11590, 17834) — a pure
frequency contest would elect `#333745`. `surface.inverse` keeps `#333`
because it is the large dark footer surface carrying white text (`.footer-block`),
whereas the `#333745` fills are small component accents; the slate stays
available as `slate.80` for text roles.

## À confirmer (derived or no published brand token)

- **Hover red `#bf0000`** — the brand hover (`.main .btn-bg:hover`) inverts
  to white/black instead of darkening, so no darker red is published; this is
  a coherent darker stand-in (white text on it = 6.53:1).
- **System/feedback hues** `success #1e7e34` (5.14:1), `warning #8a5a00`
  (5.93:1), `error #b3261e` (6.54:1), `info #0b5fa5` (6.57:1) — the brand
  publishes no UI feedback palette in its own rules (the pure `#ff0000`
  alert one-off fails AA as text at 4.00:1 and the `.edito-focus.*` greens
  are single-rule editorial variants); all four clear AA on white at step 0,
  so no stop-rule walk was needed (0 steps each — see chains below).
- **`status.*`** — follow the derived feedback hues.
- **The 8-colour categorical `data.*`** — a red-led proposal over the
  measured neutrals plus the derived system hues, not an official scale.
- **`density`** (`paddingInline`, `gap`, `minWidth`, `fontSize` per size),
  **`shadow.medium/floating`**, **`motion.easing`**, **`disabledOpacity`**,
  **`transition`**, **`typography.label` size/weight**, **link hover
  underline**, **`field.selectPaddingRight`** (2.5rem gutter) and **all 12
  component-override metrics** — the brand publishes no usable general
  *inline* control geometry (button inline is fluid; the field right side is
  undeclared — see evidence below); only `controlHeight`/`iconSize` match
  the Sentropic base, the rest is aligned with the reference theme
  package's geometry. (`density.*.paddingBlock = 0.71875rem` IS measured —
  the repeated 11.5px brand block padding — as are `typography.control`
  size/lineHeight from `.tg-link`, see the `rem`-root inventory — not
  derived.)
- **Shadow tints** `rgb(51 55 69 / 0.10)`, `rgb(51 55 69 / 0.14)`,
  `rgb(51 55 69 / 0.18)` — the `#333745` slate at low alpha; no shadow scale
  is published by the brand.
- **`focus` technique** (`strategy: "outline"`, `width 2px`, `offset 2px`) —
  no site-wide focus technique is published (see evidence below); the colour
  `#eb0000` is measured (scoped rules cited above).
- **`radius.sm/md/lg/pill`** — no general brand radius is published (vendor
  `0` in `.os-*`/`.tns-nav`/`.mCS*`, scattered brand `4px`); reference-aligned.

## Stop-rule chains (rounding: nearest lowercase hex per step)

No chain walked: every derived text/line role already passes at step 0.

- `feedback.success` start `#1e7e34` = 5.14:1 on white (≥ 4.5) → kept, 0 steps.
- `feedback.warning` start `#8a5a00` = 5.93:1 on white (≥ 4.5) → kept, 0 steps.
- `feedback.error` start `#b3261e` = 6.54:1 on white (≥ 4.5) → kept, 0 steps.
- `feedback.info` start `#0b5fa5` = 6.57:1 on white (≥ 4.5) → kept, 0 steps.
- `action.primaryHover #bf0000` — not a threshold fix (hover has no floor;
  white text on it = 6.53:1); coherent darker stand-in, recorded as 0-step.
- Measured roles that needed no derivation: `#eb0000` on white = 4.63:1
  (action/focus/interactive), `#333745` = 11.84:1 (link/secondary),
  `#757575` = 4.61:1 (muted), `#ffffff` on `#eb0000` = 4.63:1
  (primaryText), `#333745` on `#eeeeee` = 10.21:1 (secondaryText).

## Typography

- **Controls / body / fields** (`font.sans`,
  `typography.control/field`): **`'Montserrat', sans-serif`** — 152
  `font-family: 'Montserrat', sans-serif` declarations across brand
  components; the `fonts.css` sheet ships 20 `@font-face` rules (18
  Montserrat + 2 DM Serif Text). We reference the font *name* only.
  `typography.control` size/lineHeight are measured from `.tg-link`
  (lines 1337–1346: `font-size: 1rem` at 18px → `1.125rem`;
  `line-height: 1em` → `1` — see the `rem`-root inventory).
- **Labels** (`typography.label` size `1rem`, weight `700`):
  reference-aligned (à confirmer) — `.tg-link` is weight 600, and the only
  bold-`1rem` brand rule (`.contact .form-files__label`) is scoped to the
  file-upload widget, so neither sets the general label value.
- **Display** (`font.display`): **`'DM Serif Text', serif`** — 37+
  declarations on `.title` and editorial headings
  (`.title{font-family:'DM Serif Text',serif;…color:#333745}`), backed by
  the 2 DM Serif Text faces in `fonts.css`.
- **Monospace** (`font.mono`): system stack.
- Links: slate `#333745`, not underlined at rest (`.tg-link{…color:#333745}`),
  recoloured to `#eb0000` on hover (`.tg-link:hover{color:#eb0000}`); the
  hover underline is reference-aligned (the brand hover only recolours).
- **No named tokens**: the bundle declares zero custom properties (`--*`:
  0 declarations) and contains zero `var()` references, so no hex is
  promoted from a named token and the declared-but-never-consumed trap
  cannot apply here — every measured value above comes from a rule.

## Signatures anatomiques

- **Fields**: `field.style = "filled-underline"` — the general brand field
  (`.contact .form__input--text, .contact .form__input--textarea, .contact
  .form__input--select{display:block;width:100%;border:0;border-bottom:2px
  solid #757575;border-right:2px solid #757575;background-color:#fff;color:#111;…}`)
  is a white fill with bottom+right 2px `#757575` strokes and no full box;
  `fillBg #ffffff`, `underlineColor #757575`, `underlineWidth "2px"`,
  `underlineMode "border"`. The surplus right-side stroke has no primitive
  (recorded here). Scope note: the boxed `1px #dadada` field (`.menu__search
  .search__input{…border:1px solid #dadada;…height:38px;…}`) is scoped to the
  search widget — it does not set the general value.
- **Control-geometry evidence** (brand's own control selectors grepped for
  `height`, `min-height`, `padding` — second measurement pass: the general
  block value IS transcribed). The brand repeats a fixed **11.5px block
  padding in 7 button-padding declarations across 5 component contexts**,
  all brand-namespaced, none vendor: `.main .btn-bg` (line 2604, the
  least-scoped general button rule: `padding: 11.5px 6.6%`),
  `.main__section.millau .btn-bg` (line 7273: `padding: 11.5px 1.2em`),
  `.offre-detail-header.article-header-career … .btn-bg` (lines 20532 and
  20538, base + max-width-767px media: `11.5px 42px` / `11.5px 15px`),
  `.apply-modal .btn-bg` (lines 21207 and 21222, base + max-width-767px
  media: `11.5px 42px` / `11.5px`), `.intoPage.article-header
  .btn__wording` (line 22217: `padding: 11.5px 6.6%`, with `font-size: 16px`
  and `line-height: 22px`). (The 8th `11.5px` occurrence, line 19208, is a
  `font-size` — out of scope.) The inline axis is fluid (`6.6%`, `1.2em`,
  `42px`, `15px` vary) and is not transcribed; the block axis is fixed and
  ships as `density.*.paddingBlock = 0.71875rem` (11.5 ÷ 16 = 0.71875;
  0.71875 × 16 = 11.5). Scoped non-general variants exist and are recorded
  but not retained: `padding: 10px 30px` (line 4623) and
  `padding: 10px 42px` (line 19882) in `.liste-carrieres*` job-listing
  components, and `padding: 22px 35px` (line 19673, min-width-1280px only)
  in the `.career-header` hero — per the scope rule the least-scoped
  general rule (`.main .btn-bg`) plus the 7-declaration majority sets the
  general value. Corroboration from the general fields:
  `.contact .form__input--text` (lines 3064–3069: `padding-left: 8px`,
  `padding-top: 13px`, `padding-bottom: 10px`) and `--select` (lines
  3053–3060: `padding-left: 8px`, `padding-top: 10px`,
  `padding-bottom: 13px`) average exactly 11.5px block each; `--textarea`
  (lines 3082–3086: `padding: 15px 0 20px 8px`, `height: 170px`) is a
  multi-line area, not a control density. `.contact .btn` (lines 2687–2692:
  `padding: 0` reset) and newsletter `.btn` rules (only
  `padding-bottom: 10px`) carry no general geometry. Height coherence:
  11.5 + 18 + 11.5 = 41px against `controlHeight: 2.5rem` (40px at 16px) —
  a 1px (2.5%) gap at the token level, where the general control text is
  18px at `line-height: 1` (`.tg-link`, see the `rem`-root inventory):
  consistent with transcription, not a conflict. No brand rule declares a
  competing control height — widget-scoped heights only (`.menu__search
  .search__input`: 38px, 64px at min-width-1024px; `.contact .cs-select`:
  55px; video/cookie/cross buttons) — so nothing contradicts keeping
  `controlHeight` at the base 2rem/2.5rem/3rem: actual brand buttons render
  16px `.btn__wording` text and exceed the 40px nominal minimum on the
  brand site itself, as they do under these tokens.
- **Field-inline confrontation**: the three general field variants declare
  only `padding-left: 8px` (`0.5rem`) — uniform across `--text`, `--select`
  and the `--textarea` shorthand — and never a general `padding-right`
  (`--text`/`--select` leave it undeclared; the `--textarea` shorthand sets
  right to 0; the `40px` right in `.contact .cs-select` is that widget's
  custom-arrow gutter, cf. `selectPaddingRight`). The shipped symmetric
  `density.*.paddingInline` (`0.5rem`/`0.75rem`/`1rem`,
  reference-aligned, à confirmer) is therefore confronted with a single
  measured 8px-left datum and no general right-side value: it is kept as
  borrowed, not transcribed. The mirrored variant asymmetry (13/10 vs
  10/13) holds on the block axis only; inline is uniform-left with no
  right-side declaration — a missing datum, not a mirrored asymmetry.
- **Native `<select>`**: chevron redrawn as a data-URI SVG carrying the
  measured brand red (`%23eb0000`), `selectAppearance: "none"`; the
  `2.5rem` right gutter is reference-aligned (à confirmer).
- **Focus evidence**: no `:focus-visible` rule exists in the bundle
  (grep: 0); `outline` appears only in widget resets (`.menu__search
  .search__input:focus{outline:0;caret-color:#eb0000}`,
  `.hp-header__controls-inner:focus{outline:none}`,
  `.work-popin .tns-controls:focus{outline:none}`) plus one scoped
  `box-shadow: 0 0 0 3px rgba(30,64,175,0.7)` ring on
  `.liste-complete-item__text a:focus` — a single-component non-brand blue,
  rejected as the site value per the scope rule. The shipped red is the
  colour of the brand's own focus rules (`.nav button:focus`,
  search-input caret) and of the brand action.
- **Radius**: no brand-owned general radius — the four `border-radius: 0`
  declarations split evenly (vendor `.tns-nav button` at 17828 and vendor
  `.mCS*` at 20064 vs brand `.offer-detail__left-sections-container …
  li:before` at 5619 and brand `.offre-detail-liste-liens …
  span:before` rule at 20805–20811, both square list bullets);
  `border-radius: 0px !important` at 1860 is `.os-*` vendor;
  `2px`/`16px` live in `.mCS*` scrollbar rules; `4px` in two scattered
  brand one-offs (`.liste-complete-item__text a:focus`,
  `.filters-tags__item__wrap`); brand buttons ship square with no declared
  radius.
- **Buttons**: primary = solid **action red `#eb0000`** with **white** label
  → hover inverts (white fill, black text, 1px black border); secondary =
  **outlined red** (transparent fill, `#eb0000` border, light `#eeeeee`
  hover fill).
- **Tabs / top-nav**: radio tabs; checked label = **red fill `#eb0000` with
  white text** (`.tabs input[type="radio"]:checked +
  label{background:#eb0000;color:#fff}`).
- **Pagination**: borderless slate links; active page = filled **action red**
  with white text (measured button pair, 4.63:1).
- **Overlay**: brand modal veil `.popin-intro__bkg` =
  `rgba(255,255,255,0.4)` (white veil, transcribed as
  `rgb(255 255 255 / 0.4)`).

## Upstream access

Cloudflare-fronted host, but the bare request serves **200** immediately
(measured 2026-09-25): bare `curl` → 200, UA-only → 200, full browser
headers → 200. No workaround needed; the three forms are recorded here so
the next measurer does not chase the Akamai-style 403 trap on this host.

## Asset officiel

- Eiffage logo = the red/black "EIFFAGE" wordmark with its red square motif.
  Use the official SVG/PNG from the brand assets — **do not redraw the logo
  by hand**. This package references only font *names* and public colour
  values, never logo artwork or font binaries.
