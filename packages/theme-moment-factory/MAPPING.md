# Moment Factory — token provenance (measured-clone)

This package maps the **public** design tokens of **Moment Factory**
(momentfactory.com — the Montréal immersive-media / multimedia-entertainment
studio) onto the Sentropic token structure. Only public CSS custom properties,
inline theme settings and **font names** are used (no font binaries, no private
assets). Every value below is measured from the live site, or flagged
`à confirmer` when derived.

Moment Factory's storefront runs on **Shopify** (the "Nova / Ordinal" theme),
which drives the design from an inverting colour-scheme pair
(`--layout-background-color` / `--layout-text-color`) plus a handful of accent /
radius / font custom properties. Shopify's bundled wishlist plug-in ships
**Polaris** defaults (`#5c6ac4`, `#333`, …) — those are **NOT** the Moment
Factory brand and are deliberately ignored.

## Sources
- `https://www.momentfactory.com/` (homepage HTML — inline `--*` custom
  properties, `color_scheme` settings, floating-button + `::selection` accent).
- `https://momentfactory.com/cdn/shop/t/107/assets/base.css` (buttons, inputs,
  body, header underline, `::selection`, `--button-radius`, `--textarea-radius`).
- `https://momentfactory.com/cdn/shop/t/107/assets/nova-button.css`,
  `nova-header.css`, `header.css`, `logo.css` (button invert-on-hover, uppercase,
  header on the black stage, white nav links/SVG fill).
- Measured directly via `curl` on 2026-06-15.

## Colour mapping
| Role (Sentropic) | Token / source | Hex |
|---|---|---|
| Page / stage (`surface.default`) | `color_scheme` background / `--color-black: rgb(0,0,0)` | `#000000` |
| Text on dark (`text.primary`) | `color_scheme` text (white ink) | `#ffffff` |
| Brand accent (`action.primary`, `border.interactive`, selection) | floating-button fill `#FFEA00` + `::selection { background-color: #ffea0066 }` | `#ffea00` |
| Primary CTA text | `floating_button_text_color` (black on yellow) | `#000000` |
| Link / info (`feedback.info`, `cyan.50`) | `--color-link` | `#2f80ed` |
| Inverse surface (`surface.inverse`) | `color_scheme` (light scheme) background | `#ffffff` |

## À confirmer (derived / not directly measured)
- **Neutral grey ramp** (`grey.1`–`grey.7`: `#e6e6e6 #b3b3b3 #8a8a8a #4d4d4d
  #2a2a2a #161616 #0d0d0d`): Moment Factory publishes **no** grey scale — the theme
  drives everything from the inverting black↔white pair. These steps are derived
  tints/shades of the black↔white axis, used for `surface.subtle/raised`,
  `border.subtle/strong`, `text.secondary/muted` and card/tag/chip fills.
- **Action family on yellow** (`blue.10 #fff8cc`, `blue.80 #ccbb00`,
  `action.primaryHover #ffd400`): the brand action is the electric yellow, not a
  blue; tint/shade steps of `#ffea00` are derived for hover/pressed grounds.
- **Cyan tint** (`cyan.10 #d6e6fb`): light tint of the measured link blue.
- **System status** (`success #2e9e6b`, `warning #e0a800`, `error #e02424`):
  Moment Factory exposes no semantic status palette; AA-grade defaults on dark.
  `info #2f80ed` IS measured (`--color-link`).
- **Data-vis categories** (`category1`–`8`): no official categorical scale; a
  coherent proposal led by the brand yellow + link blue + AA system hues
  (`#ff5c00`, `#a855f7` derived).
- **Focus ring technique**: the live site largely suppresses outlines
  (`outline: none`) and relies on `:focus-visible`; a 2px **yellow** (`#ffea00`)
  ring is chosen for accessibility — the *technique* is `à confirmer`, the colour
  is the measured brand accent.
- **Pill radius** (`9999px`): reserved slot — Moment Factory rarely rounds
  (square is the brand); `à confirmer`.
- **Disabled opacity** (`0.5`): no single measured token.

## Typography
- **Body + headings + UI**: `"Calibre", Arial, sans-serif` — measured
  `--base-font-family` AND `--accent-font-family`. Font **name only**, no binary.
- **Body / UI weight**: heavy — measured `--base-font-weight: 700`.
- **Control / accent weight**: 400 (`--accent-font-weight: 400`); link buttons
  `font-weight: 500`.
- **Headings**: track open — measured `letter-spacing: .02em`.
- **Labels / controls**: UPPERCASE — measured `text-transform: uppercase`
  (12× in `base.css`; buttons + labels).
- **Mono**: not part of Moment Factory — the Sentropic mono stack is retained.

## Signatures anatomiques
- **Field**: `style: "outline"`, **square** (`radius: 0`) — measured
  `input { border: none; background: transparent; border-radius: 0 }`. Flat box
  on the dark ground; native `<select>` chevron redrawn in white (`#ffffff`),
  36px right gutter, `selectAppearance: "none"`.
- **Radius**: SHARP. Measured `--button-radius: 0px` → controls/inputs/tabs/
  tags/badges are square (`none/sm/md = 0`). The one rounded element is the
  textarea: measured `--textarea-radius: 24px` → `radius.lg`.
- **Focus**: `strategy: "ring"`, `width: 2px`, `offset: 2px`, `color: #ffea00`
  (yellow ring on the black stage; technique `à confirmer`).
- **Primary button**: filled electric-yellow (`#ffea00`) / black text, square,
  UPPERCASE; solid CTA inverts background↔text on hover (measured
  `.buttons-zoom .solid-button:hover` swaps `--layout-background-color` ↔
  `--layout-text-color`).
- **Secondary button**: OUTLINED white ghost — transparent fill, white border +
  text, inverting to a solid white fill / black text on hover.
- **Tabs**: active = white bold label with a yellow bottom indicator,
  transparent fill on the dark stage.
- **Pagination**: borderless white links; active page = filled **yellow square**
  with black text.
- **Density**: square, uppercase, generous CTAs; md control ≈ 44px.

## Asset officiel
- Logo: the Moment Factory wordmark/mark is served from the brand's own assets
  (`/cdn/shop/t/107/assets/` + `logo.css` / `nova-logo.css`). Use the official
  asset for any chrome — **do not redraw it**. The brand convention is white mark
  on the black header (measured `nova-header` SVG `fill: #fff` on the transparent/
  dark header).
