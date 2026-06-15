# Cascades → Sentropic mapping

This package maps **Cascades** (cascades.com — the Québec eco-friendly packaging,
hygiene & recovery company) onto the Sentropic token structure (`TenantTheme`).
Cascades runs its corporate site on a Drupal theme (`cascades_corpo`) built on
Bootstrap, exposing a **named brand palette as CSS custom properties in `:root`**
(`--vert-cascades`, `--vert-pale`, `--creme`, `--bleu-recyclage`, …). Every value
here is **measured from the live site's compiled CSS bundles** (the `:root` token
table + computed styles on `.btn-primary`, `.form-control`, `.heading-*`, anchors,
and the `@font-face` rules). Only the font *names* are referenced
(`"Roboto-Regular"` body, `"Cambon-ExtraBold"` serif display), never font binaries.

Cascades's identity is an **eco / recycled-packaging** system: the **deep forest
Cascades green `#00483c`** (`--vert-cascades` / `--primary`) drives every primary
action, the brand mark, links and headings; surfaces are **white** on a light
page; **but the recycled signature is that form fields are filled with a warm
recycled-paper cream `#ebe8db`** (`--creme`) — not white — inside a thin warm-grey
stroke (`#b9bab2`, `--gris-chaud`). Ink is a **warm soft near-black `#464646`**
(`--tundora`, the measured body colour — never pure black). Corners are
**generously rounded** (10px on controls — `border-radius:1rem` at the site's
62.5% / 10px root). Display headings are a **serif (Cambon)**; body/UI is **Roboto**.
Focus is a **soft green ring** (box-shadow, brand green at low alpha) with a bright
turquoise field border on focus (`#00c8a6`).

## Sources
- Cascades homepage (measured) — https://www.cascades.com/en
- Theme CSS bundles (measured `:root` + computed styles):
  `…/sites/default/files/css/css_w_AJYmtWqldbd1GBVVzcxqRcfPyBW825fM2yURFKNHE.css`
  (delta 0) and `…/css_z2PVwiyRJJ-IcO7C0W68GbLbST46wqWnfRcWPB5qjBQ.css` (delta 1),
  `theme=cascades_corpo`.
- Brand green confirmed internally: `--vert-cascades:#00483c` == `--primary` ==
  `.text-vert-cascades{color:#00483c}` (the brief's guessed #00833f/#3c8a35 range
  is **incorrect** — the canonical Cascades green is the deep forest **#00483c**).

## Colour mapping

| Sentropic role | Cascades source (measured) | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `surface.inverse` / tab active / brand | `--vert-cascades` / `--primary` / measured anchor + `.heading-*` colour | `#00483c` |
| `action.primaryHover` | measured `.btn-primary:hover` background-color | `#00221c` |
| (hover border) | measured `.btn-primary:hover` border-color | `#001512` |
| mid green / `data.category6` | `--vert-pale` | `#0f774b` |
| apple green / `data.category3` | `--vert-pomme` | `#84bd00` |
| lime | `--vert-lime` | `#c8dc5f` |
| sage green | `--vert-sauge` | `#7ea88b` |
| `card.hoverBackground` / `tag` fill / `secondaryHover` / mint surface | `--menthe` | `#dbede4` |
| `action.secondary` / `field.fillBg` (recycled-paper field fill) | `--creme` | `#ebe8db` |
| `surface.subtle` (eco page tone) | `--creme-pale` | `#f3f2ed` |
| field focus border (turquoise accent) | measured `.form-control:focus` border-color | `#00c8a6` |
| `focus.color` (green ring tint) | measured `.btn`/`.form-control:focus` box-shadow `rgba(0,72,60,…)` | `rgb(0 72 60 / 0.5)` |
| `cyan.50` accent / `data.category2` | `--bleu-recyclage` / `--secondary` | `#0064a8` |
| emerald blue / `data.category4` | `--bleu-emeraude` | `#2a8b9a` |
| `cyan.70` / deep blue / `data.category7` | `--bleu-profond` | `#254252` |
| `cyan.10` / aqua | `--aqua` | `#2cd5c4` |
| `text.primary` | `--tundora` (measured body `color`) | `#464646` |
| field text ink | measured `.form-control` `color` | `#495057` |
| high-contrast ink (`slate.90`) | measured bootstrap `body` / `.btn` `color` | `#212529` |
| `text.secondary` / `text.muted` | `--gray` | `#6c757d` |
| `border.strong` (field stroke, 1px) | `--gris-chaud` (measured `.form-control` border) | `#b9bab2` |
| `border.subtle` | `--gallery` | `#eeeeee` |
| faint surface (`slate.10`) | `--alabaster` | `#f7f7f7` |
| `surface.default` / `surface.raised` / `action.primaryText` | measured `body` background-color | `#ffffff` |
| brand rust accent / `data.category8` | `--rouge-rouille` | `#cc472b` |
| `action.danger` / `feedback.error` | `--danger` / `--red` (bootstrap) | `#dc3545` |
| `feedback.success` | `--success` / `--green` (bootstrap) | `#28a745` |
| `feedback.warning` | `--warning` / `--yellow` (bootstrap) | `#ffc107` |
| `feedback.info` | `--info` / `--cyan` (bootstrap) | `#17a2b8` |
| `data.category5` / brand orange | `--orange` | `#f89844` |

### "À confirmer" (derived / no single published source)
- **System feedback colours (`#dc3545`/`#28a745`/`#ffc107`/`#17a2b8`)** are the
  **Bootstrap defaults** Cascades did not override (measured in `:root`). They are
  not bespoke Cascades brand tones; the brand's own warm equivalents
  (`--rouge-rouille` `#cc472b`, `--jaune` `#ffbf3f`, `--orange` `#f89844`) exist but
  the site uses the Bootstrap defaults for alerts. Kept as the semantic feedback set.
- **The 8-colour categorical `data.*` palette** — Cascades publishes a rich *named*
  brand palette but no single published *categorical* token list. The scale is
  assembled from the measured `:root` brand hues, led by the brand green.
- **`radius.lg` `16px`** — derived step above the measured 10px control radius
  (`--vert`-large surfaces use big organic single-corner radii like `10rem`/`15rem`,
  not a uniform card radius); 16px is a sensible card step.
- **`shadow.*`** — Cascades does not expose named elevation tokens; the three slots
  are soft low-opacity drops aligned to the brand's light feel.
- **`motion.*`, `spacing.*`** — the site uses `0.15s ease-in-out` transitions
  (captured as `fast` 150ms) and a rem ramp on a **62.5% / 10px root**; the spacing
  steps are kept on the Sentropic 4px ramp (the exact site ramp is 10px-root rem).
- **`surface.overlay` `rgb(0 0 0 / 0.6)`** — the modal/backdrop opacity is not a
  single published token; kept aligned with the base.
- **`disabledOpacity` `0.65`** — the Bootstrap `.disabled { opacity: .65 }` Cascades
  inherits (measured).

## Typography
- **Body / UI / fields** (`font.sans`, `typography.control/field`):
  **`"Roboto-Regular"`** with the brand's `"Gotham"` fallback (measured
  `body { font-family:"Roboto-Regular","Gotham",sans-serif }`). Base type **16px**
  (`1.6rem` at the **10px root**), body `1.4rem`/14px, letter-spacing `0.02em`
  (measured). Bold UI = `"Roboto-Bold"`; light = `"Roboto-Light"`.
- **Display / headings** (`font.display`, `typography.label`): the proprietary
  **serif `"Cambon-ExtraBold"`** (with `"Cambon-Regular"`, `Arial`, serif fallback)
  — measured `@font-face` (`/dist/fonts/Cambon/Cambon-ExtraBold.woff2`) and
  `.heading-xlarge { color:#00483c; font-family:"Cambon-ExtraBold","Arial",serif }`.
  Headings are **green serif**, a strong Roboto-sans-vs-Cambon-serif contrast.
- **Control labels**: measured `.btn { font-weight:400 }` (regular); `typography.label`
  uses `Roboto-Bold`/700 for form labels.
- **Links**: the **brand green `#00483c`** at rest (measured anchor colour), no
  underline at rest, **underline on hover**.
- **Monospace** (`font.mono`): not part of Cascades; the Sentropic mono stack kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` with **`fillBg:#ebe8db`** — boxed inputs
  with a **recycled-paper cream fill** (the eco signature), a **1px** warm-grey
  stroke `#b9bab2`, **6px radius** (measured `.form-control { background-color:#ebe8db;
  border:1px solid #b9bab2; border-radius:6px; padding:1rem 2rem; color:#495057 }`).
  Native `<select>` chevron redrawn in the brand green `#00483c`, `appearance:none`.
- **Radius**: generous rounding. The measured control radius is `border-radius:1rem`
  = **10px** at the site's 62.5% / 10px root (`radius.md`); inputs 6px (`radius.sm`);
  pill buttons `50rem` (`radius.pill`). Some hero tiles use big organic single-corner
  radii (`10rem`/`15rem 0 0 0`).
- **Borders**: field/select strokes **1px solid** `#b9bab2`; **buttons use a 2px
  solid border** (`.btn { border:2px solid }`, the brand's thick CTA stroke); brand
  accents `#00483c`.
- **Focus**: a soft **green ring** (`focus.strategy:"ring"`) — measured
  `box-shadow:0 0 0 .2rem rgba(0,72,60,…)` (the brand green at 25–50% alpha), NOT an
  outline. On fields the **border also turns turquoise `#00c8a6`** on focus.
- **Buttons**: primary = **solid Cascades-green fill `#00483c`, white text, 2px
  green border**, hover darkens to near-black green `#00221c` (measured
  `.btn-primary`); secondary = **outlined green ghost** (`.btn-outline-primary`:
  transparent, green `#00483c` text + border, mint `#dbede4` hover).
- **Tabs / sub-nav**: active = bold **green** label with a **green bottom indicator**
  (`indicatorSide:"bottom"`, `indicatorMode:"border"`).
- **Pagination**: borderless green links; active page = **filled brand-green box**,
  white text.
- **Tags / badges**: **pill** (`radius:999px`) — mint-fill green-ink tags; brand-green
  filled badges with white text.
- **Density**: 16px base type (10px root), regular control labels, generously padded
  CTAs (`.375rem 3rem`), ~46px cream-filled inputs; warm comfortable whitespace.

## Asset officiel
- Cascades wordmark logo, served as an official SVG from the site header:
  `https://www.cascades.com/themes/custom/cascades_corpo/dist/assets/cascades-logo.svg`
  (mobile variant: `…/cascades-logo-mobile.svg`; transparent PNG:
  `…/dist/assets/logo_cascades_transparent.png`). **Do not redraw** — reuse the
  official Cascades logo asset if a logo is needed.
