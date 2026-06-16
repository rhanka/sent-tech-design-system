# Reitmans (reitmans.com) → Sentropic mapping

This package maps **Reitmans** (the Montréal-founded women's fashion retailer,
Reitmans Canada) onto the Sentropic token structure (`TenantTheme`). Reitmans
publishes no design-token file, so every value is **MEASURED from the live site's
computed CSS** (https://www.reitmans.com, inspected in a real browser). Only font
*names* are referenced — no font binaries.

## Sources
- Reitmans storefront — https://www.reitmans.com (measured computed CSS)
- Brand identity: a red + navy system set on warm cream surfaces.

## Colour mapping

| Sentropic role | Source (measured) | Value |
|---|---|---|
| `action.primary` / `border.interactive` | Reitmans red CTA fill | `#e70404` |
| `action.primaryHover` | red CTA hover | `#c00303` |
| `action.primaryText` | CTA label | `#ffffff` |
| `action.danger` / `feedback.error` | red error / sale accent | `#e70404` |
| `text.link` / accent (Sentropic `cyan`) / `feedback.info` | navy accent | `#34459c` |
| `text.primary` / `surface.inverse` | near-black editorial text | `#1a1a1a` |
| `text.secondary` / `border.strong` | warm grey secondary text | `#5a5550` |
| `text.muted` | warm muted grey | `#8a857e` |
| `surface.default` / `surface.raised` | page background | `#ffffff` |
| `surface.subtle` / `action.secondary` | **measured warm CREAM fill** | `#f8f3ec` |
| `border.subtle` | warm light hairline | `#e7e4e1` |
| `focus.color` | near-black focus outline | `#1a1a1a` |

### "À confirmer" (no measured Reitmans source)
- `feedback.success` `#2e7d32` and `feedback.warning` `#b26a00` — restrained system
  hues chosen for WCAG AA on white; Reitmans publishes no green/amber.
- `feedback.info` mapped to the navy `#34459c` (Reitmans has no separate info hue).
- `cyan.70` reuses navy `#34459c` — no darker measured navy step exists.
- The 8-colour categorical `data.*` palette — a coherent proposal led by the two
  brand hues (red, navy) then warm greys, **not** an official scale.
- `shadow.*`, `motion.*`, `spacing.*` exact steps — not strongly tokenised
  publicly; kept aligned with the Sentropic base.

## Typography
- Reitmans renders its UI in **'SuisseIntl'** (measured), a licensed grotesque we
  cannot ship. We **substitute Inter** — the closest widely-available match —
  across `font.sans`, `font.display`, and the `typography.*` families:
  `'Inter', Helvetica, Arial, sans-serif`. **à confirmer**: the SuisseIntl → Inter
  substitution is an inferred match, not a measured token.
- **Monospace** (`font.mono`): kept on the Sentropic / Simons mono stack — Reitmans
  has no monospace face.
- CTAs are UPPERCASE with measured letter-spacing; links underline on hover.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px warm-grey
  `#e7e4e1` border, near-square 2px radius), with the native `<select>` chevron
  redrawn in `#1a1a1a`.
- **Radius**: SHARP / fashion-flat — `none/sm = 0`, `md = 2px`, `lg = 4px`,
  `pill = 999px`.
- **Focus**: crisp near-black outline (`2px` solid `#1a1a1a`), `outline` strategy.
- **Buttons**: primary = solid Reitmans red `#e70404` (hover `#c00303`); secondary
  = warm-cream filled chip (`#f8f3ec` fill, ink text, `#e7e4e1` hover).
- **Tabs / sub-nav**: active tab = red label with a red bottom underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = filled red `#e70404`.
- **Breadcrumb**: ink links, warm-grey trail, **red** current page.
- **Density**: touch-friendly controls (md ≈ 44px height) with generous padding.

## Official asset
- Logo / wordmark: the Reitmans red wordmark — to be sourced from the official
  brand asset (à confirmer; not bundled in this token package).
