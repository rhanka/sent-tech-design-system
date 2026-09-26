# bioMérieux → Sentropic mapping

This package maps the **public** bioMérieux website design onto the
Sentropic token structure (`TenantTheme`). bioMérieux publishes no
tokenised public design system, so the brand values are measured from the
official site stylesheet (`clientlib-site.min.css`, source (b) of the
method). Method = **measured-clone**: the corporate blue (`#00427f`,
`--color-blue-primary`, 311 `var()` references + 3 literal occurrences in
the brand region) is read from the brand's own `:root` tokens and carries
links, buttons, titles and form focus. Only public values and font *names*
are referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> Key measured fact: the brand's most authoritative-looking asset is a
> lime secondary, not a blue one — secondary buttons and active tabs pair
> bitter-lemon `#cddb2e` with corporate-blue text `#00427f` (6.60:1; white
> text on that lime would be 1.53:1, so the blue pairing is the brand's
> own contrast answer).

## Sources

- bioMérieux corporate site — https://www.biomerieux.com/ (HTTP 200, fetched 2026-09-26 with the native network tool)
- Brand stylesheet — https://www.biomerieux.com/etc.clientlibs/onebmx/clientlibs/clientlib-site.min.css (552 056 bytes, the single measured file; every cited value names a token or rule from it)
- Font name — declared by the official stylesheet itself (`html{font-family:Arial,sans-serif}`, `--arial:Arial,sans-serif`)

## Counting conventions

Every figure below counts **declarations** (one match = one declaration of
that hex: a `--*` custom-property declaration, or a property value
containing the hex), case-insensitively, over the **brand region** (= the
whole measured file — Step 0.5 found no vendor block: no reset run, no
`--bs-*`, the 4 `onetrust` mentions are the brand's own
`.cmp-embed__onetrust-*` placeholder rules). Short forms are expanded
before counting (`#ccc` and `#cccccc` are one colour and count together);
8-digit alpha forms (`#0000001f`, `#00000061`) are counted separately;
`rgb()`/`rgba()` equivalents are reported apart, never merged. Two numbers
are given per promoted hex: its `var()` **references** and its literal
**occurrences** in the brand region. Root: `html{font-size:16px`, so
1rem = 16px (no 62.5% trick).

## Colour mapping

| Sentropic role | bioMérieux source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `focus.color` | `--color-blue-primary` (311 references + 3 occurrences) | `#00427f` |
| `action.primaryHover` | `--color-blue-prussian-hover` (17 references, button hover) | `#00325f` |
| `surface.inverse` | `--color-blue-prussian` (4 references, dark corporate blue) | `#00305d` |
| `pagination.activeBackground` / `blue.10` | `--color-blue-light` (5 references, current-page pill) | `#d9e3ec` |
| `feedback.info` / `status.processing` | `--color-blue-fresh` (1 reference + 2 occurrences, search-highlight border) | `#0a7feb` |
| `cyan.50` (accent) | `--color-blue-sea-serpent` (27 references, gradients) | `#4ec3e0` |
| `action.secondary` / `tabs.activeBackground` | `--color-green-bitter-lemon` (29 references, secondary buttons + active tabs) | `#cddb2e` |
| `action.secondaryHover` / `buttonSecondary.hoverBackground` | `--color-green-rio` (12 references, secondary hover/focus) | `#bdcb22` |
| `action.secondaryText` | corporate blue on lime (measured secondary-button pairing, 6.60:1) | `#00427f` |
| `feedback.success` / `status.completed` | `--color-green` (120 references, link hover + accents) | `#3c9845` |
| `cyan` gradient end / secondary variant | `--color-green-pear` (40 references, gradients) | `#bfd630` |
| `feedback.warning` / `status.pending` | `--color-yellow` (13 references, markers + hotspot headers; fill only, 1.31:1) | `#f6e420` |
| gradient end | `--color-yellow-lemon` (5 references) | `#ffdd37` |
| `action.danger` / `feedback.error` / `status.failed` | `--color-red` (8 references, form errors + alerts) | `#d00000` |
| `action.primaryText` / `text.inverse` / `field.fillBg` / `surface.default` | `--color-white` (204 references + 55 occurrences) | `#ffffff` |
| `surface.subtle` / `card.hoverBackground` | `--color-grey-mercury` (12 references, `background-grey` sections) | `#ebebeb` |
| `tag.neutralBackground` | `--color-grey-smoke` (17 references, filter/aside surfaces) | `#f2f2f2` |
| (no role — raw palette only) | `--color-grey-abalaster` (3 references + its own declaration, header-nav hover/focus tint; no vacant Sentropic role) | `#fafafa` |
| (no role — raw palette only) | `--color-grey-light` (9 references + 1 literal outside its declaration, disabled controls + dividers; no vacant Sentropic role) | `#d9d9d9` |
| `border.subtle` | `--color-grey-silver` (40 references, dividers + field strokes) | `#cccccc` |
| `border.strong` | strong divider grey (8 literal occurrences, article/event dividers) | `#b7b7b7` |
| `text.muted` | `--color-grey-dark` (21 references, breadcrumb links; 4.48:1, arbitration) | `#777777` |
| `text.secondary` | `--color-grey-darker` (2 references + 3 occurrences, tabs descriptions; 12.63:1) | `#333333` |
| `text.primary` | `--color-black` (33 references, `html` body colour; 9.74:1) | `#444444` |
| `surface.overlay` | `--color-backdrop` via `.dialog__backdrop{background:var(--color-backdrop)}` (form normalised) | `rgba(0, 0, 0, 0.8)` |
| `breadcrumb.linkText` | `--color-grey-dark` (measured trail-link rule) | `#777777` |
| `breadcrumb.separator` | `arrow-full-right-blue.svg` separator image, expressed as corporate blue | `#00427f` |
| `tabs.activeText` / `accordion.text` / `badge.infoBackground` | corporate blue (measured active-tab, accordion-title rules) | `#00427f` |
| `pagination.text` / `pagination.activeText` | body black (page links; current pill declares no colour, inherits) | `#444444` |
| `choice.labelColor` / `toggle.textColor` | body black (labels inherit) | `#444444` |
| `data.category1..8` | coherent proposal from measured hues (corporate blue, brand green, highlight yellow, gradient blue, red, info blue, dark grey, dark blue) | `#00427f`, `#3c9845`, `#f6e420`, `#4ec3e0`, `#d00000`, `#0a7feb`, `#777777`, `#00305d` *(à confirmer)* |

Contrast on white (`surface.default`): `text.primary` 9.74:1,
`text.secondary` 12.63:1, `text.link` 10.07:1, `text.muted` 4.48:1
(arbitration, recorded), `border.interactive` / `focus.color` 10.07:1
(≥ 3:1), `action.danger` 5.70:1, secondary pair `#00427f` on `#cddb2e`
6.60:1, pagination pair `#00427f` on `#d9e3ec` 7.74:1. Brand fills kept
as-is; only text/line roles route to readable neighbours, and every routed
value above is a measured brand token.

## À confirmer (derived or no published brand token)

- **Categorical `data.*` palette** (`#00427f`, `#3c9845`, `#f6e420`, `#4ec3e0`, `#d00000`, `#0a7feb`, `#777777`, `#00305d`) — a coherent proposal from measured brand hues, not an official sequential scale.
- **`text.muted` arbitration** — `#777777` at 4.48:1 clears the 3:1 floor with its ratio recorded; between 3 and 4.5 it is a documented arbitration, not a defect.
- **Font stack** — Arial is declared by the stylesheet (`html`, `--arial`); the exact fallback stack here is a faithful expression, the precise published stack is *à confirmer*.
- **Select chevron** — the brand strips native styling (`appearance:none`, 24 declarations) but ships no SVG of its own; the data-URI chevron redraws the indicator in the corporate blue.
- `spacing.*`, `z.*`, `disabledOpacity` (`0.55`), `iconSize.*`, `motion.slow` (`450ms`), and the sm/lg `density.*` gaps, font sizes and min-widths — not tokenised by the brand; kept aligned with the Sentropic base / standard size scale.
- Tabs indicator geometry, pagination `minSize`/`paddingBlock`/`lineHeight`, alert filet + paddings, tag/badge geometry, search + choice line-heights — aligned with the reference theme package's geometry.
- **Observed but unassigned** (brand region, no token, no role — deliberately not promoted): `#003366` (literal of `#036`, a11y `highlight-links` mode + dialog hover, 3 occurrences), `#e0e0e0`/`#c9c9c9`/`#bdbdbd` (podcast-player gradients), `#e6e6e6` (section background gradients), `#9ebc36` (toggle-on knob, 1 occurrence). Endowment-scoped tokens (`Mansalva`, `#b3dff7`, `#eff8fb`) belong to the endowment subsite scope, not the corporate brand.
- **Subscription-scoped form variants** (measured, one rule each — documented, not promoted): text-input radius 5px (`.cmp-form__subscription .cmp-form-text input{border-radius:5px}`; the general input radius stays 2px) and label 24px/700 (`.cmp-form__subscription .cmp-form-text label`; the general label stays 1rem/600).

## Typography

- **Body / controls / fields / labels / display** (`font.sans`, `font.display`, `typography.control/field/label`): **'Arial'** — declared `font-family:Arial,sans-serif` on `html`; `--font-body` resolves to `var(--arial)`. Buttons bold (700); body size 1.125rem (`--font-text-rg`), line height 1.333 (`--line-height-body`). Form labels are 1rem (`--font-text-sm`) semibold (600) in every general label rule and declare no line height, so they inherit the body 1.333. The 700 label at 24px (`.cmp-form__subscription .cmp-form-text label`) is subscription-scoped, not promoted. We reference the font *name* only.
- **Monospace** (`font.mono`): system stack.
- Links: corporate blue `#00427f`, not underlined at rest (`a{color:var(--color-blue-primary);text-decoration:none}`), not underlined on hover either (only the pager underlines — pagination's own rule).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — unfilled inputs, 1px silver `#cccccc` border with the general 2px radius (`.cmp-form-text__text{border:1px solid var(--color-grey-silver);border-radius:var(--border-radius-form)}`). The 5px text-input radius is subscription-scoped (`.cmp-form__subscription .cmp-form-text input{border-radius:5px}` — scoped variant, not promoted). Native `<select>` chevron redrawn in corporate blue `#00427f`.
- **Radius**: general form/input radius 2px (`--border-radius-form`); subscription-scoped input variant 5px (one rule); alerts/dialogs 10px (9 occurrences — a single alert rule, the rest podcast, progress-bar and focus rings); buttons fully pill 50px (`--border-radius`); each figure counts declarations, short forms expanded.
- **Focus**: **outline** in corporate blue `#00427f` (`focus.strategy = "outline"`, 2px width, 2px offset — measured form-control `:focus-visible` rule; the five `outline:none` rules are component-scoped removals — accordion, timeline, language nav, subscription-toggle, worldmap — and no box-shadow ring is drawn on focus).
- **Buttons**: pill primary = solid corporate blue `#00427f` with **white text** (10.07:1) → hover `#00325f` (`min-height:50px` — 6 declarations; `padding:0 32px` — 7 declarations, one endowment-scoped; counted as declarations); secondary = **lime** `#cddb2e` with blue text → hover `#bdcb22`.
- **Tabs / top-nav**: active tab = bitter-lemon fill `#cddb2e` with corporate-blue label `#00427f`.
- **Pagination**: borderless bold black links, blue underline on hover/focus; current page = light-blue `#d9e3ec` pill (`padding:0 .5rem`, counted as one declaration).
- **Density**: inputs 40px (`min-height:40px`, 3 declarations), buttons 50px (`min-height:50px`, 6 declarations), teaser buttons 58px (`min-height:3.625rem`, 3 declarations) — each figure counts declarations of that property value.

## Asset officiel

- bioMérieux logo = the `biomerieux.svg` brand mark served from the official site (`/content/dam/onebmx/logos/biomerieux.svg`). Use the official SVG from the brand assets — **do not redraw the logo by hand**. This package references only font *names* and public colour values, never logo artwork or font binaries.
