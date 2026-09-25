# Ipsen → Sentropic mapping

This package maps the **public** Ipsen corporate site design onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**: the
navy/neutral palette, Rethink Sans typography, 8px radius, outline focus and
boxed-field signatures are measured from the brand's public stylesheets
linked from the homepage (three Jetpack `/_static/` bundles, fetched
2026-09-25 — see Sources). Only public CSS values and font *names* are
referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured facts: the brand navy `#000e56` (the brand's own
> `.charcoal-grey` utility) is body text, primary CTA fill and footer ground
> at once; `text.muted` `#8f9699` clears the 3:1 floor at 3.00 (documented
> arbitration, ratio recorded); and the modal backdrop is **white at 80 %** —
> the later `.modal-backdrop` rule overrides an earlier black one at equal
> specificity, so the last rule wins.

## Sources

- Ipsen site (EN + FR homepages serve identical stylesheet bundles) —
  https://www.ipsen.com/ (all values; FR https://www.ipsen.com/fr/ agrees —
  same bundle hashes, Step 0.3)
- Bundle all-css-0 (brand `ipsen-main` CSS, 945 rules, whole file is brand
  region) — `https://www.ipsen.com/_static/??-eJytkc0K…` (see `## Upstream
  access` for the full URLs)
- Bundle all-css-14 (Bootstrap 5.1.3 + glider.js + slick + brand
  `ipsen-main` rules 2536–3921) — `https://www.ipsen.com/_static/??-eJyVkVEP…`
- Bundle all-css-12 (vendor plugins + brand `#exit-popup` block, rules
  107–126) — `https://www.ipsen.com/_static/??-eJx9jtEK…`
- Select chevron pixels — `https://www.ipsen.com/wp-content/themes/ipsen-main/dist/images/arrow-down.png`
  (7×6px, decodes around `#000e56`)

## Upstream access

Bare `curl` answered 200 twice and 000 once over three tries; UA-only
(Chrome UA, no other headers) answered 200 all three times, so no full
header set was needed. Stylesheets were fetched with UA + `Referer:
https://www.ipsen.com/` + `Accept: text/css`. Full bundle URLs (stable
Jetpack hashes, 2026-09-25):

- all-css-0: `https://www.ipsen.com/_static/??-eJytkc0KwkAMhF/IuNUWxIP4LOluaBf3z2yKPr6oLbU92j1lhoGPIaMeCXQMQkGU9OQpK5syBfBogxLyyaEQJGSZktZFfcuqJ47QYgjEC/PN9zrnnfobLvQU8GQs/siNzI4x9VaDRjYrV6TzfYhC0ylCzM76T8FZFeEm7Gh8wyzL7GbFEWAw8J5tZTeymbrBIY/FF27ufvWXw+lcHeu6apoXeq8T5w==`
  (82 756 bytes)
- all-css-12: `https://www.ipsen.com/_static/??-eJx9jtEKwjAMRX/IrnMTxAfxU0ZtYw2kbVha5/7eWlF8EN/CufceohdWNsUMMWum4jGKRo5qNhlUWBUnqUE5E1ptRfQ37wLGrsKN/ikRiArumGuXCysp8w3WJmngs8RoqTiQFjkjV6wu+SuvyKfkqb5inic5bUQgvxwL+8CTIZoucxu6t+wUjtv9oR/Gsd8ND8qiXXo=`
  (155 368 bytes)
- all-css-14: `https://www.ipsen.com/_static/??-eJyVkVEPgjAMhP+QZSgkxgfjbxmjYEO7LWuj4d+rJPjMXu/6Xa45984QUjSM5uyJguooK0YQT9GNpOaCqhtSMrXicyMUm69ycsfAmWnEUkspU1hgO6jGagDBkTxMxPbtWPNV8S+yFaZUBNRWrqo5cxo8HyCOJhtKZm8I2RfbnYFTWLblFhBEozjvU/6FX/ZD7ufrrb10Xdv3H1BHxIw=`
  (291 831 bytes)

To reproduce the analysis: download the three bundles, expand one rule per
line with `sed 's/}/}\n/g'`, then apply the brand-region boundaries below.

## Brand region (Step 0.5) and counting convention

Brand region = **2 317 rules**: all-css-0 whole (945 rules — no vendor base
run; the 78 glider-mentioning lines are brand-scoped `.graphic-card …`
overrides carrying a single `#fff`); all-css-14 expanded lines 2536–3921
minus 34 vendor-widget rules (31 `.ms-options` / `.wpgmp` / `#onetrust`
lines + bare `.glider-dot` / `.glider-dots` + `#rc-anchor-container`);
all-css-12 expanded lines 107–126 (`#exit-popup` / `#survey-form` brand
block). Boundaries in all-css-14: Bootstrap ends ≈2490 (print utilities),
glider.js 2480–2494, slick 2495–2535 (ends `.slick-arrow.slick-hidden`),
brand starts at 2536 (`.media-filter-main .sorting-sec`). Excluded outright:
all-css-12 rate-my-post/dashicons/maps/FontAwesome runs, the `riovizual`
sheet (zero brand hexes), WordPress `global-styles` presets (stock
`--wp--preset-*`), the `bootstrap-icons` CDN sheet.

Convention: one occurrence = one declaration containing the hex, exact
6-digit match, **case normalised** (the brand writes both `#000e56` and
`#000E56`); short forms (`#fff` ×131, `#000` ×7, `#eee` ×3, `#ccc` ×2,
`#999` ×2, `#ddd` ×1, `#aaa` ×1) counted separately and transcribed expanded
(`#eee` → `#eeeeee`); one 8-digit alpha form (`#00000026` ×1, slim-card
hover shadow) carries no token and takes no table row; `rgb()`/`rgba()`
equivalents
listed separately, never merged into hex counts. `rem` root: **16px
default** — no `html{font-size}` rule in any sheet (empty grep over all
`html` selectors). The brand declares **no `--*` custom properties**, so
every `var()` count is 0 and consumption is literal-only; the single
brand-named `var(--Primary-New-Dark-Blue,#edebe4)` fallback corroborates
`#edebe4` (`var(--bs-gutter-x,.75rem)` ×22 is a consumed vendor var, no
role).

Per-file 6-digit counts (all-css-0 + exit block + all-css-14 brand part):
`#000e56` 52+2+130=184; `#edebe4` 10+1+37=48 (+1 var fallback); `#2797d3`
7+0+32=39; `#061f80` 6+0+20=26; `#224a81` 7+0+12=19; `#c02b0a` 16;
`#292c31` 9; `#c4c9cb` 9; `#3286d6` 8; `#3766a8` 7; `#6eb6c7` 7; `#dbeaf5`
6; `#e7faff` 6; `#8f9699` 6; `#5d6265` 5; `#6ec4ff` 5; `#00ff1a` 5;
`#cdd1d3` 4; `#153f99` 3; `#3fafeb` 3; `#50aaf8` 3; `#0a58ca` 3; `#fff9f9`
3; `#b2c966` 3; `#003e7e` 2; `#c84874` 2; `#790000` 2; `#ff1a1a` 2;
singletons `#00b050` `#006fee` `#10435e` `#4a7992` `#5a5a5a` `#d7d7d7`
`#dbdde8` `#dee2e6` `#e6f8fe` `#00000d`. `rgba()` in brand rules:
`rgba(6,31,128,.56)` ×3 (`#061f80` tint), `rgba(0,14,86,1)` /
`rgba(0,14,86,0)` ×3 each, `rgba(0,95,204,.95)` ×2 (search-dropdown focus),
`rgba(232,232,232,.5)` ×2, `rgba(18,25,97,.041)` ×2 (validation shadow),
`rgba(0,0,0,…)` shadows, `rgba(129,207,226,.4)` ×1, `rgb(0 0 0/25%)` ×1.

## Colour mapping

| Sentropic role | Ipsen source | Value |
|---|---|---|
| `action.primary` / `text.primary` / `text.link` / `surface.inverse` / `focus.color` / `tabs.activeText` / `pagination.activeBackground` / `data.category1` | `body{color:#000e56}` / `.btn-primary{background:#000e56}` / `a{color:#000e56}` / `.footer-mainbg{background:#000e56}` / `.charcoal-grey` | `#000e56` |
| `action.primaryHover` / `action.secondaryHover` | `.btn-primary:hover{background:#061f80}` / `a:hover{color:#061f80}` / `.img-bg .section-btn:hover{background:#061f80}` | `#061f80` |
| `border.interactive` / `data.category2` | `.primary-blue{color:#224a81}` + link/button/checkbox usages | `#224a81` |
| `feedback.info` / `status.processing` / `data.category3` | `.primary-light-blue{color:#2797d3}` + button fills | `#2797d3` |
| `data.category4` (tab filet is informational — no Sentropic key carries it) | active tab `border-bottom:2px solid #3286d6` | `#3286d6` |
| `feedback.success` / `status.completed` | `.true-green` utility (declared once, unconsumed on homepage — gap documented) | `#00b050` |
| `action.danger` / `feedback.error` / `status.failed` / `data.category7` | brand-authored Gravity Forms validation overrides (one under `.italy-contact-form`) | `#c02b0a` |
| `feedback.warning` / `status.pending` | derived amber (no amber published) | `#b25e09` *(à confirmer)* |
| `text.secondary` / `data.category8` | `.dark-grey{color:#5d6265}` + `.page-link`, timestamps | `#5d6265` |
| `text.muted` | file-size info + disabled download-link text | `#8f9699` |
| `text.inverse` / `action.primaryText` / `pagination.activeText` / `badge.infoText` | white footer/button text on navy | `#ffffff` |
| `action.secondaryText` / `buttonSecondary.border` / `breadcrumb.linkText+currentText` / `accordion.text` / `choice.labelColor` / `toggle.textColor` / `tag.neutralText` / `badge.infoBackground` | navy on light grounds (breadcrumb/tag/badge/toggle uses à confirmer) | `#000e56` |
| `surface.subtle` / `action.secondary` / `border.subtle` / `card.hoverBackground` / `tag.neutralBackground` | quote/tab/drop grounds, `.form-control{border:2px solid #edebe4}` | `#edebe4` |
| `border.strong` / `breadcrumb.separator` | card + divider strokes (separator use à confirmer) | `#c4c9cb` |
| `surface.default` / `surface.raised` / `field.fillBg` / `buttonSecondary.background` | card/field/modal white; later exit-modal rule wins over `#edebe4` | `#ffffff` |
| `surface.overlay` | `.modal-backdrop`: later `#fff`+`opacity:.8` wins over `#000` at equal specificity | `rgb(255 255 255 / 0.8)` |
| `buttonSecondary.hoverBackground` | exit-modal secondary `:hover` fill | `#153f99` |
| `data.category5` | `.vibrant-green` + slim green section ground | `#b2c966` |
| `data.category6` | `.true-green` (same gap as above) | `#00b050` |
| cyan.10 (light accent tint) | `.light-blue` + filter gradient, accordion hover | `#e7faff` |
| blue.10 (light blue tint) | slim-card blue section ground | `#dbeaf5` |
| — (raw palette, hero-scoped hover) | hero CTA `:hover` / `:focus` fill | `#3766a8` |
| — (raw palette, hero gradient stop) | `.carousel-inner:after` gradient | `#003e7e` |
| — (raw palette, validation tint) | validation message ground | `#fff9f9` |
| — (raw palette, legacy validation) | legacy-markup validation text | `#790000` |
| — (raw palette, declarations only) | `.vibrant-red` / `.light-grey` utilities | `#c84874` |
| — (raw palette, scoped financial data) | stock-ticker gain/loss text (excluded from feedback roles) | `#00ff1a` / `#ff1a1a` |
| — (raw palette, footer divider) | `.footer-divider` + `.vibrant-blue` / `.smoke-grey` | `#6eb6c7` |
| — (raw palette, footer rule + search) | `hr` + search-arrow hover | `#50aaf8` |
| — (raw palette, search arrow ring) | `.search-right-arrow` border/fill | `#6ec4ff` |
| — (raw palette, button hover) | slim-card / date button hover fill | `#3fafeb` |
| — (raw palette, booking fill) | book-meeting slot button ground | `#e6f8fe` |
| — (raw palette, booking borders) | book-meeting borders + shadows | `#cdd1d3` |
| — (raw palette, utility declaration) | `.serious-blue` | `#4a7992` |
| — (raw palette, icon colour) | `i.bi-chevron-*` | `#10435e` |
| — (raw palette, checkbox stroke) | gravity contact checkbox 2px border | `#006fee` |
| — (raw palette, scoped focus) | focus outline on image-ground CTA | `#dbdde8` |
| — (raw palette, scoped focus) | navbar toggler + mobile-menu close outline and text | `#0a58ca` |
| — (raw palette, search focus) | search-dropdown `outline` (no hex form) | `rgba(0,95,204,.95)` |
| — (raw palette, hero-scoped text) | `.hero-section{color:…}` | `#5a5a5a` |
| — (raw palette, mobile close stroke) | `.mobile-menu-close` border | `#d7d7d7` |
| — (raw palette, vendor default retained) | book-meeting footer rule = Bootstrap `.modal-footer` stock | `#dee2e6` |
| — (raw palette, darkest neutral) | editorial headings/paragraphs (brand-0 only) | `#292c31` |
| — (raw palette, black accents) | filter hover text, quote dash, `clr-black` (`#000` expanded) | `#000000` |
| — (raw palette, shadow tint) | accordion-bar shadow | `#00000d` |
| — (raw palette, disabled grounds) | disabled slot fill (`#eee` expanded) | `#eeeeee` |
| — (raw palette, gravity stroke) | gravity section border (`#ccc` expanded) | `#cccccc` |
| — (raw palette, full-slot fill) | `.slot_full` ground (`#999` expanded) | `#999999` |
| — (raw palette, slot stroke) | slot button border (`#ddd` expanded) | `#dddddd` |
| — (raw palette, disabled text) | disabled slot text (`#aaa` expanded) | `#aaaaaa` |

Contrast (WCAG, white ground unless noted): `text.primary` 17.54,
`text.secondary` 6.18, `text.muted` **3.00** (3.0041 unrounded —
documented arbitration, clears the 3:1 floor), `text.link` 17.54,
`text.inverse` on navy 17.54, `secondaryText` on `#edebe4` 14.70,
`border.interactive` 8.88, `focus.color` 17.54, `danger` 5.85 (5.62 on
`#fff9f9`), `primaryHover` 13.86, warning `#b25e09` 4.67. No stop-rule
chain was needed (no derived value fails its floor).

## À confirmer (derived or no published brand token)

- **Warning amber** `#b25e09` (4.67:1) — no amber is published; usable as
  text anywhere.
- **Success green consumption gap** — `#00b050` is the brand's
  `.true-green` utility (declared once, ×1) but unconsumed in the homepage
  DOM on 2026-09-25; carried as `feedback.success` with this gap stated.
- **Error-red stock coincidence** — `#c02b0a` is painted by brand-authored
  validation overrides, but may coincide with Gravity Forms stock: the
  stock file `…/gravityforms/assets/css/dist/gravity-forms-orbital-theme.min.css`
  answers 200 with `content-length: 0`, so the comparison is inconclusive
  and recorded as such.
- **Categorical `data.*` palette** — a coherent proposal from measured
  brand hues, not an official scale.
- **`density` sm/lg + md gap/minWidth** — no sm/lg control variants are
  published (`grep -h 'btn-sm|btn-lg|form-control-sm|…'` over the brand
  region returns nothing); base values retained.
- **`selectPaddingRight` 2.5rem** — the brand redraws the chevron
  (`appearance:none` + `arrow-down.png`, pixels ≈ `#000e56`) but publishes
  no right gutter; reference geometry.
- **`breadcrumb` / `tag` / `badge` / `toggle` / `alert` geometry** — no
  brand rules published (breadcrumb: one RTL-only line; alert/tag/badge:
  empty greps; toggle: only the navbar hamburger + an
  accessibility-widget position); reference geometry with brand colours
  applied.
- **`pagination.minSize`, `radioLineHeight`, `iconSize`, `z`, `spacing`** —
  not published; base/reference values retained.
- **Tabs `paddingBlock` 0.5rem** — Bootstrap `.nav-link` block padding
  retained (the brand zeroes inline padding only); labelled vendor default
  retained, not a brand decision.

## Typography

- **Body / controls / fields / labels / display** (`font.sans`,
  `font.display`, `typography.control/field/label`): **'Rethink Sans'** —
  four `@font-face` cuts (`RethinkSans-Regular/-Medium/-SemiBold`,
  `Rethinksans-bold`) served from
  `/wp-content/themes/ipsen-main/dist/fonts/` (css-14:2886–2889);
  body 16px/20px regular, CTA labels bold-cut 16px/20px, headings
  49/39/32/25/20/18px bold-cut. Consumption: Regular ×82, bold ×44,
  SemiBold ×43, Medium ×11 (+3 lowercase-`s` `Rethinksans-Regular`). We
  reference the font *name* only.
- **Lato** (`Lato-bold/-Light/-Regular/-Semibold`, css-14:2882–2885) —
  declared but **never consumed** (zero declarations outside `@font-face`);
  carries no role.
- **Monospace** (`font.mono`): system stack (no mono face published).
- Links: navy `#000e56`, no underline at rest, none added on hover (hover
  shifts to `#061f80`); content-area links (`.text-parbase`, alert boxes)
  underline at rest.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed `.form-control` (white
  fill, 2px `#edebe4` border, 8px radius, 50px tall, 13px/15px insets).
  Native `<select>` chevron redrawn in navy `#000e56` (PNG pixels measured).
  CTA alternative geometry noted: 15px/25px insets, ≈50px tall.
- **Radius**: 8px on controls/inputs/tabs/cards (`radius.md/lg = 0.5rem`),
  4px checkbox (`radius.sm`), 999px pills. The book-meeting modal keeps
  Bootstrap's `calc(.3rem - 1px)` radii (vendor default retained).
- **Focus**: **outline** in navy `#000e56` (`focus.strategy = "outline"`,
  2px width, 2px offset). Text inputs instead keep `outline:none` with a
  navy border recolour; scoped variants exist (1px `#061f80`, 1px `#000`,
  2px `#0a58ca`, 2px `#dbdde8`, search `rgba(0,95,204,.95)`).
- **Buttons**: primary = solid navy `#000e56` with white text → hover
  `#061f80`; light buttons `#edebe4`/navy → hover navy/white; secondary =
  **outlined** navy on white → hover fill `#153f99` (exit-modal scope).
- **Tabs**: borderless navy labels; active keeps navy text with a 2px
  `#3286d6` bottom filet (`indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: borderless `#5d6265` links (last padding 5px/11px wins);
  active page = filled navy with white text, 8px radius.
- **Accordion**: white bold-navy trigger 18px/22px (20px/25px at ≥767px),
  1px `#2797d3` border, 8px bottom radius, asymmetric padding (18.5 / 27 /
  18.5 / 24 — inline-start 24px transcribed); borderless items.
- **Cards**: 2px `#edebe4` border, 8px radius, white ground; SemiBold
  20px/24px navy titles; `#edebe4` hover wash.
- **Checkbox**: 1px navy box, 4px radius, navy checked fill + tick asset,
  `accent-color:#224a81`; labels regular 16px/20px navy. No radio line
  geometry published.
- **Search**: 16px/20px navy on `.form-control` geometry, inline-start
  padding zeroed (13px block / 15px right transcribed).
- **Motion**: 200/300/500ms + `ease-in` (all measured); shared transition
  `background-color, color, box-shadow, transform` / 500ms / ease-in.
- **Disabled**: `opacity:.5` (later rule wins over `.7`),
  `cursor:default` on disabled buttons.
- **Overlay**: white at 80 % (last-rule win, see box above).

## Asset officiel

- Ipsen logo = the navy "IPSEN" wordmark (header SVG on ipsen.com). Use the
  official SVG/PNG from the Ipsen brand/press assets — **do not redraw the
  logo by hand**. This package references only font *names* and public
  colour values, never logo artwork or font binaries.
