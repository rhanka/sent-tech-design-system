# Veolia → Sentropic mapping

This package maps **Veolia**'s brand — the French environmental-services group
(water / waste / energy) — onto the Sentropic token structure (`TenantTheme`).
Method = **measured-clone**: the brand colours, typeface choice and anatomy
signatures are taken from Veolia's **public 2024 graphic charter** ("the
essentials of the graphic charter") and cross-checked against the **live
veolia.com** digital UI (its compiled CSS). Only public charter values, public
hexes and font *names* are referenced — no font binaries, no logo artwork.
Values Veolia does not publish as exact hexes for digital UI roles (neutral
scale steps, hover/light/deep red derivations, the semantic feedback set) are
flagged `à confirmer`.

## Sources
- Veolia 2024 graphic charter ("the essentials of the graphic charter"), section *"5 > Colors and fonts"* — https://www.veolia.am/sites/g/files/dvc2946/files/document/2025/04/EN-2024.pdf (measured directly: PANTONE references + RGB/HEX colour codes + font names)
- Live veolia.com digital UI CSS — `https://www.veolia.com/themes/custom/veo_site/build/assets/styles/design_v2.css` and the aggregated theme CSS (measured `--theme-bg-color` greys/brights, live red `#EE0000`, web font stack `"Noto Sans", Arial, …`)
- Cross-check — https://www.brandcolorcode.com/veolia (`#E71B24` legacy/derived red), https://logotyp.us/logo/veolia/

## Colour mapping

| Sentropic role | Veolia source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` / `tabs.activeText` | Charter **"Red"** — PANTONE 485 C (official screen HEX) | `#FF0000` |
| `action.primaryHover` | derived darker red | `#CC0000` *(à confirmer)* |
| `action.danger` / `feedback.error` | derived deep red (AA on white, distinct from brand red) | `#990000` *(à confirmer)* |
| accent (`cyan` slot) | Charter **"Turquoise"** — PANTONE 311C (water segment) | `#05C3DD` |
| accent light | Charter **"Pale blue"** — PANTONE 636 C | `#99E1EF` |
| `feedback.success` | Charter **"Forest green"** — PANTONE 7741 C | `#438D42` |
| `feedback.warning` | Charter **"Orange"** — PANTONE 1505C | `#FF6900` |
| `feedback.info` | Charter **"Marine"** — PANTONE 295C | `#002D62` |
| `surface.default` / `surface.raised` / field fill | Charter white | `#ffffff` |
| `surface.subtle` / `action.secondary` | live `--theme-bg-color` | `#f2f2f2` *(à confirmer — digital UI grey)* |
| `border.subtle` / field stroke | live grey | `#e5e5e5` *(à confirmer)* |
| `border.strong` | live grey | `#999999` *(à confirmer)* |
| `text.muted` | live grey | `#808080` *(à confirmer)* |
| `text.secondary` | Charter **PANTONE COOL GRAY 11** (R85 G85 B90) | `#55555a` |
| `text.primary` | live dominant text grey | `#333333` *(à confirmer)* |
| `surface.inverse` | live near-black `--theme-bg-color` | `#191919` *(à confirmer)* |
| black | Charter **PANTONE PROCESS BLACK C** | `#000000` |

> **The brand colour is RED, not blue.** Veolia's logotype is *always red*, and
> red is the brand's primary/action family. This clone therefore wires the
> Veolia **Red `#FF0000`** (PANTONE 485 C) into the Sentropic **"blue" role
> slot** (primary action / link / focus), and parks the brand **Turquoise
> `#05C3DD`** (PANTONE 311C, the water-segment accent — a genuine cyan) in the
> **"cyan" accent slot** (decorative / data-vis only).

> **Charter HEX `#FF0000` vs live digital `#EE0000`.** The official 2024 charter
> assigns `#FF0000` (PANTONE 485 C) as the screen HEX for the brand red; the
> deployed veolia.com UI renders a hair-darker `#EE0000`. This package uses the
> **charter value `#FF0000`** as the canonical brand red and keeps `#EE0000` as
> the documented live-UI variant (`red.web`).

### À confirmer (derived or not published as an exact digital-UI hex)
- **Derived reds** — `red.hover #CC0000` (primary hover), `red.deep #990000` (danger/error), `red.light #FFE5E5` (light tint / secondary-button hover fill), `turquoise.dark #098192` (darker turquoise; the `#098192` itself is a live `--theme-bg-color`). The charter publishes a single red (`#FF0000`); hover/error shades are derived.
- **Neutral scale** `#f2f2f2 / #e5e5e5 / #cccccc / #999999 / #808080 / #666666 / #333333 / #191919` — measured from the live veolia.com `--theme-bg-color` tokens (a Drupal site); the charter publishes only the brand grey **Cool Gray 11 `#55555a`**, so the digital scale around it is `à confirmer`.
- **Semantic feedback set** — `success #438D42`, `warning #FF6900`, `info #002D62` are mapped from the **charter bright palette**; `error #990000` is a derived deep red. The charter does not define a success/warning/error/info system, so the mapping is `à confirmer`.
- **8-colour categorical `data.*`** (`#FF0000`, `#05C3DD`, `#78BE21`, `#FFD616`, `#FF6900`, `#772583`, `#002D62`, `#55555a`) — a coherent proposal drawn from the charter bright palette + business-segment colours, not an official sequential scale.
- `shadow.*`, `motion.*`, `radius.*`, and the sm/lg `density.*` paddings — not strongly tokenised publicly; kept aligned with the Sentropic base / standard size scale and the bold-geometric brand feel.
- `focus.width 2px` / `offset 2px`, `field.style "outline"` — the live forms are boxed inputs with a coloured focus; width/offset are the closest faithful expression `(à confirmer)`.

## Typography
- **Display / titles** (`font.display`) and **body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'TheSans', 'Noto Sans', Arial, Helvetica, sans-serif`**.
  - **TheSans** is Veolia's charter **publishing typeface** ("TheSans is the font for all publishing uses"); it is proprietary (LucasFonts) — referenced by *name* only.
  - **Arial** is the charter's licensed **office/web** font ("Arial is the font for all office documents… for web use Arial also requires a licence").
  - **Noto Sans** is what the live **veolia.com** web UI actually renders as the TheSans substitute (`font-family:"Noto Sans",Arial,…` — measured) — both are humanist sans, so it is a faithful digital fallback.
- **Logotype font — FS Rufus.** The charter's `"FS Rufus bold"` is the **signature/logotype font**, created specifically for the wordmark and **forbidden in any other context** ("Do not use a font other than FS Rufus"). It is therefore **NOT** used in the UI stack here — analogous to a logo-only asset.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: Veolia red `#FF0000`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#e5e5e5` border, 4px radius). Native `<select>` chevron redrawn in Veolia red `#FF0000`.
- **Focus**: high-contrast **outline** in Veolia red `#FF0000` (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Radius**: bold-geometric brand — 4px on controls / inputs / tabs (`radius.sm/md = 0.25rem`), 8px on cards (`radius.lg = 0.5rem`); pills/tags stay `999px`.
- **Buttons**: primary = solid Veolia red `#FF0000` → hover `#CC0000`, white label, bold (weight 700); secondary = **outlined red** (transparent fill, `#FF0000` border + text, light red `#FFE5E5` hover fill).
- **Tabs / top-nav**: active tab = bold red label with a bottom red underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless red links; active page = filled Veolia red `#FF0000`.
- **Density**: substantial, touch-friendly controls (md ≈ 44px) with generous horizontal padding.

## Asset officiel
- The Veolia logo = the **red abstract symbol** + the **"Veolia" wordmark** (set in the bespoke **FS Rufus** font), always rendered in red on a white/black background. Use the **official SVG/PNG** from Veolia's brand assets — **do not redraw the logo by hand**. This package references only public charter token values and font *names* (TheSans, FS Rufus, Arial, Noto Sans), never logo artwork or font binaries.
