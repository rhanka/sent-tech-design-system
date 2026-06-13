# Lightspeed → Sentropic mapping

This package maps **Lightspeed** (lightspeedhq.com — Lightspeed Commerce Inc., the
Montréal-HQ point-of-sale / commerce SaaS) onto the Sentropic token structure
(`TenantTheme`). Unlike most clones, Lightspeed **does publish design tokens** as
CSS custom properties on its live marketing site, so every value here is
**measured from those stylesheets** (downloaded and inspected, not guessed). Only
font *names* are referenced ("lsRegular", "lsBold", "lsMedium", "lsOblique" —
Lightspeed's own webfont aliases), never font binaries.

Lightspeed's identity is a **bold-red commerce SaaS** system: a vivid red primary
action (`#e81c1c`, darkening to `#c7141f`), a warm near-black ink (`#191513`
charcoal / `#000`), a warm-grey neutral scale and white surfaces. The signature
shapes are **pill buttons** (border-radius 30–50px, 2px solid border) and
**6px-rounded** containers/cards, with **boxed (outline)** form fields carrying a
thin grey ring that becomes a black 2px ring on focus, and a **red native-select
chevron**.

## Sources
- Lightspeed legacy design-system CSS (measured) —
  `https://www.lightspeedhq.com/wp-content/themes/ls/prod/css/main.css`
  (the `:root{--color--…; --font-…; --transition__…}` token block + `.gb-button*`,
  `.gb-form__field*`, `select`, `input` rules).
- Lightspeed Tailwind CSS layer (measured) —
  `https://www.lightspeedhq.com/wp-content/themes/ls/dist/css/tailwind-style.css`
  (the `--tw-color-red-60`, `--tw-color-wg-20` (charcoal), `--tw-color-neutral-*`,
  `--tw-color-accent-deep-blue` scale).
- Lightspeed home — `https://www.lightspeedhq.com/`.

## Colour mapping

| Sentropic role | Lightspeed source (measured var) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `action.danger` / `feedback.error` | `--color--highlight` = `--tw-color-red-60` (CTA fill, ::selection, select chevron) | `#e81c1c` |
| `action.primaryHover` | `--color--highlight--darker` (hover / active / focus red) | `#c7141f` |
| `data.category6` | `--tw-color-red-52` (deep red) | `#c6010d` |
| `surface.inverse` / `text-on-dark` ink / `pagination.text` / `breadcrumb.linkText` | `--tw-color-wg-20` (charcoal) | `#191513` |
| `text.primary` / `breadcrumb.currentText` / `focus.color` | `--color--darkest` (body/input `color:#000`) | `#000000` |
| `buttonSecondary.hoverBackground` | `--color--darkmid` (dark hover fill) | `#2b2b2b` |
| `data.category8` | `--tw-color-wg-36` (warm dark) | `#413c3a` |
| `text.secondary` / `text.muted` / `border.strong` / field ring | `--color--mid` = `--tw-color-neutral-80` | `#757575` |
| `border.subtle` / select border | `--color--lightmid` = `--tw-color-neutral-60` | `#dddddd` |
| `action.secondary` / `tag.neutralBackground` | `--color--light` | `#f0f0f0` |
| `action.secondaryHover` | `--tw-color-wg-92` (warm raised tint) | `#e9e3e0` |
| `surface.subtle` / `surface.raised`-hover / `card.hoverBackground` | `--tw-color-neutral-50` | `#f6f4f3` |
| `alert.background` / warm faint surface | `--tw-color-wg-96` | `#f7f0ed` |
| `surface.default` / `surface.raised` / `action.primaryText` / `field.fillBg` | `--color--lightest` = `--tw-color-white` | `#ffffff` |
| `feedback.success` / `status.completed` | `--color--valid` | `#0ead30` |
| `feedback.warning` / `status.pending` | `--color--invalid` | `#ea891e` |
| AA-on-white warning text | `--color--invalid--darker` | `#7a4000` |
| `feedback.info` / `status.processing` | `--tw-color-accent-deep-blue` | `#1270f0` |

### "À confirmer" (derived or non-measured)
- **`feedback.info` `#1270f0`** — Lightspeed has no semantic "info" token; the
  measured `--tw-color-accent-deep-blue` (a minor accent) is reused as the
  closest blue. Not an info colour per se.
- **`action.danger` / `feedback.error` `#e81c1c`** — Lightspeed publishes no
  distinct error/danger hue; its validation amber `#ea891e` is the "invalid"
  colour and the brand red doubles as the destructive/error colour. Mapping
  danger→brand-red is a deliberate choice (à confirmer against a real Lightspeed
  destructive button).
- **The Sentropic `blue` and `cyan` role families** — Lightspeed has neither a
  brand blue (the action colour is RED) nor a cyan accent. Both are mapped onto
  the red family; the warm-tint `10` step uses `#f7f0ed`.
- **`surface.overlay` `rgb(0 0 0 / 0.5)`** — modal backdrop alpha not directly
  measured; standard 50% black default.
- **`disabledOpacity` `0.5`** — Lightspeed disables to a flat grey fill
  (`#757575`), not an opacity; 0.5 approximates the visual dim.
- **`radius.pill` `999px`** — buttons measured 30px (regular) / 50px (form) /
  60px CTAs; encoded as a 999px pill (the token's pill slot), which renders
  identically for these heights.
- **`spacing.*`, `shadow.subtle/medium`, `z.*`** — not strongly tokenised as a
  public scale; aligned with the Sentropic base. `shadow.floating` IS measured
  (the `0 0 25px -5px #0003` dropdown shadow).
- **The 8-colour categorical `data.*` palette** — Lightspeed publishes no
  data-vis scale; this is a brand-red-anchored proposal over the warm neutrals
  and system hues.

## Typography
- **Body / UI / fields** (`font.sans`, `typography.field`, `typography.label`):
  **`lsRegular`** — Lightspeed's primary webfont alias (`--font-regular`), over a
  `HelveticaNeue, Helvetica Neue, Helvetica, Arial, sans-serif` fallback. Field
  text measured ~16px (`font-size:1rem` on inputs).
- **Buttons / display** (`font.display`, `typography.control`): **`lsBold`**
  (`--font-bold`) — every `.gb-button*` class sets `font-family:lsBold`. Control
  letter-spacing measured `0.02em` on inline CTAs.
- **Also published**: `lsMedium` (`--font-medium`), `lsOblique` (`--font-oblique`)
  — secondary weights, not separately tokenised here.
- **Monospace** (`font.mono`): not part of Lightspeed; the Sentropic mono stack kept.
- Links / actions are **red** (`#e81c1c`), underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, a thin grey
  ring `box-shadow: 0 0 0 1px #757575`, the native `<select>` uses `1px solid
  #ddd`), small **3px radius**. Native `<select>` chevron **redrawn in Lightspeed
  RED** (measured stroke `rgba(232,28,28,0.9)`), `appearance:none`, right gutter.
- **Radius**: dual signature — **pill buttons** (`border-radius: 30px` regular,
  `50px` form, `60px` some CTAs; `radius.pill = 999px`) **+ 6px-rounded
  containers** (the dominant container radius across the site, 28 occurrences;
  `radius.md/lg = 6px`). Inputs/chips `3px` (`radius.sm`).
- **Borders**: CTA buttons render a real **2px solid** stroke (`borderWidth.thick`);
  fields a 1px grey ring; select border `1px solid #ddd`.
- **Focus**: **black 2px ring** (`focus.strategy: "ring"`, width 2px, `#000`) —
  measured input focus `box-shadow: 0 0 0 2px #000, 0 0 0 2px #000`, no outline.
  Some dismiss buttons use `outline: 1px solid #e81c1c` (red); the dominant
  field technique (black ring) is encoded.
- **Buttons**: primary = **solid red fill `#e81c1c`, white lsBold text, pill,
  2px border** (the bold-red CTA; hover/active darken to `#c7141f`); secondary =
  outlined (transparent fill, dark 2px border, dark `#2b2b2b` hover fill).
- **Tabs / sub-nav**: active = bold near-black label with a **red bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`; the nav
  `:after` active rule uses `#e81c1c`).
- **Pagination**: borderless dark links; active page = **filled red pill**,
  white text.
- **Motion**: measured `--transition__duration--*` (fastest 0.12s, fast 0.24s,
  medium 0.36s, slow 0.48s) and ease-out `cubic-bezier(0,0.6,0.6,1)`; 0.24s is
  the workhorse transition.
- **Density**: lsBold buttons (regular 36px, form 46px, inline pill 50–60px),
  inputs 42–48px, generous 24–36px horizontal CTA padding, soft modern elevation.

## Asset officiel
- Lightspeed wordmark (the lowercase "lightspeed" logotype with the red speed-mark)
  is served from the site header as an inline SVG. Official brand assets are also
  on Wikimedia (`File:Lightspeed Commerce Logo.svg`) and Brandfetch. **Do not
  redraw** — reuse the official Lightspeed wordmark asset if a logo is needed.
