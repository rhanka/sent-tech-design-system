# Maison Birks — measured-clone mapping

Brand: **Maison Birks** (maisonbirks.com) — Montréal luxury jeweller and
silversmith, founded 1879. Theme id `birks`, label "Maison Birks", mode `light`.

## Sources
- Live site computed CSS: https://www.maisonbirks.com (inspected in a real browser).
- No published design-token file exists; all values are MEASURED from rendered
  CSS or DERIVED and flagged `à confirmer` below.
- Fonts: the site loads proprietary Adobe/Typekit faces via JS (`p22-underground`
  geometric sans for display, `Beaufort Pro` serif companion). These cannot be
  shipped; we reference names only and substitute a free stack — see Typography.

## Colour mapping table

| Role (semantic)            | Birks value | Source / note |
| -------------------------- | ----------- | ------------- |
| action.primary             | `#00558c`   | signature "Birks Blue" CTA (à confirmer exact hue) |
| action.primaryHover        | `#003e66`   | darker Birks Blue, hover/pressed |
| action.primaryText         | `#ffffff`   | white text on blue |
| (accent) gold              | `#b08d57`   | jeweller's luxury gold accent (cyan slot / data category2) |
| text.primary               | `#1a1a1a`   | elegant near-black body text |
| text.secondary             | `#555555`   | secondary ink |
| text.muted                 | `#8a8782`   | warm muted grey (à confirmer) |
| text.link                  | `#00558c`   | links read in Birks Blue |
| surface.default / raised   | `#ffffff`   | page background |
| surface.subtle             | `#f4f4f3`   | very light warm fill |
| surface.inverse            | `#1a1a1a`   | elegant black band (footer/hero) |
| border.subtle              | `#dad8d4`   | warm light hairline |
| border.strong              | `#8a8782`   | stronger warm grey |
| border.interactive / focus | `#00558c`   | Birks-blue focus outline |
| action.danger / system     | `#c0392b`   | restrained luxury red — error/sale |

## À confirmer
- **Birks Blue exact hue** `#00558c` — measured approximation; the live theme
  variable is JS-rendered and not cleanly exposed in static CSS.
- **Display/body font** — proprietary `p22-underground` + `Beaufort Pro` are
  JS-loaded licensed webfonts; substituted by `'Inter', Helvetica, Arial,
  sans-serif` (closest free geometric-sans stand-in). Not the real face.
- **system.success / warning / info** — Birks has no measured equivalents;
  restrained, AA-on-white system hues chosen to stay quiet (info reuses the blue).
- **Spacing / radius / shadow / motion exact steps** — not strongly tokenised
  publicly; aligned to the Sentropic base (radius md=2px, lg=4px measured-ish).
- **data-vis categorical scale** — no official Birks scale; coherent proposal led
  by Birks Blue + gold, then graded greys + restrained system hues.

## Typography
- `font.sans` / `font.display`: `'Inter', Helvetica, Arial, sans-serif`
  (substitute for proprietary `p22-underground`, à confirmer).
- `font.mono`: Sentropic base mono stack kept (Birks has no mono).
- Control labels mid-weight (500), CTAs UPPERCASE-tracked (`letterSpacing 0.06em`).

## Signatures anatomiques
- `field.style: "outline"` — boxed white fields, warm-grey `#dad8d4` @1px hairline,
  minimal 2px radius; native `<select>` chevron redrawn (`#555555` data-URI).
- `focus.strategy: "outline"` — 2px solid Birks-blue `#00558c`, 2px offset.
- `radius`: luxury minimal — none 0, sm 0, md 2px, lg 4px, pill 999px.
- Active affordances (tabs / pagination / breadcrumb current) = Birks Blue `#00558c`.
- Badge/info fill = Birks Blue; secondary button = soft warm-grey `#f4f4f3` chip.

## Asset officiel
- Wordmark: "BIRKS" / "Maison Birks" set in the proprietary geometric sans on a
  white or elegant-black band; gold and Birks-blue accents. Use the official
  brand asset for any chrome/logo — do not hand-draw (handled separately by the
  docs/chrome layer, out of scope for this package).
