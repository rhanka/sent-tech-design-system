# Genetec → Sentropic mapping

This package maps **Genetec** (genetec.com — the Montréal physical-security,
video-surveillance & unified-security software vendor) onto the Sentropic token
structure (`TenantTheme`). Every value here is **measured from the live
genetec.com front-end**. The site is a React/Material-UI single-page app whose
brand palette ships as a **named token object** inside the Genetec "global
elements" web-component bundle and as the **MUI theme palette** in the app
bundle. Only the font *names* are referenced (`"Circular"` — the lineto Circular
webfont served as the body + UI face; `"Garamond Premier Pro"` — the secondary
serif display face), never font binaries. Values not measured from a single
published source are flagged **"à confirmer"**.

Genetec's identity is a **confident charcoal-and-cyan enterprise-security**
system: a deep **charcoal `#22282f`** (`charcol1`) is the primary ink, brand mark
and dark surfaces; the signature **electric cyan `#00aeef`** (`blue1` / MUI
`secondary.main`) is the accent / link / focus / interactive hue; surfaces are
**white** on a faint **eggshell `#f0f0f0`**; form fields are **boxed outlines**
(white fill, thin grey `#c2c8cf` stroke) with a **4px** control radius (the
dominant `borderRadius:"4px"` in the MUI theme).

## Sources
- Genetec marketing site (measured) — https://www.genetec.com/ (React/MUI SPA;
  the served HTML is a shell, the design tokens live in the JS bundles).
- **Named brand palette object** (measured, literal hexes) —
  `https://www.genetec.com/webfiles/latest/lib/gntc-global-elements.bundle.js`:
  `{ charcol1:"#22282f", charcol2:"#363c43", charcol3:"#0e141b",
  charcol4:"#2c3239", charcol5:"#181e25", charcol6:"#262B31",
  eggshell:"#f0f0f0", blue1:"#00aeef", blue2:"#3dc1f3", blue3:"#007fbc",
  white:"#ffffff", black:"#000000", lightGrey:"#C2C8CF",
  mediumBorder:"#3E464F", border:"#898C8F" }`.
- **MUI theme palette** (measured) —
  `https://www.genetec.com/webfiles/latest/build/static/js/main.431b90b2.js`:
  `primary { main:#22282f, light:#363c43, dark:#0e141b, contrastText:#f0f0f0 }`,
  `secondary { main:#00aeef, light:#3dc1f3, lighter:#66e0ff, dark:#007fbc,
  contrastText:#22282f }`, base `fontSize:18`, dominant `borderRadius:"4px"`.
- **Font @font-face** (measured) —
  `https://www.genetec.com/webfiles/latest/build/static/css/font-primary.min.css`
  (`@font-face { font-family: Circular; src: lineto-circular-book/medium/bold.woff }`)
  and `font-secondary.min.css` (`@font-face { font-family: 'Garamond Premier Pro' }`),
  used via `font-family: Circular, helvetica, arial, sans-serif`.

## Colour mapping

| Sentropic role | Genetec source (measured) | Value |
|---|---|---|
| `action.primary` / `text.primary` / `surface.inverse` / `slate.90` / `blue.60` / `accordion.text` / `choice.labelColor` / brand ink | `charcol1` / MUI `primary.main` | `#22282f` |
| `action.primaryHover` / `blue.80` | `charcol3` / MUI `primary.dark` (darkest charcoal) | `#0e141b` |
| `text.secondary` / `slate.80` / `data.category5` | `charcol2` / MUI `primary.light` | `#363c43` |
| `border.strong` | `mediumBorder` | `#3e464f` |
| `text.link` / `border.interactive` / `tabs.activeText` / `pagination.text` / `breadcrumb.linkText` / `focus.color` / `cyan.50` / `data.category1` / `feedback.info` / accent | `blue1` / MUI `secondary.main` | `#00aeef` |
| `cyan.70` / `data.category2` | `blue3` / MUI `secondary.dark` (deep cyan) | `#007fbc` |
| `data.category7` | `blue2` / MUI `secondary.light` (cyan light) | `#3dc1f3` |
| `action.primaryText` / `text.inverse` / `surface.subtle` / `action.secondary` / `slate.10` / `blue.10` / card hover / `tag.neutralBackground` / `pagination.activeText` | `eggshell` / MUI `*.contrastText` | `#f0f0f0` |
| `border.subtle` (field/divider stroke) / `slate.20` | `lightGrey` | `#c2c8cf` |
| `text.muted` / `breadcrumb.text` / `slate.60` / `data.category6` / default border | `border` | `#898c8f` |
| `surface.default` / `surface.raised` / `field.fillBg` / `slate.0` | `white` | `#ffffff` |
| `feedback.success` / `status.completed` / `data.category4` | brand green (measured in nav bundle) | `#15d08d` |
| `feedback.warning` / `status.pending` / `data.category8` | warning feedback (AA-grade amber, à confirmer) | `#b26a00` |
| `feedback.error` / `action.danger` / `status.failed` | error feedback (à confirmer) | `#d32f2f` |
| `surface.overlay` | modal backdrop | `rgb(0 0 0 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`cyan.10` `#e5f7fe`** — a faint cyan tint **derived** for soft panel fills;
  no single published source token.
- **`action.secondaryHover` `#e2e5e9`** — the darker eggshell hover step; a
  measured-near deepen of `eggshell`, not a confirmed published hover token.
- **`feedback.warning` `#b26a00`** — Genetec does not publish a status amber; an
  AA-grade amber is chosen over the brand hues.
- **`feedback.error` / `action.danger` `#d32f2f`** — Genetec's app inherits the
  MUI default error red (`#d32f2f` / `#f44336` appear as MUI palette defaults, not
  brand-overridden); the AA-strong `#d32f2f` is used pending a confirmed brand
  error token.
- **The 8-colour categorical `data.*` palette** — Genetec publishes no single
  categorical token list; the scale is assembled from measured brand hexes (cyan
  lead, deep cyan, charcoal family, brand green, amber, greys).
- **`shadow.*`, `motion.*`, `spacing.*`** — mapped to a standard 4/8px ramp and
  the three Sentropic elevation/timing slots; exact published steps not separately
  tokenised, kept aligned with the base.
- **`radius.*`** — `md 4px` is the **measured** dominant MUI control radius; `sm
  2px` / `lg 8px` / `pill 999px` are measured-near brackets, flagged pending
  confirmed published radius tokens.
- **`disabledOpacity` `0.38`** — measured from the MUI `text.disabled`/`hint`
  alpha (`rgba(0,0,0,0.38)`); applied as the control disabled opacity.

## Typography
- **Body / UI / fields / headings** (`font.sans`, `font.display`,
  `typography.control/field/label`): **`"Circular"`** — the lineto Circular
  webfont served as Genetec's body + UI face (measured `@font-face { font-family:
  Circular }` + `font-family: Circular, helvetica, arial, sans-serif`), with the
  brand's own `helvetica, arial, sans-serif` fallback. Base type **18px**
  (measured MUI `fontSize:18`).
- **Secondary display face**: **`"Garamond Premier Pro"`** — a serif served via
  `font-secondary.min.css` (measured `@font-face { font-family: 'Garamond Premier
  Pro' }`). Not wired into a Sentropic `font.*` slot (the structure exposes
  `sans`/`display`/`mono`), but documented here as the brand's editorial serif; à
  confirmer for which surfaces it is applied.
- **Control labels** are medium-weight (500) Circular; **field text** is regular
  (400) Circular charcoal; **labels** semibold (600).
- **Links** resolve to the **electric cyan** accent (`#00aeef`), underline on
  hover (à confirmer).
- **Monospace** (`font.mono`): not part of Genetec; the Sentropic `ui-monospace`
  stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#c2c8cf`), not a filled-underline. Native `<select>` chevron redrawn in
  the charcoal ink `#22282f` with a ~36px gutter (`appearance:none`).
- **Radius**: small chips **2px**, controls/inputs **4px** (measured MUI
  `borderRadius:"4px"`), cards **8px**, pill chips **999px**.
- **Borders**: field/divider strokes **1px solid `#c2c8cf`**; strong borders the
  dark **`#3e464f`** (mediumBorder); brand accent **`#00aeef`** (cyan interactive
  border — measured `1px solid #00aeef` hover).
- **Focus**: **cyan outline** (`focus.strategy: "outline"`, 2px, `#00aeef` =
  electric cyan accent) — the measured interactive hue (hover border `1px solid
  #00aeef`).
- **Buttons**: primary = **solid charcoal, eggshell Circular text** (`#22282f`
  fill, `#f0f0f0` text, hover `#0e141b`); secondary = **faint eggshell fill,
  charcoal ink** (`#f0f0f0` fill, `#c2c8cf` stroke, `#e2e5e9` hover).
- **Tabs / sub-nav**: active = bold **cyan** label with a **cyan bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless cyan links; active page = **filled charcoal pill**,
  eggshell text.
- **Tags / badges**: **4px** radius — faint-eggshell-fill tags with charcoal ink;
  brand-cyan filled badges with charcoal text (measured `secondary.contrastText:
  #22282f` on cyan).
- **Density**: 18px base type, Circular control labels, comfortable whitespace,
  soft light-tinted elevation.

## Asset officiel
- Genetec wordmark + brand mark (the charcoal/cyan identity), served as official
  SVG/PNG from the site header and the `gntc-global-elements` web-component
  bundle. Reuse the official asset (site header logo / brand resources) if a logo
  is needed. **Do not redraw** — reuse the official Genetec logo asset.
