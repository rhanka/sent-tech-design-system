# Renault → Sentropic mapping

This package maps **Renault's public brand palette** (the 2021 "Nouvelle Vague"
monochrome-diamond identity) onto the Sentropic token structure (`TenantTheme`).
Method = **measured-clone**: the brand accent (Renault Yellow), the corporate
black/anthracite and the neutral greys are taken from Renault's **published
brand colours** (`brand.renault.com`, mirrored by brand-palette aggregators);
only public token values and font *names* are referenced — no font binaries.
Renault is a **monochrome brand** (one warm yellow accent over black/grey), and
publishes no UI system palette, so the feedback/system hues, the full grey
scale, hover/light tints, radii and the focus spec are derived and flagged
`à confirmer`.

## Sources
- Renault brand palette (origin) — `https://www.brand.renault.com/` (Renault Yellow `#efdf00`, white, black, 3 greys)
- Renault Group palette (mirror) — https://pickcoloronline.com/brands/renault-group/ (`#efdf00 / #ffffff / #000000 / #d9d9d6 / #bbbcbc / #888b8d`)
- Renault corporate black (cross-check) — https://brandpalettes.com/renault-color-codes/ (official black `#191c1f`, Pantone **426 C**)
- 2021 diamond identity — https://www.renaultgroup.com/en/magazine/our-group-news/a-renaulution-for-the-diamond/
- Typeface — https://black-foundry.com/case-studies/nouvelr-for-renault/ (NouvelR, Black[Foundry], 2021) ; public webfont family "Renault Group" — https://www.cufonfonts.com/font/renault-group

## Colour mapping

| Sentropic role | Renault source | Value |
|---|---|---|
| `action.primary` (button fill) | brand.renault.com — **Renault Yellow** | `#efdf00` |
| `action.primaryText` (text on yellow) | Renault black | `#000000` |
| `action.primaryHover` | derived darker gold | `#d4c400` *(à confirmer)* |
| `text.primary` / `text.link` / `border.interactive` / `focus.color` | corporate **anthracite** (Pantone 426 C) | `#191c1f` |
| `surface.inverse` | Renault black | `#000000` |
| `text.muted` / `border.strong` | brand.renault.com — Renault Dark Grey | `#888b8d` |
| `border.subtle` | brand.renault.com — Renault Light Grey | `#d9d9d6` |
| categorical grey (`data.category8`) | brand.renault.com — Renault Medium Grey | `#bbbcbc` |
| `surface.default` / `surface.raised` | brand.renault.com — white | `#ffffff` |
| `surface.subtle` / `action.secondary` | derived light grey | `#f5f5f3` *(à confirmer)* |
| `text.secondary` | derived darker grey (AA on white) | `#5a5d5f` *(à confirmer)* |
| `action.danger` / `feedback.error` | derived red | `#c62828` *(à confirmer)* |
| `feedback.success` | derived green | `#1f7a3d` *(à confirmer)* |
| `feedback.warning` | derived amber (AA on white) | `#b35900` *(à confirmer)* |
| `feedback.info` | derived neutral blue | `#1565c0` *(à confirmer)* |

> **The yellow & accessibility — the key decision.** Renault Yellow `#efdf00`
> is a vivid light yellow. It **fails WCAG AA as text on white**, but it
> **passes with high contrast as a button FILL carrying BLACK text** — exactly
> how the brand uses it. So this theme wires `action.primary = #efdf00` with
> `action.primaryText = #000000` (yellow button, black label), and routes every
> *text/line* interactive role — `text.link`, `border.interactive`,
> `focus.color` — to the readable **anthracite `#191c1f`**, NOT the yellow.
> Renault links/lines are monochrome black, so this is brand-faithful as well as
> accessible. (Note: `createComponent` derives the link *hover* text from
> `action.primary`, so a link hover briefly shows yellow — an upstream builder
> default shared by every theme; flagged below.)

### À confirmer (derived or not publicly extracted)
- **Anthracite `#191c1f`** sourced as Renault's official "black" (Pantone 426 C) via brandpalettes; used for body text + interactive lines rather than the pure black `#000000`, which is reserved for inverse surfaces and the diamond logo.
- **Light background `#f5f5f3`** and **secondary text `#5a5d5f`** — Renault publishes only 3 greys (`#d9d9d6 / #bbbcbc / #888b8d`); these two steps are derived (the dark grey `#888b8d` is too light for body-secondary, ~3.6:1).
- **System/feedback hues** `success #1f7a3d`, `warning #b35900`, `error #c62828`, `info #1565c0` — Renault publishes no UI system palette; derived to clear WCAG AA on white. `info` and `success`/`error` are NOT brand colours.
- **Derived yellow steps** `yellow.light #fdf6b8`, `yellow.dark #d4c400` (hover), `yellow.deep #b89e00`, gold `#8a7600` — lighter/darker tints for tints, hover and the accent slot.
- **`cyan` accent slot** carries the deep-gold yellow variant — Renault has **no second brand colour**; the slot is parked on a yellow-family gold for data-vis only.
- **The 8-colour categorical `data.*`** palette — a yellow-led monochrome proposal with derived system hues for variety, not an official scale.
- **`text.link` hover** = yellow (`createComponent` derives link-hover text from `action.primary`); shared builder default across all themes.
- **Radii** (`2px` controls / `4px` cards), **`focus`** (anthracite outline 2px/2px), **density**, `shadow.*`, `motion.*` — not published by Renault; derived to match the angular geometric identity / kept aligned with the Sentropic base.

## Typography
- **Display / titles** (`font.display`) and **body / controls / fields / labels**
  (`font.sans`, `typography.control/field/label`): **`'NouvelR', 'Renault Group', sans-serif`**.
  NouvelR is Renault's custom typeface (Black[Foundry], 2021), distributed as the
  "Renault Group" webfont family. Only the font *names* are referenced — no binaries.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: anthracite `#191c1f`, not underlined at rest, underlined on hover.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#d9d9d6` border, near-square 2px radius). Native `<select>` chevron redrawn in **anthracite `#191c1f`** (monochrome, not yellow).
- **Focus**: high-contrast **anthracite outline** `#191c1f` (`focus.strategy = "outline"`, width `2px`, offset `2px`) — a yellow ring on white would be near-invisible.
- **Radius**: angular brand — `2px` on controls / inputs / tabs / tags / badges (`radius.sm/md = 0.125rem`), `4px` on cards (`radius.lg = 0.25rem`); pills stay `999px`.
- **Buttons**: primary = solid **Renault Yellow `#efdf00`** with **black** label → hover darker gold `#d4c400`; secondary = **outlined anthracite** (transparent fill, `#191c1f` border + text, light grey `#f5f5f3` hover fill).
- **Tabs / top-nav**: active tab = bold **anthracite** label with a bottom **yellow** underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`; the indicator colour derives from `action.primary` = Renault Yellow).
- **Pagination**: borderless anthracite links; active page = filled **Renault Yellow** with black text.

## Asset officiel
- Renault logo = the **monochrome diamond** (two thick lines, 2021 identity), normally **black on white** (or white/yellow on dark). Use the official SVG/PNG from the brand — **do not redraw the logo by hand**. This package only references font *names* (NouvelR / "Renault Group") and published token values, never logo artwork or font binaries.
