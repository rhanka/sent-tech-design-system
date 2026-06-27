# Saint-Gobain → Sentropic mapping

This package maps the **public** Saint-Gobain brand design (the corporate site
[saint-gobain.com](https://www.saint-gobain.com/) and published brand-colour
references) onto the Sentropic token structure (`TenantTheme`). Method =
**measured-clone**: the brand hues below are taken from public Saint-Gobain
brand-colour references (with their Pantone equivalents); only public colour
values and font *names* are referenced — no font binaries, no logo artwork.
Derived/unmeasured values are flagged `à confirmer`.

**Scope:** this package builds ONLY `packages/theme-saint-gobain/`. It never
touches shared/docs/registration files; docs wiring is done separately by the
orchestrator.

## Sources
- Saint-Gobain corporate site — https://www.saint-gobain.com/
- Brand colour reference — https://www.brandcolorcode.com/saint-gobain
- Brand colour reference — https://coloropedia.com/saint-gobain/ (Saint-Gobain palette)
- Brand colour reference — https://www.schemecolor.com/ (Saint-Gobain brand colours)

## Colour mapping

| Sentropic role | Saint-Gobain source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `pagination` / `breadcrumb.linkText` / `badge.infoBackground` | Saint-Gobain wordmark blue, Pantone 7687 C | `#17428C` |
| accent (`cyan` slot) / `buttonSecondary.border` / `feedback.info` | Saint-Gobain light blue, Pantone 7689 C | `#249DD9` |
| accent (data-vis) | Saint-Gobain turquoise, Pantone 563 C | `#67B9B0` |
| `action.danger` / `feedback.error` | Saint-Gobain red, Pantone 1795 C | `#D62A29` |
| `feedback.warning` / orange accent | Saint-Gobain orange, Pantone 1595 C | `#E5531A` |
| `surface.default` / `surface.raised` / field fill | white | `#ffffff` |
| `surface.subtle` / `action.secondary` | neutral background alt | `#f4f6f9` |
| `border.subtle` / field stroke | neutral subtle border | `#d3dae3` |
| `text.secondary` / `border.strong` | neutral secondary | `#667085` |
| `text.muted` | neutral muted | `#4a5365` |
| `text.primary` / `surface.inverse` / dark slate | neutral dark slate | `#1c2430` |

## À confirmer (derived or no direct brand token)
- **Neutral grey scale** (`grey.0/50/200/500/600/800/900`: `#ffffff`, `#f4f6f9`, `#d3dae3`, `#667085`, `#4a5365`, `#1c2430`, `#0f1620`) — a coherent neutral ramp derived to pair with the brand blue; Saint-Gobain does not publish a single canonical neutral scale.
- **Blue hover / deep / light tints** (`blue.hover` `#0f3068`, `blue.deep` `#0a2350`, `blue.light` `#e5eaf3`) — derived from the brand blue `#17428C` for hover/active states and low-emphasis surfaces.
- **Light-blue tints** (`accent.lightBlueLight` `#e3f4fb`, `accent.lightBlueDark` `#1a7aad`) — derived from the brand light blue `#249DD9`.
- **`red.light` `#fbe3e2`** — derived light red tint for low-emphasis surfaces.
- **`feedback.success` `#2e9e5b`** — a derived green; Saint-Gobain's published brand palette does not include a dedicated success green. `feedback.warning` reuses the brand orange `#E5531A`; `feedback.error` reuses the brand red `#D62A29`; `feedback.info` reuses the brand light blue `#249DD9`.
- **`surface.inverse` `#1c2430`** — the brand has no single published dark-surface token; the neutral dark slate is used as the dark inverse.
- **Typography — Poppins** (`font.sans`, `font.display`, `typography.control/field/label`) — Saint-Gobain's wordmark uses an Avant Garde Gothic style geometric sans; **Poppins** is used as a freely available public approximation. The actual brand typeface is not embedded (font *names* only).
- **`data.*`** — the 8-colour categorical palette (`#17428C`, `#249DD9`, `#67B9B0`, `#E5531A`, `#D62A29`, `#2e9e5b`, `#0a2350`, `#1a7aad`) is a coherent proposal from the brand hues, not an official sequential scale.
- **`shadow.*`, `motion.*`, sm/lg `density.*` paddings** — not strongly tokenised on the brand site; kept aligned with the Sentropic base / standard size scale (shadows tinted with the slate `#1c2430`).
- **`focus.width` `2px` / `offset` `2px`** — a concrete faithful expression of a high-contrast brand-blue outline.

## Typography
- **Body + display / titles** (`font.sans`, `font.display`): `'Poppins', sans-serif` — a public geometric sans approximating the Saint-Gobain wordmark (Avant Garde Gothic style), *à confirmer*. Both roles share Poppins.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system mono stack.
- Links: brand blue `#17428C`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#d3dae3` border, 4px radius). Native `<select>` chevron redrawn in the brand blue `#17428C`.
- **Focus**: high-contrast **outline** in the brand blue `#17428C` (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Radius**: 4px on controls, inputs and tabs (`radius.sm/md = 0.25rem`), 8px on cards (`radius.lg = 0.5rem`), pills/tags stay `999px`.
- **Buttons**: primary = solid brand blue `#17428C` → hover `#0f3068`; secondary = outlined in the brand light blue (transparent fill, `#249DD9` border + text, light fill `#e3f4fb` on hover).
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled brand blue `#17428C`.

## Asset officiel
- Saint-Gobain logo: the bridge/aqueduct symbol + the blue wordmark (`#17428C`).
  Use the official SVG/PNG from the brand — **do not redraw the logo by hand**.
  This package only references font *names* and public brand colour values,
  never logo artwork or font binaries.
