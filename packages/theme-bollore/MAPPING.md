# Bolloré SE → Sentropic mapping

This package maps the **public** Bolloré SE group site (bollore.com, the
holding's institutional WordPress site) onto the Sentropic token structure
(`TenantTheme`). Method = **measured-clone**: the brand action blue
(`#007bc0`, painted literally 89 times — the sheet declares no `--*` colour
token) and the title/grey ramp are read from dated archived copies of the
brand stylesheets; only public values and font *names* are referenced — no
font binaries. Derived/unmeasured values are flagged `à confirmer`.
Measurement date 2026-10-15 on bytes captured 2025-12-13 → 2026-09-23 (both
dates cited per value).

> Key measured fact: the site's brand hue is a single action blue used as
> text, fill and stroke (titles, links, form borders, chevrons) — while the
> base `a` link stays dark grey `#58585a` unadorned, the logo blue `#003764`
> never appears in any CSS or page, and the greens/ambers a status scale
> needs are simply not published (30 distinct hexes: blues, greys, whites,
> reds).

## Sources

- Brand stylesheet (all colour/type/geometry values) — `css/style.css`
  (`https://www.bollore.com/wp-content/themes/bollore/css/style.css`,
  Wayback capture `20260921195002`,
  archive `https://web.archive.org/web/20260921195002id_/https://www.bollore.com/wp-content/themes/bollore/css/style.css`).
  bollore.com direct: unverified, 2026-10-15, HTTP 403.
- Brand override sheet (capsule variants) — `css/style_override.css`
  (`https://www.bollore.com/wp-content/themes/bollore/css/style_override.css`,
  Wayback capture `20260921195002`,
  archive `https://web.archive.org/web/20260921195002id_/https://www.bollore.com/wp-content/themes/bollore/css/style_override.css`).
  bollore.com direct: unverified, 2026-10-15, HTTP 403.
- Stability cross-check (same theme, older path) —
  `css/2025-12-bollo-content/style.css` + `style_override.css`
  (`https://www.bollore.com/bollo-content/themes/bollore/css/style.css`,
  Wayback capture `20251213204321`,
  archive `https://web.archive.org/web/20251213204321id_/https://www.bollore.com/bollo-content/themes/bollore/css/style.css`).
  Override byte-identical; `style.css` differs by one search-fix block only
  (`/* AXOME : Correc recherche */`, `#appfiltreSearch > .containerListeDocs`)
  — no colour, font or length difference.
- Pages FR/EN (inline `<style>` blocks hold WordPress preset/vendor rules
  only — no brand token; header logo binding) — e.g. `html/fr-home.html`
  (`https://www.bollore.com/fr/`, capture `20260923082640`,
  archive `https://web.archive.org/web/20260923082640id_/https://www.bollore.com/fr/`)
  and `html/en-home.html` (`https://www.bollore.com/en/`, capture
  `20260919122309`). bollore.com direct: unverified, 2026-10-15, HTTP 403.
- Font names only (nothing redistributed) — `fonts/gotham/*` (Gotham
  400/700/800 self-hosted `@font-face`, capture `20260921195000`) and the
  single Candal import (style.css:4, Google Fonts sheet capture
  `20261011200530`); the cloud.typography sheet is archived as
  `/* DEACTIVATED */` (capture `20260921195000`).
- Official asset — `img/logo.svg`
  (`https://www.bollore.com/wp-content/themes/bollore/img/logo.svg`,
  capture `20260921194956`): header logo of every page, single fill
  `.st0{fill:#003764}` declared inside the SVG.
- Vendor stock for Step 0.5 separation (never a token source) —
  `css/vendor/*` (tarteaucitron consent, WP RSS Aggregator colorbox, WPML
  blocks) and the in-file vendor regions (Bootstrap `$BOOTSTRAP` shim
  ll.1–1242, icomoon/Font Awesome ll.1247–4760, normalize + H5BP ll.4760–5560,
  slick-carousel ll.7290–7394).

## Colour mapping

Counting convention (travels with every figure below): region = the brand
region of `style.css` (ll.6050–7289 + 7395–17839, embedded slick block
ll.7290–7394 excluded) + `style_override.css` in full; one occurrence = one
literal hex match in a declaration, `/* */` comments excluded, lowercase
normalisation, short/long forms unified (`#fff` ≡ `#ffffff`, transcribed in
6-digit lowercase); 8-digit alpha forms and `rgb()` counted apart, never
merged. The brand declares no colour `--*` token (sole `:root` rule sets
`--check-primary:-10px`), so `var()` colour references = 0 everywhere: the
second number (literal occurrences) carries the consumption proof.
Second spelling: case-insensitive re-grep + a comment-aware re-read (both
agree on the extremes: `#007bc0` 89, `#ffffff` 64 unified = 52 + 12 `#fff`).

| Sentropic role | Bolloré SE source | Value |
|---|---|---|
| `action.primary` / `border.strong` / `border.interactive` / `focus.color` / `text.link` | action blue, 89 occurrences (`.--titleBlue1`, `.--titleBlue9`, `.link--blue{color}`, forms). Text ratio 4.57:1, line floor 3:1 cleared | `#007bc0` |
| `action.primaryHover` / `blue.80` | derived darker blue, 1 HSL step (H/S kept, L−0.05), white-on 5.74 | `#006ba7` *(à confirmer)* |
| `blue.10` | derived light blue tint (H/S kept, L=0.93) | `#dbf2ff` *(à confirmer)* |
| `text.primary` / `choice.labelColor` / `toggle.textColor` | `body{color:#585857}` (18 occurrences), 7.12:1 on white | `#585857` |
| `text.secondary` / `breadcrumb.text` / `breadcrumb.linkText` / `pagination.text` / `surface.inverse` | `a{color:#58585a}` (31 occurrences), 7.10:1 on white; painted section backgrounds | `#58585a` |
| `text.muted` | capsule grey (6: 1 + 5 style_override.css), 3.54:1 on white | `#6c8ca6` |
| `surface.subtle` / `action.secondary` / `buttonSecondary.hoverBackground` zone | `.filiale{background:#f9f9f9}` (11 occurrences) | `#f9f9f9` |
| `surface.default` / `surface.raised` / `field.fillBg` | `body{background-color:#ffffff}` (64 unified occurrences) | `#ffffff` |
| `action.secondaryHover` / `card.hoverBackground` | `.blockPushInfo--invert{background-color:#f1f0ee}` (4 occurrences) | `#f1f0ee` |
| `border.subtle` | `.tableau th/td{border:1px solid #007bbc}` (11 occurrences), 4.61:1 on white | `#007bbc` |
| `surface.overlay` | generic `.overlay{position:fixed;background:rgba(0,0,0,0.7)}` (disclaimer variant 0.5 noted) | `rgba(0, 0, 0, 0.7)` |
| `tabs.activeText` / `pagination.activeBackground` / `badge.infoBackground` | action blue as fill/chevron (slider chevrons, mobile `.--linkPlus` white-on-blue pairing) | `#007bc0` |
| `breadcrumb.currentText` | `.breadcrumb__last{color:#007bc0}` (red variant `#7a1f5e` noted, not promoted) | `#007bc0` |
| `buttonSecondary.border` | `.blockPushInfo--invert .blockPushInfo-link{border-color:#0086cc}` (9 occurrences) | `#0086cc` |
| `cyan.50` accent | capsule `.is-bluegreen` (18: 15 + 3 style_override.css), 4.09:1 — fills/lines only, never text | `#0089a6` |
| `cyan.70` accent | `.--titleBlue2{color:#0f88a5}` (7 occurrences), 4.13:1 — fills/lines only, never text | `#0f88a5` |
| `blue.title4` | `.--titleBlue4{color:#007eba}` (23 occurrences) | `#007eba` |
| `tabs hover/nav` | submenu fill + menu indicator `#1e7dbf` (11 occurrences); hover `color:#1e7dbf` (4.43:1, kept off text roles) | `#1e7dbf` |
| `content-link family` | `.listeEnSavoirPlus__lien a{color:#0095db}` (17 occurrences, underlined rest / plain hover) | `#0095db` |
| `action.danger` / `feedback.error` | `.chiffre__txt1{color:#ce1a37}` + `.popin--information{background:#ce1a37}` (3 occurrences), 5.49:1 on white | `#ce1a37` |
| `alert.background` | `.alertBannerHome{background:#E32948;padding:25px 60px}` (1 occurrence, white Gotham 14px text) | `#e32948` |
| `feedback.success` | derived legible green (5.14:1 on white — no green published) | `#1e7e34` *(à confirmer)* |
| `feedback.warning` | derived dark amber (6.80:1 on white — no amber published) | `#8a4b00` *(à confirmer)* |
| `feedback.info` | brand blue in the info role (4.57:1 on white) | `#007bc0` |

## À confirmer (derived or no published brand token)

- **Blue hover/light tints** (`#006ba7`, `#dbf2ff`) — no hover or tint of the
  action blue published. Chain: start `#007bc0` HSL(201.6, 1.000, 0.376);
  1 step L−0.05 → `#006ba7` (white-on 5.74); light tint at L=0.93 →
  `#dbf2ff`. Replay: `node /tmp/bollore-work/derive.mjs`.
- **Feedback hues** (`success #1e7e34`, `warning #8a4b00`) — the 30-hex
  inventory holds no green and no amber; stand-ins clear WCAG AA on white
  (5.14 / 6.80:1). `info #007bc0` is the measured blue in the info role.
- **`slate.90` convergence** — the darkest painted grey is the link grey
  itself, so `slate.90` = `slate.60` (`#58585a`); no darker neutral published.
- **Secondary-button composition** (transparent fill, `#0086cc` stroke,
  `#007bc0` hover with `#f1f0ee` text) — no secondary-button rule; composition
  of the measured `.blockPushInfo--invert` pairing.
- **Tabs/pagination/badge/card-hover geometry and tab indicator** — no tab,
  page-box or badge component published; structural values with the measured
  nav/chevron/pairing colours (`#1e7dbf` nav fact, `#7a1f5e` red chevron
  variant recorded but not promoted).
- **Accordion/choice/search/toggle/tag geometry** — no such component
  published (only `.faqLink:hover`, `.faqBlock` shell, header search block);
  structural values with measured text colours; search font-size from the
  header search block (15px = 0.9375rem).
- **`shadow.medium/floating`, `motion` unmeasured steps, `radius.pill`,
  `disabledOpacity` (0.55), `spacing`, `z.toast/chat`, `cursor.disabled/text`,
  `iconSize`, `density`, `typography.label`, `breadcrumb.lineHeight`,
  `alert.lineHeight`** — not published; base/structural values. Measured here:
  `shadow.subtle` (image shadow), `motion.fast/normal/slow` + `easing`
  (menu/logo transitions), `transition`, `z.header/overlay/modal`,
  `cursor.interactive`, square radius (absence), `typography.control/field`
  (forms 18px), link underline behaviour, `focus` assignment to the brand blue.
  `medium/floating` are aligned with the reference theme package's geometry.
- **Categorical `data.*` palette** (`#007bc0`, `#58585a`, `#1e7e34`,
  `#8a4b00`, `#ce1a37`, `#1e7dbf`, `#7a1f5e`, `#6c8ca6`) — a coherent proposal
  from the action blue + ramp + accents, not an official scale.
- **Not promoted (measured but excluded)**: `#a0a3a5` mobile-submenu fill =
  unsettled grey in a media-query zone (no stable role, 2.88-class contrast
  unmeasured as text — excluded); `#839bb1` title grey (2.88:1 on white,
  fails even the 3:1 floor — never text, kept out of roles);
  `#0093e0`/`.--linkPlus.is-blue` and `#e91c3a` capsule red recorded as
  context, not roles; live `rgba()` accents (`rgba(0,147,224,0.9)` etc.,
  1 occurrence each, no role); logo `#003764` (SVG-only, zero CSS/HTML
  occurrences — asset, not a painted token); Candal (single decorative use,
  see Typography); WP preset/admin hexes (`#32373c`, `#0693e3`, `#007cba`…)
  = CMS vendor defaults, excluded per Step 0.5.
- **Root**: brand `html{font-size:62.5%}` (style.css:7395) = 10px root (the
  earlier `html{font-size:1em}` rules are H5BP vendor); px→rem transcribed at
  the 16px theme root (e.g. forms 18px = 1.125rem, breadcrumb 1.4rem = 14px =
  0.875rem).
- **Unverified**: which exact stylesheet bytes each page capture rendered
  with — the brand sheets carry no version string, and the sheet capture
  (`20260921195002`) lies between the EN (`20260919122309`) and FR
  (`20260923082640`) page captures (manifeste, notes de capture).

## Typography

- **UI / controls / labels / titles** (`font.sans`, `font.display`,
  `typography.control/field/label`): **'Gotham'** — `body{font-family:"Gotham"}`,
  forms (18px/400), filter selects (800), hero `.slider__title` (Gotham 700,
  5rem), section titles (Gotham 700/800), self-hosted `@font-face` 400/700/800
  (style.css:6050–6069). We reference the font *name* only.
- **Display figure face (measured, not promoted)**: **'Candal'** — single use,
  `.chiffre__h3{font-family:'Candal',sans-serif}` (style.css:9737, key
  figures 7.1rem, `@import` style.css:4). One decorative use does not make it
  the display slot; headings are Gotham.
- **Monospace** (`font.mono`): system stack (no brand monospace published).
- Links: `#007bc0`, underlined at rest and plain on hover (content-link
  pattern: `.listeEnSavoirPlus__lien a`, `.linkT`, `.blockPushInfo-link`,
  `.alertBannerHome p a`); the least-scoped base `a` stays `#58585a`
  unadorned — the Sentropic link role follows the content pattern.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed white fields with a 1px
  brand-blue stroke (`.formsBloc input/select/textarea`, `.formsBloc__textarea`,
  `.filtreDocuments select{border:solid 1px #007bc0}` + `appearance:none`,
  blue placeholders). Native `<select>` chevron redrawn in `#007bc0`.
- **Radius**: square everywhere (`radius.sm/md/lg = 0` — measured absence: the
  brand region's only `border-radius` hits are the decorative loader `50%`);
  pills stay `999px` (structural).
- **Focus**: browser-default **outline** technique (no focus technique
  published — only scoped `outline:none` resets, no positive rule after them;
  last focus rule `.popin--information .popin__link:focus`), 2px/2px, routed
  to the measured brand blue `#007bc0` (4.57:1, clears the 3:1 line floor;
  role assignment à confirmer).
- **Buttons**: primary = solid action blue `#007bc0` with white text
  (measured mobile `.--linkPlus` pairing + capsule-link hovers); secondary =
  invert push-link composition (transparent, `#0086cc` stroke, `#007bc0`
  hover); CTA `.linkG` = 2px blue-bordered block.
- **Tabs / top-nav**: bold menu links turning `#1e7dbf` on hover over a
  `#1e7dbf` submenu with white links; active tab = action blue `#007bc0`,
  transparent fill, bottom border indicator.
- **Pagination**: no page-box published; slider chevrons in `#007bc0` (red
  variant `#7a1f5e`), pointer cursor with scale-on-hover; active page = filled
  blue with white text (measured pairing).
- **Breadcrumb**: transcribed (`.breadcrumb`: 14px/500 Gotham, current page
  `#007bc0`, red variant `#7a1f5e`).
- **Alert**: transcribed homepage banner (red `#e32948` fill, 25px/60px
  padding, white Gotham 14px text with underlined links, glyph marker).
- **Density**: no standard control-height system (em-scoped components only —
  greps: `filtreDocuments select` → `font-size:2em` +
  `padding:0.4em 2.9em 0.45em 0.95em`; `formsBloc input` → `font-size:18px`,
  no height; header search input → `padding-top:3px` only). Base values reused
  explicitly (à confirmer).

## Asset officiel

- Bolloré SE header logo (`img/logo.svg`, every page,
  `<img …/img/logo.svg>`): single fill `.st0{fill:#003764}` declared inside
  the SVG. Use the official SVG from the brand assets — **do not redraw the
  logo by hand**. This package references only font *names* and public colour
  values, never logo artwork or font binaries. The logo blue is an asset
  value, not a painted CSS token (zero CSS/HTML occurrences), so it carries
  no Sentropic role.
