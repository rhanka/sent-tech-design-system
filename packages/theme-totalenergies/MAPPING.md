# TotalEnergies → Sentropic mapping

This package maps the **public** TotalEnergies brand design (as shipped on the
corporate site [totalenergies.com](https://totalenergies.com/)) onto the
Sentropic token structure (`TenantTheme`). Method = **measured-clone**: every
colour/radius/field value below is read from the live production CSS
(`theme=totalenergies_com`); only public CSS values and font *names* are
referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

## Sources
- TotalEnergies corporate site — https://totalenergies.com/
- Live production stylesheet (measured) — `https://totalenergies.com/sites/g/files/nytnzq121/files/css/...?theme=totalenergies_com` (the site's compiled CSS; `--primary`, `.button--primary`, `.form-control`, `.red-title`, `.cta-button[data-cta-type=red]`, focus rules read directly from it)
- Brand colour references (cross-check) — https://www.brandcolorcode.com/totalenergies , https://logotyp.us/logo/totalenergies/
- Rebrand context (Total → TotalEnergies, 2021) — https://www.grapheine.com/en/logo-news/total-new-faded-logo-becoming-totalenergies

## Colour mapping

| Sentropic role | TotalEnergies source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` | `--primary` / `--blue` / `a{color}` / `.button--primary` bg | `#285AFF` |
| `action.primaryHover` | `.button--primary:hover` background-color | `#0038f4` |
| `focus.color` | `outline:solid #0d59b9 0.2rem` | `#0d59b9` |
| `action.danger` / `feedback.error` / accent (`cyan`) | `.red-title` / `.strong-red` / `.cta-button[data-cta-type=red]` bg / primary focus border | `#E70000` |
| `text.primary` | `body{color}` | `#374649` |
| `text.secondary` / `border.strong` | `--secondary` / `--gray` | `#6c757d` |
| `text.muted` | `--dark` | `#707173` |
| `border.subtle` / field stroke | `.form-control` border | `#ced4da` |
| `surface.subtle` / `action.secondary` | `--light` | `#f8f9fa` |
| `surface.default` / `surface.raised` | `--white` / body bg | `#ffffff` |
| `surface.inverse` | body slate (dark surface) | `#374649` *(à confirmer)* |
| `feedback.success` | `--success` / `--green` | `#73b355` |
| `feedback.warning` | `--orange` | `#db7e04` |
| `feedback.info` | `--info` / `--cyan` | `#17a2b8` |

### À confirmer (derived or no direct brand token)
- `blue.light` `#e3e9ff`, `red.light` `#fbe0e0`, `red.dark` `#b80000` — derived tints for low-emphasis surfaces / hovers.
- `surface.inverse` `#374649` — the site has no single measured dark-surface token; the body slate is used as a dark inverse.
- `feedback.warning` uses the measured `--orange` `#db7e04` rather than the literal `--warning`/`--yellow` `#ffdc00`, which is decorative only (yellow text fails WCAG AA on white). `#ffdc00` is kept as a data-vis hue (`data.category5`).
- `feedback.error` / `action.danger` use the brand red `#E70000` (the dominant brand red) rather than the Bootstrap `--danger` `#dc3545`; both are reds, the brand red is chosen for identity. `#E70000` clears WCAG AA for large text (titles) but is borderline for small body text — matches the brand's own usage.
- The 8-colour categorical `data.*` palette — a coherent proposal from measured brand hues (`#285AFF`, `#E70000`, `#73b355`, `#db7e04`, `#ffdc00`, `#17a2b8`, `#6f42c1`, `#004495`), not an official sequential scale.
- `shadow.*`, `motion.*`, and the sm/lg `density.*` paddings — not strongly tokenised on the site; kept aligned with the Sentropic base / standard size scale.
- `focus.width` `2px` / `offset` `2px` — the measured `outline: solid #0d59b9 0.2rem` is encoded as a concrete blue outline (the `0.2rem` resolves against the site's small root font-size); width/offset are the closest faithful expression.

## Typography
- **Display / titles** (`font.display`): `'Nunito', sans-serif` — measured on `.page-title`, `.title-level-2/3/4`, `.strong-red`.
- **Body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): `'Roboto', sans-serif` — measured on `body`, form controls (button labels use `Roboto Medium`, weight 500).
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — measured `--font-family-monospace`.
- Links: Bleu `#285AFF`, not underlined at rest, underlined on hover (Bootstrap-derived link style).

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#ced4da` border, 4px radius), measured on `.form-control`. Native `<select>` chevron redrawn in brand blue `#285AFF`.
- **Radius**: 4px on controls, inputs and cards (`radius.sm/md/lg = 0.25rem`); pills/tags stay `999px`. Measured `.form-control`/`.btn` `border-radius: 0.25rem`.
- **Focus**: high-contrast **outline** in the focus blue `#0d59b9` (measured `outline: solid #0d59b9 0.2rem`); primary buttons additionally draw a 3px brand-red border.
- **Buttons**: primary = solid blue `#285AFF` → hover `#0038f4` (measured `.button--primary`); secondary = outlined brand red (transparent fill, `#E70000` border, light-red hover) reflecting the prominent `.cta-button[data-cta-type=red]` CTA.
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled brand blue `#285AFF`.
- **Density**: ~38-40px medium controls with `0.75rem` inline padding (measured `.form-control`/`.btn` `padding: 0.375rem 0.75rem`).

## Asset officiel
- TotalEnergies wordmark + multicolour "monde" symbol (red/orange/yellow/green/blue/purple energy spectrum). Use the official SVG/PNG from the brand (e.g. `totalenergies_picto-monde_2025.png` on the corporate site) — **do not redraw the logo by hand**. This package only references font *names* and measured CSS values, never logo artwork or font binaries.
