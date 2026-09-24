# Michelin → Sentropic mapping

This package maps the **public** Michelin corporate design tokens onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**: the
brand blue (`#27509b`, `:root --color-primary`), the deep navy (`#00205b`,
`:root --color-tertiary-01`), the blue tints, the status hues and the font
names are read from the public stylesheets of michelin.com (confirmed
identical on michelin.fr). Only public values and font *names* are
referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured fact: Michelin publishes a real token layer — the corporate
> stylesheet declares its palette as `:root` custom properties
> (`--color-primary`, `--color-tertiary-01/02`, `--color-is-*`) and its two
> typefaces as `--font-family-primary/secondary`. The stylesheet carries no
> third-party blocks (no consent-banner, carousel, CMS or reset namespace
> was found), so every cited declaration below is brand-owned.

## Sources

- Michelin corporate site stylesheet (origin of every measured token) —
  https://www.michelin.com/public/themes/michelin-corporate/theme-michelin-corporate.css
  (`:root --color-primary #27509b`, `--color-tertiary-01 #00205b`,
  `--color-tertiary-02 #582c83`, `--color-primary-lighten-01 #d4e7fa`,
  `--color-primary-lighten-02 #c1d6ef`, `--color-primary-darken-02 #6182bb`,
  `--color-primary-darken-03 #3a61a6`, `--color-main-text #1a1a1a`,
  `--color-is-error #b71c1c`, `--color-is-valid #2e7d32`,
  `--color-is-warning #f9a825`, `--color-is-info #27509b`,
  `--font-family-primary "Noto Sans"`,
  `--font-family-secondary "Michelin Unit Titling"`)
- Michelin France stylesheet (cross-check, identical tokens) —
  https://www.michelin.fr/public/themes/michelin-commercial/theme-michelin-commercial.css
  (`--color-primary #27509b`, `--color-tertiary-01 #00205b`,
  `--color-is-warning #f9a825`, same font families)
- Michelin corporate homepage (links the stylesheet above) —
  https://www.michelin.com/
- Michelin France homepage (links the commercial stylesheet above) —
  https://www.michelin.fr/

Step 0.5 classification: the corporate stylesheet was searched for consent
banners (`#__tealium*`, OneTrust, Didomi), carousels (`.swiper-*`,
`.slick-*`), CMS defaults and library resets — zero matches. All cited
rules live in the brand-owned `.ds__*` namespace or the brand `:root`
token block. No vendor hex is promoted anywhere below.

## Rem root and length conversion

The brand stylesheet declares
`html{box-sizing:border-box;font-size:var(--font-size-root,62.5%);height:100%}`,
so the brand root is **10px**, not 16px. Every brand length below is converted
by dividing by 1.6 for this theme's 16px root:

| Brand declaration | px at brand root | Transcribed value |
|---|---|---|
| `border-radius:.8rem` (`.ds__btn,.ds__btn-icon`, `.ds__input`, `[data-ui-card-base]`; 82 + 4 occurrences) | 8px | `radius.md` / `radius.lg` / `tag.radius` / `badge.radius` = `0.5rem` |
| `border-radius:.4rem` (small elements, breadcrumb focus rings; 16 occurrences) | 4px | `radius.sm` = `0.25rem` |
| `border-width:.1rem` / `.ds__input{border:.1rem solid …}` | 1px | `borderWidth.thin` = `1px` |
| `outline:.2rem …` (focus technique) | 2px | `focus.width` = `2px` |
| `outline-offset:.4rem` (frequency winner, 5 of 9 declarations) | 4px | `focus.offset` = `0.25rem` |
| `.ds__btn,.ds__btn-icon{...min-height:4.8rem}` | 48px | `density.md.controlHeight` = `3rem` |
| `...:where(.ds__btn){min-height:3.6rem;padding:.4rem 1.6rem}` (sm variant) | 36px / 4px / 16px | `density.sm.controlHeight` = `2.25rem`, `paddingBlock` = `0.25rem`, `paddingInline` = `1rem` |
| `.ds__btn-icon{...height:4.8rem;...width:4.8rem}` (icon square) | 48px | consistent with `md.controlHeight` = `3rem` |
| `.ds__btn,...{font-size:1.6rem}` | 16px | `typography.control.size` / `field.size` = `1rem` |
| `...[data-ui-size=sm]{font-size:1.4rem}` / `.ds__label span{...font-size:1.4rem}` | 14px | `density.sm.fontSize` / `typography.label.size` = `0.875rem` |

## Colour mapping

| Sentropic role | Michelin source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` | `:root --color-primary` | `#27509b` |
| `action.primaryHover` | `:root --color-primary-darken-03`, also inline in `.ds__btn[data-ui-skin=primary]…:hover{--button-color-background:#3a61a6}` | `#3a61a6` |
| `surface.inverse` / `action.secondaryText` | `:root --color-tertiary-01` | `#00205b` |
| `cyan.50` / `data.category5` | `:root --color-primary-darken-02` | `#6182bb` |
| `blue.10` | `:root --color-primary-lighten-01` | `#d4e7fa` |
| `buttonSecondary.hoverBackground` | `.ds__btn[data-ui-skin=secondary]:not(…)…:where(a,button):hover{--button-color-background:var(--color-primary);--button-color-text:var(--color-primary-reverse);--button-color-border:var(--color-primary)}` (solid blue fill, white text) | `#27509b` |
| `cyan.10` | `:root --color-primary-lighten-02` | `#c1d6ef` |
| `cyan.70` / `data.category3` | `:root --color-tertiary-02` (role assignment derived) | `#582c83` *(à confirmer)* |
| `data.category4` | `.ds__card-panel[data-ui-skin=secondary]{--card-color-background:#fce500;--card-color-text:#000}` (yellow fill, black text) | `#fce500` |
| `text.primary` | `:root --color-main-text` | `#1a1a1a` |
| `text.secondary` / `data.category8` | `:root --color-dark-60` | `#404040` |
| `text.muted` / `border.strong` | `:root --color-dark-40` (declared `#666`, used here as `#666666`) | `#666666` |
| `focus.color` | dominant site-wide focus declaration `outline:.2rem solid #27509b` (9 occurrences over all form controls, e.g. `.ds__input-wrapper .ds__input:focus-visible{border-color:transparent;font-weight:700;outline:.2rem solid #27509b}`); the grey `outline:.2rem dashed #666` occurs only twice, both scoped to the breadcrumb (`.ds__breadcrumb .ds__btn-icon:focus,…` and `.ds__breadcrumb .ds__list>li .ds__link:focus,…`) — scope is part of the measurement, so the site-wide blue wins (23 `#27509b` vs 2 `#666` `outline:` declarations) | `#27509b` |
| `border.subtle` | `:root --color-light-20` (declared `#ccc`, used here as `#cccccc`; consumed as `[data-ui-card-base]{--card-base-border-color:var(--color-light-20)}`) | `#cccccc` |
| `surface.subtle` / `action.secondary` | `:root --color-light-05` | `#f2f2f2` |
| `action.secondaryHover` | `:root --color-light-10` | `#e5e5e5` |
| `surface.default` / `surface.raised` / `field.fillBg` | `:root --color-main-background` / `--color-light` (declared `#fff`, used here as `#ffffff`) | `#ffffff` |
| `slate.90` (darkest) | `:root --color-dark` (declared `#000`, used here as `#000000`) | `#000000` |
| `shadow.subtle` | brand overlay ink `#1a1a1a` (= `rgb(26 26 26)`) with a derived 0.10 alpha (no alpha published) | `rgb(26 26 26 / 0.10)` *(à confirmer)* |
| `shadow.medium` | brand overlay ink `#1a1a1a` (= `rgb(26 26 26)`) with a derived 0.14 alpha, aligned with the reference theme package's geometry (no alpha published) | `rgb(26 26 26 / 0.14)` *(à confirmer)* |
| `shadow.floating` | brand overlay ink `#1a1a1a` (= `rgb(26 26 26)`) with a derived 0.18 alpha, aligned with the reference theme package's geometry (no alpha published) | `rgb(26 26 26 / 0.18)` *(à confirmer)* |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | white on Michelin blue (contrast choice, 7.76:1) | `#ffffff` |
| `action.danger` / `feedback.error` | `:root --color-is-error` | `#b71c1c` |
| `feedback.success` | `:root --color-is-valid` | `#2e7d32` |
| `feedback.info` | `:root --color-is-info` | `#27509b` |
| `feedback.warning` / `status.pending` | derived AA warning text via the stop rule from `:root --color-is-warning #f9a825` | `#9a6104` *(à confirmer)* |
| `surface.overlay` | derived backdrop from the brand overlay ink `.ds__dropdown-overlay{background-color:#1a1a1a}` / `.ds__sidepanel-overlay{background-color:#1a1a1a}` (no alpha published) | `rgb(26 26 26 / 0.6)` *(à confirmer)* |

Stop-rule chain (warning): the brand warning `#f9a825` is 1.97:1 on white
(fails 4.5:1). HSL of `#f9a825` = H 37.1, S 0.946, L 0.561; L − 0.05 per
step: step 1 `#f89e0c` 2.12:1, step 2 `#e59006` 2.52:1, step 3 `#cc8006`
3.15:1, step 4 `#b37105` 3.98:1, step 5 `#9a6104` 5.14:1 — first pass,
kept. No other text/line role needed the rule: `#27509b` is 7.76:1,
`#1a1a1a` 17.40:1, `#404040` 10.37:1, `#666666` 5.74:1, `#b71c1c` 6.57:1,
`#2e7d32` 5.13:1, `#3a61a6` 6.10:1 on white.

## À confirmer (derived or no published brand token)

- **Warning text `#9a6104`** — stop-rule output (5 steps from `#f9a825`,
  5.14:1); the brand publishes only the vivid `#f9a825`.
- **Modal overlay `rgb(26 26 26 / 0.6)`** — the brand declares the overlay ink
  (`#1a1a1a` on both overlay selectors) but no alpha; the 0.6 alpha is a
  coherent stand-in.
- **Purple accent role `#582c83`** — the hex is a measured brand token
  (`--color-tertiary-02`); parking it in the `cyan` accent slot is derived.
- **Categorical `data.*` palette** (`#27509b`, `#00205b`, `#582c83`,
  `#fce500`, `#6182bb`, `#2e7d32`, `#b71c1c`, `#404040`) — a coherent
  proposal from measured brand hues, not an official sequential scale.
- **Link hover underline** — rest state (`text-decoration:none`) is measured;
  the hover underline is a coherent stand-in.
- **Control geometry that is NOT published** — default-size button padding
  (only the `sm` padding `.4rem 1.6rem` is declared), every `density.*.gap` /
  `minWidth`, the whole `lg` row, and `iconSize` (which reuses the Sentropic
  base values `1rem/1.125rem/1.25rem`): aligned with the reference theme
  package's geometry. What IS published and transcribed: `md.controlHeight`
  `3rem` (`min-height:4.8rem`), corroborated by
  `.ds__select{...font-size:1.6rem;min-height:4.8rem;...}`;
  `sm.controlHeight` `2.25rem` + paddings `0.25rem`/`1rem`
  (`min-height:3.6rem;padding:.4rem 1.6rem`); both font sizes
  (`1.6rem`/`1.4rem`); and the icon square `4.8rem`. Searched: `height`,
  `min-height` and `padding` on the brand's button (`.ds__btn`), icon button
  (`.ds__btn-icon`) and input (`.ds__input`) selectors — quoted above; no
  `.ds__input` rule declares a height or a padding (only a decorative
  `::after` bar carries a `height`).
- **`typography` scalars and the 12 component-override scalars that the brand
  does not publish** (weights, letter-spacing, paddings, font sizes beyond
  `control.size`/`label.size`, line-heights beyond `control.lineHeight`) —
  aligned with the reference theme package's geometry. Measured and
  transcribed: `typography.control.lineHeight` = `1.25`
  (`.ds__btn{...line-height:1.25}`), `typography.label.size` = `0.875rem`
  (`.ds__label span{...font-size:1.4rem}` at the 62.5% root = 14px).
- **`shadow.subtle` / `shadow.medium` / `shadow.floating`
  (`rgb(26 26 26 / 0.10 | 0.14 | 0.18)`), `motion.easing`,
  `disabledOpacity`, `transition`** — the ink (`#1a1a1a`) is the measured
  brand overlay ink; alphas, offsets and blurs are aligned with the reference
  theme package's geometry.
- **Font fallback stacks** — `Noto Sans` and `Michelin Unit Titling` are the
  brand faces (`--font-family-primary/secondary`); the exact fallback chains
  here are a faithful expression.

## Typography

- **Body / controls / fields / labels** (`font.sans`,
  `typography.control/field/label`): **`'Noto Sans'`** — declared by
  `:root{--font-family-primary:"Noto Sans",Arial,sans-serif}` in
  theme-michelin-corporate.css (identical on michelin.fr). We reference the
  font *name* only.
- **Display / titles** (`font.display`): **`'Michelin Unit Titling'`** —
  declared by `:root{--font-family-secondary:"Michelin Unit Titling",
  Helvetica,sans-serif}` and applied per-heading
  (`.ds__heading:where(h1){--heading-font:"Michelin Unit Titling",
  Helvetica,sans-serif}`). We reference the font *name* only.
- **Monospace** (`font.mono`): system stack.
- **Measured sizes**: `typography.control.lineHeight` = `1.25` from
  `.ds__btn,.ds__btn-icon{...line-height:1.25}`; `typography.label.size` =
  `0.875rem` from `.ds__label span{...font-size:1.4rem}` (14px at the 62.5%
  root). All other `typography` scalars are aligned with the reference theme
  package's geometry (à confirmer).
- Links: Michelin blue `#27509b`, not underlined at rest, underlined on hover
  (hover underline à confirmer).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs
  (`.ds__input{background-color:#fff;border:.1rem solid
  var(--form-input-border,#1a1a1a);border-radius:.8rem}`: white fill, full
  border, brand radius). Effective border colour is `#1a1a1a`:
  `--form-input-border` is never declared as its own custom property (it
  appears only as a `var()` fallback), so the `#1a1a1a` fallback wins
  everywhere. Native `<select>` chevron redrawn in Michelin blue
  `#27509b`.
- **Radius**: brand `.8rem` on buttons, inputs and cards
  (`.ds__btn,.ds__btn-icon{border-radius:.8rem}`,
  `[data-ui-card-base]{border-radius:.8rem}`) and `.4rem` on small elements —
  converted from the 62.5% root (8px/4px): `radius.sm = 0.25rem`,
  `radius.md/lg = tag.radius = badge.radius = 0.5rem`; pills stay `999px`.
- **Focus**: brand **outline** technique — `outline:.2rem solid #27509b`
  (`focus.strategy = "outline"`, width `2px`, `color #27509b` at 7.76:1, so
  no threshold departure applies). Offset is measured, not derived:
  `outline-offset` is declared 9 times on `.ds__*` focus rules (`.4rem` 5
  times, `.2rem` twice, `.1rem` once, `0` once) → `focus.offset = 0.25rem`.
- **Buttons**: primary = solid Michelin blue `#27509b` with **white** label
  (7.76:1) → hover `#3a61a6`; secondary = **outlined** in Michelin blue —
  the winning rule sets a transparent fill with **blue** `#27509b` text and
  border, and its hover rule is a **solid blue fill with white text**
  (`hoverBackground #27509b`), not a light tint.
- **Tabs / top-nav**: active tab = bold **Michelin blue** label `#27509b`
  with a bottom blue underline (`indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled Michelin blue
  `#27509b` with white text.
- **Yellow accent**: Michelin yellow `#fce500` appears as the brand secondary
  card skin (yellow fill, black text) and as `data.category4`; it is never
  used for text on white (1.28:1).

## Asset officiel

- Michelin logo = the Bibendum ("Michelin Man") emblem + "MICHELIN"
  wordmark in Michelin blue. Use the official SVG/PNG from the brand
  assets — **do not redraw the logo by hand**. This package references only
  font *names* (Noto Sans, Michelin Unit Titling) and public colour values,
  never logo artwork or font binaries.
