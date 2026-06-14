# CGI → Sentropic mapping

This package maps **CGI Inc.** (cgi.com — the Montréal-headquartered global IT and
business consulting firm) onto the Sentropic token structure (`TenantTheme`).
Every value here is **measured from CGI's live stylesheet bundle**
(`cgi.com/sites/default/files/css/*`), with hex frequencies counted across the
compiled CSS. Only font *names* are referenced (`"Source Sans Pro"` for body,
`"Nunito Sans"` for headings — measured from the site's `font-family`
declarations), never font binaries.

CGI's **modern identity is PURPLE-led**: the dominant brand hex is a deep violet
**`#5236ab`** (measured **252×**) that drives every primary action, links and the
interactive border; hover/active deepen to a near-black indigo **`#200a58`**
(measured **42×**); a brighter **`#7a5aed`** is the lifted variant. CGI's
**classic red `#e41937`** (measured **87×**) is its **heritage accent** — used
here as `action.danger` AND a data/accent colour. Surfaces are **white** on a
faint grey page; ink is a **near-black `#151515`**; secondary text is a measured
**teal-grey `#407080`**; corners are **tight** (4px on controls); form fields are
**boxed outlines** (white fill, 1px `#d2d2d2` stroke, 4px radius); focus is a
**2px purple outline `#5236ab`**.

## Sources
- CGI compiled stylesheet bundle (measured) — `https://www.cgi.com/sites/default/files/css/*`
  (hex frequencies counted across the compiled CSS; brand purple `#5236ab` 252×,
  classic red `#e41937` 87×, deep indigo `#200a58` 42×, plus computed
  `font-family` declarations).
- Brand purple / heritage red confirmed externally — CGI visual identity (the
  modern purple wordmark and the classic CGI red).

## Colour mapping

| Sentropic role | CGI source (measured) | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` / brand | dominant brand purple (252×) | `#5236ab` |
| `action.primaryHover` / `surface.inverse` | deep indigo (42×) | `#200a58` |
| bright purple (lifted / data) | measured bright variant | `#7a5aed` |
| magenta-purple (accent / data) | measured magenta-purple | `#762f8f` |
| `action.secondary` / tag fill / secondary button surface | measured light purple tint | `#ece9f6` |
| card hover / faintest brand surface | measured subtle purple-white | `#f8f8fc` |
| `action.danger` / `feedback.error` / heritage data accent | classic CGI red (87×) | `#e41937` |
| `text.primary` | measured near-black ink | `#151515` |
| `text.secondary` / `feedback.info` | measured teal-grey | `#407080` |
| `text.muted` / `border.strong` | measured grey | `#767676` |
| `surface.default` / `surface.raised` / `*.inverse` text / `action.primaryText` | measured white | `#ffffff` |
| `surface.subtle` | measured page grey | `#f8f8f8` |
| `border.subtle` (field stroke) | measured 1px stroke | `#d2d2d2` |
| `surface.overlay` | near-black ink at 60% | `rgb(21 21 21 / 0.6)` |

## "À confirmer" (derived / no single measured source)
- **`text.muted` `#767676`** — measured grey present in the CSS; assigned to the
  muted text role (also used for `border.strong`).
- **`feedback.info` `#407080`** — reuses the measured teal-grey secondary ink as
  the info accent (AA-safe on white); CGI does not publish a distinct info hue.
- **`feedback.success` `#2e7d32`** / **`feedback.warning` `#b26a00`** — AA-safe
  green/amber chosen for the success/warning roles CGI does not publish cleanly.
- **`data.category7` `#009ee0` (cyan)** and **`data.category8` `#b26a00` (amber)**
  — completing the 8-colour categorical scale; the cyan accent and amber are
  plausible but not confirmed from a single published token.
- **The Sentropic `cyan` foundation family** — CGI has no clean cool accent
  distinct from purple; the `cyan` slot maps the measured `#009ee0` (mid) between
  the light purple tint and deep indigo (à confirmer).
- **`action.secondaryHover` / `buttonSecondary.hoverBackground` `#d9d0f0`** — a
  slightly deeper step of the measured light purple tint `#ece9f6` for hover.
- **`shadow.*`, `motion.*`, `spacing.*`, `density.*`** — not separately tokenised
  publicly by CGI; a soft neutral elevation ramp and the base 4px spacing/density
  steps are kept aligned with the Sentropic base.

## Typography
- **Body / UI / fields** (`font.sans`, `typography.control/field/label`):
  **`"Source Sans Pro"`** — measured **84×** in the compiled CSS, with a
  `system-ui, sans-serif` fallback. Base type **16px**; control labels semibold
  (600), body/field text regular (400).
- **Headings** (`font.display`): **`"Nunito Sans"`** — measured **49×**, with a
  `sans-serif` fallback.
- **Links**: brand purple `#5236ab`, underlined on hover (measured anchor colour).
- **Monospace** (`font.mono`): not part of CGI; a `ui-monospace`-led Sentropic
  mono stack is kept.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white fill, **1px** grey
  stroke `#d2d2d2`, **4px radius**), not a filled-underline. Native `<select>`
  chevron redrawn in the brand purple `#5236ab` with a ~36px gutter
  (`appearance: none`).
- **Radius**: tight rounding — measured **sm 3px**, **md/lg 4px**, **none 0**,
  **pill 999px** (measured ~30px pills). Controls use 4px; CGI does not step cards
  up beyond 4px.
- **Borders**: field/select strokes **1px solid** `#d2d2d2`; strong borders
  `#767676`; brand accent `#5236ab`.
- **Focus**: brand-**purple outline** (`focus.strategy: "outline"`, **2px**,
  offset 2px, `#5236ab`).
- **Buttons**: primary = **solid CGI-purple fill, white semibold text** (hover
  deep indigo `#200a58`); secondary = **light purple fill** `#ece9f6` with
  brand-purple `#5236ab` text.
- **Tabs / sub-nav**: active = bold **purple** label with a **purple bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless purple links; active page = **filled brand-purple
  square**, white text.
- **Tags / badges**: **pill** (`radius: 999px`) — light-purple-fill tags with
  brand-purple ink; brand-purple filled badges with white text.
- **Density**: 16px base type, semibold 600 control labels, comfortable
  whitespace, soft neutral elevation.

## Asset officiel
- CGI wordmark (modern purple logotype) and the classic red square mark, served
  from the site header as official assets on cgi.com. **Do not redraw** — reuse
  the official CGI logo asset if a logo is needed.
