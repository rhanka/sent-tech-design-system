# BNP Paribas → Sentropic mapping

This package maps the **public** BNP Paribas brand design onto the Sentropic
token structure (`TenantTheme`). Values are **measured** from the production CSS
of the public BNP Paribas retail website (the AEM "socle" client libraries that
declare the brand's `--color-*`, `--font-*`, `--space-*`, `--cta-*` and
`--radius-*` custom properties). Only public CSS tokens and font *names* are
referenced — the BNPP typefaces are proprietary and no binaries are shipped.

## Sources
- BNP Paribas retail site (measured CSS) — https://mabanque.bnpparibas/
  - `clientlib-base.min.css` and `clientlib-comp-aem-layout-*.css` under
    `/etc.clientlibs/neo/bnpparibas-neo-part-site-front/...` (measured
    `--color-*`, `--font-*`, `--cta-*`, `--radius-main`, `.form-control`,
    `.btn`/`.cta`, focus `outline:3px solid #0bf`).
- BNP Paribas group site — https://group.bnpparibas/ (brand reference; the page
  itself returns 403 to fetch, so values come from mabanque.bnpparibas CSS).
- Brand-colour aggregators (cross-check only, NOT used as the primary value):
  - https://www.brandcolorcode.com/bnp-paribas (green ≈ #009464)
  - BNPP Sans typeface history — https://fontsinuse.com/typefaces/41075/bnpp-sans

## Colour mapping

| Sentropic role | BNP source token | Value |
|---|---|---|
| `action.primary` / `border.interactive` / accent green | `--color-brand-primary` | `#00915a` |
| `action.primaryHover` | `--color-brand-primary-hover` | `#006d44` |
| `text.link` / `pagination.text` / `breadcrumb.linkText` | `--color-green-800` / `--color-link` | `#007a4c` |
| `action.secondaryText` / `feedback.success` | `--color-green-900` | `#008250` |
| `action.secondaryHover` / `buttonSecondary.hoverBackground` | secondary `--cta-bg-hover` | `#d8f3e9` |
| `action.secondary` | `--color-neutral-600` | `#e5f4ee` |
| `surface.inverse` / `surface.overlay` | `--color-green-1000` | `#013222` |
| `slate.90` (darkest) | `--color-green-1100` | `#001c11` |
| `text.primary` | `--color-black` / `--color-regular` | `#181d1d` |
| `text.secondary` | `--color-neutral-900` / `--color-mention` | `#6d6d6d` |
| `text.muted` | `--color-neutral-500` / `--input-color` | `#767676` |
| `border.strong` / field underline | `--color-neutral-400` / `--input-border` | `#cccccc` |
| `border.subtle` | `--color-neutral-300` / `--form-color-border` | `#e7e7e7` |
| `surface.subtle` | `--color-neutral-200` | `#f5f5f5` |
| `card.hoverBackground` / `tag.neutralBackground` | `--color-neutral-100` | `#f0f0f0` |
| `surface.default` / `surface.raised` / `field.fillBg` | `--color-neutral-000` | `#ffffff` |
| `action.danger` / `feedback.error` | `--error-input` | `#ce1e43` |
| `feedback.info` | `--color-info` | `#a33467` |
| `focus.color` | `outline:3px solid #0bf` (site-wide) | `#00bbff` |
| accent (Sentropic `cyan`) | decorative blue (measured) | `#2279e0` |

### "À confirmer" (derived / no direct BNP token)
- `feedback.warning` `#a85a00` — BNP publishes no amber token; derived for WCAG
  AA on white. (`status.pending` reuses it.)
- `cyan.10` `#e6f0fb` and `cyan.70` `#1a5fb0` — light/dark tints derived from the
  decorative blue `#2279e0`.
- `surface.inverse` = `#013222` (dark green) — the *role assignment* is a brand
  choice; the hex itself is the measured `--color-green-1000`.
- `buttonSecondary.border` `#008250` — the real BNP secondary is a borderless
  white button with green text; a green stroke is added so it reads as a button.
- `card.borderWidth` `1px` — many BNP cards are shadow-based / borderless; the
  1px stroke keeps cards readable in the docs grid.
- `badge.infoBackground` `#00915a` — the BNP count/alert badge is magenta
  (`--color-badge` `#b4174e`); the INFO badge is mapped to the brand green.
- `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`, `accordion.*`, `tag.*`,
  `badge.*`, `choice.*`, `search.*`, `toggle.*` metrics — recoloured with measured
  BNP values; the exact paddings/sizes follow the base scale (not individually
  measured against each BNP component).
- The 8-colour categorical `data.*` palette — a coherent proposal from measured
  decorative hues (`#2279e0`, `#ee5842`, `#8051a7`, `#008f9e`, `#ed973c`,
  `#d262a5`, `#1cbe4c`), not an official sequential scale.
- `shadow.*` and `motion.*` — not strongly tokenised publicly; kept aligned with
  the base.
- Spacing — BNP's 4px grid on a 15px root (`--space-16` = 1.0667rem ≈ 16px) is
  comparable in absolute px to the Sentropic base scale, which is kept.

## Typography
- **Display / titles** (`font.display`): `'BNP Type', 'BNP Sans', 'Open Sans',
  Arial, sans-serif` (measured `--font-type`).
- **Body / interactive / fields** (`font.sans`, `typography.control/field/label`):
  `'BNP Sans', 'Open Sans', Arial, sans-serif` (measured `--font-bnp-sans`; the
  production body stack renders `Open Sans, Arial` as the shipped web fallback).
- **Monospace** (`font.mono`): the Sentropic mono stack (no BNPP mono face exists).
- `'BNP Condensed'` (`--font-condensed`) is BNP's numeric/condensed face — not a
  Sentropic foundation slot, so it is not mapped.
- BNPP Sans / BNPP Type are proprietary (not licensable); only the **names** are
  referenced, never binaries.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed white inputs (`#ffffff` fill,
  1px `#cccccc` border, ~3px radius). Measured `.form-control`.
- **Radius**: ROUNDED brand — buttons 8px (`--cta-radius`), cards/containers 16px
  (`--radius-main` 1rem on a 15px root); fields nearly square (~3px). Pills `999px`.
- **Focus**: thick high-contrast **sky-blue** outline — `3px solid #00bbff` with a
  `3px` offset (measured site-wide `outline:3px solid #0bf; outline-offset:3px`),
  contrasting the green brand.
- **Buttons**: primary = solid BNP green (`#00915a`, hover `#006d44`), tall
  (measured CTA min-height ≈ 56px, padding 12px/24px, weight 600, line-height
  1.35, 8px radius); secondary = white/ghost with green text and a light mint
  (`#d8f3e9`) hover.
- **Tabs / top-nav**: active tab = bold BNP-green label with a bottom green
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless green links; active page = filled BNP green.
- **Density**: tall, touch-friendly controls (md ≈ 48px field height, lg ≈ 56px CTA).

## Asset officiel
- BNP Paribas logo = the "courbe d'envol" (flight curve) of green stars rising on
  a green square, with the "BNP PARIBAS" wordmark. It is a registered trademark —
  use the official asset, do **not** redraw it by hand.
