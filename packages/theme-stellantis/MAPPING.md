# Stellantis → Sentropic mapping

This package maps the **public** Stellantis corporate design onto the Sentropic
token structure (`TenantTheme`). Stellantis publishes **no tokenised design
system**, so the method is **measured-clone from the corporate site's own Adobe
Experience Manager client libraries** (`stellantis-corporate/clientlibs/*`, read
2026-09-24): the corporate blue `#243882` is read from
`.corporate-blue{background-color:#243882}` and `.bg-blue-stellantis`, the body
face from `body{font-family:"Encode Sans Condensed",…}`, the field box from
`input#searchInput{border:1px solid #d3d3d3;…;border-radius:0;height:40px}`. Only
public values and font *names* are referenced — no font binaries, no logo
artwork. Derived/unmeasured values are flagged `à confirmer`.

> **Key measured facts.**
> 1. **Scope.** This is the **corporate Stellantis** identity, not the identity
>    of any group marque (Peugeot, Citroën, Fiat, Opel, Jeep, …). No value here
>    comes from a marque site.
> 2. **Square, borderless, flat.** `border-radius:0` is declared **51 times**
>    across the brand-owned files, and the brand's cards carry `border-width:0`
>    with a transparent fill. Nothing rounds and cards have no stroke.
> 3. **The two Stellantis hosts disagree.** `www.stellantis.com` declares
>    `#243882` with *Encode Sans*; `media.stellantis.com` declares `#2a3e86`
>    with *OpenSans* under an `.fca-*` namespace. See *Host arbitration*.
> 4. **The brand's site-wide focus colour fails WCAG.** `#bbb` at 1.92:1 on
>    white; it is routed to the brand's own other measured focus outline colour.
> 5. **Upstream obstacle.** Both hosts sit behind Akamai and answer **HTTP 403
>    (`Access Denied`, `errors.edgesuite.net`) to a bare request**, including a
>    plain browser user-agent. A full browser header set is required. See
>    *Upstream access*.

## Sources
- Corporate homepage (the stylesheet manifest and the Google Fonts `<link>` naming the *Encode Sans* family) — https://www.stellantis.com/en (fetched 2026-09-24).
- Brand region of the site client library — https://www.stellantis.com/etc.clientlibs/stellantis-corporate/clientlibs/clientlib-site.min.4fb628f2edf7b457c6ec0b16fbabb054.css — cited below as **[site]**. Provides `body` font-family, `.corporate-blue`, `.corporate-blue-50`, `.corporate-dark-blue`, `.bg-grey-page`, `.bg-grey`, `.text-grey`, `.clear-grey-stella`, `.bb2px`, the `.using-keyboard :focus` rule and the skip-link outline.
- Page client library — …/clientlib-site-page.min.4bb169890317e8d4b95abd4208bdbcc9.css — cited as **[page]**. Provides `p{}`, `p a`, `h2,h3`, `.bg-blue-stellantis`, `.blue-stellantis`, `.anthracite`, `.tangerine`, `.mint*`, `.alert-mail`, `.gradient-background-blue`, `input#searchInput`, `div.dateFilters select`, `.nav-tabs`, `.breadcrumb`, `.new-pagination`, `.accordion`, `.btn-category-filter`, `.badge-category`, `.card*`, `.sticky`, `#primary-menu`, the disabled-state opacities.
- Mobile client library — …/clientlib-site-mobile.min.f80d3926ecd219e7e45920a510f07e3e.css — cited as **[mobile]**. Provides `select.category-select`, `.select-icon::after`, `#choose-cat`, `::-webkit-scrollbar-thumb`, `.brand-color` counterparts.
- Second host, for the disagreement record only — https://www.media.stellantis.com/em-en/ and https://www.media.stellantis.com/build/layout.7da79f35.css — cited as **[media]**.

**Not used as origins** (method step 0.5 — third-party blocks inside the brand's
own bundle):
- …/clientlib-vendors.min.bcfc532db41e595a30da2cd43ebb92dc.css — **Bootstrap 5.3** (`:root,[data-bs-theme=light]{--bs-blue:#0d6efd;…}`). Every `--bs-*` hex is excluded, including its greys — the whole block goes, not a selected part of it.
- …/clientlib-base.min.4fb628f2edf7b457c6ec0b16fbabb054.css — the AEM `.aem-Grid` layout framework. It declares **zero colours**; its only non-grid rules are two `@media` breakpoints.
- **[site] lines 1–403** (pretty-printed) — an embedded **Bootstrap 4/5 compatibility shim** (`.text-left`, `.ml-auto`, `.pl-3`…`.mr-xxl-5`, `.badge-pill{border-radius:10rem}`, `.rounded-sm{border-radius:.2rem}`, `.rounded-lg{border-radius:.3rem}`, `.custom-control`, `.input-group-text{padding:.375rem .75rem}`, `.media`, `.card-deck`, `.sr-only`, and `a{text-decoration:none}`). This is where `#428bca`, `#e9ecef`, `#ced4da`, `#212529` and `#767676` live in that file, and none of them is used here. Brand-owned rules in that file start at `html *{scrollbar-width:none}`.
- https://cookielaw.emea.fcagroup.com/CookieLawProduct/resources/generatecss?key=2762 — the consent banner.
- https://kit.fontawesome.com/750b28e362.js — the icon font (`"Font Awesome 5 Pro"`, 9 declarations). Referenced nowhere in this package.

## Upstream access

Both hosts are fronted by Akamai and return **HTTP 403 `Access Denied`**
(`Reference #18.…`, `errors.edgesuite.net`) to `curl` even with a desktop
browser user-agent alone. The fetch succeeds only with the full browser header
set: `User-Agent` + `Accept: text/html,…` + `Accept-Language` +
`Accept-Encoding: gzip, deflate, br` (with `--compressed`) + `Referer` +
`Sec-Fetch-Dest/Mode/Site` + `Upgrade-Insecure-Requests`. The stylesheets
themselves then need `Referer: https://www.stellantis.com/en`. All values in
this file were measured through that path on **2026-09-24**; every cited
declaration was re-grepped verbatim against the served bytes.

## Rem root and length conversion

Neither host declares `font-size` on `html` or on `:root` — no `62.5%` trick
(`grep -c '62.5%'` = 0 on every file; the only `html{…}` rules are
[site] `html{-ms-overflow-style:none}`, [site] `html *{scrollbar-width:none}` and
[media] `html{min-height:100%}`). The brand's rem root is therefore the browser
default **16px**, identical to this theme's own output root, so every transcribed
length converts **1:1**:

| Measured | Transcribed | Where |
|---|---|---|
| `height:40px` | `2.5rem` | `density.md.controlHeight` |
| `padding:4px 16px` | `0.25rem` / `1rem` | `density.md.paddingBlock` / `paddingInline` |
| `padding:4px 8px` | `0.25rem` / `0.5rem` | `density.sm` |
| `padding:24px` | `1.5rem` | `density.lg.paddingInline` |
| `padding-inline-end:24px` | `1.5rem` | `field.selectPaddingRight` |
| `border-radius:0` | `0` | `radius.none/sm/md/lg` |
| `border-radius:70px` | `70px` | `radius.pill` |
| `border:1px` / `border-top:2px` | `1px` / `2px` | `borderWidth.thin` / `thick` |
| `outline-width:1px` / `outline-offset:-2px` | `1px` / `-2px` | `focus.width` / `focus.offset` |
| `font-size:16px` / `17px` / `18px` / `12px` / `20px` | `1rem` / `1.0625rem` / `1.125rem` / `0.75rem` / `1.25rem` | `typography.*`, `tabs`, `breadcrumb`, `badge`, `pagination` |
| `line-height:25px` | `1.5625rem` | `card.lineHeight` |
| `width:20px;height:20px` | `1.25rem` | `iconSize.md` |
| `letter-spacing:.02rem` | `0.02rem` | `typography.control.letterSpacing` |
| `padding-top:5px` / `margin:5px` | `0.3125rem` | `alert.paddingTop` / `pagination.paddingInline` |
| `padding:0 .75rem 0 30px` | `0` / `0.75rem` | `accordion.paddingBlock` / `paddingInline` |
| `padding:0 .5em` | `0` / `0.5em` | `tabs.paddingBlock` / `paddingInline` |

## Host arbitration (method step 0.3)

The two Stellantis hosts declare a **different** brand blue and a **different**
typeface. Per-file counts, brand-owned regions only:

| Hex / face | [site] | [page] | [mobile] | corporate total | [media] | Bootstrap block |
|---|---|---|---|---|---|---|
| `#243882` | 3 | 118 | 9 | **130** | 0 | 0 |
| `#243782` (`.brand-color`) | 3 | 0 | 2 | 5 | 0 | 0 |
| `#243881` | 0 | 2 | 0 | 2 | 0 | 0 |
| `#2a3e86` | 0 | 0 | 0 | 0 | **45** | 0 |
| *Encode Sans* family | yes | yes | yes | 80 declarations | 0 | — |
| *OpenSans* / *Gotham* | 0 | 0 | 0 | 0 | 13 declarations | — |

**`www.stellantis.com` wins**, for four reasons:
1. It is the brand's own primary corporate host and the first source in this
   theme's source order.
2. Its client libraries are namespaced `stellantis-corporate`, and the blue is
   declared under **Stellantis-named** selectors: `.corporate-blue`,
   `.bg-blue-stellantis`, `.blue-stellantis`.
3. `[media]`'s brand rules are namespaced **`.fca-*`** (`.fca-Color_General`,
   `.fca-Bg_General`, `.fca-Btn_General`) with *OpenSans* / *Gotham* faces —
   the inherited **Fiat Chrysler Automobiles** press platform skin, which
   predates the Stellantis merger and carries no Stellantis-named token.
4. 130 brand-owned occurrences against 45.

Recorded but not used from `[media]`: `:focus-visible{border-radius:2px;outline:2px solid #2a3e86!important}`
(a least-scoped focus rule, solid 2px — the corporate host's is dashed 1px);
`html body{color:#1a1a1a;…font-family:OpenSans-Semibold}`;
`.form-check input[type=checkbox]{border:2px solid #2a3e86!important}` (the only
checkbox rule either host publishes). Both hosts converge on `border-radius:2px`
for the focus box.

**Near-duplicate blues on the winning host.** `#243782` (5) is declared under
`.brand-color{color:#243782}` / `.brand-background{background-color:#243782}` —
a role-naming selector — and `#243881` (2) under
`.mobile-filters-footer button{…background-color:#243881}`. The method's
tie-break applies frequency first, so `#243882` (130) wins over both; both
variants are recorded here as measured facts.

## Colour mapping

| Sentropic role | Stellantis source | Value |
|---|---|---|
| `action.primary` / `text.link` / `border.interactive` / `feedback.info` / `status.processing` / `blue.60` / `data.category1` | **[site]** `.corporate-blue{background-color:#243882}` ; **[page]** `.bg-blue-stellantis{background-color:#243882}` ; **[page]** `p a,a.stella,div.caption.inside-grid a{color:#243882;font-weight:600}` ; **[page]** `#searchInput:focus{…border-color:#243882}` — brand-owned, 130 occurrences, least-scoped link/heading rules | `#243882` |
| `focus.color` | routed — see *Accessibility floor*; target declaration **[site]** `a.sr-only.sr-only-focusable.skip-style{…outline-color:#243882;outline-width:2px;…}` | `#243882` |
| `action.primaryHover` / `blue.80` | **[page]** `.gradient-background-blue{background:radial-gradient(circle,rgba(36,55,130,1) 37%,rgba(28,45,101,1) 100%)}` — the deep stop, declared as `rgba(28,45,101,1)`; hover ROLE assignment | `#1c2d65` *(à confirmer)* |
| `blue.10` | derived — `#243882` at 10% over white | `#e9ebf3` *(à confirmer)* |
| `data.category5` | **[site]** `.corporate-blue-50{background-color:#7b88b4}` | `#7b88b4` |
| `surface.inverse` / `slate.90` / `data.category7` | **[site]** `.corporate-dark-blue{background:#282b34;color:#fff}` ; **[page]** `.bg-anthracite{background-color:#282b34!important}` — 39 occurrences | `#282b34` |
| `surface.overlay` | derived — see *À confirmer*; the brand's own `.modal-backdrop` rule declares only `z-index` | `rgb(40 43 52 / 0.5)` *(à confirmer)* |
| `surface.default` / `surface.raised` / `text.inverse` / `action.primaryText` / `field.fillBg` / `buttonSecondary.background` / `tag.neutralBackground` / `slate.0` | **[page]** `body.no-front #container-overlay{background:#fff}` ; **[page]** `.megaOn #primary-menu{background-color:#fff;…}` ; **[page]** `.column-menu-1{cursor:pointer;background-color:#243882;color:white}` (white ON the blue) | `#ffffff` |
| `surface.subtle` / `action.secondary` / `card.hoverBackground` / `buttonSecondary.hoverBackground` / `slate.10` | **[site]** `.bg-grey-page{background-color:#f0f0f0}` ; **[site]** `.bg-grey{background:#f0f0f0}` ; **[page]** `#main.colored{background:#f0f0f0…}` — 49 occurrences. Hover ROLE assignment from **[mobile]** `select.category-select:hover{background:#f0f0f0…}` | `#f0f0f0` |
| `border.subtle` / `action.secondaryHover` / `pagination.disabledText` / `field.underlineColor` / `slate.20` | **[page]** `input#searchInput{border:1px solid #d3d3d3;…}` ; `div.dateFilters select{…border:1px solid #d3d3d3}` ; `button.btn.btn-search-type[aria-pressed="false"]{border:1px solid #d3d3d3}` ; `.mobile-filters-open .resetDateBtn{…border:1px solid #d3d3d3…}` ; `#category-filters-group .btn-category-filter{border:1px solid #d3d3d3;…}` ; `div.category-filters-group{border-bottom:1px solid #d3d3d3;…}` — 6 selectors. Also **[page]** `.new-pagination .page-item a{color:#d3d3d3}` for the disabled role | `#d3d3d3` |
| `text.primary` / `border.strong` / `pagination.text` / `breadcrumb.text` / `breadcrumb.currentText` / `tag.neutralText` / `choice.labelColor` / `toggle.textColor` / `slate.80` | **[page]** `p{font-size:18px;color:#505050;font-weight:400}` (bare element selector, site-wide) ; **[site]** `.text-grey{color:#505050}` ; **[page]** `.border-top-bottom{border-top:1px solid #505050;border-bottom:1px solid #505050}` ; **[page]** `a.pagination-link{margin:5px;color:#505050;text-decoration:none}` ; **[page]** `.breadcrumb-item.active{color:#505050;font-weight:400}` ; **[mobile]** `#choose-cat{…font-weight:500;color:#505050;height:26px}` — 68 occurrences | `#505050` |
| `text.secondary` / `data.category8` / `slate.60` | **[page]** `.results-list p.results-excerpt{color:#6a6a6a;…}` — 3 selectors | `#6a6a6a` |
| `text.muted` | stop-rule result from **[site]** `.clear-grey-stella,.clear-grey-stella a{color:#a0a0a0}` — see *Stop-rule chains* | `#6d6d6d` *(à confirmer)* |
| `cyan.50` / `data.category3` | **[page]** `.mint{color:#43aaa0}` ; `.bg-mint{background-color:#43aaa0}` | `#43aaa0` |
| `cyan.10` / `data.category6` | **[page]** `.mint-light{color:#a0d4cd}` ; `.bg-mint-light{background-color:#a0d4cd}` | `#a0d4cd` |
| `cyan.70` / `feedback.success` / `status.completed` | **[page]** `.mint-dark{color:#006e6a}` ; `.bg-mint-dark{background-color:#006e6a}` — success ROLE assignment (the brand publishes no success token) | `#006e6a` *(role à confirmer)* |
| `data.category2` | **[page]** `.tangerine{color:#e94e24}` ; `.bg-tangerine{background-color:#e94e24}` | `#e94e24` |
| `feedback.warning` / `status.pending` | stop-rule result from the brand accent `.tangerine` `#e94e24` — see *Stop-rule chains* | `#c63a14` *(à confirmer)* |
| `feedback.error` / `action.danger` / `status.failed` | stop-rule result from **[page]** `.alert-mail{color:#d85935;display:block;padding-top:5px;line-height:1.2em}` — see *Stop-rule chains* | `#cc4c27` *(à confirmer)* |
| `action.secondaryText` / `tabs.activeText` / `breadcrumb.linkText` / `breadcrumb.separator` / `accordion.text` / `badge.infoText` / `pagination.activeText` | **[page]** `.id18 a.button-banner{padding:4px 16px;background:#fff;color:#243882;border:1px solid #243882}` ; `.nav-tabs .nav-link.active{color:#243882;border-color:#243882}` ; `.breadcrumb a{color:#243882;font-weight:500}` ; `.breadcrumb-item.bcarrow:after{…color:#243882;content:"\f054";…}` ; `.style-accordion a,.accordion a{color:#243882}` ; `.results-list span.badge-category{color:#243882;…}`. `pagination.activeText` is a ROLE assignment from the brand's measured active-state colour (`.nav-tabs .nav-link.active`, `div#lang-form-wrapper a.active{color:#243882…}`) | `#243882` (pagination role *à confirmer*) |
| `buttonSecondary.border` | **[page]** `.id18 a.button-banner{…border:1px solid #243882}` ; `#mail-alert-container input[type="submit"]{color:#243882;…border:1px solid #243882;…}` | `#243882` |
| `shadow.subtle` | **[page]** `.sticky{…box-shadow:0 4px 6px rgba(0,0,0,0.1)}` | `0 4px 6px rgb(0 0 0 / 0.1)` |
| `shadow.medium` | **[page]** `#primary-menu{height:64px;…box-shadow:0 -2px 16px 0 rgba(0,0,0,0.25);…}` and the same declaration on `header` at `min-width:992px`. The **negative y offset** is the measured value (the brand header casts upward) and is transcribed as-is | `0 -2px 16px 0 rgb(0 0 0 / 0.25)` |
| `shadow.floating` | derived — the measured medium blur doubled at its measured 0.25 alpha | `0 8px 32px 0 rgb(0 0 0 / 0.25)` *(à confirmer)* |
| `field.selectChevron` fill | **[mobile]** `.select-icon::after{…content:"\f13a";font-family:"Font Awesome 5 Pro",sans-serif;color:#243882}` — colour measured, glyph path redrawn | `#243882` (path *à confirmer*) |

Two `rgb()`/`rgba()` values appear in the compiled output that are **not** in
this package: `rgba(185, 28, 28, 0.08)` and `rgb(226 232 240 / 0.56)`. Both are
base literals hardcoded inside `createComponent`
(`packages/tokens/src/component.ts`, lines 1493 and 1744) and are emitted for
every theme.

## Stop-rule chains

Rule: convert to HSL, keep H and S, subtract 0.05 from L per step, convert back
to the nearest lowercase hex, recompute against `surface.default` `#ffffff`
after each step, keep the **first** hex that reaches the threshold.

| Role | Starting measured hex (declaration) | Start ratio | Threshold | Steps | Result | Result ratio |
|---|---|---|---|---|---|---|
| `text.muted` | `#a0a0a0` — **[site]** `.clear-grey-stella,.clear-grey-stella a{color:#a0a0a0}` (7 occurrences) | 2.61:1 | 4.5:1 | **4** (`#939393` 3.07 → `#868686` 3.64 → `#7a7a7a` 4.29 → `#6d6d6d`) | `#6d6d6d` | 5.17:1 |
| `feedback.error` / `action.danger` / `status.failed` | `#d85935` — **[page]** `.alert-mail{color:#d85935;display:block;padding-top:5px;line-height:1.2em}` (1 occurrence, scope = the mail-alert form) | 3.89:1 | 4.5:1 | **1** | `#cc4c27` | 4.54:1 |
| `feedback.warning` / `status.pending` | `#e94e24` — **[page]** `.tangerine{color:#e94e24}` / `.bg-tangerine{background-color:#e94e24}` | 3.76:1 | 4.5:1 | **2** (`#dd4116` 4.34 → `#c63a14`) | `#c63a14` | 5.23:1 |

`#cc4c27` and `#c63a14` land close to one another: that is a measured
consequence of Stellantis publishing exactly **one** warm accent family. Their
provenance is distinct (the alert colour vs the tangerine accent) and each chain
is replayable from its own starting hex. The unaltered brand accent `#e94e24`
survives in `data.category2`, so no brand accent is overwritten by the floor.

## Accessibility floor

| Role | Value | Ratio on `#ffffff` | Threshold | Verdict |
|---|---|---|---|---|
| `text.primary` `#505050` | measured | 8.06:1 | 4.5:1 | pass |
| `text.secondary` `#6a6a6a` | measured | 5.41:1 | 4.5:1 | pass |
| `text.muted` `#6d6d6d` | stop-rule | 5.17:1 | 4.5:1 | pass |
| `text.link` `#243882` | measured | 10.70:1 | 4.5:1 | pass |
| `border.interactive` `#243882` | measured | 10.70:1 | 3:1 (line) | pass |
| `focus.color` `#243882` | routed | 10.70:1 | 3:1 (line) | pass |
| `action.primaryText` `#ffffff` on `#243882` | measured | 10.70:1 | 4.5:1 | pass |
| `action.secondaryText` `#243882` on `#f0f0f0` | measured | 9.39:1 | 4.5:1 | pass |
| `feedback.success` `#006e6a` | measured | 6.11:1 | 4.5:1 | pass |
| `feedback.warning` `#c63a14` | stop-rule | 5.23:1 | 4.5:1 | pass |
| `feedback.error` `#cc4c27` | stop-rule | 4.54:1 | 4.5:1 | pass |
| `pagination.text` `#505050` | measured | 8.06:1 | 4.5:1 | pass |

**Two routings, not chains.** Two measured values fail their threshold and are
replaced by another **measured** brand value rather than by an arithmetic
darkening:

1. **`focus.color`.** The brand's least-scoped keyboard-focus rule is
   **[site]** `.using-keyboard :focus,.using-keyboard .no-btn-style:focus,…{outline:dashed;outline-color:#bbb;outline-width:1px;outline-offset:-2px;border-radius:2px}`
   — a universal `:focus` descendant, so site-wide, 7 selectors in one block.
   Its colour `#bbb` (`#bbbbbb`) is **1.92:1** on white and fails the 3:1
   non-text floor. It is routed to the brand's own **other** measured focus
   outline colour, **[site]** `a.sr-only.sr-only-focusable.skip-style{border-radius:10px;outline-style:solid;…color:#243882;outline-color:#243882;outline-width:2px;…}`
   (10.70:1). The second host corroborates blue-on-focus with
   `:focus-visible{…outline:2px solid #2a3e86!important}`. The technique
   (`outline`), the width (`1px`) and the offset (`-2px`) come from the
   least-scoped rule and are transcribed unchanged. The declared
   `outline:dashed` **style** has no primitive to carry it (`FocusInput` exposes
   `strategy`/`width`/`offset`/`color`/`inset` only) and is therefore recorded
   here rather than encoded.
2. **`pagination.text`.** The brand serves two paginators. `.new-pagination .page-item a{color:#d3d3d3}`
   is **1.50:1** and fails the 4.5:1 text floor; `a.pagination-link{margin:5px;color:#505050;…}`
   is **8.06:1** and passes. The passing measured variant is used for the
   resting link, and `#d3d3d3` is kept for `pagination.disabledText`, where the
   brand's own de-emphasis value is the right fit.

No brand colour in a fill or accent role was altered: `#243882`, `#282b34`,
`#e94e24`, `#43aaa0`, `#a0d4cd`, `#006e6a`, `#7b88b4` and `#f0f0f0` all ship as
measured.

## Control geometry — what was searched, and what was found

The brand's own control selectors were grepped for `height`, `min-height` and
`padding`. **Found** (all brand-owned, all transcribed):

| Declaration | Selectors | Token |
|---|---|---|
| `height:40px` | **[page]** `input#searchInput`, `div.dateFilters select`, `.mobile-filters-open .resetDateBtn`, `button#searchActionBtn` (40×40) — 4 | `density.md.controlHeight = 2.5rem` |
| `padding:4px 16px` | **[page]** `.id18 a.button-banner`, `.container-w-image a.button-banner-over-image-w` / `-b` / `-w.anthracite` — 4 | `density.md.paddingBlock/Inline` |
| `padding:4px 0 4px 12px` | **[page]** `input#searchInput` — 1 | `search.paddingBlock/Inline` |
| `padding:4px 8px` | **[page]** `#category-filters-group .btn-category-filter`, `button.btn.btn-search-type` — 2 | `density.sm`, `tag` |
| `padding:24px` | **[page]** `body.mobile-filters-open .mobile-filters-footer button` — 1 | `density.lg.paddingInline = 1.5rem` |
| `padding:8px 16px` | **[page]** `.menu-column a.cta` — 1 | context |
| `padding:2px 15px` | **[site]** and **[page]** `a.button-banner` — 2 files | context |
| `height:42px` | **[page]** `#category-filters-group .btn-category-filter`, `button.btn.btn-search-type` — 2 | `tag.minHeight = 2.625rem` |
| `height:64px` / `width:64px` | **[page]** `button.lang-button.btn`, `#search-form-wrapper .close-button`, `.hamburger-menu`, `#primary-menu` — 4 | context (header icon squares, not a text-control size) |
| `height:50px` | **[page]** `.breadcrumb` — 1 | context |
| `min-height:200px` | **[page]** `.card-text-events` — 1 | context |
| `padding:0 .75rem 0 30px` | **[page]** `.accordion .header-accordion,.accordion .content-accordion` — 1 | `accordion.paddingBlock/Inline` |
| `padding:0 .5em` | **[page]** `.nav-tabs .nav-link…` — 1 | `tabs.paddingBlock/Inline` |
| `padding:1.25rem` | **[page]** `.card-container-c42 .card-body` — 1 | context |
| `opacity:.5` on disabled | **[page]** `#mail-alert-container input[type="submit"]:disabled`, `#mail-alert-container button.button-banner:disabled`, `.arrow-disable`; **[site]** `#search-form:has(#search-input:placeholder-shown) #search-btn` — 4 | `disabledOpacity = 0.5` |

**Greps that came back empty** (so these leaves are NOT measured):
- `grep -E 'form-(control|select|check|label)'` over the three brand files → **0 matches**. The brand overrides no Bootstrap form class; there is no site-wide `.form-control` geometry to read.
- No `min-height` on any brand button, input or select.
- No `sm` / `lg` size variant of any control: nothing like `btn-sm`, `form-control-lg` or a second height on the same selector. `density.sm.controlHeight` and `density.lg.controlHeight` are therefore the Sent Tech base `2rem` / `3rem` *(à confirmer)*; the measured 42px chip and 64px header square are not a text-control size scale.
- No `switch` / `toggle` track rule and no brand `checkbox` / `radio` rule on the corporate host → `toggle.trackRadius`-family geometry is not measured. `[media]`'s `.form-check input[type=checkbox]{border:2px solid #2a3e86!important}` belongs to the losing host and is not used.
- No monospace `font-family` anywhere on either host.
- No `z-index` role naming: the brand's stacking values (`800`, `900`, `990`, `999`, `1000`, `1030`, `1050`) are page-chrome specific.

**Scope note.** Both field candidates were counted across selectors before
choosing. Four-equal-border fields (`1px solid #d3d3d3`, `border-radius:0`,
`height:40px`): **6 selectors**. Bottom-only fields (**[page]** `input.input-mail{background:transparent;border-left-width:0;border-right-width:0;border-top-width:0;border-bottom-width:1px;…border-color:#243882;…}`
and **[mobile]** `select.category-select{…border-bottom:1px solid #243882;border-top:0 solid #243882;border-right:0…;border-left:0…}`): **2 selectors**.
The boxed field wins, so `field.style = "outline"` — not read off the header
search widget (**[page]** `#search-input{…border:0;…}`), which has no border at
all.

## À confirmer (derived or no published brand token)
- **`semantic.surface.overlay`** (`rgb(40 43 52 / 0.5)`) — **derived**. The brand's own backdrop rule, **[page]** `body.modal-open.megaOn .modal-backdrop{z-index:800}`, declares **only a z-index**; the backdrop colour exists solely in the excluded Bootstrap block (`clientlib-vendors`: `.modal-backdrop{--bs-backdrop-zindex:1050;--bs-backdrop-bg:#000;--bs-backdrop-opacity:0.5;…}`). The value used is the brand anthracite `#282b34` at the 0.5 alpha the brand itself applies to that colour in **[page]** `.id47.bg-anthracite .scroll-button.left{background:#282b34;background:linear-gradient(270deg,rgba(40,43,52,1) 100%,rgba(40,43,52,0.5) 73%)}`.
- **`text.muted`** (`#6d6d6d`), **`feedback.warning`** (`#c63a14`), **`feedback.error`** / **`action.danger`** (`#cc4c27`) — stop-rule results; chains above.
- **`blue.10`** (`#e9ebf3`) — derived: `#243882` at 10% over white. The brand publishes no light blue tint (its only tint is `.corporate-blue-50{background-color:#7b88b4}`).
- **`shadow.floating`** (`0 8px 32px 0 rgb(0 0 0 / 0.25)`) — derived: the measured `shadow.medium` blur doubled at its measured alpha. The brand publishes only two box-shadows.
- **`font.mono`** (`'SFMono-Regular', Consolas, 'Liberation Mono', monospace`) — the brand declares no monospace face on either host; system stack.
- **`radius.pill`** (`70px`) — the hex is measured (**[mobile]** `::-webkit-scrollbar-thumb{background-color:#282b34;border-radius:70px;…}`) but the **pill role assignment** is not published.
- **ROLE assignments of measured hexes**: `action.primaryHover` ← `#1c2d65` (the gradient deep stop); `feedback.success` / `status.completed` ← `#006e6a` (`.mint-dark`); `feedback.info` / `status.processing` ← `#243882`; `card.hoverBackground` and `buttonSecondary.hoverBackground` ← `#f0f0f0` (measured as a `select:hover` fill, not as a card/button hover); `action.secondaryHover` ← `#d3d3d3`; `pagination.activeText` ← `#243882`; `pagination.minSize` ← `2.5rem`. Each hex is measured; the role it is put in is not one the brand publishes.
- **`density.sm.controlHeight` / `density.lg.controlHeight`, every `gap`, every `minWidth`, `focus.inset`, `cursor.text`, `transition.property`, `iconSize.sm` / `iconSize.lg`, `typography.*.decorationThickness` / `decorationOffset`, `toggle.trackPadding`** — the **Sent Tech base** values, verified against `packages/tokens/src/foundation.ts` before writing. These are the base, not the reference theme package's geometry: `density.paddingBlock` / `paddingInline`, `shadow.*`, `motion.*`, `disabledOpacity`, `transition.duration` / `easing`, `iconSize.md`, `radius.*`, `borderWidth.*`, `typography` sizes/weights/families, and all 12 component overrides are **measured from Stellantis**, not copied. The reference package's extra `density.*.fontSize` key is deliberately **not** carried, because the base does not have it.
- **`spacing.*` and `z.*`** — the Sent Tech base scales, kept as-is (verified in `packages/tokens/src/foundation.ts`). The spacing scale is corroborated by the brand's own measured paddings (4, 8, 10, 12, 16, 24, 32px); the z scale is not brand-specific.
- **`tabs.indicatorSide`** (`"bottom"`) — the brand's active tab indicator is a **left** 1px divider recoloured to `#243882` (**[page]** `.nav-tabs{border-bottom:0}` plus `.nav-tabs .nav-link…{…border:0;border-radius:0;border-color:#505050;border-left:1px solid}` and `.nav-tabs .nav-link.active{color:#243882;border-color:#243882}`, `.nav-tabs .nav-link.active+.nav-link{border-left-color:#243882}`). `indicatorSide` resolves to `top` or `bottom` only (`packages/tokens/src/component.ts`), so the left divider cannot be encoded; the closest expressible form is used.
- **`alert.*` box leaves, `badge` padding / `minHeight` / `infoBackground`, `tag.lineHeight`, `accordion.fontSize` / `fontWeight`, every `lineHeight: "1.3"` on a component override, `pagination.paddingBlock` / `paddingInline` / `lineHeight`, `breadcrumb.lineHeight`, `choice.labelLineHeight` / `radioLineHeight`, `search.lineHeight`, `toggle.lineHeight`, `alert.fontSize`** — the brand's alert is a bare coloured text line (**[page]** `.alert-mail{color:#d85935;display:block;padding-top:5px;line-height:1.2em}`) with no fill, border or accent bar, so the box leaves are zeroed as measured-absent; the component `lineHeight` leaves carry the brand's **dominant** measured line-height `1.3em` (12 declarations, the most frequent of the brand's 1.1/1.2/1.3/1.4/1.5em set) rather than a per-component measurement, which the brand does not publish for those parts.
- **`field.selectChevron` path** — the brand draws its chevron with a Font Awesome glyph (`content:"\f13a"`), and this package embeds no icon binary, so the path is our own vector. Its **colour** `#243882` and the **gutter** `1.5rem` (24px) are measured.
- **`field.fillBg`** (`#ffffff`) — the brand's one measured field fill is `rgba(240,240,240,0.3)` (**[page]** `input#searchInput`), which composites to roughly `#fafafa` over white; the other five boxed controls declare no fill. `surface.default` is used, as `field.style = "outline"` requires.
- **Font stacks** — *Encode Sans Condensed* and *Encode Sans* are the names the brand declares; no system fallback was appended beyond the `sans-serif` the brand itself writes. We reference the font *names* only.

## Typography
- **Body / base** (`font.sans`): **'Encode Sans Condensed', sans-serif** — **[site]** `body{font-family:"Encode Sans Condensed",sans-serif;letter-spacing:.01em}`, the least-scoped face declaration on the site. 15 declarations of this face.
- **Display / headings** (`font.display`): **'Encode Sans', sans-serif** — **[page]** `h2,h3{color:#243882;font-family:"Encode Sans",sans-serif;margin-top:18px}` and `.page-title-h2-parent h1.title-page{…font-size:40px;…font-family:"Encode Sans",sans-serif;…}`. 64 declarations of this face — the brand's dominant UI face.
- **Controls / fields / labels** (`typography.control/field/label`): **'Encode Sans', sans-serif** — **[page]** `.mobile-filters-footer button{…font-family:"Encode Sans",sans-serif;font-size:16px;font-weight:500;…}`, `input#searchInput{…font-size:16px;font-family:"Encode Sans",sans-serif;font-weight:500;…}`, `div.dateFilters select{…font-family:"Encode Sans",sans-serif;font-size:16px;font-weight:400;…}`, **[mobile]** `#choose-cat{…font-size:18px;font-family:"Encode Sans",sans-serif;font-weight:500;…}`. Control letter-spacing `0.02rem` from **[site]**/**[page]** `a.button-banner{…letter-spacing:.02rem}` and the `.button-banner-over-image-*` family — 12 declarations.
- Two further brand faces are declared and **not** mapped, because each appears on a single component: *Encode Sans Semi Expanded* (**[site]** `#bottom-menu{…font-family:'Encode Sans Semi Expanded',sans-serif;…}`, 2 declarations) and *Encode Sans Semi Condensed* (1 declaration). All four faces are confirmed by the homepage's Google Fonts `<link>`.
- **Monospace** (`font.mono`): system stack — not published *(à confirmer)*.
- Links: Stellantis blue `#243882`, weight **600**, **no underline at rest**, **underlined on hover**. Rest state from **[page]** `p a,a.stella,div.caption.inside-grid a{color:#243882;font-weight:600}` (no decoration declared) corroborated by the brand's own `text-decoration:none` on its navigation links (**[page]** `.main-menu ul li a.desktop-menu-button…{text-decoration:none;…}`, `.brand-url a{text-decoration:none;color:#232836;font-weight:500}`, `div#lang-form-wrapper a{color:#484f51;…text-decoration:none;…}`). Hover from **[page]** `a.text-grey:hover,.text-grey a:hover{font-weight:bold;text-decoration:underline;color:#505050}`, `.sidebar-blue a:hover{text-decoration:underline}`, `a.board-image:hover h3,a.board-image:hover p{text-decoration:underline}`, `#menu-lang a.active{font-weight:600;text-decoration:underline}`. The `a{text-decoration:none}` at **[site]** line 95 is **inside the excluded Bootstrap shim region** and is reported as context only, never as the brand's declaration.
- `text-transform:uppercase` is declared 11 times, on tabs, the mobile category select, the news badge and the secondary menu — never on the brand's buttons, so `typography.control.textTransform` stays `none`.

## Signatures anatomiques
- **Fields**: `field.style = "outline"` — a boxed field, four equal `1px solid #d3d3d3` borders, `border-radius:0`, `height:40px`, white fill (6 brand selectors; the two bottom-only fields are the minority — counts above). Native `<select>`: `appearance:none` is measured (**[mobile]** `select.category-select{…-webkit-appearance:none;-moz-appearance:none;appearance:none;…}`), the chevron is redrawn in the measured brand blue `#243882` and the gutter is the measured `1.5rem` (24px `padding-inline-end`).
- **Radius**: **0 everywhere** — `border-radius:0` is declared 51 times across the brand files (inputs, selects, buttons, tabs, cards, breadcrumb, footer button). `radius.none/sm/md/lg` are all `0`; `radius.pill` is the measured `70px` of the brand's scrollbar thumb *(role à confirmer)*.
- **Focus**: `focus.strategy = "outline"`, width `1px`, offset **`-2px`** (an inset outline), colour `#243882`. The measured declaration is `outline:dashed;outline-color:#bbb;outline-width:1px;outline-offset:-2px;border-radius:2px`; the dashed **style** is not encodable and the grey **colour** fails 3:1, so it is routed — see *Accessibility floor*.
- **Buttons**: primary = solid `#243882` with white text (10.70:1) → hover `#1c2d65`; secondary = white fill, `1px solid #243882` border, `#243882` label (**[page]** `.id18 a.button-banner{padding:4px 16px;background:#fff;color:#243882;border:1px solid #243882}`), hover fill `#f0f0f0`. Label geometry: 16px / weight 500 / `0.02rem` tracking / `4px 16px` padding / `40px` box / radius 0.
- **Cards**: **borderless and square** — `border-width:0`, `border-radius:0`, transparent fill (**[page]** `.id38b .card{border-width:0;background:transparent}`, `.card-container-c42 .card{border-radius:0;border:0;flex:unset;background-color:transparent}`, `.id38b .card.open-gallery-item{border:0}`); body line-height `25px`.
- **Tabs**: uppercase 17px / weight 500 labels, grey `#505050` at rest, `#243882` when active, transparent backgrounds, `0 .5em` padding, radius 0, separated by 1px vertical dividers (`border-left`) rather than a bottom underline — see the `tabs.indicatorSide` note.
- **Pagination**: borderless and unfilled (`background:transparent;border:0`), 20px / weight 500 type, resting link `#505050`, active `#243882`, disabled `#d3d3d3`.
- **Breadcrumb**: 12px *Encode Sans*, `#243882` links, `#505050` current page at weight 400, `#243882` chevron separator (`content:"\f054"`), transparent background, radius 0.
- **Elevation**: two measured shadows only — `0 4px 6px rgb(0 0 0 / 0.1)` (sticky bar) and `0 -2px 16px 0 rgb(0 0 0 / 0.25)` (header, casting **upward**).
- **Motion**: `100ms` / `300ms` / `600ms` with `ease` — all measured frequencies; the interaction `transition` is `400ms ease` from **[page]** `#autocomplete-container li{…transition:background-color .4s ease}`.

## Asset officiel
- Stellantis logo = the "STELLANTIS" wordmark in a wide, light letter-spaced
  sans, usually set in the corporate blue `#243882` or reversed in white on the
  anthracite `#282b34`. Use the official SVG/PNG from the Stellantis brand
  assets — **do not redraw the logo by hand**. This package references only font
  *names* (*Encode Sans Condensed*, *Encode Sans*) and public colour values,
  never logo artwork, never font binaries, and never a group marque's identity.
