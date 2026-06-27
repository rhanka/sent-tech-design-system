# LVMH → Sentropic mapping

This package maps the **public** corporate design of [lvmh.com](https://www.lvmh.com/) (LVMH
Moët Hennessy Louis Vuitton) onto the Sentropic token structure (`TenantTheme`). Method =
**measured clone**: every colour is measured from the brand's public compiled CSS (the
Next.js Tailwind build served at `/_next/static/css/*.css`, June 2026), where LVMH exposes
its palette as named utilities (`corporate-darkBlue`, `thematique-yellow`,
`utility-accessibilityBlue`, …). Only public CSS values and font *names* are referenced — no
font binaries. Any value not directly measured is flagged "à confirmer".

## Sources
- LVMH corporate site — https://www.lvmh.com/en
- Compiled CSS (measured) — `https://www.lvmh.com/_next/static/css/664974ffa497f8ef.css` (+ `85c9cbf75da9f603.css`, `d39a13588c107480.css`)
- Brand colour cross-check — https://www.brandcolorcode.com/lvmh-moet-hennessy-louis-vuitton (LVMH "Black" ≈ #121426, the deep navy family, confirming the primary is navy, not pure black)

## Colour mapping (measured)

| Sentropic role | LVMH utility token | `rgb()` | Hex |
|---|---|---|---|
| `action.primary` / `text.primary` / `text.link` / `surface.inverse` / `border.interactive` | `corporate-darkBlue` | `rgb(3 15 43)` | `#030f2b` |
| `action.primaryHover` (slate.80, strong text) | `corporate-darkBlueGraph-2` | `rgb(43 54 79)` | `#2b364f` |
| `surface.subtle` / `action.secondary` / warm bg | `corporate-ultraLightWarmWhite` | `rgb(247 243 237)` | `#f7f3ed` |
| `action.secondaryHover` (beige) | `corporate-lightWarmWhite` | `rgb(224 214 200)` | `#e0d6c8` |
| `data.category7` (taupe) | `corporate-darkWarmWhite` | `rgb(143 138 128)` | `#8f8a80` |
| `data.category6` | `corporate-extraLightBlue` | `rgb(141 147 171)` | `#8d93ab` |
| `surface.default` / `surface.raised` / `field.fillBg` | `basic-white` | `rgb(255 255 255)` | `#ffffff` |
| `border.subtle` (slate.20) | `basic-greyUltraLight` | `rgb(224 229 240)` | `#e0e5f0` |
| `text.muted` / `border.strong` | `basic-greyDark` | `rgb(101 107 122)` | `#656b7a` |
| `text.secondary` / `breadcrumb.linkText` | `thematique-greyBlue` | `rgb(85 98 110)` | `#55626e` |
| accent (Sentropic `cyan.50`) / `feedback.warning` | `thematique-yellow` (gold) | `rgb(187 142 36)` | `#bb8e24` |
| accent light (`cyan.10`) | `thematique-yellowLight` (champagne) | `rgb(229 216 172)` | `#e5d8ac` |
| `feedback.success` | `thematique-greenEnvironment` (olive) | `rgb(90 96 70)` | `#5a6046` |
| `feedback.info` | `thematique-blueInnovation` | `rgb(87 109 221)` | `#576ddd` |
| `data.category5` | `thematique-redRh` | `rgb(152 65 38)` | `#984126` |
| `action.danger` / `feedback.error` | `basic-error` | `rgb(219 35 39)` | `#db2327` |
| `focus.color` | `utility-accessibilityBlue` (`:focus` `outline-color`) | — | `#0071f0` |

## À confirmer (derived / not directly measured)
- `cyan.70` `#8f6e1b` — darker gold for hover/active, derived by darkening `thematique-yellow`.
- `feedback.warning` `#bb8e24` (measured gold) used as text/border has ~2.9:1 contrast on white
  (below WCAG AA 4.5:1); kept as the real brand token (used mostly as an accent/fill), flagged here.
- `density.*` heights/paddings — derived to express LVMH's airy editorial rhythm; the corporate
  home exposes few bordered controls to measure directly.
- `field.style = "outline"` with square corners — LVMH's editorial home shows few styled inputs;
  the squared minimal outline matches the brand minimalism but the exact field box is à confirmer
  (could be an underline-only field on some forms).
- `motion.fast` `200ms` / `motion.normal` `400ms` — derived steps below the measured `slow` 600ms.
- `shadow.*` — derived navy-tinted elevation (the site is largely flat with thin rules).
- `link` hover underline thickness/offset, `disabledOpacity 0.4`, `label` uppercase tracking —
  derived to follow the measured CTA signature (uppercase + wide tracking).
- 8-colour categorical `data.*` palette — a coherent proposal from measured LVMH hues, not an
  official scale.

## Typography (font names only)
- **Display / editorial** (`font.display`, used italic for key figures & subtitles): the
  proprietary **LVMH** typeface — CSS var `--font-LVMH` (`__LVMHVariable_*`). A lighter cut
  **LVMH Air** (`--font-LVMH-air`) is the secondary display. Fallback = elegant serif
  (`Georgia, 'Times New Roman', serif`). Note: the official metric-fallback descriptor pairs the
  face with `local("Arial")` — the serif fallback is our luxury degradation choice (à confirmer).
- **Body / UI / CTA** (`font.sans`, `typography.control/field/label`): the proprietary
  **LVMH Sans** typeface — CSS var `--font-LVMH-sans` (`__LVMHSansVariable_*`).
- **Monospace** (`font.mono`): LVMH ships none; the Sentropic mono stack is kept.
- **CTA signature (measured `.typo-cta-regular`)**: LVMH Sans, 0.875rem, line-height 1,
  **letter-spacing 0.04em**, and CTAs are **UPPERCASE** (`text-transform:uppercase`, 15×).

## Anatomy signatures (measured)
- **Radius**: SQUARED — controls/cards `border-radius: 0` (`rounded-none`, `border-radius:0!important`);
  only pills are `9999px`. Luxury minimalism.
- **Focus**: 2px solid OUTLINE in `#0071f0` (`utility-accessibilityBlue`), `outline-offset: 2px`,
  `outline-style: solid` — all measured.
- **Motion**: slow elegant transition — measured `.search-button` `transition: … .6s` with
  `cubic-bezier(.69,0,.34,1)`. `motion.slow = 600ms`, `motion.easing` measured.
- **Fields**: squared outline (white fill, 1px hairline, radius 0); native `<select>` chevron
  redrawn in navy `#030f2b`.
- **Buttons**: primary = solid deep navy `#030f2b` with warm-white text; secondary = outlined navy
  (transparent fill, warm-white `#f7f3ed` hover); CTAs uppercase + 0.04em tracking.
- **Tabs**: active = bold navy label with a bottom navy underline (`indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: borderless navy links; active page = filled navy with warm-white text.
- **Tags / badges**: squared (`radius: 0`); badge label uppercase.

## Asset officiel
- LVMH wordmark / logo: use the official asset from the LVMH brand resources (do **not** redraw).
  The identity is the elegant "LVMH" wordmark on deep navy / warm white — no decorative graphic.
