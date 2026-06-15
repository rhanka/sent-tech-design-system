# Lion Electric → Sentropic mapping

This package maps **Lion Electric** (thelionelectric.com — the Saint-Jérôme, Québec
all-electric truck & school-bus manufacturer) onto the Sentropic token structure
(`TenantTheme`). Lion Electric's public site is a **WordPress + Elementor** build
(theme `hello-elementor`, kit **`elementor-kit-6`**). Elementor compiles the brand
design into a "global kit" stylesheet that publishes the brand colour roles as CSS
custom properties (`--e-global-color-accent`, `--e-global-color-primary/secondary/
text`, plus light-blue brand tints) and the brand typography
(`--e-global-typography-*`). Every value here is **measured from that live kit
stylesheet** and the per-page Elementor sheets (fetched directly via curl). Only font
*names* are referenced (`"Roobert LE"`, the brand's proprietary geometric sans,
measured from `--e-global-typography-*-font-family` and the `@font-face` family
names), never font binaries.

Lion Electric's identity is **bold, clean and electric**: a vivid **electric-blue
`#4164FF`** (`--e-global-color-accent`) drives every primary CTA and the brand
accent; the canvas is **pure white `#FFFFFF`** (`--e-global-color-primary`) and ink
is **pure black `#000000`** (`--e-global-color-text`); a soft **pale-blue-grey
`#EBF0F3`** (`--e-global-color-secondary`) is the quiet surface tint, and a family of
**light sky-blues** (`#72C6EF`, `#D4EBF6`, `#CEDBE2`) carry secondary buttons and
accents. Buttons are **mildly rounded** (measured `border-radius:10px`) with generous
padding (measured `20px 60px` on the kit CTA), and the brand's signature CTA hover
**inverts the colours**: the blue fill becomes the pale-blue-grey secondary and the
white label becomes the electric blue (measured `.elementor-kit-6
.elementor-button:hover` → `background:--e-global-color-secondary;
color:--e-global-color-accent`).

## Sources
- Lion Electric storefront (measured) — https://thelionelectric.com/
  Elementor global kit stylesheet fetched directly via curl:
  `https://thelionelectric.com/wp-content/uploads/elementor/css/post-6.css`
  (`elementor-kit-6`) — the `--e-global-color-*` brand colour roles, the
  `--e-global-typography-*` type roles, the `.elementor-kit-6 button` /
  `.elementor-button` rules (radius `10px`, padding `20px 60px`, accent fill, hover
  inversion) and the `h1`–`h3` heading rules.
- Per-page Elementor sheets `post-213.css` / `post-405.css` / `post-410.css` — the
  per-page `.elementor-button` variants (padding `15px 40px` / `10px 20px`,
  `font-weight:500/600`, border-color `#467ff7`, radius `10px`) and the secondary
  steel-blue (`--e-global-color-6d66d00` `#cedbe2`) button fills.
- Brand font family `"Roobert LE"` confirmed via the kit
  `--e-global-typography-*-font-family` and the `@font-face` declarations
  (`RoobertLE-Regular/Medium/Bold/Light/Heavy.woff`).

## Colour mapping

| Sentropic role | Lion Electric source (measured) | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `feedback.info` / brand | `--e-global-color-accent` (`.elementor-button` fill) | `#4164ff` |
| `action.primaryHover` / `surface.subtle` / quiet tint / CTA hover fill | `--e-global-color-secondary` (measured button :hover bg) | `#ebf0f3` |
| `cyan` accent / `data.category2` | `--e-global-color-d837983` (bright sky accent) | `#72c6ef` |
| `blue.10` / `cyan.10` / pale sky tint | `--e-global-color-b009999` | `#d4ebf6` |
| `action.secondary` / `border.subtle` / steel tint / secondary button fill | `--e-global-color-6d66d00` (measured per-page secondary button fill) | `#cedbe2` |
| blue stroke variant / `data.category7` | measured `.elementor-button` `border-color` (post-405) | `#467ff7` |
| `text.primary` / `surface.inverse` / ink / headings | `--e-global-color-text` / `--e-global-color-96b4d41` | `#000000` |
| `surface.default` / `surface.raised` / `action.primaryText` / `text.inverse` | `--e-global-color-primary` | `#ffffff` |
| `surface.overlay` | black ink at 60% (backdrop) | `rgb(0 0 0 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`feedback.success` `#2e7d32`, `feedback.warning` `#8a6d3b`, `feedback.error` /
  `action.danger` `#d12c2c`** — Lion Electric's kit publishes **no** success / warning
  / error hue (the palette is brand-blue + black/white + light-blue tints). These are
  AA-on-white green / amber / clean-red defaults so the status palette stays legible.
  (`status.*` reuse them.)
- **`text.secondary` / `text.muted` `#4a5560`** and **`border.strong` `#4a5560`** —
  Lion publishes no mid-grey secondary-ink hue (body ink is pure black). A mid
  blue-grey is derived from the steel-blue tint for a legible secondary ink.
- **`blue.80` `#2541cc`** — a darker electric-blue for the active/pressed action
  ground, derived from `#4164ff` (Lion publishes no pressed-state hue).
- **Form-field chrome (`field.*`)** — Lion's kit publishes **no custom input styling**
  (Elementor's default boxed input). `field.style:"outline"` (white fill, 1px
  steel-blue `#cedbe2` stroke, soft 10px radius matching the button language) is a
  brand-true default; the native `<select>` chevron is redrawn in the electric-blue
  `#4164ff`.
- **`focus.*`** — the kit publishes no explicit focus technique (the button `:focus`
  rule reuses the hover inversion). An electric-blue `#4164ff` 2px **ring** is encoded
  as the brand-true focus indicator.
- **The 8-colour categorical `data.*` palette** — Lion publishes no single categorical
  token list. The scale is assembled from the measured brand hexes (electric-blue →
  sky-blue → steel-blue → pale sky → AA success → amber → blue stroke → black).
- **`shadow.*`, `disabledOpacity`, `spacing.*`** — Lion's clean look is low-elevation
  with lots of white space; the kit publishes no single elevation ramp / disabled
  opacity, kept aligned with the base. Spacing is Elementor's 4/8px ramp.

## Typography
- **Body / UI / fields / controls AND display / headings** (`font.sans`,
  `font.display`, `typography.*`): **`"Roobert LE"`** — the brand's measured
  `--e-global-typography-*-font-family` (one proprietary geometric sans across every
  role: primary, secondary, accent and text), with the brand's own `Arial` fallback
  (measured `font-family:"Roobert LE", Arial`). Base body type 17px desktop → 15px →
  14px (measured `--e-global-typography-text-font-size`).
- **Headings** (`primary`/`secondary`/`accent` roles) are **weight 500** (measured
  `--e-global-typography-primary/secondary/accent-font-weight:500`), sizes
  45/35/25px desktop. **Body / fields** are **weight 400** (measured
  `--e-global-typography-text-font-weight:400`).
- **Control labels** — the CTA is the **accent** role (measured weight 500, ~17–25px,
  no uppercase / letter-spacing). Encoded as `control` weight 500.
- **Links** — electric-blue ink; underline on hover (Elementor default — exact
  decoration unsourced, `à confirmer`).
- **Monospace** (`font.mono`): not part of Lion Electric; the Sentropic mono stack kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px**
  steel-blue `#cedbe2` stroke, soft **10px** radius). Lion publishes no custom field
  chrome (`à confirmer`); the chevron is redrawn in the electric-blue `#4164ff`.
- **Radius**: buttons & cards **soft 10px** (measured `.elementor-button`
  `border-radius:10px 10px 10px 10px` → `radius.lg`); some utility elements square
  `0px` (`radius.none`); chips/badges pill.
- **Borders**: field/divider strokes **1px** steel-blue `#cedbe2`; the brand accent /
  per-page button stroke is the electric-blue `#4164ff` / `#467ff7`.
- **Focus**: **electric-blue ring** (`focus.strategy:"ring"`, 2px, 2px offset,
  `#4164ff`). The kit publishes no explicit focus chrome, so the brand-true blue ring
  is encoded (`à confirmer`).
- **Buttons**: primary = **solid electric-blue fill `#4164ff`, white text**, soft
  10px radius, generous padding `20px 60px` (measured kit CTA, weight 500). The
  signature hover **inverts the colours** (measured `:hover` → `background:#ebf0f3`
  secondary fill, `color:#4164ff` electric-blue label). Secondary = the **steel-blue
  ghost** (`#cedbe2` fill, black text → `#ebf0f3` hover).
- **Tabs / sub-nav**: active = bold **electric-blue** label with an **electric-blue
  bottom indicator** (`indicatorSide:"bottom"`, `indicatorMode:"border"`).
- **Pagination**: borderless black links; active page = **filled electric-blue** box,
  white text.
- **Tags / badges**: tags = soft 10px, pale-blue-grey `#ebf0f3` fill, black ink;
  badges = electric-blue filled pill, white text.
- **Density**: 17px base body type, generous CTA padding, clean white canvas, pure
  black ink, lots of white space, 500ms fade page transitions, restrained elevation.

## Asset officiel
- Lion Electric wordmark / lion-head mark, served from the site under
  `https://thelionelectric.com/wp-content/uploads/` (and the brand domain
  `lionev.com`). **Do not redraw** — reuse the official Lion Electric logo asset if a
  logo is needed.
