# Cirque du Soleil → Sentropic mapping

This package maps **Cirque du Soleil** (cirquedusoleil.com — the Montréal-HQ live
-entertainment company) onto the Sentropic token structure (`TenantTheme`). Cirque
ships an in-page design system; every value here is **measured from the live
site's stylesheet** (`--color-*`, `--radius-*`, `--spacing-*`, `--text-*` and the
`--primary-font` alias, fetched directly from the brand CSS). Only the font *name*
is referenced ("Cds Sans" — measured `--primary-font`), never font binaries.

Cirque du Soleil's identity is **theatrical and bold**: a **dark / near-black
stage** (`#site--dark` → `background: #000`; cards lift to "night sky" `#191a1a`),
a glowing **"golden hour" gold** (`#dca85d` — the sun of the Cirque logo) on every
primary CTA, inverting to a brighter **"yellow sunrise"** (`#f8d248`) on hover,
and light-gold / white copy on black. It is therefore a **DARK-FIRST** theme
(`mode: "dark"`): dark surfaces, light text, gold action.

## Sources
- Cirque du Soleil home (measured) — https://www.cirquedusoleil.com/ (inline `:root` vars: `--highlight-color: #dca85d`, `--color-purple: #7959ff`, `--primary-font: "Cds Sans"`)
- Cirque du Soleil app stylesheet (measured) — https://www.cirquedusoleil.com/dist/v3/cds/ver20260414/css/app.cds.css (the `--color-*`, `--radius-*`, `--spacing-*`, `--text-*` token tables + computed `.cta-btn`, `input`, `#site--dark`, focus-visible rules)
- Component stylesheets — `/dist/components/ver20260414/css/components.sitemenu.css`, `components.banner.css`

## Colour mapping

| Sentropic role | Cirque source (measured) | Value |
|---|---|---|
| `surface.default` | `--color-black` / `#site--dark` page background | `#000000` |
| `surface.subtle` / `surface.raised` / `field.fillBg` | `--color-night-sky` (cards/panels/inputs) | `#191a1a` |
| `surface.inverse` / `text.inverse`-target | `--color-white` | `#ffffff` |
| `text.primary` / `action.secondaryText`-light | `--color-golden-light` / `--color-light-gold` | `#f2e7bb` |
| `text.secondary` | `--color-grey-2` | `#cbcbcb` |
| `text.muted` / `breadcrumb.separator` | `--color-grey-3` | `#989898` |
| `text.link` / `action.primary` / `border.interactive` / `tabs.activeText` / `pagination.activeBackground` / `badge.infoBackground` | `--color-golden-hour` / `--color-gold` / `--highlight-color` | `#dca85d` |
| `action.primaryHover` | `--color-yellow` / `--color-yellow-sunrise` (measured CTA hover + link hover) | `#f8d248` |
| `action.primaryText` / `pagination.activeText` / `text.inverse` | `--color-black` (CTA text on gold) | `#000000` |
| `border.subtle` / `card.hoverBackground` / `tag.neutralBackground` | `--color-grey-7` | `#282828` |
| `border.strong` | `--color-grey-5` | `#5c5c5c` |
| `field.underlineColor` / `slate-80`-panel | `--color-grey-8` (field `border-bottom`) | `#1b1b1b` |
| `action.danger` / `feedback.error` / `status.failed` | `--color-destructive` | `#ec091a` |
| (red, secondary) | `--color-red` | `#c50714` |
| `feedback.success` / `status.completed` | `--color-success` | `#2d816a` |
| `feedback.info` / `status.processing` / `focus.color` | `--color-btn-focus` | `#0163da` |
| `data.category2` (secondary accent) | `--color-purple` | `#6349e9` |

## "À confirmer" (no measured Cirque source, or derived)
- **`feedback.warning` `#d8a200`** — Cirque exposes only `--color-warning-dark` /
  `--color-warning-light` aliases (no resolvable hex in the fetched CSS). This
  AA-grade amber is a sensible default, **à confirmer**.
- **The Sentropic `blue` role family** — Cirque's primary action is **gold**, not
  blue; the `blue.{10,60,80}` action steps are mapped onto the gold scale
  (`#f2e7bb / #dca85d / #f8d248`).
- **The Sentropic `cyan` accent family** — mapped onto the Cirque **purple**
  `#6349e9` (the brand's distinct secondary accent) + gold; no literal cyan
  exists.
- **`action.secondaryHover` `#282828`** — derived dark lift; the measured ghost
  secondary turns its **border/text** gold-yellow rather than filling.
- **`buttonSecondary.hoverBackground: transparent`** — measured `.ghost-light`
  secondary stays transparent on hover and recolours its border+text to
  `#f8d248`; the token model carries the fill only.
- **`radius.pill` `120px`** — measured `--radius-pill: 120px`; the brand CTA uses
  an explicit `border-radius: 30px` which reads as a pill at control height.
- **The 8-colour categorical `data.*` palette** — Cirque publishes no data-vis
  scale; assembled from the brand gold, purple, yellow, success teal, light gold,
  focus blue, destructive red and a neutral grey. Not an official token list.
- **`shadow.*`, `motion.*`, `spacing.*`** — spacing/radius/text steps ARE
  tokenised (`--spacing-*`, `--radius-*`, `--text-*`) and used; the precise
  elevation ramp is not published — the dark shadows are aligned to base, and the
  `floating` slot carries the measured **purple stage-glow** `0 0 50px #6349e9`.
- **`data.category2` purple `#6349e9`** — the app CSS `--color-purple` is
  `#6349e9`; the home-page inline `--color-purple` is `#7959ff`. The app value is
  used (more authoritative for components).

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.*`): **"Cds Sans"** — Cirque's proprietary sans (measured
  `--primary-font` / `--secondary-font` / `--tertiary-font` all `"Cds Sans"`),
  with a Helvetica-family fallback. Base type 16px (`--text-base`); display titles
  scale 32–88px (`--text-2xl … --text-8xl`).
- **Monospace** (`font.mono`): not part of Cirque; the Sentropic mono stack kept.
- CTA labels and titles are **bold (700)** (measured CTA `font-weight: 700`; some
  display titles reach 900); body/field text is regular (400).
- Links are gold/light at rest and **brighten to `#f8d248` on hover** (measured
  `--link:hover { color: #f8d248 }`); not underlined at rest.

## Signatures anatomiques
- **Mode**: **dark-first** (`mode: "dark"`) — the site renders on a near-black
  stage; surfaces are dark, text is light gold/white, action is gold.
- **Fields**: `field.style = "filled-underline"`, `underlineMode = "border"` —
  a **dark fill** (`#191a1a`) with a thin **1px bottom border** (`#1b1b1b`),
  gold-light text, golden-hour placeholder (measured search / city-selector
  inputs). `radiusTop: 4px`, `radiusBottom: 0`. Native `<select>` chevron redrawn
  in gold (`#dca85d`) with a 36px gutter, `appearance: none`.
- **Radius**: soft — `--radius-xs 4 / -base 16 / -lg 24 / -pill 120px`; controls
  land on 16px, cards on 24px. CTAs render an explicit `border-radius: 30px`
  (near-pill).
- **Focus**: accessible **blue outline** (`focus.strategy: "outline"`, 2px,
  `#0163da`, offset 4px) — measured `outline: 2px solid #0163da; outline-offset:
  4px`. Deliberately blue, **not** the gold brand, so the ring never blends into a
  gold control.
- **Buttons**: primary = **solid gold fill, black bold text, near-pill**,
  brightening to `#f8d248` on hover (the glowing CTA, 40px tall); secondary =
  ghost (transparent fill, gold/light border + text, recolours to yellow on
  hover).
- **Tabs / sub-nav**: active = bold **gold** label with a **gold bottom border**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless light links on the dark stage; active page = **filled
  gold pill**, black text.
- **Density**: bold "Cds Sans" type (16px base), ~40px CTAs, soft rounding,
  theatrical dark elevation with a purple stage-glow.

## Asset officiel
- Cirque du Soleil's logo is the **sun** mark (a radiant gold sun) alongside the
  wordmark, served from the site header. **Do not redraw** — reuse the official
  Cirque du Soleil sun logo asset if a logo is needed (see the header of
  https://www.cirquedusoleil.com/). The brand gold `#dca85d` is literally that
  sun's colour (`--color-golden-hour`).
