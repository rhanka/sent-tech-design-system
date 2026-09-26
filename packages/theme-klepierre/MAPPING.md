# Klépierre → Sentropic mapping

This package maps the **public** Klépierre corporate site onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: the `:root`
`--color-*` / `--font-calibre` token block and the brand rules of
`app.b220931f.css` (fetched 2026-09-25), read at the brand's own **10px root**
(`html{font-size:10px}`), converted to the theme's 16px root. Only public
values and font *names* are referenced — no font binaries. Derived/unmeasured
values are flagged `à confirmer`.

> Key measured fact: Klépierre is a dark-context brand for its accents —
> silver `#a99d90` (2.65:1), gold `#bd9360` (2.80:1) and pink `#ef7e81`
> (2.63:1) are painted as text on dark grounds (6.1–6.2:1 on `#141b4d`) and
> all fail on white. This light theme therefore routes running text to the
> two painted dark inks (`#111111` body, `#141b4d` titles/buttons) and derives
> `text.muted` from silver by the stop rule (3.10:1, documented arbitration).
> The six `--color-*` tokens at zero consumption are kept for provenance with
> no role (see table).

## Sources

- Klépierre homepage (measured) — `https://www.klepierre.com/` (576 015 bytes) — links the three stylesheets below; French/English alternates.
- Brand + vendor stylesheet (measured) — `https://www.klepierre.com/themes/KlepierreTheme/static/css/app.b220931f.css` (649 081 bytes, 5 884 expanded lines) — the `:root` token block, all brand rules, the embedded Plyr base run and the tarteaucitron consent tail.
- Vendor reset (excluded as origin) — `https://www.klepierre.com/themes/KlepierreTheme/static/css/chunk-vendors.eedfdc0d.css` (1 190 bytes) — a sanitize-style reset on bare selectors; vendor throughout.
- Font faces (measured) — `https://www.klepierre.com/font-faces.css` — five `@font-face` blocks declaring family `"b8ffa454"` (weights 300/500/600/bold/normal), the Calibre webfont's hashed family name.

## Upstream access

`www.klepierre.com` answers `200` to all three probe forms. Bare `curl`:
`000, 000, 200` then `200, 200, 200` (the two `000` were transient first
contacts, exit before headers; stable `200` / 576 015 bytes after).
UA-only: `200` ×3. Full browser header set (UA + Accept + Accept-Language +
`Referer` + Sec-Fetch-* + compressed): `200` ×3. Stylesheets were fetched
with the full set. Single CSS host: `a.`/`p.klepierre.com` appear only as
`dns-prefetch` hints plus one analytics script (`p…/js/script.js`) — no
second stylesheet host, so no cross-host disagreement to record.

## Measurement conventions

- **Region.** Every count is on the brand region = `app.b220931f.css` minus
  (a) the bare-Plyr vendor run (expanded lines 4345–4575: selectors starting
  with `.plyr`/`a.plyr` after `@media`-prefix strip, 209 lines), (b) the
  tarteaucitron consent tail (expanded lines 5761–5883, 123 lines incl.
  `.cookie-list`), (c) the whole `chunk-vendors.*.css` reset. Brand-scoped
  overrides of vendor classes (37 Plyr lines under `.media-video-wrapper`,
  `.page-header`, …; all Swiper hooks, e.g. `.swiper-slide-visible
  .keydateblock-…`) are brand rules and stay. Reproduce: fetch the CSS,
  expand with `sed 's/}/}\n/g'`, drop the two spans above by selector.
- **Form.** Counts match exact hex strings, case-normalised (the sheet writes
  lowercase only — second spelling `#[0-9A-F]*[A-F]…` returns 0). Short and
  long forms are distinct strings; transcription expands short→long
  (`#111`→`#111111`, `#fff`→`#ffffff`, `#ddd`→`#dddddd`, `#eee`→`#eeeeee`,
  `#000`→`#000000`). No 8-digit hex exists. `rgb()`/`rgba()`/`hsl()` alpha
  spellings (incl. the `0.2` vs `.2` decimal variants and the literal
  fallbacks the sheet pairs with each `var()`) are recorded per token, never
  merged into hex counts.
- **Two numbers per promoted hex.** `var()` refs = matches of
  `var(--token[,)]`; literals = hex-string matches (whole brand region, incl.
  the `:root` declaration). The defect is zero of both outside the token's
  own declaration. Stylesheet census: naive `rel="stylesheet"` finds 1 of 3
  (the other two links are unquoted `rel=stylesheet`); tolerant
  `rel=["']?stylesheet` finds 3 — the count used.
- **Lengths.** Brand root `html{font-size:10px}` (10px, not 16): every
  transcribed length is converted (`1.4rem` → 14px → `0.875rem` at the
  16px theme root). Ratios computed with the §9 one-line command, calibrated
  on its known-good case (`#1e7e34` on white → `5.14`, reproduced exactly).

## Colour mapping

| Sentropic role | Klépierre source | Value |
|---|---|---|
| `action.primary` / `surface.inverse` / `border.interactive` / `text.secondary` / `text.link` / `focus.color` / `blue.80` | `--color-main-blue` (165 var / 171 lit) | `#141b4d` |
| `action.primaryHover` / `blue.60` | `.btn-main-blue-bg:focus,.btn-main-blue-bg:hover{background-color:#192261}` (0 var / 1 lit) | `#192261` |
| `action.primaryText` / `text.inverse` / `surface.default` / `surface.raised` / `slate.0` | `--color-white` (120 var / 235 lit); page ground `.main-wrapper{background-color:var(--color-white)}` | `#ffffff` |
| `action.secondary` / `border.strong` / `slate.60` / `cyan.70` | `--color-silver` (18 var, 15× as `color:` / 21 lit) | `#a99d90` |
| `action.secondaryHover` | `.btn-silver-bg:focus/hover{background-color:#b4aa9e}` (0 var / 1 lit) | `#b4aa9e` |
| `action.secondaryText` | `.btn` label ink on silver fills (6.12:1) | `#141b4d` |
| `action.danger` / `feedback.error` / `status.failed` | stop rule from stories rose `#d17389` (3.22) — step1 `#cb6079` (3.83), step2 `#c44d69` (4.55:1) | `#c44d69` *(à confirmer)* |
| `surface.subtle` / `slate.10` | literal `#eee` header-band/placeholder grounds (0 var / 9 lit) | `#eeeeee` |
| `surface.overlay` | `.documents-listing .modal{background:rgba(0,0,0,.87)}` | `rgba(0,0,0,0.87)` |
| `text.primary` / `slate.80` | `--color-dark` (38 var / 50 lit); `body{color:var(--color-dark)}` (18.88:1) | `#111111` |
| `text.muted` | stop rule from silver `#a99d90` (2.65) — step1 `#9e9082` (3.10:1), documented arbitration | `#9e9082` *(à confirmer)* |
| `border.subtle` / `slate.20` | `--color-gray` (4 var / 5 lit); light-form `border-bottom:1px solid var(--color-gray)` | `#dddddd` |
| `feedback.success` / `status.completed` | stop rule from afg2 `#1b9476` (3.79) — step1 `#177e65` (4.99:1) | `#177e65` *(à confirmer)* |
| `feedback.warning` / `status.pending` | `--color-yellow` (3 var / 4 lit); dark text on it 14.07:1 | `#ffdb76` |
| `feedback.info` / `status.processing` / `data.category6` | `--color-act-for-good-1` (1 var / 2 lit); white on it 10.13:1 | `#134660` |
| `slate.90` | `--color-black` (21 var / 37 lit) | `#000000` |
| `blue.10` | `.footer-main-menu .centre-list{background:#ededf0}` (0 var / 1 lit) | `#ededf0` |
| `cyan.10` | `--color-nav-gold` (3 var / 4 lit) | `#ead8b6` |
| `cyan.50` / `data.category2` | `--color-gold` (65 var / 68 lit) | `#bd9360` |
| `data.category1` | `--color-main-blue` | `#141b4d` |
| `data.category3` | `--color-pink` (35 var / 40 lit) | `#ef7e81` |
| `data.category4` | `--color-main-green` (2 var / 3 lit) | `#1eada5` |
| `data.category5` | `--color-yellow` | `#ffdb76` |
| `data.category7` | `--color-act-for-good-2` (1 var / 2 lit) | `#1b9476` |
| `data.category8` | `--color-light-pink` (3 var / 4 lit) | `#f7b386` |
| (no role — unpainted) | `--color-normal` (0 var / 1 lit, declaration only) | `#909090` |
| (no role — unpainted) | `--color-gray-hover` (0 var / 1 lit, declaration only) | `#747474` |
| (no role — unpainted) | `--color-blue` (0 var / 1 lit, declaration only) | `#497bb8` |
| (no role — unpainted) | `--color-light-blue` (0 var / 1 lit, declaration only) | `#89cfdd` |
| (no role — unpainted) | `--color-green` (0 var / 1 lit, declaration only) | `#1eeda5` |
| (no role — unpainted) | `--color-facebook` (0 var / 1 lit, declaration only) | `#4267b2` |
| (no role — painted once) | `--color-twitter` (1 var / 2 lit, social icon) | `#508bdb` |
| (no role — painted once) | `--color-nav-yellow` (1 var / 2 lit; `yellow.main` wins warning 3-vs-1) | `#fac84f` |
| (no role — painted) | `--color-act-for-good-3` (1 var / 2 lit, overlay act-for-good) | `#8cd59f` |
| (no role — painted) | `--color-act-for-good-4` (1 var / 2 lit, overlay act-for-good) | `#cad0b9` |
| (no role — unpainted) | `--color-youtube` (0 var, fully transparent, declaration only) | `rgba(255,255,0,0)` |

Unroled painted literals (context, no Sentropic role): `#0d0d0d` black-button
hover, `#c49f72` gold-button hover (1 lit each); `#efefef`/`#e4e4e4`/`#dedede`
media grounds, `#ccc` cover grounds, `#f3ecdc` keyfigure fallback,
`#b26790` stories-header gradient end with `#ef7e81`; untokenised
`rgba(20,27,77,.34/.66/.17)`, `rgba(21,27,74,.25)` and the second overlay
`rgba(21,27,74,.8)` (persons-graph infos; the generic modal
`rgba(0,0,0,.87)` wins as least-scoped).

## À confirmer (derived or no published brand token)

- **Stop-rule products** (`#9e9082` muted 3.10, `#177e65` success 4.99,
  `#c44d69` danger/error 4.55) — chains in the table above; FIRST pass kept
  in each chain. Muted sits in the 3–4.5 documented-arbitration band.
- **`focus.*`** — the brand draws no outline/ring (`*{outline:none}`, zero
  `:focus-visible`, focus = border-colour/opacity/underline shifts); outline
  2px/2px in `#141b4d` (16.23:1) encoded for parity.
- **`tabs.*`, `accordion.*`, `badge.*`, `choice.*`, `toggle.*`** — no tab,
  accordion, badge, checkbox/radio or on/off switch published (empty greps:
  `\.nav-tabs|\.tabs|\.tab[^a-z]|\.badge|\.pill`,
  `accordion|faq|\.details` except a base64 false positive, `checkbox|radio`
  all return 0). Active/trigger colours routed to own inks; geometry aligned
  with the reference theme package.
- **`breadcrumb` colours, `pagination.text/activeText`, `card.hoverBackground`
  (`#eeeeee`), `buttonSecondary.hoverBackground` (`#ededf0`),
  `tag.neutralBackground/Text`, `search.fontSize/lineHeight`, density
  `gap`/`minWidth`, `lg` control height (3rem — the 66px `.btn-large` span is
  CTA scale, quoted as evidence), `selectPaddingRight`, `iconSize.*`,
  `z.*`, `cursor.disabled="default"` (single scoped rule), label/field
  `weight:400` (nothing published, UA default stands) — each cited in
  `index.ts`.
- **Unpainted declared tokens** (`#909090`, `#747474`, `#497bb8`, `#89cfdd`,
  `#1eeda5`, `#4267b2`, transparent `--color-youtube`) — kept for provenance,
  no role per the consumption rule.

## Typography

- **Body / controls / labels** (`font.sans`): **'b8ffa454', Calibre, Arial,
  Helvetica, sans-serif** — `--font-calibre` (6 var refs + 6 literal stacks)
  and `body{font-family:var(--font-calibre)}`; the `"b8ffa454"` name is
  declared by the five `font-faces.css` `@font-face` blocks (weights
  300/500/600/bold/normal). We reference the font *names* only.
- **Display** (`font.display`): **the Avenir stack**
  (`Avenir,Avenir Next,Helvetica Neue,Segoe UI,Helvetica,Arial,sans-serif`,
  4×) — media-overlay labels (`.documents-listing .open-media span`,
  `.blogpost-media .open-media span`, …), always paired with
  `var(--color-pink)`. We reference the font *names* only.
- **Monospace** (`font.mono`): system stack.
- **Scale** (10px root → px → rem@16): body 20px/28px; `h1`/`.display-1`
  uppercase 600, 48px→100px fluid; `h2` 24px→32px; CTA `.btn` 12px/12px/600
  (medium 14px/16px, large 24px→18px@1024px); fields 20px/28px; labels
  14px/18px; legend uppercase 18px; breadcrumb/pagination 12px/18px–24px.
- Links: brand ink, **no underline at rest** (`text-decoration:none` 59
  declarations vs `underline` 3 — two hover-only, one flash-message markdown
  rule); news/carousel titles underline on hover/focus.

## Signatures anatomiques

- **Fields**: `field.style = "filled-underline"`, `underlineMode = "border"`.
  Least-scoped general rule (dark context): `input[type=email],
  input[type=text], select, textarea{border-bottom:1px solid
  var(--color-white-20);padding:0 0 12px}` with transparent fill; the
  light-context `.contactblock-general-contact` form (exp. 5449) re-specifies
  `border-bottom:1px solid var(--color-gray)` + main-blue text — the
  transcribed variant (`fillBg` = white page, `underlineColor` `#dddddd`).
  `textarea{height:160px;resize:none}`; label 14px/18px; no later override of
  the input border exists (LAST-rule search over `input[` past the general
  rule returns only the contact-form lines and autofill).
- **Radius**: sharp controls (`select{border-radius:0}`, no radius on `.btn`)
  → `none:0`; `sm:5px` (offer card, exp. 4829); `md:12px` (persons modal
  card, exp. 3346); `lg:30px` (more-button/stories buttons); `pill:999px`
  (36× `50%` circles). Unmapped singles quoted: 25px spirit-blob button,
  24px/16px filter pills, 6px news figure, 50px social pill, 3px clock hands.
- **Focus**: no brand technique — `*{outline:none}` (exp. ~13, global reset),
  zero `:focus-visible`/`:focus-within`, zero non-`none` `outline:`
  declarations; focus = `border-color` shift (search input → main-blue),
  opacity shifts, title underlines. Encoded `outline` 2px/2px `#141b4d`
  (16.23:1) à confirmer.
- **Buttons**: `.btn` = inline-flex transparent CTA, uppercase 12px/12px/600
  +1.5px tracking, main-blue, padding 12px 8px 12px 16px; fill variants
  white/black/main-blue/gold/silver with MEASURED hover lifts (`#0d0d0d`,
  `#192261`, `#c49f72`, `#b4aa9e`); fill transition `.7s --ease-classic`;
  no generic light `.btn:hover` background (contextual hovers are opacity or
  dark-context veils) → secondary hover à confirmer.
- **Tabs**: none published (empty greps above); bottom-border indicator
  transcribed from the pagination bar, à confirmer.
- **Pagination**: borderless 18px/24px text links (`padding:0 4px`), 2px
  currentColor bar at opacity 0→1 on active/hover/focus; arrows opacity
  .5→1 (no primitive). The indicator rule is one selector group,
  `.pagination__numbers a.active:after, … a:focus:after, … a:hover:after,
  … button.active:after, …` — links and buttons share it (1× in each of the
  three sheets).
- **Select chevron**: redrawn triangle `M10 12h13l-6.5 7z` (32×32 viewBox,
  base64 in the sheet, decoded to verify): white generally, `#141b4d` in the
  light form (exp. 5447) — the transcribed variant, `selectAppearance:"none"`,
  gutter à confirmer (the brand draws no `padding-right` on `select`).
- **Density**: `sm` height 2rem (`.btn-medium` span 32px); `md` height 2.5rem
  (input natural 12px pad + 28px line = 40px), block pad 12px, inline pad 0
  (`padding:0 0 12px`); `lg`/gaps/min-widths = reference geometry à
  confirmer (evidence quoted: `.btn-large` 66px span + 37px sides are CTA
  scale; `.icon-load` 20px is the only icon size besides 32px button glyphs).
- **Motion**: durations `.5s`×38 / `.2s`×36 / `.25s`×33 / `.4s`×28 / `.3s`×19
  / `.6s`×16 / `1s`×13 (228 `transition:`/`transition-duration:` time-tokens;
  no `ms` spellings); `--ease-default` 57 refs (motion easing),
  `--ease-classic` 16 refs incl. all five `.btn` fills (control easing),
  `--ease-carousel` 18 refs. Locale caution: default-locale `sort|uniq`
  splits `.2s` into phantom rows (23+13); `LC_ALL=C` recounts to 36.
- **Shadows**: the three black-tinted elevations above; the event-finance
  `0 22px 14px rgba(0,0,0,.07)` (exp. 4945) is the unmapped fourth.
- **Search**: inline input 40px tall, 210px wide, 2px `main-blue-20`
  underline → main-blue on focus (`outline:none`); 45px right icon gutter
  (no primitive); hero/panel searches run 28px–56px.
- **Alert**: unboxed silver 14px/18px/600 form text (transcribed); the
  fixed full-viewport flash message (white box, 8px gold border, z 10000) is
  a modal pattern, no primitive.
- **Tag**: filter pill 24px radius, 8px/16px pads, uppercase 12px/600.
- **Toggle/choice/accordion/badge**: nothing published (empty greps above);
  the stories grid-switch (60px circle outline buttons, `#d17389` accents)
  is a two-view switcher, not an on/off toggle. `disabledOpacity:0.2`
  (disabled nav + loading form); disabled cursor `default` (single scoped
  rule).
- **Overlay/backdrop**: generic modal `rgba(0,0,0,.87)` (z 9999) transcribed;
  persons overlay `rgba(21,27,74,.8)` (z 201) noted. `html` itself is black
  (overscroll ground); the page ground is `.main-wrapper` white.
- **z**: navigation(header) 200, overlay 201, modal 9999, flash 10000 —
  page-composition layers, not a 5-role scale; base scale kept à confirmer.

## Asset officiel

- Klépierre logo = the official Klépierre wordmark. Use the official SVG/PNG
  from the brand assets — **do not redraw the logo by hand**. This package
  references only font *names* and public colour values, never logo artwork
  or font binaries.
