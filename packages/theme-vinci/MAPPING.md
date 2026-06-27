# VINCI → Sentropic mapping

This package maps **VINCI**'s public web identity — the **`vinci_corp`** Drupal
theme served on [vinci.com](https://www.vinci.com/) — onto the Sentropic token
structure (`TenantTheme`). Method = **measured-clone**: every colour below is
read directly off the live stylesheet's documented CSS custom properties
(`--color-*`, `--font-*`). Only public token values and font *names* are
referenced — the "Vinci Sans" family is proprietary, so **no font binaries** are
shipped or network-loaded (consumers fall back to the site's own Arial/Helvetica
stack). Values VINCI does not expose as explicit tokens (darker hover tints, the
*role* of a measured hue as a "feedback" semantic, the mono stack) are flagged
`à confirmer`.

## Sources
- VINCI corporate site — https://www.vinci.com/ (Drupal `vinci_corp` theme)
- Measured live stylesheet — `https://www.vinci.com/sites/default/files/css/*` (CSS custom properties `--color-*`, `--font-*`), fetched 2026-06
- Brand colour cross-checks — https://www.brandcolorcode.com/vinci-sa (red `#E20025`, Pantone 485 C; blue `#004489`, Pantone 280 C) , https://www.schemecolor.com/vinci-sa-logo-colors.php
- VINCI logo / brand assets — https://brandfetch.com/vinci.com , https://1000logos.net/vinci-logo/

## Colour mapping

| Sentropic role | VINCI source (`vinci_corp` CSS) | Value |
|---|---|---|
| `action.primary` / `action.danger` / `feedback.error` / `tabs.activeText` / accent (`cyan` slot) | `--color-red` (VINCI logotype red, Pantone 485 C) | `#e20025` |
| `action.primaryHover` / `cyan` 70 | derived darker red | `#b3001e` *(à confirmer)* |
| `text.link` / `border.interactive` / `surface.inverse` / `breadcrumb.linkText` / `badge.infoBackground` | `--color-vinci-blue` (corporate navy) | `#004489` |
| `focus.color` / `feedback.info` / `blue` 60 | `--color-blue` (bright interactive blue) | `#0041b7` |
| `blue` 10 / `buttonSecondary.hoverBackground` | `--color-blue06` (light blue tint) | `#e5f1f9` |
| `cyan` 10 / light red tint | `--color-extra-light-pink` | `#ffe6e6` |
| `surface.default` / `surface.raised` | `--color-white` | `#ffffff` |
| `surface.subtle` / `action.secondary` | `--color-extra-light-grey` | `#f0f0f0` |
| `border.subtle` / `action.secondaryHover` | `--color-light-grey` | `#dcdcdc` |
| `text.muted` | `--color-grey04` | `#c8c8c8` |
| `text.secondary` / `border.strong` | `--color-grey` | `#6d6d6d` |
| `text.primary` | `--color-black` | `#333333` |
| darkest neutral (`slate` 90) | derived | `#1a1a1a` *(à confirmer)* |
| `feedback.success` | `--color-green` (brand olive-green) | `#5d8008` *(role à confirmer)* |
| `feedback.warning` | `--color-yellow` (brand amber) | `#dd8e00` *(role à confirmer)* |
| `data.*` extras | `--color-purple` / `--color-brown` / `--color-pink` | `#7e00d7` / `#b24e1c` / `#c4007e` |

> **Red vs blue — VINCI's two-colour identity.** VINCI separates a **signature
> red** `#e20025` (`--color-red`, the iconic logotype colour, also Pantone 485 C)
> from a **corporate blue** `#004489` (`--color-vinci-blue`) plus a brighter
> interactive blue `#0041b7` (`--color-blue`). On vinci.com the *blue* actually
> leads most interactive UI (links, focus outline, field/secondary borders —
> `color:var(--color-vinci-blue)` 256×, focus `outline:.125rem solid var(--color-blue)`),
> while the *red* is the brand signature and accent CTA (`background-color:var(--color-red)`).
> This theme **elevates the red logotype colour to `action.primary`** (per the
> VINCI brand identity — the red mark is what makes VINCI distinctive) and wires
> the **blue to link / focus / interactive-border** roles exactly as measured.

### À confirmer (derived or role-assigned, not an explicit VINCI token)
- **`action.primaryHover` / red dark `#b3001e`** — derived darker step of `--color-red` for hover/active (no published hover token).
- **`slate` 90 `#1a1a1a`** — derived darkest neutral; VINCI's darkest published neutral is `--color-black` `#333333` (and `--color-true-black` `#000`).
- **`feedback.success` `#5d8008` and `feedback.warning` `#dd8e00`** — the *hexes* are measured (`--color-green`, `--color-yellow`), but VINCI publishes no explicit feedback semantics, so their *use* as success/warning is the assigned role. `feedback.info` reuses the bright blue `--color-blue`.
- **`text.muted` `#c8c8c8`** (`--color-grey04`) is a light muted; it is a measured token but reads light on white (decorative/placeholder use).
- **8-colour categorical `data.*`** — every hue is a measured `--color-*` token, but VINCI publishes no ordered sequential scale, so the *order* is a coherent proposal.
- **`font.mono`** — VINCI publishes no monospace face; the system mono stack is used.
- **`shadow.*`, `motion.*`, `density.sm/lg`, `disabledOpacity`** — not strongly tokenised publicly; kept aligned with the Sentropic base / standard size scale.

## Typography
- **Display / titles** (`font.display`): **`'Vinci Sans Expanded'`** (`--font-heading-main`).
- **Body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'Vinci Sans'`** (`--font-standard`).
- VINCI also ships `'Vinci Sans Condensed'` (`--font-heading-alt`), `'Vinci Serif'` (`--font-serif`) and `'Vinci Rounded'` (`--font-rounded`) — measured but not wired into the core token roles.
- The **Vinci Sans family is proprietary**: only the font *names* are referenced; the Arial/Helvetica fallback is exactly the live site's own stack. No binaries are shipped or network-loaded.
- **Monospace** (`font.mono`): system stack — `'SFMono-Regular', …, monospace` *(à confirmer)*.
- Links: VINCI blue `#004489`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px solid border measured `border:.0625rem solid`, 4px radius). Native `<select>` chevron redrawn in VINCI blue `#004489`. *(The live site also shows a bottom-border `border-bottom:.0625rem solid` underline variant on some inputs; the dominant boxed 1px pattern is used here.)*
- **Focus**: high-contrast **outline** in the bright VINCI blue `#0041b7` (`focus.strategy = "outline"`, width `2px` measured `outline:.125rem solid var(--color-blue)`, offset `2px`).
- **Radius**: 4px on controls / inputs / tabs (`radius.sm/md = 0.25rem`, measured `border-radius:.25rem`), 8px on cards (`radius.lg = 0.5rem`, measured `border-radius:8px`/`.5rem`); pills/tags stay `999px`.
- **Buttons**: primary = solid VINCI red `#e20025` → hover `#b3001e`; secondary = **outlined VINCI blue** (transparent fill, `#004489` border + text, light-blue `#e5f1f9` hover fill).
- **Tabs / top-nav**: active tab = bold **red** label with a bottom red underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled VINCI red `#e20025`.
- **Density**: ~40px medium controls (`density.md.controlHeight = 2.5rem`) with 0.75rem inline padding.

## Asset officiel
- VINCI logo = the **red "VINCI" wordmark** (signature red `#e20025`), typically over white or the corporate navy. Use the official SVG/PNG from VINCI brand assets — **do not redraw the logo by hand**. This package references only font *names* (Vinci Sans family) and measured published token values, never logo artwork or font binaries.
