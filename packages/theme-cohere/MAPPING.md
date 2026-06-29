# Cohere → Sentropic mapping

This package maps the **public** Cohere brand (the Pentagram/NaN visual identity,
as shipped on [cohere.com](https://cohere.com/)) onto the Sentropic token
structure (`TenantTheme`). All colour values are **measured** on the live
cohere.com CSS (a Next.js / Tailwind build) and the published Pentagram brand
palette. Only public brand colours and font *names* are referenced — no font
binaries (the Cohere typeface is proprietary and not publicly available).

## Sources
- **Live CSS** — `cohere.com/_next/static/css/*.css` (7 bundles, measured June 2026):
  `body { background-color:#fafafa }`; `color:#17171c` (11×), `#616161` (6×),
  `#ff7759` (6×), `#b30000` (3×), `#212121`; `border-color:#d7cfc1` (4×);
  `--tw-ring-color:#4c6ee680`; gradient stops `#ff7759 #ca492d #ffd9d0 #4c6ee6
  #2d4cb9 #8fa6f9 #e5ebff #355146 #5ea538 #9b60aa #d18ee2 #b2bbb6 #142253`;
  Tailwind radii `rounded-sm 4px / -md 6.8px / -lg 12px / -xl 22px / -full 9999px`
  (explicit `border-radius:8px` 8×, `12px` 7×).
- **Font stacks** (measured `font-family` in the same CSS):
  body `CohereText, Space Grotesk, Inter, …` (legacy `Unica77 Cohere Web, Inter, …`),
  display `CohereVariable, …` / `CohereHeadline`, mono `CohereMono, ui-monospace, …`.
  Font asset listing at `fonts.cohere.com` (CohereText / CohereMono / CohereVariable).
- **Pentagram brand palette** — Mine Shaft `#212121` (Primary Dark), Alabaster
  `#FAFAFA` (Primary Light), Bittersweet `#FF7759` (Accent); secondary "pinks,
  purples, neon-tinged oranges"; nature/synthetic concept (coniferous green,
  mushroom grey, simulated coral, synthetic quartz, acrylic blue). Sources:
  pentagram.com/work/cohere, cohere.com/blog/reimagined-brand, mobbin.com colours.
- **Warm stone muted grey** `#8d8d86` — measured on docs.cohere.com (the official
  Cohere docs property).

## Colour mapping

| Sentropic role | Cohere token | Value |
|---|---|---|
| `action.primary` / `text.link` / `foundation.blue.60` / `tabs.activeText` | Bittersweet / simulated coral | `#ff7759` |
| `action.primaryHover` / `foundation.blue.80` | coral / rust | `#ca492d` |
| `foundation.blue.10` | light coral tint | `#ffd9d0` |
| `border.interactive` / `focus.color` / `feedback.info` / `foundation.cyan.50` | acrylic blue | `#4c6ee6` |
| `foundation.cyan.70` | acrylic blue dark | `#2d4cb9` |
| `foundation.cyan.10` | acrylic blue pale | `#e5ebff` |
| `surface.default` (page) / `text.inverse` | Alabaster | `#fafafa` |
| `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.subtle` / `action.secondary` | light grey | `#f2f2f2` |
| `border.subtle` / `action.secondaryHover` | warm beige divider (signature) | `#d7cfc1` |
| `text.muted` | warm stone grey | `#8d8d86` |
| `text.secondary` / `border.strong` | secondary grey | `#616161` |
| `slate.80` (strong text) | dark grey | `#2e2e2e` |
| `text.primary` / `surface.inverse` / `action.primaryText` | volcanic black | `#17171c` |
| brand "Primary Dark" (Mine Shaft, reference) | Mine Shaft | `#212121` |
| `action.danger` / `feedback.error` | error red | `#b30000` |
| `feedback.success` | coniferous green | `#355146` |
| `feedback.warning` / `status.pending` | coral / rust | `#ca492d` |

## "À confirmer" (no direct Cohere public token / derived)
- **`feedback.warning` `#ca492d`** — the darker coral/rust reused as a warm
  warning tone (contrast ≈ 4.6:1 on white, AA). Cohere publishes no dedicated
  warning colour.
- **`feedback.success` `#355146`** — the coniferous green (a measured gradient
  stop), reused as success; not labelled "success" by Cohere.
- **`feedback.info` `#4c6ee6`** — acrylic blue; contrast as text ≈ 4.4:1 on white
  (essentially AA). Faithful to the brand's focus/interactive blue.
- **`text.muted` `#8d8d86`** — measured on docs.cohere.com (not the main cohere.com
  CSS); a warm stone grey consistent with the warm neutral scale.
- **The 8-colour categorical `data.*` palette** — a coherent proposal built from
  the Cohere secondary brand hues (coral, acrylic blue, coniferous green, quartz
  purple `#9b60aa`, orchid `#d18ee2`, bright green `#5ea538`, deep blue `#2d4cb9`,
  sage `#b2bbb6`). Cohere does not publish a sequential data-vis scale.
- **`shadow.*` / `motion.*` / `disabledOpacity`** — not tokenised publicly;
  conservative defaults tinted with the volcanic black `#17171c`.
- **`density.*` paddings / `typography.*` letter-spacing & weights** — approximate
  the measured 16px/1.5 body and ~40px control height; exact SCSS specs not
  re-measured.
- **`radius.md 8px`** — Cohere's Tailwind `rounded-md` is 6.8px, but `8px` is the
  most-used explicit radius (8×); controls land on 8px, cards on 12px (`rounded-lg`).

## Typography
- **Display / headings** (`font.display`): `'CohereVariable', 'CohereHeadline',
  'Space Grotesk', Inter, system-ui, sans-serif`.
- **Body / fields / labels** (`font.sans`, `typography.field/control/label`):
  `'CohereText', 'Unica77 Cohere Web', Inter, system-ui, sans-serif`.
- **Monospace** (`font.mono`): `'CohereMono', ui-monospace, 'SFMono-Regular',
  Menlo, monospace`.
- The custom Cohere typeface (Pentagram + NaN) has slightly rounded corners for
  warmth, with Text / Headline / Outline / Mono styles. Proprietary — names only.
- Links (coral) are **not** underlined at rest; underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed, gently-rounded inputs (white fill
  `#ffffff`, warm 1px `#d7cfc1` border, 8px radius). Not a filled-underline.
- **Radius**: gentle rounding — controls/inputs/tabs `md = 8px`, cards `lg = 12px`,
  chips read as pills (`pill = 999px`); `sm = 4px`. Larger surfaces use 22px
  (`rounded-xl`) on the live site.
- **Focus**: `focus.strategy = "ring"` — a soft box-shadow ring in the acrylic
  blue `#4c6ee6` (3px, offset 2px). Measured as `--tw-ring-color:#4c6ee680`
  (50%-alpha acrylic blue), the brand's interactive technique — not a native
  offset outline.
- **Buttons**: primary = solid coral `#ff7759` with volcanic-black text `#17171c`
  (AA ≈ 6.9 — coral is too light for white text); secondary = ghost/outlined
  button (transparent fill, warm beige `#d7cfc1` stroke, `#f2f2f2` hover fill).
- **Tabs**: active tab = coral `#ff7759` medium label with a 2px coral bottom
  indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless dark links; active page = filled coral `#ff7759`
  with volcanic-black text.
- **Chevron (native `<select>`)**: redrawn as a volcanic-black `#17171c` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: ~40px control height (md) with generous horizontal padding; button
  label 15px (`0.9375rem`) medium.
- **Canvas**: a WARM brand — cream `#fafafa` (Alabaster) page, white `#ffffff`
  raised cards, warm beige `#d7cfc1` dividers, volcanic-black text, coral accent.

## Asset officiel
- The Cohere wordmark and the Voronoi/cell "new nature" brand patterns are
  official Pentagram-designed Cohere assets — reference them from Cohere's brand
  resources, do not redraw. Cohere chrome should use the real Cohere logotype and
  Voronoi motif, not a hand-drawn approximation.
