# Getlink → Sentropic mapping

This package maps the **public** Getlink website styles onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: every colour is
read from the brand's official theme stylesheet linked from its homepage (no
custom properties are declared — all values are literal paintings), and every
count below is a count of **declarations** (occurrences of the hex in
property values, case-normalised; a rule carrying the hex twice counts
twice) over the **brand region** of that sheet (1524 rules — see Sources).
Only public values and font *names* are referenced — no font binaries.
Derived/unmeasured values are flagged `à confirmer`.

> Key measured facts: the site ships zero CSS custom properties and zero
> `var()` — operability rests entirely on literal hex paintings. Its focus
> indicator is a 2px pure-red outline (`red` keyword). Its buttons are full
> pills while its inputs are near-square (2px) — one Sentropic shape radius
> cannot carry both, so the input value is transcribed and the pill CTA is
> recorded below as an unmapped signature.

## Sources

- Theme stylesheet — `https://www.getlinkgroup.com/content/themes/getlink/resources/assets/css/style.css`
  (193843 bytes, fetched 2026-09-25; bare `curl` 200 3/3, UA-only 200 3/3 —
  no special access needed): every colour, radius, height, padding, shadow,
  transition and font-face below. Cited by expanded line (`sed 's/}/}\n/g'`
  → 2002 lines): `style.css:NNN`.
- Homepage stylesheets (all four, same fetch): the theme stylesheet above +
  WordPress `block-library` (vendor) + `login-with-azure` plugin (vendor) +
  Google Fonts `Open Sans:700,600,500,400,300` (font names). Verified with a
  second pattern spelling (`rel=["']?stylesheet`, tolerant quotes): 4
  stylesheets, no more.
- Select chevron — `https://www.getlinkgroup.com/content/themes/getlink/resources/assets/images/svg/chevron.svg`
  (HTTP 200, 150 bytes): 12×10, `M11 2.5L6 7.5L1 2.5`, black stroke —
  redrawn as the `selectChevron` data-URI.
- `/en/` serves the same four stylesheets byte-for-byte (same theme file):
  no cross-host disagreement (Step 0.3 — one host, one sheet).

Brand region (Step 0.5): vendor ranges excluded from every count —
1–66 (`normalize.css v7.0.0` banner + de-bannerised base reset:
`::selection{background:#b3d4fc}`, `button,input{border:1px solid #000}`),
160–178 (slick carousel stock), 179–193 (WordPress `.align*` / `.wp-caption` /
`.screen-reader-text` CMS defaults), 644–702 (Choices.js stock),
875–1186 (Video.js + sublime skin + VideoJS font), 1992–1998 (Choices media
query + video print rule). Boundary into brand rules: line 66
(`input::placeholder`) → 67 (`@keyframes fadeFromTop`); 193 → 194
(`body{padding-top:80px}`); 702 → 703 (brand Choices overrides);
1186 → 1187 (`.video-mp4 video`). Kept as brand: brand-authored styling of
vendor markup (`.cards .slick-*`, themed `.slick-dots`/`.slick-arrow`,
`.gform*`/`.gfield*` form theme, Choices overrides 703–716, home-grown
`.cookie-banner` in brand BEM with brand font and navy). Whole-file counts
equal brand-region counts for every promoted long hex; the short forms
`#fff` (145 whole-file / 108 brand) and `#000` (62 / 50) also occur in
vendor ranges (normalize, Choices, Video.js), so the split moves no
published brand figure. `rem` root (Step 0.2): 16px
(`body,html{font-size:16px}`, style.css:87) — factor 1, no conversion.

`rgb()/rgba()/hsl()` equivalents (reported separately, never merged into a
hex count): `rgba(0,74,147,.1)` ×2 + `5px 5px 0 0 rgba(0,74,147,.1)` (form
blue #004a93); `rgba(0,32,91,.1)` (primary #00205b); `rgba(56,56,56,.75)`
(#383838); `rgba(240,49,48,.3/.1)` (error #f03130); `rgba(230,48,39,.3)`
(accent #e63027); `rgba(97,192,94,.1)` (success #61c05e);
`rgba(163,162,162,.2/.5)`; black `rgba(0,0,0,.1–.85)` incl. the modal
`rgba(0,0,0,.85)`; white `hsla(0,0%,100%,0–.6)` tints. No 8-digit hex exists
in the sheet. The sheet writes `#000`/`#fff`/`#03f`/`#eee`/`#333` short-only
(zero long-form occurrences) — transcribed expanded, expansion noted per
value.

## Colour mapping

| Sentropic role | Getlink source | Value |
|---|---|---|
| `action.primary` / `text.link` / `blue.60` / `data.category8` / tabs active / badge info | `.btn-blue{background-color:#00205b}` (:297), `.formatted a{color:#00205b}` (:114) — 29 declarations | `#00205b` |
| `action.primaryHover` | `.btn-blue:hover`, link `:hover` (:298, :115) — 4 declarations | `#1a5c9e` |
| `action.primaryText` | white on `.btn-blue` (:297) | `#ffffff` |
| `action.secondary` / — | active filter pill (:1533) — 5 declarations | `#e2e2e2` |
| `action.secondaryHover` | measured grey, darker step (hover role à confirmer) | `#d9d9d9` *(à confirmer)* |
| `action.secondaryText` | pill text (:1533) — 7 declarations | `#00072b` |
| `action.danger` / `data.category3` | `.was-focused:invalid`, `.validation_error` (:428, :446) — 13 declarations | `#f03130` |
| `surface.default` / `surface.raised` / `field.fillBg` | `#fff` (108 declarations, transcribed `#ffffff`) | `#ffffff` |
| `surface.subtle` | `.grey`, `.header` (:136, :1877) — 6 declarations | `#f5f5f5` |
| `surface.inverse` / `slate.90` / `blue.80` | `.blue`, header menu, slider (:135, :1546, :1935) — 33 declarations | `#000050` |
| `surface.overlay` | `.popin-wrapper{background-color:rgba(0,0,0,.85)}` (:450, modern-syntax transcription) | `rgb(0 0 0 / 0.85)` |
| `text.primary` / `slate.80` | `#000` as text: labels, breadcrumb current, dropdowns (:425, :256, :745) — 50 declarations, transcribed `#000000` | `#000000` |
| `text.secondary` / `slate.60` | `.breadcrumb{color:#707070}` (:251) — 3 declarations, 4.95:1 | `#707070` |
| `text.muted` | `.document__meta`, share price (:805, :1526) — 8 declarations, 4.42:1 (documented arbitration) | `#787878` |
| `text.inverse` | white on navy/footer (:217, :297) | `#ffffff` |
| `border.subtle` / `slate.20` | table/news hairlines (:534, :769) — 13 declarations | `#e9e9e9` |
| `border.strong` / field stroke | input `border:1px solid #d9d9d9` (:426) — 8 declarations | `#d9d9d9` |
| `border.interactive` / `feedback.info` / `cyan.70` / `data.category1` | input `:focus{border-color:#004a93}` (:427), `.gform_button` (:420) — 12 declarations, 8.75:1 | `#004a93` |
| `feedback.success` / `status.completed` | stop rule from measured #61c05e (2.28), 4 steps, 4.66 | `#368434` *(à confirmer)* |
| `feedback.warning` / `status.pending` | stop rule from measured #f75e19 (3.20), 3 steps, 5.42 | `#bd3f07` *(à confirmer)* |
| `feedback.error` / `status.failed` | stop rule from measured #f03130 (4.05), 2 steps, 5.05 | `#dd1110` *(à confirmer)* |
| `status.processing` | = `feedback.info` | `#004a93` |
| `data.category2` | history period-2 (:618) — 3 declarations | `#63c1c8` |
| `data.category4` | history period-4 (:624) — 4 declarations | `#009fe3` |
| `data.category5` | history period-5 (:628) — 3 declarations | `#8c3f91` |
| `data.category6` | history period-6 (:630) — 3 declarations | `#f75e19` |
| `data.category7` | `.gform_confirmation_message` (:447) — 4 declarations | `#61c05e` |
| `blue.10` / `cyan.10` | `.lblue` utility (:137) — 3 declarations (tie-break over `#e9f6fe`, same count, no utility name) | `#e8f6fe` |
| `cyan.50` | `.btn-white:hover{color:#009fe3}` (:296) — accent fill only (2.97:1, never a text role) | `#009fe3` |
| `slate.10` | = `surface.subtle` | `#f5f5f5` |
| `slate.0` | white | `#ffffff` |
| `focus.color` | `red` keyword, `a,button:focus-visible{outline:2px solid red}` (:89) — 9 brand declarations (6 `outline` + `border` :505/:643 + `color` :552), 4.00:1 (line threshold 3:1) | `#ff0000` |
| `buttonSecondary` border/hover | `.btn__border.header-btn` (:158–159) | `#00072b` |
| `tag.neutralBackground` | `.tag{background-color:#e9e9e9}` (:1293) | `#e9e9e9` |
| `pagination.activeBackground` | `.page-numbers.current` (:1372) | `#c2c2c2` |
| `field.underlineColor` | input border (:426 — unused for `outline`, kept for completeness) | `#d9d9d9` |
| — (raw palette, no role) | `.cookie-banner__body{background:#001d39}` (:470) — 2 declarations | `#001d39` |
| — (raw palette, no role) | `#03f` expanded — gradient stop (:94…) — 14 declarations | `#0033ff` |
| — (raw palette, no role) | document shadow (:819) — 1 declaration | `#003b75` |
| — (raw palette, no role) | `.key-numbers.gradient-green-dark` stop (:722) — 3 declarations | `#00825d` |
| — (raw palette, no role) | `.key-numbers.gradient-green-dark` stop (:722) — 3 declarations | `#00eaa0` |
| — (raw palette, no role) | date/share-price text + sub-menu fill (:291…) — 13 declarations | `#0133ff` |
| — (raw palette, no role) | news-title underline gradient (:1809) — 4 declarations | `#043c74` |
| — (raw palette, no role) | checked filter pill (:641) — 1 declaration | `#091537` |
| — (raw palette, no role) | `.key-numbers.gradient-green-dark` stop (:722) — 3 declarations | `#09be80` |
| — (raw palette, no role) | `#333` expanded — header-lang active (:1898) + invalid `:201` decl (see note) — 2 declarations | `#333333` |
| — (raw palette, no role) | history highlight (:1985) — 1 declaration | `#64c1c7` |
| — (raw palette, no role) | `.key-numbers.gradient-red-blue` stop (:719) — 6 declarations | `#9400ab` |
| — (raw palette, no role) | `.key-numbers.gradient-red-dark` stop (:720) — 3 declarations | `#95023e` |
| — (raw palette, no role) | floating-menu chevron (:385) — 1 declaration | `#a3a2a2` |
| — (raw palette, no role) | `.key-numbers.gradient-purple` stop (:723) — 3 declarations | `#ac7cb5` |
| — (raw palette, no role) | `.key-numbers.gradient-red-dark` stop (:720) — 3 declarations | `#c70236` |
| — (raw palette, no role) | socialshare (:1390) — 2 declarations | `#cacaca` |
| — (raw palette, no role) | underline track (:153) — 2 declarations | `#d4d4d4` |
| — (raw palette, no role) | `.key-numbers.gradient-orange-yellow` stop (:721) — 3 declarations | `#e15727` |
| — (raw palette, no role) | history wrapper (:564) — 2 declarations | `#ececec` |
| — (raw palette, no role) | `#eee` expanded — `.bloc.grey` (:250) — 9 declarations | `#eeeeee` |
| — (raw palette, no role) | floating-menu close (:373) — 6 declarations | `#efefef` |
| — (raw palette, no role) | `.key-numbers.gradient-red-blue` stop (:719) — 3 declarations | `#fb0000` |
| — (raw palette, no role) | header-lang pill (:1896) — 1 declaration | `#fbfbfb` |
| — (raw palette, no role) | floating-menu body (:378) — 1 declaration | `#fcfbfb` |
| — (raw palette, no role) | `.key-numbers.gradient-red-dark` stop (:720) — 3 declarations | `#fd0d2d` |
| — (raw palette, no role) | `.key-numbers.gradient-orange-yellow` stop (:721) — 3 declarations | `#ff8b00` |
| — (raw palette, no role) | `.key-numbers.gradient-orange-yellow` stop (:721) — 3 declarations | `#ffdf85` |
| — (raw palette, no role) | calendar icon (:761) — 1 declaration | `#ffe2cf` |

Stop-rule chains (§9: keep H/S, −0.05 L per step, first hex reaching 4.5:1
on white — replay with the one-line HSL command in the handoff report):
error `#f03130` 4.05 → `#ee1918` 4.39 → **`#dd1110` 5.05** (2 steps);
success `#61c05e` 2.28 → `#4fb94c` 2.51 → `#45a942` 3.00 → `#3e973b` 3.69 →
**`#368434` 4.66** (4 steps); warning `#f75e19` 3.20 → `#ee5008` 3.63 →
`#d64707` 4.41 → **`#bd3f07` 5.42** (3 steps).

Second-instrument checks: top counts re-run with a differently-spelled
pattern (naive `#hex` substring): all agree except `#000` (93 vs 50),
overcounted by exactly the longer-hex inclusions 33 + 7 + 3
(`#000050`/`#00072b`/`#0000fb`) — the bounded count stands. Derived ratios
recomputed with the literal §9 one-liner: 5.05 / 4.66 / 5.42, identical.

Last-rule readings (§8): `.year-history a:hover{color:red}` (:552) is
overridden by the later same-selector `color:#f03130` (:569) — effective
`#f03130`. `.choices__inner` declares `border-radius:3px` then
`border-radius:0` in one rule (:709) — effective `0`. The input transition
`transition:.3s` is refined by the later `transition-property:border,color`
in the same rule (:426) — effective property `border, color`.

## À confirmer (derived or no published brand token)

- **Feedback text hues** (`#dd1110`, `#368434`, `#bd3f07`) — stop-rule
  derivations; the measured `#f03130`/`#61c05e` fail 4.5:1 as text (4.05 /
  2.28) and no warning amber is published. Chains above.
- **`text.muted` `#787878` at 4.42:1** — measured meta grey; between 3 and
  4.5, a documented arbitration (order-coherent: lighter than secondary
  `#707070` at 4.95).
- **`action.secondaryHover` `#d9d9d9`** — measured grey, unpublished as a
  hover.
- **Density `sm`/`lg`** (`2.75rem`/`3.75rem`, paddings, font sizes) — the
  brand publishes one control size (52px inputs); `md` gap/minWidth also
  unpublished (square-minimum convention).
- **Tabs, alert, badge** — no tab/alert/badge component published (grep
  `\.tab` over the brand region: table styles only; no `.badge`/`.chip`;
  only form-scoped `.validation_error`): geometry aligned with the reference
  theme package; colours are brand roles (`#00205b` active/badge,
  `#ffffff` badge text).
- **`breadcrumb.separator` `#707070`** — no separator glyph published (gap
  only); reuses the trail colour.
- **`toggle.textColor` `#000000`** — the measured label is white-on-dark-
  banner-only; light-theme stand-in. `trackPadding: 2px` approximated from
  the 42×20/14px switch.
- **`choice.radioLineHeight`** — no radio published; reuses the checkbox 20px.
- **`cursor.disabled` / `cursor.text`** — brand publishes `pointer` only
  (`not-allowed` occurs solely in vendor Choices stock, :649–691).
- **`shadow.floating`** — only two soft shadows published (both transcribed);
  base floating geometry with brand black tint.
- **`card.hoverBackground`** — no card hover published (grep `.card:hover`
  over the brand region: 0); inert white.
- **`surface.overlay` syntax** — value measured, `rgba()` → modern `rgb()`
  transcription.

## Typography

- **Body/controls/fields/labels** (`font.sans`): **'Open Sans'** — Google
  Fonts link on the homepage (weights 300–700) + `body,html{font-family:Open
  Sans,sans-serif;font-size:16px;line-height:1.75}` (style.css:87). We
  reference the font *name* only.
- **Display/headings** (`font.display`): **'Outfit'** — self-hosted
  `@font-face` (weights 300/400/700, style.css:84–86), always paired
  `font-family:Outfit,serif`; headings 18–32px/700 (style.css:91–102).
- **Labels/legends/buttons-variant**: **'Campton'** — self-hosted
  `@font-face` (style.css:73–77); consent labels 16px/300 (:434), donut
  legends (:1328), `.gform_button` (:445). No Sentropic slot (noted here).
- **Obviously** — `@font-face`-declared (style.css:78–83) but used in zero
  rules: not referenced.
- **Monospace** (`font.mono`): system stack.
- Links: `#00205b`, underlined at rest (:114), hover clears to `#1a5c9e`
  with no underline (:115).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — unfilled/white box, four equal
  `1px solid #d9d9d9` sides, 2px radius (:426); select agrees (white,
  same border, :709). Height 52px, 1rem left / 40px right padding (validation
  icon gutter), 14px text (:426/:431).
- **Radius**: inputs 2px vs pill CTAs (48px `.btn-blue`/`.gform_button`,
  30px `.btn__border`) — `radius.md = 2px` transcribes the input family
  (square 0–3px across inputs/select/tags/validation); the pill CTA is
  unmapped (one Sentropic shape radius feeds both). Cards square (`lg = 0`),
  tags square, pagination circular (36px, unmapped — same cause). The
  8px-bordered `.card.bordered` variant (:262) has no primitive.
- **Focus**: `strategy = "outline"`, 2px, offset 0, `#ff0000` (`red`
  keyword, least-scoped brand rule :89; 4.00:1 ≥ 3:1 line floor). Inputs
  instead recolour to `#004a93` 2px with `outline:none` (:427); the white
  halo border has no primitive.
- **Buttons**: uppercase 14px/600 pill CTAs, navy `#00205b` → hover
  `#1a5c9e` (:293–298); secondary = outlined dark-navy pill, transparent →
  `#00072b` fill on hover (:158–159). CTA transition is a
  `background-color` variant (`transition:background-color .3s,color .3s`,
  :293/:418).
- **Tabs**: none published (reference geometry, brand-navy active).
- **Pagination**: 36px circular boxes, 12px/600, current filled `#c2c2c2`
  (:1371–1372); chevron icons 8×14, disabled opacity .3.
- **Density**: 52px inputs / 48px buttons; transitions `.3s` (78
  duration-token occurrences in transition/animation declarations) with
  `ease`; input transition property `border, color` (:426).
- **Shadows**: hard-offset (`5px 5px 0 0`) + ring idiom; soft
  `0 1px 3px rgba(0,0,0,.22)` / `0 5px 20px rgba(0,0,0,.1)` transcribed.
- **Toggle/choice**: 42×20 banner switch, 14px `#004a93` knob
  (:485–490); 16px consent labels, 20px custom checkbox (:434–439).
- **Tag**: square 11px/600 uppercase, 2.2px tracking, `#e9e9e9`
  (:1293) — tracking/uppercase unmapped (no primitive).
- **Breadcrumb**: `#707070` trail on `#e2e2e2`, black current, 14px/600
  (:251–256).
- **Accordion**: 24px Outfit 600 toggle, 30px padding, `#fafafa` hover wash
  (:102/:523–524); red `#e63027` titles (:531).
- **Chrome**: deep navy `#000050` menus/slider, `#0d1630` footer with
  `#c2c2c2` text (10.04:1), signature gradient
  `linear-gradient(90deg,#03f,#000050 50.48%,#101c6f)` (:96).
- **Stacking**: header `z-index:50` fixed (:195, matches the base); the
  modal `.popin-wrapper` `z-index:25` (:450) sits under the header and is
  not transcribed.
- **Invalid CSS noted**: `.header-menu a{color:#000050 #333}` (:201) declares
  two colours — dropped at parse; both hexes are painted elsewhere
  (`#000050` ×32 more, `#333` at :1898), so no figure depends on it.

## Asset officiel

- Getlink logo = the corporate wordmark (SVG/PNG via the site header and
  favicons). Use the official SVG/PNG from the brand assets — **do not
  redraw the logo by hand**. This package references only font *names* and
  public colour values, never logo artwork or font binaries.
