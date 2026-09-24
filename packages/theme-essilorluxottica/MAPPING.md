# EssilorLuxottica → Sentropic mapping

This package maps the **public** EssilorLuxottica corporate site design onto
the Sentropic token structure (`TenantTheme`). EssilorLuxottica publishes no
tokenised public design system, and its corporate site (`essilorluxottica.com`,
Next.js) publishes **no brand-owned colour declaration at all**: `body,html`
declares neither `color` nor `background`, and `a{color:inherit}`. The visible
black is the user-agent default, not a published value. Method = **derived
monochrome**: the black (`#000000`), white (`#ffffff`) and hairline grey
(`#e1e1e1`) below reuse the stylesheets' hexes as coherent stand-ins, each
flagged `à confirmer`. Only public values and font *names* (Avenir, Libre
Caslon Display) are referenced — never font binaries.

> Key measured fact: the `#000000` (8 occurrences), `#ffffff` (5) and
> `#e1e1e1` (3) counts reproduce exactly, but every one of those 16
> occurrences sits in a third-party block — the Tealium consent banner
> (`#__tealiumGDPRecModal`, `#__tealiumGDPRcpPrefs`, `.privacy_prompt`) or the
> swiper/slick carousels — so none is a brand origin. Like Hermès chrome (zero
> orange), EssilorLuxottica is a default-black-on-white site: black text on
> white (21:1 — no contrast repair needed), with the absence documented rather
> than a vendor hex promoted to brand status.

## Sources

- EssilorLuxottica corporate site — https://www.essilorluxottica.com/ (no brand-owned colour; Avenir + Libre Caslon font names)
- Official stylesheet 1 — https://www.essilorluxottica.com/_next/static/css/ba4fc2c40c9a78a2.css (`#000` ×4 + `#000000` ×1, `#fff` ×3 + `#ffffff` ×1, `#E1E1E1` ×3 — all third-party, see table; third-party also: `#007aff` ×1 swiper, `#1890ff` ×1 article-anchor, `#6aa671` ×1 consent banner, `#ebebeb`/`#f5f5f5` ×1 skeleton)
- Official stylesheet 2 — https://www.essilorluxottica.com/_next/static/css/96396252675cc247.css (`#000` ×3, `#fff` ×1 — all third-party; `#007aff` ×1 swiper)
- No-colour base rules — `body,html{-webkit-tap-highlight-color:rgba(255,255,255,0);font-size:16px;overflow-x:hidden}` and `a{color:inherit;text-decoration:none;display:block}` in stylesheet 1 (no `color`, no `background`, no underline at rest; no `:hover` rule with `text-decoration` exists in either file)
- Body typeface declaration — `.main-wrapper{font-family:var(--AvenirRegular),Sans-Serif}` in stylesheet 1 (the only brand-owned body rule; the 8 `var(--AvenirLight)` usages are all inside the Tealium block)
- Title typeface rule — `h1,h2,h3,h4,h5{font-family:var(--AvenirMedium),sans-serif;font-weight:500}` in stylesheet 1 (the only measured brand title rule)
- Display typeface class — `.__className_55dfc7{font-family:LibreCaslonDisplayRegular,LibreCaslonDisplayRegular Fallback;font-weight:400;font-style:normal}` in stylesheet 1 (name valid; display role inferred)
- EssilorLuxottica brands page (charter context, no extra tokens) — https://www.essilorluxottica.com/en/brands/

## Colour mapping

| Sentropic role | EssilorLuxottica source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `text.primary` / `text.link` / `surface.inverse` | derived black stand-in — `#__tealiumGDPRecModal .privacy_prompt1{background-color:#000;color:#fff}` and `.swiper-lazy-preloader-black{--swiper-preloader-color:#000}` are third-party and excluded as origins; no brand-owned rule declares a colour | `#000000` *(à confirmer)* |
| `action.primaryHover` | derived softer black | `#2b2b2b` *(à confirmer)* |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | white text on black (21:1 contrast choice) | `#ffffff` *(à confirmer)* |
| `surface.default` / `surface.raised` / `field.fillBg` | derived white stand-in — `#__tealiumGDPRecModal .privacy_prompt1{…color:#fff}`, `.slick-loading .slick-list{background:#fff url(…ajax-loader…)}` and `.swiper-lazy-preloader-white{--swiper-preloader-color:#fff}` are third-party and excluded as origins | `#ffffff` *(à confirmer)* |
| `surface.subtle` / `action.secondary` / `buttonSecondary.hoverBackground` | derived light surface alt | `#f4f4f4` *(à confirmer)* |
| `border.subtle` / `action.secondaryHover` / field stroke | derived hairline grey stand-in — `#__tealiumGDPRecModal #consent_prompt_submitNo{background-color:#E1E1E1!important;…}` and `#__tealiumGDPRcpPrefs .privacy_prompt input[type=checkbox].toggle+label{…background-color:#E1E1E1!important;…}` (the unchecked consent-toggle track, same Tealium block as the excluded `#6aa671` checked track) are third-party and excluded as origins | `#e1e1e1` *(à confirmer)* |
| `border.strong` | derived strong border grey, chosen neutral 4.54:1 on white (not a stop-rule output) | `#767676` *(à confirmer)* |
| `text.secondary` | derived secondary grey, chosen neutral 7.81:1 on white (not a stop-rule output) | `#525252` *(à confirmer)* |
| `text.muted` | derived muted grey, chosen neutral 6.19:1 on white (not a stop-rule output) | `#616161` *(à confirmer)* |
| `action.danger` / `feedback.error` | derived error red (5.62:1 on white) | `#c62828` *(à confirmer)* |
| `feedback.success` | derived success green (5.37:1 on white) | `#1f7a3d` *(à confirmer)* |
| `feedback.warning` | derived warning amber (4.83:1 on white) | `#b35900` *(à confirmer)* |
| `feedback.info` | derived info blue (5.75:1 on white) | `#1565c0` *(à confirmer)* |
| `surface.overlay` | derived modal backdrop — no `.modal-overlay` / `.backdrop` brand rule publishes one | `rgb(0 0 0 / 0.6)` *(à confirmer)* |

## À confirmer (derived or no published brand token)

- **Black / white / hairline stand-ins** (`#000000`, `#ffffff`, `#e1e1e1`) — the counts (8 / 5 / 3) reproduce exactly, but all 16 occurrences are third-party (Tealium consent banner, swiper/slick) and excluded as origins; the values are kept as coherent stand-ins for the site's default black-on-white rendering.
- **Light surface alt `#f4f4f4`** — the stylesheets publish no background alt; a coherent light neutral step.
- **Secondary/muted/strong greys** (`#525252` 7.81:1, `#616161` 6.19:1, `#767676` 4.54:1 on white) — the brand publishes no text grey (the hairline alone is 1.31:1 and unusable as text). These are chosen neutrals, NOT stop-rule outputs: no starting hex / step count is claimed, so there is no chain to replay.
- **Black hover `#2b2b2b`** — black has no darker hover; a softer black for interactive hover states.
- **Feedback hues** (`success #1f7a3d`, `warning #b35900`, `error #c62828`, `info #1565c0`) — the brand publishes no UI system palette; derived to clear WCAG AA on white. None is a brand colour.
- **`surface.overlay` `rgb(0 0 0 / 0.6)`** — no brand modal-backdrop rule exists; a conventional black scrim.
- **`disabledOpacity` `0.5`** — no brand disabled rule exists (Sentropic base is `0.55`; the reference package uses `0.5`).
- **Typography weights** (control `500`, label `700`) — aligned with the reference theme package without a brand source; the only measured brand weight is `500` on `h1..h5`.
- **Link hover underline** (`typography.link.textDecorationHover: "underline"`) — rest verified (`a{color:inherit;text-decoration:none;display:block}`), but no `:hover` + `text-decoration` rule exists in either stylesheet.
- **`cyan` accent slot** (`#f4f4f4` / `#525252` / `#2b2b2b`) — EssilorLuxottica has no second brand colour; the slot is parked on neutral grey steps for data-vis only.
- **Categorical `data.*` palette** (`#000000`, `#525252`, `#1565c0`, `#b35900`, `#c62828`, `#1f7a3d`, `#767676`, `#e1e1e1`) — a monochrome-led proposal with derived system hues for variety, not an official scale.
- **Excluded third-party hexes** (never origins): `#007aff` (swiper default), `#1890ff` (`.article-anchor` CMS default), `#6aa671` (consent-banner checked toggle — same Tealium block as the excluded `#E1E1E1` unchecked track), `#ebebeb`/`#f5f5f5` (skeleton-loader defaults).
- **Font stacks** — AvenirRegular (body, `.main-wrapper`) and AvenirMedium (titles, `h1..h5`) are the measured family names; Libre Caslon Display is a declared name (`@font-face` + `.__className_55dfc7`) whose display role is inferred. The exact fallback stacks here are a faithful expression, the precise published stacks are *à confirmer*.
- **Radii** (`2px` controls / `4px` cards), **`focus`** (derived black outline 2px/2px), **`field.style = "outline"`**, `shadow.*` — not published by the brand; radii follow the sharp minimal identity, focus/field/shadow are coherent stand-ins.
- **Density, `motion.easing`, `transition`** — not the Sentropic base (checked against `packages/tokens/src/foundation.ts`: base easing is `cubic-bezier(0.16, 1, 0.3, 1)`, base `disabledOpacity` `0.55`, base density has no `fontSize` key and different paddings/gaps); only `controlHeight` and `iconSize` match the base. These blocks are aligned with the reference theme package's geometry, marked `à confirmer`.

## Typography

- **Body / controls / fields / labels** (`font.sans`, `typography.control/field/label`): **`'AvenirRegular', 'Avenir', sans-serif`** — Avenir is the EssilorLuxottica site body typeface (`.main-wrapper{font-family:var(--AvenirRegular),Sans-Serif}`; the 8 `var(--AvenirLight)` usages are all inside the Tealium consent-banner block, not brand body text). We reference the font *names* only.
- **Titles** (`h1..h5` brand rule): **`var(--AvenirMedium), sans-serif`, weight 500** — `h1,h2,h3,h4,h5{font-family:var(--AvenirMedium),sans-serif;font-weight:500}`.
- **Display** (`font.display`): **`'LibreCaslonDisplayRegular', Georgia, serif`** *(à confirmer)* — Libre Caslon Display is a declared name (`@font-face` + `.__className_55dfc7{font-family:LibreCaslonDisplayRegular,…}`), but assigning it the display role is an inference against the measured `h1..h5`/AvenirMedium title rule. We reference the font *name* only.
- **Monospace** (`font.mono`): `'SFMono-Regular', …, monospace` — system stack.
- Links: derived black `#000000` *(à confirmer)* (inherited body colour), not underlined at rest (verified), hover underline derived *(à confirmer)*.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` *(derived — à confirmer)* — boxed inputs (white `#ffffff` fill, 1px `#e1e1e1` hairline border, 2px radius). The stylesheets publish no field declaration at all: the only `input|select|textarea|button` rules in either file belong to Tealium and slick/swiper. Native `<select>` chevron redrawn in derived **black `#000000`**.
- **Radius**: sharp minimal brand — `2px` on controls / inputs / tabs / tags / badges (`radius.sm/md = 0.125rem`), `4px` on cards (`radius.lg = 0.25rem`); pills stay `999px`.
- **Focus**: high-contrast derived **black outline** `#000000` *(à confirmer)* (`focus.strategy = "outline"`, width `2px`, offset `2px`) — the stylesheets publish no focus declaration.
- **Buttons**: primary = solid derived **black `#000000`** with **white** label → hover `#2b2b2b`; secondary = **outlined black** (transparent fill, `#000000` border + text, light grey `#f4f4f4` hover fill).
- **Tabs / top-nav**: active tab = bold derived **black** label with a bottom **black** underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless black links; active page = filled **black** with white text.

## Asset officiel

- EssilorLuxottica logo = the "ESSILORLUXOTTICA" wordmark (black on white). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *names* (Avenir, Libre Caslon Display) and public colour values, never logo artwork or font binaries.
