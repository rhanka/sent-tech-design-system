# Circle K → Sentropic mapping

This package maps **Circle K** (circlek.com — the global convenience-store brand
of **Alimentation Couche-Tard**, the Laval/Montréal-HQ retailer) onto the
Sentropic token structure (`TenantTheme`). The **brand red, the ink and the grey
scale are MEASURED from circlek.com's CSS**; the **fonts, radii, the orange
accent and the status/feedback hues are DERIVED** and explicitly flagged
`à confirmer` below. Only the font *names* are referenced (a clean retail
`"Helvetica Neue" / Arial` sans), never font binaries.

Circle K's identity is a **clean red-on-white retail** system: the signature
**Circle K red `#DA291C`** (measured) drives every primary CTA, link and brand
accent; ink is a **near-black `#1a1a1a`** (measured) on **white** surfaces with a
faint grey `#f2f2f2` (measured) page tint; a warm **orange `#F58220`** from the
Circle K logo mark is a decorative accent (`à confirmer`). Form fields are **boxed
outlines** (white fill, thin grey `#e0e0e0` stroke); focus is a **2px red
outline** in the brand red `#DA291C`.

## Sources
- Circle K storefront (measured) — https://www.circlek.com/
- Brand red, ink and grey scale measured from circlek.com's stylesheets (the
  values in the "measured" column below). Circle K is a Couche-Tard brand
  (https://corpo.couche-tard.com/).
- Brand red / logo colours cross-referenced externally —
  https://brandfetch.com/circlek.com (red + orange/yellow logo pair).

## Colour mapping

| Sentropic role | Circle K source | Value | Provenance |
|---|---|---|---|
| `action.primary` / `action.danger` / `border.interactive` / `text.link` / `tabs.activeText` / `focus.color` / brand | brand red | `#DA291C` | **measured** |
| `action.primaryHover` | darker red on hover | `#b8221a` | à confirmer |
| `cyan.50` / `data.category2` (orange accent) | Circle K logo orange | `#F58220` | à confirmer |
| `text.primary` / `surface.inverse` / ink | primary ink | `#1a1a1a` | **measured** |
| `text.secondary` / `border.strong` | secondary text | `#575855` | **measured** |
| `text.muted` | muted text | `#8a8a87` | à confirmer |
| `surface.default` / `surface.raised` / `action.primaryText` | surface default / CTA text | `#ffffff` | **measured** |
| `surface.subtle` / `action.secondary` / card hover / tag fill | faint page grey | `#f2f2f2` | **measured** |
| `border.subtle` (field/divider stroke) | subtle border | `#e0e0e0` | à confirmer |
| `feedback.success` | success | `#2e7d32` | à confirmer (AA on white) |
| `feedback.warning` | warning (Circle K orange) | `#F58220` | à confirmer |
| `feedback.error` | error (brand red) | `#DA291C` | **measured** (brand red) |
| `feedback.info` | info | `#1169da` | à confirmer (AA-safe) |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` | à confirmer |

### "À confirmer" (derived / no measured source)
- **`action.primaryHover` `#b8221a`** — a darker red on hover, **derived** from the
  measured brand red `#DA291C`; no published hover token.
- **Orange accent `#F58220`** — taken from the Circle K logo mark; used as a
  decorative accent (`cyan.50`, `data.category2`, `feedback.warning`). Not sourced
  from a CSS variable — `à confirmer`.
- **`red.100` `#fbeae8` / orange tint `#fef0e2`** — faint tints **derived** for
  soft fills; no published source token.
- **`text.muted` `#8a8a87`** — a muted grey **derived** between the secondary ink
  `#575855` and the surface; no separately measured token.
- **`border.subtle` `#e0e0e0`** — the field/divider stroke; `à confirmer` (the ink
  `#575855` is the measured strong border).
- **Fonts** — Circle K's exact `@font-face` family is **NOT sourced**; a clean
  retail `"Helvetica Neue", Arial, sans-serif` is referenced by NAME only for
  sans + display. Mono is not part of Circle K (Sentropic `ui-monospace` stack
  kept). All typography is `à confirmer`.
- **`radius.*`** — not separately measured: `sm 2px`, `md 4px` (controls), `lg 8px`
  (cards), `none 0`, `pill 999px`. `à confirmer`.
- **`feedback.*` / `status.*`** — Circle K publishes no status palette; success
  `#2e7d32`, warning `#F58220` (brand orange), error `#DA291C` (brand red), info
  `#1169da` are **derived** AA-targeted hues. `à confirmer`.
- **The 8-colour categorical `data.*` palette** — **assembled** from the measured
  brand hexes (red lead, orange, ink, secondary ink, greys, info blue). `à confirmer`.
- **`shadow.*`, `motion.*`, `spacing.*`, `density.*`** — standard light-surface
  ramps kept aligned with the Sentropic base; not separately measured. `à confirmer`.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.control/field/label`): a clean retail **`"Helvetica Neue", Arial,
  sans-serif`** — referenced by NAME only, **not sourced** from `@font-face`
  (`à confirmer`). Base type **16px**; control/label weight 600.
- **Links** resolve to the **brand red** `#DA291C`, underline on hover
  (`à confirmer`).
- **Monospace** (`font.mono`): not part of Circle K; the Sentropic `ui-monospace`
  stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#e0e0e0`, à confirmer), not a filled-underline. Native `<select>`
  chevron redrawn in the near-black ink `#1a1a1a` with a ~36px gutter
  (`appearance:none`).
- **Radius** (à confirmer): controls/inputs **4px** (`radius.md`); cards **8px**
  (`radius.lg`); chips **2px** (`radius.sm`); tags/badges **pill** (`999px`).
- **Borders**: field/divider strokes **1px solid `#e0e0e0`** (à confirmer); brand
  accent **`#DA291C`**; strong border = the measured secondary ink `#575855`.
- **Focus**: **red outline** (`focus.strategy: "outline"`, 2px, `#DA291C` = brand
  red) — the brand red drives the focus indicator on this retail UI.
- **Buttons**: primary = **solid Circle K-red, white label** (`#DA291C` fill, white
  text, hover `#b8221a` à confirmer); secondary = **grey fill** (`#f2f2f2`,
  near-black ink, hover `#e0e0e0`).
- **Tabs / sub-nav**: active = bold **red** label with a **red bottom indicator**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless red links; active page = **filled brand-red pill**,
  white text.
- **Tags / badges**: **pill** (`radius: 999px`) — faint-grey-fill tags with
  near-black ink; brand-red filled badges with white text.
- **Density** (à confirmer): 16px base type, ~44px md control, comfortable
  whitespace, soft light elevation.

## Asset officiel
- Circle K wordmark + brand mark (the red lettering / orange-yellow "K" mark),
  served as official SVG/PNG from the site header and brand resources. Reuse the
  official asset (e.g. via brandfetch.com/circlek.com or the site header logo) if
  a logo is needed. **Do not redraw** — reuse the official Circle K logo asset.
