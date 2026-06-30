# AI21 Labs → Sentropic mapping

This package maps the **public** AI21 Labs brand (as published on
[ai21.com](https://www.ai21.com/) and [studio.ai21.com](https://studio.ai21.com/))
onto the Sentropic token structure (`TenantTheme`). Every colour below is
**measured** from the live site CSS (the WordPress theme
`build/css/main.min.css` `:root` custom-property block and the live component
rules). Only public brand colours and font *names* are referenced — no font
binaries, no proprietary assets.

## Sources
- AI21 marketing site — https://www.ai21.com/ and its theme stylesheet
  `https://www.ai21.com/wp-content/themes/ai21/build/css/main.min.css`
  (measured `:root` custom properties + `body`, `h1–h6`, `.btn--*`,
  `.select2-selection--single`, `input[type=search]` rules).
- AI21 Studio — https://studio.ai21.com/ (product app; brand-consistent).
- Brand-colour cross-check — "deep pink" primary confirmed by public brand
  write-ups (designyourway AI21 logo/colours; web search), exact hex taken from
  the measured `--deep-pink` token, not the approximate third-party value.

## Colour mapping (measured `:root` custom properties)

| Sentropic role | AI21 token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `focus.color` | `--deep-pink` | `#e61e93` |
| `action.primaryHover` | `--primary-magenta-dark` | `#d00b4e` |
| `action.danger` / `feedback.error` | `--primary-magenta-darker` | `#ac043d` |
| `text.primary` / `accordion.text` / `choice.labelColor` | `--neutral-800` | `#141125` |
| `surface.inverse` | `--neutral-900` | `#0a071b` |
| `text.secondary` / `breadcrumb.text` | `--neutral-500` | `#5b5675` |
| `text.muted` / `breadcrumb.separator` | `--neutral-400` | `#8c87a6` |
| `border.strong` | `--neutral-300` | `#bcb8d0` |
| `border.subtle` / `action.secondaryHover` | `--neutral-200` | `#e1dfec` |
| `surface.subtle` / `action.secondary` / card+tag bg | `--neutral-100` | `#f8f7fc` |
| `surface.default` / `surface.raised` / `text.inverse` | white | `#ffffff` |
| field underline rule | `--default-black` | `#212121` |
| `feedback.info` / `status.processing` | `--turquoise-dark` | `#1c8ab9` |
| accent (Sentropic `cyan`) | `--turquoise-normal` | `#5ec6e8` |
| `feedback.warning` / `status.pending` | `--yellow-darker` | `#a96b0f` |
| data accent | `--write-primary-normal` (purple) | `#6e42e1` |

Other measured tokens carried in the raw palette (used in `data.*` / accents):
`--primary-magenta` `#f06b98`, `--primary-magenta-light` `#ed4b82`,
`--read-primary-blue-light` `#ace6f9`, `--turquoise-darker` `#066188`,
`--yellow-normal` `#f9bd64`, `--write-primary-light` `#a23bcb`,
`--light-steel-blue` `#a4c4fa`.

### À confirmer (no direct AI21 public token / introduced or derived)
- `feedback.success` `#157f4f` — **introduced** AA green. AI21 publishes **no**
  green anywhere in the measured palette; a standard accessible green is used
  for the success role.
- `blue.10` (pink fill) `#fde7f2` — light tint **derived** from `--deep-pink`
  `#e61e93` (the measured token only exposes the alpha tint `--deep-pink-lighter`
  `#e61e930f`, unsuitable as a solid).
- `text.link` `#e61e93` — the live site sets `a { text-decoration: none;
  color: inherit }` (links have **no** distinct colour); the brand pink is used
  as the interactive link colour.
- `action.primaryText` `#ffffff` — white on `#e61e93` is ~3.9:1 (passes the 3:1
  UI/large-text AA threshold, below 4.5:1 for small body text). Acceptable for
  button labels; flagged for small-text use.
- `focus.*` (ring, brand pink) — the live site **suppresses** focus outlines
  (`outline: none`); an accessible brand-pink box-shadow ring is **introduced**.
- `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`, `accordion.*`, `tag.*`,
  `badge.*`, `choice.*`, `toggle.*` — AI21 publishes no dedicated public
  components for these; modelled on the measured brand accent (pink) + neutral
  scale.
- `shadow.*`, `motion.fast`/`slow`, `density.*`, `spacing.*` — approximate /
  aligned with the Sentropic base; only the button transition (`150ms ease`)
  and the field/radius/button signatures are directly measured.
- `data.*` 8-colour categorical palette — a coherent proposal from the measured
  AI21 accent families (pink, turquoise, yellow, purple, steel blue), not an
  official data-vis scale.

## Typography
- **Body / fields** (`font.sans`, `typography.field`): `'Inter', sans-serif`
  (measured `body { font-family: "Inter", sans-serif; font-weight: 300 }`).
  Field weight kept light (300) to match the site's thin body type.
- **Display / headings** (`font.display`): `'Polysans', 'Aeonik Pro', sans-serif`
  (measured `h1–h6 { font-family: "Polysans", sans-serif }`; hero titles use
  `"Aeonik Pro"`).
- **Controls / buttons** (`typography.control`): `'Aeonik Fono', 'Inter',
  monospace`, **UPPERCASE** (measured `.btn--primary { text-transform: uppercase }`
  and `.btn--pink { font-family: "Aeonik Fono" }`).
- **Monospace** (`font.mono`): `'Aeonik Fono', Consolas, Monaco, monospace`
  (measured page mono stack `Consolas, Monaco, "Andale Mono", "Ubuntu Mono",
  monospace`, fronted by the brand Aeonik Fono).
- Links are **not** underlined (measured `a { text-decoration: none }`).

## Signatures anatomiques
- **Fields**: `field.style = "filled-underline"`, `underlineMode = "border"` —
  an **underlined** input, not a boxed encadré. Measured on
  `.select2-selection--single`: `border: none; border-bottom: .5px solid #212121;
  border-radius: 0; background: none`. Transparent fill, a real ~1px near-black
  bottom rule, square corners.
- **Radius**: measured site radii — `sm = 4px` (search input), `md = 10px`
  (most common card/box, 51 occurrences), `lg = 15px` (larger cards, 29
  occurrences), `pill = 999px` (buttons, measured `border-radius: 40px`).
- **Focus**: `focus.strategy = "ring"` in brand pink `#e61e93` — **introduced**
  (the live site removes outlines; see "à confirmer").
- **Buttons**: the AI21 primary CTA is an **outlined pill** — transparent fill,
  `1px #212121` border, `border-radius: 40px`, **uppercase** label (measured
  `.btn--primary`). Captured via `buttonSecondary` (outlined) + `typography.control`
  (uppercase Aeonik Fono). The pink CTA (`.btn--primary-pink`) is a pink
  gradient `linear-gradient(90deg, #FFBDB6 -51.58%, #FFD6EC 74.31%)`; the solid
  brand pink `#e61e93` is used for `action.primary`.
- **Chevron (native `<select>`)**: AI21 redraws it (`bg-select.svg`,
  `appearance: none`); reproduced as a dark `#212121` arrow with a right gutter.
- **Neutrals**: a distinctly **purple-tinted** grey ramp
  (`#f8f7fc → #0a071b`), not a neutral grey — a brand signature.
- **Gradients** (no Sentropic gradient token): warm cream page background
  `linear-gradient(0deg, #FFF4E1 0%, #F6F5F3 81.5%)` and the pink CTA gradient
  above — documented here as brand signatures.

## Asset officiel
- The AI21 Labs wordmark / logo (deep-pink "AI21") is an official AI21 brand
  asset — reference it from AI21's own assets, do **not** redraw. AI21 chrome
  should use the official wordmark, not a hand-drawn approximation.
