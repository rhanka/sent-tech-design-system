# LG2 → Sentropic theme mapping (`@sentropic/design-system-theme-lg2`)

LG2 (lg2.com — Montréal's largest independent advertising agency). A **brutalist
monospace editorial** system: a vivid red-orange brand mark on a stark
black/white canvas, set entirely in a monospace typeface, with **sharp (zero)
corners everywhere**.

## Sources

LG2 publishes no public design-token file. All values are **measured from the
live site's computed CSS** (https://lg2.com, inspected in a real browser):
computed styles on CTAs, body text, links, and the page `theme-color` meta.
Anything without a measured equivalent is flagged **à confirmer** below.

## Colour mapping table

| Role (Sentropic) | LG2 value | Provenance |
| --- | --- | --- |
| `action.primary` | `#ff2300` | **Measured** red-orange CTA (13 occurrences) |
| `action.primaryHover` | `#cc1c00` | Darker red-orange CTA hover — **à confirmer** |
| `action.primaryText` | `#ffffff` | Measured on-accent (white) CTA text |
| `text.primary` | `#1a1a1a` | Measured near-black body text |
| `text.secondary` | `#454545` | **Measured** secondary ink |
| `text.muted` | `#a0a0a0` | **Measured** muted ink |
| `text.link` | `#007aff` | **Measured** link colour |
| `surface.inverse` | `#111111` | Black band (page `theme-color` = `#000`) |
| `action.danger` / `feedback.error` | `#d32f2f` | Measured error / system red |
| `border.subtle` / field border | `#d8d8d8` | Measured light hairline |
| `surface.subtle` | `#f4f4f4` | Measured subtle fill surface |
| `surface.default` | `#ffffff` | Measured page background |
| `border.interactive` / `focus.color` | `#ff2300` | Measured brand red-orange |

## À confirmer (no measured LG2 equivalent)

- `feedback.success` `#2e7d32`, `feedback.warning` `#b26a00` — restrained system
  hues chosen for WCAG AA on white; LG2 publishes none.
- `feedback.info` = `#007aff` — reuses the measured link blue.
- `action.primaryHover` `#cc1c00` — derived darker step of the red-orange.
- Spacing scale, shadows, motion durations, density steps — not strongly
  tokenised publicly; kept aligned with the Sentropic 4px base.
- `data.category3..8` — coherent monochrome + system-hue proposal, not an
  official LG2 scale.

## Typography

LG2's site is **monospace-driven**. Both `font.sans` and `font.display` (and
`font.mono`, plus `typography.control/field/label/link.family`) map to:

```
'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace
```

Font **names only** — no binaries shipped. CTAs are uppercase-tracked
(measured letter-spacing on the primary buttons).

## Signatures anatomiques

- **Brutalist sharp corners**: `radius` `none/sm/md/lg/pill` all `0` — no
  rounding anywhere (the defining structural signature).
- **`field.style: "outline"`**: boxed white field, `#d8d8d8` @1px hairline,
  square corners; native `<select>` chevron redrawn (`#1a1a1a`) via data-URI.
- **`focus.strategy: "outline"`**: 2px solid red-orange (`#ff2300`) outline.
- Active **tabs / pagination / breadcrumb** all signal with `#ff2300`
  (underline / filled box / current page). `data.category1` `#ff2300`,
  `data.category2` `#111111`.

## Asset officiel

LG2 wordmark / red-orange brand mark — reference the official site assets if a
chrome is built later; this package ships **no** brand binaries.
