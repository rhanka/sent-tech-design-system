# Metro → Sentropic mapping

This package maps **Metro** (metro.ca — the **Québec grocery & pharmacy
retailer**) onto the Sentropic token structure (`TenantTheme`). The **brand red,
the ink, the greys, the borders and the department hues are MEASURED from
metro.ca's CSS**; the **radii, the hover red and a few status/feedback hues are
DERIVED** and explicitly flagged `à confirmer` below. Only the font *name* is
referenced (a measured `"Roboto"` family), never a font binary.

Metro's identity is a **clean red-on-white grocery** system: the signature
**Metro red `#D81E05`** (measured 17× in the CSS) drives every primary CTA, link
and brand accent; ink is a **dark grey `#333333`** on **white** surfaces with a
faint grey `#f5f5f5` (measured) page tint; a set of **"department" hues** (green,
yellow, orange, orange-red, magenta, blue) form the categorical data palette.
Form fields are **boxed outlines** (white fill, thin grey `#e3e3e3` stroke);
focus is a **2px red outline** in the brand red `#D81E05`.

## Sources
- Metro storefront (measured) — https://www.metro.ca/
- Brand red, ink, greys, borders and department hues measured from metro.ca's
  stylesheets (the values in the "measured" column below). Metro red `#D81E05`
  appears 17× across the CSS. Font measured as `roboto-regular`.

## Colour mapping

| Sentropic role | Metro source | Value | Provenance |
|---|---|---|---|
| `action.primary` / `action.danger` / `border.interactive` / `text.link` / `tabs.activeText` / `focus.color` / brand | brand red | `#D81E05` | **measured** (17×) |
| `action.primaryHover` | darker red on hover | `#b01804` | à confirmer |
| `feedback.success` / `data.category2` | department green | `#199B6F` | **measured** |
| `data.category4` | department yellow | `#FAB32C` | **measured** |
| `feedback.warning` / `data.category6` | department orange | `#F18E00` | **measured** |
| `data.category7` | department orange-red | `#F24A16` | **measured** |
| `data.category5` | department magenta | `#D74B9D` | **measured** |
| `cyan.50` / `feedback.info` / `data.category3` | department blue | `#3387e6` | measured-ish (à confirmer) |
| `text.primary` / accordion / breadcrumb current | primary ink | `#333333` | **measured** (à confirmer ink) |
| `text.secondary` / breadcrumb trail | secondary text | `#5a5a5a` | **measured** |
| `text.muted` | muted text | `#a0a0a0` | **measured** |
| `surface.inverse` / `action.secondaryText` | dark reversed surface | `#292929` | **measured** (à confirmer) |
| `surface.default` / `surface.raised` / `action.primaryText` | surface default / CTA text | `#ffffff` | **measured** |
| `surface.subtle` / `action.secondary` / card hover / tag fill | faint page grey | `#f5f5f5` | **measured** |
| `border.subtle` (field/divider stroke) | subtle border | `#e3e3e3` | **measured** |
| `border.strong` | strong border | `#737373` | **measured** |
| `feedback.error` | error (brand red) | `#D81E05` | **measured** (brand red) |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` | à confirmer |

### "À confirmer" (derived / no measured source)
- **`action.primaryHover` `#b01804`** — a darker red on hover, **derived** from
  the measured brand red `#D81E05`; no published hover token.
- **`text.primary` `#333333`** — the measured primary ink; the exact CSS variable
  is the dark body text, flagged `à confirmer` per brief (measured ink).
- **`surface.inverse` `#292929`** — the measured dark reversed surface; flagged
  `à confirmer` per brief.
- **`feedback.info` / department blue `#3387e6`** — measured-ish from the
  department styling; `à confirmer`.
- **`red.100` `#fcebe8` / blue tints `#e6f0fc`, `#1f6fd0`** — faint/deep tints
  **derived** for soft fills and the `cyan` accent ramp; no published source token.
- **`radius.*`** — not separately measured: `sm 2px`, `md 4px` (controls — drives
  `button.radius`), `lg 8px` (cards), `none 0`, `pill 999px`. `à confirmer`.
- **`focus` radius / offset** — the 2px red outline color is measured (`#D81E05`);
  the `offset`/`inset` geometry is `à confirmer`.
- **`status.*`** — assembled from the measured department/brand hues (pending =
  orange, processing = blue, completed = green, failed = brand red).
- **`shadow.*`, `motion.*`, `spacing.*`, `density.*`, `disabledOpacity`** —
  standard light-surface ramps kept aligned with the Sentropic base; not
  separately measured. `à confirmer`.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.control/field/label`): **`"Roboto", Arial, Helvetica,
  sans-serif`** — measured (`roboto-regular`), referenced by NAME only, never a
  font binary. Base type **16px**; control/label weight 700.
- **Links** resolve to the **brand red** `#D81E05`, underline on hover
  (`à confirmer`).
- **Monospace** (`font.mono`): not part of Metro; the Sentropic `ui-monospace`
  stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#e3e3e3`, measured), not a filled-underline. Native `<select>` chevron
  redrawn in the dark ink `#333333` with a ~36px gutter (`appearance:none`).
- **Radius** (à confirmer): controls/inputs **4px** (`radius.md`); cards **8px**
  (`radius.lg`); chips **2px** (`radius.sm`); tags/badges **pill** (`999px`).
- **Borders**: field/divider strokes **1px solid `#e3e3e3`** (measured); brand
  accent **`#D81E05`**; strong border = the measured **`#737373`**.
- **Focus**: **red outline** (`focus.strategy: "outline"`, 2px, `#D81E05` = brand
  red) — the brand red drives the focus indicator on this grocery UI.
- **Buttons**: primary = **solid Metro-red, white label** (`#D81E05` fill, white
  text, hover `#b01804` à confirmer); secondary = **grey fill** (`#f5f5f5`,
  `#292929` ink, hover `#e3e3e3`).
- **Tabs / sub-nav**: active = bold **red** label with a **red bottom indicator**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless red links; active page = **filled brand-red pill**,
  white text.
- **Tags / badges**: **pill** (`radius: 999px`) — faint-grey-fill tags with dark
  ink; brand-red filled badges with white text.
- **Data palette**: the measured **department hues** lead — green `#199B6F`,
  yellow `#FAB32C`, orange `#F18E00`, orange-red `#F24A16`, magenta `#D74B9D`,
  blue `#3387e6` — with the brand red `#D81E05` and a secondary ink `#5a5a5a`.
- **Density** (à confirmer): 16px base type, ~44px md control, comfortable
  whitespace, soft light elevation.

## Asset officiel
- Metro wordmark (the red "metro" lettering / the green-leaf brand mark), served
  as official SVG/PNG from the site header and brand resources. Reuse the
  official asset (e.g. the site header logo) if a logo is needed. **Do not
  redraw** — reuse the official Metro logo asset.
