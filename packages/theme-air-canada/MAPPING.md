# Air Canada → Sentropic token mapping

A **measured-clone** of [aircanada.com](https://www.aircanada.com/), the Montréal-HQ
flag carrier (Canada's largest airline). Every value is measured from Air Canada's
live public CSS — specifically its **"Compass" design language** `:root` token map
(`--colour-*`, `--spacing-*`, `--ac-font-family-*`) shipped in the single stylesheet
bundle `/home/styles.5314a14036859140.css`. This package maps only **public design
tokens + font family NAMES** (no font binaries, no proprietary assets). Anything not
directly measured is flagged **À confirmer** below.

## Sources
- `https://www.aircanada.com/` → 301 → `https://www.aircanada.com/home/ca/fr/aco/flights` (homepage shell, fetched via curl with a desktop UA; the `.html` AEM paths are Akamai-blocked, the SPA root is not).
- `https://www.aircanada.com/home/styles.5314a14036859140.css` (142 KB Angular/`ngx-ac` "Compass" bundle — the brand `:root` `--colour-*` / `--spacing-*` token map, `@font-face`, button/link/focus rules). Fetched directly via curl with the homepage referer.
- Preloaded fonts: `/home/assets/font/ac-nord/AC_Nord_Text-{Regular,Bold,Heavy}.woff2` (confirms the `AC Nord Text` family — names only).

## Colour mapping (role → source token → hex)
| Sentropic role | Air Canada source token | Hex |
|---|---|---|
| `action.primary` | `--colour-bg-fill-primary` (20× — THE UI blue) | `#1460aa` |
| `action.primaryHover` | `--colour-bg-fill-primary-hover` | `#003d78` |
| `action.primaryText` / `text.inverse` | `--colour-text-inverse` | `#ffffff` |
| `action.danger` / `feedback.error` | `--colour-text-error` / `-icon-error` | `#851109` |
| `border.interactive` | `--colour-border-primary` | `#1460aa` |
| `text.primary` | `--colour-text-primary` | `#000000` |
| `text.secondary` / `muted` | `--colour-text-secondary` / `-bg-fill-everyday` | `#6d6d6f` |
| `text.link` | `--colour-text-link` | `#1460aa` |
| `surface.default` / `raised` | `--colour-bg-surface` / `-bg-fill-secondary` | `#ffffff` |
| `surface.subtle` | `--colour-bg-primary` / `-bg-fill-tertiary` | `#f9f9f9` |
| `surface.inverse` | `--colour-bg-surface-footer` / `-bg-fill-nav-active` | `#1e1e1e` |
| `surface.overlay` | `--overlay-scrim` rgba(0,0,0,.302) | `rgb(0 0 0 / 0.3)` |
| `border.subtle` | `--colour-border-divider` / `-border-secondary` | `#c9cacc` |
| `feedback.success` | `--colour-text-promo` / `-bg-fill-success-toast` | `#20842f` |
| `feedback.warning` | `--colour-text-warning` (#960) | `#996600` |
| `feedback.info` | `--colour-icon-information` / `-border-information` | `#78a1b4` |
| **Brand red (accent)** `cyan.50` | `--colour-text-brand` / `-bg-fill-brand-primary` | `#d8292f` |
| Brand red bright | `--colour-bg-fill-brand-secondary` | `#ff333a` |
| Logo glyph red | `--colour-icon-logo` (the rondelle maple-leaf mark) | `#f01428` |
| Focus ring | `--colour-border-tertiary` (`:focus-visible::after`) | `#333333` |

**Primary action decision: BLUE, not red.** Air Canada's Compass token map defines
the primary fill / primary border / link / primary icon as the **UI blue `#1460aa`**
(the single most-used brand hex, 20 occurrences, with explicit hover `#003d78` and
pressed `#002345` states). The iconic maple-leaf **RED** (`#d8292f` / bright `#ff333a`
/ logo `#f01428`) is reserved for the **brand mark and brand accents only**
(`--colour-*-brand-*` tokens) — it never backs a primary UI action. So `action.primary`
= the UI blue; the red is carried as a distinct brand accent in the `cyan` slot and as
the data-vis lead-2 colour.

## À confirmer
- **`cyan` slot repurposed for brand red.** Sentropic's "cyan" accent family has no Air
  Canada equivalent; it is repurposed to carry the maple-red brand accent (`#fff1f0` /
  `#d8292f` / `#851109`) so the iconic brand red survives as a distinct accent.
- **`font.mono`.** Air Canada ships no monospace face; the Sentropic mono stack is kept.
- **`radius.pill` (999px).** Air Canada has no pill-button language — corners are 4px
  (fields/focus) to 16px (cards). The pill step is retained for chips/badges only;
  `tag`/`badge` are set to the measured 4px instead.
- **`disabledOpacity` 0.5.** Inferred from greyed disabled fills (`--colour-bg-fill-*-disabled`
  `#d6d7d9`/`#eff0f2`) and measured `opacity:.5`; not a single published disabled-opacity token.
- **`motion` fast/slow + `easing`.** Only `.2s` UI transitions are measured; the fast/slow
  ramp and cubic-bezier easing are aligned with the Sentropic base.
- **`data.category*`** (categorical palette). Assembled from measured Compass hexes; Air
  Canada publishes no single categorical token list.
- **`z`** roles — not Air Canada-specific; kept aligned with the Sentropic base.

## Typography
- **Body / UI / controls / fields:** `AC Nord Text` (`--ac-font-family-text`,
  `@font-face`, preloaded `AC_Nord_Text-{Regular,Bold,Heavy}.woff2`). Fallback chain
  `'AC Nord Text', 'Open Sans', Arial, sans-serif` (the brand's own Open Sans fallback).
- **Display / headings:** `AC Nord Display` (`--ac-font-family-display`, `@font-face`) —
  name only.
- **Weights (measured):** regular 400 (light 300), semi-bold 600 (500), bold 700
  (`--ac-font-weight-regular/-semi-bold/-bold`).
- **Letter-spacing:** `0` across the brand (`letter-spacing:0`, 53×).
- **Links:** UI blue `#1460aa`, `text-decoration:underline` (measured `.ac-hyperlinks-*`).
- Mono: Sentropic stack (à confirmer — no Air Canada mono face).

## Signatures anatomiques
- **`field.style: "outline"`** — boxed inputs: white fill (`--colour-bg-surface` `#fff`)
  + thin `#c9cacc` (`--colour-border-divider`) 1px stroke, 4px radius. Native `<select>`
  chevron redrawn in the UI blue `#1460aa` (`selectAppearance:"none"`, 36px right gutter).
- **`focus.strategy: "double"`** — measured `*:focus-visible::after`: a 1px solid `#333`
  (`--colour-border-tertiary`) ring inset by `-2px`, wrapped in a 1px white
  (`--colour-bg-surface`) separator halo (`box-shadow:0 0 0 1px #fff`), radius 4px. Hue is
  neutral-dark (neither the blue primary nor the red brand) so it survives on any control.
- **`radius`** — `4px` fields/focus (measured `:focus-visible::after` + field), `16px`
  raised "kilo" cards; base `button{border-radius:0}`. No pill.
- **Buttons** — primary = UI blue `#1460aa` fill, white text, hover `#003d78`. Secondary =
  outlined: white fill, blue stroke/label, `#f9f9f9` hover (`--colour-bg-fill-secondary*`).
  Legacy `.primary` CTA is a tall (`min-height:5.2rem`, padding `0 3rem`) deep-teal `#005078`
  box (booking widget alt — noted, not used for the primary role).
- **Tabs** — active = blue `#1460aa` semibold label + blue bottom-border indicator.
- **Pagination** — blue link text; active page = filled blue `#1460aa` box, white text.
- **Spacing** — strict 8px ramp (`--spacing-*`: 2/4/8/12/16/24/32/48/64px).
- **Density** — measured tall CTA (`min-height:5.2rem` at the brand 10px base ≈ 52px);
  md control targets ~48px.

## Asset officiel
The Air Canada rondelle (maple-leaf in a red circle) wordmark is the brand's registered
logo, drawn in `--colour-icon-logo` `#f01428`. Use the **official asset** from the live
site (`/home/assets/...`) — do **not** redraw it by hand. This package references the
logo colour and font NAMES only; no binaries or marks are bundled.
