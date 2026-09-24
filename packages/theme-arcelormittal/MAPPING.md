# ArcelorMittal → Sentropic mapping

This package maps the **public** ArcelorMittal corporate site design onto the
Sentropic token structure (`TenantTheme`). ArcelorMittal publishes no
tokenised public design system; the brand values are read from the custom
declarations and rule values of its official corporate stylesheet.
Method = **measured-clone**: the brand orange (`#ff3700`, 101 declarations in
`main.css` — buttons, nav anchors, logo fill, bullets, text selection) is
measured from the brand's own CSS, and we reference the brand font *names*
(Gilroy Standard / Gilroy Standard-SemiBold) only — no font binaries.
Derived/unmeasured values are flagged `à confirmer`.

> Key measured fact: the brand's orange fills (`#ff3700` with white text,
> the site's own solid-button pairing) reach only 3.62:1, so the orange stays
> in fill / line roles while legible orange text roles use the measured
> pressed orange `#d92f00` (4.82:1, AA). White text on the brand orange is the
> brand's own choice, kept as-is.

## Sources

- ArcelorMittal corporate site (live, blocked 2026-09-24 by a Cloudflare
  challenge — `unverified, 2026-09-24, HTTP challenge`) — https://corporate.arcelormittal.com/
- ArcelorMittal global site (live, blocked 2026-09-24 by a Cloudflare
  challenge — `unverified, 2026-09-24, HTTP challenge`) — https://www.arcelormittal.com/
- Archived copy of the corporate homepage + its stylesheet (capture
  2025-01-01, the measured origin of every value below) —
  https://web.archive.org/web/20250101021034/https://corporate.arcelormittal.com/
  and
  https://web.archive.org/web/20250101021034cs_/https://corporate.arcelormittal.com/assets/css/main.css?638684864414173555
- Brand colour aggregator (cross-check only, never an origin — the aggregator
  lists `#F47D30`, the measured stylesheet declares `#ff3700`) —
  https://www.brandcolorcode.com/arcelormittal

Per-file declaration counts below are counted over the single official
stylesheet linked from the homepage (`main.css`, 286746 bytes): one
occurrence is one declaration of that hex (a `--*` custom-property
declaration or a property value containing the hex, case normalised). The
stylesheet publishes no `--*` design-token custom properties; brand values
are read from rule values.

Excluded third-party bundles inside `main.css` (not brand, never an origin):
VideoJS player chrome (`#73859f`, `#2b333f`), vue-multiselect defaults
(`#35495e`, `#e8e8e8`, `#ededed`), Swiper pagination hues (`#28a745`,
`#ffc107`, `#dc3545`, `#17a2b8`), Bootstrap table remnants (`#dee2e6`,
`#343a40`, `#6c757d`, `#495057`, `#e9ecef`).

## Colour mapping

| Sentropic role | ArcelorMittal source | Value |
|---|---|---|
| `action.primary` / `border.interactive` / `focus.color` | brand orange `#ff3700` (101 declarations: solid buttons with white text, `.primary-link--dark` border, `.logo__logo` fill, nav-back / card / active mega-panel anchors, list bullets, `::selection` tint) | `#ff3700` |
| `action.primaryHover` / `text.link` / `tabs.activeText` / `breadcrumb.linkText` | pressed orange `#d92f00` (`.primary-link--dark:active`, `.olympics__language-modal-button:active`; 4.82:1 on white, AA) | `#d92f00` |
| `buttonSecondary.hoverBackground` / light orange tint | derived light orange | `#ffede6` *(à confirmer)* |
| cyan accent | gradient light orange `#fe6b45` (`linear-gradient(90deg,#840d81,#fe6b45)` underline gradient) | `#fe6b45` |
| data accent | gradient purple `#840d81` (same gradient start) | `#840d81` |
| `feedback.info` / `status.processing` | section blue `#0070c0` (`.page-header`, `.featured-insights`, `.banner__call-to-action` backgrounds; pull-quote `border-left:4px solid #0070c0`) | `#0070c0` |
| `text.primary` / `action.secondaryText` | body text `#2a2a2a` (`color:#2a2a2a`, 25 declarations) | `#2a2a2a` |
| `text.secondary` | logo wordmark grey `#4c4c4c` (`.logo--color .logo__text` fill, tag text; 8.59:1 on white) | `#4c4c4c` |
| `text.muted` | derived from `#979797` via the section 9 stop rule (first hex reaching 4.5:1) | `#646464` *(à confirmer)* |
| `border.subtle` / card border | card grey `#979797` (`.key-figure{border:1px solid #979797}`, calendar cards; 16 declarations) | `#979797` |
| `border.strong` | dark navy list rule `#001626` (press-release list borders; 6 declarations) | `#001626` |
| `surface.subtle` / `action.secondary` / `tag.neutralBackground` | disabled-input fill `#e6eaef` (`.calculator-tool__right .form-group input:disabled{background-color:#e6eaef}`; 4 declarations) | `#e6eaef` |
| `action.secondaryHover` | derived darker fill | `#d7dde4` *(à confirmer)* |
| `surface.default` / `surface.raised` / `field.fillBg` | white `#fff` (159 declarations) | `#ffffff` |
| `surface.inverse` / darkest | header near-black `#151515` (site-header / nav text; 15 declarations) | `#151515` |
| `field.underlineColor` | form bottom stroke `#000` (`.multiselect{border-bottom:2px solid #000}` overrides, calculator `border:1px solid #000`) | `#000000` |
| `action.primaryText` / `pagination.activeText` / `badge.infoText` | white on the brand orange (the brand's own solid-button pairing in `main.css`; 3.62:1, kept as brand fill) | `#ffffff` |
| `feedback.success` / `status.completed` | derived success green | `#2f9e44` *(à confirmer)* |
| `feedback.warning` / `status.pending` | derived warning amber | `#e8890c` *(à confirmer)* |
| `feedback.error` / `action.danger` / `status.failed` | derived error red | `#d13438` *(à confirmer)* |
| `data.category1..8` | coherent proposal from the measured hues (orange, section blue, gradient purple, pressed orange, light orange, dialog slate-blue `#5c7f92`, near-black, wordmark grey) | `#ff3700`, `#0070c0`, `#840d81`, `#d92f00`, `#fe6b45`, `#5c7f92`, `#2a2a2a`, `#4c4c4c` *(à confirmer)* |

## À confirmer (derived or no published brand token)

- **Light orange tint** (`#ffede6`) — no light orange tint is published; a coherent low-emphasis surface derived from the brand orange.
- **`secondaryHover` fill** (`#d7dde4`) — no hover fill is published; a slightly darker stand-in for the measured `#e6eaef` secondary surface.
- **Muted grey** (`#646464`) — `#979797` (card borders) fails AA as text (2.92:1); derived from it via the deterministic stop rule (first hex reaching 4.5:1 on white: 4.73:1).
- **Feedback hues** (`success #2f9e44`, `warning #e8890c`, `error #d13438`) — no status hues are published as brand rules; the Swiper/Bootstrap remnants in the bundle are third-party and excluded. Only `info #0070c0` is measured.
- **Categorical `data.*` palette** — a coherent proposal from the measured brand hues, not an official sequential scale.
- **Focus technique** (`outline`, 2px, 2px offset, `#ff3700`) — `main.css` publishes only `outline:none` resets; the colour clears the 3:1 line threshold (3.62:1).
- **`field.style = "filled-underline"` reading** — the site-wide signature is the bottom stroke (header search `border-bottom`, module `multiselect` 2px black overrides), but the calculator widget uses boxed `border:1px solid #000` inputs; the bottom-stroke pattern is taken as the signature and the boxed counter-evidence is recorded here.
- **Sharp `radius.sm/md = 0`** — measured on the brand calculator inputs (`border-radius:0`); `radius.lg` (cards), `shadow.*`, `motion.*`, `disabledOpacity`, and the `density.*` geometry are not published site-wide (the calculator's ~60px inputs are widget-specific), so the Sentropic base values are reused explicitly.
- **Font fallback stack** — Gilroy Standard / Gilroy Standard-SemiBold are the measured brand names; the exact fallback list here is a faithful expression.
- **Component geometry** (`tabs`/`pagination`/`breadcrumb`/`alert`/`accordion`/`tag`/`badge`/`choice`/`search`/`toggle` metrics) — brand-flavoured metrics; only the cited colours, the 4px left rule, the 14px tag text and the uppercase buttons are measured.

## Typography

- **Body / fields** (`font.sans`, `typography.field`): **'Gilroy Standard'** — `font-family:Gilroy Standard,…` (37+ declarations in `main.css`). We reference the font *name* only.
- **Display / controls / labels** (`font.display`, `typography.control/label`): **'Gilroy Standard-SemiBold'** — headings and interactive anchors (`font-family:Gilroy Standard-SemiBold,…`, 14 declarations). We reference the font *name* only.
- **Monospace** (`font.mono`): system stack.
- Links: pressed orange `#d92f00`, underlined at rest (the brand `a` draws a 2px gradient underline, `padding-bottom:2px`) and underlined on hover. Buttons render uppercase (brand solid buttons carry `text-transform:uppercase`).

## Signatures anatomiques

- **Fields**: `field.style = "filled-underline"` — white `#ffffff` fill with a measured 2px black `border-bottom` stroke (`underlineMode: "border"`). Native `<select>` chevron redrawn in the brand orange `#ff3700`.
- **Radius**: sharp brand — 0 on controls/inputs/tabs (`radius.sm/md = 0`, measured `border-radius:0`); 8px on cards (`radius.lg = 0.5rem`, derived); pills stay `999px`.
- **Focus**: high-contrast **outline** in the brand orange `#ff3700` (`focus.strategy = "outline"`, 2px width, 2px offset; technique derived).
- **Buttons**: primary = solid brand orange `#ff3700` with **white text** (brand pairing, uppercase) → hover pressed orange `#d92f00`; secondary = **outlined** in the brand orange (transparent fill, `#ff3700` border, `#2a2a2a` text per `.primary-link--dark`, light-orange `#ffede6` hover fill).
- **Tabs / top-nav**: active tab = legible pressed-orange label `#d92f00` with a bottom orange underline (`indicatorSide: "bottom"`, `indicatorMode: "border"`).
- **Pagination**: pressed-orange text links; active page = filled brand orange `#ff3700` with white text.

## Asset officiel

- ArcelorMittal logo: the orange flame/spark symbol (`fill:#ff3700`) + grey wordmark (`fill:#4c4c4c`). Use the official SVG/PNG from the brand assets — **do not redraw the logo by hand**. This package only references the font *names* (Gilroy Standard, Gilroy Standard-SemiBold) and public colour values, never logo artwork or font binaries.
