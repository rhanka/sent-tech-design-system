# Vidéotron → Sentropic token mapping (measured clone)

This package is a **measured clone** of the public **Vidéotron** storefront
(videotron.com — the Québecor-owned Québec telecom: internet, mobile, TV). Only
**public CSS token values and font family names** are reproduced; no font binaries,
no proprietary assets, no logo art are bundled. Every token value below is measured
from the live storefront's stylesheets; anything not directly measured is flagged
**À confirmer**.

## Sources

Fetched directly via `curl` (User-Agent: desktop Chrome) on 2026-06-15:

- `https://www.videotron.com/` — homepage HTML (inline brand styles, palette).
- `https://www.videotron.com/sites/default/files/css/css_*.css?delta=0&theme=dxp_front` — aggregated brand sheet (delta 0).
- `https://www.videotron.com/sites/default/files/css/css_*.css?delta=1&theme=dxp_front` — aggregated brand sheet (delta 1, ~942 KB; the bulk of the brand layer).

Method: frequency-ranked hex extraction over the brand sheets, plus targeted reads
of the `.btn` / `.btn-primary`, `.form-control`, `:focus`, `font-family`,
`--bf-border-radius-*` and Bootstrap-grade feedback rules.

## Colour mapping

| Role (Sentropic) | Source (measured) | Hex |
|---|---|---|
| `action.primary` / brand | `.btn-primary` background, 306× brand hex — THE Vidéotron yellow | `#ffd200` |
| `action.primaryHover` | darker yellow ground (123×) | `#e0b400` *(à confirmer as exact hover)* |
| `action.primaryText` | label colour ON the yellow button (134×) | `#2a2a27` |
| `text.primary` / ink | primary ink + heading colour (134×) | `#2a2a27` |
| strongest ink | darkest charcoal (78×) | `#1e1e1b` |
| `text.link` | anchor / strong ink (19×) | `#050504` |
| `text.secondary` | secondary + field text (89×) | `#575754` |
| `text.muted` | muted / placeholder (193×) | `#9b9b95` |
| `border.subtle` | divider grey (161×) | `#e0e0da` |
| `border.strong` | `.form-control` stroke 1px (91×) | `#bebeb7` |
| secondary control border | (76×) | `#c4c4bf` |
| `surface.subtle` | faint warm page surface (97×) | `#f2f2f0` |
| faintest surface | (21×) | `#f4f3f2` |
| `surface.default` / `.raised` | white | `#ffffff` |
| `surface.inverse` | charcoal reversed surface | `#2a2a27` |
| `feedback.success` | valid / success accent (124×, AA on white) | `#0b8339` |
| success bright | bright confirmation green (129×) | `#2eb800` |
| `feedback.warning` | warning amber (122×) | `#ff9c0a` |
| `feedback.error` / `action.danger` | `.text-danger` / invalid colour (251×) — warm orange-brown, **not red** | `#cc6002` |
| `feedback.info` | accent blue (homepage inline) | `#0689d8` *(à confirmer)* |

## À confirmer

Values derived/assembled rather than directly measured to a Sentropic role:

- **`action.primaryHover` `#e0b400`** — a darker yellow is heavily present (123×) but its
  binding to the `.btn-primary:hover` state was not isolated; used as the plausible
  hover ground.
- **`feedback.info` / `cyan` accent `#0689d8`** — Vidéotron's brand layer has no cyan and
  `.text-info` resolves to a grey; `#0689d8` is the only cool accent measured (homepage
  inline) and is mapped to the info role. `cyan.10 #e6f3fb` is a derived faint tint.
- **`yellow.100 #fff2b8`** — faint yellow tint mapped to `color.blue.10`, from the measured
  `#fff2b8`/`#ffed9f` soft-fill family; exact tint token not isolated.
- **`spacing` / `radius.sm 2px`** — small-chip radius measured (`border-radius:2px`) but not
  bound to a named token; `radius.none/md/lg` are measured (`0`, `--bf-border-radius-small`
  `4px`, `--bf-border-radius-medium` `8px`).
- **`shadow.*`, `motion.*`, `z.*`** — kept aligned with the Sentropic base; Vidéotron's
  buttons measure `box-shadow:none`, transitions measure `.15s ease-in-out` (encoded in
  `transition`), but the full ramps are not separately tokenised.
- **`data.category1..8`** — assembled from measured brand hexes (yellow, charcoal, success,
  warning, danger, info, bright green, muted grey); Vidéotron publishes no categorical scale.
- **`disabledOpacity 0.65`** — Bootstrap-grade `.btn:disabled` opacity; brand-specific
  override not isolated.

## Typography

- **Body / UI:** `Nunito Sans` (measured `font-family:"Nunito Sans",sans-serif`, 89×), with the
  site's own system fallback chain (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif`).
- **Display / headings:** `Urbanist` (measured `font-family:"Urbanist",sans-serif`, 64×); the
  legacy uppercase button face is `BlenderPro` (measured on `.btn`) — both are referenced as
  the display fallback chain.
- **Controls (CTA labels):** the measured `.btn` is `BlenderPro`/`Urbanist`, **700**, `.875rem`,
  `text-transform:uppercase`, `letter-spacing:1px` — encoded in `typography.control`.
- **Mono:** not part of Vidéotron — the Sentropic mono stack is kept.
- Font **names only**; no binaries bundled.

## Signatures anatomiques

- **`field.style`: `outline`** — measured `.form-control`: white fill, `border:1px solid #bebeb7`,
  `border-radius:4px`, `color:#575754`, padding `.5rem 1rem`. Native `<select>` chevron redrawn
  as a charcoal (`#2a2a27`) data-URI SVG with a `3rem` right gutter (measured `padding-right:3rem`),
  `appearance:none`.
- **`focus.strategy`: `ring`** — measured `:focus{box-shadow:0 0 0 .2rem rgba(255,210,0,.5)}` — a
  Bootstrap-grade glow in the **brand yellow**. Encoded as a 3px (≈ `.2rem`) yellow ring.
- **`radius`** — `4px` dominant (`--bf-border-radius-small`, on `.btn` and `.form-control`); `8px`
  medium (`--bf-border-radius-medium`); no pill button language (`pill` reserved for chips/badges).
- **Primary button** — `#ffd200` fill, `#2a2a27` charcoal label, 4px radius, uppercase 700 display
  face, 1px letter-spacing, `box-shadow:none`. Secondary = outlined yellow border → yellow fill on hover.
- **Tabs** — charcoal bold active label, yellow bottom-border indicator, transparent fill.
- **Pagination** — borderless charcoal links; active page = filled yellow box, charcoal text.
- **Density** — measured CTA padding `.7rem 3rem`; `.form-control` padding `.5rem 1rem`, 1rem text.
- **Borders** — `1px solid #bebeb7` field stroke; `#e0e0da` divider. Warm neutral ramp throughout.

## Asset officiel

The official Vidéotron wordmark/logo is **not** redrawn or bundled here. The brand
mark (the lowercase "vidéotron" wordmark, historically paired with the yellow) lives
on videotron.com; the documentation chrome should reference the official asset
directly rather than reproducing it. This package ships **tokens only** (colour,
type names, anatomy) — no logo art.
