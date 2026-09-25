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
- Current font chunk (measured) — `https://www.parisaeroport.fr/_next/static/css/6109a9e78e30d464.css` (1 871 bytes, Wayback capture 2026-07-03) — Montserrat `@font-face` 400/700
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

Counting convention (whole-file counts; both sheets are minified to a few
lines, so the brand region is defined by selector namespace, not by line
span): case-insensitive; exact 6-digit forms counted separately from the
short form (`#fff`, `#aaa`) and the 8-digit alpha form; `rgb()`/`rgba()`
equivalents counted separately. Every promoted hex below carries its
`var()` references (current sheet) and its literal occurrences per file
(`next` = 2026-07-03 bundle, `desk` = 2024-01-23 theme); no promoted hex is
zero of both. Vendor namespaces excluded from every count: Tailwind
preflight/utilities + Typography (`.prose`) + Radix measure vars (`next`),
Owl Carousel (`.owl-`, `desk`).

| Sentropic role | Aéroports de Paris source | Value |
|---|---|---|
| `action.primary` / `surface.inverse` / `border.interactive` / `text` titles | `.theme-main-white{background-color:#031f73}` (128× desk) + `--title-color`/`--icon-color`/`--blue-focus` (11× next) | `#031f73` |
| `action.primaryHover` | derived: 20% white veil over the primary (`.btn:hover:after{background:rgba(255,255,255,.2)}` → `#354c8f`, white on it 8.13:1) | `#354c8f` *(à confirmer)* |
| `action.primaryText` / `text.inverse` / `surface.default` / `surface.raised` | white on `theme-main`, footer, cards, modal, header (20× short next, 216× short desk) | `#ffffff` |
| `action.secondary` / `blue.10` | `--blue-100-color` (12 var, 1× next) | `#e6e9f1` |
| `action.secondaryHover` | `--blue-200-color` (7 var, 1× next) | `#cdd2e3` |
| blue scale steps (no role) | `--blue-300-color` (4 var) / `--blue-400-color` (4 var) / `--blue-500-color` (9 var) / `--blue-600-color` (4 var) — consumed brand tokens with no Sentropic role | `#b3bcd5` `#95a1c2` `#818fb9` `#6575a8` |
| elevation shadows | derived ink-tinted shadows (no brand scale; tooltip only) | `rgb(3 31 115 / 0.10–0.18)` *(à confirmer)* |
| `action.secondaryText` | `.theme-white-main{color:#031f73}` (11.95:1 on secondary) | `#031f73` |
| `action.danger` / `feedback.error` | derived (brand publishes no error red; 5.74:1 on white) | `#c81e1e` *(à confirmer)* |
| `text.primary` / `text.link` | `body{…color:#272727…}` (2× desk); `a` declares no colour, `a{text-decoration:none!important}` | `#272727` |
| `text.secondary` | `--surtitle-text:#4A4A4A` (1 var, 1× next; 8.86:1 on white) | `#4a4a4a` |
| `text.muted` | `.text-legend{…color:#848fb2…}` (4× desk; 3.20:1 on white — documented arbitration) | `#848fb2` |
| `border.subtle` / field stroke | `.search-input{border:1px solid #aaa}` + filter/dropdown borders (10× short desk; 2.32:1 — decorative hairline, see below) | `#aaaaaa` |
| `border.strong` | `.text-legend` grey-blue (3.20:1) | `#848fb2` |
| `surface.subtle` | `body{background-color:#f7f7f7}` (1× next) | `#f7f7f7` |
| `slate.20` section hairline | `.bordered{border:1px solid #d9deea}` (31× desk) | `#d9deea` |
| `tag.neutralBackground` | `.fil-ariane{background-color:#f5f5f5}` (11× desk; fill transcription) | `#f5f5f5` *(à confirmer)* |
| `surface.overlay` | `.modal-landing{…background-color:rgba(0,0,0,.6)…}` | `rgb(0 0 0 / 0.6)` |
| `cyan.50` accent / `data.category1` | `:root{--tangerine-color:#f32518}` (24 var, 1× next) | `#f32518` |
| tangerine hover | `--tangerine-hover:#CF1F14` (2 var, 2× next) | `#cf1f14` |
| `focus.color` / `cyan.70` | `--tangerine-focus:#980000` via `--focus-ring` (3 var, 2× next; 8.99:1 on white) | `#980000` |
| `cyan.10` tint | derived 12% tangerine on white (no pale tangerine published) | `#fde5e3` *(à confirmer)* |
| legacy red (no role) | `.theme-submain-white{background-color:#e73f0d}` (73× desk, 0× next — superseded) | `#e73f0d` |
| `data.category4` / tags / labels | `.theme-groupe-white{background-color:#376db3}` (55× desk); `.tag`/`.label-filter label` last-rule `#376db3` | `#376db3` |
| `data.category3` | `.theme-fid-white{background-color:#004650}` (58× desk, 4× next) | `#004650` |
| `data.category5` / `data.category7` | `--jade-focus:#1A604B` / `--jade-hover:#428873` (3/2 var, 2× next each) | `#1a604b` / `#428873` |
| `data.category6` | `--malachite-hover:#286E78` (2× next) + `--malachite-focus:#00323C` | `#286e78` |
| `data.category8` | `--icon-prism-text:#5fa691` (1 var, 5× next) | `#5fa691` |
| alert level-2 fill (no role) | `.alert.bloc_infos_niveau_2{background-color:#f3dd6d}` (1× desk) | `#f3dd6d` |
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
- **Tangerine tint `cyan.10` `#fde5e3`** — 12% tangerine on white; no pale tangerine is published.
- **Feedback hues** (`success #1e7e34`, `warning #9a6700`, `error #c81e1e`, `info #1d4ed8`, carried into `status.*` and `action.danger`) — the brand publishes no feedback scale; all four clear 4.5:1 on white.
- **Categorical `data.*` set** — every member is a measured hue, but the brand publishes no 8-colour scale, so the set is a coherent proposal.
- **Tabs / pagination / badge / toggle** (`activeText`, fills, geometry) — the brand publishes no such component: `grep -oi '[^{}]*\b(tabs?|onglets?|toggle|switch)\b[^{}]*{'` over the 2024 sheet returns nothing outside Owl, and the current sheet shows only pagination responsive hiding plus Radix accordion animation. Values transcribe the primary; geometry is a coherent proposal.
- **Accordion trigger text and paddings** — the fills (`--Accordion-bg` = blue-200 `#cdd2e3` or white) are measured; the trigger dressing is transcribed.
- **`tag.neutralBackground` `#f5f5f5`** — the tag text/uppercase/size are measured; the chip fill transcribes the pale breadcrumb grey.
- **`alert.paddingLeft` `1.25rem`** — the measured `7.5%` gutter is not transposable to a bounded component.
- **`field` chip paddings, `search` paddings, `choice` line-heights, `card.hoverBackground`** — transcribed from adjacent measured values.
- **`font.sans`/`font.display` fallback `Arial`** — Montserrat is the measured current face; Arial is the measured historical fallback.
- **`density.*`** — the Sentropic base, corroborated at `md` by three independent 40px heights (`.search-input`, `.fil-ariane`, `.menu-header`); `sm`/`lg` uncorroborated.
- **`typography.field.size` `1.0625rem`, `choice.labelFontSize`, `search.fontSize`** — 17px inherited from `body` (the fields declare no size of their own); `typography.field.lineHeight 1.5` is the Sentropic base.
- **`shadow.*`, `disabledOpacity 0.55`, `iconSize.*`, `z.*`** — Sentropic base or base-derived; the brand publishes no scale (its own z-indices 2/12/-1 are not transposable).
- **`motion.easing` `ease-in-out`** — measured on the 2024 buttons; the current accordion's `ease-out` disagrees and looks like a Radix/shadcn framework default (cf. the Hermès motion note), so the button value wins and the disagreement is recorded here.
- **`motion.slow` `500ms`** — measured, but scoped to the tooltip; `fast 150ms` (links) and `normal 200ms` (buttons, accordion) are the better-supported steps.
- **`focus.width 3px` / `focus.offset 0`** — consumed Tailwind ring defaults (vendor defaults retained, not brand decisions); the ring *technique* and the `#980000` colour are the brand's.
- **`font.mono` system stack** — the Tailwind preflight stack (vendor default retained).
- **`.opacity-increased` variant** (`.opacity-increased{--tangerine-color:#e81c0f;--blue-100-color:#4f629d;…}`) — a measured accessibility-contrast variant, recorded here and not promoted.

## Typography

- **Body / controls / fields / labels / display** (`font.sans`, `font.display`, `typography.control/field/label`): **'Montserrat', Arial, sans-serif** — the current site sets `html{font-family:var(--font-montserrat)}` and ships Montserrat 400/700 (normal + italic) in the 2026-07-03 font chunk. The 2024 theme used **Century Gothic** (`body{font-family:"CenturyGothicW01","Arial",sans-serif}` + archived `CenturyGothicW01-Bold.eot`): a measured disagreement, and the current face wins. We reference the font *name* only.
- **Buttons**: bold (`CenturyGothicW01-Bold` 2024 → Montserrat 700 now), `line-height:1`, no uppercase (no `text-transform` on any `.btn` rule), 14px on the landing context / 17px on the fullpage context (disagreement recorded; 14px transcribed).
- **Labels/legends**: 14px/22px regular (`.text-legend`); filter labels in corporate blue `#376db3` (last rule wins over `#e73f0d`).
- **Tags**: uppercase 12px/18px corporate blue (`.tag`, last rule `#376db3`).
- **Titles**: 44px/52px h1, 30px/38px h2, bold, main blue `#031f73`.
- **Monospace** (`font.mono`): system stack (Tailwind preflight default).
- Links: body colour `#272727` inherited (no colour on `a`), never underlined at rest (`a{text-decoration:none!important}`), repainted red on hover (scoped `.footer a:hover{color:#e73f0d}` + fullpage rules — no bare `a:hover` exists), still without underline.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — the measured `.search-input{border:1px solid #aaa;height:40px}` is a 1px boxed field; the current site styles inputs through HTML utilities (no tie-break available), so the boxed measurement stands. Native `<select>` chevron redrawn in the main blue `#031f73` (transcription — the brand styles no native select).
- **Radius**: squared — `border-radius:0` on buttons, inputs, alerts, dropdowns (`radius.sm/md/lg = 0`); pills stay `999px` (measured `50%`/`100%` dots).
- **Focus**: Tailwind **ring** in deep tangerine `#980000` (`focus.strategy = "ring"`, 3px width, 0 offset — consumed Tailwind defaults; 8.99:1 on white). The 2024 `.button:focus{outline:0}` has no measured replacement and is not promoted.
- **Buttons**: primary = solid main blue `#031f73` with **white** text (14.51:1) → hover `#354c8f` (derived veil); secondary = **outlined** in the main blue (transparent fill, `#031f73` border, blue text, `#e6e9f1` hover fill).
- **Tabs / top-nav**: no brand component published; active tab = bold main-blue label with a bottom indicator filet (transcription, à confirmer).
- **Pagination**: no brand component published; borderless main-blue links, active page filled main blue with white text (transcription, à confirmer).
- **Breadcrumb**: the `.fil-ariane` bar — 40px tall, 17px text, `#f5f5f5` fill, main-blue links, body-grey trail, grey separators.
- **Alert**: the squared `.headerAlert` bar — 10px gutters, 12px text, white level-1 fill (level-2 `#f3dd6d` recorded without a role), no accent filet.
- **Tags / badges**: squared (`radius: 0`); tag label uppercase corporate blue; badge filled main blue with white text (transcription).
- **Motion**: 150/200/500ms steps with `ease-in-out` (see À confirmer for the scoping and the `ease-out` disagreement).
- **Density**: Sentropic base, corroborated at `md` by three 40px heights.
- **Density / geometry gaps**: no tab, pagination, toggle, badge or disabled-state component is published (empty greps cited above); those overrides are transcriptions.

## Asset officiel

- Aéroports de Paris / Groupe ADP logo: the "PARIS AÉROPORT" / Groupe ADP wordmark and its tangerine-red accent as used on the brand site. Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *name* (Montserrat) and public colour values, never logo artwork or font binaries.
