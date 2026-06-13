# Desjardins → Sentropic mapping

This package maps **Desjardins** (desjardins.com — Mouvement Desjardins, the
Québec cooperative financial group) onto the Sentropic token structure
(`TenantTheme`). Desjardins ships a real, in-page design system whose CSS custom
properties are all prefixed **`--dsd-*`** ("Desjardins Design"). Every value here
is **measured from the live site's computed CSS** (the `--dsd-*` token tables plus
computed styles on real buttons, links, headings, inputs and selects, inspected
in a real browser). Only the font *name* is referenced (`"Desjardins Sans"` — the
brand's proprietary sans, measured `--dsd-font-main-name`), never font binaries.

Desjardins's identity is a **trustworthy cooperative-bank** system: the **iconic
Desjardins green `#00874e`** drives every primary action and the brand mark;
surfaces are **white** on a faint grey page; ink is a **soft near-black `#2f2f2f`**
(never pure black); corners are **mildly rounded** (4px on controls); form fields
are **boxed outlines** (1.6px grey stroke, white fill, redrawn select chevron);
focus is an **accessible blue outline `#0061cb`** — deliberately a different hue
from the green brand so the indicator never blends into a green control.

## Sources
- Desjardins storefront (measured) — https://www.desjardins.com/qc/fr.html
  (computed CSS via in-browser inspection: 772 `--dsd-*` custom properties + live
  computed styles on header buttons, links, H1/H2, input and `<select>`).
- Brand green confirmed externally — #00874e (Desjardins logo / visual identity).

## Colour mapping

| Sentropic role | Desjardins source (measured `--dsd-*`) | Value |
|---|---|---|
| `action.primary` / `border.interactive` / brand | `--dsd-color-background-brand` / `-button-brand` (rgb 0,135,78) | `#00874e` |
| `action.primaryHover` | `--dsd-button-primary-background-brand-hover` | `#007142` |
| (active green) | `--dsd-button-primary-background-brand-active` | `#00673b` |
| `action.secondaryText` / secondary button border / tab active / success | `--boa-brand-secondary-default` / `--dsd-color-border-button-brand` / `-background-link-confirmation` | `#055b37` |
| (darkest green ink) | `--dsd-color-background-decorative-brand-600` | `#053e26` |
| faint green tint / card+secondary hover | `--dsd-table-cell-background-hover` / `-decorative-brand-100` | `#ecf5f0` |
| `text.primary` | `--dsd-color-font-default` (soft near-black) | `#2f2f2f` |
| `surface.inverse` | `--dsd-color-background-reversed` / `--dsd-color-font-tertiary` | `#383838` |
| `text.secondary` / `text.muted` / `border.default` | `--dsd-color-font-secondary` / `--dsd-color-border-default` | `#6c6c6c` |
| `text.contrast` (rare) | `--dsd-color-font-contrast` | `#000000` |
| `text.link` / `pagination.text` / `breadcrumb.linkText` | `--dsd-color-font-link` | `#025aba` |
| (link visited) | `--dsd-color-font-link-visited` | `#663e7b` |
| `surface.default` / `surface.raised` / `action.primaryText` | `--dsd-color-background-default` | `#ffffff` |
| `surface.subtle` | `--dsd-color-background-page` | `#f4f4f4` |
| faintest neutral | `--dsd-color-…-decorative-graphite-100` | `#f1f2f3` |
| `border.subtle` / disabled fill | `--dsd-color-background-disabled` / graphite-200 | `#e6e7e8` |
| soft border / reversed btn border | `--dsd-color-border-button-reversed` / graphite-300 | `#c7c9cc` |
| `border.strong` (field stroke) | `--dsd-color-border-inactive` (measured select stroke, 1.6px) | `#767676` |
| `focus.color` | `--dsd-color-border-focus` | `#0061cb` |
| `action.danger` | `--dsd-color-background-button-error` | `#ca241a` |
| error ink | `--dsd-color-font-error` | `#960e02` |
| `feedback.warning` | `--dsd-color-border-warning` | `#ad8405` |
| warning ink | `--dsd-color-font-warning` | `#443507` |
| `feedback.info` | `--dsd-color-border-information` | `#5791bd` |
| `surface.overlay` | `--dsd-color-background-backdrop` (#00000099 ≈ 60%) | `rgb(0 0 0 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`border.strong` `#767676` encoded at 1px / `borderWidth.thin`** — the real
  measured field & select stroke is **1.6px solid** (`--dsd-color-border-inactive`).
  Encoded as `thin: 1px` (the finest clean token value); the 1.6px source is
  noted here. `border.default` `#6c6c6c` is the lighter divider stroke.
- **The Sentropic `cyan` accent family** — Desjardins has no single "accent" hue
  distinct from green; its decorative cool families (aqua/petroleum/turquoise)
  are secondary. The `cyan` slot is mapped onto the **green** scale to keep the
  brand coherent.
- **`action.secondary` `#f1f2f3` / `secondaryHover` `#e6e7e8`** — the neutral
  graphite secondary surface (Desjardins's true "secondary" button is an outlined
  green ghost, captured in `buttonSecondary`; the neutral fill is a sensible
  default for the generic secondary surface role).
- **The 8-colour categorical `data.*` palette** — Desjardins publishes rich
  DECORATIVE ramps (brand-green, aqua, lime, petroleum, slate, turquoise,
  graphite) but no single published *categorical* token list. The scale is
  assembled from the deepest legible step of each family, led by the brand green.
- **`shadow.*`** — mapped from `--dsd-elevation-100/250/350` (dark-tinted ramp).
- **`motion.*`, `spacing.*`** — the site uses `transition: all` and a 4px-based
  `--dsd-spacing-rem-*` ramp; exact durations are not separately tokenised, kept
  aligned with the base (`normal` 200ms).
- **`radius.pill` `999px`** — `--dsd-border-radius-pill` (used by tags/badges).

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.*`): **`"Desjardins Sans"`** — the brand's proprietary sans
  (measured `--dsd-font-main-name`), with the brand's own `Arial, Helvetica,
  sans-serif` fallback chain. Base type **16px**. Weights
  light/regular/semibold/bold/extrabold = **300 / 400 / 500 / 700 / 800**.
- **Control labels** are **bold (700)** (measured CTA `font-weight: 700`); body
  and field text is **regular (400)**; labels semibold (500).
- **Headings** are heavy: measured **H1 42px / 700**, line-height ≈ 50px,
  `letter-spacing: -1px`; **H2 24px / 700**, line-height 32px.
- **Links** are **underlined blue at rest** (measured anchor
  `text-decoration: underline`, colour `#025aba`).
- **Monospace** (`font.mono`): not part of Desjardins; the Sentropic mono stack kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1.6px**
  grey stroke `#767676`, **4px radius**), not a filled-underline. Native
  `<select>` chevron redrawn in the soft-black ink `#2f2f2f` with a ~36px gutter
  (measured `padding: 10px 36px 10px 12px`, `appearance: none`).
- **Radius**: mild rounding from the measured `--dsd-border-radius-*` ramp
  (`0 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / 999`). Controls (the measured `<select>`)
  use **4px** = `radius-150`; cards step to 8px. (A few promo/banner CTAs are
  square 0px — outliers; the design-system control radius is 4px.)
- **Borders**: body dividers ~1px graphite; field/select strokes **1.6px solid**
  `#767676`; brand accents `#00874e` / `#055b37`.
- **Focus**: accessible **blue outline** (`focus.strategy: "outline"`, ~2px,
  `#0061cb` = `--dsd-color-border-focus`) — measured `outline: 2.4px solid`.
  Desjardins focuses in **blue, not the green brand**, so the ring stays visible
  on green controls.
- **Buttons**: primary = **solid Desjardins-green fill, white bold (700) text**
  (measured CTA 64px tall, 24px/20px padding, hover `#007142`, active `#00673b`);
  secondary = **outlined green ghost** (transparent fill, dark-green `#055b37`
  border + green text, faint green `#ecf5f0` hover).
- **Tabs / sub-nav**: active = bold **green** label with a **green bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = **filled brand-green
  square**, white text.
- **Tags / badges**: **pill** (`radius: 999px`) — graphite-fill tags; brand-green
  filled badges with white text.
- **Density**: 16px base type, bold 700 control labels, 64px hero CTAs, ~40px
  selects; comfortable whitespace; dark-tinted elevation (`--dsd-elevation-*`).

## Asset officiel
- Desjardins wordmark + green hexagon logotype, served as an official SVG from the
  site header:
  `https://www.desjardins.com/content/dam/images/logos/commun/logo-desjardins-fr.svg`
  (English variant: `…/logo-desjardins-en.svg`). **Do not redraw** — reuse the
  official Desjardins logo asset if a logo is needed.
