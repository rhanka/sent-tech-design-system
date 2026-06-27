# Schneider Electric → Sentropic mapping

This package maps the **public** Schneider Electric brand design onto the
Sentropic token structure (`TenantTheme`). Schneider Electric ships a tokenised
public design system — **Quartz** (`quartz.se.com`, GitHub org `quartzds`) —
whose signature is the **"Life Green"** brand colour. Method =
**measured-clone**: the brand green (`#3DCD58`, Quartz brand green / Emerald
"Life Green") is taken from the public brand references; only public values and
the brand font *name* (Nunito, the Quartz `--qds-font-family-brand`) are
referenced — never font binaries. Derived/unmeasured values are flagged
`à confirmer`.

## Sources
- Schneider Electric corporate site — https://www.se.com/
- Quartz Design System (Schneider Electric) — https://quartz.se.com/ , GitHub org `quartzds`; brand typeface token `--qds-font-family-brand` (Nunito).
- Brand colour reference (cross-check) — https://www.brandcolorcode.com/schneider-electric
- Colour reference (Life Green / Emerald) — https://encycolorpedia.com/3dcd58

## Colour mapping

| Sentropic role | Schneider Electric source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | Quartz brand green / Emerald "Life Green" | `#3DCD58` |
| `action.primaryHover` | derived darker green | `#2fb347` *(à confirmer)* |
| `text.link` / `action.secondaryText` / `tabs.activeText` / `breadcrumb.linkText` | derived deep green (legible) | `#1e7e34` *(à confirmer)* |
| `buttonSecondary.hoverBackground` / light green tint | derived light green | `#e3f7e8` *(à confirmer)* |
| `text.primary` / `surface.inverse` | derived near-black slate | `#1a2326` *(à confirmer)* |
| `text.secondary` / `border.strong` | derived secondary grey | `#6b7780` *(à confirmer)* |
| `text.muted` | derived muted grey | `#4d575e` *(à confirmer)* |
| `border.subtle` / field stroke | derived subtle grey | `#c8d0d4` *(à confirmer)* |
| `surface.subtle` / `action.secondary` | derived background alt | `#f4f6f7` *(à confirmer)* |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `action.danger` / `feedback.error` | derived error red | `#e2231a` *(à confirmer)* |
| `feedback.success` | derived success green | `#2e9e4f` *(à confirmer)* |
| `feedback.warning` | derived warning amber | `#f08c00` *(à confirmer)* |
| `feedback.info` | derived info blue | `#2e7dd1` *(à confirmer)* |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | dark text on Life Green (contrast choice) | `#0a160d` *(à confirmer)* |

## À confirmer (derived or no published brand token)
- **Neutral slate scale** (`#ffffff`, `#f4f6f7`, `#c8d0d4`, `#6b7780`, `#4d575e`, `#1a2326`, `#0f1518`) — Quartz greys are not extracted publicly; this is a coherent derived neutral ramp.
- **Green hover/deep/light tints** (`#2fb347`, `#1e7e34`, `#e3f7e8`) — derived from the Life Green `#3DCD58` for hover, legible labels and low-emphasis surfaces.
- **Feedback hues** (`success #2e9e4f`, `warning #f08c00`, `error #e2231a`, `info #2e7dd1`) — derived status palette; not extracted from Quartz tokens.
- **`primaryText` / dark-on-green text** `#0a160d` — Schneider uses dark text on the Life Green; the dark slate is chosen so the filled green button / badge / active page clear WCAG AA (the green `#3DCD58` is too light for white text).
- **Font stack** — Nunito is the Quartz brand typeface (`--qds-font-family-brand`); the exact fallback stack here is a faithful expression, the precise published stack is *à confirmer*.
- **Categorical `data.*` palette** (`#3DCD58`, `#1a2326`, `#2e7dd1`, `#f08c00`, `#e2231a`, `#16a34a`, `#6b7780`, `#1e7e34`) — a coherent proposal from the brand hues, not an official sequential scale.
- `shadow.*`, `motion.*`, and the sm/lg `density.*` paddings — not strongly tokenised publicly; kept aligned with the Sentropic base / standard size scale.

## Typography
- **Body / controls / fields / labels / display** (`font.sans`, `font.display`, `typography.control/field/label`): `'Nunito', sans-serif` — Nunito is the Schneider Electric / Quartz brand typeface (`--qds-font-family-brand`). We reference the font *name* only.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: deep green `#1e7e34`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#c8d0d4` border, 4px radius). Native `<select>` chevron redrawn in the Life Green `#3DCD58`.
- **Radius**: 4px on controls/inputs/tabs (`radius.sm/md = 0.25rem`), 8px on cards (`radius.lg = 0.5rem`); pills/tags stay `999px`.
- **Focus**: high-contrast **outline** in the Life Green `#3DCD58` (`focus.strategy = "outline"`, 2px width, 2px offset).
- **Buttons**: primary = solid Life Green `#3DCD58` with **dark text** `#0a160d` (AA contrast) → hover `#2fb347`; secondary = **outlined** in the Life Green (transparent fill, `#3DCD58` border, deep-green text, light-green `#e3f7e8` hover fill).
- **Tabs / top-nav**: active tab = deep-green label `#1e7e34` with a bottom green underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless deep-green links; active page = filled Life Green `#3DCD58` with dark text.

## Asset officiel
- Schneider Electric logo: the green square symbol + "Schneider Electric" wordmark (with the green "Life Is On" / Life Green identity). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *name* (Nunito) and public colour values, never logo artwork or font binaries.
