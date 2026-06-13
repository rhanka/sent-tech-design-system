# SSENSE → Sentropic mapping

This package maps **SSENSE** (ssense.com — the Montréal luxury fashion e-commerce
house) onto the Sentropic token structure (`TenantTheme`). SSENSE publishes **no**
design-token file, so every value here is **measured from the live site's computed
CSS** (inspected in a real browser). Only font *names* are referenced
("interFont", "regularFont" — SSENSE's own webfont aliases), never font binaries.

SSENSE's identity is an **ultra-minimal monochrome system**: pure black text on
pure white surfaces, perfectly **square** corners (radius 0), thin **hairline**
borders (0.8px), generous whitespace, and a crisp **black focus outline**. There
is **no decorative colour at all** — the brand "colour" is black.

## Sources
- SSENSE storefront (measured) — https://www.ssense.com/en-us/men (computed CSS via in-browser inspection)
- SSENSE home — https://www.ssense.com/
- Note: the site's third-party cookie-consent widget (c15t) injects its own blue
  CSS custom properties (`--button-primary: #335cff`, etc.). Those are **NOT**
  SSENSE brand tokens and were deliberately excluded from this mapping.

## Colour mapping

| Sentropic role | SSENSE source (measured) | Value |
|---|---|---|
| `text.primary` / `text.link` / `action.primary` / `surface.inverse` / `border.interactive` / `focus.color` | body color `rgb(0,0,0)` (3548 els); black CTA fill | `#000000` |
| `surface.default` / `surface.raised` / `action.primaryText` | html background `rgb(255,255,255)` | `#ffffff` |
| `text.secondary` / `text.muted` / `breadcrumb.separator` | secondary text `rgb(136,136,136)` | `#888888` |
| `border.subtle` / `surface… hairline` | dominant divider `rgb(243,243,243)` @0.8px (20 els) | `#f3f3f3` |
| `border.strong` / field border | input/select border `rgb(182,182,182)` @0.8px | `#b6b6b6` |
| mid hairline | `rgb(204,204,204)` @0.8px | `#cccccc` |
| `tag.neutralBackground` / `action.secondaryHover` | contrast fill `rgb(232,232,232)` | `#e8e8e8` |
| `surface.subtle` / faint hover | faint alt surface `rgb(251,251,251)` | `#fbfbfb` |
| `surface.overlay` | modal backdrop `oklab(0 0 0 / 0.5)` | `rgb(0 0 0 / 0.5)` |

### "À confirmer" (no SSENSE source — SSENSE uses no decorative colour)
- **All feedback / status hues** — SSENSE shows no success/warning/error/info
  colour. `feedback.success #1a7f4b`, `feedback.error #c0202e`, `feedback.warning
  #9a6700` (dark amber, AA on white), `feedback.info #000000` (SSENSE would use
  black, not blue) are restrained near-neutral defaults, **entirely à confirmer**.
- **`action.danger` `#c0202e`** — derived restrained red, no measured equivalent.
- **`action.primaryHover` `#888888`** — SSENSE's black CTA hover affordance is an
  opacity/underline shift, not a hue change; the grey lift is a sensible default.
- **The Sentropic `blue` and `cyan` role families** — SSENSE has neither a brand
  blue nor an accent. Both are mapped onto the monochrome black/grey scale.
- **`radius.pill` `999px`** — SSENSE shows no pills (everything is square); kept
  only because the token must exist.
- **The 8-colour categorical `data.*` palette** — SSENSE publishes no data-vis
  scale; this is a monochrome black→grey ramp plus the restrained system hues.
- **`shadow.*`, `motion.*`, `spacing.*`** — not strongly tokenised on the site;
  black-tinted/aligned with the base (button transition ≈ 150ms was measured).
- **`borderWidth.thin` `1px`** — the real hairline is **0.8px** sub-pixel; encoded
  as 1px (the finest clean token value).

## Typography
- **Body / UI / fields** (`font.sans`, `typography.field`, `typography.control`,
  `typography.label`): **`interFont`** — SSENSE's primary webfont alias, an
  Inter-like neo-grotesque (Helvetica-family fallback). Measured base type is
  famously tiny: **11px / 15px line-height**.
- **Display / accents** (`font.display`): **`regularFont`** — a secondary SSENSE
  webfont alias used on some uppercase labels.
- **Monospace** (`font.mono`): not part of SSENSE; the Sentropic mono stack kept.
- Control labels are frequently **UPPERCASE** (measured `text-transform: uppercase`
  on the bag/checkout CTAs); body/field text is sentence case.
- Links are **not** underlined at rest (plain black); the underline appears on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, thin hairline
  border `#b6b6b6`, **radius 0 / square**), not a filled-underline. Native `<select>`
  chevron redrawn in pure black with a 40px gutter.
- **Radius**: **0 everywhere** (`radius.none/sm/md/lg = 0`) — every measured control,
  card, input and button rendered `border-radius: 0px`. Pure square is the SSENSE
  signature. Only the unused `pill` slot keeps `999px`.
- **Borders**: sub-pixel **hairlines** (0.8px on the live site) — dominant divider
  `#f3f3f3`, field border `#b6b6b6`, black accents `#000000`.
- **Focus**: crisp **black outline** (`focus.strategy: "outline"`, ~2px, black) —
  measured `outline: 2.4px solid rgb(0,0,0)` on anchors; the checkbox uses an inset
  1px black box-shadow. SSENSE focuses in **black, never a colour**.
- **Buttons**: primary = **solid black fill, white uppercase text, square** (the
  famous "Add to Bag" CTA, 44–50px tall); secondary = outlined (transparent fill,
  black hairline border, faint grey hover).
- **Tabs / sub-nav**: active = bold black label with a **black bottom underline**
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless black links; active page = **filled black square**,
  white text.
- **Density**: small grotesque type (13px controls, 11px base), 44px touch CTAs,
  whitespace-heavy layout, near-flat elevation (relies on hairlines, not shadow).

## Asset officiel
- SSENSE wordmark (the all-caps "SSENSE" logotype) is served from the site header
  as an inline SVG / webfont logotype (see `https://www.ssense.com/` header).
  **Do not redraw** — reuse the official SSENSE wordmark asset if a logo is needed.
