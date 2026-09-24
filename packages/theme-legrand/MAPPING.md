# Legrand → Sentropic mapping

This package maps the **public** Legrand brand design onto the Sentropic token
structure (`TenantTheme`). Legrand publishes no tokenised public design system,
so the values below are measured from the brand's official site stylesheets.
Method = **measured-clone**: the brand orange (`#d54401`, the legrand.fr
`[data-js-theme="part"]` `--theme-color`), the dark ink (`#1f1f20`, the body
text `rgb(31 31 32)`), the neutral greys and the focus/field signatures are
read from the public compiled CSS; only public values and font *names* are
referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured fact: the legrand.fr homepage carries `data-js-theme="part"`,
> so the default public theme IS the orange "particuliers" universe
> (`--theme-color: #d54401`, dark `#be3c0d`, light `#fae8e0`, white contrasted
> text). The orange passes WCAG AA both as text on white (4.51:1) and as a
> button fill carrying white text (4.51:1), so unlike Renault Yellow it needs
> no monochrome rerouting — links, lines and fills can all stay orange.

## Sources

- Legrand France site (measured) — https://www.legrand.fr/ (homepage carries `data-js-theme="part"`)
- Legrand France compiled CSS (measured) — https://www.legrand.fr/sites/all/themes/legrand/public/css/main.css (fetched 2026-09-24 with a browser UA + referer; brand orange `[data-js-theme=part] --theme-color: #d54401`, pro teal `[data-js-theme=pro] --theme-color: #00798f`, body `rgb(31 31 32)`, `html :focus-visible{outline:4px solid currentColor}`, Acumin + Roboto `@font-face`)
- Legrand Group corporate site (explored, weak signal) — https://www.legrandgroup.com/ (Drupal theme CSS, no design tokens; display type `Bebas Neue Bold` + `Roboto` body)
- Legrand Group corporate CSS (explored) — https://www.legrandgroup.com/sites/default/files/css/optimized/css_G5Skxjl58UL13Kiz8MNnMlFsge1wVW_K_opInJpL-hc.Isc6xyTSVRq8SKJKb-s6xhl4UNUG9xIrvAU5P5JYUlM.css (no custom brand properties; red `#dc2013` occurrences are social-icon colours, not brand)

## Colour mapping

| Sentropic role | Legrand source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | `[data-js-theme=part] --theme-color` | `#d54401` |
| `action.primaryHover` | `[data-js-theme=part] --button-hover` | `#1f1f20` |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | `[data-js-theme=part] --button-contrasted` | `#ffffff` |
| `action.primaryHover` alt / `text.primary` / `surface.inverse` | body `color: rgb(31 31 32)` / `--button-hover` | `#1f1f20` |
| `text.secondary` / `border.strong` | caption/label `color: rgb(82 87 92)` / `.c-tag --tag-color` | `#52575c` |
| `text.muted` | `:root --theme-color-light` (default universe) | `#73757b` |
| `border.subtle` / field stroke | `.c-form__field --form-field-border-color` / input `border-color: rgb(226 228 230)` | `#e2e4e6` |
| `surface.subtle` / `action.secondary` | `.c-tag --tag-bg` (67 grey occurrences led by this step) | `#f0f1f2` |
| `action.secondaryHover` | derived from the measured border grey | `#e2e4e6` *(à confirmer)* |
| `surface.default` / `surface.raised` / `field.fillBg` | input `background-color: rgb(255 255 255)` | `#ffffff` |
| darkest neutral (`slate.90`) | `:root --theme-color: #000` (default universe) | `#000000` |
| `buttonSecondary.hoverBackground` / light orange tint | `[data-js-theme=part] --theme-color-light` | `#fae8e0` |
| `text.link` deep / `breadcrumb.linkText` / `action.secondaryText` | `[data-js-theme=part] --theme-color-dark` | `#be3c0d` |
| `tabs.activeText` | `a:hover / button:hover color: var(--current-color)` (part universe) | `#d54401` |
| `action.danger` / `feedback.error` | form error `--form-field-text-color: #961e16` | `#961e16` |
| form error border | form error `--form-field-border-color: #f75c53` | `#f75c53` |
| `feedback.success` | derived AA step from the measured `#0e8a37` | `#0c732e` *(à confirmer)* |
| `feedback.warning` | measured warning-adjacent hue (AA on white) | `#a76800` |
| `feedback.info` / teal accent | `[data-js-theme=pro] --theme-color` | `#00798f` |
| deep teal (`cyan.70`) | `[data-js-theme=pro] --theme-color-dark` | `#006274` |
| light teal tint (`cyan.10`) | `[data-js-theme=pro] --theme-color-light` | `#e3eef0` |

## À confirmer (derived or no published brand token)

- **Success green `#0c732e`** — the measured `#0e8a37` (one occurrence in main.css) reaches only 4.46:1 on white, just under the 4.5:1 text floor; per the deterministic stop rule (H/S kept, L − 0.05) the first passing step is `#0c732e` (5.99:1).
- **`action.secondaryHover` `#e2e4e6`** — role assignment only; the hex itself is the measured field-stroke grey.
- **`action.secondaryText` / `breadcrumb.linkText` `#be3c0d`** — the hex is the measured part-universe dark orange (5.47:1 on white); wiring it to the secondary-text role is the coherent choice, not a published mapping.
- **Categorical `data.*` palette** (`#d54401`, `#1f1f20`, `#00798f`, `#a76800`, `#961e16`, `#006274`, `#52575c`, `#be3c0d`) — a coherent proposal from the measured brand hues, not an official sequential scale.
- **Select chevron redraw** (`#1f1f20`, `2.5rem` gutter) — no chevron SVG is published in the brand CSS; the colour reuses the measured brand ink.
- **`radius.lg` (`0.5rem`)**, `shadow.*`, `motion.*`, the sm/lg `density.*` steps, `iconSize.*`, `disabledOpacity`, `transition`, `cursor` — not tokenised publicly; fields are measured square (`--form-field-rounded: 0`, hence `radius.sm/md = 0`) and pills measured (`9999px`), the rest is kept aligned with the Sentropic base.
- **Font fallback stacks** — Acumin and Roboto are the measured legrand.fr `@font-face` families; the exact fallback chains here are a faithful expression.
- **Card hover, secondary-button outline treatment, tab/pagination/badge geometry** — component-level assignments built from measured hexes, not published component specs.

## Typography

- **Body / controls / fields / display** (`font.sans`, `font.display`, `typography.control/field`): **'Acumin'** — legrand.fr `@font-face` (`AcuminProCond` Light/Regular/Medium woff2); `h1` is `Acumin, 2.1875rem, weight 300`; inputs are `font-weight: 300`. We reference the font *name* only.
- **Labels / captions / tags** (`typography.label`): **'Roboto'** — `.c-form__label`, `.c-tag`, `.c-heading__label` are `Roboto, uppercase, letter-spacing .24px` in `#52575c`.
- **Monospace** (`font.mono`): system stack.
- Links: body-ink colour, **underlined at rest** (`text-decoration-line: underline`, `1px`), taking the current theme color on hover.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#e2e4e6` border, **squared** corners, 46px height). Focus border takes the theme color; error border is `#f75c53` with `#961e16` error text. Native `<select>` chevron redrawn in the brand ink `#1f1f20` (à confirmer).
- **Radius**: squared brand — `0` on controls/inputs/tabs (`radius.sm/md = 0`, measured `--form-field-rounded`); pills/tags stay `9999px` (measured).
- **Focus**: strong **4px outline** in the brand orange `#d54401` (`focus.strategy = "outline"`, measured `html :focus-visible{outline:4px solid currentColor}`, no offset).
- **Buttons**: primary = solid brand orange `#d54401` with **white** label (4.51:1, measured `--button-contrasted`) → hover dark ink `#1f1f20` (measured `--button-hover`); secondary = **outlined** in the brand orange (transparent fill, `#d54401` border, dark-orange text, light-orange `#fae8e0` hover fill).
- **Tabs / top-nav**: active tab = **orange** label `#d54401` with a bottom orange underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = filled brand orange `#d54401` with white text.

## Asset officiel

- Legrand logo = the "Legrand" wordmark (red brand mark in print; monochrome black-led digital chrome on legrand.fr). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package references only font *names* (Acumin, Roboto) and public colour values, never logo artwork or font binaries.
