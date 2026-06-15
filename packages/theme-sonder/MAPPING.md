# Sonder — measured-clone mapping ledger

Brand: **Sonder** (sonder.com) — design-forward hospitality / short-stay rentals,
headquartered in Montréal. Theme id `sonder`, label `Sonder`, mode `light`.

## Sources
- Live site computed CSS, inspected in a real browser: `https://www.sonder.com`.
- No public design-token file is published; colour values are MEASURED from the
  live surfaces where possible and otherwise INFERRED from the measured
  cream/ink/clay palette. Sonder ships a bespoke typeface; no binary is used.
- The measured `theme-color` / signature surface is a warm **cream/sand**
  (`#f7f3ea`) — this is the load-bearing brand cue and drives `surface.subtle`.

## Colour mapping table

| Sentropic role                     | Value     | Provenance |
|------------------------------------|-----------|------------|
| `action.primary`                   | `#1a1a1a` | Measured near-black ink / confident CTA |
| `action.primaryHover`              | `#000000` | Deepened to pure black on hover (à confirmer) |
| `action.primaryText`               | `#ffffff` | White text on near-black |
| accent (data cat1 / highlight)     | `#c4502e` | Terracotta / clay accent (à confirmer — inferred warm accent) |
| `text.primary`                     | `#1a1a1a` | Measured near-black body ink |
| `text.secondary`                   | `#5a5550` | Warm grey secondary text |
| `text.muted`                       | `#8a8378` | Muted warm grey (à confirmer) |
| `surface.default`                  | `#ffffff` | White page background |
| `surface.subtle`                   | `#f7f3ea` | **Measured signature cream/sand** (theme-color) |
| `surface.inverse`                  | `#1a1a1a` | Near-black inverse surface |
| `border.subtle`                    | `#e6e0d6` | Warm hairline border |
| `action.danger` / `system.danger`  | `#c0392b` | Warm deep red (à confirmer) |
| `feedback.success`                 | `#3e7d4f` | Restrained warm green (à confirmer — no source) |
| `feedback.warning`                 | `#b26a00` | Dark amber, AA on white (à confirmer) |
| `feedback.info`                    | `#1a1a1a` | Sonder ink, not blue (à confirmer) |

## À confirmer
- **Terracotta accent `#c4502e`**: the warm clay highlight is inferred from the
  measured cream/ink identity; exact hex and its use as focus vs data-only is
  unconfirmed. Focus ring itself is encoded as ink `#1a1a1a` (measured-adjacent).
- **CTA hover `#000000`**: the deepen-to-black hover is a plausible inference,
  not a measured token.
- All `feedback.*` hues except `danger` have no Sonder source; chosen for legible
  WCAG AA on white while staying warm.
- Spacing/motion/density steps are aligned to the Sentropic base; exact Sonder
  steps are not publicly tokenised.

## Typography
- Sonder ships a **custom refined grotesk** face (bespoke, non-distributable).
- Encoded stack (names only): `'Inter', Helvetica, Arial, sans-serif` — the
  closest public grotesk proxy (à confirmer; not the actual bespoke face).
- Mono is not part of Sonder; the Sentropic mono stack is retained.

## Signatures anatomiques
- `field.style: "outline"` — boxed white field with a thin warm `#e6e0d6` hairline,
  soft 4px radius; native `<select>` chevron redrawn in ink (`#1a1a1a`).
- `focus.strategy: "outline"` — crisp ~2px near-black (`#1a1a1a`) outline, 2px offset.
- Radius: soft hospitality — none 0 / sm 2px / md 4px / lg 8px / pill 999px.
- Warm secondary button = cream (`#f7f3ea`) fill, ink text, warm-border hover.
- Tabs/pagination/breadcrumb active = near-black `#1a1a1a`.
- Data-vis: terracotta `#c4502e` leads, then ink, then warm-grey ramp + system hues.

## Asset officiel
- No official font binary or logo asset is bundled. Font names only; colours are
  measured/inferred from public CSS. (Chrome/logo work is handled separately by
  the orchestrator, not in this package.)
