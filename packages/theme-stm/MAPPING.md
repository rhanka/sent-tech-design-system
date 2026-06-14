# STM (Société de transport de Montréal) → Sentropic mapping

This package maps the **public** visual identity of [STM](https://www.stm.info/) — the
Montréal public-transit authority — onto the Sentropic token structure (`TenantTheme`).
Only publicly observable colours from stm.info and font *names* are referenced — no font
binaries. The STM signature blue and the greyscale are **measured** from stm.info's CSS;
fonts, radii and the green / status hues were not sourceable from CSS and are flagged
**à confirmer** (kept as sensible transit-UI defaults).

## Sources
- STM — https://www.stm.info/
- Brand blue + greys: measured from the computed CSS of stm.info (light theme).

## Colour mapping

| Sentropic role | Source | Value | Provenance |
|---|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | STM signature blue | `#009ee0` | **measured** |
| `action.primaryHover` | STM blue darkened | `#0084bd` | à confirmer |
| `text.primary` / `surface.inverse` | STM ink | `#3c3c3c` | **measured** |
| `text.secondary` / `border.strong` | STM grey | `#515151` | **measured** |
| `text.muted` | STM grey | `#888888` | à confirmer |
| `surface.subtle` / `action.secondary` | STM grey alt bg | `#ebebeb` | **measured** |
| `border.subtle` | STM grey | `#cccccc` | **measured** |
| `surface.default` / `surface.raised` / `text.inverse` | white | `#ffffff` | **measured** |
| accent (Sentropic `cyan`) / `feedback.success` | STM transit green | `#008f4c` | à confirmer |
| `action.danger` / `feedback.error` | danger red | `#d0021b` | à confirmer |
| `feedback.warning` | amber | `#f5a623` | à confirmer |
| `feedback.info` | STM blue | `#009ee0` | à confirmer |

### "À confirmer" (not sourced from CSS)
- `action.primaryHover` `#0084bd` — STM blue darkened for hover/active.
- `text.muted` `#888888` — neutral muted grey.
- The STM transit **green** `#008f4c` (bus / accessibility hue used as accent + success),
  and its tints `#e0f0e8` / darker `#006e3a`.
- The status hues: `error #d0021b`, `warning #f5a623`, `info #009ee0` — picked to stay
  WCAG AA on white; not published as STM CSS tokens.
- Derived tints: `blue.light #e0f4fc`, `slate.90 #1f1f1f`.
- **Fonts** — STM's exact webfont was not sourced; the `'Helvetica Neue', Arial, Roboto,
  sans-serif` stack is a clean transit sans (names only). à confirmer.
- **Radii** — not sourced from CSS; mild transit rounding (`sm 2px`, `md 4px`, `lg 8px`,
  `pill 999px`). à confirmer.
- `shadow.*` and `motion.*` — not tokenised by STM publicly; kept aligned with the base.

## Typography
- **Headings / interactive / labels** (`font.display`, `typography.control`,
  `typography.label`): `'Helvetica Neue', Arial, Roboto, sans-serif` (à confirmer).
- **Body / fields** (`font.sans`, `typography.field`): same transit sans.
- **Monospace** (`font.mono`): `ui-monospace, …, monospace`.
- Links are STM-blue; underline appears on hover (transit-site convention).

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px `#cccccc` border,
  mild radius), not a filled-underline. Native `<select>` chevron redrawn in STM blue.
- **Radius** (à confirmer): `sm 2px`, `md 4px` (controls/inputs/tabs), `lg 8px` (cards),
  `pill 999px`.
- **Focus**: a 2px outline in the STM blue `#009ee0` (à confirmer).
- **Buttons**: primary = solid STM blue (`#009ee0`, white text); secondary = light-grey
  filled (`#ebebeb`), darker grey (`#cccccc`) on hover.
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled STM blue.
- **Density**: touch-friendly transit controls (md ≈ 44px height) with generous padding
  (à confirmer).

## Asset officiel
- STM logo / wordmark: use the official STM asset from stm.info — do not redraw by hand.
