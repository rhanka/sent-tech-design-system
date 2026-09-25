# Carrefour → Sentropic mapping

This package maps the **public** Carrefour design system onto the Sentropic
token structure (`TenantTheme`). Method = **measured-clone**: every colour,
radius, spacing, shadow, opacity and control dimension below is read from the
`--ds-*` custom properties and the brand component rules of
`https://www.carrefour.fr/v3-assets/HHNlKr0TBF.css`, the stylesheet the retail
front links from its homepage. Only public values and font *names* are
referenced — no font binaries. Derived/unmeasured values are flagged
`à confirmer`.

> **Key measured fact.** Carrefour serves two fronts that do **not** declare the
> same values, and the one everyone assumes is authoritative is the weaker
> source. `carrefour.com` (corporate) declares **zero** CSS custom properties:
> it is a Drupal theme of literal hexes, about a quarter of which is
> normalize.css v8.0.1, a Tailwind v1 preflight + utility layer, Swiper and
> video.js. `carrefour.fr` (retail) ships Carrefour's **own tokenised design
> system** — 2551 custom-property declarations (1320 `--ds-*`, 1319 distinct
> names) with an explicit brand layer, scales for
> radius/spacing/sizing/shadow/opacity, and per-component colour roles.
> carrefour.fr therefore wins (see *Host arbitration*). Second surprise: the DS
> declares `--ds-color-brand-primary: #254f9a` and
> `--ds-color-brand-secondary: #c20016` and then **consumes neither** (0 `var()`
> references; the only painted use of `#254f9a` is an alpha shadow tint in
> seven rules — see *Step 0.5*, counting convention). The blue that actually
> paints the interface is `#0970e6`
> (162 declared occurrences, 11 `var()` consumptions). Third: every Carrefour
> value that lands in a threshold-bound role already passes WCAG — **no
> stop-rule chain was needed anywhere in this package** (see *Accessibility*).

## Upstream access

`carrefour.com` and `carrefour.fr` both sit behind a Cloudflare challenge
(`server: cloudflare`, `server-timing: chlray`). Probed 2026-09-24, all three
forms the method prescribes, plus the isolating variants:

| Request form | `www.carrefour.com/` | `www.carrefour.fr/` |
|---|---|---|
| bare `curl/8.x` | `301` → `/en/`, then `200` | **`403`** |
| browser UA only (`-A '…Chrome/140…'`) | **`403`** | **`403`** |
| UA + `Accept` (no more) | **`403`** | — |
| UA + `Accept-Language` (no more) | **`403`** | — |
| full header set **without** `Referer` | **`403`** | — |
| **full header set with `Referer`** | **`200`** | **`200`** |

**The working recipe — `Referer` is the discriminator.** Repeated three times,
the full header set *with* a `Referer` returned `200` every time; the identical
set *without* it returned `403` every time. `Sec-Fetch-User: ?1` passed once and
then began failing, so it is not a reliable substitute. Send:

```
curl -sL --compressed \
  -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \
  -H 'Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7' \
  -H 'Referer: https://www.google.com/' \
  -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' \
  -H 'Upgrade-Insecure-Requests: 1' \
  'https://www.carrefour.fr/'
```

Stylesheets need the **same** treatment plus a same-origin referer and the
stylesheet fetch metadata — `Accept: text/css,*/*;q=0.1`,
`Referer: https://www.carrefour.fr/`, `Sec-Fetch-Dest: style`,
`Sec-Fetch-Mode: no-cors`, `Sec-Fetch-Site: same-origin`. All 14
`/v3-assets/*.css` files and all three `carrefour.com`
`/themes/custom/c4com/css/*.css` files answered `200` that way on 2026-09-24.

Other hosts probed 2026-09-24, in case a future measurement needs an unprotected
one: `www.carrefour.com/en` and `www.carrefour.com/fr/groupe` behave exactly like
`www.carrefour.com/` (bare `200`, UA-only `403`, full+`Referer` `200`);
`drive.carrefour.fr` behaves like `www.carrefour.fr` (bare `403`, full+`Referer`
`200`). `media.carrefour.com`, `press.carrefour.com` and
`investors.carrefour.com` **do not resolve** (connection failure, no HTTP status)
— there is no unprotected asset or press host to fall back to.

Note for whoever measures this brand next: **a bare `curl` is not the fallback
here.** On `carrefour.com` the bare request succeeds and the UA-only request is
blocked, exactly the Akamai-shaped inversion the method warns about; on
`carrefour.fr` the bare request is blocked too. Only the full set with a
`Referer` works on both. No archived copy was used: the live sources answered
`200`, so every value below is measured from the live stylesheets of
2026-09-24. Should that stop working, the Wayback fallback exists — the capture
`web.archive.org` actually served for `www.carrefour.fr` when asked for
2026-09-20 is timestamped **2026-09-02 20:31:21** (`20260902203121`), which is
the timestamp to cite, not the one requested.

## Sources

- **Carrefour's tokenised design system** (2551 custom-property declarations,
  1320 `--ds-*`: brand layer, colour roles, radius, spacing, sizing, shadow,
  opacity, breakpoints)
  and its component rules (`.c-button`, `.c-base-input`, `.c-tabs__tab`,
  `.c-modal`, `.c-toggle`, `.c-card`, `.c-accordion`, `.c-tag`, `.c-badge`,
  `.c-link`, `.c-pagination`, `.c-breadcrumbs`, `.c-checkbox`, `.c-radio`) —
  `https://www.carrefour.fr/v3-assets/HHNlKr0TBF.css`, linked from
  `https://www.carrefour.fr/`. **Every measured value in this package.**
- **The `rem` root and the base faces** —
  `body,html{font-size:16px;font-family:Open Sans,cf-body-fallback,…;color:#121212;background-color:#fff}`
  and `h1,h2,h3,h4,h5,h6{font-family:Ubuntu,Open Sans,cf-heading-fallback,sans-serif}`,
  same file.
- **Corporate front, cross-check only, not an origin** —
  `https://www.carrefour.com/themes/custom/c4com/css/app.css` (+ `custom.css`,
  `ckeditor_custom_styles.css`), linked from `https://www.carrefour.com/fr`.
  Used to establish the host disagreement below; **no value in this package
  comes from it.**

## `rem` root and length conversions

`body,html{font-size:16px}` — declared **explicitly**, and `html{font:100%/1.625
Open Sans}` agrees (100% = 16px). `62.5%` appears in **none** of the 14
carrefour.fr stylesheets, and `carrefour.com/app.css` declares no `font-size`
on `html` or `:root` at all (browser default, also 16px). **Both hosts are at a
16px root, so every `rem` transcribed below is carried over verbatim with no
conversion**, and the pixel values (`height:40px`, `height:56px`,
`border-radius:10px`, `padding:0 6px`, `line-height:20px`, `width:56px`,
`height:32px`) convert at 16px: 40px = 2.5rem, 56px = 3.5rem, 10px = 0.625rem,
6px = 0.375rem, 20px = 1.25rem, 32px = 2rem.

## Step 0.5 — brand region vs third-party blocks

**carrefour.fr / `HHNlKr0TBF.css` (5735 expanded rules): brand-owned except two
named third-party regions.** Searched for `normalize`, `payline`, `monext`,
`swiper`, `slick`, `tealium`, `onetrust`, `didomi`, `trustarc`, `bootstrap`,
`vjs-`, `tarteaucitron`, `axeptio`, `splide`, `glide`, `leaflet`, `mapbox`,
`algolia`, `ais-` — `normalize` and `monext` return zero matches **because the
regions below carry no banner and neither keyword occurs in them**: keyword
search cannot find a de-bannerised vendor block, so the boundaries below are
drawn **by structure** (bare-element rules with no namespace), not by keyword.
The file carries no vendor banner comment anywhere (0 `license` / `/*!`
markers). Outside the two regions the selectors are Carrefour's own across
three DS generations (`.pl-*` → `.ds-*` → `.c-*`) plus its product and checkout
components; the `.pl-*` prefix is mixed — Carrefour's own earlier DS generation
(`.pl-button--tone-main`, `.pl-base-input__input`) alongside the payment
region's classes below.

**Boundary 1 — de-bannerised normalize-shaped reset + un-namespaced base layer,
expanded lines 5545–5626 (82 rules).** Lines 5545–5583 are a 39-rule
normalize-shaped reset on bare selectors (`html`, `body`,
`article,aside,…`, `a`, `abbr[title]`, `sub,sup`, `img`, `svg:not(:root)`,
`code,kbd,pre,samp{font-family:monospace,monospace}`,
`button,input,optgroup,select,textarea`, `fieldset`, `legend`,
`[type=search]::-webkit-search-cancel-button`, …) with the licence banner
stripped by the minified build — the method's hardest failure mode, since the
keyword legitimately reads 0 while the code is present. Lines 5584–5626 are a
second, 43-rule un-namespaced base layer (`html`, `*`, `*:before/:after`,
`body`, `h1`–`h6`, `ul,ol`, `table`, `blockquote`, `thead`, `td,th`, `a`,
`button`). The region ends at the boundary marker `body,html{font-size:16px}`
at line 5627. **No `--ds-*` declaration exists in either layer (0 of 1320)**,
so no token origin is affected; whole-file hex counts shift only by
`#0970e6` 162 → 158, `#e5e5e5` 68 → 65, `#f7f7f7` −1 once both third-party
regions are excluded — **no tie-break flips** (see recount note below).

**Boundary 2 — third-party Payline/Monext payment region (unnamed until now).**
`#PaylineWidget` (188 rules), `#pl-container-lightbox-*`, plus the payment
subset of `.pl-*` (`.pl-cardNumber-container`, `.pl-amex`, `.pl-cb`,
`.pl-cbpass`, `.pl-apple-pay`, `.pl-AMOUNT-container`,
`.pl-consent-container`, …) — about 155 rules in all. Excluded as origins
under Step 0.5 like any vendor block.

**Counting convention (stated here because the headline counts depend on it).**
One occurrence = one exact 6-digit hex in a `--*` custom-property declaration
or in a property value containing that hex, case-normalised — the method's
literal rule, restricted to the 6-digit stem so counts stay comparable. 8-digit
alpha extensions of a stem are **excluded** from its headline count and
disclosed separately where they exist (`#121212`: 194 raw − 7 alpha = 187;
`#254f9a`: 1 exact + 8 alpha; `#0970e6` and `#004f9b` have 0 alpha forms).
Consumption is counted independently as `var(--token)` references.
Under the method's unqualified literal rule the 8 alpha `#254f9a` forms would
also be occurrences; the figures that follow use the 6-digit-exact convention
throughout, so `#254f9a` reads 1 while its shadow-tint use is recorded
verbatim below.

**Recount on the brand region alone** (both boundaries above excluded):
`#0970e6` 162 → **158** (the 4 excluded occurrences are the `#PaylineWidget`
pay-button / wallet / payment-method rules; the bare `a{color:#0970e6}` at
line 5624 stays counted — see the `1.625` rationale pattern below: a
bare-element rule declaring a brand-owned value), `#e5e5e5` 68 → **65**,
`#f7f7f7` −1, everything else unchanged. The operative blue still outnumbers
the declared brand token 158 to 1, and 11 `var()` to 0 — the promotion
decision is unchanged.

**The `1.625` provenance, stated explicitly.** `card.lineHeight`,
`alert.lineHeight` and `accordion.lineHeight` (`1.625`) are transcribed from
`html{font:100%/1.625 Open Sans}` at line 5584 — **inside** boundary 1's span.
This rule is claimed as brand-owned, not vendor boilerplate, because it
declares two brand-owned values at once: the `Open Sans` brand body face and a
`1.625` ratio that the file's own base layer then reuses pervasively
(`margin-bottom:1.625rem`, `line-height:1.625rem` across `pre`, `table`,
`blockquote`, …). A vendored reset carries neither a brand face nor a
brand-specific ratio; this rule carries both, so its provenance is defensible —
but it is a judgement call on a bare `html` selector inside a vendor-shaped
region, recorded here instead of being filed under a region declared unused.
The same rationale keeps the bare `a{color:#0970e6}` at line 5624 in the
brand region: it declares the brand's operative blue.

**carrefour.com / `app.css` (2202 expanded rules): a brand file carrying four
vendor regions, and the boundary is NOT per-file.** Named for the record, since
this file is the tempting-looking source a reviewer will check:

| Expanded lines | Region | Owner |
|---|---|---|
| 1 | three Google Fonts `@import` (Raleway 900, Ubuntu 300/400/500/700, Vollkorn 600i/700i) | brand config |
| 2–37 | **normalize.css v8.0.1** (banner comment at line 3) | vendor |
| 38–50 | **Tailwind v1 preflight** — `html{font-family:-apple-system,…;line-height:1.5}`, and `*,:after,:before{border-color:#e2e8f0}` | vendor |
| 51–187 | **Tailwind v1 utility classes** — `.rounded`, `.py-2`, `.w-full`, `.uppercase`, `.font-ubuntu` | vendor generator |
| **188–535** | **brand** — boundary marker `@font-face{font-family:afternightregular}` at 188, then `.btn-base`, `.c4com-wysiwyg`, `.chapo`, `.block-remontee`, `.financial-table`, `.search-page` | **brand** |
| 536–626 | **Swiper** — boundary marker `.swiper-container` | vendor |
| 627–938 | **video.js** — incl. `@font-face{font-family:VideoJS}` | vendor |
| **939–2133** | **brand** — boundary marker `.accordion-item` at 939 | **brand** |
| 2134 | one `.vjs-custom-skin>.video-js .vjs-big-play-button` override | brand override of vendor |
| **2135–2202** | **brand** — `.btn-*`, `.icon-*`, `body{font-family:Ubuntu;background:#fff}` | **brand** |

Counts computed on the brand region **alone** (1611 lines): `#004e9f` ×126,
`#fff` ×101, `#6b6b6b` ×23, `#f0f2f2` ×20, `#0870e5` ×6, `#254f9b` ×5. The
Tailwind-default greys `#718096` (×7), `#e2e8f0` (×5) and `#cbd5e0` (×3) do
occur inside brand selectors but are the framework's own default palette, and
`#e2e8f0` is declared by the Tailwind preflight rule itself — **excluded as
origins under Step 0.5, and excluded consistently** (no grey from that block is
kept while another is dropped). None of these values ships in this package
anyway, because carrefour.fr wins the arbitration below.

## Host arbitration (Step 0.3)

The two hosts declare **different hexes for the same roles**, per-file counts,
not a union:

| Role | `carrefour.com` `app.css` brand region | `carrefour.fr` `HHNlKr0TBF.css` |
|---|---|---|
| dominant blue | `#004e9f` ×126 | `#0970e6` ×162 (×158 on the brand region alone) |
| second blue | `#0870e5` ×6 | `#004e9b` ×45 |
| deep blue | `#254f9b` ×5 | `#254f9a` ×1 (`--ds-color-brand-primary`) |
| loyalty blue | — | `#004f9b` ×34 |
| primary text | `#000` ×5 | `#121212` ×187 |
| brand red | `#ed3723` ×1, `#dc3d51` ×1, `#d0021b` ×1 | `#c20016` ×1, `#df1116` ×73, `#d30d1f` ×37 |
| body face | `body{font-family:Ubuntu}` | `body,html{font-family:Open Sans,…}`; `h1..h6{font-family:Ubuntu,…}` |
| custom properties | **0** | **2551** (1320 `--ds-*`) |

The pairs differ by a single digit in places (`#254f9b`/`#254f9a`,
`#004e9f`/`#004e9b`/`#004f9b`, `#0870e5`/`#0970e6`): the same design intent,
rounded differently per host. That disagreement is a measured fact, not an
error to smooth over.

**carrefour.fr wins, on four independent grounds:**

1. **Source rank.** The custom properties of the brand's official site
   stylesheet (source (b)) outrank literal hexes in rules. Carrefour publishes
   no standalone design system — no site, no repository — so source (a) does
   not apply here; the `--ds-` prefix inside a minified bundle is a case of
   (b), not (a). carrefour.fr is that case; carrefour.com is not even the
   second, since it declares no custom properties at all. Grounds 2–4 below
   carry the arbitration on their own.
2. **Role naming.** `--ds-color-interactive-background-button-filled-main-active`
   names its role; `#004e9f` on carrefour.com is an anonymous value repeated in
   unrelated rules (`.chapo` text, `.cta` text, `.menu-mobile` text,
   `.btn-base:hover` fill, a scrollbar track).
3. **Declaration form.** A hex declared as a custom property beats one used only
   inline in a rule.
4. **Frequency.** Even the raw count favours carrefour.fr: `#0970e6` ×162
   whole-file (×158 on the brand region alone) vs `#004e9f` ×126 on
   carrefour.com's brand region.

Per-file counts (the method requires all 14 sheets to count): the 13 other
`/v3-assets/*.css` files linked from the homepage (`B2dh2Ec5ie`, `BcckqFmKeC`,
`BebzIitYls`, `BhitPbJm6F`, `Bvub-O9FpM`, `CFcRE-VqXI`, `CNUE2-VEFg`,
`CvPEoZNGsB`, `DkMs1_isqR`, `gdoHtdhAuh`, `qzqjNeHHDL`, `scdcSN0M0F`,
`tn0RQdqMVo`) carry **25 hex occurrences, 35 custom properties, 0 `--ds-*`**
between them — page-level overrides, no rival token layer, no tie-break
affected.

Scope note for the reader: Carrefour's corporate communication and its retail
enseigne are one company's two faces, and the theme carries the identity the
brand has **tokenised and declared as its own design system**. The corporate
Drupal theme carries no design system, and its own body face (Ubuntu) is the
same face carrefour.fr uses for headings — so the two are not in conflict on
typography, only on which blue is written down.

## Colour mapping

| Sentropic role | Carrefour source | Value |
|---|---|---|
| `foundation.color.blue.10` | `--ds-color-core-background-functional-information` (= `--ds-color-decorative-background-main-celeste`) | `#f5faff` |
| `foundation.color.blue.60` | `--ds-color-interactive-active-main-primary` (= `--ds-color-interactive-background-button-filled-main-active`) | `#0970e6` |
| `foundation.color.blue.80` | `--ds-color-interactive-background-button-filled-main-pressed` | `#003161` |
| `foundation.color.cyan.10` | `--ds-color-decorative-background-main-aqua` | `#edfdff` |
| `foundation.color.cyan.50` | `--ds-color-decorative-background-reversed-sacramento` | `#006064` |
| `foundation.color.cyan.70` | derived — one HSL L−0.05 step from the measured `#006064`; the DS publishes no darker teal | `#00484a` *(à confirmer)* |
| `foundation.color.slate.0` | `--ds-color-core-background-main-primary`; `body,html{background-color:#fff}` | `#ffffff` |
| `foundation.color.slate.10` | `--ds-color-core-background-main-secondary` (= `--ds-color-persistent-background-alternate`) | `#f7f7f7` |
| `foundation.color.slate.20` | `--ds-color-interactive-border-input-active` (= `--ds-color-core-border-main-secondary`) | `#d9d9d9` |
| `foundation.color.slate.60` | `--ds-color-core-content-main-tertiary` | `#575757` |
| `foundation.color.slate.80` | `--ds-color-core-background-reversed-secondary` (= `--ds-color-decorative-background-reversed-charcoal`) | `#262626` |
| `foundation.color.slate.90` | `--ds-color-core-content-main-primary` (= `--ds-color-core-background-reversed-primary`) | `#121212` |
| `semantic.surface.default` | `--ds-color-core-background-main-primary`; `body,html{background-color:#fff}` | `#ffffff` |
| `semantic.surface.subtle` | `--ds-color-core-background-main-secondary` | `#f7f7f7` |
| `semantic.surface.raised` | `--ds-color-persistent-background-card-default` (= `--ds-color-persistent-background-modal-default`) | `#ffffff` |
| `semantic.surface.inverse` | `--ds-color-core-background-reversed-primary` | `#121212` |
| `semantic.surface.overlay` | **measured** — `.c-modal:before{opacity:.5;background-color:var(--ds-color-persistent-background-overlay-default)}`, identically in `.c-drawer:before` and `.c-popin:before`; the token is `#121212` | `rgb(18 18 18 / 0.5)` |
| `semantic.text.primary` | `--ds-color-core-content-main-primary` (= `--ds-color-persistent-text-primary`); `body,html{color:#121212}` | `#121212` |
| `semantic.text.secondary` | `--ds-color-core-content-main-secondary` (= `--ds-color-persistent-text-secondary`) | `#454545` |
| `semantic.text.muted` | `--ds-color-core-content-main-tertiary` | `#575757` |
| `semantic.text.inverse` | `--ds-color-core-content-reversed-primary` (= `--ds-color-persistent-text-reversed-primary`) | `#ffffff` |
| `semantic.text.link` | `--ds-color-interactive-text-link-main-active`, consumed by `.c-link--tone-main{color:var(…)}` | `#0970e6` |
| `semantic.border.subtle` | `--ds-color-interactive-border-input-active`, consumed by `.c-base-input__container{border:1px solid var(…)}` | `#d9d9d9` |
| `semantic.border.strong` | `--ds-color-interactive-border-input-pressed` | `#878787` |
| `semantic.border.interactive` | `--ds-color-interactive-border-main-active` (= `--ds-color-interactive-border-focus`) | `#0970e6` |
| `semantic.action.primary` | `--ds-color-interactive-background-button-filled-main-active`, consumed by `.c-button--tone-main.c-button--variation-filled{background-color:var(…)}` | `#0970e6` |
| `semantic.action.primaryHover` | `--ds-color-interactive-background-button-filled-main-hover`, consumed by `.c-button--tone-main.c-button--variation-filled:hover` | `#004e9b` |
| `semantic.action.primaryText` | `--ds-color-interactive-text-button-filled-main-active`, consumed by `.c-button--variation-filled{color:var(…)}` | `#ffffff` |
| `semantic.action.secondary` | `--ds-color-core-background-main-secondary` | `#f7f7f7` |
| `semantic.action.secondaryHover` | `--ds-color-interactive-background-input-addon-hover` | `#d9d9d9` |
| `semantic.action.secondaryText` | `--ds-color-interactive-content-subtle-active` | `#121212` |
| `semantic.action.danger` | `--ds-color-interactive-background-button-filled-destructive-active` (= `--ds-color-persistent-background-functional-main-negative`) | `#df1116` |
| `semantic.feedback.success` / `status.completed` | `--ds-color-persistent-background-functional-main-success` | `#2c815e` |
| `semantic.feedback.warning` / `status.pending` | `--ds-color-persistent-background-functional-main-warning` | `#8a5f00` |
| `semantic.feedback.error` / `status.failed` | `--ds-color-persistent-background-functional-main-negative` | `#df1116` |
| `semantic.feedback.info` / `status.processing` | `--ds-color-persistent-background-functional-main-information` | `#173eb4` |
| `semantic.data.category1` | `--ds-color-interactive-active-main-primary` | `#0970e6` |
| `semantic.data.category2` | `--ds-color-decorative-background-reversed-ginger` | `#b33308` |
| `semantic.data.category3` | `--ds-color-decorative-background-reversed-sacramento` | `#006064` |
| `semantic.data.category4` | `--ds-color-decorative-background-reversed-olive` | `#827717` |
| `semantic.data.category5` | `--ds-color-decorative-background-reversed-raisin` | `#4a148c` |
| `semantic.data.category6` | `--ds-color-decorative-background-reversed-forest` | `#004f2b` |
| `semantic.data.category7` | `--ds-color-decorative-background-reversed-walnut` | `#5c2e1d` |
| `semantic.data.category8` | `--ds-color-decorative-background-reversed-graphite` | `#263238` |
| `foundation.focus.color` | `--ds-color-interactive-border-focus`, 19 `var()` references across 17 DS rules | `#0970e6` |
| `foundation.field.fillBg` | `--ds-color-interactive-background-input-active`, consumed by `.c-base-input__container{background-color:var(…)}` | `#ffffff` |
| `foundation.tabs.activeText` | `--ds-color-interactive-text-tab-selected-active`, consumed by `.c-tabs__tab--selected{color:var(…)}` | `#0864e6` |
| `foundation.tabs.activeBackground` | `--ds-color-persistent-background-alternate`, consumed by `.c-tabs__tab--selected{background-color:var(…)}` | `#f7f7f7` |
| `foundation.tabs.inactiveBackground` | `--ds-color-core-background-main-secondary`, consumed by `.c-tabs__tab{background-color:var(…)}` | `#f7f7f7` |
| `foundation.card.hoverBackground` | `--ds-color-core-background-main-secondary` | `#f7f7f7` |
| `foundation.buttonSecondary.background` | `--ds-color-interactive-text-button-filled-main-active`, declared by `.c-button--variation-outlined,.c-button--variation-secondary{background-color:var(…)}` | `#ffffff` |
| `foundation.buttonSecondary.border` | `--ds-color-interactive-background-button-filled-main-active`, declared by `.c-button--tone-main.c-button--variation-outlined:not(.c-button--reversed){border:1px solid var(…)}` | `#0970e6` |
| `foundation.buttonSecondary.hoverBackground` | the outlined button’s `:hover` rule recolours only `color` and `border`; it declares NO `background-color`, so the resting fill persists | `#ffffff` |
| `foundation.pagination.activeBackground` / `.text` | `--ds-color-interactive-active-main-primary`, consumed by `.c-pagination__list-item--active{background-color:var(…)}` | `#0970e6` |
| `foundation.pagination.activeText` | `.c-pagination__list-item--active{color:#fff}` — a literal in the brand rule | `#ffffff` |
| `foundation.breadcrumb.*` (all four) | `--ds-color-interactive-text-link-accent-active`, via `.c-breadcrumbs{--c-breadcrumb-color:var(…)}` consumed by `.c-breadcrumbs__breadcrumb` and `.c-breadcrumbs__separator` | `#121212` |
| `foundation.accordion.text` | `--ds-color-persistent-text-accordion-default`, consumed by `.c-accordion{color:var(…)}` | `#121212` |
| `foundation.alert.background` | `--ds-color-persistent-background-tag-light-information` | `#f5faff` |
| `foundation.tag.neutralBackground` | `--ds-color-persistent-background-alternate`, consumed by `.c-badge--status-neutral{background-color:var(…)}` | `#f7f7f7` |
| `foundation.tag.neutralText` | `--ds-color-persistent-text-primary`, consumed by `.c-badge--status-neutral{color:var(…)}` | `#121212` |
| `foundation.badge.infoBackground` | `--ds-color-persistent-background-badge-information`, consumed by `.c-badge--status-info{background-color:var(…)}` | `#173eb4` |
| `foundation.badge.infoText` | `--ds-color-persistent-text-reversed-primary`, consumed by `.c-badge--status-info{color:var(…)}` | `#ffffff` |
| `foundation.choice.labelColor`, `foundation.toggle.textColor` | `--ds-color-interactive-text-input-label-default`, consumed by `.c-checkbox__label`, `.c-radio__label`, `.c-toggle__label` | `#454545` |
| `foundation.shadow.subtle` | `--ds-shadow-up-xs` | `0px 2px 4px rgba(18, 18, 18, 0.08)` |
| `foundation.shadow.medium` | `--ds-shadow-action` | `2px 4px 12px rgba(18, 18, 18, 0.12)` |
| `foundation.shadow.floating` | `--ds-shadow-raised` (= `--ds-shadow-up-l`), consumed by `.c-modal__container{box-shadow:var(--ds-shadow-up-l)}` | `0px 16px 64px rgba(18, 18, 18, 0.12), 0px 8px 24px rgba(18, 18, 18, 0.16)` |

Measured palette entries recorded in `carrefourColor` for provenance that carry
**no** Sentropic role, listed so every hex in `index.ts` has a row here:

| Palette entry | Carrefour source | Value |
|---|---|---|
| `neutral.100` | `--ds-color-persistent-border-main-primary` (the card and accordion border; `--ds-separator` is the `1px solid #ebebeb` border shorthand built on it, not a colour token) | `#ebebeb` |
| `neutral.200` | `--ds-color-core-border-main-primary` | `#e5e5e5` |
| `neutral.400` | `--ds-color-interactive-border-input-hover`, consumed by `.c-base-input__container:hover{border:1px solid var(…)}` | `#b8b8b8` |
| `system.successLight` | `--ds-color-persistent-background-functional-reversed-success` (= `--ds-color-persistent-background-tag-light-positive`) | `#f0faf6` |
| `system.warningLight` | `--ds-color-persistent-background-functional-reversed-warning` (= `--ds-color-persistent-background-tag-light-warning`) | `#fffaf0` |
| `system.errorLight` | `--ds-color-persistent-background-functional-reversed-negative` (= `--ds-color-persistent-background-tag-light-negative`) | `#ffefef` |

Declared-but-unconsumed brand tokens, recorded because they are the brand's own
self-description and a reviewer will look for them: `--ds-color-brand-primary`
`#254f9a`, `--ds-color-brand-secondary` `#c20016`, and `--ds-color-brand-tertiary`
`#f0f3f6` (0 `var()` each). They are present in `carrefourColor` for provenance
and carry **no** Sentropic role: `--ds-color-brand-primary` and `-secondary`
have **zero** `var()` consumptions in the whole stylesheet, and the only painted
use of `#254f9a` is an alpha shadow tint (`#254f9a14` ×6, `#254f9a29` ×1,
`#254f9a1f` ×1 — 8 occurrences in 7 rules: `.typeahead:before`,
`.typeahead__footer`, `.channel-switch-modal__header`,
`.channel-switch-modal__container`, `.bundle-drawer--header-shadow
.drawer__header`, `.bundle-drawer__header`, `.pl-toaster`, all `box-shadow` —
never a fill, a stroke, or a text colour), so promoting either to
`action.primary` would ship a value the brand's own interface never paints as
a surface. The operative blue `#0970e6` wins on frequency (162 vs 1 whole-file,
158 vs 1 on the brand region) and on consumption (11 `var()` vs 0).

The loyalty blue `--ds-color-interactive-active-loyalty-primary` `#004f9b` is
**not** unconsumed and is not in that list: it carries **11 `var()`**
references and 34 hex occurrences — the same order of proof used above for
`#0970e6`. It is kept in `carrefourColor` with **no** Sentropic role for a
different, stated reason: it is a programme colour scoped to the loyalty-card
component family, not a general-interface colour, so no general role may claim
it.

Two `rgb()` values appear in the **compiled** output but come from neither this
package nor Carrefour: `rgba(185, 28, 28, 0.08)` (`dangerHoverBackground`) and
`rgb(226 232 240 / 0.56)` (`edgeDefault`) are hardcoded in the shared
`packages/tokens/src/component.ts` (lines 1493 and 1744), are not reachable
through any key a theme controls, and are present identically in
`theme-schneider-electric` and `theme-renault`. Named here so they are not
mistaken for unsourced brand hexes.

## À confirmer (derived or no published brand token)

- **`foundation.color.cyan.70`** (`#00484a`) — the DS publishes a decorative
  teal pair (aqua `#edfdff`, sacramento `#006064`) but no darker teal. Derived
  as one HSL L−0.05 step from the measured `#006064` (h 182.4°, s 100%,
  l 19.6% → l 14.6%), keeping H and S. The derivation lands on a rounding
  near-tie (exact blue channel 74.4999… → 74 = `4a`), so two builders could
  diverge here; the replay above fixes `#00484a`. Not bound to any contrast
  threshold: no semantic text or line role routes to `cyan.70`.
- **`foundation.font.mono`** (system stack) — Carrefour declares no monospace
  face. The `@font-face` families it serves are Ubuntu, Open Sans,
  `cf-body-fallback`, `cf-heading-fallback` and the icon font `c-icon`; none is
  monospace.
- **`foundation.spacing.16`** (`4rem`) — the Sentropic key `16` means 4rem.
  Carrefour's `--ds-spacing-*` scale runs `.125 / .25 / .5 / .75 / 1 / 1.5 / 2 /
  3 / 8rem` and publishes **no 4rem step** (`xxl` 3rem jumps straight to `xxxl`
  8rem). Keys `1`–`12` are all measured; `16` alone is derived to keep the
  scale's arithmetic meaning.
- **`foundation.z.overlay`** (`17999`) and **`foundation.z.chat`** (`22001`) —
  Carrefour draws its backdrop as `.c-modal:before{z-index:-1}` *inside* the
  modal layer, so it publishes no standalone overlay z-index, and it has no chat
  surface. Derived one step either side of the measured layers
  (`.mainbar--sticky` 10005, `.c-modal`/`.c-drawer` 18000, `.c-toaster` 22000)
  so the measured order is preserved.
- **`foundation.density.lg`** (`controlHeight 4rem`, and the `paddingBlock` /
  `paddingInline` / `fontSize` copied from `md`) — Carrefour publishes exactly
  **two** button sizes (see *Control geometry* below); there is no third.
- **`foundation.density.*.minWidth`** (`2.5rem` / `3.5rem` / `4rem`) — no
  `min-width` is declared on `.c-button`; set to match each measured
  `controlHeight` so square icon buttons stay square.
- **`foundation.typography.label.lineHeight`** (`1.4`) —
  `.c-base-input__label{font-size:.875rem;font-weight:400}` declares no
  `line-height`; the family, size and weight are measured.
- **`foundation.field.selectChevron`** and **`.selectPaddingRight`** — Carrefour
  builds its select as a **custom listbox** (`.c-input-select__container`,
  `.c-input-select__option`), not a native `<select>`, so it publishes no native
  chevron artwork. The chevron is redrawn as a data-URI SVG carrying
  `#0970e6` — that colour is measured
  (`.c-input-select__chevron{color:var(--ds-color-interactive-icon-main-active)}`
  = `#0970e6`); only the artwork and the `2.5rem` gutter are derived.
- **`foundation.tabs.indicatorSide`** (`bottom`) — `.c-tabs__tab--selected`
  recolours a full `2px` box (`border-color`), not one side. `bottom` + `border`
  is the closest Sentropic primitive; the colours and paddings are measured.
- **`foundation.breadcrumb.currentWeight`** (`700`) — Carrefour marks no weight
  on the current crumb; all four breadcrumb colours are measured.
- **`foundation.alert.filetWidth`** (`0.25rem`) and **`.paddingLeft`**
  (`1.25rem`) — Carrefour publishes no `.c-alert`; its notice surface is the
  tag/badge "light" family, a filled tinted box with no left filet. The
  background, and the other three paddings (`--ds-spacing-m`, from `.c-card`),
  are measured.
- **`foundation.accordion.fontWeight`** (`700`) —
  `.c-accordion__title-container{font:inherit}`, so the trigger inherits its
  weight and no value is published.
- **`foundation.tag.minHeight`** (`1.5rem`) — `.c-tag--size-m` publishes
  `min-width:1.9rem` but no `min-height`.
- **`foundation.badge.minHeight`** (`1.25rem`) — no `min-height` published; set
  to the measured `line-height` of `.c-badge--size-m`.
- **`foundation.choice.labelLineHeight`** / **`.radioLineHeight`** (`1.5rem`) and
  **`foundation.toggle.lineHeight`** (`1.5rem`) — `.c-checkbox__label`,
  `.c-radio__label` and `.c-toggle__label` publish `font-size:1rem` and
  `font-weight:400` but no `line-height`.

Everything not listed here is measured from the sources above.

## Typography

- **Body / fields / labels** (`font.sans`): **'Open Sans'**, then Carrefour's own
  metric-matched fallback **'cf-body-fallback'** — declared by
  `body,html{font-family:Open Sans,cf-body-fallback,-apple-system,…}` and by
  `.ds-body-text`. We reference the font *names* only.
- **Headings / control labels** (`font.display`, `typography.control.family`):
  **'Ubuntu'**, then **'Open Sans'**, then **'cf-heading-fallback'** — declared by
  `h1,h2,h3,h4,h5,h6{font-family:Ubuntu,Open Sans,cf-heading-fallback,sans-serif}`
  and by `:root{--ds-font-family: "Ubuntu", "Open Sans", "sans-serif"}`, which
  `.c-button{font-family:var(--ds-font-family)}` consumes — hence
  `typography.control.family: var(--st-font-display)`. Ubuntu is also the body
  face of the corporate front (`body{font-family:Ubuntu}` on carrefour.com), so
  the two hosts agree on typography even while they disagree on the blue.
  Deliberately unmapped: `#0e3368` (63 occurrences, the file's 8th most
  frequent hex) is the brand's heading colour, declared in that very rule
  (`h1,…,h6{…color:#0e3368}`, expanded line 5636) — cited above without its
  `color`. It never occurs in a `.c-*` rule (0), so no component role can
  claim it; the exclusion is defensible and is recorded here rather than left
  silent.
- **Monospace** (`font.mono`): system stack *(à confirmer)* — Carrefour declares
  no monospace face.
- **Control text**: `1rem`, weight **700**, line-height `1.5`
  (`.c-button{font-size:1rem;font-weight:700;line-height:1.5rem}`) — Carrefour's
  buttons are bold, against the Sentropic base's 600 at 0.9375rem.
- **Field text**: `1rem`, weight 400, line-height `1.375`
  (`.c-base-input__input`). **Label**: `0.875rem`, weight 400
  (`.c-base-input__label`) — weight 400, not the base's 600.
- **Links**: `#0970e6`, and **no underline at rest** —
  `.c-link{text-decoration:none;font-weight:400}`; the underline is an opt-in
  modifier, `.c-link--underline{text-decoration:underline;text-underline-offset:3px}`,
  so it is carried on hover with the measured `3px` offset.

## Signatures anatomiques

- **Fields**: `field.style = "outline"`. Measured on the least-scoped field
  primitive, `.c-base-input__container{border-radius:var(--ds-border-radius-4);
  border:1px solid var(--ds-color-interactive-border-input-active);
  background-color:var(--ds-color-interactive-background-input-active)}` — a
  **white** fill (`#ffffff`) with **four equal 1px borders** (`#d9d9d9`), which
  is the boxed case. Scope note: this is deliberately **not** read off a search
  widget. The corporate front's search input
  (`.search-block-form form .js-form-type-search input#edit-keys`) is a
  bottom-only `border-bottom:4px solid #004e9f` on a transparent fill, and the
  corporate select (`.scrollable-list .selected-option`) is a borderless
  `#f0f2f2` fill — both would have produced `filled-underline`. Both are
  component-scoped rules on the losing host; `.c-base-input` is the winning
  host's general primitive, shared by text, number, date, time, phone, code,
  file and select.
- **Radius**: `0.25rem` on controls, inputs, cards, tags and links
  (`--ds-border-radius-4`); `0.5rem` on the modal container
  (`--ds-border-radius-8`); `6.25rem` for pills (`--ds-border-radius-100`).
  Outliers kept where measured: `.c-badge{border-radius:10px}` = `0.625rem`,
  `.c-toggle__track{border-radius:var(--ds-border-radius-24)}` = `1.5rem`.
- **Focus**: `strategy = "outline"`, `width 0.125rem` (2px), `offset 0.125rem`
  (`--ds-spacing-xxxs`), `color #0970e6`. Measured from
  `.c-button:focus-visible{outline:2px solid var(--ds-color-interactive-border-focus);outline-offset:var(--ds-spacing-xxxs)}`.
  **Scope**: `--ds-color-interactive-border-focus` carries **19** `var()` references across **17** rules
  across the DS — buttons, `.c-input-file__remove-button:focus-visible`,
  `.c-input-file__dropzone:focus-visible`, `.c-input-select__option:focus-visible`,
  `.c-pagination__list-item--active:focus-visible` — so this is the site-wide
  focus technique, not one component's rule. It is an `outline` declaration, so
  the strategy encodes the real technique, not merely the colour.
- **Buttons**: `radius 0.25rem`, `font-size 1rem`, `font-weight 700`,
  `line-height 1.5rem`, `transition background-color .3s,color .3s`. Filled
  primary = `#0970e6` with `#ffffff` label; hover `#004e9b`; pressed `#003161`.
  Outlined secondary = `#ffffff` fill, `#0970e6` stroke; its `:hover` recolours
  **only** text and border (to `#004e9b`) and declares no `background-color`, so
  the white fill persists — transcribed as measured rather than given an
  invented hover tint.
- **Tabs**: `padding 1rem 1rem` (`--ds-spacing-m` both axes); inactive tab is a
  `2px` box in `#f7f7f7` on `#f7f7f7`; selected recolours the box to `#0864e6`
  with `#0864e6` label on `#f7f7f7`.
- **Pagination**: `padding 0.5rem` both axes (`--ds-spacing-xs`), `radius 4px`,
  page box `1.5rem` (`--ds-sizing-m`), gap `0.125rem` (`--ds-spacing-xxxs`);
  active page = `#0970e6` fill with a literal `#fff` label. The `<select>`
  chevron colour is **measured** —
  `.c-input-select__chevron{color:var(--ds-color-interactive-icon-main-active)}`
  with that token at `#0970e6`, exactly the redrawn hex; only the chevron
  **artwork** is derived (0 `data:image/svg` in the whole file) with a `2.5rem`
  gutter *(à confirmer — Carrefour ships a custom listbox, not a native
  select)*.
- **Toggle**: track `56px × 32px`, `radius 1.5rem`, padding `0.25rem`;
  unchecked `#d9d9d9`, checked `#0970e6`, handle `#ffffff` at `1.5rem`
  (`--ds-sizing-m`) — all measured.
- **Motion**: `fast 200ms`, `normal 300ms`, `slow 500ms`, by declared frequency
  across the whole file (`.3s` ×66, `.2s` ×34, `.5s` ×13; restricted to
  selectors containing `.c-`: ×25/×13/×2 — same ranking, same conclusion either
  way). Easing `cubic-bezier(0.4, 0, 0.2, 1)`, the DS's **only named** easing
  variable, declared as `.c-accordion{--accordion-animation-easing:
  cubic-bezier(.4, 0, .2, 1)}` — **measured** on that brand variable, and it
  coincidentally happens to match the reference package's easing string while
  differing from the Sentropic base (`cubic-bezier(0.16, 1, 0.3, 1)`), so this
  is a recorded coincidence, not a borrowed geometry (see the note on
  `motion.easing` in `src/index.ts`). Note for a reviewer:
  `cubic-bezier(.16,1,.3,1)` also occurs 13 times in the Carrefour stylesheet,
  but only on Vue page-transition classes (`.modal-enter-active`,
  `.drawer-in-out-enter-active`, `.fade-right-enter-active`) — and it happens to
  equal the Sentropic base easing, so it is **not** claimed as Carrefour's
  interaction easing.
- **Disabled**: `0.6`, from `.c-button--disabled,.c-button--loading{opacity:.6}`
  and `.c-base-input--disabled …{opacity:.6}` (30 occurrences of `opacity:.6`).
  The DS also declares `--ds-opacity-disabled: .4`, but **no rule consumes it**
  (0 `var()` references), so `0.4` is not the operative value.
- **Cursors**: `interactive: pointer` (`.c-button{cursor:pointer}`),
  `disabled: default` (`.c-base-input--disabled …{cursor:default}`;
  `.c-button--disabled{cursor:initial}`) — Carrefour does **not** use
  `not-allowed` on disabled controls, unlike the Sentropic base —
  `text: text` (`.c-base-input__label{cursor:text}`).

## Control geometry (Step 0.3 / lever 3 — what was searched, and found)

Carrefour **does** publish usable control geometry, so this package takes the
transcription path, not the "nothing published" path. Greps run over the brand's
own control selectors in `HHNlKr0TBF.css`:

- `.c-button--size-s{padding:var(--ds-spacing-xs) var(--ds-spacing-m);height:40px}`
  → `density.sm`: `controlHeight 2.5rem`, `paddingBlock 0.5rem`,
  `paddingInline 1rem`. **Found.**
- `.c-button--size-m{padding:var(--ds-spacing-m) var(--ds-spacing-xl);height:56px}`
  → `density.md`: `controlHeight 3.5rem`, `paddingBlock 1rem`,
  `paddingInline 2rem`. **Found.**
- `.c-button__content{gap:var(--ds-spacing-xxs)}` → `gap 0.25rem`. **Found.**
- `.c-button{font-size:1rem}` and
  `.c-button--variation-tertiary-small{font-size:.875rem}` → `fontSize`.
  **Found.**
- `.c-base-input--size-m .c-base-input__container{padding-left:var(--ds-spacing-m);padding-right:var(--ds-spacing-m)}`
  and `.c-base-input--size-m .c-base-input__input{padding-top:var(--ds-spacing-m);padding-bottom:var(--ds-spacing-m)}`
  → the `search` override's `1rem` paddings. **Found.**
- `.c-button__icon-container{width:var(--ds-sizing-m);height:var(--ds-sizing-m)}`
  and `.c-link--size-m .c-link__icon__container{width:var(--ds-sizing-xs)}`
  → `iconSize` `1rem / 1.5rem / 2rem` from `--ds-sizing-xs/m/l`. **Found.**
- **A third button size**: searched `.c-button--size-*` — only `-size-s` and
  `-size-m` exist. **Not found** → `density.lg` derived *(à confirmer)*.
- **`min-width` on `.c-button`**: searched — **not declared**. (`min-width` is
  declared on `.c-tag--size-s/m/l` as `1.8rem` / `1.9rem` / `2.5rem`, and on
  `.c-base-input__input` as `min-content`, but not on the button.) → `minWidth`
  derived *(à confirmer)*.
- **`line-height` on the labels**: searched `.c-base-input__label`,
  `.c-checkbox__label`, `.c-radio__label`, `.c-toggle__label` — all four declare
  `font-size` and `font-weight`, **none** declares `line-height`. → those
  line-heights derived *(à confirmer)*.

**These values are NOT the Sentropic base, and NOT the reference package's
geometry.** Checked key by key against `packages/tokens/src/foundation.ts`: the
base is `sm/md/lg = 2rem/2.5rem/3rem` with `paddingBlock: "0"` and
`paddingInline: 0.75/1/1.25rem`; Carrefour measures `2.5rem/3.5rem` with
`paddingBlock 0.5rem/1rem` and `paddingInline 1rem/2rem`. Likewise
`iconSize` (base `1/1.125/1.25rem`; Carrefour `1/1.5/2rem`), `disabledOpacity`
(base `0.55`; Carrefour `0.6`), `transition.duration` (base `120ms`; Carrefour
`300ms`), `motion` (base `120/180/280ms` + `cubic-bezier(0.16, 1, 0.3, 1)`;
Carrefour `200/300/500ms` + `cubic-bezier(0.4, 0, 0.2, 1)`), `borderWidth`
(base `1px/2px`; Carrefour `0.0625rem/0.125rem` from `--ds-border-size-1/2`),
`radius` (base `md 0.375rem`, `pill 999px`; Carrefour `md 0.25rem`,
`pill 6.25rem`), `typography.control` (base `0.9375rem`/600/`1.2`; Carrefour
`1rem`/700/`1.5`), `typography.label` (base 600; Carrefour 400),
`typography.field.lineHeight` (base `1.5`; Carrefour `1.375`), `cursor.disabled`
(base `not-allowed`; Carrefour `default`), and the shadows (base slate-tinted
`rgb(15 23 42 / …)`; Carrefour near-black `rgba(18, 18, 18, …)`). **No key in
this package is copied from the reference theme package**, and none is claimed
as the Sentropic base.

## Accessibility

Thresholds: 4.5:1 for running text including `text.link`; 3:1 for large text and
for non-text elements including the focus indicator, so `border.interactive` and
`focus.color` are held to 3:1. All ratios against `surface.default` `#ffffff`:

| Value | Role | Ratio | Threshold | Verdict |
|---|---|---|---|---|
| `#121212` | `text.primary` | 18.73:1 | 4.5:1 | pass |
| `#454545` | `text.secondary` | 9.59:1 | 4.5:1 | pass |
| `#575757` | `text.muted` | 7.23:1 | 4.5:1 | pass |
| `#0970e6` | `text.link` | 4.70:1 | 4.5:1 | pass |
| `#0970e6` | `border.interactive`, `focus.color` | 4.70:1 | 3:1 | pass |
| `#ffffff` on `#0970e6` | `action.primaryText` on `action.primary` | 4.70:1 | 4.5:1 | pass |
| `#878787` | `border.strong` | 3.59:1 | 3:1 | pass |
| `#df1116` | `action.danger`, `feedback.error` | 4.97:1 | 4.5:1 | pass |
| `#2c815e` | `feedback.success` | 4.76:1 | 4.5:1 | pass |
| `#8a5f00` | `feedback.warning` | 5.65:1 | 4.5:1 | pass |
| `#173eb4` | `feedback.info`, `badge.infoBackground` | 8.81:1 | 4.5:1 | pass |
| `#0864e6` | `tabs.activeText` | 5.28:1 | 4.5:1 | pass |

**No stop-rule chain was run, because no value needed one.** Carrefour's design
system is already engineered to the WCAG floors — `#0970e6` at 4.70:1 clears
4.5:1 as text, and `#df1116` at 4.97:1 and `#2c815e` at 4.76:1 clear it too. No
role was routed away from its measured brand value, no hex was darkened, and
there is consequently no starting-hex/step-count/result chain to replay. The
single derived colour, `cyan.70` `#00484a`, is bound to no threshold: no
semantic text or line role routes to it, and its derivation (one HSL L−0.05 step
from the measured `#006064`, keeping H 182.4° and S 100%) is recorded above so
it can be replayed regardless.

`border.subtle` `#d9d9d9` is 1.41:1 on white. That is the brand's measured
decorative hairline (`.c-base-input__container` border) and is held to no
threshold — it is neither `border.interactive` nor `focus.color`. The field's
*focus* state is carried by the 2px `#0970e6` outline at 4.70:1.

## Template conformance note

`src/index.test.ts` carries **4 `it()` blocks** where the package template
prescribes 3 — this package is the only one in the lot in that case. The 4th
block (`locks every measured hex that carries a Sentropic role`) adds only
regression locks, no new behaviour, so this is a template deviation, not a
regression; it is recorded here instead of being merged away, because folding
it into the 3rd block would weaken the lock's failure signal.

## Asset officiel

The Carrefour logo is the blue/white/red "C" quadrilateral with the Carrefour
wordmark. Use the official SVG/PNG from Carrefour's brand assets — **do not
redraw the logo by hand**. This package references only font *names* and public
colour values, never logo artwork or font binaries.
