# Eurofins Scientific → Sentropic mapping

This package maps the **public** Eurofins Scientific corporate site design onto
the Sentropic token structure (`TenantTheme`). Method = **measured-clone**:
the corporate blue (`#003883`, `--primary-color`), the accessible orange
(`#E3660E`, `--accessible-color`), the neutral scale and the system hues are
read from the brand's own `:root` declarations and brand-scoped rules in the
official stylesheets linked from the brand homepages. Only public values and
font *names* are referenced — no font binaries. Derived/unmeasured values are
flagged `à confirmer`.

> Key measured fact: the brand file `style.min.css` (821 016 bytes) is a
> brand-themed Bootstrap 5.3 build, stratified as
> [brand `:root` tokens 94–1880] [Bootstrap vendor region 1887–~235000]
> [brand rules >235000]. The vendor region's theme values are re-pointed at
> the brand's own tokens (`--bs-primary:#003883`,
> `--bs-secondary:#EE7D11`, `--bs-success:#317234`,
> `--bs-link-color:#003883`, `--bs-link-decoration:none`, and the radius
> scale re-tinted on three steps (`--bs-border-radius-sm:3px`,
> `--bs-border-radius-lg:6px`, `--bs-border-radius-xl:8px`) while the base
> step keeps the vendor default (`--bs-border-radius:0.375rem`, identical in
> stock Bootstrap 5.3.8). The brand origin
> of each value is the opening brand `:root{--primary-color:#003883;…}`
> token block plus the brand-scoped custom rules (header/nav/hero/footer,
> Fira Sans + Inter + brand hexes) — never the vendor defaults
> (`--bs-danger:#dc3545`, `--bs-info:#0dcaf0`, `--bs-warning:#ffc107` stay
> vendor and are NOT used). Only 6 `--bs-*` occurrences sit beyond offset
> 235000 (`--bs-dropdown-padding-y`, `--bs-breadcrumb-margin-bottom` ×3,
> `--bs-gutter-x`, `--bs-border-radius`) — spacing/radius overrides, none
> carrying colour. The separately downloaded `bootstrap_v5.3.8.min.css`
> contains 0 occurrences of `#003883`. The separate `swiper-bundle` file is
> pure vendor and contributes nothing. No consent-banner / OneTrust / Didomi
> / Tealium block was found in the brand file (grep for
> `tealium|onetrust|didomi|cookiebot|trustarc` returns nothing).

## Sources

- Eurofins Scientific corporate site (primary host) — https://www.eurofins.com/
  (serves the brand stylesheets; brand `:root` tokens, link colour, focus
  ring, CTA geometry, footer navy).
- Eurofins France site — https://www.eurofins.fr/ (redirects to
  `https://www.eurofins.com/fr-fr/`; serves a parallel stylesheet set with
  **identical** brand tokens — see host agreement below).
- Brand stylesheet (com) —
  `https://cdnmediaassets.eurofins.com/eurofins-corporate/css/style.min.css`
  (brand `:root` block + brand-scoped rules + embedded themed-Bootstrap
  region).
- Brand stylesheet (fr) —
  `https://cdnmediaassets.eurofins.com/eurofins-european-west/css/style.min.css`
  (same content, same tokens).
- Brand font faces —
  `https://cdnmediaassets.eurofins.com/eurofins-corporate/css/font_style.css`
  (33 338 bytes; 79 `@font-face` blocks, one `font-family:` declaration
  each: 18 `Fira Sans`, 18 `Fira Sans Condensed`, 18 `Inter`, 18 `Roboto`,
  7 `Manrope`; case-sensitive `Inter` ×18, `Fira Sans` ×36 — the 36 counting
  the `Fira Sans Condensed` names; lowercase `inter` ×54 are font-file URL
  slugs, not family declarations).
- Brand overrides —
  `https://cdnmediaassets.eurofins.com/eurofins-corporate/css/customstyles.css`
  (96 bytes; a single `@media (min-width: 1024px)` rule hiding
  `.short-block .hide-intro` — no colour, nothing transcribed, listed here
  for enumeration completeness).

## rem root

No `font-size` declaration on `html` or `:root` in either brand stylesheet
(grep for `html{…font-size…}` and for `62.5%` returns nothing), so the brand
root is the **16px browser default** and every transcribed rem value converts
1:1 into this theme's own 16px-root output (`.375rem` = 6px, `.5rem` = 8px,
`.75rem` = 12px, `1rem` = 16px, `2.5rem` = 40px gutter).

## Host agreement (Step 0.3)

`eurofins.com` and `eurofins.fr` (via `eurofins.com/fr-fr/`) serve
**byte-identical** `style.min.css` files (821 016 bytes each, same md5
`f5cb661d38390693eb3c02d5de0524a8) — a single artefact, not two agreeing
sources, so the "agreement" measures nothing beyond that identity and there
is no disagreement to arbitrate. Per-file counts are trivially equal —
`#003883`: 354 / 354, `#EE7D11`: 102 / 102, `#E3660E`: 227 / 227,
`#212b36`: 1 / 1 (com / fr). `eurofins.com` wins as the primary source per
the mission order.

## Colour mapping

| Sentropic role | Eurofins Scientific source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `text.link` | brand `:root` `--primary-color` + `--bs-primary:#003883`, `--bs-link-color:#003883`, `.btn-primary{--bs-btn-bg:#003883}` (themed-Bootstrap brand re-point) | `#003883` |
| `action.primaryHover` | `.btn-primary{--bs-btn-hover-bg:rgb(0, 47.6, 111.35)}` → nearest `#00306F` (brand; rounding convention: nearest, lowercase) | `#00306F` |
| `action.primaryText` | `.btn-primary{--bs-btn-color:#ffffff}` (brand) | `#ffffff` |
| `action.secondary` | brand `:root` `--sky-background` | `#EBF3FF` |
| `action.secondaryHover` | brand `:root` `--cool-blue` — declared but never painted (1 occurrence: its own declaration; zero `var()`, zero brand-region paint; gap documented — see paint accounts and `À confirmer`) | `#DCEBFF` |
| `action.secondaryText` | corporate blue (brand) | `#003883` |
| `action.danger` / `feedback.error` | brand `:root` `--crimson-red` + brand-scoped `.preview_sec .btn.reject_btn{background-color:#b71c1c;color:#fff;font-family:"Fira Sans",sans-serif;…}` (the `.preview_sec` scope is part of the citation) | `#b71c1c` |
| `feedback.success` | brand `:root` `--green` + `--bs-success:#317234` (brand re-point) | `#317234` |
| `feedback.warning` | brand `:root` `--burnt-orange` (4.59:1 on white, passes AA directly) | `#C75000` |
| `feedback.info` | brand `:root` `--bright-blue` (5.55:1 on white) | `#0061E0` |
| `surface.default` / `surface.raised` / `field.fillBg` | brand `:root` `--body-color:#fff` (expanded form `#ffffff`; short `#fff` ×254 in the brand region) + `#functionalMenu input.functional-search-input{background:#ffffff!important}` (brand) | `#ffffff` |
| `surface.subtle` | brand `:root` `--gray-background` | `#FAFAFA` |
| `surface.inverse` | brand `:root` `--navy-blue` + `.footer{background-color:#00224F;border-bottom:12px solid var(--orange-500-brand,#EE7D11)}` (brand) | `#00224F` |
| `surface.overlay` | derived navy tint (no brand backdrop — see below) | `rgb(0 34 79 / 0.6)` *(à confirmer)* |
| `text.primary` | brand `:root` `--dark-gray:#333333` — the operating black: 103 brand-region occurrences (`#333333` ×20 + `#333` ×83) and painted via `var(--Grey-900,#333333)` ×8 / `var(--Grey-900,#333)` ×2 / `var(--Neutral-900,#333333)` ×4 / `var(--Neutral-900,#333)` ×1 (12.63:1 on white) | `#333333` |
| `text.secondary` | brand `:root` `--grey:#666` (5.74:1 on white; expanded form `#666666` has 0 literal occurrences — 49 as `#666`) | `#666666` |
| `text.muted` | brand `:root` `--dim-gray` (8.45:1 on white) | `#4D4D4D` |
| `text.inverse` | white on dark/coloured surfaces (brand buttons/footer) | `#ffffff` |
| `border.subtle` | brand `:root` `--light-gray` | `#E5E5E5` |
| `border.strong` | brand `:root` `--gray-2` (3.95:1 on white, passes the 3:1 line threshold) | `#808080` |
| cyan accent `50` | brand `:root` `--accessible-color` + brand-scoped `border-bottom:6px solid #E3660E` (`.nav`, plus news-room tab and boiler-plate rules) and `border-left:8px solid #E3660E` navigation rules (`.nav__mobilelink:hover`, `.dropdown__link:hover`, mega-menu `p`) | `#E3660E` |
| cyan accent `70` | brand `:root` `--burnt-orange` | `#C75000` |
| cyan accent `10` | brand `:root` `--beige` | `#FEF8F3` |
| blue tint `10` | brand `:root` `--sky-background` | `#EBF3FF` |
| deep brand blue (`data.category7`) | brand `:root` `--deep-blue` | `#004BAD` |
| secondary orange (raw trace, no role) | brand `:root` `--secondary-color` + `.btn-get-started{background:linear-gradient(87deg,#C75000 .28%,#E66C0F 73.95%,#EE7D11 99.17%)}` (brand) — kept as a raw-palette trace; it reaches no role (`buttonSecondary` carries no orange) | `#EE7D11` |
| soft purple (`data.category6`) | brand `:root` `--purple` (menu hover states) | `#9398C7` |
| `tabs.activeText` / `pagination.text` / `breadcrumb.linkText` | corporate blue (brand) | `#003883` |
| `pagination.activeText` / `badge.infoText` | white on corporate blue (à confirmer) | `#ffffff` *(à confirmer)* |

### Measurement convention and paint accounts (Step 0.5, §3(b))

Counts below are computed on the **brand region alone** (bytes after offset
235000 of `style.min.css` — the brand rules; the `:root` token block
94–1880 and the vendor region 1887–~235000 are excluded), re-measured for
this fix on 2026-09-25. Convention: case-insensitive match on the
lowercased sheet; canonical 6-digit form per hex, short forms (`#666`,
`#333`, `#fff`) counted **separately**; no 8-digit alpha hex exists in the
file; `rgb()` spellings are noted separately (`rgb(0 56 131)` ×49 — 6 vendor
(focus rings, including the three general controls) + 43 brand-region (hero
gradients, e.g. `.hero .carousel-item-1:before` at offset 257149);
`rgb(0, 47.6, 111.35)` ×1, the `#00306F` hover origin).
File totals vs brand region: `#003883` 354 / 325, `#EE7D11` 102 / 88,
`#E3660E` 227 / 226, `#317234` 20 (= 1 token declaration + 16 vendor + 3
brand), `#212b36` 1 / 0, `#DCEBFF` 1 / 0.

Consumption is not the test — painting is: a hex is operative if carried by
`var()` **or** painted literally in brand rules (the brand paints in hex
literals; most declaring tokens have zero direct `var()`). `var()` counts
below are `var()` references carrying the hex (any token name, brand
region); literals are hex-string occurrences in the brand region (including
inside `var()` fallbacks — the two columns overlap by construction). Only
two hexes promoted from a brand token score zero on both (the derived
`#00306F` row carries no declaring token and sits outside this count):

| Hex | Declaring token | `var()` brand | Literal brand | Finding |
|---|---|---|---|---|
| `#003883` | `--primary-color` | 82 (`--blue-500-brand` ×60, `--blue-blue-brand` ×22) | 325 | operative |
| `#00306F` | none (derived hover) | 0 | 0 | derived, à confirmer (exact rounding of `rgb(0, 47.6, 111.35)`) |
| `#ffffff` | `--body-color`/`--white` | 58 across spellings (55 exact: 51 `--Black-and-White-White` + 4 `--Greyscale-White`; 3 short `#FFF`) | 103 (+ 254 short `#fff`) | operative |
| `#FAFAFA` | `--gray-background` | 27 | 49 | operative |
| `#E5E5E5` | `--light-gray` | 10 exact (+ 6 `--Grey-200,#CCC` variant refs) | 33 | operative |
| `#808080` | `--gray-2` | 12 exact (+ 1 `--Grey-600,#666` variant) | 13 | operative |
| `#666666` | `--grey:#666` | 6 (short-form fallbacks; expanded `#666666` has 0 literals) | 49 as `#666` | operative |
| `#4D4D4D` | `--dim-gray` | 4 (`--Grey-800`) | 9 | operative |
| `#333333` | `--dark-gray` | 15 across spellings (12 exact: 8 `--Grey-900` + 4 `--Neutral-900`; 3 short `#333`: 2 + 1) | 20 (+ 83 short `#333`) | operative — the text black |
| `#00224F` | `--navy-blue` | 1 | 21 | operative |
| `#EBF3FF` | `--sky-background` | 0 | 4 | operative (thin, literals only) |
| `#DCEBFF` | `--cool-blue` | **0** | **0** | **unpainted** — role kept, gap documented (see `À confirmer`) |
| `#212b36` | `--heading-color` | **0** | **0** | **unpainted** — demoted to raw palette, no role |
| `#004BAD` | `--deep-blue` | 3 (`--blue-blue-brand` fallback) | 18 | operative |
| `#0061E0` | `--bright-blue` | 7 (`--Blue-300`) | 17 | operative |
| `#E3660E` | `--accessible-color` | 4 (`--orange-600-accessible`) | 226 | operative |
| `#EE7D11` | `--secondary-color` | 4 (`--orange-500-brand` fallback, e.g. footer `border-bottom`) | 88 | operative as raw trace (no role) |
| `#C75000` | `--burnt-orange` | 0 | 30 | operative (literals only) |
| `#FEF8F3` | `--beige` | 0 | 2 | operative (thin, literals only) |
| `#317234` | `--green` | 0 | 3 (`.preview_sec` success rules) | operative (thin; sole green, `--bs-success` re-point) |
| `#b71c1c` | `--crimson-red` | 0 | 3 (`.preview_sec .btn.reject_btn` + kin) | operative |
| `#9398C7` | `--purple` | 0 | 7 (menu hovers) | operative |
| `rgb(0 0 0 / 0.25)` | none (measured) | n/a (`rgb()` spelling) | 31, all brand-region — cited `box-shadow:0 6px 24px 0 rgb(0 0 0 / .25)` ×2 on `.language_menu` (offsets 341895, 344341) | operative — `shadow.subtle` |
| `rgb(0 34 79 / 0.14)` | none (derived) | n/a (`rgb()` spelling) | 0 | borrowed — `shadow.medium` (à confirmer) |
| `rgb(0 34 79 / 0.18)` | none (derived) | n/a (`rgb()` spelling) | 0 | borrowed — `shadow.floating` (à confirmer) |

Corroborating measured fact: the fallback-token family actually consumed —
`var(--blue-500-brand,#003883)` ×60, `var(--blue-blue-brand,#003883)` ×22
(+ 3 with `#004BAD`), `var(--Black-and-White-White,#ffffff)` ×51 (+ 3
`#FFF`), `var(--Grey-50,#FAFAFA)` ×27, `var(--Grey-600,#808080)` ×12,
`var(--Grey-200,#E5E5E5)` ×10 (+ 6 `#CCC`), `var(--Blue-300,#0061E0)` ×7,
`var(--orange-600-accessible,#E3660E)` ×4, `var(--Grey-800,#4D4D4D)` ×4,
`var(--Grey-900,#333333)` ×8 (+ 2 `#333`), `var(--Neutral-900,#333333)` ×4
(+ 1 `#333`) — is **declared in none of the four linked sheets** (zero
`--blue-500-brand:`-style declarations in `style.min.css`, `font_style.css`,
`customstyles.css` and stock Bootstrap alike) and reads only through its
fallbacks. It corroborates every value above except `#212b36` and `#DCEBFF`.
Note: the combined `var()` carriage across both `#333` spellings is 15 (10
`Grey-900` + 5 `Neutral-900`) — recorded here exactly rather than attributed
to one family.

Scope notes (trap 5): the site-wide link colour is
`--bs-link-color:#003883` (least-scoped, covers all content links); the
breadcrumb's own links are menu-scoped
(`#businessLineMenu .breadcrumb a{color:#fff}`, hover `#9398C7`) and are NOT
used for any text role. The focus ring `box-shadow:0 0 0 .25rem rgb(0 56 131
/ .25)` (rgb(0 56 131) = `#003883`) is declared on `.form-control:focus`,
`.form-select:focus` and `.form-check-input:focus` — three general controls,
not one scoped widget — so it is the site-wide focus value; the selectors
themselves are Bootstrap-namespace rules in the vendor region and only the
tint is brand. The accompanying
`border-color:rgb(127.5,155.5,193)` (one per selector) has no primitive
carrying it. The orange `#E3660E` occurrences cited are brand-scoped
decorative rules (nav `border-bottom`, navigation `border-left` filets),
not vendor blocks.

## À confirmer (derived or no published brand token)

- **`surface.overlay`** `rgb(0 34 79 / 0.6)` — the brand publishes no modal
  backdrop: the only backdrop rules in the brand file are the Bootstrap
  vendor `.modal-backdrop{--bs-backdrop-bg:#000;…opacity:0.5}` block
  (excluded per Step 0.5); greps for `.modal-overlay` and `.backdrop` outside
  that vendor block return nothing. Derived navy tint.
- **Categorical `data.*` composition** (`#003883`, `#E3660E`, `#0061E0`,
  `#317234`, `#C75000`, `#9398C7`, `#004BAD`, `#333333`) — every hex is a
  brand-declared variable, but the 8-colour scale itself is a coherent
  proposal, not an official scale.
- **`action.secondaryHover` `#DCEBFF`** — brand-declared (`--cool-blue`)
  but never painted (1 occurrence: its own declaration; zero `var()`, zero
  brand-region paint). Kept for the mandatory role with this gap documented
  rather than inventing a hover the brand never published.
- **`--heading-color:#212b36`** — brand-declared but never painted (1
  occurrence: its own declaration; zero `var()`, zero brand-region paint).
  Demoted to the raw palette with no role; `text.primary` and every
  near-black usage now follow the operating black `--dark-gray:#333333`.
- **Control density heights** (`2rem`/`2.5rem`/`3rem`), `gap`, `minWidth`,
  sm/lg paddings and `fontSize` steps — the brand publishes no general
  control height; kept aligned with the reference theme package's geometry.
  Only md `paddingBlock`/`paddingInline`/`fontSize` are measured
  (`.form-control`). `controlHeight`/`iconSize` match the Sentropic base
  (verified against `packages/tokens/src/foundation.ts`).
- **`shadow.medium` / `shadow.floating`**, **`motion.*`**,
  **`disabledOpacity`**, **`transition`** — not published by the brand;
  aligned with the reference theme package's geometry. (`shadow.subtle` is
  the measured brand menu shadow.)
- **`typography.label`, link hover decoration** — aligned with the
  reference theme package's geometry (`typography.control` is now fully
  measured: family/weight/size/line-height from `.btn-get-started`
  `font-family:"Fira Sans",sans-serif;font-size:20px;font-weight:700;line-height:24px`,
  i.e. `1.25rem` / `1.2`).
- **The 12 component overrides' geometry** (`card`, `buttonSecondary`,
  `tabs`, `pagination`, `breadcrumb`, `alert`, `accordion`, `tag`, `badge`,
  `choice`, `search`, `toggle` paddings/sizes/weights) — aligned with the
  reference theme package's geometry, carrying brand-measured hexes.
- **Font fallback stacks** — `Inter` and `Fira Sans` are the brand-declared
  names; the exact fallback lists are a faithful expression.
- **`pagination.activeText` / `badge.infoText`** `#ffffff` — white on the
  corporate blue follows the brand's own button text
  (`.btn-primary --bs-btn-color:#ffffff`), applied to new roles.

## Accessibility

No stop-rule chain was required: every text role passes its threshold from
measured values on `surface.default` `#ffffff` — `text.primary` 12.63:1,
`text.secondary` 5.74:1, `text.muted` 8.45:1, `text.link` 11.09:1,
`action.primaryText` 11.09:1, `feedback.success` 5.85:1,
`feedback.warning` 4.59:1, `feedback.error` 6.57:1, `feedback.info` 5.55:1;
line roles `border.interactive` / `focus.color` 11.09:1 and
`border.strong` 3.95:1 clear 3:1. The orange accent `#E3660E` (3.40:1) and
`#EE7D11` (2.77:1) fail 4.5:1 as text and are therefore never used in a text
role — accent fills and data categories only (the Renault-Yellow precedent).
Rounding convention for the hover transcription: nearest, lowercase.

## Typography

- **Body / controls / fields** (`font.sans`, `typography.field`): **`'Inter'`**
  — `--body-font:"Inter", sans-serif` in the brand `:root`, used across
  brand-scoped rules (`font-family:"Inter",sans-serif` with brand hexes).
  We reference the font *name* only.
- **Display / headings / brand buttons** (`font.display`,
  `typography.control`): **`'Fira Sans'`** — `--heading-font:"Fira Sans",
  sans-serif` in the brand `:root`, `@font-face` faces in `font_style.css`,
  brand rules `h2{…font-family:"Fira Sans",sans-serif…}`,
  `.btn-get-started{…font-family:"Fira Sans",sans-serif;font-weight:700…}`.
- **Monospace** (`font.mono`): system stack.
- Links: corporate blue `#003883`, not underlined at rest
  (`--bs-link-decoration:none`), underlined on hover (à confirmer).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff`
  fill, 1px border, 8px brand radius via the scoped
  `.footer … .form-control{display:block;border-radius:8px}` /
  `.form-control-mobile` brand rules — no unscoped
  `.form-control{border-radius:8px}` exists; the bare `.form-control` rule is
  vendor and declares `var(--bs-border-radius)` = 6px). Native `<select>`
  chevron redrawn in corporate blue `#003883` (the shipped `.form-select`
  chevron `stroke='%23343a40'` is the vendor default, so the redraw is
  derived) with the measured `.form-select`
  `padding:.375rem 2.25rem .375rem .75rem` gutter (`selectPaddingRight:
  "2.25rem"`, vendor namespace adopted for metrics).
- **Control geometry search (evidence)**: brand button/input/select greps —
  `.btn-get-started{…height:68px;padding:10px 24px;…}` and
  `.btn-get-notify{…height:68px;…}` (hero-CTA-scoped, not general);
  `.career-section … .form-control-mobile{…height:52px;…}` (career-search-scoped,
  with 48px variants in nested search inputs); `.nav__toggle{…height:52px}`
  (nav-scoped); `.search-row-input{…height:42px;…}` and `#functionalMenu
  input.functional-search-input{background:#ffffff!important;…}` (search-widget-scoped);
  48px on responsive hero CTAs and `.btn-square` buttons;
  `.form-control{display:block;width:100%;padding:.375rem .75rem;font-size:1rem;…}`
  and `.form-control{min-height:calc(1.5em + 0.75rem + …)}` (Bootstrap vendor
  namespace, adopted for md metrics only). Every height is scoped and they
  contradict each other — no brand rule publishes a general control height,
  hence base heights, à confirmer.
- **Radius**: the brand re-tints three steps of the Bootstrap scale
  (`--bs-border-radius-sm:3px`, `--bs-border-radius-lg:6px`,
  `--bs-border-radius-xl:8px`); the base step keeps the vendor default
  (`--bs-border-radius:0.375rem`, identical in stock Bootstrap 5.3.8), so the
  generic control still answers 6px (`radius.sm = 0.375rem`) — grounded on the
  shipped declaration (offset 5421) consumed by the vendor `.form-control`
  rule via `var(--bs-border-radius)`, not on a brand re-tint; the 8px `-xl`
  is measured on
  CTAs, scoped inputs and menus — 49 strict `border-radius:8px` declarations
  in the brand region vs 24 at 4px (54 vs 34 raw occurrences, the remainder
  multi-value shorthands) — hence `radius.md = 0.5rem`; cards `0.5rem`
  à confirmer; pills stay `999px`.
- **Focus**: box-shadow **ring** in corporate blue `#003883`
  (`focus.strategy = "ring"`, width `0.25rem`, offset `0`) — the selectors
  (`.form-control:focus`, `.form-select:focus`, `.form-check-input:focus`)
  are Bootstrap-namespace rules in the vendor region and only the tint is
  brand: `outline:0` plus the `.25rem` ring on every general form control.
- **Buttons**: primary = solid corporate blue `#003883` with **white** label
  → hover `#00306F`; secondary = **outlined** corporate blue (transparent
  fill, `#003883` border + text, `#EBF3FF` hover fill).
- **Tabs / top-nav**: active tab = corporate-blue label `#003883` with a
  bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless corporate-blue links; active page = filled
  corporate blue `#003883` with white text.

## Upstream access

No block encountered (2026-09-25): `https://www.eurofins.com/` answers
`301` (redirect to `/en/`, then `200`) identically for the bare request, the
UA-only request, and the full browser-header request; stylesheets download
with the bare request. `https://www.eurofins.fr/` answers `200` via redirect
to `https://www.eurofins.com/fr-fr/`.

## Asset officiel

- Eurofins Scientific logo = the Eurofins wordmark/symbol. Use the official
  SVG/PNG from the brand assets — **do not redraw the logo by hand**. This
  package references only font *names* (Inter, Fira Sans) and public colour
  values, never logo artwork or font binaries.
