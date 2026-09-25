# Unibail-Rodamco-Westfield → Sentropic mapping

This package maps the **public** Unibail-Rodamco-Westfield corporate site design
onto the Sentropic token structure (`TenantTheme`). Method =
**measured-clone**: the signature brand red (`#d62d20`, the named `main-red`
Tailwind theme token) and the neutral scale are read from the public site
stylesheet linked from the homepage; only public values and font *names*
(FlamaCondensed, the self-hosted `@font-face` brand face; Helvetica for body)
are referenced — never font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured fact: the brand red barely clears AA as text — `#d62d20` on
> white is 4.93:1, so white text on the red (4.93:1) also passes and the same
> hex serves as action fill, link, interactive border and focus ring with no
> stop-rule darkening.

## Sources

- Unibail-Rodamco-Westfield corporate site — https://www.urw.com/ (all colour
  and font values come from its homepage stylesheets, captured 2026-09-24;
  the fingerprinted `_next/static/css` URLs below are the capture-date
  addresses — a redeploy will change the hashes)
- Site stylesheets linked from the homepage (all four counted; per-file
  counts below are declarations in that file):
  - https://www.urw.com/_next/static/css/7843b1ae797e0adf.css — carries every
    cited value (named theme tokens `main-red` / `soft-gray` / `mist-gray` /
    `secondary-black` / `corn-silk` / `floral-white` / `gray`, site-owned
    `.text-body` / `.rich-text__highlighted-box` / `.border-left` /
    `.contact-form` / `.siteCoreContainer` rules, `@font-face` brand faces)
  - https://www.urw.com/_next/static/css/d3b6fcb82888184b.css — breadcrumb
    widget rules only (`box-shadow`, `border-radius`); no brand colour
  - https://www.urw.com/_next/static/css/74fc351921f6806e.css — `#000` /
    `#fff` only; no brand colour
  - https://www.urw.com/_next/static/css/1e2c655c8ff92db8.css — `#000` /
    `#fff` only; no brand colour
- `https://www.unibail-rodamco-westfield.com/` — does not resolve (DNS
  failure observed 2026-09-24; no HTTP status is observable);
  `urw.com` is the only usable source.
- Rem root: `html{font-size:16px}` in the main stylesheet, so `rem`
  transcriptions below are direct (no 62.5% conversion).

## Colour mapping

| Sentropic role | Unibail-Rodamco-Westfield source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `feedback.error` / `action.danger` | named `main-red` theme token (`.text-main-red`, `.bg-main-red`, `.border-main-red`, `.focus:ring-main-red`, 6× `rgb(214 45 32)` in `7843b1ae797e0adf.css`) + `.text-body{color:#d62d20}` + `.rich-text__highlighted-box{background-color:#d62d20}` + `.hover:fill-[#d62d20]{fill:#d62d20}` — 9 declarations (the 10th `#d62d20` string is the `.hover:fill-[#d62d20]` selector escape, not a value) | `#d62d20` |
| `action.primaryHover` | darker red, one HSL L −0.06 step from `#d62d20` — a choice outside the stop rule (the method's only step is −0.05) | `#bb271c` *(à confirmer)* |
| `buttonSecondary.hoverBackground` / light red tint | chosen light red tint, coherent stand-in, not a stop-rule product | `#fae3e1` *(à confirmer)* |
| `text.primary` / `surface.inverse` | `.text-title{color:#242424}` + `.article__text-body{color:#242424}` | `#242424` |
| `text.secondary` | named `secondary-black` theme token | `#333333` |
| `text.muted` | `.contact-form .form-note{color:#666}` | `#666666` |
| `border.subtle` / field stroke | `.border-left{border-left:.0625rem solid #cdd0d4}` | `#cdd0d4` |
| `border.strong` | named `gray` theme token (`.border-gray`) | `#b4b3b3` |
| `surface.subtle` / `action.secondary` | named `soft-gray` theme token (`.bg-soft-gray`) | `#e8e8e8` |
| `action.secondaryHover` | `.border-left` grey reused as hover | `#cdd0d4` |
| `surface.default` / `surface.raised` / `field.fillBg` | white (`.contact-form input{background:#fff}`) | `#ffffff` |
| darkest slate | `.contact-form-container h2{color:#111}` | `#111111` |
| warm accent light | named `corn-silk` theme token (`.bg-corn-silk`) | `#e0d9d1` |
| warm accent mid | named `floral-white` theme token (`.text-floral-white`) | `#a99f93` |
| warm accent deep | chosen deep taupe stand-in from `#a99f93`, not a stop-rule product (no −0.05/−0.06 step produces it) | `#7d7468` *(à confirmer)* |
| `feedback.success` | derived success green (7.13:1 on white) | `#166534` *(à confirmer)* |
| `feedback.warning` | derived warning amber (5.02:1 on white) | `#b45309` *(à confirmer)* |
| `feedback.info` | derived info blue (6.70:1 on white) | `#1d4ed8` *(à confirmer)* |
| `surface.overlay` | derived modal backdrop from the brand near-black `#242424` (no `.modal-overlay` / `.backdrop` / `.c-modal` background published) | `rgb(36 36 36 / 0.6)` *(à confirmer)* |
| `shadow.*` tint | derived shadow tints from the brand near-black `#242424` (`rgb(36 36 36)`) at 0.10 / 0.14 / 0.18 opacity — no shadow colour published | `rgb(36 36 36 / 0.10)`, `rgb(36 36 36 / 0.14)`, `rgb(36 36 36 / 0.18)` *(à confirmer)* |
| (context, not in the palette) input stroke | `.contact-form input{border:1px solid #ccc}` — 1 declaration; kept as context, `border.subtle` carries `.border-left` `#cdd0d4` (a rule whose whole purpose is a border declaration wins the 1–1 tie under rule (2)) | `#cccccc` |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | white text on Main Red (contrast choice, 4.93:1) | `#ffffff` *(à confirmer)* |

Frequency note (tie-break record — all counts in `7843b1ae797e0adf.css`,
the only sheet carrying brand values):
- Red role: `main-red` wins with **9 declarations** (3× `#d62d20` hex as
  property values in `.text-body`, `.rich-text__highlighted-box`,
  `.hover:fill-[#d62d20]{fill:#d62d20}` + 6× `rgb(214 45 32)` in the
  `main-red` utilities; the 10th `#d62d20` string is the
  `.hover:fill-[#d62d20]` selector escape, not a declaration). No second red
  token contends in this sheet.
- Surface-alt role: `soft-gray` (`rgb(232 232 232)`, 5×) wins over
  `mist-gray` (`rgb(241 241 243)`, 2×) and `secondary-white` (3 mentions:
  2× `rgb(234 234 234)` declarations in `.bg-[#eaeaea]` /
  `.bg-secondary-white` + 1× hex in the `.bg-[#eaeaea]` selector escape).
- `text.muted`: `#666666` wins 1–1–1 over `rgb(120 120 120)`
  (`.text-[#787878]`) and `rgb(121 118 118)` (`.text-[#797676]`) —
  `.contact-form .form-note{color:#666}` is a form-scoped brand rule naming
  the muted-note role, while both contenders are arbitrary-value Tailwind
  utilities with no role signal (rule (2)).
- Darkest slate: `#111111` wins 1–1–1 over `.text-[#1c1c1c]`
  (`rgb(28 28 28)`) and `.text-[#2a292b]` (`rgb(42 41 43)`) —
  `.contact-form-container h2{color:#111}` is a brand heading rule, while
  both contenders are arbitrary-value utilities with no role signal
  (rule (2)).
- `border.subtle`: `#cdd0d4` wins 1–1–1–1 over `#efefef`, `#e2e2e2`,
  `#d3d3d3` — `.border-left{border-left:.0625rem solid #cdd0d4}` declares a
  border, while the three contenders are `fill:` declarations of
  `.fill-[#…]` SVG utilities (rule (2): a border rule beats fills).
- The `.slick-dots` carousel override in the same stylesheet declares no
  colour and contributes nothing.
- The `.contact-form*` block is kept as brand property (correction (b)):
  under Step 0.5 its selectors name site components (form container,
  inputs, button), so it is not a third-party block. Its values serve
  form-scoped roles (`text.muted`, darkest slate, `field.fillBg #ffffff`,
  `borderWidth.thin 1px`, `radius.sm/md 6px`, `radius.lg 12px`,
  `field.style = "outline"`); the site-wide action role goes to the
  least-scoped site-wide rules (section 8.3), i.e. the `main-red`
  utilities. Accordingly `#d90429` (`.contact-form
  button{background-color:#d90429}`, 1 declaration; hover `#a90322`, 1
  declaration, kept as context) is demoted 1 vs 9 by frequency, and
  `#f9f9f9` (`.contact-form-container{background:#f9f9f9}`, 1 mention,
  matching no named token) is kept as context, not promoted.

## À confirmer (derived or no published brand token)

- **Red hover/light/deep tints** (`#bb271c`, `#fae3e1`, `#7d7468`) — the brand
  publishes one red (`main-red`) and two warm neutrals; hover, light-fill and
  deep-accent steps are chosen stand-ins, not stop-rule products: `#bb271c`
  is one HSL L −0.06 step from `#d62d20` (the method's only step is −0.05,
  so this is a choice outside the stop rule), `#fae3e1` announces no
  transformation, and no −0.05/−0.06 step from `#a99f93` produces `#7d7468`.
- **Feedback hues** (`success #166534`, `warning #b45309`, `info #1d4ed8`) —
  the brand publishes no green/amber/blue; derived values chosen to clear
  4.5:1 on white (7.13 / 5.02 / 6.70). `error` reuses the measured Main Red.
- **Modal backdrop** (`rgb(36 36 36 / 0.6)`) — no modal/overlay background is
  published; derived from the brand near-black `#242424`.
- **White on red** (`#ffffff` as `primaryText`) — contrast choice (4.93:1),
  not a published pairing.
- **Font-stack assignment** — FlamaCondensed (display) and Helvetica (body)
  names are measured (`.font-flama`, `.font-helvetica`); assigning the
  condensed face to control labels is a judgement call.
- **Link rest state** — `text.link = #d62d20` is inferred from
  `.text-body{color:#d62d20}` and the `main-red` token, not measured on a
  link rule: at rest `a{color:inherit}`, and the only link rule,
  `.siteCoreContainer a:hover{color:#333;text-decoration:underline}`,
  fixes the *hover* colour to `#333` (not the red) while measuring the
  hover underline. The non-underlined rest state is assumed.
- **Focus ring colour assignment** — the ring technique, its 2px width
  (`.focus:ring-2:focus{…calc(2px + var(--tw-ring-offset-width))…}`), its
  2px offset
  (`.focus:ring-offset-2:focus{--tw-ring-offset-width:2px}`) and its Main
  Red colour (`.focus:ring-main-red`) are all measured; carrying that red
  into `focus.color` is the mapping choice.
- **Categorical `data.*` palette** (`#d62d20`, `#242424`, `#1d4ed8`,
  `#b45309`, `#166534`, `#a99f93`, `#333333`, `#bb271c`) — a coherent
  proposal from the brand hues, not an official sequential scale.
- **Tag / badge pill radii** (`999px`) — pill chip shapes are not published;
  the 6px brand radius would also be defensible.
- `shadow.*`, `motion.*` (incl. `easing`), `disabledOpacity`, `transition`
  and `density.*` — not published as a size grid (brand geometry found:
  `.contact-form input{padding:10px 12px}`, no `height`/`min-height` on
  brand form controls; `.contact-form button{padding:12px 28px}`); aligned
  with the reference theme package's geometry. Gaps vs the Sentropic base:
  `md.paddingBlock` 0.375rem (base 0), `md.paddingInline` 0.75rem (base
  1rem), `sm.paddingInline` 0.5rem (base 0.75rem), `lg.paddingInline` 1rem
  (base 1.25rem), `sm.gap` 0.5rem (base 0.375rem), plus the extra
  `fontSize` key — `controlHeight`, the other gaps/min-widths and
  `iconSize` match the base.

## Typography

- **Display** (`font.display`, `typography.control`): **'FlamaCondensed'** —
  self-hosted `@font-face` brand face on `urw.com`
  (`FlamaCondensed-Basic/Bold/Extrabold`) + `.font-flama` utility. We
  reference the font *name* only.
- **Body / fields / labels** (`font.sans`, `typography.field/label`):
  **'Helvetica'** — `.font-helvetica{font-family:Helvetica,Arial,sans-serif}`
  utility. We reference the font *name* only.
- **Monospace** (`font.mono`): system stack.
- Links: Main Red `#d62d20` (4.93:1 on white) by inference from
  `.text-body` and the `main-red` token — no resting link-colour rule is
  published (`a{color:inherit}`); not underlined at rest (assumed),
  underlined on hover (`.siteCoreContainer a:hover`, whose hover colour is
  `#333`, not the red).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff`
  fill, 1px `#ccc`-family border from `.contact-form input`, 6px radius).
  Native `<select>` chevron redrawn in the Main Red `#d62d20`.
- **Radius**: 6px on controls/inputs/buttons (`radius.sm/md = 0.375rem`,
  `.contact-form` radius), 12px on panels (`radius.lg = 0.75rem`,
  `.contact-form-container` radius); pills/tags stay `999px`.
- **Focus**: **ring** in the Main Red `#d62d20`
  (`focus.strategy = "ring"`, 2px width measured in
  `.focus:ring-2:focus`, 2px offset measured in
  `.focus:ring-offset-2:focus`).
- **Buttons**: primary = solid Main Red `#d62d20` with **white text**
  `#ffffff` (4.93:1) → hover `#bb271c`; secondary = **outlined** in the Main
  Red (transparent fill, `#d62d20` border, light-red `#fae3e1` hover fill).
- **Tabs / top-nav**: active tab = Main Red label `#d62d20` with a bottom red
  underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: borderless Main Red links; active page = filled Main Red
  `#d62d20` with white text.

## Asset officiel

- Unibail-Rodamco-Westfield logo: the red "URW" / "Westfield" wordmark. Use
  the official SVG/PNG from the brand assets — **do not redraw the logo by
  hand**. This package only references font *names* (FlamaCondensed,
  Helvetica) and public colour values, never logo artwork or font binaries.
