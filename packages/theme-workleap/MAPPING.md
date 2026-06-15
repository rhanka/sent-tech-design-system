# Workleap → Sentropic mapping

This package maps **Workleap** (workleap.com — the Montréal employee-experience
SaaS) onto the Sentropic token structure (`TenantTheme`). Every value here is
**measured from the live workleap.com stylesheets** (literal hex values in the
brand CSS). Only the font *name* is referenced (`"Inter"` — a close measured
fallback for Workleap's proprietary highlight face), never font binaries. Values
not measured from a single published source are flagged **"à confirmer"**.

Workleap's identity is a **confident electric-blue-on-cream employee-experience**
system: the signature **Workleap electric blue `#2545FF`** (the most-used brand
accent, ~26 occurrences) drives the primary CTA, links and brand accent; a
measured near-black ink **`#171417`** is the primary ink and headings; a **deep
navy `#0C1754`** carries the reversed dark surface and the secondary-button ink;
an **accent orange `#FF5B22`** is the warm brand counterpoint; surfaces are
**white** on a faint **cream canvas `#F9F8F6`**; form fields are **boxed outlines**
(white fill, thin grey stroke, modern radius); the focus indicator is a 2px
electric-blue **ring**.

## Sources
- Workleap marketing site (measured) — https://www.workleap.com/ and
  https://www.workleap.com/products
- Brand CSS (literal hexes) — workleap.com stylesheet bundle (measured
  `font-family` resolving to the Inter fallback stack).
- Brand colours/logo confirmed externally — https://brandfetch.com/workleap.com
  (Workleap electric blue `#2545FF` + navy/orange brand pair).

## Colour mapping

| Sentropic role | Workleap source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `pagination.text` / `feedback.info` / brand | primary CTA / link / brand accent (~26× brand hex) | `#2545FF` |
| `action.primaryHover` / `data.category5` | darker blue on hover (à confirmer) | `#1a36cc` |
| `surface.inverse` / `action.secondaryText` / `tag.neutralText` / `cyan.70` / `data.category3` | reversed dark surface / secondary-button ink (deep navy) | `#0C1754` |
| `cyan.50` / `data.category2` (accent) | accent orange | `#FF5B22` |
| `text.primary` / `accordion.text` / `choice.labelColor` / heading ink | primary text + headings (measured ink) | `#171417` |
| `text.secondary` / `border.strong` / `slate.80` / `data.category4` | secondary text / strong border (à confirmer) | `#5d6c7b` |
| `text.muted` / `breadcrumb.text` / `data.category6` | muted text | `#758696` |
| `surface.default` / `surface.raised` / `action.primaryText` / `field.fillBg` | surface default / CTA text | `#ffffff` |
| `surface.subtle` / `action.secondary` / card hover | faint cream page canvas (measured) | `#F9F8F6` |
| `action.secondaryHover` / `tag.neutralBackground` | secondary button hover (à confirmer) | `#ececec` |
| `border.subtle` (field/divider stroke) | input border `1px solid` (à confirmer) | `#c8c8c8` |
| `feedback.success` | success feedback (AA on white, à confirmer) | `#1f9d55` |
| `feedback.warning` | warning feedback (AA-grade amber) | `#b26a00` |
| `feedback.error` / `action.danger` | error / danger feedback (à confirmer) | `#d72020` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`action.primaryHover` `#1a36cc`** — the brand sheet exposes the canonical
  electric blue `#2545FF`; the darker hover/active step `#1a36cc` is the closest
  measured deepen but not confirmed as a single published hover token.
- **`blue.100` `#eaeeff`** — a faint blue tint **derived** for soft fills; no
  single published source token.
- **`text.secondary` `#5d6c7b`** — the secondary/strong-border grey-blue is a
  measured-near value; flagged pending a confirmed brand token.
- **`border.subtle` `#c8c8c8`** — the boxed input stroke; measured-near, flagged
  pending a confirmed published field-border token.
- **The Sentropic `cyan` accent family** — Workleap has no separate cyan accent;
  its warm/cool counterpoints are the accent orange and the deep navy, mapped onto
  the `cyan` slot (`#fff0ea` derived tint / `#FF5B22` / `#0C1754`) so a distinct
  accent survives.
- **`feedback.success` `#1f9d55` / `feedback.warning` `#b26a00` /
  `action.danger` `#d72020` / `feedback.info` `#2545FF`** — Workleap does not
  publish a full status palette; AA-safe success-green, amber and danger-red are
  chosen (info reuses the brand electric blue).
- **The 8-colour categorical `data.*` palette** — Workleap publishes no single
  categorical token list; the scale is assembled from measured brand hexes
  (electric blue lead, accent orange, deep navy, secondary ink, deep blue, muted
  grey, success, amber).
- **`shadow.*`, `motion.*`, `spacing.*`** — mapped to a standard 4/8px ramp and
  the three Sentropic elevation/timing slots; exact published steps not separately
  tokenised, kept aligned with the base.
- **`radius.*`** — `sm 4px` / `md 8px` / `lg 12px` / `pill 999px`: measured-near
  modern radii, flagged pending confirmed published radius tokens.
- **Font `"Inter"`** — Workleap ships a proprietary highlight face; `Inter` (with
  a `system-ui` fallback) is the closest measured open fallback. Name only, no
  binaries.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.control/field/label`): **`"Inter"`** with a `system-ui, sans-serif`
  fallback (Workleap uses a proprietary highlight font; Inter is a close measured
  fallback). Base type **16px**.
- **Control labels** are medium-weight (500) at 16px; **field text** is regular
  (400) 16px near-black; **labels** semibold (600).
- **Links** resolve to the **electric blue** accent (`#2545FF`), underline on
  hover (à confirmer).
- **Monospace** (`font.mono`): not part of Workleap; the Sentropic `ui-monospace`
  stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#c8c8c8`, modern **8px** radius), not a filled-underline. Native
  `<select>` chevron redrawn in the deep navy ink `#0C1754` with a ~36px gutter
  (`appearance:none`).
- **Radius**: small chips **4px**, controls/inputs **8px**, cards **12px**, pill
  chips **999px** (all à confirmer — modern radii).
- **Borders**: field/divider strokes **1px solid `#c8c8c8`**; strong borders the
  grey-blue **`#5d6c7b`**; brand accent **`#2545FF`** (electric-blue interactive
  border).
- **Focus**: electric-blue **ring** (`focus.strategy: "ring"`, 2px, `#2545FF` =
  the brand electric blue) — a 2px brand-blue ring.
- **Buttons**: primary = **solid electric-blue, white text** (`#2545FF` fill,
  white text, hover `#1a36cc`); secondary = **faint cream fill, deep-navy ink**
  (`#F9F8F6` fill, `#c8c8c8` stroke, `#ececec` hover).
- **Tabs / sub-nav**: active = bold **electric-blue** label with a **blue bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = **filled electric-blue
  pill**, white text.
- **Tags / badges**: **pill** (`radius: 999px`) — faint-grey-fill tags with navy
  ink; electric-blue filled badges with white text.
- **Density**: 16px base type, Inter control labels, comfortable whitespace, soft
  light-tinted elevation.

## Asset officiel
- Workleap wordmark + brand mark (the electric-blue/navy identity), served as
  official SVG/PNG from the site header and brand resources. Reuse the official
  asset (e.g. via brandfetch.com/workleap.com or the site header logo) if a logo
  is needed. **Do not redraw** — reuse the official Workleap logo asset.
