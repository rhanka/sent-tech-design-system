# Rexel → Sentropic mapping

This package maps the **public** Rexel Group design system (`ds-rexel`, live at
design.rexel.com) onto the Sentropic token structure (`TenantTheme`). Method =
**measured-clone**: the France-theme primary (`#2e4eaa`, `$primary-600`,
DEFAULT BUTTON COLOR) is read from the public SCSS sources. Only public values
and font *names* are referenced — no font binaries. Derived/unmeasured values
are flagged `à confirmer`.

> Key measured fact: the theme file declares `$link-color: $primary-600`
> ("DEFAULT LINK COLOR"), but the shared variables file hard-assigns
> `$link-color: $gray-900` afterwards (import order in `rexel.scss`: theme,
> then variables, then bootstrap). Last rule wins: links render `#303545` at
> rest and `#2e4eaa` on hover. Both facts are recorded; `text.link` carries the
> hover identity `#2e4eaa`.

Counting convention (every figure below): occurrences of the 6-digit
hexadecimal form, case-insensitive, normalised to lowercase; short forms
(`#333`, `#000`) expanded before counting; `rgb()`/`rgba()` equivalents
reported without merging; region = brand files
(`scss/rexel/_theme_rexel.scss`, `scss/common/_variables_rexel_DS.scss`,
`scss/common/_custom_components.scss`); `scss/vendor/` and the bootstrap
import excluded. `$var` references = exact-spelling uses of the brand SCSS
variable, declaration included, over the brand region (`$warning` does not
absorb `$warning-light` or `$warning-info-icon`). Second spelling check:
count of exact 6-digit literals (`grep -o -i -E '#[0-9a-f]{6}\b'`) — each
France-theme hex occurs exactly once, in its written case.

## Sources

- Rexel Group Design System, France theme —
  `https://unpkg.com/ds-rexel@2.0.17/assets/scss/rexel/_theme_rexel.scss`
  (palette `$primary-*`, `$secondary-*`, `$gray-*`, `$primary`, `$link-color`)
- Rexel Group Design System, shared variables —
  `https://unpkg.com/ds-rexel@2.0.17/assets/scss/common/_variables_rexel_DS.scss`
  (`$success/$info/$warning/$danger`, `$text-muted`, `$border-radius`,
  `$btn-*`, `$nav-pills-*`, `$pagination-*`, `$alert-*-color/bg/border`,
  `$badge-*`, `$input-*`, `$easeInOutCubic`, `$font-family-*`)
- Rexel Group Design System, brand rules —
  `https://unpkg.com/ds-rexel@2.0.17/assets/scss/common/_custom_components.scss`
  (`.form-control` boxed + focus ring, `.btn-outline-primary`,
  `.nav-tabs`/`.nav-pills`, `.breadcrumb-item a`, `.card`, `.custom-switch`,
  `h1/h2` Montserrat, `.badge-pill.large-pill`)
- Rexel corporate site — https://www.rexel.com/ (200 OK ; logo officiel
  `#00448C` / `#2A96CF`, asset réservé au § Asset officiel, pas aux tokens UI)

## Upstream access

`rexel.com` answers 200 to the native network tool. The corporate site's
stylesheets are not addressable from the processed HTML, so measurement goes
through the public `ds-rexel@2.0.17` package, which the corporate site itself
consumes (`body.template-pages-layout-homePage` is defined there). Bootstrap
4.5 is a vendor base there: any value equal to Bootstrap stock is recorded as
"vendor default retained", never as a brand decision.

## Colour mapping

| Sentropic role | Rexel source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | `$primary-600` DEFAULT BUTTON COLOR (`$primary`, 47 + 97 refs) | `#2e4eaa` |
| `action.primaryHover` | `$primary-500` `$primary-hover` (lighter — measured, 18 refs) | `#3556b4` |
| `foundation.blue.10` | `$primary-50` (`$dropdown-link-hover-bg`, facet active fills — 16 refs) | `#e8ebf6` |
| `foundation.blue.80` | `$primary-900` (`$progress-bar-bg`, `$badge-primary` — 38 refs) | `#0a287d` |
| `action.primaryText` | white text (vendor color-yiq convention on a brand colour, 7.54:1) | `#ffffff` |
| `action.secondary` | `$secondary-700` `$secondary` DEFAULT 2nd BUTTON (8 refs) | `#4487bd` |
| `action.secondaryHover` | `$secondary-600` (lighter — measured, 5 refs) | `#4c99d1` |
| `foundation.cyan.10` | `$secondary-50` (`$breadcrumb-hover` — 3 refs) | `#e3f5fc` |
| `foundation.cyan.50` | `$secondary-500` (scale step — declaration + palette map, 2 refs) | `#52a7e0` |
| palette reference (no Sentropic role) | `$gray-800` (large-pill text, pill switch fills — 9 refs, brand-consumed) | `#3E4457` |
| `action.secondaryText` | white text (3.86:1 — documented arbitration, brand fill retained) | `#ffffff` |
| `text.link` / `tabs.activeText` | `$link-hover-color` + DEFAULT LINK COLOR du thème (restitution au § en-tête) | `#2e4eaa` |
| `text.primary` / `surface.inverse` | `$body-color` = `$gray-900` (54 refs, 12.20:1) | `#303545` |
| `text.secondary` | `$gray-600`, breadcrumb links (14 refs, 6.16:1) | `#596179` |
| `text.muted` | `$text-muted` = `$gray-500` (47 refs, **4.99:1**) | `#666F8A` |
| `border.subtle` / field stroke | `$gray-100`, pagination/field borders (84 refs) | `#D7D9E4` |
| `border.strong` | `$gray-400`, switch track (23 refs, 3.43:1, rule lines) | `#838AA1` |
| `surface.subtle` / `action` hover fills | `$background-color` = `$gray-50` (25 refs) | `#f3f3fa` |
| `surface.default` / `surface.raised` / `field.fillBg` | white (vendor default retained — painted: fields, cards, buttons) | `#ffffff` |
| `surface.overlay` | veil derived from `$gray-900` at 60 % | `rgb(48 53 69 / 0.6)` *(à confirmer)* |
| `action.danger` / `feedback.error` | `$red` = `$danger` (5.88:1) | `#C8102E` |
| `feedback.success` | `$green` = `$success` (6.09:1) | `#16704a` |
| `feedback.warning` | `$orange` = `$warning` (brand fill) | `#EE7900` |
| `feedback.info` | `$blue` = `$info` (4.89:1) | `#0072CE` |
| `buttonSecondary` border | `$primary-outlined` = `$primary` (3 refs) | `#2e4eaa` |
| `pagination` text / active | `$pagination-color` / `$pagination-active-color` + `-bg` | `#2e4eaa` / `#303545` sur `#f3f3fa` |
| `breadcrumb` links / current | `.breadcrumb-item a` / `.current-breadcrumb-link` | `#596179` / `#303545` |
| `badge.info*` | `$default-badge-primary-bg` / `-color` (9.56:1) | `#D6E5F5` / `#223361` |
| `alert` accents | `$alert-{info,success,warning,danger}-color` | `#055ea5` / `#16704a` / `#9b540c` / `#721c24` |
| `toggle` track / checked | `.custom-switch` off `$gray-400` / on `$success` | `#838AA1` / `#16704a` |
| `data.category1..8` | brand hexes (assignment à confirmer) | `#2e4eaa`, `#4487bd`, `#16704a`, `#EE7900`, `#C8102E`, `#0072CE`, `#092268`, `#ec6507` |

## À confirmer (derived or no published brand token)

- **`surface.overlay`** (`rgb(48 53 69 / 0.6)`) — no published modal
  background; veil derived from the brand near-black.
- **`density` geometry**: `lg.controlHeight` 3rem, all `minWidth`, md/lg `gap`
  and sm/lg `paddingBlock` follow the Sentropic base, not the brand; md/sm
  heights, md paddings and the three `fontSize` steps are brand-measured
  (`$font-size-sm` 0.75, `$font-size-base` 0.875, `$font-size-lg` 1.125).
  `sm.paddingInline`, `sm.gap` and `lg.paddingInline` are aligned with the
  reference theme package's geometry *(à confirmer)*.
- **`transition.property`** — aligned with the reference theme package's
  geometry *(à confirmer)*; duration is the base, easing is brand-measured
  (`$easeInOutCubic`).
- **`z.*`, `cursor.*`, `motion.*` durations** — Sentropic base; only the easing
  (`$easeInOutCubic`) is measured.
- **`accordion.*`, `tag.*` (beyond radius/neutrals), inherited `search`,
  `alert` paddings/typo** — rewritten Sentropic base, not omissions.
- **`breadcrumb.separator`** (`#666F8A`) — no published separator; rewritten
  `muted` default.
- **`breadcrumb.currentWeight`, `typography.label` weight** (`600`) — no
  published token; rewritten base.
- **`iconSize.md`** (`1.125rem`) — base; sm (`1rem`, `$input-control-indicator-size`)
  and lg (`1.25rem`, `.form-search` background-size `$spacer` × 1.25 with
  `$spacer: 1rem`) are measured.
- **Single-slot alert background** (`#d9eaf8`, info tint) — the brand publishes
  four tints (`#ccf2e2`, `#d9eaf8`, `#fde9d4`, `#f8d7da`); the single slot
  carries the info representative, all four accents are exact.
- **`data.*` palette** — all eight hexes are brand hexes; their assignment to
  categories is a coherent proposal, not an official scale.
- **`slate.90`** (`#02081A`, `$tertiary-800`, page-footer background) — brand
  hex, assigned role.
- No other — everything else above is measured from the cited sources.

## Typography

- **Base / controls / fields** (`font.sans`, `typography.control/field`):
  **'Open Sans'** (`$font-family-sans-serif: "open sans", sans-serif`,
  `$font-size-base: 0.875rem` = 14px at a 16px root — no `html{font-size}`
  override in the DS). Buttons: 600 (`$btn-font-weight`), line-height 1.3571
  (`$button-line-height`). Fields: 400, 1.5 (`$input-line-height` = 1.25 × 1.2).
  We reference the *name* only. Badge weight 600 is brand too
  (`$badge-font-weight: $font-weight-semi-bold`).
- **Headings** (`font.display`): **'Montserrat'** (`$font-family-montserrat`,
  consumed by `h1/.h1` and `h2/.h2`, normal weight, tracking −0.42px/−0.32px;
  h3/h4 in Open Sans 600).
- **Monospace** (`font.mono`): Open Sans system stack
  (`$font-family-monospace: "open sans", sans-serif` — measured fact: the brand
  publishes no true fixed-width face).
- Links: `#303545` at rest, `#2e4eaa` on hover, **never underlined**
  (`$link-decoration: none`, `$link-hover-decoration: none`; only
  `a.text-primary` underlines on hover/focus).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed fields (`#ffffff` fill, 1px
  `#D7D9E4` border on all four sides, 3px radius). Native `<select>` chevron
  redrawn in `#2e4eaa` (`$select-dropdown-primary`, hover state; black at rest
  — both states measured), `selectAppearance: "none"` measured, 1.625rem
  gutter (0.625rem offset + 1rem icon) *(à confirmer — computed, no
  padding-right published)*.
- **Radius**: 3px everywhere (`.1875rem`, `$border-radius`), 6px large
  (`.375rem`, `$modal-content-border-radius`); pills `999px`.
- **Focus**: brand-blue **ring** (`focus.strategy = "ring"`, `box-shadow:
  0 0 0 0.2rem rgba($primary, .25); outline: 0`, 3.2px effective at a 16px
  root) — re-tinted Bootstrap technique, not a solid outline.
- **Buttons**: solid primary `#2e4eaa` with white text (7.54:1) → hover
  `#3556b4` (lighter — measured); **outlined** secondary `#2e4eaa` on white
  (white fill kept on hover, `#3556b4` text); promo `#ec6507` with white text
  (3.27:1 — brand fill retained, documented).
- **Tabs / nav**: active tab = `#2e4eaa` label on transparent, 4px bottom filet
  (`$border-width * 4`, `indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: `#2e4eaa` links on white, `#D7D9E4` borders; active page
  `#303545` on `#f3f3fa`.
- **Cited measured geometry**: md field 2.375rem (21px + 16px + 1px), sm
  1.75rem (21px + 8px − 1px); `.5rem`/`.75rem` paddings (`$input-padding-y`,
  `$input-btn-padding-x`); `disabledOpacity` 0.5 (`$btn-disabled-opacity`,
  brand against Bootstrap stock .65); pure-black shadows at all three levels.
- **Cited empty searches** (evidence for the "nothing published" fallback):
  `input-border-width`, `input-focus-*`, `nav-link-padding-*`,
  `headings-font-family`, global `body` background — absent from the DS, hence
  retained Bootstrap vendor stock (1px field border, white background,
  `.5rem`/`.75rem` pagination paddings) or à confirmer-marked Sentropic base.

## Asset officiel

- Rexel logo = deep-blue `#00448C` banner + light-blue `#2A96CF` blade
  (`/app/themes/rexel/assets/images/logo.svg` on rexel.com). Use the official
  SVG/PNG — **do not redraw the logo by hand**. This package references only
  font names and public colour values, never logo artwork or font binaries.
