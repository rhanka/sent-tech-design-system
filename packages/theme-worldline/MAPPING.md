# Worldline → Sentropic mapping

This package maps the **public** Worldline brand design onto the Sentropic token
structure (`TenantTheme`). Worldline is a European payments / fintech group; its
public identity is anchored on a single deep institutional **Worldline Blue
`#0066a1`** on white, with a documented **light grey `#e6e6e6`**. Only those two
values are publicly documented — Worldline does **not** publish a complete public
CSS token tree, and it has **no public brand red**. The neutral scale, every
semantic hue (including the derived danger red), the corporate font stack, the
radii and the focus metrics are therefore **derived** (WCAG AA on white where
relevant) and listed under "À confirmer". Only public brand values and font
*names* are referenced — no binaries are shipped.

## Sources
- Worldline brand colours — https://worldline.com/ (Worldline Blue `#0066a1`,
  light grey `#e6e6e6`). Corporate site is JS-rendered; values cross-checked
  against the brand-colour references below.
- Worldline brand-colour references (cross-check):
  - https://pickcoloronline.com/brands/worldline (Worldline Blue `#0066a1`)
  - https://htmlcolors.com/brand-color/worldline (`#0066a1`, light grey `#e6e6e6`)
  - https://seekcolors.com/ (Worldline → Worldline Blue `#0066a1`)
- Worldline corporate typeface — custom corporate sans with **no confirmed public
  webfont name**; a neutral system-ui sans stack is substituted (à confirmer).

## Colour mapping

| Sentropic role | Worldline source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `tabs.activeText` / `focus` / `feedback.info` | Worldline Blue (official) | `#0066a1` |
| `surface.inverse` / `slate.90` (darkest) | derived dark Worldline blue | `#003a5c` |
| `action.danger` / `feedback.error` | derived danger red (no brand red) | `#cc1a2b` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.subtle` | derived bg alt | `#f4f7f9` |
| `border.subtle` | **official Worldline light grey** | `#e6e6e6` |
| `border.strong` / field underline | derived | `#c2c8cd` |
| `text.muted` | derived | `#5f6b73` |
| `text.secondary` | derived | `#2f3a42` |
| `text.primary` | derived dark navy | `#0c2233` |

### "À confirmer" (derived / no public Worldline token)
- `action.primaryHover` `#00517f` — darker interactive blue derived from
  Worldline Blue.
- `action.secondary` `#e5eff5` / `secondaryHover` `#d4e6f0` — light blue tints
  derived from Worldline Blue (`secondaryText` reuses the brand blue `#0066a1`).
- Neutral grey scale (`#f4f7f9`, `#ececec`, `#c2c8cd`, `#5f6b73`, `#2f3a42`,
  `#0c2233`) — derived; only the `#e6e6e6` `border.subtle` step is the OFFICIAL
  Worldline light grey, the rest are derived (Worldline publishes no public
  neutral token tree).
- **`action.danger` / `feedback.error` `#cc1a2b`** — Worldline has **no public
  brand red**; this danger / error red is fully derived for WCAG AA text on white.
- `feedback.success` `#1f7a3d`, `feedback.warning` `#b25e00` — derived for WCAG
  AA on white; Worldline publishes no public semantic tokens.
- `feedback.info` `#0066a1` — reuses the brand blue (informational state).
- `cyan.*` (`#e3f3fb`, `#1f9bd1`, `#0a6e96`) — Worldline has no second brand hue;
  a brighter derived blue fills the Sentropic cyan slot.
- The 8-colour categorical `data.*` palette (`#0066a1`, `#1f9bd1`, `#00a3a3`,
  `#f5a623`, `#1f7a3d`, `#7a3a8c`, `#d2569e`, `#2f3a42`) — a coherent proposal
  anchored on the Worldline blue; not an official sequential scale.
- `radius.*` (3px fields / 6px buttons / 12px cards) — measured visually on
  Worldline web properties, not from a published token.
- `focus` (`2px`/`2px` Worldline-blue outline) — outline technique observed on
  Worldline web properties; exact width/offset à confirmer.
- `density.*`, `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`, `accordion.*`,
  `tag.*`, `badge.*`, `choice.*`, `search.*`, `toggle.*` metrics — recoloured with
  measured Worldline values; exact paddings/sizes follow the base scale.
- `font.*` / `typography.*` families — Worldline's corporate font name is not
  public; a neutral `system-ui` sans stack is substituted (à confirmer).
- `shadow.*`, `motion.*`, spacing — kept aligned with the Sentropic base.

## Typography
- **Display / body / interactive / fields** (`font.sans`, `font.display`,
  `typography.*`): `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
  Roboto, Arial, sans-serif` — a neutral substitute, since Worldline's custom
  corporate sans has no confirmed public webfont name (à confirmer).
- **Monospace** (`font.mono`): the Sentropic mono stack (no Worldline mono face).
- Only the font **names** are referenced, never binaries.

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed white inputs (`#ffffff` fill,
  1px `#c2c8cd` border, ~3px radius), native `<select>` chevron redrawn in
  Worldline blue (`#0066a1`).
- **Radius**: CLEAN fintech, MODERATE rounding — fields ~3px, buttons ~6px,
  cards ~12px; pills `999px`.
- **Focus**: high-contrast **Worldline-blue** outline (`2px solid #0066a1`,
  `2px` offset).
- **Buttons**: primary = solid Worldline Blue (`#0066a1`, hover `#00517f`),
  white text, semibold; secondary = white/ghost with Worldline-blue text and a
  light blue hover.
- **Tabs**: active tab = bold Worldline-blue label with a bottom blue underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled Worldline blue.
- **Density**: clean mid-height controls (md ≈ 44px field, lg ≈ 52px CTA).

## Asset officiel
- Worldline logo = the official "Worldline" wordmark / logo in Worldline Blue.
  It is a registered trademark — use the official asset, do **not** redraw it by
  hand.
