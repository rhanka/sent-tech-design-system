# Danone → Sentropic mapping

This package maps the **public** corporate design of [danone.com](https://www.danone.com/) onto the
Sentropic token structure (`TenantTheme`). Method = **measured clone**: every colour is measured
from Danone's public compiled CSS (the Adobe AEM build served as `theme/site.css`, June 2026),
where Danone exposes its palette as CSS custom properties. Only public CSS values and font *names*
are referenced — no font binaries. Any value not directly measured is flagged "à confirmer".

Danone's stylesheet carries **two systems** that coexist (a "danone-renew" refresh in progress):
- a **legacy** `--colors-*` / `--btn-*` system — the one actually **rendered on screen today**
  (~285 occurrences of the brand blue `#005eb8`);
- a newer **renew** token system `--color-*` (neutral & semantic ramps) — defined but barely
  applied yet (its primary `#2b3c90` appears once).

This clone targets the **currently rendered** look, so the primary is the legacy `#005eb8`.

## Sources
- Danone corporate site — https://www.danone.com/
- Compiled CSS (measured) — `https://static.aemcs.digital4danone.com/86cb86420b2276ec214525104dc9a99c29cd92672521d13a6f1c308411e5896b/theme/site.css`
  (1.16 MB; source of every measured colour below), plus `clientlib-base` and the Algolia search
  clientlib (no brand colours).
- Brand-colour cross-check — https://www.brandcolorcode.com/danone and
  https://pickcoloronline.com/brands/danone/ (both cite `#3B47A7` + `#11ACED` as "approximate, not
  from the brand book"). **Neither value appears in the live CSS** — they are NOT used here; the
  rendered blue is `#005eb8` and the closest live cyan is `#00aced`.

## Colour mapping (measured)

| Sentropic role | Danone CSS variable (source) | Hex |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `pagination` | `--colors-text-danone-blue` / `--btn-bg-primary` / `--colors-icon-primary` | `#005eb8` |
| `action.primaryHover` / `surface.inverse` (blue.80) | `--btn-bg-secondary-hover` / `--theme-background` (navy) | `#002677` |
| `blue.10` (light-blue tint, secondary hover fill) | `--theme-accentColor` light-blue | `#ccdff1` |
| accent (Sentropic `cyan.50`) / `badge.infoBackground` / `focus.color` | `--theme-accentColor` cyan | `#00aced` |
| `data.category3` (teal) | `--colors-icon-secondary` | `#0e9888` |
| `data.category6` (star yellow) | `--color-favourite-500` | `#ffd200` |
| `surface.default` / `surface.raised` / `field.fillBg` / `text.inverse` | `--colors-text-white` | `#ffffff` |
| `surface.subtle` / `action.secondary` (slate.10) | `--color-neutral-50` | `#f8f8f8` |
| `border.subtle` (slate.20) | `--colors-text-quaternary` | `#e0e0e0` |
| `text.muted` / `border.strong` | `--colors-icon-grey` / `--colors-text-tertiary` | `#9e9e9e` |
| `text.secondary` (slate.60) | `--colors-text-medium-gray` (≈ `rgba(0,0,0,.6)`) | `#666666` |
| `text.primary` / `choice.labelColor` (slate.90) | `--colors-text-primary` | `#000000` |
| `feedback.success` / `status.completed` | `--colors-icon-success` | `#00843d` |
| `action.danger` / `feedback.error` / `status.failed` | `--colors-icon-error` / `--colors-text-error` | `#e81221` |
| `feedback.warning` / `status.pending` | `--color-warning-500` (renew) | `#d45900` |
| `feedback.info` / `status.processing` | `--color-info-500` (renew) | `#2a7ab0` |

Measured neutral ramp (renew `--color-neutral-*`, used for `slate.*` and greys):
`50 #f8f8f8 · 100 #eaeaea · 200 #dfdfdf · 500 #bababa · 700 #848484 · 800 #666 · 900 #4e4e4e`.
Legacy greys `--colors-icon-grey-light #eee`, `--colors-text-quaternary #e0e0e0`,
`--colors-text-tertiary #9e9e9e` are used where they are the actually-rendered values.

## À confirmer (derived / not directly measured)
- `slate.80` `#333333` — a "strong text" step between the measured secondary `#666666` and the
  measured primary `#000000`; derived (the renew ramp tops at `--color-neutral-900 #4e4e4e`).
- `cyan.10` `#cceefb` (light cyan tint) and `cyan.70` `#0089bd` (darker cyan) — derived from the
  measured accent `#00aced`.
- `radius.*` (md 8px / lg 12px, soft rounded) — derived to express Danone's friendly health-food
  feel; not directly tokenised in the public CSS.
- `focus` 3px outline in `#00aced` (offset 2px) — colour is a measured accent, but the focus
  *technique* (width/offset/strategy) is derived; focus rings are not directly tokenised.
- `field.style = "outline"` with soft corners — the corporate home exposes few styled inputs;
  the boxed outline is a derived choice matching the brand.
- `density.*` heights/paddings — derived comfortable rhythm; few bordered controls to measure.
- `motion.*`, `shadow.*` (blue-tinted), `disabledOpacity 0.5`, `link` hover underline metrics —
  derived; kept close to the Sentropic base.
- 8-colour categorical `data.*` palette — a coherent proposal from measured Danone hues, not an
  official scale.
- Third-party charte values `#3B47A7` / `#11ACED` (brandcolorcode / pickcoloronline) are **rejected**
  in favour of the measured live values; recorded here only for traceability.
- The renew system primary `#2b3c90` (`--color-primary-500`) is the **future** brand blue if Danone
  flips its refresh; the current clone uses the rendered legacy `#005eb8`.

## Typography (font names only)
- **Body / UI / display** (`font.sans`, `font.display`, `typography.control/field/label`): Danone's
  PROPRIETARY brand typeface **DanoneOne** — declared in `theme/site.css` as `DanoneOne Regular`
  (`--fonts-body`) and `DanoneOne Bold` (`--fonts-title` / `--fonts-bold`), with a `sans-serif`
  fallback (we add `Arial` as the metric fallback). Italic and CondensedBold cuts also ship.
- **Monospace** (`font.mono`): Danone ships none; the Sentropic mono stack is kept.
- The logo wordmark is historically set in a geometric sans (Futura family per third-party
  references); the live site UI uses DanoneOne, which is what this theme references.

## Anatomy signatures
- **Primary blue**: `#005eb8` (measured, ~285×) — the rendered Danone corporate blue, backed by
  navy `#002677` for hover / inverse surfaces.
- **Accent**: a real bright cyan `#00aced` (section accent) drives the Sentropic `cyan` slot, badges
  and the focus ring; teal `#0e9888` and the star yellow `#ffd200` enrich the data palette.
- **Radius**: friendly / soft — controls `md` 8px, cards `lg` 12px, pills `999px` (derived).
- **Focus**: 3px cyan `#00aced` outline, offset 2px (colour measured, technique derived).
- **Fields**: boxed outline (white fill, 1px grey hairline, soft corners); native `<select>` chevron
  redrawn in the Danone blue `#005eb8`.
- **Buttons**: primary = solid Danone blue `#005eb8` with white text, navy `#002677` hover; secondary
  = outlined blue (transparent fill, light-blue `#ccdff1` hover).
- **Tabs**: active = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled blue with white text.
- **Tags / badges**: soft pills (`radius: 999px`); info badge in bright cyan.

## Asset officiel
- Danone wordmark / logo (the "child gazing at a star"): use the official asset from Danone's brand
  resources (do **not** redraw). The identity is the rounded "Danone" wordmark in corporate blue
  `#005eb8` with the star motif — no hand-drawn reproduction.
