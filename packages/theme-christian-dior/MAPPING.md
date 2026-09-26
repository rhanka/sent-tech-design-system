# Christian Dior SE → Sentropic mapping

This package maps the **public** Christian Dior SE financial site
(dior-finance.com, the holding's sober typographic site) onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: the brand navy
(`#013755`, `--brand-color` in the brand stylesheet, 1 declaration + 3
`var()` references) and the monochrome grey ramp are read from the public
brand stylesheet; only public values and font *names* are referenced — no
font binaries. Derived/unmeasured values are flagged `à confirmer`.

> Key measured fact: the site's only brand hue is a deep navy used as a
> fill and border (navbar, primary button) — never as running text. Links
> are the title dark grey `#393939`, and the visible greys are a monochrome
> ramp the brand authors directly (Bootstrap supplies only the 10px rem
> root and a few retained defaults, never a brand token).

## Sources

- Homepage FR (links the stylesheets, Google Fonts, inline slider block) — https://www.dior-finance.com/fr/accueil.html
- Brand stylesheet (all colour/type/geometry values) — https://www.dior-finance.com/css/style.css?v=5.0
- Homepage EN (cross-check that FR/EN agree) — https://www.dior-finance.com/en/accueil-EN
- Font names only (nothing redistributed) — https://fonts.googleapis.com/css?family=Montserrat and https://fonts.googleapis.com/css?family=EB+Garamond
- Vendor stock for Step 0.5 separation (never a token source) — https://www.dior-finance.com/css/bootstrap3/bootstrap.min.css

## Colour mapping

Counting convention (travels with every figure below): region = the brand
region of `style.css` + the homepage `<style>` block, `/* */` comments
excluded; one occurrence = one literal hex match in a declaration, short and
long forms unified after lowercase normalisation (`#fff` ≡ `#ffffff`,
transcribed in 6-digit lowercase); 8-digit alpha forms and `rgb()` counted
apart, never merged. Second spelling: case-insensitive re-grep + a
comment-aware re-read (comment-only hexes `#59e8f2`, `#db848f`, `#f2f2f2`
excluded).

| Sentropic role | Christian Dior SE source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | `--brand-color` (style.css:2, 3 `var()` refs style.css:6,10,11) | `#013755` |
| `action.primaryHover` / `blue.80` | derived darker navy | `#012a44` *(à confirmer)* |
| `blue.10` | derived light navy tint | `#e8eef2` *(à confirmer)* |
| `text.primary` / `text.link` / `secondaryText` / `pagination.text` | title/link dark grey (15 unified occurrences) | `#393939` |
| `text.secondary` / `breadcrumb.text` / `breadcrumb.linkText` | body/trail grey (14 occurrences) | `#666666` |
| `text.muted` | publication-figures grey (2 occurrences), 4.95:1 on white | `#707070` |
| `surface.subtle` / `action.secondary` / `buttonSecondary.hoverBackground` | `body{background:#eee}` — brand decision (vendor ships `#fff`), 18 unified occurrences | `#eeeeee` |
| `surface.default` / `surface.raised` / `field.fillBg` | white surfaces (19 unified occurrences) | `#ffffff` |
| `surface.inverse` | `#my-navbar{background:#313131}` (8 occurrences) | `#313131` |
| `border.subtle` | `#img-rapport-publication{border:1px solid #D6D6D6}` (10 occurrences) | `#d6d6d6` |
| `border.strong` | `#a-dropdown-item{border-bottom:2px solid #c4c4c4}` (2 occurrences) | `#c4c4c4` |
| `slate.20` / `action.secondaryHover` | table alt-row tint (2 occurrences; third match in a /* */ block) | `#e0e0e0` |
| `slate.90` alternate / footer black | `#footer-jumbotron-2{background:#000000}` (4 unified occurrences) | `#000000` |
| `cyan.10` | `#gouvernance-page-widget-title-div` overridden background step (1 occurrence; winning value `#f7d3bf4f`, 8-digit, counted apart) — neutral filler | `#f5f5f5` *(à confirmer)* |
| `grey.300` | table alt-column tint (2 occurrences) | `#efefef` |
| `grey divider` | `.dropdown-menu .divider` base rule (1 occurrence; effective on desktop, mobile overrides with `#9c9c9c`) | `#c7c7c7` |
| `tabs.activeText` / `pagination.activeText` / `badge.infoText` / `action.primaryText` | white nav labels on the dark navbar / white on navy (measured pairing) | `#ffffff` |
| `pagination.activeBackground` / `badge.infoBackground` | brand navy as fill (measured `.btn-primary` pairing) | `#013755` |
| `action.danger` / `feedback.error` | derived error red (6.54:1 on white) | `#b3261e` *(à confirmer)* |
| `feedback.success` | derived legible green (5.14:1 on white) | `#1e7e34` *(à confirmer)* |
| `feedback.warning` | derived dark amber (6.80:1 on white) | `#8a4b00` *(à confirmer)* |
| `feedback.info` | brand navy in the info role (12.51:1 on white) | `#013755` *(à confirmer)* |
| `surface.overlay` | derived black backdrop (no backdrop published) | `rgb(0 0 0 / 0.6)` *(à confirmer)* |

## À confirmer (derived or no published brand token)

- **Navy hover/light tints** (`#012a44`, `#e8eef2`) — the brand publishes no hover or tint of `--brand-color` (white on `#012a44` = 14.83:1).
- **Feedback hues** (`success #1e7e34`, `warning #8a4b00`, `error #b3261e`, `info #013755`) — no status rule in `style.css`; stand-ins chosen to clear WCAG AA on white (5.14 / 6.80 / 6.54 / 12.51:1).
- **Modal backdrop** (`rgb(0 0 0 / 0.6)`) — no `.modal`/`.backdrop`/`.overlay` rule in the brand region.
- **Secondary-button composition** (transparent fill, `#393939` stroke, `#eeeeee` hover) — no secondary-button rule; composition of measured values.
- **Light neutral `cyan.10` (`#f5f5f5`)** — the cited declaration is overridden in its own rule (the painted value is the 8-digit `#f7d3bf4f`, counted apart); kept as a neutral slot filler, not a painted brand tint.
- **Tabs/pagination/search/toggle geometry and tab indicator** — no tab, pagination or toggle component published; structural values with the measured nav/pairing colours.
- **`shadow.medium/floating`, `motion.fast`, `radius.pill`, `disabledOpacity`, `spacing`, `z`, `cursor`, `iconSize`, lg `density`** — not published; base/structural values. `shadow.subtle` is `none` (measured `box-shadow:unset` on menus); `motion.normal/slow/easing` and `transition` are measured (`.5s ease-out`, `transform 1s`).
- **Categorical `data.*` palette** (`#013755`, `#313131`, `#1e7e34`, `#8a4b00`, `#b3261e`, `#013755`, `#666666`, `#d6d6d6`) — a coherent proposal from the brand navy + ramp + status hues, not an official scale.
- **Not promoted (measured but excluded)**: `#ccc` inputs and `#777777` dropdown links and `#333333` list links = vendor defaults retained (present in the Bootstrap 3 stock); `#9c9c9c` (2.75:1 on white) is the mobile override of that same divider background — never text, so the text floor does not apply; not promoted, like `#c7c7c7`, for want of a divider-background role; `#c4c4c4` as text would fail the text floor; live 8-digit alphas `#f7d3bf4f` (winning widget-title background), `#584848f5`, `#00000024` (1 occurrence each, no role); comment-only `#59e8f2`, `#db848f`, `#f2f2f2`.
- **Unresolved reference**: `var(--unnamed-character-spacing-0)` (style.css:693) is never declared — ignored.
- **Root**: the brand declares no `rem` root; the effective 10px root comes from the Bootstrap stock (`html{font-size:10px}`) and the brand authors px, so no conversion distortion; px→rem transcribed at the 16px theme root.

## Typography

- **UI / controls / labels / tables** (`font.sans`, `typography.control/field/label`): **'Montserrat'** — buttons (`#p-button-slider`, `#button-telecharger-publication`), selects (`#annee-select-button`, `select.filterExercice`), fil d'Ariane, linked from the homepage head. We reference the font *name* only.
- **Display / headings** (`font.display`): **'EB Garamond'** — hero (`.text-first-slider`), section titles (`#text-actualite`, `#gouvernance-page-title`), widget headings (~20 declarations vs 2 for Cochin). Late `h1`/`h2` rules set Cochin (1 `!important` font rule on `h2`, 1 plain font rule on `h1`) — observed minority, not promoted.
- **Monospace** (`font.mono`): system stack (no brand monospace published; Arial appears as a table/data fallback, not promoted).
- Links: `#393939`, underlined at rest and on hover (`a.fxd-link`, `a.link-ar`); brand buttons uppercase normal-weight Montserrat.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (`.cmsPage input{border:solid 1px #ccc;height:45px}`, no fill published). The `#ccc` stroke is the vendor default retained, so the builder draws from the measured `#d6d6d6`. Native `<select>` chevron redrawn in the brand navy `#013755`.
- **Radius**: square everywhere (`radius.sm/md/lg = 0` — measured `border-radius:0 !important` / `unset` on jumbotron, buttons, menus, grids); pills stay `999px` (structural).
- **Focus**: browser-default **outline** technique (no focus rule published — greps `outline`/`focus` return only background resets), 2px/2px, routed to the measured brand navy `#013755` (12.51:1, derived role assignment).
- **Buttons**: primary = solid brand navy `#013755` with white text (measured `.btn-primary`); secondary = light outlined composition (transparent, `#393939` stroke, `#eeeeee` hover).
- **Tabs / top-nav**: white uppercase labels on the dark `#313131` navbar; active tab = white label, transparent fill, bottom border indicator.
- **Pagination**: dark-grey links; active page = filled navy `#013755` with white text (measured pairing).
- **Breadcrumb**: transcribed from the fil d'Ariane (`#gouvernance-page-fil-dariane-text`: 16px/19px Montserrat 200, `#666666`, links inherited).
- **Accordion**: transcribed from the governance widgets (20px padding, 40px/49px Montserrat 300 `#666666` title, `.expand-arrow` trigger).
- **Density**: sm from `input#s` 25px (1.5625rem) + 4px/15px select paddings; md from `.cmsPage input` 45px (2.8125rem) + 10px/20px button paddings; lg unpublished. Greps quoted: `input|textarea|select` → `.cmsPage input{height:45px}`, `input#s{height:25px}`, `#annee-select-button{padding:4px 15px}`; no `form-control`/general control rule in the brand region.

## Asset officiel

- Christian Dior SE wordmark / "DIOR" header image (`#logo-christian-dior`, header façade visuals). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package references only font *names* and public colour values, never logo artwork or font binaries.
