# EDF → Sentropic mapping

This package maps the **public** EDF (Électricité de France) brand design onto
the Sentropic token structure (`TenantTheme`). Method = **measured-clone**: the
two anchor brand colours (deep blue + signature orange) are taken from published
EDF brand-colour references; the remaining roles (greys, tints, status hues) are
derived around those anchors. Only public colour values and font *names* are
referenced — no font binaries, no logo artwork. Derived/unmeasured values are
flagged `à confirmer`.

**Scope note:** this package builds ONLY `packages/theme-edf/`. It never touches
shared/docs/registration files; docs registration is done separately by the
orchestrator.

> **Iconic accent:** EDF's signature orange **#FE5716** (Pantone 172 C) is the
> brand's iconic accent — it drives the active tab, the `<select>` chevron, the
> secondary-button outline and the focus ring. The deep blue **#10367A**
> (Pantone 3591 C, the wordmark colour) serves as the **accessible primary
> action** (white text clears WCAG AA), so the loud orange stays an accent and
> the workhorse action remains legible.

## Sources
- EDF corporate / customer sites — https://www.edf.fr/ , https://www.edf.com/
- Brand colour reference (anchors) — https://www.brandcolorcode.com/edf-energy
  — signature orange **#FE5716** (Pantone 172 C, RGB 254 87 22) and deep blue
  **#10367A** (Pantone 3591 C, RGB 16 54 122).
- Cross-check colour references — https://coloropedia.com/edf/ ,
  https://1000logos.net/edf-logo/ (brand orange swirl + deep-blue wordmark).

## Colour mapping

| Sentropic role | EDF source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / pagination / breadcrumb / badge info | EDF deep blue wordmark (Pantone 3591 C) | `#10367A` |
| `action.primaryHover` | derived darker blue | `#0b2860` *(à confirmer)* |
| accent (`cyan` slot) / `tabs.activeText` / `focus.color` / select chevron / secondary-button border | EDF signature orange (Pantone 172 C) | `#FE5716` |
| accent hover (`cyan` 70) | derived dark orange | `#d4430e` *(à confirmer)* |
| `text.primary` | derived neutral 800 (brand slate) | `#1b2236` *(à confirmer)* |
| `text.secondary` / `border.strong` | derived neutral 500 | `#687085` *(à confirmer)* |
| `text.muted` | derived neutral 600 | `#4c5468` *(à confirmer)* |
| `border.subtle` / field stroke | derived neutral 200 | `#d6dae4` *(à confirmer)* |
| `surface.subtle` / `action.secondary` | derived neutral 50 | `#f5f6f9` *(à confirmer)* |
| `surface.default` / `surface.raised` | white | `#ffffff` |
| `surface.inverse` | derived dark slate | `#1b2236` *(à confirmer)* |
| `action.danger` / `feedback.error` | derived destructive red | `#d92d20` *(à confirmer)* |
| `feedback.warning` | EDF signature orange | `#FE5716` |
| `feedback.success` | derived green | `#2e9e5b` *(à confirmer)* |
| `feedback.info` | derived blue | `#2e7dd1` *(à confirmer)* |

### À confirmer (derived or no direct brand token)
- **Neutral grey ramp** (`#f5f6f9`, `#d6dae4`, `#687085`, `#4c5468`, `#1b2236`,
  `#0e1424`) — a coherent neutral scale derived around the brand slate; EDF does
  not publish an explicit grey palette.
- **Blue/orange tints & shades** — `blue.hover #0b2860`, `blue.deep #081d45`,
  `blue.light #e6eaf2`, `orange.light #ffe9e1`, `orange.dark #d4430e` are derived
  hover/light/dark variants of the two anchor colours.
- **`action.danger` / `feedback.error` `#d92d20`** — a derived destructive red
  (EDF uses orange, not red, as its accent; a distinct red is introduced for
  unambiguous error/destructive semantics).
- **`feedback.success` `#2e9e5b` / `feedback.info` `#2e7dd1`** — derived status
  hues; the brand publishes no explicit status palette. `feedback.warning` reuses
  the brand orange `#FE5716`.
- **Typography** — `'Open Sans'` is a public humanist sans used as a proxy for
  EDF's proprietary "Edf" typeface (no binaries shipped or referenced).
- **`data.*`** — the 8-colour categorical palette
  (`#FE5716`, `#10367A`, `#2e9e5b`, `#2e7dd1`, `#d92d20`, `#d4430e`, `#687085`,
  `#081d45`) is a coherent proposal from the brand hues, not an official scale.
- **`shadow.*`, `motion.*`, sm/lg `density.*`** — not tokenised publicly; kept
  aligned with the Sentropic base (shadow tinted on the brand slate `#1b2236`).
- **`focus.width` `2px` / `offset` `2px`** — concrete expression of an
  on-brand orange outline ring.

## Typography
- **Display / titles & body / controls / fields / labels** (`font.display`,
  `font.sans`, `typography.*`): `'Open Sans', sans-serif` — a public humanist
  sans approximating EDF's proprietary "Edf" typeface (*à confirmer*). Control
  labels use weight 600, labels 700, fields 400.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: deep blue `#10367A`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill,
  1px `#d6dae4` border, 4px radius). Native `<select>` chevron redrawn in the EDF
  signature orange `#FE5716`.
- **Radius**: 4px on controls/inputs/tabs (`radius.sm/md = 0.25rem`), 8px on
  cards (`radius.lg = 0.5rem`); pills/tags stay `999px`.
- **Focus**: high-contrast **outline** in the EDF signature orange `#FE5716`
  (on-brand, distinctive) — `strategy: "outline"`, 2px width, 2px offset.
- **Buttons**: primary = solid deep blue `#10367A` → hover `#0b2860` (white text,
  AA); secondary = outlined signature orange (transparent fill, `#FE5716` border
  + text, light-orange `#ffe9e1` hover).
- **Tabs / top-nav**: active tab = signature-orange label `#FE5716` with a bottom
  indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination / breadcrumb / badge**: deep-blue `#10367A` links; active page =
  filled deep blue with white text.

## Asset officiel
- EDF logo = the orange swirl ("tourbillon") symbol + deep-blue **EDF** wordmark.
  Use the official EDF SVG/PNG brand artwork — **do not redraw the logo by hand**.
  This package only references font *names* and brand colour values, never logo
  artwork or font binaries.
