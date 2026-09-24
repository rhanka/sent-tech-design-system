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

## Colour mapping

| Sentropic role | Michelin source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` | `:root --color-primary` | `#27509b` |
| `action.primaryHover` | `:root --color-primary-darken-03`, also inline in `.ds__btn[data-ui-skin=primary]…:hover{--button-color-background:#3a61a6}` | `#3a61a6` |
| `surface.inverse` / `action.secondaryText` | `:root --color-tertiary-01` | `#00205b` |
| `cyan.50` / `data.category5` | `:root --color-primary-darken-02` | `#6182bb` |
| `blue.10` / `buttonSecondary.hoverBackground` | `:root --color-primary-lighten-01` | `#d4e7fa` |
| `cyan.10` | `:root --color-primary-lighten-02` | `#c1d6ef` |
| `cyan.70` / `data.category3` | `:root --color-tertiary-02` (role assignment derived) | `#582c83` *(à confirmer)* |
| `data.category4` | `.ds__card-panel[data-ui-skin=secondary]{--card-color-background:#fce500;--card-color-text:#000}` (yellow fill, black text) | `#fce500` |
| `text.primary` | `:root --color-main-text` | `#1a1a1a` |
| `text.secondary` / `data.category8` | `:root --color-dark-60` | `#404040` |
| `text.muted` / `border.strong` / `focus.color` | `:root --color-dark-40`; focus declared by `.ds__btn-icon:focus,.ds__breadcrumb .ds__btn-icon:focus-visible{…outline:.2rem dashed #666}` | `#666666` |
| `border.subtle` | `:root --color-light-20` (consumed as `[data-ui-card-base]{--card-base-border-color:var(--color-light-20)}`) | `#cccccc` |
| `surface.subtle` / `action.secondary` | `:root --color-light-05` | `#f2f2f2` |
| `action.secondaryHover` | `:root --color-light-10` | `#e5e5e5` |
| `surface.default` / `surface.raised` / `field.fillBg` | `:root --color-main-background` (white) | `#ffffff` |
| `slate.90` (darkest) | `:root --color-dark` (declared `#000`, used here as `#000000`) | `#000000` |
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
- **Focus offset `2px`** — width (2px) and colour (`#666666`, dashed) are
  measured; no offset is published.
- **`shadow.medium` / `shadow.floating`, `motion.easing`, `disabledOpacity`,
  `transition`, and the non-height `density.*` keys** — the brand publishes no
  usable control-height geometry; `controlHeight`/`iconSize` reuse the
  Sentropic base values and the rest is aligned with the reference theme
  package's geometry.
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
- Links: Michelin blue `#27509b`, not underlined at rest, underlined on hover
  (hover underline à confirmer).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs
  (`.ds__input{background-color:#fff;border:.1rem solid
  var(--form-input-border,#1a1a1a);border-radius:.8rem}`: white fill, full
  border, 0.8rem radius). Native `<select>` chevron redrawn in Michelin blue
  `#27509b`.
- **Radius**: measured 0.8rem on buttons, inputs and cards
  (`.ds__btn,.ds__btn-icon{border-radius:.8rem}`,
  `[data-ui-card-base]{border-radius:.8rem}`); 0.4rem on small elements
  (`radius.sm = 0.4rem`, `radius.md/lg = 0.8rem`); pills stay `999px`.
- **Focus**: brand **outline** technique, 2px dashed grey `#666666`
  (`focus.strategy = "outline"`, width `2px`, offset `2px` à confirmer).
- **Buttons**: primary = solid Michelin blue `#27509b` with **white** label
  (7.76:1) → hover `#3a61a6`; secondary = **outlined** in Michelin blue
  (transparent fill per the brand secondary skin, `#27509b` border, navy
  text, light-blue `#d4e7fa` hover fill).
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
