# assistant-ui → Sentropic mapping

This package maps the **public, open-source** default theme of
[assistant-ui](https://www.assistant-ui.com/) (an open-source chat UI library
built on shadcn/ui + Radix + Tailwind v4) onto the Sentropic token structure
(`TenantTheme`). assistant-ui's default theme is the shadcn **"zinc" base**: an
almost-neutral, slightly-cool grey scale with a near-black zinc PRIMARY, one red
destructive accent, and the Geist typeface. Every colour below is **measured**
from assistant-ui's public CSS and converted from oklch to sRGB hex; only font
*names* (Geist, Geist Mono) are referenced — no binaries.

## Sources
- `templates/default/app/globals.css` — the theme scaffolded by
  `npx assistant-ui` (the canonical default). oklch tokens for `:root` / `.dark`.
  https://github.com/assistant-ui/assistant-ui/blob/main/templates/default/app/globals.css
- `apps/registry/app/globals.css` — identical token set used by the shadcn-style
  registry. https://github.com/assistant-ui/assistant-ui/blob/main/apps/registry/app/globals.css
- `apps/docs/styles/globals.css` — docs site (uses a pure-neutral `0 0 0` chroma
  variant of the same scale; the registry/template zinc variant was chosen as
  the authoritative "default").
- `templates/default/app/layout.tsx` — confirms the typeface: `Geist` +
  `Geist_Mono` from `next/font/google` (CSS vars `--font-geist-sans` /
  `--font-geist-mono`).
- Site / repo: https://www.assistant-ui.com/ · https://github.com/assistant-ui/assistant-ui

### oklch → sRGB hex conversion (measured `:root`)
| CSS var | oklch (measured) | sRGB hex | Tailwind v4 |
|---|---|---|---|
| `--background` / `--card` / `--popover` | `oklch(1 0 0)` | `#ffffff` | white |
| `--foreground` | `oklch(0.141 0.005 285.823)` | `#09090b` | zinc-950 |
| `--primary` | `oklch(0.21 0.006 285.885)` | `#18181b` | zinc-900 |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#fafafa` | zinc-50 |
| `--secondary` / `--muted` / `--accent` | `oklch(0.967 0.001 286.375)` | `#f4f4f5` | zinc-100 |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | `#71717b` | zinc-500 |
| `--border` / `--input` | `oklch(0.92 0.004 286.32)` | `#e4e4e7` | zinc-200 |
| `--ring` | `oklch(0.705 0.015 286.067)` | `#9f9fa9` | zinc-400 |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#e7000b` | red-600 |
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `#f54900` | orange-600 |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `#009689` | teal-600 |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `#104e64` | cyan-900 |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `#ffb900` | amber-400 |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `#fe9a00` | amber-500 |
| `.dark --secondary/--muted` | `oklch(0.274 0.006 286.033)` | `#27272a` | zinc-800 |
| `--radius` | `0.625rem` | 10px | — |

## Colour mapping

| Sentropic role | assistant-ui (shadcn) token | Value |
|---|---|---|
| `action.primary` / `text.link` / `surface.inverse` / `tabs.activeText` | `--primary` (zinc-900) | `#18181b` |
| `action.primaryHover` | `--primary`/90 hover (≈ zinc-800) | `#27272a` |
| `action.primaryText` / `text.inverse` | `--primary-foreground` (zinc-50) | `#fafafa` |
| `text.primary` / `slate.90` | `--foreground` (zinc-950) | `#09090b` |
| `text.secondary` / `breadcrumb.linkText` | `--muted-foreground` (zinc-500) | `#71717b` |
| `text.muted` / `border.strong` / `border.interactive` / `focus.color` | `--ring` (zinc-400) | `#9f9fa9` |
| `border.subtle` / `--input` | `--border` (zinc-200) | `#e4e4e7` |
| `surface.subtle` / `action.secondary` / `card.hoverBackground` | `--secondary`/`--muted`/`--accent` (zinc-100) | `#f4f4f5` |
| `surface.default` / `surface.raised` / `field.fillBg` | `--background`/`--card` | `#ffffff` |
| `action.danger` / `feedback.error` / `status.failed` | `--destructive` (red-600) | `#e7000b` |
| `cyan.50` accent / `data.category2` | `--chart-2` (teal-600) | `#009689` |
| `cyan.70` / `data.category3` | `--chart-3` (cyan-900) | `#104e64` |
| `data.category1` | `--chart-1` (orange-600) | `#f54900` |
| `data.category4` | `--chart-4` (amber-400) | `#ffb900` |
| `data.category5` | `--chart-5` (amber-500) | `#fe9a00` |

### À confirmer (no direct shadcn/assistant-ui public token)
- **`feedback.success` `#00a63e`** (Tailwind v4 green-600), **`feedback.warning`
  `#e17100`** (Tailwind v4 amber-600, darkened for WCAG AA text on white) and
  **`feedback.info` `#155dfc`** (Tailwind v4 blue-600). shadcn ships **only** a
  `--destructive` semantic colour; success/warning/info are not in the token set,
  so the closest Tailwind v4 hues are used (same source family).
- **`cyan.10` `#d4f4ef`** — light teal tint derived around `--chart-2`
  (assistant-ui has no cyan/accent scale; the chart-2 teal is the nearest
  chromatic accent).
- **`red.50` `#fef2f2`** — Tailwind red-50 tint (not re-measured from the theme).
- **`action.primaryHover` `#27272a`** — shadcn buttons use `hover:bg-primary/90`
  (90 % opacity), which renders ≈ zinc-800 on a white background; encoded here as
  the solid zinc-800.
- **`data.category6-8`** (`#18181b`, `#71717b`, `#e7000b`) — shadcn publishes only
  5 chart colours; categories 6-8 extend with zinc-primary / muted-foreground /
  destructive as a coherent proposal, not an official sequential scale.
- **`shadow.*`** and **`motion.*`** — Tailwind default shadow-xs/sm/md and
  150 ms ease-in-out; assistant-ui uses Tailwind defaults, exact utilities not
  re-measured.
- **`focus.color` opacity** — shadcn renders the ring at `ring-ring/50` (≈ 50 %
  opacity of `--ring`); encoded here as the solid zinc-400 `#9f9fa9`.

## Typography
- **Sans / display / controls / labels** (`font.sans`, `font.display`,
  `typography.control`, `typography.label`): `'Geist', system-ui, sans-serif`
  (medium 500 for buttons/labels). Geist is Vercel's open-source typeface,
  loaded via `next/font/google` in the default template (`--font-geist-sans`).
- **Body / fields** (`typography.field`): `'Geist'`, regular 400, 14 px
  (`text-sm`).
- **Monospace** (`font.mono`): `'Geist Mono', monospace` (`--font-geist-mono`).
- Links are **not** underlined at rest (foreground/primary text); underline
  appears on hover (shadcn link button `underline-offset-4 hover:underline`).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill, 1px
  `#e4e4e7` zinc-200 border, 8 px `rounded-md` radius). Not a filled-underline.
- **Radius**: shadcn scale from `--radius: 0.625rem` (10 px): `sm = 6px`
  (`radius-4px`), `md = 8px` (`radius-2px`, controls/inputs/tabs), `lg = 10px`
  (`radius`, cards/popovers), `pill = 9999px` (badges/avatars).
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in the neutral
  `--ring` zinc-400 `#9f9fa9` (3 px, `focus-visible:ring-[3px] ring-ring/50`),
  not a native offset outline. assistant-ui's focus is monochrome/neutral.
- **Buttons**: primary = solid near-black zinc `#18181b` with `#fafafa` text
  (the "primary sombre"); secondary/outline = white fill, zinc-200 border,
  zinc-100 (`accent`) fill on hover.
- **Tabs**: muted track; the active trigger is a **white filled pill** with
  foreground text (`indicatorMode: "background"`), not a bottom-border underline.
- **Pagination**: ghost links; active page = bordered (outline) box.
- **Chevron (native `<select>`)**: redrawn as a muted-foreground zinc-500
  `#71717b` arrow, `appearance: none`, 2 rem right gutter.
- **Density**: shadcn control heights — button sm 32 px (`h-8`), default 36 px
  (`h-9`), lg 40 px (`h-10`); inputs 36 px; all `text-sm` (14 px) medium.
- **Palette character**: near-monochrome zinc neutrals + a single red
  destructive accent. The only chromatic colours are the `--chart-*` data-vis
  stops (orange/teal/cyan/amber). No brand hue — the "action" colour IS the
  near-black zinc.

## Asset officiel
- The assistant-ui logo/wordmark is an official open-source project asset —
  reference it from the repo (https://github.com/assistant-ui/assistant-ui), do
  not redraw. shadcn/Radix primitives carry no logo of their own.
