# Sid Lee → Sentropic mapping

This package maps **Sid Lee** (sidlee.com — the Montréal-born global creative
agency) onto the Sentropic token structure (`TenantTheme`). Sid Lee publishes
**no** design-token file, so every value here is **measured from the live site's
computed CSS** (inspected in a real browser). Only font *names* are referenced
("visuelt", "sang-bleu-kingdom" — Sid Lee's own webfont aliases), never font
binaries.

Sid Lee's identity is **bold creative**: a vivid **orange-red** brand mark
(`#FF440B`) on a near-white / ink palette, an editorial **serif + sans** pairing
(Sang Bleu Kingdom display serif over Visuelt body sans), and a small but
**playful accent palette** (lavender, lime, olive, blue) used as expressive
splashes. The brand "colour" is the orange-red.

## Sources
- Sid Lee site (measured) — https://www.sidlee.com/ (computed CSS via in-browser inspection)
- Note: the brand mark (`#FF440B`) appears on ~11 measured elements (action /
  link / accent). The dark inverse footer tone measured `#191919`; the body ink
  measured `#1a1a1a`.

## Colour mapping

| Sentropic role | Sid Lee source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | brand action colour `rgb(255,68,11)` (11 els) | `#FF440B` |
| `text.primary` | body ink `rgb(26,26,26)` | `#1a1a1a` |
| `surface.inverse` | footer / inverse tone `rgb(25,25,25)` | `#191919` |
| `text.secondary` / `border.strong` | measured grey `rgb(134,142,150)` | `#868e96` |
| `text.muted` | measured light grey `rgb(168,168,168)` | `#a8a8a8` |
| `surface.default` / `surface.raised` / `action.primaryText` | white `rgb(255,255,255)` | `#ffffff` |
| `action.danger` / `feedback.error` | measured danger red `rgb(220,53,69)` | `#dc3545` |
| `data.category2` (accent) | lavender `rgb(210,187,248)` | `#D2BBF8` |
| `data.category3` (accent) | lime `rgb(200,252,15)` | `#C8FC0F` |
| `data.category5` (accent) | olive `rgb(158,161,69)` | `#9EA145` |
| `data.category4` / `feedback.info` (accent) | blue `rgb(84,137,248)` | `#5489F8` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.5)` |

### "À confirmer" (no Sid Lee source / derived)
- **`action.primaryHover` `#e03808`** — slightly darkened brand for hover; no
  measured hover hue, derived from `#FF440B`.
- **`surface.subtle` `#f5f5f5`** — faint subtle surface; sensible default, not a
  pinned measurement.
- **`border.subtle` `#e0e0e0`** — hairline border; sensible default.
- **`action.secondaryHover` `#e9e9e9`** — derived darker neutral on the light
  secondary fill.
- **`feedback.success #2e7d32`, `feedback.warning #b26a00`** — restrained defaults
  (AA on white); Sid Lee shows no measured equivalent.
- **`feedback.info #5489f8`** — reuses the measured blue accent (no dedicated info hue).
- **The Sentropic `blue` and `cyan` role families** — Sid Lee has no brand blue;
  `blue` is mapped onto the orange-red brand mark, `cyan` onto the playful blue
  accent.
- **`radius.sm 2px / md 4px / lg 8px / pill 999px`** — gentle rounding; the exact
  control radii are à confirmer (measured a soft 2–8px on cards/buttons).
- **The 8-colour categorical `data.*` palette** — Sid Lee publishes no data-vis
  scale; built from the playful accents + brand orange-red + ink + a restrained
  green (the green `category8` is à confirmer).
- **`shadow.*`, `motion.*`, `spacing.*`** — not strongly tokenised on the site;
  aligned with the Sentropic base (motion lifted to 200ms/320ms for an editorial feel).

## Typography
- **Body / UI / fields** (`font.sans`, `typography.field`, `typography.control`,
  `typography.label`): **`visuelt`** — Sid Lee's primary webfont alias, a
  Swiss-grotesk body sans (Helvetica/Arial fallback). Measured stack:
  `'visuelt', helvetica, arial, sans-serif`.
- **Display / headlines** (`font.display`): **`sang-bleu-kingdom`** — a
  high-contrast editorial display serif. Measured stack:
  `'sang-bleu-kingdom', Georgia, Times, serif`.
- **Monospace** (`font.mono`): not part of Sid Lee; the Sentropic mono stack kept.
- Links are the brand orange-red, **not** underlined at rest; the underline
  appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, thin hairline
  border `#e0e0e0`, small radius `4px`), not a filled-underline. Native `<select>`
  chevron redrawn in the brand orange-red `#FF440B`.
- **Radius**: gentle rounding — `radius.sm 2px`, `radius.md 4px` (buttons / inputs /
  tabs, derived to `component.button.radius`), `radius.lg 8px` (cards), `radius.pill
  999px` (tags / badges). Not square, not pill-default.
- **Borders**: thin 1px hairlines — subtle `#e0e0e0`, strong `#868e96`, brand
  accents `#FF440B`.
- **Focus**: crisp **brand orange-red outline** (`focus.strategy: "outline"`, 2px,
  `#FF440B`, 2px offset) — Sid Lee focuses in the brand mark, an expressive,
  on-brand affordance.
- **Buttons**: primary = **solid orange-red fill, white text, gently rounded**;
  secondary = light neutral fill (`#f5f5f5`), ink text, hairline border, darker
  neutral hover.
- **Tabs / sub-nav**: active = bold ink label with a **brand orange-red bottom
  underline** (`indicatorSide: "bottom"`, `indicatorColor: #FF440B`,
  `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = **filled orange-red**, white
  text.
- **Tags / badges**: pill-rounded (`radius 999px`); badge = brand orange-red fill,
  white text.
- **Density**: comfortable editorial type (15px controls/fields), 44–52px touch
  targets, restrained near-flat elevation.

## Asset officiel
- The Sid Lee wordmark / logotype is served from the site header. **Do not
  redraw** — reuse the official Sid Lee wordmark asset if a logo is needed
  (see `https://www.sidlee.com/` header).
