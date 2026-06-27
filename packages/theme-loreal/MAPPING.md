# L'Oréal → Sentropic mapping

This package maps the **public** L'Oréal brand design onto the Sentropic token
structure (`TenantTheme`). Method = **measured-clone**: every value is taken
from L'Oréal's public corporate CSS (loreal.com — `/themes/LorealCorp/css/bundle.css`)
or, where noted, from the published L'Oréal master-brand charter. Only public
tokens and font *names* are referenced — no font binaries.

## Sources
- L'Oréal corporate site — https://www.loreal.com/en/
- Measured stylesheet — https://www.loreal.com/themes/LorealCorp/css/bundle.css (theme `LorealCorp`, v3.36.0)
- L'Oréal master-brand charter (colours/typography aggregators):
  - https://brandyhq.com/brand-guidelines/loreal/
  - https://kulr.app/brands/loreal
  - https://www.brandcolorcode.com/loreal

## Colour mapping

| Sentropic role | Source (measured / charte) | Value |
|---|---|---|
| `action.primary` / `text.primary` / `text.link` / `border.interactive` | `body{color}` / `a{color}` (MEASURED ink) | `#3d3d3d` |
| `action.primaryHover` / `surface.inverse` | `:focus-visible{outline:1px solid #000}` + master wordmark (MEASURED + charte) | `#000000` |
| `focus.color` | `:focus-visible` outline (MEASURED) | `#000000` |
| `buttonSecondary` (taupe pill) / `::selection` | `.btn{background:#cdc4ba}` (MEASURED) | `#cdc4ba` |
| taupe-dark (radio dot / hover) | `input__radio label:before{background:#afa192}` (MEASURED) | `#afa192` |
| `tag.neutralBackground` (cream) | warm off-white surface (MEASURED) | `#edecea` |
| `surface.subtle` / `action.secondary` / `field.fillBg` | light section background (MEASURED) | `#f5f5f5` |
| `surface.default` / `surface.raised` | white | `#ffffff` |
| `border.subtle` | rule / border grey (MEASURED) | `#d8d8d8` |
| `border.strong` / `text.muted` | strong border (MEASURED) | `#8e8e8e` |
| `text.secondary` | secondary copy (MEASURED) | `#6c6c6c` |
| accent (Sentropic `cyan`) | L'Oréal master gold (charte) | `#c09853` |
| `feedback.success` | green (MEASURED) | `#299929` |
| `action.danger` / `feedback.error` | deep red (MEASURED) | `#c2013a` |
| `feedback.info` | teal / dark blue (MEASURED) | `#014f6c` |
| `feedback.warning` | amber / gold (MEASURED) | `#e3a635` |
| `data.category5` | L'Oréal master purple (charte) | `#46166b` |

### "À confirmer" (derived / not directly measured)
- `gold.light` `#f4ead6` and `gold.dark` `#9a743a` — derived tints of the charter gold `#c09853`.
- `grey.900` `#1a1a1a` — derived darkest neutral.
- `feedback.warning` `#e3a635` — measured on the site but WCAG AA on white as *text* is unconfirmed (fine as a swatch/fill).
- The 8-colour categorical `data.*` palette — a coherent proposal from L'Oréal brand/site hues, not an official scale.
- `spacing.*`, `density.*`, `disabledOpacity`, `radius.lg`, `shadow.subtle/floating`, `mono` font — kept aligned with the Sentropic base; exact L'Oréal steps unconfirmed.
- `font.display = Halesworth` — Halesworth is a genuine L'Oréal @font-face (editorial serif). The corporate `h1/h2` inline use Helvetica Now Display; Halesworth is mapped to the *display* slot to capture the brand's serif/sans editorial duality (à confirmer which headings use it).
- Primary-action choice: the corporate `.btn` is a warm taupe pill with ink text. We map the L'Oréal **ink black** (`#3d3d3d`→`#000000`) to `action.primary` (the brand's black/white identity) and the taupe pill to `buttonSecondary`, so both signatures are represented.

## Typography
- **UI / body / headings** (`font.sans`, `typography.control/field/label`): `'HelveticaNowDisplay', Arial, Helvetica, sans-serif` — MEASURED `body` and `h1..h6,p,span`.
- **Editorial display serif** (`font.display`): `'Halesworth', 'Times New Roman', serif` — MEASURED brand @font-face (Halesworth-Medium/Bold).
- **Monospace** (`font.mono`): neutral system mono — no brand mono (à confirmer).
- Buttons carry a slight tracking (`letter-spacing:.05rem`); fields a finer tracking (`.0375rem`) — both MEASURED.
- Links are ink with **no default underline** (`a{text-decoration:none}`), unlike many gov systems.

## Anatomy signatures
- **Fields**: `field.style = "filled-underline"` — MEASURED `input{border:none; border-top:.0625rem solid rgba(61,61,61,.15); border-radius:0 0 0 .9375rem}` → a minimal filled field with a faint rule and a soft corner (modelled with a light `#f5f5f5` fill + `#d8d8d8` rule, 4px top corners), not a boxed outline.
- **Focus**: thin pure-black **outline** offset off the control — MEASURED `:focus-visible{outline:1px solid #000; outline-offset:4px; border-radius:4px}` (`focus.strategy = "outline"`, width `1px`, offset `4px`, color `#000000`).
- **Buttons**: primary = solid L'Oréal ink (`#3d3d3d` → `#000000` hover, white text); secondary = the signature **taupe pill** (`#cdc4ba` fill, ink text, `border-radius:1.375rem`, hover `#afa192`). Rect CTAs add a single asymmetric corner (`border-bottom-right-radius:.9375rem`) — a brand signature not fully expressible in the radius scale.
- **Radius**: 4px focus / soft 8px controls / 16px cards; CTAs go pill (`999px`). `radius.sm = 0.25rem` matches the MEASURED `:focus-visible` 4px corner.
- **Motion**: `.3s` transition with the MEASURED ease `cubic-bezier(0.63, 0.37, 0.55, 0.9)` on `.btn` / `a`.
- **Elevation**: warm-grey soft shadow — MEASURED `form-main-container box-shadow:-1px 2px 6px 2px #c7c0c0`.
- **Tabs / nav**: active tab = bold ink label with a bottom ink underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless ink links; active page = filled ink.

## Asset officiel
- The L'Oréal master logo is the **black wordmark** (pure `#000000`) — a clean
  sans-serif with the enlarged "O". Use the official wordmark asset; **do not
  redraw it**. Gold (`#c09853`) is a supporting charter accent.
