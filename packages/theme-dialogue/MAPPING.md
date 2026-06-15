# Dialogue → Sentropic mapping

This package maps **Dialogue** (dialogue.co — the Montréal virtual-care /
well-being platform) onto the Sentropic token structure (`TenantTheme`).
Dialogue's marketing site is a **HubSpot theme** ("Dialogue_May2020") that ships
**no `--*` design-token custom properties**. Every value here is therefore
**measured directly from the live, served CSS rules** — the template stylesheet
plus the header/menu module bundles — read from real element selectors (`body`,
`h1`–`h6`, `a`, the `.custom-blue-btn` / `.hs-button.primary` CTAs, the global
`input/textarea/select` field block, the `.c--secondary` text class and the
`#DDD7E0` dividers). Only the font *names* are referenced (`"Roboto"` body +
`"Poynter Oldstyle Disp Semi Bd"` display), never font binaries.

Dialogue's identity is a **calm, human health-tech** system — but the brand it
actually ships is **warmer than a generic clinical teal/green**: a **terracotta /
coral `#dd7146`** carries links and the marketing CTAs; ink is a **soft near-black
`#212120`** (never pure black); the secondary voice is a **purple-navy `#534f70`**
with a soft **lavender-grey muted `#7e79a3`**; surfaces are **white** over a faint
**lavender page `#f9f7fa`** with a warm **cream accent panel `#ffefe2`**; corners
are **softly rounded** (pill 30px CTAs, ~5px small controls); headings are set in
the serif **"Poynter Oldstyle Display Semi Bold"** while body/UI is **Roboto**;
form fields are **filled-underline** (white fill, a single bottom rule that turns
the brand's bright **blue `#1fa5ff`** on focus/hover) and that same bright blue is
the brand's **interactive / focus accent** (also the text-selection highlight).

> **Brief note.** The build brief expected a "calm trustworthy palette
> (teal/green/blue)". The *measured* Dialogue brand is warmer (coral + lavender +
> cream, with a bright-blue interactive accent). Per the measured-clone rule of
> gold, this theme honours the **measured reality**, not the expected stereotype.

## Sources
- Dialogue homepage (served HTML) — https://www.dialogue.co/
- **Template stylesheet (measured)** —
  `.../template_assets/1/29906660733/.../template_Dialogue_May2020-style.css`
  (the canonical theme CSS: `body`, `h1`–`h6`, `a`, `.custom-blue-btn`,
  `.hs-button.primary`, global `input/textarea/select` block, `.c--secondary`,
  `#DDD7E0` dividers, `::selection`).
- **Header / login-menu modules (measured)** —
  `module_Dialogue_Aug2022_Menu.min.css`, `module_Dialogue_May2021_Login_Menu.min.css`
  (dark ink `#212120/#212020` header, coral `#dd7146` login accent, cream `#ffefe2`).
- **Fonts (measured `@font-face` / `font-family`)** — "Roboto" (body/UI) and the
  proprietary serif "Poynter Oldstyle Disp Semi Bd" (PoynterOSDisp Semibold,
  served from the theme's `Code Files/`), used on every heading and the CTA label.

## Colour mapping

| Sentropic role | Dialogue source (measured CSS) | Value |
|---|---|---|
| `action.primary` / `text.link` / `breadcrumb.linkText` / `tabs.activeText` / brand | `a {color}` + `.custom-blue-btn {background-color}` | `#dd7146` |
| `action.primaryHover` | `.custom-blue-btn:hover {background-color}` (darkens to ink) | `#212120` |
| (lighter coral) | `.custom-orange-btn {background-color}` | `#f79574` |
| (coral wash) | coral `background-color` / `border-color` | `#fabaa4` |
| `text.inverse` / `action.primaryText` / cream panel | `.custom-blue-btn:hover {color}` / panel `background` | `#ffefe2` |
| `border.interactive` / interactive + focus accent | `input:focus/​hover {border-bottom-color}` | `#1fa5ff` |
| (selection highlight) | `::selection {background}` | `#3399ff` |
| (deeper blue / info) | darker bright-blue step | `#008deb` |
| `text.primary` / headings / `surface.inverse` | `body` + `h1`–`h6` `{color}` / dark menu+CTA bg | `#212120` |
| `text.contrast` (rare) | pure black | `#000000` |
| `text.secondary` | `.c--` / nav secondary text (purple-navy) | `#534f70` |
| `text.muted` / `border.strong` | `.c--secondary` / `.custom-logo {color}` (lavender-grey) | `#7e79a3` |
| `surface.default` / `surface.raised` | `input`/card `{background-color}` | `#ffffff` |
| `surface.subtle` / `card.hoverBackground` | section `{background-color}` (lavender page) | `#f9f7fa` |
| `border.subtle` | `border-top/​bottom: 1px solid` dividers (lavender) | `#ddd7e0` |
| (neutral grey) | mid grey | `#c4c4c4` |
| `surface.overlay` | modal backdrop (soft-black-tinted, ≈ 60%) | `rgb(33 33 32 / 0.6)` |

### "À confirmer" (derived / no single published source)
- **`feedback.*` (`success #1f9d6b`, `warning #b07a1a`, `error #c0392b`)** —
  Dialogue's marketing CSS publishes **no semantic status palette**. These are
  WCAG-AA-on-white health-tone derivations (calm green / amber / red); `info` uses
  the measured bright blue `#008deb`. `action.danger` reuses `error`.
- **The Sentropic `cyan` accent family** — mapped onto Dialogue's measured **bright
  interactive blue** `#1fa5ff` (the field-focus hue) — a genuine cool accent,
  distinct from the coral brand.
- **`action.secondary` `#f9f7fa` / `secondaryHover` `#ddd7e0`** — the neutral
  lavender surface (Dialogue's true "secondary" CTA is an outlined coral ghost,
  captured in `buttonSecondary`; the lavender fill is a sensible default for the
  generic secondary surface role).
- **The 8-colour categorical `data.*` palette** — Dialogue publishes no
  categorical token list. The scale is assembled from the measured brand hues
  (coral, bright blue, purple-navy, calm green, the coral washes, the muted
  lavender) for a warm, human health-tech ramp.
- **`shadow.*`** — no published elevation tokens; a soft 3-step ramp tinted with
  the purple-navy ink.
- **`motion.*`, `spacing.*`, `disabledOpacity`, `radius.{sm,lg}`** — the site uses
  `transition: linear .4s` (CTAs) / `.15s ease-in-out` (fields) and an 8px-ish
  rhythm (measured 16/24/32px paddings); exact steps are not separately tokenised,
  kept aligned with the base (`radius.md 5px` and `pill 999px` ARE measured).

## Typography
- **Body / UI / fields** (`font.sans`, `typography.field`, `typography.label`):
  **`"Roboto"`** — measured `body { font-family: 'Roboto', sans-serif }`, base
  **16px**, fields **14px / 400**. Labels Roboto **500**.
- **Headings + marketing-CTA label** (`font.display`, `typography.control`): the
  proprietary serif **`"Poynter Oldstyle Disp Semi Bd"`** — measured on every
  `h1`–`h6` and on `.custom-blue-btn { font-family: 'Poynter Oldstyle Disp Semi
  Bd', serif }`. Headings are set at regular weight (the display face carries its
  own heaviness): measured **H1 72px / 80px LH**, **H2 42px / 50px**, **H3 36px /
  40px**, all `color: #212120`, `font-weight: 400`.
- **Links** are **coral with no underline at rest** (measured `a {
  text-decoration: none; color: #dd7146 }`); they darken to the ink `#212120` on
  hover (underline on hover for affordance).
- **Monospace** (`font.mono`): not part of Dialogue; the Sentropic mono stack kept.

## Signatures anatomiques
- **Fields**: `field.style = "filled-underline"` — measured global `input/textarea/
  select` is white-filled with **only a bottom border** (`border-top/left/right:
  none`), invisible at rest and turning the brand bright blue **`#1fa5ff`** on
  **`:focus`/`:hover`** (`underlineMode: "border"`). 14px Roboto, square corners.
  Native `<select>` chevron redrawn in the soft-black ink `#212120` with a ~36px
  gutter (`appearance: none`).
- **Focus**: bright-blue (`focus.strategy: "ring"`, ~3px, `#1fa5ff`) — encodes the
  real field-focus blue. Deliberately **blue, not the coral brand**, so the ring
  stays visible on coral controls.
- **Radius**: soft rounding — marketing CTAs are **full pills** (measured
  `border-radius: 30px` → `pill 999px` role); small controls/cards use **~5px**
  (`radius.md`, the most common measured value); filled-underline inputs are
  square.
- **Buttons**: primary = **solid coral fill `#dd7146`, cream text `#ffefe2`, serif
  label** (measured `.custom-blue-btn`, hover darkens to `#212120`); the form
  `.hs-button.primary` is the inverse (dark `#212120` fill / cream text) — both
  share the pill + serif label signature. Secondary = **outlined coral ghost**
  (transparent fill, coral `#dd7146` border + text, cream `#ffefe2` hover).
- **Tabs / sub-nav**: active = bold **coral** label with a **coral bottom
  indicator** (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless coral links; active page = **filled coral pill**,
  cream text.
- **Tags / badges**: **pill** (`radius: 999px`) — cream-fill / coral-ink tags;
  coral-filled badges with cream text.
- **Density**: 16px base Roboto body, serif display headings, ~58px pill CTAs,
  compact 14px fields; airy whitespace on lavender/white; soft purple-tinted
  elevation.

## Asset officiel
- Dialogue wordmark logo, served as an official SVG from the site:
  `https://www.dialogue.co/hubfs/logo.svg`
  (footer variant: `https://f.hubspotusercontent30.net/hubfs/5213739/logo-footer.svg`).
  **Do not redraw** — reuse the official Dialogue logo asset if a logo is needed.
