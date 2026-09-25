# Eurofins Scientific → Sentropic mapping

This package maps the **public** Eurofins Scientific corporate site design onto
the Sentropic token structure (`TenantTheme`). Method = **measured-clone**:
the corporate blue (`#003883`, `--primary-color`), the accessible orange
(`#E3660E`, `--accessible-color`), the neutral scale and the system hues are
read from the brand's own `:root` declarations and brand-scoped rules in the
official stylesheets linked from the brand homepages. Only public values and
font *names* are referenced — no font binaries. Derived/unmeasured values are
flagged `à confirmer`.

> Key measured fact: the brand file `style.min.css` is a brand-themed
> Bootstrap 5.3 build — it embeds a Bootstrap vendor region (the `--bs-*`
> variable system and generic `.btn` / `.dropdown` / `.nav-pills` /
> `.pagination` / `.progress` / `.list-group` component rules) whose theme
> values the brand re-points at its own tokens (`--bs-primary:#003883`,
> `--bs-secondary:#EE7D11`, `--bs-success:#317234`,
> `--bs-link-color:#003883`, `--bs-link-decoration:none`). The brand origin
> of each value is the opening brand `:root{--primary-color:#003883;…}`
> token block plus the brand-scoped custom rules (header/nav/hero/footer,
> Fira Sans + Inter + brand hexes) — never the vendor defaults
> (`--bs-danger:#dc3545`, `--bs-info:#0dcaf0`, `--bs-warning:#ffc107` stay
> vendor and are NOT used). The separate `bootstrap_v5.3.8.min.css` and
> `swiper-bundle_v_11.2.10.min.css` files are pure vendor and contribute
> nothing. No consent-banner / OneTrust / Didomi / Tealium block was found in
> the brand file (grep for `tealium|onetrust|didomi|cookiebot|trustarc`
> returns nothing).

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
  (`@font-face` for `Fira Sans`; 54 mentions of `Inter`).

## rem root

No `font-size` declaration on `html` or `:root` in either brand stylesheet
(grep for `html{…font-size…}` and for `62.5%` returns nothing), so the brand
root is the **16px browser default** and every transcribed rem value converts
1:1 into this theme's own 16px-root output (`.375rem` = 6px, `.5rem` = 8px,
`.75rem` = 12px, `1rem` = 16px, `2.5rem` = 40px gutter).

## Host agreement (Step 0.3)

`eurofins.com` and `eurofins.fr` (via `eurofins.com/fr-fr/`) **agree
exactly**: same `:root` token block
(`--primary-color:#003883;--secondary-color:#EE7D11;--accessible-color:#E3660E;…`)
and identical per-file occurrence counts in `style.min.css` —
`#003883`: 354 / 354, `#EE7D11`: 102 / 102, `#E3660E`: 227 / 227,
`#212b36`: 1 / 1 (com / fr). No disagreement to arbitrate; `eurofins.com`
wins as the primary source per the mission order.

## Colour mapping

| Sentropic role | Eurofins Scientific source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `text.link` | brand `:root` `--primary-color` + `--bs-primary:#003883`, `--bs-link-color:#003883`, `.btn-primary{--bs-btn-bg:#003883}` (themed-Bootstrap brand re-point) | `#003883` |
| `action.primaryHover` | `.btn-primary{--bs-btn-hover-bg:rgb(0, 47.6, 111.35)}` → nearest `#00306F` (brand; rounding convention: nearest, lowercase) | `#00306F` |
| `action.primaryText` | `.btn-primary{--bs-btn-color:#ffffff}` (brand) | `#ffffff` |
| `action.secondary` | brand `:root` `--sky-background` | `#EBF3FF` |
| `action.secondaryHover` | brand `:root` `--cool-blue` | `#DCEBFF` |
| `action.secondaryText` | corporate blue (brand) | `#003883` |
| `action.danger` / `feedback.error` | brand `:root` `--crimson-red` + brand-scoped `background-color:#b71c1c;color:#fff;font-family:"Fira Sans"` rules | `#b71c1c` |
| `feedback.success` | brand `:root` `--green` + `--bs-success:#317234` (brand re-point) | `#317234` |
| `feedback.warning` | brand `:root` `--burnt-orange` (4.59:1 on white, passes AA directly) | `#C75000` |
| `feedback.info` | brand `:root` `--bright-blue` (5.55:1 on white) | `#0061E0` |
| `surface.default` / `surface.raised` / `field.fillBg` | brand `:root` `--body-color:#fff` + `#functionalMenu input.functional-search-input{background:#ffffff!important}` (brand) | `#ffffff` |
| `surface.subtle` | brand `:root` `--gray-background` | `#FAFAFA` |
| `surface.inverse` | brand `:root` `--navy-blue` + `.footer{background-color:#00224F;border-bottom:12px solid var(--orange-500-brand,#EE7D11)}` (brand) | `#00224F` |
| `surface.overlay` | derived navy tint (no brand backdrop — see below) | `rgb(0 34 79 / 0.6)` *(à confirmer)* |
| `text.primary` | brand `:root` `--heading-color` | `#212b36` |
| `text.secondary` | brand `:root` `--grey` (5.74:1 on white) | `#666666` |
| `text.muted` | brand `:root` `--dim-gray` (8.45:1 on white) | `#4D4D4D` |
| `text.inverse` | white on dark/coloured surfaces (brand buttons/footer) | `#ffffff` |
| `border.subtle` | brand `:root` `--light-gray` | `#E5E5E5` |
| `border.strong` | brand `:root` `--gray-2` (3.95:1 on white, passes the 3:1 line threshold) | `#808080` |
| cyan accent `50` | brand `:root` `--accessible-color` + brand-scoped `border-bottom:6px solid #E3660E`, `border-left:8px solid #E3660E` rules | `#E3660E` |
| cyan accent `70` | brand `:root` `--burnt-orange` | `#C75000` |
| cyan accent `10` | brand `:root` `--beige` | `#FEF8F3` |
| blue tint `10` | brand `:root` `--sky-background` | `#EBF3FF` |
| deep brand blue (`data.category7`) | brand `:root` `--deep-blue` | `#004BAD` |
| secondary orange (`buttonSecondary` context) | brand `:root` `--secondary-color` + `.btn-get-started{background:linear-gradient(87deg,#C75000 .28%,#E66C0F 73.95%,#EE7D11 99.17%)}` (brand) | `#EE7D11` |
| soft purple (`data.category6`) | brand `:root` `--purple` (menu hover states) | `#9398C7` |
| `tabs.activeText` / `pagination.text` / `breadcrumb.linkText` | corporate blue (brand) | `#003883` |
| `pagination.activeText` / `badge.infoText` | white on corporate blue (à confirmer) | `#ffffff` *(à confirmer)* |

Scope notes (trap 5): the site-wide link colour is
`--bs-link-color:#003883` (least-scoped, covers all content links); the
breadcrumb's own links are menu-scoped
(`#businessLineMenu .breadcrumb a{color:#fff}`, hover `#9398C7`) and are NOT
used for any text role. The focus ring `box-shadow:0 0 0 .25rem rgb(0 56 131
/ .25)` (rgb(0 56 131) = `#003883`) is declared on `.form-control:focus`,
`.form-select:focus` and `.form-check-input:focus` — three general controls,
not one scoped widget — so it is the site-wide focus value. The orange
`#E3660E` occurrences cited are brand-scoped decorative rules (nav
`border-bottom`, heading `border-left` filets), not vendor blocks.

## À confirmer (derived or no published brand token)

- **`surface.overlay`** `rgb(0 34 79 / 0.6)` — the brand publishes no modal
  backdrop: the only backdrop rules in the brand file are the Bootstrap
  vendor `.modal-backdrop{--bs-backdrop-bg:#000;…opacity:0.5}` block
  (excluded per Step 0.5); greps for `.modal-overlay` and `.backdrop` outside
  that vendor block return nothing. Derived navy tint.
- **Categorical `data.*` composition** (`#003883`, `#E3660E`, `#0061E0`,
  `#317234`, `#C75000`, `#9398C7`, `#004BAD`, `#212b36`) — every hex is a
  brand-declared variable, but the 8-colour scale itself is a coherent
  proposal, not an official scale.
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
- **`typography.control` size, `typography.label`, link hover decoration**
  — family/weight measured from brand CTAs; the rest aligned with the
  reference theme package's geometry.
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
measured values on `surface.default` `#ffffff` — `text.primary` 14.35:1,
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
  fill, 1px border, 8px brand radius via the `.form-control{…border-radius:8px}`
  brand override). Native `<select>` chevron redrawn in corporate blue
  `#003883` (the shipped `.form-select` chevron `stroke='%23343a40'` is the
  vendor default and is replaced).
- **Control geometry search (evidence)**: brand button/input/select greps —
  `.btn-get-started{…height:68px;padding:10px 24px;…}` (hero-CTA-scoped, not
  general); `.search-row-input{…height:42px;…}` and `#functionalMenu
  input.functional-search-input{background:#ffffff!important;…}` (search-widget-scoped);
  `.form-control{display:block;width:100%;padding:.375rem .75rem;font-size:1rem;…}`
  and `.form-control{min-height:calc(1.5em + 0.75rem + …)}` (Bootstrap vendor
  namespace, adopted for md metrics only). No brand rule publishes a general
  control height — hence base heights, à confirmer.
- **Radius**: 8px brand radius on CTAs, inputs and menus (`radius.sm/md =
  0.5rem`); cards `0.5rem` à confirmer; pills stay `999px`.
- **Focus**: box-shadow **ring** in corporate blue `#003883`
  (`focus.strategy = "ring"`, width `0.25rem`, offset `0`) — the brand
  declares `outline:0` plus the `.25rem` tinted ring on every general form
  control.
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
