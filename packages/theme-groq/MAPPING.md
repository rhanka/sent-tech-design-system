# Groq → Sentropic mapping

This package maps Groq's **public** site design language (the CSS custom
properties served from [groq.com](https://groq.com/) and used across GroqCloud /
[console.groq.com](https://console.groq.com/)) onto the Sentropic token
structure (`TenantTheme`). Only public CSS token values and font *names* (Space
Grotesk, IBM Plex Mono) are referenced — no font binaries, no proprietary
assets.

## Sources
- Groq site CSS bundle (Next.js `/_next/static/css/*.css`, served from
  https://groq.com/) — the `--color-*`, `--ff-*`, `--bdrs*`, `--border-*` custom
  properties were read directly from the published stylesheets.
- Key measured leaves:
  `--color-orange-base #F43E01`, `--color-orange-dark #C23101`,
  `--color-orange-middle #FE9E20`, `--color-orange-light #FFD1A3`;
  warm scale `--color-utility-98/95/91/81/61/41/20/16-yellow`
  (`#FAFAF8 / #F3F3EE / #E8E8DE / #CECEBF / #9C9C90 / #69695D / #34342E / #2A2A25`);
  ink scale `--color-utility-20-blue #2D2F33`, `--color-utility-16-blue #26292E`;
  fluorescent accents `green #10E68D`, `green-light #A9FFDB`, `blue #5FC0FF`,
  `purple #D377FD`, `pink #F392DD`, `yellow #FDEB20`; `--color-green #39C5C0`.
- Typography: `--ff-space-grotesk "Space Grotesk"` (sans + display via
  `--ff-sans`/`--ff-display`), `--ff-ibm-plex-mono "IBM Plex Mono"` (`--ff-mono`).
- Shape: `--border-radius-input: 4px` (inputs), `--bdrs ≈ 1.4285714286rem`
  (cards), `.btn { border-radius: var(--bdrs-l) }` with `--bdrs-l: 1000px`
  (pill buttons); focus `outline: 3px solid var(--focus-color, currentColor)` +
  `outline-offset: .3ch`, focus colour can be `--color-orange`.

## Colour mapping

| Sentropic role | Groq token | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `data.category1` | `--color-orange-base` | `#f43e01` |
| `action.primaryHover` / `action.danger` / `feedback.error` | `--color-orange-dark` | `#c23101` |
| `feedback.warning` / `status.pending` / amber data | `--color-orange-middle` | `#fe9e20` |
| `blue.10` (orange light tint) | `--color-orange-light` | `#ffd1a3` |
| `surface.default` (warm page bg) / `slate.10` | `--color-utility-98-yellow` | `#fafaf8` |
| `surface.subtle` / `action.secondary` / hover fills | `--color-utility-95-yellow` | `#f3f3ee` |
| `border.subtle` / `slate.20` | `--color-utility-91-yellow` | `#e8e8de` |
| `border.strong` | `--color-utility-81-yellow` | `#cecebf` |
| `text.muted` | `--color-utility-61-yellow` | `#9c9c90` |
| `text.secondary` / `slate.60` | `--color-utility-41-yellow` | `#69695d` |
| `slate.80` | `--color-utility-20-yellow` | `#34342e` |
| `text.primary` / `text.link` / `surface.inverse` / `slate.90` | `--color-utility-20-blue` | `#2d2f33` |
| `surface.raised` / `surface.default` (cards) / `action.primaryText` | `--color-white` | `#ffffff` |
| accent (Sentropic `cyan`) / `feedback.success` / `data.category3` | `--color-fluorescent-green-base` | `#10e68d` |
| `cyan.10` | `--color-fluorescent-green-light` | `#a9ffdb` |
| `feedback.info` / `data.category2` | `--color-fluorescent-blue-base` | `#5fc0ff` |
| `data.category4` | `--color-fluorescent-purple-base` | `#d377fd` |
| `data.category5` | `--color-fluorescent-pink-base` | `#f392dd` |
| `data.category6` | `--color-fluorescent-yellow-base` | `#fdeb20` |
| `data.category8` | `--color-green` (teal) | `#39c5c0` |

### À confirmer (no direct Groq public token)
- `cyan.70` `#0ba96a` — a derived darker companion to the fluorescent green
  `#10e68d` (Groq publishes only base + light).
- `action.primaryHover` `#c23101` — Groq's real primary-button hover INVERTS to a
  white fill with orange text (`--color-btn-primary-bg-hover: var(--color-white)`);
  we encode a darker-orange hover background instead, the closest Sentropic-model
  fit. The orange-dark value itself is measured (`--color-orange-dark`).
- `action.danger` / `feedback.error` `#c23101` — Groq ships no dedicated danger
  red; reused the reddest brand token (orange-dark).
- `feedback.success` `#10e68d`, `feedback.warning` `#fe9e20`, `feedback.info`
  `#5fc0ff` — Groq publishes no semantic feedback layer; mapped from the
  fluorescent accents + orange. The bright fluoro green/blue are accent FILLS,
  not AA-on-white text colours.
- `data.*` 8-colour categorical palette — a coherent proposal from Groq's brand
  orange + the fluorescent accent set, not an official sequential data-vis scale.
- `surface.inverse` `#2d2f33` — Groq's `--color-utility-20-blue`, used for dark
  sections; equals `text.primary` (Groq reuses the same ink in light mode).
- `radius.lg` `1.25rem` (20px) — Groq's `--bdrs` is `1.4285714286rem` against a
  ~14px root (≈ 20px); re-expressed as a clean 20px at the Sentropic 16px root.
- `radius.sm` `3px`, `disabledOpacity` `0.4`, `shadow.*`, `motion.*`, `density.*`
  heights, `iconSize.*`, focus `offset` (`.3ch ≈ 2px`) — approximate / not
  pixel-measured.
- `tabs`, `pagination`, `breadcrumb`, `tag`, `badge`, `toggle` anatomy — the
  geometry is measured (pills / warm fills) but the exact per-component metrics
  are inferred from the brand system, not each component re-measured.

## Typography
- **Display / headings / body / controls** (`font.sans`, `font.display`,
  `typography.control/field/label`): `'Space Grotesk', system-ui, 'Helvetica
  Neue', Helvetica, Arial, sans-serif` (`--ff-space-grotesk` → `--ff-sans`,
  which `--ff-display` also points to — Groq uses one display/body family).
- **Monospace / code** (`font.mono`): `'IBM Plex Mono', ui-monospace, …`
  (`--ff-ibm-plex-mono`).
- Prose links are dark text, **underlined** at rest, turning **orange** on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px
  `#e8e8de` warm border, 4px radius — `--border-input` + `--border-radius-input`).
  Not a filled-underline.
- **Radius**: a deliberate split — sharp **4px** inputs (`radius.md`), generously
  rounded **~20px** cards (`radius.lg`, `--bdrs`), and **pill** buttons/chips
  (`radius.pill = 999px`, `--bdrs-l = 1000px`).
- **Pill buttons (escape hatch)**: `.btn` uses `border-radius: var(--bdrs-l)`
  (1000px). The shared `radius.md` drives both buttons and inputs, so the theme
  wraps `createComponent` and overrides only the button leaf (`button.radius` +
  `button.anatomy.shape.radius` → `999px`), à la `theme-airbus`'s single-leaf
  hatch — pill buttons survive while inputs keep their measured 4px.
- **Focus**: `focus.strategy = "outline"` — a real 3px solid **orange** outline
  (`outline: 3px solid …`, `outline-offset ≈ 2px`), not a box-shadow ring.
- **Buttons**: primary = solid Groq orange `#f43e01` pill, white text; secondary
  = transparent pill with a subtle warm `#cecebf` border + dark text, `#f3f3ee`
  warm fill on hover.
- **Chevron (native `<select>`)**: redrawn as a Groq orange `#f43e01` arrow,
  `appearance: none`, with a right gutter.
- **Surfaces**: a warm **cream** body (`#fafaf8`, `--color-utility-98-yellow`)
  under **white** raised cards (`#ffffff`) — Groq's signature warm off-white look.
- **Accents**: beyond the orange brand, a fluorescent accent set (green
  `#10e68d`, blue `#5fc0ff`, purple `#d377fd`, pink `#f392dd`, yellow `#fdeb20`)
  carries the data-vis / decorative palette.

## Asset officiel
- The Groq wordmark / logo are official Groq brand assets — reference them from
  Groq's brand resources, do not redraw. Groq chrome should use the real Groq
  logotype, not a hand-drawn approximation.
