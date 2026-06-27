# Crédit Agricole → Sentropic mapping

This package maps the **public** Crédit Agricole brand design — the French
"banque verte" — onto the Sentropic token structure (`TenantTheme`). The brand
anchors (CA green, CA teal "Persian Green", CA red, white) are **measured** from
CA's public brand-colour references. Crédit Agricole does not publish a complete
public CSS token tree for greys and semantic roles, nor a confirmed public
webfont name, so the neutral scale, the success/warning/info hues, the
radius/focus metrics and the typeface stack are **derived** (WCAG AA on white)
and listed under "À confirmer". Only public brand values and font *names* are
referenced — no binaries are shipped. **Scope:** this package only — no shared
docs/registration files are touched.

## Sources
- brandcolorcode.com — Crédit Agricole: green `#006f4e` ("Tropical Rain Forest"),
  teal `#009b9d` ("Persian Green"), red `#ed1c24`.
- coloropedia.com — Crédit Agricole (cross-check variation): green `#006c4d`,
  teal `#00969a`.
- Crédit Agricole brand identity — "la banque verte": the green is the core
  brand identity of the group, paired with the teal and the warm red accent.

## Colour mapping

| Sentropic role | CA source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `tabs.activeText` / `focus` / select chevron / accordion + breadcrumb + pagination accents | CA green (official) | `#006f4e` |
| `cyan.*` accent slot / data accent | CA teal "Persian Green" (official) | `#009b9d` |
| `action.danger` / data accent | CA red (official) | `#ed1c24` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.subtle` | derived bg alt (faint green-grey) | `#f4f6f5` |
| card hover | derived | `#eceeed` |
| `border.subtle` | derived | `#dfe3e1` |
| `border.strong` / field underline | derived | `#c0c6c3` |
| `text.muted` | derived | `#6a716e` |
| `text.secondary` | derived | `#3a423f` |
| `text.primary` | derived near-black (dark green-grey) | `#16201b` |
| `surface.inverse` / `slate.90` (darkest) | derived dark CA green | `#04392a` |

### "À confirmer" (derived / no public CA token)
- **Green cross-check variation** — brandcolorcode gives `#006f4e`; coloropedia
  gives `#006c4d`. The package uses `#006f4e`; the variation is noted here.
- `action.primaryHover` `#00553c` — darker interactive green derived from the CA
  green.
- `action.secondary` `#e5f1ec` / `secondaryHover` `#d5e8e0` — light green tints
  derived from the CA green.
- `cyan.*` tints (`#e0f3f3` light teal, `#00727a` darker teal) — derived from the
  CA teal (which fills the Sentropic cyan slot); coloropedia teal cross-check
  `#00969a`.
- Neutral grey scale (`#f4f6f5`, `#eceeed`, `#dfe3e1`, `#c0c6c3`, `#6a716e`,
  `#3a423f`, `#16201b`) — derived; CA publishes no public neutral token tree.
- `feedback.success` `#006f4e` (the brand green doubles as success),
  `feedback.warning` `#b25e00`, `feedback.info` `#00727a` (derived from the CA
  teal) — derived for WCAG AA on white; CA publishes no public semantic tokens.
- `feedback.error` `#cc1019` — derived darker red from the CA red for AA text on
  white (the brand red `#ed1c24` is reserved for `action.danger`, which carries
  white text).
- The 8-colour categorical `data.*` palette (`#006f4e`, `#009b9d`, `#ed1c24`,
  `#b25e00`, `#3a8a5c`, `#6e3aa8`, `#d2569e`, `#3a423f`) — a coherent proposal
  anchored on the CA green/teal/red; not an official sequential scale.
- `radius.*` (3px fields / 6px buttons / 12px cards) — gently-rounded CA brand
  feel, measured visually, not from a published token.
- `focus` (`2px`/`2px` CA-green outline) — outline technique observed on CA web
  properties; exact width/offset à confirmer.
- **Typeface stack** — CA uses a custom corporate sans with no confirmed public
  webfont name, so a neutral humanist sans stack is used (`font.sans`,
  `font.display`, `typography.*`).
- `density.*`, `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`, `accordion.*`,
  `tag.*`, `badge.*`, `choice.*`, `search.*`, `toggle.*` metrics — recoloured with
  measured CA values; exact paddings/sizes follow the base scale.
- `shadow.*`, `motion.*`, spacing — kept aligned with the Sentropic base.

## Typography
- **Display / body / interactive / fields** (`font.sans`, `font.display`,
  `typography.*`): `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
  Roboto, Arial, sans-serif` — a neutral humanist sans stack standing in for CA's
  custom corporate face (no confirmed public webfont name — à confirmer).
- **Monospace** (`font.mono`): the Sentropic mono stack (no CA mono face).
- Only the font **names** are referenced, never binaries.

## Anatomy signatures
- **Primary**: solid CA **green** (`#006f4e`, hover `#00553c`), white text — the
  "banque verte" action family.
- **Accent**: CA **teal** "Persian Green" (`#009b9d`) in the Sentropic cyan slot
  and the data palette; CA **red** (`#ed1c24`) as the danger / warm accent.
- **Fields**: `field.style = "outline"` — boxed white inputs (`#ffffff` fill,
  1px `#c0c6c3` border, ~3px radius), native `<select>` chevron redrawn in CA green.
- **Radius**: APPROACHABLE / gently ROUNDED — fields ~3px, buttons ~6px, cards
  ~12px; pills `999px`.
- **Focus**: high-contrast **CA-green** outline (`2px solid #006f4e`, `2px` offset).
- **Tabs**: active tab = bold CA-green label with a bottom green underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless green links; active page = filled CA green.

## Asset officiel
- Crédit Agricole logo = the **green square** carrying the curved white
  field/leaf motif, with the "CRÉDIT AGRICOLE" wordmark. It is a registered
  trademark — use the official asset, do **not** redraw it by hand.
