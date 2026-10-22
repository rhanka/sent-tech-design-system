# Influnified → Sentropic mapping

This package maps the **public** Influnified marketing site (`https://influnified.com/`,
custom properties `--pink`, `--ink`, …) onto the Sentropic token structure
(`TenantTheme`). Only public CSS values and font *names* are referenced — no
font binaries. App-only colours were sampled from screenshots with a Node
script (no Python) and are flagged `à confirmer`.

No dark theme was observed (site or app): this theme ships `mode: "light"`
only, as theme-canada/quebec do for themes without a measured dark mode.

## Sources

- Public marketing site CSS (custom properties) — saved HTML
  `/home/antoinefa/src/influence/dossier/work/ref/influnified-home.html`
  (GET https://influnified.com/, 2026-10-19). Every property below was re-read
  from that file:
  `--pink: #e4575e`, `--pink-dark: #c9444b`, `--pink-tint: #fbe5e7`,
  `--tint: #fdf6f6`, `--ink: #070541`, `--body: #4a4869`, `--muted: #6e6c8a`,
  `--page: #fffaf5`, `--surface: #ffffff`, `--border: #ece8f0`,
  `--border-strong: #ddd7e6`,
  `--gradient-panel: linear-gradient(120deg, #ffe3e3 0%, #e7e5ff 100%)`,
  `--radius: 1.25rem`, `--radius-lg: 1.75rem`,
  `--shadow-soft: 0 10px 40px rgba(7, 5, 65, 0.06)`,
  `--shadow-lift: 0 16px 44px rgba(7, 5, 65, 0.1)`,
  `--font-heading: "Montserrat", "Segoe UI", system-ui, sans-serif`,
  `--font-body: "Poppins", "Segoe UI", system-ui, sans-serif`.
- Measured rules in the same file: `.btn` (pill, pink bg, white text, hover
  pink-dark, `0 8px 24px rgba(228, 87, 94, .28)` shadow, Montserrat 700);
  `.field input` (white fill, `1px solid var(--border-strong)`, 12px radius,
  ink text, `14px/600` label); `.field input:focus`
  (`outline: 3px solid var(--pink-tint); border-color: var(--pink)` — no
  outline-offset declared); error literal `#c0392b`.
- App screenshots (light theme, app behind login so no app CSS was read):
  `~/Images/Captures d’écran/` (typographic apostrophe U+2019, not ASCII) and
  `/home/antoinefa/src/influence/otter-images/`. Full filenames per tone are
  in the table below.
- Sampling method (Node + pngjs, no Python): `/tmp/sample-influnified.cjs`
  (kept outside the repo):
  `node sample-influnified.cjs <png> <fx> <fy> [radiusPx]`. For each point it
  samples a (2r+1)² box (default radius 12 → 25×25 px) around the fractional
  coordinate, quantizes to 4 bits/channel (multiples of 16), keeps the top 6
  quantized clusters by pixel count, and reports per cluster the count, the
  quantized key, the median exact hex (up to 400 pixels) and a representative
  coordinate. Table coordinates are pixels; the script takes fractions, so
  divide by the image size (`fx = x/W`, `fy = y/H`, default radius 12). Each
  tone below is the median of the badge-fill cluster, cross-checked against
  the exact center pixel (reproduced 2026-10-21:
  Active `#dffeeb` n=86, Draft `#f2f3f3` n=109 in
  `1791840827_CANNOTDETECTSHARE_snapshot.png`).
- Reproduction record (pass-2 review, re-run 2026-10-22 with exact `x/W`,
  `y/H` fractions, radius 12 — output medians match the table values above):
  Closed `(996, 475)` centre exact `#faebd4`, badge cluster `n=106
  quant=(256,240,208)` median `#fdecd5` rep `(985,477)`;
  Completed `(956, 629)` centre exact `#d9eafd`, badge cluster `n=141
  quant=(224,240,256)` median `#dce9fc` rep `(963,629)`;
  nav pill `(100, 308)` centre exact `#d84760`, pill cluster `n=327
  quant=(224,64,96)` median `#d84761` rep `(108,307)`;
  All chip `(240, 168)` in `Capture d’écran du 2026-10-12 17-14-37.png`
  (`1801x824`) centre exact `#0f0c47`, chip cluster `n=321
  quant=(16,16,64)` median `#0e0d42` rep `(245,168)`.
  The other five rows reproduce exactly as recorded (Draft `n=109`,
  Business Approval `#fcfcc4 n=146`, Active `#dffeeb n=86`,
  Posted `#eee5fd n=140`, banner `#fe9900 n=625`).

## Colour mapping

| Sentropic role | Influnified token | Value |
|---|---|---|
| `action.primary` (text-bearing fills) | `--pink-dark` (departure: `--pink` + white is 3.61:1; `--pink-dark` + white is 4.76:1) | `#c9444b` |
| `action.primaryHover` | derived accessible rose (white on it is 6.26:1) — à confirmer | `#a83a44` |
| `text.link` / `action.secondaryText` / link hover | derived accessible rose (5.87–6.26:1 on white/page/subtle; 5.21:1 on the secondary hover tint) — à confirmer | `#a83a44` |
| `border.interactive` / indicators | `--pink` (non-text: 3.61:1 on white, kept measured) | `#e4575e` |
| `focus.color` | `--ink` (departure: `--pink-tint` is 1.13–3.0:1; `--ink` is 3.03–18.97:1) | `#070541` |
| `surface.subtle` | `--tint` | `#fdf6f6` |
| `surface.inverse` / `text.primary` | `--ink` | `#070541` |
| `text.secondary` | `--body` | `#4a4869` |
| `text.muted` | `--muted` | `#6e6c8a` |
| `surface.default` | `--page` | `#fffaf5` |
| `surface.raised` | `--surface` | `#ffffff` |
| `border.subtle` | `--border` | `#ece8f0` |
| `border.strong` (incl. field stroke) | `--border-strong` | `#ddd7e6` |
| `action.danger` | error literal (white on it is 5.44:1) | `#c0392b` |
| `feedback.error` (badge/text tone) | error literal darkened for the 14% badge mix (5.29:1 on the mix) — à confirmer | `#a93226` |
| `feedback.warning` | sampled orange darkened for the 14% badge mix (4.80:1 on the mix) — à confirmer | `#9a5200` |
| badge info fill / pagination active fill | `--pink-dark` (white on it is 4.76:1) | `#c9444b` |
| accent tint (Sentropic `cyan.10`) | `--gradient-panel` stop | `#e7e5ff` |

## Sampled app tones (screenshots — all `à confirmer`)

Each value is the median of a pixel box sampled with the script described
above (default radius 12 → 25×25 px; 4 bits/channel quantization; top-6
clusters by count). Coordinates are `(x, y)` pixels in the stated file
(image sizes: otter files `1280x920`,
`Capture d’écran du 2026-10-12 17-14-37.png` `1801x824`,
`Capture d’écran du 2026-10-12 17-34-30.png` `1624x736`).

| Tone | File | Coords | Value |
|---|---|---|---|
| Draft badge bg | `1791840827_CANNOTDETECTSHARE_snapshot.png` | (966, 396) | `#f2f3f3` |
| Business Approval badge bg | `1791840827_CANNOTDETECTSHARE_snapshot.png` | (975, 433) | `#fcfcc4` |
| Application Closed badge bg | `1791840827_CANNOTDETECTSHARE_snapshot.png` | (996, 475) | `#fdecd5` |
| Active badge bg | `1791840827_CANNOTDETECTSHARE_snapshot.png` | (970, 511) | `#dffeeb` |
| Completed badge bg | `1791840827_CANNOTDETECTSHARE_snapshot.png` | (956, 629) | `#dce9fc` |
| Posted badge bg | `1791840502_CANNOTDETECTSHARE_snapshot.png` (Collab Dashboard) | (1011, 543) | `#eee5fd` |
| Active nav pill bg | `1791840827_CANNOTDETECTSHARE_snapshot.png` | (100, 308) | `#d84761` |
| Impersonation banner | `Capture d’écran du 2026-10-12 17-34-30.png` | (813, 20) | `#fe9900` |
| Dark "All" chip | `Capture d’écran du 2026-10-12 17-14-37.png` | (240, 168) | `#0e0d42` (≈ `--ink`) |

Cross-checks: Draft chip `#f2f3f4` in
`Capture d’écran du 2026-10-12 17-14-37.png` @ (513, 56); Attended green
`#cdfeee` in `1791840502_CANNOTDETECTSHARE_snapshot.png` @ (1025, 617);
Completed chip `#dae9fd` in `Capture d’écran du 2026-10-12 17-34-30.png` @
(819, 82). Video-call compression shifts hues slightly (e.g. nav pill
`#d84761` vs site pink `#e4575e`); the measured site tokens stay canonical.

## À confirmer (derived or no published brand token)

- All nine sampled app tones above (screenshot compression, no app CSS).
- `cyan.50` `#8f84d8` / `cyan.70` `#55518f` — derived mid/dark lavenders.
- `feedback.success` `#177245` (5.95 on white, 4.86 on its badge mix),
  `feedback.warning` `#9a5200` (5.86 on white, 4.80 on its badge mix),
  `feedback.error` `#a93226` (6.62 on white, 5.29 on its badge mix),
  `feedback.info` `#2f5da8` (6.46 on white, 5.25 on its mix),
  `status.pending` `#7d6600` (7.37 on white) — sampled badge tints darkened
  so the rendered pairs reach WCAG AA (sol review).
- `action.primaryHover` / `text.link` / `action.secondaryText` `#a83a44` —
  `--pink-dark` darkened for AA on white/page/subtle/tint (sol review).
- The 8-colour categorical `data.*` palette — a coherent proposal from brand
  + sampled app hues, not an official scale.
- `font.mono`, `motion.*`, `z.*`, `transition`, `cursor`, `iconSize`,
  `disabledOpacity` (`0.55`) — not tokenised publicly; Sentropic base values kept.
- Link underline treatment, `<select>` chevron colour, secondary button,
  tabs metrics, pagination / breadcrumb / alert / accordion / tag / badge /
  choice / search / toggle treatments — app patterns observed but no CSS read.
- `shadow.floating` reuses `--shadow-lift` (no third elevation measured).
- Sidebar panel gradient: the token model has **no slot for a panel/sidebar
  gradient**, so `--gradient-panel` (`#ffe3e3 → #e7e5ff`) is recorded here and
  not encoded in the theme.
- No dark mode: `mode: "light"` only (no dark theme observed anywhere).

### Derived-value ledger (sol review — every value sourced or flagged)

- `density.sm/md/lg paddingBlock/paddingInline`: md `0.75rem/1rem` (12/16px
  measured `.field input`); `sm.paddingInline` is `1rem` (the measured 16px —
  Input/Select/Textarea read the sm inline leaf, Button reads `buttonDensity`
  so its `1.3rem` is untouched — pass-2 review). Other sm/lg leaves are
  unmeasured for fields, kept from the button metrics — à confirmer.
  `buttonDensity.sm/md/lg` carries the measured `.btn`
  paddings (sm `.65rem/1.3rem @ .9rem`, md `.85rem/1.75rem @ .95rem`,
  full-width `.95rem/1.5rem @ 1rem`).
- `density.* controlHeight/minWidth/gap` (`2.25/2.75/3.25rem`,
  `2.25/2.75/3.25rem`, `0.5rem`) and `fontSize` (`0.9/0.95/1rem`) — derived
  from the measured `.btn` metrics, unmeasured for fields — à confirmer.
- `spacing.*` (`0/0.25/0.5/0.75/1/1.5/2/3/4rem`) — standard rem scale kept
  aligned with the Sentropic base for component-grid fidelity, not
  brand-measured — à confirmer.
- Typography line-heights: `control`/`field`/`label` `1.5` (unitless, matches
  the Poppins body rhythm; not tokenised publicly — à confirmer); link
  `inherit` (no measurement — à confirmer); card/choice/search/toggle
  `1.5rem`/explicit values follow the measured 24px app rhythm where stated
  in `index.ts`, otherwise the base render — à confirmer per leaf comment.
- `surface.overlay` `rgb(7 5 65 / 0.6)` — ink-tinted modal backdrop, opacity
  `0.6` not measured publicly — à confirmer.
- `tabs`/`pagination`/`breadcrumb`/`alert`/`accordion`/`tag`/`badge`/
  `choice`/`search`/`toggle` metrics — per-leaf sources or à confirmer flags
  inline in `index.ts` (only field 12px corners/stroke/padding are measured).

## Typography

- **Headings / controls** (`font.display`, `typography.control`):
  `'Montserrat', sans-serif`, 700 (measured `.btn` + `--font-heading`).
- **Body / fields / labels** (`font.sans`, `typography.field`,
  `typography.label`): `'Poppins', sans-serif` (measured `--font-body`;
  `.field input` inherits, 15px/400; `.field label` 14px/600).
- **Monospace** (`font.mono`): system stack (à confirmer — no mono face seen).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px
  `--border-strong` stroke re-mapped after the build, `radiusTop`/
  `radiusBottom = 0.75rem` for the measured 12px), not a filled-underline.
- **Radius**: pill CTAs/nav/chips (`999px`, measured `.btn`); inputs `0.75rem`
  (12px measured); cards `md = 1.25rem` (`--radius`), `lg = 1.75rem`
  (`--radius-lg`).
- **Focus**: thick `--ink` outline (`3px`, no offset — width/offset measured,
  colour departs from `--pink-tint` for 3:1 contrast) + measured pink border.
- **Buttons**: primary = solid `--pink-dark` fill (white text 4.76:1; `--pink`
  + white is 3.61:1), hover accessible rose `#a83a44`, pink-tinted shadow
  (`0 8px 24px rgba(228,87,94,.28)`); secondary = white/pink-outline
  (à confirmer), secondary text `#a83a44` (5.21:1 on the hover tint).
- **Tabs**: segmented pill control (white active segment on pink-tint track)
  + underline sub-tabs (bottom pink filet) — metrics à confirmer.
- **Badges/chips**: fully rounded pills; status tones sampled (table above).
- **Density**: field scale carries the measured `.field input` 12/16px
  padding (block at md, inline at sm — the leaves the components consume);
  `buttonDensity` carries the measured `.btn` paddings
  (md `.85rem/1.75rem` @ `.95rem`, sm `1.3rem` inline) so button geometry
  never leaks into fields — see the derived-value ledger for unmeasured leaves.
- **Sidebar**: pink→lavender gradient panel with filled pink active pill
  (gradient recorded here; no token slot).

## Asset officiel

- Influnified wordmark / header logo (app sidebar, marketing site header).
  Use the official SVG/PNG from the brand assets — **do not redraw the logo
  by hand**. This package references only font *names* and public colour
  values, never logo artwork or font binaries.
