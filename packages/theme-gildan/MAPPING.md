# Gildan theme — provenance ledger (`@sentropic/design-system-theme-gildan`)

A **measured-clone** of Gildan's corporate brand for the Sentropic token
structure. Gildan (Gildan Activewear) is the Montréal-headquartered global
apparel manufacturer; the public corporate site is **gildan.com**. Gildan
publishes **no public design-token file**, so colour and type values are MEASURED
from the live site's computed CSS or **inferred from the brand mark**; every
inferred value is flagged **à confirmer** below.

## Sources
- `https://www.gildan.com` — corporate site, computed CSS inspected in a real
  browser (body ink, neutral greys, navy bands, hairlines).
- Gildan brand mark (royal blue) — basis for the primary action hue (inferred).
- No published token JSON / Figma / brand guideline file was available.

## Colour mapping table

| Sentropic role | Value | Source / provenance |
|---|---|---|
| `action.primary` | `#003087` | Royal blue from the brand mark — **à confirmer** (exact hue inferred) |
| `action.primaryHover` | `#00205a` | Darker navy press state (also the inverse band) |
| `action.primaryText` | `#ffffff` | White on blue |
| `text.primary` | `#313131` | **Measured** charcoal body ink |
| `text.secondary` | `#5e5e5e` | Secondary text |
| `text.muted` | `#8a8a8a` | Muted text |
| `text.link` | `#003087` | Royal-blue link ink |
| `surface.default` | `#ffffff` | Page background |
| `surface.subtle` | `#f4f4f4` | Subtle fill surface |
| `surface.inverse` | `#00205a` | Deep navy inverse band / footer tone |
| `border.subtle` | `#d8d8d8` | Light hairline (field / divider) |
| `border.strong` | `#5e5e5e` | Stronger border |
| `border.interactive` | `#003087` | Focus / interactive (royal blue) |
| `action.danger` / `feedback.error` | `#c0392b` | Error / destructive accent |
| `feedback.success` | `#2e7d32` | **à confirmer** — no Gildan source |
| `feedback.warning` | `#b26a00` | **à confirmer** — no Gildan source |
| `feedback.info` | `#003087` | Gildan would use its royal blue — **à confirmer** |

## À confirmer (inferred / no measured source)
- **Brand blue `#003087`** — inferred from the brand mark; the exact royal-blue
  hue should be sampled from an official Gildan asset.
- **Font** — the measured stack reads `system-ui`; substituted with the closest
  documentary face **Inter** (`'Inter', Helvetica, Arial, sans-serif`).
- `feedback.success` / `feedback.warning` / `feedback.info` — restrained, WCAG-AA
  system hues; Gildan publishes no measured equivalents.
- Spacing steps, shadow specs, motion durations, density metrics — aligned with
  the Sentropic base; not strongly tokenised on the public site.
- Categorical `data.*` ramp — coherent proposal led by the brand blue + charcoal;
  **not an official Gildan scale**.

## Typography
- `font.sans` / `font.display`: `'Inter', Helvetica, Arial, sans-serif`
  (measured `system-ui` → Inter substitute, **à confirmer**).
- `font.mono`: inherited Sentropic stack
  (`'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace`) —
  monospace is not part of Gildan's identity.
- Names only — no font binaries are bundled.

## Signatures anatomiques
- **`field.style: "outline"`** — boxed white fields with a `#d8d8d8` @1px hairline
  and gentle 4px radius; native `<select>` chevron redrawn as a `#313131` data-URI
  with a 40px right gutter.
- **`focus.strategy: "outline"`** — crisp ~2px royal-blue (`#003087`) outline,
  2px offset.
- **Radius**: corporate — `none 0`, `sm 0`, `md 4px` (controls), `lg 8px` (cards),
  `pill 999px`.
- **Active states** (tabs / pagination / breadcrumb current): royal blue
  `#003087`; tabs use a bottom-border indicator; pagination active = filled blue
  box with white text.
- **Data**: `category1 #003087`, `category2 #313131`, then greys + system hues.

## Asset officiel
- No official token / Figma file was published by Gildan at clone time. The brand
  mark (royal blue) and the live corporate site CSS are the only references; all
  inferred values are flagged **à confirmer** above and should be reconciled
  against an official Gildan brand asset if one becomes available.
