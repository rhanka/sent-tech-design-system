# CAE → Sentropic mapping

This package maps **CAE** (cae.com — the Montréal-HQ flight-simulation, modelling
& training company) onto the Sentropic token structure (`TenantTheme`). Every
value here is **measured from CAE's public stylesheet**
(`cae.com/assets/css/main.css`): the frequency-ranked brand hex palette, the
interactive-blue action colours, the Tailwind-derived grey ramp and ring/focus
blue, the field rules and the `@font-face` family names. Only the font *names* are
referenced (`"Red Hat Display"` display + body, `"Roboto Condensed"` for some
condensed labels), never font binaries.

CAE's identity is a **deep-navy-on-white engineering** system: the signature
**deep navy `#06103D`** (the single most-used brand hex) anchors headings, strong
ink and the reversed/inverse brand surface; an **interactive blue `#2969F2`**
drives every primary CTA, link and interactive accent; surfaces are **white** on a
faint grey `#f8f8f8`; **corners are mildly rounded** (6/8/12px); form fields are
**boxed outlines** (white fill, thin grey `#d1d5db` stroke, 8px radius); focus is a
**2px blue ring** in the brand interactive blue `#2969F2`.

## Sources
- CAE storefront (measured) — https://www.cae.com/
- Brand stylesheet (frequency-ranked literal hexes, field rules, `@font-face`) —
  `https://www.cae.com/assets/css/main.css`
- Brand colours / logo confirmed externally (deep-navy + interactive-blue brand
  pair) — https://www.cae.com/ header + brand resources.

## Colour mapping

| Sentropic role | CAE source (measured) | Value |
|---|---|---|
| `surface.inverse` / heading & strong ink / `slate.90` | most-used brand hex (deep navy) | `#06103D` |
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `focus.color` | interactive blue (primary CTA / link / ring) | `#2969F2` |
| `cyan.50` / lighter interactive accent / `data.category3` | interactive-blue lighter variant | `#197CF3` |
| `action.primaryHover` / `blue.80` | darkened CTA hover | `#1f57d6` |
| (tailwind ring utility) | ring blue (focus encodes brand `#2969F2`) | `#2563eb` |
| `text.primary` / `slate.80` | body/heading ink (tailwind slate-900) | `#111827` |
| `text.secondary` / `text.muted`* / `slate.60` / `breadcrumb.text` | secondary text (tailwind grey-500) | `#6b7280` |
| `text.muted` / `data.category8` | muted text (tailwind grey-400) | `#9ca3af` |
| `data.category5` (strong neutral ink) | grey-700 | `#374151` |
| (neutral ink) | grey-600 | `#4b5563` |
| `border.strong` / `data.category4` | grey-500 (stronger control border) | `#6b7280` |
| `field` stroke (`underlineColor`) | field outline `1px solid #d1d5db` | `#d1d5db` |
| `border.subtle` / `action.secondaryHover` / divider | subtle border / divider (grey-200) | `#e5e7eb` |
| `action.secondary` / `tag.neutralBackground` / `buttonSecondary.background` | secondary button surface (grey-100) | `#f3f4f6` |
| `surface.subtle` / card hover | faint page grey | `#f8f8f8` |
| `surface.default` / `surface.raised` / `action.primaryText` / `text.inverse` | surface default / CTA text | `#ffffff` |
| `action.danger` / `feedback.error` | danger red | `#dc2626` |
| `feedback.success` | success green (AA on white) | `#16a34a` |
| `feedback.warning` | warning amber (AA on white) | `#d97706` |
| `feedback.info` / `status.processing` | info (= interactive blue) | `#2969F2` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` |

\* `text.secondary` and `text.muted` both resolve to the grey ramp; `text.muted`
uses the lighter grey-400 `#9ca3af`.

### "À confirmer" (derived / no single published source)
- **`action.primaryHover` `#1f57d6`** — a **darkened** variant of the interactive
  blue `#2969F2`; CAE does not publish a distinct hover token, so the hover is a
  measured-blue darken.
- **`blue.10` / `cyan.10` `#eaf1fe`** — a faint interactive-blue tint **derived**
  for soft fills; no single published source token.
- **The Sentropic `cyan` accent family** — CAE has no separate cyan accent; its
  cool family is the lighter interactive blue `#197CF3` + deep navy `#06103D`,
  mapped onto the `cyan` slot so a distinct cool accent survives.
- **`focus.color` `#2969F2` / `focus.strategy: "ring"`** — the site uses the
  Tailwind `ring` utility (`#2563eb`); we encode an accessible **2px blue ring**
  in the brand interactive blue `#2969F2` so the indicator matches the action
  colour.
- **`action.danger` / `feedback.error` `#dc2626`** — no distinct error hue was
  measured on the sheet; the standard Tailwind red-600 `#dc2626` is used as an
  AA-safe danger.
- **`feedback.success` `#16a34a` / `feedback.warning` `#d97706` / `feedback.info`
  `#2969F2`** — no published feedback hues; AA-safe Tailwind green-600 / amber-600
  defaults, info = the interactive blue.
- **The 8-colour categorical `data.*` palette** — CAE publishes no single
  categorical token list; the scale is assembled from the measured navy / blue /
  grey brand hexes (interactive-blue lead, deep navy, lighter blue, grey ramp,
  success green, amber).
- **`shadow.*`, `motion.*`, `transition.*`, `disabledOpacity`** — exact box-shadows
  / duration steps / disabled opacity are not separately tokenised; kept aligned
  with the Sentropic base.
- **`radius.pill` `999px`** — kept for full-pill chips if needed; CAE's measured
  rounding is mild (6/8/12px) and tags/badges use the 6px small radius.
- **Body font (`"Red Hat Display"`)** — the display face is measured; the body
  face is **assumed** to also be Red Hat Display (a `"Roboto Condensed"` face is
  seen on some UI labels). Mono is not part of CAE; the Sentropic ui-monospace
  stack is kept.

## Typography
- **Display / headings** (`font.display`): **`"Red Hat Display"`** — CAE's brand
  face (measured `@font-face`), with a system-sans fallback chain.
- **Body / UI / fields** (`font.sans`, `typography.control/field/label`):
  **`"Red Hat Display"`** — assumed the same family as display (à confirmer;
  `"Roboto Condensed"` seen on some condensed labels). Base type **16px**.
- **Control labels** are **semibold (600)**; **field text** regular (400);
  **labels** semibold (600) at 14px.
- **Links** resolve to the **interactive blue** `#2969F2`, underline on hover
  (measured anchor `text-decoration:none` at rest).
- **Monospace** (`font.mono`): not part of CAE; the Sentropic `ui-monospace` stack
  is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#d1d5db`, **8px radius**), not a filled-underline. Native `<select>`
  chevron redrawn in the navy ink `#06103D` with a ~36px gutter (`appearance:none`).
- **Radius**: mild rounding — **sm 6px** (`0.375rem`), **md 8px** (`0.5rem`,
  controls/fields), **lg 12px** (`0.75rem`, cards); `none` 0; `pill` 999px (chips).
- **Borders**: field stroke **1px solid `#d1d5db`**; subtle divider **1px
  `#e5e7eb`**; brand accent **`#2969F2`** (interactive blue).
- **Focus**: accessible **blue ring** (`focus.strategy: "ring"`, 2px, `#2969F2` =
  brand interactive blue; the site uses the Tailwind `ring` utility `#2563eb`).
- **Buttons**: primary = **solid interactive-blue, white Red Hat Display (600)
  text** (`#2969F2` fill, white text, 8px radius, hover `#1f57d6`); secondary =
  **filled grey** (faint grey `#f3f4f6` fill, navy text, hover `#e5e7eb`).
- **Tabs / sub-nav**: active = bold **interactive-blue** label with a **blue bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = **filled interactive-blue
  pill**, white text.
- **Tags / badges**: **6px small radius** — faint-grey-fill tags with navy ink;
  interactive-blue filled badges with white text.
- **Density**: 16px base type, Red Hat Display control labels, comfortable
  whitespace, soft light-tinted elevation.

## Asset officiel
- CAE wordmark + brand mark (the deep-navy / interactive-blue identity), served as
  official SVG/PNG from the site header and brand resources. Reuse the official
  asset (e.g. the site header logo) if a logo is needed. **Do not redraw** — reuse
  the official CAE logo asset.
