# Writer → Sentropic mapping

This package maps the **public** Writer brand (as measured on the
[writer.com](https://writer.com/) marketing site CSS, a WordPress `writercom`
theme) onto the Sentropic token structure (`TenantTheme`). Only public brand
colours, the Writer UI grey scale, and font *names* are referenced — no font
binaries.

## Sources
- Writer marketing site CSS — https://writer.com/ (inline + `wp-content/themes/writercom`).
  Brand indigo measured from `.btn-primary { background-color: #5551ff }` and its
  `:hover { background-color: #2e2ae8 }`; checked controls / radios also paint
  `#5551ff`.
- Input anatomy measured from the contact/sales form CSS:
  `input { background:#fff; border:1px solid #9aa2af; border-radius:4px }`.
- Display font — `https://writer.com/wp-content/themes/writercom/fonts/PPFormulaCondensed/all.css`
  (`@font-face { font-family:'PPFormulaCondensed' }`, weights 300/400/700/900;
  Pangram Pangram foundry).
- Body / UI font — Poppins (dominant `font-family: Poppins` across the site).
- Monospace — `wp-content/themes/writercom/fonts/SFMono/SFMono-Medium.woff2` → SF Mono.

## Colour mapping

| Sentropic role | Writer token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` | Writer Indigo | `#5551ff` |
| `action.primaryHover` | Writer Indigo dark | `#2e2ae8` |
| `focus.color` | Writer Indigo | `#5551ff` |
| `blue.10` / `action.secondary` | lightest brand wash | `#f3f5ff` |
| `action.secondaryHover` / accent (`cyan.10`) | light brand wash | `#e4e9ff` |
| accent (`cyan.50`) / data lavender | lavender | `#bfcbff` |
| `surface.default` / `surface.raised` | white | `#ffffff` |
| `surface.subtle` / card hover | Grey 50 | `#eff0f2` |
| `border.subtle` | Grey 100 | `#e4e7ed` |
| stronger border (Grey 200) | Grey 200 | `#d4d6db` |
| `border.strong` / input border / `field.underlineColor` | Grey 400 | `#9aa2af` |
| `text.muted` (placeholder) | Grey 500 | `#828282` |
| `text.secondary` | Grey 600 | `#5e5e5e` |
| `text` strong (slate 80) | Grey 800 | `#262626` |
| `text.primary` / `surface.inverse` | Grey 900 (near-black) | `#151515` |
| `action.danger` / `feedback.error` | red | `#d92d20` |
| `feedback.success` | green | `#1f9d57` |
| `feedback.warning` | amber | `#b54708` |

### "À confirmer" (not directly measured on the Writer public CSS)
- **Feedback palette** `success #1f9d57`, `warning #b54708`, `error #d92d20`
  (and `action.danger`) — Writer's marketing CSS exposes no clear semantic
  feedback colours; these are AA-on-white standards. `feedback.info` reuses the
  brand indigo `#5551ff`.
- **`cyan.*` accent slot** (`#e4e9ff` / `#bfcbff` / `#5551ff`) — Writer has no
  distinct cyan/secondary accent; the lavender brand washes fill the slot.
- **`focus`** (`ring`, 3px, offset 2px, `#5551ff`) — Writer animates a
  box-shadow on interactive controls; the exact ring spec is approximate.
- **`data.*`** 8-colour categorical palette — Writer publishes no data-vis
  scale; a coherent proposal from the indigo brand + lavender + greys, with the
  three feedback hues (`#1f9d57`/`#b54708`/`#d92d20`) as `category4–6`.
- **`shadow.*`** and **`motion.*`** — soft neutral elevation / `0.2s ease`
  transitions, approximate (exact dp/easing not published).
- `disabledOpacity 0.4`, `radius.md 6px`, density heights (sm 36 / md 44 / lg 52)
  — derived from the pill-button / boxed-input look, not exact tokens.

## Typography
- **Display / hero headings** (`font.display`): `'PP Formula Condensed'`
  (Pangram Pangram, weights 300–900), Poppins fallback.
- **Body / UI / buttons / labels** (`font.sans`, `typography.control`/`field`/`label`):
  `'Poppins', sans-serif` (control & label medium 500/600, field regular 400).
- **Monospace** (`font.mono`): `'SF Mono', SFMono-Regular, monospace`.
- Links are **not** underlined at rest (Writer Indigo text); underline appears on
  hover (à confirmer).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, lightly-rounded inputs (white
  fill, 1px `#9aa2af` border, 4px radius). Not a filled-underline. Measured from
  `input { background:#fff; border:1px solid #9aa2af; border-radius:4px }`.
- **Radius**: `sm = 4px` (inputs), `md = 6px`, `lg = 12px` (cards, measured
  `border-radius:12px`), `pill = 9999px` (Writer buttons are pills — measured
  `border-radius:60px` / `9999px`).
- **Focus**: `focus.strategy = "ring"` — soft indigo `#5551ff` box-shadow ring
  (à confirmer).
- **Buttons**: primary = solid Writer Indigo `#5551ff` pill, hover `#2e2ae8`;
  secondary = white/bordered pill (indigo stroke + text, `#f3f5ff` brand-tint
  fill on hover, à confirmer).
- **Tabs**: active tab = Writer Indigo `#5551ff` medium label with a 2px bottom
  indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless indigo links; active page = filled Writer Indigo.
- **Chevron (native `<select>`)**: redrawn as a Writer Indigo `#5551ff` arrow,
  `appearance: none`, right gutter.
- **Density**: comfortable pill controls (md ≈ 44px) with generous horizontal
  padding; control label 15px (`0.9375rem`) Poppins 600.

## Asset officiel
- The Writer wordmark / logo is an official Writer brand asset — reference it
  from Writer's brand resources, do not redraw. Writer chrome should use the
  official Writer wordmark, not a hand-drawn approximation.
