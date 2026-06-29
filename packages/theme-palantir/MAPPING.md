# Palantir Blueprint → Sentropic mapping

This package maps the **public, open-source** Palantir **Blueprint** design system
(Apache-2.0) onto the Sentropic token structure (`TenantTheme`). Only public
Blueprint Sass tokens and font *names* are referenced — Blueprint ships no custom
typeface (it uses the platform system stack), so there are no font binaries.

This is a **dark-first** clone (`mode: "dark"`): Palantir products (Foundry,
Gotham) and Blueprint's `.bp5-dark` skin are navy-dark by default, so the
Sentropic semantic layer is mapped onto Blueprint's dark grays and dark aliases.

## Sources
- Blueprint colour palette — `@blueprintjs/colors` `src/_colors.scss`
  (https://github.com/palantir/blueprint/blob/develop/packages/colors/src/_colors.scss)
  and https://blueprintjs.com/docs/#core/colors.
- Blueprint colour aliases (intents, app background, text/link/divider) —
  `@blueprintjs/core` `src/common/_color-aliases.scss`.
- Blueprint sizing / typography / motion variables —
  `@blueprintjs/core` `src/common/_variables.scss`
  ($pt-grid-size 10px, $pt-border-radius 4px, $pt-font-size 14px,
  $pt-button-height 30/24/40px, $pt-line-height 1.28581,
  $pt-transition-duration 100ms, ease cubic-bezier(0.4, 1, 0.75, 0.9)).

## Colour mapping (dark theme)

| Sentropic role | Blueprint token | Value |
|---|---|---|
| `surface.default` | $dark-gray1 / $pt-dark-app-background-color | `#1c2127` |
| `surface.subtle` / field fill | $dark-gray2 | `#252a31` |
| `surface.raised` / card | $dark-gray3 | `#2f343c` |
| `border.subtle` / default button | $dark-gray4 | `#383e47` |
| `action.secondaryHover` / tag bg | $dark-gray5 | `#404854` |
| `border.strong` / separators | $gray1 / $pt-text-color-muted | `#5f6b7c` |
| `text.muted` | $gray3 | `#8f99a8` |
| `text.secondary` / breadcrumb | $gray4 / $pt-dark-text-color-muted | `#abb3bf` |
| `text.primary` / `surface.inverse` | $light-gray5 / $pt-dark-text-color | `#f6f7f9` |
| `action.primary` / `feedback.info`(base) / `border.interactive` / focus | $blue3 / $pt-intent-primary | `#2d72d2` |
| `action.primaryHover` | $blue2 / $pt-link-color | `#215db0` |
| `text.link` | $blue5 / $pt-dark-link-color | `#8abbff` |
| `tabs.activeText` / dark `feedback.info` | $blue4 | `#4c90f0` |
| `feedback.success`(base) | $green3 / $pt-intent-success | `#238551` |
| `feedback.warning`(base) | $orange3 / $pt-intent-warning | `#c87619` |
| `action.danger` / `feedback.error`(base) | $red3 / $pt-intent-danger | `#cd4246` |
| dark `feedback.success` | $green4 | `#32a467` |
| dark `feedback.warning` | $orange4 | `#ec9a3c` |
| dark `feedback.error` | $red4 | `#e76a6e` |
| accent (Sentropic `cyan`) | $cerulean3 | `#147eb3` |

## Typography
- **All roles** (`font.sans`, `font.display`, `typography.control/field/label`):
  the Blueprint platform **system stack** —
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, …, system-ui, sans-serif`.
  Blueprint defines no custom typeface; we reference the stack name only.
- **Monospace** (`font.mono`): `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`
  ($pt-font-family-monospace = `monospace`).
- Base size **14px** (`0.875rem`), line-height **1.28581** ($pt-font-size / $pt-line-height).
- Links are **not** underlined at rest (coloured text); underline appears on hover.

## Signatures anatomiques
- **Mode**: `dark` — navy-dark surfaces ($dark-gray1/2/3), light text ($light-gray5).
- **Fields**: `field.style = "outline"` — boxed inputs (4px radius, 1px inset
  hairline) over a recessed `#252a31` fill. Blueprint draws the input border as a
  box-shadow inset; the outline style is the closest model. Not a filled-underline.
- **Radius**: `$pt-border-radius = 4px` everywhere (`md = lg = 4px`); round
  elements (switch / round tag) use `pill = 999px`. `sm = 2px` is "à confirmer".
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in intent blue
  `#2d72d2` (the `.bp5-input` focus glow), not a native offset outline.
- **Density**: DENSE. Button/input heights 24 / 30 / 40px (`sm/md/lg`); default
  font-size 14px; horizontal padding ≈ 10px ($pt-grid-size).
- **Buttons**: primary = solid intent blue `#2d72d2` (white text); secondary =
  Blueprint *default* button = filled dark-gray `#383e47`, lifting to `#404854`
  on hover (a filled dark button, not an outlined ghost).
- **Tabs**: selected tab = lighter blue `#4c90f0` label with a bottom indicator
  bar (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Callout/Alert**: a tinted dark panel `#252a31` with no border and no left
  filet (Blueprint callouts tint the whole box).
- **Chevron (native `<select>`)**: redrawn as a light-gray `#abb3bf` arrow,
  `appearance: none`, 40px right gutter.

### À confirmer (no direct Blueprint public token / derived)
- `radius.sm = 2px` — Blueprint mostly uses a single 4px radius; the 2px small
  step is a sensible sub-radius, not a measured token.
- `motion.normal = 200ms`, `motion.slow = 300ms` — extrapolated from the single
  measured `$pt-transition-duration = 100ms` (used as `motion.fast`); easing is
  measured (`cubic-bezier(0.4, 1, 0.75, 0.9)`).
- `shadow.*` — modelled on Blueprint's `$pt-dark-elevation-shadow-*` (1px inset
  hairline + stacked black drop shadows); exact dp specs not re-measured.
- `typography.label.weight = 600` — Blueprint form labels render near normal;
  600 chosen for hierarchy.
- `tabs.activeWeight = 600` — Blueprint signals tab selection via colour + the
  indicator bar (no strong weight change); 600 added for the Sentropic tab model.
- Dark `feedback.*` / `status.*` use the lighter intent steps (`green4 #32a467`,
  `orange4 #ec9a3c`, `red4 #e76a6e`, `blue4 #4c90f0`) for legibility on navy —
  Blueprint's dark-mode treatment of intent text, not distinct named tokens.
- `pagination.*`, `badge.*`, `accordion.*` — Blueprint ships no Pagination /
  Badge component and uses Collapse (no dedicated accordion); modelled from
  Blueprint button / tag / text styles.
- The 8-colour categorical `data.*` palette — a coherent ordering of Blueprint's
  extended ramps (`blue4, green4, orange4, red4, violet4, turquoise4, gold4,
  indigo4`), tuned for dark; Blueprint publishes the ramps but no ordered
  sequential scale.

## Asset officiel
- The Palantir wordmark and the Blueprint mark are official Palantir brand
  assets — reference them from Palantir/Blueprint brand resources, do not redraw.
  Blueprint icons come from the official `@blueprintjs/icons` set.
