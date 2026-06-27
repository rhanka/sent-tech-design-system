# Pernod Ricard → Sentropic mapping

This package maps the **public** corporate design of [pernod-ricard.com](https://www.pernod-ricard.com/en)
(Pernod Ricard — "Créateurs de convivialité") onto the Sentropic token structure (`TenantTheme`).
Method = **measured clone**: every colour is measured from the brand's public compiled CSS. The
site is a Drupal 10 build (custom theme `pr2021_front`) whose SCSS is compiled to a single
stylesheet with **hard-coded hex** (no CSS custom properties), so each value below cites the real
declaration in `app.css`. Only public CSS values and font *names* are referenced — no font
binaries. Any value not directly measured is flagged "à confirmer".

## Sources
- Pernod Ricard corporate site — https://www.pernod-ricard.com/en
- Compiled CSS (measured) — `https://www.pernod-ricard.com/themes/custom/pr2021_front/assets/css/app.css?th4r66`
- Age-gate CSS (measured, focus-visible) — `https://www.pernod-ricard.com/themes/custom/pr2021_front/assets/css/agegatev2-style.css?th4r66`

## Colour mapping (measured)

| Sentropic role | Pernod Ricard source | Hex |
|---|---|---|
| `action.primary` / `surface.inverse` / `data.category1` (corporate navy) | `app.css` l.845 — footer/hero/header background | `#0c294e` |
| `action.primaryHover` / `text.link` / `border.interactive` / `tabs.activeText` (interactive blue) | `app.css` l.6344 / l.17006 — active tab underline, link, CTA | `#0057d9` |
| `data.category4` (light decorative blue) | `app.css` l.7363 — filter/tab underline at rest | `#5fa4d0` |
| `data.category6` (module link blue) | `app.css` l.6339 / l.9095 — editorial module links | `#2d8efb` |
| `focus.color` (soft focus ring) | `app.css` l.17815 — age-gate `:focus-visible` outline | `#5f9cf6` |
| `text.primary` / `breadcrumb.currentText` / labels (warm slate) | `app.css` l.4045 — body text colour | `#222d38` |
| `text.secondary` / `breadcrumb.text` | `app.css` l.9530 — accessible secondary / placeholder | `#767676` |
| `text.muted` / `breadcrumb.separator` | `app.css` — mid grey (4×) | `#979797` |
| `border.strong` / field border | `app.css` l.14719 — input border | `#d3d5d7` |
| `border.subtle` | `app.css` — light hairline tint (5×) | `#ebeced` |
| `surface.subtle` / `action.secondary` / `card.hoverBackground` | `app.css` — off-white surface (13×) | `#f9f8f7` |
| `surface.default` / `surface.raised` / `field.fillBg` | `app.css` l.4046 — body background | `#ffffff` |
| `feedback.success` | `app.css` l.12764 — `.messages--success` | `#00d490` |
| `action.danger` / `feedback.error` | `app.css` l.12771 — `.messages--error` (rust) | `#d05428` |
| `feedback.warning` | `app.css` l.12778 — `.messages--warning` (amber) | `#f5a623` |
| `feedback.info` | no dedicated info colour → interactive blue | `#0057d9` |

## À confirmer (derived / not directly measured)
- **`action.primary` choice** — Pernod Ricard exposes TWO blues: the dominant corporate navy
  `#0c294e` (large surfaces) and the bright interactive blue `#0057d9` (CTAs/active/links). The
  navy is mapped to the primary (brand identity) and the bright blue to the hover/link/interactive
  roles. A site whose primary CTA fill is the bright blue could instead set `action.primary =
  #0057d9` — flagged.
- `blue.10` / `cyan.10` `#e6ecf3` — light navy tint, derived by lightening `#0c294e`.
- **`cyan` accent slot** — Pernod Ricard has no cyan/gold accent; the slot is mapped to the light
  decorative blue family (`#5fa4d0` / `#2d8efb`). Role fit à confirmer.
- `feedback.error` `#d05428` is the measured `.messages--error` rust-orange; the age-gate form
  uses a truer red `#e74c3c` (l.17712) for required asterisks / invalid borders — kept as the alt.
- `feedback.warning` `#f5a623` (measured amber) has ~2.0:1 contrast on white as text — it is a
  fill/accent colour (`.messages--warning` border + tinted bg), not body text; flagged for WCAG.
- `density.*` heights/paddings — derived to express the brand's airy rhythm (the compiled inputs
  use 1.25rem 1.375rem padding and a 1.25rem field size, but control heights are not directly
  exposed).
- `typography.control` / `label` font-family `Weave` — the CTA/label face is not directly measured;
  pairing the display face with controls mirrors the heading-led brand voice. Fields use Noto Sans.
- `shadow.*` and `motion.*` — Pernod Ricard does not strongly tokenise these publicly; kept aligned
  with the Sentropic base.
- 8-colour categorical `data.*` palette — a coherent proposal from measured Pernod Ricard hues, not
  an official scale.
- Brand-charter logo blues `#123f75` / `#76a0cd` (found via web search) do **not** appear in the
  live CSS and are NOT used as web tokens — recorded here only as charter reference.

## Typography (font names only)
- **Display / headings** (`font.display`, `typography.control` / `label`): the proprietary **Weave**
  typeface — @font-face `Weave-Bold-Pro.woff2` (internal alias `pr_headings-regular`, bold). Measured
  fallback: `'Lucida Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif`.
- **Body / fields** (`font.sans`, `typography.field`): **Noto Sans** — @font-face `NotoSans-Regular.woff2`
  (alias `pr_body-regular`). Measured fallback: `Arial`. Body size ≈ 1.125rem / line-height 1.3.
- **Monospace** (`font.mono`): Pernod Ricard ships none; the Sentropic mono stack is kept.
- Icons: Font Awesome 6.6.0 (CDN) — not a text face, not mapped.

## Anatomy signatures (measured)
- **Radius**: SHARP — buttons are SQUARE (`.btn-old` no radius, l.6150 → `radius.md = 0`); inputs
  carry a 4px radius (l.14720 → field `radiusTop/radiusBottom = 0.25rem`); cards 8px
  (`radius.lg = 0.5rem`); pills 40px (`radius.pill = 2.5rem`).
- **Focus**: OUTLINE. Site default is a thin dotted near-black outline (`outline: 1px dotted #212121`);
  the one intentional `:focus-visible` rule (age-gate) is `2px solid #5f9cf6, outline-offset: 2px` —
  adopted as the brand focus (`focus.strategy = "outline"`, `width 2px`, `offset 2px`).
- **Fields**: boxed outline — white fill, 1px `#d3d5d7` border, 4px radius; border turns blue
  `#015fcc` on focus (l.14710-14726). Native `<select>` chevron redrawn in the corporate navy.
- **Buttons**: primary = solid corporate navy `#0c294e` with white text, square corners; hover
  brightens to the interactive blue `#0057d9`; secondary = outlined navy (transparent fill,
  off-white `#f9f8f7` hover).
- **Tabs / filters**: active = bold label with a bottom blue underline (measured
  `border-bottom: 3px solid #0057d9`, l.17006 → `indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled navy with white text.
- **Breadcrumb**: links inherit the text colour `#222d38` (coloured on hover); grey separators.
- **Alert / notice**: a coloured LEFT border accent (`border-left-color`) on a light tinted box
  (`.messages--*`, l.12762-12781).
- **Tags**: rounded (pill, `2.5rem`); **badges**: 4px radius, interactive-blue fill.

## Asset officiel
- Pernod Ricard wordmark / logo: use the official asset from the Pernod Ricard brand resources
  (do **not** redraw). The charter logo blues are `#123f75` / `#76a0cd`; the live site renders its
  identity in the deep corporate navy `#0c294e`.
