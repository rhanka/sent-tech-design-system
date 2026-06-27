# Kering → Sentropic mapping

This package maps the **public** corporate design of [kering.com](https://www.kering.com/)
(Kering, the global luxury group — Gucci, Saint Laurent, Bottega Veneta, Balenciaga…) onto
the Sentropic token structure (`TenantTheme`). Method = **measured clone**: every colour is
measured from the brand's public compiled CSS (the Next.js build served at
`/_next/static/css/*.css`, June 2026), where Kering exposes its palette as named CSS custom
properties (`--black-pure`, `--gray-*`, `--beige-*`, the EP&L `--pollution-*` map, …). Only
public CSS values and font *names* are referenced — no font binaries. Any value not directly
measured is flagged "à confirmer".

## Sources
- Kering corporate site — https://www.kering.com/en/
- Compiled CSS (measured) — `https://www.kering.com/_next/static/css/250c4234fe7eafe4.css`
  (+ `3a7f8b7018213c43.css`, `d19076e09e47e1bf.css`)
- Brand colour cross-check — https://www.brandcolorcode.com/kering (Kering "Black" `#000000`,
  confirming the monochrome black/white identity)
- Logo / identity — https://logotyp.us/logo/kering/ (the owl emblem + "KERING" wordmark)

## Colour mapping (measured)

| Sentropic role | Kering CSS variable | Hex |
|---|---|---|
| `action.primary` / `text.primary` / `text.link` / `surface.inverse` / `border.interactive` / `focus.color` | `--black-pure` / `--text-color` | `#000000` |
| `action.primaryHover` (slate near-black) | `--gray-1100` | `#323232` |
| `surface.default` / `surface.raised` / control background | `--white-pure` | `#ffffff` |
| `slate.10` (cool light surface) | `--gray-100` | `#f2f2f2` |
| `border.subtle` (slate.20) | `--gray-400` | `#e6e6e6` |
| `field.underlineColor` | `--gray-450` (`--form-dropdown-border`) | `#cacaca` |
| `text.muted` | `--gray-500` | `#7c7c7c` |
| `text.secondary` / `border.strong` | `--gray-850` (`--radio-input-border`) | `#575757` |
| `surface.subtle` / `field.fillBg` / control hover / card hover / tag bg | `--beige-100` (≈ resolved `--form-input-background`) | `#f8f2ed` |
| `action.secondary` / `buttonSecondary.hoverBackground` | `--beige-200` (measured `a:hover` bg) | `#f1e4db` |
| `action.secondaryHover` | `--beige-300` | `#ebd5c8` |
| accent (Sentropic `cyan.50`) / `data.category8` | `--beige-500` (warm taupe) | `#d3b6a0` |
| accent dark (`cyan.70`) | `--beige-1700` | `#b38b6c` |
| `feedback.info` / `data.category2` | `--blue-100` (`--pollution-water-pollution`) | `#2c578c` |
| `data.category3` | `--red-100` (`--pollution-waste`) | `#c25046` |
| `data.category4` | `--green-100` (`--pollution-land-use`) | `#7eb57c` |
| `data.category5` | `--purple-100` (`--pollution-co2`) | `#944c7c` |
| `data.category6` | `--yellow-100` (`--pollution-air`) | `#fcc55e` |
| `data.category7` | `--cyan-100` (`--pollution-water-consumption`) | `#7cbeca` |
| `action.danger` / `feedback.error` | `--red-400` | `#af0505` |
| `surface.overlay` | `--video-popup-background` `hsla(0,0%,4%,.8)` | `rgb(10 10 10 / 0.8)` |

## À confirmer (derived / not directly measured)
- `feedback.success` `#2e7a37` — EP&L land-use green `--green-100` `#7eb57c` darkened for WCAG AA
  on white (the measured value is light/decorative; Kering has no semantic success colour).
- `feedback.warning` `#9a6a00` — EP&L air amber `--yellow-100` `#fcc55e` darkened for WCAG AA on
  white (same rationale).
- `focus.color` `#000000` — the measured raw focus rule is `outline: 2px solid var(--gray-400)`
  with `outline-offset: -2px`; that light grey is invisible on white, so the ring is darkened to
  the brand black ink for AA visibility. The *technique* (2px solid outline) is measured; the
  colour is à confirmer.
- `field.style = "filled-underline"` — the measured input is warm-filled (`--form-input-background:
  hsla(25,44%,90%,.5)`) with a transparent border; dropdowns add a `--gray-450` 1px border. Modelled
  as a warm fill + a single grey bottom rule + square corners. The exact bottom-rule treatment
  (border vs. none) is à confirmer.
- `action.primaryHover` `#323232` — black cannot darken; Kering hovers via opacity/beige, so a lifted
  near-black (`--gray-1100`) is used for the primary button hover (à confirmer).
- `density.*` heights/paddings — derived to express Kering's airy editorial rhythm; the corporate
  home exposes few bordered controls to measure directly.
- `motion.fast/normal/slow` `300/400/500ms` — measured durations from the CSS (`.3s`/`.4s`/`.5s`), but
  the specific role-to-duration assignment is derived. `motion.easing` `cubic-bezier(.42,0,.36,1.01)`
  is the measured signature timing function.
- `shadow.*` — derived black-tinted elevation (the site is largely flat with thin rules).
- `disabledOpacity 0.5` — derived from the measured `a:hover{opacity:.5}` convention.
- 8-colour categorical `data.*` palette — built from the measured EP&L `--pollution-*` scale plus the
  brand black and a warm taupe; a coherent proposal, not an official UI chart scale.

## Typography (font names only)
- **Display / titles** (`font.display`, `typography.control/label`): the proprietary-licensed
  **Akzidenz-Grotesk Std Ext** — CSS var `--title-font-family: "Akzidenz-Grotesk Std Ext"`.
- **Body / fields** (`font.sans`, `typography.field`): **Akzidenz-Grotesk Std Ext Regular** — CSS var
  `--regular-font-family: "Akzidenz-Grotesk Std Ext Regular"`.
- **Fallback**: the classic grotesque stack `'Helvetica Neue', Helvetica, Arial, sans-serif`.
- **Monospace** (`font.mono`): Kering ships none; the Sentropic mono stack is kept.
- **Weights** (measured `--title-font-weight-*`): small 300 / regular 400 / medium 500 / bold 600.
- **Nav / CTA signature (measured `a`)**: medium weight, `text-transform: uppercase`, very wide
  `letter-spacing: .2em`; no underline (`text-decoration: none`). The JP-locale `Sawarabi Gothic
  !important` override is ignored (not the brand face).

## Anatomy signatures (measured)
- **Radius**: SQUARED — core controls/cards resolve to `border-radius: 0` (the dominant declaration);
  only pills are `999px`. Luxury minimalism.
- **Focus**: thin 2px solid OUTLINE; raw `outline: 2px solid var(--gray-400)` / `outline-offset: -2px`,
  darkened to the brand black for AA (see à confirmer).
- **Motion**: measured durations `.3s`/`.4s`/`.5s` with the signature easing
  `cubic-bezier(.42,0,.36,1.01)`; `a` (nav/CTA) transitions at `.4s`.
- **Fields**: warm-filled square box (`--form-input-background`, fill `#f8f2ed`, transparent border;
  dropdown 1px `--gray-450` rule); modelled `filled-underline`, native `<select>` chevron redrawn in
  black `#000000`.
- **Buttons**: primary = solid black `#000000` with white text; secondary = outlined black (transparent
  fill, warm-beige `#f1e4db` hover); CTAs uppercase + 0.2em tracking.
- **Tabs**: active = black uppercase label with a bottom black underline (`indicatorSide: "bottom"`,
  `indicatorMode: "border"`).
- **Pagination**: borderless black links; active page = filled black with white text.
- **Tags / badges**: squared (`radius: 0`); badge label uppercase. Tag background = warm beige `#f8f2ed`.

## Asset officiel
- Kering wordmark + owl emblem: use the official asset from the Kering brand resources (do **not**
  redraw). The identity is the minimalist "KERING" wordmark with the owl ("chouette") emblem, in
  black on white — no decorative graphic.
