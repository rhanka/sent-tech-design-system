# Société Générale → Sentropic mapping

This package maps the **public** Société Générale brand design onto the
Sentropic token structure (`TenantTheme`). The brand anchors — official "Rouge
SG" (`#e9041e`) and SG black (`#000000`), the squared red-over-black mark of the
2023 "SG" rebrand — are **measured** from SG's public brand identity. SG does
not publish a complete public CSS token tree for greys and semantic roles, nor a
confirmed public webfont name, so the neutral scale, the success/warning/info
hues, the blue accent and the typographic stack are **derived** (WCAG AA on
white where relevant) and listed under "À confirmer". Only public brand values
and font *names* are referenced — no binaries are shipped. Scope: this package
only — no shared/docs files are touched.

## Sources
- Brand colour code — https://www.brandcolorcode.com/societe-generale
  (Société Générale Torch Red `#e9041e`).
- Coloropedia — https://coloropedia.com/societe-generale-colors-logo-codes/
  (Rouge SG red `#e9041e`, black `#000000`, white `#ffffff`).
- Société Générale corporate brand identity —
  https://www.societegenerale.com/ (brand-identity / press pages describing the
  2023 "SG" rebrand: a SQUARED mark split into an upper red half and a lower
  black half, divided by a thin white bar). The red + black square is the
  registered identity.
- Note: SG publishes no public CSS design-token tree and no confirmed public
  webfont name; the wordmark is a custom grotesque ("Media Gothic"). All
  derived values below are cross-checked for contrast on white.

## Colour mapping

| Sentropic role | Société Générale source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `action.danger` / `tabs.activeText` / `focus` / select chevron | Rouge SG (official) | `#e9041e` |
| `text.primary` / `surface.inverse` | SG black (official) | `#000000` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.overlay` | SG black @ 60% | `rgb(0 0 0 / 0.6)` |
| `surface.subtle` / `action.secondary` | derived bg alt | `#f5f5f5` |
| card hover / `action.secondaryHover` | derived | `#ededed` |
| `border.subtle` | derived | `#e0e0e0` |
| `border.strong` / field underline | derived | `#c2c2c2` |
| `text.muted` | derived | `#6e6e6e` |
| `text.secondary` | derived | `#3a3a3a` |
| `action.primaryHover` | derived darker red | `#c20318` |
| `action.secondaryText` | SG black | `#000000` |

### "À confirmer" (derived / no public SG token)
- `action.primaryHover` `#c20318` — darker interactive red derived from Rouge SG
  for a visible hover state.
- `action.secondary` `#f5f5f5` / `secondaryHover` `#ededed` / `secondaryText`
  `#000000` — a light-grey ghost secondary button (SG has no published secondary
  fill token).
- Neutral grey scale (`#f5f5f5`, `#ededed`, `#e0e0e0`, `#c2c2c2`, `#6e6e6e`,
  `#3a3a3a`) — derived; SG publishes no public neutral token tree.
- `feedback.success` `#1f7a3d`, `feedback.warning` `#b25e00`, `feedback.info`
  `#1264a3` — derived for WCAG AA on white; SG publishes no public semantic
  tokens.
- `feedback.error` `#cc0a1e` — derived darker SG red for AA text on white (the
  brand red `#e9041e` is reserved for `action.danger`, which carries white text).
- `cyan.*` (`#e3eef7`, `#1264a3`, `#0d4c7d`) — SG has no cyan; a derived blue
  accent fills the Sentropic cyan slot.
- The 8-colour categorical `data.*` palette — a coherent proposal anchored on SG
  red/black; not an official sequential scale.
- `radius.*` (0px fields / 0px buttons / 2px cards) — the SQUARED SG identity
  read into sharp radii; not from a published token.
- `focus` (`2px`/`2px` SG-red outline) — outline technique assumed; exact
  width/offset à confirmer.
- `density.*`, `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`,
  `accordion.*`, `tag.*`, `badge.*`, `choice.*`, `search.*`, `toggle.*` metrics —
  recoloured with measured SG values; exact paddings/sizes follow the base scale.
- `shadow.*`, `motion.*`, spacing — kept aligned with the Sentropic base.
- Fonts (`font.sans`, `font.display`, `typography.*`) — neutral grotesque stack;
  SG's custom "Media Gothic" has no confirmed public webfont name (see Typography).

## Typography
- **Display / body / interactive / fields** (`font.sans`, `font.display`,
  `typography.*`): `'Helvetica Neue', Helvetica, Arial, system-ui, -apple-system,
  'Segoe UI', sans-serif` — a neutral grotesque stack standing in for SG's custom
  grotesque wordmark ("Media Gothic"). No public SG webfont name is confirmed, so
  this stack is **à confirmer**.
- **Monospace** (`font.mono`): the Sentropic mono stack (no SG mono face).
- Only the font **names** are referenced, never binaries.

## Anatomy signatures
- **SQUARED radius** — the SG fidelity signature: fields and buttons are fully
  square (`radius.sm`/`radius.md` = `0`), cards barely softened (`radius.lg` =
  `2px`), tags/badges square. This sharpness is what distinguishes SG from
  rounded banks and echoes the red-over-black SQUARE mark. (à confirmer)
- **Red + black** — Rouge SG `#e9041e` drives every interactive accent
  (action.primary, links, tabs, pagination, focus, danger, the select chevron);
  SG black `#000000` carries primary text and the inverse surface.
- **Fields**: `field.style = "outline"` — boxed white inputs (`#ffffff` fill,
  1px `#c2c2c2` border, **0px** radius), native `<select>` chevron redrawn in SG
  red.
- **Focus**: high-contrast **SG-red** outline (`2px solid #e9041e`, `2px`
  offset).
- **Buttons**: primary = solid Rouge SG (`#e9041e`, hover `#c20318`), white
  text, semibold, square; secondary = light-grey ghost (grey stroke, black
  label, `#ededed` hover).
- **Tabs**: active tab = bold SG-red label with a bottom red underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`, `activeWeight: 700`).
- **Pagination**: borderless red links; active page = filled SG red.
- **Density**: clean mid-height controls (md ≈ 44px field, lg ≈ 52px CTA).

## Asset officiel
- The Société Générale logo is the 2023 "SG" mark — a SQUARE divided by a thin
  white bar into an upper **red** (`#e9041e`) half and a lower **black**
  (`#000000`) half. It is a registered trademark — use the official asset, do
  **not** redraw it by hand.
