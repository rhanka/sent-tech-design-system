# Air Liquide → Sentropic mapping

This package maps the **public** Air Liquide brand identity onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**, but Air Liquide is
a corporate brand, not a public web design-system: only the two **signature
brand colours** (corporate blue, "Unique Red") and the **font names** are public
and load-bearing. Everything else (grey scale, hover/light/dark tints, feedback
colours, data-vis palette, the typeface stand-in) is **DERIVED** and flagged
`à confirmer`. No font binaries or logo artwork are bundled — only public CSS
values and font *names* are referenced.

## Sources
- Air Liquide corporate site / visual identity — https://www.airliquide.com/
- Press release "Air Liquide announces a new visual identity" (2017) — establishes the blue + "Unique Red" identity.
- Brand colour reference (cross-check) — https://www.brandcolorcode.com/air-liquide
- Brand palette reference (cross-check) — https://www.schemecolor.com/ (Air Liquide palette)

## Colour mapping

| Sentropic role | Air Liquide source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` | Corporate blue, Pantone 7684 C | `#375F9B` |
| `action.danger` / `feedback.error` / accent (`cyan`) | "Unique Red", Pantone 2035 C | `#D7001E` |
| `surface.default` / `surface.raised` | brand background (white) | `#ffffff` |

The two colours above are the only **measured/published** brand tokens. All rows
below are derived to complete the Sentropic contract.

## À confirmer (derived or no published brand token)
- **Grey scale (entire ramp)** — Air Liquide publishes no neutral scale. Derived ramp tuned to the brand slate: `grey0 #ffffff`, `grey50 #f5f7fa`, `grey200 #d5dce5`, `grey500 #6b7785`, `grey600 #5a6573`, `grey800 #1f2a3a`, `grey900 #111827`. `text.primary` / `surface.inverse` use `#1f2a3a`.
- **Blue tints** — `blue.hover #2c4d80`, `blue.deep #1f3a66`, `blue.light #e6ecf5` — derived darker/deeper/lighter steps off the `#375F9B` corporate blue.
- **Red tints** — `red.light #fbe0e4`, `red.dark #a8001a` — derived light/dark steps off the `#D7001E` "Unique Red".
- **Feedback colours** — `success #2e9e5b`, `warning #e0820b` derived; `error #D7001E` and `info #375F9B` reuse the brand colours.
- **Typeface** — Air Liquide's proprietary corporate typeface is **"Alfa"**. We approximate it publicly with **Montserrat** (a geometric sans of comparable proportions) for both display and body; mono is the standard `SFMono` system stack. Font *names* only, never binaries.
- **`data.*` palette** — an 8-colour categorical proposal from the brand hues plus complementary tones: `#375F9B`, `#D7001E`, `#2e9e5b`, `#e0820b`, `#249DD9`, `#00a0b4`, `#6f42c1`, `#1f3a66`. Not an official sequential scale.
- **`shadow.*`, `motion.*`, `density.*`** — not published by the brand; kept aligned with the Sentropic base / standard size scale (shadow tinted on the `#1f2a3a` brand slate).

## Typography
- **Display / titles & body / controls / fields / labels** (`font.display`, `font.sans`, `typography.control/field/label`): `'Montserrat', sans-serif` — public approximation of Air Liquide's proprietary **"Alfa"** typeface *(à confirmer)*.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — standard system stack.
- Links: corporate blue `#375F9B`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#d5dce5` border, 4px radius). Native `<select>` chevron redrawn in corporate blue `#375F9B`.
- **Radius**: 4px on controls/inputs/tabs (`radius.sm/md = 0.25rem`), 8px on cards (`radius.lg = 0.5rem`); pills/tags stay `999px`.
- **Focus**: high-contrast **outline** in the corporate blue `#375F9B` (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Buttons**: primary = solid corporate blue `#375F9B` → hover `#2c4d80`; secondary = **outlined in the brand "Unique Red"** (transparent fill, `#D7001E` border, light-red `#fbe0e4` hover).
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled corporate blue `#375F9B`.

## Asset officiel
- Air Liquide logo = the **"Alfa" symbol + wordmark** in the brand red/blue. Use the official SVG/PNG from the brand — **do not redraw the logo by hand**. This package references font *names* and public brand colour values only, never logo artwork or font binaries.
