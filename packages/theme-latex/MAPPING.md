# LaTeX → Sentropic mapping

This package maps the **public** LaTeX typographic identity (the LaTeX
Project, CTAN sources, the Overleaf reference rendering) onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: lengths are
transcribed from the `article` / `book` class source, link colours from the
`hyperref` source, and only font *names* are referenced — no font binaries,
no class files. We redistribute neither LaTeX class files (LaTeX Project
Public License) nor font files (GUST Font License): this package ships
measured lengths, colour values and font names as strings only.
Derived/unmeasured values are flagged `à confirmer`.

> Key measured fact: LaTeX is not a website — there is no CSS to measure.
> There are no `input`, `focus` or `hover` declarations, no status palette,
> no shadow scale and no transition durations anywhere in the admitted
> sources. The large majority of `foundation` and `semantic` is therefore
> derived, and that is the conforming result: what is measurable
> (typography, lengths, rule thicknesses, link colours) is measured, the
> rest is derived and marked.

## Sources

- LaTeX Project — https://www.latex-project.org (project identity, LPPL licence)
- CTAN, `macros/latex/base/classes.dtx` — https://mirrors.ctan.org/macros/latex/base/classes.dtx (lengths: `\parindent`, `\textwidth`, `\baselineskip`, `\parskip`, `\arrayrulewidth`, `\fboxrule`, `\fboxsep`)
- CTAN, `macros/latex/contrib/hyperref/hyperref.dtx` — https://ctan.org/tex-archive/macros/latex/contrib/hyperref/hyperref.dtx (link colours: `\Hy@temp` defaults)
- CTAN, `systems/knuth/dist/tex/tex.web` — https://mirrors.ctan.org/systems/knuth/dist/tex/tex.web (`default_rule`, the default `\hrule` thickness)
- CTAN, `lm` package — https://ctan.org/pkg/lm (Latin Modern family, GUST metrics; font names only)
- CTAN, `tufte-latex` package — https://ctan.org/pkg/tufte-latex (Tufte-LaTeX tradition, contextual)
- Overleaf — https://www.overleaf.com (reference rendering: default 10pt `article` in Computer Modern)

## Units

TeX dimensions are points where 1 TeX pt = 1/72.27 inch — not the CSS point
of 1/72 inch. Conversion used throughout: 1 TeX pt = 96/72.27 = 1.32835 CSS
px; at a 16px root, 1 TeX pt = 0.08302rem.

## Colour mapping

| Sentropic role | LaTeX source | Value |
|---|---|---|
| `surface.default` / `surface.raised` | white stock (article/book default page, Overleaf render) | `#ffffff` |
| `text.primary` | default text colour, TeX black | `#000000` |
| `surface.inverse` | ink-black inverse plate (derived — à confirmer) | `#000000` *(à confirmer)* |
| `surface.subtle` | no tinted surface in print (derived — à confirmer) | `#f5f5f5` *(à confirmer)* |
| `surface.overlay` | no modal backdrop in print (derived — à confirmer) | `rgb(0 0 0 / 0.5)` *(à confirmer)* |
| `text.secondary` | no grey in print (derived — à confirmer) | `#475569` *(à confirmer)* |
| `text.muted` | no grey in print (derived — à confirmer) | `#64748b` *(à confirmer)* |
| `text.inverse` | white on ink plates | `#ffffff` |
| `text.link` / `action.primary` | hyperref `\Hy@temp{link}{red}`, darkened by the stop rule (chain L1) | `#e60000` |
| `action.primaryHover` | one step darker than primary for a visible state change (chain L1) | `#cc0000` *(à confirmer)* |
| `action.primaryText` | white on readable red, 4.81:1 | `#ffffff` |
| `action.secondary` / `action.secondaryHover` | paper fill / derived hover tint (derived — à confirmer) | `#ffffff` / `#e5e5e5` *(à confirmer)* |
| `action.secondaryText` | ink on paper, 21:1 | `#000000` |
| `border.subtle` | no grey hairline in print (derived — à confirmer) | `#e5e5e5` *(à confirmer)* |
| `border.strong` | rules are ink (`\arrayrulewidth` / `\fboxrule` are black 0.4pt strokes) | `#000000` |
| `border.interactive` / `focus.color` | hyperref `\Hy@temp{link}{red}` = `#FF0000`, 4.00:1, passes the 3:1 line floor | `#FF0000` |
| `feedback.success` / `status.completed` | stop rule from base `#16a34a` (chain S1, derived — à confirmer) | `#107636` *(à confirmer)* |
| `feedback.warning` / `status.pending` | stop rule from base `#d97706` (chain S2, derived — à confirmer) | `#a75c05` *(à confirmer)* |
| `feedback.error` / `action.danger` / `status.failed` | base `#dc2626`, 4.83:1, passes unmodified (derived — à confirmer) | `#dc2626` *(à confirmer)* |
| `feedback.info` / `status.processing` | base `#2563eb`, 5.17:1, passes unmodified (derived — à confirmer) | `#2563eb` *(à confirmer)* |
| `cyan.50` | hyperref `\Hy@temp{file}{cyan}` | `#00FFFF` |
| `data.category1` | hyperref link red, readable variant | `#e60000` *(à confirmer)* |
| `data.category2` | hyperref cite green, darkened for legibility | `#107636` *(à confirmer)* |
| `data.category3` | hyperref url magenta, darkened for legibility, 6.99:1 | `#a000a0` *(à confirmer)* |
| `data.category4` | hyperref file cyan, darkened for legibility, 6.25:1 | `#006b75` *(à confirmer)* |
| `data.category5` | ink | `#000000` *(à confirmer)* |
| `data.category6` / `data.category7` | neutral ramp (derived — à confirmer) | `#525252` / `#8c8c8c` *(à confirmer)* |
| `data.category8` | xcolor blue (derived — à confirmer) | `#2563eb` *(à confirmer)* |

Retained hyperref configuration: the classic `colorlinks` palette —
`linkcolor=red` (`#FF0000`), `citecolor=green` (`#00FF00`),
`filecolor=cyan` (`#00FFFF`), `urlcolor=magenta` (`#FF00FF`),
`menucolor=red`, `anchorcolor=black` (hyperref.dtx `\Hy@temp` block). By
default hyperref uses boxed (uncoloured) links; the colours above apply
under `colorlinks=true`. Pure `citecolor` green (`#00FF00`, 1.37:1) and pure
`filecolor` cyan (`#00FFFF`, 1.25:1) are unusable as drawn, so only darkened
variants enter text-facing roles; the pure values are recorded here as
context, not shipped in text roles.

## Measured lengths (classes.dtx, 10pt option)

| Length | Raw TeX value | Source | Transcription |
|---|---|---|---|
| `\parindent` | `15pt` | classes.dtx `10pt → \setlength\parindent{15\p@}` | 19.93px (≈1.25rem); documented, not a screen indent |
| `\textwidth` (article) | `345pt` | classes.dtx `10pt → \setlength\textwidth{345\p@}` | 458.28px (≈28.64rem); documented as the measure |
| `\textwidth` (book) | `4.5in` | classes.dtx `10pt&bk → \setlength\textwidth{4.5in}` | 432px (27rem); context |
| `\baselineskip` (normalsize) | `12pt` | classes.dtx `\@setfontsize\normalsize\@xpt\@xiipt` | 15.94px; leading 12/10 = `1.2` |
| Body size (normalsize) | `10pt` | same `\@setfontsize` call | 13.28px = `0.83rem` (control/field/label/tab sizes) |
| `\parskip` | `0pt plus 1pt` | classes.dtx `\setlength\parskip{0\p@ \@plus \p@}` | `0` (+1.33px stretch); no fixed gap |
| `\arrayrulewidth` | `0.4pt` | classes.dtx `\setlength\arrayrulewidth{.4\p@}` | 0.53px → `1px` hairline minimum |
| `\fboxrule` | `0.4pt` | classes.dtx `\setlength\fboxrule{.4\p@}` | 0.53px → `1px` hairline minimum |
| `\fboxsep` | `3pt` | classes.dtx `\setlength\fboxsep{3\p@}` | 3.99px (≈`0.25rem`) |
| default `\hrule` | `0.4pt` | tex.web `@d default_rule=26214 {0.4pt}` | 0.53px → `1px` hairline minimum |

## Stop-rule chains (section 9)

HSL darkening, −0.05 L per step, ratios against `surface.default` `#ffffff`:

- **L1 — link red:** start `#FF0000` (4.00) → step 1 `#e60000` (4.81) FIRST
  PASS, 1 step. Shipped as `text.link` / `action.primary`. `action.primaryHover`
  = step 2 `#cc0000` (5.89), one step darker so the hover state is visible.
- **S1 — success:** start `#16a34a` (3.30) → step 1 `#138d40` (4.28, fail) →
  step 2 `#107636` (5.73) FIRST PASS, 2 steps. Shipped as `feedback.success`.
- **S2 — warning:** start `#d97706` (3.19) → step 1 `#c06905` (3.99, fail) →
  step 2 `#a75c05` (5.03) FIRST PASS, 2 steps. Shipped as `feedback.warning`.
- **Zero-step (recorded, no darkening needed):** `#dc2626` (4.83) shipped as
  `feedback.error`; `#2563eb` (5.17) shipped as `feedback.info`;
  `#FF0000` (4.00 ≥ 3:1) shipped as `border.interactive` / `focus.color`;
  `#475569` (7.58) shipped as `text.secondary`; `#64748b` (4.76) shipped as
  `text.muted`.

## À confirmer (derived or no published LaTeX token)

- **Neutral surfaces and hairlines** (`surface.subtle` `#f5f5f5`,
  `surface.overlay` `rgb(0 0 0 / 0.5)`, `border.subtle` `#e5e5e5`,
  `action.secondaryHover` `#e5e5e5`, `buttonSecondary.hoverBackground`
  `#f5f5f5`, `tag.neutralBackground` `#f5f5f5`, slate `10` `#f5f5f5` / `20`
  `#e5e5e5` / `60` `#475569` / `80` `#262626`): print
  has exactly one surface tone (white) and ink rules; every tint is a
  coherent stand-in with no upstream source.
- **Inverse plate** (`surface.inverse` `#000000`): article/book publish no
  inverse surface; ink is the only dark plate available.
- **Grey text** (`text.secondary` `#475569`, `text.muted` `#64748b`,
  `breadcrumb.text`/`separator`): no grey scale upstream; base-anchored
  stand-ins verified by the zero-step chains above.
- **Primary hover** (`action.primaryHover` `#cc0000`): print has no hover
  state; one stop-rule step darker than primary.
- **Status palette** (`feedback.success` `#107636`, `feedback.warning`
  `#a75c05`, `feedback.error` `#dc2626`, `feedback.info` `#2563eb`, all of
  `status.*`): LaTeX publishes no status colours; the base hues, stop-ruled
  where they failed (chains S1/S2).
- **Categorical scale** (`data.category1..8`): no upstream categorical
  scale; proposal from the hyperref hues + ink + neutral ramp.
- **Focus technique** (`focus.strategy = "outline"`, `width`/`offset`
  `2px`): print has no focus indicator; the outline technique follows the
  TeX box idiom. Only the colour (`#FF0000`) is measured.
- **Field technique** (`field.style = "outline"` is the measured \fbox
  frame; `selectChevron`, `selectPaddingRight`): the web has no LaTeX
  equivalent; the chevron redraw is the programme-wide fidelity lever.
- **Component geometry** (`density.*`, `iconSize.*`, tab/pagination/tag/
  badge/alert paddings and sizes): no geometry is published outside TeX
  lengths; `density` and `iconSize` reuse the Sentropic base values
  explicitly, the rest is coherent screen geometry.
- **Motion, shadow, elevation** (`motion.* = 0ms/linear`,
  `shadow.* = none`): print has neither; instantaneous and flat.
- **Stacking** (`z.*`): no stacking contexts in print; base values kept.
- **`blue.*`/`cyan.*`/`redDark`/tints** (`blue.10` `#fde8e8`,
  `blue.80` `#800000`, `cyan.10` `#e0fbfb`, `cyan.70` `#006b75`): LaTeX
  publishes no blue and no tints; the families are centred on the measured
  hyperref hues.
- **`disabledOpacity`, `transition`, `cursor`**: no upstream source; base
  values kept (transition duration `0ms`, easing `linear`, for the
  motionless print idiom).

## Typography

- **Body / fields / labels / titles** (`font.sans`, `font.display`,
  `typography.field`, `typography.label`): **'Latin Modern Roman'** — the
  `lm` package on CTAN (lmroman; GUST metrics). Body and titles are both
  serif, titles bold (`\bfseries` in `\@startsection`). We reference the font
  *name* only.
- **Controls** (`typography.control`): **'Latin Modern Sans'** — the `lm`
  package on CTAN (lmss); `\sffamily` is the distinct interactive voice of
  the base classes. We reference the font *name* only.
- **Monospace** (`font.mono`): **'Latin Modern Mono'** — the `lm` package on
  CTAN (lmtt). We reference the font *name* only.
- Sizes: normalsize 10pt TeX → `0.83rem`; leading 12/10 → `1.2`
  (classes.dtx `\@setfontsize\normalsize\@xpt\@xiipt`).
- First-paragraph indentation (`\parindent` 15pt) is the signature
  paragraph mark; it has no screen-token transcription and stays documented
  here.
- Links: readable hyperref red (`#e60000`), **not underlined** — hyperref
  `colorlinks` colours link text without underlining it (default boxed links
  are uncoloured); no hover decoration exists in print.

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — the \fbox frame (four equal 0.4pt
  rules), paper fill, ink hairline; never a filled-underline.
- **Radius**: `0` everywhere (`radius.none/sm/md/lg/pill`, tag/badge
  `radius`): sharp rectangular boxes, no rounding primitive in the classes.
- **Focus**: plain `outline` technique (`2px`/`2px`) in hyperref red
  `#FF0000`; technique derived, colour measured.
- **Buttons**: primary = solid readable red with white text; secondary =
  framed ink box (transparent fill, ink border — the \fbox idiom).
- **Tabs**: black bold serif active label with a bottom ink rule
  (`indicatorSide: "bottom"`, `indicatorMode: "border"` — the \hrule idiom).
- **Pagination**: plain ink folios; current page = solid ink with white text.
- **Density**: Sentropic base geometry reused explicitly — no control
  geometry is published outside TeX lengths.

## Asset officiel

- LaTeX has no logo artwork in this package: its visual identity IS the
  typesetting (Computer Modern / Latin Modern letterforms, white page,
  black ink, hairline rules). Use the official LaTeX lion artwork from the
  LaTeX Project only where brand usage applies — **do not redraw it**.
  This package references only font *names*, measured lengths and public
  colour values, never logo artwork, class files or font binaries.
