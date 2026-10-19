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
  `~/Images/Captures d'écran/Capture d'écran du 2026-10-12 17-*.png` and
  `/home/antoinefa/src/influence/otter-images/*.png`.

## Colour mapping

| Sentropic role | Influnified token | Value |
|---|---|---|
| `action.primary` / `border.interactive` | `--pink` | `#e4575e` |
| `action.primaryHover` / `text.link` | `--pink-dark` | `#c9444b` |
| `focus.color` | `--pink-tint` | `#fbe5e7` |
| `surface.subtle` | `--tint` | `#fdf6f6` |
| `surface.inverse` / `text.primary` | `--ink` | `#070541` |
| `text.secondary` | `--body` | `#4a4869` |
| `text.muted` | `--muted` | `#6e6c8a` |
| `surface.default` | `--page` | `#fffaf5` |
| `surface.raised` | `--surface` | `#ffffff` |
| `border.subtle` | `--border` | `#ece8f0` |
| `border.strong` | `--border-strong` | `#ddd7e6` |
| `action.danger` / `feedback.error` | error literal | `#c0392b` |
| accent tint (Sentropic `cyan.10`) | `--gradient-panel` stop | `#e7e5ff` |

## Sampled app tones (screenshots — all `à confirmer`)

Each value is the median of a pixel box sampled with a Node/pngjs script
(`/tmp/sample-influnified.cjs`, kept outside the repo). Coordinates are
`(x, y)` pixels in the stated file (image sizes: otter `1280x920`,
`17-14-37` `1801x824`, `17-34-30` `1624x736`).

| Tone | File | Coords | Value |
|---|---|---|---|
| Draft badge bg | otter `1791840827_…snapshot.png` | (966, 396) | `#f2f3f3` |
| Business Approval badge bg | otter `1791840827_…snapshot.png` | (975, 433) | `#fcfcc4` |
| Application Closed badge bg | otter `1791840827_…snapshot.png` | (996, 475) | `#fcecd5` |
| Active badge bg | otter `1791840827_…snapshot.png` | (970, 511) | `#dffeeb` |
| Completed badge bg | otter `1791840827_…snapshot.png` | (956, 629) | `#dceafc` |
| Posted badge bg | otter `1791840502_…snapshot.png` (Collab Dashboard) | (1011, 543) | `#eee5fd` |
| Active nav pill bg | otter `1791840827_…snapshot.png` | (100, 308) | `#d94762` |
| Impersonation banner | `…17-34-30.png` | (813, 20) | `#fe9900` |
| Dark "All" chip | `…17-14-37.png` | (240, 168) | `#0e0d44` (≈ `--ink`) |

Cross-checks: Draft chip `#f2f3f4` in `17-14-37` @ (513, 56); Attended green
`#cdfeee` in collab @ (1025, 617); Completed chip `#dae9fd` in `17-34-30` @
(819, 82). Video-call compression shifts hues slightly (e.g. nav pill
`#d94762` vs site pink `#e4575e`); the measured site tokens stay canonical.

## À confirmer (derived or no published brand token)

- All nine sampled app tones above (screenshot compression, no app CSS).
- `cyan.50` `#8f84d8` / `cyan.70` `#55518f` — derived mid/dark lavenders.
- `feedback.success` `#177245`, `feedback.warning` `#a85a00`,
  `feedback.info` `#2f5da8`, `status.pending` `#7d6600` — sampled badge tints
  darkened to keep WCAG AA on white (verified 5.95 / 5.09 / 6.46 / 5.57).
- The 8-colour categorical `data.*` palette — a coherent proposal from brand
  + sampled app hues, not an official scale.
- `font.mono`, `motion.*`, `z.*`, `transition`, `cursor`, `iconSize`,
  `disabledOpacity` — not tokenised publicly; Sentropic base values kept.
- Link underline treatment, `<select>` chevron colour, secondary button,
  tabs metrics, pagination / breadcrumb / alert / accordion / tag / badge /
  choice / search / toggle treatments — app patterns observed but no CSS read.
- `shadow.floating` reuses `--shadow-lift` (no third elevation measured).
- Sidebar panel gradient: the token model has **no slot for a panel/sidebar
  gradient**, so `--gradient-panel` (`#ffe3e3 → #e7e5ff`) is recorded here and
  not encoded in the theme.
- No dark mode: `mode: "light"` only (no dark theme observed anywhere).

## Typography

- **Headings / controls** (`font.display`, `typography.control`):
  `'Montserrat', sans-serif`, 700 (measured `.btn` + `--font-heading`).
- **Body / fields / labels** (`font.sans`, `typography.field`,
  `typography.label`): `'Poppins', sans-serif` (measured `--font-body`;
  `.field input` inherits, 15px/400; `.field label` 14px/600).
- **Monospace** (`font.mono`): system stack (à confirmer — no mono face seen).

## Signatures anatomiques

- **Fields**: `field.style = "outline"` — boxed inputs (white fill, 1px
  `--border-strong` stroke, measured 12px radius), not a filled-underline.
- **Radius**: pill CTAs/nav/chips (`999px`, measured `.btn`); inputs `0.75rem`
  (12px measured); cards `md = 1.25rem` (`--radius`), `lg = 1.75rem`
  (`--radius-lg`).
- **Focus**: thick pink-tint outline (`3px`, `--pink-tint`) + pink border
  (measured `.field input:focus`; no offset declared).
- **Buttons**: primary = solid pink, hover pink-dark, pink-tinted shadow
  (`0 8px 24px rgba(228,87,94,.28)`); secondary = white/pink-outline
  (à confirmer).
- **Tabs**: segmented pill control (white active segment on pink-tint track)
  + underline sub-tabs (bottom pink filet) — metrics à confirmer.
- **Badges/chips**: fully rounded pills; status tones sampled (table above).
- **Density**: measured button paddings (md `.85rem/1.75rem` @ `.95rem`).
- **Sidebar**: pink→lavender gradient panel with filled pink active pill
  (gradient recorded here; no token slot).

## Asset officiel

- Influnified wordmark / header logo (app sidebar, marketing site header).
  Use the official SVG/PNG from the brand assets — **do not redraw the logo
  by hand**. This package references only font *names* and public colour
  values, never logo artwork or font binaries.
