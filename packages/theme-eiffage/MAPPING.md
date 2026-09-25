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
- Internal per-file boundary: the file opens with `@-moz/webkit-keyframes`
  and scrollbar-plugin rules; the brand region starts at the `html{`
  base rule. Every count below is computed on brand-namespaced rules only;
  per-file counts are given because the brand serves a single bundle.

Excluded although frequent-looking: `#007dbd` (4× but scoped to the single
component `.contact .form-files__label` — not a site value), `#ff0000` (pure
red, 4× in `.alert-bg-white .alert-content-text` + `.description--nav` —
a developer-default-looking one-off, kept as context only), `#008a09 /
#fed100 / #6d6f72` (single-rule `.edito-focus.*` editorial variants),
`acumin-pro` (1 rule, `.breadcrumb__nav`, against 152 Montserrat
declarations — legacy exception, not the site face), `Avenir-Black` (one
`.safety__container` rule — legacy exception).

## Hosts (Step 0.3)

`eiffage.com` and `eiffage.fr` do **not** disagree: `eiffage.fr` answers
`301 → https://www.eiffage.com/`, and the redirected page links the same two
bundle URLs (`8971d73a…min.css` print, `a352be2f…min.css` screen). Single
host, no tie-break needed — `eiffage.com` wins as the canonical source.

## `rem` root (Step 0.2)

`html { font-size: 18px; }` — the brand root is **18px**, not 16px. Every
brand `rem` below is converted (×18 ÷ 16). `px` values pass through:

- `.contact .form__input--*` `font-size: 0.833333333333333rem` = 15px →
  shipped `typography.field.size = 0.9375rem` (15 ÷ 16).
- Same rule `line-height: 0.888888888888889rem` = 16px → 16 ÷ 15 = 1.07
  (shipped `typography.field.lineHeight`).
- `.main .btn-bg` `padding: 11.5px 6.6%` — px, no conversion involved.
- `.tabs label` `padding: 0.8em 0.5em` — em, not transcribed.

## Colour mapping

| Sentropic role | Eiffage source | Value |
|---|---|---|
| `action.primary` (button fill) | `.main .btn-bg{background-color:#eb0000}` | `#eb0000` |
| `action.primaryText` (text on red) | `.main .btn-bg{color:#fff}` (4.63:1) | `#ffffff` |
| `action.primaryHover` | derived darker red (brand hover inverts — no darker red published) | `#bf0000` *(à confirmer)* |
| `surface.default` / `surface.raised` | `body{background-color:#fff}` | `#ffffff` |
| `text.primary` | `body{color:#000}` | `#000000` |
| `surface.inverse` | `.footer-block{background-color:#333}` (dark footer, white text) | `#333333` |
| `text.inverse` | `.footer-block{color:#fff}` + `.main .btn-bg{color:#fff}` | `#ffffff` |
| `text.secondary` | `.title{color:#333745}` + `.tg-link{color:#333745}` (`color:` ×77, 11.84:1) | `#333745` |
| `text.muted` | meta grey (`color: #757575` ×49, 4.61:1) | `#757575` |
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
- **`density`** (all six leaves per size), **`shadow.medium/floating`**,
  **`motion.easing`**, **`disabledOpacity`**, **`transition`**,
  **`typography.control/label` sizes**, **link hover underline** and **all 12
  component-override metrics** — the brand publishes no usable general
  control geometry (see evidence below); only `controlHeight`/`iconSize`
  match the Sentropic base, the rest is aligned with the reference theme
  package's geometry.
- **Shadow tints** `rgb(51 55 69 / 0.10)`, `rgb(51 55 69 / 0.14)`,
  `rgb(51 55 69 / 0.18)` — the `#333745` slate at low alpha; no shadow scale
  is published by the brand.
- **`focus` technique** (`strategy: "outline"`, `width 2px`, `offset 2px`) —
  no site-wide focus technique is published (see evidence below); the colour
  `#eb0000` is measured (scoped rules cited above).
- **`radius.sm/md/lg`** — no general brand radius is published (vendor-owned
  `0/2px/16px`, scattered `4px`); reference-aligned.

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

- **Controls / body / fields / labels** (`font.sans`,
  `typography.control/field/label`): **`'Montserrat', sans-serif`** — 152
  `font-family: 'Montserrat', sans-serif` declarations across brand
  components; the `fonts.css` sheet ships the Montserrat `@font-face` set.
  We reference the font *name* only.
- **Display** (`font.display`): **`'DM Serif Text', serif`** — 37+
  declarations on `.title` and editorial headings
  (`.title{font-family:'DM Serif Text',serif;…color:#333745}`).
- **Monospace** (`font.mono`): system stack.
- Links: slate `#333745`, not underlined at rest (`.tg-link{…color:#333745}`),
  recoloured to `#eb0000` on hover (`.tg-link:hover{color:#eb0000}`); the
  hover underline is reference-aligned (the brand hover only recolours).

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
  `height`, `min-height`, `padding`): general inputs carry NO
  height/min-height/padding (only `font-size`/`line-height`); `.main .btn-bg`
  carries only `padding: 11.5px 6.6%` (no height); `.contact .btn` resets to
  `padding: 0`; newsletter `.btn` rules carry only `padding-bottom: 10px`.
  The only control `height` found is the widget-scoped `height: 38px` above.
  "Nothing usable published" is therefore quoted, not asserted.
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
- **Radius**: no brand-owned general radius — `border-radius: 0` lives in
  `.os-*`/`.tns-nav` vendor rules, `2px`/`16px` in `.mCS*` scrollbar rules,
  `4px` in two scattered rules (`.liste-complete-item__text a:focus`,
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
