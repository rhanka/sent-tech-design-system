# Aéroports de Paris → Sentropic mapping

This package maps the **public** Aéroports de Paris (Groupe ADP) web design
onto the Sentropic token structure (`TenantTheme`). Method =
**measured-clone**: the deep-blue / tangerine palette, the squared geometry,
the ring focus, the boxed fields and the Montserrat face are measured from
dated archived copies of the brand's own stylesheets (the live hosts sit
behind a bot wall — see `Upstream access`). Only public values and font
*names* are referenced — no font binaries. Derived/unmeasured values are
flagged `à confirmer`.

> Key measured fact: the action colour is the deep blue `#031f73`, not the
> tangerine. The brand's own 2024 nomenclature calls the blue `theme-main`
> (and the red `theme-submain`), and white on tangerine `#f32518` is 4.13:1 —
> under the 4.5:1 text floor — so the tangerine ships as the accent, never as
> the primary.

## Sources

- Groupe ADP airport site (live, bot-walled) — https://www.parisaeroport.fr/ (`unverified, 2026-09-25, HTTP 200-botwall`: every fetch returns the Incapsula/Imperva Distil challenge, ~1 KB, no content)
- Corporate host (live, redirect) — https://adp.fr/ (`unverified, 2026-09-25, HTTP 301`: answers `301 Moved Permanently` to `https://www.parisaeroport.fr/`; same bot wall past the redirect)
- Current Next.js + Tailwind bundle (measured) — `https://www.parisaeroport.fr/_next/static/css/a7fcb2b99094dd4b.css` (132 397 bytes, Wayback capture 2026-07-03) — the `:root` token block, state tokens, ring focus, Montserrat face, body `#f7f7f7`
- Current font chunk (measured) — `https://www.parisaeroport.fr/_next/static/css/6109a9e78e30d464.css` (1 871 bytes, Wayback capture 2026-07-03) — Montserrat `@font-face` 400/700 (normal + italic) **plus 4 `centuryGothic` `@font-face`** (400/700, normal + italic) that nothing consumes: `centuryGothic` occurs 0× in the current bundle and `html` reads only `var(--font-montserrat)`
- Previous corporate theme (measured) — `https://www.parisaeroport.fr/ADPInternetTheme/css/desktop.min.css` (218 334 bytes, Wayback capture 2024-01-23) — named themes (`main`/`submain`/`groupe`/`fid`), body text, squared buttons, boxed search field, modal overlay, breadcrumb bar, header alert, tags

## Upstream access

`adp.fr` and `www.parisaeroport.fr` are one site behind one CDN. Budget spent
2026-09-25 (3 attempts per host, `curl`, no browser): bare request → `301` to
`https://www.parisaeroport.fr/`; bare + full browser headers (`User-Agent`,
`Accept`, `Accept-Language`, `--compressed`, `Referer`, `Sec-Fetch-*`,
`Upgrade-Insecure-Requests`) → `HTTP 200` with the Distil/Imperva challenge
page (`Ester-La-Dring…`, `_Incapsula_Resource`, `incap_ses_*` cookie); apex
without `www` → same wall; cookie-jar replay → same wall. The Wayback
homepage snapshots (e.g. 2026-09-09) archive the wall itself, but the
`_next/static/css/*.css` bundles and the 2024 `ADPInternetTheme` sheet are
captured with `HTTP 200` and real content — those are the measured artefacts.

## Colour mapping

Counting convention (brand-region counts; both sheets are minified to a few
lines, so the brand region is defined by selector namespace, not by line
span): case-insensitive; exact 6-digit forms counted separately from the
short form (`#fff`, `#aaa`) and the 8-digit alpha form; `rgb()`/`rgba()`
equivalents counted separately. One occurrence is one declaration of the hex
in a rule body (a `--*` custom-property declaration or a property value
containing the hex) — hex strings echoed in Tailwind arbitrary-utility
selectors (`.\[--tangerine-hover\:\#CF1F14\]`) are reported separately as
selector echoes, not as declarations. Every promoted hex below carries its
`var()` references (current sheet) and its literal declarations per file
(`next` = 2026-07-03 bundle, `desk` = 2024-01-23 theme); no promoted hex is
zero of both. Boundary: Tailwind framework mechanics are excluded as ORIGINS
(preflight init, ring mechanics, `.prose` Typography, Radix measure vars),
as are Owl Carousel stock (`.owl-`, `desk`) and the bannered fullPage 3.0.7
vendor chrome (`.fp-*`, `#fp-nav` — licence banner at desk offset ~177503);
brand-config values are retained wherever declared (`:root` tokens,
`theme(colors.*)` resolutions, arbitrary utilities carrying brand hexes — a
`theme()` call does not invent `#CF1F14`), brand re-tints on vendor selectors
(`.theme-*-white .owl-dots`, `#fp-nav` petrol) stay counted as brand with the
selector named, and the brand-authored `#fullpage` sections stay in the
region. Where a whole-file string figure differs from the declaration
figure, both are given.

| Sentropic role | Aéroports de Paris source | Value |
|---|---|---|
| `action.primary` / `surface.inverse` / `border.interactive` / `text` titles | `.theme-main-white{background-color:#031f73!important;color:#fff!important;}` (128× desk, incl. brand `.theme-*-white .owl-dots` re-tints) + 6 brand declarations next (`--title-color`, `--icon-color`, `--blue-focus`, `--blue-hover`, `--enabled-text`, `--surtitle-text` — 11 strings whole-file incl. 1× `.prose` excluded + 4 selector echoes) | `#031f73` |
| `action.primaryHover` | derived: 20% white veil over the primary (`… .content-block .btn:hover:after,… .btn:focus:after{background:rgba(255,255,255,.2)}` → `#354c8f`, white on it 8.13:1) | `#354c8f` *(à confirmer)* |
| `action.primaryText` / `text.inverse` / `surface.default` / `surface.raised` | white on `theme-main`, footer, cards, modal, header (20× short next + 2 declarations of 8-digit `#ffffff57` disabled fills — 4 strings with echoes, no 6-digit `#ffffff` in either sheet; 213× short desk + 3 fullPage-vendor stock `#fff` — 216 strings whole-file) | `#ffffff` |
| `action.secondary` / `blue.10` | `--blue-100-color` (12 var, 1× next) | `#e6e9f1` |
| `action.secondaryHover` | `--blue-200-color` (7 var, 1× next) | `#cdd2e3` |
| blue scale steps (no role) | `--blue-300-color` (4 var) / `--blue-400-color` (4 var) / `--blue-500-color` (9 var) / `--blue-600-color` (4 var) — consumed brand tokens with no Sentropic role | `#b3bcd5` `#95a1c2` `#818fb9` `#6575a8` |
| elevation shadows | derived ink-tinted shadows (no brand scale; tooltip only) | `rgb(3 31 115 / 0.10–0.18)` *(à confirmer)* |
| `action.secondaryText` | `.theme-white-main{background-color:#fff!important;color:#031f73!important;}` (11.95:1 on secondary); hover inverts to solid `#031f73` + white text (measured `.btn.theme-white-main:hover`, transcribed — the hover-text half has no primitive, see À confirmer) | `#031f73` |
| `action.danger` / `feedback.error` | derived (brand publishes no error red; 5.74:1 on white) | `#c81e1e` *(à confirmer)* |
| `text.primary` / `text.link` | `body{…color:#272727…}` (2× desk); `a` declares no colour, `a{text-decoration:none!important}` | `#272727` |
| `text.secondary` | `--surtitle-text` double declaration (`#031F73` + `#4A4A4A`, paired utilities): `#4A4A4A` wins as the distinct surtitle grey (8.86:1 on white; the `#031F73` twin is the primary, not a grey) — documented arbitration | `#4a4a4a` |
| `text.muted` | `.text-legend{…color:#848fb2…}` (4× desk; 3.20:1 on white — documented arbitration) | `#848fb2` |
| `border.subtle` / field stroke | `… .container-search .search-input{border:1px solid #aaa;height:40px;margin:0;}` + filter/dropdown borders (10× short desk; 2.32:1 — decorative hairline, see below) | `#aaaaaa` |
| `border.strong` | `.text-legend` grey-blue (3.20:1) | `#848fb2` |
| `surface.subtle` | `body{background-color:#f7f7f7}` (1× next) | `#f7f7f7` |
| `slate.20` section hairline | `.bordered{border:1px solid #d9deea}` (31× desk) | `#d9deea` |
| `tag.neutralBackground` | `.fil-ariane{background-color:#f5f5f5}` (11× desk; fill transcription) | `#f5f5f5` *(à confirmer)* |
| `surface.overlay` | `.modal-landing{…background-color:rgba(0,0,0,.6)…}` | `rgb(0 0 0 / 0.6)` |
| `cyan.50` accent / `data.category1` | `:root{--tangerine-color:#f32518}` (24 var, 1× next) | `#f32518` |
| tangerine hover | `--tangerine-hover:#CF1F14` (2 var, 1 declaration + 1 selector echo next) | `#cf1f14` |
| `focus.color` / `cyan.70` | `--tangerine-focus:#980000` via `--focus-ring` (3 var, 1 declaration + 1 echo; 8.99:1 on white) — documented arbitration across 12 literal pairs (`advertisement #F2DAE2`, `bars #D5DCF1`, `blue #031F73`, `culture #FCED9C`, `gourmet #EBE7DE`, `hotels #B9DBF3`, `jade #1A604B`, `malachite #00323C`, `restaurants #F5DB96`, `shopping #919CCD`, `tangerine #980000`, `wellBeing #DBEAE1`) + `white→tangerine`, all equally aliased to `--focus-ring`: tangerine wins as the accent, corroborated by the white alias | `#980000` |
| `cyan.10` tint | derived 12% tangerine on white, consistently rounded (253.56/228.84/227.28 → `fe/e5/e3`; no pale tangerine published) | `#fee5e3` *(à confirmer)* |
| legacy red (no role) | `.theme-submain-white{background-color:#e73f0d!important;color:#fff!important;}` (73× desk, 0× next — superseded) | `#e73f0d` |
| `data.category4` / tags / labels | `.theme-groupe-white{background-color:#376db3!important;color:#fff!important;}` (55× desk); `#376db3` is the only non-white 12px/18px uppercase `.tag` and the `listeProjets` `.label-filter label` — arbitration, see Typography (no §8 last-rule applies: distinct selectors, distinct components) | `#376db3` |
| `data.category3` | `.theme-fid-white{background-color:#004650!important;color:#fff!important;}` (58 strings desk — incl. 2 brand re-tints on `#fp-nav` vendor selectors, 56 on strict selector reading; 4× next) | `#004650` |
| `data.category5` / `data.category7` | `--jade-focus:#1A604B` / `--jade-hover:#428873` (3/2 var, 1 declaration + 1 echo each) | `#1a604b` / `#428873` |
| `data.category6` | `--malachite-hover:#286E78` (1 declaration + 1 echo) + `--malachite-focus:#00323C` | `#286e78` |
| `data.category8` | `--icon-prism-text:#5fa691` (1 var, 5× next) | `#5fa691` |
| alert level-2 fill (no role) | `.headerAlert a .alert.bloc_infos_niveau_2{background-color:#f3dd6d;}` (1× desk) | `#f3dd6d` |
| `feedback.success` | derived (brand publishes none; 5.14:1 on white) | `#1e7e34` *(à confirmer)* |
| `feedback.warning` | derived (brand publishes none; 4.87:1 on white) | `#9a6700` *(à confirmer)* |
| `feedback.info` | derived (brand publishes none; 6.70:1 on white) | `#1d4ed8` *(à confirmer)* |

Two documented arbitrations. (1) `surface.default` is white, not the current
body `#f7f7f7`: the measured muted `#848fb2` holds 3.20:1 on white but 2.99:1
on `#f7f7f7` (both figures replayed by hand from the WCAG formula — same
results, 3.20 and 2.99), and white is itself measured across content surfaces
(container, cards, modal, header). (2) `border.subtle` keeps the measured
`#aaa` at 2.32:1 as a decorative hairline (the Schneider precedent,
`#c8d0d4`, does the same); interactive lines clear 3:1 by a margin
(`border.interactive` 14.51:1, `focus.color` 8.99:1).

## À confirmer (derived or no published brand token)

- **`action.primaryHover` `#354c8f`** — computed from the measured hover veil (`rgba(255,255,255,.2)` over `#031f73`); white on it is 8.13:1.
- **Tangerine tint `cyan.10` `#fee5e3`** — 12% tangerine on white, consistently rounded; no pale tangerine is published.
- **Feedback hues** (`success #1e7e34`, `warning #9a6700`, `error #c81e1e`, `info #1d4ed8`, carried into `status.*` and `action.danger`) — the brand publishes no feedback scale; all four clear 4.5:1 on white.
- **Categorical `data.*` set** — every member is a measured hue, but the brand publishes no 8-colour scale, so the set is a coherent proposal.
- **Tabs / pagination / badge / toggle** (`activeText`, fills, geometry) — the brand publishes no such component: `grep -oi '[^{}]*\b(tabs?|onglets?|toggle|switch)\b[^{}]*{'` over the 2024 sheet returns nothing outside Owl, and the current sheet shows only pagination responsive hiding plus Radix accordion animation. Values transcribe the primary; geometry is a coherent proposal.
- **Accordion trigger text and paddings** — the fills (`--Accordion-bg` = blue-200 `#cdd2e3` or white) are measured; the trigger dressing is transcribed.
- **`tag.neutralBackground` `#f5f5f5`** — the tag text/uppercase/size are measured; the chip fill transcribes the pale breadcrumb grey.
- **`alert.paddingLeft` `1.25rem`** — the measured `7.5%` gutter is not transposable to a bounded component.
- **`field` chip paddings, `search` paddings, `choice` line-heights** — transcribed from adjacent measured values.
- **`font.sans`/`font.display` fallback `Arial`** — Montserrat is the measured current face; Arial is the measured historical fallback.
- **`density.*`** — the Sentropic base, corroborated at `md` by three independent 40px heights (`.search-input`, `.fil-ariane`, `.menu-header`); `sm`/`lg` uncorroborated.
- **`typography.field.size` `1.0625rem`, `choice.labelFontSize`, `search.fontSize`** — 17px inherited from `body` (the fields declare no size of their own); `typography.field.lineHeight 1.5` is the Sentropic base.
- **`shadow.*`, `iconSize.*`, `z.*`, `spacing.*`, `borderWidth.thick 2px`, `cursor.*`** — Sentropic base or base-derived; the brand publishes no scale (its own z-indices 2/12/-1 are not transposable; every brand border is 1px).
- **Disabled system** — measured, not absent: `--blue-disabled:#95A1C2` (shared with `--blue-400-color`), `--gray-disabled:#B6B6B6`, `--disabled-bg`/`--transparent-disabled` `#ffffff57`, `--disabled-icon:#fff`, five `--disabled-text` bindings, plus consumed `.disabled:bg-*`/`.disabled:text-*`/`.disabled:opacity-50` (`.5`) utilities. No Sentropic colour role exists for disabled fills/text, so the tokens are recorded here without a role and **`disabledOpacity 0.55`** is retained as a base-derived arbitration against the measured `.5` (à confirmer). Likewise **`cursor.disabled: not-allowed`** transcribes the consumed `.disabled:cursor-not-allowed:disabled` utility; the bare `:disabled{cursor:default}` is Tailwind preflight (vendor default retained).
- **`motion.easing` `ease-in-out`** — measured on the 2024 buttons; the current accordion's `ease-out` disagrees and looks like a Radix/shadcn framework default (cf. the Hermès motion note), so the button value wins and the disagreement is recorded here.
- **`motion.slow` `500ms`** — measured on three sites: `.tooltipADP .tooltipADPContent` (rule 567, `transition:all .5s` with vendor prefixes), `redirection-grille` (rule 795) and `frontTools .mentions` (rule 1505). An earlier note claimed the tooltip carried no transition; it does, written `.5s` rather than `500ms`, which a literal `500ms` search misses. `fast 150ms` (links) and `normal 200ms` (buttons, accordion) are the better-supported steps.
- **`focus.width 2px` / `focus.offset 2px`** — the consumed focus-scoped utilities (`:focus`/`:focus-visible` `ring-2` + `ring-offset-2`; vendor defaults retained, not brand decisions); the bare `.ring` 3px is unscoped and the 0px is the preflight init. Consumed `focus-visible` variants without a primitive: `ring-inset`, `ring-white`, `ring-[--focus-ring]`. The ring *technique* is the brand's; the `#980000` colour is a documented arbitration (see the colour table).
- **`buttonSecondary` hover-text inversion** — the measured `.btn.theme-white-main:hover{background-color:#031f73;color:#fff;…}` inverts fill AND text; the primitive transcribes the fill only, so the white hover text is recorded here without a channel.
- **`card.lineHeight 1.5` / `card.hoverBackground`** — the Sentropic base publishes no `card` block: aligned with the reference theme packages' geometry (à confirmer).
- **`breadcrumb.currentWeight 700`** — unmeasured (`.fil-ariane` declares no `font-weight`); the bold current page is a transcription.
- **`field.select*`** — transcription (the brand styles no native select): chevron redrawn in the main blue with a `2.5rem` gutter (à confirmer).
- **Geometry disagreements (2024 squared vs current bundle)** — the 2024 sheet squares everything (`border-radius:0`), but the current bundle consumes 51 distinct rounded utilities (50 `rounded-*` plus the bare `.rounded`), `.badgeTags{border-radius:4px}` sits against `tag.radius: 0`, and two fullpage CTAs are pills (`border-radius:100px`); the squared transcription stands on the brand-owned 2024 rules and the disagreement is recorded here. Likewise two fullpage hovers repaint petrol (`#004650` backgrounds) against the red-hover narrative — see Typography/Links.
- **`font.mono` system stack** — the Tailwind preflight stack (vendor default retained).
- **`.opacity-increased` variant** (`.opacity-increased{--tangerine-color:#e81c0f;--blue-100-color:#4f629d;…}`) — a measured accessibility-contrast variant, recorded here and not promoted.

## Typography

- **Body / controls / fields / labels / display** (`font.sans`, `font.display`, `typography.control/field/label`): **'Montserrat', Arial, sans-serif** — the current site sets `html{font-family:var(--font-montserrat)}` and ships Montserrat 400/700 (normal + italic) in the 2026-07-03 font chunk. The 2024 theme used **Century Gothic** (`body{font-family:"CenturyGothicW01","Arial",sans-serif}` + archived `CenturyGothicW01-Bold.eot`): a measured disagreement, and the current face wins. We reference the font *name* only.
- **Buttons**: bold (`CenturyGothicW01-Bold` 2024 → Montserrat 700 now), `line-height:1`, no uppercase (no `text-transform` on any `.btn` rule), 14px on the landing context / 17px on the fullpage context (disagreement recorded; 14px transcribed).
- **Labels/legends**: 14px/22px regular (`.text-legend`); filter labels in corporate blue `#376db3` (the `listeProjets` `.label-filter label`; the actus twin at `#e73f0d` is a distinct live component, not an overridden rule — arbitration, corroborated by the `theme-groupe` 55× and the tag below).
- **Tags**: uppercase 12px/18px corporate blue — the `.remonteThematique .wrapOther … .tag` rule, the only non-white 12px/18px uppercase tag (siblings paint `#fff` or `#e73f0d!important` on distinct selectors, so no §8 last-rule applies) — arbitration, corroborated by the `theme-groupe` 55×.
- **Titles**: 44px/52px h1, 30px/38px h2, bold, main blue `#031f73`.
- **Monospace** (`font.mono`): system stack (Tailwind preflight default).
- Links: body colour `#272727` inherited (no colour on `a`), never underlined at rest (`a{text-decoration:none!important}`), repainted on hover — red text on `.footer a:hover{color:#e73f0d!important;…}` and the firstPage fullpage rule, but petrol `#004650` backgrounds on the navBig/selectSlide fullpage hovers (disagreement recorded; no bare `a:hover` exists), still without underline.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — the measured `… .container-search .search-input{border:1px solid #aaa;height:40px;margin:0;}` is a 1px boxed field; the current site styles inputs through HTML utilities (no tie-break available), so the boxed measurement stands. Native `<select>` chevron redrawn in the main blue `#031f73` (transcription — the brand styles no native select — à confirmer).
- **Radius**: squared — `border-radius:0` on buttons, inputs, alerts, dropdowns (`radius.sm/md/lg = 0`); pills stay `999px` (measured `50%`/`100%` dots). Against: 51 distinct rounded utilities consumed by the current bundle (50 `rounded-*` plus the bare `.rounded`), `.badgeTags{border-radius:4px}`, two fullpage pill CTAs (`border-radius:100px`) — disagreements recorded in À confirmer.
- **Focus**: Tailwind **ring** in deep tangerine `#980000` (`focus.strategy = "ring"`, 2px width, 2px offset — the consumed focus-scoped utilities; 8.99:1 on white; colour by documented arbitration). The 2024 `.button:focus{outline:0}` has no measured replacement and is not promoted.
- **Buttons**: primary = solid main blue `#031f73` with **white** text (14.51:1) → hover `#354c8f` (derived veil); secondary = **outlined** in the main blue (transparent fill, `#031f73` border, blue text → hover inverts to solid `#031f73` + white text, measured; the primitive transcribes the fill, the text inversion is recorded in À confirmer).
- **Tabs / top-nav**: no brand component published; active tab = bold main-blue label with a bottom indicator filet (transcription, à confirmer).
- **Pagination**: no brand component published; borderless main-blue links, active page filled main blue with white text (transcription, à confirmer).
- **Breadcrumb**: the `.fil-ariane` bar — 40px tall, 17px text, `#f5f5f5` fill, main-blue links, body-grey trail, grey separators; current-page weight 700 unmeasured (à confirmer).
- **Alert**: the squared `.headerAlert` bar — 10px gutters, 12px text, white level-1 fill (level-2 `#f3dd6d` recorded without a role), no accent filet.
- **Tags / badges**: squared (`radius: 0` — against `.badgeTags{border-radius:4px}`, recorded in À confirmer); tag label uppercase corporate blue; badge filled main blue with white text (transcription).
- **Motion**: 150/200/500ms steps with `ease-in-out` (see À confirmer for the scoping and the `ease-out` disagreement).
- **Density**: Sentropic base, corroborated at `md` by three 40px heights.
- **Density / geometry gaps**: no tab, pagination, toggle or badge component is published (empty greps cited above); those overrides are transcriptions. The disabled system IS published (tokens + utilities — see À confirmer); only its Sentropic projection (`disabledOpacity`, cursor) is derived.

## Asset officiel

- Aéroports de Paris / Groupe ADP logo: the "PARIS AÉROPORT" / Groupe ADP wordmark and its tangerine-red accent as used on the brand site. Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *name* (Montserrat) and public colour values, never logo artwork or font binaries.
