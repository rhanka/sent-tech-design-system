# Edenred → Sentropic mapping

This package maps the **public** Edenred brand design onto the Sentropic token
structure (`TenantTheme`). The brand anchors (Edenred Red, white hero colour, a
near-black from the secondary palette) and the brand typography (the proprietary
"Edenred" typeface, officially paired with Google's "Ubuntu") are **measured**
from Edenred's public brand identity. Edenred does not publish a complete public
CSS token tree for greys and semantic roles, so the neutral scale and the
success/warning/info hues are **derived** (WCAG AA on white) and listed under
"À confirmer". Only public brand values and font *names* are referenced — no
binaries are shipped.

## Sources
- Edenred logo / brand colour — https://logotyp.us/logo/edenred/ (Edenred Red
  `#f72717`, the red dot at the heart of the wordmark).
- Edenred brand guidelines — https://brandingstyleguides.com/guide/edenred/
  ("Edenred Red" + the white hero colour, a 14-colour secondary palette including
  a near-black, the proprietary "Edenred" typeface with "Ubuntu" as the companion
  Google font).
- Edenred 2022 identity by the Royalties agency — the refresh that kept the red
  circle / "red dot" signature carried since the 1960s Ticket Restaurant era.

## Colour mapping

| Sentropic role | Edenred source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `text.link` / `action.danger` / `tabs.activeText` / `focus` | Edenred Red (official) | `#f72717` |
| `surface.inverse` | Edenred near-black (secondary palette) | `#1a1614` |
| `surface.default` / `surface.raised` / `field.fillBg` | white hero | `#ffffff` |
| `surface.subtle` | derived bg alt | `#f7f6f5` |
| `border.subtle` | derived | `#e3e0de` |
| `border.strong` / field underline | derived | `#c6c1be` |
| `text.muted` | derived | `#6f6a67` |
| `text.secondary` | derived | `#3c3835` |
| `text.primary` | derived near-black | `#1a1614` |
| `slate.90` (darkest) | derived Edenred near-black | `#1a1614` |

### "À confirmer" (derived / no public Edenred token)
- `action.primaryHover` `#d81f12` — darker interactive red derived from Edenred Red.
- `action.secondary` `#fde7e4` / `secondaryHover` `#fbd6d1` — light red tints
  derived from Edenred Red (`secondaryText` keeps the brand red `#f72717`).
- Neutral grey scale (`#f7f6f5`, `#efedec`, `#e3e0de`, `#c6c1be`, `#6f6a67`,
  `#3c3835`, `#1a1614`) — derived; Edenred publishes no public neutral token tree.
- `feedback.success` `#1f8a4c`, `feedback.warning` `#b25e00`, `feedback.info`
  `#0a6ebd` — derived for WCAG AA on white; Edenred publishes no public semantic tokens.
- `feedback.error` `#cc1810` — derived darker red from Edenred Red for AA text on
  white (the brand red `#f72717` is reserved for `action.primary`/`action.danger`,
  which carry white text).
- `cyan.*` (`#e2f0fb`, `#0a6ebd`, `#075489`) — Edenred has no cyan; a derived blue
  accent fills the Sentropic cyan slot.
- The 8-colour categorical `data.*` palette (`#f72717`, `#0a6ebd`, `#f5a623`,
  `#1f8a4c`, `#7a3a8c`, `#00a3a3`, `#d2569e`, `#3c3835`) — a coherent proposal
  anchored on the Edenred red and the "vibrant" secondary palette; not an official
  sequential scale.
- `radius.*` (4px fields / 8px buttons / 16px cards) — measured visually on Edenred
  web properties (the generous rounding echoes the circular red dot), not from a
  published token.
- `focus` (`2px`/`2px` Edenred-red outline) — outline technique observed on Edenred
  web properties; exact width/offset à confirmer.
- `density.*`, `tabs.*`, `pagination.*`, `breadcrumb.*`, `alert.*`, `accordion.*`,
  `tag.*`, `badge.*`, `choice.*`, `search.*`, `toggle.*` metrics — recoloured with
  measured Edenred values; exact paddings/sizes follow the base scale.
- `shadow.*`, `motion.*`, spacing — kept aligned with the Sentropic base.
- The proprietary **"Edenred"** font name and the **"Ubuntu"** companion are
  referenced as font **NAMES only** — no binaries are shipped or relied upon.

## Typography
- **Display / body / interactive / fields** (`font.sans`, `font.display`,
  `typography.*`): `'Edenred', 'Ubuntu', system-ui, Arial, sans-serif` — Edenred's
  proprietary typeface with Google's "Ubuntu" as the official companion fallback.
- **Monospace** (`font.mono`): the Sentropic mono stack (no Edenred mono face).
- Only the font **names** are referenced, never binaries.

## Anatomy signatures (red dot → rounded)
- **Radius**: ROUNDED / digital-friendly brand echoing the circular red dot —
  fields ~4px, buttons ~8px, cards generously ~16px; pills `999px`.
- **Fields**: `field.style = "outline"` — boxed white inputs (`#ffffff` fill,
  1px `#c6c1be` border, ~4px radius), native `<select>` chevron redrawn in Edenred red.
- **Focus**: high-contrast **Edenred-red** outline (`2px solid #f72717`, `2px` offset).
- **Buttons**: primary = solid Edenred Red (`#f72717`, hover `#d81f12`), white text,
  semibold; secondary = white/ghost with Edenred-red text and a light red hover.
- **Tabs**: active tab = bold Edenred-red label with a bottom red underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`, `activeWeight: "700"`).
- **Pagination**: borderless red links; active page = filled Edenred red.
- **Density**: clean mid-height controls (md ≈ 44px field, lg ≈ 52px CTA).

## Asset officiel
- Edenred logo = the open **red circle / dot** with the "Edenred" wordmark running
  through its middle. It is a registered trademark — use the official asset, do
  **not** redraw the red dot by hand.
