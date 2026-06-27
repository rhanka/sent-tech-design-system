# Hermès → Sentropic mapping

This package maps the **public** corporate design of [hermes.com](https://www.hermes.com/) onto the
Sentropic token structure (`TenantTheme`). Method = **measured clone**: the neutral palette,
typography, radius, focus and CTA signatures are measured from the brand's public compiled CSS
(the live stylesheet `hermes.620c038483fabdf1.css` + the `/us/en/` homepage HTML, June 2026).
Only public CSS values and font *names* are referenced — no font binaries. Any value not directly
measured is flagged "à confirmer".

> Key measured fact: the Hermès UI chrome is **pure black-on-cream** — `body{background-color:#f6f1eb;color:#000}` —
> and there is **zero orange in the compiled CSS/HTML**. The famous Hermès orange lives only in
> photography/packaging, so the brand orange `#f37021` is sourced from public brand charts (à confirmer)
> and used here as the primary **accent** (orange CTAs on cream), mirroring how the real brand reserves
> orange for emphasis rather than chrome.

## Sources
- Hermès site — https://www.hermes.com/us/en/
- Compiled CSS (measured) — `https://www.hermes.com/us/en/hermes.620c038483fabdf1.css` (fetched with a browser UA + referer; the static asset was not blocked) + `/us/en/` homepage HTML inline styles.
- Brand orange cross-check (chart, NOT in site CSS) — https://www.brandcolorcode.com/hermes (states the values are "closest numbers", not from official guidelines); corroborated at https://encycolorpedia.com/f37021 and https://seekcolors.com/brand/hermes-group/ (notes Hermès publishes no official Pantone; EUIPO refused a colour trademark in 2005).

## Colour mapping

| Sentropic role | Hermès source | Value | Status |
|---|---|---|---|
| `surface.subtle` / `action.secondary` / cream bg | `body{background-color:…}` | `#f6f1eb` | MEASURED |
| `surface.default` / `control.background` | lightest cream (cards/inline) | `#fffcf7` | MEASURED |
| mid cream surface | section/card cream | `#fcf7f1` | MEASURED |
| `surface.raised` / `field.fillBg` | white | `#ffffff` | MEASURED |
| `text.primary` / `text.link` / `surface.inverse` / `border.strong` / `border.interactive` / `focus.color` | `body{color:#000}` / `outline:2px solid #000` | `#000000` | MEASURED |
| light grey surface | `background-color:#f5f5f5` | `#f5f5f5` | MEASURED |
| `action.primary` / `pagination.activeBackground` / `tabs.indicator` / `data.category1` (Sentropic `cyan.50`) | Hermès Orange — Pantone 158 C, `rgb(243 112 33)` | `#f37021` | **à confirmer** (chart-derived; absent from site CSS) |
| `text.secondary` / `data` grey | DOM editorial grey | `#444444` | à confirmer (DOM, not core token) |
| `text.muted` / `breadcrumb` / `data.category7` | DOM editorial grey | `#696969` | à confirmer (DOM) |
| `slate.80` (charcoal) | DOM editorial near-black | `#2e2d2d` | à confirmer (DOM) |
| `border.subtle` (slate.20) / `action.secondaryHover` | warm taupe hairline | `#e3dccf` | à confirmer (derived) |
| `action.danger` / `feedback.error` / `data.category5` | brick red | `#9d2a1e` | à confirmer (derived; a `#9d2a1e` brick appears in DOM) |
| `feedback.success` / `data.category3` | forest green | `#3f7344` | à confirmer (derived — Hermès publishes none) |
| `feedback.warning` / `data.category6` | amber | `#a8620f` | à confirmer (derived) |
| `feedback.info` / `data.category4` | slate blue | `#2f5d7c` | à confirmer (derived) |
| `data.category8` | warm taupe | `#b0a18a` | à confirmer (derived) |

## À confirmer (derived / not directly measured)
- **`action.primary` `#f37021`** — the headline Hermès orange. NOT in the live site CSS; sourced from
  public brand charts (Pantone 158 C is contested vs 1448; Hermès publishes no official Pantone).
  Treated as the working primary accent, flagged uncertain. `cyan.10 #fbe2d3` / `cyan.70 #d85f15` are
  derived light/dark steps of it.
- **System palette (`feedback.success/warning/error/info`)** — Hermès publishes **none**; these are
  derived WCAG-AA-on-white values tuned to the warm luxury palette (forest `#3f7344`, amber `#a8620f`,
  brick `#9d2a1e`, slate `#2f5d7c`).
- **Greys `#444444` / `#696969` / `#2e2d2d`** — present in the homepage DOM (inline editorial styles)
  but not in the core token block; used for `text.secondary/muted` + charcoal.
- **`field.style = "outline"`** with white fill, square corners — the editorial home exposes few styled
  inputs; the squared minimal outline matches the measured `border-radius: 0`, but the exact field box
  (outline vs underline-only) is à confirmer.
- **`density.*`** heights/paddings — derived to express Hermès' airy editorial rhythm.
- **`motion`** — `normal 400ms` + easing `cubic-bezier(.25,.8,.25,1)` are MEASURED on the live CSS but
  are Angular Material defaults (framework-derived, not a deliberate brand signature); `fast`/`slow` are
  derived steps.
- **`shadow.*`** — derived ink-tinted elevation (the site is largely flat with thin rules).
- **`link` hover underline, `disabledOpacity 0.4`, `label`/`control` uppercase tracking** — derived to
  follow the measured uppercase-CTA signature.
- **8-colour categorical `data.*`** — a coherent proposal from the brand + derived hues, not an official scale.

## Typography (font names only)
Hermès loads **open-source webfonts** (not a single proprietary face). Measured `@font-face` + `:root` vars:
- **Body / UI / CTA** (`font.sans`, `typography.control/field/label`): **Manrope** — CSS var
  `--font-primary: "Manrope","Roboto",sans-serif` (variable woff2 actually loaded). [MEASURED]
- **Editorial / display serif** (`font.display`): **EB Garamond** — CSS var
  `--font-edito: "EBGaramond","Bell MT","Times New Roman",…` (regular + italic variable woff2). [MEASURED]
- **Small labels / meta / mono** (`font.mono`): **Overpass Mono** — CSS var
  `--font-secondary: "Overpass Mono","Gill Sans MT",calibri,…`. [MEASURED]
- Specialty display faces declared as vars but loaded only on specific editorial pages (not on the
  homepage): `--font-filosofia:"Filosofia"`, `--font-akkurat:"Akkurat"`, and Hermès custom display cuts
  `--font-jungle-love:"Jungle-Regular"`, `--font-brides-de-gala:"BridesdeGala-Regular"`,
  `--font-mors-a-jouet:"Mors-Regular-Auto"`. Names only; not used here. [MEASURED names — à confirmer usage]
- **CTA signature (measured)**: `text-transform:uppercase` used widely, with light `letter-spacing`
  (`0.5–1px` on caps) — encoded as uppercase + `0.04em` (control) / `0.08em` (label) tracking.

## Anatomy signatures (measured unless noted)
- **Radius**: SQUARED — controls/cards `border-radius: 0` (only `0` and `50%` for circular dots appear).
  Luxury minimalism. [MEASURED]
- **Focus**: 2px solid black OUTLINE — `outline:2px solid #000` + `outline-offset:3px`. [MEASURED]
- **Fields**: squared outline (white fill, 1px hairline, radius 0); native `<select>` chevron redrawn in
  black `#000000`. [MEASURED radius; box-vs-underline à confirmer]
- **Buttons**: primary = solid Hermès orange `#f37021` with **black** text (~7:1 AA — orange is light);
  secondary = outlined black (transparent fill, cream `#f6f1eb` hover); CTAs uppercase + light tracking.
- **Tabs**: active = bold **black** label with a bottom underline; `createComponent` draws the indicator
  filet in the brand accent → **orange** (a sparing accent touch, on-brand).
- **Pagination**: borderless black links; active page = filled orange with black text.
- **Tags / badges**: squared (`radius: 0`); badge label uppercase, black fill with cream text.
- **Motion**: `.4s` transitions, easing `cubic-bezier(.25,.8,.25,1)` — measured but Angular Material
  framework defaults (à confirmer as a deliberate signature).

## Asset officiel
- Hermès identity = the **"Duc attelé, groom à l'attente"** emblem (single horse + high-spring carriage +
  waiting groom) adopted in 1950, with the serif all-caps **"HERMÈS PARIS"** wordmark added in the 1970s.
  Use the official asset from the Hermès brand/press resources — do **not** redraw. The live header logo is
  an inline SVG under hermes.com; the canonical vector is best sourced from the brand kit.
