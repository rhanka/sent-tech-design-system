# Hugging Face → Sentropic mapping

This package maps the **public** Hugging Face brand (as used on
[huggingface.co](https://huggingface.co/) and the brand page) onto the
Sentropic token structure (`TenantTheme`). The Hub front-end ships **Tailwind
CSS v4**, so HF's neutral / status palette IS the Tailwind v4 default scale,
exposed as `--color-*` custom properties in the live stylesheet
(`/front/build/.../style.css`); those oklch values are converted to their
canonical sRGB hex here. Only public brand colours, the Tailwind scale and font
*names* are referenced — no font binaries.

## Sources
- HF brand colours — https://huggingface.co/brand : Yellow `#FFD21E`,
  Orange `#FF9D00`, Gray `#6B7280`. The yellow also appears literally in the
  live stylesheet as a `text-[#FFD21E]` utility.
- Live Hub stylesheet `https://huggingface.co/front/build/kube-*/style.css`
  (Tailwind v4): `--color-gray-*`, `--color-indigo-*`, `--color-emerald-*`,
  `--color-red-*`, `--color-amber-*`, `--color-blue-*`, `--color-pink-*`,
  `--radius-*`, and the `font-family` declarations.
- Live Hub HTML `https://huggingface.co/` : primary CTA = `bg-gray-900`
  `rounded-full` pill (white text); repo/link hover = `text-indigo-600`; brand
  accents = `text-yellow-500` / `hover:text-yellow-700`; gradient cards
  `from-yellow-600 to-pink-600` and `from-yellow-50 to-white`.

### Tailwind v4 oklch → hex (measured, converted)
`gray-50 #f9fafb · gray-100 #f3f4f6 · gray-200 #e5e7eb · gray-300 #d1d5dc ·
gray-400 #99a1af · gray-500 #6a7282 · gray-600 #4a5565 · gray-700 #364153 ·
gray-800 #1e2939 · gray-900 #101828 · indigo-600 #4f39f6 · indigo-700 #432dd7 ·
emerald-600 #009966 · red-600 #e7000b · amber-600 #e17100 · blue-600 #155dfc ·
pink-600 #e60076`.

## Colour mapping

| Sentropic role | HF token | Value |
|---|---|---|
| `action.primary` / brand signature (Sentropic `cyan`) | HF brand yellow | `#ffd21e` |
| `action.primaryText` | brand black (emoji outline) | `#000000` |
| `text.link` / `border.interactive` / `focus.color` / `feedback.info`→ no (see below) | Tailwind indigo-600 | `#4f39f6` |
| interactive hover | Tailwind indigo-700 | `#432dd7` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.subtle` / `action.secondary` | Tailwind gray-100 | `#f3f4f6` |
| surface alt / card hover | Tailwind gray-50 | `#f9fafb` |
| `action.secondaryHover` | Tailwind gray-200 | `#e5e7eb` |
| `border.subtle` | Tailwind gray-300 | `#d1d5dc` |
| `border.strong` / `text.muted` | Tailwind gray-400 | `#99a1af` |
| `text.secondary` | Tailwind gray-500 | `#6a7282` |
| `text.primary` / `surface.inverse` / dark CTA pill | Tailwind gray-900 | `#101828` |
| `action.danger` / `feedback.error` | Tailwind red-600 | `#e7000b` |
| `feedback.success` | Tailwind emerald-600 | `#009966` |
| `feedback.info` | Tailwind blue-600 | `#155dfc` |
| brand orange (data / gradient start) | HF brand orange | `#ff9d00` |
| gradient companion (data) | Tailwind pink-600 | `#e60076` |

### "À confirmer" (no direct HF public token / derived)
- **`action.primary` = yellow `#ffd21e`** — this is the brand-forward choice.
  The *literal* Hub primary CTA is a dark `gray-900` pill (white text); that
  dark pill is preserved via `surface.inverse` / `pagination.activeBackground`.
  The yellow+black pairing is the iconic HF identity and reads instantly as HF.
- `action.primaryHover` `#e6bd1b` — HF ships no filled-yellow button, so this
  is the brand yellow darkened ~8% (same hue) for a button hover.
- `cyan.10` `#fefce8` (Tailwind yellow-50) and `cyan.70` `#e6bd1b` — light /
  dark tints around the brand yellow.
- `feedback.warning` `#e17100` (Tailwind amber-600) — the HF brand orange
  `#ff9d00` / Tailwind amber-500 `#fe9a00` is too light for AA text on white, so
  it is darkened to amber-600 for the warning role (brand-orange direction kept).
- `focus.color` `#4f39f6` (indigo-600) — HF uses Tailwind focus rings whose
  exact colour varies per control; the interactive indigo is used here.
- `data.*` categorical palette — HF publishes no sequential data-vis scale; this
  is a coherent proposal from the HF brand (yellow / orange / pink) + the
  Tailwind interactive/status hues. The brand gradient is `#ff9d00`/yellow →
  `#e60076` (pink), parked in `data.category6` / `data.category5`.
- `shadow.*` (Tailwind shadow-sm/md/lg families) and `motion.*` — approximate
  Tailwind defaults, not re-measured.
- `density.*` heights/paddings — approximate from the compact Hub controls
  (e.g. Sign-Up CTA `px-3 py-1`), not exhaustively measured.

## Typography
- **Body / headings / buttons / fields** (`font.sans`, `font.display`, all
  `typography.*`): `'Source Sans Pro', ui-sans-serif, system-ui, sans-serif, …`
  — measured `font-family` on the live Hub. HF has **no separate display face**;
  headings are Source Sans Pro in heavier weights. Buttons/labels are semibold
  (600), body/fields normal (400).
- **Monospace** (`font.mono`): `'IBM Plex Mono', ui-monospace, SFMono-Regular,
  Menlo, Monaco, Consolas, …` — measured on code blocks / repo file names.
- **Prose serif** (no Sentropic slot): HF long-form articles use `Charter,
  ui-serif, Georgia, …`. Noted for completeness; not mapped to a token.
- Links are **not** underlined at rest (indigo text); underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, rounded inputs (white fill,
  1px `#d1d5dc` border, 8px radius), the HF `rounded-lg` text input. Not a
  filled-underline.
- **Radius**: friendly rounding — controls/inputs `md = 8px` (`rounded-lg`),
  cards `lg = 12px` (`rounded-xl`); buttons & tags read as **pills**
  (`pill = 999px`, HF `rounded-full`); `sm = 4px`.
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in indigo
  `#4f39f6` (3px, offset 2px), the Tailwind focus-ring technique (not a native
  offset outline).
- **Buttons**: primary = solid HF yellow `#ffd21e` with **black** text (the
  emoji pairing); secondary = white/transparent fill with a `#d1d5dc` gray
  border + dark text, `#f3f4f6` light fill on hover. The literal dark Sign-Up
  pill (`gray-900`, white text) is captured by `surface.inverse`.
- **Tabs**: active tab = dark `#101828` semibold label with a 2px bottom
  indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless dark text links; active page = filled dark
  `#101828` pill.
- **Chevron (native `<select>`)**: redrawn as a gray-500 `#6a7282` arrow,
  `appearance: none`, generous right gutter.
- **Tags / badges**: pill-rounded (`rounded-full`); neutral tag = `#f3f4f6`
  fill, `#364153` text.
- **Density**: compact controls (md ≈ 36px height) with semibold 14px labels.
- **HF gradient**: `#ff9d00`/yellow → `#e60076` (pink). `TenantTheme` has no
  gradient token, so the two stops live in `data.category6` / `data.category5`
  and are noted here as the brand signature.

## Asset officiel
- The Hugging Face hugging-emoji mark (yellow `#FFD21E` face, black outline,
  orange `#FF9D00` cheeks) and the wordmark are official HF brand assets —
  reference them from https://huggingface.co/brand (SVG / PNG / AI), do not
  redraw. HF chrome should use the official emoji + wordmark, not a hand-drawn
  approximation.
