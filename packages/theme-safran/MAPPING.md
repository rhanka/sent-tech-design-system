# Safran → Sentropic mapping

This package maps **Safran**'s brand design onto the Sentropic token structure
(`TenantTheme`). Method = **measured-clone**: every value is taken from Safran's
**public live theme stylesheet** (`themes/custom/safran_fo/public/css/main.css`,
~1.3 MB) and the official logo SVGs, captured from safran-group.com via the
Wayback Machine snapshot **2026-06-17** (the live origin sits behind Cloudflare).
Only measured token values and font *names* are referenced — no font binaries,
no logo artwork. Values Safran does not expose as exact tokens (light tints,
sm/lg densities, shadow specs) are flagged `à confirmer`.

> **Anchors vs live — important.** Third-party aggregators quote Safran's blue as
> "Curious Blue" **#1999D4** (brandcolorcode) / **#3A9FD6** (coloropedia) and its
> grey as "Comet" **#4F5468 / #51546A**. These **contradict the live CSS** and
> are NOT used. The measured live blue is **#3B87CC** (260 occurrences) and the
> measured grey is **#525668** (body text + logo wordmark `.st0` fill, which sits
> almost exactly between the two aggregator greys). This package clones the live
> measurement, not the aggregators.

## Sources
- Safran live theme CSS (measured) — `https://web.archive.org/web/20260617153045/https://www.safran-group.com/` → `themes/custom/safran_fo/public/css/main.css`
- Safran official logo SVGs (measured) — `…/safran_fo/public/images/logo.svg`, `logo-white.svg`
- Brand colour references (cross-check, **refuted by live**) — https://www.brandcolorcode.com/safran (#1999D4 / #4F5468), https://coloropedia.com/safran-colors-logo-codes/ (#3A9FD6 / #51546A)
- Logo descriptions (cross-check) — https://logotyp.us/logo/safran/ , https://logos-world.net/safran-logo/ , https://1000logos.net/safran-logo/

## Colour mapping

| Sentropic role | Safran source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` / `pagination` | measured CTA gradient **mid-stop** (AA on white, 5.87:1) | `#1767AD` |
| `action.primaryHover` | measured CTA gradient **origin** (deep) | `#073A7C` |
| accent (`cyan` slot) / `feedback.info` / `focus.color` | measured **bright brand blue** (live link/CTA, 260×) | `#3B87CC` |
| light accent (`data`) | measured light blue (43×) | `#7FB8E7` |
| logo light / dark stops (`cyan` 10 / 70) | measured `logo.svg` gradient stops | `#9DCEEA` / `#2257A1` |
| `surface.default` / `surface.raised` | surface default | `#ffffff` |
| `surface.subtle` / `control.hoverBackground` | measured off-white (65×) | `#F9FAFC` |
| `border.subtle` / field stroke | measured input border | `#BCBFCF` |
| `text.muted` / `border.strong` / `action.secondary` | measured mid grey-blue (88×) | `#84899F` |
| `text.secondary` | measured brand grey (132× + logo wordmark `.st0`) | `#525668` |
| `text.primary` / `accordion`/`tag`/`choice`/`toggle` label | measured near-black navy (132×) | `#1B1D27` |
| `surface.inverse` | measured deep navy (dark sections) | `#141D29` |
| darkest neutral (`slate` 90) | measured deepest navy | `#070E1D` |
| `feedback.success` / `status.completed` | measured success green (16×) | `#32D970` |
| `feedback.warning` / `action.danger` / `feedback.error` / `status.failed` | measured rust (18× — warning AND error) | `#C6541C` |

> **Two blues — interactive vs bright.** Safran's live CTA is a blue gradient
> `45deg #073A7C → #1767AD → #3B87CC`. The bright top-stop **#3B87CC** is the
> most-used live blue (links, hovers, focus borders) but scores only **3.80:1**
> on white → it **fails WCAG AA for normal text** (it passes UI / large-text
> ≥3:1). The mid-stop **#1767AD** scores **5.87:1** → AA. We therefore wire the
> interactive *text* roles (primary action, links, borders, tabs, pagination) to
> the on-brand AA blue **#1767AD**, and park the bright **#3B87CC** in the accent
> (`cyan`) slot + focus indicator + data-vis — mirroring the brand's own use of
> the lighter blue as the decorative gradient/logo blue.

### À confirmer (derived or not publicly tokenised)
- **WCAG action-blue darkening** — the live link/action blue is **#3B87CC** (3.80:1, fails AA normal text). We promote the measured AA-safe gradient mid-stop **#1767AD** (5.87:1) to all interactive text roles. The bright #3B87CC is retained for the focus indicator (a non-text indicator only needs ≥3:1) and accent/data-vis.
- **`error` = `warning` = `#C6541C`** — Safran publishes **no distinct error red**; the live theme uses the single rust `#C6541C` for both warning and error (`.c-input--warning{border-color:#C6541C}`). Both roles map to it faithfully.
- **`focus.strategy = "inset"`, width `2px`** — the live focus *recolours the control's own 1px border* to #3B87CC (no external glow). The closest faithful token technique is a tight inset ring (offset 0) on the control edge; width is bumped 1px→2px for accessible focus visibility.
- **Light blue tint `#e8f1fb`** (`blue.10`) — derived lightest tint for hover fills; not a published token.
- **`surface.inverse` `#141D29` / darkest `#070E1D`** — measured dark-section navies; chosen as the dark inverse surface and the darkest neutral respectively.
- **8-colour categorical `data.*`** (`#1767AD`, `#3B87CC`, `#32D970`, `#C6541C`, `#073A7C`, `#7FB8E7`, `#525668`, `#84899F`) — a coherent proposal from the measured brand hues, not an official sequential scale.
- **Card radius `4px`** (`radius.lg`) — Safran inputs are square and buttons ~4px; cards kept at the small 4px for a sharp identity (no explicit card token measured).
- `shadow.*`, `motion.*`, the sm/lg `density.*` paddings, and `disabledOpacity` — not strongly tokenised publicly; kept aligned with the Sentropic base / standard size scale.
- **`<select>` chevron colour `#525668`** — redrawn in the brand grey; the live native chevron colour was not separately measured.

## Typography
- **Display / titles** (`font.display`) and **body / controls / fields / labels**
  (`font.sans`, `typography.control/field/label`): **`'Barlow', Arial, Helvetica,
  sans-serif`** — measured `html{font-family:'Barlow',Arial,sans-serif}` plus
  200+ Barlow declarations on headings and UI. Barlow is open source (Google
  Fonts); only the *name* is referenced.
  - Note: the live `body` carries a legacy `font-family:Arial …!important`
    override, but the brand intent expressed everywhere else is Barlow; Barlow is
    the brand UI typeface and `Arial, Helvetica` is its fallback.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- **Logo wordmark** = a frozen proprietary vector lettering (slightly inclined,
  rounded angles), **not** Barlow and **not** a web font — never referenced here.
- Links: recolour to the brand blue and underline on hover (measured
  `a:hover{color:#3b87cc}`); exposed at rest as the AA action blue `#1767AD`.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs with **square corners**
  (`radiusTop/Bottom = "0"`), white `#ffffff` fill, 1px `#BCBFCF` border
  (measured `border:solid .1rem #BCBFCF; border-radius:0; background:#fff`).
  Native `<select>` chevron redrawn in brand grey `#525668`.
- **Focus**: `focus.strategy = "inset"`, width `2px`, offset `0`, colour bright
  brand blue `#3B87CC` — the live focus recolours the control border to #3B87CC
  with no external ring; encoded as a tight inset ring on the control edge.
- **Radius**: inputs **square** (`0`); buttons / tabs / cards `4px`
  (`radius.sm/md/lg = 0.25rem`, measured `.4rem` at root `font-size:62.5%`);
  pills/tags `999px`. A sharp, precise aerospace geometry.
- **Buttons**: primary = the blue CTA gradient flattened to the AA mid-stop
  `#1767AD` → hover deep `#073A7C`, white label; secondary = **solid grey-blue**
  `#84899F` fill (white label) → hover `#525668`.
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline
  (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled action blue `#1767AD`.

## Asset officiel
- Safran logo = a **stylised "S" suggesting a spinning propeller / turbine**
  (smooth curves wrapped by two thin strokes that imply a circle — a sense of
  flight/motion), rendered as a **light-to-deep blue gradient** (measured stops
  `#9DCEEA / #87B9DD / #7FB8E7` → `#2257A1 / #2459A2 / #1261A3`) + the **SAFRAN
  wordmark** filled solid grey `#525668` (`.st0`). A `logo-white.svg` knockout
  (solid `#ffffff`) exists for dark/photo backgrounds. Use the official SVG/PNG
  from the brand — **do not redraw the logo by hand**. This package references
  only font *names* (Barlow) and measured token values, never logo artwork or
  font binaries.
