# Sanofi → Sentropic token mapping

This theme is a **measured clone** of the Sanofi brand (post-2022 "Play to win"
rebrand). Every value below is taken from Sanofi's **public live design tokens**
— the CSS custom properties `--elements-*` served in www.sanofi.com's stylesheet
and the literal values in the site's component bundle. We reference **font names
only**, never binaries; the Sanofi Sans / Sanofi Serif typefaces are proprietary
(FutureBrand). Derived / non-measured values are flagged **à confirmer**.

## Sources

- `https://www.sanofi.com` — live site (HTML, asset references).
- `https://www.sanofi.com/static/root-BEz0SzhB.css` — **primary measurement
  source**: the `--elements-*` design tokens (brand colour scale, neutral scale,
  system colours, radius scale, spacing scale, type scale, `@font-face` names).
- `https://www.sanofi.com/static/AppLayout-DmjoJSQe.js` — component styles
  (emotion/MUI literals): `:focus-visible` outline, input borders, button radii,
  and the brand hex literals `#7a00e6`, `#5718b0`, `#3c217b`, `#b3a8e6`,
  `#23004c`.
- `@font-face` rules in `root-BEz0SzhB.css` (CDN `cdn.prod.accelerator.sanofi/
  fonts/sanofi-sans|sanofi-serif`) — typeface names.
- `https://www.brandcolorcode.com/sanofi` — corroborates the brand violet
  `#7A00E6`.
- `https://www.sanofi.com/en/media-room/press-releases/2022/...` — 2022 "Play to
  win" rebrand context (audacious violet identity).

## Colour mapping

| Sentropic role | Source token | Hex | Status |
|---|---|---|---|
| `action.primary` / `text.link` | `--elements-core-brand-base` | `#7a00e6` | measured |
| `action.primaryHover` | `--elements-core-brand-dark` | `#5718b0` | measured |
| `focus.color` / `border.interactive`(focus) | `--elements-core-brand-darker` | `#3c217b` | measured |
| `surface.inverse` / `border.interactive` | `--elements-core-brand-darkest` | `#23004c` | measured (input-emphasis literal) |
| `blue.10` / secondary surface tint | `--elements-core-brand-lightest` | `#faf5ff` | measured |
| `surface.default` / `field.fillBg` | neutral-white | `#ffffff` | measured |
| `surface.subtle` / `action.secondary` | neutral-50 (`background-neutral-subtle`) | `#f5f5f5` | measured |
| `action.secondaryHover` | neutral-100 (`divider-subtle`) | `#e4e4e4` | measured |
| `border.subtle` (input border at rest) | neutral-200 (`--border-subtle`) | `#c9c9c9` | measured |
| `text.muted` | neutral-400 | `#939393` | derived — à confirmer |
| `text.secondary` / `border.strong` | neutral-600 (helper) | `#5d5d5d` | measured |
| `text.primary` | neutral-900 (`text-default`) | `#171717` | measured |
| `feedback.success` / `status.completed` | system success-dark | `#067647` | measured |
| `feedback.error` / `action.danger` | system error-dark | `#b42318` | measured |
| `feedback.warning` / `status.pending` | system warning-dark | `#b54708` | measured |
| `feedback.info` / `status.processing` | system info-dark | `#175cd3` | measured |
| `data.category*` (vivid hues) | system *-base (`#079455`/`#d72b3f`/`#ee7404`/`#1570ef`) | — | measured hues, scale à confirmer |

### À confirmer

1. **Official colour name** — the CSS names the token only `brand`; "Electric
   Violet" / Pantone 266 C come from third-party sources, not Sanofi's CSS.
2. **`cyan` accent family** — Sanofi has **no second brand hue** (its identity is
   monochromatic violet; the measured `brand-secondary`/`brand-tertiary` tokens
   recopy the violet). The Sentropic `cyan` slot is mapped to lighter violet
   tints (`#b3a8e6` / `#8966db` / `#5718b0`) to keep the accent on-brand.
3. **`text.muted`** = neutral-400 `#939393` (placeholder/muted not isolated;
   disabled text measured = neutral-300 `#aeaeae`).
4. **Focus outline width** — measured as `theme.spacing(2)` (function call, px
   not resolved in the stylesheet); set to `2px`. Offset `2px` derived.
5. **Control density** (button/input heights & paddings) — rendered in CSS-in-JS,
   not the measured stylesheet; the 36/44/52px ladder follows the measured
   spacing scale but is à confirmer against runtime metrics.
6. **Component radii** — measured scale is `none 0 / sm 4 / md 8 / lg 12 / xl 16
   / rounded 9999`. Controls use `md` (8px), cards `lg` (12px); the exact radius
   per button/input variant (literals 4/5/8px observed) is à confirmer.
7. **Shadow, motion** — not tokenised in the measured stylesheet; kept aligned
   with the Sentropic base.
8. **Secondary button / tabs / pagination / alert / accordion / tag / badge** —
   anatomy not isolated in the measured CSS; brand-faithful proposals built from
   the measured violet + neutrals, à confirmer.
9. **No mono typeface** — absent from the Sanofi tokens; the Sentropic generic
   mono stack is kept.

## Typography

- **Sans (UI body + all control/field/label/link roles)**: `'Sanofi Sans',
  'Work Sans', 'Raleway', 'Roboto', sans-serif` — measured `font-family` +
  `@font-face`. Base 16px, line-height 150%. Weights Regular 400 / Bold 700.
- **Display (editorial headlines)**: `'Sanofi Serif', 'IBM Plex Serif', Georgia,
  serif` — measured `@font-face` (`sanofi-serif`). Mapped to the Sentropic
  `display` role to reflect Sanofi's bold editorial headline identity. **À
  confirmer**: the measured CSS `--font-family-display` token itself resolves to
  the *sans* pile; the serif is the brand's headline face. Names only — both
  typefaces are proprietary.
- **Mono**: no Sanofi mono token → Sentropic generic mono stack retained.

## Signatures anatomiques

- **Field style**: `outline` — boxed input, white fill, **1px** solid border
  `#c9c9c9` (`--border-subtle`), `md` (8px) radius. Emphasis/focus border
  `#23004c` (measured literal). Native `<select>` chevron redrawn in brand
  violet `#7a00e6` (`appearance:none` + 40px gutter).
- **Radius**: controls/inputs `md` 8px; cards `lg` 12px; tags/badges 8px;
  pills/round elements `9999px`. (Measured radius scale; per-component mapping à
  confirmer.)
- **Focus**: `outline` strategy — a visible solid outline, **2px**, offset 2px,
  colour `#3c217b` (measured `focus` token on a light surface; `#b3a8e6` on dark).
- **Buttons**: primary = filled brand violet `#7a00e6`, hover `#5718b0`, white
  text. Secondary = outlined (transparent fill, `#7a00e6` border + text, light
  violet `#faf5ff` fill on hover) — à confirmer.
- **Tabs**: active = bold violet `#7a00e6` label, bottom violet underline — à
  confirmer. **Pagination**: violet text links, filled violet active page — à
  confirmer.
- **Density**: 36 / 44 / 52px control ladder on the measured 4/8/12/16/24/32px
  spacing scale — à confirmer.

## Asset officiel

The Sanofi logotype (the wordmark with the brand-violet identity) is an official
brand asset served from the Sanofi brand CDN. **Do not redraw it** — reference
the official asset when a logo is required.
