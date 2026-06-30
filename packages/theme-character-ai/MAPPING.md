# Character.AI → Sentropic mapping

This package maps the **public** Character.AI product UI (as served on
[character.ai](https://character.ai/), light theme `html.light`) onto the
Sentropic token structure (`TenantTheme`). Only public CSS custom-property
values and font *names* are referenced — no font binaries, no proprietary
assets.

## Method
Values were **measured live** from `character.ai` (light theme) on 2026-06-30 by
reading the computed CSS custom properties off `:root` and the computed geometry
of real buttons / inputs / headings. Character.AI ships two layered token sets:
the `--G0…--G950` neutral ramp, and a `--*-refresh` design-system role layer
(`--primary-refresh`, `--secondary-refresh`, `--tertiary-refresh`, …). Both were
captured. Any value not directly measured is marked **à confirmer** below and
inline in `src/index.ts`.

## Sources
- character.ai — live computed `:root` CSS variables (light theme), measured
  2026-06-30. Key tokens: `--G100 #f4f4f5`, `--G200 #e4e4e7`, `--G250 #d9d9df`,
  `--G300 #c8c8cf`, `--G400 #a2a2ac`, `--G500 #7c7c87`, `--G600 #585962`,
  `--G800 #26272b`, `--G850 #202024`, `--G950 #131316`; `--primary-refresh
  #195eff`, `--primary-blue #1a5eff`, `--link #3e87f3`, `--link-light #a0c9ff`,
  `--secondary-refresh #1ebe53`, `--tertiary-refresh #b460eb`, `--error #cc3434`,
  `--warning #ff9800`, `--button-background #131316`, `--radius 2rem`,
  `--nextui-radius-small/medium/large 8/12/14px`.
- character.ai — measured element geometry: primary CTA button (`bg #202024`,
  `text #fafafa`, `radius 30px`, `height 40px`, font 14px atHauss), OAuth button
  (`bg #131316`, `radius 12px`, `height 50px`, 16px), secondary button (`border
  0.6px #d9d9df`, `radius 30px`), input (`bg #fff`, `border 0.6px #c1c1c1`),
  `h1` (atHauss 36px / 600 / line-height 40px / tracking -0.02em).
- Fonts referenced by name only: `--font-at-hauss 'atHauss'`,
  `--font-character-sans 'characterSans'`, `--font-inter 'Inter'`.

## Colour mapping

| Sentropic role | Character.AI token | Value |
|---|---|---|
| `action.primary` / `surface.inverse` | `--G850` / `--primary` | `#202024` |
| `action.primaryHover` | `--G950` / `--button-background` | `#131316` |
| `action.primaryText` / `text.inverse` | `--G50` | `#fafafa` |
| `text.link` / `border.interactive` / `focus.color` / `feedback.info` | `--primary-refresh` | `#195eff` |
| accent (Sentropic `cyan`) | `--tertiary-refresh` (playful purple) | `#b460eb` |
| `text.primary` / `icon-primary` | `--G800` / `--foreground` | `#26272b` |
| `text.secondary` | `--G600` / `--muted-foreground` | `#585962` |
| `text.muted` | `--G500` / `--placeholder` | `#7c7c87` |
| `border.subtle` | `--G200` / `--border-divider` | `#e4e4e7` |
| `border.strong` | `--G300` / `--accent` | `#c8c8cf` |
| `action.secondary` | `--G200` | `#e4e4e7` |
| `action.secondaryHover` / secondary button border | `--G250` / `--secondary` | `#d9d9df` |
| `surface.subtle` / control hover | `--G100` / `--background` | `#f4f4f5` |
| card hover | `--G50` / `--surface-base` | `#fafafa` |
| `surface.default` / `surface.raised` | white / `--card` | `#ffffff` |
| `action.danger` / `feedback.error` | `--error` / `--Error` | `#cc3434` |
| `feedback.success` (data green) | `--secondary-refresh` | `#1ebe53` |
| `feedback.warning` (data orange) | `--warning` / `--Warning` | `#ff9800` |
| link blue (data) | `--link` | `#3e87f3` |
| plus blue (data) | `--plus-blue` | `#138eed` |

### "À confirmer" (no direct Character.AI public token / derived / dimmed)
- `blue.80` `#1448d6` — darker hover/active variant of the brand blue
  `#195eff`; Character.AI exposes no darker brand-blue token.
- `cyan.10` `#e5dfeb` (`--G175` / `--brand-off-white-refresh`, a lavender tint)
  and `cyan.70` `#8550ff` (mid stop of `--labs-gradient`) — purple companions
  around the `#b460eb` accent; not a published 3-step purple scale.
- `feedback.warning` `#ff9800` and `feedback.success` `#1ebe53` are the measured
  brand tokens but, as **body text on white**, do not reach WCAG AA (used as
  fills / status dots / icons in Character.AI's UI). Darken before using as text.
- `data.*` 8-colour categorical palette — a coherent proposal from the measured
  playful accent set (blue / green / purple) + system colours; Character.AI
  publishes no sequential data-vis scale.
- `radius.lg` `16px` — cards; Character.AI containers range up to `--radius:
  2rem` (32px). `radius.md` `12px` from `--nextui-radius-medium`.
- `borderWidth.thin` `1px` — measured control strokes are a `0.6px` hairline,
  rounded up to 1px so borders render reliably.
- `typography.control.weight` `500` and `typography.label.weight` `500` — the
  measured marketing-page CTA renders atHauss `400`; medium chosen for control
  legibility (headings measured `600`).
- `tabs.activeText` `#195eff` — the playful blue accent applied to the otherwise
  neutral nav; Character.AI's primary nav uses a filled dark pill, not measured
  on the public landing page.
- `motion.*`, `shadow.medium` (NextUI medium elevation) — approximate; exact
  per-component elevation/easing not re-measured.

## Typography
- **UI / body / headings** (`font.sans`, `font.display`, `typography.*`):
  `'atHauss', 'characterSans', Inter, system-ui, sans-serif`. atHauss is the
  primary grotesque used everywhere (measured `body` + `h1` + buttons + inputs).
  `characterSans` is the custom brand sans; `Inter` is the measured fallback.
- **Monospace** (`font.mono`): generic `'SFMono-Regular', Consolas, monospace`
  — Character.AI publishes no brand monospace (à confirmer).
- Links are **not** underlined at rest (measured `text-decoration: none`);
  underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, ~1px grey
  border, 12px radius). Not a filled-underline.
- **Radius**: HEAVY playful rounding — controls/inputs `md = 12px`, cards
  `lg = 16px`, containers `--radius: 2rem`; buttons/chips/avatars read as pills
  (`pill = 999px`; measured small buttons `30px` ≈ pill, icon buttons `9999px`).
- **Focus**: `focus.strategy = "ring"` — the control outline recolors to brand
  blue `#195eff` (measured `--shadow-refresh-control-primary` = `0 0 0 1px
  #195eff` stroke), encoded as a soft box-shadow ring.
- **Buttons**: primary = a DARK pill `#202024` with `#fafafa` text (NOT blue —
  blue is reserved for interaction); secondary = outlined (transparent fill,
  `#d9d9df` grey stroke + dark text, light grey hover fill). Large stacked
  buttons (OAuth) use `#131316` with a 12px radius.
- **Tabs**: active tab = brand-blue label with a bottom border indicator.
- **Pagination**: borderless blue links; active page = filled brand blue.
- **Chevron (native `<select>`)**: redrawn as a neutral dark `#26272b` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: small pill controls ≈ 40px (md), large stacked buttons ≈ 50px
  (lg), 16px horizontal padding; control labels 14px atHauss.

## Asset officiel
- The Character.AI "c.ai" wordmark / logo are official Character.AI brand assets
  — reference the official mark, do not redraw. Chrome should use the real
  wordmark, not a hand-drawn approximation.
