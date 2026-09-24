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
  and font values come from its homepage stylesheets)
- Site stylesheet —
  https://www.urw.com/_next/static/css/7843b1ae797e0adf.css (named theme
  tokens `main-red` / `soft-gray` / `mist-gray` / `secondary-black` /
  `corn-silk` / `floral-white` / `gray`, site-owned `.text-body` /
  `.rich-text__highlighted-box` / `.border-left` / `.contact-form` /
  `.siteCoreContainer` rules, `@font-face` brand faces)
- `https://www.unibail-rodamco-westfield.com/` — unreachable (HTTP 502 on
  2026-09-24); `urw.com` is the only usable source.

## Colour mapping

| Sentropic role | Unibail-Rodamco-Westfield source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` / `feedback.error` / `action.danger` | named `main-red` theme token (`.text-main-red`, `.bg-main-red`, `.border-main-red`, `.focus:ring-main-red`) + `.text-body{color:#d62d20}` | `#d62d20` |
| `action.primaryHover` | derived darker red (HSL L −0.06 from `#d62d20`) | `#bb271c` *(à confirmer)* |
| `buttonSecondary.hoverBackground` / light red tint | derived light red tint | `#fae3e1` *(à confirmer)* |
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
| warm accent deep | derived deep taupe from `#a99f93` | `#7d7468` *(à confirmer)* |
| `feedback.success` | derived success green (7.13:1 on white) | `#166534` *(à confirmer)* |
| `feedback.warning` | derived warning amber (5.02:1 on white) | `#b45309` *(à confirmer)* |
| `feedback.info` | derived info blue (6.70:1 on white) | `#1d4ed8` *(à confirmer)* |
| `surface.overlay` | derived modal backdrop from the brand near-black `#242424` (no `.modal-overlay` / `.backdrop` / `.c-modal` background published) | `rgb(36 36 36 / 0.6)` *(à confirmer)* |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | white text on Main Red (contrast choice, 4.93:1) | `#ffffff` *(à confirmer)* |

Frequency note (tie-break record): `main-red` wins the red role with 10
declarations (4× `#d62d20` hex in `.text-body`,
`.rich-text__highlighted-box`, `hover:fill-[#d62d20]` + 6× `rgb(214 45 32)`
in the `main-red` utilities) over the second named token `red` (`#dc2203`,
3×). `soft-gray` (`#e8e8e8`, 5×) wins the surface-alt role over `mist-gray`
(`#f1f1f3`, 2×) and `secondary-white` (`#eaeaea`, 2×). The `.slick-dots`
carousel override in the same stylesheet declares no colour and contributes
nothing; the `#d90429` contact-form button red is kept as context, not
promoted.

## À confirmer (derived or no published brand token)

- **Red hover/light/deep tints** (`#bb271c`, `#fae3e1`, `#7d7468`) — the brand
  publishes one red (`main-red`) and two warm neutrals; hover, light-fill and
  deep-accent steps are derived from them.
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
- **Link rest state** — underline-on-hover is measured
  (`.siteCoreContainer a:hover`); the non-underlined rest state is assumed.
- **Focus ring width/offset** (`2px` / `2px`) — the ring technique and its
  Main Red colour are measured (`.focus:ring-main-red`); the width/offset are
  not published.
- **Categorical `data.*` palette** (`#d62d20`, `#242424`, `#1d4ed8`,
  `#b45309`, `#166534`, `#a99f93`, `#333333`, `#bb271c`) — a coherent
  proposal from the brand hues, not an official sequential scale.
- **Tag / badge pill radii** (`999px`) — pill chip shapes are not published;
  the 6px brand radius would also be defensible.
- `shadow.*`, `motion.*` (incl. `easing`), `disabledOpacity`, `transition`
  and the sm/lg `density.*` paddings — not published; aligned with the
  reference theme package's geometry. Only `density.*.controlHeight` and
  `iconSize` match the Sentropic base values.

## Typography

- **Display** (`font.display`, `typography.control`): **'FlamaCondensed'** —
  self-hosted `@font-face` brand face on `urw.com`
  (`FlamaCondensed-Basic/Bold/Extrabold`) + `.font-flama` utility. We
  reference the font *name* only.
- **Body / fields / labels** (`font.sans`, `typography.field/label`):
  **'Helvetica'** — `.font-helvetica{font-family:Helvetica,Arial,sans-serif}`
  utility. We reference the font *name* only.
- **Monospace** (`font.mono`): system stack.
- Links: Main Red `#d62d20` (4.93:1 on white), not underlined at rest
  (assumed), underlined on hover (`.siteCoreContainer a:hover`).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white `#ffffff`
  fill, 1px `#ccc`-family border from `.contact-form input`, 6px radius).
  Native `<select>` chevron redrawn in the Main Red `#d62d20`.
- **Radius**: 6px on controls/inputs/buttons (`radius.sm/md = 0.375rem`,
  `.contact-form` radius), 12px on panels (`radius.lg = 0.75rem`,
  `.contact-form-container` radius); pills/tags stay `999px`.
- **Focus**: **ring** in the Main Red `#d62d20`
  (`focus.strategy = "ring"`, 2px width, 2px offset — widths à confirmer).
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
