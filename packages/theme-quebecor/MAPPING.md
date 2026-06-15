# Quebecor (quebecor.com) → Sentropic mapping

This package maps the **public** Quebecor corporate site
([quebecor.com](https://www.quebecor.com/)) onto the Sentropic token structure
(`TenantTheme`). Quebecor publishes **no** design-token file, so every value is
**MEASURED from the live site's computed CSS** (inspected in a real browser).
Only the font *names* are referenced — no font binaries.

Quebecor (parent of Vidéotron, TVA and Le Journal de Montréal) is a Montréal
media & telecom group. Its identity is a **corporate steel-blue / navy** system
set in **Montserrat**.

## Sources
- Quebecor corporate site — https://www.quebecor.com/ (computed CSS, measured)
- Brand palette & type — measured from the live site's CSS custom properties and
  computed styles (no public token file exists).

## Colour mapping

| Sentropic role | Source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | measured interactive steel-blue | `#4d7fa7` |
| `action.primaryHover` / `surface.inverse` | measured dark navy band | `#18364d` |
| `action.primaryText` / `text.inverse` | measured white | `#ffffff` |
| accent (Sentropic `cyan`) / `data.category2` | measured light highlight blue | `#64a7dc` |
| `text.primary` | measured charcoal | `#263238` |
| `text.secondary` / `border.strong` | measured secondary ink | `#656e76` |
| `text.muted` | measured muted grey | `#8a929c` |
| `surface.subtle` / `action.secondary` | measured light fill | `#edeef2` |
| `border.subtle` | measured subtle hairline | `#d3d8e0` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `action.danger` / `feedback.error` / `status.failed` | measured error red | `#c0392b` |

### "À confirmer" (no measured Quebecor equivalent)
- `feedback.success` `#2e7d32` (muted green, AA on white) — no Quebecor source.
- `feedback.warning` `#b26a00` (dark amber, AA on white) — no Quebecor source.
- `feedback.info` `#4d7fa7` — the steel-blue reused as "info".
- The 8-colour categorical `data.*` palette — a coherent proposal led by the
  measured brand blues (steel `#4d7fa7` → light `#64a7dc` → navy `#18364d`) then
  greys + system hues; **not** an official scale.
- `shadow.*`, `motion.*`, `spacing.*` exact steps, and the `density.*` heights —
  Quebecor does not strongly tokenise these publicly; kept aligned with the base.

## Typography
- **Sans / display / control / label / field** (`font.sans`, `font.display`):
  `'Montserrat', Helvetica, Arial, sans-serif`. Measured stack on the live site
  is `Montserrat,Gotham,sans-serif`; we keep a portable Montserrat-led fallback
  (Gotham is a paid foundry face, swapped for the standard web fallback).
- **Monospace** (`font.mono`): kept from the Simons template
  (`'SFMono-Regular', Consolas, …`) — Quebecor has no measured mono.
- Links are steel-blue at rest; underline appears on hover.
- CTAs are commonly UPPERCASE-tracked (measured letter-spacing on primary buttons).

## Anatomy signatures
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px cool-grey
  `#d3d8e0` border, 4px radius), native `<select>` chevron redrawn in charcoal.
- **Radius**: corporate-modest — controls `md = 4px`, cards `lg = 8px`; `none`/`sm`
  square; pills stay `999px`.
- **Focus**: 2px steel-blue (`#4d7fa7`) outline with 2px offset (`strategy: "outline"`).
- **Buttons**: primary = solid steel-blue → navy on hover; secondary = soft-grey
  filled chip (`#edeef2` fill, charcoal text, `#d3d8e0` hover).
- **Tabs / sub-nav**: active tab = steel-blue label with a bottom steel-blue
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = filled steel-blue.
- **Breadcrumb**: charcoal links, grey trail, steel-blue current page.
- **Density**: touch-friendly controls (md ≈ 44px height) with generous padding.

## Official asset
- Quebecor wordmark / logo — not bundled; referenced by name only. The brand mark
  is a navy/steel-blue "Quebecor" wordmark (à confirmer exact asset for chrome).
