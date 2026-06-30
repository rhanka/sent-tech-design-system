# Inflection AI (Pi) → Sentropic mapping

This package maps the **public** Pi product design tokens (the `--color-*` and
`--font-*` CSS custom properties shipped by [pi.ai](https://pi.ai/)) onto the
Sentropic token structure (`TenantTheme`). Only public token values and font
*names* are referenced — no font binaries. Pi ships a light (warm cream) and a
dark theme; this package maps the **light** theme, which is Pi's signature
warm/soft look (`theme-color` = `#faf3ea`).

## Sources
- Pi product CSS bundle (Next.js `_next/static/css/*.css`), measured from the
  Internet Archive capture of `pi.ai` (the live site is behind a Cloudflare
  challenge). The `--color-*` custom properties were read directly from the
  compiled stylesheet; `theme-color` `#faf3ea` and `og` metadata confirmed on
  the captured `pi.ai` HTML.
- Typeface identification: the CSS `@font-face` family aliases are `ALPINA`,
  `ALPINA_CONDENSED`, `ORACLE`, `MONO`, with fallbacks `serif` (alpina) and
  `ui-sans-serif` (oracle) — i.e. **GT Alpina** (Grilli Type serif,
  https://www.grillitype.com/typeface/gt-alpina) for display and **ABC Oracle**
  (Dinamo grotesk, https://fontsinuse.com/typefaces/167746/abc-oracle) for body/UI.

## Colour mapping (light theme)

| Sentropic role | Pi token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` / `feedback.info` | `--color-primary-default` / `--color-accent-default` | `#1a4631` |
| `action.primaryHover` | `--color-primary-hover` | `#1e3c2e` |
| pine deep (`blue.80`) | `--color-primary-tap` | `#21322a` |
| accent (Sentropic `cyan`) / `feedback.success` | `--color-tertiary-default` / `--color-progress-base` | `#038247` |
| emerald deep (`cyan.70`) | `--color-tertiary-tap` | `#0a6e40` |
| `surface.default` (page bg) | `--color-background` / `--color-default` | `#faf3ea` |
| `surface.subtle` (alt / control hover) | `--color-secondary-default` | `#f5eadc` |
| `surface.raised` (cards / modals / inputs) | `--color-card-default` / `--color-input-surface` | `#fcfaf7` |
| `action.secondary` (secondary button fill) | `--color-fill-default` | `#ece1d2` |
| `action.secondaryHover` | `--color-fill-hover` | `#e9ddcd` |
| `border.subtle` | `--color-divider-stroke` | `#e1d3c0` |
| `border.strong` / `field.underlineColor` | `--color-input-border` | `#d9c9b4` |
| `text.primary` | `--color-text-base-contrast` | `#1a1918` |
| warm dark brown (`slate.80`, accordion/choice/toggle text) | `--color-text-primary-base` | `#3e3a35` |
| `text.secondary` | `--color-text-secondary` | `#655e55` |
| `text.muted` | `--color-text-tertiary` | `#a69986` |
| `surface.inverse` | `--color-background` (dark theme) | `#242322` |
| `action.danger` / `feedback.error` | `--color-error-default` | `#d42600` |

### À confirmer (no direct Pi public token measured)
- `blue.10` `#dce7e1` and `cyan.10` `#d6ebdf` — derived light green tints (Pi has
  no published light-green surface token).
- `feedback.warning` `#b5621a` — Pi publishes no warning token; a warm amber
  darkened for WCAG AA on the cream `#faf3ea` background.
- `feedback.info` `#1a4631` — Pi has no blue family; info reuses the pine brand green.
- The 8-colour categorical `data.*` palette — a coherent proposal from the Pi
  greens + warm neutrals, not an official Pi data-vis scale.
- `radius.*` (sm 8px / md 12px / lg 20px / pill) — Pi is visibly soft/rounded but
  exact radii were not pixel-measured; soft-rounded values approximated.
- `density.*` (md ≈ 44px) — Pi controls read as comfortable/spacious; exact
  control heights/paddings not pixel-measured.
- `shadow.*` and `motion.*` — warm-tinted soft elevation / base easing, approximate.
- `focus.strategy = "ring"` (pine) — Pi focus reads as a soft ring; exact technique
  (ring vs outline, width/offset) not confirmed.
- `font.mono` `'ABC Oracle Mono'` — Pi's `MONO` alias (fallback `ui-monospace`);
  the exact mono family name is inferred from the Oracle pairing, not confirmed.
- Links underline-on-hover, `tabs`/`pagination`/`breadcrumb` anatomy — Pi's nav is
  sidebar-driven; web-component nav styling approximated from the brand colours.
- `disabledOpacity 0.5` — Pi uses warm disabled fills rather than pure opacity.

## Typography
- **Display / headings / hero** (`font.display`): `'GT Alpina', ui-serif, Georgia,
  serif` — a warm serif with a twist, Pi's expressive voice.
- **Body / UI / fields / labels / buttons** (`font.sans`, `typography.control`,
  `typography.field`, `typography.label`): `'ABC Oracle', ui-sans-serif,
  system-ui, sans-serif` (regular 400, medium 500).
- **Monospace** (`font.mono`): `'ABC Oracle Mono', ui-monospace, monospace` (à confirmer).
- Links are **not** underlined at rest (pine-green text); underline appears on
  hover (à confirmer).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, soft-rounded inputs (warm-white
  `#fcfaf7` fill, 1px warm-tan `#d9c9b4` border, 12px radius). Not a
  filled-underline.
- **Radius**: soft/rounded — controls/inputs `md = 12px`, cards `lg = 20px`,
  chips/buttons read as pills (`pill = 999px`); `sm = 8px`.
- **Focus**: `focus.strategy = "ring"` — a soft ring in pine green `#1a4631`
  (3px, offset 2px). À confirmer the exact technique.
- **Buttons**: primary = solid pine green `#1a4631` with warm-white label;
  secondary = a FILLED warm-beige button (`#ece1d2`, no stroke) with pine text,
  darker beige (`#e9ddcd`) on hover — not an outlined button.
- **Tabs**: active tab = pine-green medium label with a bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`). À confirmer.
- **Pagination**: borderless pine links; active page = filled pine green.
- **Chevron (native `<select>`)**: redrawn as a pine-green `#1a4631` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: comfortable / spacious (md ≈ 44px control height). À confirmer.
- **Warm cream surface stack**: page `#faf3ea` → beige alt `#f5eadc` → warm-white
  cards/inputs `#fcfaf7`; warm-tan borders `#e1d3c0` / `#d9c9b4`. This warm,
  low-contrast cream stack with pine-green accents is Pi's defining signature.

## Asset officiel
- The Pi mark (the soft Pi "wave"/logo) and Pi/Inflection wordmark are official
  brand assets — reference them from Inflection's brand resources, do not redraw.
  Pi chrome should use the Pi logo on the cream `#faf3ea` background with GT Alpina
  display + ABC Oracle UI, not a hand-drawn approximation.
