# Frank And Oak → Sentropic mapping

This package maps **Frank And Oak** (frankandoak.com — the Montréal fashion /
lifestyle house) onto the Sentropic token structure (`TenantTheme`). Frank And Oak
publishes **no** design-token file, so every value here is **measured from the live
site's computed CSS** (inspected in a real browser). Only the font *name* is
referenced (**`CircularStd`**, Frank And Oak's brand geometric sans, with a
Helvetica-family fallback), never a font binary.

Frank And Oak's identity is a **minimal black / grey / white fashion system**:
soft near-black ink text (#292929) on pure white surfaces, mostly **square**
corners (a barely-there 2px rounding on controls, 4px on cards), thin neutral
**hairline** borders (1px #CFCFCF), generous whitespace, and a solid **black CTA**
button. There is essentially **no decorative colour** — the brand "colour" is black.

## Sources
- Frank And Oak storefront (measured) — https://www.frankandoak.com (computed CSS via in-browser inspection)
- Frank And Oak home — https://www.frankandoak.com/

## Colour mapping

| Sentropic role | Frank And Oak source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | black CTA fill / link color | `#000000` |
| `action.primaryHover` / `surface.inverse` | measured CTA hover / dark inverse tone | `#202020` |
| `text.primary` / `tabs.activeText` / `pagination.text` / `breadcrumb.*` | measured body color (soft ink) | `#292929` |
| `text.secondary` / `border.strong` / `breadcrumb.separator` | 74× dominant grey | `#6A6A6A` |
| `text.muted` | measured muted grey | `#7A7A7A` |
| `surface.default` / `surface.raised` / `action.primaryText` | page background `rgb(255,255,255)` | `#ffffff` |
| `surface.subtle` / faint hover / `tag.neutralBackground` | faint alt surface | `#f7f7f7` (à confirmer) |
| `border.subtle` / field border | measured input/select border 1px hairline | `#CFCFCF` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.5)` |

### "À confirmer" (no Frank And Oak source — FOA uses essentially no decorative colour)
- **All feedback / status hues** — Frank And Oak shows no success/warning/error/
  info colour. `feedback.success #2e7d32`, `feedback.error #c0202e`,
  `feedback.warning #b26a00` (dark amber, AA on white), `feedback.info #3a6ea5`
  are restrained near-neutral defaults, **entirely à confirmer**.
- **`action.danger` `#c0202e`** — derived restrained red, no measured equivalent.
- **`action.secondary` `#f2f2f2` / `secondaryHover` `#e6e6e6`** — light neutral
  secondary surfaces, à confirmer (FOA's main alternate is the outlined button).
- **`surface.subtle` `#f7f7f7`** — faint alt surface, à confirmer exact value.
- **The Sentropic `blue` and `cyan` role families** — Frank And Oak has neither a
  brand blue nor an accent. Both are mapped onto the monochrome black/grey scale.
- **`radius`** — fashion-minimal; the brand reads square. `md 2px` / `lg 4px` are
  the subtle measured roundings (à confirmer); `none/sm = 0`; `pill 999px` kept for
  completeness (FOA shows no pills).
- **The 8-colour categorical `data.*` palette** — Frank And Oak publishes no
  data-vis scale; this is a monochrome black→grey ramp plus the restrained system hues.
- **`shadow.*`, `motion.*`, `spacing.*`** — not strongly tokenised on the site;
  black-tinted / aligned with the base.

## Typography
- **Body / UI / fields / display** (`font.sans`, `font.display`,
  `typography.control/field/label`): **`CircularStd`** — Frank And Oak's brand
  geometric sans, with a `'Helvetica Neue', Arial, sans-serif` fallback stack.
  (Font *name* only — no binary shipped.)
- **Monospace** (`font.mono`): not part of Frank And Oak; the Sentropic mono stack kept.
- Control labels are commonly **UPPERCASE** on CTAs; body/field text is sentence case.
- Links are **not** underlined at rest (plain black); the underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, thin 1px
  hairline border `#CFCFCF`, barely-rounded 2px), not a filled-underline. Native
  `<select>` chevron redrawn in pure black with a 40px gutter.
- **Radius**: mostly **square** — `none/sm = 0`, `md = 2px` (controls/inputs/tabs),
  `lg = 4px` (cards). The brand reads square with a near-imperceptible softening.
- **Borders**: thin neutral **hairlines** (1px `#CFCFCF` subtle; `#6A6A6A` strong;
  black accents `#000000`).
- **Focus**: crisp **black outline** (`focus.strategy: "outline"`, 2px, black) —
  Frank And Oak focuses in **black, never a colour**.
- **Buttons**: primary = **solid black fill, white uppercase text** (the "Add to
  Cart" CTA, ~44px tall, hover `#202020`); secondary = outlined (transparent fill,
  black hairline border, faint grey hover). `button.radius` derives from
  `foundation.radius.md` = **2px**.
- **Tabs / sub-nav**: active = bold ink label with a **black bottom underline**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = **filled black square**,
  white text.
- **Density**: small geometric-sans type (13px controls), 44px touch CTAs,
  whitespace-led layout, near-flat elevation (relies on hairlines, not shadow).

## Asset officiel
- Frank And Oak wordmark (the "FRANK AND OAK" / "F" logotype) is served from the
  site header. **Do not redraw** — reuse the official Frank And Oak wordmark asset
  if a logo is needed.
