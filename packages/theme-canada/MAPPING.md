# Government of Canada (GCDS) → Sentropic mapping

This package maps the **public** [GC Design System](https://design-system.canada.ca/) (GCDS)
onto the Sentropic token structure (`TenantTheme`). Only public design tokens (`--gcds-*`) and
font *names* are referenced — no font binaries.

## Sources
- GC Design System — https://design-system.canada.ca/
- Colour tokens — https://design-system.canada.ca/en/styles/colour/
- Typography — https://design-system.canada.ca/en/styles/typography/

## Colour mapping

| Sentropic role | GCDS token | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` | `--gcds-color-blue-700` / `--gcds-link-default` | `#1f497a` |
| `action.primaryHover` / `surface.inverse` | `--gcds-color-blue-muted` / `--gcds-bg-primary` | `#26374a` |
| `focus.color` | `--gcds-link-hover` | `#1354ec` |
| `text.primary` | `--gcds-text-primary` | `#333333` |
| `text.secondary` | `--gcds-text-secondary` | `#595959` |
| `text.muted` / `border.strong` | `--gcds-border-default` | `#8c8c8c` |
| `surface.subtle` / `action.secondary` | `--gcds-bg-light` | `#f2f2f2` |
| `surface.default` / `surface.raised` | `--gcds-bg-white` | `#ffffff` |
| `action.danger` / `feedback.error` | `--gcds-danger` | `#b3192e` |
| `feedback.success` | `--gcds-color-green-700` | `#1f7a40` |
| accent (Sentropic `cyan`) | GC red family | `#b3192e` |

### "À confirmer" (no direct GCDS token)
- `border.subtle` `#e0e0e0`, `blue.light` `#e1e8f0`, `red.light/dark` — derived tints.
- `feedback.warning` `#b35900` (GC amber darkened for WCAG AA on white) and `feedback.info` `#1f497a`.
- The 8-colour categorical `data.*` palette — a coherent proposal from GC brand hues, not an official scale.
- `shadow.*` and `motion.*` — GCDS does not strongly tokenise these publicly; kept aligned with the base.

## Typography
- **Headings / interactive** (`font.display`, `typography.control`, `typography.label`): `'Lato', sans-serif`.
- **Body / fields** (`font.sans`, `typography.field`): `'Noto Sans', sans-serif`.
- **Monospace** (`font.mono`): `'Noto Sans Mono', monospace`.
- Links underlined; underline thickens on hover (GCDS link style).

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px grey border, 4px radius), not a filled-underline.
- **Radius**: 4px on controls and cards (`radius.sm/md/lg = 0.25rem`); pills stay `999px`.
- **Focus**: thick high-contrast outline (`3px`) in the GC focus blue `#1354ec`.
- **Buttons**: primary = solid federal blue; secondary = outlined blue (transparent fill, light-blue hover).
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled federal blue.
- **Density**: GC touch-friendly controls (md ≈ 44px height) with generous horizontal padding.
