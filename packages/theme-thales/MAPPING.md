# Thales → Sentropic mapping

This package maps **Thales**' digital design language onto the Sentropic token
structure (`TenantTheme`). Method = **measured-clone** from the **live
production CSS** of [thalesgroup.com](https://www.thalesgroup.com/) (the Drupal
`thales` theme bundle, `/themes/custom/thales/dist/`): the action colour, navy,
aqua accent, neutral scale, feedback hues, typography choice and anatomy
signatures are read directly from the served rules. Only public token values and
font *names* are referenced — no font binaries. Values not exposed by the site
(light/dark tints, the muted/darkest neutral steps, motion, sm/lg densities) are
flagged `à confirmer`.

> **Important — anchors were logo/print, not web.** The commonly-cited
> `#171f69` (encycolorpedia), `#242B75` / `#5DBFD5` (brandcolorcode "Dark/Light
> Blue") hexes are **logo/print** references and are **absent** from the live
> web palette. The measured web identity is navy `#00005c` + vivid action blue
> `#0816a1` + light aqua `#87edff`.

## Sources
- Thales corporate site — https://www.thalesgroup.com/ (live production CSS, Drupal `thales` theme, measured)
- Brand colour reference (logo/print, cross-check) — https://www.brandcolorcode.com/thales-group ("Dark Blue" `#242B75`, "Light Blue" `#5DBFD5`)
- Logo hex reference (cross-check) — https://encycolorpedia.com/171f69 (cited as logo blue; absent from live CSS)
- Logo description — https://1000logos.net/thales-logo/
- brandfetch.com/thalesgroup.com — returns 403 (not retrievable without an authenticated browser)

## Colour mapping

| Sentropic role | Thales source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `secondaryText` / pagination/breadcrumb/tabs link | live `a{color:#0816a1}`, `.button-primary{background:#0816a1}` — vivid action blue | `#0816a1` |
| `action.primaryHover` | live active-state navy (`:active`/`:focus` link → `#00005c`) | `#00005c` |
| `action.primaryText` / pagination `activeText` | live `.button-primary{color:#f4f9fb}` | `#f4f9fb` |
| `surface.inverse` | live `.bg-dark{background-color:#00005c}` (navy dark surfaces) | `#00005c` |
| accent (`cyan` slot) | live `.bg-dark a{color:#87edff}` — navy→aqua gradient end | `#87edff` |
| `data.category3` | live indigo `#33337d` (dark-header borders, active menu) | `#33337d` |
| `surface.default` / `surface.raised` | page background | `#ffffff` |
| `surface.subtle` / `action.secondary` / card hover | live pale-blue background | `#f4f9fb` |
| `action.secondaryHover` | live light lavender divider | `#d9d9e7` |
| `border.subtle` / field stroke | live input `border:0.0625rem solid #c3c7c9` | `#c3c7c9` |
| `text.secondary` / `border.strong` | live secondary text / `::placeholder` / disabled bg | `#6f7273` |
| `text.muted` | derived darker neutral | `#54585a` *(à confirmer)* |
| `text.primary` | live `body{color:#252526}` | `#252526` |
| darkest neutral (`slate.90`) | live gradient extremity (navy-tinted) | `#02023f` *(à confirmer)* |
| `action.danger` / `feedback.error` | live error icon | `#e32700` |
| `feedback.success` | live status check icon | `#73b355` |
| `feedback.warning` | live warning icon | `#e29700` |
| `feedback.info` | = action blue (no published info hue) | `#0816a1` *(à confirmer)* |

> **Action blue vs navy — important distinction.** Thales separates the
> *interactive* blue **`#0816a1`** (links, primary CTA, focusable controls) from
> the **navy `#00005c`** used for **active/focus states and dark surfaces**
> (`.bg-dark`, gradients). Light **aqua `#87edff`** is the navy→aqua gradient end
> used for links/focus **on dark surfaces only** — it is parked in the Sentropic
> `cyan` accent slot and never used as an interactive colour on light
> backgrounds.

### À confirmer (derived or not publicly extracted)
- **`text.muted` `#54585a`** — derived darker step between secondary `#6f7273` and primary `#252526`; the live CSS exposes a single mid-grey.
- **Darkest neutral `#02023f`** (`slate.90`) — measured as a gradient extremity, navy-tinted rather than a true grey.
- **Derived tints** `blue.light #e7e9f6`, `aqua.light #e6fbff`, `aqua.dark #46c8e0` — lighter/darker steps for tint surfaces and the accent ramp; not directly served.
- **`feedback.info` `#0816a1`** — Thales publishes no distinct info hue; the action blue is reused.
- The **8-colour categorical `data.*`** palette (`#0816a1`, `#87edff`, `#33337d`, `#73b355`, `#e29700`, `#e32700`, `#6f7273`, `#00005c`) — a coherent proposal from the measured brand hues, not an official sequential scale.
- `shadow.*`, `motion.*`, and the sm/lg `density.*` paddings — not strongly tokenised on the live site; kept aligned with the Sentropic base / standard size scale.
- `focus.width 2px` / `offset 2px` — the live focus resolves to the navy emphasis; width/offset are the closest faithful expression.
- `radius.pill 999px` — Thales uses a `1.875rem` pill in places; `999px` keeps pills fully round across sizes.

## Typography
- **Display / titles** (`font.display`): **`'Saira'`** — live `font-family:saira,sans-serif`, served via `@font-face` (`saira-Light.woff2` / `saira-ExtraLight.woff2`), titles often `font-weight:200` (extra-light thin geometric face). Inter is the fallback.
- **Body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'Inter'`** — live `body{font-family:inter,sans-serif;font-weight:400;letter-spacing:-.0125rem;line-height:1.4;color:#252526}`; button labels use Inter 600.
- The tight body **`letter-spacing:-0.0125rem`** and **`line-height:1.4`** are carried into `typography.control/field/label`.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- **Links**: action blue `#0816a1`, **underlined at rest** (`a{text-decoration:underline}`), staying underlined on hover.
- Font *names* only — no binaries are bundled or network-loaded by this package.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#c3c7c9` border, **6px** `0.375rem` radius — measured `border:0.0625rem solid #c3c7c9`). Native `<select>` chevron redrawn in action blue `#0816a1`.
- **Focus**: high-contrast **outline** in navy `#00005c` (`focus.strategy = "outline"`, width `2px`, offset `2px`).
- **Radius — asymmetric signature**: the live buttons use `border-radius: 0 0.625rem` (10px on top-right + bottom-left, the other two square — a diagonal arc that echoes the logo's circle/arc). The single-value Sentropic radius schema **cannot express** this asymmetric corner, so `radius.md = 0.375rem` (measured input radius) and `radius.lg = 0.625rem` (the button corner *magnitude*) are used; the asymmetry is documented here as a known fidelity gap. Other measured corners on the live site: `1.25rem 0`, `0 1.25rem`, `1.375rem 1.375rem 0 0`, `0 0 2.75rem 2.75rem` — always one/two rounded corners, never four uniform; `50%` reserved for circles (bullets, avatars).
- **Buttons**: primary = solid action blue `#0816a1` with off-white `#f4f9fb` text → hover navy `#00005c`; secondary = **outlined action blue** (transparent fill, `#0816a1` border + text, pale-blue `#f4f9fb` hover fill — *à confirmer*).
- **Tabs / top-nav**: active tab = bold action-blue label with a bottom underline (`indicatorSide: "bottom"`, `indicatorMode: "border"` — *à confirmer*).
- **Pagination**: borderless blue links; active page = filled action blue `#0816a1` with off-white text.

## Asset officiel
- Thales logo = the **THALES wordmark** (geometric sans capitals, slightly arched horizontal bars) where the **"A" crossbar is replaced by a blue circle/point**; the modern web expression plays the **navy `#00005c` → aqua `#87edff` gradient**. Use the official SVG/PNG from the brand — **do not redraw the logo by hand**. This package only references font *names* (Inter, Saira) and measured token values, never logo artwork or font binaries.
