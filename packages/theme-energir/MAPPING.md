# Énergir theme — measured-clone mapping ledger

Brand: **Énergir** (energir.com — Québec natural-gas / energy utility, formerly
Gaz Métro). Package: `@sentropic/design-system-theme-energir`, id `energir`,
label `Énergir`, mode `light`.

## Sources
- Live computed CSS inspected from https://www.energir.com in a real browser
  (no public design-token file is published by Énergir).
- Colour values below tagged **measured** were read off real elements
  (CTAs, header/footer band, links, body text, hairlines). Values tagged
  **à confirmer** have no exact measured equivalent and are restrained,
  WCAG-AA-on-white choices that honour the institutional identity.

## Colour mapping table

| Role (Sentropic)              | Hex       | Provenance   | Note |
| ----------------------------- | --------- | ------------ | ---- |
| action.primary                | `#0047bb` | measured     | Énergir corporate blue CTA |
| action.primaryHover           | `#002855` | measured     | deep navy hover |
| action.primaryText            | `#ffffff` | measured     | white on blue |
| accent / cyan                 | `#009fdf` | measured     | energy/gas cyan accent |
| surface.inverse               | `#002855` | measured     | deep navy footer/header band |
| text.primary                  | `#1a1a1a` | measured     | near-black body text |
| text.secondary                | `#58595b` | measured     | rgb(88,89,91) grey ink |
| text.muted                    | `#8a8f96` | à confirmer  | muted grey, no exact token |
| surface.subtle                | `#f1f5fb` | measured     | pale cool-blue fill |
| border.subtle                 | `#d2dcea` | measured     | thin cool-blue hairline |
| action.danger / system.danger | `#d72020` | measured     | error / alert red |
| system.success                | `#2e7d32` | à confirmer  | no Énergir source |
| system.warning                | `#b26a00` | à confirmer  | no Énergir source |
| system.info                   | `#0047bb` | à confirmer  | reuses brand blue |
| data.category1                | `#0047bb` | derived      | brand blue |
| data.category2                | `#009fdf` | derived      | cyan accent |
| data.category3                | `#002855` | derived      | deep navy |
| data.category4..8             | greys/sys | à confirmer  | proposal, not an official scale |

## À confirmer
- Spacing steps, motion durations, shadow specs, density heights: not strongly
  tokenised publicly — kept aligned with the Sentropic base 4px scale.
- text.muted, system success/warning/info, data categories 4–8: no measured
  Énergir equivalent.

## Typography
- Measured stack: **`Arial, Helvetica, sans-serif`** (web-safe Arial, system
  resident) for both `sans` and `display`. Names referenced only — no binaries.
- `mono` kept as the Sentropic/Simons mono stack (Énergir ships no mono face).
- Control + label weight measured bold (700); body/field weight 400. CTAs are
  sentence case (no measured uppercase tracking).

## Signatures anatomiques
- `field.style: "outline"` — boxed white inputs with a 1px cool-blue (#d2dcea)
  hairline and 4px radius; native `<select>` chevron redrawn in brand blue.
- `focus.strategy: "outline"` — 2px solid #0047bb outline, 2px offset.
- Institutional rounding: none 0, sm 2px, md 4px, lg 8px, pill 999px.
- Active tab / pagination / breadcrumb current = brand blue #0047bb.

## Asset officiel
- Énergir wordmark / flame logomark: official brand assets only (not redrawn by
  hand). Chrome/header treatment handled separately by the docs orchestrator.
