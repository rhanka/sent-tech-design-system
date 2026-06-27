# ENGIE → Sentropic mapping

This package maps ENGIE's **public, tokenised** design language — the **Fluid
Design System** ([engie.design](https://engie.design/)) — onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone** from a published
token system: the action colour, typography choice and anatomy signatures are
taken from the Fluid Design System's documented foundations; only public token
values and font *names* are referenced — no font binaries. Values that ENGIE
does not expose as exact published hexes (the full neutral scale, feedback
hues, derived hover/light/dark tints) are flagged `à confirmer`.

## Sources
- ENGIE Fluid Design System — https://engie.design/ (foundations → colours, typography)
- Fluid Design System colours — https://engie.design/fluid-design-system/ (Blue Bolt / Blue 600 action colour)
- Brand colour references (cross-check) — https://www.brandcolorcode.com/engie , https://www.schemecolor.com/engie.php
- ENGIE brand / logo (Blue Logo gradient) — engie.com brand assets

## Colour mapping

| Sentropic role | ENGIE source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | Fluid **"Blue Bolt"** / Blue 600 — primary action | `#007ACD` |
| `action.primaryHover` | derived darker Blue Bolt | `#0061a4` *(à confirmer)* |
| accent (`cyan` slot) | ENGIE **"Blue Logo"** — logotype & brand gradient (logo/gradient only) | `#00AAFF` |
| `surface.default` / `surface.raised` | neutral 0 / surface default | `#ffffff` |
| `surface.subtle` / `action.secondary` | Fluid neutral (light) | `#f3f5f7` *(à confirmer)* |
| `border.subtle` / field stroke | Fluid neutral | `#d4d9e0` *(à confirmer)* |
| `text.secondary` / `border.strong` | Fluid neutral | `#6b7280` *(à confirmer)* |
| `text.muted` | Fluid neutral | `#4b5563` *(à confirmer)* |
| `text.primary` | Fluid neutral (dark slate) | `#1b2733` *(à confirmer)* |
| `surface.inverse` | Fluid neutral (dark slate) | `#1b2733` *(à confirmer)* |
| darkest neutral | Fluid neutral | `#0d1620` *(à confirmer)* |
| `action.danger` / `feedback.error` | Fluid feedback error | `#e6173c` *(à confirmer)* |
| `feedback.success` | Fluid feedback success | `#18ad5a` *(à confirmer)* |
| `feedback.warning` | Fluid feedback warning | `#ff9d00` *(à confirmer)* |
| `feedback.info` | Fluid feedback info = Blue Bolt | `#007ACD` |

> **Blue Bolt vs Blue Logo — important distinction.** ENGIE separates two
> blues: **Blue Bolt `#007ACD`** (Blue 600) is the *interactive* colour of the
> Fluid Design System — buttons, links, focus, active states. **Blue Logo
> `#00AAFF`** is the lighter blue reserved for the **logotype and the brand
> gradient** and must NOT be used for interactive UI. This package wires Blue
> Bolt to every interactive role and parks Blue Logo in the `cyan` accent slot
> (gradient/data-vis only).

### À confirmer (derived or not publicly extracted)
- **Neutral scale** `#f3f5f7 / #d4d9e0 / #6b7280 / #4b5563 / #1b2733 / #0d1620` — ENGIE's Fluid neutrals are not published as exact hexes; this scale is derived to match the Fluid look.
- **Feedback hues** `success #18ad5a`, `warning #ff9d00`, `error #e6173c`, `info #007ACD` — derived to match the Fluid feedback palette (info reuses Blue Bolt).
- **Derived blue tints** `blue.hover #0061a4`, `blue.deep #004c80`, `blue.light #e5f5fc`, `blue.logoLight #e5f7ff`, `blue.logoDark #0088cc` — derived darker/lighter steps for hover, deep and tint surfaces.
- **`surface.inverse` `#1b2733`** — no single published dark-surface token; the dark slate neutral is used as a dark inverse.
- The **8-colour categorical `data.*`** palette (`#007ACD`, `#00AAFF`, `#18ad5a`, `#ff9d00`, `#e6173c`, `#004c80`, `#6b7280`, `#0088cc`) — a coherent proposal from the brand hues, not an official sequential scale.
- `shadow.*`, `motion.*`, and the sm/lg `density.*` paddings — not strongly tokenised publicly; kept aligned with the Sentropic base / standard size scale.
- `focus.width` `2px` / `offset` `2px` — the Fluid focus is a clear Blue Bolt outline; width/offset are the closest faithful expression.

## Typography
- **Display / titles** (`font.display`) and **body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'Lato', sans-serif`** — Lato is the typeface of the Fluid Design System's **digital** interfaces.
- ENGIE's brand typefaces **Clan Pro** and **Right Grotesk** are reserved for **offline** use and are **forbidden in digital**, so they are deliberately NOT used here.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: Blue Bolt `#007ACD`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#d4d9e0` border, 4px radius). Native `<select>` chevron redrawn in Blue Bolt `#007ACD`.
- **Focus**: high-contrast **outline** in Blue Bolt `#007ACD` (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Radius**: 4px on controls / inputs / tabs (`radius.sm/md = 0.25rem`), 8px on cards (`radius.lg = 0.5rem`); pills/tags stay `999px`.
- **Buttons**: primary = solid Blue Bolt `#007ACD` → hover `#0061a4`; secondary = **outlined Blue Bolt** (transparent fill, `#007ACD` border + text, light blue `#e5f5fc` hover fill).
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled Blue Bolt `#007ACD`.

## Asset officiel
- ENGIE logo = the blue **gradient dome** (Blue Logo `#00AAFF` gradient) + the **ENGIE wordmark**. Use the official SVG/PNG from the brand — **do not redraw the logo by hand**. This package only references font *names* (Lato) and published token values, never logo artwork or font binaries.
