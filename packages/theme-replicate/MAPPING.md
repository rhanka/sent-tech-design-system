# Replicate → Sentropic mapping

This package maps the **public** Replicate brand (as compiled into the site CSS
on [replicate.com](https://replicate.com/)) onto the Sentropic token structure
(`TenantTheme`). Replicate's UI is built on the **Radix UI colour scales**
(gray / tomato / green / yellow / indigo) plus a small `branding-*` palette (the
red → pink → blush gradient), with a monochrome, **square**, high-contrast look.
Only public CSS values, the Radix scale sRGB fallbacks and font *names* are
referenced — no font binaries.

All hexes below were **measured** from the compiled `root-*.css` served by
`static.replicateassets.com`, unless flagged "à confirmer".

## Sources
- Replicate site CSS (measured) — `https://replicate.com` → compiled stylesheet
  `https://static.replicateassets.com/fe/<hash>/root-*.css`. Provides: the Radix
  gray/tomato/green/yellow/indigo scales (sRGB fallbacks), the `branding-*`
  palette, button/field/link/tab anatomy, and the `@font-face` family names.
- Fonts (measured `@font-face` families + the preloaded woff2) —
  `basier-square` (preload `fonts.replicateassets.com/basiersquare-regular-webfont.woff2`),
  `rb-freigeist-neue`, `jetbrains-mono`.
- Radix Colors — the published scale these `--gray-*`/`--tomato-*`/… values come
  from (https://www.radix-ui.com/colors).

## Colour mapping

| Sentropic role | Replicate token | Value |
|---|---|---|
| `action.primary` / pagination active | pure black (`.r8-btn--filled` bg) | `#000000` |
| `action.primaryText` / `text.inverse` | white | `#ffffff` |
| `text.primary` / `text.link` / `border.interactive` / `focus.color` / tabs active | gray-12 | `#202020` |
| `text.secondary` / pagination text / breadcrumb | gray-11 | `#646464` |
| `text.muted` / breadcrumb separator | gray-9 | `#8d8d8d` |
| `border.subtle` (default border) | gray-6 | `#d9d9d9` |
| `border.strong` / measured **field border** | Tailwind gray-500 | `#6b7280` |
| `surface.subtle` / control hover / card hover | gray-2 | `#f9f9f9` |
| hover fill / `action.secondaryHover` / tag bg | gray-3 | `#f0f0f0` |
| `surface.default` / `surface.raised` / field fill | white | `#ffffff` |
| `surface.inverse` (dark canvas) | gray-1 (dark) | `#111111` |
| accent (Sentropic `cyan`) / brand / link hover | branding-red | `#ea2804` |
| `action.danger` / `feedback.error` | tomato-11 (AA) | `#d13415` |
| danger solid / data-vis | tomato-9 | `#e54d2e` |
| `feedback.success` | green-11 (AA) | `#218358` |
| success solid / data-vis | green-9 | `#30a46c` |
| `feedback.warning` | yellow-11 (AA amber) | `#9e6c00` |
| warning solid / data-vis | yellow-9 | `#ffe629` |
| `feedback.info` / Sentropic `blue` | indigo-11 (AA) / indigo-9 | `#3a5bc7` / `#3e63dd` |
| brand gradient (pink / blush) | branding-pinkDarker / pink / blush | `#e54fe2` / `#ff6bfc` / `#f97e82` |

### À confirmer (derived / not directly measured)
- **Form-input focus ring `#2563eb`** (Tailwind blue-600) — the raw
  `input/select/textarea:focus` ring is measured as blue, but Replicate's
  *intentional* focus technique on buttons, links and select items is a near-black
  gray-12 `#202020` ring (`outline-offset: 2px`, 2px ring). The foundation
  `focus.color` encodes the dominant gray-12 ring; the blue input ring is a
  Tailwind-forms default and is treated as a field-only divergence (the rendered
  outline field focus ring will be near-black, not blue).
- **`border.subtle` `#d9d9d9` vs the measured field border `#6b7280`** — the
  outline field draws its border from `border.subtle` (the dominant component
  border tone, gray-6), so the rendered input border is lighter than the measured
  `#6b7280`. The measured field border is preserved on `border.strong` /
  `field.underlineColor`.
- `cyan.70` `#c1370f` (darker brand red), `action.primaryHover` `#383838` —
  derived darker tones (no measured brand "dark red" / filled-button hex; the
  measured filled hover is a translucent `gray-a11` overlay).
- `cyan.10` `#feebe7` (tomato-3), `blue.10` `#edf2fe` (indigo-3) — Radix light
  tints, not re-measured per-pixel.
- `radius.md` `0.25rem` / `lg` `0.375rem` — buttons/cards use the small measured
  Radix radii (2/4/6px); fields are forced square (`radiusTop/Bottom: "0"`,
  measured `border-radius: 0`). Exact default **button** radius "à confirmer".
- `shadow.subtle` / `shadow.floating`, `motion.*` (except the measured
  `.r8-btn--brand` ease/duration), `disabledOpacity` `0.5`, `iconSize.*` —
  approximate / Tailwind defaults, not all re-measured.
- The 8-colour categorical `data.*` palette — a coherent proposal from the brand
  gradient stops + Radix accent solids, not an official Replicate data-vis scale.
- Tabs / pagination / breadcrumb / alert / accordion exact metrics — monochrome
  structure measured; some paddings/indicator widths approximate.

## Typography
- **Body / UI / fields** (`font.sans`, `typography.field/control/label`):
  `'basier-square', ui-sans-serif, system-ui, sans-serif` — Basier Square, the
  measured preloaded brand typeface (UI labels 14px/medium, fields 16px/regular).
- **Display / editorial headings** (`font.display`): `'rb-freigeist-neue',
  'basier-square', …` — RB Freigeist Neue, Replicate's measured display font for
  large marketing/section headings.
- **Monospace / code** (`font.mono`): `'jetbrains-mono', ui-monospace, …` —
  JetBrains Mono, the measured code typeface.
- Links are near-black (gray-12), **underlined at rest** with a 4px underline
  offset (measured `.r8-link-underline`), and turn the brand red `#ea2804` on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` and **square** — white fill, a 1px
  `#6b7280` border, `border-radius: 0` (measured `input/select/textarea`). Forced
  square via `field.radiusTop/Bottom = "0"`. Native `<select>` chevron redrawn in
  near-black `#202020`, `appearance: none`, 40px right gutter.
- **Radius**: SQUARE / low-radius — inputs `0`, controls `sm 2px` / `md 4px`,
  cards/popovers `lg 6px`, chips/avatars `pill 9999px` (all measured component radii).
- **Focus**: `focus.strategy = "ring"` — a near-black gray-12 `#202020` box-shadow
  ring (2px, offset 2px), the measured button/link/select focus technique (not a
  coloured native outline). (Raw form inputs use a Tailwind blue `#2563eb` ring —
  see "à confirmer".)
- **Buttons**: primary = iconic solid BLACK `#000000` with white text; secondary =
  outlined (white fill, 1px near-black `#202020` border + near-black text, subtle
  `#f0f0f0` grey fill on hover); a special **brand** button uses the animated
  gradient `#ea2804 → #e54fe2 → #ed686c` with white text (measured `.r8-btn--brand`).
- **Links**: near-black gray-12, underlined at rest (4px offset, grey `#838383`
  underline), turning the brand red `#ea2804` on hover; focus inverts to a black
  highlight (white text on `#202020`).
- **Tabs**: active tab = near-black `#202020` medium label with a 2px near-black
  bottom indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless grey links; active page = filled black `#000000`.
- **Density**: button `gap .5rem`; sizes sm 32px / md 36px / lg 48px control
  heights, input padding `.5rem .75rem` (measured `.r8-btn--*` / form inputs).
- **Brand gradient**: `#ea2804 → #e54fe2 → #ed686c` (red → pink → blush).
  `TenantTheme` has no gradient token, so the stops live in `data.category1 / 5`
  (+ blush in `category6`) and are noted here as the brand signature.

## Asset officiel
- The Replicate wordmark / logo and the `branding-*` gradient are official
  Replicate brand assets — reference them from Replicate's own site/brand
  resources, do not redraw. Replicate chrome should use the real Replicate
  wordmark, not a hand-drawn approximation.
