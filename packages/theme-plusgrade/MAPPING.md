# Plusgrade theme — measured-clone provenance

`@sentropic/design-system-theme-plusgrade` — a measured clone of Plusgrade
(plusgrade.com, Montréal travel/ancillary-revenue tech). Every colour below is
measured from the live site's computed CSS; anything without a measured
equivalent is flagged **à confirmer**.

## Sources
- Live site: https://www.plusgrade.com — computed CSS inspected in a real
  browser (no public design-token file is published).
- Identity: a vivid deep **orange** brand accent on a near-black navy canvas,
  modern-startup (rounded) geometry, clean white content surface.

## Colour mapping table

| Role (Sentropic)                | Value     | Provenance |
| ------------------------------- | --------- | ---------- |
| `action.primary`                | `#ff5722` | measured — vivid deep orange CTA |
| `action.primaryHover`           | `#e64a19` | measured — darker orange on hover |
| `action.primaryText`            | `#ffffff` | measured — white on orange |
| `action.danger` / `system.danger` | `#d32f2f` | measured — error / danger red |
| `text.primary`                  | `#000414` | measured — near-black navy body text |
| `text.secondary`                | `#4a4f5a` | measured — cool slate grey |
| `text.muted`                    | `#8a909a` | measured — cool muted grey |
| `text.link`                     | `#ff5722` | à confirmer — links tinted to brand orange |
| `surface.default` / `raised`    | `#ffffff` | measured — white content surface |
| `surface.subtle`                | `#f4f5f7` | measured — very light cool grey fill |
| `surface.inverse`               | `#000414` | measured — near-black navy dark canvas |
| `border.subtle`                 | `#d8dce2` | measured — light cool hairline |
| `border.interactive` / `focus.color` | `#ff5722` | measured — focus tracks brand orange |
| `data.category1`                | `#ff5722` | brand orange |
| `data.category2`                | `#000414` | near-black navy |
| `data.category3..5`             | greys     | cool grey ramp (à confirmer — no official scale) |

## À confirmer (no measured Plusgrade equivalent)
- `system.success` `#2e7d32`, `system.warning` `#b26a00`, `system.info`
  `#1565c0` — restrained, WCAG-AA-on-white system hues; Plusgrade publishes no
  feedback colours.
- `text.link` orange tint, `badge.infoBackground` orange — derived from the
  brand accent, not measured directly.
- Spacing steps, density heights, motion durations — aligned to the Sentropic
  base 4px scale; exact Plusgrade tokens not public.
- Mono font stack — Plusgrade has no monospace face; Sentropic mono kept.

## Typography
- sans / display: `'Inter', Helvetica, Arial, sans-serif` — modern geometric
  grotesk used across the marketing site (**à confirmer**: exact font face;
  names only, no binaries shipped).
- mono: Sentropic default stack (kept).
- Control / button casing: sentence case, weight 600, no uppercase tracking
  (modern-startup convention; à confirmer exact tracking).

## Signatures anatomiques
- `field.style: "outline"` — boxed white fields with a #d8dce2 hairline and 6px
  rounding; native `<select>` chevron redrawn in #4a4f5a.
- `focus.strategy: "outline"`, 2px solid #ff5722, 2px offset — focus in the
  brand orange.
- `radius`: modern startup (rounded) — none 0, sm 2px, md 6px, lg 12px, pill
  999px.
- Active indicators (tabs / pagination / breadcrumb current) = #ff5722; data
  category1 = #ff5722, category2 = #000414.

## Asset officiel
- Logo / brand assets: official Plusgrade marks from plusgrade.com (not bundled
  in this package — names/colours only).
