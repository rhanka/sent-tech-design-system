# Bombardier → Sentropic mapping

This package maps **Bombardier** (bombardier.com — the Montréal-HQ business-jet
manufacturer) onto the Sentropic token structure (`TenantTheme`). Bombardier's
public site is a Drupal build (theme **`bba8ui_merge`**) whose brand stylesheet
ships **two measured token systems** in one sheet: a modern Material-3-style ramp
(`--surface`, `--on-surface`, `--secondary-gold`, `--inverse-surface`, `--error`,
`--outline-container`…) and a `--bba-legacy-*` brand system that still drives the
primary CTA, links and footer. Every value here is **measured from the live brand
stylesheet** (fetched directly via curl — the loaded browser misbehaves). Only font
*names* are referenced (`"Inter"` body/UI + `"Trust"`/`"Display"` serif display,
measured from the site's `@font-face` declarations), never font binaries.

Bombardier's identity is **premium and understated**: a deep **petrol-teal
`#003e51`** (`--bba-legacy-brand-primary`) drives every primary CTA and the brand
mark; the signature canvas is a **warm cream `#FDFBF3`** (`--surface` /
`--primary-container`); ink is a **near-black `#202020`** (`--on-surface` /
`--primary-black`, never pure black); a refined **gold** (`#d19000` CTA-hover /
`#C7B289` `--secondary-gold`) is the luxury accent and **bronze `#89674a`**
(`--on-surface-variant`) carries link/secondary ink. Buttons are **fully-rounded
pills** (measured `.btn` `border-radius:7.143rem`≈100px), **uppercase** with 1px
tracking on the legacy CTA; form fields are **square boxed outlines** (white fill,
thin grey `#dcdedc` stroke, **0px radius** — a deliberately sharp luxury feel);
focus is a **dark-teal border shift `#00171e`** (`--bba-legacy-brand-focus`),
encoded as an inset indicator.

## Sources
- Bombardier storefront (measured) — https://bombardier.com/en
  Brand stylesheet fetched directly via curl:
  `https://bombardier.com/sites/default/files/css/css_QHadrU1uBE6N4jWJSXAP0XEKqL8oB-65FY5OWrEDJJM.css`
  (theme `bba8ui_merge`) — the `--bba-legacy-*` brand tokens, the modern
  `--surface`/`--secondary-gold`/`--error`/`--outline-container` ramp, the `.btn`
  and legacy `.bba-btn-primary` button rules, the `.bba-form-field-input` field
  rules, the `@font-face` family names and the link decoration.
- Brand petrol-teal `#003e51` and gold `#d19000` confirmed as `--bba-legacy-brand-
  primary` / `--bba-legacy-brand-secondary` (Bombardier visual identity).

## Colour mapping

| Sentropic role | Bombardier source (measured) | Value |
|---|---|---|
| `action.primary` / `border.interactive` / brand | `--bba-legacy-brand-primary` (legacy `.bba-btn-primary` fill) | `#003e51` |
| `action.primaryHover` | `--bba-legacy-brand-secondary` (measured CTA hover → gold) | `#d19000` |
| `focus.color` / darkest teal | `--bba-legacy-brand-focus` (measured `.bba-form-field-input:focus` border) | `#00171e` |
| cyan accent / `feedback.info` / `status.processing` | `--bba-shortcut-footer-bg-hover` (brighter teal accent) | `#0880a5` |
| `secondaryHover` / `buttonSecondary.hoverBackground` | `--secondary-container` (measured `--btn-hover-bg`) | `#d1c5b2` |
| soft luxury gold | `--secondary-gold` | `#c7b289` |
| bright gold accent (`data.category4`) | `--tertiary-container` | `#f3cb02` |
| `text.primary` / `surface.inverse` / ink | `--on-surface` / `--primary-black` / `--inverse-surface` | `#202020` |
| field text ink | `--bba-legacy-gray-xdark` (measured field weight-300 text) | `#333333` |
| `text.secondary` / `text.muted` / `text.link` / bronze | `--on-surface-variant` / `--outline-container-variant` | `#89674a` |
| hover label ink | `--secondary-on-container` (measured `--btn-hover-color`) | `#4b4846` |
| `surface.subtle` / `text.inverse` / signature canvas | `--surface` / `--primary-container` / `--on-inverse-surface` | `#fdfbf3` |
| bright cream surface | `--surface-bright` | `#fefdf9` |
| `action.secondary` / dim cream / tag fill | `--surface-dim` | `#f2efe5` |
| `surface.default` / `surface.raised` / `action.primaryText` | `--surface-brighter` / `--primary-white` | `#ffffff` |
| neutral surface | `--surface-neutral` | `#f6f5f3` |
| faint page grey | `--bba-legacy-gray-xlight` | `#f5f7f5` |
| neutral-dim divider | `--surface-neutral-dim` | `#e2e2e1` |
| `border.subtle` (field stroke, 1px) | `--bba-legacy-gray-lighter` (measured `.bba-form-field-input` stroke) | `#dcdedc` |
| `border.strong` / `buttonSecondary.border` / outline | `--outline-container` (measured `.btn` border) | `#9f9e9c` |
| `action.danger` / `feedback.error` | `--error` / `--bba-legacy-brand-error` | `#e70d06` |
| soft error fill | `--error-container` | `#ffd6d4` |
| `surface.overlay` | near-black ink at 60% (backdrop) | `rgb(32 32 32 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`feedback.success` `#2e7d32` and `feedback.warning` `#8a6d3b`** — Bombardier's
  brand sheet only publishes a brand **error** (`--error` / `#e70d06`); it has no
  published success/warning hue. These are AA-on-white green/amber defaults so the
  status palette stays legible. (`status.completed`/`pending` reuse them.)
- **The Sentropic `cyan` accent family** — Bombardier has no distinct "accent" hue
  beyond the teal brand; the brighter teal hover `#0880a5`
  (`--bba-shortcut-footer-bg-hover`) is mapped into the `cyan` slot to preserve a
  cool accent. `cyan.10` `#e6eff2` is a derived faint teal tint.
- **`action.secondary` `#f2efe5` (`--surface-dim`)** — Bombardier's true secondary
  button is the modern `.btn` (outlined white ghost → soft-gold hover), captured in
  `buttonSecondary`; the dim-cream fill is a sensible default for the generic
  secondary surface role.
- **The 8-colour categorical `data.*` palette** — Bombardier publishes no single
  categorical token list. The scale is assembled from the measured brand hexes
  (teal → gold → bronze → bright gold → teal accent → success → amber → near-black),
  led by the brand teal.
- **`shadow.*`** — Bombardier's premium look is low-elevation with lots of white
  space; the brand sheet has no single published elevation ramp. Restrained
  near-black-tinted shadows are derived.
- **`radius.md` `4px` / `radius.lg` `8px`** — measured small soft steps (`.2857rem`
  ≈ 4px chip, `.5714rem` ≈ 8px copy-field/card). The **fields themselves are square
  `0px`** (measured `.bba-form-field-input`/textarea `border-radius:0`); the derived
  `component.button.radius` follows `radius.md` (4px) while the pill (`radius.pill`
  999px) is the brand button signature.
- **`spacing.*`, `disabledOpacity`** — the site uses a 4/8px rem-fraction ramp;
  exact disabled opacity is not separately tokenised, kept aligned with the base.

## Typography
- **Body / UI / fields / controls** (`font.sans`, `typography.*`): **`"Inter"`** —
  the brand's measured `--font-family-base` (the bundled Inter variable font), with
  the brand's own `"Open Sans", Helvetica, Arial` fallback chain. Base type 16px.
- **Display / headings** (`font.display`): the serif pairing **`"Trust"`** (the
  brand's proprietary serif, measured `--font-family-serif`, Trust1A weights
  100–900) + **`"Display"`** (`--font-family-display`), with a Georgia/serif
  fallback. (Trust/Display are serif faces — Bombardier pairs a serif display with
  the Inter sans for its premium voice.)
- **Control labels** — the **legacy CTA** is heavy (measured `font-weight:800`,
  **UPPERCASE**, `letter-spacing:1px`); the **modern `.btn`** is `600`. The theme
  encodes `control` as `600` / uppercase / 1px tracking (the brand's CTA voice).
- **Field text** is **light (300)** dark-grey (measured `.bba-form-field-input`
  `font-weight:300`, `#333`).
- **Links** are **underlined at rest** (measured `text-decoration-line:underline`,
  `text-decoration-thickness:2px`, colour `--on-surface-variant` `#89674a`) and the
  **underline is removed on hover** — the brand's distinctive hover-off effect.
- **Monospace** (`font.mono`): not part of Bombardier; the Sentropic mono stack kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#dcdedc`, **0px radius — square**), not a filled-underline. Measured
  `.bba-form-field-input`: `45px` tall, `padding:20px 10px 6px 20px`, weight 300,
  focus → border `#00171e`, error → `#e70d06`. Native `<select>` chevron redrawn in
  the near-black ink `#202020` with a ~36px gutter (`appearance:none`).
- **Radius**: buttons & tags/badges **pill** (measured `.btn` `7.143rem` ≈ 100px →
  `radius.pill` 999px); cards/copy-fields 8px (`.5714rem`); chips 4px (`.2857rem`);
  **form fields square 0px**. A deliberately sharp field language against the round
  buttons.
- **Borders**: field/divider strokes **1px solid** `#dcdedc`; control outlines 1px
  `#9f9e9c` (`--outline-container`); brand accents `#003e51` / `#00171e`.
- **Focus**: **dark-teal border shift** (`focus.strategy:"inset"`, 2px, `#00171e` =
  `--bba-legacy-brand-focus`). The brand sets `outline:0` everywhere and focuses
  fields by changing the **border-colour** to the darkest teal (measured
  `.bba-form-field-input:focus`); the button focus colour is the near-black
  `--secondary-black`. Encoded as an inset indicator to match the real technique.
- **Buttons**: primary = **solid petrol-teal fill `#003e51`, white text**, fully
  rounded pill, UPPERCASE + 1px tracking (measured legacy `.bba-btn-primary`:
  `font-weight:800`, hover → gold `#d19000`, focus → `#00171e`); secondary = the
  modern `.btn` — **outlined white ghost** (white fill, `#9f9e9c` outline, near-black
  text) that hovers to the **soft-gold container `#d1c5b2`** with `#4b4846` ink.
- **Tabs / sub-nav**: active = bold **teal** label with a **teal bottom indicator**
  (`indicatorSide:"bottom"`, `indicatorMode:"border"`).
- **Pagination**: borderless bronze links; active page = **filled teal** box, white
  text.
- **Tags / badges**: **pill** (`radius:999px`) — dim-cream-fill tags; brand-teal
  filled badges with white text.
- **Density**: 16px base type, slow elegant `250ms ease-in-out` transitions, warm
  cream canvas, near-black ink, lots of white space, restrained elevation.

## Asset officiel
- Bombardier wordmark, served as an official SVG from the site:
  `https://bombardier.com/themes/custom/bba8ui_merge/images/logo/bombardier-logo-white.svg`
  (white variant for dark headers). **Do not redraw** — reuse the official
  Bombardier logo asset if a logo is needed.
