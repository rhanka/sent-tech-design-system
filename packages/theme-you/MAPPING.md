# You.com → Sentropic mapping

This package maps the **public** You.com brand design language onto the Sentropic
token structure (`TenantTheme`). Token values are **measured from the live
you.com CSS** — the design tokens exposed as `--swatch--*` and `--_theme---*`
custom properties — and cross-checked against the official You.com brand
guidelines. Only public brand colours and font *names* are referenced — no font
binaries.

## Sources
- Live you.com CSS custom properties (measured June 2026 via computed styles on
  https://you.com/) — the `--swatch--brand-*` (Iris) scale, `--swatch--cherry-*`
  (violet accent) scale, `--swatch--grey-*` / `--swatch--zinc-*` neutral scales,
  and the `--_theme---*` semantic role tokens. Body/menu font measured as
  `"Lumen Sans", Arial, sans-serif`.
- You.com official brand guidelines — https://ydc-brand-guidelines.webflow.io/
  (Iris #5368EE, Navy #222B5F, Charcoal #121212, White #F6F6F6, Orchid #D3BDFF,
  Burgundy #641031; Lavender highlight family; typeface **Lumen Sans**, fallback
  **Manrope**).
- You.com rebrand announcement / brand assets — https://brandfetch.com/you.com.

## Colour mapping

| Sentropic role | You.com token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` / `focus.color` | `--swatch--brand-500` (Iris) | `#5368ee` |
| `action.primaryHover` | `--swatch--brand-700` / `button-primary--background-hover` | `#4757c9` |
| `blue.10` / selection / icon-mute fill | `--swatch--brand-200` | `#eef2fe` |
| `surface.subtle` / card bg | `--swatch--brand-100` / `card--bg-primary` | `#f7f9ff` |
| brand anchor (data / Navy) | `--swatch--brand-800` / `text-brand` | `#222b5f` |
| accent (Sentropic `cyan`) | `--swatch--cherry-500` (violet) | `#9170e2` |
| deep accent | `--swatch--cherry-700` | `#703fc2` |
| `text.primary` / `surface.inverse` / `accordion`/`toggle`/`choice` label | `--swatch--zinc-900` (Charcoal) | `#121212` |
| `text.secondary` | `--swatch--zinc-500` / `text-secondary` | `#62636b` |
| `text.muted` / `breadcrumb.separator` | `--swatch--grey-400` / `text2-tertiary` | `#92939e` |
| `border.subtle` / `action.secondary` / `tag` bg | `--swatch--zinc-100` / `border-1` | `#f0f0f3` |
| `slate.20` (general border) | `--swatch--zinc-200` / `menu--stroke` | `#e0e1e6` |
| `border.strong` / `action.secondaryHover` | `--swatch--grey-200` | `#d9d9de` |
| background alt | `--swatch--grey-50` | `#fafafa` |
| `surface.default` / `surface.raised` | white | `#ffffff` |
| `action.danger` / `feedback.error` | `--swatch--error` | `#f04438` |
| data mint | ydc `--osano-toggle-on-background` / widget green | `#37cd8f` |

## À confirmer (no direct You.com public token, or derived)
- `feedback.success` `#14865c` — darkened from the ydc toggle-on mint `#37cd8f`
  for WCAG AA on white (the mint itself fails contrast as text).
- `feedback.warning` `#b25f00` — amber, derived; You.com publishes no warning
  token. Checked for AA on white.
- `font.mono` — You.com publishes no brand monospace; a neutral system mono stack
  is used.
- `radius.lg` `12px` (cards), `radius.sm` `4px` — `radius.md` `6px` is measured on
  you.com buttons (search inputs render as pills → `radius.pill`); larger card
  radius approximated.
- `shadow.*`, `motion.*`, `disabledOpacity`, `density.*` heights — approximate;
  exact specs not published / not re-measured.
- `typography.control` letter-spacing `-0.01em` — you.com headings use tight
  negative tracking (h1 ≈ -1.5px); applied loosely to interactive labels.
- The 8-colour categorical `data.*` palette — a coherent proposal from the
  You.com brand families (Iris, cherry violet, Navy, ydc mint, coral), not an
  official sequential data-vis scale.

## Typography
- **Display / headings / buttons / labels** (`font.display`, `typography.control`,
  `typography.label`): `'Lumen Sans', Manrope, …, sans-serif` (medium 500). The
  brand typeface is **Lumen Sans**; **Manrope** is the official documented
  fallback. Headings carry tight negative letter-spacing.
- **Body / fields** (`font.sans`, `typography.field`): `'Lumen Sans', Manrope,
  …, sans-serif`.
- **Monospace** (`font.mono`): neutral system mono stack (à confirmer).
- Links are **not** underlined at rest (Iris-coloured text); underline on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill,
  1px `#f0f0f3` border, 6px radius); search inputs render as pills. Not a
  filled-underline.
- **Radius**: `md = 6px` (buttons, measured), `sm = 4px`, `lg = 12px` (cards),
  `pill = 999px` (search inputs / chips).
- **Focus**: `focus.strategy = "ring"` — an Iris `#5368ee` ring/glow (3px,
  offset 2px), the modern AI-UI focus technique (not a native offset outline).
- **Buttons**: primary = solid Iris `#5368ee` (hover `#4757c9`); secondary =
  filled light-grey `#f0f0f3` with dark charcoal label (hover `#d9d9de`).
- **Tabs**: active tab = Iris `#5368ee` medium label with a 2px bottom indicator
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless Iris links; active page = filled Iris.
- **Chevron (native `<select>`)**: redrawn as an Iris `#5368ee` arrow,
  `appearance: none`, 40px right gutter.
- **Card**: faint blue fill `#f7f9ff` (brand-100) with a 1px subtle border.
- **Brand anchor**: Navy `#222b5f` (brand-800) and the violet "cherry" accent
  scale (`#9170e2`) are the You.com brand signatures alongside the Iris primary.

## Asset officiel
- The You.com hexagonal "glint" emblem and wordmark are official You.com brand
  assets — reference them from the You.com brand resources, do not redraw. You.com
  chrome should use the real logo, not a hand-drawn approximation.
