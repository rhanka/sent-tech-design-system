# Amundi → Sentropic mapping

This package maps the **public** corporate design of Amundi SA onto the
Sentropic token structure (`TenantTheme`). Method =
**measured-clone**: the `--awf-color-*` RGB-triplet token set the brand's
`awf` theme declares on `:root` is transcribed token by token; only public
values and font *names* are referenced — no font binaries. Derived or
unmeasured values are flagged `à confirmer`.

> Key measured fact: Amundi's link blue fails AA as text (cyan `#009ee0` at
> 3.01:1) while its error red is Tailwind's stock `red-600` byte for byte —
> so the theme routes links to the legible brand blue (persian `#0073a3` at
> 5.27:1) and labels the red *retained*, never *decided*. Brand buttons also
> publish no hover, no disabled state and no transition: hovering changes
> nothing, once by absence and once by a dangling token (see below).

## Sources

- Amundi corporate site — https://about.amundi.com/ (reached from the
  prescribed source via `https://amundi.com/` → 301 →
  `https://www.amundi.com/` → 302 → `https://about.amundi.com/`; fetched
  2026-09-25. All three probe forms — bare, UA-only, full header set, three
  repetitions each — answer 200 with the identical 128724-byte document, so
  no `Upstream access` section is needed).
- Corporate bundle (brand) — `https://static.amundi.com/sites/default/files/awf-static/corporate/css/css_DFC_RTpaSg_XbUDVbLkA_CNvMkiP_c3KgoEcORO0SoQ.css`
  (372406 bytes, `delta=3`; the `awf_theme` stylesheets, Drupal-aggregated).
- Meta-nav chrome (brand) — `https://static.amundi.com/metanav/metanav.css`
  (6675 bytes, the shared `mv` top bar).
- Vendor bundle delta0 (EXCLUDED) — `.../css_8IkyLopYX3RhGLjUBlbKFXoWs1UUIKqGQzZ1QPQU62U.css`
  (34425 bytes: jQuery-UI theme, `tabled`, addtoany, ajax/views; zero `awf`
  references).
- Vendor bundle delta2 (EXCLUDED) — `.../css_uMcMBBSdEgC7FBsaqGnpWnEsinQOwqqC3qg2zaR9OJ0.css`
  (120 bytes: one Drupal unpublished-paragraph rule).
- Tailwind stock (vendor-default verification) —
  `https://unpkg.com/tailwindcss@3.4.0/lib/public/colors.js` and
  `https://unpkg.com/tailwindcss@3.4.0/stubs/config.full.js`.
- `tabled` vendor evidence — https://drupal.org/node/3480235 (the Drupal
  `responsiveTableStyles.css` solution using the same `.tabled`,
  `.tabled__navigation`, `.tabled__wrapper` markup).

## Colour mapping

Measurement notes. **Region** — counts run on the brand region only: the
corporate bundle expanded one-rule-per-line at lines 60-134 + 177-2544
minus the Tailwind-stock utility lines (85-109, 202-226), plus the whole
metanav file. Excluded as vendor: delta0, delta2, corporate lines 1-59
(Drupal admin + Tailwind preflight #1) and 135-176 (preflight #2 + base).
**Convention** — one occurrence is one declaration containing the value (a
`--*` declaration or a property value), case-normalised; brand triplets
(`255 255 255`) are transcribed as lowercase 6-digit hex; 8-digit alpha is
kept 8-digit; `#fff` counts (3); `#0000` (26, Tailwind ring transparency)
and mask-grey `#d9d9d9` (×4, inside SVG masks) are non-paint and excluded;
`%23`-encoded SVG fills are decoded when cited. **Duplication** — the
shipped bundle concatenates two theme files that share the base (preflight
+ typo + `:root` + utilities each; both `:root` copies byte-identical);
counts below are over the shipped union, both copies counting. Triplets are
consumed as `rgb(var(--awf-color-X) / <alpha>)`.

| Sentropic role | Amundi source | Value |
|---|---|---|
| `action.primary` / `border.interactive` | `--awf-color-theme` → `--awf-color-cerulean:2 148 209` (theme 43 `var()` + cerulean 15; primary buttons, input hover/focus borders, checkbox accent) | `#0294d1` |
| `action.primaryHover` | same token — no button hover published, hover keeps rest (empty grep, see Signatures) | `#0294d1` |
| `action.primaryText` / `alert.text` / `pagination.activeText` | `--awf-color-midnight:5 7 25` (58 `var()`; button text at 5.86:1, message text) | `#050719` |
| `action.secondary` / `surface.subtle` / `buttonSecondary.hoverBackground` / `control.hoverBackground` | `--awf-color-snow:250 248 248` (19 `var()` + 1 literal; alt surface, disabled submit fill) | `#faf8f8` |
| `action.secondaryHover` | `--awf-color-light-grey:210 210 210` assigned (10.96:1 with secondaryText) | `#d2d2d2` |
| `text.primary` / `surface.inverse` / `action.secondaryText` / `buttonSecondary.border` / `pagination.border` / `tabs.activeText` / `choice.labelColor` / `toggle.textColor` / `accordion.text` / select chevron | `--awf-color-prussian-blue:0 28 75` (108 `var()` + 56 via `variant-1` + 1 via `variant-4` + 4 encoded SVG strokes; body 16.57:1, footer, chevron) | `#001c4b` |
| `action.danger` / `feedback.error` / `status.failed` / `badge.infoBackground` | `--awf-color-red:220 38 38` (17 `var()` + input-error 5 + message-error 2; vendor default retained — Tailwind `red-600`) | `#dc2626` |
| `feedback.success` / `status.completed` | `--awf-color-green:40 200 120` (12 `var()` + message-status 2) | `#28c878` |
| `feedback.warning` / `status.pending` | `--awf-color-orange:240 125 0` (13 `var()` + message-warning 2) | `#f07d00` |
| `feedback.info` / `status.processing` | `--awf-color-cerulean` (message-info 3) | `#0294d1` |
| `text.secondary` / `border.strong` | `--awf-color-dark-grey:79 79 79` (62 `var()`; 8.19:1; menu borders, back button) | `#4f4f4f` |
| `text.muted` | `--awf-color-storm-grey:113 118 128` (placeholder alias 11 `var()` + 1 literal + 1 icon; 4.56:1 — clears 4.5) | `#717680` |
| `text.inverse` / `surface.default` / `surface.raised` / `field.fillBg` / `control.background` / `toggle.thumbColor` / `pagination.background` | `--awf-color-white:255 255 255` (72 `var()` + 8 via `variant-2` + 20 literal triplets + 3 `#fff` + 3 white-alpha hexes; page, cards, modal) | `#ffffff` |
| `text.link` / `tag.neutralText` | `--awf-color-persian-blue:0 115 163` (3 `var()` + 1 literal; routed per §9 — brand links are cyan at 3.01:1; 5.27:1 here) | `#0073a3` |
| `border.subtle` / field stroke / alert box | `--awf-color-light-grey:210 210 210` (48 `var()`; 37 on borders) | `#d2d2d2` |
| `surface.overlay` | modal scrim `rgb(0 0 0 / .4)` + metanav `--mv-color-menu-backdrop: #00000066` (two files agree) | `rgb(0 0 0 / 0.4)` |
| `focus.color` | toggle-block `:focus-visible` outline cyan (account CTA uses theme; see Signatures) | `#009ee0` |
| `blue.10` / `cyan.10` | `--awf-color-alice-blue:230 245 252` (8 `var()`; light sections, autocomplete hover) | `#e6f5fc` |
| `blue.60` | `--awf-color-cerulean` (action blue) | `#0294d1` |
| `cyan.50` | `--awf-color-cyan:0 158 224` (88 `var()`; the token NAMED cyan — links, tertiary, toggle) | `#009ee0` |
| `blue.80` / `cyan.70` | `--awf-color-persian-blue` (deep step; PAP-scoped paint + showcase) | `#0073a3` |
| `slate.90` | `--awf-color-midnight` (darkest) | `#050719` |
| `shadow.subtle` | literal shadow tint on buttons, tables, account CTAs (12) | `#3838381a` |
| `shadow.medium` | consumed toast/dialog shadow — vendor default retained (Tailwind `shadow-lg`; brand `.1` bytes) | `0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)` |
| `shadow.floating` | consumed nav-dropdown shadow — vendor default retained (Tailwind `shadow-xl`; brand `.1` bytes) | `0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1)` |
| alert box stroke | `--awf-color-message-border` (light-grey) at `.2` opacity | `1px solid rgb(210 210 210 / 0.2)` |
| `data.category1..8` | categorical proposal from measured hues (no chart scale published) | `#0294d1` `#001c4b` `#f07d00` `#28c878` `#dc2626` `#6a4fb8` `#37b2b5` `#7ea4c3` *(à confirmer)* |
| — (no role) | `--awf-color-purple:106 79 184` (4 `var()`, theme mappings only, zero paint) | `#6a4fb8` |
| — (no role) | `--awf-color-turquoise:55 178 181` (4 `var()`, theme mappings only, zero paint) | `#37b2b5` |
| — (no role) | `--awf-color-black:0 0 0` (13 `var()`, gradient mappings + showcase, zero direct paint) | `#000000` |
| — (no role) | `--awf-color-arsenic:55 57 71` (dark-mode `variant-5` + showcase, dark-only) | `#373947` |
| — (no role) | `--awf-color-beige:250 246 239` (parsimony section + showcase, scoped) | `#faf6ef` |
| — (no role) | `--awf-color-mako:65 70 81` (PAP stepper label + showcase, scoped) | `#414651` |
| — (no role) | `--awf-color-reflex-blue:0 72 255` (progress-bar fill + gradient stops + showcase) | `#0048ff` |
| — (no role) | `--awf-color-warning-blue-light:229 245 252` (warning banner, scoped) | `#e5f5fc` |
| — (no role) | `--awf-color-warning-blue-dark:14 40 75` (dark-mode warning) | `#0e284b` |
| — (no role) | `--awf-color-warning-red-light:252 208 212` (warning banner, scoped) | `#fcd0d4` |
| — (no role) | `--awf-color-warning-red-dark:152 25 57` (dark-mode warning) | `#981939` |
| — (no role) | `--awf-metanav-color-bg:55 57 76` (live top-bar override, scoped) | `#37394c` |
| — (no role) | `--awf-metanav-color-accent:29 178 233` (live top-bar override, scoped) | `#1db2e9` |
| — (no role) | `--mv-color-bg` / `--mv-color-menu-separator` (bar default live-overridden + painted dropdown separators) | `#f5f5f5` |
| — (no role) | `--mv-color-fg` / `--mv-color-accent` / `--mv-color-menu-fg` (bar text/accent live-overridden + painted dropdown text) | `#4d4d4f` |
| — (no role) | `--mv-color-separator` / `--mv-color-menu-tab-separator` (painted separators) | `#e0e0e0` |
| — (no role) | `--mv-color-menu-backdrop` (painted menu backdrop, black 40%) | `#00000066` |
| — (no role) | `--awf-wesave-outline-color` on `.awf-wesave` (5 refs, WeSave-section focus only) | `#d5d7da` |

Other measured paints (no hex shipped in `index.ts`, recorded here only):

- Dialog/timeline/video icon literals (scoped, unpromoted): `#00a0e3` ×3,
  `#019ee0` ×2, `#fef0c7`, `#dc6803`, `#001b4a`.
- PAP-app literals (scoped, unpromoted): `#535862` ×2, `#ceeffc` ×2,
  `#181d27` ×2, `#b6e8ff`, `#616161`.
- Tailwind-stock literals inside brand rules (retained, unpromoted):
  `#1d4ed8` + `#e2e8f0` (admin local-tasks hover), `#1f2937` + `#f9fafb`
  (toggle-block hover) — verified against `tailwindcss@3.4.0` stock.
- Referenced but never declared: `var(--awf-color-button-border)` (1 use,
  account-CTA hover/focus background, no fallback) is guaranteed-invalid at
  computed-value time — the declaration drops and the hover changes no
  background. It carries no value and is recorded here, not shipped.
- Declared but never referenced: `--awf-color-variant-3`, `variant-5` and
  the five `--awf-table-*` geometry tokens.

## À confirmer (derived or no published brand token)

- **Categorical `data.*` palette** (`#0294d1`, `#001c4b`, `#f07d00`,
  `#28c878`, `#dc2626`, `#6a4fb8`, `#37b2b5`, `#7ea4c3`) — a coherent
  proposal from the measured hues; the brand publishes no chart scale (the
  only `chart` match is an unstyled web-component host).
- **Small density** (`density.sm.*` = 2rem / 0 / 0.75rem / 0.375rem / 2rem /
  0.875rem) — Sentropic base values; the brand publishes no small controls
  (its `--small` input only narrows width to 11.25rem).
- **`density.md.minWidth` 2.5rem, `density.lg.gap` 0.5rem,
  `density.lg.minWidth` 3rem** — base values; no generic min-width or button
  gap is published (the 13rem button min-width is marketing-scoped).
- **Link hover underline** (`typography.link.textDecorationHover`) — no
  link hover is published (`:hover` + `underline` counts 0); underline is
  the coherent stand-in.
- **Font fallback stacks** — the brand declares `"Noto Sans",sans-serif`
  (283 `var()` + 12 `@font-face`); the fuller system stack here is a
  faithful expression, the precise published stack is *à confirmer*.
- **Monospace stack** — no brand monospace is published (Noto Sans,
  Montserrat and Arial are all proportional); system stack.
- **`z` header/overlay/modal/chat** (50/80/100/110) — base values; only
  toast (100, `[data-drupal-messages]`) is measured. The brand modal
  carries no z-index (DOM order), so modal == toast is documented, not
  resolved.
- **Toggle unmapped leaves** (trackWidth/Height, thumbSize, trackPadding,
  trackColor, fontSize) — omitted to the defaults; the brand ships no
  switch, only the segmented agree/disagree control.
- **Breadcrumb colours** — via the defaults (link/prussian/secondary/
  muted); no breadcrumb is published, metrics follow the 14px nav text.
- **Card hoverBackground** — omitted (keeps rest): the brand recolours the
  card border to cyan on hover and never the fill.
- **`cursor.text`** — no brand rule (UA default for inputs).

## Typography

- **Body / controls / fields / labels / display** (`font.sans`,
  `font.display`, `typography.control/field/label`): **'Noto Sans'** —
  12 `@font-face` rules (weights 400-900, woff2 from the theme `dist`) +
  `--awf-font-family:"Noto Sans"` (283 `var()`). We reference the font
  *name* only. Buttons 16/900, inputs and labels 16/400, all 150%.
- **Design-system scale** (all Noto Sans): h1 42/900/50px, h2 38/800/46px,
  h3 36/700/46px, h4 32/500/48px; t1 28/900, t2 24/500, t2-bold 24/900,
  t3 20/500, t4 18/500/45px; b1 18/400, b1-bold 18/900, b2 16/400,
  b2-bold 16/900, b3 14/400, b3-bold 14/900 (150% unless noted).
- **Montserrat** (account-CTA buttons, 9 rules) and **Arial** (meta-nav
  reset) are scoped to those components and carry no font role.
- **Monospace** (`font.mono`): system stack.
- Links: 16/900 cyan `#009ee0`, not underlined at rest (explicit on the
  EDM file link; absent on CK/accordion/disclaimer links), underline on
  hover *(à confirmer)*. Link text colour is routed to persian (5.27:1).
- Tracking is 0 everywhere (two scoped negative values on WeSave
  subtitles); text-transform is `none` globally (scoped capitalize on
  user names, uppercase on warning titles + meta-nav links only).

## Signatures anatomiques

- **Rem root**: `html{font-size:16px}` twice, byte-identical — factor 1,
  no conversion. Base: `body` white + prussian (twice identical),
  `p{margin-bottom:2%}`, brand reset `*,*:before,*:after{margin:0;padding:0}`.
- **Fields**: `field.style = "outline"` — transparent fill over white,
  1px light-grey on all four sides, .5rem radius, 2.5rem box, 16/400
  prussian text, storm placeholder; hover/focus-visible recolour the
  border to theme (6 rules); `:focus` outlines are explicitly suppressed
  on all three input types (plus the open autocomplete). Native
  `<select>` redrawn: `appearance:none`, prussian 12×10 chevron,
  2.25rem gutter at right 13px. Error = red border; empty select =
  placeholder colour. Labels 16/400; checkboxes 18px native with theme
  `accent-color`; radios unstyled (layout + red error + 14/400 dark-grey
  helper only).
- **Radius**: 0 (back button, meta-nav), .25rem (modal body, logout,
  quote), .5rem (inputs, cards), 1rem (`--awf-radius-image`: images,
  dialog, autocomplete), 9999px (buttons, search, pagers, toggle).
  Residual: brand cards are .5rem but render at `lg` (1rem) through the
  shared card radius — images, dialog and autocomplete carry the 1rem.
- **Focus**: `focus.strategy = "outline"`, 2px, 2px offset, cyan
  `#009ee0` (3.01:1 — line floor). The account CTA draws the same
  outline in theme-cerulean (1 rule each; cyan wins on scope +
  consumption 88 vs 43). Meta-nav links use a 2px/1px accent outline at
  negative offset (scoped); WeSave a 1px `#d5d7da` outline (scoped).
  Note: two rules also emit Tailwind ring boilerplate whose colour is
  never overridden (stock blue halo under the explicit outline).
- **Buttons**: primary = pill, min-height 3.125rem, cerulean fill,
  midnight text + arrows (5.86:1); secondary = outlined pill, 1px
  prussian ring + text; tertiary = cyan text; back = flush dark-grey.
  No `:hover`, `:disabled`, `:focus` or `transition` rule exists for
  factory/submit buttons (empty greps quoted in the report); the
  account-CTA hover background references the undeclared
  `--awf-color-button-border` and drops. Submit mirrors the factory
  variants; dialog first-actions are secondary-style; cookie/login/
  dialog CTA buttons use scoped Montserrat 700. Disabled submit = snow
  fill + dark-grey @20% ring + dark-grey text + opacity .5.
- **Tabs / top-nav**: 16/900 text tabs, 1.5rem block padding, bottom
  indicator bar (alto: white bar, cerulean when active; meta-nav: 3px
  accent) — mapped `indicatorMode: "shadow"` (drawn bar, DSFR
  precedent), active text prussian (light translation of on-dark white).
- **Pagination**: 2.5rem circle pager — white fill, 1px prussian ring,
  theme fill on hover with the ring dropped (carousel arrows: same at
  2.75rem, transparent fill); active numbers midnight (5.86:1) since
  numbers are text and the brand's white-on-theme is icon-context.
- **Breadcrumb**: unpublished — 14px/150%/900 nav metrics, colours via
  the measured role defaults.
- **Alert**: factory-messages box (white, 1px light-grey@20%, .75rem
  radius, 3rem severity bar + icon, midnight text, .75rem block /
  4.5rem left / .5rem right padding; toast adds the lg shadow) +
  info-box variant (snow or bordered, dark-grey 14px copy, cyan/orange
  icon rings).
- **Toggle / switch**: no switch published — the segmented
  agree/disagree control (60px, 50px radius, cyan track, white slider,
  white/cyan labels); mapped leaves only, the rest omitted.
- **Search**: pill input-text (3.5rem box, 3.5rem icon gutter); open
  state squares the bottom corners, drops the border-bottom and kills
  the outline under the autocomplete (alice hover + 3px theme filet).
- **Messages/toast**: `[data-drupal-messages]` fixed stack at z 100,
  lg shadow; caption text midnight.
- **Modal**: `display:none` + opacity 0 → scrim `rgb(0 0 0 / .4)` with
  12px backdrop blur, .3s fade; body white .25rem; dialog 1rem radius,
  2rem padding, lg shadow, 534px desktop width.
- **Disabled**: icon nav buttons `cursor:not-allowed` + opacity .3
  (3 rules) → `disabledOpacity: "0.3"`; submit exception noted above.
- **Density**: md = measured inputs (2.5/0.5/1rem, .5rem checkbox gap),
  lg = measured buttons (3.125/.25/1.5rem), sm = base *(à confirmer)*.
- **Motion**: fast 150ms / normal 300ms (modal) / slow 500ms (single
  max use); easing `cubic-bezier(.4,0,.2,1)` ×14 — vendor default
  retained (Tailwind `ease-in-out`, verified in the excluded utility
  line); interaction transitions use `transition-property: all` (×9).
- **Shadows**: `0 1px 2px #3838381a` ×12 (brand) + retained lg (toast,
  dialog) and xl (nav dropdown); `shadow-sm` stock also consumed
  (info-box, cards) as the documented alternate.
- **Overlay**: modal `rgb(0 0 0 / .4)` corroborated by metanav
  `#00000066` (same black 40%, two notations, two files).
- **Modes**: dark-mode mappings and six alt colorways ship in the CSS
  but paint nothing on the homepage (`data-awf-theme-mode="dark"` ×0,
  `data-awf-theme-color="default"` ×1) — this light theme follows the
  default colorway; turquoise/purple/black/arsenic carry no role.
- **Table headers** (white 700 on theme, 3.41:1) and **warning-icon**
  pairs stay brand-side: fills keep brand hexes; only text/link roles
  were routed to legible brand blues.

## Asset officiel

- Amundi identity = the Amundi wordmark (header logo slot 94×44px per
  `--awf-logo-width` / `--awf-logo-height`; footer lockup 160×96px).
  Use the official SVG/PNG from the brand assets — **do not redraw the
  logo by hand**. This package only references font *names* (Noto Sans)
  and public colour values, never logo artwork or font binaries.
