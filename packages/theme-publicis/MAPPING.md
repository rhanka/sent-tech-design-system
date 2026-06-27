# Publicis Groupe → Sentropic mapping

This package maps **Publicis Groupe**'s public brand identity — the French
communications/advertising holding company — onto the Sentropic token structure
(`TenantTheme`). Method = **measured-clone**: the corporate colour, the signature
accent and the typography are taken from Publicis Groupe's **official Media Kit
brand guidelines**, cross-checked against published brand-colour references. Only
public colour values and font *names* are referenced — no font binaries, no logo
artwork. Values that Publicis Groupe does not publish as UI tokens (the full
neutral scale, hover/tint steps, product feedback colours) are flagged
`à confirmer`.

> Scope note: this targets the **Groupe** (publicisgroupe.com), the holding
> company — NOT a subsidiary (Publicis Sapient, Leo Burnett, Saatchi & Saatchi,
> Publicis Worldwide), which each carry their own brand colours.

## Sources
- Publicis Groupe Media Kit (official brand colours + typography) — https://www.publicisgroupe.com/en/media-kit
- Publicis Groupe corporate site — https://www.publicisgroupe.com/en
- Brand colour cross-check (Publicis Black / Grey / Gold) — https://www.brandcolorcode.com/publicis-groupe
- Brand palette cross-check (full Media Kit palette) — https://pickcoloronline.com/brands/publicis-groupe/

## Colour mapping

| Sentropic role | Publicis source | Value |
|---|---|---|
| `action.primary` / `text.primary` / `surface.inverse` | **PUBLICIS BLACK** (Media Kit) | `#212129` |
| `action.primaryHover` | derived lighter near-black | `#3a3a45` *(à confirmer)* |
| `text.link` / `tabs.activeText` / `breadcrumb.linkText` / `pagination.text` | deep **Publicis Gold** (AA on white) | `#7d6831` *(à confirmer)* |
| `border.interactive` / `focus.color` (accent) | **PUBLICIS GOLD** (Media Kit) | `#9d833e` |
| `border.subtle` / field stroke / secondary surface | **PUBLICIS GREY** (Media Kit) | `#e7e7e7` |
| `surface.default` / `surface.raised` / `field.fillBg` | white | `#ffffff` |
| `surface.subtle` / `action.secondary` | derived background alt | `#f4f4f5` *(à confirmer)* |
| `text.secondary` | derived neutral | `#52525b` *(à confirmer)* |
| `text.muted` / `border.strong` | derived neutral | `#6e6e78` *(à confirmer)* |
| darkest neutral | derived | `#16161c` *(à confirmer)* |
| accent (`cyan` slot) | **PUBLICIS GOLD** | `#9d833e` |
| `foundation.color.blue` family | **PUBLICIS BLUE** (Media Kit) | `#16abe0` |
| `action.danger` / `feedback.error` | derived red | `#c62828` *(à confirmer)* |
| `feedback.success` | derived green | `#1f7a52` *(à confirmer)* |
| `feedback.warning` | derived amber (AA on white) | `#b35900` *(à confirmer)* |
| `feedback.info` | derived from Publicis Blue `#16abe0` | `#0e7fb0` *(à confirmer)* |
| data-vis (Pink) | **PUBLICIS PINK** (Media Kit) | `#d93d7a` |
| data-vis (Turquoise) | **PUBLICIS TURQUOISE** (Media Kit) | `#00b0a3` |

> **Black primary + Gold accent — the core decision.** Publicis Groupe's identity
> is **near-black on white with a single prestige accent**. The official Media Kit
> lists `PUBLICIS BLACK #212129`, `PUBLICIS GREY #e7e7e7` and `PUBLICIS GOLD
> #9d833e` as the primary brand colours (plus three secondary accents: Blue
> `#16abe0`, Pink `#d93d7a`, Turquoise `#00b0a3`). This package wires **Black** to
> every primary role (primary button, body text, dark inverse surfaces) and
> **Gold** to the accent roles (focus ring, interactive border, active tab,
> links, pagination links). Because the measured gold `#9d833e` clears WCAG AA
> only as a non-text/UI accent (≈3.66:1 on white), accent **TEXT** on white uses a
> derived darker gold `#7d6831` (≈5.4:1). The three secondary accents are parked
> in the data-vis scale and the info family.

### À confirmer (derived or not publicly extracted)
- **Neutral scale** `#f4f4f5 / #c7c7cc / #6e6e78 / #52525b / #16161c` — only
  `PUBLICIS GREY #e7e7e7` is published; the rest are derived to build a coherent
  neutral ramp.
- **`action.primaryHover` `#3a3a45`** — derived lighter near-black for the
  black primary button hover (no published hover token).
- **Deep gold `#7d6831`** — derived darker step of `PUBLICIS GOLD #9d833e` so
  accent text reaches WCAG AA (≈5.4:1) on white.
- **Feedback hues** `success #1f7a52`, `warning #b35900`, `error #c62828`,
  `info #0e7fb0` — Publicis Groupe is a holding-company brand and does NOT
  publish product UI feedback colours; these are derived to read clearly and keep
  WCAG AA on white. `info` is drawn from the measured Publicis Blue `#16abe0`.
- **Derived blue steps** `blueDeep #0e7fb0`, `blueLight #e3f5fc`, and the light
  gold tint `#f3efe4` — derived darker/lighter steps for tints and surfaces.
- The **8-colour categorical `data.*`** palette (`#212129`, `#9d833e`, `#16abe0`,
  `#d93d7a`, `#00b0a3`, `#7d6831`, `#6e6e78`, `#0e7fb0`) — colours are the real
  measured Media Kit palette, but the sequential ORDER is a coherent proposal,
  not an official scale.
- `radius.*`, `density.*`, `shadow.*`, `motion.*`, `focus.width/offset` — not
  published as tokens; the sharp 2px/4px radii and the standard density/elevation
  are a faithful reading of the editorial identity, kept aligned with the base.

## Typography
- **Headlines / display & UI chrome** (`font.display`, `typography.control/field/label`):
  **`'Gotham Narrow'`** (Media Kit headline typeface), with `'Gotham'` and
  `'Montserrat'` / system-sans fallbacks. Gotham is proprietary — only the *name*
  is referenced, never a binary, and a free-ish fallback (`Montserrat`) is kept
  in the stack.
- **Body copy** (`font.sans`): **`'ITC New Baskerville'`** (Media Kit body serif),
  with `Baskerville` / `Libre Baskerville` / Georgia serif fallbacks. Publicis
  pairs a Gotham sans (UI/titles) with a Baskerville serif (editorial body) — so
  `font.sans` (the body slot) deliberately carries the serif.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: deep Publicis Gold `#7d6831`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px
  `#e7e7e7` Publicis-Grey border, sharp 2px radius). Native `<select>` chevron
  redrawn in Publicis Black `#212129`.
- **Focus**: high-contrast **outline** in the measured Publicis Gold `#9d833e`
  (`focus.strategy = "outline"`, width `2px`, offset `2px`) — ≈3.66:1 on white,
  clearing the WCAG 1.4.11 non-text 3:1 bar for focus indicators.
- **Radius**: sharp/editorial — 2px on controls / inputs / tabs / tags / badges
  (`radius.sm/md = 0.125rem`), 4px on cards (`radius.lg = 0.25rem`); pills `999px`.
- **Buttons**: primary = solid Publicis Black `#212129` (white label) → hover
  `#3a3a45`; secondary = **outlined Black** (transparent fill, `#212129` border +
  text, light grey `#f4f4f5` hover fill).
- **Tabs / top-nav**: active tab = bold deep-gold `#7d6831` label with a bottom
  gold underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless deep-gold `#7d6831` links; active page = filled
  Publicis Black `#212129` with white text.
- **Density**: ~40px medium controls (`density.md.controlHeight = 2.5rem`) with
  0.75rem inline padding.

## Asset officiel
- Publicis Groupe logo = the **"Publicis Groupe" wordmark** (black on white) from
  the official Media Kit. Use the official SVG/PNG from the brand — **do not
  redraw the logo by hand**. This package only references font *names* (Gotham
  Narrow, ITC New Baskerville) and published colour values, never logo artwork or
  font binaries.
