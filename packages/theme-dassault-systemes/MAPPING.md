# Dassault Systèmes → Sentropic mapping

This package maps **Dassault Systèmes (3DS)** brand design onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: the colour palette,
typography choice and anatomy signatures are **measured from the live public
website CSS** (`www.3ds.com` — the frontend-toolbox stylesheet and the
3ds-navigation font stylesheet) and cross-checked against the documented
corporate blue (branding.3ds.com, encycolorpedia, pickcoloronline). Only public
token values and font *names* are referenced — never font binaries or logo
artwork. Values 3DS does not expose as exact published hexes (the full neutral
text scale, hover/light tints, motion/shadow specs) are flagged `à confirmer`.

## Sources
- Dassault Systèmes website (measured CSS) — https://www.3ds.com/ (live frontend-toolbox `full-scoped.min.css`, `entry.*.css`, and `statics/3ds-navigation/fonts/3ds/fonts.css`)
- Dassault Systèmes Branding Guidelines — https://branding.3ds.com/ (corporate colour & typography sections; detail pages gated behind login)
- Corporate blue cross-checks — https://encycolorpedia.com/005386 , https://pickcoloronline.com/brands/dassault-systemes/ , https://www.brandcolorcode.com/dassault-systemes (Pantone 7692 C)
- Brand / logo (3DS "compass" + wordmark) — https://logotyp.us/logo/dassault-systemes/ , https://brandfetch.com/3ds.com

## Colour mapping

| Sentropic role | Dassault Systèmes source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `tabs.activeText` | official corporate brand blue (branding.3ds.com; live render ≈ `#005686`) | `#005386` |
| `action.primaryHover` | derived darker corporate blue | `#00406a` *(à confirmer)* |
| `focus.color` / `feedback.info` | measured bright interactive blue (`outline: 2px solid #0870d3` on `:focus-visible`) | `#0870d3` |
| accent (`cyan` slot) | measured bright cyan — 3DS **compass / 3DEXPERIENCE** accent | `#009eff` |
| `surface.default` / `surface.raised` | neutral 0 / surface default (measured) | `#ffffff` |
| `surface.subtle` / `action.secondary` | measured light grey surface | `#f4f6f8` |
| `border.subtle` / field stroke | measured light border | `#e3e7ec` |
| `text.secondary` / `border.strong` | derived navy-grey | `#5f7384` *(à confirmer)* |
| `text.muted` | derived navy-grey | `#45525c` *(à confirmer)* |
| `text.primary` | measured near-black body text | `#2d2d2d` |
| `surface.inverse` / deep navy | measured deep navy | `#04315d` |
| `action.danger` / `feedback.error` | measured error red | `#e32b2e` |
| `feedback.success` | measured success green | `#1c8720` |
| `feedback.warning` | measured warning orange | `#c95100` |

> **Corporate blue vs bright blue vs cyan accent — important distinction.** 3DS
> uses several blues: the **corporate blue `#005386`** (official brand colour,
> live ≈ `#005686`) drives titles, primary action and links; the **bright blue
> `#0870d3`** is the live *interactive/focus* colour (focus outlines); the
> **cyan `#009eff`** is the bright **compass / 3DEXPERIENCE accent**, parked in
> the `cyan` accent slot (accent/data-vis only, NOT interactive UI).

### À confirmer (derived or not publicly extracted as an exact token)
- **Corporate blue exact value** — official documented `#005386` is used for the regression lock; the live site renders a near-identical `#005686`. The two differ only in the green channel and are visually equivalent.
- **Secondary / muted text greys** `#5f7384`, `#45525c` — derived to a readable navy-grey; 3DS does not publish exact text-grey hexes.
- **`action.primaryHover` `#00406a`** — derived darker step from the corporate blue.
- **Light tints** `blue.light #e9f7ff`, `cyan.light #aadcfc` — measured light blues used as hover/accent tints; their exact role assignment is inferred.
- **8-colour categorical `data.*`** (`#005386`, `#009eff`, `#0870d3`, `#1c8720`, `#c95100`, `#e32b2e`, `#04315d`, `#669ab6`) — a coherent proposal from the measured brand hues, not an official sequential scale.
- `shadow.*`, `motion.*`, and the sm/lg `density.*` paddings — not strongly tokenised publicly; kept aligned with the Sentropic base / standard size scale (shadows tinted with the brand navy `#04315d`).
- `focus.offset` `2px` — the measured focus is `2px` solid `#0870d3`; the offset is the closest faithful expression.

## Typography
- **Display / titles** (`font.display`) and **body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'3ds', sans-serif`** — `3ds` is Dassault Systèmes' proprietary corporate webfont (`3ds-Regular-v2`, `3ds-Bold-v2`, `3ds-Italic-v2`, served from `www.3ds.com/statics/.../fonts/3ds/`). Only the family *name* is referenced; a system sans stack is the fallback. No binary is shipped or network-loaded.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack (the site's `--default-mono-font-family`).
- Links: corporate blue `#005386`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#e3e7ec` border, 4px radius). Native `<select>` chevron redrawn in corporate blue `#005386`.
- **Focus**: high-contrast **outline** in bright blue `#0870d3` (`focus.strategy = "outline"`, width `2px`, offset `2px`) — measured `outline: 2px solid #0870d3` on `:focus-visible`.
- **Radius**: measured 3–4px on controls / inputs / tabs (`radius.sm/md = 0.25rem`), 6px on cards (`radius.lg = 0.375rem`); pills/tags stay `999px`.
- **Buttons**: primary = solid corporate blue `#005386` → hover `#00406a`; secondary = **outlined corporate blue** (transparent fill, `#005386` border + text, light blue `#e9f7ff` hover fill).
- **Tabs / top-nav**: active tab = bold blue label with a bottom blue underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless blue links; active page = filled corporate blue `#005386`.
- **Density**: ~40px medium controls (measured live heights 32 / 36 / 40 px).

## Asset officiel
- Dassault Systèmes logo = the **3DS "compass"** (the blue rounded-square 3D mark) + the **Dassault Systèmes / 3DS wordmark**. Use the official SVG/PNG from the brand — **do not redraw the logo by hand**. This package only references font *names* (`3ds`) and measured public token values, never logo artwork or font binaries.
