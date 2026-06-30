# Stability AI → Sentropic mapping

This package maps the **public** Stability AI brand (as published on
[stability.ai](https://stability.ai/), a Squarespace build) onto the Sentropic
token structure (`TenantTheme`). Only public CSS tokens (the Squarespace colour
"kit", measured DOM hexes, the loaded Google Fonts) and font *names* are
referenced — no font binaries. This is a **dark** theme (`mode:"dark"`): the
hero and dominant chrome render on a near-black stage with a deep-violet
signature accent.

## Sources
- Stability AI homepage — https://stability.ai/ (Squarespace). The colour kit is
  defined as HSL custom properties in the versioned `site.css`:
  - `--accent-hsl: 270,100%,20%` → `#330066` (signature deep violet)
  - `--black-hsl: 0,0%,12%` → `#1f1f1f` (near-black stage)
  - `--white-hsl: 150,4%,90.2%` → `#e5e7e6` (off-white ink / light surface)
  - `--lightAccent-hsl: 0,0%,80%` → `#cccccc` (light grey)
  - `--darkAccent-hsl: 0,0%,100%` → `#ffffff` (white)
- Measured DOM hexes on the same page: `#a381ff` (bright lavender brand accent),
  `#340068` (deep violet ≈ `--accent`), `#725d91` (muted purple), `#888888`
  (mid grey), `#1e1e1e` (≈ `--black`), form submit background `#272727`.
- Typography — the page loads Google Fonts `Archivo` (ital, wght 400/700) and
  `Figtree` (wght 600), and the Squarespace font tweaks set
  `--heading-font` = `--body-font` = `"Archivo"` and
  `--primary/secondary/tertiary-button-font` = `"Figtree"`.
- Shape tweaks — `--form-field-shape-…-radius: 5px` + `--form-field-border-thickness: 1px`
  (boxed 5px inputs); `--primary-button-…-radius: 30px` (pill CTA) +
  `text-transform: uppercase`; `--secondary-button-…-radius: 10px`;
  `--tertiary-button-…-radius: 6.4px`; card radius `14px` (measured).

## Colour mapping

| Sentropic role | Stability token | Value |
|---|---|---|
| `surface.default` | `--black` (stage) | `#1f1f1f` |
| `surface.subtle` / `action.secondary` | measured submit bg | `#272727` |
| `surface.raised` / `action.secondaryHover` | derived lift | `#2e2e2e` |
| `surface.inverse` / `text.primary` | `--white` (off-white) | `#e5e7e6` |
| `text.secondary` | `--lightAccent` | `#cccccc` |
| `text.muted` | mid grey (DOM) | `#888888` |
| `text.inverse` / `action.primaryText` | `--black` | `#1f1f1f` |
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `focus.color` | bright brand violet (DOM) | `#a381ff` |
| `action.primaryHover` | derived hover | `#b89cff` |
| accent (Sentropic `cyan.70` / `blue.80`) | deep violet (DOM ≈ `--accent`) | `#340068` |
| `cyan.50` (muted accent) | muted purple (DOM) | `#725d91` |
| `border.subtle` | derived divider | `#3a3a3a` |
| `border.strong` / `buttonSecondary.border` | derived strong border | `#555555` |
| `action.danger` / `feedback.error` | derived red | `#f0616d` |
| `feedback.success` | derived green | `#3fb950` |
| `feedback.warning` | derived amber | `#e3a008` |
| `feedback.info` | derived blue | `#5b8def` |

### "À confirmer" (no direct Stability public token)
- **Mode choice** — Stability uses both dark and light section themes; the hero
  and dominant chrome are dark, so `mode:"dark"`. On the dark stage the deep
  `--accent` `#330066`/`#340068` is too dark to act as the visible CTA, so the
  measured brighter lavender `#a381ff` is promoted to `action.primary`. The live
  primary buttons are often dark (`#272727`) with white text and the violet is
  used as accent/glow + section colour; `#a381ff` carries the brand signature
  into the interactive role.
- `violet.tint` `#c9b3ff` and `violet.hover` `#b89cff` — derived lavender
  tints around the measured brights, not published.
- Dark surface lifts `raised` `#2e2e2e`, `border` `#3a3a3a`,
  `borderStrong` `#555555` — derived steps over the `#1f1f1f` stage.
- `text.secondary` uses `--lightAccent` `#cccccc`; `text.muted` uses the DOM
  mid grey `#888888` — both measured but not published as ink ramps.
- `feedback.*`, `status.*`, `action.danger` (`#3fb950` / `#e3a008` / `#f0616d`
  / `#5b8def`) — Stability publishes no success/warning/error/info hues; these
  are derived to sit AA-legibly on the `#1f1f1f` stage.
- The 8-colour categorical `data.*` palette — a coherent violet-led proposal
  from the measured violet family + the derived system hues, not an official
  data-vis scale.
- `text.link` `#a381ff` — the live site uses plain white/near-black links
  (`a{color:#fff}` on dark, `a{color:#111}` on light); the brand violet is used
  as the theme's interactive link colour.
- `font.mono` (`ui-monospace, …`) — Stability uses no monospace face on the
  site; a neutral system stack is supplied.
- `spacing.*`, `shadow.*`, `motion.*`, `focus.*` (technique/exact specs),
  `disabledOpacity`, `tag.radius` — derived / aligned with the Sentropic base;
  exact Squarespace specs not re-measured.

## Typography
- **Headings & body** (`font.display`, `font.sans`, `typography.field`,
  `typography.label`): `'Archivo'` — the site's `--heading-font` AND
  `--body-font` (400 / 700 + italics).
- **Controls / buttons** (`typography.control`): `'Figtree'` 600 — the measured
  button face (`--primary/secondary/tertiary-button-font`), set **UPPERCASE**
  like the primary CTA (`text-transform: uppercase`).
- **Monospace** (`font.mono`): neutral `ui-monospace` stack (no mono on site —
  à confirmer).
- Links are **not** coloured at rest on the live site (plain white/black);
  the theme uses the brand violet `#a381ff` and underlines on hover.

## Signatures anatomiques
- **Theme mode**: dark — near-black `#1f1f1f` stage, off-white `#e5e7e6` ink,
  bright violet `#a381ff` interactive accent; deep violet `#340068`/`#330066`
  is the brand `--accent`.
- **Fields**: `field.style = "outline"` — boxed, lightly rounded inputs (dark
  `#272727` fill, 1px border, **5px** radius), border/ring turns violet on focus.
  Not a filled-underline.
- **Radius**: form fields `sm = 5px`; default control / secondary button
  `md = 10px`; cards `lg = 14px`; the primary CTA is a `pill = 999px` (30px on a
  ~48px control). Tertiary buttons ≈ 6.4px.
- **Focus**: `focus.strategy = "ring"` — a soft 2px ring in the brand violet
  `#a381ff` (offset 2px) on the near-black stage (exact technique à confirmer).
- **Buttons**: primary = pill (30px), **UPPERCASE** Figtree 600, generous
  padding (1rem / 1.3rem); secondary = boxed 10px (transparent fill, 1px border,
  quiet dark hover fill). Primary carries the violet accent into the CTA.
- **Tabs**: active tab = bright violet `#a381ff` 600 label with a 2px violet
  bottom indicator (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless light links on the dark stage; active page = filled
  bright violet with the dark stage as text.
- **Chevron (native `<select>`)**: redrawn as a bright violet `#a381ff` arrow,
  `appearance: none`, 40px right gutter.
- **Density**: generous touch targets (md ≈ 48px control height) following the
  measured 1rem / 1.3rem button padding; button label 1rem (16px) Figtree 600.

## Asset officiel
- The Stability AI wordmark / logo is an official Stability brand asset —
  reference it from Stability's brand resources, do not redraw. Stability chrome
  should use the real wordmark over the near-black stage with the deep-violet
  accent, not a hand-drawn approximation.
