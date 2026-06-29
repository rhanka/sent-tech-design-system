# Together AI → Sentropic mapping

This package maps the **public** Together AI brand (as served on
[together.ai](https://www.together.ai/)) onto the Sentropic token structure
(`TenantTheme`). Every colour is **measured** from Together's live Webflow
stylesheet — reading the brand CSS custom properties (`--brand--*`,
`--product--*`, `--_radius---*`) and the live `.button` / `.w-input` rules — not
guessed. Only public brand colours, the measured grey scale, and font *names*
are referenced; no font binaries. "The Future" / "The Future Mono" /
"PP Neue Montreal Mono" are Together's licensed typefaces, referenced by name
only with an Arial / system fallback.

## Sources
- Together AI homepage CSS (Webflow) — `https://www.together.ai/` and its
  stylesheet `cdn.prod.website-files.com/.../together-ai-*.webflow.shared.*.min.css`.
  Measured CSS variables: `--brand--brand-orange:#fc4c02`,
  `--brand--brand-magneta:#ef2cc1`, `--brand--brand-purple:#caaef5`,
  `--brand--dark-blue:#010120`, `--brand--black:#000`, `--brand--white:#fff`,
  `--product--blue-01:#9bcdf5`, `--product--cyan-01:#70e9f0`,
  `--product--cyan-02:#c8f6f9`, `--product--purple-cards:#70549b`,
  `--_radius---4:.25em`, `--_radius---8:.5em`, `--_radius---12:.75em`,
  `--_radius---16:1em`.
- Together brand blue `#0f6fff` — measured as `color` / `background-color` /
  `border` of buttons (`.button-2`) and links (11 occurrences). The primary
  interactive / CTA colour.
- Together brand page — https://www.together.ai/brand — confirms the typeface
  **"The Future"** (a homage to Futura) for "headline and body copy", and the
  brand gradient families (purple / magenta / orange).
- `.button` rule (measured): black fill (`--brand--black`), white text, radius
  `.25em`, `text-transform:uppercase`, `font-family:PP Neue Montreal Mono`,
  `letter-spacing:.005em`, `height:2.5rem`, `transition` 450ms
  `cubic-bezier(.215,.61,.355,1)`.

## Colour mapping

| Sentropic role | Together token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` / `tabs.activeText` / `focus.color` | Together brand blue (measured on buttons + links) | `#0f6fff` |
| `action.primaryHover` | brand blue darkened (derived) | `#0d62e0` |
| `action.secondaryHover` / `blue.10` | measured light blue tint | `#e5f3ff` |
| accent (Sentropic `cyan`) | measured cyan / teal | `#03c7d1` → `#00747a` |
| `text.primary` / `surface.inverse` / current crumb / labels | `--brand--dark-blue` | `#010120` |
| `text.secondary` | measured `.text-color-darkgray-2` | `#626e7f` |
| `text.muted` / `border.strong` | measured mid grey | `#758696` |
| `border.subtle` | measured light border | `#d6e0ef` |
| `surface.subtle` / `action.secondary` / card hover | measured light surface | `#f6fafd` |
| `tag.neutralBackground` | measured neutral light | `#f0f1f4` |
| `tag.neutralText` / strong text | measured dark | `#1f232e` |
| `surface.default` / `surface.raised` / `field.fillBg` | `--brand--white` | `#ffffff` |
| `action.danger` / `feedback.error` | measured brand red | `#dd464c` |
| brand orange (data / warning base) | `--brand--brand-orange` | `#fc4c02` |
| brand magenta (data) | `--brand--brand-magneta` | `#ef2cc1` |
| brand purple (data) | `--product--purple-cards` | `#70549b` |
| `feedback.success` | measured dark teal | `#00747a` |
| light blue (data) | `--product--blue-01` | `#9bcdf5` |

### "À confirmer" (derived / not directly a public Together token)
- `action.primaryHover` `#0d62e0` — brand blue `#0f6fff` darkened ~12% for a
  hover/active state; the site uses an opacity transition, no measured hover hex.
- `feedback.warning` `#c43c00` — brand orange `#fc4c02` darkened for WCAG AA on
  white (the raw orange ~3.6:1 fails AA for text). The brand orange itself is
  kept as `data.category2`.
- `feedback.error` / `action.danger` `#dd464c` — measured brand red; verify AA
  if used as small text (≈3.9:1 on white; fine as fill / icon / large text).
- `focus.strategy = "ring"` + `focus.color #0f6fff` — the marketing site only
  ships Webflow focus defaults; the brand-blue ring is the modern, brand-coherent
  technique chosen here, not a measured Together focus spec.
- `field.style = "outline"` radius / select chevron gutter — inputs on the
  marketing site are default Webflow boxed inputs; the brand-blue chevron and the
  8px radius are aligned to the brand aesthetic, not a bespoke measured field.
- `shadow.*` — soft dark-blue-tinted elevation, approximate (no measured dp).
- `data.*` 8-colour categorical scale — a coherent proposal from the measured
  brand gradient (blue → purple → magenta → orange) + cyan/teal; not an official
  Together data-vis scale.
- `density.*` (sm/lg) and `spacing.*` — md control height (40px) and 1rem padding
  are measured from `.button`; the rest follow the Sentropic base scale.

## Typography
- **Display / headings / body** (`font.display`, `font.sans`, `typography.field`):
  `'The Future', Arial, sans-serif` — Together's custom Futura-homage typeface,
  referenced by name only (Arial / system fallback).
- **Buttons + eyebrow labels** (`typography.control`, `typography.label`): the
  measured signature — `'The Future Mono', 'PP Neue Montreal Mono', monospace`,
  `text-transform: uppercase`, light tracking, medium (500) weight.
- **Monospace / code** (`font.mono`): `'The Future Mono', 'PP Neue Montreal
  Mono', ui-monospace, monospace`.
- Links are **not** underlined at rest (brand-blue text); underline on hover
  (à confirmer — link hover not strongly defined on the site).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill, 1px
  `#d6e0ef` border, 8px radius). Not a filled-underline.
- **Radius**: measured Together rounding — `sm = 4px` (`--_radius---4`, the
  dominant token), controls/inputs `md = 8px` (`--_radius---8`), cards
  `lg = 12px` (`--_radius---12`); CTA buttons are full pills (`.button-2`,
  `pill = 999px`).
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in the brand blue
  `#0f6fff` (3px, offset 2px); brand-coherent, à confirmer.
- **Buttons**: the brand's signature primary `.button` is a **black, UPPERCASE,
  MONO** button (`--brand--black` fill, white `PP Neue Montreal Mono` label,
  `letter-spacing .005em`, 4px radius, 40px tall). The blue `.button-2` CTA is a
  full-pill brand-blue button (`#0f6fff` fill + border). This theme maps
  `action.primary` to the brand blue `#0f6fff` (the interactive/CTA colour) and
  encodes the uppercase-mono character via `typography.control`; `buttonSecondary`
  is the brand-blue outlined variant.
- **Tabs**: active tab = brand-blue medium label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled brand blue.
- **Chevron (native `<select>`)**: redrawn as a brand-blue `#0f6fff` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: measured md control height ≈ 40px (`2.5rem`) with 1rem padding;
  button label uppercase mono, ~13px medium.
- **Together gradient**: blue `#0f6fff` → purple `#70549b`/`#caaef5` → magenta
  `#ef2cc1` → orange `#fc4c02`. `TenantTheme` has no gradient token, so the stops
  live across the `data.*` categorical scale and are noted here as the brand
  signature.
- **Motion**: measured `.button` transition is 450ms `cubic-bezier(.215,.61,.355,1)`
  (ease-out) — encoded in `motion.slow` / `transition`.

## Asset officiel
- The Together AI wordmark and the interconnected-circles brand mark (blue /
  purple / magenta / orange) are official Together brand assets — reference them
  from the Together AI brand page (together.ai/brand), do not redraw. Together
  chrome should use the official wordmark + circle mark, not a hand-drawn
  approximation.
