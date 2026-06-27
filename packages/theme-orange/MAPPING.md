# Orange (Boosted) → Sentropic mapping

This package maps **Orange**'s public, open-source design system — **Boosted**
([boosted.orange.com](https://boosted.orange.com/), repo
`Orange-OpenSource/Orange-Boosted-Bootstrap`) — onto the Sentropic token
structure (`TenantTheme`). Method = **measured-clone**: every colour, the
typeface stack and the anatomy signatures are taken from Boosted's published
Sass tokens (`scss/_variables.scss`, the ODS colour palette) and the Boosted
component docs. Only public token values and font *names* are referenced — no
font binaries (Orange's licensed `HelvNeueOrange` is NOT shipped/network-loaded).
Values Boosted does not expose for a Sentropic role (derived tints, motion,
some paddings) are flagged `à confirmer`.

## Sources
- Boosted color palette (ODS tokens) — https://boosted.orange.com/docs/5.3/customize/color-palette/
- Boosted theme colors — https://boosted.orange.com/docs/5.3/customize/color/
- Boosted options (`$enable-rounded`, border-radius scale) — https://boosted.orange.com/docs/5.3/customize/options/
- Boosted buttons (primary = orange + black text) — https://boosted.orange.com/docs/5.3/components/buttons/
- Boosted form-control (boxed inputs, heights) — https://boosted.orange.com/docs/5.3/forms/form-control/
- Boosted focus-ring helper — https://boosted.orange.com/docs/5.3/helpers/focus-ring/
- Boosted Sass variables — https://raw.githubusercontent.com/Orange-OpenSource/Orange-Boosted-Bootstrap/main/scss/_variables.scss

## Colour mapping

| Sentropic role | Orange/Boosted source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / data cat1 | `$supporting-orange` / `$ods-orange-100` — brand orange, active state | `#ff7900` |
| `action.primaryHover` / `text.link` / `tabs.activeText` / `breadcrumb.linkText` | `$orange` / `$primary` / `$ods-orange-200` — AA-safe darker orange | `#f16e00` |
| `action.primaryText` | `$component-active-color` = `$black` — BLACK text on orange | `#000000` |
| `surface.default` / `surface.raised` / `field.fillBg` | `$body-bg` = `$white` | `#ffffff` |
| `surface.subtle` / `card.hoverBackground` | `$gray-200` — light surface | `#f6f6f6` |
| `border.subtle` / field stroke | `$border-color-subtle` = `$gray-500` = `$ods-gray-400` | `#cccccc` |
| `border.strong` / `card` / pagination border / `$border-color` | `$border-color` = `$black` — high-contrast borders | `#000000` |
| `text.primary` / `surface.inverse` / `action.secondary` / focus outer | `$body-color` / `$secondary` / `$dark` = `$black` | `#000000` |
| `text.secondary` | `$gray-800` / `$ods-gray-700` | `#595959` |
| `text.muted` | `$body-secondary-color` = `$gray-700` / `$ods-gray-600` | `#666666` |
| neutral chip / mid greys | `$ods-gray-200/300/500/900` | `#eeeeee` / `#dddddd` / `#999999` / `#141414` |
| `action.danger` / `feedback.error` | `$red` / `$functional-red` / `$ods-fire-200` | `#cd3c14` |
| `feedback.success` | `$green` / `$functional-green` / `$ods-forest-200` | `#228722` |
| `feedback.warning` | `$yellow` / `$functional-yellow` / `$ods-sun-100` (`#fc0`) | `#ffcc00` |
| `feedback.info` / `badge.infoBackground` | `$blue` / `$functional-blue` / `$ods-water-200` | `#4170d8` |
| data cat6 / cat7 (data-vis only) | `$ods-purple-300` / `$ods-pink-300` (supporting) | `#a885d8` / `#ffb4e6` |

> **Two oranges — important distinction.** Boosted ships **`$supporting-orange`
> `#ff7900`** (`$ods-orange-100`, the bright brand orange used for the primary
> button, active components, focus accent) and **`$orange` `#f16e00`**
> (`$ods-orange-200`, which Boosted assigns to `$primary` — the AA-safe darker
> orange for interactive *text*, links, hover and the focus-ring base on white).
> This package wires the bright orange to filled actions / active states and the
> darker orange to text-level interactive roles.

> **Black is central to Orange.** `$body-color`, `$secondary`, `$dark`,
> `$border-color` and the primary-button text all resolve to `$black` `#000000`.
> Borders are black, inverse surfaces are black, and the primary orange button
> carries black (not white) text.

### À confirmer (derived or not publicly extracted)
- **`text.link` = `#f16e00`** — Boosted's literal `$link-color` is `$black`
  (black links, **underlined** at rest) with `$link-hover-color: $primary`
  (`#f16e00`) on hover. We surface the AA-safe hover orange as the link role and
  keep the underline (`typography.link.textDecoration: "underline"`); `text.link`
  therefore reads `#f16e00` rather than the literal rest-state black.
- **Derived orange tints** `orange.tint #fff2e6`, `orange.darker #cc5d00` — light/dark
  steps for the `blue.10`/`cyan.10/70` accent slots; not published hexes.
- **`cyan` accent slot** — Orange has no second brand hue, so the slot stays
  monochrome-orange (the `#f16e00` family) instead of introducing a foreign blue.
- **`buttonSecondary.hoverBackground #333333`** and **`action.secondaryHover #333333`**
  — Boosted `.btn-secondary` is a solid black button (`$secondary = $black`, white
  text); the darker hover shade is derived.
- **`pagination.activeBackground #ff7900` + black text** — Boosted active page =
  `$pagination-active-bg: $component-active-bg` (`#ff7900`) + `$component-active-color`
  (`#000`); confirmed roles, exact box padding derived.
- The **8-colour categorical `data.*`** palette (`#ff7900`, `#4170d8`, `#228722`,
  `#ffcc00`, `#cd3c14`, `#a885d8`, `#ffb4e6`, `#666666`) — a coherent proposal from
  the Boosted functional + supporting hues, not an official sequential scale.
- `shadow.*`, `motion.*`, `surface.overlay` opacity, `disabledOpacity`, and the
  sm/lg `density.*` paddings — not strongly tokenised publicly; kept aligned with
  the Sentropic base / Bootstrap defaults.
- `focus.width 2px` / `offset 2px` — Boosted's accessible focus is a double
  outline (`$focus-visible-outer-color: $black`, `$focus-visible-inner-color: $white`,
  `$focus-ring-width: .25rem`); width/offset are the closest faithful expression of
  the double-ring strategy.

## Typography
- **Display / titles** and **body / controls / fields / labels**: the Boosted
  `$font-family-sans-serif` = `"HelvNeueOrange", "Helvetica Neue", Helvetica,
  "Noto Sans", "Liberation Sans", Arial, sans-serif`. We reference the public
  **`'Helvetica Neue', Helvetica, Arial, …` system stack only** — Orange's
  licensed `HelvNeueOrange` binary is deliberately NOT loaded.
- **Labels** are bold (`typography.label.weight: 700`); button/control labels keep
  regular weight, no transform.
- **Links** are underlined at rest (`$link-decoration: underline`), black → orange
  (`#f16e00`) on hover.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.

## Signatures anatomiques
- **Radius — SQUARE (the Orange signature).** `$enable-rounded: false` flattens
  every box corner: `radius.sm/md/lg = 0`, `tag.radius = 0`, `badge.radius = 0`.
  Buttons, inputs, cards, tabs, tags and badges are square. `radius.pill = 999px`
  is kept so genuinely circular controls (radios, switches, avatars) stay round.
  (Boosted's `$border-radius` scale `.375 / .25 / .5rem` exists but is gated off
  by `$enable-rounded: false`.)
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px
  `#cccccc` `$border-color-subtle` border, square corners). On focus the input
  border goes to `currentcolor` (black). Native `<select>` chevron redrawn in
  black with a 40px right gutter (`appearance:none`).
- **Focus**: `focus.strategy = "double"` — Boosted's accessible focus-visible is a
  black outer outline wrapped in a white separator halo (`$focus-visible-outer-color:
  $black`, `$focus-visible-inner-color: $white`), visible on any background.
  `color: #000000`, width `2px`, offset `2px`.
- **Buttons**: primary = solid bright orange `#ff7900` with **black** text →
  hover darker orange `#f16e00`; secondary = solid black `#000000` with white text
  (Boosted `.btn-secondary`).
- **Tabs / top-nav**: active tab = bold orange `#f16e00` label with a bottom orange
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: square 1px black-bordered page boxes, black link text; active
  page = filled bright orange `#ff7900` with black text.
- **Breadcrumb**: orange `#f16e00` links, black current page, grey `#666666`
  separators.

## Asset officiel
- Orange logo = the **square orange "Orange" wordmark in a `#ff7900` square**. Use
  the official Orange brand SVG/PNG — **do not redraw the logo by hand**. This
  package only references font *names* (Helvetica Neue stack) and published token
  values, never logo artwork or font binaries.
