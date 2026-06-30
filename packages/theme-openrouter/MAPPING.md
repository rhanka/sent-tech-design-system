# OpenRouter → Sentropic mapping

This package maps the **public** design surface of [openrouter.ai](https://openrouter.ai/)
onto the Sentropic token structure (`TenantTheme`). OpenRouter ships a
**shadcn/ui** interface built on the **Tailwind "zinc" neutral scale**, the
**Radix UI** colour spectrum (loaded as `--<hue>-N` custom properties on `:root`),
an **indigo `--primary`** design token, and a **near-black ("ink") primary
call-to-action** button over a light surface with dark navigation chrome. All
colour values were **measured** from the live computed styles / the site's own
CSS custom properties. Only public tokens and font *names* are referenced — no
font binaries.

## Sources
- Live computed styles of https://openrouter.ai/ (measured 2026-06):
  - `body` background `rgb(255,255,255)` = `#ffffff`; `body` colour `rgb(9,9,11)`
    = `#09090b`; `body` font `Inter, "Inter Fallback", …`.
  - `h1` colour `rgb(24,24,27)` = `#18181b`, weight 700, letter-spacing `-1.5px`;
    `h2/h3` colour `rgb(113,113,122)` = `#71717a`, weight 600, letter-spacing
    `-0.5px`.
  - Marketing CTA / nav chrome background `rgb(16,16,18)` = `#101012`, white text.
  - Card radius `12px`, card/border colour `rgb(228,228,231)` = `#e4e4e7`.
  - Top-navigation font `"Lumen Sans", Arial, sans-serif`.
- shadcn/ui theme tokens (resolved on the app root):
  - `--background: 0 0% 100%` = `#ffffff`; `--foreground: 240 10% 3.9%` = `#09090b`.
  - `--primary: 239 84% 67%` = `#6366f1` (indigo); also drives `--bprogress-color`.
  - `--border: 240 5.9% 90%` = `#e4e4e7`; `--ring: 240 5% 64.9%` = `#a1a1aa`;
    `--muted-foreground: 240 3.8% 46.1%` = `#71717a`; `--radius: 0.5rem` (8px).
- Radix UI colour scales loaded on `:root` (measured `--<hue>-N`): `--teal-9 #12a594`,
  `--teal-3 #e0f8f3`, `--teal-11 #008573`, `--blue-9 #0090ff`, `--blue-11 #0d74ce`,
  `--green-9 #30a46c`, `--green-11 #218358`, `--orange-9 #f76b15`, `--red-9 #e5484d`,
  `--red-11 #ce2c31`, `--amber-11 #ab6400`, `--purple-9 #8e4ec6`, `--pink-9 #d6409f`.
- `@font-face` families measured: `Inter`, `GeistMono` (mono), plus Radix `Inter`.

## Colour mapping

| Sentropic role | OpenRouter token | Value |
|---|---|---|
| `action.primary` / `pagination.activeBackground` | ink / Tailwind zinc 900 (measured CTA `#101012`) | `#18181b` |
| `action.primaryHover` | zinc 950 | `#09090b` |
| `text.primary` / `tabs.activeText` | zinc 900 (measured `h1`) | `#18181b` |
| `surface.inverse` / body foreground | zinc 950 (`--foreground`) | `#09090b` |
| `text.secondary` | zinc 500 (`--muted-foreground`) | `#71717a` |
| `text.muted` / `border.strong` / `focus.color` | zinc 400 (`--ring`) | `#a1a1aa` |
| `border.subtle` | zinc 200 (`--border`) | `#e4e4e7` |
| `surface.subtle` / `action.secondary` | zinc 100 | `#f4f4f5` |
| `surface.default` / `surface.raised` | white (`--background`) | `#ffffff` |
| `text.link` / `border.interactive` / accent (`blue` family) | indigo (`--primary`) | `#6366f1` |
| accent (Sentropic `cyan`) | Radix teal 9 | `#12a594` |
| `action.danger` / `data.category6` | Radix red 9 | `#e5484d` |
| `feedback.success` | Radix green 11 | `#218358` |
| `feedback.warning` | Radix amber 11 | `#ab6400` |
| `feedback.error` | Radix red 11 | `#ce2c31` |
| `feedback.info` | Radix blue 11 | `#0d74ce` |
| `data.*` (categorical) | Radix accent 9 solids | `#6366f1 #0090ff #12a594 #30a46c #f76b15 #e5484d #8e4ec6 #d6409f` |

### "À confirmer" (no directly measured token)
- `zinc.50` `#fafafa`, `zinc.100` `#f4f4f5`, `zinc.700` `#3f3f46` — standard
  Tailwind zinc steps (not re-measured on the page; subtle surface / hover /
  strong-border roles).
- `indigo.hover` `#4f46e5` (Tailwind indigo 600) and `indigo.light` `#eef2ff`
  (indigo 50) — derived hover/fill tints around the measured `--primary` `#6366f1`.
- `action.primary` = `#18181b` (zinc 900): the **measured** CTA is `#101012`
  (rgb 16,16,18); aligned to the clean zinc-900 anchor so the dark chrome,
  primary text and inverse surface share one scale. The exact `#101012` ink is
  documented under "Signatures anatomiques".
- `text.link` / `border.interactive` = indigo `#6366f1`: OpenRouter's documented
  `--primary` (progress bar / accents). The rendered marketing links/buttons are
  monochrome ink; indigo is used as the system interactive accent.
- `feedback.*` use Radix "11" steps (designed for AA text on white); `action.danger`
  uses Radix red 9 `#e5484d` (solid fill, not AA as text).
- `data.*` 8-colour categorical scale — a coherent proposal from the indigo
  `--primary` + measured Radix accent 9 spectrum, not an official sequential scale.
- `shadow.*` (Tailwind-style elevation), `motion.*`, `density.*`, `tag`/`badge`
  geometry, alert/accordion/breadcrumb/pagination metrics — approximate shadcn
  defaults; exact specs not re-measured.

## Typography
- **Body + headings** (`font.sans`, `typography.field/control/label`): `Inter,
  'Inter Fallback', system-ui, sans-serif` (measured on `body` and `h1`–`h3`).
  Headings carry slight negative tracking (`h1 -1.5px`, `h2/h3 -0.5px`);
  controls/labels use `-0.01em`.
- **Display / brand** (`font.display`): `'Lumen Sans', Inter, sans-serif` — the
  brand "Lumen Sans" face measured in the top navigation, falling back to Inter
  (which renders the marketing headings).
- **Monospace** (`font.mono`): `'Geist Mono', GeistMono, ui-monospace, monospace`
  (measured `@font-face GeistMono`).
- Links are **not** underlined at rest (indigo text); underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — shadcn boxed, rounded inputs (white
  fill, 1px `#e4e4e7` border, 8px `--radius`). Not a filled-underline.
- **Radius**: shadcn rounding — `--radius` `md = 8px`, cards `lg = 12px`
  (measured), buttons/chips `sm = 4px` (measured), pills `999px` (measured
  "Sign in" rounded-full).
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in the neutral
  zinc 400 `#a1a1aa` (measured `--ring`), 2px / offset 2px. The minimal,
  monochrome shadcn focus technique, not a coloured outline.
- **Buttons**: primary = solid ink (`#18181b`, measured CTA `#101012`) with white
  text; secondary = shadcn "outline" button (transparent fill, `#e4e4e7` stroke +
  ink text, `#f4f4f5` light fill on hover).
- **Tabs**: shadcn segmented control — active tab = white raised pill on a
  `#f4f4f5` track (`indicatorMode: "background"`), ink label.
- **Pagination**: borderless ink links; active page = filled ink `#18181b`.
- **Chevron (native `<select>`)**: redrawn as a zinc 500 `#71717a` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: shadcn touch targets (button md ≈ 36px / h-9, sm 32px, lg 40px),
  text-sm (14px) medium labels.
- **Ink chrome**: the signature OpenRouter top-navigation / hero chrome is a
  near-black `#101012` (rgb 16,16,18) with white text over an otherwise light
  surface; mapped to `surface.inverse` (`#09090b`) and the ink primary.

## Asset officiel
- The OpenRouter wordmark and "router" logo mark are official OpenRouter brand
  assets — reference them from OpenRouter's own assets, do not redraw. Chrome
  should use the OpenRouter logo over the near-black `#101012` chrome, not a
  hand-drawn approximation.
