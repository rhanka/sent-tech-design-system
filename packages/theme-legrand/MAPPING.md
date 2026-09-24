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
| `action.primary` / `border.interactive` / `focus.color` | `[data-js-theme=part] --theme-color` | `#d54401` |
| `action.primaryHover` | `.c-button--part --button-hover` | `#1f1f20` |
| `action.primaryText` | `.c-button--part --button-contrasted` | `#ffffff` |
| `text.primary` / `surface.inverse` | body `color: rgb(31 31 32)` | `#1f1f20` |
| `text.secondary` / `border.strong` | caption/label `color: rgb(82 87 92)` / `.c-tag --tag-color` | `#52575c` |
| `text.muted` | `:root --theme-color-light` (default universe) | `#73757b` |
| `border.subtle` / field stroke | `.c-form__field --form-field-border-color` / input `border-color: rgb(226 228 230)` | `#e2e4e6` |
| `surface.subtle` / `action.secondary` | `.c-tag --tag-bg` (`#f0f1f2`: 31 literal-hex declarations, leading `#e2e4e6` at 9 — see note below) | `#f0f1f2` |
| `action.secondaryHover` | derived role assignment from the measured field-stroke grey | `#e2e4e6` *(à confirmer)* |
| `surface.default` / `surface.raised` / `field.fillBg` / `pagination.background` | input `background-color: rgb(255 255 255)` / `.c-pagination__link background-color: rgb(255 255 255)` | `#ffffff` |
| darkest neutral (`slate.90`) | `:root --theme-color: #000` (default universe) | `#000000` |
| `buttonSecondary.hoverBackground` / light orange tint | `[data-js-theme=part] --theme-color-light` (push-variant hover generalised — see derived row) | `#fae8e0` *(à confirmer)* |
| `pagination.activeBackground` | `.c-pagination__link[aria-current] background-color: var(--theme-color-light)` (part universe) | `#fae8e0` |
| `pagination.activeText` | `.c-pagination__link[aria-current] color: var(--theme-color-dark)` (part universe, 4.60:1 on `#fae8e0`) | `#be3c0d` |
| `breadcrumb.linkText` / `action.secondaryText` | derived role assignment from the measured part-universe dark orange | `#be3c0d` *(à confirmer)* |
| `text.link` | derived role transfer: rest state is the body ink (`a{color:inherit}`), orange only on hover (`a:focus-visible,a:hover{color:var(--current-color)}`) | `#d54401` *(à confirmer)* |
| `tabs.activeText` | derived: no tabs component published; generalises the hover current-color | `#d54401` *(à confirmer)* |
| `action.danger` / `feedback.error` | form error `--form-field-text-color: #961e16` | `#961e16` |
| form error border | form error `--form-field-border-color: #f75c53` | `#f75c53` |
| `feedback.success` | derived AA step from the measured `.c-text--success{color:#0e8a37}` | `#0c732e` *(à confirmer)* |
| `feedback.warning` | `.c-text--warning{color:#a76800}` (AA on white) | `#a76800` |
| `feedback.info` / teal accent | `[data-js-theme=pro] --theme-color` | `#00798f` |
| deep teal (`cyan.70`) | `[data-js-theme=pro] --theme-color-dark` | `#006274` |
| light teal tint (`cyan.10`) | `[data-js-theme=pro] --theme-color-light` | `#e3eef0` |
| `surface.overlay` | derived brand-ink backdrop (no modal backdrop published) | `rgb(31 31 32 / 0.6)` *(à confirmer)* |

Counting convention (§2 tie-break): one occurrence = one declaration of the
literal hex (a `--*` custom-property declaration or a property value containing
the hex, case normalised) in `main.css`. Under that convention `#f0f1f2` counts
31 declarations and leads `#e2e4e6` at 9. Counted with the `rgb()` Tailwind
triplets included, the `#e2e4e6` family (9 + 50 `rgb(226 228 230/…)`) would lead
the `#f0f1f2` family (31 + 7 `rgb(240 241 242/…)`) 59 to 38 — hence this note.

## À confirmer (derived or no published brand token)

- **Success green `#0c732e`** — the measured `.c-text--success{color:#0e8a37}` (one occurrence in main.css) reaches only 4.46:1 on white, just under the 4.5:1 text floor; per the deterministic stop rule (H/S kept, L − 0.05) the first passing step is `#0c732e` (5.99:1).
- **`action.secondaryHover` `#e2e4e6`** — role assignment only; the hex itself is the measured field-stroke grey.
- **`action.secondaryText` / `breadcrumb.linkText` `#be3c0d`** — the hex is the measured part-universe dark orange (5.47:1 on white); wiring it to the secondary-text role is the coherent choice, not a published mapping.
- **`text.link` `#d54401`** — role transfer: at rest links sit in the body ink (`a{color:inherit}`); the orange only arrives on hover (`a:focus-visible,a:hover{color:var(--current-color)}`). Generalising the hover colour to the link role is the coherent choice, not a published mapping.
- **`focus.color` `#d54401`** — derived from `currentColor` (`html :focus-visible{outline:4px solid currentColor}`): the orange only holds where the focused element also sets `color:var(--current-color)`; elsewhere the indicator resolves to the body ink. Fields carry their own measured rule (`.c-form__select:focus,…{border-color:var(--current-color);outline:2px solid transparent;outline-offset:2px}`).
- **`surface.overlay` `rgb(31 31 32 / 0.6)`** — no modal backdrop is published in main.css (the only brand overlay is the card description overlay at `rgb(31 31 32 / 0.9)`); a brand-ink tint is the coherent stand-in.
- **Categorical `data.*` palette** (`#d54401`, `#1f1f20`, `#00798f`, `#a76800`, `#961e16`, `#006274`, `#52575c`, `#be3c0d`) — a coherent proposal from the measured brand hues, not an official sequential scale.
- **Select gutter** (`2.5rem`) — no chevron SVG is published in the brand CSS; the chevron colour itself is the measured `.c-form__field --form-icon-text-color:#1f1f20`, the gutter is a coherent stand-in.
- **`radius.lg` (`0.5rem`)**, `shadow.*`, `motion.*`, the sm/lg `density.*` steps, `iconSize.*`, `disabledOpacity`, `transition`, `cursor` — not tokenised publicly; fields are measured square (`.c-form__field --form-field-rounded: 0`, hence `radius.sm/md = 0`) and the `9999px` pill is measured (`.c-button--rounded-full`, `.c-pagination__link`, `.c-checkbox[type=radio]`), the rest is kept aligned with the Sentropic base.
- **Font fallback stacks** — Roboto (body/controls/fields) and Acumin (display) are the measured legrand.fr `@font-face` families (`body,html{…font-family:Roboto,sans-serif…}` for the body; Acumin for headings/titles); the exact fallback chains here are a faithful expression.
- **`typography.control` / `typography.field` weight/size assignment** — the Roboto family is inherited from the body rule; the exact size/weight pairings are coherent assignments, not published specs.
- **Card block** (`borderWidth`, `lineHeight`, `hoverBackground`) — `.c-card` publishes no border-width or hover spec (only a theme-coloured `border-color`); built from measured hexes, not a published component spec.
- **Secondary-button hover** (`#fae8e0`) — the hex is the measured part-universe light tint, but as a secondary-hover it generalises the `.c-button--push` hover (`--button-bg-hover:var(--theme-color-light)`); a `.c-button--bordered.c-button--part` hover instead resolves `--button-bg-hover:#1f1f20`.
- **Tabs block** — legrand.fr publishes no tabs component; the active orange label generalises the hover current-color and the bottom-border indicator mirrors the ink 2px analogue (`.c-product-viewer__thumbnail[aria-current=true]{border-bottom-width:2px;border-color:rgb(31 31 32)}`), which is ink, not orange.
- **Pagination residual geometry** (`border`, `minSize`, `fontSize`, `lineHeight`) — the background (`#ffffff`), active pair (`#fae8e0`/`#be3c0d`), padding (`.625rem`) and pill radius (`9999px`) are measured from `.c-pagination__link[aria-current]` / `.c-pagination__link`; the remaining keys are coherent assignments.
- **Badge block** — legrand.fr publishes no badge component; coherent stand-in built from the brand orange.
- **Tag radius + min-height** (`radius: "0"`, `minHeight`) — `.c-tag` publishes no `border-radius` (verified: no `border-radius` in any `.c-tag` rule) so the squared brand default applies; no min-height is published. Padding (`.375rem`), type (`.625rem/500`, `.75rem` at ≥1024px), line-height (`100%`) and colours are measured.
- **Alert block** — legrand.fr publishes no `.c-alert` / `.c-notice` component (zero match in main.css); coherent stand-in.
- **Accordion block** — legrand.fr publishes no accordion component; `details{--padding:12px}` (measured) corroborates `paddingBlock: "0.75rem"`, the rest is a coherent stand-in.
- **Choice block** — legrand.fr publishes no choice-label spec; coherent stand-in.
- **Search block** — legrand.fr publishes no `.c-search*` rule (zero match in main.css); coherent stand-in.
- **Toggle block** — legrand.fr publishes no toggle spec; coherent stand-in.
- **Breadcrumb block** — legrand.fr publishes no breadcrumb component spec; the `#be3c0d` / `#52575c` / `#1f1f20` hexes are measured elsewhere (see table), the wiring is a coherent assignment.

## Typography

- **Body / controls / fields** (`font.sans`, `typography.control/field`): **'Roboto'** — `body,html{…font-family:Roboto,sans-serif…}` in main.css; `.c-button` (base) and `.c-form__input` declare no `font-family` and inherit it. Inputs are `font-weight: 300`. We reference the font *name* only.
- **Display / headings** (`font.display`): **'Acumin'** — legrand.fr `@font-face` (`AcuminProCond` Light/Regular/Medium woff2); `h1`–`h6`, `.c-title--*`, card/banner titles and `.c-testimonial__body` are `Acumin,sans-serif`.
- **Labels / captions / tags** (`typography.label`): **'Roboto'** — `.c-form__label`, `.c-tag`, `.c-heading__label` are `Roboto, uppercase, letter-spacing .24px` in `#52575c`, `.625rem/500/135%` (`.75rem` at ≥1024px).
- **Monospace** (`font.mono`): system stack.
- Links: body-ink colour at rest (`a{color:inherit}`), **underlined at rest** (`text-decoration-line: underline`, `1px`), taking the current theme color on hover (`a:focus-visible,a:hover{color:var(--current-color)}`).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#e2e4e6` border, **squared** corners, 46px height, measured `.c-form --form-field-height:46px` and `.c-form__field --form-field-rounded:0`). Focus border takes the theme color; error border is `#f75c53` with `#961e16` error text. Native `<select>` chevron redrawn in the measured field icon colour (`.c-form__field --form-icon-text-color:#1f1f20`); the `2.5rem` gutter is à confirmer.
- **Radius**: squared brand — `0` on controls/inputs/tabs (`radius.sm/md = 0`, measured `--form-field-rounded`); `9999px` pills measured on `.c-button--rounded-full`, `.c-pagination__link` and `.c-checkbox[type=radio]` — **not** on `.c-tag`, which publishes no radius (hence `tag.radius = "0"`, à confirmer).
- **Focus**: strong **4px outline** in currentColor (`focus.strategy = "outline"`, measured `html :focus-visible{outline:4px solid currentColor}`, no offset); the `#d54401` color is derived from `currentColor` (à confirmer — it only holds where the focused element sets the theme color).
- **Buttons**: primary = solid brand orange `#d54401` with **white** label (4.51:1, `.c-button--part --button-contrasted`) → hover dark ink `#1f1f20` (`.c-button--part --button-hover`); secondary = **outlined** in the brand orange (transparent fill, `#d54401` border, dark-orange text, light-orange `#fae8e0` hover fill — the hover generalises `.c-button--push`, à confirmer).
- **Tabs / top-nav**: no tabs component published (à confirmer) — active tab = **orange** label `#d54401` (derived from the hover current-color) with a bottom-border indicator mirroring the ink 2px analogue (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: white round links (measured `.c-pagination__link{background-color:rgb(255 255 255);border-radius:9999px;padding:.625rem}`, hover `rgb(240 241 242)`); active page = light-orange fill `#fae8e0` with dark-orange text `#be3c0d` (measured `.c-pagination__link[aria-current]{background-color:var(--theme-color-light);color:var(--theme-color-dark)}`, 4.60:1).

## Asset officiel

- Legrand logo = the "Legrand" wordmark (red brand mark in print; monochrome black-led digital chrome on legrand.fr). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package references only font *names* (Acumin, Roboto) and public colour values, never logo artwork or font binaries.
