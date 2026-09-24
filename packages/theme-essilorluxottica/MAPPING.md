# EssilorLuxottica → Sentropic mapping

This package maps the **public** EssilorLuxottica corporate site design onto
the Sentropic token structure (`TenantTheme`). EssilorLuxottica publishes no
tokenised public design system; its corporate site (`essilorluxottica.com`,
Next.js) is a strict monochrome — black text and fills on white with hairline
light-grey rules. Method = **measured-clone**: the black (`#000000`), white
(`#ffffff`) and hairline grey (`#e1e1e1`) are read from the site's official
stylesheets (occurrence counts over the union of both stylesheets linked from
the homepage, per-file counts below); only public values and font *names*
(Avenir, Libre Caslon Display) are referenced — never font binaries.
Derived/unmeasured values are flagged `à confirmer`.

> Key measured fact: the EssilorLuxottica stylesheets contain no brand accent
> colour at all — the most frequent non-black/white hexes are third-party
> defaults (carousel, skeleton loader, consent banner) and are excluded as
> origins. Like Hermès chrome (zero orange), EssilorLuxottica is a pure
> monochrome: black `#000000` (8 occurrences) is the brand colour, so every
> text/line/fill interactive role is black on white (21:1 — no contrast
> repair needed).

## Sources

- EssilorLuxottica corporate site (measured) — https://www.essilorluxottica.com/ (black `#000000`, white `#ffffff`, hairline `#e1e1e1`, Avenir + Libre Caslon font names)
- Official stylesheet 1 — https://www.essilorluxottica.com/_next/static/css/ba4fc2c40c9a78a2.css (`#000` ×4, `#fff` ×3, `#e1e1e1` ×3, `#ffffff` ×1, `#000000` ×1; third-party: `#007aff` ×1 swiper, `#1890ff` ×1 article-anchor, `#6aa671` ×1 consent banner, `#ebebeb`/`#f5f5f5` ×1 skeleton)
- Official stylesheet 2 — https://www.essilorluxottica.com/_next/static/css/96396252675cc247.css (`#000` ×3, `#fff` ×1; third-party: `#007aff` ×1 swiper)
- Body typeface declaration — `.main-wrapper{font-family:var(--AvenirRegular),Sans-Serif}` in stylesheet 1 (Avenir body)
- Display typeface class — `__className_55dfc7{font-family:LibreCaslonDisplayRegular,…}` in stylesheet 1 (Libre Caslon display)
- Link behaviour — `a{color:inherit;text-decoration:none;display:block}` in stylesheet 1 (links inherit body colour, no underline at rest)
- EssilorLuxottica brands page (charter context, no extra tokens) — https://www.essilorluxottica.com/en/brands/

## Colour mapping

| Sentropic role | EssilorLuxottica source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `text.primary` / `text.link` / `surface.inverse` | measured brand black (`#000`/`#000000`, 8 occurrences over both stylesheets) | `#000000` |
| `action.primaryHover` | derived softer black | `#2b2b2b` *(à confirmer)* |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | white text on black (21:1 contrast choice) | `#ffffff` |
| `surface.default` / `surface.raised` / `field.fillBg` | measured white (`#fff`/`#ffffff`, 5 occurrences) | `#ffffff` |
| `surface.subtle` / `action.secondary` / `buttonSecondary.hoverBackground` | derived light surface alt | `#f4f4f4` *(à confirmer)* |
| `border.subtle` / `action.secondaryHover` / field stroke | measured hairline grey (`#e1e1e1`, 3 occurrences in stylesheet 1) | `#e1e1e1` |
| `border.strong` | derived strong border grey (AA on white) | `#767676` *(à confirmer)* |
| `text.secondary` | derived secondary grey (AA on white) | `#525252` *(à confirmer)* |
| `text.muted` | derived muted grey (AA on white) | `#616161` *(à confirmer)* |
| `action.danger` / `feedback.error` | derived error red (5.62:1 on white) | `#c62828` *(à confirmer)* |
| `feedback.success` | derived success green (5.37:1 on white) | `#1f7a3d` *(à confirmer)* |
| `feedback.warning` | derived warning amber (4.83:1 on white) | `#b35900` *(à confirmer)* |
| `feedback.info` | derived info blue (5.75:1 on white) | `#1565c0` *(à confirmer)* |

## À confirmer (derived or no published brand token)

- **Light surface alt `#f4f4f4`** — the stylesheets publish no background alt; a coherent light neutral step.
- **Secondary/muted/strong greys** (`#525252`, `#616161`, `#767676`) — the brand publishes only the hairline `#e1e1e1`; these steps are derived to clear WCAG AA on white (the hairline alone is 1.31:1 and unusable as text).
- **Black hover `#2b2b2b`** — black has no darker hover; a softer black for interactive hover states.
- **Feedback hues** (`success #1f7a3d`, `warning #b35900`, `error #c62828`, `info #1565c0`) — the brand publishes no UI system palette; derived to clear WCAG AA on white. None is a brand colour.
- **`cyan` accent slot** (`#f4f4f4` / `#525252` / `#2b2b2b`) — EssilorLuxottica has no second brand colour; the slot is parked on neutral grey steps for data-vis only.
- **Categorical `data.*` palette** (`#000000`, `#525252`, `#1565c0`, `#b35900`, `#c62828`, `#1f7a3d`, `#767676`, `#e1e1e1`) — a monochrome-led proposal with derived system hues for variety, not an official scale.
- **Excluded third-party hexes** (never origins): `#007aff` (swiper default), `#1890ff` (`.article-anchor` CMS default), `#6aa671` (consent-banner toggle), `#ebebeb`/`#f5f5f5` (skeleton-loader defaults).
- **Font stacks** — Avenir and Libre Caslon Display are the measured family names; the exact fallback stacks here are a faithful expression, the precise published stacks are *à confirmer*.
- **Radii** (`2px` controls / `4px` cards), **`focus`** (black outline 2px/2px), **density**, `shadow.*`, `motion.*` — not published by the brand; radii follow the sharp minimal identity, density/shadow/motion kept aligned with the Sentropic base.

## Typography

- **Body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'AvenirRegular', 'Avenir', sans-serif`** — Avenir is the EssilorLuxottica site body typeface (`.main-wrapper{font-family:var(--AvenirRegular)}`; AvenirLight the most declared face). We reference the font *names* only.
- **Display / titles** (`font.display`): **`'LibreCaslonDisplayRegular', Georgia, serif`** — Libre Caslon Display is the site display face (`__className_55dfc7`). We reference the font *name* only.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: black `#000000` (inherited body colour), not underlined at rest, underlined on hover.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff` fill, 1px `#e1e1e1` measured hairline border, 2px radius; no filled-input declarations exist on the site). Native `<select>` chevron redrawn in **black `#000000`**.
- **Radius**: sharp minimal brand — `2px` on controls / inputs / tabs / tags / badges (`radius.sm/md = 0.125rem`), `4px` on cards (`radius.lg = 0.25rem`); pills stay `999px`.
- **Focus**: high-contrast **black outline** `#000000` (`focus.strategy = "outline"`, width `2px`, offset `2px`) — the stylesheets publish no focus declaration.
- **Buttons**: primary = solid **black `#000000`** with **white** label → hover `#2b2b2b`; secondary = **outlined black** (transparent fill, `#000000` border + text, light grey `#f4f4f4` hover fill).
- **Tabs / top-nav**: active tab = bold **black** label with a bottom **black** underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless black links; active page = filled **black** with white text.

## Asset officiel

- EssilorLuxottica logo = the "ESSILORLUXOTTICA" wordmark (black on white). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *names* (Avenir, Libre Caslon Display) and public colour values, never logo artwork or font binaries.
