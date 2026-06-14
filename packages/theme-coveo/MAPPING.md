# Coveo → Sentropic mapping

This package maps **Coveo** (coveo.com — the Québec City AI-search & relevance
SaaS) onto the Sentropic token structure (`TenantTheme`). Every value here is
**measured from the live coveo.com stylesheets** (literal hex values in the brand
CSS). Only the font *name* is referenced (`"canada-type-gibson"` — the Gibson
webfont served as the brand display + body face), never font binaries. Values not
measured from a single published source are flagged **"à confirmer"**.

Coveo's identity is a **confident red-on-indigo enterprise-search** system: the
signature **Coveo red `#d2271b`** (the most-used brand accent, ~24 occurrences)
drives the primary CTA and brand accent; a near-black ink **`#0e0f12`** is the
primary ink, headings and reversed dark surface; an **interactive blue `#1169da`**
drives links and the focus indicator (deliberately a different hue from the red
brand so the indicator never blends into a red control); a family of **deep
indigo / purple** tones (`#393968` / `#333357` / `#390076`) carry dark surfaces
and secondary ink; surfaces are **white** on a very faint off-white `#f9f9fa`;
form fields are **boxed outlines** (white fill, thin grey `#e2e2e6` stroke).

## Sources
- Coveo marketing site (measured) — https://www.coveo.com/ and
  https://www.coveo.com/en/solutions
- Brand CSS (literal hexes, Gibson `@font-face`) — coveo.com brand stylesheet
  bundle (measured `font-family: canada-type-gibson, Arial, sans-serif`).
- Brand colours/logo confirmed externally — https://brandfetch.com/coveo.com
  (Coveo red `#d2271b` + indigo/blue brand pair).

## Colour mapping

| Sentropic role | Coveo source (measured) | Value |
|---|---|---|
| `action.primary` / `action.danger` / `border.interactive` / `tabs.activeText` / brand | primary CTA / brand accent (~24× brand hex) | `#d2271b` |
| `action.primaryHover` | darker red on hover (à confirmer) | `#b51f15` |
| `text.link` / `pagination.text` / `breadcrumb.linkText` / `focus.color` / `cyan.50` / `data.category2` / `feedback.info` | anchor/link + focused-field outline (interactive blue) | `#1169da` |
| `border.strong` / `action.secondaryText` / `tag.neutralText` / `cyan.70` / `data.category3` | dark surfaces / strong borders / secondary ink (deep indigo) | `#393968` |
| `text.secondary` / `slate.80` / `data.category5` | secondary text / dark surface alt (indigo) | `#333357` |
| `data.category4` (purple accent) | purple brand accent | `#390076` |
| `text.primary` / `surface.inverse` / `accordion.text` / `choice.labelColor` / heading ink | primary text + reversed dark surface | `#0e0f12` |
| `text.muted` / `breadcrumb.text` / `data.category6` | muted text (à confirmer) | `#6b7280` |
| `surface.default` / `surface.raised` / `action.primaryText` / `field.fillBg` | surface default / CTA text | `#ffffff` |
| `surface.subtle` / `action.secondary` / card hover | faint page off-white | `#f9f9fa` |
| `action.secondaryHover` / `tag.neutralBackground` | secondary button hover (à confirmer) | `#ececef` |
| `border.subtle` (field/divider stroke) | input border `1px solid` (à confirmer) | `#e2e2e6` |
| `feedback.success` | success feedback (AA on white, à confirmer) | `#2e7d32` |
| `feedback.warning` | warning feedback (AA-grade amber, à confirmer) | `#b26a00` |
| `feedback.error` | error feedback (the Coveo red) | `#d2271b` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`action.primaryHover` `#b51f15`** — the brand sheet exposes the canonical red
  `#d2271b`; the darker hover/active step `#b51f15` is the closest measured
  deepen but not confirmed as a single published hover token.
- **`red.100` `#fbe9e7`** — a faint red tint **derived** for soft fills; no single
  published source token.
- **`text.muted` `#6b7280`** — the muted/secondary grey is a measured-near value;
  flagged pending a confirmed brand token.
- **`border.subtle` `#e2e2e6`** — the boxed input stroke; measured-near, flagged
  pending a confirmed published field-border token.
- **The Sentropic `cyan` accent family** — Coveo has no separate cyan accent; its
  cool family is the interactive blue / indigo, mapped onto the `cyan` slot
  (`#e7f0fb` derived tint / `#1169da` / `#393968`) so a distinct cool accent
  survives.
- **`feedback.success` `#2e7d32` / `feedback.warning` `#b26a00`** — Coveo does not
  publish a full status palette; AA-safe success-green and amber are chosen over
  the brand hues (`feedback.error`/`feedback.info` reuse the brand red/blue).
- **`border.strong` `#393968`** — the deep indigo is used as the strong-border /
  dark-surface tone; the boxed field stroke proper is the lighter `#e2e2e6`.
- **The 8-colour categorical `data.*` palette** — Coveo publishes no single
  categorical token list; the scale is assembled from measured brand hexes (red
  lead, interactive blue, indigo, purple, indigo alt, greys, success, amber).
- **`shadow.*`, `motion.*`, `spacing.*`** — mapped to a standard 4/8px ramp and
  the three Sentropic elevation/timing slots; exact published steps not separately
  tokenised, kept aligned with the base.
- **`radius.*`** — `sm 4px` / `md 6px` / `lg 8px` / `pill 999px`: measured-near
  radii, flagged pending confirmed published radius tokens.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.control/field/label`): **`"canada-type-gibson"`** — the Gibson
  webfont served as Coveo's display + body face (measured `font-family:
  canada-type-gibson, Arial, sans-serif`), with the brand's own `Arial,
  sans-serif` fallback. Base type **16px**.
- **Control labels** are medium-weight (500) Gibson at 16px; **field text** is
  regular (400) Gibson 16px near-black; **labels** semibold (600).
- **Links** resolve to the **interactive blue** accent (`#1169da`), underline on
  hover (à confirmer).
- **Monospace** (`font.mono`): not part of Coveo; the Sentropic `ui-monospace`
  stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#e2e2e6`), not a filled-underline. Native `<select>` chevron redrawn in
  the deep indigo ink `#393968` with a ~36px gutter (`appearance:none`).
- **Radius**: small chips **4px**, controls/inputs **6px**, cards **8px**, pill
  chips **999px** (all à confirmer).
- **Borders**: field/divider strokes **1px solid `#e2e2e6`**; strong borders the
  deep indigo **`#393968`**; brand accent **`#d2271b`** (red interactive border).
- **Focus**: accessible **blue outline** (`focus.strategy: "outline"`, 2px,
  `#1169da` = interactive blue) — deliberately **blue, not the red brand**, so
  the ring stays visible on red controls.
- **Buttons**: primary = **solid Coveo-red, white Gibson text** (`#d2271b` fill,
  white text, hover `#b51f15`); secondary = **faint off-white fill, deep-indigo
  ink** (`#f9f9fa` fill, `#e2e2e6` stroke, `#ececef` hover).
- **Tabs / sub-nav**: active = bold **red** label with a **red bottom indicator**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = **filled brand-red pill**,
  white text.
- **Tags / badges**: **pill** (`radius: 999px`) — faint-grey-fill tags with indigo
  ink; brand-red filled badges with white text.
- **Density**: 16px base type, Gibson control labels, comfortable whitespace, soft
  light-tinted elevation.

## Asset officiel
- Coveo wordmark + brand mark (the red/indigo identity), served as official
  SVG/PNG from the site header and brand resources. Reuse the official asset (e.g.
  via brandfetch.com/coveo.com or the site header logo) if a logo is needed.
  **Do not redraw** — reuse the official Coveo logo asset.
