# Vercel (Geist) → Sentropic mapping

This package maps the **public** [Geist design system](https://vercel.com/geist) (Vercel's open
design system) onto the Sentropic token structure (`TenantTheme`). Only public Geist design tokens
(`--ds-*` colour scales, documented control metrics) and font *names* are referenced — no font
binaries. Geist Sans / Geist Mono are open-source typefaces; we reference their names only.

## Sources
- Geist — introduction — https://vercel.com/geist/introduction
- Geist — colours (`--ds-*` scales) — https://vercel.com/geist/colors
- Geist — design tokens digest — https://vercel.com/design.md
- Geist Sans / Geist Mono — https://vercel.com/font

## Colour mapping

| Sentropic role | Geist token | Value |
|---|---|---|
| `action.primary` / `surface.inverse` | pure black (iconic primary button) | `#000000` |
| `action.primaryHover` | dark grey (à confirmer) | `#383838` |
| `text.primary` / `tabs.activeText` / `accordion.text` | `gray-1000` | `#171717` |
| `text.secondary` / `pagination.text` | `gray-900` | `#4d4d4d` |
| `text.muted` / `border.strong` / breadcrumb | `gray-700` | `#8f8f8f` |
| `border.subtle` / field border / secondary-button border | `gray-400` | `#eaeaea` |
| `surface.subtle` / `control.hoverBackground` / `card.hoverBackground` | `background-200` | `#fafafa` |
| `surface.default` / `surface.raised` / `field.fillBg` | `background-100` | `#ffffff` |
| subtle surface / hover fill / `tag.neutralBackground` | `gray-100` | `#f2f2f2` |
| `text.link` / `border.interactive` / `focus.color` / `feedback.info` | `blue-700` | `#006bff` |
| link hover / `blue.80` | `blue-800` | `#0059ec` |
| `action.danger` / `feedback.error` | `red-800` | `#ea001d` |
| `feedback.success` | `green-900` (AA on white) | `#107d32` |
| `feedback.warning` | `amber-900` (AA on white) | `#aa4d00` |
| accent (Sentropic `cyan`) | `purple-700` | `#a000f8` |

### "À confirmer" (no direct Geist token / derived)
- `action.primaryHover` `#383838` — Vercel's black button hover shade is not published as a token; a
  conventional dark-grey hover is used (à confirmer against the live `Button` component).
- `feedback.success` `#107d32` (green-900) and `feedback.warning` `#aa4d00` (amber-900) — the Geist
  **solid** success/warning are green-700 `#28a948` / amber-700 `#ffae00`, but those fail WCAG AA as
  text on white, so the darker scale step is used for the semantic role.
- `focus` — strategy `ring` in Geist blue `#006bff`. Blue is the documented focus colour; the exact
  ring technique (box-shadow vs outline, width/offset) is "à confirmer".
- `shadow.*`, `motion.*`, `z.*` — not strongly tokenised by Geist publicly; kept aligned with the base.
- The 8-colour categorical `data.*` palette — a coherent proposal from the Geist accent scales
  (blue/purple/green/amber/pink/teal/red/grey), not an official sequential data-vis scale.
- Tints `blue-100 #f0f7ff`, `purple-100 #faf0ff`, `red-100 #ffeeef`, `amber-100 #fff6de`,
  `green-100 #ecfdec` — used as light accent surfaces.

## Typography
- **UI / display / interactive** (`font.sans`, `font.display`, `typography.control/label`): `'Geist Sans', Geist, sans-serif`.
- **Body / fields** (`typography.field`): `'Geist Sans', Geist` at 14px / regular.
- **Monospace** (`font.mono`): `'Geist Mono', monospace`.
- Links are NOT underlined at rest; the underline appears on hover (minimal Geist link style).
- When loaded via the `geist` npm package the CSS family name resolves to `Geist` / `Geist Mono`.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px `#eaeaea` border, 6px radius),
  not a filled-underline. Native `<select>` chevron redrawn near-black with a 40px gutter.
- **Radius**: low / crisp — controls 6px (`radius.md`), cards 12px (`radius.lg`); chips/badges are pills.
- **Focus**: soft box-shadow ring in Geist blue `#006bff` (`focus.strategy = "ring"`).
- **Buttons**: primary = solid pure black `#000` with white text (the iconic Vercel button);
  secondary = outlined (transparent fill, 1px `#eaeaea` border, near-black text, `#f2f2f2` hover fill).
- **Tabs**: active tab = near-black `#171717` label with a 2px near-black bottom border
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`) — monochrome indicator.
- **Pagination**: borderless grey links; active page = filled pure black `#000` with white text.
- **Density**: high-density Geist controls (md 40px height) with tight horizontal padding; UI text 14px.

## Asset officiel
- The Vercel triangle / wordmark and the Geist Sans / Geist Mono fonts are official Vercel assets —
  reference them from the official source, do not redraw.
